begin;

create schema ghaf_private;
revoke all on schema ghaf_private from public, anon, authenticated;

create table ghaf_private.families (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id),
  name text not null default '' check (char_length(name) <= 80),
  locale text not null default 'ar' check (locale in ('ar','en')),
  guardian_names jsonb not null default '[]' check (jsonb_typeof(guardian_names) = 'array'),
  revision bigint not null default 0 check (revision between 0 and 9007199254740990),
  created_at timestamptz not null default clock_timestamp()
);
create table ghaf_private.guardians (
  user_id uuid primary key references auth.users(id),
  family_id uuid not null references ghaf_private.families(id),
  active boolean not null default true,
  unique(user_id,family_id)
);
create table ghaf_private.children (
  id uuid primary key default gen_random_uuid(), family_id uuid not null references ghaf_private.families(id),
  nickname text not null check (char_length(btrim(nickname)) between 1 and 80),
  age_band text check (age_band in ('6_8','9_11','12_14')),
  age10_plus_confirmed boolean not null default false,
  preferred_language text not null default 'ar' check (preferred_language in ('ar','en','both')),
  avatar_id text not null default 'ghaf_tree' check (char_length(avatar_id) between 1 and 80),
  active boolean not null default true, unique(id,family_id),
  check (not age10_plus_confirmed or age_band in ('9_11','12_14'))
);
create index children_family on ghaf_private.children(family_id);
create table ghaf_private.child_permissions (
  child_id uuid primary key references ghaf_private.children(id), family_id uuid not null,
  voice_granted boolean not null default false, media_granted boolean not null default false,
  ai_granted boolean not null default false, revision integer not null default 0,
  updated_by uuid references auth.users(id), updated_at timestamptz not null default clock_timestamp(),
  foreign key(child_id,family_id) references ghaf_private.children(id,family_id)
);
create table ghaf_private.community_preferences (
  family_id uuid primary key references ghaf_private.families(id),
  status text not null default 'paused' check(status in ('continued','paused','ended')), revision integer not null default 0
);
create table ghaf_private.community_consents (
  id uuid primary key default gen_random_uuid(), family_id uuid not null references ghaf_private.families(id),
  revision integer not null, status text not null check(status in ('continued','paused','ended')),
  user_id uuid not null references auth.users(id), created_at timestamptz not null default clock_timestamp(),
  unique(family_id,revision)
);
create table ghaf_private.child_preferences (
  child_id uuid primary key references ghaf_private.children(id), sex text check(sex in ('male','female')),
  interests jsonb not null default '[]', hobbies jsonb not null default '[]',
  accessibility jsonb not null default '[]', support jsonb not null default '[]',
  personalization_enabled boolean not null default false,
  custom_interest text, custom_hobby text, custom_support text, custom_accessibility text,
  check(jsonb_typeof(interests)='array' and jsonb_typeof(hobbies)='array'
    and jsonb_typeof(accessibility)='array' and jsonb_typeof(support)='array')
);
create table ghaf_private.family_relatives (
  id uuid primary key default gen_random_uuid(), family_id uuid not null references ghaf_private.families(id),
  display_name text not null check(char_length(btrim(display_name)) between 1 and 80),
  relationship text not null check(relationship in ('grandmother','grandfather','aunt','uncle')),
  rhythm text not null check(rhythm in ('weekly','monthly','every_three_months','no_schedule')),
  unique(id,family_id)
);
create table ghaf_private.landscapes (id text primary key, label_ar text not null, label_en text not null);
create table ghaf_private.categories (
  id text primary key, label_ar text not null, label_en text not null,
  landscape_id text not null references ghaf_private.landscapes(id)
);
create table ghaf_private.templates (
  id text primary key, category_id text not null references ghaf_private.categories(id),
  landscape_id text not null references ghaf_private.landscapes(id),
  title_ar text not null, title_en text not null, definition_ar text not null, definition_en text not null,
  positive_action_ar text not null, positive_action_en text not null, why_it_matters_ar text not null, why_it_matters_en text not null,
  steps_ar jsonb not null, steps_en jsonb not null,
  permitted_help_ar text not null, permitted_help_en text not null, supervision_ar text not null, supervision_en text not null,
  safety_ar jsonb not null, safety_en jsonb not null, age_bands text[] not null,
  recognition_mode text not null, routine_phase text not null, seed_award integer,
  recurrence text not null check(recurrence in ('once','recurrent')),
  visibility_scope text not null, circle_eligible boolean not null, reward_eligible boolean not null,
  league_eligible boolean not null, skill_ids text[] not null default '{}'
);
create table ghaf_private.tasks (
  id uuid primary key default gen_random_uuid(), family_id uuid not null references ghaf_private.families(id),
  child_id uuid not null, current_version integer not null default 1 check(current_version > 0),
  status text not null default 'draft' check(status in ('draft','reviewed','assigned')),
  created_by uuid not null references auth.users(id), created_at timestamptz not null default clock_timestamp(),
  unique(id,family_id), foreign key(child_id,family_id) references ghaf_private.children(id,family_id)
);
create index tasks_family_child on ghaf_private.tasks(family_id,child_id);
create table ghaf_private.task_versions (
  task_id uuid not null, version integer not null check(version > 0), family_id uuid not null,
  template_id text references ghaf_private.templates(id), category_id text not null references ghaf_private.categories(id),
  landscape_id text not null references ghaf_private.landscapes(id), title text not null,
  definition_of_done text not null, content_locale text not null check(content_locale in ('ar','en')),
  positive_action text not null, why_it_matters text not null,
  permitted_help text not null, supervision text not null, safety jsonb not null,
  recognition_mode text not null check(recognition_mode in ('standard','fade_first','recognition_only')),
  routine_phase text not null check(routine_phase in ('acquisition','maintenance','not_applicable')),
  seed_award integer check(seed_award in (4,6,8,12,15)),
  recurrence text not null check(recurrence in ('once','recurrent')),
  visibility_scope text not null check(visibility_scope in ('child_guardian','household')),
  circle_eligible boolean not null default false, reward_eligible boolean not null default false,
  league_eligible boolean not null default false, skill_ids text[] not null default '{}',
  content_fingerprint text not null, created_at timestamptz not null default clock_timestamp(),
  primary key(task_id,version), unique(task_id,version,family_id),
  foreign key(task_id,family_id) references ghaf_private.tasks(id,family_id),
  check ((recognition_mode='recognition_only' and routine_phase='not_applicable' and seed_award is null)
    or (recognition_mode in ('standard','fade_first') and ((routine_phase='acquisition' and seed_award is not null)
      or (routine_phase='maintenance' and seed_award is null)))),
  check(not circle_eligible or (category_id='green_impact' and visibility_scope='household' and recognition_mode<>'recognition_only')),
  check(not reward_eligible or (template_id is not null and routine_phase='acquisition' and category_id in ('home_responsibility','green_impact'))),
  check(recognition_mode<>'standard' or recurrence='once')
);
create table ghaf_private.task_steps (
  task_id uuid not null, task_version integer not null, position integer not null check(position between 1 and 30),
  instruction text not null check(char_length(btrim(instruction)) between 1 and 1000),
  primary key(task_id,task_version,position), foreign key(task_id,task_version) references ghaf_private.task_versions(task_id,version)
);
create table ghaf_private.routines (
  task_id uuid primary key references ghaf_private.tasks(id), family_id uuid not null references ghaf_private.families(id),
  future_phase text not null default 'acquisition' check(future_phase in ('acquisition','maintenance')),
  confirmed_acquisition_count integer not null default 0 check(confirmed_acquisition_count>=0),
  reviewed_at timestamptz, reviewed_by uuid references auth.users(id)
);
create table ghaf_private.assignments (
  id uuid primary key default gen_random_uuid(), family_id uuid not null, child_id uuid not null,
  task_id uuid not null, task_version integer not null,
  state text not null default 'assigned' check(state in ('assigned','chosen','in_progress','submitted','retry','confirmed','recognized')),
  help_requested boolean not null default false, approved_by uuid not null references auth.users(id),
  created_at timestamptz not null default clock_timestamp(), unique(id,family_id), unique(id,child_id),
  foreign key(task_id,task_version,family_id) references ghaf_private.task_versions(task_id,version,family_id),
  foreign key(child_id,family_id) references ghaf_private.children(id,family_id)
);
create index assignments_family_child on ghaf_private.assignments(family_id,child_id);
create table ghaf_private.submissions (
  id uuid primary key default gen_random_uuid(), family_id uuid not null, child_id uuid not null,
  assignment_id uuid not null, task_version integer not null, attempt integer not null check(attempt>0),
  completion_mode text not null check(completion_mode in ('independent','permitted_help')),
  definition_acknowledged boolean not null check(definition_acknowledged),
  submitted_at timestamptz not null default clock_timestamp(), unique(assignment_id,attempt), unique(id,family_id),
  foreign key(assignment_id,family_id) references ghaf_private.assignments(id,family_id),
  foreign key(assignment_id,child_id) references ghaf_private.assignments(id,child_id)
);
create table ghaf_private.check_ins (
  id uuid primary key default gen_random_uuid(), family_id uuid not null, assignment_id uuid not null,
  submission_id uuid not null unique, decision text not null check(decision in ('confirm','kind_retry')),
  praise text, observation text, confirmed_by uuid not null references auth.users(id),
  presentation text check(presentation in ('editing_praise','praise_presented','recognition_applied')),
  created_at timestamptz not null default clock_timestamp(), praise_presented_at timestamptz,
  unique(id,family_id), foreign key(assignment_id,family_id) references ghaf_private.assignments(id,family_id),
  foreign key(submission_id,family_id) references ghaf_private.submissions(id,family_id),
  check(decision<>'confirm' or char_length(btrim(praise)) between 1 and 1000)
);
create table ghaf_private.adjustments (
  id uuid primary key default gen_random_uuid(), family_id uuid not null, child_id uuid not null,
  assignment_id uuid not null, source_version integer not null, proposed_version integer,
  status text not null default 'parent_review_required' check(status in ('parent_review_required','child_decision_required','accepted','kept_current')),
  foreign key(assignment_id,family_id) references ghaf_private.assignments(id,family_id),
  foreign key(assignment_id,child_id) references ghaf_private.assignments(id,child_id)
);
create table ghaf_private.recognitions (
  id uuid primary key default gen_random_uuid(), family_id uuid not null, child_id uuid not null,
  assignment_id uuid not null unique, task_id uuid not null, task_version integer not null,
  submission_id uuid not null unique, check_in_id uuid not null unique,
  seed_amount integer not null check(seed_amount in (0,4,6,8,12,15)),
  landscape_id text not null references ghaf_private.landscapes(id),
  recognition_mode text not null, routine_phase text not null, visibility_scope text not null,
  reward_eligible boolean not null, league_eligible boolean not null, circle_eligible boolean not null,
  skill_ids text[] not null default '{}', created_at timestamptz not null default clock_timestamp(),
  unique(id,family_id), foreign key(child_id,family_id) references ghaf_private.children(id,family_id),
  foreign key(assignment_id,family_id) references ghaf_private.assignments(id,family_id),
  foreign key(task_id,task_version,family_id) references ghaf_private.task_versions(task_id,version,family_id),
  foreign key(submission_id,family_id) references ghaf_private.submissions(id,family_id),
  foreign key(check_in_id,family_id) references ghaf_private.check_ins(id,family_id)
);
create table ghaf_private.seed_entries (
  id uuid primary key default gen_random_uuid(), family_id uuid not null, child_id uuid not null,
  recognition_id uuid not null unique, amount integer not null check(amount in (4,6,8,12,15)),
  created_at timestamptz not null default clock_timestamp(),
  foreign key(child_id,family_id) references ghaf_private.children(id,family_id),
  foreign key(recognition_id,family_id) references ghaf_private.recognitions(id,family_id)
);
create index seed_entries_child on ghaf_private.seed_entries(child_id);
create table ghaf_private.landscape_events (
  recognition_id uuid primary key references ghaf_private.recognitions(id), family_id uuid not null,
  child_id uuid not null, landscape_id text not null references ghaf_private.landscapes(id),
  amount integer not null check(amount in (4,6,8,12,15)),
  foreign key(child_id,family_id) references ghaf_private.children(id,family_id)
);
create table ghaf_private.canopy_events (
  recognition_id uuid primary key references ghaf_private.recognitions(id),
  family_id uuid not null references ghaf_private.families(id), created_at timestamptz not null default clock_timestamp()
);
create table ghaf_private.circle_events (
  recognition_id uuid primary key references ghaf_private.recognitions(id),
  family_id uuid not null references ghaf_private.families(id), created_at timestamptz not null default clock_timestamp()
);
create table ghaf_private.reveals (
  id uuid primary key default gen_random_uuid(), family_id uuid not null, child_id uuid not null,
  recognition_id uuid not null unique, acknowledged_at timestamptz,
  foreign key(child_id,family_id) references ghaf_private.children(id,family_id),
  foreign key(recognition_id,family_id) references ghaf_private.recognitions(id,family_id)
);
create table ghaf_private.community_signals (
  recognition_id uuid primary key references ghaf_private.recognitions(id), family_id uuid not null references ghaf_private.families(id),
  child_id uuid not null, consent_id uuid not null references ghaf_private.community_consents(id),
  theme text not null check(theme in ('coastal_habitat_care','water_stewardship','native_canopy_care')),
  created_at timestamptz not null default clock_timestamp(),
  foreign key(child_id,family_id) references ghaf_private.children(id,family_id)
);
create table ghaf_private.saved_templates (
  id uuid primary key default gen_random_uuid(), family_id uuid not null, task_id uuid not null,
  task_version integer not null, title text not null, unique(family_id,task_id,task_version),
  foreign key(task_id,task_version,family_id) references ghaf_private.task_versions(task_id,version,family_id)
);
create table ghaf_private.child_invitations (
  token_hash bytea primary key, family_id uuid not null, child_id uuid not null,
  expires_at timestamptz not null, revoked boolean not null default false, used_session_id uuid,
  foreign key(child_id,family_id) references ghaf_private.children(id,family_id)
);
create table ghaf_private.child_bindings (
  session_id uuid primary key, user_id uuid not null, family_id uuid not null, child_id uuid not null,
  active boolean not null default true, created_at timestamptz not null default clock_timestamp(),
  foreign key(child_id,family_id) references ghaf_private.children(id,family_id)
);
create index child_bindings_user on ghaf_private.child_bindings(user_id);
create table ghaf_private.requests (
  family_id uuid not null references ghaf_private.families(id), user_id uuid not null,
  request_id uuid not null, command jsonb not null, result jsonb not null,
  created_at timestamptz not null default clock_timestamp(), primary key(family_id,user_id,request_id)
);
create table ghaf_private.workspace_imports (
  user_id uuid primary key references auth.users(id), family_id uuid not null unique references ghaf_private.families(id),
  workspace_id uuid not null, source_revision bigint not null, source_fingerprint text not null,
  member_count integer not null, task_count integer not null, study_count integer not null,
  imported_at timestamptz not null default clock_timestamp()
);
create table ghaf_private.legacy_records (
  id uuid primary key default gen_random_uuid(), family_id uuid not null, child_id uuid not null,
  kind text not null check(kind in ('task','study')), title text not null, subject text, next_step text,
  completed boolean not null, source_id uuid not null, converted_task_id uuid references ghaf_private.tasks(id),
  unique(family_id,kind,source_id), foreign key(child_id,family_id) references ghaf_private.children(id,family_id)
);

create index family_relatives_family on ghaf_private.family_relatives(family_id);
create index assignments_task_state on ghaf_private.assignments(task_id,state);
create index submissions_family_child on ghaf_private.submissions(family_id,child_id);
create index check_ins_family on ghaf_private.check_ins(family_id);
create index adjustments_family_child on ghaf_private.adjustments(family_id,child_id);
create index adjustments_assignment_status on ghaf_private.adjustments(assignment_id,status);
create index recognitions_family_child on ghaf_private.recognitions(family_id,child_id);
create index landscape_events_child_landscape on ghaf_private.landscape_events(child_id,landscape_id);
create index canopy_events_family on ghaf_private.canopy_events(family_id);
create index circle_events_family on ghaf_private.circle_events(family_id);
create index reveals_family_child on ghaf_private.reveals(family_id,child_id);
create index child_invitations_child on ghaf_private.child_invitations(child_id);
create index child_bindings_child on ghaf_private.child_bindings(child_id);

create function ghaf_private.fail(p_code text, p_state text default 'PT400') returns void
language plpgsql set search_path='' as $$ begin raise exception using errcode=p_state,message=p_code; end; $$;
create function ghaf_private.require_keys(p_value jsonb,p_allowed text[],p_required text[] default '{}') returns void
language plpgsql set search_path='' as $$
begin
  if p_value is null or jsonb_typeof(p_value)<>'object' or p_value-p_allowed<>'{}'::jsonb or not(p_value ?& p_required) then
    perform ghaf_private.fail('invalid_input'); end if;
end; $$;
create function ghaf_private.text_field(p_value jsonb,p_key text,p_max integer,p_optional boolean default false) returns text
language plpgsql set search_path='' as $$
declare v text;
begin
  if p_optional and (not(p_value ? p_key) or p_value->p_key='null'::jsonb) then return null; end if;
  if jsonb_typeof(p_value->p_key) is distinct from 'string' then perform ghaf_private.fail('invalid_input'); end if;
  v:=btrim(p_value->>p_key);
  if char_length(v) not between 1 and p_max then perform ghaf_private.fail('invalid_input'); end if;
  return v;
end; $$;
create function ghaf_private.uuid_field(p_value jsonb,p_key text) returns uuid
language plpgsql set search_path='' as $$
begin return ghaf_private.text_field(p_value,p_key,36)::uuid;
exception when invalid_text_representation then perform ghaf_private.fail('invalid_input'); return null; end; $$;
create function ghaf_private.string_array(p_value jsonb,p_max integer default 30,p_text_max integer default 1000) returns jsonb
language plpgsql set search_path='' as $$
begin
  if jsonb_typeof(p_value) is distinct from 'array' then perform ghaf_private.fail('invalid_input'); end if;
  if jsonb_array_length(p_value)>p_max or exists(select 1 from jsonb_array_elements(p_value) x
    where jsonb_typeof(x)<>'string' or char_length(btrim(x#>>'{}')) not between 1 and p_text_max) then
    perform ghaf_private.fail('invalid_input'); end if;
  return p_value;
end; $$;
create function ghaf_private.family_active(p_family_id uuid) returns boolean
language sql stable set search_path='' as $$
  select exists(select 1 from ghaf_private.families f join auth.users u on u.id=f.owner_user_id
    join public.pilot_access p on p.user_id=u.id where f.id=p_family_id and p.status='approved'
      and u.email_confirmed_at is not null and u.deleted_at is null and u.is_anonymous is false
      and (u.banned_until is null or u.banned_until<=now()));
$$;
create function ghaf_private.current_actor() returns table(role text,family_id uuid,child_id uuid,user_id uuid)
language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_session uuid; v_family uuid; v_child uuid; v_anonymous boolean;
begin
  begin v_session:=(auth.jwt()->>'session_id')::uuid;
  exception when invalid_text_representation then perform ghaf_private.fail('access_denied','42501'); end;
  select u.is_anonymous into v_anonymous from auth.users u where u.id=v_uid and u.deleted_at is null
    and (u.banned_until is null or u.banned_until<=now());
  if not found or v_session is null or not exists(select 1 from auth.sessions s where s.id=v_session
    and s.user_id=v_uid and (s.not_after is null or s.not_after>now())) then
    perform ghaf_private.fail('access_denied','42501'); end if;
  if v_anonymous then
    select b.family_id,b.child_id into v_family,v_child from ghaf_private.child_bindings b
      join ghaf_private.children c on c.id=b.child_id and c.family_id=b.family_id
      where b.session_id=v_session and b.user_id=v_uid and b.active and c.active;
    if not found or not ghaf_private.family_active(v_family) then perform ghaf_private.fail('access_revoked','42501'); end if;
    return query select 'child'::text,v_family,v_child,v_uid;
  else
    if not public.can_access_account_profile() then perform ghaf_private.fail('access_denied','42501'); end if;
    select g.family_id into v_family from ghaf_private.guardians g where g.user_id=v_uid and g.active;
    if v_family is null then
      insert into ghaf_private.families(owner_user_id) values(v_uid) on conflict(owner_user_id) do nothing;
      select f.id into v_family from ghaf_private.families f where f.owner_user_id=v_uid;
      insert into ghaf_private.guardians(user_id,family_id) values(v_uid,v_family) on conflict on constraint guardians_pkey do nothing;
    end if;
    if not ghaf_private.family_active(v_family) or not exists(select 1 from ghaf_private.guardians g where g.user_id=v_uid and g.family_id=v_family and g.active) then perform ghaf_private.fail('access_denied','42501'); end if;
    insert into ghaf_private.community_preferences(family_id) values(v_family) on conflict on constraint community_preferences_pkey do nothing;
    return query select 'parent'::text,v_family,null::uuid,v_uid;
  end if;
end; $$;
create function ghaf_private.require_fresh_parent(p_user_id uuid) returns void
language plpgsql set search_path='' as $$
begin
  if p_user_id is distinct from auth.uid() or not public.can_access_account_profile() or not exists(
    select 1 from jsonb_array_elements(case when jsonb_typeof(auth.jwt()->'amr')='array' then auth.jwt()->'amr' else '[]'::jsonb end) a
    where a->>'method'='password' and (case when (a->>'timestamp') ~ '^[0-9]+([.][0-9]+)?$' then (a->>'timestamp')::numeric else null end)
      between extract(epoch from now())-300 and extract(epoch from now())+5
  ) then perform ghaf_private.fail('reauthentication_required','42501'); end if;
end; $$;

-- Extension migration replaces these hooks within the same family transaction.
create function ghaf_private.read_extras(p_family_id uuid,p_child_id uuid,p_role text) returns jsonb
language sql set search_path='' as $$ select '{}'::jsonb; $$;
create function ghaf_private.command_extras(p_command jsonb,p_family_id uuid,p_child_id uuid,p_role text,p_user_id uuid) returns jsonb
language plpgsql set search_path='' as $$ begin perform ghaf_private.fail('invalid_command'); return null; end; $$;
create function ghaf_private.after_recognition(p_receipt_id uuid) returns void
language plpgsql set search_path='' as $$ begin return; end; $$;

insert into ghaf_private.landscapes(id,label_ar,label_en) values
('ghaf','الغاف','Ghaf'),
('samar','السمر','Samar'),
('sidr','السدر','Sidr'),
('date_palm','نخيل التمر','Date palm'),
('mangrove','القرم','Mangrove');
insert into ghaf_private.categories(id,label_ar,label_en,landscape_id) values
('faith_gratitude','الإيمان والامتنان','Faith & Gratitude','sidr'),
('roots_kinship','جذورنا','Roots & Kinship','ghaf'),
('home_responsibility','مسؤوليتي','Home Responsibility','samar'),
('green_impact','أثر أخضر','Green Impact','mangrove'),
('food_hospitality','النعمة والضيافة','Food & Hospitality','date_palm'),
('heritage_etiquette','تراثنا وآدابنا','Heritage & Etiquette','ghaf'),
('kindness_community','اللطف والمجتمع','Kindness & Community','samar'),
('learning_wellbeing','التعلّم والتوازن','Learning & Wellbeing','sidr');
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('FA01','faith_gratitude','sidr','تجهيز مكان نظيف للصلاة','Prepare a clean prayer space','جهّز مكاناً نظيفاً يختاره وليّ الأمر.','Prepare a clean space chosen by the Parent.','جهّز مكاناً نظيفاً يختاره وليّ الأمر.','Prepare a clean space chosen by the Parent.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اختر مع وليّ الأمر مكانًا مناسبًا.","رتّب المواد الآمنة التي اختارها وليّ الأمر.","راجع المكان مع وليّ الأمر عند الانتهاء."]'::jsonb,'["Choose a suitable place with the Parent.","Arrange the safe items the Parent selected.","Review the space with the Parent when finished."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف."],"child_allowed_actions":["اختر مع وليّ الأمر مكانًا مناسبًا.","رتّب المواد الآمنة التي اختارها وليّ الأمر.","راجع المكان مع وليّ الأمر عند الانتهاء."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step."],"child_allowed_actions":["Choose a suitable place with the Parent.","Arrange the safe items the Parent selected.","Review the space with the Parent when finished."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'recognition_only','not_applicable',null,'recurrent','child_guardian',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('FA02','faith_gratitude','sidr','التعرّف إلى عبارة يختارها وليّ الأمر','Learn one Parent-approved phrase','تعرّف إلى عبارة من مصدر يختاره وليّ الأمر.','Learn a phrase from a Parent-approved source.','تعرّف إلى عبارة من مصدر يختاره وليّ الأمر.','Learn a phrase from a Parent-approved source.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["يختار وليّ الأمر العبارة ومصدرها.","استمع أو اقرأ بالطريقة المناسبة لك.","جرّب ترديد العبارة مع المساعدة إن رغبت."]'::jsonb,'["The Parent chooses the phrase and its source.","Listen or read in the way that suits you.","Try saying the phrase with help if you wish."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف.","يختار وليّ الأمر العبارة ومصدرها."],"child_allowed_actions":["استمع أو اقرأ بالطريقة المناسبة لك."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step.","The Parent chooses the phrase and its source."],"child_allowed_actions":["Listen or read in the way that suits you."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'recognition_only','not_applicable',null,'once','child_guardian',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('RK04','roots_kinship','ghaf','قضاء وقت قصير مع قريب يرغب في المشاركة','Spend a short time with a willing relative','اقضِ وقتاً قصيراً مع قريب يرغب في المشاركة.','Spend a short time with a willing relative.','اقضِ وقتاً قصيراً مع قريب يرغب في المشاركة.','Spend a short time with a willing relative.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اتفق مع وليّ الأمر وقريبك على وقت قصير.","اختر نشاطًا بسيطًا يرغب فيه الجميع.","شارك في الوقت المتفق عليه مع حرية التوقف واستخدام وسائل الإتاحة التي تحتاج إليها."]'::jsonb,'["Agree a short time with the Parent and relative.","Choose a simple activity everyone wants.","Take part for the agreed time, with freedom to stop and use the accessibility tools you need."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف."],"child_allowed_actions":["اتفق مع وليّ الأمر وقريبك على وقت قصير.","اختر نشاطًا بسيطًا يرغب فيه الجميع.","شارك في الوقت المتفق عليه مع حرية التوقف واستخدام وسائل الإتاحة التي تحتاج إليها."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step."],"child_allowed_actions":["Agree a short time with the Parent and relative.","Choose a simple activity everyone wants.","Take part for the agreed time, with freedom to stop and use the accessibility tools you need."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'recognition_only','not_applicable',null,'recurrent','household',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('HR02','home_responsibility','samar','تجهيز حقيبة المدرسة للغد','Prepare tomorrow''s school bag','ضع مواد الغد في الحقيبة باستخدام قائمة.','Use a checklist to place tomorrow items in the bag.','ضع مواد الغد في الحقيبة باستخدام قائمة.','Use a checklist to place tomorrow items in the bag.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["راجع قائمة مواد الغد مع وليّ الأمر.","ضع المواد الآمنة في الحقيبة.","راجع القائمة واطلب المساعدة عند الحاجة."]'::jsonb,'["Review tomorrow’s materials with the Parent.","Put the safe materials in the bag.","Check the list and ask for help when needed."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف."],"child_allowed_actions":["راجع قائمة مواد الغد مع وليّ الأمر.","ضع المواد الآمنة في الحقيبة.","راجع القائمة واطلب المساعدة عند الحاجة."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step."],"child_allowed_actions":["Review tomorrow’s materials with the Parent.","Put the safe materials in the bag.","Check the list and ask for help when needed."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'fade_first','acquisition',6,'recurrent','household',false,false,true,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('HR05','home_responsibility','samar','مساعدة شخص بالغ في كيس نفايات عامة خفيف ومغلق','Help an adult with a sealed light general-waste bag','ضع كيسًا جديدًا فارغًا يقدمه الشخص البالغ في المكان المتفق عليه داخل المنزل، دون لمس الكيس المستخدم أو الحاوية.','Put a new, empty bag provided by the adult in the agreed indoor place, without touching the used bag or bin.','ضع كيسًا جديدًا فارغًا يقدمه الشخص البالغ في المكان المتفق عليه داخل المنزل، دون لمس الكيس المستخدم أو الحاوية.','Put a new, empty bag provided by the adult in the agreed indoor place, without touching the used bag or bin.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["يفحص الشخص البالغ الكيس ويتولى حمله.","ضع كيسًا جديدًا فارغًا يقدمه الشخص البالغ في المكان المتفق عليه داخل المنزل، دون لمس الكيس المستخدم أو الحاوية.","اترك نقل الكيس والتخلص منه للشخص البالغ."]'::jsonb,'["The adult checks the bag and handles all carrying.","Put a new, empty bag provided by the adult in the agreed indoor place, without touching the used bag or bin.","Leave moving and disposing of the bag to the adult."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يفحص شخص بالغ الكيس المغلق والخفيف.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يحمل الشخص البالغ الكيس ويتولى التخلّص منه.","يفحص الشخص البالغ الكيس ويتولى حمله.","اترك نقل الكيس والتخلص منه للشخص البالغ."],"child_allowed_actions":["ضع كيسًا جديدًا فارغًا يقدمه الشخص البالغ في المكان المتفق عليه داخل المنزل، دون لمس الكيس المستخدم أو الحاوية."],"excluded_hazards":["لا زجاج ولا أدوات حادّة ولا بطاريات ولا مواد كيميائية أو مجهولة.","لا لمس للكيس المستخدم أو الحاوية، ولا لعب بالأكياس أو تغطية الرأس أو الوجه بها."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"An adult checks the sealed light bag.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["The adult carries and disposes of the bag.","The adult checks the bag and handles all carrying.","Leave moving and disposing of the bag to the adult."],"child_allowed_actions":["Put a new, empty bag provided by the adult in the agreed indoor place, without touching the used bag or bin."],"excluded_hazards":["No glass, sharps, batteries, chemicals, or unknown waste.","Do not touch the used bag or bin, play with bags, or cover the head or face with a bag."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'fade_first','acquisition',8,'recurrent','household',false,true,true,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('GI01','green_impact','mangrove','فرز المواد النظيفة المقبولة محلياً','Sort locally accepted clean recyclables','افرز داخل المنزل الورق والبلاستيك النظيفين والسليمين وغير الحادّين بعد فحص شخص بالغ.','Sort only intact, non-sharp clean paper and plastic indoors after an adult check.','افرز داخل المنزل الورق والبلاستيك النظيفين والسليمين وغير الحادّين بعد فحص شخص بالغ.','Sort only intact, non-sharp clean paper and plastic indoors after an adult check.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["يفحص الشخص البالغ المواد المقبولة محليًا.","افرز داخل المنزل الورق والبلاستيك النظيفين والسليمين وغير الحادّين بعد فحص شخص بالغ.","يراجع الشخص البالغ الفرز ويتولى النقل والتخلص."]'::jsonb,'["The adult checks materials accepted locally.","Sort only intact, non-sharp clean paper and plastic indoors after an adult check.","The adult checks the sorting and handles transport and disposal."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يفحص شخص بالغ جميع المواد مسبقاً؛ ويقتصر الفرز على الورق والبلاستيك النظيفين والسليمين وغير الحادّين والمقبولين في نظام إعادة التدوير المحلي.","adult_second_check":"يراجع الشخص البالغ الفرز بعد الانتهاء.","adult_owned_actions":["يفحص الشخص البالغ المواد المقبولة محليًا.","يراجع الشخص البالغ الفرز ويتولى النقل والتخلص."],"child_allowed_actions":["افرز داخل المنزل الورق والبلاستيك النظيفين والسليمين وغير الحادّين بعد فحص شخص بالغ."],"excluded_hazards":["يُمنع لمس الزجاج أو الأدوات الحادّة أو البطاريات أو المواد الكيميائية أو الأدوية أو المواد الفاسدة أو الأكياس المتسربة أو أي مادة مجهولة.","يُمنع إصلاح الحاويات أو الأجهزة أو المصابيح أو أي شيء كهربائي."],"stop_and_ask_adult":"يجب التوقّف وسؤال شخص بالغ عند الشك.","route_constraint":"داخل المنزل فقط؛ يتولى الشخص البالغ النقل والتخلص.","indoor_alternative":"يقتصر نشاط الطفل على الفرز داخل المنزل؛ لا يلزم الخروج.","aftercare":"تُغسل اليدان بعد الانتهاء."}'::jsonb,'{"adult_pre_check":"An adult pre-checks every item; use only intact, non-sharp clean paper and plastic accepted by the household local recycling stream.","adult_second_check":"The adult checks the sorting when finished.","adult_owned_actions":["The adult checks materials accepted locally.","The adult checks the sorting and handles transport and disposal."],"child_allowed_actions":["Sort only intact, non-sharp clean paper and plastic indoors after an adult check."],"excluded_hazards":["Do not touch glass, sharps, batteries, chemicals, medicine, spoiled material, leaking bags, or unknown waste.","Do not repair a bin, appliance, light, or electrical item."],"stop_and_ask_adult":"Stop and ask an adult whenever anything is uncertain.","route_constraint":"Indoors only; the adult handles transport and disposal.","indoor_alternative":"The Child only sorts indoors; no outing is required.","aftercare":"Wash hands afterward."}'::jsonb,array['6_8','9_11','12_14']::text[],'fade_first','acquisition',8,'recurrent','household',true,true,true,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('FH01','food_hospitality','date_palm','المساعدة في طبق تقديم مشترك','Help prepare a shared serving dish','ساعد في ترتيب طبق تقديم مشترك باستخدام الطعام والكمية وأدوات التقديم الآمنة التي اختارها وليّ الأمر، دون اشتراط تناول الطعام.','Help arrange a shared serving dish using the food, amount and safe serving tools the Parent selected, with no requirement to eat it.','ساعد في ترتيب طبق تقديم مشترك باستخدام الطعام والكمية وأدوات التقديم الآمنة التي اختارها وليّ الأمر، دون اشتراط تناول الطعام.','Help arrange a shared serving dish using the food, amount and safe serving tools the Parent selected, with no requirement to eat it.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["يختار وليّ الأمر الطعام وأدوات تقديم باردة وآمنة وغير قابلة للكسر، ويتولى فحص سلامة الطعام.","ساعد في ترتيب طبق مشترك بمواد باردة وآمنة.","اعرض ما جهّزته على وليّ الأمر؛ لا يلزم تناول الطعام."]'::jsonb,'["The Parent chooses the food and safe, cool, non-breakable serving tools, and handles food-safety checks.","Help arrange a shared dish using safe, cool items.","Show the Parent what you prepared; eating is not required."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف.","يختار وليّ الأمر الطعام وأدوات تقديم باردة وآمنة وغير قابلة للكسر، ويتولى فحص سلامة الطعام."],"child_allowed_actions":["ساعد في ترتيب طبق مشترك بمواد باردة وآمنة.","اعرض ما جهّزته على وليّ الأمر؛ لا يلزم تناول الطعام."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step.","The Parent chooses the food and safe, cool, non-breakable serving tools, and handles food-safety checks."],"child_allowed_actions":["Help arrange a shared dish using safe, cool items.","Show the Parent what you prepared; eating is not required."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'fade_first','acquisition',4,'recurrent','household',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('FH04','food_hospitality','date_palm','ترتيب التمر أو الماء أو المناديل للضيوف','Arrange dates, water, or napkins for guests','رتّب مواد الضيافة الباردة والآمنة.','Arrange safe, cool hospitality items.','رتّب مواد الضيافة الباردة والآمنة.','Arrange safe, cool hospitality items.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اختر مع وليّ الأمر مواد الضيافة الباردة والآمنة.","رتّب التمر أو الماء أو المناديل.","اترك الأواني الزجاجية والسوائل والأواني الساخنة للشخص البالغ."]'::jsonb,'["Choose safe, cool hospitality items with the Parent.","Arrange dates, water or napkins.","Leave glassware, hot liquids and hot vessels to the adult."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ حمل وصب القهوة العربية الساخنة.","اترك الأواني الزجاجية والسوائل والأواني الساخنة للشخص البالغ."],"child_allowed_actions":["اختر مع وليّ الأمر مواد الضيافة الباردة والآمنة.","رتّب التمر أو الماء أو المناديل."],"excluded_hazards":["لا يلمس الطفل السوائل أو الأواني الساخنة."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult alone handles and pours hot gahwa.","Leave glassware, hot liquids and hot vessels to the adult."],"child_allowed_actions":["Choose safe, cool hospitality items with the Parent.","Arrange dates, water or napkins."],"excluded_hazards":["The Child does not touch hot liquids or vessels."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'fade_first','acquisition',6,'recurrent','household',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('KC01','kindness_community','samar','المساعدة في مهمة صغيرة يختارها الأخ أو الأخت','Help with one small job a sibling chooses','اعرض المساعدة في مهمة صغيرة وآمنة، وقدّمها فقط إذا رغبتما معًا؛ رفض العرض لا يعني الفشل ولا يوجب متابعة المهمة.','Offer help with one small, safe job and help only if you both wish; declining is not failure and does not require continuing the task.','اعرض المساعدة في مهمة صغيرة وآمنة، وقدّمها فقط إذا رغبتما معًا؛ رفض العرض لا يعني الفشل ولا يوجب متابعة المهمة.','Offer help with one small, safe job and help only if you both wish; declining is not failure and does not require continuing the task.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اعرض على أخيك أو أختك المساعدة في مهمة صغيرة.","إذا وافقتما معًا، اتفقا على خطوة صغيرة وآمنة. إذا وافقتما معًا، اتفقا على خطوة صغيرة وآمنة.","قدّم المساعدة إن رغبتما؛ يمكن لأي منكما التوقف. قدّم المساعدة إن رغبتما؛ يمكن لأي منكما التوقف."]'::jsonb,'["Offer your sibling help with one small job.","If you both agree, choose one small, safe step together. If you both agree, choose one small, safe step together.","Help if you both wish; either person may stop. Help if you both wish; either person may stop."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف."],"child_allowed_actions":["اعرض على أخيك أو أختك المساعدة في مهمة صغيرة."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step."],"child_allowed_actions":["Offer your sibling help with one small job."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'recognition_only','not_applicable',null,'recurrent','household',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('LW01','learning_wellbeing','sidr','قراءة كتاب أو الاستماع إليه','Read or listen to a book','اقرأ أو استمع بصيغة ميسّرة للمدة المتفق عليها مع وليّ الأمر قبل قبول المهمة، مع الاستراحات والمساعدة المتفق عليها.','Read or listen in an accessible format for the duration agreed with the Parent before accepting the task, with the agreed breaks and help.','اقرأ أو استمع بصيغة ميسّرة للمدة المتفق عليها مع وليّ الأمر قبل قبول المهمة، مع الاستراحات والمساعدة المتفق عليها.','Read or listen in an accessible format for the duration agreed with the Parent before accepting the task, with the agreed breaks and help.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اختر كتابًا أو تسجيلًا مناسبًا مع وليّ الأمر.","اقرأ أو استمع بصيغة ميسّرة للمدة المتفق عليها.","اطلب المساعدة أو استراحة عند الحاجة."]'::jsonb,'["Choose a suitable book or recording with the Parent.","Read or listen in an accessible format for the agreed time.","Ask for help or a break when needed."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف.","اطلب المساعدة أو استراحة عند الحاجة."],"child_allowed_actions":["اختر كتابًا أو تسجيلًا مناسبًا مع وليّ الأمر.","اقرأ أو استمع بصيغة ميسّرة للمدة المتفق عليها."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step.","Ask for help or a break when needed."],"child_allowed_actions":["Choose a suitable book or recording with the Parent.","Read or listen in an accessible format for the agreed time."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'fade_first','acquisition',6,'recurrent','child_guardian',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('FA03','faith_gratitude','sidr','مشاركة لحظة امتنان يختارها الطفل','Share one gratitude moment the Child chooses','اختر إن رغبت شيئًا تقدّره؛ يمكنك الاحتفاظ بالفكرة لنفسك ولا يلزم الإفصاح عنها أو تسجيلها.','If you wish, choose something you appreciate; you may keep it to yourself, with no disclosure or recording required.','اختر إن رغبت شيئًا تقدّره؛ يمكنك الاحتفاظ بالفكرة لنفسك ولا يلزم الإفصاح عنها أو تسجيلها.','If you wish, choose something you appreciate; you may keep it to yourself, with no disclosure or recording required.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اختر شيئًا تقدّره إن رغبت.","يمكنك التعبير بالكلام أو الرسم أو الكتابة إن رغبت.","يمكنك الاحتفاظ بالفكرة لنفسك؛ لا يلزم مشاركتها أو تسجيلها في غاف."]'::jsonb,'["Choose something you appreciate if you wish.","You may express it by speaking, drawing or writing if you wish.","You may keep the thought to yourself; sharing or recording it in Ghaf is not required."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف.","يمكنك الاحتفاظ بالفكرة لنفسك؛ لا يلزم مشاركتها أو تسجيلها في غاف."],"child_allowed_actions":["اختر إن رغبت شيئًا تقدّره؛ يمكنك الاحتفاظ بالفكرة لنفسك ولا يلزم الإفصاح عنها أو تسجيلها."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step.","You may keep the thought to yourself; sharing or recording it in Ghaf is not required."],"child_allowed_actions":["If you wish, choose something you appreciate; you may keep it to yourself, with no disclosure or recording required."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'recognition_only','not_applicable',null,'once','child_guardian',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('RK01','roots_kinship','ghaf','الاتصال بقريب يختاره وليّ الأمر','Call a relative chosen by the Parent','اختر تحية أو سؤالًا قصيرًا مع وليّ الأمر، وشارك إن رغبت في مكالمة يرتّبها وليّ الأمر خارج غاف مع قريب موافق. يمكنك الاكتفاء بالتدرّب على التحية مع وليّ الأمر.','Choose a short greeting or question with the Parent, and optionally join a call the Parent arranges outside Ghaf with a willing relative. You may just rehearse the greeting with the Parent.','اختر تحية أو سؤالًا قصيرًا مع وليّ الأمر، وشارك إن رغبت في مكالمة يرتّبها وليّ الأمر خارج غاف مع قريب موافق. يمكنك الاكتفاء بالتدرّب على التحية مع وليّ الأمر.','Choose a short greeting or question with the Parent, and optionally join a call the Parent arranges outside Ghaf with a willing relative. You may just rehearse the greeting with the Parent.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اختر مع وليّ الأمر قريبًا يرغب في التواصل.","يمكنك التدرّب على تحية مع وليّ الأمر، أو المشاركة إن رغبت في اتصال يرتّبه خارج غاف.","استخدم تحية أو سؤالًا تختاره، ويمكنك إنهاء المشاركة."]'::jsonb,'["Choose a willing relative with the Parent.","You may rehearse a greeting with the Parent, or optionally join a call they arrange outside Ghaf.","Use a greeting or question you choose; you may finish participating."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف."],"child_allowed_actions":["اختر مع وليّ الأمر قريبًا يرغب في التواصل."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step."],"child_allowed_actions":["Choose a willing relative with the Parent."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'recognition_only','not_applicable',null,'recurrent','child_guardian',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('RK02','roots_kinship','ghaf','الاستماع إلى قصة عائلية قصيرة','Listen to a short family story','استمع إلى قصة يختار قريب مشاركتها، مع إمكانية التوقف في أي وقت.','Listen to a story a relative chooses to share, with the option to stop at any time.','استمع إلى قصة يختار قريب مشاركتها، مع إمكانية التوقف في أي وقت.','Listen to a story a relative chooses to share, with the option to stop at any time.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اختر قريبًا يرغب في مشاركة قصة.","استمع بالطريقة والمدة المتفق عليهما.","يمكنك طرح سؤال أو إنهاء المشاركة."]'::jsonb,'["Choose a relative who wants to share a story.","Listen in the agreed way for the agreed time.","You may ask a question or finish participating."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف."],"child_allowed_actions":["اختر قريبًا يرغب في مشاركة قصة.","استمع بالطريقة والمدة المتفق عليهما."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step."],"child_allowed_actions":["Choose a relative who wants to share a story.","Listen in the agreed way for the agreed time."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'recognition_only','not_applicable',null,'once','child_guardian',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('HR01','home_responsibility','samar','ترتيب الكتب والأقلام','Put books and pens in their places','أعد الكتب والأقلام إلى أماكنها المتفق عليها.','Return books and pens to their agreed places.','أعد الكتب والأقلام إلى أماكنها المتفق عليها.','Return books and pens to their agreed places.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اختر الكتب والأقلام التي ستُرتّب.","أعدها إلى الأماكن المتفق عليها مع المساعدة عند الحاجة.","راجع المساحة التي اخترتها."]'::jsonb,'["Choose the books and pens to put away.","Return them to their agreed places, with help when needed.","Check the space you chose."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف."],"child_allowed_actions":["اختر الكتب والأقلام التي ستُرتّب.","أعدها إلى الأماكن المتفق عليها مع المساعدة عند الحاجة.","راجع المساحة التي اخترتها."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step."],"child_allowed_actions":["Choose the books and pens to put away.","Return them to their agreed places, with help when needed.","Check the space you chose."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'fade_first','acquisition',4,'recurrent','household',false,true,true,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('GI02','green_impact','mangrove','إطفاء الأنوار غير المستخدمة مع شخص بالغ','Switch off unused lights with an adult','تفقد غرفة واحدة مع شخص بالغ وأطفئ الضوء غير المطلوب.','Check one room with an adult and switch off an unneeded light.','تفقد غرفة واحدة مع شخص بالغ وأطفئ الضوء غير المطلوب.','Check one room with an adult and switch off an unneeded light.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اختر غرفة مع شخص بالغ وتحققا من الحاجة إلى الضوء.","أطفئ الضوء غير المطلوب باستخدام مفتاح سليم وآمن الوصول، مع المساعدة عند الحاجة.","اطلب من الشخص البالغ إتمام الخطوة إذا احتجت إلى مساعدة."]'::jsonb,'["Choose a room with an adult and check whether its light is needed.","Switch off the unneeded light using an intact, safely reachable switch, with help when needed.","Ask the adult to complete the step if you need help."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف.","اطلب من الشخص البالغ إتمام الخطوة إذا احتجت إلى مساعدة."],"child_allowed_actions":["اختر غرفة مع شخص بالغ وتحققا من الحاجة إلى الضوء.","أطفئ الضوء غير المطلوب باستخدام مفتاح سليم وآمن الوصول، مع المساعدة عند الحاجة."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step.","Ask the adult to complete the step if you need help."],"child_allowed_actions":["Choose a room with an adult and check whether its light is needed.","Switch off the unneeded light using an intact, safely reachable switch, with help when needed."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'fade_first','acquisition',4,'recurrent','household',true,true,true,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('GI03','green_impact','mangrove','استخدام زجاجة ماء قابلة لإعادة الاستخدام','Prepare a reusable water bottle','اطلب من شخص بالغ فحص زجاجة سليمة ثم جهزها للاستخدام.','Ask an adult to check an intact bottle, then prepare it for use.','اطلب من شخص بالغ فحص زجاجة سليمة ثم جهزها للاستخدام.','Ask an adult to check an intact bottle, then prepare it for use.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اطلب من شخص بالغ فحص زجاجة سليمة غير قابلة للكسر.","جهّزها للاستخدام بالطريقة التي اتفقتما عليها.","ضعها في المكان المتفق عليه."]'::jsonb,'["Ask an adult to check an intact, non-breakable bottle.","Prepare it for use in the agreed way.","Put it in the agreed place."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف."],"child_allowed_actions":["اطلب من شخص بالغ فحص زجاجة سليمة غير قابلة للكسر.","جهّزها للاستخدام بالطريقة التي اتفقتما عليها.","ضعها في المكان المتفق عليه."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step."],"child_allowed_actions":["Ask an adult to check an intact, non-breakable bottle.","Prepare it for use in the agreed way.","Put it in the agreed place."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'standard','acquisition',4,'once','household',true,true,true,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('FH02','food_hospitality','date_palm','ترتيب المناديل والملاعق الباردة','Arrange napkins and cool utensils','رتّب مواد آمنة وغير قابلة للكسر يحددها وليّ الأمر.','Arrange safe, non-breakable items selected by the Parent.','رتّب مواد آمنة وغير قابلة للكسر يحددها وليّ الأمر.','Arrange safe, non-breakable items selected by the Parent.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["يختار وليّ الأمر مواد باردة وآمنة وغير قابلة للكسر.","رتّب المناديل والملاعق في المكان المتفق عليه.","راجع الترتيب مع المساعدة عند الحاجة."]'::jsonb,'["The Parent selects safe, cool, non-breakable items.","Arrange napkins and spoons in the agreed place.","Check the arrangement with help when needed."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف.","يختار وليّ الأمر مواد باردة وآمنة وغير قابلة للكسر."],"child_allowed_actions":["رتّب المناديل والملاعق في المكان المتفق عليه.","راجع الترتيب مع المساعدة عند الحاجة."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step.","The Parent selects safe, cool, non-breakable items."],"child_allowed_actions":["Arrange napkins and spoons in the agreed place.","Check the arrangement with help when needed."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'fade_first','acquisition',4,'recurrent','household',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('HE01','heritage_etiquette','ghaf','اختيار تحية مناسبة مع وليّ الأمر','Choose an appropriate greeting with the Parent','اختر تحية من الخيارات التي يراجعها وليّ الأمر، ويمكنك التدرّب عليها إن رغبت.','Choose a greeting from options reviewed by the Parent; you may rehearse it if you wish.','اختر تحية من الخيارات التي يراجعها وليّ الأمر، ويمكنك التدرّب عليها إن رغبت.','Choose a greeting from options reviewed by the Parent; you may rehearse it if you wish.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["يراجع وليّ الأمر خيارات التحية المناسبة للموقف.","اختر عبارة ترتاح لاستخدامها.","تدرّب عليها مع وليّ الأمر إن رغبت."]'::jsonb,'["The Parent reviews greetings suited to the situation.","Choose a phrase you feel comfortable using.","Practise it with the Parent if you wish."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف.","يراجع وليّ الأمر خيارات التحية المناسبة للموقف."],"child_allowed_actions":["اختر عبارة ترتاح لاستخدامها."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step.","The Parent reviews greetings suited to the situation."],"child_allowed_actions":["Choose a phrase you feel comfortable using."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'recognition_only','not_applicable',null,'once','child_guardian',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('HE02','heritage_etiquette','ghaf','الاستماع إلى المتحدث في المجلس','Practise listening to a speaker in the majlis','تابع حديثًا قصيرًا بالطريقة المناسبة لك، ويمكنك طلب توضيح أو استراحة أو إنهاء المشاركة.','Follow a short conversation in the way that suits you; you may ask for clarification or a break, or stop participating.','تابع حديثًا قصيرًا بالطريقة المناسبة لك، ويمكنك طلب توضيح أو استراحة أو إنهاء المشاركة.','Follow a short conversation in the way that suits you; you may ask for clarification or a break, or stop participating.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اتفق مع وليّ الأمر على وقت قصير مناسب.","استمع بالطريقة المناسبة لك دون فرض تواصل بصري.","اطلب توضيحًا أو استراحة عند الحاجة."]'::jsonb,'["Agree a suitable short time with the Parent.","Listen in the way that suits you; eye contact is not required.","Ask for clarification or a break when needed."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف.","اطلب توضيحًا أو استراحة عند الحاجة."],"child_allowed_actions":["اتفق مع وليّ الأمر على وقت قصير مناسب.","استمع بالطريقة المناسبة لك دون فرض تواصل بصري."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step.","Ask for clarification or a break when needed."],"child_allowed_actions":["Agree a suitable short time with the Parent.","Listen in the way that suits you; eye contact is not required."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'recognition_only','not_applicable',null,'recurrent','child_guardian',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('HE03','heritage_etiquette','ghaf','سؤال شخص بالغ عن غرض تراثي','Ask an adult about one heritage object','اختر غرضاً آمناً واسأل شخصاً بالغاً عن قصته أو استخدامه.','Choose one safe object and ask an adult about its story or use.','اختر غرضاً آمناً واسأل شخصاً بالغاً عن قصته أو استخدامه.','Choose one safe object and ask an adult about its story or use.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["يختار وليّ الأمر غرضًا آمنًا.","اسأل شخصًا بالغًا عن استخدامه أو قصته.","استمع أو شاهد الغرض دون حمله أو استخدامه؛ يتولى الشخص البالغ التعامل معه."]'::jsonb,'["The Parent chooses a safe object.","Ask an adult about its use or story.","Listen or look without holding or using the object; the adult handles it."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف.","يختار وليّ الأمر غرضًا آمنًا.","استمع أو شاهد الغرض دون حمله أو استخدامه؛ يتولى الشخص البالغ التعامل معه."],"child_allowed_actions":["اسأل شخصًا بالغًا عن استخدامه أو قصته."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step.","The Parent chooses a safe object.","Listen or look without holding or using the object; the adult handles it."],"child_allowed_actions":["Ask an adult about its use or story."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'recognition_only','not_applicable',null,'once','child_guardian',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('KC02','kindness_community','samar','كتابة رسالة شكر قصيرة','Write a short thank-you note','اكتب أو ارسم رسالة شكر لمن تختاره، أو أمْلها على شخص بالغ يساعدك في كتابتها؛ تسليمها اختياري.','Write or draw a thank-you note for someone you choose, or dictate it to an adult who helps write it; delivery is optional.','اكتب أو ارسم رسالة شكر لمن تختاره، أو أمْلها على شخص بالغ يساعدك في كتابتها؛ تسليمها اختياري.','Write or draw a thank-you note for someone you choose, or dictate it to an adult who helps write it; delivery is optional.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اختر شخصًا ترغب في شكره.","اكتب أو ارسم رسالة للشخص الذي اخترته، أو اطلب من شخص بالغ كتابتها بإملائك.","اختر مع وليّ الأمر إن كنت تريد تسليمها."]'::jsonb,'["Choose someone you would like to thank.","Write or draw a note for the person you chose, or dictate it to an adult who helps write it.","Choose with the Parent whether to give the note."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف."],"child_allowed_actions":["اختر شخصًا ترغب في شكره.","اكتب أو ارسم رسالة للشخص الذي اخترته، أو اطلب من شخص بالغ كتابتها بإملائك."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step."],"child_allowed_actions":["Choose someone you would like to thank.","Write or draw a note for the person you chose, or dictate it to an adult who helps write it."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'recognition_only','not_applicable',null,'once','child_guardian',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('KC03','kindness_community','samar','اختيار مساعدة صغيرة في المنزل','Choose one small way to help at home','اسأل عمّا يحتاج إلى مساعدة واختر خطوة آمنة يمكنك إنجازها.','Ask what needs help and choose one safe step you can complete.','اسأل عمّا يحتاج إلى مساعدة واختر خطوة آمنة يمكنك إنجازها.','Ask what needs help and choose one safe step you can complete.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اسأل وليّ الأمر عن مساعدة بسيطة مطلوبة.","اختر خطوة آمنة تستطيع القيام بها.","نفّذها مع المساعدة المتفق عليها."]'::jsonb,'["Ask the Parent about a small helpful job.","Choose a safe step you can do.","Do it with the agreed help."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف."],"child_allowed_actions":["اسأل وليّ الأمر عن مساعدة بسيطة مطلوبة.","اختر خطوة آمنة تستطيع القيام بها.","نفّذها مع المساعدة المتفق عليها."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step."],"child_allowed_actions":["Ask the Parent about a small helpful job.","Choose a safe step you can do.","Do it with the agreed help."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'recognition_only','not_applicable',null,'recurrent','household',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('LW02','learning_wellbeing','sidr','تجهيز مكان هادئ للتعلّم','Prepare a calm learning space','ضع الأدوات المطلوبة في مكان مناسب يختاره وليّ الأمر.','Place the needed materials in a suitable space chosen by the Parent.','ضع الأدوات المطلوبة في مكان مناسب يختاره وليّ الأمر.','Place the needed materials in a suitable space chosen by the Parent.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اختر مكانًا مناسبًا مع وليّ الأمر.","ضع الأدوات المطلوبة في متناولك.","راجع ما تحتاج إليه قبل البدء."]'::jsonb,'["Choose a suitable space with the Parent.","Place the needed materials within reach.","Check what you need before starting."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف."],"child_allowed_actions":["اختر مكانًا مناسبًا مع وليّ الأمر.","ضع الأدوات المطلوبة في متناولك.","راجع ما تحتاج إليه قبل البدء."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step."],"child_allowed_actions":["Choose a suitable space with the Parent.","Place the needed materials within reach.","Check what you need before starting."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'fade_first','acquisition',4,'recurrent','child_guardian',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('LW03','learning_wellbeing','sidr','تقسيم مشروع إلى ثلاث خطوات','Break one project into three steps','اكتب ثلاث خطوات قصيرة أو أمْلها على شخص بالغ، مع المساعدة المتفق عليها.','Write three short steps or dictate them to an adult, with the agreed help.','اكتب ثلاث خطوات قصيرة أو أمْلها على شخص بالغ، مع المساعدة المتفق عليها.','Write three short steps or dictate them to an adult, with the agreed help.','تربط المهمة خطوة واضحة بحاجة عائلية.','The task links one clear action to a family need.','["اختر مشروعًا صغيرًا مع وليّ الأمر.","اكتب أو أمْلِ على شخص بالغ ثلاث خطوات قصيرة.","اختر الخطوة الأولى التي ستجربها."]'::jsonb,'["Choose a small project with the Parent.","Write or dictate three short steps to an adult.","Choose the first step you will try."]'::jsonb,'المساعدة المتفق عليها مسموحة.','Agreed help is allowed.','يحدد وليّ الأمر مستوى الإشراف.','A Parent sets the supervision level.','{"adult_pre_check":"يختار وليّ الأمر المهمة المناسبة.","adult_second_check":"يتحقق وليّ الأمر من اكتمال المهمة بأمان.","adult_owned_actions":["يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف."],"child_allowed_actions":["اختر مشروعًا صغيرًا مع وليّ الأمر.","اكتب أو أمْلِ على شخص بالغ ثلاث خطوات قصيرة."],"excluded_hazards":["لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية."],"stop_and_ask_adult":"توقّف واسأل شخصاً بالغاً عند الشك.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,'{"adult_pre_check":"A Parent chooses the appropriate task.","adult_second_check":"A Parent checks that the task was completed safely.","adult_owned_actions":["An adult owns any supervised step."],"child_allowed_actions":["Choose a small project with the Parent.","Write or dictate three short steps to an adult."],"excluded_hazards":["The task excludes sharps, chemicals, and electrical work."],"stop_and_ask_adult":"Stop and ask an adult when unsure.","route_constraint":null,"indoor_alternative":null,"aftercare":null}'::jsonb,array['6_8','9_11','12_14']::text[],'standard','acquisition',6,'once','child_guardian',false,false,false,array[]::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('task_recycling_p0_v1','green_impact','mangrove','فرز المواد النظيفة القابلة لإعادة التدوير ومرافقة شخص بالغ إلى حاوية إعادة تدوير آمنة يحددها وليّ الأمر','Sort clean recyclables and go with an adult to the guardian-approved safe recycling bin','بعد أن يفحص شخص بالغ المواد مسبقاً، يفرز الطفل الورق والبلاستيك النظيفين والسليمين وغير الحادّين والمقبولين في نظام إعادة التدوير المحلي، ويضعهما في الحاوية المنزلية الصحيحة. عند الحاجة، يساعد الطفل بعد فحص ثانٍ من الشخص البالغ على إغلاق كيس إعادة تدوير خفيف، ثم يرافق الشخص البالغ عبر مسار آمن يوافق عليه وليّ الأمر. يقيّم الشخص البالغ الحرارة وحركة المركبات، ويحمل الكيس ويتولى التخلّص منه. لا يتطلب المسار عبور طريق، ويبقى الطفل بعيداً عن مسارات المركبات وضواغط النفايات ومزالقها وآلات غرف الحاويات. إذا كانت الحرارة أو حركة المركبات غير آمنة، تؤجَّل الرحلة أو يُستخدم بديل للفرز داخل المنزل. النفايات المنزلية العامة ليست جزءاً من هذه المهمة.','After an adult pre-check, the Child sorts intact, non-sharp clean paper and plastic accepted by the local stream into the correct household recycling container. If needed, the Child helps after the adult second check to close one lightweight recycling bag, then accompanies the adult on a guardian-approved safe route. The adult assesses heat and traffic, carries the bag, and handles disposal. The route requires no road crossing, and the Child stays out of vehicle paths, compactors, waste chutes, and bin-room machinery. If heat or traffic is unsafe, the family postpones the route or uses an indoor sorting alternative. General household waste is not part of this task.','فرز المواد النظيفة المقبولة محلياً ثم مرافقة شخص بالغ عبر مسار آمن.','Sort locally accepted clean recyclables, then accompany an adult on a safe route.','يساعد الفرز الدقيق الأسرة على التعامل بمسؤولية مع المواد القابلة لإعادة التدوير. هذه صلة عملية بالاستدامة، وليست قياساً لكمية الكربون أو الماء أو النفايات، ولا تعني زراعة شجرة حقيقية.','Careful sorting helps the household handle recyclable materials responsibly. This is a practical sustainability connection, not a quantified carbon, water, waste, or real-tree claim.','["فرز المواد النظيفة المقبولة محلياً ثم مرافقة شخص بالغ عبر مسار آمن."]'::jsonb,'["Sort locally accepted clean recyclables, then accompany an adult on a safe route."]'::jsonb,'تُقبل المساعدة المسموح بها ولا تقلل المكافأة المعروضة.','Permitted help counts and does not reduce the displayed award.','حضور شخص بالغ وفحصه وحمله للكيس وتوليه المسار والتخلّص مطلوب.','An adult must be present, perform both checks, carry the bag, own the route, and handle disposal.','{"adult_pre_check":"يفحص شخص بالغ جميع المواد مسبقاً؛ ويقتصر الفرز على الورق والبلاستيك النظيفين والسليمين وغير الحادّين والمقبولين في نظام إعادة التدوير المحلي.","adult_second_check":"يعيد الشخص البالغ الفحص قبل إغلاق الكيس.","adult_owned_actions":["يقيّم الشخص البالغ الحرارة وحركة المركبات، ويحمل الكيس ويتولى التخلّص منه.","يختار الشخص البالغ المسار الآمن ويتولى جميع خطوات الحاوية."],"child_allowed_actions":["يفرز الطفل فقط الورق والبلاستيك النظيفين والسليمين وغير الحادّين اللذين وافق عليهما شخص بالغ.","بعد الفحص الثاني، يمكن لالطفل المساعدة في إغلاق كيس إعادة تدوير خفيف ثم مرافقة الشخص البالغ."],"excluded_hazards":["يُمنع لمس الزجاج أو الأدوات الحادّة أو البطاريات أو المواد الكيميائية أو الأدوية أو المواد الفاسدة أو الأكياس المتسربة أو أي مادة مجهولة.","يُمنع إصلاح الحاويات أو الأجهزة أو المصابيح أو أي شيء كهربائي."],"stop_and_ask_adult":"يجب التوقّف وسؤال شخص بالغ عند الشك.","route_constraint":"لا يتطلب المسار عبور طريق، ويبقى الطفل بعيداً عن مسارات المركبات والضواغط والمزالق وآلات غرف الحاويات.","indoor_alternative":"تؤجَّل الرحلة أو يُستخدم بديل داخلي إذا كانت الحرارة أو حركة المركبات غير آمنة.","aftercare":"تُغسل اليدان بعد الانتهاء."}'::jsonb,'{"adult_pre_check":"An adult pre-checks every item; use only intact, non-sharp clean paper and plastic accepted by the household local recycling stream.","adult_second_check":"The adult performs a second check before the lightweight recycling bag is closed.","adult_owned_actions":["The adult assesses heat and traffic, must carry the bag, and owns disposal.","The adult chooses and owns the safe route and every disposal-bin action."],"child_allowed_actions":["the Child sorts only intact, non-sharp clean paper and plastic approved by an adult.","After the second adult check, the Child may help close one light recycling bag and accompany the adult."],"excluded_hazards":["Do not touch glass, sharps, batteries, chemicals, medicine, spoiled material, leaking bags, or unknown waste.","Do not repair a bin, appliance, light, or electrical item."],"stop_and_ask_adult":"Stop and ask an adult whenever anything is uncertain.","route_constraint":"The route requires no road crossing and keeps the Child out of vehicle paths, compactors, waste chutes, and bin-room machinery.","indoor_alternative":"Postpone the route or use an indoor alternative if heat or traffic is unsafe.","aftercare":"Wash hands afterward."}'::jsonb,array['6_8','9_11','12_14']::text[],'standard','acquisition',12,'once','household',true,true,true,array['skill.sorting','skill.coast_care']::text[]);
insert into ghaf_private.templates(id,category_id,landscape_id,title_ar,title_en,definition_ar,definition_en,positive_action_ar,positive_action_en,why_it_matters_ar,why_it_matters_en,steps_ar,steps_en,permitted_help_ar,permitted_help_en,supervision_ar,supervision_en,safety_ar,safety_en,age_bands,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids) values('task_recycling_indoor_safe_equivalent_v1','green_impact','mangrove','فرز آمن للمواد النظيفة داخل المنزل مع شخص بالغ','Safe indoor sorting of clean recyclables with an adult','بعد فحص شخص بالغ، يفرز الطفل داخل المنزل فقط الورق والبلاستيك النظيفين والسليمين وغير الحادّين في حاوية الفرز المنزلية الصحيحة. تنتهي مهمة الطفل هناك؛ ويتولى الشخص البالغ لاحقاً كل حمل ونقل وتخلّص.','After an adult check, the Child sorts only intact, non-sharp clean paper and plastic into the correct household sorting container indoors. the Child’s task ends there; the adult owns all later carrying, transfer, and disposal.','افرز داخل المنزل الورق والبلاستيك النظيفين اللذين فحصهما شخص بالغ، ثم اترك النقل والتخلّص للشخص البالغ.','Indoors, sort the clean paper and plastic an adult checked, then leave all carrying and disposal to the adult.','يحافظ الفرز الداخلي على الصلة العملية بالاستدامة عندما لا يكون مسار الحاوية مناسباً. وهو نشاط مُبلغ عنه ذاتياً، وليس قياساً للأثر البيئي.','Indoor sorting keeps the practical sustainability action when the bin route is not suitable. It is a self-reported activity, not measured environmental impact.','["افرز داخل المنزل الورق والبلاستيك النظيفين اللذين فحصهما شخص بالغ، ثم اترك النقل والتخلّص للشخص البالغ."]'::jsonb,'["Indoors, sort the clean paper and plastic an adult checked, then leave all carrying and disposal to the adult."]'::jsonb,'تُقبل المساعدة المتفق عليها ولا تقلل التقدير المعروض.','Agreed help counts and does not reduce the displayed award.','يبقى شخص بالغ حاضراً، ويفحص المواد، ويتولى كل حمل ونقل وتخلّص.','An adult stays present, checks the items, and owns every carry, transfer, and disposal action.','{"adult_pre_check":"يفحص شخص بالغ جميع المواد مسبقاً؛ ويقتصر الفرز على الورق والبلاستيك النظيفين والسليمين وغير الحادّين والمقبولين في نظام إعادة التدوير المحلي.","adult_second_check":"يراجع الشخص البالغ المواد المفروزة قبل نقلها لاحقاً.","adult_owned_actions":["يتولى الشخص البالغ أي حمل أو نقل أو تخلّص؛ وتنتهي مهمة الطفل داخل المنزل."],"child_allowed_actions":["يفرز الطفل داخل المنزل فقط الورق والبلاستيك النظيفين والسليمين وغير الحادّين اللذين وافق عليهما شخص بالغ."],"excluded_hazards":["يُمنع لمس الزجاج أو الأدوات الحادّة أو البطاريات أو المواد الكيميائية أو الأدوية أو المواد الفاسدة أو الأكياس المتسربة أو أي مادة مجهولة.","يُمنع إصلاح الحاويات أو الأجهزة أو المصابيح أو أي شيء كهربائي."],"stop_and_ask_adult":"يجب التوقّف وسؤال شخص بالغ عند الشك.","route_constraint":"تبقى هذه المهمة داخل المنزل؛ ولا يحمل الطفل كيساً ولا يذهب إلى الحاوية أو مسار التخلّص.","indoor_alternative":null,"aftercare":"تُغسل اليدان بعد الانتهاء."}'::jsonb,'{"adult_pre_check":"An adult pre-checks every item; use only intact, non-sharp clean paper and plastic accepted by the household local recycling stream.","adult_second_check":"The adult reviews the sorted items before moving them later.","adult_owned_actions":["The adult owns every carry, transfer, and disposal action; the Child’s task ends indoors."],"child_allowed_actions":["Indoors, the Child sorts only intact, non-sharp clean paper and plastic approved by an adult."],"excluded_hazards":["Do not touch glass, sharps, batteries, chemicals, medicine, spoiled material, leaking bags, or unknown waste.","Do not repair a bin, appliance, light, or electrical item."],"stop_and_ask_adult":"Stop and ask an adult whenever anything is uncertain.","route_constraint":"This task stays indoors; the Child does not carry a bag or go to the bin or disposal route.","indoor_alternative":null,"aftercare":"Wash hands afterward."}'::jsonb,array['6_8','9_11','12_14']::text[],'standard','acquisition',12,'once','household',true,false,true,array[]::text[]);


-- CORE_IMPLEMENTATIONS

create function ghaf_private.stage_for_seeds(p_seeds bigint) returns text
language sql immutable set search_path='' as $$ select case when p_seeds>=200 then 'flourishing' when p_seeds>=120 then 'shade' when p_seeds>=60 then 'sapling' when p_seeds>=20 then 'shoot' else 'seed' end; $$;
create function ghaf_private.next_threshold(p_seeds bigint) returns integer
language sql immutable set search_path='' as $$ select case when p_seeds<20 then 20 when p_seeds<60 then 60 when p_seeds<120 then 120 when p_seeds<200 then 200 else null end; $$;

create function ghaf_private.read_snapshot(p_family_id uuid,p_child_id uuid,p_role text,p_user_id uuid) returns jsonb
language sql stable set search_path='' as $$
select jsonb_build_object(
  'schema_version',1,'revision',f.revision,
  'actor',jsonb_build_object('role',p_role,'family_id',f.id,'child_id',p_child_id,'user_id',p_user_id),
  'family',jsonb_build_object('id',f.id,'name',f.name,'locale',f.locale,'revision',f.revision,'guardian_names',f.guardian_names,
    'relatives',case when p_role='parent' then (select coalesce(jsonb_agg(to_jsonb(r)-'family_id' order by r.id),'[]') from ghaf_private.family_relatives r where r.family_id=f.id) else '[]'::jsonb end),
  'children',(select coalesce(jsonb_agg(to_jsonb(c)||jsonb_build_object('preferences',to_jsonb(p)-'child_id') order by c.id),'[]')
    from ghaf_private.children c join ghaf_private.child_preferences p on p.child_id=c.id
    where c.family_id=f.id and (p_role='parent' or c.id=p_child_id)),
  'categories',(select coalesce(jsonb_agg(to_jsonb(c) order by c.id),'[]') from ghaf_private.categories c),
  'landscapes',(select coalesce(jsonb_agg(to_jsonb(l) order by l.id),'[]') from ghaf_private.landscapes l),
  'templates',(select coalesce(jsonb_agg(to_jsonb(t) order by t.id),'[]') from ghaf_private.templates t),
  'tasks',(select coalesce(jsonb_agg((to_jsonb(v)-array['task_id','created_at','content_fingerprint','skill_ids'])||
    jsonb_build_object('id',t.id,'child_id',t.child_id,'status',t.status,'created_at',t.created_at,
      'steps',(select coalesce(jsonb_agg(s.instruction order by s.position),'[]') from ghaf_private.task_steps s where s.task_id=t.id and s.task_version=v.version))
    order by t.created_at,t.id,v.version),'[]') from ghaf_private.tasks t join ghaf_private.task_versions v on v.task_id=t.id
    where t.family_id=f.id and (p_role='parent' or (t.child_id=p_child_id and (
      exists(select 1 from ghaf_private.assignments a where a.task_id=t.id and a.child_id=p_child_id and a.task_version=v.version)
      or exists(select 1 from ghaf_private.adjustments d join ghaf_private.assignments a on a.id=d.assignment_id
        where a.task_id=t.id and d.child_id=p_child_id and v.version in (d.source_version,d.proposed_version))
      or exists(select 1 from ghaf_private.submissions s join ghaf_private.assignments a on a.id=s.assignment_id
        where a.task_id=t.id and s.child_id=p_child_id and s.task_version=v.version)
      or exists(select 1 from ghaf_private.recognitions r where r.task_id=t.id and r.child_id=p_child_id and r.task_version=v.version))))),
  'assignments',(select coalesce(jsonb_agg(to_jsonb(a)-'approved_by' order by a.created_at,a.id),'[]') from ghaf_private.assignments a where a.family_id=f.id and (p_role='parent' or a.child_id=p_child_id)),
  'submissions',(select coalesce(jsonb_agg(to_jsonb(s)-'family_id' order by s.submitted_at,s.id),'[]') from ghaf_private.submissions s where s.family_id=f.id and (p_role='parent' or s.child_id=p_child_id)),
  'check_ins',(select coalesce(jsonb_agg(to_jsonb(c)-array['family_id','confirmed_by','praise_presented_at'] order by c.created_at,c.id),'[]')
    from ghaf_private.check_ins c join ghaf_private.assignments a on a.id=c.assignment_id where c.family_id=f.id and (p_role='parent' or a.child_id=p_child_id)),
  'adjustments',(select coalesce(jsonb_agg(to_jsonb(d)-'family_id' order by d.id),'[]') from ghaf_private.adjustments d where d.family_id=f.id and (p_role='parent' or d.child_id=p_child_id)),
  'recognitions',(select coalesce(jsonb_agg(to_jsonb(r)-array['family_id','recognition_mode','routine_phase','visibility_scope','reward_eligible','league_eligible','circle_eligible','skill_ids'] order by r.created_at,r.id),'[]') from ghaf_private.recognitions r where r.family_id=f.id and (p_role='parent' or r.child_id=p_child_id)),
  'seed_entries',(select coalesce(jsonb_agg(to_jsonb(e)-'family_id' order by e.created_at,e.id),'[]') from ghaf_private.seed_entries e where e.family_id=f.id and (p_role='parent' or e.child_id=p_child_id)),
  'landscape_progress',(select coalesce(jsonb_agg(jsonb_build_object('child_id',p.child_id,'landscape_id',p.landscape_id,
    'cumulative_seeds',p.total,'stage',ghaf_private.stage_for_seeds(p.total),'next_threshold',ghaf_private.next_threshold(p.total)) order by p.child_id,p.landscape_id),'[]')
    from (select c.id child_id,l.id landscape_id,coalesce(sum(e.amount),0)::bigint total from ghaf_private.children c cross join ghaf_private.landscapes l
      left join ghaf_private.landscape_events e on e.child_id=c.id and e.landscape_id=l.id where c.family_id=f.id
      and (p_role='parent' or c.id=p_child_id) group by c.id,l.id) p),
  'impact_paths',(select coalesce(jsonb_agg(jsonb_build_object('child_id',p.child_id,'lifetime_seeds',p.total,
    'reached_thresholds',(select coalesce(jsonb_agg(x order by x),'[]') from unnest(array[120,132,144,156,168,180]) x where x<=p.total),
    'next_threshold',(select min(x) from unnest(array[120,132,144,156,168,180]) x where x>p.total),
    'chapter_state',case when p.total<120 then 'not_entered' when p.total<180 then 'active' else 'completed' end) order by p.child_id),'[]')
    from (select c.id child_id,coalesce(sum(e.amount),0)::bigint total from ghaf_private.children c left join ghaf_private.seed_entries e on e.child_id=c.id
      where c.family_id=f.id and (p_role='parent' or c.id=p_child_id) group by c.id) p),
  'legacy_records',(select coalesce(jsonb_agg(to_jsonb(r)-'family_id' order by r.id),'[]') from ghaf_private.legacy_records r where r.family_id=f.id and p_role='parent'),
  'legacy_available',p_role='parent' and exists(select 1 from public.account_workspaces w where w.user_id=p_user_id)
    and not exists(select 1 from ghaf_private.workspace_imports i where i.user_id=p_user_id),
  'saved_templates',case when p_role='parent' then (select coalesce(jsonb_agg(to_jsonb(t)-'family_id' order by t.id),'[]') from ghaf_private.saved_templates t where t.family_id=f.id) else '[]'::jsonb end,
  'reveals',(select coalesce(jsonb_agg(to_jsonb(r)-'family_id' order by r.id),'[]') from ghaf_private.reveals r where r.family_id=f.id and (p_role='parent' or r.child_id=p_child_id)),
  'permissions',(select coalesce(jsonb_agg(jsonb_build_object('child_id',c.id,'voice_granted',coalesce(p.voice_granted,false),'media_granted',coalesce(p.media_granted,false),
    'ai_granted',coalesce(p.ai_granted,false),'revision',coalesce(p.revision,0)) order by c.id),'[]') from ghaf_private.children c left join ghaf_private.child_permissions p on p.child_id=c.id
      where c.family_id=f.id and (p_role='parent' or c.id=p_child_id)),
  'community',coalesce((select jsonb_build_object('status',p.status,'revision',p.revision) from ghaf_private.community_preferences p where p.family_id=f.id),jsonb_build_object('status','paused','revision',0)),
  'extras',ghaf_private.read_extras(f.id,p_child_id,p_role)
) from ghaf_private.families f where f.id=p_family_id;
$$;

create function ghaf_private.validate_safety(p_safety jsonb) returns jsonb
language plpgsql set search_path='' as $$
declare k text;
begin
  perform ghaf_private.require_keys(p_safety,array['adult_pre_check','adult_second_check','adult_owned_actions','child_allowed_actions','excluded_hazards','stop_and_ask_adult','route_constraint','indoor_alternative','aftercare'],
    array['adult_pre_check','adult_second_check','adult_owned_actions','child_allowed_actions','excluded_hazards','stop_and_ask_adult','route_constraint','indoor_alternative','aftercare']);
  foreach k in array array['adult_pre_check','adult_second_check','stop_and_ask_adult'] loop perform ghaf_private.text_field(p_safety,k,1000); end loop;
  foreach k in array array['route_constraint','indoor_alternative','aftercare'] loop perform ghaf_private.text_field(p_safety,k,1000,true); end loop;
  foreach k in array array['adult_owned_actions','child_allowed_actions','excluded_hazards'] loop perform ghaf_private.string_array(p_safety->k); end loop;
  return p_safety;
end; $$;

create function ghaf_private.write_task_version(p_task_id uuid,p_version integer,p_family_id uuid,p_command jsonb) returns void
language plpgsql set search_path='' as $$
declare t ghaf_private.templates; saved ghaf_private.task_versions; v jsonb; steps jsonb; loc text;
  title text; definition text; positive text; why text; help text; supervision text; safety jsonb;
  category text; landscape text; mode text; phase text; recurrence text; scope text; seeds integer; circle boolean;
  canonical boolean:=false; v_template text; skills text[]:='{}'; target ghaf_private.children; key text;
begin
  loc:=ghaf_private.text_field(p_command,'locale',2);
  if loc not in ('ar','en') then perform ghaf_private.fail('invalid_input'); end if;
  select c.* into target from ghaf_private.tasks d join ghaf_private.children c on c.id=d.child_id where d.id=p_task_id and d.family_id=p_family_id;
  if target.age_band is null then perform ghaf_private.fail('profile_incomplete'); end if;
  if p_command ? 'templateId' and p_command ? 'savedTemplateId' then perform ghaf_private.fail('invalid_input'); end if;
  if p_command ? 'savedTemplateId' then
    select x.* into saved from ghaf_private.saved_templates s join ghaf_private.task_versions x on x.task_id=s.task_id and x.version=s.task_version
      where s.id=ghaf_private.uuid_field(p_command,'savedTemplateId') and s.family_id=p_family_id;
    if not found then perform ghaf_private.fail('not_found'); end if;
    select jsonb_agg(s.instruction order by s.position) into steps from ghaf_private.task_steps s where s.task_id=saved.task_id and s.task_version=saved.version;
    v:=jsonb_build_object('title',saved.title,'definitionOfDone',saved.definition_of_done,'positiveAction',saved.positive_action,'whyItMatters',saved.why_it_matters,
      'permittedHelp',saved.permitted_help,'supervision',saved.supervision,'safety',saved.safety,'categoryId',saved.category_id,'recognitionMode',saved.recognition_mode,
      'routinePhase',saved.routine_phase,'seedAward',saved.seed_award,'visibilityScope',saved.visibility_scope,'recurrence',saved.recurrence,'circleEligible',saved.circle_eligible,'steps',steps);
    v_template:=saved.template_id;
  elsif p_command ? 'templateId' then
    v_template:=ghaf_private.text_field(p_command,'templateId',100);
    select * into t from ghaf_private.templates where id=v_template;
    if not found or not(target.age_band=any(t.age_bands)) then perform ghaf_private.fail('invalid_input'); end if;
    v:=jsonb_build_object('title',case loc when 'ar' then t.title_ar else t.title_en end,'definitionOfDone',case loc when 'ar' then t.definition_ar else t.definition_en end,
      'positiveAction',case loc when 'ar' then t.positive_action_ar else t.positive_action_en end,'whyItMatters',case loc when 'ar' then t.why_it_matters_ar else t.why_it_matters_en end,
      'steps',case loc when 'ar' then t.steps_ar else t.steps_en end,'permittedHelp',case loc when 'ar' then t.permitted_help_ar else t.permitted_help_en end,
      'supervision',case loc when 'ar' then t.supervision_ar else t.supervision_en end,'safety',case loc when 'ar' then t.safety_ar else t.safety_en end,
      'categoryId',t.category_id,'recognitionMode',t.recognition_mode,'routinePhase',t.routine_phase,'seedAward',t.seed_award,'visibilityScope',t.visibility_scope,'recurrence',t.recurrence,'circleEligible',t.circle_eligible);
  else
    if not(p_command ? 'safety') then perform ghaf_private.fail('invalid_input'); end if;
    v:=jsonb_build_object('recognitionMode','recognition_only','routinePhase','not_applicable','seedAward',null,'visibilityScope','child_guardian','recurrence','once','circleEligible',false,
      'permittedHelp',case loc when 'ar' then 'يمكن طلب المساعدة من ولي الأمر.' else 'A Parent may help.' end,
      'supervision',case loc when 'ar' then 'يختار ولي الأمر الإشراف المناسب.' else 'The Parent chooses appropriate supervision.' end,
      'whyItMatters',case loc when 'ar' then 'خطوة يتفق عليها الطفل وولي الأمر.' else 'A step agreed by the Child and Parent.' end,
      'safety',p_command->'safety');
  end if;
  foreach key in array array['title','definitionOfDone','positiveAction','whyItMatters','steps','permittedHelp','supervision','safety','categoryId','recognitionMode','routinePhase','seedAward','visibilityScope','recurrence','circleEligible'] loop
    if p_command ? key then v:=v||jsonb_build_object(key,p_command->key); end if;
  end loop;
  title:=ghaf_private.text_field(v,'title',160); definition:=ghaf_private.text_field(v,'definitionOfDone',1000);
  positive:=coalesce(ghaf_private.text_field(v,'positiveAction',1000,true),definition);
  why:=ghaf_private.text_field(v,'whyItMatters',1000); help:=ghaf_private.text_field(v,'permittedHelp',1000); supervision:=ghaf_private.text_field(v,'supervision',1000);
  safety:=ghaf_private.validate_safety(v->'safety'); steps:=ghaf_private.string_array(v->'steps');
  if jsonb_array_length(steps)=0 then perform ghaf_private.fail('invalid_input'); end if;
  category:=ghaf_private.text_field(v,'categoryId',80);
  select c.landscape_id into landscape from ghaf_private.categories c where c.id=category;
  if not found then perform ghaf_private.fail('invalid_input'); end if;
  mode:=ghaf_private.text_field(v,'recognitionMode',30); phase:=ghaf_private.text_field(v,'routinePhase',30);
  scope:=ghaf_private.text_field(v,'visibilityScope',30); recurrence:=ghaf_private.text_field(v,'recurrence',20);
  if jsonb_typeof(v->'circleEligible') is distinct from 'boolean' then perform ghaf_private.fail('invalid_input'); end if;
  circle:=(v->>'circleEligible')::boolean;
  if v->'seedAward'<>'null'::jsonb and jsonb_typeof(v->'seedAward') is distinct from 'number' then perform ghaf_private.fail('invalid_input'); end if;
  seeds:=(v->>'seedAward')::integer;
  if (v->>'seedAward')::numeric is distinct from seeds::numeric then perform ghaf_private.fail('invalid_input'); end if;
  if category in ('faith_gratitude','roots_kinship') and (mode<>'recognition_only' or scope<>'child_guardian') then perform ghaf_private.fail('invalid_input'); end if;
  if v_template is not null then
    select * into t from ghaf_private.templates where id=v_template;
    if not(target.age_band=any(t.age_bands)) then perform ghaf_private.fail('invalid_input'); end if;
    canonical:=category=t.category_id and mode=t.recognition_mode and phase=t.routine_phase and seeds is not distinct from t.seed_award
      and recurrence=t.recurrence and scope=t.visibility_scope and circle=t.circle_eligible
      and title=case loc when 'ar' then t.title_ar else t.title_en end and definition=case loc when 'ar' then t.definition_ar else t.definition_en end
      and positive=case loc when 'ar' then t.positive_action_ar else t.positive_action_en end and why=case loc when 'ar' then t.why_it_matters_ar else t.why_it_matters_en end
      and help=case loc when 'ar' then t.permitted_help_ar else t.permitted_help_en end and supervision=case loc when 'ar' then t.supervision_ar else t.supervision_en end
      and safety=case loc when 'ar' then t.safety_ar else t.safety_en end and steps=case loc when 'ar' then t.steps_ar else t.steps_en end;
    if canonical then skills:=t.skill_ids; end if;
  end if;
  insert into ghaf_private.task_versions(task_id,version,family_id,template_id,category_id,landscape_id,title,definition_of_done,positive_action,why_it_matters,content_locale,
    permitted_help,supervision,safety,recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids,content_fingerprint)
  values(p_task_id,p_version,p_family_id,v_template,category,landscape,title,definition,positive,why,loc,help,supervision,safety,mode,phase,seeds,recurrence,scope,circle,
    canonical and t.reward_eligible and phase='acquisition',canonical and t.league_eligible,skills,encode(sha256(convert_to(v::text,'UTF8')),'hex'));
  insert into ghaf_private.task_steps(task_id,task_version,position,instruction)
    select p_task_id,p_version,n::integer,x#>>'{}' from jsonb_array_elements(steps) with ordinality a(x,n);
end; $$;

create function ghaf_private.import_workspace(p_family_id uuid,p_user_id uuid) returns jsonb
language plpgsql set search_path='' as $$
declare w public.account_workspaces; m jsonb; r jsonb; child uuid; kind text;
begin
  if exists(select 1 from ghaf_private.workspace_imports where user_id=p_user_id) then return jsonb_build_object('ok',true); end if;
  select * into w from public.account_workspaces where user_id=p_user_id for update;
  if not found then perform ghaf_private.fail('not_found'); end if;
  if (select count(*) from ghaf_private.children where family_id=p_family_id)+jsonb_array_length(w.members)>20 then perform ghaf_private.fail('invalid_input'); end if;
  for m in select value from jsonb_array_elements(w.members) loop
    perform ghaf_private.require_keys(m,array['id','nickname'],array['id','nickname']); child:=ghaf_private.uuid_field(m,'id');
    if exists(select 1 from ghaf_private.children where id=child) then perform ghaf_private.fail('request_conflict','PT409'); end if;
  end loop;
  for m in select value from jsonb_array_elements(w.members) loop
    perform ghaf_private.require_keys(m,array['id','nickname'],array['id','nickname']); child:=ghaf_private.uuid_field(m,'id');
    insert into ghaf_private.children(id,family_id,nickname) values(child,p_family_id,ghaf_private.text_field(m,'nickname',80));
    insert into ghaf_private.child_preferences(child_id) values(child);
    insert into ghaf_private.child_permissions(child_id,family_id) values(child,p_family_id);
  end loop;
  foreach kind in array array['task','study'] loop
    for r in select value from jsonb_array_elements(case kind when 'task' then w.tasks else w.study_plans end) loop
      child:=ghaf_private.uuid_field(r,'childId');
      if jsonb_typeof(r->'completed') is distinct from 'boolean' then perform ghaf_private.fail('invalid_input'); end if;
      insert into ghaf_private.legacy_records(family_id,child_id,kind,title,subject,next_step,completed,source_id)
      values(p_family_id,child,kind,case kind when 'task' then ghaf_private.text_field(r,'title',160) else ghaf_private.text_field(r,'subject',160) end,
        case kind when 'study' then ghaf_private.text_field(r,'subject',160) else null end,
        case kind when 'study' then ghaf_private.text_field(r,'nextStep',300) else null end,(r->>'completed')::boolean,ghaf_private.uuid_field(r,'id'));
    end loop;
  end loop;
  update ghaf_private.families set name=w.family_name where id=p_family_id and name='';
  insert into ghaf_private.workspace_imports(user_id,family_id,workspace_id,source_revision,source_fingerprint,member_count,task_count,study_count)
    values(p_user_id,p_family_id,w.workspace_id,w.revision,encode(sha256(convert_to(to_jsonb(w)::text,'UTF8')),'hex'),jsonb_array_length(w.members),jsonb_array_length(w.tasks),jsonb_array_length(w.study_plans));
  return jsonb_build_object('ok',true);
end; $$;

-- Preserve the old row and serialize its writers with cutover; never permit two authorities.
create function ghaf_private.guard_legacy_workspace_write() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if exists(select 1 from ghaf_private.workspace_imports where user_id=old.user_id) then
    perform ghaf_private.fail('workspace_migrated','PT409'); end if;
  return new;
end; $$;
create trigger ghaf_legacy_workspace_cutover before update on public.account_workspaces
  for each row execute function ghaf_private.guard_legacy_workspace_write();

-- CORE_COMMANDS

create function ghaf_private.command_core(p_command jsonb,p_family_id uuid,p_child_id uuid,p_role text,p_user_id uuid) returns jsonb
language plpgsql set search_path='' as $$
declare kind text:=p_command->>'type'; cid uuid; tid uuid; aid uuid; sid uuid; checkid uuid; rid uuid; did uuid; token text;
  ver integer; x jsonb; pref jsonb; keys text[]; a ghaf_private.assignments; t ghaf_private.tasks;
  v ghaf_private.task_versions; proposed ghaf_private.task_versions; ci ghaf_private.check_ins; d ghaf_private.adjustments; legacy ghaf_private.legacy_records;
  phase text; seed integer; observation text; praise text;
begin
  if kind in ('family.update','child.create','child.update','child.invite','child.revoke','workspace.import','task.create','task.update','task.review','task.assign','task.save_template',
    'checkin.confirm','checkin.retry','checkin.praise_presented','recognition.apply','adjustment.propose','routine.phase','legacy.convert','assignment.help_resolved','child.permissions','community.participation') and p_role<>'parent' then
    perform ghaf_private.fail('access_denied','42501'); end if;
  if kind in ('assignment.accept','assignment.start','assignment.help','assignment.resume_retry','assignment.submit','adjustment.request','adjustment.accept','adjustment.keep','reveal.acknowledge') and p_role<>'child' then
    perform ghaf_private.fail('access_denied','42501'); end if;

  case kind
  when 'child.permissions' then
    perform ghaf_private.require_keys(p_command,array['type','childId','voiceGranted','mediaGranted','aiGranted'],array['type','childId','voiceGranted','mediaGranted','aiGranted']);
    perform ghaf_private.require_fresh_parent(p_user_id); cid:=ghaf_private.uuid_field(p_command,'childId');
    if not exists(select 1 from ghaf_private.children where id=cid and family_id=p_family_id and active) then perform ghaf_private.fail('not_found'); end if;
    if jsonb_typeof(p_command->'voiceGranted') is distinct from 'boolean' or jsonb_typeof(p_command->'mediaGranted') is distinct from 'boolean' or jsonb_typeof(p_command->'aiGranted') is distinct from 'boolean' then perform ghaf_private.fail('invalid_input'); end if;
    insert into ghaf_private.child_permissions(child_id,family_id,voice_granted,media_granted,ai_granted,revision,updated_by)
      values(cid,p_family_id,(p_command->>'voiceGranted')::boolean,(p_command->>'mediaGranted')::boolean,(p_command->>'aiGranted')::boolean,1,p_user_id)
      on conflict(child_id) do update set voice_granted=excluded.voice_granted,media_granted=excluded.media_granted,ai_granted=excluded.ai_granted,
        revision=ghaf_private.child_permissions.revision+1,updated_by=excluded.updated_by,updated_at=clock_timestamp();
    return jsonb_build_object('ok',true);
  when 'community.participation' then
    perform ghaf_private.require_keys(p_command,array['type','action'],array['type','action']); perform ghaf_private.require_fresh_parent(p_user_id);
    phase:=case p_command->>'action' when 'continue' then 'continued' when 'pause_new_contributions' then 'paused' when 'end_participation' then 'ended' else null end;
    if phase is null then perform ghaf_private.fail('invalid_input'); end if;
    update ghaf_private.community_preferences set status=phase,revision=revision+1 where family_id=p_family_id returning revision into ver;
    insert into ghaf_private.community_consents(family_id,revision,status,user_id) values(p_family_id,ver,phase,p_user_id);
    return jsonb_build_object('ok',true);
  when 'assignment.help_resolved' then
    perform ghaf_private.require_keys(p_command,array['type','assignmentId'],array['type','assignmentId']); aid:=ghaf_private.uuid_field(p_command,'assignmentId');
    update ghaf_private.assignments set help_requested=false where id=aid and family_id=p_family_id;
    if not found then perform ghaf_private.fail('not_found'); end if;
    return jsonb_build_object('ok',true);
  when 'family.update' then
    perform ghaf_private.require_keys(p_command,array['type','name','locale','guardianNames','relatives'],array['type','name','locale']);
    if p_command->>'locale' not in ('ar','en') then perform ghaf_private.fail('invalid_input'); end if;
    update ghaf_private.families set name=ghaf_private.text_field(p_command,'name',80),locale=p_command->>'locale',
      guardian_names=case when p_command ? 'guardianNames' then ghaf_private.string_array(p_command->'guardianNames',10,80) else guardian_names end where id=p_family_id;
    if p_command ? 'relatives' then
      if jsonb_typeof(p_command->'relatives')<>'array' or jsonb_array_length(p_command->'relatives')>20 then perform ghaf_private.fail('invalid_input'); end if;
      for x in select value from jsonb_array_elements(p_command->'relatives') loop
        perform ghaf_private.require_keys(x,array['id','display_name','relationship','rhythm'],array['id','display_name','relationship','rhythm']);
        did:=ghaf_private.uuid_field(x,'id');
        if exists(select 1 from ghaf_private.family_relatives where id=did and family_id<>p_family_id) then perform ghaf_private.fail('access_denied','42501'); end if;
        insert into ghaf_private.family_relatives(id,family_id,display_name,relationship,rhythm)
          values(did,p_family_id,ghaf_private.text_field(x,'display_name',80),x->>'relationship',x->>'rhythm')
          on conflict(id) do update set display_name=excluded.display_name,relationship=excluded.relationship,rhythm=excluded.rhythm;
      end loop;
    end if;
    return jsonb_build_object('ok',true);

  when 'child.create','child.update' then
    keys:=array['type','childId','nickname','ageBand','age10PlusConfirmed','preferredLanguage','avatarId','preferences'];
    perform ghaf_private.require_keys(p_command,keys,array['type','nickname','ageBand','age10PlusConfirmed','preferredLanguage','avatarId']);
    if p_command->>'ageBand' not in ('6_8','9_11','12_14') or jsonb_typeof(p_command->'age10PlusConfirmed') is distinct from 'boolean'
      or p_command->>'preferredLanguage' not in ('ar','en','both') or p_command->>'avatarId' not in ('ghaf_tree','leaf','flower','energy_leaf','water_drop') then
      perform ghaf_private.fail('invalid_input'); end if;
    if kind='child.create' then
      if p_command ? 'childId' or (select count(*) from ghaf_private.children where family_id=p_family_id)>=20 then perform ghaf_private.fail('invalid_input'); end if;
      cid:=gen_random_uuid();
      insert into ghaf_private.children(id,family_id,nickname,age_band,age10_plus_confirmed,preferred_language,avatar_id)
        values(cid,p_family_id,ghaf_private.text_field(p_command,'nickname',80),p_command->>'ageBand',(p_command->>'age10PlusConfirmed')::boolean,p_command->>'preferredLanguage',p_command->>'avatarId');
      insert into ghaf_private.child_preferences(child_id) values(cid);
      insert into ghaf_private.child_permissions(child_id,family_id) values(cid,p_family_id);
    else
      cid:=ghaf_private.uuid_field(p_command,'childId');
      update ghaf_private.children set nickname=ghaf_private.text_field(p_command,'nickname',80),age_band=p_command->>'ageBand',
        age10_plus_confirmed=(p_command->>'age10PlusConfirmed')::boolean,preferred_language=p_command->>'preferredLanguage',avatar_id=p_command->>'avatarId'
        where id=cid and family_id=p_family_id;
      if not found then perform ghaf_private.fail('not_found'); end if;
    end if;
    if p_command ? 'preferences' then
      pref:=p_command->'preferences';
      perform ghaf_private.require_keys(pref,array['sex','interests','hobbies','accessibility','support','personalization_enabled','custom_interest','custom_hobby','custom_support','custom_accessibility'],
        array['sex','interests','hobbies','accessibility','support','personalization_enabled']);
      if jsonb_typeof(pref->'personalization_enabled') is distinct from 'boolean' then perform ghaf_private.fail('invalid_input'); end if;
      update ghaf_private.child_preferences set sex=pref->>'sex',interests=ghaf_private.string_array(pref->'interests',20,160),hobbies=ghaf_private.string_array(pref->'hobbies',20,160),
        accessibility=ghaf_private.string_array(pref->'accessibility',20,160),support=ghaf_private.string_array(pref->'support',20,160),
        personalization_enabled=(pref->>'personalization_enabled')::boolean,custom_interest=ghaf_private.text_field(pref,'custom_interest',300,true),
        custom_hobby=ghaf_private.text_field(pref,'custom_hobby',300,true),custom_support=ghaf_private.text_field(pref,'custom_support',300,true),custom_accessibility=ghaf_private.text_field(pref,'custom_accessibility',300,true)
        where child_id=cid;
    end if;
    return jsonb_build_object('child_id',cid);

  when 'child.invite','child.revoke' then
    perform ghaf_private.require_keys(p_command,array['type','childId'],array['type','childId']); cid:=ghaf_private.uuid_field(p_command,'childId');
    if not exists(select 1 from ghaf_private.children where id=cid and family_id=p_family_id and active and age_band is not null) then perform ghaf_private.fail('profile_incomplete'); end if;
    update ghaf_private.child_invitations set revoked=true where child_id=cid and used_session_id is null;
    if kind='child.revoke' then
      update ghaf_private.child_bindings set active=false where child_id=cid and family_id=p_family_id;
      update ghaf_private.child_invitations set revoked=true where child_id=cid;
      return jsonb_build_object('ok',true);
    end if;
    token:=replace(gen_random_uuid()::text,'-','');
    insert into ghaf_private.child_invitations(token_hash,family_id,child_id,expires_at)
      values(sha256(convert_to(token,'UTF8')),p_family_id,cid,clock_timestamp()+interval '10 minutes');
    return jsonb_build_object('token',token,'expires_at',(select expires_at from ghaf_private.child_invitations where token_hash=sha256(convert_to(token,'UTF8'))));

  when 'workspace.import' then
    perform ghaf_private.require_keys(p_command,array['type'],array['type']);
    return ghaf_private.import_workspace(p_family_id,p_user_id);

  when 'task.create','task.update','legacy.convert' then
    if kind='legacy.convert' then
      perform ghaf_private.require_keys(p_command,array['type','legacyId','templateId','locale'],array['type','legacyId','templateId','locale']);
      select * into legacy from ghaf_private.legacy_records where id=ghaf_private.uuid_field(p_command,'legacyId') and family_id=p_family_id;
      if not found then perform ghaf_private.fail('not_found'); end if;
      if legacy.converted_task_id is not null then return jsonb_build_object('task_id',legacy.converted_task_id); end if;
      p_command:=jsonb_build_object('type','task.create','childId',legacy.child_id,'templateId',p_command->>'templateId','locale',p_command->>'locale');
    else
      perform ghaf_private.require_keys(p_command,array['type','taskId','expectedVersion','childId','templateId','savedTemplateId','locale','title','definitionOfDone','positiveAction','whyItMatters','steps','categoryId',
        'permittedHelp','supervision','safety','recognitionMode','routinePhase','seedAward','visibilityScope','recurrence','circleEligible'],array['type','childId','locale']);
    end if;
    cid:=ghaf_private.uuid_field(p_command,'childId');
    if not exists(select 1 from ghaf_private.children where id=cid and family_id=p_family_id and active and age_band is not null) then perform ghaf_private.fail('profile_incomplete'); end if;
    if kind='task.update' then
      tid:=ghaf_private.uuid_field(p_command,'taskId'); select * into t from ghaf_private.tasks where id=tid and family_id=p_family_id for update;
      if not found then perform ghaf_private.fail('not_found'); end if;
      if jsonb_typeof(p_command->'expectedVersion') is distinct from 'number' or (p_command->>'expectedVersion')::numeric<>t.current_version then perform ghaf_private.fail('revision_conflict','PT409'); end if;
      if t.status='assigned' or t.child_id<>cid then perform ghaf_private.fail('invalid_transition'); end if;
      select coalesce(max(version),0)+1 into ver from ghaf_private.task_versions where task_id=tid;
      update ghaf_private.tasks set current_version=ver,status='draft' where id=tid;
    else
      if p_command ? 'taskId' or (select count(*) from ghaf_private.tasks where family_id=p_family_id)>=1000 then perform ghaf_private.fail('invalid_input'); end if;
      tid:=gen_random_uuid(); ver:=1;
      insert into ghaf_private.tasks(id,family_id,child_id,created_by) values(tid,p_family_id,cid,p_user_id);
      insert into ghaf_private.routines(task_id,family_id) values(tid,p_family_id);
    end if;
    perform ghaf_private.write_task_version(tid,ver,p_family_id,p_command);
    if kind='legacy.convert' then update ghaf_private.legacy_records set converted_task_id=tid where id=legacy.id; end if;
    return jsonb_build_object('task_id',tid);

  when 'task.review','task.assign','task.save_template','routine.phase' then
    perform ghaf_private.require_keys(p_command,array['type','taskId','phase'],array['type','taskId']);
    tid:=ghaf_private.uuid_field(p_command,'taskId'); select * into t from ghaf_private.tasks where id=tid and family_id=p_family_id for update;
    if not found then perform ghaf_private.fail('not_found'); end if;
    select * into v from ghaf_private.task_versions where task_id=tid and version=t.current_version;
    if kind='task.review' then
      if t.status not in ('draft','reviewed') then perform ghaf_private.fail('invalid_transition'); end if;
      update ghaf_private.tasks set status='reviewed' where id=tid;
      return jsonb_build_object('ok',true);
    elsif kind='task.save_template' then
      insert into ghaf_private.saved_templates(family_id,task_id,task_version,title) values(p_family_id,tid,v.version,v.title)
        on conflict(family_id,task_id,task_version) do nothing;
      return jsonb_build_object('saved_template_id',(select id from ghaf_private.saved_templates where family_id=p_family_id and task_id=tid and task_version=v.version));
    elsif kind='routine.phase' then
      if v.recognition_mode<>'fade_first' or v.recurrence<>'recurrent' or p_command->>'phase' not in ('acquisition','maintenance') then perform ghaf_private.fail('invalid_input'); end if;
      if p_command->>'phase'='acquisition' and not exists(select 1 from ghaf_private.task_versions h where h.task_id=tid and h.seed_award is not null)
        and not exists(select 1 from ghaf_private.templates r where r.id=v.template_id and r.seed_award is not null) then perform ghaf_private.fail('invalid_transition'); end if;
      update ghaf_private.routines set future_phase=p_command->>'phase',reviewed_at=clock_timestamp(),reviewed_by=p_user_id where task_id=tid;
      return jsonb_build_object('ok',true);
    end if;
    if t.status<>'reviewed' and not(t.status='assigned' and v.recurrence='recurrent') then perform ghaf_private.fail('invalid_transition'); end if;
    if exists(select 1 from ghaf_private.assignments where task_id=tid and state<>'recognized') then perform ghaf_private.fail('invalid_transition'); end if;
    if not exists(select 1 from ghaf_private.children c where c.id=t.child_id and c.active and c.age_band is not null) then perform ghaf_private.fail('profile_incomplete'); end if;
    select future_phase into phase from ghaf_private.routines where task_id=tid and reviewed_at is not null;
    if v.recognition_mode='fade_first' and phase is not null and phase<>v.routine_phase then
      select max(version)+1 into ver from ghaf_private.task_versions where task_id=tid;
      insert into ghaf_private.task_versions(task_id,version,family_id,template_id,category_id,landscape_id,title,definition_of_done,positive_action,why_it_matters,content_locale,permitted_help,supervision,safety,
        recognition_mode,routine_phase,seed_award,recurrence,visibility_scope,circle_eligible,reward_eligible,league_eligible,skill_ids,content_fingerprint)
      select task_id,ver,family_id,template_id,category_id,landscape_id,title,definition_of_done,positive_action,why_it_matters,content_locale,permitted_help,supervision,safety,
        recognition_mode,phase,case when phase='maintenance' then null else coalesce(
          (select h.seed_award from ghaf_private.task_versions h where h.task_id=tid and h.seed_award is not null order by h.version desc limit 1),
          (select r.seed_award from ghaf_private.templates r where r.id=v.template_id)) end,
        recurrence,visibility_scope,circle_eligible,false,league_eligible,skill_ids,encode(sha256(convert_to(content_fingerprint||phase,'UTF8')),'hex')
      from ghaf_private.task_versions where task_id=tid and version=t.current_version;
      insert into ghaf_private.task_steps select task_id,ver,position,instruction from ghaf_private.task_steps where task_id=tid and task_version=t.current_version;
      update ghaf_private.tasks set current_version=ver where id=tid;
      t.current_version:=ver;
    end if;
    aid:=gen_random_uuid();
    insert into ghaf_private.assignments(id,family_id,child_id,task_id,task_version,approved_by) values(aid,p_family_id,t.child_id,tid,t.current_version,p_user_id);
    update ghaf_private.tasks set status='assigned' where id=tid;
    return jsonb_build_object('assignment_id',aid);

  when 'assignment.accept','assignment.start','assignment.help','assignment.resume_retry','assignment.submit','adjustment.request' then
    perform ghaf_private.require_keys(p_command,array['type','assignmentId','completionMode','definitionAcknowledged'],array['type','assignmentId']);
    aid:=ghaf_private.uuid_field(p_command,'assignmentId'); select * into a from ghaf_private.assignments where id=aid and family_id=p_family_id and child_id=p_child_id for update;
    if not found then perform ghaf_private.fail('not_found'); end if;
    if kind='assignment.accept' then
      if a.state='chosen' then return jsonb_build_object('ok',true); end if;
      if a.state<>'assigned' or exists(select 1 from ghaf_private.adjustments where assignment_id=aid and status in ('parent_review_required','child_decision_required')) then perform ghaf_private.fail('invalid_transition'); end if;
      update ghaf_private.assignments set state='chosen' where id=aid;
    elsif kind='assignment.start' then
      if a.state='in_progress' then return jsonb_build_object('ok',true); end if;
      if a.state<>'chosen' then perform ghaf_private.fail('invalid_transition'); end if;
      update ghaf_private.assignments set state='in_progress' where id=aid;
    elsif kind='assignment.resume_retry' then
      if a.state<>'retry' then perform ghaf_private.fail('invalid_transition'); end if;
      update ghaf_private.assignments set state='in_progress' where id=aid;
    elsif kind='assignment.help' then
      if a.state not in ('assigned','chosen','in_progress','retry') then perform ghaf_private.fail('invalid_transition'); end if;
      update ghaf_private.assignments set help_requested=true where id=aid;
    elsif kind='adjustment.request' then
      if a.state<>'assigned' then perform ghaf_private.fail('invalid_transition'); end if;
      select id into did from ghaf_private.adjustments where assignment_id=aid and status in ('parent_review_required','child_decision_required');
      if did is null then
        insert into ghaf_private.adjustments(family_id,child_id,assignment_id,source_version) values(p_family_id,p_child_id,aid,a.task_version) returning id into did;
      end if;
      return jsonb_build_object('adjustment_id',did);
    else
      if a.state<>'in_progress' or p_command->'definitionAcknowledged' is distinct from 'true'::jsonb
        or p_command->>'completionMode' not in ('independent','permitted_help') then perform ghaf_private.fail('invalid_transition'); end if;
      select coalesce(max(attempt),0)+1 into ver from ghaf_private.submissions where assignment_id=aid;
      sid:=gen_random_uuid(); insert into ghaf_private.submissions(id,family_id,child_id,assignment_id,task_version,attempt,completion_mode,definition_acknowledged)
        values(sid,p_family_id,p_child_id,aid,a.task_version,ver,p_command->>'completionMode',true);
      update ghaf_private.assignments set state='submitted' where id=aid;
      return jsonb_build_object('submission_id',sid);
    end if;
    return jsonb_build_object('ok',true);

  when 'adjustment.propose','adjustment.accept','adjustment.keep' then
    perform ghaf_private.require_keys(p_command,array['type','adjustmentId','templateId'],array['type','adjustmentId']);
    did:=ghaf_private.uuid_field(p_command,'adjustmentId');
    select * into d from ghaf_private.adjustments where id=did and family_id=p_family_id and (p_role='parent' or child_id=p_child_id) for update;
    if not found then perform ghaf_private.fail('not_found'); end if;
    select * into a from ghaf_private.assignments where id=d.assignment_id;
    if a.state<>'assigned' then perform ghaf_private.fail('invalid_transition'); end if;
    if kind='adjustment.propose' then
      if d.status<>'parent_review_required' or a.task_version<>d.source_version then perform ghaf_private.fail('invalid_transition'); end if;
      select max(version)+1 into ver from ghaf_private.task_versions where task_id=a.task_id;
      select * into v from ghaf_private.task_versions where task_id=a.task_id and version=a.task_version;
      perform ghaf_private.write_task_version(a.task_id,ver,p_family_id,jsonb_build_object('templateId',ghaf_private.text_field(p_command,'templateId',100),'locale',v.content_locale));
      select * into proposed from ghaf_private.task_versions where task_id=a.task_id and version=ver;
      if proposed.category_id<>v.category_id or proposed.landscape_id<>v.landscape_id or coalesce(proposed.seed_award,0)>coalesce(v.seed_award,0) then
        perform ghaf_private.fail('invalid_input'); end if;
      update ghaf_private.adjustments set proposed_version=ver,status='child_decision_required' where id=did;
    elsif kind='adjustment.keep' then
      if d.status not in ('parent_review_required','child_decision_required') then perform ghaf_private.fail('invalid_transition'); end if;
      update ghaf_private.adjustments set status='kept_current' where id=did;
    else
      if d.status<>'child_decision_required' or d.proposed_version is null or a.task_version<>d.source_version then perform ghaf_private.fail('invalid_transition'); end if;
      update ghaf_private.assignments set task_version=d.proposed_version where id=a.id;
      update ghaf_private.tasks set current_version=d.proposed_version where id=a.task_id;
      update ghaf_private.adjustments set status='accepted' where id=did;
    end if;
    return jsonb_build_object('ok',true);

  when 'checkin.confirm','checkin.retry' then
    perform ghaf_private.require_keys(p_command,array['type','assignmentId','praise','observation'],array['type','assignmentId']);
    aid:=ghaf_private.uuid_field(p_command,'assignmentId'); select * into a from ghaf_private.assignments where id=aid and family_id=p_family_id for update;
    if not found then perform ghaf_private.fail('not_found'); end if;
    select id into sid from ghaf_private.submissions where assignment_id=aid order by attempt desc limit 1;
    if sid is null then perform ghaf_private.fail('invalid_transition'); end if;
    if kind='checkin.confirm' then praise:=ghaf_private.text_field(p_command,'praise',1000); else observation:=ghaf_private.text_field(p_command,'observation',1000); end if;
    select * into ci from ghaf_private.check_ins where submission_id=sid;
    if found then
      if ci.decision<>(case kind when 'checkin.confirm' then 'confirm' else 'kind_retry' end) or ci.praise is distinct from praise or ci.observation is distinct from observation then perform ghaf_private.fail('invalid_transition'); end if;
      return jsonb_build_object('check_in_id',ci.id);
    end if;
    if a.state<>'submitted' then perform ghaf_private.fail('invalid_transition'); end if;
    checkid:=gen_random_uuid();
    insert into ghaf_private.check_ins(id,family_id,assignment_id,submission_id,decision,praise,observation,confirmed_by,presentation)
      values(checkid,p_family_id,aid,sid,case kind when 'checkin.confirm' then 'confirm' else 'kind_retry' end,praise,observation,p_user_id,case kind when 'checkin.confirm' then 'editing_praise' else null end);
    update ghaf_private.assignments set state=case kind when 'checkin.confirm' then 'confirmed' else 'retry' end where id=aid;
    return jsonb_build_object('check_in_id',checkid);

  when 'checkin.praise_presented','recognition.apply' then
    perform ghaf_private.require_keys(p_command,array['type','checkInId'],array['type','checkInId']); checkid:=ghaf_private.uuid_field(p_command,'checkInId');
    select * into ci from ghaf_private.check_ins where id=checkid and family_id=p_family_id for update;
    if not found or ci.decision<>'confirm' then perform ghaf_private.fail('not_found'); end if;
    select * into a from ghaf_private.assignments where id=ci.assignment_id for update;
    if kind='checkin.praise_presented' then
      if ci.presentation='editing_praise' then update ghaf_private.check_ins set presentation='praise_presented',praise_presented_at=clock_timestamp() where id=checkid; end if;
      return jsonb_build_object('ok',true);
    end if;
    select id into rid from ghaf_private.recognitions where assignment_id=a.id;
    if rid is not null then return jsonb_build_object('recognition_id',rid); end if;
    if a.state<>'confirmed' or ci.presentation<>'praise_presented' or ci.praise_presented_at is null then perform ghaf_private.fail('invalid_transition'); end if;
    select * into v from ghaf_private.task_versions where task_id=a.task_id and version=a.task_version;
    if not exists(select 1 from ghaf_private.submissions where id=ci.submission_id and assignment_id=a.id and task_version=a.task_version and child_id=a.child_id) then perform ghaf_private.fail('invalid_transition'); end if;
    seed:=coalesce(v.seed_award,0); rid:=gen_random_uuid();
    insert into ghaf_private.recognitions(id,family_id,child_id,assignment_id,task_id,task_version,submission_id,check_in_id,seed_amount,landscape_id,recognition_mode,routine_phase,visibility_scope,reward_eligible,league_eligible,circle_eligible,skill_ids)
      values(rid,p_family_id,a.child_id,a.id,a.task_id,a.task_version,ci.submission_id,checkid,seed,v.landscape_id,v.recognition_mode,v.routine_phase,v.visibility_scope,v.reward_eligible,v.league_eligible,v.circle_eligible,v.skill_ids);
    if seed>0 then
      insert into ghaf_private.seed_entries(family_id,child_id,recognition_id,amount) values(p_family_id,a.child_id,rid,seed);
      insert into ghaf_private.landscape_events(recognition_id,family_id,child_id,landscape_id,amount) values(rid,p_family_id,a.child_id,v.landscape_id,seed);
      update ghaf_private.routines set confirmed_acquisition_count=confirmed_acquisition_count+1 where task_id=a.task_id;
      if v.visibility_scope='household' then insert into ghaf_private.canopy_events(recognition_id,family_id) values(rid,p_family_id); end if;
    end if;
    if v.circle_eligible and v.visibility_scope='household' and v.category_id='green_impact' and v.recognition_mode<>'recognition_only' then
      insert into ghaf_private.circle_events(recognition_id,family_id) values(rid,p_family_id); end if;
    if seed>0 and v.circle_eligible and v.visibility_scope='household' and v.category_id='green_impact' then
      insert into ghaf_private.community_signals(recognition_id,family_id,child_id,consent_id,theme)
      select rid,p_family_id,a.child_id,c.id,case when v.landscape_id='mangrove' then 'coastal_habitat_care' else 'native_canopy_care' end
      from ghaf_private.community_preferences p join ghaf_private.community_consents c on c.family_id=p.family_id and c.revision=p.revision
      where p.family_id=p_family_id and p.status='continued' and c.status='continued';
    end if;
    update ghaf_private.assignments set state='recognized' where id=a.id;
    update ghaf_private.check_ins set presentation='recognition_applied' where id=checkid;
    insert into ghaf_private.reveals(family_id,child_id,recognition_id) values(p_family_id,a.child_id,rid);
    perform ghaf_private.after_recognition(rid);
    return jsonb_build_object('recognition_id',rid);

  when 'reveal.acknowledge' then
    perform ghaf_private.require_keys(p_command,array['type','revealId'],array['type','revealId']); rid:=ghaf_private.uuid_field(p_command,'revealId');
    update ghaf_private.reveals set acknowledged_at=coalesce(acknowledged_at,clock_timestamp()) where id=rid and family_id=p_family_id and child_id=p_child_id;
    if not found then perform ghaf_private.fail('not_found'); end if;
    return jsonb_build_object('ok',true);
  else
    return ghaf_private.command_extras(p_command,p_family_id,p_child_id,p_role,p_user_id);
  end case;
end; $$;

create function ghaf_private.api_read() returns jsonb
language plpgsql security definer set search_path='' as $$
declare a record;
begin
  select * into a from ghaf_private.current_actor();
  perform 1 from ghaf_private.families where id=a.family_id for share;
  select * into a from ghaf_private.current_actor();
  return ghaf_private.read_snapshot(a.family_id,a.child_id,a.role,a.user_id);
end; $$;

create function ghaf_private.api_command(p_request_id uuid,p_expected_revision bigint,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare a record; current_revision bigint; prior ghaf_private.requests; result jsonb;
begin
  select * into a from ghaf_private.current_actor();
  select revision into current_revision from ghaf_private.families where id=a.family_id for update;
  select * into a from ghaf_private.current_actor();
  if p_request_id is null or p_expected_revision is null or p_expected_revision not between 0 and 9007199254740990
    or jsonb_typeof(p_command) is distinct from 'object' or jsonb_typeof(p_command->'type') is distinct from 'string'
    or octet_length(p_command::text)>50000 then perform ghaf_private.fail('invalid_input'); end if;
  select * into prior from ghaf_private.requests where family_id=a.family_id and user_id=a.user_id and request_id=p_request_id;
  if found then
    if prior.command<>p_command then perform ghaf_private.fail('request_conflict','PT409'); end if;
    return jsonb_build_object('snapshot',ghaf_private.read_snapshot(a.family_id,a.child_id,a.role,a.user_id),'result',prior.result);
  end if;
  if current_revision<>p_expected_revision then perform ghaf_private.fail('revision_conflict','PT409'); end if;
  if current_revision>=9007199254740990 then perform ghaf_private.fail('service_unavailable'); end if;
  perform set_config('ghaf.request_id',p_request_id::text,true);
  result:=ghaf_private.command_core(p_command,a.family_id,a.child_id,a.role,a.user_id);
  update ghaf_private.families set revision=revision+1 where id=a.family_id;
  insert into ghaf_private.requests(family_id,user_id,request_id,command,result) values(a.family_id,a.user_id,p_request_id,p_command,result);
  return jsonb_build_object('snapshot',ghaf_private.read_snapshot(a.family_id,a.child_id,a.role,a.user_id),'result',result);
exception when invalid_text_representation or numeric_value_out_of_range or check_violation or not_null_violation then
  perform ghaf_private.fail('invalid_input'); return null;
  when foreign_key_violation then perform ghaf_private.fail('not_found'); return null;
end; $$;

create function ghaf_private.api_claim_child(p_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); session uuid; invitation ghaf_private.child_invitations; binding ghaf_private.child_bindings;
begin
  begin session:=(auth.jwt()->>'session_id')::uuid;
  exception when invalid_text_representation then perform ghaf_private.fail('access_denied','42501'); end;
  if not exists(select 1 from auth.users u where u.id=uid and u.is_anonymous and u.deleted_at is null
      and (u.banned_until is null or u.banned_until<=now())) or not exists(select 1 from auth.sessions s
      where s.id=session and s.user_id=uid and (s.not_after is null or s.not_after>now())) then perform ghaf_private.fail('access_denied','42501'); end if;
  if p_token is null or p_token !~ '^[0-9a-f]{32}$' then perform ghaf_private.fail('invalid_invitation'); end if;
  select * into invitation from ghaf_private.child_invitations where token_hash=sha256(convert_to(p_token,'UTF8'));
  if not found then perform ghaf_private.fail('invalid_invitation'); end if;
  perform 1 from ghaf_private.families where id=invitation.family_id for update;
  select * into invitation from ghaf_private.child_invitations where token_hash=invitation.token_hash for update;
  if invitation.revoked or not ghaf_private.family_active(invitation.family_id) or not exists(select 1 from ghaf_private.children
    where id=invitation.child_id and family_id=invitation.family_id and active and age_band is not null) then perform ghaf_private.fail('invalid_invitation'); end if;
  select * into binding from ghaf_private.child_bindings where session_id=session;
  if found then
    if binding.active and binding.user_id=uid and binding.family_id=invitation.family_id and binding.child_id=invitation.child_id and invitation.used_session_id=session then
      return ghaf_private.read_snapshot(binding.family_id,binding.child_id,'child',uid); end if;
    perform ghaf_private.fail('invalid_invitation');
  end if;
  if invitation.used_session_id is not null or invitation.expires_at<=clock_timestamp() then perform ghaf_private.fail('invalid_invitation'); end if;
  insert into ghaf_private.child_bindings(session_id,user_id,family_id,child_id) values(session,uid,invitation.family_id,invitation.child_id);
  update ghaf_private.child_invitations set used_session_id=session where token_hash=invitation.token_hash;
  update ghaf_private.families set revision=revision+1 where id=invitation.family_id;
  return ghaf_private.read_snapshot(invitation.family_id,invitation.child_id,'child',uid);
end; $$;

-- Private tables remain inaccessible even if default Data API grants change.
do $$ declare t record; begin
  for t in select tablename from pg_tables where schemaname='ghaf_private' loop
    execute format('alter table ghaf_private.%I enable row level security',t.tablename);
    execute format('revoke all on table ghaf_private.%I from public,anon,authenticated,service_role',t.tablename);
  end loop;
end; $$;
revoke all on all functions in schema ghaf_private from public,anon,authenticated,service_role;
grant usage on schema ghaf_private to authenticated;
grant execute on function ghaf_private.api_read(),ghaf_private.api_command(uuid,bigint,jsonb),ghaf_private.api_claim_child(text) to authenticated;

create function public.ghaf_read() returns jsonb language sql security invoker set search_path='' as $$ select ghaf_private.api_read(); $$;
create function public.ghaf_command(p_request_id uuid,p_expected_revision bigint,p_command jsonb) returns jsonb
  language sql security invoker set search_path='' as $$ select ghaf_private.api_command(p_request_id,p_expected_revision,p_command); $$;
create function public.ghaf_claim_child(p_token text) returns jsonb language sql security invoker set search_path='' as $$ select ghaf_private.api_claim_child(p_token); $$;
revoke all on function public.ghaf_read(),public.ghaf_command(uuid,bigint,jsonb),public.ghaf_claim_child(text) from public,anon,authenticated,service_role;
grant execute on function public.ghaf_read(),public.ghaf_command(uuid,bigint,jsonb),public.ghaf_claim_child(text) to authenticated;

commit;
