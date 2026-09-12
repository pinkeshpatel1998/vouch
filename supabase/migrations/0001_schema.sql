-- ============================================================
-- Vouch 0001: schema
-- ============================================================

-- No extensions required: gen_random_uuid() is core from Postgres 13 onward.

-- ---------- users ----------
-- Mirrors auth.users so spaces can carry a real foreign key and the
-- dashboard can read a profile without touching the auth schema.
create table public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text        not null,
  name        text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- spaces ----------
create table public.spaces (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users (id) on delete cascade,

  slug             text not null unique
                     check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$'),
  name             text not null check (char_length(name) between 1 and 80),
  logo_url         text,
  accent_color     text not null default '#9184d9'
                     check (char_length(accent_color) <= 64),

  prompt_question  text not null default 'What did we help you achieve?'
                     check (char_length(prompt_question) between 1 and 200),
  thankyou_message text not null default 'Thank you — that genuinely helps.'
                     check (char_length(thankyou_message) <= 400),

  allow_text       boolean not null default true,
  allow_video      boolean not null default true,
  require_photo    boolean not null default false,
  show_ratings     boolean not null default true,

  created_at       timestamptz not null default now(),

  -- A space with neither path is a dead end for every submitter.
  constraint spaces_one_path_open check (allow_text or allow_video)
);

create index spaces_user_id_idx on public.spaces (user_id, created_at desc);

-- ---------- testimonials ----------
create table public.testimonials (
  id                     uuid primary key default gen_random_uuid(),
  space_id               uuid not null references public.spaces (id) on delete cascade,

  type                   text not null check (type in ('text', 'video')),
  body                   text check (char_length(body) <= 2000),
  rating                 smallint check (rating between 1 and 5),

  video_url              text,
  video_duration_seconds smallint check (video_duration_seconds between 1 and 90),
  poster_url             text,

  author_name            text not null check (char_length(author_name) between 1 and 80),
  author_role            text check (char_length(author_role) <= 80),
  author_company         text check (char_length(author_company) <= 80),
  author_avatar_url      text,

  status                 text not null default 'pending'
                           check (status in ('pending', 'approved', 'rejected')),
  consent_given          boolean not null default false,

  submitted_at           timestamptz not null default now(),
  approved_at            timestamptz,

  -- Nothing goes public without consent, enforced in the database and not
  -- only in the form.
  constraint testimonials_consent_required check (consent_given),

  -- A text testimonial needs words; a video one needs a file.
  constraint testimonials_payload_present check (
    (type = 'text'  and body is not null and char_length(btrim(body)) > 0)
    or
    (type = 'video' and video_url is not null)
  ),

  constraint testimonials_approved_at_set check (
    (status = 'approved') = (approved_at is not null)
  )
);

-- The inbox reads by space + status; the wall reads approved, newest first.
create index testimonials_space_status_idx
  on public.testimonials (space_id, status, submitted_at desc);

-- Keep approved_at honest without making callers remember it.
create or replace function public.sync_approved_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' and new.approved_at is null then
    new.approved_at := now();
  elsif new.status <> 'approved' then
    new.approved_at := null;
  end if;
  return new;
end;
$$;

create trigger testimonials_sync_approved_at
  before insert or update on public.testimonials
  for each row execute function public.sync_approved_at();

-- ---------- walls ----------
create table public.walls (
  id            uuid primary key default gen_random_uuid(),
  space_id      uuid not null references public.spaces (id) on delete cascade,

  layout        text not null default 'masonry'
                  check (layout in ('masonry', 'carousel', 'single')),
  theme         text not null default 'auto'
                  check (theme in ('light', 'dark', 'auto')),
  accent_color  text check (char_length(accent_color) <= 64),

  max_items     smallint not null default 12 check (max_items between 1 and 60),
  show_ratings  boolean not null default true,
  include_video boolean not null default true,

  created_at    timestamptz not null default now()
);

create index walls_space_id_idx on public.walls (space_id, created_at desc);

-- ---------- wall_views ----------
-- Raw view count only. Section 3 rules out analytics beyond this.
create table public.wall_views (
  id               bigserial primary key,
  wall_id          uuid not null references public.walls (id) on delete cascade,
  referrer_domain  text check (char_length(referrer_domain) <= 253),
  viewed_at        timestamptz not null default now()
);

create index wall_views_wall_id_idx on public.wall_views (wall_id, viewed_at desc);
