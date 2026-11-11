"use client";

import { CloudRain, Flame, Sparkles, Sun, Snowflake } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { useRoomStore } from "@/lib/store";
import type { Weather } from "@/types/room";
import { cn } from "@/lib/utils";

const WEATHERS: { id: Weather; label: string; icon: typeof Sun }[] = [
  { id: "clear", label: "晴", icon: Sun },
  { id: "rain", label: "雨", icon: CloudRain },
  { id: "snow", label: "雪", icon: Snowflake },
  { id: "fireflies", label: "萤火", icon: Sparkles },
];

export default function AtmospherePanel({ className }: { className?: string }) {
  const atmosphere = useRoomStore((state) => state.atmosphere);
  const engine = useRoomEngine();

  return (
    <section className={cn("glass-deep rounded-4xl px-5 py-4", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-[var(--scene-ink)]">一起调这间屋</h3>
        <span className="text-[11px] text-[var(--scene-soft)]">两边同时变</span>
      </div>

      <div className="mb-4">
        <div className="mb-2.5 flex items-center justify-between text-sm">
          <span className="text-[var(--scene-ink)]/85">灯光</span>
          <span className="font-code text-xs text-ember-100">{Math.round(atmosphere.light)}%</span>
        </div>
        <Slider
          label="灯光亮度"
          value={atmosphere.light}
          onChange={(value) => engine.sendAtmosphere("light", value)}
        />
      </div>

      <div className="mb-4 flex items-center justify-between border-t border-white/[0.07] pt-3.5">
        <div className="flex items-center gap-2 text-sm text-[var(--scene-ink)]/85">
          <Flame className={cn("h-4 w-4", atmosphere.fireplace ? "text-ember-200" : "opacity-50")} />
          壁炉
        </div>
        <Switch
          checked={atmosphere.fireplace}
          onChange={(value) => engine.sendAtmosphere("fireplace", value)}
          label="点亮壁炉"
        />
      </div>

      <div className="border-t border-white/[0.07] pt-3.5">
        <div className="mb-2.5 text-sm text-[var(--scene-ink)]/85">窗外</div>
        <div className="grid grid-cols-4 gap-1.5">
          {WEATHERS.map(({ id, label, icon: Icon }) => {
            const active = atmosphere.weather === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => engine.sendAtmosphere("weather", id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border py-2 text-xs transition-all duration-300 active:scale-95",
                  active
                    ? "border-ember-100/60 bg-ember-100/20 text-[var(--scene-ink)] shadow-glow-sm"
                    : "border-white/[0.08] bg-white/[0.03] text-[var(--scene-soft)] hover:border-ember-100/35 hover:bg-white/[0.08]",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
