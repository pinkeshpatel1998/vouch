"use strict";(()=>{var k=[{key:"classic",name:"Soft minimal",description:"Quiet cards. Let the words shine.",color:"#eeeae2"},{key:"portrait",name:"Face to face",description:"Big portraits, personal stories.",color:"#e5e8dd"},{key:"glass",name:"Through the glass",description:"Immersive photos, frosted details.",color:"#d8dfdc"},{key:"bold",name:"After hours",description:"Dark charcoal. A bold first impression.",color:"#32372f"},{key:"bubble",name:"Good conversation",description:"Playful quotes with a human touch.",color:"#eee2d9"},{key:"editorial",name:"The anthology",description:"Serif stories with room to breathe.",color:"#e0e9de"}];function p(a){return k.some(e=>e.key===a)?a:"classic"}var x=`
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
`;var _=`
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
`;function o(a,e,...r){let t=document.createElement(a);if(e)for(let i in e)t.setAttribute(i,e[i]);for(let i of r)t.append(i);return t}function g(a,e,r="0 0 16 16"){let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox",r),t.setAttribute("class",e),t.setAttribute("aria-hidden","true");let i=document.createElementNS("http://www.w3.org/2000/svg","path");return i.setAttribute("d",a),t.append(i),t}var L="M10.28 3.22a.75.75 0 0 1 0 1.06L6.56 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L4.97 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z",q="M5.72 3.22a.75.75 0 0 0 0 1.06L9.44 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06L6.78 3.22a.75.75 0 0 0-1.06 0Z",E="M4.5 2.6v10.8a.6.6 0 0 0 .92.5l8.4-5.4a.6.6 0 0 0 0-1L5.42 2.1a.6.6 0 0 0-.92.5Z",z="M0 24V13.2C0 5.9 4.2 1.1 11.6 0l1.2 3.9C8.4 5.2 6.2 7.6 6.2 11h5.2v13H0Zm18.6 0V13.2C18.6 5.9 22.8 1.1 30.2 0l1.2 3.9c-4.4 1.3-6.6 3.7-6.6 7.1h5.2v13h-11.4Z";function w(a){return a.trim().split(/\s+/).slice(0,2).map(e=>e[0]||"").join("").toUpperCase()}function A(a){return a?Math.floor(a/60)+":"+String(a%60).padStart(2,"0"):null}function S(a){let e=o("div",{class:"stars vouch-stars",role:"img","aria-label":a+" out of 5 stars"});return e.append("\u2605".repeat(a)),a<5&&e.append(o("span",{class:"off"},"\u2605".repeat(5-a))),e}function T(a){let e=[a.author_role,a.author_company].filter(Boolean).join(", "),r=a.author_avatar_url?o("img",{class:"av vouch-avatar",src:a.author_avatar_url,alt:"",loading:"lazy",width:"36",height:"36"}):o("span",{class:"av vouch-avatar"},w(a.author_name)),t=o("span",{},o("span",{class:"name vouch-name"},a.author_name));return e&&t.append(o("span",{class:"meta vouch-meta"},e)),o("figcaption",{class:"by vouch-by"},r,t)}function M(a){let e=o("button",{class:"media vouch-video",type:"button","aria-label":"Play video testimonial from "+a.author_name});e.append(a.poster_url?o("img",{src:a.poster_url,alt:"",loading:"lazy"}):o("span",{class:"fill"})),e.append(o("div",{class:"play"},o("span",{},g(E,""))));let r=A(a.video_duration_seconds);return r&&e.append(o("span",{class:"dur"},r)),e.addEventListener("click",()=>{if(!a.video_url)return;let t=o("video",{class:"vouch-video",src:a.video_url,controls:"",playsinline:"",preload:"metadata"});a.poster_url&&t.setAttribute("poster",a.poster_url),e.replaceWith(t),t.play().catch(()=>{})}),e}function u(a,e,r,t,i="classic"){let n=o("figure",{class:"card vouch-card"+(t?" settle":"")});return t&&(n.style.animationDelay=Math.min(r,12)*55+"ms"),["portrait","glass","editorial"].includes(i)&&n.append(o("div",{class:"vouch-portrait","aria-hidden":"true"},a.author_avatar_url?o("img",{src:a.author_avatar_url,alt:"",loading:"lazy"}):o("span",{},w(a.author_name)))),(i==="bold"||i==="bubble")&&n.append(o("span",{class:"vouch-decoration","aria-hidden":"true"},"\u201C")),a.type==="video"&&a.video_url&&n.append(M(a)),e&&a.rating&&n.append(S(a.rating)),a.body&&n.append(o("blockquote",{class:"quote vouch-quote"},a.body)),n.append(T(a)),n}function P(a){let e=o("div",{class:"grid vouch-masonry"});return a.testimonials.forEach((r,t)=>e.append(u(r,a.wall.show_ratings,t,!0,p(a.wall.card_style)))),e}function C(a){let e=o("div",{}),r=o("div",{class:"rail",role:"region","aria-label":"Testimonials",tabindex:"0"});a.testimonials.forEach((c,d)=>r.append(u(c,a.wall.show_ratings,d,!1,p(a.wall.card_style))));let t=o("button",{type:"button","aria-label":"Previous testimonials"},g(L,"")),i=o("button",{type:"button","aria-label":"Next testimonials"},g(q,"")),n=()=>{t.disabled=r.scrollLeft<8,i.disabled=r.scrollLeft+r.clientWidth>=r.scrollWidth-8},s=c=>r.scrollBy({left:c*Math.max(280,r.clientWidth*.8),behavior:"smooth"});return t.addEventListener("click",()=>s(-1)),i.addEventListener("click",()=>s(1)),r.addEventListener("scroll",n),typeof ResizeObserver!="undefined"&&new ResizeObserver(n).observe(r),e.append(r,o("div",{class:"nav"},t,i)),setTimeout(n,0),e}function R(a){let e=o("div",{class:"mq"}),r=o("div",{class:"mq-track"});r.style.setProperty("--dur",Math.max(24,a.testimonials.length*6)+"s");for(let t=0;t<2;t++){let i=o("div",{class:"mq-set"});t===1&&i.setAttribute("aria-hidden","true"),a.testimonials.forEach((n,s)=>i.append(u(n,a.wall.show_ratings,s,!1,p(a.wall.card_style)))),r.append(i)}return e.append(r),e}function j(a){let e=o("div",{class:"sp",role:"region","aria-label":"Testimonials",tabindex:"0"});a.testimonials.forEach((i,n)=>e.append(u(i,a.wall.show_ratings,n,!1,p(a.wall.card_style))));let r=0,t=()=>{let i=e.scrollLeft+e.clientWidth/2;for(let n=0;n<e.children.length;n++){let s=e.children[n],c=s.offsetLeft+s.offsetWidth/2,d=Math.min(1,Math.abs(c-i)/(s.offsetWidth||1));s.style.transform="scale("+(1-d*.12).toFixed(3)+")",s.style.opacity=(1-d*.55).toFixed(3)}};return e.addEventListener("scroll",()=>{cancelAnimationFrame(r),r=requestAnimationFrame(t)},{passive:!0}),typeof ResizeObserver!="undefined"&&new ResizeObserver(t).observe(e),setTimeout(t,0),e}function W(a){let e=o("div",{class:"single"}),r=o("div",{});e.append(r);let t=0,i=()=>{let s=a.testimonials[t],c=u(s,a.wall.show_ratings,0,!0,p(a.wall.card_style));p(a.wall.card_style)==="classic"&&c.prepend(g(z,"mark","0 0 32 24")),r.replaceChildren(c),n.querySelectorAll("button").forEach((d,h)=>d.setAttribute("aria-selected",String(h===t)))},n=o("div",{class:"dots",role:"tablist","aria-label":"Choose a testimonial"});return a.testimonials.length>1&&(a.testimonials.forEach((s,c)=>{let d=o("button",{type:"button",role:"tab","aria-label":"Testimonial from "+s.author_name,"aria-selected":String(c===0)});d.addEventListener("click",()=>{t=c,i()}),n.append(d)}),e.append(n)),i(),e}function I(a){var h;let e=a.getAttribute("data-wall");if(!e)return;let r=a.getAttribute("data-origin")||new URL(a.src,location.href).origin,t=o("div");t.style.setProperty("all","initial","important"),t.style.setProperty("display","block","important"),(h=a.parentNode)==null||h.insertBefore(t,a);let i=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=_+x;let s=o("div",{class:"v vouch-design"});i.append(n,s);let c=l=>s.replaceChildren(o("div",{class:"msg"},l)),d=a.getAttribute("data-api")||r+"/api/walls/"+encodeURIComponent(e);fetch(d,{headers:{accept:"application/json"}}).then(l=>{if(!l.ok)throw new Error(String(l.status));return l.json()}).then(l=>{if(!l||!l.wall)return c("This wall is no longer available.");if(s.setAttribute("data-theme",l.wall.theme),s.setAttribute("data-card-style",p(l.wall.card_style)),s.style.setProperty("--accent",l.wall.accent_color),!l.testimonials.length)return c("No testimonials yet.");let b=l.wall.carousel_style||"rail";s.replaceChildren(l.wall.layout==="carousel"?b==="marquee"?R(l):b==="spotlight"?j(l):C(l):l.wall.layout==="single"?W(l):P(l));try{let m=JSON.stringify({referrer_domain:location.hostname}),f=r+"/api/walls/"+encodeURIComponent(e)+"/view";navigator.sendBeacon?navigator.sendBeacon(f,new Blob([m],{type:"application/json"})):fetch(f,{method:"POST",body:m,keepalive:!0})}catch{}}).catch(()=>c("Testimonials could not be loaded."))}var y,v=(y=document.currentScript)!=null?y:document.querySelector("script[data-wall]:not([data-vouch-done])");v&&(v.setAttribute("data-vouch-done",""),I(v));})();
