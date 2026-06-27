import { ToolCard } from "@/components/tool-card";
import { tools } from "@/tools/registry";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">SpicySuiMai Tools</h1>
      <p className="mt-4 max-w-lg text-zinc-600 leading-relaxed dark:text-zinc-400">
        一个自建的个人工具站，包含博客、Markdown 编辑器、图片压缩、数学公式、AI
        聊天等功能。
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} {...tool} />
        ))}
      </div>
    </main>
  );
}
