"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import type { ChatMessage } from "@/lib/ai/types";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
}

export function ChatPanel({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        选择模型，开始对话
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-zinc-200 [&_pre]:p-3 [&_pre]:text-xs [&_code]:rounded [&_code]:bg-zinc-200 [&_code]:px-1 [&_code]:text-xs [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-400 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-600 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_table]:w-full [&_th]:border [&_th]:border-zinc-400 [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:border-zinc-300 [&_td]:px-2 [&_td]:py-1 dark:[&_pre]:bg-zinc-700 dark:[&_code]:bg-zinc-700 dark:[&_blockquote]:text-zinc-400 dark:[&_td]:border-zinc-600 dark:[&_th]:border-zinc-500 ${
              msg.role === "user"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            }`}
          >
            {msg.role === "assistant" ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {msg.content}
              </ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm text-zinc-500 dark:bg-zinc-800">
            回复中...
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
