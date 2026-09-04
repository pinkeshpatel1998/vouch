"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field, CharGuide } from "@/components/ui/field";
import { Card, Badge, Avatar, Skeleton, EmptyState } from "@/components/ui/primitives";
import { Stars, StarInput } from "@/components/ui/stars";
import { Switch } from "@/components/ui/switch";
import { TestimonialCard, QuoteCard } from "@/components/testimonial-card";
import { sampleTestimonials } from "@/lib/sample";

const ACCENTS = [
  { name: "Blurple", value: "#9184d9" },
  { name: "Sage", value: "#7fb2a6" },
  { name: "Clay", value: "#c98f6a" },
  { name: "Steel", value: "#6f8fd0" },
  { name: "Bone", value: "#ded8cf" },
];

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line py-14 first:border-t-0">
      <div className="mb-7">
        <h2 className="font-display text-[28px] leading-none text-ink">{title}</h2>
        {note && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-3">
      <span className="w-24 shrink-0 font-mono text-[11.5px] uppercase tracking-wider text-subtle">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function Styleguide() {
  const [accent, setAccent] = React.useState(ACCENTS[0].value);
  const [rating, setRating] = React.useState(0);
  const [body, setBody] = React.useState("");
  const [video, setVideo] = React.useState(true);
  const [photo, setPhoto] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--v-accent", accent);
  }, [accent]);

  const approved = sampleTestimonials;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-32">
      {/* ---------- header ---------- */}
      <header className="sticky top-0 z-20 -mx-6 mb-4 border-b border-line bg-bg/85 px-6 py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl tracking-[-0.03em] text-ink">Vouch</span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-subtle">
              Design system v0.1
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-low">
              {ACCENTS.map((a) => (
                <button
                  key={a.name}
                  onClick={() => setAccent(a.value)}
                  aria-label={`Accent: ${a.name}`}
                  aria-pressed={accent === a.value}
                  className="size-6 rounded-full border-2 transition-transform duration-[120ms] hover:scale-110"
                  style={{
                    background: a.value,
                    borderColor: accent === a.value ? "var(--v-text)" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <p className="max-w-2xl py-10 text-[17px] leading-relaxed text-muted">
        Every colour, radius and shadow below derives from the token layer in{" "}
        <code className="rounded-xs bg-sunk px-1.5 py-0.5 font-mono text-[13px] text-ink">
          app/globals.css
        </code>
        . The accent swatches above write a single CSS variable — that is the same mechanism a
        space uses to brand its collection page and its embedded wall.
      </p>

      {/* ---------- type ---------- */}
      <Section
        id="type"
        title="Typography"
        note="Nocturne runs on one typeface. Inter at weight 500 for headings, 400 for body — weight and tracking do the work a second family used to. JetBrains Mono for embed snippets only."
      >
        <div className="space-y-6">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-subtle">
              Display / Inter 500
            </p>
            <p className="font-display text-[64px] leading-[0.95] tracking-[-0.035em] text-ink">
              Ask once.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-subtle">
                UI / Inter 400
              </p>
              <p className="text-[15px] leading-relaxed text-ink">
                Collect text and video testimonials through a link you send, approve the good ones,
                and embed a wall on your site with one script tag.
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Secondary copy sits at 13px in muted. Hints and counters drop to 12.5px in subtle.
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-subtle">
                Mono / JetBrains Mono
              </p>
              <pre className="overflow-x-auto rounded-md border border-line bg-sunk p-4 font-mono text-[12.5px] leading-relaxed text-ink">
{`<script
  src="https://vouch.app/embed.js"
  data-wall="wal_abc123"
  async
></script>`}
              </pre>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- colour ---------- */}
      <Section
        id="colour"
        title="Semantic colour"
        note="Surfaces and text are named by role, never by value. The accent has five derived tints computed with color-mix, so a space owner picks one colour and never gets an unreadable pairing."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["bg", "--v-bg"],
            ["surface", "--v-surface"],
            ["sunk", "--v-surface-sunk"],
            ["line", "--v-border"],
            ["accent", "--v-accent"],
            ["accent-soft", "--v-accent-soft"],
            ["accent-line", "--v-accent-line"],
            ["accent-text", "--v-accent-text"],
            ["ink", "--v-text"],
            ["muted", "--v-text-muted"],
            ["subtle", "--v-text-subtle"],
            ["danger", "--v-danger"],
          ].map(([name, token]) => (
            <div key={name} className="overflow-hidden rounded-md border border-line">
              <div className="h-14" style={{ background: `var(${token})` }} />
              <div className="bg-surface px-3 py-2">
                <p className="text-[13px] font-medium text-ink">{name}</p>
                <p className="font-mono text-[11px] text-subtle">{token}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------- scales ---------- */}
      <Section
        id="scales"
        title="Radius, shadow, spacing"
        note="Three shadow levels, not seven. Anything that needs a fourth is solved with a border instead."
      >
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-subtle">Radius</p>
            <div className="flex flex-wrap gap-3">
              {["xs", "sm", "md", "lg", "xl", "2xl"].map((r) => (
                <div key={r} className="text-center">
                  <div
                    className="size-14 border border-line-strong bg-accent-soft"
                    style={{ borderRadius: `var(--v-radius-${r})` }}
                  />
                  <p className="mt-1.5 font-mono text-[11px] text-subtle">{r}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-subtle">Shadow</p>
            <div className="flex flex-wrap gap-5">
              {["low", "mid", "high"].map((s) => (
                <div key={s} className="text-center">
                  <div
                    className="size-16 rounded-md border border-line bg-surface"
                    style={{ boxShadow: `var(--v-shadow-${s})` }}
                  />
                  <p className="mt-2 font-mono text-[11px] text-subtle">{s}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-subtle">
              Spacing (4px base)
            </p>
            <div className="space-y-1.5">
              {[1, 2, 3, 4, 6, 8, 12, 16].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <span className="w-8 font-mono text-[11px] text-subtle">{s}</span>
                  <div className="h-2.5 rounded-xs bg-accent/45" style={{ width: s * 4 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- buttons ---------- */}
      <Section id="buttons" title="Buttons">
        <Card className="p-6">
          <Row label="Variants">
            <Button variant="primary">Approve</Button>
            <Button variant="secondary">Edit text</Button>
            <Button variant="secondary">Copy link</Button>
            <Button variant="ghost">Reject</Button>
            <Button variant="danger">Delete</Button>
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Record a video</Button>
          </Row>
          <Row label="States">
            <Button disabled>Disabled</Button>
            <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1600); }}>
              {loading ? "Publishing" : "Click to load"}
            </Button>
            <Button variant="secondary">
              <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
                <path d="M10.5 1H4a2 2 0 0 0-2 2v8h1.5V3a.5.5 0 0 1 .5-.5h6.5V1Zm2 3H6.5a1.5 1.5 0 0 0-1.5 1.5v8A1.5 1.5 0 0 0 6.5 15h6a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 12.5 4Z" />
              </svg>
              With icon
            </Button>
          </Row>
        </Card>
      </Section>

      {/* ---------- forms ---------- */}
      <Section
        id="forms"
        title="Form controls"
        note="These are the controls a stranger meets on the collection page, so they get the most attention. The character guide is soft — it nudges, it never blocks a submit."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-5 p-6">
            <Field label="Your name" htmlFor="sg-name">
              <Input id="sg-name" placeholder="Priya Raman" />
            </Field>
            <Field label="Role and company" htmlFor="sg-role" optional hint="Shown under your name on the wall.">
              <Input id="sg-role" placeholder="Founder, Lantern Studio" />
            </Field>
            <Field label="Email" htmlFor="sg-err" error="That does not look like an email address.">
              <Input id="sg-err" defaultValue="priya@" aria-invalid />
            </Field>
            <div className="space-y-2">
              <Field label="What did we help you achieve?" htmlFor="sg-body">
                <Textarea
                  id="sg-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Two or three sentences is plenty."
                />
              </Field>
              <CharGuide value={body} />
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium text-ink">How would you rate us?</p>
              <StarInput value={rating} onChange={setRating} />
            </div>
          </Card>

          <Card className="p-6">
            <p className="mb-1 text-[13px] font-medium text-ink">Space settings</p>
            <p className="mb-2 text-[12.5px] text-subtle">Toggles from §5.3 of the spec.</p>
            <div className="divide-y divide-line">
              <Switch
                checked={video}
                onChange={setVideo}
                label="Allow video"
                description="Submitters can record up to 90 seconds in the browser."
              />
              <Switch
                checked={photo}
                onChange={setPhoto}
                label="Require photo"
                description="Walls look better with faces, but it lowers completion."
              />
            </div>
            <div className="mt-6 space-y-3">
              <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Badges</p>
              <div className="flex flex-wrap gap-2">
                <Badge tone="pending" dot>Pending</Badge>
                <Badge tone="approved" dot>Approved</Badge>
                <Badge tone="rejected" dot>Rejected</Badge>
                <Badge tone="accent">Video</Badge>
                <Badge>90s cap</Badge>
              </div>
              <p className="pt-3 font-mono text-[11px] uppercase tracking-wider text-subtle">
                Avatars &amp; stars
              </p>
              <div className="flex items-center gap-3">
                <Avatar name="Priya Raman" size={40} />
                <Avatar name="Marcus Oyelaran" size={40} />
                <Avatar name="Dana Whitfield" size={40} />
                <Stars value={4} size={18} />
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* ---------- states ---------- */}
      <Section
        id="states"
        title="Empty and loading states"
        note="Judges click into these. Every list in the product gets a designed empty state before it ships."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <EmptyState
            icon={
              <svg viewBox="0 0 32 24" className="h-4" fill="currentColor" aria-hidden>
                <path d="M0 24V13.2C0 5.9 4.2 1.1 11.6 0l1.2 3.9C8.4 5.2 6.2 7.6 6.2 11h5.2v13H0Zm18.6 0V13.2C18.6 5.9 22.8 1.1 30.2 0l1.2 3.9c-4.4 1.3-6.6 3.7-6.6 7.1h5.2v13h-11.4Z" />
              </svg>
            }
            title="No testimonials yet"
            body="Send your collection link to five customers. Most people reply within a day, and you only publish the ones you like."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button>Copy collection link</Button>
                <Button variant="secondary">Load a demo space</Button>
              </div>
            }
          />
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[92%]" />
              <Skeleton className="h-3 w-[78%]" />
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <Skeleton className="h-3 w-24" />
            </div>
          </Card>
        </div>
      </Section>

      {/* ---------- the wall ---------- */}
      <Section
        id="wall"
        title="The wall"
        note="Masonry layout, sample data. Cards settle in on load with a staggered delay — that is the one motion moment, and there is not a second one anywhere else in the product."
      >
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {approved.map((t, i) => (
            <TestimonialCard
              key={t.id}
              t={t}
              className="animate-settle"
              style={{ animationDelay: `${i * 55}ms` }}
            />
          ))}
        </div>

        <div className="mt-12">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-subtle">
            Single quote layout
          </p>
          <QuoteCard t={sampleTestimonials[0]} />
        </div>
      </Section>
    </div>
  );
}
