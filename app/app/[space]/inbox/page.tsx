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
import { useQuery } from "@/lib/data/use-store";
import {
  getSpace,
  listTestimonials,
  countsByStatus,
  setTestimonialStatus,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/data/store";
import type { Testimonial, TestimonialStatus } from "@/lib/database.types";

const TABS: Array<{ key: TestimonialStatus; label: string }> = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function when(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    if (hours === 0) return "Just now";
    return `${hours}h ago`;
  }
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function duration(s: number | null) {
  if (!s) return null;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function RowSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex gap-3">
        <Skeleton className="size-10 rounded-full" />
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

export default function InboxPage({ params }: { params: Promise<{ space: string }> }) {
  const { space: spaceId } = React.use(params);
  const [tab, setTab] = React.useState<TestimonialStatus>("pending");

  const { data: space } = useQuery(() => getSpace(spaceId), [spaceId]);
  const { data: counts } = useQuery(() => countsByStatus(spaceId), [spaceId]);
  const { data: rows, loading } = useQuery(() => listTestimonials(spaceId, tab), [spaceId, tab]);

  const [editing, setEditing] = React.useState<Testimonial | null>(null);
  const [playing, setPlaying] = React.useState<Testimonial | null>(null);
  const [removing, setRemoving] = React.useState<Testimonial | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function move(t: Testimonial, status: TestimonialStatus) {
    setBusyId(t.id);
    await setTestimonialStatus(t.id, status);
    setBusyId(null);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div
        role="tablist"
        aria-label="Testimonial status"
        className="mb-7 inline-flex gap-0.5 rounded-full border border-line bg-surface p-1 shadow-low"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-[120ms]",
              tab === t.key ? "bg-accent text-onaccent" : "text-muted hover:text-ink",
            )}
          >
            {t.label}
            {counts && counts[t.key] > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] tabular-nums",
                  tab === t.key ? "bg-black/15" : "bg-sunk text-subtle",
                )}
              >
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <RowSkeleton />
          <RowSkeleton />
        </div>
      ) : rows && rows.length > 0 ? (
        <ul className="space-y-4">
          {rows.map((t) => (
            <li key={t.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <Avatar name={t.author_name} src={t.author_avatar_url} size={40} />
                    <div className="min-w-0">
                      <p className="truncate font-medium leading-tight text-ink">
                        {t.author_name}
                      </p>
                      <p className="truncate text-[12.5px] leading-tight text-subtle">
                        {[t.author_role, t.author_company].filter(Boolean).join(", ") ||
                          "No role given"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.type === "video" && <Badge tone="accent">Video</Badge>}
                    <span className="text-[12px] text-subtle">{when(t.submitted_at)}</span>
                  </div>
                </div>

                {space?.show_ratings && t.rating ? (
                  <Stars value={t.rating} className="mt-3.5" />
                ) : null}

                {t.type === "video" ? (
                  <button
                    onClick={() => setPlaying(t)}
                    className="group relative mt-3.5 flex w-full items-center gap-4 rounded-md border border-line bg-sunk p-3 text-left transition-colors hover:bg-hover"
                  >
                    <span
                      className="grid size-14 shrink-0 place-items-center rounded-sm"
                      style={{
                        background:
                          "linear-gradient(150deg, color-mix(in oklab, var(--v-accent) 24%, var(--v-surface-sunk)), var(--v-surface-sunk))",
                      }}
                    >
                      <span className="grid size-9 place-items-center rounded-full bg-accent text-onaccent shadow-mid transition-transform duration-[220ms] ease-[var(--v-ease-out)] group-hover:scale-110">
                        <svg viewBox="0 0 16 16" className="size-3.5 translate-x-px" fill="currentColor" aria-hidden>
                          <path d="M4.5 2.6v10.8a.6.6 0 0 0 .92.5l8.4-5.4a.6.6 0 0 0 0-1L5.42 2.1a.6.6 0 0 0-.92.5Z" />
                        </svg>
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-medium text-ink">
                        Play video testimonial
                      </span>
                      <span className="block text-[12.5px] text-subtle">
                        {duration(t.video_duration_seconds) ?? "Unknown length"}
                      </span>
                    </span>
                  </button>
                ) : null}

                {t.body && (
                  <blockquote className="mt-3.5 text-[14.5px] leading-[1.62] text-ink">
                    {t.body}
                  </blockquote>
                )}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                  {t.status !== "approved" && (
                    <Button size="sm" loading={busyId === t.id} onClick={() => move(t, "approved")}>
                      Approve
                    </Button>
                  )}
                  {t.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={busyId === t.id}
                      onClick={() => move(t, "rejected")}
                    >
                      Reject
                    </Button>
                  )}
                  {t.status !== "pending" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={busyId === t.id}
                      onClick={() => move(t, "pending")}
                    >
                      Back to pending
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setEditing(t)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-danger hover:bg-danger/10 hover:text-danger"
                    onClick={() => setRemoving(t)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<QuoteGlyph className="h-4" />}
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
              <Link href={`/app/${spaceId}/settings`} className={buttonStyles("secondary", "md")}>
                Get the collection link
              </Link>
            ) : undefined
          }
        />
      )}

      {/* ---------- edit ---------- */}
      <EditDialog
        testimonial={editing}
        onClose={() => setEditing(null)}
        showRating={space?.show_ratings ?? true}
      />

      {/* ---------- video ---------- */}
      <Dialog
        open={Boolean(playing)}
        onClose={() => setPlaying(null)}
        title={playing ? `${playing.author_name}` : ""}
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

      {/* ---------- delete ---------- */}
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

/* Editing arrives with typos. Section 5.4 calls this out specifically. */
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
              className="min-h-36"
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
          <p className="text-[12.5px] text-subtle">
            Rated {testimonial.rating} of 5. Ratings are the submitter&rsquo;s and cannot be edited.
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}
