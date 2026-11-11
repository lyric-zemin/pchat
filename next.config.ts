import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PeerJS 持有长连接与 MediaStream，开发期关闭双挂载可避免信令抖动。
  reactStrictMode: false,
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

export default nextConfig;
