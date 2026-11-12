"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger" | "quiet";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-ember-100 to-ember-300 text-midnight-900 shadow-glow-sm hover:shadow-glow border border-ember-100/60",
  outline:
    "border border-[var(--scene-line)] bg-white/[0.045] text-[var(--scene-ink)] hover:bg-white/[0.11] hover:border-ember-100/50",
  ghost:
    "border border-transparent text-[var(--scene-soft)] hover:bg-white/[0.08] hover:text-[var(--scene-ink)]",
  danger:
    "border border-clay/50 bg-clay/15 text-[#F4BDB6] hover:bg-clay/28 hover:border-clay/80",
  quiet:
    "border border-white/[0.08] bg-black/20 text-[var(--scene-soft)] hover:text-[var(--scene-ink)] hover:bg-black/30",
};

const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-sm rounded-xl",
  md: "h-11 px-5 text-[15px] rounded-2xl",
  lg: "h-14 px-7 text-base rounded-2xl",
  icon: "h-11 w-11 rounded-2xl",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-medium leading-none",
        "transition-all duration-300 ease-soft active:scale-[0.965]",
        "disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
