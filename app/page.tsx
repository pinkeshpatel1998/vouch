"use client";

import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { WallRender } from "@/components/wall/wall-render";
import { sampleTestimonials } from "@/lib/sample";
import type { WallPayload } from "@/lib/database.types";

/* Sample content, labelled as such under the wall. */
const demoWall: WallPayload = {
  wall: {
    id: "demo",
    layout: "masonry",
    carousel_style: "rail",
    theme: "dark",
    accent_color: "#9184d9",
    show_ratings: true,
    include_video: false,
  },
  space: { name: "Vouch", logo_url: null },
  testimonials: sampleTestimonials.filter((t) => t.type === "text").slice(0, 4),
};

const CHIPS = ["Video in-browser", "One script tag", "No login to submit"];

const STEPS = [
  {
    n: "STEP 01",
    title: "Send the link",
    body: "A branded page with your question on it. Or a QR code, if you are standing in front of them.",
  },
  {
    n: "STEP 02",
    title: "Approve the good ones",
    body: "Text and video land in one inbox. Fix the typos, reject the vague ones.",
  },
  {
    n: "STEP 03",
    title: "Paste one line",
    body: "A shadow-DOM widget that cannot break your page, in three layouts and your accent colour.",
  },
];

function Mark() {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-accent-soft">
      <svg viewBox="0 0 20 20" className="size-4 text-accent" fill="currentColor" aria-hidden>
        <path d="M10 1.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8Zm3.9 5.7a.9.9 0 0 0-1.28 0L9 10.93 7.38 9.3A.9.9 0 0 0 6.1 10.6l2.26 2.26a.9.9 0 0 0 1.28 0l4.26-4.27a.9.9 0 0 0 0-1.28Z" />
      </svg>
    </span>
  );
}

export default function Marketing() {
  return (
    <div className="min-h-dvh">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-5">
        <Mark />
        <span className="mr-auto font-display text-[18px] text-ink">Vouch</span>
        <Link href="/styleguide" className="hidden text-[14px] text-muted hover:text-accent sm:block">
          Design system
        </Link>
        <Link href="/app" className={buttonStyles("primary", "sm")}>
          Open the app
        </Link>
      </nav>

      {/* ---------- hero ---------- */}
      <header className="mx-auto max-w-6xl px-6 pb-16 pt-6 sm:pt-12">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,25rem)_1fr] lg:gap-16">
          <div>
            <h1 className="font-display text-[52px] leading-[1.02] text-ink sm:text-[60px]">
              Ask once.
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-muted">
              Collect text and video testimonials through a link you send, approve the good ones
              and paste one script tag. That is the whole product.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Link href="/app" className={buttonStyles("primary", "lg")}>
                <svg viewBox="0 0 18 18" className="size-4" aria-hidden>
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
                  <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
                </svg>
                Continue with Google
              </Link>
              <a href="/embed-layouts.html" className={buttonStyles("secondary", "lg")}>
                See a live wall
              </a>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
              {CHIPS.map((c) => (
                <li key={c} className="flex items-center gap-1.5 text-[12.5px] text-subtle">
                  <svg viewBox="0 0 16 16" className="size-3 text-accent" fill="currentColor" aria-hidden>
                    <path d="M13.4 4.3a.9.9 0 0 1 0 1.27l-6 6a.9.9 0 0 1-1.27 0L3.1 8.54a.9.9 0 0 1 1.27-1.27l2.4 2.4 5.36-5.37a.9.9 0 0 1 1.27 0Z" />
                  </svg>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <WallRender payload={demoWall} />
            <p className="mt-3 text-[11.5px] text-subtle">
              Sample content, rendered by the same component the embed ships.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6">
        <div className="rule-fade" />
      </div>

      {/* ---------- how it works ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((s) => (
            <div key={s.n}>
              <p className="text-[10px] uppercase tracking-[0.1em] text-accent">{s.n}</p>
              <h2 className="mt-2 font-display text-[20px] text-ink">{s.title}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <div className="rule-fade" />
      </div>

      {/* ---------- what it replaces ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-[32px] text-ink">
              The four things you were paying for
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
              Senja and Testimonial.to are large products, but the job people pay for is narrow:
              ask without it being awkward, capture video as well as text, publish only the good
              ones, and display them without it looking bolted on.
            </p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
              That is the whole of Vouch. No importers, no email sequences, no Zapier.
            </p>
          </div>
          <div className="rounded-lg bg-surface p-6 shadow-mid sm:p-7">
            <div className="flex items-baseline justify-between border-b border-line pb-4">
              <span className="text-[13.5px] text-muted">Senja, Pro</span>
              <span className="font-display text-[20px] text-subtle line-through">$29/mo</span>
            </div>
            <div className="flex items-baseline justify-between pt-4">
              <span className="text-[13.5px] text-ink">Vouch</span>
              <span className="font-display text-[36px] leading-none text-accent">Free</span>
            </div>
            <p className="mt-4 text-[12.5px] leading-relaxed text-subtle">
              Built for the Build Games, September 2026. Self-hostable on a free Supabase and
              Vercel tier.
            </p>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
        <span className="flex items-center gap-2 text-[14px] text-subtle">
          <Mark />
          Vouch
        </span>
        <div className="flex items-center gap-5 text-[13px] text-muted">
          <Link href="/app" className="hover:text-accent">
            Dashboard
          </Link>
          <Link href="/styleguide" className="hover:text-accent">
            Design system
          </Link>
        </div>
      </footer>
    </div>
  );
}
