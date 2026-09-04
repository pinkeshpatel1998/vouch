import * as React from "react";
import { cn } from "@/lib/cn";

/* ---------------- Card ---------------- */
export function Card({
  className,
  elevated,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { elevated?: boolean }) {
  return (
    <div
      className={cn(
        "bg-surface rounded-md",
        elevated ? "shadow-mid" : "shadow-low",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------- Badge ---------------- */
/* Nocturne tags are solid chips off the ramps, not tinted outlines. */
const tones = {
  neutral: "bg-n800 text-n100",
  pending: "bg-[color-mix(in_srgb,var(--v-warning)_28%,var(--v-surface))] text-[color-mix(in_srgb,var(--v-warning)_92%,white)]",
  approved: "bg-[color-mix(in_srgb,var(--v-success)_26%,var(--v-surface))] text-[color-mix(in_srgb,var(--v-success)_92%,white)]",
  rejected: "bg-[color-mix(in_srgb,var(--v-danger)_24%,var(--v-surface))] text-[color-mix(in_srgb,var(--v-danger)_92%,white)]",
  accent: "bg-[var(--v-accent-800)] text-[var(--v-accent-100)]",
  outline: "border border-accent text-accent",
} as const;

export function Badge({
  tone = "neutral",
  dot,
  className,
  children,
}: {
  tone?: keyof typeof tones;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-[3px] text-[11px] tracking-[0.02em]",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ---------------- Avatar ---------------- */
function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  // Tint from the space's accent hue, not a random one, so a wall of avatars
  // stays harmonious whatever accent the owner picks.
  const offset = ([...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 5) * 22 - 44;
  // `calc(h + -44)` is invalid CSS -- the sign has to be the operator, or the
  // whole colour fails to parse and the avatar falls back to an unbranded hue.
  const spread = `${offset < 0 ? "-" : "+"} ${Math.abs(offset)}`;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-sunk font-medium text-ink select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        // Mixed against the current surface and text rather than pinned to
        // fixed lightnesses, so one rule works on the dark app and on a light
        // wall embedded in someone else's site.
        background: src
          ? undefined
          : `color-mix(in srgb, oklch(from var(--v-accent) 0.62 0.1 calc(h ${spread})) 26%, var(--v-surface))`,
        color: src
          ? undefined
          : `color-mix(in srgb, oklch(from var(--v-accent) 0.7 0.11 calc(h ${spread})) 72%, var(--v-text))`,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" loading="lazy" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-sm", className)} aria-hidden />;
}

/* ---------------- Empty state ---------------- */
export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-14",
        "rounded-lg border border-dashed border-line bg-sunk/50",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 grid size-11 place-items-center rounded-md border border-accent-line bg-accent-soft text-accent">
          {icon}
        </div>
      )}
      <h3 className="font-display text-[20px] text-ink">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
