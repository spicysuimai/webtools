import { jwtVerify } from "jose";
import { config } from "./config.js";

// Phase 6.4: JWT ticket auth replaces Phase 6.1 dev key.
// AGENT_KEY still accepted as fallback for local dev without Next.js.
// Web UI fetches ticket from /api/private/terminal-ticket → passes here.
// Ticket expires in 60s, payload: { sub: "terminal", iat, exp }.

const AUTH_TIMEOUT_MS = 5_000;

let challengeTimeout: ReturnType<typeof setTimeout> | null = null;

function getSecret(): Uint8Array {
  const cfg = config();
  return new TextEncoder().encode(cfg.jwtSecret);
}

export async function verifyTicket(ticket: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(ticket, getSecret());
    return payload.sub === "terminal";
  } catch {
    return false;
  }
}

export function verifyKey(key: string): boolean {
  const cfg = config();
  if (!cfg.agentKey) return false; // no key configured → only ticket auth
  return key === cfg.agentKey;
}

export function startAuthTimer(ws: { close: (code?: number, reason?: string) => void }): void {
  challengeTimeout = setTimeout(() => {
    ws.close(4001, "auth timeout");
  }, AUTH_TIMEOUT_MS);
}

export function clearAuthTimer(): void {
  if (challengeTimeout) {
    clearTimeout(challengeTimeout);
    challengeTimeout = null;
  }
}

// --- Rate limiter ---
const connTimestamps: number[] = [];

export function checkRateLimit(maxPerMin: number): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  // Shift expired entries
  while (connTimestamps.length > 0 && connTimestamps[0] < windowStart) {
    connTimestamps.shift();
  }
  if (connTimestamps.length >= maxPerMin) return false;
  connTimestamps.push(now);
  return true;
}

// --- Origin check ---
export function checkOrigin(origin: string | null): boolean {
  const cfg = config();
  if (cfg.originAllowlist.length === 0) return true; // not configured → allow all (dev)
  if (!origin) return false; // browser clients must send Origin
  return cfg.originAllowlist.some((allowed) => {
    if (allowed === "*") return true;
    return origin === allowed || origin.endsWith("://" + allowed);
  });
}
