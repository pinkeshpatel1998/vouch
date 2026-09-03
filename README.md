# Vouch

Collect text and video testimonials through a link you send, approve the good
ones, and embed a wall on your site with one script tag.

Replaces Senja / Testimonial.to ($29/mo).

## Status

Day 3 of 28. Every screen in the spec is built and works end to end. The data
layer is local — see below.

| Route | |
|---|---|
| `/` | marketing page, with a live wall above the fold |
| `/app` | spaces, with counts and a one-click demo space |
| `/app/[space]/inbox` | pending / approved / rejected, approve, reject, edit, delete |
| `/app/[space]/wall` | layout, theme, accent, live preview, three embed formats |
| `/app/[space]/settings` | branding, prompt, toggles, collection link, QR code |
| `/c/[slug]` | public collection page — write or record, mobile first |
| `/styleguide` | the design system |
| `/sign-in` | Google OAuth (needs Supabase configured) |

The widget ships as `public/embed.js` — 4.2 kB gzipped against a 15 kB budget,
vanilla TS, shadow DOM, no dependencies.

| Route | |
|---|---|
| `/api/walls/[id]` | the widget's only endpoint — CORS, edge-cached |
| `/embed/[id]` | iframe fallback, reports its height to the parent |
| `/embed-test.html` | hostile host page: every rule `!important` |
| `/embed-layouts.html` | every layout and carousel style on one page |

## Local mode

With no Supabase environment variables set, the app runs against
`lib/data/store.ts` — a localStorage-backed data layer — and `/app` opens
without signing in. Recorded video goes to IndexedDB.

Every function in that module has the exact name, arguments and return type of
the Supabase RPC it stands in for, including the four security-definer functions
in `supabase/migrations/0002_rls.sql`. Wiring the real backend is an adapter
swap, not a rewrite.

Set the environment variables and the app switches to real auth and real
Postgres. See [SETUP.md](SETUP.md).

**One thing local mode cannot fake.** The widget fetches its wall over HTTP from
another origin; the local store lives in one browser's localStorage. So the
script-tag and iframe snippets work today only against `/api/walls/demo`, which
is served from the server. A wall you create in the builder needs Supabase
before its snippet will render on someone else's site. The static HTML export
has no such limit — it is self-contained and works now.

## Running it

```bash
npm install
npm run dev
```

Then follow [SETUP.md](SETUP.md) to create the Supabase project and wire up
Google OAuth — both need your own credentials. Without them `/` and
`/styleguide` still work.

## Layout

```
widget/embed.ts                   the embed widget -> public/embed.js
app/api/walls/[id]/               wall JSON + view count
app/globals.css                   token layer (read DESIGN.md before touching)
app/page.tsx                      marketing page
app/app/                          owner dashboard, inbox, wall builder, settings
app/c/[slug]/                     public collection page
app/styleguide/                   component gallery
components/ui/                    primitives
components/collect/               video recorder
components/wall/wall-render.tsx   the wall; the widget ports this
components/testimonial-card.tsx   wall card + single-quote card
lib/data/store.ts                 local data layer, mirrors the RPC contract
lib/data/blobs.ts                 recorded video in IndexedDB
lib/export-html.ts                static HTML and iframe embed generators
lib/supabase/                     browser, server and middleware clients
supabase/migrations/              schema, RLS, storage
```

See [DESIGN.md](DESIGN.md) for the design decisions and the rules that go with them.
