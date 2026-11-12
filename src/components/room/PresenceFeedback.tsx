"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useRoomStore } from "@/lib/store";
import { copyText } from "@/lib/utils";

/** 敲门、亮灯、对方到场、离场与断线的可读状态反馈。 */
export default function PresenceFeedback() {
  const notice = useRoomStore((state) => state.notice);
  const phase = useRoomStore((state) => state.phase);
  const role = useRoomStore((state) => state.role);
  const code = useRoomStore((state) => state.code);
  const [copied, setCopied] = useState(false);
  const waiting = phase === "waiting" || phase === "entering" || phase === "leaving";

  const handleCopy = async () => {
    const ok = await copyText(code);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(5.5rem+var(--safe-top))] z-20 flex justify-center px-4 sm:top-[calc(6rem+var(--safe-top))] landscapeShort:justify-end landscapeShort:pr-[6rem]">
      <AnimatePresence mode="wait">
        {notice && (
          <motion.div
            key={notice}
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="glass-deep pointer-events-auto flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-center sm:gap-2 sm:px-5 sm:py-3.5 landscapeShort:gap-1 landscapeShort:px-4 landscapeShort:py-1.5"
          >
            <div className="flex items-center gap-2 text-xs text-cream sm:gap-2.5 sm:text-sm">
              {waiting && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-100 opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-ember-100" />
                </span>
              )}
              {notice}
            </div>
            {phase === "waiting" && role === "host" && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label="复制暗号"
                className="flex min-h-[44px] items-center gap-2 rounded-xl border border-ember-100/30 bg-ember-100/10 px-3 font-code text-sm tracking-[0.2em] text-ember-100 transition-colors hover:bg-ember-100/20 sm:text-base"
              >
                {code}
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5 opacity-70" />}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
