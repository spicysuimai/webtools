import fs from "fs";
import path from "path";
import { markdownToHtml } from "./markdown";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

// ---- types ----

export interface PostMeta {
  title: string;
  date: string;
  description: string;
  tags: string[];
  slug: string;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

// ---- frontmatter parser ----

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: normalized };
  }

  const meta: Record<string, string> = {};
  const lines = match[1].split("\n");

  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) {
      meta[kv[1]] = kv[2].trim();
    }
  }

  return { meta, body: match[2] };
}

function parseTags(raw: string): string[] {
  if (raw.startsWith("[") && raw.endsWith("]")) {
    return raw
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

// ---- public API ----

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"));

  const posts: PostMeta[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { meta } = parseFrontmatter(raw);
    const slug = meta.slug || file.replace(/\.md$/, "");
    posts.push({
      title: meta.title || slug,
      date: meta.date || "",
      description: meta.description || "",
      tags: meta.tags ? parseTags(meta.tags) : [],
      slug,
    });
  }

  posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return posts;
}

export function getPostBySlug(slug: string): Post | null {
  if (!fs.existsSync(BLOG_DIR)) return null;

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { meta, body } = parseFrontmatter(raw);
    const postSlug = meta.slug || file.replace(/\.md$/, "");
    if (postSlug === slug) {
      const contentHtml = markdownToHtml(body.trim());
      return {
        title: meta.title || slug,
        date: meta.date || "",
        description: meta.description || "",
        tags: meta.tags ? parseTags(meta.tags) : [],
        slug,
        contentHtml,
      };
    }
  }

  return null;
}
