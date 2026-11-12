import type { Metadata, Viewport } from "next";
import "./globals.css";

// GitHub Pages 项目页带子路径，metadata 里的绝对路径图标不会被 basePath 自动改写。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "pchat · 凭暗号赴约",
  description: "一间会随时间变暗的房间。生成暗号，和一个人视频相见。",
  icons: { icon: `${basePath}/favicon.svg` },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1020",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
