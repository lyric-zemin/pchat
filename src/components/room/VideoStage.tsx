"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MicOff, VideoOff, Wifi } from "lucide-react";
import { useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { useRoomStore } from "@/lib/store";
import VideoTile from "./VideoTile";

export default function VideoStage() {
  const { localStream, remoteStream } = useRoomEngine();
  const remoteReady = useRoomStore((state) => state.remoteReady);
  const phase = useRoomStore((state) => state.phase);
  const role = useRoomStore((state) => state.role);
  const camOn = useRoomStore((state) => state.camOn);
  const micOn = useRoomStore((state) => state.micOn);
  const peerMedia = useRoomStore((state) => state.peerMedia);
  const mediaNote = useRoomStore((state) => state.mediaNote);
  const code = useRoomStore((state) => state.code);

  const waiting = phase === "waiting" || phase === "entering";
  const hasRemoteVideo = remoteReady && remoteStream && peerMedia.cam;
  const hasLocalVideo = localStream && camOn && localStream.getVideoTracks().length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="window-frame relative min-h-0 flex-1 overflow-hidden rounded-4xl bg-midnight-900/70">
        <AnimatePresence mode="wait">
          {hasRemoteVideo ? (
            <motion.div
              key="remote"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              <VideoTile stream={remoteStream} />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-ember-100/25 bg-ember-100/[0.07] sm:h-20 sm:w-20">
                <span className="absolute inset-0 animate-breathe rounded-full bg-ember-100/20 blur-xl" />
                {remoteReady ? (
                  <VideoOff className="relative h-6 w-6 text-ember-100/80 sm:h-7 sm:w-7" />
                ) : (
                  <Wifi className="relative h-6 w-6 text-ember-100/80 sm:h-7 sm:w-7" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg text-cream sm:text-xl">
                  {remoteReady || !peerMedia.cam
                    ? "对方关着摄像头"
                    : waiting
                      ? role === "host"
                        ? "屋里还只有你一个人"
                        : "门里还没人应声"
                      : hasLocalVideo
                        ? "正在接通画面…"
                        : "这间房里先用文字聊吧"}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-cream/55 sm:text-sm sm:leading-6">
                  {remoteReady || !peerMedia.cam
                    ? "还能听见声音，也能继续写字聊天。"
                    : waiting && role === "host"
                      ? `把暗号 ${code} 发给对方，门会为他打开。`
                      : hasLocalVideo
                        ? "稍等一下，光正在慢慢亮起来。"
                        : "两边都没打开摄像头，消息、灯光和天色照常同步。"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 状态信息外置到画面下方，不再与占位文案、本地小窗互相压盖。 */}
      <div className="flex shrink-0 flex-col gap-1.5 px-1 landscapeShort:flex-row landscapeShort:items-center landscapeShort:gap-2">
        <div className="flex items-center gap-2 landscapeShort:shrink-0">
          <span className="glass flex min-h-[28px] items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-cream/85">
            <span className={`h-1.5 w-1.5 rounded-full ${remoteReady ? "bg-moss" : "bg-honey"}`} />
            {remoteReady ? "在线" : "等待中"}
          </span>
          {remoteReady && !peerMedia.mic && (
            <span className="glass flex min-h-[28px] items-center gap-1 rounded-full px-2.5 py-1 text-xs text-cream/80">
              <MicOff className="h-3 w-3" />
              对方已静音
            </span>
          )}
          <span className="flex-1" />

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/3] w-[72px] shrink-0 overflow-hidden rounded-xl border border-ember-100/25 bg-midnight-900/80 shadow-glass sm:w-[88px]"
          >
            {hasLocalVideo ? (
              <VideoTile stream={localStream} muted mirror />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                <VideoOff className="h-4 w-4 text-ember-100/70" />
                <span className="text-[10px] text-cream/60">仅观看</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-midnight-900/70 px-1.5 py-0.5">
              <span className="text-[10px] text-cream/70">你</span>
              {!micOn && <MicOff className="h-2.5 w-2.5 text-clay" />}
            </div>
          </motion.div>
        </div>

        {mediaNote && (
          <p className="rounded-xl border border-white/10 bg-midnight-900/45 px-3 py-1.5 text-xs leading-5 text-cream/70 landscapeShort:flex-1 landscapeShort:py-1">
            {mediaNote}
          </p>
        )}
      </div>
    </div>
  );
}
