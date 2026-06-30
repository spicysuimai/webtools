import { spawn } from "node-pty";
import type { IPty } from "node-pty";
import { config } from "./config.js";

export function spawnPty(cwd: string): IPty {
  const cfg = config();

  const resolvedCwd = cwd || cfg.defaultCwd;

  if (cfg.allowlistRoots.length > 0) {
    const allowed = cfg.allowlistRoots.some((root) =>
      resolvedCwd.startsWith(root),
    );
    if (!allowed) {
      throw new Error(
        `cwd "${resolvedCwd}" not in allowlist roots: ${cfg.allowlistRoots.join(", ")}`,
      );
    }
  }

  const shell = process.platform === "win32" ? "powershell.exe" : "/bin/sh";
  const shellArgs = process.platform === "win32" ? [] : [];

  const pty = spawn(shell, shellArgs, {
    name: "xterm-256color",
    cols: 80,
    rows: 24,
    cwd: resolvedCwd,
    env: process.env as { [key: string]: string },
  });

  return pty;
}
