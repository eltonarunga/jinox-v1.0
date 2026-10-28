-- JinoX AI profiles, access levels and admin governance.
-- Apply after the clinical workspace migrations. Never grant admin based on signup metadata.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default '',
  avatar_url text,
  institution text not null default '',
  country text not null default 'Kenya',
  role text not null default 'member'
    check (role in ('member', 'researcher', 'clinician', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role_created on public.profiles(role, created_at desc);
alter table public.profiles enable row level security;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = (select auth.uid()) limit 1;
$$;

revoke all on function public.current_profile_role() from public;
grant execute on function public.current_profile_role() to authenticated;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = case when public.profiles.display_name = '' then excluded.display_name else public.profiles.display_name end,
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert or update on auth.users
  for each row execute function public.handle_new_user_profile();

-- Backfill accounts that existed before this migration.
insert into public.profiles (id, email, display_name, avatar_url)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do update set email = excluded.email;

create or replace function public.protect_profile_role_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and coalesce(public.current_profile_role(), '') <> 'admin' then
    raise exception 'Only an administrator can change user access levels';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists protect_profile_role_changes on public.profiles;
create trigger protect_profile_role_changes
  before update on public.profiles
  for each row execute function public.protect_profile_role_changes();

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "admins can read all profiles" on public.profiles;
create policy "admins can read all profiles" on public.profiles
  for select to authenticated using ((select public.current_profile_role()) = 'admin');

drop policy if exists "users can update own profile fields" on public.profiles;
create policy "users can update own profile fields" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "admins can update profiles" on public.profiles;
create policy "admins can update profiles" on public.profiles
  for update to authenticated
  using ((select public.current_profile_role()) = 'admin')
  with check ((select public.current_profile_role()) = 'admin');

revoke all on public.profiles from anon;
grant select on public.profiles to authenticated;
grant update (display_name, institution, country, avatar_url) on public.profiles to authenticated;
grant update (role) on public.profiles to authenticated;
