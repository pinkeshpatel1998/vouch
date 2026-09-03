"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Avatar, Skeleton } from "@/components/ui/primitives";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useQuery } from "@/lib/data/use-store";
import { getSpace } from "@/lib/data/store";

const TABS = [
  { slug: "inbox", label: "Inbox" },
  { slug: "wall", label: "Wall" },
  { slug: "settings", label: "Settings" },
] as const;

export default function SpaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ space: string }>;
}) {
  const { space: spaceId } = React.use(params);
  const pathname = usePathname();
  const { data: space, loading } = useQuery(() => getSpace(spaceId), [spaceId]);

  return (
    <div
      className="min-h-dvh"
      style={
        space
          ? ({ ["--v-accent" as string]: space.accent_color } as React.CSSProperties)
          : undefined
      }
    >
      <header className="border-b border-line bg-surface/70 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/app"
                className="shrink-0 rounded-sm p-1 text-subtle transition-colors hover:text-ink"
                aria-label="All spaces"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
                  <path d="M10.28 3.22a.75.75 0 0 1 0 1.06L6.56 8l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" />
                </svg>
              </Link>
              {loading ? (
                <>
                  <Skeleton className="size-8 rounded-md" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : space ? (
                <>
                  <Avatar
                    name={space.name}
                    src={space.logo_url}
                    size={32}
                    className="rounded-md"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium leading-tight text-ink">{space.name}</p>
                    <p className="truncate font-mono text-[11.5px] leading-tight text-subtle">
                      /c/{space.slug}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted">Space not found</p>
              )}
            </div>
            <ThemeToggle />
          </div>

          <nav className="flex gap-1" aria-label="Space sections">
            {TABS.map((t) => {
              const href = `/app/${spaceId}/${t.slug}`;
              const active = pathname === href;
              return (
                <Link
                  key={t.slug}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-[120ms]",
                    active ? "text-ink" : "text-subtle hover:text-muted",
                  )}
                >
                  {t.label}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {space === null && !loading ? (
        <main className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h1 className="font-display text-3xl text-ink">That space is gone</h1>
          <p className="mt-2 text-sm text-muted">
            It was deleted, or the link is wrong.{" "}
            <Link href="/app" className="text-accent-text underline underline-offset-2">
              Back to spaces
            </Link>
          </p>
        </main>
      ) : (
        children
      )}
    </div>
  );
}
