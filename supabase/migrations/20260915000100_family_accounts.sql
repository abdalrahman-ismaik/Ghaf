begin;

-- Additive family authority; no existing account or messaging row is imported or changed.
create table public.app_families (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  revision bigint not null default 0 check (revision between 0 and 9007199254740990),
  active boolean not null default true,
  created_at timestamptz not null default clock_timestamp()
);
create table public.app_children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.app_families(id),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  age_band text not null check (age_band in ('6_8','9_11','12_14')),
  active boolean not null default true,
  created_at timestamptz not null default clock_timestamp(),
  unique(id,family_id)
);
create table public.app_family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.app_families(id),
  auth_user_id uuid not null references auth.users(id),
  role text not null check (role in ('parent','child')),
  display_name text,
  child_id uuid,
  session_id uuid,
  active boolean not null default true,
  created_at timestamptz not null default clock_timestamp(),
  foreign key(child_id,family_id) references public.app_children(id,family_id),
  check ((role='parent' and child_id is null and session_id is null)
    or (role='child' and child_id is not null and session_id is not null))
);
create unique index app_parent_membership on public.app_family_members(family_id,auth_user_id) where role='parent';
create unique index app_child_session on public.app_family_members(session_id) where role='child';
create index app_member_lookup on public.app_family_members(auth_user_id,family_id);
create table public.app_pairing_invites (
  token_hash bytea primary key,
  family_id uuid not null references public.app_families(id),
  child_id uuid,
  role text not null check (role in ('parent','child')),
  issued_by uuid not null references auth.users(id),
  expires_at timestamptz not null default (clock_timestamp()+interval '10 minutes'),
  used_session_id uuid,
  revoked boolean not null default false,
  foreign key(child_id,family_id) references public.app_children(id,family_id),
  check ((role='parent' and child_id is null) or (role='child' and child_id is not null))
);
create table public.app_invite_attempts (
  auth_user_id uuid primary key references auth.users(id),
  window_start timestamptz not null,
  attempts integer not null check(attempts > 0)
);
create table public.app_task_catalog (
  id text primary key,
  template jsonb not null check(jsonb_typeof(template)='object' and template->>'id'=id)
);
create table public.app_tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.app_families(id),
  child_id uuid not null,
  catalog_id text not null references public.app_task_catalog(id),
  template jsonb not null,
  status text not null default 'assigned' check(status in ('assigned','accepted','in_progress','submitted','praised','recognized')),
  revision bigint not null default 0 check(revision between 0 and 9007199254740990),
  step_states jsonb not null default '{}' check(jsonb_typeof(step_states)='object'),
  help_requested boolean not null default false,
  praise text,
  created_at timestamptz not null default clock_timestamp(),
  submitted_at timestamptz,
  recognized_at timestamptz,
  foreign key(child_id,family_id) references public.app_children(id,family_id),
  unique(id,family_id,child_id)
);
create table public.app_recognitions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  child_id uuid not null,
  task_id uuid not null unique,
  seeds integer not null check(seeds in (0,4,6,8,12,15)),
  landscape_id text not null check(landscape_id in ('ghaf','samar','sidr','date_palm','mangrove')),
  canopy_contribution integer not null check(canopy_contribution in (0,1)),
  created_at timestamptz not null default clock_timestamp(),
  foreign key(task_id,family_id,child_id) references public.app_tasks(id,family_id,child_id),
  unique(task_id,family_id,child_id)
);
create table public.app_memories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  child_id uuid not null,
  task_id uuid not null unique,
  title jsonb not null,
  created_at timestamptz not null default clock_timestamp(),
  deleted_at timestamptz,
  foreign key(task_id,family_id,child_id) references public.app_recognitions(task_id,family_id,child_id)
);
create table public.app_command_receipts (
  auth_user_id uuid not null references auth.users(id),
  request_id uuid not null,
  family_id uuid not null references public.app_families(id),
  command jsonb not null,
  result jsonb,
  created_at timestamptz not null default clock_timestamp(),
  primary key(auth_user_id,request_id)
);
create index app_task_family_child on public.app_tasks(family_id,child_id,created_at);
create index app_recognition_family_child on public.app_recognitions(family_id,child_id);
create index app_memory_family_child on public.app_memories(family_id,child_id,created_at);

alter table public.app_families enable row level security;
alter table public.app_children enable row level security;
alter table public.app_family_members enable row level security;
alter table public.app_pairing_invites enable row level security;
alter table public.app_invite_attempts enable row level security;
alter table public.app_task_catalog enable row level security;
alter table public.app_tasks enable row level security;
alter table public.app_recognitions enable row level security;
alter table public.app_memories enable row level security;
alter table public.app_command_receipts enable row level security;
revoke all on public.app_families,public.app_children,public.app_family_members,
  public.app_pairing_invites,public.app_invite_attempts,public.app_task_catalog,
  public.app_tasks,public.app_recognitions,public.app_memories,public.app_command_receipts
  from public,anon,authenticated;

create function public.ghaf_require_session() returns uuid
language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_session uuid;
begin
  begin v_session:=(auth.jwt()->>'session_id')::uuid;
  exception when others then raise exception using errcode='42501',message='access_unavailable'; end;
  if v_user is null or v_session is null then
    raise exception using errcode='42501',message='access_unavailable'; end if;
  perform 1 from auth.users where id=v_user and deleted_at is null
    and (banned_until is null or banned_until <= clock_timestamp()) for share;
  if not found then raise exception using errcode='42501',message='access_unavailable'; end if;
  perform 1 from auth.sessions where id=v_session and user_id=v_user
    and (not_after is null or not_after>clock_timestamp()) for share;
  if not found then raise exception using errcode='42501',message='access_unavailable'; end if;
  perform set_config('response.headers','[{"Cache-Control":"no-store"}]',true);
  return v_session;
end; $$;

create function public.ghaf_family_actor(p_family_id uuid)
returns table(role text,child_id uuid,member_id uuid,auth_user_id uuid)
language plpgsql security definer set search_path='' as $$
declare v_session uuid; v_member public.app_family_members; v_owner uuid;
begin
  v_session:=public.ghaf_require_session();
  select f.owner_id into v_owner from public.app_families f where f.id=p_family_id and f.active;
  if not found then raise exception using errcode='42501',message='family_unavailable'; end if;
  perform 1 from auth.users u join public.pilot_access a on a.user_id=u.id
    where u.id=v_owner and a.status='approved' and u.is_anonymous=false
      and u.email_confirmed_at is not null and u.deleted_at is null
      and (u.banned_until is null or u.banned_until<=clock_timestamp()) for share of u;
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

create function public.ghaf_family_visible(p_family_id uuid) returns boolean
language plpgsql security definer set search_path='' as $$
begin perform public.ghaf_family_actor(p_family_id); return true;
exception when insufficient_privilege then return false;
end; $$;
grant select on public.app_families to authenticated;
create policy app_family_read on public.app_families for select to authenticated
  using(public.ghaf_family_visible(id));

create function public.ghaf_family_identity() returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_session uuid; v_family uuid; v_actor record;
begin
  v_session:=public.ghaf_require_session();
  select m.family_id into v_family from public.app_family_members m
    where m.auth_user_id=auth.uid() and m.active
      and (m.role='parent' or m.session_id=v_session)
      and public.ghaf_family_visible(m.family_id) order by m.created_at,m.id limit 1;
  if v_family is not null then
    select * into v_actor from public.ghaf_family_actor(v_family);
    return jsonb_build_object('userId',auth.uid(),'role',v_actor.role,'familyId',v_family,'childId',v_actor.child_id);
  end if;
  if public.can_access_account_profile() then
    return jsonb_build_object('userId',auth.uid(),'role','parent','familyId',null,'childId',null);
  end if;
  raise exception using errcode='42501',message='access_unavailable';
end; $$;

create function public.ghaf_family_snapshot(p_family_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_identity jsonb; v_actor record; v_family uuid; v_family_dto jsonb:=null;
  v_families jsonb; v_members jsonb:='[]'; v_children jsonb:='[]'; v_tasks jsonb:='[]';
  v_recognitions jsonb:='[]'; v_memories jsonb:='[]'; v_deleted_memories jsonb:='[]'; v_catalog jsonb;
  v_canopy bigint:=0;
begin
  v_identity:=public.ghaf_family_identity();
  v_family:=coalesce(p_family_id,(v_identity->>'familyId')::uuid);
  select coalesce(jsonb_agg(jsonb_build_object('id',f.id,'name',f.name,'revision',f.revision) order by f.created_at,f.id),'[]')
    into v_families from public.app_families f where public.ghaf_family_visible(f.id);
  select coalesce(jsonb_agg(c.template order by c.id),'[]') into v_catalog from public.app_task_catalog c;
  if v_family is not null then
    select * into v_actor from public.ghaf_family_actor(v_family);
    v_identity:=jsonb_build_object('userId',auth.uid(),'role',v_actor.role,'familyId',v_family,'childId',v_actor.child_id);
    select jsonb_build_object('id',f.id,'name',f.name,'revision',f.revision) into v_family_dto
      from public.app_families f where f.id=v_family;
    select coalesce(sum(canopy_contribution),0) into v_canopy from public.app_recognitions where family_id=v_family;
    if v_actor.role='parent' then
      select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'userId',m.auth_user_id,'role',m.role,
        'childId',m.child_id,'active',m.active) order by m.created_at,m.id),'[]') into v_members
        from public.app_family_members m where m.family_id=v_family;
    end if;
    select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'familyId',c.family_id,'displayName',c.display_name,
      'ageBand',c.age_band,'active',c.active) order by c.created_at,c.id),'[]') into v_children
      from public.app_children c where c.family_id=v_family and (v_actor.role='parent' or c.id=v_actor.child_id);
    select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'familyId',t.family_id,'childId',t.child_id,
      'catalogId',t.catalog_id,'status',t.status,'revision',t.revision,'stepStates',t.step_states,
      'helpRequested',t.help_requested,'praise',t.praise,'createdAt',t.created_at,'submittedAt',t.submitted_at,
      'recognizedAt',t.recognized_at,'template',t.template) order by t.created_at,t.id),'[]') into v_tasks
      from public.app_tasks t where t.family_id=v_family and (v_actor.role='parent' or t.child_id=v_actor.child_id);
    select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'taskId',r.task_id,'childId',r.child_id,
      'seeds',r.seeds,'landscapeId',r.landscape_id,'canopyContribution',r.canopy_contribution,
      'createdAt',r.created_at) order by r.created_at,r.id),'[]') into v_recognitions
      from public.app_recognitions r where r.family_id=v_family and (v_actor.role='parent' or r.child_id=v_actor.child_id);
    select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'taskId',m.task_id,'childId',m.child_id,
      'title',m.title,'createdAt',m.created_at) order by m.created_at desc,m.id),'[]') into v_memories
      from public.app_memories m where m.family_id=v_family and m.deleted_at is null
        and (v_actor.role='parent' or m.child_id=v_actor.child_id);
    select coalesce(jsonb_agg(m.task_id order by m.task_id),'[]') into v_deleted_memories
      from public.app_memories m where m.family_id=v_family and m.deleted_at is not null
        and (v_actor.role='parent' or m.child_id=v_actor.child_id);
  end if;
  return jsonb_build_object('schemaVersion',1,'actor',v_identity,'families',v_families,'family',v_family_dto,
    'members',v_members,'children',v_children,'tasks',v_tasks,'recognitions',v_recognitions,'memories',v_memories,'catalog',v_catalog,
    'familyCanopyContributions',v_canopy,'deletedMemoryTaskIds',v_deleted_memories);
end; $$;

-- Only approved display-copy fields may differ from a server-owned task template.
create function public.ghaf_task_copy(p_template jsonb,p_content jsonb) returns jsonb
language plpgsql set search_path='' as $$
declare v_key text; v_locale text; v_value jsonb; v_result jsonb:=p_template;
begin
  if p_content is null then return p_template; end if;
  if jsonb_typeof(p_content)<>'object' or p_content='{}'::jsonb
    or p_content-array['title','positiveAction']<>'{}'::jsonb then
    raise exception using errcode='PT400',message='invalid_command'; end if;
  if p_content ? 'positiveAction' and p_content->'positiveAction' is distinct from p_template->'positiveAction' then
    raise exception using errcode='PT400',message='invalid_command'; end if;
  for v_key,v_value in select * from jsonb_each(p_content) loop
    if jsonb_typeof(v_value)<>'object' or not(v_value ?& array['ar','en'])
      or v_value-array['ar','en']<>'{}'::jsonb then
      raise exception using errcode='PT400',message='invalid_command'; end if;
    foreach v_locale in array array['ar','en'] loop
      if jsonb_typeof(v_value->v_locale)<>'string'
        or char_length(btrim(v_value->>v_locale)) not between 1 and 500 then
        raise exception using errcode='PT400',message='invalid_command'; end if;
    end loop;
    v_result:=jsonb_set(v_result,array[v_key],v_value);
  end loop;
  return v_result;
end; $$;

create function public.ghaf_localize_p0_name(p_value jsonb,p_name text) returns jsonb
language plpgsql set search_path='' as $$
declare v_result jsonb:=p_value; v_key text; v_item jsonb;
begin
  if jsonb_typeof(p_value)='object' then
    for v_key,v_item in select * from jsonb_each(p_value) loop
      if v_key in ('ar','en') and jsonb_typeof(v_item)='string' then
        v_result:=jsonb_set(v_result,array[v_key],to_jsonb(replace(replace(v_item#>>'{}','Salem',p_name),'سالم',p_name)));
      elsif jsonb_typeof(v_item) in ('object','array') then
        v_result:=jsonb_set(v_result,array[v_key],public.ghaf_localize_p0_name(v_item,p_name));
      end if;
    end loop;
  elsif jsonb_typeof(p_value)='array' then
    select coalesce(jsonb_agg(public.ghaf_localize_p0_name(x,p_name) order by n),'[]') into v_result
      from jsonb_array_elements(p_value) with ordinality entries(x,n);
  end if;
  return v_result;
end; $$;

create function public.ghaf_family_command(p_family_id uuid,p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_session uuid; v_actor record; v_type text; v_required text[]; v_allowed text[];
  v_family uuid:=p_family_id; v_child uuid; v_task public.app_tasks; v_template jsonb;
  v_receipt public.app_command_receipts; v_result jsonb:=null; v_saved_result jsonb:=null;
  v_token text; v_expires timestamptz; v_name text; v_display text; v_step jsonb; v_award integer;
  v_canopy integer; v_revision bigint; v_praise text; v_recognized_at timestamptz;
begin
  v_session:=public.ghaf_require_session();
  select null::text as role,null::uuid as child_id into v_actor;
  if p_request_id is null or p_command is null or jsonb_typeof(p_command)<>'object'
    or octet_length(p_command::text)>32768 then raise exception using errcode='PT400',message='invalid_command'; end if;
  v_type:=p_command->>'type';
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,20020));
  if v_type='create_family' then
    if p_family_id is not null or not public.can_access_account_profile() then
      raise exception using errcode='42501',message='access_unavailable'; end if;
  else
    select * into v_actor from public.ghaf_family_actor(v_family);
    perform 1 from public.app_families where id=v_family for update;
    select * into v_actor from public.ghaf_family_actor(v_family);
  end if;
  select * into v_receipt from public.app_command_receipts where auth_user_id=auth.uid() and request_id=p_request_id;
  if found then
    if v_receipt.command<>p_command or (v_type<>'create_family' and v_receipt.family_id is distinct from p_family_id) then
      raise exception using errcode='PT409',message='request_conflict'; end if;
    perform public.ghaf_family_actor(v_receipt.family_id);
    return jsonb_build_object('snapshot',public.ghaf_family_snapshot(v_receipt.family_id),'result',v_receipt.result);
  end if;
  case v_type
    when 'create_family' then v_required:=array['type','name'];v_allowed:=v_required||array['displayName'];
    when 'rename_family' then v_required:=array['type','name'];
    when 'add_child' then v_required:=array['type','displayName','ageBand'];
    when 'rename_child' then v_required:=array['type','childId','displayName'];
    when 'invite_child','revoke_child' then v_required:=array['type','childId'];
    when 'invite_parent' then v_required:=array['type'];
    when 'assign_task' then v_required:=array['type','childId','catalogId'];v_allowed:=v_required||array['content'];
    when 'edit_task' then v_required:=array['type','taskId','expectedRevision','content'];
    when 'praise_task' then v_required:=array['type','taskId','expectedRevision','praise'];
    when 'set_step' then v_required:=array['type','taskId','expectedRevision','stepId','state'];
    when 'accept_task','start_task','request_help','submit_task','recognize_task','save_memory','delete_memory'
      then v_required:=array['type','taskId','expectedRevision'];
    else raise exception using errcode='PT400',message='invalid_command';
  end case;
  v_allowed:=coalesce(v_allowed,v_required);
  if not(p_command ?& v_required) or p_command-v_allowed<>'{}'::jsonb then
    raise exception using errcode='PT400',message='invalid_command'; end if;
  if v_type in ('create_family','rename_family') then
    v_name:=btrim(p_command->>'name');
    if jsonb_typeof(p_command->'name')<>'string' or char_length(v_name) not between 1 and 80 then
      raise exception using errcode='PT400',message='invalid_command'; end if;
  end if;
  if v_type not in ('create_family','accept_task','start_task','request_help','set_step','submit_task')
    and v_actor.role<>'parent' then raise exception using errcode='42501',message='access_unavailable'; end if;
  if p_command ? 'childId' then
    begin v_child:=(p_command->>'childId')::uuid;
    exception when others then raise exception using errcode='PT400',message='invalid_command'; end;
    if not exists(select 1 from public.app_children where id=v_child and family_id=v_family and active) then
      raise exception using errcode='42501',message='family_unavailable'; end if;
  end if;
  if p_command ? 'taskId' then
    begin
      select * into v_task from public.app_tasks where id=(p_command->>'taskId')::uuid and family_id=v_family for update;
    exception when invalid_text_representation then raise exception using errcode='PT400',message='invalid_command'; end;
    if not found or (v_actor.role='child' and v_task.child_id<>v_actor.child_id) then
      raise exception using errcode='42501',message='family_unavailable'; end if;
    if jsonb_typeof(p_command->'expectedRevision')<>'number' or (p_command->>'expectedRevision')!~'^[0-9]{1,16}$' then
      raise exception using errcode='PT400',message='invalid_command'; end if;
    v_revision:=(p_command->>'expectedRevision')::bigint;
    if v_revision<>v_task.revision then raise exception using errcode='PT409',message='request_conflict'; end if;
    if v_type in ('accept_task','start_task','request_help','set_step','submit_task') and v_actor.role<>'child' then
      raise exception using errcode='42501',message='access_unavailable'; end if;
  end if;
  case v_type
    when 'create_family' then
      v_display:=coalesce(p_command->>'displayName',(select display_name from public.account_profiles where user_id=auth.uid()));
      if v_display is null or char_length(btrim(v_display)) not between 1 and 80
        or (p_command ? 'displayName' and jsonb_typeof(p_command->'displayName')<>'string') then
        raise exception using errcode='PT400',message='invalid_command'; end if;
      insert into public.app_families(owner_id,name) values(auth.uid(),v_name) returning id into v_family;
      insert into public.app_family_members(family_id,auth_user_id,role,display_name) values(v_family,auth.uid(),'parent',btrim(v_display));
    when 'rename_family' then update public.app_families set name=v_name where id=v_family;
    when 'add_child','rename_child' then
      v_display:=btrim(p_command->>'displayName');
      if jsonb_typeof(p_command->'displayName')<>'string' or char_length(v_display) not between 1 and 80 then
        raise exception using errcode='PT400',message='invalid_command'; end if;
      if v_type='add_child' then
        if (p_command->>'ageBand') not in ('6_8','9_11','12_14') or jsonb_typeof(p_command->'ageBand')<>'string' then
          raise exception using errcode='PT400',message='invalid_command'; end if;
        insert into public.app_children(family_id,display_name,age_band) values(v_family,v_display,p_command->>'ageBand') returning id into v_child;
        v_result:=jsonb_build_object('childId',v_child);
      else update public.app_children set display_name=v_display where id=v_child; end if;
    when 'invite_child','invite_parent' then
      if (select count(*) from public.app_pairing_invites where issued_by=auth.uid() and expires_at>clock_timestamp())>=20 then
        raise exception using errcode='PT429',message='rate_limited'; end if;
      v_token:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
      if v_type='invite_child' then update public.app_pairing_invites set revoked=true
        where child_id=v_child and used_session_id is null; end if;
      insert into public.app_pairing_invites(token_hash,family_id,child_id,role,issued_by)
        values(sha256(convert_to(v_token,'UTF8')),v_family,v_child,case when v_type='invite_parent' then 'parent' else 'child' end,auth.uid())
        returning expires_at into v_expires;
      v_result:=jsonb_build_object('token',v_token,'expiresAt',v_expires,'childId',v_child);
      v_saved_result:=jsonb_build_object('tokenUnavailable',true,'expiresAt',v_expires,'childId',v_child);
    when 'revoke_child' then
      update public.app_family_members set active=false where family_id=v_family and child_id=v_child;
      update public.app_pairing_invites set revoked=true where family_id=v_family and child_id=v_child;
    when 'assign_task' then
      select template into v_template from public.app_task_catalog where id=p_command->>'catalogId';
      if not found or not(v_template->'childAgeBands' ? (select age_band from public.app_children where id=v_child)) then
        raise exception using errcode='PT400',message='invalid_command'; end if;
      if p_command->>'catalogId'='task_recycling_p0_v1' then
        v_template:=public.ghaf_localize_p0_name(v_template,(select display_name from public.app_children where id=v_child)); end if;
      v_template:=public.ghaf_task_copy(v_template,p_command->'content');
      insert into public.app_tasks(family_id,child_id,catalog_id,template)
        values(v_family,v_child,p_command->>'catalogId',v_template) returning * into v_task;
      v_result:=jsonb_build_object('taskId',v_task.id);
    when 'edit_task' then
      if v_task.status<>'assigned' then raise exception using errcode='PT409',message='invalid_transition'; end if;
      update public.app_tasks set template=public.ghaf_task_copy(template,p_command->'content'),revision=revision+1 where id=v_task.id;
    when 'accept_task' then
      if v_task.status<>'assigned' then raise exception using errcode='PT409',message='invalid_transition'; end if;
      update public.app_tasks set status='accepted',revision=revision+1 where id=v_task.id;
    when 'start_task' then
      if v_task.status<>'accepted' then raise exception using errcode='PT409',message='invalid_transition'; end if;
      update public.app_tasks set status='in_progress',revision=revision+1 where id=v_task.id;
    when 'request_help' then
      if v_task.status not in ('accepted','in_progress') then raise exception using errcode='PT409',message='invalid_transition'; end if;
      update public.app_tasks set help_requested=true,revision=revision+1 where id=v_task.id;
    when 'set_step' then
      if v_task.status<>'in_progress' then raise exception using errcode='PT409',message='invalid_transition'; end if;
      select s into v_step from jsonb_array_elements(coalesce(v_task.template#>'{catalogExecution,steps}','[]')) s where s->>'id'=p_command->>'stepId';
      if v_step is null or jsonb_typeof(p_command->'state')<>'string' or (p_command->>'state') not in ('done','skipped')
        or ((p_command->>'state')='skipped' and v_step->>'kind'='action') then
        raise exception using errcode='PT400',message='invalid_command'; end if;
      update public.app_tasks set step_states=jsonb_set(step_states,array[p_command->>'stepId'],p_command->'state'),revision=revision+1 where id=v_task.id;
    when 'submit_task' then
      if v_task.status<>'in_progress' or exists(select 1 from jsonb_array_elements(coalesce(v_task.template#>'{catalogExecution,steps}','[]')) s
        where not(v_task.step_states ? (s->>'id')) or (s->>'kind'='action' and v_task.step_states->>(s->>'id')<>'done')) then
        raise exception using errcode='PT409',message='invalid_transition'; end if;
      update public.app_tasks set status='submitted',submitted_at=clock_timestamp(),revision=revision+1 where id=v_task.id;
    when 'praise_task' then
      v_praise:=btrim(p_command->>'praise');
      if v_task.status<>'submitted' then raise exception using errcode='PT409',message='invalid_transition'; end if;
      if jsonb_typeof(p_command->'praise')<>'string' or char_length(v_praise) not between 1 and 500
        or v_praise ~* '(lazy|defiant|diagnos|ADHD|كسول|عاصي|تشخيص)' then
        raise exception using errcode='PT400',message='invalid_command'; end if;
      update public.app_tasks set status='praised',praise=v_praise,revision=revision+1 where id=v_task.id;
    when 'recognize_task' then
      if v_task.status<>'praised' then raise exception using errcode='PT409',message='invalid_transition'; end if;
      v_award:=case when v_task.template->>'recognitionMode'<>'recognition_only' and v_task.template->>'routinePhase'='acquisition'
        then (v_task.template->>'displayedSeedAward')::integer else 0 end;
      v_canopy:=case when v_award>0 and v_task.template->>'categoryId'='green_impact'
        and v_task.template->>'visibilityScope'='household' and v_task.template->'circleEligible'='true'::jsonb then 1 else 0 end;
      v_recognized_at:=clock_timestamp();
      insert into public.app_recognitions(family_id,child_id,task_id,seeds,landscape_id,canopy_contribution,created_at)
        values(v_family,v_task.child_id,v_task.id,v_award,v_task.template->>'landscapeId',v_canopy,v_recognized_at);
      update public.app_tasks set status='recognized',recognized_at=v_recognized_at,revision=revision+1 where id=v_task.id;
    when 'save_memory' then
      if v_task.status<>'recognized' or not exists(select 1 from public.app_recognitions where task_id=v_task.id and canopy_contribution=1) then
        raise exception using errcode='PT409',message='invalid_transition'; end if;
      if exists(select 1 from public.app_memories where task_id=v_task.id and deleted_at is not null) then
        raise exception using errcode='PT409',message='invalid_transition'; end if;
      insert into public.app_memories(family_id,child_id,task_id,title) values(v_family,v_task.child_id,v_task.id,v_task.template->'title')
        on conflict(task_id) do nothing;
    when 'delete_memory' then
      if not exists(select 1 from public.app_memories where task_id=v_task.id) then
        raise exception using errcode='PT409',message='invalid_transition'; end if;
      update public.app_memories set deleted_at=coalesce(deleted_at,clock_timestamp()) where task_id=v_task.id;
  end case;
  update public.app_families set revision=revision+1 where id=v_family;
  insert into public.app_command_receipts(auth_user_id,request_id,family_id,command,result)
    values(auth.uid(),p_request_id,v_family,p_command,coalesce(v_saved_result,v_result));
  return jsonb_build_object('snapshot',public.ghaf_family_snapshot(v_family),'result',v_result);
end; $$;

create function public.ghaf_redeem_family_invite(p_token text,p_request_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_session uuid; v_invite public.app_pairing_invites; v_receipt public.app_command_receipts;
  v_anonymous boolean; v_hash bytea; v_command jsonb; v_count integer;
begin
  v_session:=public.ghaf_require_session();
  select is_anonymous into v_anonymous from auth.users where id=auth.uid();
  if not v_anonymous and not public.can_access_account_profile() then
    raise exception using errcode='42501',message='access_unavailable'; end if;
  if p_request_id is null then raise exception using errcode='PT400',message='invalid_command'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,20020));
  v_hash:=sha256(convert_to(coalesce(p_token,''),'UTF8'));
  v_command:=jsonb_build_object('type','redeem_invite','tokenHash',encode(v_hash,'hex'),'sessionId',v_session);
  select * into v_receipt from public.app_command_receipts where auth_user_id=auth.uid() and request_id=p_request_id;
  if found then
    if v_receipt.command<>v_command then raise exception using errcode='PT409',message='request_conflict'; end if;
    perform public.ghaf_family_actor(v_receipt.family_id);
    return jsonb_build_object('snapshot',public.ghaf_family_snapshot(v_receipt.family_id),'result',null);
  end if;
  insert into public.app_invite_attempts(auth_user_id,window_start,attempts) values(auth.uid(),clock_timestamp(),1)
    on conflict(auth_user_id) do update set
      attempts=case when app_invite_attempts.window_start<clock_timestamp()-interval '10 minutes' then 1 else app_invite_attempts.attempts+1 end,
      window_start=case when app_invite_attempts.window_start<clock_timestamp()-interval '10 minutes' then clock_timestamp() else app_invite_attempts.window_start end
    returning attempts into v_count;
  if v_count>10 then
    perform set_config('response.status','429',true); return jsonb_build_object('code','rate_limited','message','rate_limited'); end if;
  select * into v_invite from public.app_pairing_invites where token_hash=v_hash;
  if p_token is null or p_token!~'^[0-9a-f]{64}$' or not found then
    perform set_config('response.status','400',true); return jsonb_build_object('code','invalid_invite','message','invalid_invite'); end if;
  perform 1 from public.app_families where id=v_invite.family_id for update;
  select * into v_invite from public.app_pairing_invites where token_hash=v_hash for update;
  if v_invite.revoked or (v_invite.used_session_id is not null and v_invite.used_session_id<>v_session)
    or (v_invite.used_session_id is null and v_invite.expires_at<=clock_timestamp())
    or (v_invite.role='child') is distinct from v_anonymous
    or not exists(select 1 from public.app_families f join auth.users u on u.id=f.owner_id
      join public.pilot_access a on a.user_id=u.id where f.id=v_invite.family_id and f.active
      and a.status='approved' and u.email_confirmed_at is not null and not u.is_anonymous
      and u.deleted_at is null and (u.banned_until is null or u.banned_until<=clock_timestamp()))
    or (v_invite.child_id is not null and not exists(select 1 from public.app_children where id=v_invite.child_id and active)) then
    perform set_config('response.status','400',true); return jsonb_build_object('code','invalid_invite','message','invalid_invite'); end if;
  if v_anonymous then
    if exists(select 1 from public.app_family_members where auth_user_id=auth.uid()
      and (child_id is distinct from v_invite.child_id or family_id<>v_invite.family_id))
      or exists(select 1 from public.app_family_members where session_id=v_session and not active) then
      perform set_config('response.status','400',true); return jsonb_build_object('code','invalid_invite','message','invalid_invite'); end if;
    insert into public.app_family_members(family_id,auth_user_id,role,child_id,session_id)
      values(v_invite.family_id,auth.uid(),'child',v_invite.child_id,v_session) on conflict(session_id) where role='child' do nothing;
  else
    if exists(select 1 from public.app_family_members where family_id=v_invite.family_id and auth_user_id=auth.uid() and not active) then
      perform set_config('response.status','400',true); return jsonb_build_object('code','invalid_invite','message','invalid_invite'); end if;
    insert into public.app_family_members(family_id,auth_user_id,role) values(v_invite.family_id,auth.uid(),'parent')
      on conflict(family_id,auth_user_id) where role='parent' do nothing;
  end if;
  update public.app_pairing_invites set used_session_id=v_session where token_hash=v_hash;
  update public.app_families set revision=revision+1 where id=v_invite.family_id;
  insert into public.app_command_receipts(auth_user_id,request_id,family_id,command)
    values(auth.uid(),p_request_id,v_invite.family_id,v_command);
  return jsonb_build_object('snapshot',public.ghaf_family_snapshot(v_invite.family_id),'result',null);
end; $$;

revoke all on function public.ghaf_require_session(),public.ghaf_family_actor(uuid),
  public.ghaf_family_visible(uuid),public.ghaf_family_identity(),public.ghaf_family_snapshot(uuid),
  public.ghaf_task_copy(jsonb,jsonb),public.ghaf_localize_p0_name(jsonb,text),
  public.ghaf_family_command(uuid,uuid,jsonb),public.ghaf_redeem_family_invite(text,uuid)
  from public,anon,authenticated;
grant execute on function public.ghaf_family_actor(uuid),public.ghaf_family_visible(uuid),
  public.ghaf_family_identity(),public.ghaf_family_snapshot(uuid),
  public.ghaf_family_command(uuid,uuid,jsonb),public.ghaf_redeem_family_invite(text,uuid) to authenticated;

-- Realtime is only an authorized refresh signal; authoritative reads still use the snapshot RPC.
do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') then
    alter publication supabase_realtime add table public.app_families;
  end if;
end; $$;
commit;
