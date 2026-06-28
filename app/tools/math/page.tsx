"use client";

import { useState, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const EXAMPLES = [
  {
    label: "二次公式",
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
  },
  {
    label: "欧拉公式",
    latex: "e^{i\\pi} + 1 = 0",
  },
  {
    label: "贝叶斯定理",
    latex: "P(A|B) = \\frac{P(B|A) P(A)}{P(B)}",
  },
  {
    label: "傅里叶变换",
    latex:
      "\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} dx",
  },
  {
    label: "矩阵",
    latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
  },
];

export default function MathPage() {
  const [latex, setLatex] = useState("");
  const [displayMode, setDisplayMode] = useState(true);
  const [copied, setCopied] = useState(false);

  const rendered = useMemo(() => {
    if (!latex.trim()) return { html: "", error: null };
    try {
      const html = katex.renderToString(latex, {
        displayMode,
        throwOnError: true,
        trust: false,
        strict: true,
      });
      return { html, error: null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "未知渲染错误";
      return { html: "", error: msg };
    }
  }, [latex, displayMode]);

  const handleCopy = async () => {
    if (!latex.trim()) return;
    const wrapper = displayMode ? `$$\n${latex}\n$$` : `$${latex}$`;
    try {
      await navigator.clipboard.writeText(wrapper);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently ignore.
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">数学公式</h1>
      <p className="mt-4 max-w-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        输入 LaTeX 公式源码，实时预览渲染结果。全程在浏览器本地处理。
      </p>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={displayMode}
            onChange={(e) => setDisplayMode(e.target.checked)}
            className="accent-zinc-800 dark:accent-zinc-200"
          />
          块级公式
        </label>
        <button
          type="button"
          onClick={() => {
            setLatex("");
            setCopied(false);
          }}
          disabled={!latex}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          清空
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!latex.trim()}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          复制 Markdown
        </button>
        {copied && (
          <span className="text-sm text-green-600 dark:text-green-400">
            已复制
          </span>
        )}
      </div>

      {/* Example formulas */}
      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => setLatex(ex.latex)}
            className="rounded-lg border border-zinc-200 px-3 py-1 text-xs transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* LaTeX input */}
      <label className="mt-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        LaTeX 源码
      </label>
      <textarea
        value={latex}
        onChange={(e) => setLatex(e.target.value)}
        placeholder={'例如：x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'}
        className="mt-2 min-h-[120px] w-full resize-y rounded-lg border border-zinc-200 bg-white p-4 font-mono text-sm leading-relaxed placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
      />

      {/* Preview */}
      <label className="mt-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        预览
      </label>
      <div className="mt-2 min-h-[120px] rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        {latex.trim() ? (
          rendered.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                渲染错误
              </p>
              <p className="mt-1 font-mono text-xs leading-relaxed text-red-600 dark:text-red-400">
                {rendered.error}
              </p>
            </div>
          ) : (
            /*
             * KaTeX output is safe HTML containing only math markup elements
             * (span, etc.). It does not include script tags, event handlers,
             * or other unsafe content. The trust option remains false (default)
             * to prevent \htmlClass and similar commands.
             */
            <div
              className="overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: rendered.html }}
            />
          )
        ) : (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            输入 LaTeX 公式后，这里会显示实时预览。
          </p>
        )}
      </div>

      {/* Copy format hint */}
      {latex.trim() && !rendered.error && (
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          复制 Markdown 格式：
          {displayMode ? (
            <code className="ml-1 rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">
              $$...$$
            </code>
          ) : (
            <code className="ml-1 rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">
              $...$
            </code>
          )}
        </p>
      )}
    </main>
  );
}
