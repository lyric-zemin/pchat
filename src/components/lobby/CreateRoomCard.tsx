"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Copy, DoorOpen, PencilLine, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { generateCode, validateCode } from "@/lib/peer/code";
import { useRoomStore } from "@/lib/store";
import { copyText } from "@/lib/utils";

export default function CreateRoomCard() {
  const [code, setCode] = useState("");
  const [custom, setCustom] = useState(false);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const phase = useRoomStore((state) => state.phase);
  const engine = useRoomEngine();
  const busy = phase !== "lobby";
  const check = validateCode(custom ? draft : code);

  useEffect(() => {
    setCode(generateCode());
  }, []);

  const handleCopy = async () => {
    const ok = await copyText(check.code);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const toggleCustom = () => {
    setCustom((prev) => {
      if (!prev) setDraft(code.replace("-", ""));
      return !prev;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="glass glass-hover rounded-4xl p-3 sm:p-5"
    >
      <div className="mb-2 flex items-start justify-between gap-3 sm:mb-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--scene-ink)] sm:text-2xl">
            开一间房
          </h2>
          <p className="mt-1.5 hidden text-sm text-[var(--scene-soft)] sm:block">
            生成一串暗号，递给想见的人。
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--scene-line)] px-3 py-1 text-xs text-[var(--scene-soft)]">
          房主
        </span>
      </div>

      <div className="mb-2 flex min-h-[52px] items-center justify-center rounded-2xl border border-[var(--scene-line)] bg-black/15 px-3 py-2 sm:mb-3 sm:min-h-[68px] sm:px-4 sm:py-3">
        {custom ? (
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value.toUpperCase())}
            placeholder="自己写一个暗号"
            aria-label="自定义暗号"
            maxLength={24}
            autoComplete="off"
            spellCheck={false}
            className="h-12 border-none bg-transparent text-center font-code text-xl tracking-[0.2em] focus:shadow-none"
          />
        ) : (
          <div className="font-code text-xl tracking-[0.16em] text-[var(--scene-ink)] sm:text-2xl md:text-3xl">
            <AnimatePresence mode="wait">
              <motion.span key={code} className="flex items-center">
                {code
                  .replace("-", "")
                  .split("")
                  .map((char, index) => (
                    <motion.span
                      key={`${code}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.42 }}
                      className={index === 3 ? "ml-2.5 text-ember-100" : undefined}
                    >
                      {char}
                    </motion.span>
                  ))}
              </motion.span>
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mb-2 flex items-center gap-1 sm:mb-3">
        <Button
          variant="ghost"
          size="sm"
          className="px-2 sm:px-4"
          onClick={() => setCode(generateCode())}
          disabled={custom || busy}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          换一个
        </Button>
        <Button variant="ghost" size="sm" className="px-2 sm:px-4" onClick={toggleCustom} disabled={busy}>
          <PencilLine className="h-3.5 w-3.5" />
          {custom ? "用生成的" : "自己写"}
        </Button>
        <span className="flex-1" />
        <Tooltip label={copied ? "已复制" : "复制暗号"} className="shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            disabled={!check.ok}
            aria-label="复制暗号"
          >
            {copied ? <Check className="h-4 w-4 text-moss" /> : <Copy className="h-4 w-4" />}
          </Button>
        </Tooltip>
      </div>

      <Button
        size="lg"
        className="h-12 w-full"
        disabled={!check.ok || busy}
        onClick={() => void engine.createRoom(check.code)}
      >
        <DoorOpen className="h-4 w-4" />
        开门进去
        <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="mt-1.5 hidden min-h-[18px] text-center text-xs text-[var(--scene-soft)] sm:block">
        {!code ? "正在生成暗号…" : (check.hint ?? "房间会一直亮着，等对方凭暗号敲门。")}
      </p>
    </motion.div>
  );
}
