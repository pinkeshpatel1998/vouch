import type { WallPayload } from "@/lib/database.types";

/**
 * A server-rendered demo wall, served at /api/walls/demo.
 *
 * Section 12 asks for a seeded space so no screen is ever empty for a judge.
 * It also makes the widget genuinely testable from another origin before the
 * database exists, which the browser-local store cannot do.
 */
const QUOTES: Array<[string, number, string, string | null, string | null]> = [
  ["We sent the link to eleven customers on a Friday and had seven testimonials by Monday. Two of them were video. The old process was me writing awkward follow-up emails for a fortnight.", 5, "Priya Raman", "Founder", "Lantern Studio"],
  ["The embed did not fight my site's CSS, which is the first time I can say that about a widget.", 5, "Dana Whitfield", "Design lead", "Norrland"],
  ["I record client testimonials at the end of onboarding calls now. One link, they do it on their phone, I approve it that evening. It has quietly become part of the process.", 4, "Tomás Herrera", "Independent consultant", null],
  ["Set up three spaces for three clients in about six minutes. The QR code on the collection page is a nice touch at events.", 5, "Sam Okonjo", "Agency owner", "Ninefold"],
  ["Cancelled the $29/mo one. This does the four things I actually used.", 5, "Elena Vasquez", "Solo founder", null],
  ["My customers are not technical and none of them asked me a single question about how to use it. That is the whole review.", 5, "Ingrid Solberg", "Bookkeeper", "Solberg & Co"],
  ["The wall looks like part of my site rather than something bolted on. I changed one colour and it matched.", 5, "Kwame Mensah", "Freelance developer", null],
  ["Approving from my phone between meetings is the feature I did not know I wanted.", 4, "Beatriz Lima", "Marketing", "Halden"],
  ["Static HTML export meant I could put this on a Carrd page where scripts are blocked. Nothing else I tried could do that.", 5, "Otto Lindqvist", "Course creator", null],
  ["Honestly I set it up expecting to fight it for an hour. It took four minutes.", 5, "Yuki Tanaka", "Product designer", "Kite"],
];

export const demoWallPayload: WallPayload = {
  wall: {
    id: "demo",
    layout: "masonry",
    carousel_style: "rail",
    theme: "auto",
    accent_color: "oklch(0.582 0.148 38)",
    show_ratings: true,
    include_video: true,
  },
  space: { name: "Lantern Studio", logo_url: null },
  testimonials: QUOTES.map(([body, rating, name, role, company], i) => ({
    id: `demo-${i + 1}`,
    type: "text" as const,
    body,
    rating,
    video_url: null,
    video_duration_seconds: null,
    poster_url: null,
    author_name: name,
    author_role: role,
    author_company: company,
    author_avatar_url: null,
  })),
};
