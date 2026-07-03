"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = Infinity,
  size = "md",
}: QuantityStepperProps) {
  const btnSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <div className="flex items-center gap-1 rounded-full border-2 border-border bg-white p-1">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(Math.max(min, value - 1));
        }}
        disabled={value <= min}
        className={`flex ${btnSize} shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper disabled:opacity-30`}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={`w-6 text-center font-mono-tag font-bold ${textSize} text-ink`}>
        {value}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(Math.min(max, value + 1));
        }}
        disabled={value >= max}
        className={`flex ${btnSize} shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper disabled:opacity-30`}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
