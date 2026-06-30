"use client";

import { useState } from "react";
import { TerminalView } from "@/components/terminal-view";

export default function TerminalPage() {
  const [connected, setConnected] = useState(false);
  const [authKey, setAuthKey] = useState("");
  const [cwd, setCwd] = useState("");

  if (!connected) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16">
        <h1 className="text-2xl font-bold tracking-tight">远程终端</h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          连接到 Host Agent 的真实 shell
        </p>

        <div className="mt-8 flex w-full flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Host WebSocket URL
            </span>
            <input
              type="text"
              readOnly
              value={typeof window !== "undefined" ? `${window.location.hostname}:4200` : ""}
              className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Auth Key
            </span>
            <input
              type="password"
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              placeholder="输入 AGENT_KEY"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              工作目录 (可选)
            </span>
            <input
              type="text"
              value={cwd}
              onChange={(e) => setCwd(e.target.value)}
              placeholder="留空则使用 Agent 默认目录"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>

          <button
            onClick={() => setConnected(true)}
            disabled={!authKey.trim()}
            className="mt-2 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            连接
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col px-2 py-2">
      <TerminalView
        authKey={authKey}
        cwd={cwd || undefined}
        onClose={() => setConnected(false)}
      />
    </main>
  );
}
