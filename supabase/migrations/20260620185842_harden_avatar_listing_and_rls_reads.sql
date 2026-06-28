drop policy avatars_public_read on storage.objects;

drop policy profiles_public_read on public.profiles;
drop policy profiles_owner_read on public.profiles;

create policy profiles_anon_read
on public.profiles
for select
to anon
using (is_published = true);

create policy profiles_authenticated_read
on public.profiles
for select
to authenticated
using (
  is_published = true
  or (select auth.uid()) = id
);

drop policy links_public_read on public.links;
drop policy links_owner_read on public.links;

create policy links_anon_read
on public.links
for select
to anon
using (
  is_active = true
  and exists (
    select 1
    from public.profiles as profile
    where profile.id = links.user_id
      and profile.is_published = true
  )
);

create policy links_authenticated_read
on public.links
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or (
    is_active = true
    and exists (
      select 1
      from public.profiles as profile
      where profile.id = links.user_id
        and profile.is_published = true
    )
  )
);
