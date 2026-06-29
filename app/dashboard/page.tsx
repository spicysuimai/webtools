import type { Metadata } from "next";
import { tools } from "@/tools/registry";
import { ToolCard } from "@/components/tool-card";

export const metadata: Metadata = {
  title: "控制台",
};

const privateTools = tools.filter((t) => t.requireAuth);

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">控制台</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {privateTools.map((tool) => (
          <ToolCard key={tool.id} {...tool} />
        ))}
      </div>
    </main>
  );
}
