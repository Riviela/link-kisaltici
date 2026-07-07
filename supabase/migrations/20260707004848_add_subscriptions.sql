create table public.subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  plan_type text not null default 'free',
  status text not null default 'active',
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_plan_type_check
    check (plan_type in ('free', 'starter', 'pro', 'premium')),
  constraint subscriptions_status_check
    check (status in ('active', 'cancelled', 'past_due')),
  constraint subscriptions_source_check
    check (source in ('manual', 'lemon_squeezy'))
);

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

insert into public.subscriptions (user_id, plan_type, status, source)
select profile.id, 'free', 'active', 'manual'
from public.profiles as profile
where not exists (
  select 1
  from public.subscriptions as subscription
  where subscription.user_id = profile.id
);

create function public.create_default_subscription()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.subscriptions (user_id, plan_type, status, source)
  values (new.id, 'free', 'active', 'manual')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.create_default_subscription() from public;
revoke execute on function public.create_default_subscription() from anon, authenticated;

create trigger profiles_create_default_subscription
after insert on public.profiles
for each row
execute function public.create_default_subscription();

alter table public.subscriptions enable row level security;

create policy subscriptions_owner_read
on public.subscriptions
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.subscriptions from anon, authenticated;
grant select on table public.subscriptions to authenticated;
