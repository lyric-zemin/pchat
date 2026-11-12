"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoTileProps {
  stream: MediaStream;
  muted?: boolean;
  mirror?: boolean;
  className?: string;
}

/** MediaStream 通过 ref 直挂 srcObject，不进入 React 状态。 */
export default function VideoTile({ stream, muted = false, mirror = false, className }: VideoTileProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);

  const attach = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    if (element.srcObject !== stream) element.srcObject = stream;
    void element
      .play()
      .then(() => setBlocked(false))
      .catch(() => setBlocked(true));
  }, [stream]);

  useEffect(() => {
    attach();
    // 切后台/来电回来后浏览器可能暂停了视频，重新挂流并播放。
    const onVisible = () => {
      if (document.visibilityState === "visible") attach();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [attach]);

  return (
    <div className={cn("relative h-full w-full", mirror && "scale-x-[-1]", className)}>
      <motion.video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full object-cover"
      />
      {blocked && (
        <button
          type="button"
          onClick={attach}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-midnight-900/75 text-cream"
          aria-label="点按播放画面与声音"
        >
          <Play className="h-7 w-7 text-ember-100" />
          <span className="text-xs">点按播放</span>
        </button>
      )}
    </div>
  );
}
