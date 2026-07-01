"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { getTerminalWsUrl } from "@/lib/ws-config";

interface Props {
  ticket: string;
  cwd?: string;
  wsUrl?: string;
  initCommand?: string;
  onClose?: () => void;
  onReady?: (label: string) => void;
}

export function TerminalView({ ticket, cwd, wsUrl, initCommand, onClose, onReady }: Props) {
  const [status, setStatus] = useState<"connecting" | "ok" | "error">("connecting");
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const onCloseRef = useRef(onClose);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onCloseRef.current = onClose;
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    let disposed = false;
    // Counter to skip Strict Mode double-mount cleanup
    let mountId = 0;

    const setup = () => {
      mountId++;
      const currentMount = mountId;

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
      termRef.current = term;

      const fitAddon = new FitAddon();
      fitRef.current = fitAddon;
      term.loadAddon(fitAddon);
      term.loadAddon(new WebLinksAddon());

      if (containerRef.current) {
        term.open(containerRef.current);
        fitAddon.fit();
      }

      const url = wsUrl || getTerminalWsUrl();
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "auth", ticket, cwd: cwd || "" }));
      };

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === "auth_ok") {
          setStatus("ok");
          onReadyRef.current?.(msg.label || "");
          if (initCommand && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "input", data: initCommand + "\n" }));
          }
        } else if (msg.type === "auth_error") {
          setStatus("error");
          if (!disposed) term.writeln(`\r\n\x1b[31m${msg.message}\x1b[0m`);
        } else if (msg.type === "output") {
          if (!disposed) term.write(msg.data);
        } else if (msg.type === "closed") {
          setStatus("error");
          if (!disposed) term.writeln(`\r\n\x1b[33m[${msg.reason}]\x1b[0m`);
          onCloseRef.current?.();
        }
      };

      ws.onerror = () => {
        setStatus("error");
        if (!disposed) {
          term.writeln("\r\n\x1b[31m[Connection error]\x1b[0m");
        }
      };

      ws.onclose = () => {
        if (!disposed) {
          term.writeln("\r\n\x1b[33m[Disconnected]\x1b[0m");
        }
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
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        // Skip cleanup if this isn't the latest mount (Strict Mode)
        if (currentMount !== mountId) return;
        disposed = true;
        observer.disconnect();
        clearTimeout(timer);
        ws.close();
        term.dispose();
      };
    };

    const cleanupFn = setup();

    return () => {
      cleanupFn?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-full w-full">
      {status === "connecting" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-b-lg bg-zinc-900/80 text-sm text-zinc-400">
          Connecting...
        </div>
      )}
      <div
        ref={containerRef}
        className="h-full w-full rounded-b-lg border-x border-b border-zinc-700"
        style={{ minHeight: 300 }}
      />
    </div>
  );
}
