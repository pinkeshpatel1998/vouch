"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * App shell. The sidebar is the spec's IA: spaces, a cross-space inbox, and
 * account. Space-scoped screens nest their own header and tabs inside this.
 */
const NAV = [
  {
    href: "/app",
    label: "Spaces",
    icon: "M3.5 3.5h5v5h-5v-5Zm8 0h5v5h-5v-5Zm-8 8h5v5h-5v-5Zm8 0h5v5h-5v-5Z",
  },
  {
    href: "/app/submissions",
    label: "All submissions",
    icon: "M3.5 4.75A1.25 1.25 0 0 1 4.75 3.5h10.5A1.25 1.25 0 0 1 16.5 4.75v7.5A1.25 1.25 0 0 1 15.25 13.5H8l-3.6 2.7a.5.5 0 0 1-.8-.4V13.5h-.35A1.25 1.25 0 0 1 2 12.25v-7.5Z",
  },
  {
    href: "/app/account",
    label: "Account",
    icon: "M10 10.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM3.75 16.5a6.25 6.25 0 0 1 12.5 0 .75.75 0 0 1-.75.75h-11a.75.75 0 0 1-.75-.75Z",
  },
];

function Mark() {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-md bg-accent-soft">
      <svg viewBox="0 0 20 20" className="size-3.5 text-accent" fill="currentColor" aria-hidden>
        <path d="M10 1.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8Zm3.9 5.7a.9.9 0 0 0-1.28 0L9 10.93 7.38 9.3A.9.9 0 0 0 6.1 10.6l2.26 2.26a.9.9 0 0 0 1.28 0l4.26-4.27a.9.9 0 0 0 0-1.28Z" />
      </svg>
    </span>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[13.5rem_1fr]">
      {/* ---------- sidebar ---------- */}
      <aside className="border-line md:sticky md:top-0 md:h-dvh md:border-r">
        <div className="flex items-center gap-2 px-4 py-4">
          <Mark />
          <span className="font-display text-[17px] text-ink">Vouch</span>
        </div>

        <nav
          aria-label="Sections"
          className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible"
        >
          {NAV.map((item) => {
            // /app must not stay lit while a space beneath it is open.
            const active =
              item.href === "/app"
                ? pathname === "/app" || /^\/app\/(?!submissions|account)/.test(pathname)
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] transition-colors duration-[120ms]",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-[color-mix(in_srgb,var(--v-text)_6%,transparent)] hover:text-ink",
                )}
              >
                <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="currentColor" aria-hidden>
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
