import { cardStyle, WALL_TEMPLATE_CSS } from "../lib/wall-templates";
/**
 * Vouch embed widget.
 *
 * Ships as public/embed.js. No framework, no dependencies, plain DOM inside a
 * shadow root so the host page's CSS cannot reach in and ours cannot leak out.
 *
 *   <script src="https://vouch.app/embed.js" data-wall="wal_abc123" async></script>
 *
 * This is a port of components/wall/wall-render.tsx. Keep the two in step: the
 * builder's live preview is that file, and a preview that lies is worse than no
 * preview at all.
 */

type Item = {
  id: string;
  type: "text" | "video";
  body: string | null;
  rating: number | null;
  video_url: string | null;
  video_duration_seconds: number | null;
  poster_url: string | null;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  author_avatar_url: string | null;
};

type Payload = {
  wall: {
    id: string;
    layout: "masonry" | "carousel" | "single";
    card_style?: string;
    carousel_style?: "rail" | "marquee" | "spotlight";
    theme: "light" | "dark" | "auto";
    accent_color: string;
    show_ratings: boolean;
    include_video: boolean;
  };
  space: { name: string; logo_url: string | null };
  testimonials: Item[];
};

/* ------------------------------------------------------------------ */
/* styles                                                              */
/* ------------------------------------------------------------------ */

const STYLE = `
:host{all:initial;display:block;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.v{
  --bg:#ffffff;--sunk:#f5f4ef;--line:rgba(41,43,49,.14);--line-2:#d6d5cb;
  --ink:#16171d;--muted:#595f51;--subtle:#767b6d;
  --shadow:0 1px 2px rgba(22,24,38,.07);
  --shadow-2:0 1px 2px rgba(22,24,38,.05),0 6px 16px -4px rgba(22,24,38,.12);
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  color:var(--ink);-webkit-font-smoothing:antialiased;line-height:1.5;
}
.v[data-theme="dark"]{
  --bg:#232532;--sunk:#1c1e2a;--line:rgba(233,233,237,.16);--line-2:#595d6c;
  --ink:#e9e9ed;--muted:rgba(233,233,237,.7);--subtle:rgba(233,233,237,.52);
  --shadow:0 0 0 1px #3f424d;
  --shadow-2:0 0 0 1px #595d6c,0 6px 18px rgba(0,0,0,.55);
}
@media (prefers-color-scheme:dark){
  .v[data-theme="auto"]{
    --bg:#232532;--sunk:#1c1e2a;--line:rgba(233,233,237,.16);--line-2:#595d6c;
  --ink:#e9e9ed;--muted:rgba(233,233,237,.7);--subtle:rgba(233,233,237,.52);
  --shadow:0 0 0 1px #3f424d;
  --shadow-2:0 0 0 1px #595d6c,0 6px 18px rgba(0,0,0,.55);
  }
}

.grid{column-count:3;column-gap:16px;}
@media (max-width:900px){.grid{column-count:2;}}
@media (max-width:600px){.grid{column-count:1;}}
.grid > .card{margin:0 0 16px;}

.rail{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px;scrollbar-width:none;}
.rail::-webkit-scrollbar{display:none;}
.rail > .card{flex:0 0 auto;width:min(20rem,80vw);scroll-snap-align:start;}
.nav{display:flex;justify-content:flex-end;gap:8px;margin-top:12px;}
.nav button{width:36px;height:36px;display:grid;place-items:center;border-radius:999px;
  border:1px solid var(--line);background:var(--bg);color:var(--muted);
  box-shadow:var(--shadow);cursor:pointer;transition:color .12s,background .12s,opacity .12s;}
.nav button:hover:not(:disabled){background:var(--sunk);color:var(--ink);}
.nav button:disabled{opacity:.35;cursor:default;}
.nav svg{width:16px;height:16px;fill:currentColor;}

/* marquee */
.mq{overflow:hidden;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);}
.mq-track{display:flex;width:max-content;gap:16px;animation:marquee var(--dur,60s) linear infinite;will-change:transform;}
.mq:hover .mq-track,.mq:focus-within .mq-track{animation-play-state:paused;}
.mq-set{display:flex;flex:0 0 auto;gap:16px;}
.mq-set > .card{flex:0 0 auto;width:min(20rem,80vw);}
@keyframes marquee{to{transform:translateX(-50%);}}
@media (prefers-reduced-motion:reduce){
  .mq-track{animation:none;}
  .mq{overflow-x:auto;}
}

/* spotlight */
.sp{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;
  padding:0 max(0px,calc(50% - 10rem)) 12px;scrollbar-width:none;}
.sp::-webkit-scrollbar{display:none;}
.sp > .card{flex:0 0 auto;width:min(20rem,78vw);scroll-snap-align:center;
  transition:transform .22s cubic-bezier(.22,1,.36,1),opacity .22s;}

.card{
  break-inside:avoid;background:linear-gradient(145deg,color-mix(in srgb,var(--accent) 3%,transparent),transparent 60%),var(--bg);border:1px solid var(--line);
  border-radius:18px;padding:20px;box-shadow:var(--shadow);
  transition:box-shadow .22s cubic-bezier(.22,1,.36,1),transform .22s cubic-bezier(.22,1,.36,1),border-color .22s;
}
.card:hover{transform:translateY(-2px);border-color:var(--line-2);box-shadow:var(--shadow-2);}

@keyframes settle{from{opacity:0;transform:translateY(14px) scale(.985);}to{opacity:1;transform:none;}}
.settle{animation:settle .42s cubic-bezier(.22,1,.36,1) both;}
@media (prefers-reduced-motion:reduce){
  .settle{animation:none;}
  .card{transition:none;}
  .card:hover{transform:none;}
}

.stars{color:var(--accent);letter-spacing:2px;font-size:14px;margin-bottom:10px;line-height:1;}
.stars .off{opacity:.28;}

.quote{font-size:14.5px;line-height:1.62;color:var(--ink);}
.single .quote{font-size:clamp(20px,3.4vw,28px);line-height:1.22;letter-spacing:-.015em;font-weight:500;}
.single .card{padding:40px 32px;}
.mark{width:26px;height:20px;fill:var(--accent);opacity:.35;margin-bottom:16px;display:block;}

.by{display:flex;align-items:center;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--line);}
.av{width:36px;height:36px;border-radius:999px;object-fit:cover;flex:0 0 auto;display:grid;
  place-items:center;font-size:13px;font-weight:600;
  background:color-mix(in srgb,var(--accent) 22%,var(--bg));color:color-mix(in srgb,var(--accent) 70%,var(--ink));}
.name{display:block;font-size:13.5px;font-weight:600;line-height:1.2;}
.meta{display:block;font-size:12.5px;line-height:1.3;color:var(--muted);}

.media{position:relative;width:100%;aspect-ratio:4/5;border-radius:10px;overflow:hidden;
  background:var(--sunk);margin-bottom:14px;border:0;padding:0;cursor:pointer;display:block;}
.media img{width:100%;height:100%;object-fit:cover;display:block;}
.media .fill{width:100%;height:100%;display:block;
  background:linear-gradient(150deg,color-mix(in oklab,var(--accent) 22%,var(--sunk)),var(--sunk));}
.play{position:absolute;inset:0;display:grid;place-items:center;}
.play span{width:48px;height:48px;border-radius:999px;display:grid;place-items:center;
  background:var(--accent);box-shadow:var(--shadow-2);transition:transform .22s cubic-bezier(.22,1,.36,1);}
.media:hover .play span{transform:scale(1.1);}
.play svg{width:16px;height:16px;fill:#fff;transform:translateX(1px);}
.dur{position:absolute;right:8px;bottom:8px;background:rgba(0,0,0,.65);color:#fff;
  font-size:11px;font-weight:500;padding:2px 6px;border-radius:4px;font-variant-numeric:tabular-nums;}
video{width:100%;aspect-ratio:4/5;border-radius:10px;margin-bottom:14px;background:#000;display:block;object-fit:contain;}

.dots{display:flex;justify-content:center;gap:6px;margin-top:16px;flex-wrap:wrap;}
.dots button{height:6px;width:6px;border:0;border-radius:999px;background:var(--line-2);
  cursor:pointer;transition:width .22s cubic-bezier(.22,1,.36,1),background .22s;}
.dots button[aria-selected="true"]{width:24px;background:var(--accent);}

.msg{border:1px dashed var(--line);border-radius:8px;background:var(--sunk);
  padding:40px 24px;text-align:center;color:var(--muted);font-size:13px;}

:where(button,a):focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
`;

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  ...kids: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
  for (const kid of kids) n.append(kid);
  return n;
}

function svg(path: string, cls: string, viewBox = "0 0 16 16") {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", viewBox);
  s.setAttribute("class", cls);
  s.setAttribute("aria-hidden", "true");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  s.append(p);
  return s;
}

const ARROW_L =
  "M10.28 3.22a.75.75 0 0 1 0 1.06L6.56 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L4.97 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z";
const ARROW_R =
  "M5.72 3.22a.75.75 0 0 0 0 1.06L9.44 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06L6.78 3.22a.75.75 0 0 0-1.06 0Z";
const PLAY =
  "M4.5 2.6v10.8a.6.6 0 0 0 .92.5l8.4-5.4a.6.6 0 0 0 0-1L5.42 2.1a.6.6 0 0 0-.92.5Z";
const MARK =
  "M0 24V13.2C0 5.9 4.2 1.1 11.6 0l1.2 3.9C8.4 5.2 6.2 7.6 6.2 11h5.2v13H0Zm18.6 0V13.2C18.6 5.9 22.8 1.1 30.2 0l1.2 3.9c-4.4 1.3-6.6 3.7-6.6 7.1h5.2v13h-11.4Z";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || "")
    .join("")
    .toUpperCase();
}

function duration(s: number | null) {
  if (!s) return null;
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

function stars(n: number) {
  const d = el("div", {
    class: "stars vouch-stars",
    role: "img",
    "aria-label": n + " out of 5 stars",
  });
  d.append("★".repeat(n));
  if (n < 5) d.append(el("span", { class: "off" }, "★".repeat(5 - n)));
  return d;
}

function attribution(t: Item) {
  const meta = [t.author_role, t.author_company].filter(Boolean).join(", ");
  const av = t.author_avatar_url
    ? el("img", {
        class: "av vouch-avatar",
        src: t.author_avatar_url,
        alt: "",
        loading: "lazy",
        width: "36",
        height: "36",
      })
    : el("span", { class: "av vouch-avatar" }, initials(t.author_name));

  const who = el(
    "span",
    {},
    el("span", { class: "name vouch-name" }, t.author_name),
  );
  if (meta) who.append(el("span", { class: "meta vouch-meta" }, meta));

  return el("figcaption", { class: "by vouch-by" }, av, who);
}

/* Video is click-to-play: never autoplay on someone else's page, and never
   navigate away from it. preload="none" keeps a wall of videos cheap. */
function media(t: Item) {
  const btn = el("button", {
    class: "media vouch-video",
    type: "button",
    "aria-label": "Play video testimonial from " + t.author_name,
  });

  btn.append(
    t.poster_url
      ? el("img", { src: t.poster_url, alt: "", loading: "lazy" })
      : el("span", { class: "fill" }),
  );
  btn.append(el("div", { class: "play" }, el("span", {}, svg(PLAY, ""))));

  const d = duration(t.video_duration_seconds);
  if (d) btn.append(el("span", { class: "dur" }, d));

  btn.addEventListener("click", () => {
    if (!t.video_url) return;
    const v = el("video", {
      class: "vouch-video",
      src: t.video_url,
      controls: "",
      playsinline: "",
      preload: "metadata",
    });
    if (t.poster_url) v.setAttribute("poster", t.poster_url);
    btn.replaceWith(v);
    void v.play().catch(() => {});
  });

  return btn;
}

function card(
  t: Item,
  showRatings: boolean,
  i: number,
  settle: boolean,
  appearance = "classic",
) {
  const f = el("figure", {
    class: "card vouch-card" + (settle ? " settle" : ""),
  });
  if (settle) f.style.animationDelay = Math.min(i, 12) * 55 + "ms";

  if (["portrait", "glass", "editorial"].includes(appearance)) {
    f.append(
      el(
        "div",
        { class: "vouch-portrait", "aria-hidden": "true" },
        t.author_avatar_url
          ? el("img", { src: t.author_avatar_url, alt: "", loading: "lazy" })
          : el("span", {}, initials(t.author_name)),
      ),
    );
  }
  if (appearance === "bold" || appearance === "bubble")
    f.append(
      el("span", { class: "vouch-decoration", "aria-hidden": "true" }, "“"),
    );
  if (t.type === "video" && t.video_url) f.append(media(t));
  if (showRatings && t.rating) f.append(stars(t.rating));
  if (t.body)
    f.append(el("blockquote", { class: "quote vouch-quote" }, t.body));
  f.append(attribution(t));
  return f;
}

/* ------------------------------------------------------------------ */
/* layouts                                                             */
/* ------------------------------------------------------------------ */

function masonry(p: Payload) {
  const g = el("div", { class: "grid vouch-masonry" });
  p.testimonials.forEach((t, i) =>
    g.append(
      card(t, p.wall.show_ratings, i, true, cardStyle(p.wall.card_style)),
    ),
  );
  return g;
}

function carousel(p: Payload) {
  const wrap = el("div", {});
  const rail = el("div", {
    class: "rail",
    role: "region",
    "aria-label": "Testimonials",
    tabindex: "0",
  });
  p.testimonials.forEach((t, i) =>
    rail.append(
      card(t, p.wall.show_ratings, i, false, cardStyle(p.wall.card_style)),
    ),
  );

  const prev = el(
    "button",
    { type: "button", "aria-label": "Previous testimonials" },
    svg(ARROW_L, ""),
  );
  const next = el(
    "button",
    { type: "button", "aria-label": "Next testimonials" },
    svg(ARROW_R, ""),
  );

  const sync = () => {
    prev.disabled = rail.scrollLeft < 8;
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8;
  };
  const page = (dir: number) =>
    rail.scrollBy({
      left: dir * Math.max(280, rail.clientWidth * 0.8),
      behavior: "smooth",
    });

  prev.addEventListener("click", () => page(-1));
  next.addEventListener("click", () => page(1));
  rail.addEventListener("scroll", sync);
  if (typeof ResizeObserver !== "undefined")
    new ResizeObserver(sync).observe(rail);

  wrap.append(rail, el("div", { class: "nav" }, prev, next));
  setTimeout(sync, 0);
  return wrap;
}

function marquee(p: Payload) {
  const wrap = el("div", { class: "mq" });
  const track = el("div", { class: "mq-track" });
  track.style.setProperty(
    "--dur",
    Math.max(24, p.testimonials.length * 6) + "s",
  );

  // Two identical sets; translating the track -50% lands set two exactly where
  // set one began, so the loop has no seam. The clone is hidden from a11y.
  for (let k = 0; k < 2; k++) {
    const set = el("div", { class: "mq-set" });
    if (k === 1) set.setAttribute("aria-hidden", "true");
    p.testimonials.forEach((t, i) =>
      set.append(
        card(t, p.wall.show_ratings, i, false, cardStyle(p.wall.card_style)),
      ),
    );
    track.append(set);
  }

  wrap.append(track);
  return wrap;
}

function spotlight(p: Payload) {
  const rail = el("div", {
    class: "sp",
    role: "region",
    "aria-label": "Testimonials",
    tabindex: "0",
  });
  p.testimonials.forEach((t, i) =>
    rail.append(
      card(t, p.wall.show_ratings, i, false, cardStyle(p.wall.card_style)),
    ),
  );

  let frame = 0;
  const paint = () => {
    const mid = rail.scrollLeft + rail.clientWidth / 2;
    for (let i = 0; i < rail.children.length; i++) {
      const c = rail.children[i] as HTMLElement;
      const cm = c.offsetLeft + c.offsetWidth / 2;
      // 0 at dead centre, 1 once a full card-width away.
      const d = Math.min(1, Math.abs(cm - mid) / (c.offsetWidth || 1));
      c.style.transform = "scale(" + (1 - d * 0.12).toFixed(3) + ")";
      c.style.opacity = (1 - d * 0.55).toFixed(3);
    }
  };

  rail.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    },
    { passive: true },
  );
  if (typeof ResizeObserver !== "undefined")
    new ResizeObserver(paint).observe(rail);
  setTimeout(paint, 0);
  return rail;
}

function single(p: Payload) {
  const wrap = el("div", { class: "single" });
  const slot = el("div", {});
  wrap.append(slot);

  let index = 0;
  const draw = () => {
    const t = p.testimonials[index];
    const f = card(
      t,
      p.wall.show_ratings,
      0,
      true,
      cardStyle(p.wall.card_style),
    );
    if (cardStyle(p.wall.card_style) === "classic")
      f.prepend(svg(MARK, "mark", "0 0 32 24"));
    slot.replaceChildren(f);
    dots
      .querySelectorAll("button")
      .forEach((b, i) => b.setAttribute("aria-selected", String(i === index)));
  };

  const dots = el("div", {
    class: "dots",
    role: "tablist",
    "aria-label": "Choose a testimonial",
  });
  if (p.testimonials.length > 1) {
    p.testimonials.forEach((t, i) => {
      const b = el("button", {
        type: "button",
        role: "tab",
        "aria-label": "Testimonial from " + t.author_name,
        "aria-selected": String(i === 0),
      });
      b.addEventListener("click", () => {
        index = i;
        draw();
      });
      dots.append(b);
    });
    wrap.append(dots);
  }

  draw();
  return wrap;
}

/* ------------------------------------------------------------------ */
/* boot                                                                */
/* ------------------------------------------------------------------ */

function mount(script: HTMLScriptElement) {
  const wallId = script.getAttribute("data-wall");
  if (!wallId) return;

  const origin =
    script.getAttribute("data-origin") ||
    new URL(script.src, location.href).origin;

  const host = el("div");
  // The shadow root protects its contents, but the host element itself sits in
  // the page's DOM and is fair game for rules like `div{background:red}`.
  // `:host` loses to the outer document, so pin it from the style attribute
  // with !important -- inline important is the only thing that beats an author
  // !important rule.
  host.style.setProperty("all", "initial", "important");
  host.style.setProperty("display", "block", "important");
  script.parentNode?.insertBefore(host, script);
  const root = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = STYLE + WALL_TEMPLATE_CSS;
  const stage = el("div", { class: "v vouch-design" });
  root.append(style, stage);

  const fail = (text: string) =>
    stage.replaceChildren(el("div", { class: "msg" }, text));

  // data-api is an escape hatch for testing and for self-hosted deployments
  // where the JSON lives somewhere other than the script's own origin.
  const api =
    script.getAttribute("data-api") ||
    origin + "/api/walls/" + encodeURIComponent(wallId);

  fetch(api, { headers: { accept: "application/json" } })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<Payload>;
    })
    .then((p) => {
      if (!p || !p.wall) return fail("This wall is no longer available.");

      stage.setAttribute("data-theme", p.wall.theme);
      stage.setAttribute("data-card-style", cardStyle(p.wall.card_style));
      stage.style.setProperty("--accent", p.wall.accent_color);

      if (!p.testimonials.length) return fail("No testimonials yet.");

      const style = p.wall.carousel_style || "rail";
      stage.replaceChildren(
        p.wall.layout === "carousel"
          ? style === "marquee"
            ? marquee(p)
            : style === "spotlight"
              ? spotlight(p)
              : carousel(p)
          : p.wall.layout === "single"
            ? single(p)
            : masonry(p),
      );

      // Fire and forget; a failed count must never break the wall.
      try {
        const body = JSON.stringify({ referrer_domain: location.hostname });
        const url =
          origin + "/api/walls/" + encodeURIComponent(wallId) + "/view";
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            url,
            new Blob([body], { type: "application/json" }),
          );
        } else {
          void fetch(url, { method: "POST", body, keepalive: true });
        }
      } catch {
        /* ignore */
      }
    })
    .catch(() => fail("Testimonials could not be loaded."));
}

// `async` scripts still populate document.currentScript while executing; the
// querySelector is for the case where this file is bundled or re-executed.
const self_ =
  (document.currentScript as HTMLScriptElement | null) ??
  document.querySelector<HTMLScriptElement>(
    "script[data-wall]:not([data-vouch-done])",
  );

if (self_) {
  self_.setAttribute("data-vouch-done", "");
  mount(self_);
}
