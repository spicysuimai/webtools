import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片压缩",
  description: "在浏览器本地压缩图片，文件不会上传到服务器，保护你的隐私。",
};

export default function ImageCompressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
