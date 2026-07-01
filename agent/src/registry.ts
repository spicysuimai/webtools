import { SignJWT } from "jose";
import os from "node:os";
import { config } from "./config.js";

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

function getSecret(): Uint8Array {
  const cfg = config();
  return new TextEncoder().encode(cfg.jwtSecret);
}

async function signAgentToken(): Promise<string> {
  return new SignJWT({ sub: "agent" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(getSecret());
}

export async function register(): Promise<void> {
  const cfg = config();
  if (!cfg.deviceName || !cfg.registryUrl) {
    console.log("[agent] device registry: not configured, skipping");
    return;
  }

  const endpoint = `${cfg.registryUrl}/api/private/devices`;

  const doHeartbeat = async () => {
    try {
      const token = await signAgentToken();
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cfg.deviceName,
          host: cfg.publicUrl ? cfg.host : (cfg.host === "0.0.0.0" ? getLocalIP() : cfg.host),
          port: cfg.port,
          publicUrl: cfg.publicUrl || undefined,
        }),
      });
      if (res.ok) {
        console.log(`[agent] heartbeat ok device=${cfg.deviceName}`);
      } else {
        console.warn(`[agent] heartbeat failed: ${res.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[agent] heartbeat error: ${msg}`);
    }
  };

  await doHeartbeat();
  const interval = 30_000;
  heartbeatTimer = setInterval(doHeartbeat, interval);
}

export function unregister(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const [, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family === "IPv4" && !addr.internal) {
        return addr.address;
      }
    }
  }
  return "127.0.0.1";
}
