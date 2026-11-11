"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { useRoomStore } from "@/lib/store";
import { cn, formatClock } from "@/lib/utils";

const QUICK_REPLIES = ["☕", "🌙", "👋", "❤️", "😂", "✨", "🔥", "🍵"];

export default function ChatPanel({ className }: { className?: string }) {
  const messages = useRoomStore((state) => state.messages);
  const peerTyping = useRoomStore((state) => state.peerTyping);
  const engine = useRoomEngine();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<number | null>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [messages.length, peerTyping]);

  useEffect(
    () => () => {
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    },
    [],
  );

  const handleChange = (value: string) => {
    setDraft(value);
    engine.sendTyping(true);
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => engine.sendTyping(false), 1400);
  };

  const submit = () => {
    if (!draft.trim()) return;
    engine.sendChat(draft);
    setDraft("");
    engine.sendTyping(false);
  };

  return (
    <section className={cn("glass-deep flex h-full min-h-0 flex-col rounded-4xl", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
        <h3 className="font-display text-base font-semibold text-[var(--scene-ink)]">说点什么</h3>
        <span className="text-[11px] text-[var(--scene-soft)]">只在这间房里</span>
      </div>

      <div ref={scrollRef} className="pchat-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="font-display text-base text-cream/70">屋子还安静着</p>
            <p className="text-xs leading-5 text-cream/45">可以先递一个表情过去。</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) =>
            message.kind === "system" ? (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 py-1"
              >
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] text-cream/45">{message.text}</span>
                <span className="h-px flex-1 bg-white/10" />
              </motion.div>
            ) : (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 14, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className={cn("flex", message.from === "me" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-6",
                    message.kind === "emoji" ? "text-2xl" : "text-sm",
                    message.from === "me"
                      ? "rounded-br-md bg-gradient-to-br from-ember-100 to-ember-300 text-midnight-900"
                      : "glass rounded-bl-md text-cream",
                  )}
                >
                  {message.text}
                  {message.kind !== "emoji" && (
                    <div
                      className={cn(
                        "mt-1 font-code text-[10px]",
                        message.from === "me" ? "text-midnight-900/50" : "text-cream/45",
                      )}
                    >
                      {formatClock(message.at)}
                    </div>
                  )}
                </div>
              </motion.div>
            ),
          )}
        </AnimatePresence>

        <AnimatePresence>
          {peerTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 pl-1 text-xs text-cream/55"
            >
              <span>对方正在输入</span>
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1 w-1 rounded-full bg-ember-100"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.16 }}
                  />
                ))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/[0.08] px-4 pb-4 pt-3">
        <div className="mb-3 flex flex-wrap gap-1">
          {QUICK_REPLIES.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`发送 ${emoji}`}
              onClick={() => engine.sendEmoji(emoji)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-base transition-all duration-300 hover:scale-125 hover:bg-white/10 active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(event) => handleChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
            placeholder="写一句给对方…"
            aria-label="聊天内容"
            maxLength={500}
          />
          <Button size="icon" onClick={submit} disabled={!draft.trim()} aria-label="发送消息">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
