export type TimePhase = "dawn" | "day" | "dusk" | "night";
export type Role = "host" | "guest";
export type Phase = "lobby" | "entering" | "waiting" | "connected" | "leaving";
export type Weather = "clear" | "rain" | "snow" | "fireflies";
export type ConnectionStatus =
  | "idle"
  | "signaling"
  | "connecting"
  | "connected"
  | "error";
export type AtmosphereKey = "light" | "fireplace" | "weather";

export interface AtmosphereState {
  light: number;
  fireplace: boolean;
  weather: Weather;
}

export interface MediaState {
  mic: boolean;
  cam: boolean;
}

export interface ChatMessage {
  id: string;
  kind: "chat" | "emoji" | "system";
  text: string;
  from: "me" | "peer" | "system";
  at: number;
}

/** 开房一方在访客进门时下发，保证两端看到的是同一片天色。 */
export interface RoomSnapshot {
  phase: TimePhase;
  timeOverride: TimePhase | null;
  autoTime: boolean;
  atmosphere: AtmosphereState;
  hostNickname: string;
  guestNickname: string;
  hostMedia: MediaState;
}
