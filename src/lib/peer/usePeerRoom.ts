"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DataConnection, MediaConnection, Peer } from "peerjs";
import { getSoundOff, playCue, releaseAudio, setSoundOff } from "@/lib/audio/cues";
import { acquireLocalMedia, setTrackEnabled, stopStream } from "@/lib/media";
import { useRoomStore } from "@/lib/store";
import { currentPhase } from "@/lib/time/phases";
import { randomId } from "@/lib/utils";
import type { AtmosphereKey, TimePhase, Weather } from "@/types/room";
import { deriveHostId, normalizeCode, randomGuestId } from "./code";
import { getPeerConfig } from "./config";
import { describeJoinTimeout, describePeerError } from "./errors";
import { createMessageHandler, systemMessage } from "./handlers";
import type { RoomMessage } from "./protocol";

export interface RoomEngine {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  createRoom: (code: string) => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  leaveRoom: (reason?: "manual" | "error") => void;
  sendChat: (text: string) => void;
  sendEmoji: (emoji: string) => void;
  sendTyping: (active: boolean) => void;
  sendAtmosphere: (key: AtmosphereKey, value: boolean | number | string) => void;
  previewPhase: (phase: TimePhase | null) => void;
  broadcastTime: (phase: TimePhase, auto: boolean) => void;
  toggleMic: () => void;
  toggleCam: () => void;
  toggleSound: () => void;
}

function safe(action: () => void) {
  try {
    action();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[pchat] 清理连接时出错:", error);
    }
  }
}

export function usePeerRoom(): RoomEngine {
  const peerRef = useRef<Peer | null>(null);
  const dataRef = useRef<DataConnection | null>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const localRef = useRef<MediaStream | null>(null);
  const remoteRef = useRef<MediaStream | null>(null);
  const timersRef = useRef<number[]>([]);
  const welcomeTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);
  const lastTypingRef = useRef(0);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const later = useCallback((action: () => void, ms: number) => {
    const id = window.setTimeout(action, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const clearWelcomeTimer = useCallback(() => {
    if (welcomeTimerRef.current !== null) {
      window.clearTimeout(welcomeTimerRef.current);
      welcomeTimerRef.current = null;
    }
  }, []);

  const send = useCallback((message: RoomMessage) => {
    const conn = dataRef.current;
    if (conn?.open) conn.send(message);
  }, []);

  const teardown = useCallback(() => {
    clearTimers();
    clearWelcomeTimer();
    stopStream(localRef.current);
    localRef.current = null;
    setLocalStream(null);
    remoteRef.current = null;
    setRemoteStream(null);
    if (callRef.current) safe(() => callRef.current?.close());
    if (dataRef.current) safe(() => dataRef.current?.close());
    const peer = peerRef.current;
    if (peer && !peer.destroyed) safe(() => peer.destroy());
    callRef.current = null;
    dataRef.current = null;
    peerRef.current = null;
    releaseAudio();
    const state = useRoomStore.getState();
    state.setLocalReady(false);
    state.setRemoteReady(false);
  }, [clearTimers, clearWelcomeTimer]);

  const finishLeave = useCallback(
    (delay: number) => {
      later(() => {
        teardown();
        useRoomStore.getState().reset();
        closingRef.current = false;
      }, delay);
    },
    [later, teardown],
  );

  const handlerRef = useRef<(raw: unknown) => void>(() => undefined);
  handlerRef.current = createMessageHandler({
    send,
    finishLeave,
    clearWelcomeTimer,
    markClosing: () => {
      closingRef.current = true;
    },
    isClosing: () => closingRef.current,
  });

  const onPeerError = useCallback((type: string) => {
    const state = useRoomStore.getState();
    if (state.phase === "lobby" || state.phase === "leaving") return;
    state.setError(describePeerError(type));
    state.setNotice(null);
    if (process.env.NODE_ENV !== "production") {
      console.error("[pchat] 连接错误:", type);
    }
  }, []);

  const attachData = useCallback((conn: DataConnection) => {
    dataRef.current = conn;
    conn.on("data", (raw) => handlerRef.current(raw));
    conn.on("close", () => {
      const state = useRoomStore.getState();
      if (state.phase === "lobby" || state.phase === "leaving" || closingRef.current) return;
      state.setRemoteReady(false);
      state.setError(describePeerError("disconnected"));
      state.setNotice(null);
      state.addMessage(systemMessage("连接断了，屋里只剩你一个人。"));
      playCue("leave");
    });
    conn.on("error", (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error("[pchat] 数据通道出错:", error);
      }
    });
  }, []);

  const attachCall = useCallback((call: MediaConnection) => {
    callRef.current = call;
    call.on("stream", (stream) => {
      remoteRef.current = stream;
      setRemoteStream(stream);
      const state = useRoomStore.getState();
      state.setRemoteReady(true);
      state.setConnection("connected");
      state.setNotice(null);
    });
    call.on("close", () => {
      remoteRef.current = null;
      setRemoteStream(null);
      useRoomStore.getState().setRemoteReady(false);
    });
    call.on("error", () => {
      useRoomStore.getState().setError(describePeerError("webrtc"));
    });
  }, []);

  const prepareMedia = useCallback(async () => {
    const media = await acquireLocalMedia();
    localRef.current = media.stream;
    setLocalStream(media.stream);
    const state = useRoomStore.getState();
    state.setMediaNote(media.note);
    state.setCam(media.hasVideo);
    state.setMic(media.hasAudio);
    state.setLocalReady(Boolean(media.stream));
  }, []);

  const onDisconnected = useCallback((peer: Peer) => {
    const state = useRoomStore.getState();
    if (state.phase === "lobby" || state.phase === "leaving") return;
    state.setNotice("和连接服务断开了，正在试着恢复…");
    const current = peerRef.current ?? peer;
    if (current && !current.destroyed) safe(() => current.reconnect());
  }, []);

  const createRoom = useCallback(
    async (rawCode: string) => {
      teardown();
      closingRef.current = false;
      const code = normalizeCode(rawCode);
      useRoomStore.getState().beginRoom("host", code);

      const { Peer: PeerClient } = await import("peerjs");
      const config = getPeerConfig();
      const hostId = await deriveHostId(code);
      await prepareMedia();

      const peer = new PeerClient(hostId, config.options);
      peerRef.current = peer;

      peer.on("open", () => {
        const state = useRoomStore.getState();
        state.setPhase("waiting");
        state.setConnection("signaling");
        state.setNotice("房间已经点亮，把暗号递给对方吧");
        state.addMessage(systemMessage("你开了灯，窗外的天色正好。"));
        playCue("door");
      });
      peer.on("connection", (conn) => {
        // 一对一守卫：第二个连接只收到「满房」提示，随即关闭。
        if (dataRef.current?.open) {
          conn.on("open", () => {
            conn.send({ type: "room-full" });
            later(() => safe(() => conn.close()), 400);
          });
          return;
        }
        attachData(conn);
      });
      peer.on("call", (call) => {
        if (callRef.current) {
          safe(() => call.close());
          return;
        }
        call.answer(localRef.current ?? undefined);
        attachCall(call);
      });
      peer.on("error", (error) => onPeerError(String(error.type)));
      peer.on("disconnected", () => onDisconnected(peer));
    },
    [teardown, prepareMedia, attachData, attachCall, onPeerError, onDisconnected, later],
  );

  const joinRoom = useCallback(
    async (rawCode: string) => {
      teardown();
      closingRef.current = false;
      const code = normalizeCode(rawCode);
      useRoomStore.getState().beginRoom("guest", code);
      playCue("knock");
      later(() => playCue("knock"), 720);

      const { Peer: PeerClient } = await import("peerjs");
      const config = getPeerConfig();
      const hostId = await deriveHostId(code);
      await prepareMedia();

      const peer = new PeerClient(randomGuestId(), config.options);
      peerRef.current = peer;

      peer.on("open", () => {
        const state = useRoomStore.getState();
        state.setConnection("connecting");
        state.setNotice("门里有动静了…");

        const conn = peer.connect(hostId, { reliable: true });
        attachData(conn);
        conn.on("open", () => {
          const current = useRoomStore.getState();
          current.setPhase("entering");
          send({ type: "hello", nickname: current.nickname });
          welcomeTimerRef.current = later(() => {
            const latest = useRoomStore.getState();
            if (
              latest.phase !== "connected" &&
              latest.phase !== "leaving" &&
              latest.phase !== "lobby"
            ) {
              latest.setError(describeJoinTimeout());
              latest.setNotice(null);
            }
          }, 10_000);
        });

        // 约定只由访客发起呼叫，房主在 peer.on('call') 里应答，避免双方同时拨号。
        if (localRef.current) {
          const call = peer.call(hostId, localRef.current);
          if (call) attachCall(call);
        }
      });
      peer.on("error", (error) => {
        clearWelcomeTimer();
        onPeerError(String(error.type));
      });
      peer.on("disconnected", () => onDisconnected(peer));
    },
    [teardown, prepareMedia, attachData, attachCall, send, later, onPeerError, onDisconnected, clearWelcomeTimer],
  );

  const leaveRoom = useCallback(
    (reason: "manual" | "error" = "manual") => {
      const state = useRoomStore.getState();
      if (state.phase === "lobby" || closingRef.current) return;
      closingRef.current = true;
      clearWelcomeTimer();
      if (reason === "manual") send({ type: "leave", reason: "manual" });
      state.setPhase("leaving");
      state.setNotice(reason === "manual" ? "你把灯关了，门正在合上…" : "正在退出房间…");
      playCue("leave");
      finishLeave(1600);
    },
    [send, finishLeave, clearWelcomeTimer],
  );

  const sendTyping = useCallback(
    (active: boolean) => {
      if (!active) {
        lastTypingRef.current = 0;
        send({ type: "typing", active: false });
        return;
      }
      const now = Date.now();
      if (now - lastTypingRef.current < 300) return;
      lastTypingRef.current = now;
      send({ type: "typing", active: true });
    },
    [send],
  );

  const sendChat = useCallback(
    (text: string) => {
      const trimmed = text.trim().slice(0, 500);
      if (!trimmed) return;
      const message: RoomMessage = { type: "chat", id: randomId(), text: trimmed, at: Date.now() };
      send(message);
      useRoomStore.getState().addMessage({
        id: message.id,
        kind: "chat",
        text: trimmed,
        from: "me",
        at: message.at,
      });
      sendTyping(false);
    },
    [send, sendTyping],
  );

  const sendEmoji = useCallback(
    (emoji: string) => {
      const message: RoomMessage = { type: "emoji", id: randomId(), emoji, at: Date.now() };
      send(message);
      useRoomStore.getState().addMessage({
        id: message.id,
        kind: "emoji",
        text: emoji,
        from: "me",
        at: message.at,
      });
      playCue("message");
      sendTyping(false);
    },
    [send, sendTyping],
  );

  const sendAtmosphere = useCallback(
    (key: AtmosphereKey, value: boolean | number | string) => {
      useRoomStore.getState().setAtmosphere(key, value);
      if (key === "weather") {
        send({ type: "atmosphere", key, value: String(value) as Weather });
      } else {
        send({ type: "atmosphere", key, value: value as boolean | number });
      }
    },
    [send],
  );

  const previewPhase = useCallback(
    (phase: TimePhase | null) => {
      const state = useRoomStore.getState();
      if (phase) {
        state.setScenePhase(phase);
        state.setTimeOverride(phase);
        state.setAutoTime(false);
      } else {
        const next = currentPhase(new Date());
        state.setAutoTime(true);
        state.setTimeOverride(null);
        state.setScenePhase(next);
        if (state.role === "host") send({ type: "time-sync", phase: next, auto: true });
      }
      send({ type: "time-override", phase });
    },
    [send],
  );

  const broadcastTime = useCallback(
    (phase: TimePhase, auto: boolean) => {
      send({ type: "time-sync", phase, auto });
    },
    [send],
  );

  const toggleMic = useCallback(() => {
    const state = useRoomStore.getState();
    if (!localRef.current?.getAudioTracks().length) return;
    const next = !state.micOn;
    setTrackEnabled(localRef.current, "audio", next);
    state.setMic(next);
    send({ type: "media-state", mic: next, cam: state.camOn });
  }, [send]);

  const toggleCam = useCallback(() => {
    const state = useRoomStore.getState();
    if (!localRef.current?.getVideoTracks().length) return;
    const next = !state.camOn;
    setTrackEnabled(localRef.current, "video", next);
    state.setCam(next);
    send({ type: "media-state", mic: state.micOn, cam: next });
  }, [send]);

  const toggleSound = useCallback(() => {
    const state = useRoomStore.getState();
    const next = !state.soundOff;
    setSoundOff(next);
    state.setSoundOff(next);
    if (!next) playCue("message");
  }, []);

  useEffect(() => {
    useRoomStore.getState().setSoundOff(getSoundOff());
  }, []);

  useEffect(() => () => teardown(), [teardown]);

  return {
    localStream,
    remoteStream,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChat,
    sendEmoji,
    sendTyping,
    sendAtmosphere,
    previewPhase,
    broadcastTime,
    toggleMic,
    toggleCam,
    toggleSound,
  };
}
