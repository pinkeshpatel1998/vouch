"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Wraps the native <dialog>, which gives focus trapping, Escape, and inert
 * background for free. Doing that by hand is where accessibility usually rots.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clicking the backdrop closes; clicking the panel must not.
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[min(30rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink shadow-high",
        "backdrop:bg-black/45 backdrop:backdrop-blur-[2px]",
        "open:animate-settle",
        className,
      )}
    >
      <div className="px-6 pt-6">
        <h2 className="font-display text-2xl leading-tight text-ink">{title}</h2>
        {description && (
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {children && <div className="px-6 py-5">{children}</div>}
      {footer && (
        <div className="flex justify-end gap-2 border-t border-line bg-sunk/50 px-6 py-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}
