"use client";

import type { PeerOptions } from "peerjs";

export interface PeerRuntimeConfig {
  options: PeerOptions;
  source: "cloud" | "self";
  description: string;
}

/**
 * 环境变量必须逐个静态访问，Next.js 才能在构建时把它们内联到客户端包里。
 * 全部留空时走 PeerJS 官方公共信令服务，零配置可用。
 */
export function getPeerConfig(): PeerRuntimeConfig {
  const debug: 0 | 1 = process.env.NODE_ENV === "development" ? 1 : 0;
  const host = (process.env.NEXT_PUBLIC_PEER_HOST ?? "").trim();

  if (!host) {
    return {
      options: { debug },
      source: "cloud",
      description: "PeerJS 官方公共信令",
    };
  }

  const portRaw = (process.env.NEXT_PUBLIC_PEER_PORT ?? "").trim();
  const pathRaw = (process.env.NEXT_PUBLIC_PEER_PATH ?? "").trim();
  const secureRaw = (process.env.NEXT_PUBLIC_PEER_SECURE ?? "").trim();
  const keyRaw = (process.env.NEXT_PUBLIC_PEER_KEY ?? "").trim();

  const secure = secureRaw ? secureRaw === "true" : portRaw === "443" || !portRaw;
  const port = Number(portRaw) || (secure ? 443 : 9000);

  return {
    options: {
      host,
      port,
      path: pathRaw || "/",
      secure,
      key: keyRaw || "peerjs",
      debug,
    },
    source: "self",
    description: `${host}:${port}`,
  };
}
