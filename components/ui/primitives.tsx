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
        "bg-surface border border-line rounded-lg",
        elevated ? "shadow-mid" : "shadow-low",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------- Badge ---------------- */
const tones = {
  neutral: "bg-sunk text-muted border-line",
  pending: "bg-warning/12 text-warning border-warning/25",
  approved: "bg-success/12 text-success border-success/25",
  rejected: "bg-danger/10 text-danger border-danger/25",
  accent: "bg-accent-soft text-accent-text border-accent-line",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11.5px] font-medium tracking-[0.01em]",
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
  const spread = ([...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 5) * 22 - 44;
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
        background: src
          ? undefined
          : `oklch(from var(--v-accent) 0.9 0.05 calc(h + ${spread}))`,
        color: src
          ? undefined
          : `oklch(from var(--v-accent) 0.38 0.1 calc(h + ${spread}))`,
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
        "rounded-xl border border-dashed border-line bg-sunk/40",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 grid size-12 place-items-center rounded-xl border border-accent-line bg-accent-soft text-accent-text">
          {icon}
        </div>
      )}
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
