"use client";

import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { QuoteGlyph } from "@/components/ui/icons";
import { WallRender } from "@/components/wall/wall-render";
import { sampleTestimonials } from "@/lib/sample";
import type { WallPayload } from "@/lib/database.types";

/* Sample content, clearly labelled below the fold. Replace with real quotes
   about the project before submitting -- section 5.1. */
const demoWall: WallPayload = {
  wall: {
    id: "demo",
    layout: "masonry",
    carousel_style: "rail",
    theme: "auto",
    accent_color: "oklch(0.582 0.148 38)",
    show_ratings: true,
    include_video: false,
  },
  space: { name: "Vouch", logo_url: null },
  testimonials: sampleTestimonials.filter((t) => t.type === "text"),
};

const STEPS = [
  {
    n: "01",
    title: "Send one link",
    body: "Every space gets a branded collection page and a QR code. The person writing your testimonial never signs in, never installs anything, and can finish on a phone in one hand.",
  },
  {
    n: "02",
    title: "Approve the good ones",
    body: "Submissions land as pending. Read them, fix the typos people actually make, approve what you want and reject the rest. Nothing is public until you say so.",
  },
  {
    n: "03",
    title: "Paste one script tag",
    body: "Pick a layout, copy the snippet, drop it in your site. It renders in a shadow root, so your CSS and the widget's can't reach each other. There's a static HTML export for Carrd and Notion.",
  },
];

export default function Marketing() {
  return (
    <div className="min-h-dvh">
      {/* ---------- nav ---------- */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-display text-2xl tracking-[-0.03em] text-ink">Vouch</span>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link href="/app" className={buttonStyles("primary", "sm")}>
            Open the app
          </Link>
        </div>
      </nav>

      {/* ---------- hero ---------- */}
      <header className="mx-auto max-w-6xl px-6 pb-12 pt-8 sm:pb-16 sm:pt-14">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-line bg-accent-soft px-3 py-1 text-[12.5px] font-medium text-accent-text">
          <QuoteGlyph className="h-2.5" />
          Replaces Senja and Testimonial.to
        </p>
        <h1 className="max-w-3xl font-display text-[44px] leading-[0.98] tracking-[-0.035em] text-ink sm:text-[68px]">
          Proof, not promises
        </h1>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted sm:text-[19px]">
          Collect text and video testimonials through a link you send, approve the good ones, and
          embed a wall on your site with one script tag.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/app" className={buttonStyles("primary", "lg")}>
            Start collecting
          </Link>
          <Link href="/c/lantern-studio" className={buttonStyles("secondary", "lg")}>
            Try a submission page
          </Link>
        </div>
        <p className="mt-4 text-[13px] text-subtle">
          No sign-up in this build — the dashboard opens straight into a demo space.
        </p>
      </header>

      {/* ---------- the wall, above the fold on most screens ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-2xl border border-line bg-sunk/40 p-5 sm:p-8">
          <WallRender payload={demoWall} />
        </div>
        <p className="mt-3 text-center text-[12.5px] text-subtle">
          Sample content, rendered by the same component the embed ships.
        </p>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <h2 className="font-display text-[32px] leading-tight tracking-[-0.025em] text-ink sm:text-[40px]">
            Three steps, about four minutes
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((s) => (
              <div key={s.n}>
                <span className="font-mono text-[12px] tracking-widest text-accent-text">
                  {s.n}
                </span>
                <h3 className="mt-2 font-display text-[22px] leading-tight text-ink">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- what it replaces ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-[32px] leading-tight tracking-[-0.025em] text-ink sm:text-[40px]">
              The four things you were paying for
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Senja and Testimonial.to are large products, but the job people pay for is narrow:
              ask without it being awkward, capture video as well as text, publish only the good
              ones, and display them without it looking bolted on.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              That is the whole of Vouch. No importers, no email sequences, no Zapier.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-6 shadow-mid sm:p-8">
            <div className="flex items-baseline justify-between border-b border-line pb-4">
              <span className="text-[14px] text-muted">Senja, Pro</span>
              <span className="font-display text-2xl text-subtle line-through">$29/mo</span>
            </div>
            <div className="flex items-baseline justify-between pt-4">
              <span className="text-[14px] font-medium text-ink">Vouch</span>
              <span className="font-display text-[40px] leading-none text-accent-text">Free</span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-subtle">
              Built for the Build Games, September 2026. Self-hostable on a free Supabase and
              Vercel tier.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <span className="font-display text-lg tracking-[-0.02em] text-ink">Vouch</span>
          <div className="flex items-center gap-5 text-[13px] text-muted">
            <Link href="/app" className="transition-colors hover:text-ink">
              Dashboard
            </Link>
            <Link href="/styleguide" className="transition-colors hover:text-ink">
              Design system
            </Link>
            <ThemeToggle className="sm:hidden" />
          </div>
        </div>
      </footer>
    </div>
  );
}
