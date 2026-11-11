"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { useRoomStore } from "@/lib/store";
import { PHASES } from "@/lib/time/phases";
import type { ConnectionStatus } from "@/types/room";
import { copyText, formatClock } from "@/lib/utils";
import TimeDial from "./TimeDial";

const STATUS: Record<ConnectionStatus, string> = {
  idle: "还没连上",
  signaling: "房间已亮灯",
  connecting: "正在敲门",
  connected: "两人都在",
  error: "连接中断",
};

export default function RoomTopBar() {
  const [clock, setClock] = useState("");
  const [copied, setCopied] = useState(false);
  const code = useRoomStore((state) => state.code);
  const connection = useRoomStore((state) => state.connection);
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

  const handleCopy = async () => {
    const ok = await copyText(code);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 px-4 pt-4 sm:px-8">
      <div className="glass flex h-16 items-center justify-between gap-3 rounded-full px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="hidden font-display text-lg font-semibold text-[var(--scene-ink)] sm:inline">
            pchat
          </span>
          <span className="hidden h-4 w-px bg-[var(--scene-line)] sm:inline" />
          <Tooltip label={copied ? "已复制" : "复制暗号"}>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="复制房间暗号"
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 font-code text-sm tracking-[0.16em] text-[var(--scene-ink)] transition-colors hover:bg-white/10"
            >
              {code}
              {copied ? <Check className="h-3.5 w-3.5 text-moss" /> : <Copy className="h-3.5 w-3.5 opacity-60" />}
            </button>
          </Tooltip>
        </div>

        <div className="hidden md:block">
          <TimeDial variant="room" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 text-xs sm:flex">
            <span className={`h-1.5 w-1.5 rounded-full ${connection === "connected" ? "bg-moss" : "bg-honey"}`} />
            <span className="text-[var(--scene-soft)]">{STATUS[connection]}</span>
          </div>
          <span className="hidden font-code text-xs text-[var(--scene-soft)] lg:inline">
            {theme.label}
            {autoTime ? "" : "·预览"} {clock}
          </span>
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
