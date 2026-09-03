-- ============================================================
-- Vouch 0003: storage buckets and policies
--
-- Three buckets, all public-read, because everything in them is destined for
-- a public wall anyway and signed URLs would break edge caching on the embed.
-- Writes are where the rules live.
--
-- Path convention everywhere: {space_id}/{uuid}.{ext}
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('space-assets', 'space-assets', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('testimonial-videos', 'testimonial-videos', true, 62914560,
    array['video/webm', 'video/mp4', 'video/quicktime']),
  ('testimonial-images', 'testimonial-images', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies get a raw path, so the first segment may be anything at
-- all. Casting it straight to uuid would raise instead of denying, and an
-- error in a policy is a worse failure than a refusal -- so both helpers take
-- text and parse defensively.
create or replace function public.path_space_id(p_name text)
returns uuid
language plpgsql
immutable
as $$
declare
  v_first text := (storage.foldername(p_name))[1];
begin
  if v_first is null then
    return null;
  end if;
  return v_first::uuid;
exception when others then
  return null;
end;
$$;

-- Anonymous submitters need to know a space id is real before uploading into
-- its folder, but they have no read access to public.spaces. This is the
-- narrowest possible window onto it: one boolean.
create or replace function public.space_exists(p_space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p_space_id is not null
     and exists (select 1 from public.spaces where id = p_space_id);
$$;

grant execute on function public.space_exists(uuid) to anon, authenticated;
grant execute on function public.path_space_id(text) to anon, authenticated;

-- ---------- public read ----------
create policy "vouch objects are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id in ('space-assets', 'testimonial-videos', 'testimonial-images'));

-- ---------- space assets: owner only ----------
-- MediaRecorder output on Safari is quicktime-flavoured mp4; the bucket mime
-- list above accepts it rather than transcoding. See section 8 of the PRD.
create policy "owners write their own space assets"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'space-assets'
    and public.owns_space(public.path_space_id(name))
  );

create policy "owners replace their own space assets"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'space-assets'
    and public.owns_space(public.path_space_id(name))
  );

create policy "owners delete their own space assets"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'space-assets'
    and public.owns_space(public.path_space_id(name))
  );

-- ---------- testimonial media: anyone may add, nobody anonymous may change ----------
-- Uploads land before the row exists, so the only thing we can check at write
-- time is that the folder is a real space. Deliberately no anon update or
-- delete policy: a submitter can add a file, never touch someone else's.
create policy "submitters upload testimonial video"
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'testimonial-videos'
    and public.space_exists(public.path_space_id(name))
  );

create policy "submitters upload testimonial images"
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'testimonial-images'
    and public.space_exists(public.path_space_id(name))
  );

create policy "owners delete testimonial media"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('testimonial-videos', 'testimonial-images')
    and public.owns_space(public.path_space_id(name))
  );

-- KNOWN GAP: an anonymous caller who knows a space id can upload files up to
-- the bucket limit without ever creating a testimonial, and the 500-row cap in
-- submit_testimonial() does not stop that. Acceptable for the competition
-- build. The real fix is a server-issued signed upload URL, which is a week 4
-- item only if it becomes a problem.
