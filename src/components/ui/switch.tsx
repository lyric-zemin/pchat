"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-300",
        "disabled:cursor-not-allowed disabled:opacity-45",
        checked
          ? "border-ember-100/60 bg-ember-300/70"
          : "border-white/15 bg-black/35",
        className,
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 520, damping: 34 }}
        className={cn(
          "absolute h-4 w-4 rounded-full bg-cream shadow-sm",
          checked ? "right-1" : "left-1",
        )}
      />
    </button>
  );
}
