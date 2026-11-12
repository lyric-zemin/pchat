"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import RoomScene from "@/components/room/RoomScene";
import TimeDial from "@/components/room/TimeDial";
import { useRoomStore } from "@/lib/store";
import { PHASES } from "@/lib/time/phases";
import { cn } from "@/lib/utils";
import CreateRoomCard from "./CreateRoomCard";
import JoinRoomCard from "./JoinRoomCard";
import TopBar from "./TopBar";

type LobbyTab = "create" | "join";

export default function LobbyView() {
  const [tab, setTab] = useState<LobbyTab>("create");
  const scenePhase = useRoomStore((state) => state.scenePhase);
  const theme = PHASES[scenePhase];

  return (
    <section className="app-screen relative w-full">
      <RoomScene />
      <TopBar />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-start px-4 pb-[calc(5.5rem+var(--safe-bottom))] pt-[calc(4.5rem+var(--safe-top))] sm:justify-center sm:px-8 sm:pb-36 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-2 flex items-center gap-3 text-xs tracking-[0.18em] text-[var(--stage-soft)]">
            <span className="h-px w-8 bg-ember-100/70" />
            <span>
              {theme.label} · {theme.window}
            </span>
          </div>
          <h1 className="font-display text-[clamp(2rem,5.4vw,4.2rem)] font-semibold leading-[1.08] tracking-tight text-[var(--stage-ink)]">
            凭暗号赴约
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--stage-soft)] sm:hidden">
            生成暗号，和一个人视频相见。
          </p>
          <p className="mt-3 hidden max-w-xl text-[15px] leading-6 text-[var(--stage-soft)] sm:block">
            {theme.line} 生成一串暗号递给那个人，门只为两个人开。可以视频、写字、
            一起把灯调暗，窗外的天色会随时间慢慢变。
          </p>
        </motion.div>

        {/* 窄屏两个入口同时可见，点标签切换表单；桌面仍是并排双卡。 */}
        <div className="mb-3 mt-4 flex gap-2 md:hidden" role="tablist" aria-label="选择进入方式">
          {(
            [
              ["create", "开一间房"],
              ["join", "凭暗号赴约"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "glass h-11 flex-1 rounded-full text-sm font-medium transition-colors duration-300",
                tab === key
                  ? "border-ember-100/60 text-[var(--scene-ink)]"
                  : "text-[var(--scene-soft)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid items-start gap-3 sm:mt-6 sm:gap-5 md:grid-cols-2">
          <div className={cn(tab === "create" ? "block" : "hidden", "md:block")}>
            <CreateRoomCard />
          </div>
          <div className={cn(tab === "join" ? "block" : "hidden", "md:block")}>
            <JoinRoomCard />
          </div>
        </div>
      </div>

      <footer className="safe-inset-x fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(0.75rem+var(--safe-bottom))] sm:px-8">
        <div className="glass mx-auto flex max-w-6xl items-center gap-3 rounded-full px-2 py-1.5 sm:px-5">
          <div className="hidden min-w-0 flex-1 items-center gap-2 text-xs text-[var(--scene-soft)] sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">端到端直连 · 消息不留存 · 摄像头需要 HTTPS 或 localhost</span>
          </div>
          <div className="min-w-0 flex-1 sm:flex-none">
            <TimeDial variant="lobby" className="w-full justify-between sm:w-auto" />
          </div>
        </div>
      </footer>
    </section>
  );
}
