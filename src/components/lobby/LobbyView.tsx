"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import RoomScene from "@/components/room/RoomScene";
import TimeDial from "@/components/room/TimeDial";
import { useRoomStore } from "@/lib/store";
import { PHASES } from "@/lib/time/phases";
import CreateRoomCard from "./CreateRoomCard";
import JoinRoomCard from "./JoinRoomCard";
import TopBar from "./TopBar";

export default function LobbyView() {
  const scenePhase = useRoomStore((state) => state.scenePhase);
  const theme = PHASES[scenePhase];

  return (
    <section className="relative min-h-screen w-full">
      <RoomScene />
      <TopBar />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 pb-36 pt-24 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-3 flex items-center gap-3 text-xs tracking-[0.18em] text-[var(--stage-soft)]">
            <span className="h-px w-8 bg-ember-100/70" />
            <span>
              {theme.label} · {theme.window}
            </span>
          </div>
          <h1 className="font-display text-[clamp(2.5rem,5.4vw,4.2rem)] font-semibold leading-[1.08] tracking-tight text-[var(--stage-ink)]">
            凭暗号赴约
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-6 text-[var(--stage-soft)]">
            {theme.line} 生成一串暗号递给那个人，门只为两个人开。可以视频、写字、
            一起把灯调暗，窗外的天色会随时间慢慢变。
          </p>
        </motion.div>

        <div className="mt-6 grid items-start gap-5 md:grid-cols-2">
          <CreateRoomCard />
          <JoinRoomCard />
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-20 px-4 pb-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 rounded-full border border-white/10 bg-midnight-900/65 px-4 py-2 backdrop-blur-xl sm:flex-row sm:justify-between sm:px-5">
          <div className="order-2 flex items-center gap-2 text-xs text-[var(--scene-soft)] sm:order-1">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>端到端直连 · 消息不留存 · 摄像头需要 HTTPS 或 localhost</span>
          </div>
          <div className="order-1 sm:order-2">
            <TimeDial variant="lobby" />
          </div>
        </div>
      </footer>
    </section>
  );
}
