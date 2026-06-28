create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null,
  bio text,
  avatar_path text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_unique unique (username),
  constraint profiles_username_lowercase check (username = lower(username)),
  constraint profiles_username_length check (char_length(username) between 3 and 30),
  constraint profiles_username_format check (username ~ '^[a-z0-9][a-z0-9_]{2,29}$'),
  constraint profiles_username_reserved check (
    username not in (
      'login',
      'register',
      'onboarding',
      'dashboard',
      'settings',
      'api',
      'auth',
      'logout',
      'admin'
    )
  ),
  constraint profiles_display_name_length check (
    char_length(display_name) <= 80
    and display_name ~ '[^[:space:]]'
  ),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 280),
  constraint profiles_avatar_path check (
    avatar_path is null
    or (
      char_length(avatar_path) <= 512
      and avatar_path ~ ('^' || id::text || '/avatar\.(jpg|jpeg|png|webp)$')
    )
  )
);

create table public.links (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  url text not null,
  is_active boolean not null default true,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint links_title_length check (
    char_length(title) <= 120
    and title ~ '[^[:space:]]'
  ),
  constraint links_url_length check (char_length(url) between 1 and 2048),
  constraint links_url_no_whitespace_or_control check (
    url !~ '[[:space:][:cntrl:]]'
  ),
  constraint links_url_protocol check (
    url ~* '^(https?://[^/[:space:][:cntrl:]][^[:space:][:cntrl:]]*|mailto:[^[:space:][:cntrl:]]+|tel:[^[:space:][:cntrl:]]+)$'
  ),
  constraint links_position_nonnegative check (position >= 0),
  constraint links_user_id_position_unique
    unique (user_id, position)
    deferrable initially immediate
);

create index links_public_profile_position_idx
  on public.links (user_id, position)
  where is_active = true;

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.statement_timestamp();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger links_set_updated_at
before update on public.links
for each row
execute function public.set_updated_at();

create function public.guard_link_position_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.position is distinct from old.position
    and coalesce(
      pg_catalog.current_setting('app.reorder_links_position_update', true),
      'off'
    ) <> 'on'
  then
    raise exception 'Link positions can only be changed through reorder_links.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger links_guard_position_update
before update on public.links
for each row
execute function public.guard_link_position_update();

create function public.assign_link_position()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Authentication is required to create a link.'
      using errcode = '42501';
  end if;

  if new.user_id is distinct from current_user_id then
    raise exception 'Links can only be created for the authenticated user.'
      using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(current_user_id::text, 0)
  );

  select coalesce(max(link_row.position), -1) + 1
  into new.position
  from public.links as link_row
  where link_row.user_id = current_user_id;

  return new;
end;
$$;

create trigger links_assign_position
before insert on public.links
for each row
execute function public.assign_link_position();

alter table public.profiles enable row level security;
alter table public.links enable row level security;

create policy profiles_public_read
on public.profiles
for select
to anon, authenticated
using (is_published = true);

create policy profiles_owner_read
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_owner_insert
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy profiles_owner_update
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy profiles_owner_delete
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = id);

create policy links_public_read
on public.links
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.profiles as profile
    where profile.id = links.user_id
      and profile.is_published = true
  )
);

create policy links_owner_read
on public.links
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy links_owner_insert
on public.links
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy links_owner_update
on public.links
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy links_owner_delete
on public.links
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated;
grant select on table public.profiles, public.links to anon, authenticated;
grant insert, update, delete on table public.profiles, public.links to authenticated;
grant usage, select on sequence public.links_id_seq to authenticated;

create function public.reorder_links(p_link_ids bigint[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  submitted_count integer;
  distinct_count integer;
  existing_count integer;
  matching_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to reorder links.'
      using errcode = '42501';
  end if;

  if p_link_ids is null then
    raise exception 'The complete link ID list is required.'
      using errcode = '22004';
  end if;

  submitted_count := pg_catalog.cardinality(p_link_ids);

  if exists (
    select 1
    from pg_catalog.unnest(p_link_ids) as submitted(link_id)
    where submitted.link_id is null
  ) then
    raise exception 'Link IDs cannot contain null values.'
      using errcode = '22004';
  end if;

  select count(distinct submitted.link_id)
  into distinct_count
  from pg_catalog.unnest(p_link_ids) as submitted(link_id);

  if distinct_count <> submitted_count then
    raise exception 'Link IDs cannot contain duplicate values.'
      using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(current_user_id::text, 0)
  );

  set constraints public.links_user_id_position_unique deferred;

  perform 1
  from public.links as owned_link
  where owned_link.user_id = current_user_id
  for update;

  select count(*)
  into existing_count
  from public.links as owned_link
  where owned_link.user_id = current_user_id;

  if submitted_count <> existing_count then
    raise exception 'The submitted list must contain every current link exactly once.'
      using errcode = '22023';
  end if;

  select count(*)
  into matching_count
  from public.links as owned_link
  where owned_link.user_id = current_user_id
    and owned_link.id = any (p_link_ids);

  if matching_count <> submitted_count then
    raise exception 'The submitted list contains a missing or foreign-owned link ID.'
      using errcode = '42501';
  end if;

  perform pg_catalog.set_config(
    'app.reorder_links_position_update',
    'on',
    true
  );

  update public.links as owned_link
  set position = submitted.ordinality - 1
  from pg_catalog.unnest(p_link_ids) with ordinality as submitted(link_id, ordinality)
  where owned_link.id = submitted.link_id
    and owned_link.user_id = current_user_id;

  set constraints public.links_user_id_position_unique immediate;

  perform pg_catalog.set_config(
    'app.reorder_links_position_update',
    'off',
    true
  );
end;
$$;

revoke execute on function public.reorder_links(bigint[]) from public;
revoke execute on function public.reorder_links(bigint[]) from anon;
grant execute on function public.reorder_links(bigint[]) to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
);

create policy avatars_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'avatars');

create policy avatars_owner_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and name ~ (
    '^' || (select auth.uid())::text || '/avatar\.(jpg|jpeg|png|webp)$'
  )
);

create policy avatars_owner_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and name ~ (
    '^' || (select auth.uid())::text || '/avatar\.(jpg|jpeg|png|webp)$'
  )
)
with check (
  bucket_id = 'avatars'
  and name ~ (
    '^' || (select auth.uid())::text || '/avatar\.(jpg|jpeg|png|webp)$'
  )
);

create policy avatars_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and name ~ (
    '^' || (select auth.uid())::text || '/avatar\.(jpg|jpeg|png|webp)$'
  )
);

-- RLS summary: visitors see published profiles and their active links; owners manage only their own rows and avatar.
-- pgTAP note: constraint, RLS, Storage, rollback, and concurrency tests belong in a later supabase/tests suite.
