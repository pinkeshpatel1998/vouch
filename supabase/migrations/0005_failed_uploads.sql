-- ============================================================
-- Vouch 0005: represent a video whose upload never finished
--
-- The submitter completed the form but the file did not land -- a dropped
-- connection mid-upload. The row is worth keeping: it carries the author's
-- details, so the owner can see who to chase and send a re-record link.
-- A video row with a null video_url is that state.
-- ============================================================

alter table public.testimonials
  drop constraint if exists testimonials_payload_present;

alter table public.testimonials
  add constraint testimonials_payload_present check (
    (type = 'text' and body is not null and char_length(btrim(body)) > 0)
    or type = 'video'
  );

-- An unfinished upload must never reach a wall, whatever its status says.
create or replace function public.guard_incomplete_video()
returns trigger
language plpgsql
as $$
begin
  if new.type = 'video' and new.video_url is null and new.status = 'approved' then
    raise exception 'A video testimonial cannot be approved before its upload completes'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger testimonials_guard_incomplete_video
  before insert or update on public.testimonials
  for each row execute function public.guard_incomplete_video();
