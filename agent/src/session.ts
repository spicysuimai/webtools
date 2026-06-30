import { randomUUID } from "node:crypto";

export const DEFAULT_IDLE_TIMEOUT_MS = 900_000; // 15 min

export interface Session {
  id: string;
  cwd: string;
  label: string;
  pid: number | null;
  createdAt: number;
  lastActiveAt: number;
}

export function createSession(cwd: string): Session {
  const now = Date.now();
  const dir = cwd.split(/[/\\]/).pop() || cwd;
  return {
    id: randomUUID(),
    cwd,
    label: dir,
    pid: null,
    createdAt: now,
    lastActiveAt: now,
  };
}

export function touch(s: Session): void {
  s.lastActiveAt = Date.now();
}

export function idleSeconds(s: Session): number {
  return (Date.now() - s.lastActiveAt) / 1000;
}

export function isTimedOut(s: Session, timeoutMs: number): boolean {
  return idleSeconds(s) * 1000 > timeoutMs;
}

export interface SessionSummary {
  id: string;
  cwd: string;
  label: string;
  pid: number | null;
  idleSeconds: number;
}

export function summary(s: Session): SessionSummary {
  return {
    id: s.id,
    cwd: s.cwd,
    label: s.label,
    pid: s.pid,
    idleSeconds: Math.round(idleSeconds(s)),
  };
}
