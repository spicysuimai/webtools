import type { ChatMessage } from "@/lib/ai/types";

export interface IProviderAdapter {
  readonly providerId: string;
  chat(messages: ChatMessage[], model: string): Promise<string>;
}
