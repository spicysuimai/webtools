import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "..", ".env") });

import { WebSocketServer, WebSocket } from "ws";
import type { IPty } from "node-pty";
import type { IncomingMessage } from "node:http";
import { config } from "./config.js";
import {
  verifyTicket,
  verifyKey,
  startAuthTimer,
  clearAuthTimer,
  checkRateLimit,
  checkOrigin,
} from "./auth.js";
import { createSession, type Session, touch, summary, isTimedOut } from "./session.js";
import { spawnPty } from "./pty.js";
import { register, unregister } from "./registry.js";

interface PtyWebSocket extends WebSocket {
  __pty?: IPty;
  __sessionId?: string;
}

const cfg = config();

let wss: WebSocketServer;
try {
  wss = new WebSocketServer({ host: cfg.host, port: cfg.port });
} catch (err: unknown) {
  const code = (err as NodeJS.ErrnoException).code;
  if (code === "EADDRINUSE") {
    console.error(
      `Port ${cfg.port} is already in use. Stop the existing agent or change AGENT_PORT.`,
    );
    process.exit(1);
  }
  throw err;
}

wss.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${cfg.port} is already in use. Stop the existing agent or change AGENT_PORT.`,
    );
    process.exit(1);
  }
  console.error("[agent] server error:", err.message);
});

const sessions = new Map<string, { ws: PtyWebSocket; session: Session }>();

// --- Audit ---
function audit(event: string, detail: string) {
  const ts = new Date().toISOString();
  console.log(`[audit] ${ts} ${event} ${detail}`);
}
// ---

// --- Idle timeout sweep ---
const sweepInterval = setInterval(() => {
  for (const [id, entry] of sessions) {
    if (isTimedOut(entry.session, cfg.idleTimeoutMs)) {
      audit("session_timeout", `id=${id} cwd=${entry.session.cwd}`);
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

// --- Rate limit check on upgrade ---
wss.on("headers", (_headers: string[], req: IncomingMessage) => {
  // Phase 6.4: Origin enforcement
  const origin = req.headers.origin || null;
  if (!checkOrigin(origin)) {
    audit("origin_blocked", `origin=${origin} ip=${req.socket.remoteAddress}`);
    // Can't easily reject at this stage; done in connection handler
  }
});
// ---

wss.on("connection", (ws: PtyWebSocket, req: IncomingMessage) => {
  const clientIp = req.socket.remoteAddress || "unknown";
  const origin = req.headers.origin || "unknown";

  // Rate limit
  if (!checkRateLimit(cfg.maxConnsPerMin)) {
    audit("rate_limited", `ip=${clientIp}`);
    ws.close(4029, "rate limited");
    return;
  }

  // Phase 6.4: Hard Origin enforcement
  if (!checkOrigin(req.headers.origin || null)) {
    audit("origin_blocked", `origin=${origin} ip=${clientIp}`);
    ws.close(4030, "origin not allowed");
    return;
  }

  console.log(`[agent] connection ip=${clientIp}`);

  let authed = false;
  let session: Session | null = null;

  startAuthTimer(ws);

  ws.on("message", async (raw) => {
    let msg: {
      type: string;
      key?: string;
      ticket?: string;
      cwd?: string;
      data?: string;
      cols?: number;
      rows?: number;
      sessionId?: string;
    };
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      ws.close(4000, "invalid JSON");
      return;
    }

    // --- Pre-auth: accept "auth", "list" ---
    if (!authed) {
      if (msg.type === "list") {
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

      // Phase 6.4: prefer ticket, fallback to key for dev
      let valid = false;
      if (msg.ticket) {
        valid = await verifyTicket(msg.ticket);
      } else if (msg.key) {
        valid = verifyKey(msg.key);
      }

      if (!valid) {
        audit("auth_fail", `ip=${clientIp}`);
        ws.send(JSON.stringify({ type: "auth_error", message: "invalid credentials" }));
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

      audit("session_start", `id=${session.id} cwd=${cwd} ip=${clientIp}`);

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
        audit("session_end", `id=${session!.id} reason=${reason}`);
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
        audit("session_kill", `id=${msg.sessionId}`);
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
      audit("session_disconnect", `id=${session.id}`);
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
console.log(`[agent] max conns/min: ${cfg.maxConnsPerMin}`);
console.log(`[agent] origin allowlist: ${cfg.originAllowlist.join(", ") || "(all — dev mode)"}`);

// Device registry
register().catch((err) => console.warn("[agent] registry init failed:", err));
process.on("SIGINT", () => { unregister(); process.exit(); });
process.on("SIGTERM", () => { unregister(); process.exit(); });
