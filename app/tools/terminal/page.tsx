"use client";

import { useState, useCallback, useEffect } from "react";
import { TerminalView } from "@/components/terminal-view";
import { getTerminalWsUrl } from "@/lib/ws-config";
import { loadPresets, addPreset, type Preset } from "@/lib/presets";

interface Device {
  name: string;
  host: string;
  port: number;
  publicUrl: string;
  online: boolean;
  lastSeen: number;
}

interface SessionTab {
  id: string;
  label: string;
  cwd: string;
  ticket: string;
  wsUrl: string;
  initCommand: string;
}

export default function TerminalPage() {
  const [cwd, setCwd] = useState("");
  const [tabs, setTabs] = useState<SessionTab[]>([]);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [presets, setPresets] = useState<Preset[]>(
    () => typeof window !== "undefined" ? loadPresets() : [],
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [presetLabel, setPresetLabel] = useState("");
  const [presetCommand, setPresetCommand] = useState("");
  const [exitConfirm, setExitConfirm] = useState(false);

  useEffect(() => {
    fetch("/api/private/devices")
      .then((r) => r.json())
      .then((d) => setDevices(d.devices || []))
      .catch(() => {});
  }, []);

  const handleReady = useCallback(
    (idx: number) => (label: string) => {
      setTabs((prev) => {
        const next = [...prev];
        if (next[idx]) next[idx] = { ...next[idx], label };
        return next;
      });
    },
    [],
  );

  const handleKill = useCallback(
    (idx: number) => {
      setTabs((prev) => {
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
      setActiveTabIdx((prev) => {
        if (prev >= idx) {
          return Math.max(0, prev - 1);
        }
        return prev;
      });
    },
    [],
  );

  const handleExitAll = () => {
    setTabs([]);
    setActiveTabIdx(0);
    setShowForm(true);
    setExitConfirm(false);
  };

  const getWsUrl = (): string => {
    if (selectedDevice) {
      const dev = devices.find((d) => d.name === selectedDevice);
      if (dev) {
        if (dev.publicUrl) return dev.publicUrl;
        return `ws://${dev.host}:${dev.port}`;
      }
    }
    return getTerminalWsUrl();
  };

  const addTab = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/private/terminal-ticket", { method: "POST" });
      const data = await res.json();
      if (!data.ticket) throw new Error("no ticket");

      const preset = presets.find((p) => p.id === selectedPresetId);
      const initCommand = preset?.command || "";

      const newTab: SessionTab = {
        id: `tab-${Date.now()}`,
        label: preset?.label || (cwd ? cwd.split(/[/\\]/).pop() || "shell" : "shell"),
        cwd: cwd || "",
        ticket: data.ticket,
        wsUrl: getWsUrl(),
        initCommand,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabIdx(tabs.length);
      setShowForm(false);
    } catch {
      alert("获取终端票据失败，请确认已登录。");
    } finally {
      setLoading(false);
    }
  };

  if (tabs.length === 0 && showForm) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16">
        <h1 className="text-2xl font-bold tracking-tight">远程终端</h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          连接到 Host Agent 的真实 shell
        </p>

        <div className="mt-8 flex w-full flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              目标设备
            </span>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">默认 (localhost:4200)</option>
              {devices.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.publicUrl || `${d.host}:${d.port}`}) {d.online ? "●" : "○"}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              WebSocket 地址
            </span>
            <input
              type="text"
              readOnly
              value={getWsUrl()}
              className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
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

          {presets.length > 0 && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                快捷命令 (可选)
              </span>
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">无</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>{p.label} — {p.command}</option>
                ))}
              </select>
            </label>
          )}

          <button
            type="button"
            onClick={() => setPresetCommand(presetCommand || " ")}
            className="text-xs text-zinc-400 hover:text-zinc-600 self-start"
          >
            + 添加快捷命令
          </button>

          {presetCommand && presetCommand !== " " && (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={presetLabel}
                  onChange={(e) => setPresetLabel(e.target.value)}
                  placeholder="名称"
                  className="flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (presetLabel.trim() && presetCommand.trim()) {
                      addPreset(presetLabel.trim(), presetCommand.trim());
                      setPresets(loadPresets());
                      setPresetLabel("");
                      setPresetCommand("");
                    }
                  }}
                  className="rounded bg-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-600"
                >
                  保存
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={addTab}
            disabled={loading}
            className="mt-2 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "获取票据..." : "连接"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col px-2 py-2">
      {/* Tab bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-700 pb-1">
        {tabs.map((tab, i) => (
          <div
            key={tab.id}
            className={`flex shrink-0 items-center gap-1 rounded-t-md px-3 py-1.5 text-xs transition-colors ${
              i === activeTabIdx
                ? "bg-zinc-800 text-zinc-200"
                : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800/50"
            }`}
            onClick={() => setActiveTabIdx(i)}
            role="button"
            tabIndex={0}
          >
            <span>{tab.label}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleKill(i);
              }}
              className="ml-1 rounded px-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200"
              title="关闭会话"
            >
              x
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="shrink-0 rounded px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
        >
          + 新建
        </button>
        <div className="ml-auto flex items-center gap-2">
          {exitConfirm ? (
            <>
              <span className="text-xs text-zinc-400">断开所有会话？</span>
              <button
                type="button"
                onClick={handleExitAll}
                className="rounded bg-red-700 px-2 py-1 text-xs text-zinc-200 hover:bg-red-600"
              >
                确认
              </button>
              <button
                type="button"
                onClick={() => setExitConfirm(false)}
                className="rounded px-2 py-1 text-xs text-zinc-500 hover:text-zinc-200"
              >
                取消
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => tabs.length > 0 ? setExitConfirm(true) : handleExitAll()}
              className="rounded px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              退出终端
            </button>
          )}
        </div>
      </div>

      {/* New session form (inline) */}
      {showForm && (
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-700 px-2 py-2">
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-200"
          >
            <option value="">默认</option>
            {devices.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}{d.publicUrl ? " (CF)" : ""}{d.online ? "" : " (离线)"}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={cwd}
            onChange={(e) => setCwd(e.target.value)}
            placeholder="cwd (可选)"
            className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-200"
          />
          <button
            type="button"
            onClick={addTab}
            disabled={loading}
            className="rounded bg-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-600 disabled:opacity-40"
          >
            {loading ? "..." : "连接"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="rounded px-2 py-1 text-xs text-zinc-500 hover:text-zinc-200"
          >
            x
          </button>
        </div>
      )}

      {/* Terminal panels — stacked with absolute positioning to preserve xterm state */}
      <div className="relative flex-1">
        {tabs.map((tab, i) => (
          <div
            key={tab.id}
            className="absolute inset-0"
            style={{
              visibility: i === activeTabIdx ? "visible" : "hidden",
              pointerEvents: i === activeTabIdx ? "auto" : "none",
            }}
          >
            <TerminalView
              ticket={tab.ticket}
              cwd={tab.cwd || undefined}
              wsUrl={tab.wsUrl}
              initCommand={tab.initCommand || undefined}
              onClose={() => handleKill(i)}
              onReady={handleReady(i)}
            />
          </div>
        ))}
      </div>

      {tabs.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
          没有活动的会话 &mdash; 点击 &ldquo;+ 新建&rdquo; 开始
        </div>
      )}
    </main>
  );
}
