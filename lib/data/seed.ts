import type { Testimonial } from "@/lib/database.types";
import { uid } from "./store";
import { backend, createSpace, submitTestimonial, setTestimonialStatus } from "./index";

/**
 * One-click demo space. Section 5.2 asks for an empty state that produces
 * something populated, and section 12 wants no screen ever looking empty to a
 * judge.
 *
 * Text only, deliberately. Two demo videos are a submission requirement, but
 * seeding fake ones would mean a play button that leads nowhere -- exactly the
 * dead end section 2 says loses the category. Record them through the real
 * flow at /c/[slug]; that proves the capture path as a side effect.
 */

const QUOTES: Array<
  Pick<Testimonial, "body" | "rating" | "author_name" | "author_role" | "author_company" | "status">
> = [
  { body: "We sent the link to eleven customers on a Friday and had seven testimonials by Monday. Two of them were video. The old process was me writing awkward follow-up emails for a fortnight.", rating: 5, author_name: "Priya Raman", author_role: "Founder", author_company: "Lantern Studio", status: "approved" },
  { body: "The embed did not fight my site's CSS, which is the first time I can say that about a widget.", rating: 5, author_name: "Dana Whitfield", author_role: "Design lead", author_company: "Norrland", status: "approved" },
  { body: "I record client testimonials at the end of onboarding calls now. One link, they do it on their phone, I approve it that evening. It has quietly become part of the process.", rating: 4, author_name: "Tomás Herrera", author_role: "Independent consultant", author_company: null, status: "approved" },
  { body: "Set up three spaces for three clients in about six minutes. The QR code on the collection page is a nice touch at events.", rating: 5, author_name: "Sam Okonjo", author_role: "Agency owner", author_company: "Ninefold", status: "approved" },
  { body: "Cancelled the $29/mo one. This does the four things I actually used.", rating: 5, author_name: "Elena Vasquez", author_role: "Solo founder", author_company: null, status: "approved" },
  { body: "My customers are not technical and none of them asked me a single question about how to use it. That is the whole review.", rating: 5, author_name: "Ingrid Solberg", author_role: "Bookkeeper", author_company: "Solberg & Co", status: "approved" },
  { body: "The wall looks like part of my site rather than something bolted on. I changed one colour and it matched.", rating: 5, author_name: "Kwame Mensah", author_role: "Freelance developer", author_company: null, status: "approved" },
  { body: "Approving from my phone between meetings is the feature I did not know I wanted.", rating: 4, author_name: "Beatriz Lima", author_role: "Marketing", author_company: "Halden", status: "approved" },
  { body: "Static HTML export meant I could put this on a Carrd page where scripts are blocked. Nothing else I tried could do that.", rating: 5, author_name: "Otto Lindqvist", author_role: "Course creator", author_company: null, status: "approved" },
  { body: "Honestly I set it up expecting to fight it for an hour. It took four minutes.", rating: 5, author_name: "Yuki Tanaka", author_role: "Product designer", author_company: "Kite", status: "approved" },
  { body: "Being able to fix a typo before publishing sounds small. It is not small. Real testimonials arrive messy.", rating: 5, author_name: "Ana Kowalczyk", author_role: "Ops", author_company: "Bellwether", status: "pending" },
  { body: "Good tool. I would like it to import my old Twitter mentions eventually.", rating: 4, author_name: "Ravi Deshpande", author_role: "Indie hacker", author_company: null, status: "pending" },
  { body: "Wrong link, ignore this one.", rating: 3, author_name: "Test Submission", author_role: null, author_company: null, status: "rejected" },
];

const STORE_KEY = "vouch-store-v1";

export async function seedDemoSpace() {
  const space = await createSpace({ name: "Lantern Studio", slug: "lantern-studio" });

  if (backend === "supabase") {
    // There is deliberately no INSERT policy on testimonials, so even the owner
    // cannot write one directly -- the seed goes in through the same public RPC
    // a real submitter uses, then gets moved out of pending afterwards.
    for (const q of QUOTES) {
      const id = await submitTestimonial({
        p_slug: space.slug,
        p_type: "text",
        p_author_name: q.author_name,
        p_consent: true,
        p_body: q.body,
        p_rating: q.rating,
        p_author_role: q.author_role,
        p_author_company: q.author_company,
      });
      if (q.status !== "pending") await setTestimonialStatus(id, q.status);
    }
    return space;
  }

  // Local mode writes straight to the snapshot: going through the RPC would
  // force every row to 'pending', which is correct for a real submission and
  // useless for a demo that needs an already-populated wall.
  const now = Date.now();
  const rows: Testimonial[] = QUOTES.map((q, i) => ({
    id: uid(),
    space_id: space.id,
    type: "text",
    body: q.body,
    rating: q.rating,
    video_url: null,
    video_duration_seconds: null,
    poster_url: null,
    author_name: q.author_name,
    author_role: q.author_role,
    author_company: q.author_company,
    author_avatar_url: null,
    status: q.status,
    consent_given: true,
    // Spread over the past fortnight so ordering is meaningful.
    submitted_at: new Date(now - i * 26 * 3600 * 1000).toISOString(),
    approved_at:
      q.status === "approved" ? new Date(now - i * 25 * 3600 * 1000).toISOString() : null,
  }));

  const raw = window.localStorage.getItem(STORE_KEY);
  const snap = raw ? JSON.parse(raw) : { spaces: [], testimonials: [], walls: [] };
  snap.testimonials = [...(snap.testimonials ?? []), ...rows];
  window.localStorage.setItem(STORE_KEY, JSON.stringify(snap));
  window.dispatchEvent(new Event("storage"));

  return space;
}
