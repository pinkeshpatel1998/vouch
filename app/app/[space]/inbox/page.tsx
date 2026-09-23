"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card, Badge, Avatar, Skeleton, EmptyState } from "@/components/ui/primitives";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea, Field } from "@/components/ui/field";
import { Stars } from "@/components/ui/stars";
import { VideoPlayer } from "@/components/ui/video-player";
import { QuoteGlyph } from "@/components/ui/icons";
import { when, duration } from "@/components/activity-bits";
import { useQuery } from "@/lib/data/use-store";
import {
  getSpace,
  listTestimonials,
  countsByStatus,
  listIncompleteUploads,
  setTestimonialStatus,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/data";
import type { Testimonial, TestimonialStatus } from "@/lib/database.types";

const TABS: Array<{ key: TestimonialStatus; label: string }> = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function RowSkeleton() {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex gap-3">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </Card>
  );
}

/* An upload that never landed. The row is kept because it carries the author's
   details -- the owner can see who to chase rather than losing them silently. */
function FailedUploads({ rows }: { rows: Testimonial[] }) {
  const [sent, setSent] = React.useState<string[]>([]);
  if (rows.length === 0) return null;

  return (
    <div className="mt-6 rounded-md border border-[color-mix(in_srgb,var(--v-danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--v-danger)_9%,transparent)] p-4">
      <div className="flex items-start gap-2.5">
        <svg
          viewBox="0 0 20 20"
          className="mt-0.5 size-4 shrink-0 text-danger"
          fill="currentColor"
          aria-hidden
        >
          <path d="M10 1.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4Zm0 3.6a.9.9 0 0 0-.9.9v4.2a.9.9 0 0 0 1.8 0V6.3a.9.9 0 0 0-.9-.9Zm0 8.1a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1Z" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-medium text-ink">
            {rows.length === 1
              ? "One video failed to upload"
              : `${rows.length} videos failed to upload`}
          </p>
          <ul className="mt-1.5 space-y-2">
            {rows.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[12.5px] leading-relaxed text-muted">
                  <span className="text-ink">{t.author_name}</span>
                  {t.video_duration_seconds
                    ? `'s recording stopped at ${t.video_duration_seconds}s`
                    : "'s recording never arrived"}
                  {" — the connection dropped mid-upload."}
                </span>
                {sent.includes(t.id) ? (
                  <span className="text-[12.5px] text-success">Re-record link sent</span>
                ) : (
                  <button
                    onClick={() => setSent((s) => [...s, t.id])}
                    className="text-[12.5px] text-accent underline underline-offset-2 hover:no-underline"
                  >
                    Send a re-record link
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function InboxPage({ params }: { params: Promise<{ space: string }> }) {
  const { space: spaceId } = React.use(params);
  const [tab, setTab] = React.useState<TestimonialStatus>("pending");

  const { data: space } = useQuery(() => getSpace(spaceId), [spaceId]);
  const { data: counts } = useQuery(() => countsByStatus(spaceId), [spaceId]);
  const { data: rows, loading } = useQuery(() => listTestimonials(spaceId, tab), [spaceId, tab]);
  const { data: failed } = useQuery(() => listIncompleteUploads(spaceId), [spaceId]);

  const [editing, setEditing] = React.useState<Testimonial | null>(null);
  const [playing, setPlaying] = React.useState<Testimonial | null>(null);
  const [removing, setRemoving] = React.useState<Testimonial | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function move(t: Testimonial, status: TestimonialStatus) {
    setBusyId(t.id);
    setError(null);
    try {
      await setTestimonialStatus(t.id, status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work.");
    } finally {
      setBusyId(null);
    }
  }

  const visible = rows?.filter((t) => !(t.type === "video" && !t.video_url)) ?? [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div
        role="tablist"
        aria-label="Testimonial status"
        className="mb-6 inline-flex overflow-hidden rounded-md border border-line"
      >
        {TABS.map((t, i) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-[13px] transition-colors duration-[120ms]",
              i > 0 && "border-l border-line",
              tab === t.key
                ? "bg-accent-soft text-accent-text font-medium"
                : "text-muted hover:bg-[color-mix(in_srgb,var(--v-text)_7%,transparent)]",
            )}
          >
            {t.label}
            {counts && counts[t.key] > 0 && (
              <span className="text-[11px] tabular-nums opacity-70">{counts[t.key]}</span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4 text-[13px] text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          <RowSkeleton />
          <RowSkeleton />
        </div>
      ) : visible.length > 0 ? (
        <ul className="space-y-3">
          {visible.map((t) => (
            <li key={t.id}>
              <Card className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <Avatar name={t.author_name} src={t.author_avatar_url} size={36} />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] leading-tight text-ink">
                        {t.author_name}
                      </p>
                      <p className="truncate text-[12px] leading-tight text-subtle">
                        {[t.author_role, t.author_company].filter(Boolean).join(", ") ||
                          "No role given"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {space?.show_ratings && t.rating ? <Stars value={t.rating} size={13} /> : null}
                    <Badge tone={t.type === "video" ? "accent" : "neutral"}>
                      {t.type === "video" ? "Video" : "Text"}
                    </Badge>
                  </div>
                </div>

                {t.type === "video" ? (
                  <button
                    onClick={() => setPlaying(t)}
                    className="group mt-3.5 flex w-full items-center gap-3.5 rounded-md bg-sunk p-2.5 text-left transition-colors hover:bg-hover"
                  >
                    <span
                      className="relative grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-sm"
                      style={{
                        background:
                          "linear-gradient(150deg, color-mix(in srgb, var(--v-accent) 30%, var(--v-surface-sunk)), var(--v-surface-sunk))",
                      }}
                    >
                      <span className="grid size-8 place-items-center rounded-full bg-[color-mix(in_srgb,var(--v-text)_92%,transparent)] transition-transform duration-[220ms] ease-[var(--v-ease-out)] group-hover:scale-110">
                        <svg viewBox="0 0 16 16" className="size-3 translate-x-px text-bg" fill="currentColor" aria-hidden>
                          <path d="M4.5 2.6v10.8a.6.6 0 0 0 .92.5l8.4-5.4a.6.6 0 0 0 0-1L5.42 2.1a.6.6 0 0 0-.92.5Z" />
                        </svg>
                      </span>
                      {duration(t.video_duration_seconds) && (
                        <span className="absolute bottom-1 right-1 rounded-xs bg-black/70 px-1 text-[10px] tabular-nums text-white">
                          {duration(t.video_duration_seconds)}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 text-[13px] leading-relaxed text-muted">
                      {t.body || "Video testimonial"}
                    </span>
                  </button>
                ) : null}

                {t.type === "text" && t.body && (
                  <blockquote className="mt-3 text-[14px] leading-[1.6] text-ink">
                    {t.body}
                  </blockquote>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {t.status !== "approved" && (
                    <Button size="sm" loading={busyId === t.id} onClick={() => move(t, "approved")}>
                      <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
                        <path d="M13.4 4.3a.9.9 0 0 1 0 1.27l-6 6a.9.9 0 0 1-1.27 0L3.1 8.54a.9.9 0 0 1 1.27-1.27l2.4 2.4 5.36-5.37a.9.9 0 0 1 1.27 0Z" />
                      </svg>
                      Approve
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => setEditing(t)}>
                    Edit text
                  </Button>
                  {t.status !== "rejected" && (
                    <Button size="sm" variant="secondary" onClick={() => move(t, "rejected")}>
                      Reject
                    </Button>
                  )}
                  {t.status !== "pending" && (
                    <Button size="sm" variant="ghost" onClick={() => move(t, "pending")}>
                      Back to pending
                    </Button>
                  )}
                  <span className="ml-auto flex items-center gap-2">
                    <span className="text-[12px] text-subtle">{when(t.submitted_at)}</span>
                    <button
                      onClick={() => setRemoving(t)}
                      aria-label={`Delete testimonial from ${t.author_name}`}
                      className="rounded-md p-1.5 text-subtle transition-colors hover:bg-[color-mix(in_srgb,var(--v-danger)_14%,transparent)] hover:text-danger"
                    >
                      <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
                        <path d="M6.5 1.5h3a.75.75 0 0 1 .75.75V3h3a.75.75 0 0 1 0 1.5h-.6l-.6 8.4a2 2 0 0 1-2 1.85H6a2 2 0 0 1-2-1.85L3.4 4.5h-.6a.75.75 0 0 1 0-1.5h3v-.75a.75.75 0 0 1 .75-.75Z" />
                      </svg>
                    </button>
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<QuoteGlyph className="h-3.5" />}
          title={
            tab === "pending"
              ? "Nothing waiting"
              : tab === "approved"
                ? "Nothing approved yet"
                : "Nothing rejected"
          }
          body={
            tab === "pending"
              ? "New submissions land here first. Send your collection link to five customers and check back tomorrow."
              : tab === "approved"
                ? "Approve a testimonial and it appears here, and on your wall."
                : "Rejected testimonials stay here rather than being deleted, so you can change your mind."
          }
          action={
            tab === "pending" ? (
              <Link href={`/app/${spaceId}/settings`} className={buttonStyles("primary", "md")}>
                Get the collection link
              </Link>
            ) : undefined
          }
        />
      )}

      {tab === "pending" && <FailedUploads rows={failed ?? []} />}

      <EditDialog
        testimonial={editing}
        onClose={() => setEditing(null)}
        showRating={space?.show_ratings ?? true}
      />

      <Dialog
        open={Boolean(playing)}
        onClose={() => setPlaying(null)}
        title={playing ? playing.author_name : ""}
        description={
          playing
            ? [playing.author_role, playing.author_company].filter(Boolean).join(", ") || undefined
            : undefined
        }
        className="w-[min(34rem,calc(100vw-2rem))]"
      >
        {playing && (
          <VideoPlayer stored={playing.video_url} poster={playing.poster_url} autoPlay />
        )}
      </Dialog>

      <Dialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Delete this testimonial?"
        description="It is removed for good, including from any wall showing it. Rejecting instead keeps it out of public view but recoverable."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (removing) await deleteTestimonial(removing.id);
                setRemoving(null);
              }}
            >
              Delete permanently
            </Button>
          </>
        }
      />
    </main>
  );
}

/* Editing matters: real testimonials arrive with typos and owners want to fix
   them before they go public. */
function EditDialog({
  testimonial,
  onClose,
  showRating,
}: {
  testimonial: Testimonial | null;
  onClose: () => void;
  showRating: boolean;
}) {
  const [body, setBody] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!testimonial) return;
    setBody(testimonial.body ?? "");
    setName(testimonial.author_name);
    setRole(testimonial.author_role ?? "");
    setCompany(testimonial.author_company ?? "");
  }, [testimonial]);

  async function save() {
    if (!testimonial) return;
    setBusy(true);
    await updateTestimonial(testimonial.id, {
      body: body.trim() || null,
      author_name: name.trim() || testimonial.author_name,
      author_role: role.trim() || null,
      author_company: company.trim() || null,
    });
    setBusy(false);
    onClose();
  }

  return (
    <Dialog
      open={Boolean(testimonial)}
      onClose={onClose}
      title="Edit testimonial"
      description="Fix typos and tighten wording. Do not change what they meant."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} onClick={save}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {testimonial?.type === "text" && (
          <Field label="Testimonial" htmlFor="edit-body">
            <Textarea
              id="edit-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-32"
            />
          </Field>
        )}
        <Field label="Name" htmlFor="edit-name">
          <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role" htmlFor="edit-role" optional>
            <Input id="edit-role" value={role} onChange={(e) => setRole(e.target.value)} />
          </Field>
          <Field label="Company" htmlFor="edit-company" optional>
            <Input id="edit-company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </Field>
        </div>
        {showRating && testimonial?.rating ? (
          <p className="text-[12px] text-subtle">
            Rated {testimonial.rating} of 5. Ratings are the submitter&rsquo;s and cannot be edited.
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}
