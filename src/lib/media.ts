"use client";

import { describeMediaError } from "@/lib/peer/errors";

export type FacingMode = "user" | "environment";

export const DEFAULT_FACING: FacingMode = "user";

export const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 24, max: 30 },
    facingMode: "user",
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

function constraintsFor(facing: FacingMode): MediaStreamConstraints {
  return {
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: 24, max: 30 },
      facingMode: { ideal: facing },
    },
    audio: MEDIA_CONSTRAINTS.audio,
  };
}

export interface MediaResult {
  stream: MediaStream | null;
  note: string | null;
  hasVideo: boolean;
  hasAudio: boolean;
}

async function attempt(constraints: MediaStreamConstraints): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      // 降级是预期路径，不用 error 级别，避免开发面板误报。
      console.info("[pchat] 媒体设备未就绪，已自动降级:", (error as Error)?.name);
    }
    return null;
  }
}

/**
 * 依次降级：完整音视频 → 仅声音 → 仅画面 → 纯文字。
 * 任一级失败都不抛错，房间依然可以进入。
 * facing 用于手机前后摄像头切换，桌面设备会忽略该 ideal 约束。
 */
export async function acquireLocalMedia(
  facing: FacingMode = DEFAULT_FACING,
): Promise<MediaResult> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return {
      stream: null,
      note: describeMediaError().detail,
      hasVideo: false,
      hasAudio: false,
    };
  }

  const constraints = constraintsFor(facing);
  const full = await attempt(constraints);
  if (full) {
    return { stream: full, note: null, hasVideo: true, hasAudio: true };
  }

  const audioOnly = await attempt({ audio: MEDIA_CONSTRAINTS.audio, video: false });
  if (audioOnly) {
    return {
      stream: audioOnly,
      note: "没打开摄像头，对方暂时只能听见你。",
      hasVideo: false,
      hasAudio: true,
    };
  }

  const videoOnly = await attempt({ video: constraints.video, audio: false });
  if (videoOnly) {
    return {
      stream: videoOnly,
      note: "麦克风被占用了，对方暂时听不到你。",
      hasVideo: true,
      hasAudio: false,
    };
  }

  return {
    stream: null,
    note: "摄像头和麦克风都没打开，房间里还能用文字和氛围聊天。",
    hasVideo: false,
    hasAudio: false,
  };
}

export function stopStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    if (track.readyState !== "ended") track.stop();
  });
}

export function setTrackEnabled(stream: MediaStream | null, kind: "audio" | "video", enabled: boolean) {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    if (track.kind === kind) track.enabled = enabled;
  });
}
