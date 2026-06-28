import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "数学公式",
  description: "输入 LaTeX 公式源码，实时预览渲染结果。全程在浏览器本地处理。",
};

export default function MathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
