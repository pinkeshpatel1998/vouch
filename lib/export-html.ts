import { cardStyle, WALL_TEMPLATE_CSS } from "./wall-templates";
import type { WallPayload } from "@/lib/database.types";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}

function stars(n: number) {
  return `<div class="vouch-stars" role="img" aria-label="${n} out of 5 stars">${
    "★".repeat(n) + `<span class="vouch-star-off">${"★".repeat(5 - n)}</span>`
  }</div>`;
}

/**
 * Self-contained HTML with inline CSS, for Carrd, Notion exports and anywhere
 * scripts are blocked. Section 7 lists this as the fallback that has to exist.
 *
 * No script tag, so it is a snapshot: it will not pick up newly approved
 * testimonials until the owner copies it again. The UI says so.
 */
export function staticHtmlExport(payload: WallPayload): string {
  const { wall, testimonials } = payload;
  const dark = wall.theme === "dark";

  const bg = dark ? "#232532" : "#ffffff";
  const line = dark ? "rgba(233,233,237,.16)" : "rgba(41,43,49,.14)";
  const ink = dark ? "#e9e9ed" : "#16171d";
  const muted = dark ? "rgba(233,233,237,.7)" : "#595d6c";
  const accent = wall.accent_color;
  const appearance = cardStyle(wall.card_style);

  // Carousel needs JS to be worth anything, so a static export renders it as a
  // grid rather than shipping something that cannot scroll.
  const columns = wall.layout === "single" ? 1 : 3;

  const cards = testimonials
    .map((t) => {
      const meta = [t.author_role, t.author_company].filter(Boolean).join(", ");
      const avatar = t.author_avatar_url
        ? `<img class="vouch-avatar" src="${esc(t.author_avatar_url)}" alt="" width="36" height="36">`
        : `<span class="vouch-avatar vouch-avatar-fallback">${esc(initials(t.author_name))}</span>`;

      const video =
        t.type === "video" && t.video_url
          ? `<video class="vouch-video" src="${esc(t.video_url)}"${
              t.poster_url ? ` poster="${esc(t.poster_url)}"` : ""
            } controls preload="none" playsinline></video>`
          : "";

      const portrait = ["portrait", "glass", "editorial"].includes(appearance)
        ? `<div class="vouch-portrait" aria-hidden="true">${t.author_avatar_url ? `<img src="${esc(t.author_avatar_url)}" alt="" loading="lazy">` : `<span>${esc(initials(t.author_name))}</span>`}</div>`
        : "";
      const decoration =
        appearance === "bold" || appearance === "bubble"
          ? '<span class="vouch-decoration" aria-hidden="true">“</span>'
          : "";
      return `      <figure class="vouch-card">${portrait}${decoration}
${video ? `        ${video}\n` : ""}${
        wall.show_ratings && t.rating ? `        ${stars(t.rating)}\n` : ""
      }${t.body ? `        <blockquote class="vouch-quote">${esc(t.body)}</blockquote>\n` : ""}        <figcaption class="vouch-by">
          ${avatar}
          <span>
            <span class="vouch-name">${esc(t.author_name)}</span>
            ${meta ? `<span class="vouch-meta">${esc(meta)}</span>` : ""}
          </span>
        </figcaption>
      </figure>`;
    })
    .join("\n");

  return `<!-- Vouch wall — static export. Paste anywhere HTML is allowed. -->
<div class="vouch-wall vouch-design" data-card-style="${appearance}">
  <style>
    .vouch-wall{--bg:${bg};--vouch-accent:${accent};font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:${ink};}
    .vouch-wall *{box-sizing:border-box;}
    .vouch-grid{column-count:${columns};column-gap:16px;}
    @media (max-width:900px){.vouch-grid{column-count:${Math.min(2, columns)};}}
    @media (max-width:600px){.vouch-grid{column-count:1;}}
    .vouch-card{break-inside:avoid;margin:0 0 16px;padding:20px;background:${bg};border:1px solid ${line};border-radius:18px;}
    .vouch-video{width:100%;border-radius:10px;margin-bottom:14px;background:#000;display:block;}
    .vouch-stars{color:var(--vouch-accent);letter-spacing:2px;font-size:14px;margin-bottom:10px;}
    .vouch-star-off{opacity:.28;}
    .vouch-quote{margin:0;font-size:14.5px;line-height:1.62;color:${ink};}
    .vouch-by{display:flex;align-items:center;gap:10px;margin-top:16px;padding-top:16px;border-top:1px solid ${line};}
    .vouch-avatar{width:36px;height:36px;border-radius:999px;object-fit:cover;flex:0 0 auto;}
    .vouch-avatar-fallback{display:flex;align-items:center;justify-content:center;background:color-mix(in oklab,var(--vouch-accent) 16%,transparent);color:var(--vouch-accent);font-size:13px;font-weight:600;}
    .vouch-name{display:block;font-size:13.5px;font-weight:600;line-height:1.2;color:${ink};}
    .vouch-meta{display:block;font-size:12.5px;line-height:1.3;color:${muted};}
    ${WALL_TEMPLATE_CSS}
  </style>
  <div class="vouch-grid ${wall.layout === "single" ? "" : "vouch-masonry"}">
${cards}
  </div>
</div>`;
}

export function scriptEmbed(origin: string, wallId: string) {
  return `<script src="${origin}/embed.js" data-wall="${wallId}" async></script>`;
}

export function iframeEmbed(origin: string, wallId: string) {
  return `<iframe src="${origin}/embed/${wallId}" title="Testimonials" loading="lazy" style="width:100%;border:0;min-height:600px"></iframe>`;
}
