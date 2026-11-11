import type {
  AtmosphereKey,
  AtmosphereState,
  MediaState,
  RoomSnapshot,
  TimePhase,
  Weather,
} from "@/types/room";
import { clamp } from "@/lib/utils";

/** 一条 DataConnection 承载文字、氛围、时段、媒体状态与进出信令。 */
export type RoomMessage =
  | { type: "hello"; nickname: string }
  | { type: "welcome"; snapshot: RoomSnapshot }
  | { type: "room-full" }
  | { type: "chat"; id: string; text: string; at: number }
  | { type: "emoji"; id: string; emoji: string; at: number }
  | { type: "typing"; active: boolean }
  | { type: "atmosphere"; key: AtmosphereKey; value: boolean | number | Weather }
  | { type: "time-override"; phase: TimePhase | null }
  | { type: "time-sync"; phase: TimePhase; auto: boolean }
  | { type: "media-state"; mic: boolean; cam: boolean }
  | { type: "leave"; reason: "manual" | "error" }
  | { type: "ping"; at: number };

const PHASES: TimePhase[] = ["dawn", "day", "dusk", "night"];
const WEATHERS: Weather[] = ["clear", "rain", "snow", "fireflies"];
const ATMOSPHERE_KEYS: AtmosphereKey[] = ["light", "fireplace", "weather"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPhase(value: unknown): value is TimePhase {
  return typeof value === "string" && PHASES.includes(value as TimePhase);
}

function str(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  return value.slice(0, max);
}

function parseAtmosphere(value: unknown): AtmosphereState {
  const fallback: AtmosphereState = { light: 62, fireplace: true, weather: "clear" };
  if (!isRecord(value)) return fallback;
  const weather =
    typeof value.weather === "string" && WEATHERS.includes(value.weather as Weather)
      ? (value.weather as Weather)
      : fallback.weather;
  return {
    light: typeof value.light === "number" ? clamp(value.light, 0, 100) : fallback.light,
    fireplace: typeof value.fireplace === "boolean" ? value.fireplace : fallback.fireplace,
    weather,
  };
}

function parseMedia(value: unknown): MediaState {
  if (!isRecord(value)) return { mic: true, cam: true };
  return {
    mic: typeof value.mic === "boolean" ? value.mic : true,
    cam: typeof value.cam === "boolean" ? value.cam : true,
  };
}

function parseSnapshot(value: unknown): RoomSnapshot {
  const v = isRecord(value) ? value : {};
  return {
    phase: isPhase(v.phase) ? v.phase : "night",
    timeOverride: isPhase(v.timeOverride) ? v.timeOverride : null,
    autoTime: typeof v.autoTime === "boolean" ? v.autoTime : true,
    atmosphere: parseAtmosphere(v.atmosphere),
    hostNickname: str(v.hostNickname, 24) ?? "主人",
    guestNickname: str(v.guestNickname, 24) ?? "来客",
    hostMedia: parseMedia(v.hostMedia),
  };
}

/** 对端数据一律先校验再进状态机，避免脏消息把界面带崩。 */
export function parseRoomMessage(data: unknown): RoomMessage | null {
  if (!isRecord(data) || typeof data.type !== "string") return null;
  const at = typeof data.at === "number" && Number.isFinite(data.at) ? data.at : Date.now();

  switch (data.type) {
    case "hello":
      return { type: "hello", nickname: str(data.nickname, 24) ?? "来客" };
    case "welcome":
      return { type: "welcome", snapshot: parseSnapshot(data.snapshot) };
    case "room-full":
      return { type: "room-full" };
    case "chat": {
      const text = str(data.text, 500);
      const id = str(data.id, 64);
      return text && id ? { type: "chat", id, text, at } : null;
    }
    case "emoji": {
      const emoji = str(data.emoji, 8);
      const id = str(data.id, 64);
      return emoji && id ? { type: "emoji", id, emoji, at } : null;
    }
    case "typing":
      return { type: "typing", active: Boolean(data.active) };
    case "atmosphere": {
      const key = data.key;
      if (typeof key !== "string" || !ATMOSPHERE_KEYS.includes(key as AtmosphereKey)) return null;
      if (key === "light" && typeof data.value === "number") {
        return { type: "atmosphere", key, value: clamp(data.value, 0, 100) };
      }
      if (key === "fireplace" && typeof data.value === "boolean") {
        return { type: "atmosphere", key, value: data.value };
      }
      if (key === "weather" && typeof data.value === "string" && WEATHERS.includes(data.value as Weather)) {
        return { type: "atmosphere", key, value: data.value as Weather };
      }
      return null;
    }
    case "time-override":
      return {
        type: "time-override",
        phase: isPhase(data.phase) ? data.phase : null,
      };
    case "time-sync":
      return isPhase(data.phase)
        ? { type: "time-sync", phase: data.phase, auto: Boolean(data.auto) }
        : null;
    case "media-state":
      return {
        type: "media-state",
        mic: Boolean(data.mic),
        cam: Boolean(data.cam),
      };
    case "leave":
      return { type: "leave", reason: data.reason === "error" ? "error" : "manual" };
    case "ping":
      return { type: "ping", at };
    default:
      return null;
  }
}

export function buildSnapshot(state: {
  scenePhase: TimePhase;
  timeOverride: TimePhase | null;
  autoTime: boolean;
  atmosphere: AtmosphereState;
  nickname: string;
  peerNickname: string;
  micOn: boolean;
  camOn: boolean;
}): RoomSnapshot {
  return {
    phase: state.scenePhase,
    timeOverride: state.timeOverride,
    autoTime: state.autoTime,
    atmosphere: state.atmosphere,
    hostNickname: state.nickname,
    guestNickname: state.peerNickname,
    hostMedia: { mic: state.micOn, cam: state.camOn },
  };
}
