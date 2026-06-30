"use client";

export function getTerminalWsUrl(): string {
  if (typeof window === "undefined") return "";
  const configured = process.env.NEXT_PUBLIC_TERMINAL_WS;
  if (configured) return configured;
  // Default: localhost for dev
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.hostname}:4200`;
}
