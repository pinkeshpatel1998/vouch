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

> These migrations have not yet been executed against a real Postgres. Docker is
> not installed on this machine, so `supabase start` could not verify them. Run
> them early; a syntax error found on day 3 is free and one found on day 20 is not.

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
