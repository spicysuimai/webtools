import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "这是 SpicySuiMai 的新个人站，替代旧的 NotionNext 博客。基于 Next.js 自建，不使用第三方博客模板。",
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">关于</h1>
      <p className="mt-4 max-w-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        这是 SpicySuiMai 的新个人站，替代旧的 NotionNext 博客。
        基于 Next.js 自建，不使用第三方博客模板。
        本站既是个人工具箱，也是 Markdown 博客。
      </p>
    </main>
  );
}
