"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRoomStore } from "@/lib/store";
import { PHASES } from "@/lib/time/phases";
import type { Weather } from "@/types/room";

// 固定布局，避免服务端与客户端随机位置不一致。
// scene-particle / scene-particle-extra 由 CSS 在窄屏与「减弱动态」时裁减。
const STARS = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37 + 7) % 96}%`,
  top: `${(i * 23 + 5) % 62}%`,
  size: i % 5 === 0 ? 3 : 2,
  delay: `${(i % 7) * 0.6}s`,
}));
const RAIN = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 61 + 3) % 98}%`,
  delay: `${(i % 8) * -0.14}s`,
  duration: `${0.85 + (i % 4) * 0.12}s`,
}));
const SNOW = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 43 + 11) % 97}%`,
  delay: `${(i % 9) * -0.7}s`,
  duration: `${5 + (i % 4)}s`,
  size: i % 4 === 0 ? 5 : 3,
}));
const FLIES = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 29 + 13) % 88}%`,
  bottom: `${(i * 17 + 4) % 34}%`,
  delay: `${(i % 6) * -0.8}s`,
  duration: `${4 + (i % 4)}s`,
}));

function WeatherLayer({ weather }: { weather: Weather }) {
  if (weather === "clear") return null;
  if (weather === "rain") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {RAIN.map((drop, i) => (
          <span
            key={i}
            className={`scene-particle absolute top-0 h-12 w-px animate-rainfall bg-gradient-to-b from-transparent via-white/55 to-transparent ${i >= 8 ? "scene-particle-extra" : ""}`}
            style={{ left: drop.left, animationDelay: drop.delay, animationDuration: drop.duration }}
          />
        ))}
      </div>
    );
  }
  if (weather === "snow") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {SNOW.map((flake, i) => (
          <span
            key={i}
            className={`scene-particle absolute top-0 animate-snowfall rounded-full bg-white/75 ${i >= 9 ? "scene-particle-extra" : ""}`}
            style={{
              left: flake.left,
              width: flake.size,
              height: flake.size,
              animationDelay: flake.delay,
              animationDuration: flake.duration,
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="absolute inset-0 overflow-hidden">
      {FLIES.map((fly, i) => (
        <span
          key={i}
          className={`scene-particle absolute h-1.5 w-1.5 animate-floatup rounded-full bg-honey shadow-[0_0_12px_4px_rgba(226,184,107,0.7)] ${i >= 6 ? "scene-particle-extra" : ""}`}
          style={{
            left: fly.left,
            bottom: fly.bottom,
            animationDelay: fly.delay,
            animationDuration: fly.duration,
          }}
        />
      ))}
    </div>
  );
}

/** 程序化小屋场景：天空、窗框、远山、灯光、壁炉与天气，无任何图片素材。 */
export default function RoomScene({ dimmed = false }: { dimmed?: boolean }) {
  const scenePhase = useRoomStore((state) => state.scenePhase);
  const atmosphere = useRoomStore((state) => state.atmosphere);
  const theme = PHASES[scenePhase];
  const light = atmosphere.light / 100;
  const bright = theme.id === "day" || theme.id === "dawn";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.div
          key={theme.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{
            background: `linear-gradient(175deg, ${theme.skyTop} 0%, ${theme.skyMid} 48%, ${theme.skyBottom} 100%)`,
          }}
        />
      </AnimatePresence>

      {/* 日 / 月 */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        animate={{
          left: theme.sun.x,
          top: theme.sun.y,
          opacity: theme.sun.opacity * (0.4 + light * 0.6),
        }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: theme.sun.size, height: theme.sun.size, background: theme.sun.color }}
      />

      <AnimatePresence>
        {theme.stars > 0.4 && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: theme.stars }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            {STARS.map((star, i) => (
              <span
                key={i}
                className={`scene-particle absolute animate-twinkle rounded-full bg-white ${i >= 10 ? "scene-particle-extra" : ""}`}
                style={{
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  animationDelay: star.delay,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {(theme.id === "day" || theme.id === "dawn") && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[6%] top-[16%] h-24 w-[38vw] animate-drift rounded-full bg-white/20 blur-2xl" />
          <div
            className="absolute right-[4%] top-[36%] h-16 w-[30vw] animate-drift rounded-full bg-white/15 blur-2xl"
            style={{ animationDelay: "-9s" }}
          />
        </div>
      )}

      {/* 一扇大窗的结构线，暗示「坐在窗边」 */}
      <div className="absolute inset-[5%] rounded-[3rem] border border-white/[0.09]" />
      <div className="absolute bottom-[5%] left-1/2 top-[5%] w-px bg-white/[0.07]" />
      <div className="absolute left-[5%] right-[5%] top-[44%] h-px bg-white/[0.07]" />

      <div className="absolute bottom-[5%] left-[5%] right-[5%] h-[26%] overflow-hidden rounded-b-[3rem]">
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0 150 Q 110 92 220 138 T 450 128 T 700 104 T 1000 146 L1000 200 L0 200 Z"
            fill={bright ? "rgba(38,54,76,0.16)" : "rgba(6,10,22,0.34)"}
          />
          <path
            d="M0 176 Q 160 142 320 170 T 640 162 T 1000 178 L1000 200 L0 200 Z"
            fill={bright ? "rgba(38,54,76,0.22)" : "rgba(6,10,22,0.46)"}
          />
        </svg>
      </div>

      {/* 灯：亮度由双方共同调节，白天自动收敛 */}
      <motion.div
        className="absolute -bottom-[22%] -left-[12%] h-[85%] w-[62%] rounded-full blur-3xl"
        animate={{ opacity: light * (1 - theme.ambient * 0.45) }}
        transition={{ duration: 1.2 }}
        style={{ background: "rgba(232, 168, 124, 0.6)" }}
      />
      <motion.div
        className="absolute right-[6%] top-0 h-[70%] w-[38%] blur-3xl"
        animate={{ opacity: light * 0.42 }}
        transition={{ duration: 1.2 }}
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(242,198,160,0.7), transparent 70%)",
        }}
      />

      <AnimatePresence>
        {atmosphere.fireplace && (
          <motion.div
            className="absolute bottom-[9%] left-[9%] flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute -bottom-2 h-28 w-40 rounded-full bg-ember-200/30 blur-2xl" />
            <div className="relative flex items-end gap-1.5">
              {[
                { w: 16, h: 38, d: "0s" },
                { w: 22, h: 56, d: "-0.5s" },
                { w: 14, h: 32, d: "-0.9s" },
              ].map((flame) => (
                <span
                  key={flame.d}
                  className="animate-flicker rounded-t-full bg-gradient-to-t from-ember-300 via-ember-200 to-honey"
                  style={{
                    width: flame.w,
                    height: flame.h,
                    animationDelay: flame.d,
                    boxShadow: "0 0 22px rgba(232,168,124,0.7)",
                  }}
                />
              ))}
            </div>
            <div className="mt-1 h-2 w-28 rounded-full bg-black/40" />
          </motion.div>
        )}
      </AnimatePresence>

      <WeatherLayer weather={atmosphere.weather} />

      <div
        className="scene-tone absolute inset-0"
        style={{ background: bright ? "rgba(255,255,255,0.04)" : "rgba(8,10,20,0.26)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(120% 90% at 50% 42%, transparent 24%, rgba(5,7,15,0.5) 100%)",
        }}
      />

      <AnimatePresence>
        {dimmed && (
          <motion.div
            className="absolute inset-0 bg-midnight-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.62 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
