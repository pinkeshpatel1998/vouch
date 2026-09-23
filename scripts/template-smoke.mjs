import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const base = process.env.BASE ?? "http://localhost:3000";
const out = "/tmp/vouch-templates";
await mkdir(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const templates = [
  ["classic", "Soft minimal"],
  ["portrait", "Face to face"],
  ["glass", "Through the glass"],
  ["bold", "After hours"],
  ["bubble", "Good conversation"],
  ["editorial", "The anthology"],
];
async function visit(path) {
  await page.goto(base + path, { waitUntil: "networkidle2" });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
}
async function click(text) {
  await page.waitForFunction(
    (text) =>
      [...document.querySelectorAll("button")].some(
        (b) => b.textContent.trim() === text,
      ),
    {},
    text,
  );
  await page.evaluate(
    (text) =>
      [...document.querySelectorAll("button")]
        .find((b) => b.textContent.trim() === text)
        .click(),
    text,
  );
}
try {
  await page.setViewport({ width: 1440, height: 1050 });
  await visit("/app");
  await click("Load demo space");
  await page.waitForFunction(() => location.pathname.endsWith("/inbox"));
  const space = await page.evaluate(
    () => JSON.parse(localStorage.getItem("vouch-store-v1")).spaces[0],
  );
  // Test fixtures include portraits, long text, and a missing-photo fallback.
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem("vouch-store-v1"));
    data.testimonials
      .slice(0, 3)
      .forEach(
        (t, i) => (t.author_avatar_url = `/images/portrait-${i + 1}.jpg`),
      );
    localStorage.setItem("vouch-store-v1", JSON.stringify(data));
  });
  const wallPath = `/app/${space.id}/wall`;
  await visit(wallPath);
  assert.equal(await page.$$(".template-option").then((v) => v.length), 6);
  for (const [style, name] of templates) {
    await page.waitForSelector(
      `button[aria-label="${name} template"]:not(:disabled)`,
    );
    await page.click(`button[aria-label="${name} template"]`);
    await page.waitForFunction(
      (style) =>
        document.querySelector("main .vouch-design:not(.template-miniature)")
          ?.dataset.cardStyle === style,
      {},
      style,
    );
    await page.waitForFunction(
      () => !document.querySelector(".template-option:disabled"),
    );
    const saved = await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("vouch-store-v1")).walls[0].card_style,
    );
    assert.equal(saved, style);
    if (style !== "classic")
      assert(
        await page.$eval(
          "main .vouch-design:not(.template-miniature) .vouch-card",
          (el) => getComputedStyle(el).borderRadius !== "",
        ),
      );
    for (const layout of ["Carousel", "Single", "Wall"]) {
      await page.evaluate((layout) => {
        const group = [...document.querySelectorAll("fieldset")].find(
          (f) => f.querySelector("legend")?.textContent === "Layout",
        );
        [...group.querySelectorAll("button")]
          .find((b) => b.textContent.trim().startsWith(layout))
          .click();
      }, layout);
      await page.waitForFunction(
        () => !document.querySelector(".template-option:disabled"),
      );
      await page.waitForFunction(
        (layout) => {
          const stage = document.querySelector(
            "main .vouch-design:not(.template-miniature)",
          );
          return layout === "Single"
            ? stage?.querySelectorAll("figure").length === 1
            : layout === "Wall"
              ? !!stage?.querySelector(".vouch-masonry")
              : !!stage?.querySelector('[aria-label="Testimonials"]');
        },
        {},
        layout,
      );
      assert.equal(
        await page.$eval(
          "main .vouch-design:not(.template-miniature)",
          (el) => el.dataset.cardStyle,
        ),
        style,
      );
    }
    await click("Static HTML");
    const html = await page.$eval("pre", (el) => el.textContent);
    assert(html.includes(`data-card-style="${style}"`));
    const exported = await browser.newPage();
    await exported.setContent(html, { waitUntil: "domcontentloaded" });
    assert.equal(
      await exported.$eval(".vouch-design", (el) => el.dataset.cardStyle),
      style,
    );
    if (["portrait", "glass", "editorial"].includes(style))
      assert.notEqual(
        await exported.$eval(
          ".vouch-portrait",
          (el) => getComputedStyle(el).display,
        ),
        "none",
      );
    await exported.close();
    await page.evaluate(() => scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 850));
    await page.screenshot({
      path: `${out}/${style}-builder.png`,
      fullPage: false,
    });
  }
  await visit(wallPath);
  assert.equal(
    await page.$eval('.template-option[aria-pressed="true"]', (el) =>
      el.getAttribute("aria-label"),
    ),
    "The anthology template",
  );
  // Existing locally saved walls migrate gracefully.
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem("vouch-store-v1"));
    delete data.walls[0].card_style;
    localStorage.setItem("vouch-store-v1", JSON.stringify(data));
  });
  await visit(wallPath);
  assert.equal(
    await page.$eval('.template-option[aria-pressed="true"]', (el) =>
      el.getAttribute("aria-label"),
    ),
    "Soft minimal template",
  );
  await page.click('[aria-label="Through the glass template"]');
  await page.waitForFunction(
    () => !document.querySelector(".template-option:disabled"),
  );
  await page.setViewport({ width: 390, height: 844 });
  await visit(wallPath);
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  assert.equal(
    await page.$eval(
      ".vouch-masonry",
      (el) => getComputedStyle(el).columnCount,
    ),
    "1",
  );
  await page.screenshot({ path: out + "/mobile-builder.png", fullPage: true });
  await visit("/");
  await page.click('[aria-label="After hours template"]');
  await page.waitForSelector('.live-wall [data-card-style="bold"]');
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.setViewport({ width: 1200, height: 900 });
  // Exercise the shipped script widget with real API payloads for all styles.
  for (const [style] of templates) {
    await page.goto(base + "/embed-test.html", { waitUntil: "networkidle2" });
    await page.evaluate(
      (base, style) => {
        document.body.innerHTML = "";
        const script = document.createElement("script");
        script.src = base + "/embed.js";
        script.dataset.wall = "demo";
        script.dataset.api = base + "/api/walls/demo?template=" + style;
        document.body.append(script);
      },
      base,
      style,
    );
    await page.waitForFunction(
      (style) =>
        [...document.querySelectorAll("div")].some((el) =>
          el.shadowRoot?.querySelector(
            `.vouch-design[data-card-style="${style}"] .vouch-card`,
          ),
        ),
      {},
      style,
    );
    const rendered = await page.evaluate(() => {
      const root = [...document.querySelectorAll("div")].find(
        (el) => el.shadowRoot,
      )?.shadowRoot;
      const p = root.querySelector(".vouch-portrait");
      return {
        count: root.querySelectorAll(".vouch-card").length,
        portrait: p ? getComputedStyle(p).display : null,
      };
    });
    assert(rendered.count > 0);
    if (["portrait", "glass", "editorial"].includes(style))
      assert.notEqual(rendered.portrait, "none");
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: six template selections, persistence, old-wall fallback, static exports, script embeds, portrait fallbacks, mobile columns, landing preview, and no browser errors.",
  );
  console.log("Screenshots:", out);
} finally {
  await browser.close();
}
