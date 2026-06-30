import { WebSocketServer, WebSocket } from "ws";
import type { IPty } from "node-pty";
import { config } from "./config.js";
import { verifyKey, startAuthTimer, clearAuthTimer } from "./auth.js";
import { createSession, type Session, touch } from "./session.js";
import { spawnPty } from "./pty.js";

interface PtyWebSocket extends WebSocket {
  __pty?: IPty;
}

const cfg = config();
const wss = new WebSocketServer({ host: cfg.host, port: cfg.port });

const sessions = new Map<string, { ws: PtyWebSocket; session: Session }>();

wss.on("connection", (ws: PtyWebSocket) => {
  console.log("[agent] connection");

  let authed = false;
  let session: Session | null = null;

  startAuthTimer(ws);

  ws.on("message", (raw) => {
    let msg: { type: string; key?: string; cwd?: string; data?: string; cols?: number; rows?: number };
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      ws.close(4000, "invalid JSON");
      return;
    }

    // --- Pre-auth: only accept "auth" message ---
    if (!authed) {
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
      sessions.set(session.id, { ws, session });

      ws.send(JSON.stringify({ type: "auth_ok", sessionId: session.id }));

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
