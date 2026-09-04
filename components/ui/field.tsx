import * as React from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full bg-surface text-ink placeholder:text-subtle border border-line rounded-md " +
  "text-[14px] caret-accent " +
  "transition-[border-color] duration-[120ms] " +
  "hover:border-[color-mix(in_srgb,var(--v-text)_45%,transparent)] " +
  "focus:outline-none focus:border-accent " +
  "disabled:opacity-50 disabled:bg-sunk " +
  "aria-[invalid=true]:border-danger";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(control, "min-h-9 px-2.5 py-1.5", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(control, "min-h-24 px-2.5 py-2 leading-relaxed resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Field({
  label,
  hint,
  error,
  optional,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="block text-[12px] text-muted">
          {label}
        </label>
        {optional && <span className="text-[11px] text-subtle">Optional</span>}
      </div>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-[12px] text-danger">
          <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="currentColor" aria-hidden>
            <path d="M8 1.5 15 14H1L8 1.5Zm0 4.25a.75.75 0 0 0-.75.75v2.75a.75.75 0 0 0 1.5 0V6.5A.75.75 0 0 0 8 5.75Zm0 6.75a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

/* Character guide, not a hard limit -- it nudges, it never blocks a submit. */
export function CharGuide({ value, soft = 500 }: { value: string; soft?: number }) {
  const n = value.length;
  const over = n > soft;
  return (
    <div className="flex items-center justify-end gap-2">
      <span className={cn("text-[11px] tabular-nums", over ? "text-warning" : "text-subtle")}>
        {n} / {soft}
      </span>
    </div>
  );
}
