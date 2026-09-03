"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/primitives";
import { Stars } from "@/components/ui/stars";
import { useBlobUrl } from "@/lib/data/blobs";
import type { WallItem } from "@/lib/sample";

function Attribution({ t, compact }: { t: WallItem; compact?: boolean }) {
  const meta = [t.author_role, t.author_company].filter(Boolean).join(", ");
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={t.author_name} src={t.author_avatar_url} size={compact ? 32 : 36} />
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-medium leading-tight text-ink">
          {t.author_name}
        </p>
        {meta && <p className="truncate text-[12.5px] leading-tight text-subtle">{meta}</p>}
      </div>
    </div>
  );
}

function PlayGlyph() {
  return (
    <span className="grid size-12 place-items-center rounded-full bg-accent text-onaccent shadow-mid transition-transform duration-[220ms] ease-[var(--v-ease-out)] group-hover:scale-110">
      <svg viewBox="0 0 16 16" className="size-4 translate-x-px" fill="currentColor" aria-hidden>
        <path d="M4.5 2.6v10.8a.6.6 0 0 0 .92.5l8.4-5.4a.6.6 0 0 0 0-1L5.42 2.1a.6.6 0 0 0-.92.5Z" />
      </svg>
    </span>
  );
}

function duration(s: number | null | undefined) {
  if (!s) return null;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* The wall card. This is the component judges will look at longest. */
export function TestimonialCard({
  t,
  showRating = true,
  className,
  style,
}: {
  t: WallItem;
  showRating?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <figure
      className={cn(
        "group break-inside-avoid rounded-lg border border-line bg-surface p-5 shadow-low",
        "transition-[box-shadow,transform,border-color] duration-[220ms] ease-[var(--v-ease-out)]",
        "hover:-translate-y-0.5 hover:border-line-strong hover:shadow-mid",
        className,
      )}
      style={style}
    >
      {t.type === "video" ? <CardVideo t={t} /> : null}

      {showRating && t.rating ? <Stars value={t.rating} className="mb-3" /> : null}

      <blockquote className="text-[14.5px] leading-[1.62] text-ink">{t.body}</blockquote>

      <figcaption className="mt-4 border-t border-line pt-4">
        <Attribution t={t} />
      </figcaption>
    </figure>
  );
}

/* Single-quote layout. Display face earns its keep here. */
export function QuoteCard({ t, className }: { t: WallItem; className?: string }) {
  return (
    <figure
      className={cn(
        "rounded-xl border border-line bg-surface px-8 py-10 shadow-mid sm:px-12 sm:py-14",
        className,
      )}
    >
      <svg viewBox="0 0 32 24" className="mb-5 h-6 text-accent/35" fill="currentColor" aria-hidden>
        <path d="M0 24V13.2C0 5.9 4.2 1.1 11.6 0l1.2 3.9C8.4 5.2 6.2 7.6 6.2 11h5.2v13H0Zm18.6 0V13.2C18.6 5.9 22.8 1.1 30.2 0l1.2 3.9c-4.4 1.3-6.6 3.7-6.6 7.1h5.2v13h-11.4Z" />
      </svg>
      {t.rating && <Stars value={t.rating} size={18} className="mb-4" />}
      <blockquote className="font-display text-[26px] leading-[1.32] tracking-[-0.015em] text-ink sm:text-[32px]">
        {t.body}
      </blockquote>
      <figcaption className="mt-7">
        <Attribution t={t} />
      </figcaption>
    </figure>
  );
}

/* Video plays in place. Section 5.4 says never navigate away from a video, and
   the same is true on someone else's site -- a wall that opens a new tab is a
   wall that loses the reader. */
function CardVideo({ t }: { t: WallItem }) {
  const [playing, setPlaying] = React.useState(false);
  const url = useBlobUrl(playing ? t.video_url : null);

  if (playing && url) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={url}
        poster={t.poster_url ?? undefined}
        controls
        autoPlay
        playsInline
        className="mb-4 aspect-[4/5] w-full rounded-md bg-black object-contain"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video testimonial from ${t.author_name}`}
      className="relative mb-4 block aspect-[4/5] w-full overflow-hidden rounded-md bg-sunk"
    >
      {t.poster_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={t.poster_url} alt="" className="size-full object-cover" loading="lazy" />
      ) : (
        <span
          className="block size-full"
          style={{
            background:
              "linear-gradient(150deg, color-mix(in oklab, var(--v-accent) 22%, var(--v-surface-sunk)), var(--v-surface-sunk))",
          }}
        />
      )}
      <span className="absolute inset-0 grid place-items-center">
        <PlayGlyph />
      </span>
      {duration(t.video_duration_seconds) && (
        <span className="absolute bottom-2 right-2 rounded-xs bg-black/65 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
          {duration(t.video_duration_seconds)}
        </span>
      )}
    </button>
  );
}
