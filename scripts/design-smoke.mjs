/** UI regression smoke check. Run against `npm run dev`; uses an isolated Chrome profile. */
import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.BASE ?? "http://localhost:3000";
const out = process.env.OUT ?? "/tmp/vouch-design";
await mkdir(out, { recursive: true });
const pause = () => new Promise((r) => setTimeout(r, 650));
async function visit(path) {
  await page.goto(base + path, { waitUntil: "networkidle2" });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await new Promise((r) => setTimeout(r, 1100));
}
async function clickText(text, selector = "button") {
  await page.waitForFunction(
    (text, selector) =>
      [...document.querySelectorAll(selector)].some((el) =>
        el.textContent.includes(text),
      ),
    {},
    text,
    selector,
  );
  await page.evaluate(
    (text, selector) =>
      [...document.querySelectorAll(selector)]
        .find((el) => el.textContent.includes(text))
        .click(),
    text,
    selector,
  );
  await pause();
}
async function noOverflow(label) {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    `${label} overflows horizontally`,
  );
}
try {
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await visit("/");
  assert.equal(await page.$$eval(".hero-card", (x) => x.length), 4);
  await page.$$eval("img", (imgs) =>
    imgs.forEach((img) => {
      img.loading = "eager";
    }),
  );
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete && img.naturalWidth > 0),
  );
  assert(
    await page.$$eval("img", (imgs) =>
      imgs.every((img) => img.complete && img.naturalWidth > 0),
    ),
  );
  await noOverflow("Desktop landing");
  await page.screenshot({ path: out + "/landing-desktop.png", fullPage: true });
  await clickText("Carousel");
  assert.equal(
    await page.$eval('.layout-picker button[aria-pressed="true"]', (e) =>
      e.textContent.trim(),
    ),
    "▤Carousel",
  );
  await page.click('[aria-label="Next testimonials"]');
  await pause();
  assert(
    await page.$eval('[aria-label="Testimonials"]', (el) => el.scrollLeft > 0),
  );
  await clickText("Spotlight");
  assert.equal(await page.$$eval(".live-wall figure", (x) => x.length), 1);
  await clickText("Wall of love", ".layout-picker button");
  await page.$eval("details summary", (el) => el.click());
  assert(await page.$eval("details", (el) => el.open));
  for (const width of [390, 768]) {
    await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
    await visit("/");
    await noOverflow(`Landing ${width}`);
    if (width === 390) {
      await page.click(".menu-toggle");
      assert.equal(
        await page.$eval(".menu-toggle", (el) =>
          el.getAttribute("aria-expanded"),
        ),
        "true",
      );
      await page.click('.nav-links a[href="#how-it-works"]');
      await pause();
      assert.equal(
        await page.$eval(".menu-toggle", (el) =>
          el.getAttribute("aria-expanded"),
        ),
        "false",
      );
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await pause();
    }
    await page.screenshot({
      path: `${out}/landing-${width}.png`,
      fullPage: true,
    });
  }
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  assert.equal(
    await page.$eval(".hero-glow", (el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.emulateMediaFeatures([]);
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await visit("/app");
  await clickText("Load demo space");
  await page.waitForFunction(() => location.pathname.endsWith("/inbox"));
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("vouch-store-v1")),
  );
  const space = state.spaces[0];
  assert.equal(space.accent_color, "#b84925");
  await visit(`/c/${space.slug}`);
  await clickText("Write instead");
  await page.type(
    "#body",
    "The new experience is thoughtful, welcoming, and easy to use. A design smoke test story.",
  );
  await page.type("#name", "Design Smoke Test");
  await page.click('[aria-label="5 stars"]');
  await page.click('input[type="checkbox"]');
  await clickText("Send testimonial");
  await page.waitForFunction(() =>
    document.body.innerText.includes("Thank you"),
  );
  await visit(`/app/${space.id}/inbox`);
  await page.waitForFunction(() =>
    document.body.innerText.includes("Design Smoke Test"),
  );
  await page.evaluate(() => {
    const row = [...document.querySelectorAll("main li")].find((el) =>
      el.textContent.includes("Design Smoke Test"),
    );
    [...row.querySelectorAll("button")]
      .find((el) => el.textContent.includes("Approve"))
      .click();
  });
  await pause();
  const approved = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("vouch-store-v1")).testimonials.find(
        (t) => t.author_name === "Design Smoke Test",
      ).status,
  );
  assert.equal(approved, "approved");
  await visit(`/app/${space.id}/wall`);
  await page.waitForFunction(() =>
    document.body.innerText.includes("Design Smoke Test"),
  );
  await noOverflow("Desktop builder");
  await page.screenshot({ path: out + "/builder-desktop.png", fullPage: true });
  for (const path of [
    "/app",
    `/app/${space.id}/inbox`,
    `/app/${space.id}/settings`,
    `/app/${space.id}/wall`,
    "/app/submissions",
    "/app/account",
    `/c/${space.slug}`,
    "/sign-in",
  ]) {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await visit(path);
    await noOverflow(path);
    if (path === "/app")
      await page.screenshot({
        path: out + "/dashboard-mobile.png",
        fullPage: true,
      });
  }
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await visit("/app");
  await clickText("New space");
  await page.waitForSelector("#space-name");
  await page.type("#space-name", "Fresh start");
  await clickText("Create space");
  await page.waitForFunction(() => location.pathname.endsWith("/settings"));
  assert(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("vouch-store-v1")).spaces.some(
        (s) => s.name === "Fresh start",
      ),
    ),
  );
  await visit("/app");
  await page.screenshot({
    path: out + "/dashboard-desktop.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: desktop/mobile layouts, loaded images, all preview layouts, carousel, FAQ, mobile menu, reduced motion, new space, collection, approval, and published wall. No browser errors.",
  );
  console.log("Screenshots:", out);
} finally {
  await browser.close();
}
