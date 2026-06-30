import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "远程终端",
  description: "连接到已授权设备的真实 shell 终端。",
};

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
