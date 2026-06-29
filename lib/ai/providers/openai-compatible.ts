import type { ChatMessage } from "@/lib/ai/types";
import type { IProviderAdapter } from "./base";

const BASE_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  deepseek: "https://api.deepseek.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
};

export class OpenAICompatibleAdapter implements IProviderAdapter {
  readonly providerId: string;
  private apiKey: string;
  private baseUrl: string;

  constructor(providerId: string, apiKey: string, baseUrl?: string) {
    this.providerId = providerId;
    this.apiKey = apiKey;
    this.baseUrl =
      baseUrl ?? BASE_URLS[providerId] ?? "";
  }

  async chat(messages: ChatMessage[], model: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ model, messages }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `${this.providerId} API error ${res.status}: ${text.slice(0, 200)}`,
        );
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? "";
    } finally {
      clearTimeout(timer);
    }
  }
}
