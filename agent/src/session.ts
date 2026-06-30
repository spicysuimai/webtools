import { randomUUID } from "node:crypto";

export interface Session {
  id: string;
  cwd: string;
  pid: number | null;
  createdAt: number;
  lastActiveAt: number;
}

export function createSession(cwd: string): Session {
  const now = Date.now();
  return {
    id: randomUUID(),
    cwd,
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
