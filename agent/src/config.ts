const DEFAULTS = {
  host: "127.0.0.1",
  port: 4200,
  key: "",
  idleTimeoutMs: 900_000,
  maxConnsPerMin: 10,
  heartbeatInterval: 30_000,
};

export interface AgentConfig {
  host: string;
  port: number;
  agentKey: string;
  defaultCwd: string;
  allowlistRoots: string[];
  idleTimeoutMs: number;
  jwtSecret: string;
  originAllowlist: string[];
  maxConnsPerMin: number;
  deviceName: string;
  registryUrl: string;
  publicUrl: string;
}

let cached: AgentConfig | null = null;

export function config(): AgentConfig {
  if (cached) return cached;

  const host = process.env.AGENT_HOST || DEFAULTS.host;
  const port = parseInt(process.env.AGENT_PORT || String(DEFAULTS.port), 10);
  const agentKey = process.env.AGENT_KEY || DEFAULTS.key;

  if (!agentKey && !process.env.JWT_SECRET) {
    console.warn("[agent] AGENT_KEY and JWT_SECRET both unset — running without auth (DEV ONLY)");
  }

  const defaultCwd = process.env.AGENT_DEFAULT_CWD || process.cwd();
  const rootsRaw = process.env.AGENT_ALLOWLIST_ROOTS;
  const allowlistRoots = rootsRaw
    ? rootsRaw.split(",").map((r) => r.trim()).filter(Boolean)
    : [];

  const idleTimeoutMs = parseInt(
    process.env.AGENT_IDLE_TIMEOUT_MS || "",
    10,
  ) || DEFAULTS.idleTimeoutMs;

  const jwtSecret = process.env.JWT_SECRET || agentKey;

  const originsRaw = process.env.AGENT_ORIGIN_ALLOWLIST;
  const originAllowlist = originsRaw
    ? originsRaw.split(",").map((o) => o.trim()).filter(Boolean)
    : [];

  const maxConnsPerMin = parseInt(
    process.env.AGENT_MAX_CONNS_PER_MIN || "",
    10,
  ) || DEFAULTS.maxConnsPerMin;

  const deviceName = process.env.AGENT_DEVICE_NAME || "";
  const registryUrl = process.env.AGENT_REGISTRY_URL || "";
  const publicUrl = process.env.AGENT_PUBLIC_URL || "";

  cached = {
    host,
    port,
    agentKey,
    defaultCwd,
    allowlistRoots,
    idleTimeoutMs,
    jwtSecret,
    originAllowlist,
    maxConnsPerMin,
    deviceName,
    registryUrl,
    publicUrl,
  };
  return cached;
}
