"use client";

import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { useRoomStore } from "@/lib/store";
import { PHASE_ORDER, PHASES } from "@/lib/time/phases";
import { cn } from "@/lib/utils";

/** 手动预览四段天色；「跟随时钟」恢复自动。房内切换会同步给对方。 */
export default function TimeDial({ variant = "lobby" }: { variant?: "lobby" | "room" }) {
  const scenePhase = useRoomStore((state) => state.scenePhase);
  const autoTime = useRoomStore((state) => state.autoTime);
  const engine = useRoomEngine();
  const compact = variant === "room";
  const highlightId = `time-dial-${variant}`;

  return (
    <div
      role="group"
      aria-label="预览房间时段"
      className={cn("glass flex items-center rounded-full", compact ? "gap-0.5 p-1" : "gap-1 p-1")}
    >
      {PHASE_ORDER.map((phase) => {
        const active = !autoTime && scenePhase === phase;
        return (
          <button
            key={phase}
            type="button"
            aria-pressed={active}
            title={`${PHASES[phase].label} · ${PHASES[phase].window}`}
            onClick={() => engine.previewPhase(phase)}
            className={cn(
              "relative rounded-full font-medium transition-colors duration-300",
              compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
              active ? "text-midnight-900" : "text-[var(--scene-ink)]/75 hover:text-[var(--scene-ink)]",
            )}
          >
            {active && (
              <motion.span
                layoutId={highlightId}
                className="absolute inset-0 rounded-full bg-ember-100 shadow-glow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">{PHASES[phase].label}</span>
          </button>
        );
      })}

      <span className="mx-1 h-4 w-px bg-[var(--scene-line)]" />

      <button
        type="button"
        aria-pressed={autoTime}
        title="恢复按本机时钟自动过渡"
        onClick={() => engine.previewPhase(null)}
        className={cn(
          "relative flex items-center gap-1.5 rounded-full font-medium transition-colors duration-300",
          compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
          autoTime ? "text-midnight-900" : "text-[var(--scene-ink)]/75 hover:text-[var(--scene-ink)]",
        )}
      >
        {autoTime && (
          <motion.span
            layoutId={highlightId}
            className="absolute inset-0 rounded-full bg-ember-100 shadow-glow-sm"
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
        )}
        <Clock3 className="relative z-10 h-3.5 w-3.5" />
        <span className="relative z-10">跟随时钟</span>
      </button>
    </div>
  );
}
