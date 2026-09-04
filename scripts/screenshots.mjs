/**
 * Captures the README screenshots against a running dev server.
 *
 *   npm run dev            # in another shell
 *   node scripts/screenshots.mjs
 *
 * Uses the system Chrome via puppeteer-core so nothing large is downloaded.
 * Seeds the local store first, because most screens are empty without it.
 */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = "docs/screens";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(page, path, file, { width = 1440, height = 900, full = false, dark = false } = {}) {
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: dark ? "dark" : "light" },
  ]);
  await page.goto(BASE + path, { waitUntil: "networkidle2" });
  // The Next dev-tools bubble is not part of the product.
  await page.addStyleTag({
    content: "nextjs-portal,[data-nextjs-toast],#__next-build-watcher{display:none !important;}",
  }).catch(() => {});
  // Let fonts settle and the settle animation finish.
  await wait(1400);
  await page.screenshot({ path: `${OUT}/${file}`, fullPage: full });
  console.log("  ✓", file);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--force-device-scale-factor=2"],
});

await mkdir(OUT, { recursive: true });
const page = await browser.newPage();

// --- seed, so the dashboard and wall builder have something to show ---
console.log("seeding demo space…");
await page.goto(BASE + "/app", { waitUntil: "networkidle2" });
await wait(800);
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) =>
    x.textContent.includes("Load demo space"),
  );
  if (b) b.click();
});
await wait(2500);

const spaceId = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("vouch-store-v1") || "{}");
  return s.spaces?.[0]?.id ?? null;
});
const slug = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("vouch-store-v1") || "{}");
  return s.spaces?.[0]?.slug ?? "lantern-studio";
});
console.log("  space:", spaceId, slug);

console.log("capturing…");
await shoot(page, "/", "marketing.png", { height: 1000 });
await shoot(page, `/app/${spaceId}/wall`, "wall-builder.png", { height: 980 });
await shoot(page, `/app/${spaceId}/inbox`, "inbox.png", { height: 980 });
await shoot(page, "/app", "dashboard.png", { height: 820 });
await shoot(page, "/embed-test.html", "isolation.png", { height: 900, dark: true });

// mobile collection page — the journey most submitters actually see
await shoot(page, `/c/${slug}`, "collect-mobile.png", { width: 400, height: 850 });

await browser.close();
console.log("done →", OUT);
