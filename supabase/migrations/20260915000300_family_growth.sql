begin;

-- Private evidence is additive. No sample balance, badge, promise or nominee is seeded.
create table public.app_badge_awards (
 family_id uuid not null references public.app_families(id), child_id uuid not null,
 badge_id text not null, awarded_at timestamptz not null, evidence jsonb not null,
 primary key(child_id,badge_id), foreign key(child_id,family_id) references public.app_children(id,family_id),
 check(badge_id in ('badge.journey.seed_start.v1','badge.journey.growing_branch.v1','badge.journey.expanding_shade.v1','badge.journey.coastal_care.v1',
 'badge.skill.sorting.bud.v1','badge.skill.sorting.branch.v1','badge.skill.sorting.shade.v1','badge.skill.water.bud.v1','badge.skill.water.branch.v1','badge.skill.water.shade.v1',
 'badge.skill.energy.bud.v1','badge.habitat.ghaf_roots.v1','badge.habitat.mangrove_care.v1','badge.biodiversity.wetland_exploration.v1','badge.heritage.date_palm_gifts.v1','badge.heritage.sadu_patterns.v1'))
);
create table public.app_reward_versions (
 id uuid not null, version integer not null check(version>0), family_id uuid not null references public.app_families(id), child_id uuid not null,
 current boolean not null default true, lifecycle text not null default 'promised' check(lifecycle in ('promised','unlocked','given')),
 month text not null check(month ~ '^\d{4}-(0[1-9]|1[0-2])$'), promise jsonb not null, milestone jsonb not null,
 promised_at timestamptz not null, unlocked_at timestamptz, given_at timestamptz, superseded_at timestamptz,
 created_by uuid not null references auth.users(id), primary key(id,version),
 foreign key(child_id,family_id) references public.app_children(id,family_id),
 check((lifecycle='promised' and unlocked_at is null and given_at is null) or
  (lifecycle='unlocked' and unlocked_at is not null and given_at is null) or
  (lifecycle='given' and unlocked_at is not null and given_at>=unlocked_at))
);
create unique index app_reward_current on public.app_reward_versions(id) where current;
create table public.app_league_weeks (
 id uuid primary key default gen_random_uuid(), family_id uuid not null references public.app_families(id),
 week_key text not null, revision bigint not null default 0, unique(family_id,week_key), unique(id,family_id)
);
create table public.app_league_participants (
 id uuid primary key default gen_random_uuid(), family_id uuid not null, week_id uuid not null,
 child_id uuid not null, nickname jsonb not null, tree_avatar text not null check(tree_avatar in ('mangrove_shoot','ghaf_leaf','sidr_sapling')),
 rest boolean not null default false, foreign key(week_id,family_id) references public.app_league_weeks(id,family_id),
 foreign key(child_id,family_id) references public.app_children(id,family_id), unique(week_id,child_id), unique(id,family_id)
);
create table public.app_league_leaves (
 participant_id uuid not null references public.app_league_participants(id), family_id uuid not null, child_id uuid not null,
 task_id uuid not null unique, recognition_id uuid unique references public.app_recognitions(id),
 primary key(participant_id,task_id), foreign key(task_id,family_id,child_id) references public.app_tasks(id,family_id,child_id),
 foreign key(participant_id,family_id) references public.app_league_participants(id,family_id)
);
create table public.app_league_encouragements (
 id uuid primary key default gen_random_uuid(), family_id uuid not null, week_id uuid not null,
 sender_id uuid not null, recipient_id uuid not null,
 phrase_id text not null check(phrase_id in ('great_growing','keep_growing','one_leaf_together')),
 created_at timestamptz not null default clock_timestamp(), check(sender_id<>recipient_id),
 foreign key(week_id,family_id) references public.app_league_weeks(id,family_id),
 foreign key(sender_id,family_id) references public.app_league_participants(id,family_id),
 foreign key(recipient_id,family_id) references public.app_league_participants(id,family_id),
 unique(week_id,sender_id,recipient_id,phrase_id)
);
create index app_rewards_child on public.app_reward_versions(family_id,child_id) where current;
alter table public.app_badge_awards enable row level security;
alter table public.app_reward_versions enable row level security;
alter table public.app_league_weeks enable row level security;
alter table public.app_league_participants enable row level security;
alter table public.app_league_leaves enable row level security;
alter table public.app_league_encouragements enable row level security;
revoke all on public.app_badge_awards,public.app_reward_versions,public.app_league_weeks,public.app_league_participants,public.app_league_leaves,public.app_league_encouragements from public,anon,authenticated;

create function public.ghaf_require_recent_parent_password(p_family_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare v_actor record; v_amr jsonb:=auth.jwt()->'amr'; v_now numeric:=extract(epoch from clock_timestamp()); v_item jsonb; v_stamp numeric; v_found boolean:=false;
begin
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 if v_actor.role<>'parent' then raise exception using errcode='42501',message='access_unavailable'; end if;
 if jsonb_typeof(v_amr)='array' then
  for v_item in select value from jsonb_array_elements(v_amr) loop
   if v_item->>'method'='password' and jsonb_typeof(v_item->'timestamp')='number' then
    v_stamp:=(v_item->>'timestamp')::numeric;
    if v_stamp<=v_now and v_stamp>=v_now-120 then v_found:=true; end if;
   end if;
  end loop;
 end if;
 if not v_found then raise exception using errcode='PT428',message='reauth_required'; end if;
end; $$;

create function public.ghaf_growth_week(p_time timestamptz default clock_timestamp()) returns text
language sql stable set search_path='' as $$ select to_char(p_time at time zone 'Asia/Dubai','IYYY-"W"IW'); $$;
create function public.ghaf_growth_eligible(p_task public.app_tasks,p_seeds integer) returns boolean
language sql immutable set search_path='' as $$
 select coalesce(p_seeds>0 and p_task.catalog_id='task_recycling_p0_v1'
 and p_task.template->>'id'='task_recycling_p0_v1' and p_task.template->>'recognitionMode'='standard'
 and p_task.template->>'routinePhase'='acquisition' and p_task.template->>'categoryId'='green_impact'
 and p_task.template->>'visibilityScope'='household' and p_task.template->'circleEligible'='true'::jsonb,false);
$$;
create function public.ghaf_growth_landscapes(p_family uuid,p_child uuid,p_since timestamptz default null,p_eligible boolean default false) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_object_agg(l.id,coalesce((select sum(r.seeds) from public.app_recognitions r join public.app_tasks t on t.id=r.task_id
  where r.family_id=p_family and r.child_id=p_child and r.landscape_id=l.id and (p_since is null or r.created_at>=p_since)
  and (not p_eligible or public.ghaf_growth_eligible(t,r.seeds))),0))
 from (values('ghaf'),('samar'),('sidr'),('date_palm'),('mangrove'))l(id);
$$;
create function public.ghaf_growth_reward_reached(p_milestone jsonb,p_totals jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare v_threshold integer; v_count integer;
begin
 if p_milestone->>'kind'='eligible_seed_delta' then
  return (select sum(value::bigint) from jsonb_each_text(p_totals)) >= (p_milestone->>'requiredSeedDelta')::bigint;
 end if;
 v_threshold:=case p_milestone->>'targetStage' when 'shoot' then 20 when 'sapling' then 60 when 'shade' then 120 when 'flourishing' then 200 end;
 if p_milestone->>'kind'='landscape_stage' then return (p_totals->>(p_milestone->>'landscapeId'))::bigint>=v_threshold; end if;
 select count(*) into v_count from jsonb_each_text(p_totals) where value::bigint>=v_threshold;
 return v_count>=(p_milestone->>'requiredCount')::integer;
end; $$;
create function public.ghaf_growth_evaluate(p_family uuid,p_child uuid,p_time timestamptz) returns void
language plpgsql security definer set search_path='' as $$
declare v_seeds bigint; v_credits bigint; v_recognitions jsonb; v_learning uuid; v_badge text; v_plan public.app_reward_versions; v_totals jsonb;
begin
 select coalesce(sum(r.seeds),0),coalesce(jsonb_agg(r.id order by r.created_at,r.id),'[]') into v_seeds,v_recognitions
  from public.app_recognitions r where r.family_id=p_family and r.child_id=p_child;
 select count(*) into v_credits from public.app_recognitions r join public.app_tasks t on t.id=r.task_id
  where r.family_id=p_family and r.child_id=p_child and public.ghaf_growth_eligible(t,r.seeds);
 select d.id into v_learning from public.app_family_documents d where d.family_id=p_family and d.child_id=p_child and d.kind='learning'
  and d.payload->>'packageId'='learning.mangrove_roots.v1' and d.payload->>'completedAt' is not null
  and d.payload->>'completedRoute' in ('story','accessible') limit 1;
 for v_badge in select id from (values
  ('badge.journey.seed_start.v1',v_seeds>=12),('badge.journey.growing_branch.v1',v_seeds>=60),
  ('badge.journey.expanding_shade.v1',v_seeds>=120),('badge.journey.coastal_care.v1',v_seeds>=180),
  ('badge.skill.sorting.bud.v1',v_credits>=1),('badge.skill.sorting.branch.v1',v_credits>=3),('badge.skill.sorting.shade.v1',v_credits>=7),
  ('badge.habitat.mangrove_care.v1',v_seeds>=132 and v_credits>=3 and v_learning is not null))b(id,reached) where reached
 loop
  insert into public.app_badge_awards(family_id,child_id,badge_id,awarded_at,evidence)
  values(p_family,p_child,v_badge,p_time,jsonb_build_object('recognitionIds',v_recognitions,'lifetimeSeeds',v_seeds,'sortingCredits',v_credits,'coastCareCredits',v_credits,'learningDocumentId',v_learning))
  on conflict(child_id,badge_id) do nothing;
 end loop;
 for v_plan in select * from public.app_reward_versions where family_id=p_family and child_id=p_child and current and lifecycle='promised' for update loop
  v_totals:=public.ghaf_growth_landscapes(p_family,p_child,v_plan.promised_at,true);
  if public.ghaf_growth_reward_reached(v_plan.milestone,v_totals) then
   update public.app_reward_versions set lifecycle='unlocked',unlocked_at=p_time where id=v_plan.id and version=v_plan.version;
  end if;
 end loop;
end; $$;
create function public.ghaf_growth_on_recognition() returns trigger
language plpgsql security definer set search_path='' as $$
declare v_task public.app_tasks;
begin
 select * into v_task from public.app_tasks where id=new.task_id;
 perform public.ghaf_growth_evaluate(new.family_id,new.child_id,new.created_at);
 if public.ghaf_growth_eligible(v_task,new.seeds) then
  update public.app_league_leaves l set recognition_id=new.id from public.app_league_participants p,public.app_league_weeks w
   where l.task_id=new.task_id and l.recognition_id is null and p.id=l.participant_id and w.id=p.week_id
    and w.week_key=public.ghaf_growth_week(new.created_at) and not p.rest;
 end if;
 return new;
end; $$;
create trigger ghaf_growth_recognition after insert on public.app_recognitions for each row execute function public.ghaf_growth_on_recognition();
create function public.ghaf_growth_on_learning() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.kind='learning' and new.payload->>'completedAt' is not null then
  if TG_OP='INSERT' then perform public.ghaf_growth_evaluate(new.family_id,new.child_id,(new.payload->>'completedAt')::timestamptz);
  elsif old.payload->>'completedAt' is null then perform public.ghaf_growth_evaluate(new.family_id,new.child_id,(new.payload->>'completedAt')::timestamptz); end if;
 end if;
 return new;
end; $$;
create trigger ghaf_growth_learning after insert or update on public.app_family_documents for each row execute function public.ghaf_growth_on_learning();

create function public.ghaf_family_growth(p_family_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_actor record; v_children jsonb; v_rewards jsonb; v_league jsonb:=null; v_week public.app_league_weeks;
 v_rows jsonb; v_nominations jsonb:='[]'; v_encouragements jsonb:='[]'; v_own uuid; v_count integer; v_goal integer; v_revision bigint;
begin
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 select revision into v_revision from public.app_families where id=p_family_id;
 select coalesce(jsonb_agg(jsonb_build_object('childId',c.id,
  'lifetimeSeeds',(select coalesce(sum(r.seeds),0) from public.app_recognitions r where r.family_id=p_family_id and r.child_id=c.id),
  'landscapeSeeds',public.ghaf_growth_landscapes(p_family_id,c.id),
  'sortingCredits',(select count(*) from public.app_recognitions r join public.app_tasks t on t.id=r.task_id where r.child_id=c.id and public.ghaf_growth_eligible(t,r.seeds)),
  'coastCareCredits',(select count(*) from public.app_recognitions r join public.app_tasks t on t.id=r.task_id where r.child_id=c.id and public.ghaf_growth_eligible(t,r.seeds)),
  'learningCompleted',(select coalesce(jsonb_agg(d.payload->>'packageId'),'[]') from public.app_family_documents d where d.family_id=p_family_id and d.child_id=c.id and d.kind='learning' and d.payload->>'completedAt' is not null),
  'badges',(select coalesce(jsonb_agg(jsonb_build_object('badgeId',a.badge_id,'awardedAt',a.awarded_at) order by a.awarded_at,a.badge_id),'[]') from public.app_badge_awards a where a.child_id=c.id)
 ) order by c.created_at,c.id),'[]') into v_children from public.app_children c
 where c.family_id=p_family_id and (v_actor.role='parent' or c.id=v_actor.child_id);
 select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'childId',p.child_id,'version',p.version,'lifecycle',p.lifecycle,
  'month',p.month,'promise',p.promise,'milestone',p.milestone,'promisedAt',p.promised_at,'unlockedAt',p.unlocked_at,'givenAt',p.given_at,
  'eligibleSeeds',(select sum(value::bigint) from jsonb_each_text(public.ghaf_growth_landscapes(p_family_id,p.child_id,p.promised_at,true))),
  'eligibleLandscapeSeeds',public.ghaf_growth_landscapes(p_family_id,p.child_id,p.promised_at,true)) order by p.promised_at,p.id),'[]')
 into v_rewards from public.app_reward_versions p where p.family_id=p_family_id and p.current and (v_actor.role='parent' or p.child_id=v_actor.child_id);
 select * into v_week from public.app_league_weeks where family_id=p_family_id and week_key=public.ghaf_growth_week();
 if found then
  select p.id into v_own from public.app_league_participants p where p.week_id=v_week.id and p.child_id=v_actor.child_id and not p.rest;
  select coalesce(jsonb_agg(jsonb_build_object('participantId',q.id,'nickname',q.nickname,'treeAvatarToken',q.tree_avatar,
    'completedLeafCount',q.confirmed,'score',q.confirmed*20,'position',q.position) order by q.position,q.id),'[]'),coalesce(sum(q.confirmed),0),count(*)*5 into v_rows,v_count,v_goal
  from (select p.id,p.nickname,p.tree_avatar,count(l.recognition_id)::integer confirmed,rank() over(order by count(l.recognition_id) desc)::integer position
    from public.app_league_participants p join public.app_children c on c.id=p.child_id and c.active
    left join public.app_league_leaves l on l.participant_id=p.id where p.week_id=v_week.id and not p.rest group by p.id)q;
  if v_actor.role='parent' then
   select coalesce(jsonb_agg(jsonb_build_object('participantId',p.id,'childId',p.child_id,'nickname',p.nickname,'treeAvatarToken',p.tree_avatar,'rest',p.rest,
    'taskIds',(select jsonb_agg(l.task_id order by l.task_id) from public.app_league_leaves l where l.participant_id=p.id)) order by p.id),'[]') into v_nominations from public.app_league_participants p where p.week_id=v_week.id;
  elsif v_own is not null then
   select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'senderId',e.sender_id,'recipientId',e.recipient_id,'phraseId',e.phrase_id,'createdAt',e.created_at) order by e.created_at,e.id),'[]') into v_encouragements
   from public.app_league_encouragements e where e.week_id=v_week.id and (e.sender_id=v_own or e.recipient_id=v_own);
  end if;
  v_league:=jsonb_build_object('weekKey',v_week.week_key,'revision',v_week.revision,'rows',v_rows,'cooperativeConfirmedCount',v_count,'cooperativeGoal',v_goal,
   'nominations',v_nominations,'ownParticipantId',v_own,'encouragements',v_encouragements);
 end if;
 return jsonb_build_object('schemaVersion',1,'actor',jsonb_build_object('userId',auth.uid(),'role',v_actor.role,'familyId',p_family_id,'childId',v_actor.child_id),
 'familyId',p_family_id,'revision',v_revision,'currentWeekKey',public.ghaf_growth_week(),'children',v_children,'rewards',v_rewards,'league',v_league);
end; $$;

create function public.ghaf_growth_validate_reward(p_promise jsonb,p_milestone jsonb,p_month text) returns void
language plpgsql immutable set search_path='' as $$
declare v_kind text:=p_promise->>'kind'; v_milestone text:=p_milestone->>'kind'; v_keys text[];
begin
 if p_month is null or p_month !~ '^\d{4}-(0[1-9]|1[0-2])$' or jsonb_typeof(p_promise)<>'object' or jsonb_typeof(p_milestone)<>'object'
  or v_kind is null or v_kind not in ('money','experience','privilege','gift') or v_milestone is null then raise exception using errcode='PT400',message='invalid_command'; end if;
 v_keys:=case when v_kind='money' then array['kind','label','currency','amountMinor'] else array['kind','label'] end;
 if not public.ghaf_doc_keys(p_promise,v_keys) or not public.ghaf_doc_keys(p_promise->'label',array['ar','en'])
  or not public.ghaf_doc_text(p_promise#>'{label,ar}',1,200) or not public.ghaf_doc_text(p_promise#>'{label,en}',1,200) then
  raise exception using errcode='PT400',message='invalid_command'; end if;
 if v_kind='money' and (jsonb_typeof(p_promise->'currency')<>'string' or coalesce(p_promise->>'currency','') !~ '^[A-Z]{3}$' or not public.ghaf_doc_number(p_promise->'amountMinor',0,9007199254740991,true)) then
  raise exception using errcode='PT400',message='invalid_command'; end if;
 if v_milestone='eligible_seed_delta' then
  if not public.ghaf_doc_keys(p_milestone,array['kind','requiredSeedDelta']) or not public.ghaf_doc_number(p_milestone->'requiredSeedDelta',1,9007199254740991,true) then raise exception using errcode='PT400',message='invalid_command'; end if;
 elsif v_milestone in ('landscape_stage','landscapes_at_stage') then
  if coalesce(p_milestone->>'targetStage','') not in ('shoot','sapling','shade','flourishing') then raise exception using errcode='PT400',message='invalid_command'; end if;
  if v_milestone='landscape_stage' then
   if not public.ghaf_doc_keys(p_milestone,array['kind','landscapeId','targetStage']) or coalesce(p_milestone->>'landscapeId','') not in ('ghaf','samar','sidr','date_palm','mangrove') then raise exception using errcode='PT400',message='invalid_command'; end if;
  elsif not public.ghaf_doc_keys(p_milestone,array['kind','targetStage','requiredCount']) or not public.ghaf_doc_number(p_milestone->'requiredCount',1,5,true) then raise exception using errcode='PT400',message='invalid_command'; end if;
 else raise exception using errcode='PT400',message='invalid_command'; end if;
end; $$;

create function public.ghaf_family_growth_command(p_family_id uuid,p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_actor record; v_type text:=p_command->>'type'; v_receipt public.app_command_receipts; v_bound jsonb:=jsonb_build_object('growth',p_command);
 v_child uuid; v_plan public.app_reward_versions; v_id uuid; v_now timestamptz; v_week public.app_league_weeks; v_part public.app_league_participants;
 v_expected bigint; v_task uuid; v_taskrow public.app_tasks; v_ids uuid[]; v_sender uuid; v_recipient uuid; v_count integer; v_keys text[];
begin
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 if p_request_id is null or jsonb_typeof(p_command)<>'object' or v_type is null then raise exception using errcode='PT400',message='invalid_command'; end if;
 v_keys:=case v_type
  when 'reward.create' then array['type','childId','month','promise','milestone']
  when 'reward.revise' then array['type','planId','expectedVersion','month','promise','milestone']
  when 'reward.give' then array['type','planId','expectedVersion']
  when 'league.nominate' then array['type','childId','expectedRevision','nickname','treeAvatarToken','taskIds']
  when 'league.rest' then array['type','childId','expectedRevision','rest']
  when 'league.encourage' then array['type','recipientId','phraseId'] end;
 if v_keys is null or not public.ghaf_doc_keys(p_command,v_keys) then raise exception using errcode='PT400',message='invalid_command'; end if;
 if v_type in ('reward.revise','reward.give') and not public.ghaf_doc_number(p_command->'expectedVersion',1,2147483646,true) then raise exception using errcode='PT400',message='invalid_command'; end if;
 if v_type in ('league.nominate','league.rest') and not public.ghaf_doc_number(p_command->'expectedRevision',0,9007199254740990,true) then raise exception using errcode='PT400',message='invalid_command'; end if;
 perform 1 from public.app_families where id=p_family_id for update;
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 v_now:=clock_timestamp();
 select * into v_receipt from public.app_command_receipts where auth_user_id=auth.uid() and request_id=p_request_id;
 if found then
  if v_receipt.family_id<>p_family_id or v_receipt.command<>v_bound then raise exception using errcode='PT409',message='request_conflict'; end if;
  return jsonb_build_object('snapshot',public.ghaf_family_growth(p_family_id));
 end if;
 if v_type<>'league.encourage' and v_actor.role<>'parent' then raise exception using errcode='42501',message='access_unavailable'; end if;
 if v_type in ('reward.create','reward.revise') then
  perform public.ghaf_growth_validate_reward(p_command->'promise',p_command->'milestone',p_command->>'month');
  if v_type='reward.revise' or p_command#>>'{promise,kind}'='money' then perform public.ghaf_require_recent_parent_password(p_family_id); end if;
  if v_type='reward.create' then
   if p_command-array['type','childId','month','promise','milestone']<>'{}'::jsonb then raise exception using errcode='PT400',message='invalid_command'; end if;
   v_child:=(p_command->>'childId')::uuid; v_id:=gen_random_uuid();
   if not exists(select 1 from public.app_children where id=v_child and family_id=p_family_id and active) then raise exception using errcode='PT400',message='invalid_command'; end if;
   insert into public.app_reward_versions(id,version,family_id,child_id,month,promise,milestone,promised_at,created_by)
    values(v_id,1,p_family_id,v_child,p_command->>'month',p_command->'promise',p_command->'milestone',v_now,auth.uid());
  else
   if p_command-array['type','planId','expectedVersion','month','promise','milestone']<>'{}'::jsonb then raise exception using errcode='PT400',message='invalid_command'; end if;
   select * into v_plan from public.app_reward_versions where id=(p_command->>'planId')::uuid and family_id=p_family_id and current for update;
   if not found then raise exception using errcode='PT400',message='invalid_command'; end if;
   if v_plan.version<>(p_command->>'expectedVersion')::integer then raise exception using errcode='PT409',message='request_conflict'; end if;
   if v_plan.lifecycle<>'promised' then raise exception using errcode='PT409',message='invalid_transition'; end if;
   update public.app_reward_versions set current=false,superseded_at=v_now where id=v_plan.id and version=v_plan.version;
   insert into public.app_reward_versions(id,version,family_id,child_id,month,promise,milestone,promised_at,created_by)
    values(v_plan.id,v_plan.version+1,p_family_id,v_plan.child_id,p_command->>'month',p_command->'promise',p_command->'milestone',v_now,auth.uid());
  end if;
 elsif v_type='reward.give' then
  perform public.ghaf_require_recent_parent_password(p_family_id);
  if p_command-array['type','planId','expectedVersion']<>'{}'::jsonb then raise exception using errcode='PT400',message='invalid_command'; end if;
  select * into v_plan from public.app_reward_versions where id=(p_command->>'planId')::uuid and family_id=p_family_id and current for update;
  if not found then raise exception using errcode='PT400',message='invalid_command'; end if;
  if v_plan.version<>(p_command->>'expectedVersion')::integer then raise exception using errcode='PT409',message='request_conflict'; end if;
  if v_plan.lifecycle='promised' then raise exception using errcode='PT409',message='invalid_transition'; end if;
  if v_plan.lifecycle='unlocked' then update public.app_reward_versions set lifecycle='given',given_at=v_now where id=v_plan.id and version=v_plan.version; end if;
 elsif v_type in ('league.nominate','league.rest') then
  perform public.ghaf_require_recent_parent_password(p_family_id);
  v_child:=(p_command->>'childId')::uuid; v_expected:=(p_command->>'expectedRevision')::bigint;
  if v_expected is null or v_expected<0 or not exists(select 1 from public.app_children where id=v_child and family_id=p_family_id and active) then raise exception using errcode='PT400',message='invalid_command'; end if;
  select * into v_week from public.app_league_weeks where family_id=p_family_id and week_key=public.ghaf_growth_week(v_now) for update;
  if not found then
   if v_expected<>0 or v_type='league.rest' then raise exception using errcode='PT409',message='request_conflict'; end if;
   insert into public.app_league_weeks(family_id,week_key) values(p_family_id,public.ghaf_growth_week(v_now)) returning * into v_week;
  elsif v_week.revision<>v_expected then raise exception using errcode='PT409',message='request_conflict'; end if;
  select * into v_part from public.app_league_participants where week_id=v_week.id and child_id=v_child;
  if v_type='league.rest' then
   if p_command-array['type','childId','expectedRevision','rest']<>'{}'::jsonb or jsonb_typeof(p_command->'rest')<>'boolean' or v_part.id is null then raise exception using errcode='PT400',message='invalid_command'; end if;
   update public.app_league_participants set rest=(p_command->>'rest')::boolean where id=v_part.id;
  else
   if not public.ghaf_doc_keys(p_command->'nickname',array['ar','en'])
    or not public.ghaf_doc_text(p_command#>'{nickname,ar}',1,40)
    or not public.ghaf_doc_text(p_command#>'{nickname,en}',1,40) or coalesce(p_command->>'treeAvatarToken','') not in ('mangrove_shoot','ghaf_leaf','sidr_sapling')
    or jsonb_typeof(p_command->'taskIds')<>'array' or jsonb_array_length(p_command->'taskIds')<>5 then raise exception using errcode='PT400',message='invalid_command'; end if;
   select array_agg(value::uuid),count(distinct value) into v_ids,v_count from jsonb_array_elements_text(p_command->'taskIds');
   if v_count<>5 then raise exception using errcode='PT400',message='invalid_command'; end if;
   if v_part.id is not null and exists(select 1 from public.app_league_leaves where participant_id=v_part.id and recognition_id is not null) then raise exception using errcode='PT409',message='invalid_transition'; end if;
   foreach v_task in array v_ids loop
    select * into v_taskrow from public.app_tasks where id=v_task and family_id=p_family_id and child_id=v_child;
    if not found or v_taskrow.status='recognized' or not public.ghaf_growth_eligible(v_taskrow,coalesce((v_taskrow.template->>'displayedSeedAward')::integer,0))
      or not exists(select 1 from public.app_children c where c.id=v_child and v_taskrow.template->'childAgeBands' ? c.age_band)
      or exists(select 1 from public.app_league_leaves l where l.task_id=v_task and l.participant_id is distinct from v_part.id) then raise exception using errcode='PT400',message='invalid_command'; end if;
   end loop;
   if v_part.id is null then
    insert into public.app_league_participants(family_id,week_id,child_id,nickname,tree_avatar) values(p_family_id,v_week.id,v_child,p_command->'nickname',p_command->>'treeAvatarToken') returning * into v_part;
   else
    delete from public.app_league_leaves where participant_id=v_part.id;
    update public.app_league_participants set nickname=p_command->'nickname',tree_avatar=p_command->>'treeAvatarToken' where id=v_part.id;
   end if;
   insert into public.app_league_leaves(participant_id,family_id,child_id,task_id) select v_part.id,p_family_id,v_child,unnest(v_ids);
  end if;
  update public.app_league_weeks set revision=revision+1 where id=v_week.id;
 elsif v_type='league.encourage' then
  if v_actor.role<>'child' then raise exception using errcode='42501',message='access_unavailable'; end if;
  if p_command-array['type','recipientId','phraseId']<>'{}'::jsonb or coalesce(p_command->>'phraseId','') not in ('great_growing','keep_growing','one_leaf_together') then raise exception using errcode='PT400',message='invalid_command'; end if;
  select * into v_week from public.app_league_weeks where family_id=p_family_id and week_key=public.ghaf_growth_week(v_now);
  select id into v_sender from public.app_league_participants where week_id=v_week.id and child_id=v_actor.child_id and not rest;
  select p.id into v_recipient from public.app_league_participants p join public.app_children c on c.id=p.child_id and c.active where p.id=(p_command->>'recipientId')::uuid and p.week_id=v_week.id and not p.rest;
  if v_sender is null or v_recipient is null or v_sender=v_recipient then raise exception using errcode='PT400',message='invalid_command'; end if;
  insert into public.app_league_encouragements(family_id,week_id,sender_id,recipient_id,phrase_id) values(p_family_id,v_week.id,v_sender,v_recipient,p_command->>'phraseId') on conflict(week_id,sender_id,recipient_id,phrase_id) do nothing;
 else raise exception using errcode='PT400',message='invalid_command'; end if;
 update public.app_families set revision=revision+1 where id=p_family_id;
 insert into public.app_command_receipts(auth_user_id,request_id,family_id,command) values(auth.uid(),p_request_id,p_family_id,v_bound);
 return jsonb_build_object('snapshot',public.ghaf_family_growth(p_family_id));
exception when invalid_text_representation or numeric_value_out_of_range or not_null_violation then raise exception using errcode='PT400',message='invalid_command';
end; $$;

revoke all on function public.ghaf_require_recent_parent_password(uuid),public.ghaf_growth_week(timestamptz),public.ghaf_growth_eligible(public.app_tasks,integer),
 public.ghaf_growth_landscapes(uuid,uuid,timestamptz,boolean),public.ghaf_growth_reward_reached(jsonb,jsonb),public.ghaf_growth_evaluate(uuid,uuid,timestamptz),
 public.ghaf_growth_on_recognition(),public.ghaf_growth_on_learning(),public.ghaf_growth_validate_reward(jsonb,jsonb,text),
 public.ghaf_family_growth(uuid),public.ghaf_family_growth_command(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.ghaf_family_growth(uuid),public.ghaf_family_growth_command(uuid,uuid,jsonb) to authenticated;
commit;
