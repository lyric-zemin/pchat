"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  RefreshCw,
  SlidersHorizontal,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { useRoomStore } from "@/lib/store";

export type PanelKey = "chat" | "atmosphere";

interface ControlBarProps {
  onOpenPanel: (panel: PanelKey) => void;
  activePanel: PanelKey | null;
}

export default function ControlBar({ onOpenPanel, activePanel }: ControlBarProps) {
  const [confirming, setConfirming] = useState(false);
  const micOn = useRoomStore((state) => state.micOn);
  const camOn = useRoomStore((state) => state.camOn);
  const soundOff = useRoomStore((state) => state.soundOff);
  const phase = useRoomStore((state) => state.phase);
  const { localStream, toggleMic, toggleCam, toggleSound, leaveRoom, switchCamera, canSwitchCamera } =
    useRoomEngine();
  const hasAudio = Boolean(localStream?.getAudioTracks().length);
  const hasVideo = Boolean(localStream?.getVideoTracks().length);
  const leaving = phase === "leaving";

  return (
    <div className="safe-inset-x pointer-events-none fixed inset-x-0 bottom-0 z-30 px-2 pb-[calc(0.75rem+var(--safe-bottom))] sm:px-8 sm:pb-[calc(1rem+var(--safe-bottom))] landscapeShort:bottom-auto landscapeShort:left-auto landscapeShort:right-0 landscapeShort:top-[calc(4.5rem+var(--safe-top))] landscapeShort:w-[76px] landscapeShort:px-0">
      <div className="glass pchat-scroll pointer-events-auto mx-auto flex h-[72px] max-w-xl items-center justify-center gap-1 rounded-full px-2 sm:gap-2 sm:px-5 landscapeShort:h-auto landscapeShort:max-h-[calc(100dvh-6rem)] landscapeShort:flex-col landscapeShort:gap-1 landscapeShort:overflow-y-auto landscapeShort:p-2">
        <Tooltip label={micOn ? "关掉麦克风" : "打开麦克风"}>
          <Button
            variant={micOn ? "quiet" : "danger"}
            size="icon"
            onClick={toggleMic}
            disabled={!hasAudio || leaving}
            aria-label={micOn ? "关掉麦克风" : "打开麦克风"}
          >
            {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
        </Tooltip>

        <Tooltip label={camOn ? "关掉摄像头" : "打开摄像头"}>
          <Button
            variant={camOn ? "quiet" : "danger"}
            size="icon"
            onClick={toggleCam}
            disabled={!hasVideo || leaving}
            aria-label={camOn ? "关掉摄像头" : "打开摄像头"}
          >
            {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
        </Tooltip>

        <Tooltip label="切换前后摄像头">
          <Button
            variant="quiet"
            size="icon"
            onClick={switchCamera}
            disabled={!hasVideo || !canSwitchCamera || leaving}
            aria-label="切换前后摄像头"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </Tooltip>

        <Tooltip label={soundOff ? "打开提示音" : "静音提示音"} className="hidden sm:inline-flex">
          <Button
            variant="quiet"
            size="icon"
            onClick={toggleSound}
            aria-label={soundOff ? "打开提示音" : "静音提示音"}
          >
            {soundOff ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </Tooltip>

        <span className="mx-0.5 hidden h-6 w-px bg-[var(--scene-line)] sm:block" />

        <div className="flex gap-1 lg:hidden">
          <Button
            variant={activePanel === "chat" ? "outline" : "quiet"}
            size="icon"
            onClick={() => onOpenPanel("chat")}
            aria-label="打开聊天"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant={activePanel === "atmosphere" ? "outline" : "quiet"}
            size="icon"
            onClick={() => onOpenPanel("atmosphere")}
            aria-label="打开氛围设置"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative landscapeShort:order-first">
          <AnimatePresence>
            {confirming && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="glass-deep absolute bottom-full right-0 mb-4 w-64 max-w-[calc(100vw-2rem)] rounded-2xl p-4 text-center landscapeShort:bottom-auto landscapeShort:right-full landscapeShort:top-0 landscapeShort:mb-0 landscapeShort:mr-3"
              >
                <p className="font-display text-base text-cream">要走了吗？</p>
                <p className="mt-1.5 text-xs leading-5 text-cream/60">
                  灯会灭掉，门合上后这间房就散了。
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="quiet" size="sm" className="flex-1" onClick={() => setConfirming(false)}>
                    再聊会儿
                  </Button>
                  <Button variant="danger" size="sm" className="flex-1" onClick={() => leaveRoom("manual")}>
                    熄灯离开
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="danger"
              size="icon"
              disabled={leaving}
              onClick={() => setConfirming((value) => !value)}
              aria-label="离开房间"
              className="h-11 w-14 rounded-full"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
