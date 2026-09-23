"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Avatar,
  Skeleton,
  EmptyState,
} from "@/components/ui/primitives";
import { Dialog } from "@/components/ui/dialog";
import { Input, Field } from "@/components/ui/field";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { QuoteGlyph } from "@/components/ui/icons";
import { useQuery } from "@/lib/data/use-store";
import {
  listSpacesOverview,
  listActivity,
  totals,
  createSpace,
  slugify,
} from "@/lib/data";
import { seedDemoSpace } from "@/lib/data/seed";
import { when, StatusTag, TypeTag } from "@/components/activity-bits";

function CardSkeleton() {
  return (
    <div className="rounded-md bg-surface p-4 shadow-low">
      <Skeleton className="size-8 rounded-md" />
      <Skeleton className="mt-3 h-4 w-28" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-20 rounded-[6px]" />
        <Skeleton className="h-5 w-16 rounded-[6px]" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { data: spaces, loading } = useQuery(() => listSpacesOverview(), []);
  const { data: activity } = useQuery(() => listActivity({ limit: 6 }), []);
  const { data: count } = useQuery(() => totals(), []);

  const [creating, setCreating] = React.useState(false);
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [seeding, setSeeding] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const space = await createSpace({ name });
    setBusy(false);
    setCreating(false);
    setName("");
    router.push(`/app/${space.id}/settings`);
  }

  async function loadDemo() {
    setSeeding(true);
    const space = await seedDemoSpace();
    setSeeding(false);
    router.push(`/app/${space.id}/inbox`);
  }

  const subtitle =
    count && count.spaces > 0
      ? `${count.spaces} ${count.spaces === 1 ? "space" : "spaces"}, ${count.collected} testimonials collected.`
      : "Good words start here. Let’s give yours a home.";

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 sm:px-10 sm:py-10">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] text-ink">
            Your happy place
          </h1>
          <p className="mt-1 text-[13px] text-muted">{subtitle}</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <svg
            viewBox="0 0 16 16"
            className="size-3.5"
            fill="currentColor"
            aria-hidden
          >
            <path d="M8 2.75a.75.75 0 0 1 .75.75v3.75h3.75a.75.75 0 0 1 0 1.5H8.75v3.75a.75.75 0 0 1-1.5 0V8.75H3.5a.75.75 0 0 1 0-1.5h3.75V3.5A.75.75 0 0 1 8 2.75Z" />
          </svg>
          New space
        </Button>
      </header>

      <section className="dashboard-intro">
        <div>
          <span className="eyebrow-label">
            A LITTLE PROOF. A LOT OF POSSIBILITY.
          </span>
          <h2>
            Good work deserves
            <br />
            <em>to be talked about.</em>
          </h2>
          <p>
            Collect the stories, celebrate your customers, and turn the good
            words into your next great impression.
          </p>
        </div>
        <span aria-hidden="true">✳</span>
      </section>
      <div className="stat-grid" aria-label="Workspace totals">
        <div className="stat-card">
          <span>Your spaces</span>
          <strong>{count?.spaces ?? "—"}</strong>
        </div>
        <div className="stat-card">
          <span>Good words collected</span>
          <strong>{count?.collected ?? "—"}</strong>
        </div>
        <div className="stat-card">
          <span>Waiting for your review</span>
          <strong>{count?.pending ?? "—"}</strong>
        </div>
      </div>
      <h2 className="spaces-heading">
        Your spaces{" "}
        <span className="ml-1 text-subtle">({count?.spaces ?? 0})</span>
      </h2>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : spaces && spaces.length > 0 ? (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((s) => (
              <li
                key={s.id}
                style={{ ["--v-accent" as string]: s.accent_color }}
              >
                <Link
                  href={`/app/${s.id}/inbox`}
                  className={cn(
                    "space-tile block h-full rounded-lg bg-surface p-6 shadow-low",
                    "transition-[box-shadow,background-color,transform] duration-[220ms] ease-[var(--v-ease-out)]",
                    "hover:bg-hover hover:shadow-mid",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      name={s.name}
                      src={s.logo_url}
                      size={28}
                      className="rounded-md"
                    />
                    <span className="font-display text-[17px] text-ink">
                      {s.name}
                    </span>
                  </div>
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {s.pending > 0 && (
                      <Badge tone="pending">{s.pending} pending</Badge>
                    )}
                    <Badge tone={s.approved > 0 ? "accent" : "neutral"}>
                      {s.approved} live
                    </Badge>
                  </div>
                  <p className="mt-3.5 flex items-center gap-1.5 font-mono text-[11.5px] text-subtle">
                    <svg
                      viewBox="0 0 16 16"
                      className="size-3"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M6.4 9.6a2.5 2.5 0 0 0 3.54 0l2.12-2.12a2.5 2.5 0 0 0-3.54-3.54l-.7.71 1.06 1.06.7-.7a1 1 0 1 1 1.42 1.41L8.88 8.54a1 1 0 0 1-1.42 0L6.4 9.6Z" />
                      <path d="M9.6 6.4a2.5 2.5 0 0 0-3.54 0L3.94 8.52a2.5 2.5 0 0 0 3.54 3.54l.7-.71-1.06-1.06-.7.7a1 1 0 1 1-1.42-1.41l2.12-2.12a1 1 0 0 1 1.42 0L9.6 6.4Z" />
                    </svg>
                    vouch.app/c/{s.slug}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {activity && activity.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3 text-[11px] uppercase tracking-[0.08em] text-subtle">
                Recent activity
              </h2>
              <Table>
                <Thead>
                  <Th>Author</Th>
                  <Th>Space</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th className="text-right">When</Th>
                </Thead>
                <tbody>
                  {activity.map((t) => (
                    <Tr
                      key={t.id}
                      className="hover:bg-[color-mix(in_srgb,var(--v-text)_4%,transparent)]"
                    >
                      <Td className="text-ink">{t.author_name}</Td>
                      <Td className="text-muted">{t.space_name}</Td>
                      <Td className="text-muted">
                        <TypeTag t={t} />
                      </Td>
                      <Td>
                        <StatusTag status={t.status} />
                      </Td>
                      <Td className="whitespace-nowrap text-right text-subtle">
                        {when(t.submitted_at)}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
              <Link
                href="/app/submissions"
                className="mt-3 inline-block text-[13px] text-accent hover:underline"
              >
                All submissions →
              </Link>
            </section>
          )}
        </>
      ) : (
        <EmptyState
          icon={<QuoteGlyph className="h-3.5" />}
          title="Your next good story starts here"
          body="Create a space for your product or client, then invite your customers to share. Want a look around first? Explore a space filled with sample stories."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => setCreating(true)}>New space</Button>
              <Button variant="secondary" loading={seeding} onClick={loadDemo}>
                Load demo space
              </Button>
            </div>
          }
        />
      )}

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="New space"
        description="Name it after the product or client. Everything else is editable afterwards."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button
              form="new-space"
              type="submit"
              loading={busy}
              disabled={!name.trim()}
            >
              Create space
            </Button>
          </>
        }
      >
        <form id="new-space" onSubmit={submit}>
          <Field
            label="Space name"
            htmlFor="space-name"
            hint={
              name.trim()
                ? `Collection link will be vouch.app/c/${slugify(name) || "space"}`
                : "Shown on the collection page your customers see."
            }
          >
            <Input
              id="space-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fernway"
              autoFocus
              maxLength={80}
            />
          </Field>
        </form>
      </Dialog>
    </main>
  );
}
