import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepPRD - 智能需求文档生成",
  description: "从碎片到有序，由 Claude 驱动的 PRD 生成工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
