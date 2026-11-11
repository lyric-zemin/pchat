"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

export function Tooltip({
  label,
  children,
  side = "top",
  className,
}: TooltipProps) {
  return (
    <span className={cn("group/tip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg",
          "border border-white/10 bg-midnight-900/92 px-2.5 py-1.5 text-xs text-cream",
          "opacity-0 shadow-lg transition-all duration-200",
          "group-hover/tip:opacity-100 group-focus-within/tip:opacity-100",
          side === "top"
            ? "bottom-full mb-2 translate-y-1 group-hover/tip:translate-y-0"
            : "top-full mt-2 -translate-y-1 group-hover/tip:translate-y-0",
        )}
      >
        {label}
      </span>
    </span>
  );
}
