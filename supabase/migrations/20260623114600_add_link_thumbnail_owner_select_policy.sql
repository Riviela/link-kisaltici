create policy link_thumbnails_owner_select
on storage.objects
for select
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
