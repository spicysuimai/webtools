import { config } from "./config.js";

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

export async function register(): Promise<void> {
  const cfg = config();
  if (!cfg.deviceName || !cfg.registryUrl) {
    console.log("[agent] device registry: not configured, skipping");
    return;
  }

  const endpoint = `${cfg.registryUrl}/api/private/devices`;

  const doHeartbeat = async () => {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  // Fallback for 0.0.0.0 — the registry can't connect to 0.0.0.0,
  // so we resolve the machine's LAN IP. Crude: return hostname.
  try {
    const { hostname } = new URL(`http://localhost`);
    return hostname; // "localhost", but will be overwritten by registry logic
  } catch {
    return "127.0.0.1";
  }
}
