-- Feature017 upgrade: preserve Parent threads and history; require explicit peer permission.
begin;

alter table fm_private.threads
  add column kind text not null default 'parent_child',
  add column peer_child_id uuid,
  add column peer_enabled boolean not null default false,
  add constraint threads_kind_membership check (
    (kind = 'parent_child' and peer_child_id is null and not peer_enabled) or
    (kind = 'child_child' and peer_child_id is not null and child_id < peer_child_id)
  ),
  add constraint threads_peer_household foreign key (peer_child_id, parent_id)
    references fm_private.children(id, parent_id);
alter table fm_private.threads drop constraint threads_child_id_key;
create unique index threads_parent_child on fm_private.threads(child_id) where kind = 'parent_child';
create unique index threads_peer_pair on fm_private.threads(child_id, peer_child_id) where kind = 'child_child';

create function fm_private.child_enrolled(p_child uuid) returns boolean
language sql set search_path = '' as $$
  select exists (
    select 1 from fm_private.devices d
    join auth.users u on u.id = d.provider_user_id and u.deleted_at is null
      and (u.banned_until is null or u.banned_until <= clock_timestamp())
    join auth.sessions s on s.id = d.provider_session_id and s.user_id = u.id
      and (s.not_after is null or s.not_after > clock_timestamp())
    where d.child_id = p_child and d.active
  );
$$;

create or replace function fm_private.authorize_thread(p_device fm_private.devices, p_thread uuid)
returns fm_private.threads language plpgsql set search_path = '' as $$
declare v_thread fm_private.threads;
begin
  select t.* into v_thread from fm_private.threads t
    join fm_private.children c on c.id = t.child_id and c.parent_id = t.parent_id and c.active
    left join fm_private.children peer on peer.id = t.peer_child_id and peer.parent_id = t.parent_id
    where t.id = p_thread and t.parent_id = p_device.parent_id and (
      (t.kind = 'parent_child' and (p_device.child_id is null or t.child_id = p_device.child_id)) or
      (t.kind = 'child_child' and t.peer_enabled and peer.active and
        p_device.child_id in (t.child_id, t.peer_child_id))
    );
  if not found then perform fm_private.deny('not_authorized'); end if;
  return v_thread;
end;
$$;

create or replace function public.fm_children() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_device fm_private.devices;
begin
  v_device := fm_private.device();
  if v_device.child_id is not null then return fm_private.failure('not_authorized'); end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'displayName', c.display_name,
    'ageBand', c.age_band, 'threadId', t.id, 'active', c.active) order by c.id), '[]'::jsonb)
    from fm_private.children c join fm_private.threads t on t.child_id = c.id and t.kind = 'parent_child'
    where c.parent_id = v_device.parent_id);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create or replace function public.fm_threads() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_device fm_private.devices;
begin
  v_device := fm_private.device();
  return (select coalesce(jsonb_agg(jsonb_build_object('id', t.id, 'kind', t.kind,
    'childId', case when t.kind = 'child_child' and v_device.child_id = t.child_id then peer.id else c.id end,
    'otherName', case when t.kind = 'child_child' then
      case when v_device.child_id = t.child_id then peer.display_name else c.display_name end
      when v_device.child_id is null then c.display_name else p.display_name end,
    'otherRole', case when t.kind = 'parent_child' and v_device.child_id is not null then 'parent' else 'child' end)
    order by t.kind desc, t.id), '[]'::jsonb)
    from fm_private.threads t
    join fm_private.children c on c.id = t.child_id and c.parent_id = t.parent_id and c.active
    join fm_private.parents p on p.id = t.parent_id and p.active
    left join fm_private.children peer on peer.id = t.peer_child_id and peer.parent_id = t.parent_id
    where t.parent_id = v_device.parent_id and (
      (t.kind = 'parent_child' and (v_device.child_id is null or t.child_id = v_device.child_id)) or
      (t.kind = 'child_child' and t.peer_enabled and peer.active and
        v_device.child_id in (t.child_id, t.peer_child_id))
    ));
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_peer_permissions() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_device fm_private.devices;
begin
  v_device := fm_private.device();
  if v_device.child_id is not null then return fm_private.failure('not_authorized'); end if;
  return (select coalesce(jsonb_agg(jsonb_build_object(
    'firstChildId', first_child.id, 'secondChildId', second_child.id,
    'firstName', first_child.display_name, 'secondName', second_child.display_name,
    'threadId', t.id, 'enabled', coalesce(t.peer_enabled, false),
    'available', fm_private.child_enrolled(first_child.id) and fm_private.child_enrolled(second_child.id))
    order by first_child.id, second_child.id), '[]'::jsonb)
    from fm_private.children first_child
    join fm_private.children second_child on first_child.parent_id = second_child.parent_id
      and first_child.id < second_child.id and second_child.active
    left join fm_private.threads t on t.child_id = first_child.id and t.peer_child_id = second_child.id
      and t.kind = 'child_child'
    where first_child.parent_id = v_device.parent_id and first_child.active);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_set_peer_permission(p_first_child_id text, p_second_child_id text, p_enabled boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_device fm_private.devices;
  v_first uuid;
  v_second uuid;
  v_swap uuid;
begin
  v_device := fm_private.device();
  if v_device.child_id is not null then return fm_private.failure('not_authorized'); end if;
  if not fm_private.take_attempt(v_device.parent_id, 'peer_permission', 100, interval '1 hour') then
    return fm_private.failure('rate_limited'); end if;
  v_first := fm_private.try_uuid(p_first_child_id);
  v_second := fm_private.try_uuid(p_second_child_id);
  if v_first is null or v_second is null or v_first = v_second or p_enabled is null then
    return fm_private.failure('invalid_request'); end if;
  if v_first > v_second then v_swap := v_first; v_first := v_second; v_second := v_swap; end if;
  if (select count(*) from fm_private.children where id in (v_first, v_second)
    and parent_id = v_device.parent_id and active) <> 2 then
    return fm_private.failure('not_authorized'); end if;
  if p_enabled and not (fm_private.child_enrolled(v_first) and fm_private.child_enrolled(v_second)) then
    return fm_private.failure('not_authorized'); end if;
  insert into fm_private.threads(parent_id, child_id, peer_child_id, kind, peer_enabled)
    values (v_device.parent_id, v_first, v_second, 'child_child', p_enabled)
    on conflict (child_id, peer_child_id) where kind = 'child_child'
    do update set peer_enabled = excluded.peer_enabled;
  return jsonb_build_object('ok', true);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_leave_peer_thread(p_thread_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_device fm_private.devices; v_thread uuid;
begin
  v_device := fm_private.device();
  if v_device.child_id is null then return fm_private.failure('not_authorized'); end if;
  v_thread := fm_private.try_uuid(p_thread_id);
  if v_thread is null then return fm_private.failure('invalid_request'); end if;
  update fm_private.threads set peer_enabled = false where id = v_thread
    and parent_id = v_device.parent_id and kind = 'child_child'
    and v_device.child_id in (child_id, peer_child_id);
  if not found then return fm_private.failure('not_authorized'); end if;
  return jsonb_build_object('ok', true);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

revoke all on function fm_private.child_enrolled(uuid) from public, anon, authenticated;
revoke all on function public.fm_peer_permissions(), public.fm_set_peer_permission(text,text,boolean),
  public.fm_leave_peer_thread(text) from public, anon, authenticated;
grant execute on function public.fm_peer_permissions(), public.fm_set_peer_permission(text,text,boolean),
  public.fm_leave_peer_thread(text) to authenticated;

commit;
