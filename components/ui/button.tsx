import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Nocturne buttons are outlined, not filled: the accent arrives as a border
 * and a text colour, with a soft wash on hover. On a dark ground a large
 * filled block reads as a slab, so weight comes from the edge instead.
 * `solid` exists for the rare case that needs to shout; use it sparingly.
 */
type Variant = "primary" | "secondary" | "ghost" | "danger" | "solid";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap " +
  "border border-transparent bg-transparent " +
  "transition-[background-color,border-color,color] duration-[120ms] ease-[var(--v-ease-out)] " +
  "disabled:pointer-events-none disabled:opacity-45 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variants: Record<Variant, string> = {
  primary:
    "text-accent border-accent hover:bg-[color-mix(in_srgb,var(--v-accent)_12%,transparent)] " +
    "active:bg-[color-mix(in_srgb,var(--v-accent)_22%,transparent)]",
  secondary:
    "text-ink border-line hover:bg-[color-mix(in_srgb,var(--v-text)_7%,transparent)] " +
    "active:bg-[color-mix(in_srgb,var(--v-text)_14%,transparent)]",
  ghost:
    "text-accent hover:bg-[color-mix(in_srgb,var(--v-accent)_10%,transparent)] " +
    "active:bg-[color-mix(in_srgb,var(--v-accent)_18%,transparent)]",
  danger:
    "text-danger border-[color-mix(in_srgb,var(--v-danger)_50%,transparent)] " +
    "hover:bg-[color-mix(in_srgb,var(--v-danger)_12%,transparent)]",
  solid: "bg-accent text-onaccent border-accent hover:bg-accent-hover",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-2.5 text-[13px] rounded-md",
  md: "h-9 px-3 text-[14px] rounded-md",
  lg: "h-11 px-4 text-[15px] rounded-md",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function buttonStyles(variant: Variant = "primary", size: Size = "md") {
  return cn(base, variants[variant], sizes[size]);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, disabled, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-3.5 animate-spin", className)}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path
        d="M14.5 8A6.5 6.5 0 0 0 8 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
