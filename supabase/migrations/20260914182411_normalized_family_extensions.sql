-- Normalized private extensions. The core dispatcher owns identity, locking, revision and deduplication.
begin;
create table ghaf_private.reward_plans (
  id uuid primary key default gen_random_uuid(), family_id uuid not null references ghaf_private.families(id),
  child_id uuid not null references ghaf_private.children(id), version integer not null default 1 check(version>0),
  label text not null check(length(btrim(label)) between 1 and 160),
  kind text not null check(kind in ('money','gift','experience','privilege')),
  amount_fils integer check(amount_fils between 1 and 1000000),
  month text not null check(month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  monthly_maximum_fils integer not null check(monthly_maximum_fils between 0 and 1000000),
  milestone jsonb not null, status text not null default 'promised' check(status in ('promised','unlocked','given')),
  created_at timestamptz not null default clock_timestamp(), revised_at timestamptz not null default clock_timestamp(),
  unlocked_at timestamptz, given_at timestamptz,
  check((kind='money')=(amount_fils is not null)),
  check((status='promised')=(unlocked_at is null)), check((status='given')=(given_at is not null))
);
create table ghaf_private.reward_plan_versions (
  plan_id uuid not null references ghaf_private.reward_plans(id), version integer not null,
  terms jsonb not null, created_at timestamptz not null default clock_timestamp(), primary key(plan_id,version)
);
create table ghaf_private.reward_contributions (
  plan_id uuid not null references ghaf_private.reward_plans(id), version integer not null,
  recognition_id uuid not null references ghaf_private.recognitions(id),
  amount integer not null check(amount>0), landscape_id text not null,
  created_at timestamptz not null default clock_timestamp(), primary key(plan_id,version,recognition_id),
  foreign key(plan_id,version) references ghaf_private.reward_plan_versions(plan_id,version)
);

create table ghaf_private.masroofi_cards (
  child_id uuid primary key references ghaf_private.children(id), family_id uuid not null references ghaf_private.families(id),
  control_version integer not null default 1, balance_fils integer not null default 0 check(balance_fils between 0 and 1000000),
  age_attested_at timestamptz not null default clock_timestamp(), created_at timestamptz not null default clock_timestamp()
);
create table ghaf_private.masroofi_control_versions (
  child_id uuid not null references ghaf_private.masroofi_cards(child_id), version integer not null check(version>0),
  frozen boolean not null default false, online_allowed boolean not null default false,
  per_purchase_limit_fils integer not null check(per_purchase_limit_fils between 1 and 1000000),
  daily_limit_fils integer not null check(daily_limit_fils between 1 and 1000000),
  created_at timestamptz not null default clock_timestamp(), primary key(child_id,version)
);
create table ghaf_private.masroofi_categories (
  id text primary key check(id in ('stationery','books','sports','arts','outings','snacks','gifts','games'))
);
insert into ghaf_private.masroofi_categories values
  ('stationery'),('books'),('sports'),('arts'),('outings'),('snacks'),('gifts'),('games');
create table ghaf_private.masroofi_allowed_categories (
  child_id uuid not null, version integer not null, category_id text not null references ghaf_private.masroofi_categories(id),
  primary key(child_id,version,category_id),
  foreign key(child_id,version) references ghaf_private.masroofi_control_versions(child_id,version)
);
create table ghaf_private.masroofi_products (
  id text primary key, category_id text not null references ghaf_private.masroofi_categories(id),
  online boolean not null, amount_fils integer not null check(amount_fils>0)
);
insert into ghaf_private.masroofi_products values
  ('stationery','stationery',false,300),('storybook','books',false,800),('football','sports',false,1800),
  ('art_supplies','arts',false,1000),('museum_ticket','outings',true,1500),('snack','snacks',false,400),
  ('gift','gifts',false,2000),('game_online','games',true,1200);
create table ghaf_private.masroofi_promises (
  id uuid primary key default gen_random_uuid(), family_id uuid not null references ghaf_private.families(id),
  child_id uuid not null references ghaf_private.masroofi_cards(child_id),
  assignment_id uuid not null references ghaf_private.assignments(id),
  task_id uuid not null, task_version integer not null, content_fingerprint text not null,
  amount_fils integer not null check(amount_fils between 1 and 10000),
  status text not null default 'promised' check(status in ('promised','credited')),
  recognition_id uuid unique references ghaf_private.recognitions(id), created_at timestamptz not null default clock_timestamp(),
  foreign key(task_id,task_version) references ghaf_private.task_versions(task_id,version), unique(assignment_id,task_version),
  check((status='credited')=(recognition_id is not null))
);
create table ghaf_private.masroofi_ledger (
  id uuid primary key default gen_random_uuid(), family_id uuid not null references ghaf_private.families(id),
  child_id uuid not null references ghaf_private.masroofi_cards(child_id), request_id uuid not null,
  kind text not null check(kind in ('reward','top_up','purchase')), amount_fils integer not null check(amount_fils>0),
  status text not null check(status in ('credited','approved','declined')), decline_reason text,
  product_id text references ghaf_private.masroofi_products(id), control_version integer not null,
  day date not null default (timezone('Asia/Dubai',now())::date),
  balance_after_fils integer not null check(balance_after_fils between 0 and 1000000),
  assignment_id uuid references ghaf_private.assignments(id), recognition_id uuid unique references ghaf_private.recognitions(id),
  created_at timestamptz not null default clock_timestamp(), unique(child_id,request_id,kind),
  foreign key(child_id,control_version) references ghaf_private.masroofi_control_versions(child_id,version),
  check((status='declined')=(decline_reason is not null))
);

create table ghaf_private.study_plans (
  id uuid primary key default gen_random_uuid(), family_id uuid not null references ghaf_private.families(id),
  child_id uuid not null references ghaf_private.children(id), created_by text not null check(created_by in ('parent','child')),
  subject text not null check(length(btrim(subject)) between 1 and 80), title text not null check(length(btrim(title)) between 1 and 120),
  next_step text not null check(length(btrim(next_step)) between 1 and 300),
  duration_minutes integer not null check(duration_minutes between 1 and 60), due_date date, revisit_date date,
  status text not null check(status in ('proposed','planned','active','paused','completed')),
  help_request text check(help_request in ('explain','smaller_step','together')),
  created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(), completed_at timestamptz,
  check((status='completed')=(completed_at is not null))
);
create table ghaf_private.study_help_events (
  id uuid primary key default gen_random_uuid(), plan_id uuid not null references ghaf_private.study_plans(id),
  request text not null check(request in ('explain','smaller_step','together','resolved')),
  created_at timestamptz not null default clock_timestamp()
);
create table ghaf_private.academic_goals (
  id uuid primary key default gen_random_uuid(), family_id uuid not null references ghaf_private.families(id),
  child_id uuid not null references ghaf_private.children(id), created_by text not null check(created_by in ('parent','child')),
  version integer not null default 1, status text not null default 'proposed'
    check(status in ('proposed','active','paused','awaiting_confirmation','acknowledged','declined','change_requested')),
  parent_approved_version integer, child_accepted_version integer,
  prize_status text check(prize_status in ('promised','unlocked','given')),
  created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
  acknowledged_at timestamptz, unlocked_at timestamptz, given_at timestamptz,
  check((status='acknowledged')=(acknowledged_at is not null)),
  check((prize_status='given') is not true or given_at is not null)
);
create table ghaf_private.academic_goal_versions (
  goal_id uuid not null references ghaf_private.academic_goals(id), version integer not null check(version>0),
  subject text not null check(length(btrim(subject)) between 1 and 80), title text not null check(length(btrim(title)) between 1 and 120),
  next_step text not null check(length(btrim(next_step)) between 1 and 300),
  parent_support text not null check(length(btrim(parent_support)) between 1 and 300),
  criterion_kind text not null check(criterion_kind in ('practice_count','achievement','mark')),
  criterion_target integer check(criterion_target between 1 and 1000), criterion_description text,
  criterion_threshold numeric check(criterion_threshold between 0 and 1000000),
  criterion_denominator numeric check(criterion_denominator>0 and criterion_denominator<=1000000),
  prize_kind text check(prize_kind in ('gift','experience','privilege')), prize_label text,
  created_at timestamptz not null default clock_timestamp(), primary key(goal_id,version),
  check((prize_kind is null)=(prize_label is null)),
  check(prize_label is null or length(btrim(prize_label)) between 1 and 160),
  check((criterion_kind='practice_count' and criterion_target is not null and criterion_threshold is null and criterion_description is null)
    or (criterion_kind='achievement' and length(btrim(criterion_description)) between 1 and 300 and criterion_target is null and criterion_threshold is null)
    or (criterion_kind='mark' and criterion_threshold is not null and criterion_denominator is not null and criterion_threshold<=criterion_denominator and criterion_target is null and criterion_description is null))
);
create table ghaf_private.academic_goal_acceptances (
  goal_id uuid not null, version integer not null, actor_role text not null check(actor_role in ('parent','child')),
  actor_user_id uuid not null references auth.users(id), created_at timestamptz not null default clock_timestamp(),
  primary key(goal_id,version,actor_role), foreign key(goal_id,version) references ghaf_private.academic_goal_versions(goal_id,version)
);
create table ghaf_private.academic_results (
  id uuid primary key default gen_random_uuid(), goal_id uuid not null, version integer not null,
  result jsonb not null, acknowledgement text check(length(btrim(acknowledgement)) between 1 and 300),
  met_criterion boolean, created_at timestamptz not null default clock_timestamp(), reviewed_at timestamptz,
  foreign key(goal_id,version) references ghaf_private.academic_goal_versions(goal_id,version),
  check((reviewed_at is null)=(met_criterion is null)), check((reviewed_at is null)=(acknowledgement is null))
);

create table ghaf_private.learning_packages (
  id text primary key, label_ar text not null, label_en text not null, unlock_threshold integer not null check(unlock_threshold>=0),
  available boolean not null default false, correct_option text not null, other_option text not null
);
insert into ghaf_private.learning_packages values
  ('learning.mangrove_roots.v1','بين جذور القرم','Among the Mangrove Roots',132,true,'habitat_support_and_care','visit_or_task_reward'),
  ('learning.ghaf_basics.v1','أساسيات الغاف','Ghaf basics',0,false,'',''),
  ('learning.wetland.v1','الأراضي الرطبة','Wetland learning',0,false,'',''),
  ('learning.date_palm.v1','النخلة','Date palm learning',0,false,'',''),
  ('learning.sadu.v1','السدو','Al-Sadu learning',0,false,'','');
create table ghaf_private.learning_steps (
  learning_id text not null references ghaf_private.learning_packages(id), route text not null check(route in ('story','accessible')),
  id text not null, ordinal integer not null check(ordinal>0), primary key(learning_id,route,id), unique(learning_id,route,ordinal)
);
insert into ghaf_private.learning_steps values
  ('learning.mangrove_roots.v1','story','story_frame_1',1),('learning.mangrove_roots.v1','story','story_frame_2',2),
  ('learning.mangrove_roots.v1','accessible','accessible_section_1',1),('learning.mangrove_roots.v1','accessible','accessible_section_2',2);
create table ghaf_private.learning_progress (
  child_id uuid not null references ghaf_private.children(id), learning_id text not null references ghaf_private.learning_packages(id),
  route text not null check(route in ('story','accessible')), check_satisfied boolean not null default false,
  check_attempts integer not null default 0, created_at timestamptz not null default clock_timestamp(), primary key(child_id,learning_id,route)
);
create table ghaf_private.learning_step_progress (
  child_id uuid not null, learning_id text not null, route text not null, step_id text not null,
  created_at timestamptz not null default clock_timestamp(), primary key(child_id,learning_id,route,step_id),
  foreign key(child_id,learning_id,route) references ghaf_private.learning_progress(child_id,learning_id,route),
  foreign key(learning_id,route,step_id) references ghaf_private.learning_steps(learning_id,route,id)
);
create table ghaf_private.learning_completions (
  child_id uuid not null references ghaf_private.children(id), learning_id text not null references ghaf_private.learning_packages(id),
  route text not null check(route in ('story','accessible')), created_at timestamptz not null default clock_timestamp(), primary key(child_id,learning_id)
);
create table ghaf_private.activity_definitions (
  id text primary key, semantic_component text not null unique, available boolean not null default false
);
insert into ghaf_private.activity_definitions values
  ('activity.wetland_observation.v1','observation_activity',false),
  ('activity.date_palm_reuse.v1','parent_led_reuse_activity',false),
  ('activity.original_sadu_pattern.v1','original_pattern_activity',false);
create table ghaf_private.activity_completions (
  child_id uuid not null references ghaf_private.children(id), activity_id text not null references ghaf_private.activity_definitions(id),
  created_at timestamptz not null default clock_timestamp(), primary key(child_id,activity_id)
);
create table ghaf_private.badge_definitions (
  id text primary key, label_ar text not null, label_en text not null, criteria jsonb not null
);
insert into ghaf_private.badge_definitions values
('badge.journey.seed_start.v1','بذرة البداية','Seed Start','[{"kind":"lifetime_seeds","required":12}]'),
('badge.journey.growing_branch.v1','غصن نامٍ','Growing Branch','[{"kind":"lifetime_seeds","required":60}]'),
('badge.journey.expanding_shade.v1','ظلّ يتّسع','Expanding Shade','[{"kind":"lifetime_seeds","required":120}]'),
('badge.journey.coastal_care.v1','رعاية الساحل','Coastal Care','[{"kind":"lifetime_seeds","required":180}]'),
('badge.skill.sorting.bud.v1','الفرز الذكي — برعم','Smart Sorting — Bud','[{"kind":"acquisition_credits","skillId":"skill.sorting","required":1}]'),
('badge.skill.sorting.branch.v1','الفرز الذكي — غصن','Smart Sorting — Branch','[{"kind":"prerequisite_badge","badgeId":"badge.skill.sorting.bud.v1"},{"kind":"acquisition_credits","skillId":"skill.sorting","required":3}]'),
('badge.skill.sorting.shade.v1','الفرز الذكي — ظل','Smart Sorting — Shade','[{"kind":"prerequisite_badge","badgeId":"badge.skill.sorting.branch.v1"},{"kind":"acquisition_credits","skillId":"skill.sorting","required":7}]'),
('badge.skill.water.bud.v1','ترشيد المياه — برعم','Water Care — Bud','[{"kind":"station_reached","threshold":156},{"kind":"acquisition_credits","skillId":"skill.water","required":2}]'),
('badge.skill.water.branch.v1','ترشيد المياه — غصن','Water Care — Branch','[{"kind":"prerequisite_badge","badgeId":"badge.skill.water.bud.v1"},{"kind":"acquisition_credits","skillId":"skill.water","required":5}]'),
('badge.skill.water.shade.v1','ترشيد المياه — ظل','Water Care — Shade','[{"kind":"prerequisite_badge","badgeId":"badge.skill.water.branch.v1"},{"kind":"acquisition_credits","skillId":"skill.water","required":10}]'),
('badge.skill.energy.bud.v1','ترشيد الطاقة — برعم','Energy Care — Bud','[{"kind":"acquisition_credits","skillId":"skill.energy","required":2}]'),
('badge.habitat.ghaf_roots.v1','جذور الغاف','Ghaf Roots','[{"kind":"learning_completed","learningId":"learning.ghaf_basics.v1"},{"kind":"acquisition_credits","skillId":"skill.nature","required":3}]'),
('badge.habitat.mangrove_care.v1','رعاية القرم','Mangrove Care','[{"kind":"station_reached","threshold":132},{"kind":"learning_completed","learningId":"learning.mangrove_roots.v1"},{"kind":"acquisition_credits","skillId":"skill.coast_care","required":3}]'),
('badge.biodiversity.wetland_exploration.v1','استكشاف الأراضي الرطبة','Wetland Exploration','[{"kind":"semantic_component","component":"wetland_learning"},{"kind":"semantic_component","component":"observation_activity"}]'),
('badge.heritage.date_palm_gifts.v1','عطاء النخلة','Gifts of the Date Palm','[{"kind":"semantic_component","component":"date_palm_learning"},{"kind":"semantic_component","component":"parent_led_reuse_activity"}]'),
('badge.heritage.sadu_patterns.v1','نقوش السدو','Al-Sadu Patterns','[{"kind":"semantic_component","component":"sadu_learning"},{"kind":"semantic_component","component":"original_pattern_activity"}]');
create table ghaf_private.badge_awards (
  child_id uuid not null references ghaf_private.children(id), badge_id text not null references ghaf_private.badge_definitions(id),
  created_at timestamptz not null default clock_timestamp(), primary key(child_id,badge_id)
);

create table ghaf_private.family_circles (
  id uuid primary key default gen_random_uuid(), owner_family_id uuid not null references ghaf_private.families(id),
  name text not null check(length(btrim(name)) between 1 and 80), created_at timestamptz not null default clock_timestamp()
);
create table ghaf_private.circle_invitations (
  id uuid primary key default gen_random_uuid(), circle_id uuid not null references ghaf_private.family_circles(id),
  invited_owner_id uuid not null references auth.users(id), expires_at timestamptz not null default clock_timestamp()+interval '7 days',
  accepted_at timestamptz, revoked_at timestamptz, created_at timestamptz not null default clock_timestamp()
);
create table ghaf_private.circle_families (
  circle_id uuid not null references ghaf_private.family_circles(id), family_id uuid not null references ghaf_private.families(id),
  active boolean not null default true, joined_at timestamptz not null default clock_timestamp(), primary key(circle_id,family_id)
);
create table ghaf_private.league_members (
  circle_id uuid not null, child_id uuid not null references ghaf_private.children(id),
  family_id uuid not null, nickname text not null check(length(btrim(nickname)) between 1 and 40),
  avatar_id text not null check(avatar_id in ('ghaf','samar','sidr','date_palm','mangrove')),
  active boolean not null default true, primary key(circle_id,child_id),
  foreign key(circle_id,family_id) references ghaf_private.circle_families(circle_id,family_id)
);
create table ghaf_private.league_weeks (
  circle_id uuid not null, child_id uuid not null, week date not null, rest_week boolean not null default false,
  created_at timestamptz not null default clock_timestamp(), primary key(circle_id,child_id,week),
  foreign key(circle_id,child_id) references ghaf_private.league_members(circle_id,child_id)
);
create table ghaf_private.league_nominations (
  circle_id uuid not null, child_id uuid not null, week date not null, slot integer not null check(slot between 1 and 5),
  assignment_id uuid not null references ghaf_private.assignments(id), recognition_id uuid references ghaf_private.recognitions(id),
  primary key(circle_id,child_id,week,slot), unique(circle_id,child_id,week,assignment_id),
  foreign key(circle_id,child_id,week) references ghaf_private.league_weeks(circle_id,child_id,week)
);
create table ghaf_private.canopy_contributions (
  circle_id uuid not null references ghaf_private.family_circles(id), recognition_id uuid not null references ghaf_private.recognitions(id),
  week date not null, created_at timestamptz not null default clock_timestamp(), primary key(circle_id,recognition_id)
);
create table ghaf_private.green_circle_events (
  circle_id uuid not null references ghaf_private.family_circles(id), recognition_id uuid not null references ghaf_private.recognitions(id),
  created_at timestamptz not null default clock_timestamp(), primary key(circle_id,recognition_id)
);

create index reward_plans_family_child on ghaf_private.reward_plans(family_id,child_id);
create index masroofi_ledger_child_day on ghaf_private.masroofi_ledger(child_id,day,status);
create index study_plans_family_child on ghaf_private.study_plans(family_id,child_id);
create index academic_goals_family_child on ghaf_private.academic_goals(family_id,child_id);
create index circle_invitation_owner on ghaf_private.circle_invitations(invited_owner_id);
create index circle_family_membership on ghaf_private.circle_families(family_id,active);

-- These tables deliberately have no client policies/grants: only the existing guarded API is callable.
do $$ declare n text; begin
  foreach n in array array['reward_plans','reward_plan_versions','reward_contributions','masroofi_cards',
    'masroofi_control_versions','masroofi_categories','masroofi_allowed_categories','masroofi_products','masroofi_promises',
    'masroofi_ledger','study_plans','study_help_events','academic_goals','academic_goal_versions','academic_goal_acceptances',
    'academic_results','learning_packages','learning_steps','learning_progress','learning_step_progress','learning_completions',
    'activity_definitions','activity_completions','badge_definitions','badge_awards','family_circles','circle_invitations',
    'circle_families','league_members','league_weeks','league_nominations','canopy_contributions','green_circle_events'] loop
    execute format('alter table ghaf_private.%I enable row level security',n);
    execute format('revoke all on ghaf_private.%I from public, anon, authenticated',n);
  end loop;
end $$;

create function ghaf_private.require_fresh_extension_parent(p_role text,p_user_id uuid) returns void
language plpgsql security invoker set search_path='' as $$
begin
  if p_role<>'parent' then raise exception using errcode='PT403',message='parent_required'; end if;
  perform ghaf_private.require_fresh_parent(p_user_id);
end $$;

create function ghaf_private.extension_keys(p_value jsonb,p_allowed text[]) returns void
language plpgsql security invoker set search_path='' as $$
begin
  if jsonb_typeof(p_value) is distinct from 'object' then raise exception using errcode='PT400',message='invalid_input'; end if;
  if exists(select 1 from jsonb_object_keys(p_value) k where not(k=any(p_allowed)))
    then raise exception using errcode='PT400',message='invalid_input'; end if;
end $$;

create function ghaf_private.save_goal_version(p_goal_id uuid,p_version integer,p_input jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare c jsonb:=p_input->'criterion'; p jsonb:=p_input->'prize';
begin
  perform ghaf_private.extension_keys(p_input,array['subject','title','nextStep','parentSupport','criterion','prize']);
  case c->>'kind'
    when 'practice_count' then
      perform ghaf_private.extension_keys(c,array['kind','target']);
      if jsonb_typeof(c->'target') is distinct from 'number' then raise exception using errcode='PT400',message='invalid_input'; end if;
    when 'achievement' then
      perform ghaf_private.extension_keys(c,array['kind','description']);
      if jsonb_typeof(c->'description') is distinct from 'string' then raise exception using errcode='PT400',message='invalid_input'; end if;
    when 'mark' then
      perform ghaf_private.extension_keys(c,array['kind','threshold','denominator']);
      if jsonb_typeof(c->'threshold') is distinct from 'number' or jsonb_typeof(c->'denominator') is distinct from 'number'
        then raise exception using errcode='PT400',message='invalid_input'; end if;
    else raise exception using errcode='PT400',message='invalid_input';
  end case;
  if p is not null and p<>'null'::jsonb then
    perform ghaf_private.extension_keys(p,array['kind','label']);
    if p->>'kind' not in ('gift','experience','privilege') or p->>'kind' is null or p->>'label' is null
      then raise exception using errcode='PT400',message='invalid_input'; end if;
  end if;
  insert into ghaf_private.academic_goal_versions(goal_id,version,subject,title,next_step,parent_support,criterion_kind,
    criterion_target,criterion_description,criterion_threshold,criterion_denominator,prize_kind,prize_label)
  values(p_goal_id,p_version,btrim(p_input->>'subject'),btrim(p_input->>'title'),btrim(p_input->>'nextStep'),
    btrim(p_input->>'parentSupport'),c->>'kind',(c->>'target')::integer,c->>'description',(c->>'threshold')::numeric,
    (c->>'denominator')::numeric,p->>'kind',p->>'label');
end $$;

create or replace function ghaf_private.command_extras(p_command jsonb,p_family_id uuid,p_child_id uuid,p_role text,p_user_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare action text:=p_command->>'type'; v_now timestamptz:=clock_timestamp(); v_child_id uuid; entity_id uuid; v_amount integer; total bigint;
  input jsonb:=p_command->'input'; ctl jsonb:=p_command->'controls'; v_milestone jsonb:=p_command->'milestone';
  plan ghaf_private.reward_plans%rowtype; card ghaf_private.masroofi_cards%rowtype;
  controls ghaf_private.masroofi_control_versions%rowtype; product ghaf_private.masroofi_products%rowtype;
  assignment ghaf_private.assignments%rowtype; task_version ghaf_private.task_versions%rowtype;
  study ghaf_private.study_plans%rowtype; goal ghaf_private.academic_goals%rowtype;
  terms ghaf_private.academic_goal_versions%rowtype; result_row ghaf_private.academic_results%rowtype;
  package ghaf_private.learning_packages%rowtype; progress ghaf_private.learning_progress%rowtype;
  circle ghaf_private.family_circles%rowtype; invitation ghaf_private.circle_invitations%rowtype;
  request_id uuid:=nullif(current_setting('ghaf.request_id',true),'')::uuid;
  day_now date:=timezone('Asia/Dubai',now())::date;
  week_start date:=date_trunc('week',timezone('Asia/Dubai',now()))::date;
  decline text; kind text; ver integer; meets boolean; v_route text:=p_command->>'route';
  ids uuid[]; item uuid; slot_no integer; ordinal_no integer;
begin
  if p_role is null or p_role not in ('parent','child') then raise exception using errcode='PT403',message='forbidden'; end if;
  if p_role='child' and p_child_id is null then raise exception using errcode='PT403',message='forbidden'; end if;
  if p_command ? 'childId' then
    v_child_id:=(p_command->>'childId')::uuid;
    if p_role='child' and v_child_id is distinct from p_child_id then raise exception using errcode='PT403',message='forbidden'; end if;
  else v_child_id:=p_child_id; end if;
  if v_child_id is not null and not exists(select 1 from ghaf_private.children c where c.id=v_child_id and c.family_id=p_family_id and c.active)
    then raise exception using errcode='PT403',message='forbidden'; end if;

  if action in ('reward.create','reward.edit') then
    perform ghaf_private.extension_keys(p_command,array['type','id','childId','label','kind','amountFils','month','monthlyMaximumFils','milestone','expectedVersion']);
    perform ghaf_private.require_fresh_extension_parent(p_role,p_user_id);
    if v_child_id is null then raise exception using errcode='PT400',message='invalid_input'; end if;
    if action='reward.edit' then
      select * into plan from ghaf_private.reward_plans where id=(p_command->>'id')::uuid and family_id=p_family_id and reward_plans.child_id=v_child_id for update;
      if not found then raise exception using errcode='PT404',message='not_found'; end if;
      if coalesce((p_command->>'expectedVersion')::integer,-1)<>plan.version then raise exception using errcode='PT409',message='stale_revision'; end if;
      if plan.status<>'promised' then raise exception using errcode='PT409',message='immutable_reward'; end if;
    elsif (select count(*) from ghaf_private.reward_plans where family_id=p_family_id)>=200 then
      raise exception using errcode='PT409',message='limit_reached';
    end if;
    case v_milestone->>'kind'
      when 'eligible_seed_delta' then
        perform ghaf_private.extension_keys(v_milestone,array['kind','requiredSeedDelta']);
        if coalesce((v_milestone->>'requiredSeedDelta')::integer,0) not between 1 and 1000000 then raise exception using errcode='PT400',message='invalid_input'; end if;
      when 'landscape_stage' then
        perform ghaf_private.extension_keys(v_milestone,array['kind','landscapeId','targetStage']);
        if v_milestone->>'landscapeId' is null or v_milestone->>'landscapeId' not in ('ghaf','samar','sidr','date_palm','mangrove') then raise exception using errcode='PT400',message='invalid_input'; end if;
      when 'landscapes_at_stage' then
        perform ghaf_private.extension_keys(v_milestone,array['kind','requiredCount','targetStage']);
        if coalesce((v_milestone->>'requiredCount')::integer,0) not between 1 and 5 then raise exception using errcode='PT400',message='invalid_input'; end if;
      else raise exception using errcode='PT400',message='invalid_input';
    end case;
    if v_milestone->>'kind'<>'eligible_seed_delta' and (v_milestone->>'targetStage' is null or v_milestone->>'targetStage' not in ('shoot','sapling','shade','flourishing'))
      then raise exception using errcode='PT400',message='invalid_input'; end if;
    if p_command->>'month' is null or p_command->>'month'<to_char(day_now,'YYYY-MM') then raise exception using errcode='PT400',message='invalid_month'; end if;
    v_amount:=case when p_command->>'kind'='money' then (p_command->>'amountFils')::integer else null end;
    select coalesce(sum(amount_fils),0) into total from ghaf_private.reward_plans where family_id=p_family_id
      and month=p_command->>'month' and id is distinct from plan.id;
    if p_command->>'kind'='money' and total+coalesce(v_amount,0)>coalesce((p_command->>'monthlyMaximumFils')::integer,-1) then raise exception using errcode='PT409',message='monthly_limit'; end if;
    if action='reward.create' then
      insert into ghaf_private.reward_plans(family_id,child_id,label,kind,amount_fils,month,monthly_maximum_fils,milestone)
        values(p_family_id,v_child_id,btrim(p_command->>'label'),p_command->>'kind',v_amount,p_command->>'month',(p_command->>'monthlyMaximumFils')::integer,v_milestone) returning * into plan;
    else
      update ghaf_private.reward_plans set label=btrim(p_command->>'label'),kind=p_command->>'kind',amount_fils=v_amount,
        month=p_command->>'month',monthly_maximum_fils=(p_command->>'monthlyMaximumFils')::integer,milestone=v_milestone,
        version=version+1,revised_at=v_now where id=plan.id returning * into plan;
    end if;
    insert into ghaf_private.reward_plan_versions(plan_id,version,terms) values(plan.id,plan.version,to_jsonb(plan));
    return jsonb_build_object('id',plan.id);
  elsif action='reward.give' then
    perform ghaf_private.extension_keys(p_command,array['type','id']);
    if p_role<>'parent' then raise exception using errcode='PT403',message='parent_required'; end if;
    update ghaf_private.reward_plans set status='given',given_at=v_now where id=(p_command->>'id')::uuid and family_id=p_family_id and status='unlocked';
    if not found then raise exception using errcode='PT409',message='invalid_transition'; end if;
    return '{}'::jsonb;
  end if;

  if action like 'masroofi.%' then
    if action='masroofi.promise' then
      perform ghaf_private.extension_keys(p_command,array['type','assignmentId','amountFils','expectedTaskVersion']);
      perform ghaf_private.require_fresh_extension_parent(p_role,p_user_id);
      select * into assignment from ghaf_private.assignments where id=(p_command->>'assignmentId')::uuid and family_id=p_family_id;
      if not found then raise exception using errcode='PT404',message='not_found'; end if;
      if coalesce((p_command->>'expectedTaskVersion')::integer,-1)<>assignment.task_version then raise exception using errcode='PT409',message='stale_revision'; end if;
      v_child_id:=assignment.child_id;
    elsif action='masroofi.purchase' then
      perform ghaf_private.extension_keys(p_command,array['type','fixtureId']);
      if p_role<>'child' then raise exception using errcode='PT403',message='child_required'; end if;
      v_child_id:=p_child_id;
    elsif action='masroofi.enable' then
      perform ghaf_private.extension_keys(p_command,array['type','childId']);
      perform ghaf_private.require_fresh_extension_parent(p_role,p_user_id);
      if not exists(select 1 from ghaf_private.children c where c.id=v_child_id and c.family_id=p_family_id
        and c.active and c.age_band in ('9_11','12_14') and c.age10_plus_confirmed)
        then raise exception using errcode='PT409',message='age_ineligible'; end if;
      if exists(select 1 from ghaf_private.masroofi_cards c where c.child_id=v_child_id) then return '{}'::jsonb; end if;
      insert into ghaf_private.masroofi_cards(child_id,family_id) values(v_child_id,p_family_id);
      insert into ghaf_private.masroofi_control_versions(child_id,version,per_purchase_limit_fils,daily_limit_fils) values(v_child_id,1,2000,5000);
      insert into ghaf_private.masroofi_allowed_categories(child_id,version,category_id) values(v_child_id,1,'stationery');
      return '{}'::jsonb;
    elsif action='masroofi.controls' then
      perform ghaf_private.extension_keys(p_command,array['type','childId','controls','expectedVersion']);
      perform ghaf_private.require_fresh_extension_parent(p_role,p_user_id);
    elsif action='masroofi.top_up' then
      perform ghaf_private.extension_keys(p_command,array['type','childId','amountFils']);
      perform ghaf_private.require_fresh_extension_parent(p_role,p_user_id);
    else raise exception using errcode='PT400',message='invalid_command'; end if;
    select * into card from ghaf_private.masroofi_cards c where c.child_id=v_child_id and c.family_id=p_family_id for update;
    if not found then raise exception using errcode='PT409',message='card_disabled'; end if;
    if action in ('masroofi.purchase','masroofi.top_up','masroofi.promise') and not exists(
      select 1 from ghaf_private.children c where c.id=card.child_id and c.family_id=p_family_id and c.active
        and c.age_band in ('9_11','12_14') and c.age10_plus_confirmed)
      then raise exception using errcode='PT409',message='age_ineligible'; end if;
    select * into strict controls from ghaf_private.masroofi_control_versions c where c.child_id=card.child_id and version=card.control_version;
    if action='masroofi.controls' then
      if coalesce((p_command->>'expectedVersion')::integer,-1)<>card.control_version then raise exception using errcode='PT409',message='stale_revision'; end if;
      perform ghaf_private.extension_keys(ctl,array['frozen','onlineAllowed','allowedCategories','perPurchaseLimitFils','dailyLimitFils']);
      if jsonb_typeof(ctl->'frozen') is distinct from 'boolean' or jsonb_typeof(ctl->'onlineAllowed') is distinct from 'boolean'
        or jsonb_typeof(ctl->'allowedCategories') is distinct from 'array' then raise exception using errcode='PT400',message='invalid_controls'; end if;
      if jsonb_array_length(ctl->'allowedCategories')<> (select count(distinct value) from jsonb_array_elements_text(ctl->'allowedCategories'))
        then raise exception using errcode='PT400',message='invalid_controls'; end if;
      insert into ghaf_private.masroofi_control_versions(child_id,version,frozen,online_allowed,per_purchase_limit_fils,daily_limit_fils)
        values(card.child_id,card.control_version+1,(ctl->>'frozen')::boolean,(ctl->>'onlineAllowed')::boolean,
          (ctl->>'perPurchaseLimitFils')::integer,(ctl->>'dailyLimitFils')::integer);
      insert into ghaf_private.masroofi_allowed_categories(child_id,version,category_id)
        select card.child_id,card.control_version+1,value from jsonb_array_elements_text(ctl->'allowedCategories');
      update ghaf_private.masroofi_cards set control_version=control_version+1 where masroofi_cards.child_id=card.child_id;
    elsif action in ('masroofi.top_up','masroofi.promise') then
      v_amount:=(p_command->>'amountFils')::integer;
      if v_amount is null or v_amount<1 or v_amount>(case when action='masroofi.promise' then 10000 else 50000 end)
        then raise exception using errcode='PT400',message='invalid_amount'; end if;
      select coalesce(sum(p.amount_fils),0) into total from ghaf_private.masroofi_promises p
        join ghaf_private.assignments a on a.id=p.assignment_id and a.task_version=p.task_version
        where p.child_id=card.child_id and p.status='promised';
      if card.balance_fils+total+v_amount>1000000 then raise exception using errcode='PT409',message='balance_limit'; end if;
      if action='masroofi.promise' then
        select * into strict task_version from ghaf_private.task_versions where task_id=assignment.task_id and version=assignment.task_version;
        if assignment.state<>'assigned' or not task_version.reward_eligible or task_version.routine_phase<>'acquisition'
          or task_version.recognition_mode='recognition_only' then raise exception using errcode='PT409',message='task_ineligible'; end if;
        if exists(select 1 from ghaf_private.masroofi_promises p where p.assignment_id=assignment.id and p.task_version=assignment.task_version) then raise exception using errcode='PT409',message='promise_locked'; end if;
        insert into ghaf_private.masroofi_promises(family_id,child_id,assignment_id,task_id,task_version,content_fingerprint,amount_fils)
          values(p_family_id,card.child_id,assignment.id,assignment.task_id,assignment.task_version,task_version.content_fingerprint,v_amount);
      else
        update ghaf_private.masroofi_cards set balance_fils=balance_fils+v_amount where masroofi_cards.child_id=card.child_id;
        insert into ghaf_private.masroofi_ledger(family_id,child_id,request_id,kind,amount_fils,status,control_version,balance_after_fils)
          values(p_family_id,card.child_id,request_id,'top_up',v_amount,'credited',card.control_version,card.balance_fils+v_amount);
      end if;
    else
      select * into product from ghaf_private.masroofi_products where id=p_command->>'fixtureId';
      if not found then raise exception using errcode='PT400',message='invalid_input'; end if;
      select coalesce(sum(amount_fils),0) into total from ghaf_private.masroofi_ledger l
        where l.child_id=card.child_id and l.day=day_now and l.kind='purchase' and l.status='approved';
      decline:=case when controls.frozen then 'card_frozen'
        when not exists(select 1 from ghaf_private.masroofi_allowed_categories where masroofi_allowed_categories.child_id=card.child_id
          and version=card.control_version and category_id=product.category_id) then 'category_blocked'
        when product.online and not controls.online_allowed then 'online_blocked'
        when product.amount_fils>controls.per_purchase_limit_fils then 'per_purchase_limit'
        when total+product.amount_fils>controls.daily_limit_fils then 'daily_limit'
        when product.amount_fils>card.balance_fils then 'insufficient_balance' else null end;
      if decline is null then update ghaf_private.masroofi_cards set balance_fils=balance_fils-product.amount_fils where masroofi_cards.child_id=card.child_id; end if;
      insert into ghaf_private.masroofi_ledger(family_id,child_id,request_id,kind,amount_fils,status,decline_reason,product_id,control_version,balance_after_fils)
        values(p_family_id,card.child_id,request_id,'purchase',product.amount_fils,case when decline is null then 'approved' else 'declined' end,
          decline,product.id,card.control_version,card.balance_fils-case when decline is null then product.amount_fils else 0 end);
      return jsonb_build_object('status',case when decline is null then 'approved' else 'declined' end,'declineReason',decline);
    end if;
    return '{}'::jsonb;
  end if;

  if action like 'study.%' then
    if action='study.create' then
      perform ghaf_private.extension_keys(p_command,array['type','childId','input']);
      perform ghaf_private.extension_keys(input,array['subject','title','nextStep','durationMinutes','dueDate','revisitDate']);
      if v_child_id is null then raise exception using errcode='PT400',message='invalid_input'; end if;
      if (select count(*) from ghaf_private.study_plans where family_id=p_family_id)>=200 then raise exception using errcode='PT409',message='limit_reached'; end if;
      insert into ghaf_private.study_plans(family_id,child_id,created_by,subject,title,next_step,duration_minutes,due_date,revisit_date,status)
        values(p_family_id,v_child_id,p_role,btrim(input->>'subject'),btrim(input->>'title'),btrim(input->>'nextStep'),
          (input->>'durationMinutes')::integer,(input->>'dueDate')::date,(input->>'revisitDate')::date,
          case when p_role='parent' then 'proposed' else 'planned' end) returning id into entity_id;
      return jsonb_build_object('id',entity_id);
    end if;
    perform ghaf_private.extension_keys(p_command,array['type','id','request','date']);
    select * into study from ghaf_private.study_plans where id=(p_command->>'id')::uuid and family_id=p_family_id;
    if not found or (p_role='child' and study.child_id<>p_child_id) then raise exception using errcode='PT404',message='not_found'; end if;
    if action not in ('study.help_resolved','study.revisit') and p_role<>'child' then raise exception using errcode='PT403',message='child_required'; end if;
    if study.status='completed' then raise exception using errcode='PT409',message='invalid_transition'; end if;
    case action
      when 'study.accept' then
        if study.status<>'proposed' then raise exception using errcode='PT409',message='invalid_transition'; end if;
        update ghaf_private.study_plans set status='planned',updated_at=v_now where id=study.id;
      when 'study.start' then
        if study.status not in ('planned','paused') then raise exception using errcode='PT409',message='invalid_transition'; end if;
        update ghaf_private.study_plans set status='active',updated_at=v_now where id=study.id;
      when 'study.pause' then
        if study.status<>'active' then raise exception using errcode='PT409',message='invalid_transition'; end if;
        update ghaf_private.study_plans set status='paused',updated_at=v_now where id=study.id;
      when 'study.complete' then
        if study.status<>'active' then raise exception using errcode='PT409',message='invalid_transition'; end if;
        update ghaf_private.study_plans set status='completed',completed_at=v_now,updated_at=v_now,help_request=null where id=study.id;
      when 'study.help' then
        if study.status='proposed' or p_command->>'request' is null or p_command->>'request' not in ('explain','smaller_step','together')
          then raise exception using errcode='PT400',message='invalid_input'; end if;
        update ghaf_private.study_plans set help_request=p_command->>'request',updated_at=v_now where id=study.id;
        insert into ghaf_private.study_help_events(plan_id,request) values(study.id,p_command->>'request');
      when 'study.help_resolved' then
        update ghaf_private.study_plans set help_request=null,updated_at=v_now where id=study.id;
        insert into ghaf_private.study_help_events(plan_id,request) values(study.id,'resolved');
      when 'study.revisit' then update ghaf_private.study_plans set revisit_date=(p_command->>'date')::date,updated_at=v_now where id=study.id;
      else raise exception using errcode='PT400',message='invalid_command';
    end case;
    return '{}'::jsonb;
  end if;

  if action like 'goal.%' then
    if action='goal.create' then
      perform ghaf_private.extension_keys(p_command,array['type','childId','input']);
      if v_child_id is null then raise exception using errcode='PT400',message='invalid_input'; end if;
      if (select count(*) from ghaf_private.academic_goals where family_id=p_family_id)>=200 then raise exception using errcode='PT409',message='limit_reached'; end if;
      insert into ghaf_private.academic_goals(family_id,child_id,created_by,prize_status)
        values(p_family_id,v_child_id,p_role,case when input->'prize' is not null and input->'prize'<>'null'::jsonb then 'promised' else null end) returning * into goal;
      perform ghaf_private.save_goal_version(goal.id,1,input);
      return jsonb_build_object('id',goal.id);
    end if;
    perform ghaf_private.extension_keys(p_command,array['type','id','input','result','submissionId','acknowledgement','expectedRevision']);
    select * into goal from ghaf_private.academic_goals where id=(p_command->>'id')::uuid and family_id=p_family_id for update;
    if not found or (p_role='child' and goal.child_id<>p_child_id) then raise exception using errcode='PT404',message='not_found'; end if;
    select * into strict terms from ghaf_private.academic_goal_versions where goal_id=goal.id and version=goal.version;
    if action in ('goal.edit','goal.approve','goal.accept') and coalesce((p_command->>'expectedRevision')::integer,-1)<>goal.version
      then raise exception using errcode='PT409',message='stale_revision'; end if;
    if action in ('goal.approve','goal.confirm','goal.give') and p_role<>'parent' then raise exception using errcode='PT403',message='parent_required'; end if;
    if action in ('goal.accept','goal.submit') and p_role<>'child' then raise exception using errcode='PT403',message='child_required'; end if;
    case action
      when 'goal.edit' then
        if goal.child_accepted_version is not null or goal.status not in ('proposed','change_requested','declined') then raise exception using errcode='PT409',message='immutable_goal'; end if;
        perform ghaf_private.save_goal_version(goal.id,goal.version+1,input);
        update ghaf_private.academic_goals set version=version+1,parent_approved_version=null,status='proposed',updated_at=v_now,
          prize_status=case when input->'prize' is not null and input->'prize'<>'null'::jsonb then 'promised' else null end where id=goal.id;
      when 'goal.approve' then
        if goal.status<>'proposed' or goal.child_accepted_version is not null then raise exception using errcode='PT409',message='invalid_transition'; end if;
        insert into ghaf_private.academic_goal_acceptances(goal_id,version,actor_role,actor_user_id) values(goal.id,goal.version,'parent',p_user_id) on conflict do nothing;
        update ghaf_private.academic_goals set parent_approved_version=version,updated_at=v_now where id=goal.id;
      when 'goal.accept' then
        if goal.status<>'proposed' or goal.parent_approved_version is distinct from goal.version then raise exception using errcode='PT409',message='invalid_transition'; end if;
        insert into ghaf_private.academic_goal_acceptances(goal_id,version,actor_role,actor_user_id) values(goal.id,goal.version,'child',p_user_id) on conflict do nothing;
        update ghaf_private.academic_goals set child_accepted_version=version,status='active',updated_at=v_now where id=goal.id;
      when 'goal.decline' then
        if goal.child_accepted_version is not null or goal.status not in ('proposed','change_requested') then raise exception using errcode='PT409',message='invalid_transition'; end if;
        update ghaf_private.academic_goals set status='declined',updated_at=v_now where id=goal.id;
      when 'goal.request_change' then
        if goal.status not in ('proposed','active','paused') then raise exception using errcode='PT409',message='invalid_transition'; end if;
        update ghaf_private.academic_goals set status='change_requested',updated_at=v_now where id=goal.id;
      when 'goal.pause' then
        if goal.status<>'active' then raise exception using errcode='PT409',message='invalid_transition'; end if;
        update ghaf_private.academic_goals set status='paused',updated_at=v_now where id=goal.id;
      when 'goal.resume' then
        if goal.status not in ('paused','change_requested') or goal.child_accepted_version is distinct from goal.version then raise exception using errcode='PT409',message='invalid_transition'; end if;
        update ghaf_private.academic_goals set status='active',updated_at=v_now where id=goal.id;
      when 'goal.submit' then
        if goal.status<>'active' or goal.child_accepted_version is distinct from goal.version then raise exception using errcode='PT409',message='invalid_transition'; end if;
        if (select count(*) from ghaf_private.academic_results where goal_id=goal.id)>=30 then raise exception using errcode='PT409',message='limit_reached'; end if;
        input:=p_command->'result';
        if input->>'kind' is distinct from terms.criterion_kind then raise exception using errcode='PT400',message='invalid_result'; end if;
        case terms.criterion_kind
          when 'practice_count' then
            perform ghaf_private.extension_keys(input,array['kind','count']);
            if jsonb_typeof(input->'count') is distinct from 'number' or (input->>'count')::integer not between 0 and 1000000 then raise exception using errcode='PT400',message='invalid_result'; end if;
          when 'achievement' then
            perform ghaf_private.extension_keys(input,array['kind','achieved']);
            if jsonb_typeof(input->'achieved') is distinct from 'boolean' then raise exception using errcode='PT400',message='invalid_result'; end if;
          when 'mark' then
            perform ghaf_private.extension_keys(input,array['kind','value']);
            if jsonb_typeof(input->'value') is distinct from 'number' or (input->>'value')::numeric not between 0 and terms.criterion_denominator then raise exception using errcode='PT400',message='invalid_result'; end if;
        end case;
        insert into ghaf_private.academic_results(goal_id,version,result) values(goal.id,goal.version,input);
        update ghaf_private.academic_goals set status='awaiting_confirmation',updated_at=v_now where id=goal.id;
      when 'goal.confirm' then
        if goal.status<>'awaiting_confirmation' then raise exception using errcode='PT409',message='invalid_transition'; end if;
        select * into result_row from ghaf_private.academic_results where id=(p_command->>'submissionId')::uuid and goal_id=goal.id and version=goal.version and reviewed_at is null;
        if not found then raise exception using errcode='PT404',message='not_found'; end if;
        if p_command->>'acknowledgement' is null then raise exception using errcode='PT400',message='invalid_input'; end if;
        meets:=case terms.criterion_kind when 'practice_count' then (result_row.result->>'count')::integer>=terms.criterion_target
          when 'achievement' then (result_row.result->>'achieved')::boolean when 'mark' then (result_row.result->>'value')::numeric>=terms.criterion_threshold else false end;
        update ghaf_private.academic_results set acknowledgement=btrim(p_command->>'acknowledgement'),met_criterion=meets,reviewed_at=v_now where id=result_row.id;
        update ghaf_private.academic_goals set status=case when meets then 'acknowledged' else 'active' end,
          acknowledged_at=case when meets then v_now else null end,
          prize_status=case when meets and terms.prize_kind is not null then 'unlocked' else prize_status end,
          unlocked_at=case when meets and terms.prize_kind is not null then v_now else null end,updated_at=v_now where id=goal.id;
      when 'goal.give' then
        if goal.prize_status is distinct from 'unlocked' then raise exception using errcode='PT409',message='invalid_transition'; end if;
        update ghaf_private.academic_goals set prize_status='given',given_at=v_now,updated_at=v_now where id=goal.id;
      else raise exception using errcode='PT400',message='invalid_command';
    end case;
    return '{}'::jsonb;
  end if;

  if action like 'learning.%' then
    perform ghaf_private.extension_keys(p_command,array['type','learningId','route','stepId','optionId']);
    if p_role<>'child' then raise exception using errcode='PT403',message='child_required'; end if;
    select * into package from ghaf_private.learning_packages where id=p_command->>'learningId';
    if not found or not package.available or v_route is null or v_route not in ('story','accessible') then raise exception using errcode='PT409',message='learning_unavailable'; end if;
    select coalesce(sum(amount),0) into total from ghaf_private.seed_entries where seed_entries.child_id=p_child_id;
    if total<package.unlock_threshold then raise exception using errcode='PT409',message='learning_locked'; end if;
    if action='learning.start' then
      insert into ghaf_private.learning_progress(child_id,learning_id,route) values(p_child_id,package.id,v_route) on conflict do nothing;
      return '{}'::jsonb;
    end if;
    select * into progress from ghaf_private.learning_progress p where p.child_id=p_child_id and learning_id=package.id and p.route=v_route;
    if not found then raise exception using errcode='PT409',message='invalid_transition'; end if;
    if action='learning.step' then
      select ordinal into ordinal_no from ghaf_private.learning_steps s where learning_id=package.id and s.route=v_route and id=p_command->>'stepId';
      if not found then raise exception using errcode='PT400',message='invalid_input'; end if;
      if exists(select 1 from ghaf_private.learning_steps s where learning_id=package.id and s.route=v_route and ordinal<ordinal_no
        and not exists(select 1 from ghaf_private.learning_step_progress p where p.child_id=p_child_id and p.learning_id=s.learning_id and p.route=s.route and p.step_id=s.id))
        then raise exception using errcode='PT409',message='invalid_transition'; end if;
      insert into ghaf_private.learning_step_progress(child_id,learning_id,route,step_id) values(p_child_id,package.id,v_route,p_command->>'stepId') on conflict do nothing;
    elsif action in ('learning.check','learning.complete') then
      if exists(select 1 from ghaf_private.learning_steps s where learning_id=package.id and s.route=v_route
        and not exists(select 1 from ghaf_private.learning_step_progress p where p.child_id=p_child_id and p.learning_id=s.learning_id and p.route=s.route and p.step_id=s.id))
        then raise exception using errcode='PT409',message='invalid_transition'; end if;
      if action='learning.check' then
        if p_command->>'optionId' is null or p_command->>'optionId' not in (package.correct_option,package.other_option) then raise exception using errcode='PT400',message='invalid_input'; end if;
        update ghaf_private.learning_progress set check_attempts=check_attempts+1,check_satisfied=check_satisfied or p_command->>'optionId'=package.correct_option
          where learning_progress.child_id=p_child_id and learning_id=package.id and learning_progress.route=v_route;
      else
        if not progress.check_satisfied then raise exception using errcode='PT409',message='learning_check_required'; end if;
        insert into ghaf_private.learning_completions(child_id,learning_id,route) values(p_child_id,package.id,v_route) on conflict do nothing;
        perform ghaf_private.evaluate_badges(p_child_id);
      end if;
    else raise exception using errcode='PT400',message='invalid_command'; end if;
    return '{}'::jsonb;
  end if;

  if action like 'circle.%' or action like 'league.%' then
    if p_role<>'parent' then raise exception using errcode='PT403',message='parent_required'; end if;
    if action='circle.create' then
      perform ghaf_private.extension_keys(p_command,array['type','name']);
      if (select count(*) from ghaf_private.family_circles where owner_family_id=p_family_id)>=10 then raise exception using errcode='PT409',message='limit_reached'; end if;
      insert into ghaf_private.family_circles(owner_family_id,name) values(p_family_id,btrim(p_command->>'name')) returning id into entity_id;
      insert into ghaf_private.circle_families(circle_id,family_id) values(entity_id,p_family_id);
      return jsonb_build_object('id',entity_id);
    elsif action='circle.accept' then
      perform ghaf_private.extension_keys(p_command,array['type','invitationId']);
      select * into invitation from ghaf_private.circle_invitations where id=(p_command->>'invitationId')::uuid
        and invited_owner_id=p_user_id and accepted_at is null and revoked_at is null and expires_at>now();
      if not found then raise exception using errcode='PT409',message='invitation_unavailable'; end if;
      perform 1 from ghaf_private.family_circles where id=invitation.circle_id for update;
      select * into invitation from ghaf_private.circle_invitations where id=(p_command->>'invitationId')::uuid
        and invited_owner_id=p_user_id and accepted_at is null and revoked_at is null and expires_at>now() for update;
      if not found then raise exception using errcode='PT409',message='invitation_unavailable'; end if;
      update ghaf_private.circle_invitations set accepted_at=v_now where id=invitation.id;
      insert into ghaf_private.circle_families(circle_id,family_id) values(invitation.circle_id,p_family_id)
        on conflict(circle_id,family_id) do update set active=true;
      return '{}'::jsonb;
    end if;
    perform ghaf_private.extension_keys(p_command,array['type','circleId','invitedOwnerId','familyId','childId','nickname','avatarId','assignmentIds']);
    select * into circle from ghaf_private.family_circles where id=(p_command->>'circleId')::uuid for update;
    if not found or not exists(select 1 from ghaf_private.circle_families where circle_id=circle.id and family_id=p_family_id and active)
      then raise exception using errcode='PT403',message='forbidden'; end if;
    if action='circle.invite' then
      if circle.owner_family_id<>p_family_id then raise exception using errcode='PT403',message='forbidden'; end if;
      if not exists(select 1 from ghaf_private.families where owner_user_id=(p_command->>'invitedOwnerId')::uuid)
        then raise exception using errcode='PT404',message='not_found'; end if;
      insert into ghaf_private.circle_invitations(circle_id,invited_owner_id) values(circle.id,(p_command->>'invitedOwnerId')::uuid) returning id into entity_id;
      return jsonb_build_object('id',entity_id);
    elsif action='circle.revoke' then
      entity_id:=(p_command->>'familyId')::uuid;
      if entity_id is null or entity_id=circle.owner_family_id or (circle.owner_family_id<>p_family_id and entity_id<>p_family_id)
        then raise exception using errcode='PT403',message='forbidden'; end if;
      update ghaf_private.circle_families set active=false where circle_id=circle.id and family_id=entity_id;
      update ghaf_private.circle_invitations set revoked_at=v_now where circle_id=circle.id and invited_owner_id=(select owner_user_id from ghaf_private.families where id=entity_id) and revoked_at is null;
      return '{}'::jsonb;
    elsif action='circle.join_child' then
      if v_child_id is null then raise exception using errcode='PT400',message='invalid_input'; end if;
      insert into ghaf_private.league_members(circle_id,child_id,family_id,nickname,avatar_id)
        values(circle.id,v_child_id,p_family_id,btrim(p_command->>'nickname'),p_command->>'avatarId')
        on conflict(circle_id,child_id) do update set nickname=excluded.nickname,avatar_id=excluded.avatar_id,active=true;
      return '{}'::jsonb;
    elsif action in ('league.nominate','league.rest') then
      if not exists(select 1 from ghaf_private.league_members m where m.circle_id=circle.id and m.child_id=v_child_id and m.family_id=p_family_id and m.active)
        then raise exception using errcode='PT403',message='forbidden'; end if;
      if exists(select 1 from ghaf_private.league_weeks w where w.circle_id=circle.id and w.child_id=v_child_id and w.week=week_start)
        then raise exception using errcode='PT409',message='week_locked'; end if;
      if action='league.rest' then
        if exists(select 1 from ghaf_private.league_weeks w where w.child_id=v_child_id and w.week=week_start and not w.rest_week)
          then raise exception using errcode='PT409',message='week_locked'; end if;
        insert into ghaf_private.league_weeks(circle_id,child_id,week,rest_week) values(circle.id,v_child_id,week_start,true);
        return '{}'::jsonb;
      end if;
      if jsonb_typeof(p_command->'assignmentIds') is distinct from 'array' or jsonb_array_length(p_command->'assignmentIds')<>5
        then raise exception using errcode='PT400',message='five_leaves_required'; end if;
      select array_agg(value::uuid) into ids from jsonb_array_elements_text(p_command->'assignmentIds');
      if (select count(distinct x) from unnest(ids) x)<>5 then raise exception using errcode='PT400',message='five_leaves_required'; end if;
      if exists(select 1 from ghaf_private.league_weeks w where w.child_id=v_child_id and w.week=week_start and w.rest_week)
        then raise exception using errcode='PT409',message='week_locked'; end if;
      if exists(select 1 from ghaf_private.league_nominations n where n.child_id=v_child_id and n.week=week_start and not(n.assignment_id=any(ids)))
        then raise exception using errcode='PT400',message='five_leaves_required'; end if;
      foreach item in array ids loop
        select * into assignment from ghaf_private.assignments a where a.id=item and a.family_id=p_family_id and a.child_id=v_child_id and a.state='assigned';
        if not found then raise exception using errcode='PT409',message='task_ineligible'; end if;
        if not exists(select 1 from ghaf_private.task_versions v where v.task_id=assignment.task_id and v.version=assignment.task_version
          and v.league_eligible and v.visibility_scope='household' and v.recognition_mode<>'recognition_only' and v.routine_phase='acquisition'
          and v.category_id not in ('faith_gratitude','roots_kinship','food_hospitality','learning_wellbeing'))
          then raise exception using errcode='PT409',message='task_ineligible'; end if;
        if exists(select 1 from ghaf_private.league_nominations n where n.circle_id=circle.id and n.assignment_id=item)
          then raise exception using errcode='PT409',message='task_ineligible'; end if;
      end loop;
      insert into ghaf_private.league_weeks(circle_id,child_id,week) values(circle.id,v_child_id,week_start);
      slot_no:=0;
      foreach item in array ids loop
        slot_no:=slot_no+1;
        insert into ghaf_private.league_nominations(circle_id,child_id,week,slot,assignment_id) values(circle.id,v_child_id,week_start,slot_no,item);
      end loop;
      return '{}'::jsonb;
    end if;
  end if;
  raise exception using errcode='PT400',message='invalid_command';
end $$;

create function ghaf_private.reject_extension_mutation() returns trigger
language plpgsql security invoker set search_path='' as $$
begin raise exception using errcode='PT409',message='immutable_evidence'; end $$;
do $$ declare n text; begin
  foreach n in array array['reward_plan_versions','reward_contributions','masroofi_control_versions','masroofi_allowed_categories',
    'masroofi_ledger','study_help_events','academic_goal_versions','academic_goal_acceptances','learning_step_progress',
    'learning_completions','activity_completions','badge_awards','canopy_contributions','green_circle_events'] loop
    execute format('create trigger immutable_evidence before update or delete on ghaf_private.%I for each row execute function ghaf_private.reject_extension_mutation()',n);
  end loop;
end $$;

create function ghaf_private.evaluate_badges(p_child_id uuid) returns void
language plpgsql security invoker set search_path='' as $$
declare b record; criterion jsonb; matches boolean; total bigint; credit bigint; pass integer;
begin
  select coalesce(sum(amount),0) into total from ghaf_private.seed_entries where child_id=p_child_id;
  for pass in 1..3 loop
    for b in select * from ghaf_private.badge_definitions loop
      matches:=true;
      for criterion in select value from jsonb_array_elements(b.criteria) loop
        case criterion->>'kind'
        when 'lifetime_seeds' then matches:=matches and total>=(criterion->>'required')::integer;
        when 'station_reached' then matches:=matches and total>=(criterion->>'threshold')::integer;
        when 'acquisition_credits' then
          select count(*) into credit from ghaf_private.recognitions r where r.child_id=p_child_id
            and r.routine_phase='acquisition' and r.recognition_mode<>'recognition_only' and r.seed_amount>0
            and criterion->>'skillId'=any(r.skill_ids);
          matches:=matches and credit>=(criterion->>'required')::integer;
        when 'prerequisite_badge' then matches:=matches and exists(select 1 from ghaf_private.badge_awards
          where child_id=p_child_id and badge_id=criterion->>'badgeId');
        when 'learning_completed' then matches:=matches and exists(select 1 from ghaf_private.learning_completions
          where child_id=p_child_id and learning_id=criterion->>'learningId');
        when 'semantic_component' then
          matches:=matches and (exists(select 1 from ghaf_private.activity_completions c join ghaf_private.activity_definitions d on d.id=c.activity_id
            where c.child_id=p_child_id and d.semantic_component=criterion->>'component')
            or exists(select 1 from ghaf_private.learning_completions c where c.child_id=p_child_id and c.learning_id=case criterion->>'component'
              when 'wetland_learning' then 'learning.wetland.v1' when 'date_palm_learning' then 'learning.date_palm.v1'
              when 'sadu_learning' then 'learning.sadu.v1' else null end));
        else matches:=false;
        end case;
      end loop;
      if matches then insert into ghaf_private.badge_awards(child_id,badge_id) values(p_child_id,b.id) on conflict do nothing; end if;
    end loop;
  end loop;
end $$;

create or replace function ghaf_private.after_recognition(p_receipt_id uuid) returns void
language plpgsql security invoker set search_path='' as $$
declare r ghaf_private.recognitions%rowtype; p ghaf_private.reward_plans%rowtype; v_now timestamptz:=clock_timestamp();
  promise ghaf_private.masroofi_promises%rowtype; card ghaf_private.masroofi_cards%rowtype;
  total bigint; stage_threshold integer; enough boolean; week_start date:=date_trunc('week',timezone('Asia/Dubai',now()))::date;
begin
  select * into strict r from ghaf_private.recognitions where id=p_receipt_id;
  if r.reward_eligible and r.seed_amount>0 and r.routine_phase='acquisition' and r.recognition_mode<>'recognition_only' then
    for p in select * from ghaf_private.reward_plans where child_id=r.child_id and family_id=r.family_id
      and status='promised' and revised_at<=r.created_at loop
      insert into ghaf_private.reward_contributions(plan_id,version,recognition_id,amount,landscape_id)
        values(p.id,p.version,r.id,r.seed_amount,r.landscape_id) on conflict do nothing;
      select coalesce(sum(amount),0) into total from ghaf_private.reward_contributions where plan_id=p.id and version=p.version;
      stage_threshold:=case p.milestone->>'targetStage' when 'shoot' then 20 when 'sapling' then 60 when 'shade' then 120 when 'flourishing' then 200 else null end;
      if p.milestone->>'kind'='eligible_seed_delta' then enough:=total>=(p.milestone->>'requiredSeedDelta')::integer;
      elsif p.milestone->>'kind'='landscape_stage' then
        select coalesce(sum(amount),0)>=stage_threshold into enough from ghaf_private.reward_contributions
          where plan_id=p.id and version=p.version and landscape_id=p.milestone->>'landscapeId';
      else
        select count(*)>=(p.milestone->>'requiredCount')::integer into enough from
          (select landscape_id from ghaf_private.reward_contributions where plan_id=p.id and version=p.version
            group by landscape_id having sum(amount)>=stage_threshold) stages;
      end if;
      if enough then update ghaf_private.reward_plans set status='unlocked',unlocked_at=v_now where id=p.id; end if;
    end loop;
    select * into promise from ghaf_private.masroofi_promises where assignment_id=r.assignment_id and task_version=r.task_version and status='promised';
    if found and promise.task_id=r.task_id and promise.task_version=r.task_version then
      select * into strict card from ghaf_private.masroofi_cards where child_id=r.child_id for update;
      update ghaf_private.masroofi_cards set balance_fils=balance_fils+promise.amount_fils where child_id=r.child_id;
      update ghaf_private.masroofi_promises set status='credited',recognition_id=r.id where id=promise.id;
      insert into ghaf_private.masroofi_ledger(family_id,child_id,request_id,kind,amount_fils,status,control_version,balance_after_fils,assignment_id,recognition_id)
        values(r.family_id,r.child_id,r.id,'reward',promise.amount_fils,'credited',card.control_version,card.balance_fils+promise.amount_fils,r.assignment_id,r.id);
    end if;
  end if;
  if r.league_eligible and r.visibility_scope='household' and r.recognition_mode<>'recognition_only' and r.routine_phase='acquisition' then
    update ghaf_private.league_nominations n set recognition_id=r.id
      from ghaf_private.league_weeks w,ghaf_private.league_members m,ghaf_private.circle_families f
      where n.assignment_id=r.assignment_id and n.child_id=r.child_id and n.week=week_start and n.recognition_id is null
        and w.circle_id=n.circle_id and w.child_id=n.child_id and w.week=n.week and not w.rest_week
        and m.circle_id=n.circle_id and m.child_id=n.child_id and m.active and f.circle_id=m.circle_id and f.family_id=m.family_id and f.active;
    insert into ghaf_private.canopy_contributions(circle_id,recognition_id,week)
      select circle_id,r.id,week_start from ghaf_private.league_nominations where recognition_id=r.id on conflict do nothing;
  end if;
  if r.circle_eligible and r.visibility_scope='household' and exists(select 1 from ghaf_private.task_versions
    where task_id=r.task_id and version=r.task_version and category_id='green_impact') then
    insert into ghaf_private.green_circle_events(circle_id,recognition_id)
      select m.circle_id,r.id from ghaf_private.league_members m join ghaf_private.circle_families f using(circle_id,family_id)
        where m.child_id=r.child_id and m.active and f.active on conflict do nothing;
  end if;
  perform ghaf_private.evaluate_badges(r.child_id);
end $$;

create or replace function ghaf_private.read_extras(p_family_id uuid,p_child_id uuid,p_role text) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare visible_children uuid[]; week_start date:=date_trunc('week',timezone('Asia/Dubai',now()))::date; output jsonb;
begin
  select coalesce(array_agg(id),'{}'::uuid[]) into visible_children from ghaf_private.children
    where family_id=p_family_id and active and (p_role='parent' or id=p_child_id);
  select jsonb_build_object(
    'rewards',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'childId',p.child_id,'label',p.label,'kind',p.kind,
      'amountFils',p.amount_fils,'month',p.month,'monthlyMaximumFils',p.monthly_maximum_fils,'milestone',p.milestone,'status',p.status,'version',p.version,
      'eligibleSeeds',(select coalesce(sum(c.amount),0) from ghaf_private.reward_contributions c where c.plan_id=p.id and c.version=p.version),
      'unlockedAt',p.unlocked_at,'givenAt',p.given_at) order by p.created_at,p.id)
      from ghaf_private.reward_plans p where p.family_id=p_family_id and p.child_id=any(visible_children)),'[]'::jsonb),
    'masroofi',jsonb_build_object(
      'cards',coalesce((select jsonb_agg(jsonb_build_object('childId',c.child_id,'balanceFils',c.balance_fils,'controlsVersion',c.control_version,'origin','simulated',
        'ageEligible',exists(select 1 from ghaf_private.children child where child.id=c.child_id and child.active and child.age_band in ('9_11','12_14') and child.age10_plus_confirmed),
        'controls',jsonb_build_object('frozen',v.frozen,'onlineAllowed',v.online_allowed,
          'perPurchaseLimitFils',v.per_purchase_limit_fils,'dailyLimitFils',v.daily_limit_fils,
          'allowedCategories',coalesce((select jsonb_agg(category_id order by category_id) from ghaf_private.masroofi_allowed_categories
            where child_id=c.child_id and version=v.version),'[]'::jsonb))) order by c.child_id)
        from ghaf_private.masroofi_cards c join ghaf_private.masroofi_control_versions v on v.child_id=c.child_id and v.version=c.control_version
        where c.family_id=p_family_id and c.child_id=any(visible_children)),'[]'::jsonb),
      'promises',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'childId',p.child_id,'assignmentId',p.assignment_id,'taskVersion',p.task_version,'status',p.status)
        || case when p_role='parent' or p.status='credited' then jsonb_build_object('amountFils',p.amount_fils) else '{}'::jsonb end order by p.created_at,p.id)
        from ghaf_private.masroofi_promises p where p.family_id=p_family_id and p.child_id=any(visible_children)
          and (p_role='parent' or p.status='credited' or exists(select 1 from ghaf_private.assignments a where a.id=p.assignment_id and a.task_version=p.task_version))),'[]'::jsonb),
      'transactions',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'childId',l.child_id,'kind',l.kind,
        'amountFils',l.amount_fils,'status',l.status,'declineReason',l.decline_reason,'fixtureId',l.product_id,
        'day',l.day,'balanceAfterFils',l.balance_after_fils,'assignmentId',l.assignment_id) order by l.created_at,l.id)
        from ghaf_private.masroofi_ledger l where l.family_id=p_family_id and l.child_id=any(visible_children)),'[]'::jsonb),
      'purchaseCatalog',(select jsonb_agg(jsonb_build_object('id',id,'category',category_id,'online',online,'amountFils',amount_fils) order by id)
        from ghaf_private.masroofi_products)),
    'studyPlans',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'childId',p.child_id,'createdBy',p.created_by,
      'subject',p.subject,'title',p.title,'nextStep',p.next_step,'durationMinutes',p.duration_minutes,
      'dueDate',p.due_date,'revisitDate',p.revisit_date,'status',p.status,'helpRequest',p.help_request,
      'createdAt',p.created_at,'updatedAt',p.updated_at,'completedAt',p.completed_at) order by p.created_at,p.id)
      from ghaf_private.study_plans p where p.family_id=p_family_id and p.child_id=any(visible_children)),'[]'::jsonb),
    'goals',coalesce((select jsonb_agg(jsonb_build_object('id',g.id,'childId',g.child_id,'createdBy',g.created_by,
      'subject',v.subject,'title',v.title,'nextStep',v.next_step,'parentSupport',v.parent_support,
      'criterion',case v.criterion_kind when 'practice_count' then jsonb_build_object('kind','practice_count','target',v.criterion_target)
        when 'achievement' then jsonb_build_object('kind','achievement','description',v.criterion_description)
        else jsonb_build_object('kind','mark','threshold',v.criterion_threshold,'denominator',v.criterion_denominator) end,
      'prize',case when v.prize_kind is null then null else jsonb_build_object('kind',v.prize_kind,'label',v.prize_label) end,
      'status',g.status,'revision',g.version,'parentApprovedRevision',g.parent_approved_version,'childAcceptedRevision',g.child_accepted_version,
      'submissions',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'result',r.result,'submittedAt',r.created_at,
        'reviewedAt',r.reviewed_at,'acknowledgement',r.acknowledgement,'metCriterion',r.met_criterion) order by r.created_at,r.id)
        from ghaf_private.academic_results r where r.goal_id=g.id),'[]'::jsonb),
      'prizeStatus',g.prize_status,'createdAt',g.created_at,'updatedAt',g.updated_at,'acknowledgedAt',g.acknowledged_at,
      'unlockedAt',g.unlocked_at,'givenAt',g.given_at) order by g.created_at,g.id)
      from ghaf_private.academic_goals g join ghaf_private.academic_goal_versions v on v.goal_id=g.id and v.version=g.version
      where g.family_id=p_family_id and g.child_id=any(visible_children)),'[]'::jsonb),
    'learning',jsonb_build_object(
      'packages',(select jsonb_agg(jsonb_build_object('id',p.id,'labelAr',p.label_ar,'labelEn',p.label_en,'unlockThreshold',p.unlock_threshold,
        'available',p.available,'unlockedChildIds',coalesce((select jsonb_agg(c.id order by c.id) from ghaf_private.children c
          where c.id=any(visible_children) and p.available and (select coalesce(sum(amount),0) from ghaf_private.seed_entries where child_id=c.id)>=p.unlock_threshold),'[]'::jsonb),
        'steps',jsonb_build_object('story',coalesce((select jsonb_agg(id order by ordinal) from ghaf_private.learning_steps where learning_id=p.id and route='story'),'[]'::jsonb),
          'accessible',coalesce((select jsonb_agg(id order by ordinal) from ghaf_private.learning_steps where learning_id=p.id and route='accessible'),'[]'::jsonb)),
        'checkOptions',case when p.available then jsonb_build_array(p.correct_option,p.other_option) else '[]'::jsonb end) order by p.id)
        from ghaf_private.learning_packages p),
      'progress',coalesce((select jsonb_agg(jsonb_build_object('childId',p.child_id,'learningId',p.learning_id,'route',p.route,
        'completedStepIds',coalesce((select jsonb_agg(s.step_id order by d.ordinal) from ghaf_private.learning_step_progress s
          join ghaf_private.learning_steps d on d.learning_id=s.learning_id and d.route=s.route and d.id=s.step_id
          where s.child_id=p.child_id and s.learning_id=p.learning_id and s.route=p.route),'[]'::jsonb),'checkSatisfied',p.check_satisfied)
          order by p.child_id,p.learning_id,p.route) from ghaf_private.learning_progress p where p.child_id=any(visible_children)),'[]'::jsonb),
      'completions',coalesce((select jsonb_agg(jsonb_build_object('childId',child_id,'learningId',learning_id,'completedAt',created_at)
        order by child_id,learning_id) from ghaf_private.learning_completions where child_id=any(visible_children)),'[]'::jsonb),
      'badges',coalesce((select jsonb_agg(jsonb_build_object('childId',c.id,'id',b.id,'labelAr',b.label_ar,'labelEn',b.label_en,
        'criteria',b.criteria,'earnedAt',a.created_at) order by c.id,b.id) from ghaf_private.children c cross join ghaf_private.badge_definitions b
        left join ghaf_private.badge_awards a on a.child_id=c.id and a.badge_id=b.id where c.id=any(visible_children)),'[]'::jsonb)),
    'league',jsonb_build_object(
      'circles',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'isOwner',p_role='parent' and c.owner_family_id=p_family_id,
        'rows',coalesce((select jsonb_agg(jsonb_build_object('nickname',nickname,'avatarId',avatar_id,'rank',position,
          'score',leaves*20,'confirmedLeaves',leaves) order by position,nickname) from (
          select nickname,avatar_id,leaves,rank() over(order by leaves desc) as position from (
            select m.nickname,m.avatar_id,least(5,count(n.recognition_id)) as leaves from ghaf_private.league_members m
            join ghaf_private.circle_families f on f.circle_id=m.circle_id and f.family_id=m.family_id and f.active
            join ghaf_private.children child on child.id=m.child_id and child.active
            left join ghaf_private.league_weeks w on w.circle_id=m.circle_id and w.child_id=m.child_id and w.week=week_start
            left join ghaf_private.league_nominations n on n.circle_id=m.circle_id and n.child_id=m.child_id and n.week=week_start
            where m.circle_id=c.id and m.active and not coalesce(w.rest_week,false) group by m.child_id,m.nickname,m.avatar_id
          ) scored) ranked),'[]'::jsonb),
        'canopyContributions',(select count(*) from ghaf_private.canopy_contributions where circle_id=c.id),
        'greenActions',(select count(*) from ghaf_private.green_circle_events where circle_id=c.id),
        'canopyHistory',coalesce((select jsonb_agg(jsonb_build_object('week',week,'contributions',n) order by week)
          from (select week,count(*) n from ghaf_private.canopy_contributions where circle_id=c.id group by week) h),'[]'::jsonb),
        'memberships',coalesce((select jsonb_agg(jsonb_build_object('childId',m.child_id,'nickname',m.nickname,'avatarId',m.avatar_id,
          'nominatedAssignmentIds',coalesce((select jsonb_agg(assignment_id order by slot) from ghaf_private.league_nominations
            where circle_id=c.id and child_id=m.child_id and week=week_start),'[]'::jsonb),
          'restWeek',coalesce((select rest_week from ghaf_private.league_weeks where circle_id=c.id and child_id=m.child_id and week=week_start),false),
          'eligibleAssignmentIds',coalesce((select jsonb_agg(a.id order by a.created_at,a.id) from ghaf_private.assignments a
            join ghaf_private.task_versions v on v.task_id=a.task_id and v.version=a.task_version
            where a.family_id=p_family_id and a.child_id=m.child_id and a.state='assigned' and v.league_eligible and v.visibility_scope='household'
              and v.recognition_mode<>'recognition_only' and v.routine_phase='acquisition'
              and v.category_id not in ('faith_gratitude','roots_kinship','food_hospitality','learning_wellbeing')
              and (not exists(select 1 from ghaf_private.league_nominations shared where shared.child_id=m.child_id and shared.week=week_start)
                or exists(select 1 from ghaf_private.league_nominations shared where shared.child_id=m.child_id and shared.week=week_start and shared.assignment_id=a.id))
              and not exists(select 1 from ghaf_private.league_weeks rest where rest.child_id=m.child_id and rest.week=week_start and rest.rest_week)
              and not exists(select 1 from ghaf_private.league_nominations n where n.circle_id=c.id and n.assignment_id=a.id)
              and not exists(select 1 from ghaf_private.league_weeks w where w.circle_id=c.id and w.child_id=m.child_id and w.week=week_start)), '[]'::jsonb)) order by m.child_id)
          from ghaf_private.league_members m where m.circle_id=c.id and m.family_id=p_family_id and m.active and m.child_id=any(visible_children)),'[]'::jsonb)) order by c.created_at,c.id)
        from ghaf_private.family_circles c join ghaf_private.circle_families f on f.circle_id=c.id and f.family_id=p_family_id and f.active
        where p_role='parent' or exists(select 1 from ghaf_private.league_members m where m.circle_id=c.id and m.child_id=p_child_id and m.active)),'[]'::jsonb),
      'invitations',case when p_role<>'parent' then '[]'::jsonb else coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'circleName',c.name) order by i.created_at,i.id)
        from ghaf_private.circle_invitations i join ghaf_private.family_circles c on c.id=i.circle_id
        where i.invited_owner_id=(select owner_user_id from ghaf_private.families where id=p_family_id)
          and i.accepted_at is null and i.revoked_at is null and i.expires_at>now()),'[]'::jsonb) end)
  ) into output;
  return output;
end $$;

alter table ghaf_private.reward_plans add foreign key(child_id,family_id) references ghaf_private.children(id,family_id);
alter table ghaf_private.masroofi_cards add foreign key(child_id,family_id) references ghaf_private.children(id,family_id);
alter table ghaf_private.masroofi_promises add foreign key(child_id,family_id) references ghaf_private.children(id,family_id),
  add foreign key(assignment_id,family_id) references ghaf_private.assignments(id,family_id),
  add foreign key(recognition_id,family_id) references ghaf_private.recognitions(id,family_id);
alter table ghaf_private.masroofi_ledger add foreign key(child_id,family_id) references ghaf_private.children(id,family_id),
  add foreign key(assignment_id,family_id) references ghaf_private.assignments(id,family_id),
  add foreign key(recognition_id,family_id) references ghaf_private.recognitions(id,family_id);
alter table ghaf_private.study_plans add foreign key(child_id,family_id) references ghaf_private.children(id,family_id);
alter table ghaf_private.academic_goals add foreign key(child_id,family_id) references ghaf_private.children(id,family_id);
alter table ghaf_private.league_members add foreign key(child_id,family_id) references ghaf_private.children(id,family_id);

revoke all on function ghaf_private.require_fresh_extension_parent(text,uuid),ghaf_private.extension_keys(jsonb,text[]),
  ghaf_private.save_goal_version(uuid,integer,jsonb),ghaf_private.command_extras(jsonb,uuid,uuid,text,uuid),
  ghaf_private.reject_extension_mutation(),ghaf_private.evaluate_badges(uuid),ghaf_private.after_recognition(uuid),
  ghaf_private.read_extras(uuid,uuid,text) from public,anon,authenticated;
commit;
