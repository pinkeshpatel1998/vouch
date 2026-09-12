"use client";

/**
 * The data layer screens import from.
 *
 * Two implementations sit behind this file with identical signatures:
 * `store.ts` (localStorage, no sign-in) and `supabase.ts` (Postgres + RLS).
 * Which one is live is decided by whether the Supabase environment variables
 * are set, so switching is a deploy-time config change and not a code change.
 *
 * Screens must import from `@/lib/data`, never from either implementation
 * directly -- `npm run check:imports` enforces that.
 */

import { supabaseConfigured } from "@/lib/supabase/env";
import * as local from "./store";
import * as remote from "./supabase";

export type { ActivityRow, SpaceOverview } from "./store";

const impl = supabaseConfigured() ? remote : local;

/** Which backend is live. The account screen reports this to the owner. */
export const backend: "supabase" | "local" = supabaseConfigured() ? "supabase" : "local";

/* Spaces */
export const listSpaces = impl.listSpaces;
export const listSpacesOverview = impl.listSpacesOverview;
export const getSpace = impl.getSpace;
export const createSpace = impl.createSpace;
export const updateSpace = impl.updateSpace;
export const deleteSpace = impl.deleteSpace;

/* Testimonials */
export const listTestimonials = impl.listTestimonials;
export const countsByStatus = impl.countsByStatus;
export const listIncompleteUploads = impl.listIncompleteUploads;
export const setTestimonialStatus = impl.setTestimonialStatus;
export const updateTestimonial = impl.updateTestimonial;
export const deleteTestimonial = impl.deleteTestimonial;

/* Walls */
export const getWallForSpace = impl.getWallForSpace;
export const updateWall = impl.updateWall;

/* Cross-space */
export const listActivity = impl.listActivity;
export const totals = impl.totals;

/* Public surface */
export const collectionSpace = impl.collectionSpace;
export const submitTestimonial = impl.submitTestimonial;
export const wallPayload = impl.wallPayload;
export const recordWallView = impl.recordWallView;

/* Pure helpers — same in both worlds */
export const slugify = local.slugify;
export const uid = local.uid;
export const subscribe = local.subscribe;
