-- Card appearance is independent from wall layout and motion.
alter table public.walls
  add column card_style text not null default 'classic'
    check (card_style in ('classic', 'portrait', 'glass', 'bold', 'bubble', 'editorial'));

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
      'carousel_style', w.carousel_style,
      'card_style', w.card_style,
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
