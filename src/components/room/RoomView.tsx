"use client";

import { useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { useRoomStore } from "@/lib/store";
import { useVisualViewport } from "@/lib/viewport/useVisualViewport";
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
  const dragControls = useDragControls();
  const viewport = useVisualViewport();

  return (
    <section className="app-screen relative w-full">
      <RoomScene dimmed={dimmed} />
      <RoomTopBar />
      <PresenceFeedback />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[1440px] flex-col px-4 pb-[calc(6.5rem+var(--safe-bottom))] pt-[calc(5.5rem+var(--safe-top))] sm:px-8 sm:pt-[calc(6rem+var(--safe-top))] lg:min-h-[max(100dvh,700px)] landscapeShort:pb-[calc(1rem+var(--safe-bottom))] landscapeShort:pr-[calc(5.5rem+var(--safe-right))]">
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-h-0 min-w-0 flex-col gap-3">
            <div className="max-h-[52dvh] min-h-[220px] flex-1 lg:max-h-[720px] landscapeShort:max-h-[calc(100dvh-6rem)] landscapeShort:min-h-0">
              <VideoStage />
            </div>
            <div className="flex justify-center md:hidden landscapeShort:hidden">
              <TimeDial variant="room" />
            </div>
          </div>

          <aside className="hidden min-h-0 flex-col gap-4 lg:flex">
            <div className="min-h-0 flex-1">
              <ChatPanel />
            </div>
            <AtmospherePanel />
          </aside>
        </div>
      </div>

      {/* 窄屏：聊天与氛围收进底部抽屉；遮罩与抽屉都让出底部控制栏，挂断随时可达。 */}
      <AnimatePresence>
        {panel && (
          <>
            <motion.div
              key="scrim"
              className="fixed left-0 right-0 top-0 z-40 bg-midnight-900/65 backdrop-blur-sm"
              style={{
                bottom: `calc(6rem + var(--safe-bottom) + ${viewport.keyboardInset}px)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanel(null)}
            />
            <motion.div
              key="sheet"
              className="glass-deep app-sheet fixed left-0 right-0 z-50 flex max-h-[calc(100dvh-7rem)] flex-col rounded-t-4xl p-3 pb-[calc(0.75rem+var(--safe-bottom))]"
              style={{
                bottom: `calc(6rem + var(--safe-bottom) + ${viewport.keyboardInset}px)`,
                maxHeight: viewport.height
                  ? `min(${viewport.height}px, calc(100dvh - 7rem))`
                  : undefined,
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (info.offset.y > 110 || info.velocity.y > 700) setPanel(null);
              }}
            >
              <div
                className="drawer-handle flex h-8 shrink-0 cursor-grab items-center justify-center active:cursor-grabbing"
                onPointerDown={(event) => dragControls.start(event)}
                aria-hidden="true"
              >
                <span className="h-1.5 w-10 rounded-full bg-white/25" />
              </div>
              <div className="mb-2 flex shrink-0 items-center justify-between px-2">
                <span className="text-xs text-cream/45">下拉收起 · {panel === "chat" ? "聊天" : "氛围"}</span>
                <Button variant="ghost" size="icon" onClick={() => setPanel(null)} aria-label="关闭面板">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-h-0 flex-1">
                {panel === "chat" ? (
                  <ChatPanel />
                ) : (
                  <AtmospherePanel className="h-full overflow-y-auto pchat-scroll" />
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
              className="glass-deep relative max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-4xl p-6 text-center sm:p-7"
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
