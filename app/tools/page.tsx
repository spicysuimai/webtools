import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ToolCard } from "@/components/tool-card";
import { tools } from "@/tools/registry";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export const metadata: Metadata = {
  title: "工具",
  description: "自建工具集，所有工具均为独立模块。",
};

const publicTools = tools.filter((t) => !t.requireAuth && t.id !== "blog");
const privateTools = tools.filter((t) => t.requireAuth);

export default async function ToolsPage() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  const authed = !!payload;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">工具</h1>
      <p className="mt-4 max-w-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        自建工具集，所有工具均为独立模块。
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {publicTools.map((tool) => (
          <ToolCard key={tool.id} {...tool} />
        ))}
      </div>
      {authed && privateTools.length > 0 && (
        <>
          <h2 className="mt-14 text-xl font-semibold tracking-tight">私有工具</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {privateTools.map((tool) => (
              <ToolCard key={tool.id} {...tool} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
