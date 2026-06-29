import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { tools } from "@/tools/registry";

const publicTools = tools.filter((t) => !t.requireAuth);

export const metadata: Metadata = {
  description: "一个自建的个人工具站，包含博客、Markdown 编辑器、图片压缩、数学公式等工具。",
};

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">SpicySuiMai Tools</h1>
      <p className="mt-4 max-w-lg text-zinc-600 leading-relaxed dark:text-zinc-400">
        欢迎来到我的个人工具站。这里有实用的在线工具和我的博客文章，所有公开工具均可免费使用。
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {publicTools.map((tool) => (
          <ToolCard key={tool.id} {...tool} />
        ))}
      </div>
    </main>
  );
}
