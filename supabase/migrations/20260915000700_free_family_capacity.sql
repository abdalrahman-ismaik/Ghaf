begin;

-- Feature007 permits two free Child profiles; no demo Plus entitlement is imported.
-- Existing profiles are retained. Only a new profile is checked under the family lock.
create function public.ghaf_enforce_free_child_capacity() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  perform 1 from public.app_families where id=new.family_id for update;
  if (select count(*) from public.app_children where family_id=new.family_id)>=2 then
    raise exception using errcode='PT400', message='capacity_reached';
  end if;
  return new;
end;
$$;
revoke all on function public.ghaf_enforce_free_child_capacity() from public,anon,authenticated;
create trigger app_free_child_capacity before insert on public.app_children
  for each row execute function public.ghaf_enforce_free_child_capacity();

commit;
