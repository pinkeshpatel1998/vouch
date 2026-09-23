/**
 * Runs supabase/migrations against a real Postgres and exercises the public
 * RPCs, so a syntax error or a broken policy is found here rather than in the
 * Supabase SQL editor.
 *
 *   npm run db:check
 *
 * PGlite is Postgres compiled to wasm -- same parser, same planner, no Docker.
 * It does not ship Supabase's `auth` and `storage` schemas, so this file stubs
 * the parts the migrations touch. The stubs are deliberately minimal: if a
 * migration starts relying on something not stubbed here, that is worth
 * knowing too.
 */
import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const DIR = "supabase/migrations";

const SUPABASE_STUBS = `
create role anon;
create role authenticated;
create role service_role;

create schema if not exists auth;
create schema if not exists storage;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb default '{}'::jsonb
);

-- Supabase reads the JWT claim; the tests set it with set_config().
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid
);
alter table storage.objects enable row level security;

create or replace function storage.foldername(name text) returns text[]
language sql immutable as $$
  select string_to_array(regexp_replace(name, '/[^/]*$', ''), '/');
$$;

grant usage on schema public, storage to anon, authenticated;

-- Supabase ships this default privilege on a new project. Mirroring it here
-- keeps the harness honest: the migrations still have to stand on their own,
-- but the baseline matches what they will actually land on.
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
`;

const log = {
  ok: (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`),
  bad: (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`),
  head: (m) => console.log(`\n\x1b[1m${m}\x1b[0m`),
};

let failures = 0;
async function check(name, fn) {
  try {
    await fn();
    log.ok(name);
  } catch (e) {
    failures++;
    log.bad(`${name}\n      ${String(e.message).split("\n")[0]}`);
  }
}

/**
 * Asserts the block is rejected *by a constraint*, not by something incidental.
 * Without the SQLSTATE check these tests pass when the table is missing, which
 * is exactly how a broken schema hid behind a green run.
 */
const CONSTRAINT_CODES = new Set([
  "23514", // check_violation
  "23502", // not_null_violation
  "23503", // foreign_key_violation
  "23505", // unique_violation
  "P0002", // no_data_found, raised by submit_testimonial
  "42501", // insufficient_privilege
]);

async function mustReject(name, fn) {
  try {
    await fn();
  } catch (e) {
    if (CONSTRAINT_CODES.has(e.code)) return log.ok(name);
    failures++;
    return log.bad(
      `${name}\n      rejected, but by ${e.code}: ${String(e.message).split("\n")[0]}`,
    );
  }
  failures++;
  log.bad(`${name}\n      expected this to be rejected, but it succeeded`);
}

const db = await PGlite.create();

log.head("Supabase stubs");
await check("auth + storage schemas", () => db.exec(SUPABASE_STUBS));

log.head("Migrations");
const files = (await readdir(DIR)).filter((f) => f.endsWith(".sql")).sort();
for (const f of files) {
  const sql = await readFile(path.join(DIR, f), "utf8");
  await check(f, () => db.exec(sql));
}

log.head("Fixtures");
let userId, spaceId, wallId;
await check("a user, a space and a wall", async () => {
  const u = await db.query(
    `insert into auth.users (email, raw_user_meta_data)
     values ('owner@example.com', '{"full_name":"Owner","avatar_url":null}'::jsonb)
     returning id`,
  );
  userId = u.rows[0].id;

  // handle_new_user() should have mirrored the row into public.users.
  const mirrored = await db.query(
    `select count(*)::int as n from public.users where id = $1`,
    [userId],
  );
  if (mirrored.rows[0].n !== 1)
    throw new Error("on_auth_user_created trigger did not fire");

  const s = await db.query(
    `insert into public.spaces (user_id, slug, name) values ($1, 'fernway', 'Fernway') returning id`,
    [userId],
  );
  spaceId = s.rows[0].id;

  const w = await db.query(
    `insert into public.walls (space_id) values ($1) returning id`,
    [spaceId],
  );
  wallId = w.rows[0].id;
});

log.head("Constraints");
await mustReject("a slug with uppercase is refused", () =>
  db.query(
    `insert into public.spaces (user_id, slug, name) values ($1, 'Bad_Slug', 'x')`,
    [userId],
  ),
);
await mustReject("a space with both paths off is refused", () =>
  db.query(
    `insert into public.spaces (user_id, slug, name, allow_text, allow_video)
     values ($1, 'nopath', 'x', false, false)`,
    [userId],
  ),
);
await mustReject("a testimonial without consent is refused", () =>
  db.query(
    `insert into public.testimonials (space_id, type, body, author_name, consent_given)
     values ($1, 'text', 'hi', 'A', false)`,
    [spaceId],
  ),
);
await check("approved_at is set by the trigger, not the caller", async () => {
  const r = await db.query(
    `insert into public.testimonials (space_id, type, body, author_name, consent_given, status)
     values ($1, 'text', 'Great work.', 'Maya Ortiz', true, 'approved')
     returning approved_at`,
    [spaceId],
  );
  if (!r.rows[0].approved_at) throw new Error("approved_at was left null");
});
await check("approved_at clears when a row goes back to pending", async () => {
  const r = await db.query(
    `update public.testimonials set status = 'pending'
     where space_id = $1 and status = 'approved'
     returning approved_at`,
    [spaceId],
  );
  if (r.rows[0].approved_at !== null) throw new Error("approved_at survived");
});
await mustReject("an unfinished video upload cannot be approved", async () => {
  const r = await db.query(
    `insert into public.testimonials (space_id, type, author_name, consent_given, video_url)
     values ($1, 'video', 'Sofia Lindqvist', true, null) returning id`,
    [spaceId],
  );
  await db.query(
    `update public.testimonials set status = 'approved' where id = $1`,
    [r.rows[0].id],
  );
});

log.head("Public RPCs");
await check("collection_space(slug) returns the public subset", async () => {
  const r = await db.query(`select * from public.collection_space('fernway')`);
  if (r.rows.length !== 1) throw new Error("no row");
  if ("user_id" in r.rows[0])
    throw new Error("user_id leaked to the public surface");
});

await check("submit_testimonial forces pending", async () => {
  const r = await db.query(
    `select public.submit_testimonial('fernway', 'text', 'Priya Raman', true, 'Four weeks end to end.') as id`,
  );
  const row = await db.query(
    `select status, consent_given from public.testimonials where id = $1`,
    [r.rows[0].id],
  );
  if (row.rows[0].status !== "pending")
    throw new Error(`status was ${row.rows[0].status}`);
});

await mustReject("submit_testimonial refuses without consent", () =>
  db.query(
    `select public.submit_testimonial('fernway', 'text', 'X', false, 'body')`,
  ),
);

await mustReject("submit_testimonial refuses a disabled path", async () => {
  await db.query(`update public.spaces set allow_video = false where id = $1`, [
    spaceId,
  ]);
  await db.query(
    `select public.submit_testimonial('fernway', 'video', 'X', true, null, null, 'u')`,
  );
});
await db.query(`update public.spaces set allow_video = true where id = $1`, [
  spaceId,
]);

await check("wall_payload returns config plus approved rows only", async () => {
  await db.query(
    `update public.testimonials set status = 'approved'
     where space_id = $1 and type = 'text'`,
    [spaceId],
  );
  const r = await db.query(`select public.wall_payload($1) as p`, [wallId]);
  const p = r.rows[0].p;
  if (!p?.wall) throw new Error("no wall in payload");
  if (p.wall.card_style !== "classic")
    throw new Error("default template missing from payload");
  if (!("carousel_style" in p.wall))
    throw new Error("carousel_style missing from payload");
  if (!Array.isArray(p.testimonials))
    throw new Error("testimonials is not an array");
  if (p.testimonials.some((t) => t.body === null && t.type === "text"))
    throw new Error("a text row came back with no body");
});

await check(
  "all six card templates survive a save and public payload round trip",
  async () => {
    for (const style of [
      "classic",
      "portrait",
      "glass",
      "bold",
      "bubble",
      "editorial",
    ]) {
      await db.query(`update public.walls set card_style = $1 where id = $2`, [
        style,
        wallId,
      ]);
      const r = await db.query(`select public.wall_payload($1) as p`, [wallId]);
      if (r.rows[0].p.wall.card_style !== style)
        throw new Error(`lost template: ${style}`);
    }
  },
);
await mustReject("unknown card templates are refused", () =>
  db.query(`update public.walls set card_style = 'unknown' where id = $1`, [
    wallId,
  ]),
);

await check(
  "wall_payload on an unknown id returns null, not an error",
  async () => {
    const r = await db.query(
      `select public.wall_payload(gen_random_uuid()) as p`,
    );
    if (r.rows[0].p !== null) throw new Error("expected null");
  },
);

await check("record_wall_view inserts one row", async () => {
  await db.query(`select public.record_wall_view($1, 'example.com')`, [wallId]);
  const r = await db.query(
    `select count(*)::int as n from public.wall_views where wall_id = $1`,
    [wallId],
  );
  if (r.rows[0].n !== 1) throw new Error(`got ${r.rows[0].n} rows`);
});

log.head("Row-level security");
await check("RLS is enabled on every public table", async () => {
  const r = await db.query(`
    select c.relname from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
  `);
  if (r.rows.length)
    throw new Error(`RLS off for: ${r.rows.map((x) => x.relname).join(", ")}`);
});

await check("an owner sees their own space", async () => {
  await db.exec(`set role authenticated`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [
    userId,
  ]);
  const r = await db.query(`select count(*)::int as n from public.spaces`);
  await db.exec(`reset role`);
  if (r.rows[0].n !== 1) throw new Error(`owner saw ${r.rows[0].n} spaces`);
});

await check("a different signed-in user sees nothing", async () => {
  await db.exec(`set role authenticated`);
  await db.query(
    `select set_config('request.jwt.claim.sub', gen_random_uuid()::text, false)`,
  );
  const r = await db.query(`select count(*)::int as n from public.spaces`);
  await db.exec(`reset role`);
  if (r.rows[0].n !== 0) throw new Error(`stranger saw ${r.rows[0].n} spaces`);
});

await check(
  "an owner's inbox reaches testimonials through owns_space()",
  async () => {
    await db.exec(`set role authenticated`);
    await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [
      userId,
    ]);
    const r = await db.query(
      `select count(*)::int as n from public.testimonials`,
    );
    await db.exec(`reset role`);
    if (r.rows[0].n === 0)
      throw new Error(
        "owner saw no testimonials -- owns_space() may be denied",
      );
  },
);

await check("anon has no table access", async () => {
  await db.exec(`set role anon`);
  await db.query(`select set_config('request.jwt.claim.sub', '', false)`);
  const leaked = [];
  for (const t of ["users", "spaces", "testimonials", "walls", "wall_views"]) {
    try {
      await db.query(`select count(*) from public.${t}`);
      leaked.push(t);
    } catch {
      /* denied, as intended */
    }
  }
  await db.exec(`reset role`);
  if (leaked.length) throw new Error(`anon could read: ${leaked.join(", ")}`);
});

await check("anon can still call the four public functions", async () => {
  await db.exec(`set role anon`);
  await db.query(`select * from public.collection_space('fernway')`);
  await db.query(`select public.wall_payload($1)`, [wallId]);
  await db.query(`select public.record_wall_view($1, null)`, [wallId]);
  await db.query(
    `select public.submit_testimonial('fernway','text','Anon',true,'A body')`,
  );
  await db.exec(`reset role`);
});

log.head("Storage");
await check("three buckets exist with limits and mime types", async () => {
  const r = await db.query(
    `select id, file_size_limit, allowed_mime_types from storage.buckets`,
  );
  if (r.rows.length !== 3)
    throw new Error(`expected 3 buckets, got ${r.rows.length}`);
  if (r.rows.some((b) => !b.file_size_limit || !b.allowed_mime_types?.length))
    throw new Error("a bucket is missing a size limit or mime list");
});
await check("path_space_id() survives a malformed path", async () => {
  const r = await db.query(
    `select public.path_space_id('not-a-uuid/file.mp4') as id`,
  );
  if (r.rows[0].id !== null)
    throw new Error("expected null, not an error or a value");
});
await check("path_space_id() reads a real space id", async () => {
  const r = await db.query(`select public.path_space_id($1) as id`, [
    `${spaceId}/clip.webm`,
  ]);
  if (r.rows[0].id !== spaceId) throw new Error("did not parse the folder");
});

await db.close();

console.log(
  failures === 0
    ? "\n\x1b[32mAll checks passed.\x1b[0m\n"
    : `\n\x1b[31m${failures} check${failures === 1 ? "" : "s"} failed.\x1b[0m\n`,
);
process.exit(failures === 0 ? 0 : 1);
