import { config as loadEnv } from "./config.js";

// DEV-ONLY: pre-shared key checked at WS connect time.
// Replace with WS ticket + Origin allowlist before any public exposure (Phase 6.4).
// OWASP: WebSocket has no built-in auth. Query-string tokens leak to
// browser history, proxy logs, Referer headers. This is acceptable only
// on localhost/LAN with a throwaway key.

const AUTH_TIMEOUT_MS = 3_000;

let challenge: string | null = null;
let challengeTimeout: ReturnType<typeof setTimeout> | null = null;

export function verifyKey(key: string): boolean {
  const cfg = loadEnv();
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
