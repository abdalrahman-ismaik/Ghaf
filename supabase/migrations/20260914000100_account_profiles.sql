begin;

create table public.account_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default ''
    constraint account_profiles_name_check check (
      char_length(display_name) <= 80 and display_name = btrim(display_name)
    ),
  preferred_locale text not null default 'ar'
    constraint account_profiles_locale_check check (preferred_locale in ('ar', 'en')),
  revision bigint not null default 0
    constraint account_profiles_revision_check check (revision between 0 and 9007199254740991),
  updated_at timestamptz not null default now(),
  constraint account_profiles_saved_name_check check (revision = 0 or char_length(display_name) > 0)
);

alter table public.account_profiles enable row level security;

revoke all on table public.account_profiles from public, anon, authenticated, service_role;
grant select on table public.account_profiles to authenticated;
grant select, insert, update, delete on table public.account_profiles to service_role;

-- This no-argument predicate exposes only the caller's access decision, never auth.users rows.
create function public.can_access_account_profile()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users as account
    join public.pilot_access as access on access.user_id = account.id
    where account.id = (select auth.uid())
      and account.email_confirmed_at is not null
      and access.status = 'approved'
  );
$$;

revoke all on function public.can_access_account_profile()
  from public, anon, authenticated, service_role;
grant execute on function public.can_access_account_profile() to authenticated;

create policy account_profiles_read_own
  on public.account_profiles
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.can_access_account_profile())
  );

create function public.get_or_create_account_profile()
returns setof public.account_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
begin
  if owner_id is null or not public.can_access_account_profile() then
    raise exception using errcode = '42501', message = 'access_unavailable';
  end if;

  insert into public.account_profiles (user_id)
  values (owner_id)
  on conflict (user_id) do nothing;

  return query select profile.* from public.account_profiles as profile
  where profile.user_id = owner_id;
end;
$$;

create function public.save_account_profile(
  p_display_name text,
  p_preferred_locale text,
  p_expected_revision bigint
)
returns setof public.account_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  clean_name text := pg_catalog.btrim(p_display_name);
begin
  if owner_id is null or not public.can_access_account_profile() then
    raise exception using errcode = '42501', message = 'access_unavailable';
  end if;
  if clean_name is null or pg_catalog.char_length(clean_name) not between 1 and 80
    or p_preferred_locale is null or p_preferred_locale not in ('ar', 'en')
    or p_expected_revision is null or p_expected_revision not between 0 and 9007199254740990 then
    raise exception using errcode = 'PT400', message = 'invalid_profile';
  end if;

  return query update public.account_profiles as profile
  set display_name = clean_name,
      preferred_locale = p_preferred_locale,
      revision = profile.revision + 1,
      updated_at = pg_catalog.clock_timestamp()
  where profile.user_id = owner_id and profile.revision = p_expected_revision
  returning profile.*;

  if not found then
    raise exception using errcode = 'PT409', message = 'profile_conflict';
  end if;
end;
$$;

revoke all on function public.get_or_create_account_profile()
  from public, anon, authenticated, service_role;
revoke all on function public.save_account_profile(text, text, bigint)
  from public, anon, authenticated, service_role;
grant execute on function public.get_or_create_account_profile() to authenticated;
grant execute on function public.save_account_profile(text, text, bigint) to authenticated;

commit;
