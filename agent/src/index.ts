import { WebSocketServer, type WebSocket } from "ws";
import { config } from "./config.js";
import { verifyKey, startAuthTimer, clearAuthTimer } from "./auth.js";
import { createSession, type Session, touch } from "./session.js";
import { spawnPty } from "./pty.js";

const cfg = config();
const wss = new WebSocketServer({ host: cfg.host, port: cfg.port });

// DEV-ONLY: Stub Origin check. Logs unexpected origins but does NOT block.
// Phase 6.4 must hard-enforce allowlist to prevent Cross-Site WebSocket Hijacking.
function checkOrigin(ws: WebSocket, req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients
  // In dev, log but allow all. Phase 6.4: enforce allowlist.
  console.log(`[agent] WS origin: ${origin}`);
  return true;
}

const sessions = new Map<string, { ws: WebSocket; session: Session }>();

wss.on("connection", (ws, req) => {
  // OWASP: Check Origin header to prevent CSWSH (dev: log only, Phase 6.4 hard-enforce)
  // checkOrigin(ws, req); // stub

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

      let pty;
      try {
        pty = spawnPty(cwd);
      } catch (err: any) {
        ws.send(JSON.stringify({ type: "auth_error", message: err.message }));
        ws.close(4004, "spawn failed");
        return;
      }

      session = createSession(cwd);
      session.pid = pty.pid;
      sessions.set(session.id, { ws, session });

      ws.send(JSON.stringify({ type: "auth_ok", sessionId: session.id }));

      pty.onData((data: string) => {
        touch(session!);
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: "output", data }));
        }
      });

      pty.onExit(({ exitCode, signal }: { exitCode: number; signal?: number }) => {
        const reason = signal ? `signal ${signal}` : `exit ${exitCode}`;
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: "closed", code: exitCode, reason }));
        }
        sessions.delete(session!.id);
        ws.close();
      });

      // Write pty to ws response
      (ws as any).__pty = pty;
      return;
    }

    // --- Post-auth messages ---
    if (msg.type === "input" && typeof msg.data === "string") {
      const pty = (ws as any).__pty;
      if (pty) pty.write(msg.data);
      touch(session!);
    } else if (msg.type === "resize" && typeof msg.cols === "number" && typeof msg.rows === "number") {
      const pty = (ws as any).__pty;
      if (pty) pty.resize(msg.cols, msg.rows);
    }
  });

  ws.on("close", () => {
    const pty = (ws as any).__pty;
    if (pty) {
      try { pty.kill(); } catch { /* already dead */ }
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
