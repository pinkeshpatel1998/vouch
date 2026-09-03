"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { TestimonialCard, QuoteCard } from "@/components/testimonial-card";
import { QuoteGlyph } from "@/components/ui/icons";
import type { WallPayload } from "@/lib/database.types";

/**
 * The wall, in React.
 *
 * This drives the builder's live preview -- section 5.5 asks for the actual
 * widget rather than a mockup. The shipped embed is a vanilla-TS port of this
 * file into a shadow root; keeping the markup and class names aligned means the
 * port stays a translation rather than a redesign.
 */
export function WallRender({
  payload,
  className,
}: {
  payload: WallPayload;
  className?: string;
}) {
  const { wall, testimonials } = payload;

  // theme "auto" sets nothing and inherits from the host page.
  const themeAttr = wall.theme === "auto" ? undefined : wall.theme;

  if (testimonials.length === 0) {
    return (
      <div
        data-theme={themeAttr}
        style={{ ["--v-accent" as string]: wall.accent_color }}
        className={cn(
          "rounded-xl border border-dashed border-line bg-sunk/40 px-6 py-14 text-center",
          className,
        )}
      >
        <div className="mx-auto mb-3 grid size-11 place-items-center rounded-xl border border-accent-line bg-accent-soft text-accent-text">
          <QuoteGlyph className="h-3.5" />
        </div>
        <p className="font-display text-lg text-ink">Nothing approved yet</p>
        <p className="mt-1 text-[13px] text-muted">
          Approve a testimonial and it appears here straight away.
        </p>
      </div>
    );
  }

  return (
    <div
      data-theme={themeAttr}
      style={{ ["--v-accent" as string]: wall.accent_color }}
      className={cn("text-ink", className)}
    >
      {wall.layout === "masonry" && <Masonry payload={payload} />}
      {wall.layout === "carousel" && wall.carousel_style === "marquee" && (
        <Marquee payload={payload} />
      )}
      {wall.layout === "carousel" && wall.carousel_style === "spotlight" && (
        <Spotlight payload={payload} />
      )}
      {wall.layout === "carousel" && wall.carousel_style === "rail" && (
        <Carousel payload={payload} />
      )}
      {wall.layout === "single" && <Single payload={payload} />}
    </div>
  );
}

/* ---------------- masonry ---------------- */

function Masonry({ payload }: { payload: WallPayload }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      {payload.testimonials.map((t, i) => (
        <TestimonialCard
          key={t.id}
          t={t}
          showRating={payload.wall.show_ratings}
          className="animate-settle"
          style={{ animationDelay: `${Math.min(i, 12) * 55}ms` }}
        />
      ))}
    </div>
  );
}

/* ---------------- carousel ---------------- */

function Carousel({ payload }: { payload: WallPayload }) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const sync = React.useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  React.useEffect(() => {
    sync();
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sync, payload.testimonials.length]);

  function page(dir: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scroller}
        onScroll={sync}
        tabIndex={0}
        role="region"
        aria-label="Testimonials"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {payload.testimonials.map((t) => (
          <TestimonialCard
            key={t.id}
            t={t}
            showRating={payload.wall.show_ratings}
            className="w-[min(20rem,80vw)] shrink-0 snap-start"
          />
        ))}
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <ArrowButton dir="left" disabled={atStart} onClick={() => page(-1)} />
        <ArrowButton dir="right" disabled={atEnd} onClick={() => page(1)} />
      </div>
    </div>
  );
}

function ArrowButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Previous testimonials" : "Next testimonials"}
      className="grid size-9 place-items-center rounded-full border border-line bg-surface text-muted shadow-low transition-[color,background-color,opacity] duration-[120ms] hover:bg-hover hover:text-ink disabled:opacity-35"
    >
      <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
        {dir === "left" ? (
          <path d="M10.28 3.22a.75.75 0 0 1 0 1.06L6.56 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L4.97 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" />
        ) : (
          <path d="M5.72 3.22a.75.75 0 0 0 0 1.06L9.44 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06L6.78 3.22a.75.75 0 0 0-1.06 0Z" />
        )}
      </svg>
    </button>
  );
}

/* ---------------- marquee ----------------
   The classic testimonial ticker: one track duplicated, translated -50%, so it
   loops seamlessly. Pure CSS, which means it survives in the static export and
   costs the widget nothing. The clone is aria-hidden so screen readers and
   copy-paste see each quote once. */

function Marquee({ payload }: { payload: WallPayload }) {
  const items = payload.testimonials;
  // Roughly six seconds per card, so a long wall does not sprint.
  const duration = Math.max(24, items.length * 6);

  const track = (clone: boolean) => (
    <div className="flex shrink-0 gap-4" aria-hidden={clone || undefined}>
      {items.map((t) => (
        <TestimonialCard
          key={(clone ? "c-" : "") + t.id}
          t={t}
          showRating={payload.wall.show_ratings}
          className="w-[min(20rem,80vw)] shrink-0"
        />
      ))}
    </div>
  );

  return (
    <div className="marquee-host marquee-mask overflow-hidden">
      <div
        className="animate-marquee flex w-max gap-4"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}

/* ---------------- spotlight ----------------
   Centre-focused rail. The card nearest the middle is full size and opacity;
   its neighbours shrink and fade with distance. Snap points are centred, so a
   swipe always lands on a card rather than between two. */

function Spotlight({ payload }: { payload: WallPayload }) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const [, force] = React.useReducer((n: number) => n + 1, 0);

  React.useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    };

    const paint = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      Array.from(el.children).forEach((node) => {
        const card = node as HTMLElement;
        const cardMid = card.offsetLeft + card.offsetWidth / 2;
        // 0 at dead centre, 1 once a full card-width away.
        const d = Math.min(1, Math.abs(cardMid - mid) / (card.offsetWidth || 1));
        card.style.transform = `scale(${(1 - d * 0.12).toFixed(3)})`;
        card.style.opacity = String((1 - d * 0.55).toFixed(3));
      });
    };

    paint();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [payload.testimonials.length, force]);

  return (
    <div
      ref={scroller}
      role="region"
      aria-label="Testimonials"
      tabIndex={0}
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[max(0px,calc(50%-10rem))] pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {payload.testimonials.map((t) => (
        <TestimonialCard
          key={t.id}
          t={t}
          showRating={payload.wall.show_ratings}
          className="w-[min(20rem,78vw)] shrink-0 snap-center transition-[transform,opacity] duration-[220ms] ease-[var(--v-ease-out)]"
        />
      ))}
    </div>
  );
}

/* ---------------- single ---------------- */

function Single({ payload }: { payload: WallPayload }) {
  const [index, setIndex] = React.useState(0);
  const items = payload.testimonials;
  const current = items[Math.min(index, items.length - 1)];

  return (
    <div>
      <QuoteCard t={current} />
      {items.length > 1 && (
        <div
          role="tablist"
          aria-label="Choose a testimonial"
          className="mt-4 flex flex-wrap justify-center gap-1.5"
        >
          {items.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Testimonial from ${t.author_name}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-[width,background-color] duration-[220ms] ease-[var(--v-ease-out)]",
                i === index ? "w-6 bg-accent" : "w-1.5 bg-line-strong hover:bg-muted",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
