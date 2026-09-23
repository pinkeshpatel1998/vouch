"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Card, Skeleton } from "@/components/ui/primitives";
import { Switch } from "@/components/ui/switch";
import { TemplatePicker } from "@/components/wall/template-picker";
import { cardStyle, WALL_TEMPLATES } from "@/lib/wall-templates";
import { WallRender } from "@/components/wall/wall-render";
import { useQuery } from "@/lib/data/use-store";
import { getSpace, getWallForSpace, updateWall, wallPayload } from "@/lib/data";
import { staticHtmlExport, scriptEmbed, iframeEmbed } from "@/lib/export-html";
import type { CarouselStyle, Layout, Theme, Wall } from "@/lib/database.types";

const LAYOUTS: Array<{ key: Layout; label: string; note: string }> = [
  { key: "masonry", label: "Wall", note: "Everything at once" },
  { key: "carousel", label: "Carousel", note: "Saves vertical space" },
  { key: "single", label: "Single", note: "One quote, large" },
];

const CAROUSEL_STYLES: Array<{
  key: CarouselStyle;
  label: string;
  note: string;
}> = [
  { key: "rail", label: "Rail", note: "Snap scroll with arrows" },
  {
    key: "marquee",
    label: "Marquee",
    note: "Loops on its own, pauses on hover",
  },
  { key: "spotlight", label: "Spotlight", note: "Centre card in focus" },
];

const THEMES: Array<{ key: Theme; label: string }> = [
  { key: "light", label: "Light" },
  { key: "auto", label: "Auto" },
  { key: "dark", label: "Dark" },
];

const ACCENTS = [
  "#b84925", // burnt orange — the system default
  "#52734d", // forest
  "#a76b43", // clay
  "#486c9c", // steel
  "#aa526c", // rose
  "#4d5548", // olive
];

type SnippetTab = "script" | "html" | "iframe";

function LayoutGlyph({ layout }: { layout: Layout }) {
  const bar = "rounded-[1px] bg-current";
  if (layout === "masonry")
    return (
      <span className="flex h-6 w-8 gap-[3px]" aria-hidden>
        <span className="flex flex-1 flex-col gap-[3px]">
          <span className={cn(bar, "h-2.5")} />
          <span className={cn(bar, "flex-1")} />
        </span>
        <span className="flex flex-1 flex-col gap-[3px]">
          <span className={cn(bar, "flex-1")} />
          <span className={cn(bar, "h-2")} />
        </span>
        <span className="flex flex-1 flex-col gap-[3px]">
          <span className={cn(bar, "h-1.5")} />
          <span className={cn(bar, "flex-1")} />
        </span>
      </span>
    );
  if (layout === "carousel")
    return (
      <span className="flex h-6 w-8 items-stretch gap-[3px]" aria-hidden>
        <span className={cn(bar, "w-1.5 opacity-40")} />
        <span className={cn(bar, "flex-1")} />
        <span className={cn(bar, "w-1.5 opacity-40")} />
      </span>
    );
  return (
    <span
      className="flex h-6 w-8 flex-col justify-center gap-[3px]"
      aria-hidden
    >
      <span className={cn(bar, "h-1.5 w-6")} />
      <span className={cn(bar, "h-1.5 w-8")} />
      <span className={cn(bar, "h-1.5 w-5")} />
    </span>
  );
}

export default function WallPage({
  params,
}: {
  params: Promise<{ space: string }>;
}) {
  const { space: spaceId } = React.use(params);

  const { data: space } = useQuery(() => getSpace(spaceId), [spaceId]);
  const { data: wall, loading } = useQuery(
    () => getWallForSpace(spaceId),
    [spaceId],
  );
  const [draftWall, setDraftWall] = React.useState<Wall | null>(null);

  React.useEffect(() => {
    if (wall) setDraftWall(wall);
  }, [wall]);

  const currentWall = draftWall ?? wall;
  const { data: payload } = useQuery(
    () => (currentWall ? wallPayload(currentWall.id) : Promise.resolve(null)),
    [
      currentWall?.id,
      currentWall?.layout,
      currentWall?.carousel_style,
      currentWall?.card_style,
      currentWall?.theme,
      currentWall?.accent_color,
      currentWall?.max_items,
      currentWall?.show_ratings,
      currentWall?.include_video,
    ],
  );

  const [tab, setTab] = React.useState<SnippetTab>("script");
  const [device, setDevice] = React.useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [origin, setOrigin] = React.useState("https://vouch.app");

  React.useEffect(() => setOrigin(window.location.origin), []);

  async function patch(next: Partial<Wall>) {
    if (!currentWall) return;
    const previous = currentWall;
    setDraftWall({ ...currentWall, ...next });
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await updateWall(currentWall.id, next);
      setDraftWall(saved);
    } catch (error) {
      setDraftWall(previous);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not save your style. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const previewPayload =
    payload && currentWall
      ? {
          ...payload,
          wall: {
            ...payload.wall,
            layout: currentWall.layout,
            carousel_style: currentWall.carousel_style,
            card_style: currentWall.card_style,
            theme: currentWall.theme,
            accent_color:
              currentWall.accent_color ??
              space?.accent_color ??
              payload.wall.accent_color,
            show_ratings:
              currentWall.show_ratings && (space?.show_ratings ?? true),
            include_video: currentWall.include_video,
          },
        }
      : payload;

  const snippet = !currentWall
    ? ""
    : tab === "script"
      ? scriptEmbed(origin, currentWall.id)
      : tab === "iframe"
        ? iframeEmbed(origin, currentWall.id)
        : payload
          ? staticHtmlExport(previewPayload!)
          : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  if (loading || !currentWall) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
          <div className="space-y-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="builder-heading">
        <div>
          <h1>Make their words feel like you.</h1>
          <p>
            Pick a personality, choose a layout, and give your customer stories
            a home.
          </p>
        </div>
        <span role="status">
          {saving
            ? "Saving your changes…"
            : saveError
              ? "Changes not saved"
              : "Changes save automatically"}
        </span>
      </header>
      {saveError && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-danger p-3 text-sm text-danger"
        >
          {saveError}
        </p>
      )}
      <section
        className="builder-templates"
        aria-label="Choose your wall style"
      >
        <TemplatePicker
          value={cardStyle(currentWall.card_style)}
          onChange={(card_style) => patch({ card_style })}
          disabled={saving}
        />
        <p>
          Every style works with every layout. Portrait styles use your
          customers’ photos, with initials when no photo is available.
        </p>
      </section>
      <div className="grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-10">
        {/* ---------- controls ---------- */}
        <div className="space-y-7">
          <fieldset>
            <legend className="mb-2.5 text-[13px] font-medium text-ink">
              Layout
            </legend>
            <div className="space-y-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  aria-pressed={currentWall.layout === l.key}
                  onClick={() => patch({ layout: l.key })}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-[border-color,background-color] duration-[120ms]",
                    currentWall.layout === l.key
                      ? "border-accent bg-accent-soft text-accent-text"
                      : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
                  )}
                >
                  <LayoutGlyph layout={l.key} />
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-medium">
                      {l.label}
                    </span>
                    <span className="block text-[12px] opacity-70">
                      {l.note}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {currentWall.layout === "carousel" && (
            <fieldset className="animate-settle">
              <legend className="mb-2.5 text-[13px] font-medium text-ink">
                Carousel style
              </legend>
              <div className="space-y-2">
                {CAROUSEL_STYLES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    aria-pressed={currentWall.carousel_style === c.key}
                    onClick={() => patch({ carousel_style: c.key })}
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-left transition-[border-color,background-color] duration-[120ms]",
                      currentWall.carousel_style === c.key
                        ? "border-accent bg-accent-soft text-accent-text"
                        : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
                    )}
                  >
                    <span className="block text-[13.5px] font-medium">
                      {c.label}
                    </span>
                    <span className="block text-[12px] opacity-70">
                      {c.note}
                    </span>
                  </button>
                ))}
              </div>
              {currentWall.carousel_style === "marquee" && (
                <p className="mt-2 text-[12px] leading-snug text-subtle">
                  Auto-scrolling stops for visitors who ask for reduced motion.
                </p>
              )}
            </fieldset>
          )}

          <fieldset>
            <legend className="mb-2.5 text-[13px] font-medium text-ink">
              Theme
            </legend>
            <div className="inline-flex w-full rounded-full border border-line bg-surface p-0.5 shadow-low">
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={currentWall.theme === t.key}
                  onClick={() => patch({ theme: t.key })}
                  className={cn(
                    "flex-1 rounded-full px-2 py-1.5 text-[12.5px] font-medium transition-colors duration-[120ms]",
                    currentWall.theme === t.key
                      ? "bg-accent text-onaccent"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-snug text-subtle">
              Auto follows the visitor&rsquo;s system setting on your site.
            </p>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 text-[13px] font-medium text-ink">
              Accent
            </legend>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-pressed={currentWall.accent_color === null}
                onClick={() => patch({ accent_color: null })}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                  currentWall.accent_color === null
                    ? "border-accent bg-accent-soft text-accent-text"
                    : "border-line text-muted hover:text-ink",
                )}
              >
                Match space
              </button>
              {ACCENTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-label={`Accent ${a}`}
                  aria-pressed={currentWall.accent_color === a}
                  onClick={() => patch({ accent_color: a })}
                  className="size-7 rounded-full border-2 transition-transform duration-[120ms] hover:scale-110"
                  style={{
                    background: a,
                    borderColor:
                      currentWall.accent_color === a
                        ? "var(--v-text)"
                        : "transparent",
                  }}
                />
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="max-items"
              className="mb-2 block text-[13px] font-medium text-ink"
            >
              Show at most{" "}
              <span className="font-mono tabular-nums text-accent-text">
                {currentWall.max_items}
              </span>
            </label>
            <input
              id="max-items"
              type="range"
              min={1}
              max={30}
              value={currentWall.max_items}
              onChange={(e) => patch({ max_items: Number(e.target.value) })}
              className="w-full accent-[var(--v-accent)]"
            />
          </div>

          <Card className="px-4 py-1">
            <div className="divide-y divide-line">
              <Switch
                checked={currentWall.show_ratings}
                onChange={(v) => patch({ show_ratings: v })}
                label="Star ratings"
              />
              <Switch
                checked={currentWall.include_video}
                onChange={(v) => patch({ include_video: v })}
                label="Video testimonials"
              />
            </div>
            {!space?.show_ratings && (
              <p className="pb-3 text-[12px] leading-snug text-subtle">
                Ratings are off for the whole space in Settings, so they stay
                hidden here either way.
              </p>
            )}
          </Card>
        </div>

        {/* ---------- preview ---------- */}
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-muted">
              {
                WALL_TEMPLATES.find(
                  (t) => t.key === cardStyle(currentWall.card_style),
                )
                  ?.name
              }{" "}
              · Live preview
              <span className="ml-2 text-subtle">
                {previewPayload?.testimonials.length ?? 0} of {currentWall.max_items} shown
              </span>
            </p>
            <div className="flex items-center gap-2">
              {/* Most submitters are on a phone, so the owner should be able to
                  check the narrow case without leaving the builder. */}
              <div
                role="radiogroup"
                aria-label="Preview width"
                className="inline-flex overflow-hidden rounded-md border border-line"
              >
                {(
                  [
                    [
                      "desktop",
                      "Desktop",
                      "M2.5 4.75A1.25 1.25 0 0 1 3.75 3.5h12.5a1.25 1.25 0 0 1 1.25 1.25v7.5a1.25 1.25 0 0 1-1.25 1.25H11v1.5h2a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1 0-1.5h2v-1.5H3.75a1.25 1.25 0 0 1-1.25-1.25v-7.5Z",
                    ],
                    [
                      "mobile",
                      "Mobile",
                      "M6 2.5h8A1.5 1.5 0 0 1 15.5 4v12a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 16V4A1.5 1.5 0 0 1 6 2.5Zm2.75 12a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z",
                    ],
                  ] as Array<["desktop" | "mobile", string, string]>
                ).map(([key, label, icon], i) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={device === key}
                    aria-label={label}
                    onClick={() => setDevice(key)}
                    className={cn(
                      "px-2.5 py-1.5 transition-colors duration-[120ms]",
                      i > 0 && "border-l border-line",
                      device === key
                        ? "text-accent shadow-[inset_0_0_0_1px_var(--v-accent)]"
                        : "text-muted hover:bg-[color-mix(in_srgb,var(--v-text)_7%,transparent)]",
                    )}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className="size-4"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d={icon} />
                    </svg>
                  </button>
                ))}
              </div>
              <a
                href={`/embed/${currentWall.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[12.5px] text-muted transition-colors hover:bg-[color-mix(in_srgb,var(--v-text)_7%,transparent)] hover:text-ink"
              >
                Open standalone
                <svg
                  viewBox="0 0 16 16"
                  className="size-3"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M6 3.5a.75.75 0 0 0 0 1.5h2.44L4.22 9.22a.75.75 0 1 0 1.06 1.06L9.5 6.06V8.5a.75.75 0 0 0 1.5 0v-4a.75.75 0 0 0-.75-.75H6Z" />
                  <path d="M3.5 5.75A2.25 2.25 0 0 1 5.75 3.5h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-1a.75.75 0 0 1 1.5 0v1a2.25 2.25 0 0 1-2.25 2.25h-4.5A2.25 2.25 0 0 1 3.5 10.25v-4.5Z" />
                </svg>
              </a>
            </div>
          </div>

          <div
            className={cn(
              "rounded-xl border border-line p-5 sm:p-7",
              currentWall.theme === "dark" ? "bg-[#161826]" : "",
              currentWall.theme === "light" ? "bg-white" : "",
              currentWall.theme === "auto" ? "bg-sunk" : "",
            )}
          >
            <div
              className={cn(
                "mx-auto transition-[max-width] duration-[220ms] ease-[var(--v-ease-out)]",
                device === "mobile" ? "max-w-[380px]" : "max-w-none",
              )}
            >
              {previewPayload ? (
                <WallRender payload={previewPayload} />
              ) : (
                <Skeleton className="h-72 w-full rounded-lg" />
              )}
            </div>
          </div>

          {/* ---------- snippet ---------- */}
          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="Embed method"
                className="inline-flex gap-0.5 rounded-full border border-line bg-surface p-0.5 shadow-low"
              >
                {(
                  [
                    ["script", "Script tag"],
                    ["html", "Static HTML"],
                    ["iframe", "iframe"],
                  ] as Array<[SnippetTab, string]>
                ).map(([key, label]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => setTab(key)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-[120ms]",
                      tab === key
                        ? "bg-accent text-onaccent"
                        : "text-muted hover:text-ink",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={copy}>
                {copied ? "Copied" : "Copy snippet"}
              </Button>
            </div>

            <p className="mt-3 text-[12px] leading-relaxed text-subtle">
              Your selected template is included in every embed.
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              {tab === "script"
                ? "One tag, anywhere in your HTML. Renders in a shadow root, so your site's CSS and the widget's cannot reach each other."
                : tab === "html"
                  ? "Self-contained HTML and inline CSS for Carrd, Notion, or anywhere scripts are blocked. It is a snapshot — copy it again after you approve something new."
                  : "For platforms that only accept an embed URL. Heavier than the script tag; use it when the script tag is not an option."}
            </p>

            <pre className="mt-3 max-h-72 overflow-auto rounded-md border border-line bg-sunk p-4 font-mono text-[12px] leading-relaxed text-ink">
              {snippet}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
