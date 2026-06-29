import type { ChatMessage } from "@/lib/ai/types";
import type { IProviderAdapter } from "./base";

function toGeminiRole(role: string): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

export class GeminiAdapter implements IProviderAdapter {
  readonly providerId = "gemini";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: ChatMessage[], model: string): Promise<string> {
    const systemMessages = messages.filter((m) => m.role === "system");
    const conversation = messages.filter((m) => m.role !== "system");

    const body: Record<string, unknown> = {
      contents: conversation.map((m) => ({
        role: toGeminiRole(m.role),
        parts: [{ text: m.content }],
      })),
    };

    if (systemMessages.length > 0) {
      body.systemInstruction = {
        parts: systemMessages.map((m) => ({ text: m.content })),
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `gemini API error ${res.status}: ${text.slice(0, 200)}`,
        );
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } finally {
      clearTimeout(timer);
    }
  }
}
