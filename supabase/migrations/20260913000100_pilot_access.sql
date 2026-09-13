begin;

create table public.pilot_access (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'pending'
    constraint pilot_access_status_check check (status in ('pending', 'approved', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pilot_access enable row level security;

revoke all on table public.pilot_access from public, anon, authenticated;
grant select on table public.pilot_access to authenticated;
grant select, insert, update, delete on table public.pilot_access to service_role;

create policy pilot_access_read_own
  on public.pilot_access
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create function public.create_pending_pilot_access()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.pilot_access (user_id, status)
  values (new.id, 'pending');
  return new;
end;
$$;

revoke all on function public.create_pending_pilot_access()
  from public, anon, authenticated, service_role;

create trigger create_pending_pilot_access_after_signup
  after insert on auth.users
  for each row execute function public.create_pending_pilot_access();

create function public.update_pilot_access_timestamp()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.clock_timestamp();
  return new;
end;
$$;

revoke all on function public.update_pilot_access_timestamp()
  from public, anon, authenticated, service_role;

create trigger update_pilot_access_timestamp_before_update
  before update on public.pilot_access
  for each row execute function public.update_pilot_access_timestamp();

commit;
