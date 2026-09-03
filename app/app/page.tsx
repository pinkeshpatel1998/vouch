"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, Badge, Avatar, Skeleton, EmptyState } from "@/components/ui/primitives";
import { Dialog } from "@/components/ui/dialog";
import { Input, Field } from "@/components/ui/field";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { QuoteGlyph } from "@/components/ui/icons";
import { useQuery } from "@/lib/data/use-store";
import { listSpacesOverview, createSpace, slugify } from "@/lib/data/store";
import { seedDemoSpace } from "@/lib/data/seed";

function SpaceCardSkeleton() {
  return (
    <Card className="p-5">
      <Skeleton className="size-10 rounded-lg" />
      <Skeleton className="mt-3.5 h-4 w-32" />
      <Skeleton className="mt-2 h-3 w-24" />
      <div className="mt-5 flex gap-2 border-t border-line pt-4">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { data: spaces, loading } = useQuery(() => listSpacesOverview(), []);

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

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
      <header className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[40px] leading-none tracking-[-0.03em] text-ink">
            Spaces
          </h1>
          <p className="mt-2 text-sm text-muted">
            One space per product or client. Each has its own link, branding and wall.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={() => setCreating(true)}>
            <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
              <path d="M8 2.75a.75.75 0 0 1 .75.75v3.75h3.75a.75.75 0 0 1 0 1.5H8.75v3.75a.75.75 0 0 1-1.5 0V8.75H3.5a.75.75 0 0 1 0-1.5h3.75V3.5A.75.75 0 0 1 8 2.75Z" />
            </svg>
            New space
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SpaceCardSkeleton />
          <SpaceCardSkeleton />
          <SpaceCardSkeleton />
        </div>
      ) : spaces && spaces.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((s) => (
            <li key={s.id} style={{ ["--v-accent" as string]: s.accent_color }}>
              <Link
                href={`/app/${s.id}/inbox`}
                className="group block h-full rounded-lg border border-line bg-surface p-5 shadow-low transition-[box-shadow,transform,border-color] duration-[220ms] ease-[var(--v-ease-out)] hover:-translate-y-0.5 hover:border-line-strong hover:shadow-mid"
              >
                <Avatar name={s.name} src={s.logo_url} size={40} className="rounded-lg" />
                <p className="mt-3.5 font-medium leading-tight text-ink">{s.name}</p>
                <p className="mt-1 font-mono text-[12px] text-subtle">/c/{s.slug}</p>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                  {s.pending > 0 ? (
                    <Badge tone="pending" dot>
                      {s.pending} pending
                    </Badge>
                  ) : null}
                  <Badge tone={s.approved > 0 ? "approved" : "neutral"} dot={s.approved > 0}>
                    {s.approved} approved
                  </Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<QuoteGlyph className="h-4" />}
          title="No spaces yet"
          body="A space holds one product's testimonials. Create an empty one, or load a demo with thirteen sample testimonials to click around in."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => setCreating(true)}>Create a space</Button>
              <Button variant="secondary" loading={seeding} onClick={loadDemo}>
                Load a demo space
              </Button>
            </div>
          }
        />
      )}

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="New space"
        description="Name it after the product or client. You can change everything else afterwards."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button form="new-space" type="submit" loading={busy} disabled={!name.trim()}>
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
                ? `Collection link will be /c/${slugify(name) || "space"}`
                : "Used on the collection page your customers see."
            }
          >
            <Input
              id="space-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lantern Studio"
              autoFocus
              maxLength={80}
            />
          </Field>
        </form>
      </Dialog>
    </main>
  );
}
