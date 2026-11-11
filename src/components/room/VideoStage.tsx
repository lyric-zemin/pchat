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
    <div className="window-frame relative aspect-[16/10] w-full overflow-hidden rounded-4xl bg-midnight-900/70">
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
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-ember-100/25 bg-ember-100/[0.07]">
              <span className="absolute inset-0 animate-breathe rounded-full bg-ember-100/20 blur-xl" />
              {remoteReady ? (
                <VideoOff className="relative h-7 w-7 text-ember-100/80" />
              ) : (
                <Wifi className="relative h-7 w-7 text-ember-100/80" />
              )}
            </div>
            <div>
              <p className="font-display text-xl text-cream">
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
              <p className="mt-2 text-sm leading-6 text-cream/55">
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

      {/* 远端画面上的状态角标 */}
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-cream/85">
          <span className={`h-1.5 w-1.5 rounded-full ${remoteReady ? "bg-moss" : "bg-honey"}`} />
          {remoteReady ? "在线" : "等待中"}
        </span>
        {remoteReady && !peerMedia.mic && (
          <span className="glass flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs text-cream/80">
            <MicOff className="h-3 w-3" />
            对方已静音
          </span>
        )}
      </div>

      {/* 本地小窗 */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-4 right-4 w-[27%] min-w-[112px] max-w-[210px] overflow-hidden rounded-2xl border border-ember-100/25 bg-midnight-900/80 shadow-glass"
      >
        <div className="aspect-[4/3] w-full">
          {hasLocalVideo ? (
            <VideoTile stream={localStream} muted mirror />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
              <VideoOff className="h-5 w-5 text-ember-100/70" />
              <span className="text-[11px] text-cream/60">仅观看</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5">
          <span className="text-[11px] text-cream/70">你</span>
          {!micOn && <MicOff className="h-3 w-3 text-clay" />}
        </div>
      </motion.div>

      {mediaNote && (
        <div className="absolute bottom-20 left-4 max-w-[42%] rounded-xl border border-white/10 bg-midnight-900/65 px-3 py-2 text-xs leading-5 text-cream/70 backdrop-blur-md">
          {mediaNote}
        </div>
      )}
    </div>
  );
}
