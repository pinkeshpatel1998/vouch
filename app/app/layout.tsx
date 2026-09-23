"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand, Arrow } from "@/components/brand";
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

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="workspace-shell min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      {/* ---------- sidebar ---------- */}
      <aside className="workspace-sidebar border-line md:sticky md:top-0 md:h-dvh md:border-r">
        <Brand />
        <p className="sidebar-label">YOUR WORKSPACE</p>

        <nav
          aria-label="Sections"
          className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible"
        >
          {NAV.map((item) => {
            // /app must not stay lit while a space beneath it is open.
            const active =
              item.href === "/app"
                ? pathname === "/app" ||
                  /^\/app\/(?!submissions|account)/.test(pathname)
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
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
                <svg
                  viewBox="0 0 20 20"
                  className="size-4 shrink-0"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span aria-hidden="true">✳</span>
            <strong>A little love goes a long way.</strong>
            <p>Your best advocates are the people you’ve already helped.</p>
            <Link href="/#showcase">
              Find your inspiration <Arrow diagonal />
            </Link>
          </div>
          <Link href="/app/account">
            <span className="grid size-7 place-items-center rounded-full bg-[#e1e7d3] text-[10px]">
              V
            </span>{" "}
            Your account <Arrow diagonal />
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="workspace-topbar">
          <span>
            Workspace <span>/</span>
            <b>
              {pathname.includes("/account")
                ? "Account"
                : pathname.includes("/submissions")
                  ? "All submissions"
                  : pathname === "/app"
                    ? "Overview"
                    : "Your space"}
            </b>
          </span>
          <Link href="/">
            Made for good words <span aria-hidden="true">✳</span>
          </Link>
        </div>
        <div className="workspace-content">{children}</div>
      </div>
    </div>
  );
}
