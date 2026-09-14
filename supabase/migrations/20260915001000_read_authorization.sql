begin;

-- PostgREST runs stable reads and table GETs in read-only transactions.
-- Use the same authorization predicates there; reserve row locks for writable commands.
create or replace function public.ghaf_require_session() returns uuid
language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_session uuid;
  writable boolean:=current_setting('transaction_read_only')='off';
begin
  begin v_session:=(auth.jwt()->>'session_id')::uuid;
  exception when others then raise exception using errcode='42501',message='access_unavailable'; end;
  if v_user is null or v_session is null then
    raise exception using errcode='42501',message='access_unavailable'; end if;
  if writable then
    perform 1 from auth.users where id=v_user and deleted_at is null
      and (banned_until is null or banned_until<=clock_timestamp()) for share;
  else
    perform 1 from auth.users where id=v_user and deleted_at is null
      and (banned_until is null or banned_until<=clock_timestamp());
  end if;
  if not found then raise exception using errcode='42501',message='access_unavailable'; end if;
  if writable then
    perform 1 from auth.sessions where id=v_session and user_id=v_user
      and (not_after is null or not_after>clock_timestamp()) for share;
  else
    perform 1 from auth.sessions where id=v_session and user_id=v_user
      and (not_after is null or not_after>clock_timestamp());
  end if;
  if not found then raise exception using errcode='42501',message='access_unavailable'; end if;
  perform set_config('response.headers','[{"Cache-Control":"no-store"}]',true);
  return v_session;
end; $$;

create or replace function public.ghaf_family_actor(p_family_id uuid)
returns table(role text,child_id uuid,member_id uuid,auth_user_id uuid)
language plpgsql security definer set search_path='' as $$
declare v_session uuid; v_member public.app_family_members; v_owner uuid;
begin
  v_session:=public.ghaf_require_session();
  select f.owner_id into v_owner from public.app_families f where f.id=p_family_id and f.active;
  if not found then raise exception using errcode='42501',message='family_unavailable'; end if;
  if current_setting('transaction_read_only')='off' then
    perform 1 from auth.users u join public.pilot_access a on a.user_id=u.id
      where u.id=v_owner and a.status='approved' and u.is_anonymous=false
        and u.email_confirmed_at is not null and u.deleted_at is null
        and (u.banned_until is null or u.banned_until<=clock_timestamp()) for share of u;
  else
    perform 1 from auth.users u join public.pilot_access a on a.user_id=u.id
      where u.id=v_owner and a.status='approved' and u.is_anonymous=false
        and u.email_confirmed_at is not null and u.deleted_at is null
        and (u.banned_until is null or u.banned_until<=clock_timestamp());
  end if;
  if not found then raise exception using errcode='42501',message='family_unavailable'; end if;
  select m.* into v_member from public.app_family_members m
    where m.family_id=p_family_id and m.auth_user_id=auth.uid() and m.active
      and ((m.role='parent' and public.can_access_account_profile())
        or (m.role='child' and m.session_id=v_session and exists(
          select 1 from auth.users u where u.id=auth.uid() and u.is_anonymous=true)))
    order by m.created_at limit 1;
  if not found then raise exception using errcode='42501',message='family_unavailable'; end if;
  if v_member.role='child' and not exists(select 1 from public.app_children c
    where c.id=v_member.child_id and c.family_id=p_family_id and c.active) then
    raise exception using errcode='42501',message='family_unavailable'; end if;
  return query select v_member.role,v_member.child_id,v_member.id,v_member.auth_user_id;
end; $$;

-- Authorization denial is an empty RLS result; infrastructure faults must remain errors.
create or replace function public.ghaf_doc_can_read(f uuid,c uuid,k text)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare a record;
begin
  select * into strict a from public.ghaf_family_actor(f);
  return a.role='parent' or (a.role='child' and c=a.child_id
    and k in ('study_plan','academic_goal','profile_preferences','learning'));
exception when insufficient_privilege then return false;
end; $$;

commit;
