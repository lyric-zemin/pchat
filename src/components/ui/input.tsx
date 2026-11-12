"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-white/[0.12] bg-black/20 px-4",
        // 16px 避免 iOS Safari 聚焦时自动放大页面。
        "text-base text-[var(--scene-ink)] placeholder:text-[var(--scene-soft)]/55",
        "outline-none transition-all duration-300",
        "hover:border-white/25 focus:border-ember-100/70 focus:bg-black/30 focus:shadow-glow-sm",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
