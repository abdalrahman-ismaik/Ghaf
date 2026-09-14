begin;

-- Read current provider status even when the caller retains an unexpired access JWT.
create or replace function public.can_access_account_profile()
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
      and account.deleted_at is null
      and (account.banned_until is null or account.banned_until <= pg_catalog.now())
      and account.is_anonymous is false
      and access.status = 'approved'
  );
$$;

revoke all on function public.can_access_account_profile()
  from public, anon, authenticated, service_role;
grant execute on function public.can_access_account_profile() to authenticated;

commit;
