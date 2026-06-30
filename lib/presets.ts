"use client";

const KEY = "terminal-presets";

export interface Preset {
  id: string;
  label: string;
  command: string;
}

export function loadPresets(): Preset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePresets(presets: Preset[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(presets));
}

export function addPreset(label: string, command: string): Preset {
  const preset: Preset = { id: crypto.randomUUID(), label, command };
  const all = loadPresets();
  all.push(preset);
  savePresets(all);
  return preset;
}

export function deletePreset(id: string) {
  const all = loadPresets().filter((p) => p.id !== id);
  savePresets(all);
}
