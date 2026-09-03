import * as React from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full bg-surface text-ink placeholder:text-subtle border border-line rounded-md " +
  "transition-[border-color,box-shadow] duration-[120ms] " +
  "hover:border-line-strong " +
  "focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--v-ring)] " +
  "disabled:opacity-50 disabled:bg-sunk " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--v-danger)_35%,transparent)]";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(control, "h-10 px-3 text-sm", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(control, "min-h-32 px-3 py-2.5 text-sm leading-relaxed resize-y", className)}
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
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink">
          {label}
        </label>
        {optional && <span className="text-[12px] text-subtle">Optional</span>}
      </div>
      {children}
      {error ? (
        <p className="text-[12.5px] text-danger flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="currentColor" aria-hidden>
            <path d="M8 1.5 15 14H1L8 1.5Zm0 4.25a.75.75 0 0 0-.75.75v2.75a.75.75 0 0 0 1.5 0V6.5A.75.75 0 0 0 8 5.75Zm0 6.75a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12.5px] text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

/* Character guide, not a hard limit -- the PRD asks for a soft 500 guide. */
export function CharGuide({ value, soft = 500 }: { value: string; soft?: number }) {
  const n = value.length;
  const over = n > soft;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 flex-1 rounded-full bg-sunk overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-[width,background-color] duration-[220ms]",
            over ? "bg-warning" : "bg-accent",
          )}
          style={{ width: `${Math.min(100, (n / soft) * 100)}%` }}
        />
      </div>
      <span className={cn("text-[12px] tabular-nums", over ? "text-warning" : "text-subtle")}>
        {n}
      </span>
    </div>
  );
}
