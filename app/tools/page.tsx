import { ToolCard } from "@/components/tool-card";
import { tools } from "@/tools/registry";

export default function ToolsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">工具</h1>
      <p className="mt-4 max-w-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        自建工具集，所有工具均为独立模块。
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <ToolCard key={tool.id} {...tool} />
        ))}
      </div>
    </main>
  );
}
