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
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const timer = React.useRef<number | null>(null);
  const lastLongPressRef = React.useRef(0);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  React.useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const cancelLongPress = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return (
    <span
      ref={rootRef}
      className={cn("group/tip relative inline-flex", className)}
      // 触屏没有 hover：轻点切换、长按显示，点空白处或 Esc 关闭。
      onClick={() => {
        // 长按后的那次 click 只用来确认，不再把提示关掉；用时间戳避免残留状态吞掉后续点击。
        if (Date.now() - lastLongPressRef.current < 700) {
          lastLongPressRef.current = 0;
          return;
        }
        setOpen((value) => !value);
      }}
      onPointerDown={() => {
        cancelLongPress();
        timer.current = window.setTimeout(() => {
          setOpen(true);
          lastLongPressRef.current = Date.now();
        }, 400);
      }}
      onPointerUp={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onPointerCancel={cancelLongPress}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg",
          "border border-white/10 bg-midnight-900/92 px-2.5 py-1.5 text-xs text-cream",
          "shadow-lg transition-all duration-200",
          open ? "opacity-100" : "opacity-0",
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
