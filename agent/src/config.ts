const DEFAULTS = {
  host: "127.0.0.1",
  port: 4200,
  key: "",
};

export interface AgentConfig {
  host: string;
  port: number;
  agentKey: string;
  defaultCwd: string;
  allowlistRoots: string[];
  idleTimeoutMs: number;
}

let cached: AgentConfig | null = null;

export function config(): AgentConfig {
  if (cached) return cached;

  const host = process.env.AGENT_HOST || DEFAULTS.host;
  const port = parseInt(process.env.AGENT_PORT || String(DEFAULTS.port), 10);
  const agentKey = process.env.AGENT_KEY || DEFAULTS.key;

  if (!agentKey) {
    console.warn("[agent] AGENT_KEY not set — running without auth (DEV ONLY)");
  }

  const defaultCwd = process.env.AGENT_DEFAULT_CWD || process.cwd();
  const rootsRaw = process.env.AGENT_ALLOWLIST_ROOTS;
  const allowlistRoots = rootsRaw
    ? rootsRaw.split(",").map((r) => r.trim()).filter(Boolean)
    : [];

  const idleTimeoutMs = parseInt(
    process.env.AGENT_IDLE_TIMEOUT_MS || "",
    10,
  ) || 900_000; // 15 min default

  cached = { host, port, agentKey, defaultCwd, allowlistRoots, idleTimeoutMs };
  return cached;
}
