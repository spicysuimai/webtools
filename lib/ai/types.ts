export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  provider: string;
  model: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  content: string;
}
