import type { NextConfig } from "next";

// 只有 GitHub Actions 发布时才注入 STATIC_EXPORT 与 NEXT_PUBLIC_BASE_PATH，
// 本地 dev / build / start 的行为保持不变。
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const pagesConfig: NextConfig = {
  output: "export",
  basePath,
};

// 静态导出不支持自定义响应头，GitHub Pages 也无法下发；PeerJS 只需要 HTTPS 安全上下文。
const localConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

const nextConfig: NextConfig = {
  // PeerJS 持有长连接与 MediaStream，开发期关闭双挂载可避免信令抖动。
  reactStrictMode: false,
  ...(isStaticExport ? pagesConfig : localConfig),
};

export default nextConfig;
