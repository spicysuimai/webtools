"use client";

import { useState, useRef } from "react";

export default function LoginPage() {
  const [redirectTo] = useState(() => {
    if (typeof window === "undefined") return "/dashboard";
    return new URLSearchParams(window.location.search).get("from") ?? "/dashboard";
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const password = inputRef.current?.value || "";
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "登录失败");
        return;
      }
      window.location.href = redirectTo;
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6">
      <h1 className="text-2xl font-bold tracking-tight">登录</h1>
      <div className="mt-8 flex flex-col gap-4">
        <input
          ref={inputRef}
          type="password"
          placeholder="请输入密码"
          autoFocus
          onKeyDown={handleKeyDown}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </div>
    </main>
  );
}
