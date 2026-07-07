alter table public.profiles
  add column social_links jsonb not null default '[]'::jsonb,
  add column social_links_position text not null default 'top';

alter table public.profiles
  add constraint profiles_social_links_is_array
  check (jsonb_typeof(social_links) = 'array'),
  add constraint profiles_social_links_position_check
  check (social_links_position in ('top', 'bottom'));

update public.profiles
set social_links = (
  select coalesce(jsonb_agg(item), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'platform', 'instagram',
      'value', instagram_handle,
      'url', 'https://instagram.com/' || instagram_handle
    ) as item
    where instagram_handle is not null
    union all
    select jsonb_build_object(
      'platform', 'tiktok',
      'value', tiktok_handle,
      'url', 'https://tiktok.com/@' || tiktok_handle
    )
    where tiktok_handle is not null
    union all
    select jsonb_build_object(
      'platform', 'youtube',
      'value', youtube_handle,
      'url', 'https://youtube.com/@' || youtube_handle
    )
    where youtube_handle is not null
  ) as existing_social_links
)
where social_links = '[]'::jsonb
  and (
    instagram_handle is not null
    or tiktok_handle is not null
    or youtube_handle is not null
  );
