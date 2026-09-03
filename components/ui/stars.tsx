"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

function Star({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn("size-full", className)} aria-hidden>
      <path
        d="M10 1.6l2.47 5.28 5.53.76-4.03 4.05.98 5.71L10 14.66l-4.95 2.74.98-5.71L2 7.64l5.53-.76L10 1.6Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.4}
        strokeLinejoin="round"
        opacity={filled ? 1 : 0.3}
      />
    </svg>
  );
}

/* Read-only display. Used in the inbox and inside the wall widget. */
export function Stars({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("inline-flex items-center gap-0.5 text-accent", className)}
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ width: size, height: size }}>
          <Star filled={i <= value} />
        </span>
      ))}
    </div>
  );
}

/* Interactive. Arrow keys work; the whole group is one tab stop. */
export function StarInput({
  value,
  onChange,
  size = 32,
  name = "rating",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
  name?: string;
}) {
  const [hover, setHover] = React.useState(0);
  const shown = hover || value;

  return (
    <div
      role="radiogroup"
      aria-label="Star rating"
      className="inline-flex items-center gap-1"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          tabIndex={value === i || (value === 0 && i === 1) ? 0 : -1}
          name={name}
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              onChange(Math.min(5, (value || 0) + 1));
            }
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              onChange(Math.max(1, (value || 1) - 1));
            }
          }}
          className={cn(
            "rounded-xs p-0.5 text-accent transition-transform duration-[120ms] ease-[var(--v-ease-out)]",
            "hover:scale-110 active:scale-95",
          )}
          style={{ width: size, height: size }}
        >
          <Star filled={i <= shown} />
        </button>
      ))}
    </div>
  );
}
