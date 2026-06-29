import type { IProviderAdapter } from "./base";
import { OpenAICompatibleAdapter } from "./openai-compatible";
import { AnthropicAdapter } from "./anthropic";

export interface ProviderConfig {
  label: string;
  models: string[];
  envKey: string;
}

const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    label: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "o4-mini"],
    envKey: "OPENAI_API_KEY",
  },
  anthropic: {
    label: "Anthropic",
    models: ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5"],
    envKey: "ANTHROPIC_API_KEY",
  },
  gemini: {
    label: "Google Gemini",
    models: ["gemini-2.5-pro", "gemini-2.5-flash"],
    envKey: "GEMINI_API_KEY",
  },
  deepseek: {
    label: "DeepSeek",
    models: ["deepseek-chat", "deepseek-reasoner"],
    envKey: "DEEPSEEK_API_KEY",
  },
  openrouter: {
    label: "OpenRouter",
    models: ["openai/gpt-4o", "anthropic/claude-sonnet-4-6"],
    envKey: "OPENROUTER_API_KEY",
  },
  custom: {
    label: "Custom",
    models: ["*"],
    envKey: "CUSTOM_OPENAI_API_KEY",
  },
};

export function getAvailableProviders(): ProviderConfig[] {
  return Object.entries(PROVIDERS)
    .filter(([, cfg]) => Boolean(process.env[cfg.envKey]))
    .map(([id, cfg]) => ({ ...cfg, id }));
}

export function validateRequest(
  provider: string,
  model: string,
): { valid: false; error: string } | { valid: true } {
  const cfg = PROVIDERS[provider];
  if (!cfg) return { valid: false, error: `未知 provider: ${provider}` };
  if (!process.env[cfg.envKey])
    return { valid: false, error: `${provider} 未配置` };
  if (cfg.models[0] !== "*" && !cfg.models.includes(model))
    return { valid: false, error: `${provider} 不支持的 model: ${model}` };
  if (!model || typeof model !== "string")
    return { valid: false, error: "model 不能为空" };
  return { valid: true };
}

export function getApiKey(provider: string): string {
  const cfg = PROVIDERS[provider];
  if (!cfg) throw new Error(`未知 provider: ${provider}`);
  const key = process.env[cfg.envKey];
  if (!key) throw new Error(`${provider} API key 未配置`);
  return key;
}

export function getProviderLabel(provider: string): string {
  return PROVIDERS[provider]?.label ?? provider;
}

const OPENAI_COMPATIBLE = new Set([
  "openai",
  "deepseek",
  "openrouter",
  "custom",
]);

export function createAdapter(provider: string): IProviderAdapter {
  const key = getApiKey(provider);

  if (OPENAI_COMPATIBLE.has(provider)) {
    const baseUrl =
      provider === "custom"
        ? process.env.CUSTOM_OPENAI_BASE_URL
        : undefined;
    if (provider === "custom" && !baseUrl) {
      throw new Error("CUSTOM_OPENAI_BASE_URL 未配置");
    }
    return new OpenAICompatibleAdapter(provider, key, baseUrl);
  }

  if (provider === "anthropic") return new AnthropicAdapter(key);

  throw new Error(`Adapter for ${provider} not yet implemented`);
}
