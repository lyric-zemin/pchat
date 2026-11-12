import type { MetadataRoute } from "next";

// output: "export" 要求 metadata 路由显式声明为静态。
export const dynamic = "force-static";

// GitHub Pages 部署在 /pchat 子路径下，start_url / scope / 图标都要带上 basePath。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "pchat · 凭暗号赴约",
    short_name: "pchat",
    description: "一间会随时间变暗的房间。生成暗号，和一个人视频相见。",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#0B1020",
    theme_color: "#0B1020",
    icons: [
      {
        src: `${basePath}/favicon.svg`,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
