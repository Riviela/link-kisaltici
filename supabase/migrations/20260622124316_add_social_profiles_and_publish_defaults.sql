alter table public.profiles
  add column instagram_handle text,
  add column tiktok_handle text,
  add column youtube_handle text;

update public.profiles
set is_published = true
where is_published = false;

alter table public.profiles
  alter column is_published set default true,
  add constraint profiles_instagram_handle_format check (
    instagram_handle is null
    or instagram_handle ~ '^[A-Za-z0-9._]{1,30}$'
  ),
  add constraint profiles_tiktok_handle_format check (
    tiktok_handle is null
    or tiktok_handle ~ '^[A-Za-z0-9._]{2,24}$'
  ),
  add constraint profiles_youtube_handle_format check (
    youtube_handle is null
    or youtube_handle ~ '^[A-Za-z0-9._-]{3,30}$'
  );
