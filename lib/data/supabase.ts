"use client";

/**
 * The Supabase implementation of the data layer.
 *
 * Every export here matches its counterpart in `store.ts` exactly -- same name,
 * same arguments, same return type. `index.ts` picks between them at import
 * time based on whether the environment is configured, so no screen knows or
 * cares which one it is talking to.
 *
 * Owner reads and writes go straight to tables; RLS does the scoping. The
 * public surface goes through the four security-definer RPCs.
 */

import { createClient } from "@/lib/supabase/client";
import type {
  PublicSpace,
  Space,
  SubmitTestimonialArgs,
  Testimonial,
  TestimonialStatus,
  Wall,
  WallPayload,
} from "@/lib/database.types";
import type { ActivityRow, SpaceOverview } from "./store";

export { uid, slugify, subscribe } from "./store";

/** Supabase returns `{ data, error }`; every caller here wants a throw. */
function unwrap<T>({ data, error }: { data: T; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data;
}

const db = () => createClient();

/* ---------------- owner: spaces ---------------- */

export async function listSpaces(): Promise<Space[]> {
  return unwrap(
    await db().from("spaces").select("*").order("created_at", { ascending: false }),
  ) as Space[];
}

export async function listSpacesOverview(): Promise<SpaceOverview[]> {
  const spaces = await listSpaces();
  if (spaces.length === 0) return [];

  // RLS already limits this to the owner's rows, so no filter is needed.
  const rows = unwrap(await db().from("testimonials").select("space_id, status")) as Array<{
    space_id: string;
    status: TestimonialStatus;
  }>;

  return spaces.map((s) => {
    const mine = rows.filter((t) => t.space_id === s.id);
    return {
      ...s,
      pending: mine.filter((t) => t.status === "pending").length,
      approved: mine.filter((t) => t.status === "approved").length,
      rejected: mine.filter((t) => t.status === "rejected").length,
    };
  });
}

export async function getSpace(id: string): Promise<Space | null> {
  const { data, error } = await db().from("spaces").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Space) ?? null;
}

export async function createSpace(input: {
  name: string;
  slug?: string;
  accent_color?: string;
}): Promise<Space> {
  const { slugify } = await import("./store");
  const base = slugify(input.slug || input.name) || "space";

  const { data: taken } = await db().from("spaces").select("slug").like("slug", `${base}%`);
  const used = new Set((taken ?? []).map((r: { slug: string }) => r.slug));

  let slug = base;
  let n = 2;
  while (used.has(slug)) slug = `${base}-${n++}`;

  const { data: auth } = await db().auth.getUser();
  if (!auth.user) throw new Error("Not signed in.");

  const space = unwrap(
    await db()
      .from("spaces")
      .insert({
        user_id: auth.user.id,
        slug,
        name: input.name.trim(),
        accent_color: input.accent_color ?? "#b84925",
      })
      .select()
      .single(),
  ) as Space;

  // Every space gets a wall, so the builder is never empty-handed.
  unwrap(await db().from("walls").insert({ space_id: space.id }).select().single());

  return space;
}

export async function updateSpace(id: string, patch: Partial<Space>): Promise<Space> {
  const { id: _drop, ...safe } = patch;
  void _drop;
  return unwrap(
    await db().from("spaces").update(safe).eq("id", id).select().single(),
  ) as Space;
}

export async function deleteSpace(id: string): Promise<void> {
  // Testimonials and walls cascade at the schema level.
  unwrap(await db().from("spaces").delete().eq("id", id).select());
}

/* ---------------- owner: testimonials ---------------- */

export async function listTestimonials(
  spaceId: string,
  status?: TestimonialStatus,
): Promise<Testimonial[]> {
  let q = db()
    .from("testimonials")
    .select("*")
    .eq("space_id", spaceId)
    .order("submitted_at", { ascending: false });
  if (status) q = q.eq("status", status);
  return unwrap(await q) as Testimonial[];
}

export async function countsByStatus(
  spaceId: string,
): Promise<Record<TestimonialStatus, number>> {
  const rows = unwrap(
    await db().from("testimonials").select("status").eq("space_id", spaceId),
  ) as Array<{ status: TestimonialStatus }>;
  return {
    pending: rows.filter((t) => t.status === "pending").length,
    approved: rows.filter((t) => t.status === "approved").length,
    rejected: rows.filter((t) => t.status === "rejected").length,
  };
}

export async function listIncompleteUploads(spaceId: string): Promise<Testimonial[]> {
  return unwrap(
    await db()
      .from("testimonials")
      .select("*")
      .eq("space_id", spaceId)
      .eq("type", "video")
      .is("video_url", null)
      .order("submitted_at", { ascending: false }),
  ) as Testimonial[];
}

export async function setTestimonialStatus(
  id: string,
  status: TestimonialStatus,
): Promise<Testimonial> {
  // approved_at is maintained by the sync_approved_at trigger, and
  // guard_incomplete_video refuses to approve a video with no file -- both
  // raise from the database rather than being re-checked here.
  return unwrap(
    await db().from("testimonials").update({ status }).eq("id", id).select().single(),
  ) as Testimonial;
}

export async function updateTestimonial(
  id: string,
  patch: Partial<
    Pick<Testimonial, "body" | "author_name" | "author_role" | "author_company">
  >,
): Promise<Testimonial> {
  return unwrap(
    await db().from("testimonials").update(patch).eq("id", id).select().single(),
  ) as Testimonial;
}

export async function deleteTestimonial(id: string): Promise<void> {
  unwrap(await db().from("testimonials").delete().eq("id", id).select());
}

/* ---------------- owner: walls ---------------- */

export async function getWallForSpace(spaceId: string): Promise<Wall | null> {
  const { data, error } = await db()
    .from("walls")
    .select("*")
    .eq("space_id", spaceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Wall) ?? null;
}

export async function updateWall(id: string, patch: Partial<Wall>): Promise<Wall> {
  const { id: _drop, space_id: _drop2, ...safe } = patch;
  void _drop;
  void _drop2;
  return unwrap(await db().from("walls").update(safe).eq("id", id).select().single()) as Wall;
}

/* ---------------- cross-space activity ---------------- */

export async function listActivity(opts?: {
  limit?: number;
  status?: TestimonialStatus;
  spaceId?: string;
}): Promise<ActivityRow[]> {
  let q = db()
    .from("testimonials")
    .select("*, spaces!inner(name, slug)")
    .order("submitted_at", { ascending: false });

  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.spaceId) q = q.eq("space_id", opts.spaceId);
  if (opts?.limit) q = q.limit(opts.limit);

  const rows = unwrap(await q) as Array<Testimonial & { spaces: { name: string; slug: string } }>;
  return rows.map(({ spaces, ...t }) => ({
    ...t,
    space_name: spaces.name,
    space_slug: spaces.slug,
  }));
}

export async function totals(): Promise<{ spaces: number; collected: number; pending: number }> {
  const [spaces, rows] = await Promise.all([
    db().from("spaces").select("id", { count: "exact", head: true }),
    db().from("testimonials").select("status"),
  ]);
  const all = (rows.data ?? []) as Array<{ status: TestimonialStatus }>;
  return {
    spaces: spaces.count ?? 0,
    collected: all.length,
    pending: all.filter((t) => t.status === "pending").length,
  };
}

/* ---------------- public surface: the four RPCs ---------------- */

export async function collectionSpace(slug: string): Promise<PublicSpace | null> {
  const { data, error } = await db().rpc("collection_space", { p_slug: slug });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as PublicSpace[];
  return rows[0] ?? null;
}

export async function submitTestimonial(args: SubmitTestimonialArgs): Promise<string> {
  const { data, error } = await db().rpc("submit_testimonial", args);
  if (error) throw new Error(error.message);
  return data as string;
}

export async function wallPayload(wallId: string): Promise<WallPayload | null> {
  const { data, error } = await db().rpc("wall_payload", { p_wall_id: wallId });
  if (error) throw new Error(error.message);
  return (data as WallPayload) ?? null;
}

export async function recordWallView(
  wallId: string,
  referrerDomain?: string | null,
): Promise<void> {
  await db().rpc("record_wall_view", {
    p_wall_id: wallId,
    p_referrer_domain: referrerDomain ?? null,
  });
}
