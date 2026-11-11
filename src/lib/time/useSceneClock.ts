"use client";

import { useEffect, useRef } from "react";
import { useRoomStore } from "@/lib/store";
import type { TimePhase } from "@/types/room";
import { applySceneVars, currentPhase, PHASES } from "./phases";

/**
 * 落地页与房主按本机时钟走时；访客在房内完全听房主广播，
 * 避免两端时区不同看到两片天色。
 */
export function useSceneClock(broadcast?: (phase: TimePhase, auto: boolean) => void) {
  const scenePhase = useRoomStore((state) => state.scenePhase);
  const broadcastRef = useRef(broadcast);

  useEffect(() => {
    broadcastRef.current = broadcast;
  }, [broadcast]);

  useEffect(() => {
    applySceneVars(PHASES[scenePhase]);
  }, [scenePhase]);

  useEffect(() => {
    const tick = () => {
      const state = useRoomStore.getState();
      if (!state.autoTime) return;
      if (state.role === "guest" && state.phase !== "lobby") return;

      const next = currentPhase(new Date());
      if (next !== state.scenePhase) state.setScenePhase(next);
      if (state.role === "host" && state.phase !== "lobby") {
        broadcastRef.current?.(next, true);
      }
    };

    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);
}
