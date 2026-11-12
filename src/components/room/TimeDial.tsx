"use client";

import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { useRoomStore } from "@/lib/store";
import { PHASE_ORDER, PHASES } from "@/lib/time/phases";
import { cn } from "@/lib/utils";

/** 手动预览四段天色；「跟随时钟」恢复自动。房内切换会同步给对方。 */
export default function TimeDial({
  variant = "lobby",
  className,
}: {
  variant?: "lobby" | "room";
  className?: string;
}) {
  const scenePhase = useRoomStore((state) => state.scenePhase);
  const autoTime = useRoomStore((state) => state.autoTime);
  const engine = useRoomEngine();
  const compact = variant === "room";
  const highlightId = `time-dial-${variant}`;

  const buttonClass = (active: boolean) =>
    cn(
      // 44px 热区 + 单字短标签，窄屏不再被挤成竖排中文。
      "relative flex h-11 min-w-[44px] shrink-0 items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors duration-300",
      compact ? "px-2 text-xs sm:px-3" : "px-2 sm:px-4 sm:text-sm",
      active ? "text-midnight-900" : "text-[var(--scene-ink)]/75 hover:text-[var(--scene-ink)]",
    );

  return (
    <div
      role="group"
      aria-label="预览房间时段"
      className={cn(
        "glass flex max-w-full items-center gap-0.5 rounded-full p-1 sm:gap-1",
        className,
      )}
    >
      {PHASE_ORDER.map((phase) => {
        const active = !autoTime && scenePhase === phase;
        const theme = PHASES[phase];
        return (
          <button
            key={phase}
            type="button"
            aria-pressed={active}
            title={`${theme.label} · ${theme.window}`}
            onClick={() => engine.previewPhase(phase)}
            className={buttonClass(active)}
          >
            {active && (
              <motion.span
                layoutId={highlightId}
                className="absolute inset-0 rounded-full bg-ember-100 shadow-glow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 sm:hidden">{theme.shortLabel}</span>
            <span className="relative z-10 hidden sm:inline">{theme.label}</span>
          </button>
        );
      })}

      <span className="mx-0.5 h-5 w-px shrink-0 bg-[var(--scene-line)] sm:mx-1" />

      <button
        type="button"
        aria-pressed={autoTime}
        title="恢复按本机时钟自动过渡"
        onClick={() => engine.previewPhase(null)}
        className={buttonClass(autoTime)}
      >
        {autoTime && (
          <motion.span
            layoutId={highlightId}
            className="absolute inset-0 rounded-full bg-ember-100 shadow-glow-sm"
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
        )}
        <Clock3 className="relative z-10 h-4 w-4 shrink-0" />
        <span className="relative z-10 sm:hidden">自动</span>
        <span className="relative z-10 hidden sm:inline">跟随时钟</span>
      </button>
    </div>
  );
}
