import type { TimePhase } from "@/types/room";

export interface PhaseTheme {
  id: TimePhase;
  label: string;
  /** 窄屏时段控件的单字标签，避免中文被挤成竖排。 */
  shortLabel: string;
  window: string;
  line: string;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  glow: string;
  panel: string;
  line_color: string;
  ink: string;
  soft: string;
  sun: { color: string; x: string; y: string; size: number; opacity: number };
  stars: number;
  ambient: number;
}

export const PHASE_ORDER: TimePhase[] = ["dawn", "day", "dusk", "night"];

export const PHASES: Record<TimePhase, PhaseTheme> = {
  dawn: {
    id: "dawn",
    label: "清晨",
    shortLabel: "晨",
    window: "05:00 – 08:00",
    line: "光刚爬上窗台，屋里还没全亮。",
    skyTop: "#94A9C6",
    skyMid: "#F6D6C2",
    skyBottom: "#F2C6A0",
    glow: "rgba(242, 198, 160, 0.38)",
    panel: "rgba(255, 248, 240, 0.58)",
    line_color: "rgba(58, 46, 40, 0.2)",
    ink: "#3A2E28",
    soft: "rgba(58, 46, 40, 0.62)",
    sun: { color: "#FFF1D6", x: "22%", y: "62%", size: 190, opacity: 0.75 },
    stars: 0.08,
    ambient: 0.82,
  },
  day: {
    id: "day",
    label: "白昼",
    shortLabel: "昼",
    window: "08:00 – 17:00",
    line: "窗外亮得能看清远处的树。",
    skyTop: "#8FB8DE",
    skyMid: "#BFD9EC",
    skyBottom: "#DCEBF8",
    glow: "rgba(255, 255, 255, 0.34)",
    panel: "rgba(248, 251, 255, 0.55)",
    line_color: "rgba(38, 50, 68, 0.18)",
    ink: "#263244",
    soft: "rgba(38, 50, 68, 0.62)",
    sun: { color: "#FFF8E8", x: "76%", y: "12%", size: 220, opacity: 0.62 },
    stars: 0,
    ambient: 1,
  },
  dusk: {
    id: "dusk",
    label: "黄昏",
    shortLabel: "昏",
    window: "17:00 – 20:00",
    line: "天色沉下来了，该把灯打开。",
    skyTop: "#5A4665",
    skyMid: "#C97B5A",
    skyBottom: "#E9A07A",
    glow: "rgba(232, 168, 124, 0.42)",
    panel: "rgba(30, 22, 32, 0.6)",
    line_color: "rgba(242, 198, 160, 0.26)",
    ink: "#F6EDE4",
    soft: "rgba(246, 237, 228, 0.68)",
    sun: { color: "#FFD2A1", x: "72%", y: "64%", size: 170, opacity: 0.85 },
    stars: 0.18,
    ambient: 0.58,
  },
  night: {
    id: "night",
    label: "夜晚",
    shortLabel: "夜",
    window: "20:00 – 05:00",
    line: "只剩这一盏灯还亮着。",
    skyTop: "#0B1020",
    skyMid: "#1B2436",
    skyBottom: "#2B3550",
    glow: "rgba(232, 168, 124, 0.28)",
    panel: "rgba(14, 18, 30, 0.62)",
    line_color: "rgba(242, 198, 160, 0.22)",
    ink: "#F3ECE4",
    soft: "rgba(232, 227, 221, 0.66)",
    sun: { color: "#DCE7F7", x: "78%", y: "16%", size: 96, opacity: 0.7 },
    stars: 1,
    ambient: 0.32,
  },
};

export function phaseForHour(hour: number): TimePhase {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

export function currentPhase(date: Date = new Date()): TimePhase {
  return phaseForHour(date.getHours());
}

/** 把当前时段写进根元素的 CSS 变量，让所有玻璃浮层一起换天色。 */
export function applySceneVars(theme: PhaseTheme) {
  if (typeof document === "undefined") return;
  const style = document.documentElement.style;
  style.setProperty("--scene-sky-top", theme.skyTop);
  style.setProperty("--scene-sky-bottom", theme.skyBottom);
  style.setProperty("--scene-glow", theme.glow);
  style.setProperty("--stage-ink", theme.ink);
  style.setProperty("--stage-soft", theme.soft);
}
