import type { Metadata, Viewport } from "next";
import "./globals.css";

// GitHub Pages 项目页带子路径，metadata 里的绝对路径图标不会被 basePath 自动改写。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "pchat · 凭暗号赴约",
  description: "一间会随时间变暗的房间。生成暗号，和一个人视频相见。",
  applicationName: "pchat",
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    title: "pchat",
    statusBarStyle: "black-translucent",
  },
  icons: { icon: `${basePath}/favicon.svg` },
};

// viewportFit=cover 让内容延伸到刘海/Home Indicator 区域，
// 再由组件上的 env(safe-area-inset-*) 自行避开，避免状态栏压住固定栏。
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
