"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Avatar, Skeleton } from "@/components/ui/primitives";
import { useQuery } from "@/lib/data/use-store";
import { getSpace } from "@/lib/data";

const TABS = [
  { slug: "inbox", label: "Inbox" },
  { slug: "wall", label: "Wall of love" },
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
      style={
        space
          ? ({ ["--v-accent" as string]: space.accent_color } as React.CSSProperties)
          : undefined
      }
    >
      <header className="mx-auto max-w-6xl px-6 pt-8 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {loading ? (
              <>
                <Skeleton className="size-9 rounded-md" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : space ? (
              <>
                <Avatar name={space.name} src={space.logo_url} size={36} className="rounded-md" />
                <div className="min-w-0">
                  <p className="truncate font-display text-[19px] leading-tight text-ink">
                    {space.name}
                  </p>
                  <p className="truncate font-mono text-[11.5px] leading-tight text-subtle">
                    vouch.app/c/{space.slug}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Space not found</p>
            )}
          </div>

          {/* Segmented control, per the spec -- one bordered group, inset ring
              on the current section rather than an underline. */}
          <nav
            aria-label="Space sections"
            className="inline-flex overflow-hidden rounded-md border border-line"
          >
            {TABS.map((t, i) => {
              const href = `/app/${spaceId}/${t.slug}`;
              const active = pathname === href;
              return (
                <Link
                  key={t.slug}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "px-3.5 py-1.5 text-[13px] transition-colors duration-[120ms]",
                    i > 0 && "border-l border-line",
                    active
                      ? "bg-accent-soft text-accent-text font-medium"
                      : "text-muted hover:bg-[color-mix(in_srgb,var(--v-text)_7%,transparent)]",
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="rule-fade mt-6" />
      </header>

      {space === null && !loading ? (
        <main className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h1 className="font-display text-[28px] text-ink">That space is gone</h1>
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
