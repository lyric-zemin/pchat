"use client";

export type CueName = "knock" | "door" | "arrive" | "message" | "leave";

const STORAGE_KEY = "pchat.soundOff";

let context: AudioContext | null = null;
let muted = false;
let hydrated = false;

function preference() {
  if (!hydrated) {
    hydrated = true;
    if (typeof window !== "undefined") {
      try {
        muted = window.localStorage.getItem(STORAGE_KEY) === "1";
      } catch {
        /* 隐私模式下 localStorage 不可读，保持默认开启 */
      }
    }
  }
  return muted;
}

export function getSoundOff() {
  return preference();
}

export function setSoundOff(value: boolean) {
  muted = value;
  hydrated = true;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* 隐私模式下 localStorage 不可写，本次会话内仍然生效 */
    }
  }
}

type AudioCtor = typeof AudioContext;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;
  const Ctor: AudioCtor | undefined =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: AudioCtor }).webkitAudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  return context;
}

function tone(
  c: AudioContext,
  freq: number,
  at: number,
  duration: number,
  peak: number,
  type: OscillatorType = "sine",
  endFreq?: number,
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, at + duration);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.014);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(at);
  osc.stop(at + duration + 0.03);
}

function noise(c: AudioContext, at: number, duration: number, peak: number, cutoff: number) {
  const length = Math.max(1, Math.floor(c.sampleRate * duration));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const source = c.createBufferSource();
  source.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  const gain = c.createGain();
  gain.gain.value = peak;
  source.connect(filter).connect(gain).connect(c.destination);
  source.start(at);
}

/** 全部音效由 Web Audio 实时合成，不加载任何音频文件。 */
export function playCue(name: CueName) {
  if (preference()) return;
  const c = audio();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const t = c.currentTime + 0.015;

  switch (name) {
    case "knock":
      [0, 0.19, 0.4].forEach((offset, index) => {
        tone(c, 168 - index * 9, t + offset, 0.11, 0.15, "triangle", 92);
        noise(c, t + offset, 0.07, 0.055, 800);
      });
      break;
    case "door":
      tone(c, 108, t, 0.72, 0.075, "sawtooth", 58);
      noise(c, t + 0.04, 0.58, 0.035, 480);
      break;
    case "arrive":
      [523.25, 659.25, 783.99].forEach((freq, index) => {
        tone(c, freq, t + index * 0.11, 0.42, 0.085, "sine");
      });
      break;
    case "message":
      tone(c, 880, t, 0.16, 0.055, "sine", 1046.5);
      break;
    case "leave":
      tone(c, 440, t, 0.34, 0.08, "sine", 392);
      tone(c, 330, t + 0.16, 0.5, 0.07, "sine", 262);
      break;
  }
}

export function releaseAudio() {
  if (context && context.state !== "closed") void context.close();
  context = null;
}
