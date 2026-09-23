/** One template contract and stylesheet for React, script widgets, and HTML exports. */
export const WALL_TEMPLATES = [
  {
    key: "classic",
    name: "Soft minimal",
    description: "Quiet cards. Let the words shine.",
    color: "#eeeae2",
  },
  {
    key: "portrait",
    name: "Face to face",
    description: "Big portraits, personal stories.",
    color: "#e5e8dd",
  },
  {
    key: "glass",
    name: "Through the glass",
    description: "Immersive photos, frosted details.",
    color: "#d8dfdc",
  },
  {
    key: "bold",
    name: "After hours",
    description: "Dark charcoal. A bold first impression.",
    color: "#32372f",
  },
  {
    key: "bubble",
    name: "Good conversation",
    description: "Playful quotes with a human touch.",
    color: "#eee2d9",
  },
  {
    key: "editorial",
    name: "The anthology",
    description: "Serif stories with room to breathe.",
    color: "#e0e9de",
  },
] as const;
export type CardStyle = (typeof WALL_TEMPLATES)[number]["key"];
export function cardStyle(value: unknown): CardStyle {
  return WALL_TEMPLATES.some((t) => t.key === value)
    ? (value as CardStyle)
    : "classic";
}

export const WALL_TEMPLATE_CSS = `
.vouch-design{container-type:inline-size;--wall-accent:var(--v-accent,var(--accent,var(--vouch-accent,#b84925)))}
.vouch-design .vouch-by{display:flex;align-items:center}
.vouch-design .vouch-card{position:relative;isolation:isolate;overflow-wrap:anywhere}
.vouch-design .vouch-portrait,.vouch-design .vouch-decoration{display:none}
.vouch-design .vouch-portrait img{display:block;width:100%;height:100%;object-fit:cover}
.vouch-design .vouch-portrait>span{display:grid;place-items:center;width:100%;height:100%;font:italic 64px Georgia,serif;background:linear-gradient(145deg,color-mix(in srgb,var(--wall-accent) 30%,#eee8d9),#d4dfc9);color:#35402d}
.vouch-design .vouch-masonry{column-count:3;column-gap:16px}
.vouch-design .vouch-masonry>.vouch-card{margin-bottom:16px}
@container (max-width:650px){.vouch-design .vouch-masonry{column-count:2}}
@container (max-width:440px){.vouch-design .vouch-masonry{column-count:1}}
.vouch-design[data-card-style="portrait"] .vouch-card{padding:10px 10px 22px;border-radius:26px;background-image:none}
.vouch-design[data-card-style="portrait"] .vouch-portrait{display:block;height:220px;border-radius:19px;overflow:hidden;margin-bottom:21px}
.vouch-design[data-card-style="portrait"] .vouch-card>.vouch-stars,.vouch-design[data-card-style="portrait"] .vouch-quote,.vouch-design[data-card-style="portrait"] .vouch-by{margin-left:13px;margin-right:13px}
.vouch-design[data-card-style="portrait"] .vouch-quote{font-size:17px;line-height:1.5;letter-spacing:-.025em}
.vouch-design[data-card-style="portrait"] .vouch-by{border:0;padding-top:0;margin-top:20px}
.vouch-design[data-card-style="portrait"] .vouch-by .vouch-avatar{display:none}
.vouch-design[data-card-style="glass"] .vouch-card{padding:170px 24px 25px;min-height:370px;overflow:hidden;border:4px solid #ffffff70;border-radius:28px;background:#3c4944;box-shadow:0 8px 25px -10px #19271c45;color:white}
.vouch-design[data-card-style="glass"] .vouch-portrait{display:block;position:absolute;inset:0;z-index:-2;margin:0}
.vouch-design[data-card-style="glass"] .vouch-portrait>span{align-items:start;padding-top:45px;color:#ffffffc9;background:linear-gradient(135deg,#697760,color-mix(in srgb,var(--wall-accent) 40%,#34453e))}
.vouch-design[data-card-style="glass"] .vouch-card:before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(transparent 0%,#17221c35 25%,#17221ce8 100%)}
.vouch-design[data-card-style="glass"] .vouch-quote{color:white;font-size:18px;line-height:1.5;letter-spacing:-.03em;text-shadow:0 1px 10px #0005}
.vouch-design[data-card-style="glass"] .vouch-card>.vouch-stars{color:#e4ecce}
.vouch-design[data-card-style="glass"] .vouch-by{border:1px solid #ffffff30;background:#ffffff17;backdrop-filter:blur(16px);padding:12px;border-radius:15px;margin-top:22px}
.vouch-design[data-card-style="glass"] .vouch-name{color:white}
.vouch-design[data-card-style="glass"] .vouch-meta{color:#e1e7dd}
.vouch-design[data-card-style="glass"] .vouch-avatar{color:white;background:#ffffff30}
.vouch-design[data-card-style="bold"] .vouch-card{background:#292e27;border-color:#3c4435;color:#f4f5eb;border-radius:25px;padding:30px;box-shadow:0 9px 22px -13px #1c241a55}
.vouch-design[data-card-style="bold"] .vouch-decoration{display:block;font:86px/.7 Georgia,serif;color:#dceba3;margin:6px 0 23px}
.vouch-design[data-card-style="bold"] .vouch-quote{color:#f4f5eb;font-size:21px;line-height:1.45;letter-spacing:-.04em}
.vouch-design[data-card-style="bold"] .vouch-stars{color:#dceba3}
.vouch-design[data-card-style="bold"] .vouch-by{border-color:#ffffff25;padding-top:22px;margin-top:25px}
.vouch-design[data-card-style="bold"] .vouch-name{color:#f4f5eb}
.vouch-design[data-card-style="bold"] .vouch-meta{color:#bfc8b2}
.vouch-design[data-card-style="bold"] .vouch-avatar{background:#dceba3;color:#303926}
.vouch-design[data-card-style="bubble"] .vouch-card{border-radius:26px 26px 26px 7px;padding:28px;background:linear-gradient(140deg,color-mix(in srgb,var(--wall-accent) 10%,var(--v-surface,var(--bg,#fff))),var(--v-surface,var(--bg,#fff)));border:1px solid color-mix(in srgb,var(--wall-accent) 22%,transparent);box-shadow:0 7px 18px -13px #342b2550}
.vouch-design[data-card-style="bubble"] .vouch-decoration{display:block;position:absolute;right:22px;top:24px;font:75px/.8 Georgia,serif;color:var(--wall-accent);opacity:.2;pointer-events:none}
.vouch-design[data-card-style="bubble"] .vouch-quote{font-size:18px;line-height:1.6;letter-spacing:-.025em;position:relative}
.vouch-design[data-card-style="bubble"] .vouch-by{border:0;border-radius:999px;background:color-mix(in srgb,var(--wall-accent) 10%,transparent);padding:10px 14px 10px 9px;margin-top:24px}
.vouch-design[data-card-style="bubble"] .vouch-avatar{box-shadow:0 0 0 3px var(--v-surface,var(--bg,#fff))}
.vouch-design[data-card-style="editorial"] .vouch-card{text-align:center;padding:32px 26px;border:0;border-radius:18px;box-shadow:0 8px 25px -15px #233d2330;background:linear-gradient(160deg,color-mix(in srgb,var(--wall-accent) 6%,var(--v-surface,var(--bg,#fff))),var(--v-surface,var(--bg,#fff)))}
.vouch-design[data-card-style="editorial"] .vouch-portrait{display:block;width:66px;height:66px;border-radius:50%;overflow:hidden;margin:0 auto 20px;box-shadow:0 0 0 5px color-mix(in srgb,var(--wall-accent) 9%,transparent)}
.vouch-design[data-card-style="editorial"] .vouch-portrait>span{font-size:25px}
.vouch-design[data-card-style="editorial"] .vouch-card>.vouch-stars{justify-content:center;text-align:center}
.vouch-design[data-card-style="editorial"] .vouch-quote{font:italic 23px/1.5 Georgia,'Times New Roman',serif;letter-spacing:-.035em}
.vouch-design[data-card-style="editorial"] .vouch-by{justify-content:center;border:0;padding-top:19px;margin-top:22px;position:relative}
.vouch-design[data-card-style="editorial"] .vouch-by:before{content:"";position:absolute;width:28px;height:1px;top:0;left:calc(50% - 14px);background:var(--wall-accent)}
.vouch-design[data-card-style="editorial"] .vouch-by .vouch-avatar{display:none}
.vouch-design .vouch-card .vouch-name,.vouch-design .vouch-card .vouch-meta{white-space:normal;overflow:visible;text-overflow:clip}
.vouch-design .vouch-card .vouch-by>div,.vouch-design .vouch-card .vouch-by>span{min-width:0}
.vouch-design .vouch-card .vouch-video{position:relative;z-index:1;width:100%}
`;
