"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { useRoomStore } from "@/lib/store";
import AtmospherePanel from "./AtmospherePanel";
import ChatPanel from "./ChatPanel";
import ControlBar, { type PanelKey } from "./ControlBar";
import PresenceFeedback from "./PresenceFeedback";
import RoomScene from "./RoomScene";
import RoomTopBar from "./RoomTopBar";
import TimeDial from "./TimeDial";
import VideoStage from "./VideoStage";

export default function RoomView() {
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const phase = useRoomStore((state) => state.phase);
  const error = useRoomStore((state) => state.error);
  const engine = useRoomEngine();
  const dimmed = phase === "entering" || phase === "leaving";

  return (
    <section className="relative min-h-screen w-full">
      <RoomScene dimmed={dimmed} />
      <RoomTopBar />
      <PresenceFeedback />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 pb-28 pt-24 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-4">
            <VideoStage />
            <div className="flex justify-center md:hidden">
              <TimeDial variant="room" />
            </div>
          </div>

          <aside className="hidden flex-col gap-4 lg:flex" style={{ height: "min(80vh, 800px)" }}>
            <div className="min-h-0 flex-1">
              <ChatPanel />
            </div>
            <AtmospherePanel />
          </aside>
        </div>
      </div>

      {/* 窄屏：聊天与氛围收进底部抽屉 */}
      <AnimatePresence>
        {panel && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-40 bg-midnight-900/65 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanel(null)}
            />
            <motion.div
              key="sheet"
              className="glass-deep fixed inset-x-0 bottom-0 z-50 flex h-[70vh] flex-col rounded-t-4xl p-3"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="mb-2 flex items-center justify-between px-2 py-1">
                <span className="font-display text-base text-cream">
                  {panel === "chat" ? "说点什么" : "一起调这间屋"}
                </span>
                <Button variant="ghost" size="icon" onClick={() => setPanel(null)} aria-label="关闭面板">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-h-0 flex-1">
                {panel === "chat" ? (
                  <ChatPanel />
                ) : (
                  <AtmospherePanel className="h-full overflow-y-auto" />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 连接失败：给出具体原因与可恢复的下一步 */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="fixed inset-0 z-[55] flex items-center justify-center px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-midnight-900/72 backdrop-blur-sm" />
            <motion.div
              className="glass-deep relative w-full max-w-sm rounded-4xl p-7 text-center"
              initial={{ y: 24, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-clay/40 bg-clay/15">
                <AlertCircle className="h-5 w-5 text-clay" />
              </div>
              <h3 className="font-display text-xl text-cream">{error.title}</h3>
              <p className="mt-3 text-sm leading-6 text-cream/65">{error.detail}</p>
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useRoomStore.getState().setError(null)}
                >
                  再等等
                </Button>
                <Button size="sm" onClick={() => engine.leaveRoom("error")}>
                  回到门前
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ControlBar onOpenPanel={setPanel} activePanel={panel} />
    </section>
  );
}
