"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Mode = "light" | "dark" | "auto";

export function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = React.useState<Mode>("auto");

  React.useEffect(() => {
    const stored = localStorage.getItem("vouch-theme");
    setMode(stored === "dark" || stored === "light" ? stored : "auto");
  }, []);

  function apply(next: Mode) {
    setMode(next);
    if (next === "auto") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("vouch-theme");
    } else {
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("vouch-theme", next);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 shadow-low",
        className,
      )}
    >
      {(["light", "auto", "dark"] as Mode[]).map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => apply(m)}
          className={cn(
            "rounded-full px-3 py-1 text-[12.5px] font-medium capitalize transition-colors duration-[120ms]",
            mode === m ? "bg-accent text-onaccent" : "text-muted hover:text-ink",
          )}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
