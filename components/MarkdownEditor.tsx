"use client";

import { useState } from "react";
import { markdownToHtml } from "@/lib/markdown";

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInsertExample = () => {
    setMarkdown(EXAMPLE_MD);
  };

  const handleClear = () => {
    setMarkdown("");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  const html = markdown ? markdownToHtml(markdown) : "";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Markdown 编辑器</h1>

      {/* toolbar */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handleInsertExample}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          插入示例
        </button>
        <button
          onClick={handleClear}
          disabled={!markdown}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          清空
        </button>
        <button
          onClick={handleCopy}
          disabled={!markdown}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          复制
        </button>
        {copied && (
          <span className="text-sm text-green-600 dark:text-green-400">
            已复制
          </span>
        )}
      </div>

      {/* editor + preview */}
      <div className="mt-4 grid flex-1 gap-4 md:grid-cols-2">
        {/* editor pane */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            编辑
          </label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="在此输入 Markdown..."
            className="min-h-[400px] flex-1 resize-none rounded-lg border border-zinc-200 bg-white p-4 font-mono text-sm leading-relaxed placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
          />
        </div>

        {/* preview pane */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            预览
          </label>
          <div className="min-h-[400px] flex-1 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            {markdown ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                在左侧输入 Markdown 内容后，这里会显示实时预览。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const EXAMPLE_MD = `# Markdown 编辑器

## 标题

正文支持 **加粗** 和 *斜体*。

## 链接

访问 [Next.js](https://nextjs.org) 了解更多。

## 代码

行内代码：\`console.log("hello")\`

代码块：

\`\`\`javascript
function hello() {
  return "Hello World";
}
\`\`\`

## 列表

- 项目一
- 项目二
- 项目三
`;
