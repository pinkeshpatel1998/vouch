# Vouch — design system decisions

Written day 3. The point of this file is that weeks 3 and 4 do not re-litigate
week 1. If a decision below feels wrong later, change it here first, then in code.

## Typefaces

| Role | Face | Why |
|---|---|---|
| Display | **Fraunces** | Variable, with the `WONK` and `SOFT` axes exposed. The wonky leg is what stops it reading as a stock serif, and a serif is the right register for a product whose entire content is quotations. |
| UI | **Instrument Sans** | Neutral, slightly narrow, good at 13px. Explicitly not Inter, per the brief. |
| Mono | **JetBrains Mono** | Embed snippets only. Never used for UI copy. |

Fraunces is set with `font-variation-settings: "SOFT" 0, "WONK" 1, "opsz" 40` via
the `.font-display` class. Use it for page titles, the single-quote layout, and
empty-state headings. Do **not** use it for body copy or anything under ~18px.

## Token architecture

Two layers, both in `app/globals.css`:

1. **Raw primitives** — `--v-*` on `:root`, redefined for dark. The warm neutral
   ramp is oklch at hue 65–90, so surfaces read as paper rather than as default
   grey. Shadows are tinted with the same hue.
2. **Semantic aliases** — `@theme inline` maps them onto Tailwind utilities
   (`bg-surface`, `text-muted`, `border-line`, `shadow-mid`). `inline` matters:
   it keeps `var()` at the use site so dark mode and per-space accent overrides
   cascade normally instead of being frozen at build time.

Never write a raw colour in a component. If you need one, it is missing from the
semantic layer — add it there.

## The accent is one variable

`--v-accent` is the only brand colour. Five tints derive from it with
`color-mix`: `-hover`, `-press`, `-soft`, `-line`, `-text`, plus `--v-ring`.

This is deliberate and load-bearing. A space owner picks one colour in settings;
setting `--v-accent` on that subtree rebrands the collection page and the
embedded wall without any other change, and cannot produce an unreadable pairing.
The same mechanism is what the widget will use inside its shadow root.

Avatar initial tints use relative colour syntax
(`oklch(from var(--v-accent) …)`) with a deterministic hue spread of ±44°, so a
wall of avatars stays harmonious with whatever accent is set.

## Scales

- **Spacing** — Tailwind's 4px base. No custom scale.
- **Radius** — xs 4 / sm 6 / md 10 / lg 14 / xl 20 / 2xl 28. Controls use sm–md,
  cards lg, the quote card and modals xl.
- **Shadow** — exactly three: `low`, `mid`, `high`. Anything that wants a fourth
  gets a border instead.

## Theme

Three states, matching how the embed will behave: explicit `light`, explicit
`dark`, and system default (no `data-theme` attribute). A blocking inline script
in `app/layout.tsx` sets the attribute before first paint so there is no flash.

## Motion

One vocabulary: `--v-ease-out` for entrances and hovers, `--v-dur-fast|base|slow`.

**One motion moment in the whole product**: cards settling into the masonry wall
on load (`.animate-settle`, staggered 55ms). Everything else is a 120–220ms
colour or shadow transition. Resist adding a second.

`prefers-reduced-motion` kills all of it globally.

## Accessibility rules that are not negotiable

- `:focus-visible` draws a 2px accent outline at 2px offset, globally. Never
  removed, only restyled.
- Star rating and theme toggle are single tab stops with arrow-key navigation
  (`role="radiogroup"`).
- Every form control pairs with a `<label>`; errors are text, never colour alone.
- The character guide is a nudge, not a limit — it never blocks a submit.

## Security model (data layer)

Worth stating plainly because it shapes every feature after this.

Authenticated owners talk to tables directly; RLS restricts every row to
`user_id = auth.uid()`, with testimonials and walls reaching ownership through
`public.owns_space()`.

Anonymous visitors have **no table access at all**. The entire public surface is
four `security definer` functions:

| Function | Used by |
|---|---|
| `collection_space(slug)` | `/c/[slug]` — public space fields only, never `user_id` |
| `submit_testimonial(...)` | the submission form — forces `status = 'pending'`, requires consent, refuses a disabled path |
| `wall_payload(wall_id)` | the embed endpoint — config plus approved rows in one round trip |
| `record_wall_view(...)` | the widget — one raw count, nothing else |

Two consequences worth remembering: there is deliberately **no INSERT policy on
`testimonials`**, so a submission cannot be forged with `status = 'approved'`;
and consent is a `NOT NULL` check constraint, not just a required checkbox.

Storage is three public-read buckets with writes gated on the path's first
segment being a real space id. Anonymous callers may add files, never modify
them. The known gap — an anonymous caller can upload without ever submitting a
testimonial — is documented at the bottom of `0003_storage.sql`.

## Carousel templates

The carousel layout has three templates. `layout` stays a three-value column so
section 3's scope holds -- these only vary how the carousel behaves.

| Style | Mechanism | Notes |
|---|---|---|
| `rail` | Snap scroll, arrows, disabled at the ends | The default. Nothing clever. |
| `marquee` | One track duplicated, translated `-50%` on a linear loop | Pure CSS, so it costs the widget no JS. The clone is `aria-hidden` so a quote is announced and copied once. Pauses on hover and focus-within; stops entirely under reduced motion, where the track becomes a plain scroller. |
| `spotlight` | Centre-snap scroll; each card scales and fades by its distance from the container's centre | The only one needing JS: a rAF-throttled scroll handler writing inline transforms. Inline styles beat the stylesheet, so the card hover-lift does not fight it -- do not add an `!important` hover rule here. |

Patterns surveyed on 21st.dev (card fan, stacked, squeeze, coverflow) were not
used. They are image-first: a 3D transform on a card of body text costs
legibility, and legibility is the entire point of a testimonial.

## The widget

`widget/embed.ts` is a hand port of `components/wall/wall-render.tsx`. Keep them
in step — the builder's live preview is the React one, and a preview that lies
is worse than no preview.

Two isolation facts worth remembering, because the first one is not obvious:

1. A shadow root protects its **contents**, but the host element still sits in
   the page's DOM and is styled by it. `:host` loses to the outer document. The
   host div is therefore pinned from the style attribute with
   `all: initial !important` — inline `!important` is the only thing that beats
   an author `!important` rule. Without it, `div { background: yellow }` on the
   host page paints straight through. `public/embed-test.html` exists to catch
   exactly this.
2. No web fonts. The widget uses a system stack, so it costs no extra request
   and cannot be blocked by a host CSP.

## Open questions

- Per-space accent set inline overrides the dark-mode accent lift. Acceptable
  now; if dark walls look muddy with dark accents, split into `--v-accent-base`
  plus a derived `--v-accent`.
- Marquee is a second continuous motion in a product whose design brief asked
  for exactly one. It is opt-in per wall rather than a default, which is the
  compromise; if it starts feeling like decoration, cut it.
- Theme `auto` follows the visitor's `prefers-color-scheme`, not the host
  page's background. A light site visited by a dark-mode user therefore gets
  dark cards. That matches how most embeds behave, but it can clash; if it
  looks wrong in practice, the alternative is sampling the host's computed
  background, which is fragile.
- Masonry currently uses CSS columns, which orders cards down-then-across. Fine
  for a wall; revisit only if ordering becomes meaningful.
