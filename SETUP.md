# Setup

Everything here needs your own credentials, so it is not something the repo can
do for itself.

## 1. Supabase project

Create a project, then **SQL Editor** → run the three migrations in order:

```
supabase/migrations/0001_schema.sql
supabase/migrations/0002_rls.sql
supabase/migrations/0003_storage.sql
```

If `0003` is rejected when creating policies on `storage.objects`, run that file
from the dashboard SQL editor rather than the CLI — the editor runs as a role
that owns the storage schema.

> Before you paste anything, run `npm run db:check`. It applies all five
> migrations to a real Postgres 18 (PGlite, in-process — no Docker), stubs the
> `auth` and `storage` schemas Supabase provides, and then exercises the
> constraints, the four public RPCs and the RLS policies from both an owner's
> and an anonymous session. 26 checks, about two seconds. If that is green the
> SQL editor will be too.

## 2. Google OAuth

1. Google Cloud Console → **APIs & Services → Credentials → OAuth client ID**,
   type *Web application*.
2. Authorised redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Supabase → **Authentication → Providers → Google**: paste the client ID and
   secret, enable it.
4. Supabase → **Authentication → URL Configuration**: add `http://localhost:3000`
   and later the Vercel origin to redirect URLs.

## 3. Environment

```bash
cp .env.example .env.local
```

Setting these two variables is the entire switch. `lib/data/index.ts` picks the
Supabase implementation over the local one at import time, `putBlob` starts
uploading to Storage instead of IndexedDB, and `/app` starts requiring a
Google sign-in. No code changes.

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
**Project Settings → Data API**, then restart the dev server.

Until this is done, `/` and `/styleguide` work normally and `/app` redirects to
`/sign-in`, which explains what is missing.

## 4. Check it

Sign in with Google at `/sign-in`. You should land on `/app` with your name and
avatar and an empty state. Then confirm the trigger fired:

```sql
select id, email, name from public.users;
```

One row, matching your Google account. If it is empty, the `on_auth_user_created`
trigger did not run and nothing downstream will work.
