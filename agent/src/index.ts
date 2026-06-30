import { WebSocketServer, WebSocket } from "ws";
import type { IPty } from "node-pty";
import { config } from "./config.js";
import { verifyKey, startAuthTimer, clearAuthTimer } from "./auth.js";
import { createSession, type Session, touch, summary, isTimedOut } from "./session.js";
import { spawnPty } from "./pty.js";

interface PtyWebSocket extends WebSocket {
  __pty?: IPty;
  __sessionId?: string;
}

const cfg = config();
const wss = new WebSocketServer({ host: cfg.host, port: cfg.port });

const sessions = new Map<string, { ws: PtyWebSocket; session: Session }>();

// --- Idle timeout sweep ---
const sweepInterval = setInterval(() => {
  for (const [id, entry] of sessions) {
    if (isTimedOut(entry.session, cfg.idleTimeoutMs)) {
      console.log(`[agent] idle timeout session=${id}`);
      if (entry.ws.__pty) {
        try { entry.ws.__pty.kill(); } catch { /* ignore */ }
      }
      if (entry.ws.readyState === WebSocket.OPEN) {
        entry.ws.send(JSON.stringify({ type: "closed", code: -1, reason: "idle timeout" }));
        entry.ws.close();
      }
      sessions.delete(id);
    }
  }
}, 60_000);
wss.on("close", () => clearInterval(sweepInterval));
// ---

wss.on("connection", (ws: PtyWebSocket) => {
  console.log("[agent] connection");

  let authed = false;
  let session: Session | null = null;

  startAuthTimer(ws);

  ws.on("message", (raw) => {
    let msg: { type: string; key?: string; cwd?: string; data?: string; cols?: number; rows?: number; sessionId?: string };
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      ws.close(4000, "invalid JSON");
      return;
    }

    // --- Pre-auth: only accept "auth" and "list" (for status check) ---
    if (!authed) {
      if (msg.type === "list") {
        // Allow listing sessions pre-auth (for session picker)
        const all: { id: string; label: string; cwd: string; idleSeconds: number }[] = [];
        for (const [, entry] of sessions) {
          const s = summary(entry.session);
          all.push({ id: s.id, label: s.label, cwd: s.cwd, idleSeconds: s.idleSeconds });
        }
        ws.send(JSON.stringify({ type: "list", sessions: all }));
        return;
      }

      if (msg.type !== "auth") {
        ws.close(4002, "auth required first");
        return;
      }

      const valid = msg.key ? verifyKey(msg.key) : false;
      if (!valid) {
        ws.send(JSON.stringify({ type: "auth_error", message: "invalid key" }));
        ws.close(4003, "unauthorized");
        return;
      }

      clearAuthTimer();
      authed = true;

      const cwd = msg.cwd || cfg.defaultCwd;

      let pty: IPty;
      try {
        pty = spawnPty(cwd);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "spawn failed";
        ws.send(JSON.stringify({ type: "auth_error", message }));
        ws.close(4004, message);
        return;
      }

      session = createSession(cwd);
      session.pid = pty.pid;
      ws.__sessionId = session.id;
      sessions.set(session.id, { ws, session });

      ws.send(JSON.stringify({ type: "auth_ok", sessionId: session.id, label: session.label }));

      pty.onData((data: string) => {
        touch(session!);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "output", data }));
        }
      });

      pty.onExit(({ exitCode, signal }: { exitCode: number; signal?: number }) => {
        const reason = signal ? `signal ${signal}` : `exit ${exitCode}`;
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "closed", code: exitCode, reason }));
        }
        sessions.delete(session!.id);
        ws.close();
      });

      ws.__pty = pty;
      return;
    }

    // --- Post-auth messages ---
    if (msg.type === "input" && typeof msg.data === "string") {
      ws.__pty?.write(msg.data);
      touch(session!);
    } else if (msg.type === "resize" && typeof msg.cols === "number" && typeof msg.rows === "number") {
      ws.__pty?.resize(msg.cols, msg.rows);
    } else if (msg.type === "list") {
      const all: { id: string; label: string; cwd: string; idleSeconds: number }[] = [];
      for (const [, entry] of sessions) {
        const s = summary(entry.session);
        all.push({ id: s.id, label: s.label, cwd: s.cwd, idleSeconds: s.idleSeconds });
      }
      ws.send(JSON.stringify({ type: "list", sessions: all }));
    } else if (msg.type === "kill_session" && typeof msg.sessionId === "string") {
      const entry = sessions.get(msg.sessionId);
      if (entry) {
        if (entry.ws.__pty) {
          try { entry.ws.__pty.kill(); } catch { /* ignore */ }
        }
        if (entry.ws.readyState === WebSocket.OPEN) {
          entry.ws.send(JSON.stringify({ type: "closed", code: 0, reason: "killed" }));
          entry.ws.close();
        }
        sessions.delete(msg.sessionId);
      }
      ws.send(JSON.stringify({ type: "ok" }));
    }
  });

  ws.on("close", () => {
    if (ws.__pty) {
      try { ws.__pty.kill(); } catch { /* already dead */ }
    }
    if (session) {
      sessions.delete(session.id);
    }
    clearAuthTimer();
    console.log("[agent] disconnected");
  });

  ws.on("error", (err) => {
    console.error("[agent] ws error:", err.message);
  });
});

console.log(`[agent] listening on ${cfg.host}:${cfg.port}`);
console.log(`[agent] idle timeout: ${cfg.idleTimeoutMs / 1000}s`);
