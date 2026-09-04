/**
 * Local data layer.
 *
 * Every function here is the exact shape its Supabase counterpart will have --
 * same name, same arguments, same return type, all async. When the project
 * exists, `lib/data/index.ts` swaps this module for one built on the RPCs in
 * supabase/migrations/0002_rls.sql and no screen changes.
 *
 * Backed by localStorage so a demo survives a refresh.
 */

import type {
  Layout,
  PublicSpace,
  Space,
  SubmitTestimonialArgs,
  Testimonial,
  TestimonialStatus,
  Theme,
  Wall,
  WallPayload,
} from "@/lib/database.types";

const KEY = "vouch-store-v1";

type Snapshot = {
  spaces: Space[];
  testimonials: Testimonial[];
  walls: Wall[];
};

const EMPTY: Snapshot = { spaces: [], testimonials: [], walls: [] };

/* ---------------- plumbing ---------------- */

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function read(): Snapshot {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Snapshot>;
    return {
      spaces: parsed.spaces ?? [],
      testimonials: parsed.testimonials ?? [],
      walls: parsed.walls ?? [],
    };
  } catch {
    return EMPTY;
  }
}

function write(next: Snapshot) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Quota or a private window. The screen stays usable for this session.
  }
  listeners.forEach((fn) => fn());
}

/* Subscription so open tabs and sibling components stay in step. */
const listeners = new Set<() => void>();
export function subscribe(fn: () => void) {
  listeners.add(fn);
  if (typeof window !== "undefined") window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") window.removeEventListener("storage", fn);
  };
}

/* A tiny delay so loading states are real rather than theoretical. */
const tick = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 90));

/* ---------------- owner: spaces ---------------- */

export async function listSpaces(): Promise<Space[]> {
  const { spaces } = read();
  return tick([...spaces].sort((a, b) => b.created_at.localeCompare(a.created_at)));
}

export async function getSpace(id: string): Promise<Space | null> {
  return tick(read().spaces.find((s) => s.id === id) ?? null);
}

export async function createSpace(input: {
  name: string;
  slug?: string;
  accent_color?: string;
}): Promise<Space> {
  const snap = read();
  const base = slugify(input.slug || input.name) || "space";

  // Slugs are unique; suffix rather than reject, the owner does not care.
  let slug = base;
  let n = 2;
  while (snap.spaces.some((s) => s.slug === slug)) slug = `${base}-${n++}`;

  const space: Space = {
    id: uid(),
    user_id: "local-owner",
    slug,
    name: input.name.trim(),
    logo_url: null,
    accent_color: input.accent_color ?? "#9184d9",
    prompt_question: "What did we help you achieve?",
    thankyou_message: "Thank you — that genuinely helps.",
    allow_text: true,
    allow_video: true,
    require_photo: false,
    show_ratings: true,
    created_at: new Date().toISOString(),
  };

  const wall: Wall = {
    id: uid(),
    space_id: space.id,
    layout: "masonry",
    carousel_style: "rail",
    theme: "auto",
    accent_color: null,
    max_items: 12,
    show_ratings: true,
    include_video: true,
    created_at: new Date().toISOString(),
  };

  write({ ...snap, spaces: [...snap.spaces, space], walls: [...snap.walls, wall] });
  return tick(space);
}

export async function updateSpace(id: string, patch: Partial<Space>): Promise<Space> {
  const snap = read();
  const next = snap.spaces.map((s) => (s.id === id ? { ...s, ...patch, id: s.id } : s));
  write({ ...snap, spaces: next });
  return tick(next.find((s) => s.id === id)!);
}

export async function deleteSpace(id: string): Promise<void> {
  const snap = read();
  write({
    spaces: snap.spaces.filter((s) => s.id !== id),
    testimonials: snap.testimonials.filter((t) => t.space_id !== id),
    walls: snap.walls.filter((w) => w.space_id !== id),
  });
  return tick(undefined);
}

/* ---------------- owner: testimonials ---------------- */

export async function listTestimonials(
  spaceId: string,
  status?: TestimonialStatus,
): Promise<Testimonial[]> {
  const rows = read()
    .testimonials.filter((t) => t.space_id === spaceId && (!status || t.status === status))
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  return tick(rows);
}

export async function countsByStatus(
  spaceId: string,
): Promise<Record<TestimonialStatus, number>> {
  const rows = read().testimonials.filter((t) => t.space_id === spaceId);
  return tick({
    pending: rows.filter((t) => t.status === "pending").length,
    approved: rows.filter((t) => t.status === "approved").length,
    rejected: rows.filter((t) => t.status === "rejected").length,
  });
}

export async function setTestimonialStatus(
  id: string,
  status: TestimonialStatus,
): Promise<Testimonial> {
  const snap = read();
  // Mirrors the guard_incomplete_video trigger: an unfinished upload must
  // never reach a wall, whatever the caller asks for.
  const row = snap.testimonials.find((t) => t.id === id);
  if (row && status === "approved" && row.type === "video" && !row.video_url) {
    throw new Error("A video testimonial cannot be approved before its upload completes");
  }
  const next = snap.testimonials.map((t) =>
    t.id === id
      ? {
          ...t,
          status,
          // Mirrors the sync_approved_at trigger.
          approved_at: status === "approved" ? new Date().toISOString() : null,
        }
      : t,
  );
  write({ ...snap, testimonials: next });
  return tick(next.find((t) => t.id === id)!);
}

export async function updateTestimonial(
  id: string,
  patch: Partial<Pick<Testimonial, "body" | "author_name" | "author_role" | "author_company">>,
): Promise<Testimonial> {
  const snap = read();
  const next = snap.testimonials.map((t) => (t.id === id ? { ...t, ...patch } : t));
  write({ ...snap, testimonials: next });
  return tick(next.find((t) => t.id === id)!);
}

export async function deleteTestimonial(id: string): Promise<void> {
  const snap = read();
  write({ ...snap, testimonials: snap.testimonials.filter((t) => t.id !== id) });
  return tick(undefined);
}

/* ---------------- owner: walls ---------------- */

export async function getWallForSpace(spaceId: string): Promise<Wall | null> {
  const w = read().walls.find((x) => x.space_id === spaceId);
  if (!w) return tick(null);
  // Walls saved before carousel_style existed need the column default applied,
  // the same way the migration does it server-side.
  return tick({ ...w, carousel_style: w.carousel_style ?? "rail" });
}

export async function updateWall(
  id: string,
  patch: Partial<
    Pick<
      Wall,
      | "layout"
      | "carousel_style"
      | "theme"
      | "accent_color"
      | "max_items"
      | "show_ratings"
      | "include_video"
    >
  >,
): Promise<Wall> {
  const snap = read();
  const next = snap.walls.map((w) => (w.id === id ? { ...w, ...patch } : w));
  write({ ...snap, walls: next });
  return tick(next.find((w) => w.id === id)!);
}

/* ---------------- public surface ----------------
   These four mirror the security-definer functions exactly. */

export async function collectionSpace(slug: string): Promise<PublicSpace | null> {
  const s = read().spaces.find((x) => x.slug === slug);
  if (!s) return tick(null);
  const {
    id, slug: sl, name, logo_url, accent_color, prompt_question,
    thankyou_message, allow_text, allow_video, require_photo, show_ratings,
  } = s;
  return tick({
    id, slug: sl, name, logo_url, accent_color, prompt_question,
    thankyou_message, allow_text, allow_video, require_photo, show_ratings,
  });
}

export async function submitTestimonial(args: SubmitTestimonialArgs): Promise<string> {
  const snap = read();
  const space = snap.spaces.find((s) => s.slug === args.p_slug);

  // Same refusals, in the same order, as submit_testimonial().
  if (!args.p_consent) throw new Error("Consent is required");
  if (!space) throw new Error("No such space");
  if (args.p_type === "text" && !space.allow_text)
    throw new Error("This space is not accepting written testimonials");
  if (args.p_type === "video" && !space.allow_video)
    throw new Error("This space is not accepting video testimonials");
  if (space.require_photo && !args.p_author_avatar_url)
    throw new Error("A photo is required for this space");

  const row: Testimonial = {
    id: uid(),
    space_id: space.id,
    type: args.p_type,
    body: args.p_body?.trim() || null,
    rating: args.p_rating ?? null,
    video_url: args.p_video_url ?? null,
    video_duration_seconds: args.p_video_duration ?? null,
    poster_url: args.p_poster_url ?? null,
    author_name: args.p_author_name.trim(),
    author_role: args.p_author_role?.trim() || null,
    author_company: args.p_author_company?.trim() || null,
    author_avatar_url: args.p_author_avatar_url ?? null,
    status: "pending",
    consent_given: true,
    submitted_at: new Date().toISOString(),
    approved_at: null,
  };

  write({ ...snap, testimonials: [...snap.testimonials, row] });
  return tick(row.id);
}

export async function wallPayload(wallId: string): Promise<WallPayload | null> {
  const snap = read();
  const w = snap.walls.find((x) => x.id === wallId);
  if (!w) return tick(null);
  const s = snap.spaces.find((x) => x.id === w.space_id);
  if (!s) return tick(null);

  const showRatings = w.show_ratings && s.show_ratings;

  const testimonials = snap.testimonials
    .filter(
      (t) =>
        t.space_id === s.id &&
        t.status === "approved" &&
        (w.include_video || t.type === "text"),
    )
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
    .slice(0, w.max_items)
    .map((t) => ({
      id: t.id,
      type: t.type,
      body: t.body,
      rating: showRatings ? t.rating : null,
      video_url: t.video_url,
      video_duration_seconds: t.video_duration_seconds,
      poster_url: t.poster_url,
      author_name: t.author_name,
      author_role: t.author_role,
      author_company: t.author_company,
      author_avatar_url: t.author_avatar_url,
    }));

  return tick({
    wall: {
      id: w.id,
      layout: w.layout as Layout,
      carousel_style: w.carousel_style ?? "rail",
      theme: w.theme as Theme,
      accent_color: w.accent_color ?? s.accent_color,
      show_ratings: showRatings,
      include_video: w.include_video,
    },
    space: { name: s.name, logo_url: s.logo_url },
    testimonials,
  });
}

export async function recordWallView(): Promise<void> {
  // No-op locally. The real one inserts a row in wall_views.
  return tick(undefined);
}

/* ---------------- dashboard overview ---------------- */

export type SpaceOverview = Space & {
  pending: number;
  approved: number;
  rejected: number;
};

export async function listSpacesOverview(): Promise<SpaceOverview[]> {
  const { spaces, testimonials } = read();
  const rows = [...spaces]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((s) => {
      const mine = testimonials.filter((t) => t.space_id === s.id);
      return {
        ...s,
        pending: mine.filter((t) => t.status === "pending").length,
        approved: mine.filter((t) => t.status === "approved").length,
        rejected: mine.filter((t) => t.status === "rejected").length,
      };
    });
  return tick(rows);
}

/* ---------------- cross-space activity ---------------- */

export type ActivityRow = Testimonial & { space_name: string; space_slug: string };

/**
 * Recent submissions across every space. Backs the dashboard's activity table
 * and the all-submissions view. In Supabase this is one join, filtered by RLS
 * to the owner's own spaces.
 */
export async function listActivity(opts?: {
  limit?: number;
  status?: TestimonialStatus;
  spaceId?: string;
}): Promise<ActivityRow[]> {
  const { spaces, testimonials } = read();
  const byId = new Map(spaces.map((s) => [s.id, s]));

  const rows = testimonials
    .filter((t) => (!opts?.status || t.status === opts.status))
    .filter((t) => (!opts?.spaceId || t.space_id === opts.spaceId))
    .filter((t) => byId.has(t.space_id))
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
    .map((t) => ({
      ...t,
      space_name: byId.get(t.space_id)!.name,
      space_slug: byId.get(t.space_id)!.slug,
    }));

  return tick(opts?.limit ? rows.slice(0, opts.limit) : rows);
}

export async function totals(): Promise<{ spaces: number; collected: number; pending: number }> {
  const { spaces, testimonials } = read();
  return tick({
    spaces: spaces.length,
    collected: testimonials.length,
    pending: testimonials.filter((t) => t.status === "pending").length,
  });
}


/** Video rows whose upload never landed. Surfaced as an inbox alert. */
export async function listIncompleteUploads(spaceId: string): Promise<Testimonial[]> {
  const rows = read()
    .testimonials.filter(
      (t) => t.space_id === spaceId && t.type === "video" && !t.video_url,
    )
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  return tick(rows);
}
