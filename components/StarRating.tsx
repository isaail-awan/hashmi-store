"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (next: number) => void;
}

export function StarRating({ value, size = "md", interactive = false, onChange }: StarRatingProps) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-8 w-8" : "h-5 w-5";
  const rounded = Math.round(value);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={(e) => {
            e.preventDefault();
            onChange?.(n);
          }}
          className={interactive ? "cursor-pointer transition-transform active:scale-90" : "cursor-default"}
          aria-label={`${n} star`}
        >
          <Star
            className={`${starSize} ${
              n <= rounded ? "fill-haldi text-haldi" : "fill-transparent text-border"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
