"use client";

import { useEffect, useRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { getTerminalWsUrl } from "@/lib/ws-config";

interface Props {
  ticket: string;
  cwd?: string;
  wsUrl?: string;
  onClose?: () => void;
  onReady?: (label: string) => void;
}

export function TerminalView({ ticket, cwd, wsUrl, onClose, onReady }: Props) {
  const termRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<FitAddon | null>(null);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (termRef.current) {
      termRef.current.dispose();
      termRef.current = null;
    }
  }, []);

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: "bar",
      fontSize: 14,
      fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
      theme: {
        background: "#1a1b26",
        foreground: "#c0caf5",
        cursor: "#c0caf5",
        selectionBackground: "#364a82",
        black: "#15161e",
        red: "#f7768e",
        green: "#9ece6a",
        yellow: "#e0af68",
        blue: "#7aa2f7",
        magenta: "#bb9af7",
        cyan: "#7dcfff",
        white: "#a9b1d6",
        brightBlack: "#414868",
        brightRed: "#f7768e",
        brightGreen: "#9ece6a",
        brightYellow: "#e0af68",
        brightBlue: "#7aa2f7",
        brightMagenta: "#bb9af7",
        brightCyan: "#7dcfff",
        brightWhite: "#c0caf5",
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    fitRef.current = fitAddon;
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(containerRef.current!);
    fitAddon.fit();

    const url = wsUrl || getTerminalWsUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "auth", ticket, cwd: cwd || "" }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "auth_ok") {
        onReady?.(msg.label || "");
      } else if (msg.type === "auth_error") {
        term.writeln(`\r\n\x1b[31mAuth error: ${msg.message}\x1b[0m`);
        ws.close();
      } else if (msg.type === "output") {
        term.write(msg.data);
      } else if (msg.type === "closed") {
        term.writeln(`\r\n\x1b[33m[Session closed: ${msg.reason}]\x1b[0m`);
        onClose?.();
      }
    };

    ws.onerror = () => {
      term.writeln("\r\n\x1b[31m[WebSocket connection error]\x1b[0m");
    };

    ws.onclose = () => {
      term.writeln("\r\n\x1b[33m[Disconnected]\x1b[0m");
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "input", data }));
      }
    });

    const handleResize = () => {
      if (!fitRef.current) return;
      fitRef.current.fit();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
      }
    };

    let timer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(handleResize, 100);
    });
    observer.observe(containerRef.current!);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      cleanup();
    };
  }, [ticket, cwd, wsUrl, onClose, onReady, cleanup]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-b-lg border-x border-b border-zinc-700"
      style={{ minHeight: 300 }}
    />
  );
}
