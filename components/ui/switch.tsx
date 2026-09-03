"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export function Switch({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  id?: string;
}) {
  const auto = React.useId();
  const inputId = id ?? auto;
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div className="min-w-0">
        <label htmlFor={inputId} className="block text-sm font-medium text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[13px] leading-snug text-muted">{description}</p>}
      </div>
      <button
        id={inputId}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-10 shrink-0 rounded-full border transition-colors duration-[160ms] ease-[var(--v-ease-out)]",
          checked ? "bg-accent border-accent" : "bg-sunk border-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-4.5 -translate-y-1/2 rounded-full bg-white shadow-low",
            "transition-[left] duration-[160ms] ease-[var(--v-ease-out)]",
            checked ? "left-[1.125rem]" : "left-[0.1875rem]",
          )}
        />
      </button>
    </div>
  );
}
