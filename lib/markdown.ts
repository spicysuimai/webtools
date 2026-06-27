// ---- HTML escape ----

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---- link safety ----

function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  // safe protocols
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (/^mailto:/i.test(trimmed)) return true;
  // root-relative or anchor
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  // relative path (./ or ../)
  if (/^\.{1,2}\//.test(trimmed)) return true;
  // plain relative path (no protocol colon)
  if (!trimmed.includes(":") && /^\w/.test(trimmed)) return true;
  return false;
}

// ---- inline processing ----

function processInline(text: string): string {
  let result = escapeHtml(text);

  // placeholder inline code to protect from further processing
  const placeholders: string[] = [];
  result = result.replace(/`([^`]+?)`/g, (_m: string, code: string) => {
    placeholders.push(code);
    return `\x00C${placeholders.length - 1}\x00`;
  });

  // bold **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // italic *text*
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // links [text](url) — only generate a tag for safe URLs
  result = result.replace(
    /\[(.+?)\]\((.+?)\)/g,
    (_m: string, linkText: string, url: string) => {
      if (isSafeUrl(url)) {
        return `<a href="${escapeHtml(url)}" class="text-blue-600 underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      }
      // unsafe URL → render as plain text (linkText already escaped, escape url for display)
      return `[${linkText}](${escapeHtml(url)})`;
    },
  );

  // restore inline code
  result = result.replace(/\x00C(\d+)\x00/g, (_m, i: string) => {
    return `<code class="rounded bg-zinc-100 px-1 text-sm dark:bg-zinc-800">${placeholders[parseInt(i)]}</code>`;
  });

  return result;
}

// ---- markdown block → html ----

export function markdownToHtml(md: string): string {
  const normalized = md.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const htmlParts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // code block
    if (line.startsWith("```")) {
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      htmlParts.push(
        `<pre class="overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-800"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
      continue;
    }

    // heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = processInline(headingMatch[2]);
      const sizes: Record<number, string> = {
        1: "text-3xl font-bold",
        2: "text-2xl font-semibold",
        3: "text-xl font-semibold",
        4: "text-lg font-medium",
        5: "text-base font-medium",
        6: "text-sm font-medium",
      };
      htmlParts.push(
        `<h${level} class="${sizes[level] || sizes[2]} mt-8 mb-3">${text}</h${level}>`,
      );
      i++;
      continue;
    }

    // blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // unordered list
    if (/^[\-\*]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[\-\*]\s+/.test(lines[i])) {
        const item = processInline(lines[i].replace(/^[\-\*]\s+/, ""));
        listItems.push(`<li>${item}</li>`);
        i++;
      }
      htmlParts.push(
        `<ul class="list-disc pl-6 mt-2 mb-4 space-y-1">${listItems.join("")}</ul>`,
      );
      continue;
    }

    // paragraph — collect consecutive text lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("```") &&
      !/^[\-\*]\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      htmlParts.push(
        `<p class="mt-2 mb-4 leading-relaxed">${processInline(paraLines.join("\n"))}</p>`,
      );
    } else {
      // safety: i did not advance — treat current non-blank line as text
      htmlParts.push(
        `<p class="mt-2 mb-4 leading-relaxed">${processInline(lines[i])}</p>`,
      );
      i++;
    }
  }

  return htmlParts.join("\n");
}
