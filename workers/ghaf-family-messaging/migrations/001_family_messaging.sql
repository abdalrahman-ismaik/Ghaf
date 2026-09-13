-- Apply once as the dedicated project's database operator. No Auth schema is created here.
begin;

create schema fm_private;
revoke all on schema fm_private from public, anon, authenticated;

-- Explicit Unicode White_Space plus BOM avoids locale-dependent nonbreaking-space behavior.
create function fm_private.has_text(p_value text) returns boolean
language sql immutable set search_path = '' as $$
  select translate(p_value,
    U&'\0009\000A\000B\000C\000D\0020\0085\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF', '') <> '';
$$;

create function fm_private.try_uuid(p_value text) returns uuid
language plpgsql immutable set search_path = '' as $$
begin
  return p_value::uuid;
exception when invalid_text_representation then return null;
end;
$$;

create table fm_private.parents (
  -- Keep the tombstone when the provider deletes its user; every RPC checks the live Auth row.
  id uuid primary key,
  household_id uuid not null unique default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 60 and fm_private.has_text(display_name)),
  active boolean not null default true
);

create table fm_private.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references fm_private.parents(id),
  display_name text not null check (char_length(display_name) between 1 and 60 and fm_private.has_text(display_name)),
  age_band text not null check (age_band in ('6_8', '9_11', '12_14')),
  active boolean not null default true,
  unique (id, parent_id)
);

create table fm_private.devices (
  id uuid primary key default gen_random_uuid(),
  provider_user_id uuid not null,
  provider_session_id uuid not null unique,
  parent_id uuid not null references fm_private.parents(id),
  child_id uuid,
  label text not null check (char_length(label) between 1 and 60 and fm_private.has_text(label)),
  active boolean not null default true,
  created_at timestamptz not null default clock_timestamp(),
  foreign key (child_id, parent_id) references fm_private.children(id, parent_id),
  check (child_id is not null or provider_user_id = parent_id)
);

create table fm_private.invitations (
  code_hash bytea primary key,
  parent_id uuid not null references fm_private.parents(id),
  child_id uuid not null,
  created_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null default (clock_timestamp() + interval '10 minutes'),
  used_by_session uuid,
  revoked boolean not null default false,
  foreign key (child_id, parent_id) references fm_private.children(id, parent_id)
);

create table fm_private.threads (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references fm_private.parents(id),
  child_id uuid not null unique,
  next_sequence bigint not null default 1 check (next_sequence between 1 and 9007199254740991),
  foreign key (child_id, parent_id) references fm_private.children(id, parent_id)
);

create table fm_private.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references fm_private.threads(id),
  sender_id uuid not null,
  body text not null check (char_length(body) between 1 and 500 and fm_private.has_text(body)),
  sequence bigint not null check (sequence between 1 and 9007199254740991),
  created_at timestamptz not null default clock_timestamp(),
  client_key uuid not null,
  unique (thread_id, sequence),
  unique (sender_id, client_key)
);
create index messages_retention on fm_private.messages(created_at);
create index devices_parent on fm_private.devices(parent_id);

create table fm_private.attempts (
  actor_id uuid not null,
  action text not null,
  window_start timestamptz not null,
  count integer not null check (count > 0),
  primary key (actor_id, action)
);

-- No policies: all client table reads/writes fail closed, including future default grants.
alter table fm_private.parents enable row level security;
alter table fm_private.children enable row level security;
alter table fm_private.devices enable row level security;
alter table fm_private.invitations enable row level security;
alter table fm_private.threads enable row level security;
alter table fm_private.messages enable row level security;
alter table fm_private.attempts enable row level security;
revoke all on all tables in schema fm_private from public, anon, authenticated;
revoke all on all sequences in schema fm_private from public, anon, authenticated;

create function fm_private.failure(p_code text) returns jsonb
language plpgsql set search_path = '' as $$
begin
  if p_code not in ('not_authenticated','not_authorized','access_revoked','invalid_invite',
      'rate_limited','invalid_message','idempotency_conflict','invalid_request','service_unavailable') then
    p_code := 'service_unavailable';
  end if;
  perform set_config('response.status', case p_code
    when 'not_authenticated' then '401'
    when 'not_authorized' then '403'
    when 'access_revoked' then '403'
    when 'rate_limited' then '429'
    when 'idempotency_conflict' then '409'
    when 'service_unavailable' then '503' else '400' end, true);
  return jsonb_build_object('code', p_code, 'message', p_code);
end;
$$;

create function fm_private.deny(p_code text) returns void
language plpgsql set search_path = '' as $$
begin
  raise exception using errcode = 'P0001', message = p_code;
end;
$$;

create function fm_private.identity() returns uuid
language plpgsql set search_path = '' as $$
declare
  v_user uuid;
  v_session uuid;
begin
  begin
    v_user := auth.uid();
    v_session := (auth.jwt()->>'session_id')::uuid;
  exception when others then
    perform fm_private.deny('not_authenticated');
  end;
  if v_user is null or v_session is null then
    perform fm_private.deny('not_authenticated');
  end if;
  perform 1 from auth.users u where u.id = v_user and u.deleted_at is null
    and (u.banned_until is null or u.banned_until <= clock_timestamp()) for share;
  if not found then perform fm_private.deny('not_authenticated'); end if;
  perform 1 from auth.sessions s where s.id = v_session and s.user_id = v_user
    and (s.not_after is null or s.not_after > clock_timestamp()) for share;
  if not found then perform fm_private.deny('not_authenticated'); end if;
  perform set_config('response.headers', '[{"Cache-Control":"no-store"}]', true);
  return v_session;
end;
$$;

-- Serializing short household operations makes revocation a transaction boundary.
create function fm_private.lock_parent(p_parent uuid) returns void
language sql set search_path = '' as $$
  select pg_advisory_xact_lock(hashtextextended(p_parent::text, 16016));
$$;

create function fm_private.parent_active(p_parent uuid) returns boolean
language plpgsql set search_path = '' as $$
begin
  perform 1 from fm_private.parents p join auth.users u on u.id = p.id
    where p.id = p_parent and p.active and not u.is_anonymous
      and u.email_confirmed_at is not null and u.deleted_at is null
      and (u.banned_until is null or u.banned_until <= clock_timestamp()) for share of u;
  return found;
end;
$$;

create function fm_private.device() returns fm_private.devices
language plpgsql set search_path = '' as $$
declare
  v_session uuid;
  v_device fm_private.devices;
begin
  v_session := fm_private.identity();
  select * into v_device from fm_private.devices
    where provider_session_id = v_session and provider_user_id = auth.uid();
  if not found then perform fm_private.deny('not_authorized'); end if;
  perform fm_private.lock_parent(v_device.parent_id);
  select * into v_device from fm_private.devices where id = v_device.id;
  if not v_device.active or not fm_private.parent_active(v_device.parent_id)
    or (v_device.child_id is not null and not exists (
    select 1 from fm_private.children c where c.id = v_device.child_id
      and c.parent_id = v_device.parent_id and c.active
  )) then perform fm_private.deny('access_revoked'); end if;
  return v_device;
end;
$$;

create function fm_private.context_dto(p_device fm_private.devices) returns jsonb
language sql set search_path = '' as $$
  select jsonb_build_object('role', case when p_device.child_id is null then 'parent' else 'child' end,
    'personId', coalesce(c.id, p.id), 'displayName', coalesce(c.display_name, p.display_name),
    'householdId', p.household_id, 'deviceId', p_device.id, 'ageBand', c.age_band)
  from fm_private.parents p left join fm_private.children c on c.id = p_device.child_id
  where p.id = p_device.parent_id;
$$;

create function fm_private.authorize_thread(p_device fm_private.devices, p_thread uuid)
returns fm_private.threads language plpgsql set search_path = '' as $$
declare v_thread fm_private.threads;
begin
  select t.* into v_thread from fm_private.threads t
    join fm_private.children c on c.id = t.child_id and c.parent_id = t.parent_id and c.active
    where t.id = p_thread and t.parent_id = p_device.parent_id
      and (p_device.child_id is null or t.child_id = p_device.child_id);
  if not found then perform fm_private.deny('not_authorized'); end if;
  return v_thread;
end;
$$;

create function fm_private.take_attempt(p_actor uuid, p_action text, p_max integer, p_window interval)
returns boolean language plpgsql set search_path = '' as $$
declare v_count integer;
begin
  insert into fm_private.attempts as a(actor_id, action, window_start, count)
    values (p_actor, p_action, clock_timestamp(), 1)
  on conflict (actor_id, action) do update set
    window_start = case when a.window_start + p_window <= clock_timestamp() then clock_timestamp() else a.window_start end,
    count = case when a.window_start + p_window <= clock_timestamp() then 1 else least(a.count + 1, p_max + 1) end
  returning count into v_count;
  return v_count <= p_max;
end;
$$;

create function fm_private.message_dto(p_message fm_private.messages) returns jsonb
language sql set search_path = '' as $$
  select jsonb_build_object('id', p_message.id, 'threadId', p_message.thread_id,
    'senderId', p_message.sender_id, 'body', p_message.body, 'sequence', p_message.sequence,
    'createdAt', p_message.created_at, 'clientKey', p_message.client_key);
$$;

create function public.fm_register_parent(p_device_label text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_session uuid;
  v_parent fm_private.parents;
  v_device fm_private.devices;
begin
  v_session := fm_private.identity();
  select * into v_parent from fm_private.parents where id = auth.uid();
  if not found then return fm_private.failure('not_authorized'); end if;
  perform fm_private.lock_parent(v_parent.id);
  select * into v_parent from fm_private.parents where id = auth.uid();
  if not fm_private.parent_active(v_parent.id) then return fm_private.failure('access_revoked'); end if;
  select * into v_device from fm_private.devices where provider_session_id = v_session;
  if found then
    if not v_device.active then return fm_private.failure('access_revoked'); end if;
    if v_device.provider_user_id <> auth.uid() or v_device.parent_id <> v_parent.id
      or v_device.child_id is not null then return fm_private.failure('not_authorized'); end if;
    return fm_private.context_dto(v_device);
  end if;
  if not fm_private.take_attempt(v_parent.id, 'register', 10, interval '1 hour') then
    return fm_private.failure('rate_limited');
  end if;
  if p_device_label is null or char_length(p_device_label) not between 1 and 60
    or not fm_private.has_text(p_device_label) then return fm_private.failure('invalid_request'); end if;
  insert into fm_private.devices(provider_user_id, provider_session_id, parent_id, label)
    values (auth.uid(), v_session, v_parent.id, p_device_label) returning * into v_device;
  return fm_private.context_dto(v_device);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_context() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  return fm_private.context_dto(fm_private.device());
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_children() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_device fm_private.devices;
begin
  v_device := fm_private.device();
  if v_device.child_id is not null then return fm_private.failure('not_authorized'); end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'displayName', c.display_name,
    'ageBand', c.age_band, 'threadId', t.id, 'active', c.active) order by c.id), '[]'::jsonb)
    from fm_private.children c join fm_private.threads t on t.child_id = c.id
    where c.parent_id = v_device.parent_id);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_create_child(p_name text, p_age_band text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_device fm_private.devices;
  v_child fm_private.children;
  v_thread uuid;
begin
  v_device := fm_private.device();
  if v_device.child_id is not null then return fm_private.failure('not_authorized'); end if;
  if not fm_private.take_attempt(v_device.parent_id, 'create_child', 10, interval '1 hour') then
    return fm_private.failure('rate_limited'); end if;
  if p_name is null or char_length(p_name) not between 1 and 60 or not fm_private.has_text(p_name)
    or p_age_band is null or p_age_band not in ('6_8','9_11','12_14') then
    return fm_private.failure('invalid_request'); end if;
  insert into fm_private.children(parent_id, display_name, age_band)
    values (v_device.parent_id, p_name, p_age_band) returning * into v_child;
  insert into fm_private.threads(parent_id, child_id)
    values (v_device.parent_id, v_child.id) returning id into v_thread;
  return jsonb_build_object('id', v_child.id, 'displayName', v_child.display_name,
    'ageBand', v_child.age_band, 'threadId', v_thread, 'active', v_child.active);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_invite(p_child_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_device fm_private.devices;
  v_child fm_private.children;
  v_code text;
  v_expires timestamptz;
  v_child_id uuid;
begin
  v_device := fm_private.device();
  if v_device.child_id is not null then return fm_private.failure('not_authorized'); end if;
  if not fm_private.take_attempt(v_device.parent_id, 'invite', 10, interval '1 hour') then
    return fm_private.failure('rate_limited'); end if;
  v_child_id := fm_private.try_uuid(p_child_id);
  if v_child_id is null then return fm_private.failure('invalid_request'); end if;
  select * into v_child from fm_private.children where id = v_child_id
    and parent_id = v_device.parent_id and active;
  if not found then return fm_private.failure('not_authorized'); end if;
  -- A UUIDv4 supplies 122 random bits. Persist only its SHA-256 digest.
  v_code := replace(gen_random_uuid()::text, '-', '');
  update fm_private.invitations set revoked = true where child_id = v_child.id and used_by_session is null;
  insert into fm_private.invitations(code_hash, parent_id, child_id)
    values (sha256(convert_to(v_code, 'UTF8')), v_device.parent_id, v_child.id)
    returning expires_at into v_expires;
  return jsonb_build_object('code', v_code, 'expiresAt', v_expires, 'childName', v_child.display_name);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_enroll(p_code text, p_device_label text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_session uuid;
  v_invite fm_private.invitations;
  v_device fm_private.devices;
begin
  v_session := fm_private.identity();
  if not exists (select 1 from auth.users where id = auth.uid() and is_anonymous)
    or exists (select 1 from fm_private.parents where id = auth.uid()) then
    return fm_private.failure('not_authorized'); end if;
  -- Expected failures RETURN: raising here would roll back the guess counter.
  if not fm_private.take_attempt(auth.uid(), 'enroll', 10, interval '10 minutes') then
    return fm_private.failure('rate_limited'); end if;
  if p_code is null or p_code !~ '^[0-9a-f]{32}$' then return fm_private.failure('invalid_invite'); end if;
  if p_device_label is null or char_length(p_device_label) not between 1 and 60
    or not fm_private.has_text(p_device_label) then return fm_private.failure('invalid_request'); end if;
  select * into v_invite from fm_private.invitations where code_hash = sha256(convert_to(p_code, 'UTF8'));
  if not found then return fm_private.failure('invalid_invite'); end if;
  perform fm_private.lock_parent(v_invite.parent_id);
  select * into v_invite from fm_private.invitations where code_hash = v_invite.code_hash for update;
  if v_invite.revoked or not fm_private.parent_active(v_invite.parent_id)
    or not exists (select 1 from fm_private.children where id = v_invite.child_id
      and parent_id = v_invite.parent_id and active) then return fm_private.failure('invalid_invite'); end if;
  select * into v_device from fm_private.devices where provider_session_id = v_session;
  if found then
    if not v_device.active then return fm_private.failure('access_revoked'); end if;
    if v_device.provider_user_id = auth.uid() and v_device.child_id = v_invite.child_id
      and v_device.parent_id = v_invite.parent_id and v_invite.used_by_session = v_session then
      return fm_private.context_dto(v_device);
    end if;
    return fm_private.failure('invalid_invite');
  end if;
  if v_invite.used_by_session is not null or v_invite.expires_at <= clock_timestamp() then
    return fm_private.failure('invalid_invite'); end if;
  insert into fm_private.devices(provider_user_id, provider_session_id, parent_id, child_id, label)
    values (auth.uid(), v_session, v_invite.parent_id, v_invite.child_id, p_device_label)
    returning * into v_device;
  update fm_private.invitations set used_by_session = v_session where code_hash = v_invite.code_hash;
  return fm_private.context_dto(v_device);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_threads() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_device fm_private.devices;
begin
  v_device := fm_private.device();
  return (select coalesce(jsonb_agg(jsonb_build_object('id', t.id, 'childId', c.id,
    'otherName', case when v_device.child_id is null then c.display_name else p.display_name end,
    'otherRole', case when v_device.child_id is null then 'child' else 'parent' end) order by t.id), '[]'::jsonb)
    from fm_private.threads t join fm_private.children c on c.id = t.child_id and c.active
    join fm_private.parents p on p.id = t.parent_id and p.active
    where t.parent_id = v_device.parent_id and (v_device.child_id is null or t.child_id = v_device.child_id));
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_messages(p_thread_id text, p_before bigint default null,
  p_after bigint default null, p_limit integer default 30) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_device fm_private.devices;
  v_thread_id uuid;
begin
  v_device := fm_private.device();
  v_thread_id := fm_private.try_uuid(p_thread_id);
  if v_thread_id is null then return fm_private.failure('invalid_request'); end if;
  perform fm_private.authorize_thread(v_device, v_thread_id);
  if p_limit is null or p_limit not between 1 and 50 or (p_before is not null and p_after is not null)
    or (p_before is not null and p_before not between 1 and 9007199254740991)
    or (p_after is not null and p_after not between 0 and 9007199254740991) then
    return fm_private.failure('invalid_request'); end if;
  return (select coalesce(jsonb_agg(fm_private.message_dto(page) order by page.sequence), '[]'::jsonb)
    from (select m.* from fm_private.messages m where m.thread_id = v_thread_id
      and m.created_at > clock_timestamp() - interval '30 days'
      and (p_before is null or m.sequence < p_before) and (p_after is null or m.sequence > p_after)
      order by case when p_after is not null then m.sequence end asc,
        case when p_after is null then m.sequence end desc limit p_limit) page);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_send(p_thread_id text, p_client_key text, p_body text,
  p_phrase_id text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_device fm_private.devices;
  v_sender uuid;
  v_message fm_private.messages;
  v_sequence bigint;
  v_age text;
  v_thread_id uuid;
  v_client_key uuid;
begin
  v_device := fm_private.device();
  v_sender := coalesce(v_device.child_id, v_device.parent_id);
  v_thread_id := fm_private.try_uuid(p_thread_id);
  if v_thread_id is null then return fm_private.failure('invalid_request'); end if;
  -- Authorize the requested thread before any sender/key receipt lookup.
  perform fm_private.authorize_thread(v_device, v_thread_id);
  if not fm_private.take_attempt(v_sender, 'send', 30, interval '1 minute') then
    return fm_private.failure('rate_limited'); end if;
  v_client_key := fm_private.try_uuid(p_client_key);
  if v_client_key is null then return fm_private.failure('invalid_request'); end if;
  if p_body is null or char_length(p_body) not between 1 and 500
    or not fm_private.has_text(p_body) then return fm_private.failure('invalid_message'); end if;
  select age_band into v_age from fm_private.children where id = v_device.child_id;
  if v_age = '6_8' and not coalesce(case p_phrase_id
    when 'help' then p_body in ('هل يمكنك مساعدتي؟', 'Can you help me?')
    when 'ready' then p_body in ('أنا مستعدّ.', 'I am ready.')
    when 'thanks' then p_body in ('شكرًا لمساعدتك.', 'Thank you for helping.')
    when 'pause' then p_body in ('أحتاج إلى استراحة قصيرة.', 'I need a short break.')
    else false end, false) then return fm_private.failure('invalid_message'); end if;
  select * into v_message from fm_private.messages where sender_id = v_sender and client_key = v_client_key;
  if found and v_message.created_at > clock_timestamp() - interval '30 days' then
    if v_message.thread_id <> v_thread_id or v_message.body <> p_body then
      return fm_private.failure('idempotency_conflict'); end if;
    return fm_private.message_dto(v_message);
  end if;
  -- Expired receipts are outside the guarantee, even if hourly cleanup has not run yet.
  delete from fm_private.messages where sender_id = v_sender and client_key = v_client_key
    and created_at <= clock_timestamp() - interval '30 days';
  select next_sequence into v_sequence from fm_private.threads where id = v_thread_id for update;
  if v_sequence >= 9007199254740991 then return fm_private.failure('service_unavailable'); end if;
  insert into fm_private.messages(thread_id, sender_id, body, sequence, client_key)
    values (v_thread_id, v_sender, p_body, v_sequence, v_client_key) returning * into v_message;
  update fm_private.threads set next_sequence = v_sequence + 1 where id = v_thread_id;
  return fm_private.message_dto(v_message);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_devices() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_device fm_private.devices;
begin
  v_device := fm_private.device();
  if v_device.child_id is not null then return fm_private.failure('not_authorized'); end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id', d.id,
    'personName', coalesce(c.display_name, p.display_name), 'role', case when d.child_id is null then 'parent' else 'child' end,
    'label', d.label, 'active', d.active, 'current', d.id = v_device.id) order by d.created_at, d.id), '[]'::jsonb)
    from fm_private.devices d join fm_private.parents p on p.id = d.parent_id
    left join fm_private.children c on c.id = d.child_id where d.parent_id = v_device.parent_id);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_revoke_device(p_device_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_device fm_private.devices;
  v_device_id uuid;
begin
  v_device := fm_private.device();
  v_device_id := fm_private.try_uuid(p_device_id);
  if v_device_id is null then return fm_private.failure('invalid_request'); end if;
  update fm_private.devices set active = false where id = v_device_id
    and parent_id = v_device.parent_id and (v_device.child_id is null or id = v_device.id);
  if not found then return fm_private.failure('not_authorized'); end if;
  return jsonb_build_object('ok', true);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_revoke_account() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_device fm_private.devices;
begin
  v_device := fm_private.device();
  if v_device.child_id is not null then return fm_private.failure('not_authorized'); end if;
  update fm_private.parents set active = false where id = v_device.parent_id;
  update fm_private.children set active = false where parent_id = v_device.parent_id;
  update fm_private.devices set active = false where parent_id = v_device.parent_id;
  update fm_private.invitations set revoked = true where parent_id = v_device.parent_id;
  return jsonb_build_object('ok', true);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

create function public.fm_purge_expired() returns bigint
language plpgsql security definer set search_path = '' as $$
declare v_count bigint;
begin
  delete from fm_private.messages where created_at <= clock_timestamp() - interval '30 days';
  get diagnostics v_count = row_count;
  delete from fm_private.invitations where expires_at <= clock_timestamp() - interval '30 days';
  delete from fm_private.attempts where window_start <= clock_timestamp() - interval '1 day';
  return v_count;
end;
$$;

revoke all on all functions in schema fm_private from public, anon, authenticated;

-- Explicit signature list avoids changing unrelated RPC grants in the shared public schema.
revoke all on function public.fm_register_parent(text), public.fm_context(), public.fm_children(),
  public.fm_create_child(text,text), public.fm_invite(text), public.fm_enroll(text,text),
  public.fm_threads(), public.fm_messages(text,bigint,bigint,integer), public.fm_send(text,text,text,text),
  public.fm_devices(), public.fm_revoke_device(text), public.fm_revoke_account(), public.fm_purge_expired()
  from public, anon, authenticated;
grant execute on function public.fm_register_parent(text), public.fm_context(), public.fm_children(),
  public.fm_create_child(text,text), public.fm_invite(text), public.fm_enroll(text,text),
  public.fm_threads(), public.fm_messages(text,bigint,bigint,integer), public.fm_send(text,text,text,text),
  public.fm_devices(), public.fm_revoke_device(text), public.fm_revoke_account() to authenticated;

commit;
