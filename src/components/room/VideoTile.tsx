"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
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

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (element.srcObject !== stream) element.srcObject = stream;
    void element.play().catch(() => undefined);
  }, [stream]);

  return (
    <div className={cn("h-full w-full", mirror && "scale-x-[-1]", className)}>
      <motion.video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        initial={{ opacity: 0, scale: 1.06, filter: "blur(14px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
