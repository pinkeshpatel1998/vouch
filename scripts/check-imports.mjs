/**
 * Screens must import the data layer through `@/lib/data`, never from either
 * implementation directly. A direct import silently pins that screen to one
 * backend, which is the exact failure the adapter exists to prevent -- and it
 * would not show up until the environment variables were set.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOTS = ["app", "components"];
const BANNED = [/@\/lib\/data\/store/, /@\/lib\/data\/supabase/];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

const bad = [];
for (const root of ROOTS) {
  for (const file of await walk(root)) {
    const src = await readFile(file, "utf8");
    for (const re of BANNED) {
      if (re.test(src)) bad.push(`${file} imports ${re.source.replace(/\\/g, "")}`);
    }
  }
}

if (bad.length) {
  console.error("\x1b[31mData-layer imports must go through @/lib/data:\x1b[0m");
  bad.forEach((b) => console.error(`  ${b}`));
  process.exit(1);
}
console.log("\x1b[32m✓\x1b[0m all data-layer imports go through @/lib/data");
