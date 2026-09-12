"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Avatar, Skeleton } from "@/components/ui/primitives";
import { Input, Textarea, Field, CharGuide } from "@/components/ui/field";
import { StarInput } from "@/components/ui/stars";
import { QuoteGlyph } from "@/components/ui/icons";
import { VideoRecorder } from "@/components/collect/video-recorder";
import { useQuery } from "@/lib/data/use-store";
import { collectionSpace, submitTestimonial, backend } from "@/lib/data";
import { putBlob } from "@/lib/data/blobs";
import { fileToScaledDataUrl } from "@/lib/image";

type Step = "choose" | "text" | "record" | "details" | "thanks";

type Recorded = { blob: Blob; durationSeconds: number; posterDataUrl: string | null };

export default function CollectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { data: space, loading } = useQuery(() => collectionSpace(slug), [slug]);

  const [step, setStep] = React.useState<Step>("choose");
  const [recorded, setRecorded] = React.useState<Recorded | null>(null);

  const [body, setBody] = React.useState("");
  const [rating, setRating] = React.useState(0);
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [consent, setConsent] = React.useState(false);

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Only one path enabled? Skip the choice entirely.
  React.useEffect(() => {
    if (!space || step !== "choose") return;
    if (space.allow_text && !space.allow_video) setStep("text");
    if (space.allow_video && !space.allow_text) setStep("record");
  }, [space, step]);

  if (loading) {
    return (
      <main className="mx-auto max-w-xl px-5 py-14">
        <Skeleton className="size-14 rounded-xl" />
        <Skeleton className="mt-5 h-9 w-full" />
        <Skeleton className="mt-2 h-9 w-2/3" />
        <Skeleton className="mt-8 h-12 w-full rounded-lg" />
      </main>
    );
  }

  if (!space) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl border border-line bg-sunk text-subtle">
          <QuoteGlyph className="h-3.5" />
        </div>
        <h1 className="font-display text-3xl text-ink">This link has expired</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          The space it pointed to was renamed or deleted. Ask whoever sent it for a fresh link.
        </p>
      </main>
    );
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setPhoto(await fileToScaledDataUrl(file, 256));
    } catch {
      setError("That file could not be read as an image.");
    }
  }

  const isVideo = Boolean(recorded);
  const canSubmit =
    name.trim().length > 0 &&
    consent &&
    (isVideo || body.trim().length > 0) &&
    (!space.require_photo || Boolean(photo));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!space || !canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      // Uploading before the row exists is deliberate: the storage policies
      // only check that the folder is a real space, so the file can land first
      // and a dropped connection leaves an orphan file rather than a row that
      // points at nothing.
      let videoUrl: string | null = null;
      let posterUrl: string | null = recorded?.posterDataUrl ?? null;

      if (recorded) {
        videoUrl = await putBlob(recorded.blob, space.id);
        if (recorded.posterDataUrl && backend === "supabase") {
          const poster = await (await fetch(recorded.posterDataUrl)).blob();
          posterUrl = await putBlob(poster, space.id);
        }
      }

      await submitTestimonial({
        p_slug: space.slug,
        p_type: recorded ? "video" : "text",
        p_author_name: name,
        p_consent: consent,
        p_body: body.trim() || null,
        p_rating: space.show_ratings && rating ? rating : null,
        p_video_url: videoUrl,
        p_video_duration: recorded?.durationSeconds ?? null,
        p_poster_url: posterUrl,
        p_author_role: role || null,
        p_author_company: company || null,
        p_author_avatar_url: photo,
      });
      setStep("thanks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="min-h-dvh bg-bg"
      style={{ ["--v-accent" as string]: space.accent_color } as React.CSSProperties}
    >
      <main className="mx-auto max-w-xl px-5 pb-20 pt-10 sm:pt-16">
        {/* ---------- branding ---------- */}
        <header className={cn("mb-8", step === "thanks" && "text-center")}>
          <Avatar
            name={space.name}
            src={space.logo_url}
            size={56}
            className={cn("rounded-xl", step === "thanks" && "mx-auto")}
          />
          {step !== "thanks" && (
            <>
              <p className="mt-4 text-[13px] font-medium uppercase tracking-wider text-subtle">
                {space.name}
              </p>
              <h1 className="mt-1.5 font-display text-[30px] leading-[1.15] tracking-[-0.02em] text-ink sm:text-[38px]">
                {space.prompt_question}
              </h1>
            </>
          )}
        </header>

        {/* ---------- choose ---------- */}
        {step === "choose" && (
          <div className="space-y-3">
            {space.allow_video && (
              <PathButton
                title="Record a video"
                note="Up to 90 seconds, straight from this page."
                onClick={() => setStep("record")}
                primary
                icon={
                  <svg viewBox="0 0 20 20" className="size-5" fill="currentColor" aria-hidden>
                    <path d="M2.5 5.5A2 2 0 0 1 4.5 3.5h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-9ZM15 7.7l2.6-1.75a.5.5 0 0 1 .78.42v7.26a.5.5 0 0 1-.78.42L15 12.3V7.7Z" />
                  </svg>
                }
              />
            )}
            {space.allow_text && (
              <PathButton
                title="Write instead"
                note="Two or three sentences. About a minute."
                onClick={() => setStep("text")}
                icon={
                  <svg viewBox="0 0 20 20" className="size-5" fill="currentColor" aria-hidden>
                    <path d="M13.6 2.4a2 2 0 0 1 2.83 2.83l-8.2 8.2-3.5.67.67-3.5 8.2-8.2ZM3 16.5h14a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5Z" />
                  </svg>
                }
              />
            )}
            <p className="pt-3 text-[13px] leading-relaxed text-subtle">
              No account needed. You choose what gets published, and {space.name} reviews it before
              it goes anywhere.
            </p>
          </div>
        )}

        {/* ---------- record ---------- */}
        {step === "record" && (
          <VideoRecorder
            prompt={space.prompt_question}
            onDone={(r) => {
              setRecorded(r);
              setStep("details");
            }}
            onCancel={() => setStep(space.allow_text ? "choose" : "record")}
          />
        )}

        {/* ---------- write ---------- */}
        {step === "text" && (
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <Field label="Your testimonial" htmlFor="body">
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What were you stuck on, and what changed?"
                  className="min-h-40 text-[15px]"
                  autoFocus
                />
              </Field>
              <CharGuide value={body} />
            </div>

            {space.show_ratings && (
              <div>
                <p className="mb-2 text-[13px] font-medium text-ink">How would you rate us?</p>
                <StarInput value={rating} onChange={setRating} />
              </div>
            )}

            <DetailsFields
              name={name}
              setName={setName}
              role={role}
              setRole={setRole}
              company={company}
              setCompany={setCompany}
              photo={photo}
              setPhoto={setPhoto}
              onPhoto={onPhoto}
              requirePhoto={space.require_photo}
            />

            <ConsentBox checked={consent} onChange={setConsent} spaceName={space.name} />

            {error && (
              <p role="alert" className="text-[13px] text-danger">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="lg" loading={busy} disabled={!canSubmit}>
                Send testimonial
              </Button>
              {space.allow_video && (
                <Button type="button" size="lg" variant="ghost" onClick={() => setStep("choose")}>
                  Back
                </Button>
              )}
            </div>
          </form>
        )}

        {/* ---------- details after a recording ---------- */}
        {step === "details" && (
          <form onSubmit={submit} className="space-y-6">
            <div className="flex items-center gap-3 rounded-md border border-accent-line bg-accent-soft px-4 py-3">
              <svg viewBox="0 0 20 20" className="size-5 shrink-0 text-accent-text" fill="currentColor" aria-hidden>
                <path d="M10 1.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8Zm3.9 5.7a.9.9 0 0 0-1.28 0L9 10.93 7.38 9.3A.9.9 0 0 0 6.1 10.6l2.26 2.26a.9.9 0 0 0 1.28 0l4.26-4.27a.9.9 0 0 0 0-1.28Z" />
              </svg>
              <p className="text-[13.5px] text-accent-text">
                Video recorded, {recorded?.durationSeconds}s. Just your details left.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRecorded(null);
                  setStep("record");
                }}
                className="ml-auto shrink-0 text-[13px] font-medium text-accent-text underline underline-offset-2"
              >
                Redo
              </button>
            </div>

            {space.show_ratings && (
              <div>
                <p className="mb-2 text-[13px] font-medium text-ink">How would you rate us?</p>
                <StarInput value={rating} onChange={setRating} />
              </div>
            )}

            <DetailsFields
              name={name}
              setName={setName}
              role={role}
              setRole={setRole}
              company={company}
              setCompany={setCompany}
              photo={photo}
              setPhoto={setPhoto}
              onPhoto={onPhoto}
              requirePhoto={space.require_photo}
            />

            <ConsentBox checked={consent} onChange={setConsent} spaceName={space.name} />

            {error && (
              <p role="alert" className="text-[13px] text-danger">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" loading={busy} disabled={!canSubmit}>
              Send testimonial
            </Button>
          </form>
        )}

        {/* ---------- thanks ---------- */}
        {step === "thanks" && (
          <div className="animate-settle text-center">
            <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-accent text-onaccent shadow-mid">
              <svg viewBox="0 0 20 20" className="size-6" fill="currentColor" aria-hidden>
                <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.8a1 1 0 0 1 1.4 0Z" />
              </svg>
            </div>
            <h1 className="font-display text-[32px] leading-tight tracking-[-0.02em] text-ink">
              {space.thankyou_message}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[14.5px] leading-relaxed text-muted">
              {space.name} will review it before anything is published. Nothing goes public without
              their approval, or yours.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function PathButton({
  title,
  note,
  icon,
  onClick,
  primary,
}: {
  title: string;
  note: string;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3.5 rounded-md border p-3.5 text-left transition-colors duration-[220ms] ease-[var(--v-ease-out)]",
        primary
          ? "border-accent text-accent hover:bg-[color-mix(in_srgb,var(--v-accent)_12%,transparent)]"
          : "border-line bg-surface text-ink hover:bg-hover",
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[14.5px] font-medium">{title}</span>
        <span className="block text-[12.5px] text-muted">{note}</span>
      </span>
      <svg viewBox="0 0 16 16" className="ml-auto size-4 shrink-0 text-subtle" fill="currentColor" aria-hidden>
        <path d="M5.72 3.22a.75.75 0 0 0 0 1.06L9.44 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06L6.78 3.22a.75.75 0 0 0-1.06 0Z" />
      </svg>
    </button>
  );
}

function DetailsFields({
  name,
  setName,
  role,
  setRole,
  company,
  setCompany,
  photo,
  setPhoto,
  onPhoto,
  requirePhoto,
}: {
  name: string;
  setName: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
  photo: string | null;
  setPhoto: (v: string | null) => void;
  onPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  requirePhoto: boolean;
}) {
  return (
    <div className="space-y-4">
      <Field label="Your name" htmlFor="name">
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Priya Raman"
          autoComplete="name"
          className="text-[15px]"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Role" htmlFor="role" optional>
          <Input
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Founder"
            autoComplete="organization-title"
          />
        </Field>
        <Field label="Company" htmlFor="company" optional>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Lantern Studio"
            autoComplete="organization"
          />
        </Field>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[13px] font-medium text-ink">Photo</p>
          {!requirePhoto && <span className="text-[12px] text-subtle">Optional</span>}
        </div>
        <div className="flex items-center gap-3">
          <Avatar name={name || "?"} src={photo} size={48} />
          <label className="cursor-pointer">
            <span className="inline-flex h-9 items-center rounded-sm border border-line bg-surface px-3 text-[13px] font-medium text-ink shadow-low transition-colors hover:bg-hover">
              {photo ? "Replace photo" : "Add a photo"}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={onPhoto}
            />
          </label>
          {photo && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setPhoto(null)}>
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ConsentBox({
  checked,
  onChange,
  spaceName,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  spaceName: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-md border p-4 transition-colors duration-[120ms]",
        checked ? "border-accent-line bg-accent-soft" : "border-line bg-surface hover:bg-hover",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4.5 shrink-0 accent-[var(--v-accent)]"
      />
      <span className="text-[13.5px] leading-relaxed text-ink">
        I&rsquo;m happy for {spaceName} to publish this testimonial, along with my name, role and
        photo, on their website and marketing.
      </span>
    </label>
  );
}
