import * as React from "react";
import { cn } from "@/lib/cn";

/* Filled primary actions and quiet secondary controls. */
type Variant = "primary" | "secondary" | "ghost" | "danger" | "solid";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap " +
  "border border-transparent bg-transparent " +
  "transition-[background-color,border-color,color,transform,box-shadow] duration-[180ms] ease-[var(--v-ease-out)] " +
  "disabled:pointer-events-none disabled:opacity-45 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-onaccent border-accent shadow-sm hover:bg-accent-hover hover:-translate-y-0.5 active:translate-y-0",
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
  md: "h-10 px-4 text-[14px] rounded-md",
  lg: "h-12 px-5 text-[15px] rounded-md",
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
