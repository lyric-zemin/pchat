"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { useRoomStore } from "@/lib/store";
import { PHASES } from "@/lib/time/phases";
import { formatClock } from "@/lib/utils";

export default function TopBar() {
  const [clock, setClock] = useState("");
  const scenePhase = useRoomStore((state) => state.scenePhase);
  const autoTime = useRoomStore((state) => state.autoTime);
  const soundOff = useRoomStore((state) => state.soundOff);
  const engine = useRoomEngine();
  const theme = PHASES[scenePhase];

  useEffect(() => {
    const update = () => setClock(formatClock(new Date()));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-30 px-4 pt-4 sm:px-8">
      <div className="glass mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full px-5 sm:px-7">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-xl font-semibold tracking-wide text-[var(--scene-ink)]">
            pchat
          </span>
          <span className="hidden text-xs text-[var(--scene-soft)] sm:inline">
            一处会随时间变暗的房间
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-4">
          <div className="hidden items-center gap-2.5 text-xs sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-ember-200 shadow-glow-sm" />
            <span className="text-[var(--scene-soft)]">
              {theme.label}
              {autoTime ? "" : " · 预览"}
            </span>
            <span className="font-code text-[var(--scene-ink)]">{clock}</span>
          </div>
          <Tooltip label={soundOff ? "打开提示音" : "静音提示音"}>
            <Button
              variant="ghost"
              size="icon"
              onClick={engine.toggleSound}
              aria-label={soundOff ? "打开提示音" : "静音提示音"}
            >
              {soundOff ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
