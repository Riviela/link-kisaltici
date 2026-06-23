alter table public.links
add column if not exists thumbnail_updated_at timestamptz;

update public.links
set thumbnail_updated_at = updated_at
where thumbnail_path is not null
  and thumbnail_updated_at is null;
