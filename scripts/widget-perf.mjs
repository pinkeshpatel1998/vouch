/**
 * Measures the embed on a cold cache — section 14 asks for under 400ms.
 * Loads the hostile test page with caching disabled and reports when the
 * wall's first card actually exists in the shadow root, not just when the
 * script finished downloading.
 */
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = process.env.BASE ?? "http://localhost:3000";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const page = await browser.newPage();
await page.setCacheEnabled(false);

const transfer = new Map();
page.on("response", async (r) => {
  if (r.url().endsWith("/embed.js") || r.url().includes("/api/walls/")) {
    const len = Number(r.headers()["content-length"] ?? 0);
    transfer.set(r.url().split("/").pop(), len);
  }
});

const t0 = Date.now();
await page.goto(`${URL}/embed-test.html`, { waitUntil: "domcontentloaded" });

// Wait for a real card inside the shadow root.
await page.waitForFunction(
  () => {
    const host = [...document.querySelectorAll("div")].find((d) => d.shadowRoot);
    return Boolean(host?.shadowRoot?.querySelector(".card"));
  },
  { timeout: 15000 },
);
const painted = Date.now() - t0;

const cards = await page.evaluate(() => {
  const host = [...document.querySelectorAll("div")].find((d) => d.shadowRoot);
  return host.shadowRoot.querySelectorAll(".card").length;
});

console.log(`\n  first card rendered   ${painted} ms  ${painted < 400 ? "\x1b[32m✓ under 400ms\x1b[0m" : "\x1b[31m✗ over 400ms\x1b[0m"}`);
console.log(`  cards in shadow root  ${cards}`);
for (const [k, v] of transfer) console.log(`  ${k.padEnd(20)}  ${v ? `${v} bytes` : "(chunked)"}`);
console.log();

await browser.close();
process.exit(painted < 400 ? 0 : 1);
