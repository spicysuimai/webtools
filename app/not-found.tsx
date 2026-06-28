import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16">
      <p className="text-6xl font-bold text-zinc-300 dark:text-zinc-700">404</p>
      <h1 className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        页面不存在
      </h1>
      <Link
        href="/"
        className="mt-6 text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        返回首页
      </Link>
    </main>
  );
}
