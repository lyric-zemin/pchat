"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRoomStore } from "@/lib/store";
import type { Phase } from "@/types/room";

type DoorMode = "idle" | "opening" | "closing" | "settling";

/** 进门的门缝光与开门、离场的合门与熄灯，盖住视图切换的那一瞬。 */
export default function DoorTransition() {
  const phase = useRoomStore((state) => state.phase);
  const [mode, setMode] = useState<DoorMode>("idle");
  const previous = useRef<Phase>("lobby");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const prev = previous.current;
    if (phase === "entering" && prev === "lobby") {
      setMode("opening");
      previous.current = phase;
      const timer = window.setTimeout(() => setMode("idle"), reduceMotion ? 220 : 1500);
      return () => window.clearTimeout(timer);
    }
    if (phase === "leaving") {
      setMode("closing");
      previous.current = phase;
      return;
    }
    if (phase === "lobby" && prev === "leaving") {
      setMode("settling");
      previous.current = phase;
      const timer = window.setTimeout(() => setMode("idle"), reduceMotion ? 180 : 760);
      return () => window.clearTimeout(timer);
    }
    previous.current = phase;
  }, [phase, reduceMotion]);

  if (mode === "idle") return null;

  const opening = mode === "opening";
  const duration = reduceMotion ? 0.16 : opening ? 1.25 : 1.3;

  return (
    <motion.div
      key={mode}
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: mode === "settling" ? 0 : 1 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.7 }}
    >
      {[0, 1].map((side) => {
        const expanded = side === 0 ? "-102%" : "102%";
        return (
          <motion.div
            key={side}
            className={`door-grain absolute top-0 h-full w-1/2 ${
              side === 0 ? "left-0 border-r border-ember-100/20" : "right-0 border-l border-ember-100/20"
            }`}
            initial={{ x: mode === "closing" ? expanded : "0%" }}
            animate={{ x: opening ? expanded : "0%" }}
            transition={{
              duration,
              delay: opening && !reduceMotion ? 0.16 : 0,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            <div className="absolute inset-[11%] rounded-2xl border border-white/[0.06]" />
            <div className="absolute inset-[19%] rounded-2xl border border-white/[0.04]" />
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-100/25 shadow-glow-sm" />
          </motion.div>
        );
      })}

      <motion.div
        className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-ember-100"
        initial={{ opacity: opening ? 1 : 0, scaleX: opening ? 1 : 14 }}
        animate={{ opacity: opening ? 0 : 1, scaleX: opening ? 14 : 1 }}
        transition={{ duration: reduceMotion ? 0.14 : 1.15, ease: "easeOut" }}
        style={{ boxShadow: "0 0 60px 22px rgba(232,168,124,0.5)" }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: mode === "closing" ? 1 : 0, y: 0 }}
        transition={{ duration: reduceMotion ? 0.12 : 0.6, delay: mode === "closing" ? 0.35 : 0 }}
      >
        <span className="font-display text-lg tracking-widest text-ember-100">门合上了</span>
      </motion.div>
    </motion.div>
  );
}
