alter table public.links
add column layout text not null default 'classic',
add column thumbnail_path text;

alter table public.links
add constraint links_layout_check
check (layout in ('classic', 'featured'));

alter table public.links
add constraint links_thumbnail_path_check
check (
  thumbnail_path is null
  or (
    char_length(thumbnail_path) <= 512
    and thumbnail_path ~ (
      '^'
      || user_id::text
      || '/'
      || id::text
      || '/thumbnail\.(jpg|jpeg|png|webp)$'
    )
  )
);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'link-thumbnails',
  'link-thumbnails',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy link_thumbnails_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'link-thumbnails');

create policy link_thumbnails_owner_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'link-thumbnails'
  and name ~ (
    '^'
    || (select auth.uid())::text
    || '/[0-9]+/thumbnail\.(jpg|jpeg|png|webp)$'
  )
  and exists (
    select 1
    from public.links
    where links.user_id = (select auth.uid())
      and links.id::text = split_part(name, '/', 2)
  )
);

create policy link_thumbnails_owner_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'link-thumbnails'
  and name ~ (
    '^'
    || (select auth.uid())::text
    || '/[0-9]+/thumbnail\.(jpg|jpeg|png|webp)$'
  )
  and exists (
    select 1
    from public.links
    where links.user_id = (select auth.uid())
      and links.id::text = split_part(name, '/', 2)
  )
)
with check (
  bucket_id = 'link-thumbnails'
  and name ~ (
    '^'
    || (select auth.uid())::text
    || '/[0-9]+/thumbnail\.(jpg|jpeg|png|webp)$'
  )
  and exists (
    select 1
    from public.links
    where links.user_id = (select auth.uid())
      and links.id::text = split_part(name, '/', 2)
  )
);

create policy link_thumbnails_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'link-thumbnails'
  and name ~ (
    '^'
    || (select auth.uid())::text
    || '/[0-9]+/thumbnail\.(jpg|jpeg|png|webp)$'
  )
  and exists (
    select 1
    from public.links
    where links.user_id = (select auth.uid())
      and links.id::text = split_part(name, '/', 2)
  )
);
