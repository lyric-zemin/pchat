"use client";

import { randomId } from "@/lib/utils";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const ALNUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function pick(alphabet: string, count: number): string {
  const bytes = new Uint8Array(count);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < count; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/** 生成形如 KRM-7Q2 的易读暗号，字母表已排除 O / I / L / 0 / 1。 */
export function generateCode(): string {
  return `${pick(LETTERS, 3)}-${pick(ALNUM, 3)}`;
}

/** 同一串文字（忽略大小写、空格与标点）永远得到同一把钥匙。 */
export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export interface CodeCheck {
  ok: boolean;
  code: string;
  hint: string | null;
  weak: boolean;
}

function isSequential(code: string): boolean {
  if (code.length < 4) return false;
  let up = true;
  let down = true;
  for (let i = 1; i < code.length; i += 1) {
    const diff = code.charCodeAt(i) - code.charCodeAt(i - 1);
    if (diff !== 1) up = false;
    if (diff !== -1) down = false;
  }
  return up || down;
}

export function validateCode(raw: string): CodeCheck {
  const code = normalizeCode(raw);
  if (code.length < 4) {
    return { ok: false, code, hint: "暗号至少 4 位，多几位更不容易撞上别人。", weak: true };
  }
  if (code.length > 24) {
    return { ok: false, code, hint: "暗号太长了，控制在 24 位以内。", weak: false };
  }
  const weak = new Set(code).size < 4 || isSequential(code);
  return {
    ok: true,
    code,
    hint: weak ? "这串暗号有点好猜，建议再加几位或换个组合。" : null,
    weak,
  };
}

function fallbackHash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i += 1) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 + c * (i + 7), 2246822519) >>> 0;
  }
  return `${h1.toString(16).padStart(8, "0")}${h2.toString(16).padStart(8, "0")}`;
}

/**
 * 暗号 → 确定性房主 Peer ID。PeerJS 没有房间目录，这层派生让
 *「凭暗号找到对方」不需要任何后端；非安全上下文下退化为本地哈希。
 */
export async function deriveHostId(raw: string): Promise<string> {
  const input = `pchat:v1:${normalizeCode(raw)}`;
  let hex: string | null = null;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const digest = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(input))
      .catch(() => null);
    if (digest) {
      hex = Array.from(new Uint8Array(digest))
        .slice(0, 8)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  }
  return `pchat-${hex ?? fallbackHash(input)}`;
}

export function randomGuestId(): string {
  return `pchat-${randomId("g")}`;
}
