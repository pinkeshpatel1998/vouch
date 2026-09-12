<div align="center">

<img src="docs/screens/marketing.png" alt="Vouch — the marketing page, with a live testimonial wall above the fold" width="900">

# Vouch

**Collect text and video testimonials through a link you send, approve the good ones, and embed a wall on your site with one script tag.**

Replaces [Senja](https://senja.io) and [Testimonial.to](https://testimonial.to) — **$29/mo → free**, self-hostable on a free Supabase and Vercel tier.

Built for the Build Games, September 2026.

</div>

---

## The job it does

Senja and Testimonial.to are large products, but the job people pay for is narrow. Vouch does those four things and stops.

| | |
|---|---|
| **Ask** | One branded link. The person writing your testimonial never signs in, never installs anything, and can finish on a phone in one hand. |
| **Capture** | Text with a star rating, or video recorded in the browser — the thing a Google Form cannot do. |
| **Curate** | Everything lands as pending. Approve, reject, or fix the typos real testimonials arrive with. |
| **Display** | Three layouts, one script tag, and a wall that doesn't look bolted on. |

No importers, no email sequences, no Zapier, no billing. [The out-of-scope list is the contract.](DESIGN.md)

---

## The loop

### 1 · Someone writes you a testimonial

<img src="docs/screens/collect-mobile.png" alt="The public collection page on a phone, showing the owner's branding and a choice between writing and recording" width="330">

Mobile is the primary target — most people open this link on a phone. Video records in-browser with a countdown, a visible timer, a 90-second cap and a re-record step. No account, no app.

### 2 · You approve it

<img src="docs/screens/inbox.png" alt="The inbox, showing pending testimonials with approve, reject, edit and delete actions" width="900">

Pending, approved and rejected. Editing matters: real testimonials arrive with typos and owners want to fix them before they go public.

### 3 · You embed the wall

<img src="docs/screens/wall-builder.png" alt="The wall builder: layout, theme and accent controls on the left, a live preview of the real widget on the right" width="900">

Layout, theme, accent, item count — with a live preview rendering the **actual widget**, not a mockup. Then copy one line:

```html
<script src="https://vouch.app/embed.js" data-wall="wal_abc123" async></script>
```

---

## How the embed works

The widget is **4.7 kB gzipped** — vanilla TypeScript, no dependencies, rendered into a shadow root.

<img src="docs/screens/isolation.png" alt="A deliberately hostile host page where every CSS rule is !important — the widget renders untouched" width="900">

That page sets `font-family: Comic Sans`, `background: yellow` and `border: 3px dashed magenta` on every element, all `!important`. The yellow box proves the rules apply. The wall below it is untouched.

One subtlety worth knowing if you build something similar: **a shadow root protects its contents, but the host element still lives in the page's DOM.** `:host` loses to the outer document, so `div { background: yellow !important }` paints straight through. The host element is pinned from the style attribute with `all: initial !important` — inline `!important` is the only thing that beats an author `!important`. [`public/embed-test.html`](public/embed-test.html) exists to catch exactly that regression.

**Fallbacks**, because not every site allows scripts:

- **Static HTML export** — self-contained markup and inline CSS for Carrd, Notion, or anywhere JavaScript is blocked
- **iframe** — for platforms that only accept an embed URL; reports its own height to the parent

**Carousel templates** — `rail` (snap scroll), `marquee` (CSS-only infinite loop, pauses on hover, stops under `prefers-reduced-motion`), and `spotlight` (centre card in focus, neighbours scaled and faded).

---

## Design

<img src="docs/screens/dashboard.png" alt="The spaces dashboard showing a designed empty state" width="900">

- **One accent variable.** `--v-accent` is the only brand colour; hover, press, soft, line, text and focus-ring tints all derive from it with `color-mix`. A space owner picks one colour and cannot produce an unreadable pairing — the same mechanism brands the collection page and the embedded wall.
- **Dark app, themeable wall.** The chrome is dark indigo. The wall keeps a full light palette scoped to an element, because a widget has to render on whatever site it lands on.
- **Inter throughout**, headings at weight 500. Weight and tracking do the work a second family used to.
- **Elevation is a hairline ring**, not a drop shadow — on a dark ground a blurred shadow reads as smudge.
- **Rules fade out** 48px from each end; table row rules are row-level strips so the fade spans the row.
- **One motion moment** — cards settling into the wall. Everything else is a 120–220ms colour transition.

Full rationale and the rules that go with it: **[DESIGN.md](DESIGN.md)**.

---

## Security model

Authenticated owners talk to tables directly, with RLS scoping every row to `auth.uid()`. **Anonymous visitors get no table access at all** — the entire public surface is four `security definer` functions:

| Function | Used by |
|---|---|
| `collection_space(slug)` | the collection page — public fields only, never `user_id` |
| `submit_testimonial(…)` | the submission form — forces `status = 'pending'`, requires consent |
| `wall_payload(wall_id)` | the embed endpoint — config plus approved rows in one round trip |
| `record_wall_view(…)` | the widget — one raw count, nothing else |

Two consequences: there is deliberately **no INSERT policy on `testimonials`**, so a submission cannot be forged as approved; and consent is a check constraint, not just a checkbox.

---

## Running it

```bash
npm install
npm run dev
```

That's enough to browse everything. With no Supabase environment variables set, the app runs in **local mode** against a localStorage-backed data layer, and `/app` opens without signing in. Recorded video goes to IndexedDB.

Setting the two Supabase environment variables is the entire switch. `lib/data/index.ts` chooses between `store.ts` (localStorage) and `supabase.ts` (Postgres + RLS) at import time; both export identical signatures, `putBlob` starts uploading to Storage instead of IndexedDB, and `/app` starts requiring a Google sign-in. `npm run check:imports` fails the build if a screen reaches past the adapter into either implementation.

For real auth and Postgres, follow **[SETUP.md](SETUP.md)** — the Supabase project, the Google OAuth client and the environment variables all need your own credentials.

---

## Status

Day 11 of 28. Every screen is built, the loop works end to end, and the SQL is
verified. Still running on the local data layer — Supabase is the next step.

**Verified, not assumed:**

- `npm run db:check` applies all five migrations to a real Postgres 18 (PGlite,
  in-process, no Docker) and runs 26 checks across constraints, the four public
  RPCs and RLS from both an owner's and an anonymous session.
- `npm run perf:widget` loads the embed on a cold cache and times the first card
  into the shadow root: **150 ms** against a production build, comfortably inside
  §14's 400 ms budget.
- `npm run check` runs typecheck, the data-layer import guard and the database
  checks together.

**Still open:**

- Not deployed, so there is no public demo URL and no "try it" link yet.
- The seeded demo space is text-only. Two video testimonials are a submission
  requirement; seeding fake ones would mean a play button leading nowhere, so
  they need recording through the real flow.
- No 60-second demo recording.
- Video capture — `MediaRecorder`, countdown, timer, 90s cap, re-record, poster
  frame — has still never run on a physical iPhone. Safari hands back mp4 where
  Chrome and Firefox hand back webm; Vouch stores whatever the browser gives it
  and serves it back as-is, with no transcoding.

---

## Layout

```
widget/embed.ts                   the embed widget -> public/embed.js
app/api/walls/[id]/               wall JSON + view count
app/globals.css                   token layer (read DESIGN.md before touching)
app/page.tsx                      marketing page
app/app/                          dashboard, inbox, wall builder, settings
app/c/[slug]/                     public collection page
app/styleguide/                   component gallery
components/ui/                    primitives
components/collect/               video recorder
components/wall/wall-render.tsx   the wall; the widget is a port of this
lib/data/store.ts                 local data layer, mirrors the RPC contract
lib/data/blobs.ts                 recorded video in IndexedDB
lib/export-html.ts                static HTML and iframe generators
supabase/migrations/              schema, RLS, storage
scripts/screenshots.mjs           regenerates the images above
```

| Route | |
|---|---|
| `/` | marketing page |
| `/app` | spaces, counts and a recent-activity table |
| `/app/submissions` | every submission across every space |
| `/app/account` | account and totals |
| `/app/[space]/inbox` | approve, reject, edit, delete |
| `/app/[space]/wall` | layout, theme, accent, live preview, three embed formats |
| `/app/[space]/settings` | branding, prompt, toggles, collection link, QR code |
| `/c/[slug]` | public collection page |
| `/styleguide` | the design system |
| `/embed-test.html` | hostile host page |
| `/embed-layouts.html` | every layout and carousel style |
