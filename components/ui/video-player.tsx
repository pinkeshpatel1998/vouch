"use client";

import { useBlobUrl } from "@/lib/data/blobs";
import { cn } from "@/lib/cn";

/**
 * Plays whatever is in `video_url` -- a locally stored recording now, a
 * Supabase Storage URL later. Callers never learn which.
 */
export function VideoPlayer({
  stored,
  poster,
  className,
  autoPlay,
}: {
  stored: string | null;
  poster?: string | null;
  className?: string;
  autoPlay?: boolean;
}) {
  const url = useBlobUrl(stored);

  if (!url) {
    return (
      <p className="rounded-md border border-dashed border-line bg-sunk px-4 py-8 text-center text-[13px] text-muted">
        {stored ? "Loading video…" : "This testimonial has no playable file attached."}
      </p>
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      src={url}
      poster={poster ?? undefined}
      controls
      autoPlay={autoPlay}
      playsInline
      preload="metadata"
      className={cn("w-full rounded-md bg-black", className)}
    />
  );
}
