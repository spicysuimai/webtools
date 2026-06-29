export interface ToolMeta {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  category: "public" | "private";
  requireAuth: boolean;
}

export const tools: ToolMeta[] = [
  {
    id: "blog",
    title: "博客",
    description: "Markdown 格式的个人博客，记录技术与生活。",
    href: "/blog",
    icon: "📝",
    category: "public",
    requireAuth: false,
  },
  {
    id: "markdown",
    title: "Markdown 编辑器",
    description: "在线 Markdown 编辑与实时预览。",
    href: "/tools/markdown",
    icon: "📄",
    category: "public",
    requireAuth: false,
  },
  {
    id: "image-compress",
    title: "图片压缩",
    description: "本地压缩图片，保护隐私。",
    href: "/tools/image-compress",
    icon: "🖼️",
    category: "public",
    requireAuth: false,
  },
  {
    id: "math",
    title: "数学公式",
    description: "LaTeX 公式转换与渲染工具。",
    href: "/tools/math",
    icon: "📐",
    category: "public",
    requireAuth: false,
  },
  {
    id: "ai-chat",
    title: "AI 聊天",
    description: "支持多家模型的 AI 对话界面。",
    href: "/tools/ai-chat",
    icon: "💬",
    category: "private",
    requireAuth: true,
  },
];
