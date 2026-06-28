import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "博客",
  description: "基于 Markdown 文件的个人博客，文章存放在 content/blog。",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">博客</h1>
      <p className="mt-4 max-w-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        基于 Markdown 文件的个人博客，文章存放在{" "}
        <code className="rounded bg-zinc-100 px-1 text-sm dark:bg-zinc-800">
          content/blog
        </code>
        。
      </p>

      {posts.length === 0 ? (
        <p className="mt-8 text-zinc-500 dark:text-zinc-400">暂无文章。</p>
      ) : (
        <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
          {posts.map((post) => (
            <li key={post.slug} className="py-4">
              <Link
                href={`/blog/${post.slug}`}
                className="group block transition-colors"
              >
                <h2 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {post.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {post.date}
                </p>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                  {post.description}
                </p>
                {post.tags.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
