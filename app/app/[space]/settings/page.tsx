"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, Avatar, Skeleton } from "@/components/ui/primitives";
import { Input, Textarea, Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Dialog } from "@/components/ui/dialog";
import { useQuery } from "@/lib/data/use-store";
import { getSpace, updateSpace, deleteSpace } from "@/lib/data";
import { fileToScaledDataUrl } from "@/lib/image";
import type { Space } from "@/lib/database.types";

const ACCENTS = [
  "#b84925", // burnt orange — the system default
  "#52734d", // forest
  "#a76b43", // clay
  "#486c9c", // steel
  "#aa526c", // rose
  "#4d5548", // olive
];

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 border-t border-line py-8 first:border-t-0 first:pt-0 lg:grid-cols-[15rem_1fr] lg:gap-10">
      <div>
        <h2 className="font-display text-xl leading-tight text-ink">{title}</h2>
        {note && <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{note}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function SettingsPage({ params }: { params: Promise<{ space: string }> }) {
  const { space: spaceId } = React.use(params);
  const router = useRouter();
  const { data: loaded, loading } = useQuery(() => getSpace(spaceId), [spaceId]);

  const [draft, setDraft] = React.useState<Space | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [qr, setQr] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [logoError, setLogoError] = React.useState<string | null>(null);

  // Adopt the loaded row once. After that the draft is the source of truth, so
  // a background refresh cannot yank the field you are typing in.
  React.useEffect(() => {
    if (loaded && !draft) setDraft(loaded);
  }, [loaded, draft]);

  const link =
    draft && typeof window !== "undefined" ? `${window.location.origin}/c/${draft.slug}` : "";

  React.useEffect(() => {
    if (!link) return;
    QRCode.toDataURL(link, {
      width: 320,
      margin: 1,
      color: { dark: "#12141d", light: "#e9e9ed" },
    })
      .then(setQr)
      .catch(() => setQr(null));
  }, [link]);

  /* Debounced autosave. Toggles feel immediate; text does not thrash the store. */
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  function patch(next: Partial<Space>) {
    setDraft((d) => (d ? { ...d, ...next } : d));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await updateSpace(spaceId, next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    }, 500);
  }

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLogoError(null);
    try {
      patch({ logo_url: await fileToScaledDataUrl(file, 256) });
    } catch {
      setLogoError("That file could not be read as an image.");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function remove() {
    setDeleting(true);
    await deleteSpace(spaceId);
    router.push("/app");
  }

  if (loading || !draft) {
    return (
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="grid gap-5 lg:grid-cols-[15rem_1fr] lg:gap-10">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </div>
          </div>
        ))}
      </main>
    );
  }

  const bothPathsOff = !draft.allow_text && !draft.allow_video;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-2 flex h-6 items-center justify-end">
        <span
          role="status"
          className={`text-[12.5px] text-subtle transition-opacity duration-[220ms] ${
            saved ? "opacity-100" : "opacity-0"
          }`}
        >
          Saved
        </span>
      </div>

      <Section title="Identity" note="What a customer sees at the top of your collection page.">
        <div className="space-y-5">
          <Field label="Space name" htmlFor="name">
            <Input
              id="name"
              value={draft.name}
              maxLength={80}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </Field>

          <div>
            <p className="mb-2 text-[13px] font-medium text-ink">Logo</p>
            <div className="flex items-center gap-4">
              <Avatar name={draft.name} src={draft.logo_url} size={56} className="rounded-lg" />
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer">
                  <span className="inline-flex h-8 items-center rounded-sm border border-line bg-surface px-3 text-[13px] font-medium text-ink shadow-low transition-colors hover:bg-hover">
                    {draft.logo_url ? "Replace" : "Upload"}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="sr-only"
                    onChange={onLogo}
                  />
                </label>
                {draft.logo_url && (
                  <Button variant="ghost" size="sm" onClick={() => patch({ logo_url: null })}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
            {logoError && <p className="mt-2 text-[12.5px] text-danger">{logoError}</p>}
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-ink">Accent colour</p>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-label={`Accent ${a}`}
                  aria-pressed={draft.accent_color === a}
                  onClick={() => patch({ accent_color: a })}
                  className="size-8 rounded-full border-2 transition-transform duration-[120ms] hover:scale-110"
                  style={{
                    background: a,
                    borderColor: draft.accent_color === a ? "var(--v-text)" : "transparent",
                  }}
                />
              ))}
              <label className="ml-1 inline-flex cursor-pointer items-center gap-2 rounded-sm border border-line bg-surface px-2.5 py-1.5 text-[12.5px] text-muted shadow-low transition-colors hover:bg-hover">
                Custom
                <input
                  type="color"
                  className="size-5 cursor-pointer rounded-xs border-0 bg-transparent p-0"
                  onChange={(e) => patch({ accent_color: e.target.value })}
                />
              </label>
            </div>
            <p className="mt-2 text-[12.5px] text-subtle">
              Everything else derives from this — buttons, stars, the wall.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="What you ask"
        note="One clear question gets better answers than an open text box."
      >
        <div className="space-y-5">
          <Field label="Prompt question" htmlFor="prompt">
            <Input
              id="prompt"
              value={draft.prompt_question}
              maxLength={200}
              onChange={(e) => patch({ prompt_question: e.target.value })}
            />
          </Field>
          <Field
            label="Thank-you message"
            htmlFor="thanks"
            hint="Shown after they submit. This is the last thing they read, so make it sound like you."
          >
            <Textarea
              id="thanks"
              value={draft.thankyou_message}
              maxLength={400}
              className="min-h-24"
              onChange={(e) => patch({ thankyou_message: e.target.value })}
            />
          </Field>
        </div>
      </Section>

      <Section title="What you collect" note="Turning a path off hides it on the collection page.">
        <Card className="px-5 py-1">
          <div className="divide-y divide-line">
            <Switch
              checked={draft.allow_text}
              onChange={(v) => patch({ allow_text: v })}
              label="Allow written testimonials"
              description="A textarea with a star rating."
            />
            <Switch
              checked={draft.allow_video}
              onChange={(v) => patch({ allow_video: v })}
              label="Allow video testimonials"
              description="Recorded in the browser, capped at 90 seconds."
            />
            <Switch
              checked={draft.require_photo}
              onChange={(v) => patch({ require_photo: v })}
              label="Require a photo"
              description="Walls look better with faces, but this lowers completion."
            />
            <Switch
              checked={draft.show_ratings}
              onChange={(v) => patch({ show_ratings: v })}
              label="Show star ratings"
              description="Hides stars everywhere, including on the wall."
            />
          </div>
        </Card>
        {bothPathsOff && (
          <p role="alert" className="mt-3 flex items-start gap-2 text-[12.5px] text-danger">
            <svg viewBox="0 0 16 16" className="mt-0.5 size-3.5 shrink-0" fill="currentColor" aria-hidden>
              <path d="M8 1.5 15 14H1L8 1.5Zm0 4.25a.75.75 0 0 0-.75.75v2.75a.75.75 0 0 0 1.5 0V6.5A.75.75 0 0 0 8 5.75Zm0 6.75a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
            </svg>
            With both paths off your collection page has nothing to offer. Turn at least one back
            on.
          </p>
        )}
      </Section>

      <Section title="Your link" note="Send this to customers. They never sign in.">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex gap-2">
              <Input readOnly value={link} className="font-mono text-[12.5px]" />
              <Button variant="secondary" onClick={copyLink} className="shrink-0">
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => window.open(`/c/${draft.slug}`, "_blank")}>
              Open collection page
              <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
                <path d="M6 3.5a.75.75 0 0 0 0 1.5h2.44L4.22 9.22a.75.75 0 1 0 1.06 1.06L9.5 6.06V8.5a.75.75 0 0 0 1.5 0v-4a.75.75 0 0 0-.75-.75H6Z" />
                <path d="M3.5 5.75A2.25 2.25 0 0 1 5.75 3.5h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-1a.75.75 0 0 1 1.5 0v1a2.25 2.25 0 0 1-2.25 2.25h-4.5A2.25 2.25 0 0 1 3.5 10.25v-4.5Z" />
              </svg>
            </Button>
          </div>
          <div className="shrink-0 text-center">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt={`QR code linking to ${link}`}
                className="size-32 rounded-md border border-line bg-[#e9e9ed] p-1.5"
              />
            ) : (
              <Skeleton className="size-32 rounded-md" />
            )}
            <p className="mt-2 text-[11.5px] text-subtle">Point a phone at it</p>
          </div>
        </div>
      </Section>

      <Section title="Delete" note="Removes the space, its testimonials and its wall.">
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          Delete this space
        </Button>
      </Section>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete ${draft.name}?`}
        description="Its testimonials and its wall go with it. Any embed using this wall will stop rendering. This cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
            <Button variant="danger" loading={deleting} onClick={remove}>
              Delete permanently
            </Button>
          </>
        }
      />
    </main>
  );
}
