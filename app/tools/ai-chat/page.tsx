"use client";

import { useState, useCallback } from "react";
import { ModelSelector } from "./model-selector";
import { ChatPanel } from "./chat-panel";
import { MessageInput } from "./message-input";
import { useChat } from "./use-chat";

export default function AiChatPage() {
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o");
  const { messages, loading, error, sendMessage } = useChat();

  const handleSend = useCallback(
    (content: string) => {
      sendMessage({ provider, model, content, messages });
    },
    [provider, model, messages, sendMessage],
  );

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">AI 聊天</h1>
      <ModelSelector
        provider={provider}
        model={model}
        onProviderChange={setProvider}
        onModelChange={setModel}
      />
      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="mt-6 flex flex-1 flex-col">
        <ChatPanel messages={messages} loading={loading} />
        <div className="mt-4">
          <MessageInput disabled={loading} onSend={handleSend} />
        </div>
      </div>
    </main>
  );
}
