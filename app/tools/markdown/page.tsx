import type { Metadata } from "next";
import { MarkdownEditor } from "@/components/MarkdownEditor";

export const metadata: Metadata = {
  title: "Markdown 编辑器",
  description: "在线 Markdown 编辑与实时预览。",
};

export default function MarkdownPage() {
  return <MarkdownEditor />;
}
