-- ============================================================
-- Vouch 0002: row-level security
--
-- Shape of the thing: authenticated owners talk to tables directly and see
-- only their own rows. Anonymous visitors get NO table access at all -- the
-- entire public surface is four security-definer functions. That keeps the
-- unauthenticated attack surface to a list you can read in one sitting.
-- ============================================================

alter table public.users        enable row level security;
alter table public.spaces       enable row level security;
alter table public.testimonials enable row level security;
alter table public.walls        enable row level security;
alter table public.wall_views   enable row level security;

-- Ownership test, hoisted so the policies stay readable. Security definer so
-- the lookup is not itself filtered by the policy being evaluated.
create or replace function public.owns_space(p_space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.spaces s
    where s.id = p_space_id and s.user_id = auth.uid()
  );
$$;

-- ---------- users ----------
create policy users_select_self on public.users
  for select to authenticated using (id = auth.uid());

create policy users_update_self on public.users
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ---------- spaces ----------
create policy spaces_select_own on public.spaces
  for select to authenticated using (user_id = auth.uid());

create policy spaces_insert_own on public.spaces
  for insert to authenticated with check (user_id = auth.uid());

create policy spaces_update_own on public.spaces
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy spaces_delete_own on public.spaces
  for delete to authenticated using (user_id = auth.uid());

-- ---------- testimonials ----------
-- Owners see every status, which is the whole point of the inbox.
create policy testimonials_select_own on public.testimonials
  for select to authenticated using (public.owns_space(space_id));

create policy testimonials_update_own on public.testimonials
  for update to authenticated
  using (public.owns_space(space_id)) with check (public.owns_space(space_id));

create policy testimonials_delete_own on public.testimonials
  for delete to authenticated using (public.owns_space(space_id));

-- Deliberately no INSERT policy. Submissions arrive through
-- submit_testimonial() so status and consent cannot be forged, and owners have
-- no reason to hand-write a testimonial.

-- ---------- walls ----------
create policy walls_select_own on public.walls
  for select to authenticated using (public.owns_space(space_id));

create policy walls_insert_own on public.walls
  for insert to authenticated with check (public.owns_space(space_id));

create policy walls_update_own on public.walls
  for update to authenticated
  using (public.owns_space(space_id)) with check (public.owns_space(space_id));

create policy walls_delete_own on public.walls
  for delete to authenticated using (public.owns_space(space_id));

-- ---------- wall_views ----------
create policy wall_views_select_own on public.wall_views
  for select to authenticated
  using (exists (
    select 1 from public.walls w
    where w.id = wall_views.wall_id and public.owns_space(w.space_id)
  ));

-- ============================================================
-- The public surface. Four functions, no table access.
-- ============================================================

-- 1. The collection page reads its space by slug.
create or replace function public.collection_space(p_slug text)
returns table (
  id uuid, slug text, name text, logo_url text, accent_color text,
  prompt_question text, thankyou_message text,
  allow_text boolean, allow_video boolean,
  require_photo boolean, show_ratings boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select s.id, s.slug, s.name, s.logo_url, s.accent_color,
         s.prompt_question, s.thankyou_message,
         s.allow_text, s.allow_video, s.require_photo, s.show_ratings
  from public.spaces s
  where s.slug = p_slug;
$$;

-- 2. A submitter posts one testimonial. Status is forced, consent is required,
--    and a disabled path is refused server-side rather than only in the UI.
create or replace function public.submit_testimonial(
  p_slug              text,
  p_type              text,
  p_author_name       text,
  p_consent           boolean,
  p_body              text default null,
  p_rating            smallint default null,
  p_video_url         text default null,
  p_video_duration    smallint default null,
  p_poster_url        text default null,
  p_author_role       text default null,
  p_author_company    text default null,
  p_author_avatar_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_space public.spaces%rowtype;
  v_count bigint;
  v_id    uuid;
begin
  if not coalesce(p_consent, false) then
    raise exception 'Consent is required' using errcode = 'check_violation';
  end if;

  select * into v_space from public.spaces where slug = p_slug;
  if not found then
    raise exception 'No such space' using errcode = 'no_data_found';
  end if;

  if p_type = 'text' and not v_space.allow_text then
    raise exception 'This space is not accepting written testimonials'
      using errcode = 'check_violation';
  end if;

  if p_type = 'video' and not v_space.allow_video then
    raise exception 'This space is not accepting video testimonials'
      using errcode = 'check_violation';
  end if;

  if v_space.require_photo and p_author_avatar_url is null then
    raise exception 'A photo is required for this space' using errcode = 'check_violation';
  end if;

  -- Blunt abuse cap. Section 13 asks for a per-space limit on the demo.
  select count(*) into v_count from public.testimonials where space_id = v_space.id;
  if v_count >= 500 then
    raise exception 'This space is not accepting more submissions'
      using errcode = 'check_violation';
  end if;

  insert into public.testimonials (
    space_id, type, body, rating,
    video_url, video_duration_seconds, poster_url,
    author_name, author_role, author_company, author_avatar_url,
    status, consent_given
  ) values (
    v_space.id, p_type, nullif(btrim(p_body), ''), p_rating,
    p_video_url, p_video_duration, p_poster_url,
    btrim(p_author_name), nullif(btrim(p_author_role), ''),
    nullif(btrim(p_author_company), ''), p_author_avatar_url,
    'pending', true
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- 3. The embed endpoint. One round trip: config plus approved rows only.
create or replace function public.wall_payload(p_wall_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  w public.walls%rowtype;
  s public.spaces%rowtype;
  v_ratings boolean;
  v_items   jsonb;
begin
  select * into w from public.walls where id = p_wall_id;
  if not found then
    return null;
  end if;

  select * into s from public.spaces where id = w.space_id;

  -- The space-level toggle is a master switch over the wall-level one.
  v_ratings := w.show_ratings and s.show_ratings;

  select coalesce(jsonb_agg(item order by submitted_at desc), '[]'::jsonb)
    into v_items
  from (
    select t.submitted_at,
           jsonb_build_object(
             'id', t.id,
             'type', t.type,
             'body', t.body,
             'rating', case when v_ratings then t.rating end,
             'video_url', t.video_url,
             'video_duration_seconds', t.video_duration_seconds,
             'poster_url', t.poster_url,
             'author_name', t.author_name,
             'author_role', t.author_role,
             'author_company', t.author_company,
             'author_avatar_url', t.author_avatar_url
           ) as item
    from public.testimonials t
    where t.space_id = s.id
      and t.status = 'approved'
      and (w.include_video or t.type = 'text')
    order by t.submitted_at desc
    limit w.max_items
  ) picked;

  return jsonb_build_object(
    'wall', jsonb_build_object(
      'id', w.id,
      'layout', w.layout,
      'theme', w.theme,
      'accent_color', coalesce(w.accent_color, s.accent_color),
      'show_ratings', v_ratings,
      'include_video', w.include_video
    ),
    'space', jsonb_build_object('name', s.name, 'logo_url', s.logo_url),
    'testimonials', v_items
  );
end;
$$;

-- 4. One raw view count, nothing else.
create or replace function public.record_wall_view(
  p_wall_id uuid,
  p_referrer_domain text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.wall_views (wall_id, referrer_domain)
  select p_wall_id, left(p_referrer_domain, 253)
  where exists (select 1 from public.walls where id = p_wall_id);
end;
$$;

-- ============================================================
-- Grants. Anonymous callers reach the four functions and nothing else.
-- ============================================================

revoke all on public.users, public.spaces, public.testimonials,
                public.walls, public.wall_views
  from anon;

-- owns_space() is called from inside the policies above, and policy
-- expressions are evaluated with the caller's privileges -- so
-- authenticated must keep EXECUTE or every owner query fails.
revoke all on function public.owns_space(uuid) from anon;
revoke all on function public.handle_new_user() from anon;

grant execute on function public.collection_space(text) to anon, authenticated;
grant execute on function public.submit_testimonial(
  text, text, text, boolean, text, smallint, text, smallint, text, text, text, text
) to anon, authenticated;
grant execute on function public.wall_payload(uuid) to anon, authenticated;
grant execute on function public.record_wall_view(uuid, text) to anon, authenticated;
