"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Avatar, Skeleton, EmptyState } from "@/components/ui/primitives";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { QuoteGlyph } from "@/components/ui/icons";
import { useQuery } from "@/lib/data/use-store";
import { listActivity, listSpacesOverview } from "@/lib/data";
import { when, StatusTag, TypeTag } from "@/components/activity-bits";
import type { TestimonialStatus } from "@/lib/database.types";

type Filter = "all" | TestimonialStatus;

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function SubmissionsPage() {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [spaceId, setSpaceId] = React.useState<string>("all");

  const { data: spaces } = useQuery(() => listSpacesOverview(), []);
  const { data: rows, loading } = useQuery(
    () =>
      listActivity({
        status: filter === "all" ? undefined : filter,
        spaceId: spaceId === "all" ? undefined : spaceId,
      }),
    [filter, spaceId],
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-8 sm:py-10">
      <header className="mb-6">
        <h1 className="font-display text-[32px] text-ink">All submissions</h1>
        <p className="mt-1 text-[13px] text-muted">
          Everything that has arrived, across every space.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Nocturne segmented control: one bordered group, inset ring on the
            selected option rather than a filled pill. */}
        <div
          role="tablist"
          aria-label="Filter by status"
          className="inline-flex overflow-hidden rounded-md border border-line"
        >
          {FILTERS.map((f, i) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 text-[13px] transition-colors duration-[120ms]",
                i > 0 && "border-l border-line",
                filter === f.key
                  ? "text-accent shadow-[inset_0_0_0_1px_var(--v-accent)]"
                  : "text-muted hover:bg-[color-mix(in_srgb,var(--v-text)_7%,transparent)]",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {spaces && spaces.length > 1 && (
          <select
            aria-label="Filter by space"
            value={spaceId}
            onChange={(e) => setSpaceId(e.target.value)}
            className="min-h-9 rounded-md border border-line bg-surface px-2.5 text-[13px] text-ink"
          >
            <option value="all">Every space</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-11 w-full rounded-md" />
          ))}
        </div>
      ) : rows && rows.length > 0 ? (
        <Table>
          <Thead>
            <Th>Author</Th>
            <Th>Space</Th>
            <Th>Type</Th>
            <Th>Status</Th>
            <Th className="text-right">When</Th>
          </Thead>
          <tbody>
            {rows.map((t) => (
              <Tr key={t.id} className="hover:bg-[color-mix(in_srgb,var(--v-text)_4%,transparent)]">
                <Td>
                  <Link
                    href={`/app/${t.space_id}/inbox`}
                    className="flex items-center gap-2.5 text-ink hover:text-accent"
                  >
                    <Avatar name={t.author_name} src={t.author_avatar_url} size={24} />
                    <span className="min-w-0">
                      <span className="block truncate">{t.author_name}</span>
                      {(t.author_role || t.author_company) && (
                        <span className="block truncate text-[11.5px] text-subtle">
                          {[t.author_role, t.author_company].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </span>
                  </Link>
                </Td>
                <Td className="text-muted">{t.space_name}</Td>
                <Td className="text-muted">
                  <TypeTag t={t} />
                </Td>
                <Td>
                  <StatusTag status={t.status} />
                </Td>
                <Td className="whitespace-nowrap text-right text-subtle">{when(t.submitted_at)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState
          icon={<QuoteGlyph className="h-3.5" />}
          title={filter === "all" ? "Nothing yet" : `Nothing ${filter}`}
          body={
            filter === "all"
              ? "Submissions from every space land here as they arrive."
              : "Change the filter above to see the rest."
          }
        />
      )}
    </main>
  );
}
