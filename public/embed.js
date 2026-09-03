"use strict";(()=>{var w=`
:host{all:initial;display:block;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.v{
  --bg:#ffffff;--sunk:#f7f5f2;--line:#e4e0db;--line-2:#d1cbc4;
  --ink:#1a1614;--muted:#6b625c;--subtle:#8d857e;
  --shadow:0 1px 1px rgba(26,22,20,.04),0 1px 2px rgba(26,22,20,.06);
  --shadow-2:0 1px 2px rgba(26,22,20,.04),0 6px 14px -3px rgba(26,22,20,.08);
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  color:var(--ink);-webkit-font-smoothing:antialiased;line-height:1.5;
}
.v[data-theme="dark"]{
  --bg:#262220;--sunk:#1c1917;--line:#3a3532;--line-2:#4d4643;
  --ink:#f7f4f1;--muted:#a8a099;--subtle:#7d756e;
  --shadow:0 1px 2px rgba(0,0,0,.34);
  --shadow-2:0 1px 2px rgba(0,0,0,.30),0 6px 14px -3px rgba(0,0,0,.40);
}
@media (prefers-color-scheme:dark){
  .v[data-theme="auto"]{
    --bg:#262220;--sunk:#1c1917;--line:#3a3532;--line-2:#4d4643;
    --ink:#f7f4f1;--muted:#a8a099;--subtle:#7d756e;
    --shadow:0 1px 2px rgba(0,0,0,.34);
    --shadow-2:0 1px 2px rgba(0,0,0,.30),0 6px 14px -3px rgba(0,0,0,.40);
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
  break-inside:avoid;background:var(--bg);border:1px solid var(--line);
  border-radius:14px;padding:20px;box-shadow:var(--shadow);
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
.single .quote{font-size:clamp(20px,3.4vw,30px);line-height:1.32;letter-spacing:-.015em;
  font-family:ui-serif,Georgia,"Times New Roman",serif;}
.single .card{padding:40px 32px;}
.mark{width:26px;height:20px;fill:var(--accent);opacity:.35;margin-bottom:16px;display:block;}

.by{display:flex;align-items:center;gap:10px;margin-top:16px;padding-top:16px;border-top:1px solid var(--line);}
.av{width:36px;height:36px;border-radius:999px;object-fit:cover;flex:0 0 auto;display:grid;
  place-items:center;font-size:13px;font-weight:600;
  background:color-mix(in oklab,var(--accent) 16%,transparent);color:var(--accent);}
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

.msg{border:1px dashed var(--line);border-radius:14px;background:var(--sunk);
  padding:40px 24px;text-align:center;color:var(--muted);font-size:13px;}

:where(button,a):focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
`;function o(e,t,...n){let a=document.createElement(e);if(t)for(let r in t)a.setAttribute(r,t[r]);for(let r of n)a.append(r);return a}function u(e,t,n="0 0 16 16"){let a=document.createElementNS("http://www.w3.org/2000/svg","svg");a.setAttribute("viewBox",n),a.setAttribute("class",t),a.setAttribute("aria-hidden","true");let r=document.createElementNS("http://www.w3.org/2000/svg","path");return r.setAttribute("d",e),a.append(r),a}var k="M10.28 3.22a.75.75 0 0 1 0 1.06L6.56 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L4.97 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z",_="M5.72 3.22a.75.75 0 0 0 0 1.06L9.44 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06L6.78 3.22a.75.75 0 0 0-1.06 0Z",q="M4.5 2.6v10.8a.6.6 0 0 0 .92.5l8.4-5.4a.6.6 0 0 0 0-1L5.42 2.1a.6.6 0 0 0-.92.5Z",L="M0 24V13.2C0 5.9 4.2 1.1 11.6 0l1.2 3.9C8.4 5.2 6.2 7.6 6.2 11h5.2v13H0Zm18.6 0V13.2C18.6 5.9 22.8 1.1 30.2 0l1.2 3.9c-4.4 1.3-6.6 3.7-6.6 7.1h5.2v13h-11.4Z";function E(e){return e.trim().split(/\s+/).slice(0,2).map(t=>t[0]||"").join("").toUpperCase()}function z(e){return e?Math.floor(e/60)+":"+String(e%60).padStart(2,"0"):null}function v(e){let t=o("div",{class:"stars",role:"img","aria-label":e+" out of 5 stars"});return t.append("\u2605".repeat(e)),e<5&&t.append(o("span",{class:"off"},"\u2605".repeat(5-e))),t}function y(e){let t=[e.author_role,e.author_company].filter(Boolean).join(", "),n=e.author_avatar_url?o("img",{class:"av",src:e.author_avatar_url,alt:"",loading:"lazy",width:"36",height:"36"}):o("span",{class:"av"},E(e.author_name)),a=o("span",{},o("span",{class:"name"},e.author_name));return t&&a.append(o("span",{class:"meta"},t)),o("figcaption",{class:"by"},n,a)}function A(e){let t=o("button",{class:"media",type:"button","aria-label":"Play video testimonial from "+e.author_name});t.append(e.poster_url?o("img",{src:e.poster_url,alt:"",loading:"lazy"}):o("span",{class:"fill"})),t.append(o("div",{class:"play"},o("span",{},u(q,""))));let n=z(e.video_duration_seconds);return n&&t.append(o("span",{class:"dur"},n)),t.addEventListener("click",()=>{if(!e.video_url)return;let a=o("video",{src:e.video_url,controls:"",playsinline:"",preload:"metadata"});e.poster_url&&a.setAttribute("poster",e.poster_url),t.replaceWith(a),a.play().catch(()=>{})}),t}function m(e,t,n,a){let r=o("figure",{class:"card"+(a?" settle":"")});return a&&(r.style.animationDelay=Math.min(n,12)*55+"ms"),e.type==="video"&&e.video_url&&r.append(A(e)),t&&e.rating&&r.append(v(e.rating)),e.body&&r.append(o("blockquote",{class:"quote"},e.body)),r.append(y(e)),r}function M(e){let t=o("div",{class:"grid"});return e.testimonials.forEach((n,a)=>t.append(m(n,e.wall.show_ratings,a,!0))),t}function S(e){let t=o("div",{}),n=o("div",{class:"rail",role:"region","aria-label":"Testimonials",tabindex:"0"});e.testimonials.forEach((d,c)=>n.append(m(d,e.wall.show_ratings,c,!1)));let a=o("button",{type:"button","aria-label":"Previous testimonials"},u(k,"")),r=o("button",{type:"button","aria-label":"Next testimonials"},u(_,"")),l=()=>{a.disabled=n.scrollLeft<8,r.disabled=n.scrollLeft+n.clientWidth>=n.scrollWidth-8},i=d=>n.scrollBy({left:d*Math.max(280,n.clientWidth*.8),behavior:"smooth"});return a.addEventListener("click",()=>i(-1)),r.addEventListener("click",()=>i(1)),n.addEventListener("scroll",l),typeof ResizeObserver!="undefined"&&new ResizeObserver(l).observe(n),t.append(n,o("div",{class:"nav"},a,r)),setTimeout(l,0),t}function T(e){let t=o("div",{class:"mq"}),n=o("div",{class:"mq-track"});n.style.setProperty("--dur",Math.max(24,e.testimonials.length*6)+"s");for(let a=0;a<2;a++){let r=o("div",{class:"mq-set"});a===1&&r.setAttribute("aria-hidden","true"),e.testimonials.forEach((l,i)=>r.append(m(l,e.wall.show_ratings,i,!1))),n.append(r)}return t.append(n),t}function P(e){let t=o("div",{class:"sp",role:"region","aria-label":"Testimonials",tabindex:"0"});e.testimonials.forEach((r,l)=>t.append(m(r,e.wall.show_ratings,l,!1)));let n=0,a=()=>{let r=t.scrollLeft+t.clientWidth/2;for(let l=0;l<t.children.length;l++){let i=t.children[l],d=i.offsetLeft+i.offsetWidth/2,c=Math.min(1,Math.abs(d-r)/(i.offsetWidth||1));i.style.transform="scale("+(1-c*.12).toFixed(3)+")",i.style.opacity=(1-c*.55).toFixed(3)}};return t.addEventListener("scroll",()=>{cancelAnimationFrame(n),n=requestAnimationFrame(a)},{passive:!0}),typeof ResizeObserver!="undefined"&&new ResizeObserver(a).observe(t),setTimeout(a,0),t}function R(e){let t=o("div",{class:"single"}),n=o("div",{});t.append(n);let a=0,r=()=>{let i=e.testimonials[a],d=o("figure",{class:"card settle"});d.append(u(L,"mark","0 0 32 24")),e.wall.show_ratings&&i.rating&&d.append(v(i.rating)),i.body&&d.append(o("blockquote",{class:"quote"},i.body)),d.append(y(i)),n.replaceChildren(d),l.querySelectorAll("button").forEach((c,p)=>c.setAttribute("aria-selected",String(p===a)))},l=o("div",{class:"dots",role:"tablist","aria-label":"Choose a testimonial"});return e.testimonials.length>1&&(e.testimonials.forEach((i,d)=>{let c=o("button",{type:"button",role:"tab","aria-label":"Testimonial from "+i.author_name,"aria-selected":String(d===0)});c.addEventListener("click",()=>{a=d,r()}),l.append(c)}),t.append(l)),r(),t}function C(e){var p;let t=e.getAttribute("data-wall");if(!t)return;let n=e.getAttribute("data-origin")||new URL(e.src,location.href).origin,a=o("div");a.style.setProperty("all","initial","important"),a.style.setProperty("display","block","important"),(p=e.parentNode)==null||p.insertBefore(a,e);let r=a.attachShadow({mode:"open"}),l=document.createElement("style");l.textContent=w;let i=o("div",{class:"v"});r.append(l,i);let d=s=>i.replaceChildren(o("div",{class:"msg"},s)),c=e.getAttribute("data-api")||n+"/api/walls/"+encodeURIComponent(t);fetch(c,{headers:{accept:"application/json"}}).then(s=>{if(!s.ok)throw new Error(String(s.status));return s.json()}).then(s=>{if(!s||!s.wall)return d("This wall is no longer available.");if(i.setAttribute("data-theme",s.wall.theme),i.style.setProperty("--accent",s.wall.accent_color),!s.testimonials.length)return d("No testimonials yet.");let b=s.wall.carousel_style||"rail";i.replaceChildren(s.wall.layout==="carousel"?b==="marquee"?T(s):b==="spotlight"?P(s):S(s):s.wall.layout==="single"?R(s):M(s));try{let f=JSON.stringify({referrer_domain:location.hostname}),h=n+"/api/walls/"+encodeURIComponent(t)+"/view";navigator.sendBeacon?navigator.sendBeacon(h,new Blob([f],{type:"application/json"})):fetch(h,{method:"POST",body:f,keepalive:!0})}catch{}}).catch(()=>d("Testimonials could not be loaded."))}var x,g=(x=document.currentScript)!=null?x:document.querySelector("script[data-wall]:not([data-vouch-done])");g&&(g.setAttribute("data-vouch-done",""),C(g));})();
