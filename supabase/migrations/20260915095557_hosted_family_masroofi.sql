begin;

-- Simulated money extends the existing hosted family authority; no sample history is imported.
create table public.app_masroofi_cards (
  child_id uuid primary key,
  family_id uuid not null references public.app_families(id),
  age10_plus_confirmed boolean not null check(age10_plus_confirmed),
  balance_fils integer not null default 0 check(balance_fils between 0 and 1000000),
  controls_version bigint not null default 1 check(controls_version between 1 and 9007199254740990),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default clock_timestamp(),
  foreign key(child_id,family_id) references public.app_children(id,family_id),
  unique(child_id,family_id)
);
create table public.app_masroofi_control_versions (
  child_id uuid not null,
  family_id uuid not null,
  version bigint not null check(version between 1 and 9007199254740990),
  frozen boolean not null,
  online_allowed boolean not null,
  per_purchase_limit_fils integer not null check(per_purchase_limit_fils between 1 and 50000),
  daily_limit_fils integer not null check(daily_limit_fils between 1 and 50000),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default clock_timestamp(),
  primary key(child_id,version),
  foreign key(child_id,family_id) references public.app_masroofi_cards(child_id,family_id)
);
create table public.app_masroofi_allowed_categories (
  child_id uuid not null,
  controls_version bigint not null,
  category text not null check(category in ('stationery','books','sports','arts','outings','snacks','gifts','games')),
  primary key(child_id,controls_version,category),
  foreign key(child_id,controls_version) references public.app_masroofi_control_versions(child_id,version)
);
alter table public.app_masroofi_cards add constraint app_masroofi_current_controls
  foreign key(child_id,controls_version) references public.app_masroofi_control_versions(child_id,version)
  deferrable initially deferred;
create table public.app_masroofi_promises (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  child_id uuid not null,
  task_id uuid not null unique,
  task_revision bigint not null check(task_revision between 0 and 9007199254740990),
  content_fingerprint bytea not null,
  amount_fils integer not null check(amount_fils between 1 and 10000),
  status text not null default 'promised' check(status in ('promised','credited')),
  recognition_id uuid unique references public.app_recognitions(id),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default clock_timestamp(),
  credited_at timestamptz,
  foreign key(child_id,family_id) references public.app_masroofi_cards(child_id,family_id),
  foreign key(task_id,family_id,child_id) references public.app_tasks(id,family_id,child_id),
  check((status='promised' and recognition_id is null and credited_at is null)
    or (status='credited' and recognition_id is not null and credited_at is not null))
);
create table public.app_masroofi_transactions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  child_id uuid not null,
  request_id uuid not null unique,
  kind text not null check(kind in ('reward','top_up','purchase')),
  amount_fils integer not null check(amount_fils between 1 and 50000),
  status text not null check(status in ('credited','approved','declined')),
  decline_reason text check(decline_reason in ('card_disabled','card_frozen','category_blocked','online_blocked','per_purchase_limit','daily_limit','insufficient_balance')),
  fixture_id text check(fixture_id in ('stationery','storybook','football','art_supplies','museum_ticket','snack','gift','game_online')),
  day date not null,
  balance_after_fils integer not null check(balance_after_fils between 0 and 1000000),
  task_id uuid unique,
  promise_id uuid unique references public.app_masroofi_promises(id),
  created_at timestamptz not null default clock_timestamp(),
  foreign key(child_id,family_id) references public.app_masroofi_cards(child_id,family_id),
  foreign key(task_id,family_id,child_id) references public.app_tasks(id,family_id,child_id),
  check((kind='reward' and status='credited' and decline_reason is null and fixture_id is null and task_id is not null and promise_id is not null)
    or (kind='top_up' and status='credited' and decline_reason is null and fixture_id is null and task_id is null and promise_id is null)
    or (kind='purchase' and fixture_id is not null and task_id is null and promise_id is null
      and ((status='approved' and decline_reason is null) or (status='declined' and decline_reason is not null))))
);
create table public.app_masroofi_command_receipts (
  request_id uuid primary key,
  auth_user_id uuid not null references auth.users(id),
  family_id uuid not null references public.app_families(id),
  command jsonb not null check(jsonb_typeof(command)='object'),
  created_at timestamptz not null default clock_timestamp()
);
create index app_masroofi_card_family on public.app_masroofi_cards(family_id,child_id);
create index app_masroofi_promise_family on public.app_masroofi_promises(family_id,child_id,created_at);
create index app_masroofi_pending on public.app_masroofi_promises(child_id) where status='promised';
create index app_masroofi_transaction_family on public.app_masroofi_transactions(family_id,child_id,created_at);
create index app_masroofi_daily_spend on public.app_masroofi_transactions(child_id,day) where kind='purchase' and status='approved';
create index app_masroofi_receipt_family on public.app_masroofi_command_receipts(family_id);
create index app_masroofi_receipt_actor on public.app_masroofi_command_receipts(auth_user_id);
alter table public.app_masroofi_cards enable row level security;
alter table public.app_masroofi_control_versions enable row level security;
alter table public.app_masroofi_allowed_categories enable row level security;
alter table public.app_masroofi_promises enable row level security;
alter table public.app_masroofi_transactions enable row level security;
alter table public.app_masroofi_command_receipts enable row level security;
revoke all on public.app_masroofi_cards,public.app_masroofi_control_versions,
  public.app_masroofi_allowed_categories,public.app_masroofi_promises,
  public.app_masroofi_transactions,public.app_masroofi_command_receipts from public,anon,authenticated;

create function public.ghaf_masroofi_immutable() returns trigger
language plpgsql set search_path='' as $$
begin raise exception using errcode='PT400',message='promise_locked'; end; $$;
create trigger app_masroofi_immutable_controls before update or delete on public.app_masroofi_control_versions
  for each row execute function public.ghaf_masroofi_immutable();
create trigger app_masroofi_immutable_categories before update or delete on public.app_masroofi_allowed_categories
  for each row execute function public.ghaf_masroofi_immutable();
create trigger app_masroofi_immutable_ledger before update or delete on public.app_masroofi_transactions
  for each row execute function public.ghaf_masroofi_immutable();
create trigger app_masroofi_immutable_receipts before update or delete on public.app_masroofi_command_receipts
  for each row execute function public.ghaf_masroofi_immutable();

create function public.ghaf_masroofi_lock_promise() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='DELETE' then raise exception using errcode='PT400',message='promise_locked'; end if;
  if (to_jsonb(new)-array['status','recognition_id','credited_at']) is distinct from
    (to_jsonb(old)-array['status','recognition_id','credited_at'])
    or old.status<>'promised' or new.status<>'credited'
    or not exists(select 1 from public.app_recognitions r where r.id=new.recognition_id
      and r.task_id=old.task_id and r.family_id=old.family_id and r.child_id=old.child_id
      and r.created_at<=new.credited_at and new.credited_at>=old.created_at) then
    raise exception using errcode='PT400',message='promise_locked'; end if;
  return new;
end; $$;
create trigger app_masroofi_lock_promise before update or delete on public.app_masroofi_promises
  for each row execute function public.ghaf_masroofi_lock_promise();
create function public.ghaf_masroofi_lock_task() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if exists(select 1 from public.app_masroofi_promises where task_id=old.id) then
    if tg_op='DELETE' then raise exception using errcode='PT400',message='promise_locked'; end if;
    if row(new.id,new.family_id,new.child_id,new.catalog_id,new.custom_template_id,new.template)
      is distinct from row(old.id,old.family_id,old.child_id,old.catalog_id,old.custom_template_id,old.template) then
      raise exception using errcode='PT400',message='promise_locked'; end if;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end; $$;
create trigger app_masroofi_lock_task before update or delete on public.app_tasks
  for each row execute function public.ghaf_masroofi_lock_task();

create function public.ghaf_masroofi_eligible(p_task public.app_tasks) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare v_canonical jsonb; v_child public.app_children;
begin
  if p_task.catalog_id is null or p_task.catalog_id not in ('task_recycling_p0_v1','HR01','HR05','GI01','GI02','GI03')
    or p_task.custom_template_id is not null then return false; end if;
  select * into v_child from public.app_children where id=p_task.child_id and family_id=p_task.family_id and active;
  if not found then return false; end if;
  select template into v_canonical from public.app_task_catalog where id=p_task.catalog_id;
  if p_task.catalog_id='task_recycling_p0_v1' then
    v_canonical:=public.ghaf_localize_p0_name(v_canonical,v_child.display_name); end if;
  return coalesce(p_task.template=v_canonical and v_canonical->'childAgeBands' ? v_child.age_band
    and v_canonical->>'categoryId' in ('home_responsibility','green_impact')
    and v_canonical->>'recognitionMode' in ('standard','fade_first')
    and v_canonical->>'routinePhase'='acquisition'
    and v_canonical->>'visibilityScope'='household',false);
end; $$;

create function public.ghaf_family_masroofi(p_family_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_actor record; v_result jsonb;
begin
  select * into v_actor from public.ghaf_family_actor(p_family_id);
  if current_setting('transaction_read_only')='off' then
    perform 1 from public.app_families where id=p_family_id for share;
  end if;
  select * into v_actor from public.ghaf_family_actor(p_family_id);
  -- One MVCC statement keeps all projections coherent, including read-only transactions.
  select jsonb_build_object('schemaVersion',1,'actor',jsonb_build_object('userId',auth.uid(),
    'role',v_actor.role,'familyId',p_family_id,'childId',v_actor.child_id),'familyId',p_family_id,
    'revision',f.revision,'cards',(select coalesce(jsonb_agg(jsonb_build_object('childId',c.child_id,'balanceFils',c.balance_fils,
    'controlsVersion',c.controls_version,'age10PlusConfirmed',c.age10_plus_confirmed,
    'controls',jsonb_build_object('frozen',v.frozen,'onlineAllowed',v.online_allowed,
      'perPurchaseLimitFils',v.per_purchase_limit_fils,'dailyLimitFils',v.daily_limit_fils,
      'allowedCategories',(select coalesce(jsonb_agg(a.category order by a.category),'[]')
        from public.app_masroofi_allowed_categories a where a.child_id=c.child_id and a.controls_version=c.controls_version)))
    order by c.created_at,c.child_id),'[]') from public.app_masroofi_cards c
    join public.app_masroofi_control_versions v on v.child_id=c.child_id and v.version=c.controls_version
    where c.family_id=p_family_id and (v_actor.role='parent' or c.child_id=v_actor.child_id)),
    'promises',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'childId',p.child_id,'taskId',p.task_id,
    'taskRevision',p.task_revision,'status',p.status,'createdAt',p.created_at,'creditedAt',p.credited_at)
    || case when v_actor.role='parent' or p.status='credited' then jsonb_build_object('amountFils',p.amount_fils) else '{}'::jsonb end
    order by p.created_at,p.id),'[]') from public.app_masroofi_promises p
    where p.family_id=p_family_id and (v_actor.role='parent' or p.child_id=v_actor.child_id)),
    'transactions',(select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'childId',t.child_id,'requestId',t.request_id,
    'kind',t.kind,'amountFils',t.amount_fils,'status',t.status,'declineReason',t.decline_reason,
    'fixtureId',t.fixture_id,'day',t.day,'balanceAfterFils',t.balance_after_fils,'taskId',t.task_id,'createdAt',t.created_at)
    order by t.created_at,t.id),'[]') from public.app_masroofi_transactions t
    where t.family_id=p_family_id and (v_actor.role='parent' or t.child_id=v_actor.child_id)))
    into v_result from public.app_families f where f.id=p_family_id;
  return v_result;
end; $$;

create function public.ghaf_family_masroofi_command(p_family_id uuid,p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_actor record; v_type text; v_keys text[]; v_child uuid; v_task public.app_tasks;
  v_card public.app_masroofi_cards; v_controls public.app_masroofi_control_versions;
  v_receipt public.app_masroofi_command_receipts; v_input jsonb; v_amount integer; v_expected bigint;
  v_reserved bigint; v_category text; v_online boolean; v_decline text; v_day date; v_spent bigint;
begin
  select * into v_actor from public.ghaf_family_actor(p_family_id);
  if p_request_id is null or p_command is null or jsonb_typeof(p_command)<>'object'
    or octet_length(p_command::text)>4096 then raise exception using errcode='PT400',message='invalid_command'; end if;
  v_type:=p_command->>'type';
  if v_type='purchase' then
    if v_actor.role<>'child' then raise exception using errcode='42501',message='access_unavailable'; end if;
  elsif v_actor.role<>'parent' then raise exception using errcode='42501',message='access_unavailable'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,20020));
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,20025));
  perform 1 from public.app_families where id=p_family_id for update;
  select * into v_actor from public.ghaf_family_actor(p_family_id);
  if v_type<>'purchase' then perform public.ghaf_require_recent_parent_password(p_family_id); end if;
  select * into v_receipt from public.app_masroofi_command_receipts where request_id=p_request_id;
  if found then
    if v_receipt.auth_user_id<>auth.uid() or v_receipt.family_id<>p_family_id or v_receipt.command<>p_command then
      raise exception using errcode='PT409',message='request_conflict'; end if;
    return jsonb_build_object('snapshot',public.ghaf_family_masroofi(p_family_id));
  end if;
  if exists(select 1 from public.app_masroofi_promises where id=p_request_id)
    or exists(select 1 from public.app_masroofi_transactions where request_id=p_request_id) then
    raise exception using errcode='PT409',message='request_conflict'; end if;
  case v_type
    when 'card.enable' then v_keys:=array['type','childId','age10PlusConfirmed'];
    when 'card.controls' then v_keys:=array['type','childId','expectedVersion','controls'];
    when 'card.top_up' then v_keys:=array['type','childId','amountFils'];
    when 'reward.promise' then v_keys:=array['type','taskId','expectedTaskRevision','amountFils'];
    when 'purchase' then v_keys:=array['type','childId','fixtureId'];
    else raise exception using errcode='PT400',message='invalid_command';
  end case;
  if not(p_command ?& v_keys) or p_command-v_keys<>'{}'::jsonb then
    raise exception using errcode='PT400',message='invalid_command'; end if;
  if v_type='reward.promise' then
    if jsonb_typeof(p_command->'taskId') is distinct from 'string' then
      raise exception using errcode='PT400',message='invalid_command'; end if;
    begin select * into v_task from public.app_tasks where id=(p_command->>'taskId')::uuid and family_id=p_family_id for update;
    exception when invalid_text_representation then raise exception using errcode='PT400',message='invalid_command'; end;
    if not found then raise exception using errcode='42501',message='family_unavailable'; end if;
    v_child:=v_task.child_id;
  else
    if jsonb_typeof(p_command->'childId') is distinct from 'string' then
      raise exception using errcode='PT400',message='invalid_command'; end if;
    begin v_child:=(p_command->>'childId')::uuid;
    exception when invalid_text_representation then raise exception using errcode='PT400',message='invalid_command'; end;
  end if;
  if (v_actor.role='child' and v_child is distinct from v_actor.child_id)
    or not exists(select 1 from public.app_children where id=v_child and family_id=p_family_id and active) then
    raise exception using errcode='42501',message='family_unavailable'; end if;
  if v_type in ('card.top_up','reward.promise') then
    if jsonb_typeof(p_command->'amountFils') is distinct from 'number'
      or (p_command->>'amountFils') !~ '^[0-9]{1,5}$' then raise exception using errcode='PT400',message='invalid_command'; end if;
    v_amount:=(p_command->>'amountFils')::integer;
    if v_amount<1 or v_amount>(case when v_type='reward.promise' then 10000 else 50000 end) then
      raise exception using errcode='PT400',message='invalid_command'; end if;
  end if;
  select * into v_card from public.app_masroofi_cards where child_id=v_child for update;
  if v_type='card.enable' then
    if p_command->'age10PlusConfirmed' is distinct from 'true'::jsonb or not exists(
      select 1 from public.app_children where id=v_child and age_band in ('9_11','12_14')) then
      raise exception using errcode='PT400',message='age_ineligible'; end if;
    if v_card.child_id is not null then raise exception using errcode='PT400',message='invalid_transition'; end if;
    insert into public.app_masroofi_cards(child_id,family_id,age10_plus_confirmed,created_by)
      values(v_child,p_family_id,true,auth.uid());
    insert into public.app_masroofi_control_versions(child_id,family_id,version,frozen,online_allowed,per_purchase_limit_fils,daily_limit_fils,created_by)
      values(v_child,p_family_id,1,false,false,2000,5000,auth.uid());
    insert into public.app_masroofi_allowed_categories values(v_child,1,'stationery');
  else
    if v_card.child_id is null then raise exception using errcode='PT400',message='invalid_transition'; end if;
    if v_type='card.controls' then
      v_input:=p_command->'controls';
      if jsonb_typeof(p_command->'expectedVersion') is distinct from 'number'
        or (p_command->>'expectedVersion') !~ '^[0-9]{1,16}$'
        or jsonb_typeof(v_input) is distinct from 'object'
        or not(v_input ?& array['frozen','onlineAllowed','allowedCategories','perPurchaseLimitFils','dailyLimitFils'])
        or v_input-array['frozen','onlineAllowed','allowedCategories','perPurchaseLimitFils','dailyLimitFils']<>'{}'::jsonb
        or jsonb_typeof(v_input->'frozen') is distinct from 'boolean'
        or jsonb_typeof(v_input->'onlineAllowed') is distinct from 'boolean'
        or jsonb_typeof(v_input->'allowedCategories') is distinct from 'array'
        or jsonb_typeof(v_input->'perPurchaseLimitFils') is distinct from 'number'
        or jsonb_typeof(v_input->'dailyLimitFils') is distinct from 'number'
        or (v_input->>'perPurchaseLimitFils') !~ '^[0-9]{1,5}$'
        or (v_input->>'dailyLimitFils') !~ '^[0-9]{1,5}$' then
        raise exception using errcode='PT400',message='invalid_command'; end if;
      if (v_input->>'perPurchaseLimitFils')::integer not between 1 and 50000
        or (v_input->>'dailyLimitFils')::integer not between 1 and 50000
        or jsonb_array_length(v_input->'allowedCategories')>8
        or exists(select 1 from jsonb_array_elements(v_input->'allowedCategories')x where jsonb_typeof(x)<>'string'
          or x#>>'{}' not in ('stationery','books','sports','arts','outings','snacks','gifts','games'))
        or (select count(*)<>count(distinct x) from jsonb_array_elements(v_input->'allowedCategories')x) then
        raise exception using errcode='PT400',message='invalid_command'; end if;
      v_expected:=(p_command->>'expectedVersion')::bigint;
      if v_expected<>v_card.controls_version then raise exception using errcode='PT409',message='request_conflict'; end if;
      insert into public.app_masroofi_control_versions(child_id,family_id,version,frozen,online_allowed,per_purchase_limit_fils,daily_limit_fils,created_by)
        values(v_child,p_family_id,v_card.controls_version+1,(v_input->>'frozen')::boolean,(v_input->>'onlineAllowed')::boolean,
          (v_input->>'perPurchaseLimitFils')::integer,(v_input->>'dailyLimitFils')::integer,auth.uid());
      insert into public.app_masroofi_allowed_categories select v_child,v_card.controls_version+1,value
        from jsonb_array_elements_text(v_input->'allowedCategories');
      update public.app_masroofi_cards set controls_version=controls_version+1 where child_id=v_child;
    elsif v_type in ('card.top_up','reward.promise') then
      select coalesce(sum(amount_fils),0) into v_reserved from public.app_masroofi_promises where child_id=v_child and status='promised';
      if v_card.balance_fils+v_reserved+v_amount>1000000 then raise exception using errcode='PT400',message='balance_limit'; end if;
      if v_type='reward.promise' then
        if jsonb_typeof(p_command->'expectedTaskRevision') is distinct from 'number'
          or (p_command->>'expectedTaskRevision') !~ '^[0-9]{1,16}$' then
          raise exception using errcode='PT400',message='invalid_command'; end if;
        if v_task.revision<>(p_command->>'expectedTaskRevision')::bigint then raise exception using errcode='PT409',message='request_conflict'; end if;
        if exists(select 1 from public.app_masroofi_promises where task_id=v_task.id) then
          raise exception using errcode='PT400',message='promise_locked'; end if;
        if v_task.status<>'assigned' or v_task.submitted_at is not null or v_task.recognized_at is not null
          or v_task.step_states<>'{}'::jsonb or not public.ghaf_masroofi_eligible(v_task)
          or exists(select 1 from public.app_recognitions where task_id=v_task.id) then
          raise exception using errcode='PT400',message='task_ineligible'; end if;
        insert into public.app_masroofi_promises(family_id,child_id,task_id,task_revision,content_fingerprint,amount_fils,created_by)
          values(p_family_id,v_child,v_task.id,v_task.revision,sha256(convert_to(v_task.template::text,'UTF8')),v_amount,auth.uid());
      else
        update public.app_masroofi_cards set balance_fils=balance_fils+v_amount where child_id=v_child returning * into v_card;
        insert into public.app_masroofi_transactions(family_id,child_id,request_id,kind,amount_fils,status,day,balance_after_fils)
          values(p_family_id,v_child,p_request_id,'top_up',v_amount,'credited',(clock_timestamp() at time zone 'Asia/Dubai')::date,v_card.balance_fils);
      end if;
    else
      select x.category,x.online,x.amount into v_category,v_online,v_amount from (values
        ('stationery','stationery',false,300),('storybook','books',false,800),('football','sports',false,1800),
        ('art_supplies','arts',false,1000),('museum_ticket','outings',true,1500),('snack','snacks',false,400),
        ('gift','gifts',false,2000),('game_online','games',true,1200))x(id,category,online,amount)
        where x.id=p_command->>'fixtureId';
      if not found then raise exception using errcode='PT400',message='invalid_command'; end if;
      select * into v_controls from public.app_masroofi_control_versions where child_id=v_child and version=v_card.controls_version;
      v_day:=(clock_timestamp() at time zone 'Asia/Dubai')::date;
      select coalesce(sum(amount_fils),0) into v_spent from public.app_masroofi_transactions
        where child_id=v_child and day=v_day and kind='purchase' and status='approved';
      v_decline:=case when v_controls.frozen then 'card_frozen'
        when not exists(select 1 from public.app_masroofi_allowed_categories where child_id=v_child and controls_version=v_card.controls_version and category=v_category) then 'category_blocked'
        when v_online and not v_controls.online_allowed then 'online_blocked'
        when v_amount>v_controls.per_purchase_limit_fils then 'per_purchase_limit'
        when v_spent+v_amount>v_controls.daily_limit_fils then 'daily_limit'
        when v_amount>v_card.balance_fils then 'insufficient_balance' else null end;
      if v_decline is null then update public.app_masroofi_cards set balance_fils=balance_fils-v_amount where child_id=v_child returning * into v_card; end if;
      insert into public.app_masroofi_transactions(family_id,child_id,request_id,kind,amount_fils,status,decline_reason,fixture_id,day,balance_after_fils)
        values(p_family_id,v_child,p_request_id,'purchase',v_amount,case when v_decline is null then 'approved' else 'declined' end,
          v_decline,p_command->>'fixtureId',v_day,v_card.balance_fils);
    end if;
  end if;
  insert into public.app_masroofi_command_receipts(request_id,auth_user_id,family_id,command)
    values(p_request_id,auth.uid(),p_family_id,p_command);
  update public.app_families set revision=revision+1 where id=p_family_id;
  return jsonb_build_object('snapshot',public.ghaf_family_masroofi(p_family_id));
end; $$;

create function public.ghaf_masroofi_credit_recognition() returns trigger
language plpgsql security definer set search_path='' as $$
declare v_promise public.app_masroofi_promises; v_task public.app_tasks; v_actor record; v_balance integer;
  v_credited_at timestamptz:=clock_timestamp();
begin
  select * into v_promise from public.app_masroofi_promises where task_id=new.task_id;
  if not found then return new; end if;
  select * into v_actor from public.ghaf_family_actor(new.family_id);
  if v_actor.role<>'parent' then raise exception using errcode='42501',message='access_unavailable'; end if;
  perform 1 from public.app_families where id=new.family_id for update;
  select * into v_actor from public.ghaf_family_actor(new.family_id);
  select * into v_task from public.app_tasks where id=new.task_id;
  if v_promise.status<>'promised' or v_promise.family_id<>new.family_id or v_promise.child_id<>new.child_id
    or v_task.status<>'praised' or v_task.revision<v_promise.task_revision
    or sha256(convert_to(v_task.template::text,'UTF8'))<>v_promise.content_fingerprint then
    raise exception using errcode='PT400',message='promise_locked'; end if;
  update public.app_masroofi_cards set balance_fils=balance_fils+v_promise.amount_fils where child_id=new.child_id returning balance_fils into v_balance;
  update public.app_masroofi_promises set status='credited',recognition_id=new.id,credited_at=v_credited_at where id=v_promise.id;
  insert into public.app_masroofi_transactions(family_id,child_id,request_id,kind,amount_fils,status,day,balance_after_fils,task_id,promise_id,created_at)
    values(new.family_id,new.child_id,v_promise.id,'reward',v_promise.amount_fils,'credited',
      (v_credited_at at time zone 'Asia/Dubai')::date,v_balance,new.task_id,v_promise.id,v_credited_at);
  return new;
end; $$;
create trigger app_masroofi_recognition_credit after insert on public.app_recognitions
  for each row execute function public.ghaf_masroofi_credit_recognition();

revoke all on function public.ghaf_masroofi_immutable(),public.ghaf_masroofi_lock_promise(),
  public.ghaf_masroofi_lock_task(),public.ghaf_masroofi_eligible(public.app_tasks),
  public.ghaf_masroofi_credit_recognition(),public.ghaf_family_masroofi(uuid),
  public.ghaf_family_masroofi_command(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.ghaf_family_masroofi(uuid),public.ghaf_family_masroofi_command(uuid,uuid,jsonb) to authenticated;

notify pgrst,'reload schema';
commit;
