"use client";

import { clamp, cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  className,
  disabled,
}: SliderProps) {
  const pct = ((clamp(value, min, max) - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
      className={cn("pchat-range scene-tone", className)}
      style={{
        background: `linear-gradient(90deg, #E8A87C 0%, #F2C6A0 ${pct}%, rgba(255,255,255,0.13) ${pct}%, rgba(255,255,255,0.13) 100%)`,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    />
  );
}
