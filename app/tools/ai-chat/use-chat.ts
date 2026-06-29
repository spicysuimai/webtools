"use client";

import { useState, useCallback } from "react";
import type { ChatMessage } from "@/lib/ai/types";

interface SendParams {
  provider: string;
  model: string;
  content: string;
  messages: ChatMessage[];
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = useCallback(async (params: SendParams) => {
    const { provider, model, content, messages: prev } = params;
    setError("");
    setLoading(true);

    const userMsg: ChatMessage = { role: "user", content };
    const updated = [...prev, userMsg];
    setMessages(updated);

    try {
      const res = await fetch("/api/private/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model, messages: updated }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "请求失败");
        return;
      }

      setMessages([...updated, { role: "assistant", content: data.content }]);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }, []);

  return { messages, loading, error, sendMessage, setError };
}
