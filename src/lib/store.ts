"use client";

import { create } from "zustand";
import type { FriendlyError } from "@/lib/peer/errors";
import type {
  AtmosphereKey,
  AtmosphereState,
  ChatMessage,
  ConnectionStatus,
  MediaState,
  Phase,
  Role,
  RoomSnapshot,
  TimePhase,
  Weather,
} from "@/types/room";
import { clamp } from "@/lib/utils";

const DEFAULT_ATMOSPHERE: AtmosphereState = {
  light: 62,
  fireplace: false,
  weather: "clear",
};
const WEATHERS: Weather[] = ["clear", "rain", "snow", "fireflies"];

interface RoomStore {
  phase: Phase;
  role: Role | null;
  code: string;
  nickname: string;
  peerNickname: string;
  connection: ConnectionStatus;
  error: FriendlyError | null;
  notice: string | null;
  messages: ChatMessage[];
  peerTyping: boolean;
  atmosphere: AtmosphereState;
  scenePhase: TimePhase;
  timeOverride: TimePhase | null;
  autoTime: boolean;
  micOn: boolean;
  camOn: boolean;
  soundOff: boolean;
  localReady: boolean;
  remoteReady: boolean;
  peerMedia: MediaState;
  mediaNote: string | null;

  beginRoom: (role: Role, code: string) => void;
  setPhase: (phase: Phase) => void;
  setConnection: (connection: ConnectionStatus) => void;
  setError: (error: FriendlyError | null) => void;
  setNotice: (notice: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  setPeerTyping: (active: boolean) => void;
  setAtmosphere: (key: AtmosphereKey, value: boolean | number | string) => void;
  setScenePhase: (phase: TimePhase) => void;
  setTimeOverride: (phase: TimePhase | null) => void;
  setAutoTime: (auto: boolean) => void;
  setMic: (on: boolean) => void;
  setCam: (on: boolean) => void;
  setPeerMedia: (media: MediaState) => void;
  setSoundOff: (off: boolean) => void;
  setLocalReady: (ready: boolean) => void;
  setRemoteReady: (ready: boolean) => void;
  setNickname: (name: string) => void;
  setPeerNickname: (name: string) => void;
  setMediaNote: (note: string | null) => void;
  applySnapshot: (snapshot: RoomSnapshot) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  phase: "lobby",
  role: null,
  code: "",
  nickname: "你",
  peerNickname: "对方",
  connection: "idle",
  error: null,
  notice: null,
  messages: [],
  peerTyping: false,
  atmosphere: DEFAULT_ATMOSPHERE,
  // 固定初值保证 SSR 一致；挂载后由 useSceneClock 换成真实时段。
  scenePhase: "night",
  timeOverride: null,
  autoTime: true,
  micOn: true,
  camOn: true,
  soundOff: false,
  localReady: false,
  remoteReady: false,
  peerMedia: { mic: true, cam: true },
  mediaNote: null,

  beginRoom: (role, code) =>
    set((state) => ({
      phase: "entering",
      role,
      code,
      connection: "signaling",
      error: null,
      notice: role === "host" ? "正在把灯点亮…" : "正在敲门…",
      messages: [],
      peerTyping: false,
      peerNickname: "对方",
      peerMedia: { mic: true, cam: true },
      localReady: false,
      remoteReady: false,
      mediaNote: null,
      atmosphere: DEFAULT_ATMOSPHERE,
      micOn: true,
      camOn: true,
      nickname: role === "host" ? "主人" : "来客",
      soundOff: state.soundOff,
    })),
  setPhase: (phase) => set({ phase }),
  setConnection: (connection) => set({ connection }),
  setError: (error) => set({ error, connection: error ? "error" : "idle" }),
  setNotice: (notice) => set({ notice }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message].slice(-120) })),
  setPeerTyping: (peerTyping) => set({ peerTyping }),
  setAtmosphere: (key, value) =>
    set((state) => {
      if (key === "light") {
        return {
          atmosphere: {
            ...state.atmosphere,
            light: clamp(Number(value) || 0, 0, 100),
          },
        };
      }
      if (key === "fireplace") {
        return {
          atmosphere: { ...state.atmosphere, fireplace: Boolean(value) },
        };
      }
      const weather = String(value) as Weather;
      return {
        atmosphere: {
          ...state.atmosphere,
          weather: WEATHERS.includes(weather) ? weather : "clear",
        },
      };
    }),
  setScenePhase: (scenePhase) => set({ scenePhase }),
  setTimeOverride: (timeOverride) => set({ timeOverride }),
  setAutoTime: (autoTime) => set({ autoTime }),
  setMic: (micOn) => set({ micOn }),
  setCam: (camOn) => set({ camOn }),
  setPeerMedia: (peerMedia) => set({ peerMedia }),
  setSoundOff: (soundOff) => set({ soundOff }),
  setLocalReady: (localReady) => set({ localReady }),
  setRemoteReady: (remoteReady) => set({ remoteReady }),
  setNickname: (nickname) => set({ nickname }),
  setPeerNickname: (peerNickname) => set({ peerNickname }),
  setMediaNote: (mediaNote) => set({ mediaNote }),
  applySnapshot: (snapshot) =>
    set({
      scenePhase: snapshot.phase,
      timeOverride: snapshot.timeOverride,
      autoTime: snapshot.autoTime,
      atmosphere: snapshot.atmosphere,
      peerNickname: snapshot.hostNickname,
      peerMedia: snapshot.hostMedia,
    }),
  reset: () =>
    set((state) => ({
      phase: "lobby",
      role: null,
      code: "",
      connection: "idle",
      error: null,
      notice: null,
      messages: [],
      peerTyping: false,
      peerNickname: "对方",
      localReady: false,
      remoteReady: false,
      mediaNote: null,
      micOn: true,
      camOn: true,
      peerMedia: { mic: true, cam: true },
      atmosphere: DEFAULT_ATMOSPHERE,
      // 天色、静音与昵称偏好跨房间保留
      scenePhase: state.scenePhase,
      timeOverride: state.timeOverride,
      autoTime: state.autoTime,
      soundOff: state.soundOff,
      nickname: state.nickname,
    })),
}));
