"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { validateCode } from "@/lib/peer/code";
import { useRoomStore } from "@/lib/store";

export default function JoinRoomCard() {
  const [raw, setRaw] = useState("");
  const [knocking, setKnocking] = useState(false);
  const phase = useRoomStore((state) => state.phase);
  const engine = useRoomEngine();
  const busy = phase !== "lobby";
  const check = validateCode(raw);
  const touched = raw.trim().length > 0;
  const invalid = touched && !check.ok;
  const hint = !touched
    ? "不分大小写，空格和连字符会自动忽略。"
    : (check.hint ?? "门里有人应了，视频就会自己接上。");

  const join = () => {
    if (!check.ok || busy) return;
    setKnocking(true);
    void engine.joinRoom(check.code);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="glass glass-hover rounded-4xl p-4 sm:p-5 md:translate-y-8"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--scene-ink)]">凭暗号赴约</h2>
          <p className="mt-1.5 text-sm text-[var(--scene-soft)]">把对方给你的暗号敲进门里。</p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--scene-line)] px-3 py-1 text-xs text-[var(--scene-soft)]">
          来客
        </span>
      </div>

      <div className="relative">
        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--scene-soft)]" />
        <Input
          value={raw}
          onChange={(event) => setRaw(event.target.value.toUpperCase())}
          onKeyDown={(event) => {
            if (event.key === "Enter") join();
          }}
          placeholder="输入暗号，例如 KRM-7Q2"
          aria-label="房间暗号"
          maxLength={24}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="pl-11 font-code text-base tracking-[0.2em]"
        />
      </div>

      <div className="mt-2.5 flex min-h-[46px] items-start">
        <p className={`text-xs leading-5 ${invalid ? "text-clay" : "text-[var(--scene-soft)]"}`}>
          {hint}
        </p>
      </div>

      <Button
        size="lg"
        variant="outline"
        className="h-12 w-full"
        disabled={!check.ok || busy}
        onClick={join}
      >
        <motion.span
          animate={knocking ? { rotate: [0, -12, 12, -8, 0] } : { rotate: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex"
        >
          <KeyRound className="h-4 w-4" />
        </motion.span>
        敲门进去
        <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="mt-2 min-h-[18px] text-center text-xs text-[var(--scene-soft)]">
        门里有人应了，视频就会自己接上。
      </p>
    </motion.div>
  );
}
