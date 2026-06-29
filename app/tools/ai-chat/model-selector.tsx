"use client";

import { useEffect, useState } from "react";

interface Provider {
  id: string;
  label: string;
  models: string[];
}

interface Props {
  provider: string;
  model: string;
  onProviderChange: (p: string) => void;
  onModelChange: (m: string) => void;
}

export function ModelSelector({
  provider,
  model,
  onProviderChange,
  onModelChange,
}: Props) {
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    fetch("/api/private/ai-chat")
      .then((r) => r.json())
      .then((d) => {
        const list: Provider[] = d.providers ?? [];
        setProviders(list);
        if (list.length === 0) return;
        const exists = list.find((p) => p.id === provider);
        if (!exists) {
          const first = list[0];
          onProviderChange(first.id);
          onModelChange(first.models[0] ?? "");
        } else if (!exists.models.includes(model)) {
          onModelChange(exists.models[0] ?? "");
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const current = providers.find((p) => p.id === provider);
  const models = current?.models ?? [];

  function handleProviderChange(value: string) {
    onProviderChange(value);
    const next = providers.find((p) => p.id === value);
    if (next && !next.models.includes(model)) {
      onModelChange(next.models[0] ?? "");
    }
  }

  return (
    <div className="flex gap-3">
      <select
        value={provider}
        onChange={(e) => handleProviderChange(e.target.value)}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
      >
        {providers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      <select
        value={model}
        onChange={(e) => onModelChange(e.target.value)}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
      >
        {models.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
