begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();

select is((select count(*) from ghaf_private.badge_definitions),16::bigint,'Exactly sixteen deterministic badge definitions');
select is((select count(*) from ghaf_private.masroofi_categories),8::bigint,'Eight spending categories remain');
select is((select count(*) from ghaf_private.masroofi_products),8::bigint,'Purchase references do not create balances');
select is((select count(*) from ghaf_private.masroofi_cards),0::bigint,'No predefined cards');
select is((select count(*) from ghaf_private.badge_awards),0::bigint,'No fabricated badge awards');
select ok((select bool_and(relrowsecurity) from pg_class where oid in
  ('ghaf_private.reward_plans'::regclass,'ghaf_private.masroofi_ledger'::regclass,'ghaf_private.academic_goals'::regclass,
   'ghaf_private.learning_completions'::regclass,'ghaf_private.league_nominations'::regclass)), 'Private extension tables enable RLS');
select ok(not has_table_privilege('authenticated','ghaf_private.masroofi_promises','SELECT'),'Hidden promises cannot be read directly');
select ok(not has_table_privilege('authenticated','ghaf_private.masroofi_ledger','INSERT'),'Clients cannot mint card funds');
select ok(not has_function_privilege('authenticated','ghaf_private.command_extras(jsonb,uuid,uuid,text,uuid)','EXECUTE'),
  'Clients cannot invoke an extension with a forged actor');
select ok(not has_function_privilege('anon','ghaf_private.read_extras(uuid,uuid,text)','EXECUTE'),'Anonymous projections denied');

insert into auth.users(id,aud,role,email,email_confirmed_at,raw_user_meta_data) values
 ('01910000-0000-4000-8000-000000000001','authenticated','authenticated','extension-parent-a@example.invalid',now(),'{}'),
 ('01910000-0000-4000-8000-000000000002','authenticated','authenticated','extension-parent-b@example.invalid',now(),'{}');
update public.pilot_access set status='approved' where user_id in
 ('01910000-0000-4000-8000-000000000001','01910000-0000-4000-8000-000000000002');
insert into auth.users(id,aud,role,is_anonymous,raw_user_meta_data) values
 ('01910000-0000-4000-8000-000000000003','authenticated','authenticated',true,'{}');
insert into auth.sessions(id,user_id,created_at,updated_at) values
 ('01940000-0000-4000-8000-000000000001','01910000-0000-4000-8000-000000000001',now(),now()),
 ('01940000-0000-4000-8000-000000000002','01910000-0000-4000-8000-000000000003',now(),now()),
 ('01940000-0000-4000-8000-000000000003','01910000-0000-4000-8000-000000000002',now(),now());
insert into ghaf_private.families(id,owner_user_id,name) values
 ('01920000-0000-4000-8000-000000000001','01910000-0000-4000-8000-000000000001','Synthetic extension family A'),
 ('01920000-0000-4000-8000-000000000002','01910000-0000-4000-8000-000000000002','Synthetic extension family B');
insert into ghaf_private.guardians(user_id,family_id) values
 ('01910000-0000-4000-8000-000000000001','01920000-0000-4000-8000-000000000001'),
 ('01910000-0000-4000-8000-000000000002','01920000-0000-4000-8000-000000000002');
insert into ghaf_private.children(id,family_id,nickname,age_band,age10_plus_confirmed) values
 ('01930000-0000-4000-8000-000000000001','01920000-0000-4000-8000-000000000001','Synthetic A1','9_11',true),
 ('01930000-0000-4000-8000-000000000002','01920000-0000-4000-8000-000000000001','Synthetic A2','6_8',false),
 ('01930000-0000-4000-8000-000000000003','01920000-0000-4000-8000-000000000002','Synthetic B1','12_14',true);
insert into ghaf_private.child_preferences(child_id) values
 ('01930000-0000-4000-8000-000000000001'),('01930000-0000-4000-8000-000000000002'),('01930000-0000-4000-8000-000000000003');
select set_config('request.jwt.claim.sub','01910000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims',jsonb_build_object('sub','01910000-0000-4000-8000-000000000001','role','authenticated',
  'session_id','01940000-0000-4000-8000-000000000001',
  'amr',jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from now()))))::text,true);
insert into ghaf_private.child_bindings(session_id,user_id,family_id,child_id) values
 ('01940000-0000-4000-8000-000000000002','01910000-0000-4000-8000-000000000003','01920000-0000-4000-8000-000000000001','01930000-0000-4000-8000-000000000001');
create function pg_temp.actor(p_role text) returns void language plpgsql as $$
declare uid text:=case p_role when 'parent' then '01910000-0000-4000-8000-000000000001' else '01910000-0000-4000-8000-000000000003' end;
 sid text:=case p_role when 'parent' then '01940000-0000-4000-8000-000000000001' else '01940000-0000-4000-8000-000000000002' end;
begin
 perform set_config('request.jwt.claim.sub',uid,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',uid,'session_id',sid,'role','authenticated','is_anonymous',p_role='child',
  'amr',jsonb_build_array(jsonb_build_object('method',case p_role when 'parent' then 'password' else 'anonymous' end,'timestamp',extract(epoch from now()))))::text,true);
end $$;
select ghaf_read() as contract_snapshot,'parent_before_domain_records' as contract_label;

create function pg_temp.ext(p_command jsonb,p_role text default 'parent',p_child uuid default null,
 p_family uuid default '01920000-0000-4000-8000-000000000001') returns jsonb language plpgsql as $$
begin
  perform set_config('ghaf.request_id',gen_random_uuid()::text,true);
  return ghaf_private.command_extras(p_command,p_family,p_child,p_role,auth.uid());
end $$;
create function pg_temp.view(p_child uuid default null,p_role text default 'parent',
 p_family uuid default '01920000-0000-4000-8000-000000000001') returns jsonb language sql as $$
 select ghaf_private.read_extras(p_family,p_child,p_role);
$$;
create function pg_temp.rpc(p_command jsonb,p_request uuid default gen_random_uuid()) returns jsonb language plpgsql as $$
declare actor record; revision bigint;
begin
 select * into actor from ghaf_private.current_actor();
 select f.revision into revision from ghaf_private.families f where f.id=actor.family_id;
 return ghaf_command(p_request,revision,p_command);
end $$;
create temp table fixture_ids(name text primary key,id uuid not null);
create function pg_temp.fixture(p_name text) returns uuid language sql as $$select id from fixture_ids where name=p_name$$;

create function pg_temp.assignment(p_child uuid default '01930000-0000-4000-8000-000000000001',p_template text default 'GI01')
returns uuid language plpgsql as $$
declare family uuid; owner_id uuid; task uuid; assignment uuid;
begin
 select c.family_id,f.owner_user_id into family,owner_id from ghaf_private.children c join ghaf_private.families f on f.id=c.family_id where c.id=p_child;
 insert into ghaf_private.tasks(family_id,child_id,created_by) values(family,p_child,owner_id) returning id into task;
 perform ghaf_private.write_task_version(task,1,family,jsonb_build_object('templateId',p_template,'locale','en'));
 update ghaf_private.tasks set status='assigned' where id=task;
 insert into ghaf_private.assignments(family_id,child_id,task_id,task_version,approved_by) values(family,p_child,task,1,owner_id) returning id into assignment;
 return assignment;
end $$;

create function pg_temp.recognize(p_assignment uuid) returns uuid language plpgsql as $$
declare a ghaf_private.assignments; v ghaf_private.task_versions; s uuid; k uuid; r uuid;
begin
 select id into r from ghaf_private.recognitions where assignment_id=p_assignment;
 if found then perform ghaf_private.after_recognition(r); return r; end if;
 select * into strict a from ghaf_private.assignments where id=p_assignment;
 select * into strict v from ghaf_private.task_versions where task_id=a.task_id and version=a.task_version;
 insert into ghaf_private.submissions(family_id,child_id,assignment_id,task_version,attempt,completion_mode,definition_acknowledged)
  values(a.family_id,a.child_id,a.id,a.task_version,1,'permitted_help',true) returning id into s;
 insert into ghaf_private.check_ins(family_id,assignment_id,submission_id,decision,praise,confirmed_by,presentation,praise_presented_at)
  values(a.family_id,a.id,s,'confirm','You sorted the prepared safe materials with help.',a.approved_by,'recognition_applied',now()) returning id into k;
 insert into ghaf_private.recognitions(family_id,child_id,assignment_id,task_id,task_version,submission_id,check_in_id,seed_amount,landscape_id,
   recognition_mode,routine_phase,visibility_scope,reward_eligible,league_eligible,circle_eligible,skill_ids)
  values(a.family_id,a.child_id,a.id,a.task_id,a.task_version,s,k,coalesce(v.seed_award,0),v.landscape_id,
    v.recognition_mode,v.routine_phase,v.visibility_scope,v.reward_eligible,v.league_eligible,v.circle_eligible,v.skill_ids) returning id into r;
 if v.seed_award>0 then
   insert into ghaf_private.seed_entries(family_id,child_id,recognition_id,amount) values(a.family_id,a.child_id,r,v.seed_award);
 end if;
 update ghaf_private.assignments set state='recognized' where id=a.id;
 perform ghaf_private.after_recognition(r);
 return r;
end $$;

select lives_ok($$select pg_temp.ext('{"type":"masroofi.enable","childId":"01930000-0000-4000-8000-000000000001"}')$$,'Parent enables attested age10+ card');
select throws_ok($$select pg_temp.ext('{"type":"masroofi.enable","childId":"01930000-0000-4000-8000-000000000002"}')$$,'PT409','age_ineligible','Younger sibling card denied');
select throws_ok($$select pg_temp.ext('{"type":"masroofi.enable","childId":"01930000-0000-4000-8000-000000000003"}')$$,'PT403','forbidden','Foreign household child denied');
select throws_ok($$select pg_temp.ext('{"type":"masroofi.top_up","childId":"01930000-0000-4000-8000-000000000001","amountFils":500}',
 'child','01930000-0000-4000-8000-000000000001')$$,'PT403','parent_required','Child cannot mint balance');
select lives_ok($$select pg_temp.ext('{"type":"masroofi.top_up","childId":"01930000-0000-4000-8000-000000000001","amountFils":1000}')$$,'Parent funds simulated ledger');
select is(pg_temp.view('01930000-0000-4000-8000-000000000002','child')->'masroofi'->'cards','[]'::jsonb,'Sibling cannot see another card');
select is(pg_temp.ext('{"type":"masroofi.purchase","fixtureId":"stationery"}','child','01930000-0000-4000-8000-000000000001')->>'status','approved','Allowed category purchase succeeds');
select is((select balance_fils from ghaf_private.masroofi_cards where child_id='01930000-0000-4000-8000-000000000001'),700,'Server subtracts exact catalog price');
select is(pg_temp.ext('{"type":"masroofi.purchase","fixtureId":"game_online"}','child','01930000-0000-4000-8000-000000000001')->>'declineReason','category_blocked','Blocked category records decline');
select is((select balance_fils from ghaf_private.masroofi_cards where child_id='01930000-0000-4000-8000-000000000001'),700,'Decline loses no balance');
select ok((select bool_and(day=timezone('Asia/Dubai',now())::date) from ghaf_private.masroofi_ledger),'Ledger date is server UAE day');
select throws_ok($$select pg_temp.ext('{"type":"masroofi.purchase","fixtureId":"stationery","amountFils":1,"day":"2000-01-01"}','child','01930000-0000-4000-8000-000000000001')$$,
 'PT400','invalid_input','Child cannot forge purchase price or day');
select lives_ok($$select pg_temp.ext('{"type":"masroofi.controls","expectedVersion":1,"childId":"01930000-0000-4000-8000-000000000001",
 "controls":{"frozen":true,"onlineAllowed":false,"allowedCategories":["stationery"],"perPurchaseLimitFils":2000,"dailyLimitFils":5000}}')$$,'Parent creates immutable controls version');
select is(pg_temp.ext('{"type":"masroofi.purchase","fixtureId":"stationery"}','child','01930000-0000-4000-8000-000000000001')->>'declineReason','card_frozen','Freeze blocks purchases');
insert into fixture_ids values('paid-assignment',pg_temp.assignment());
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','masroofi.promise','expectedTaskVersion',1,'assignmentId',pg_temp.fixture('paid-assignment'),'amountFils',500))$$,'Parent locks reward before acceptance');
select ok(not(pg_temp.view('01930000-0000-4000-8000-000000000001','child')->'masroofi'->'promises'->0 ? 'amountFils'),'Unearned amount omitted entirely from Child response');
select is((pg_temp.view()->'masroofi'->'promises'->0->>'amountFils')::integer,500,'Parent sees own fixed promise');
select pg_temp.actor('child');
select ghaf_read() as contract_snapshot,'child_hidden_reward' as contract_label;
select pg_temp.actor('parent');
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','masroofi.promise','expectedTaskVersion',1,'assignmentId',pg_temp.fixture('paid-assignment'),'amountFils',100))$$,
 'PT409','promise_locked','Fixed promise cannot be weakened');

insert into fixture_ids values('reward',(pg_temp.ext(jsonb_build_object('type','reward.create','childId','01930000-0000-4000-8000-000000000001',
 'label','Synthetic earned outing','kind','money','amountFils',500,'month',to_char(timezone('Asia/Dubai',now()),'YYYY-MM'),
 'monthlyMaximumFils',500,'milestone',jsonb_build_object('kind','eligible_seed_delta','requiredSeedDelta',1)))->>'id')::uuid);
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','reward.create','childId','01930000-0000-4000-8000-000000000001',
 'label','Exceeds monthly limit','kind','money','amountFils',1,'month',to_char(timezone('Asia/Dubai',now()),'YYYY-MM'),
 'monthlyMaximumFils',500,'milestone',jsonb_build_object('kind','eligible_seed_delta','requiredSeedDelta',12)))$$,
 'PT409','monthly_limit','Monthly cap counts other private promises');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','reward.create','childId','01930000-0000-4000-8000-000000000001',
 'label','A nonessential activity','kind','experience','month',to_char(timezone('Asia/Dubai',now()),'YYYY-MM'),
 'monthlyMaximumFils',0,'milestone',jsonb_build_object('kind','eligible_seed_delta','requiredSeedDelta',200)))$$,
 'Nonmoney promise does not spend monthly allowance');
select lives_ok($$select pg_temp.recognize(pg_temp.fixture('paid-assignment'))$$,'Recognition commits credit and separate eligible reward progress');
select is((select status from ghaf_private.reward_plans where id=pg_temp.fixture('reward')),'unlocked','Eligible evidence unlocks reward');
select is((select balance_fils from ghaf_private.masroofi_cards where child_id='01930000-0000-4000-8000-000000000001'),1200,'Frozen card still receives earned credit');
select is((pg_temp.view('01930000-0000-4000-8000-000000000001','child')->'masroofi'->'promises'->0->>'amountFils')::integer,500,'Earned amount becomes visible');
select lives_ok($$select pg_temp.recognize(pg_temp.fixture('paid-assignment'))$$,'Repeated recognition projection is idempotent');
select is((select count(*) from ghaf_private.masroofi_ledger where kind='reward'),1::bigint,'No duplicate reward credit');
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','reward.edit','expectedVersion',1,'id',pg_temp.fixture('reward'),'childId','01930000-0000-4000-8000-000000000001',
 'label','Weakened','kind','money','amountFils',1,'month',to_char(timezone('Asia/Dubai',now()),'YYYY-MM'),'monthlyMaximumFils',500,
 'milestone',jsonb_build_object('kind','eligible_seed_delta','requiredSeedDelta',100)))$$,'PT409','immutable_reward','Unlocked terms cannot weaken');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','reward.give','id',pg_temp.fixture('reward')))$$,'Parent records external reward fulfillment');
select throws_ok($$update ghaf_private.masroofi_ledger set amount_fils=1$$,'PT409','immutable_evidence','Ledger evidence cannot be rewritten');
select throws_ok($$delete from ghaf_private.reward_contributions$$,'PT409','immutable_evidence','Eligible reward evidence cannot be deleted');

insert into fixture_ids values('study',(pg_temp.ext('{"type":"study.create","childId":"01930000-0000-4000-8000-000000000001",
 "input":{"subject":"Mathematics","title":"Two examples","nextStep":"Read one example","durationMinutes":10,"dueDate":null,"revisitDate":null}}')->>'id')::uuid);
select is((select status from ghaf_private.study_plans where id=pg_temp.fixture('study')),'proposed','Parent study plan awaits Child acceptance');
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','study.start','id',pg_temp.fixture('study')),'child','01930000-0000-4000-8000-000000000002')$$,
 'PT404','not_found','Sibling cannot start another study plan');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','study.accept','id',pg_temp.fixture('study')),'child','01930000-0000-4000-8000-000000000001')$$,'Child accepts study plan');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','study.start','id',pg_temp.fixture('study')),'child','01930000-0000-4000-8000-000000000001')$$,'Child starts accepted plan');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','study.help','id',pg_temp.fixture('study'),'request','together'),'child','01930000-0000-4000-8000-000000000001')$$,'Child requests study help');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','study.complete','id',pg_temp.fixture('study')),'child','01930000-0000-4000-8000-000000000001')$$,'Help does not reduce completion');
select is((select count(*) from ghaf_private.recognitions),1::bigint,'Study creates no task recognition');

insert into fixture_ids values('goal',(pg_temp.ext('{"type":"goal.create","childId":"01930000-0000-4000-8000-000000000001",
 "input":{"subject":"Reading","title":"Practice together","nextStep":"Choose a passage","parentSupport":"Read together",
 "criterion":{"kind":"practice_count","target":2},"prize":{"kind":"experience","label":"Choose a nonessential outing"}}}')->>'id')::uuid);
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','goal.accept','expectedRevision',1,'id',pg_temp.fixture('goal')),'child','01930000-0000-4000-8000-000000000001')$$,'PT409','invalid_transition','Goal needs Parent review first');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','goal.approve','expectedRevision',1,'id',pg_temp.fixture('goal')))$$,'Parent approves exact goal version');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','goal.accept','expectedRevision',1,'id',pg_temp.fixture('goal')),'child','01930000-0000-4000-8000-000000000001')$$,'Child accepts exact approved version');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','goal.request_change','id',pg_temp.fixture('goal')),'child','01930000-0000-4000-8000-000000000001')$$,'Accepted goal permits request for change');
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','goal.edit','expectedRevision',1,'id',pg_temp.fixture('goal'),'input','{}'::jsonb))$$,'PT409','immutable_goal','Accepted terms stay immutable during change request');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','goal.resume','id',pg_temp.fixture('goal')),'child','01930000-0000-4000-8000-000000000001')$$,'Child resumes original accepted terms');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','goal.submit','id',pg_temp.fixture('goal'),'result',jsonb_build_object('kind','practice_count','count',1)),'child','01930000-0000-4000-8000-000000000001')$$,'Child submits honest lower result');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','goal.confirm','id',pg_temp.fixture('goal'),'submissionId',
 (select id from ghaf_private.academic_results where goal_id=pg_temp.fixture('goal')),'acknowledgement','You tried one passage together.'))$$,'Parent acknowledges lower result');
select is((select prize_status from ghaf_private.academic_goals where id=pg_temp.fixture('goal')),'promised','Lower result does not remove promise');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','goal.submit','id',pg_temp.fixture('goal'),'result',jsonb_build_object('kind','practice_count','count',2)),'child','01930000-0000-4000-8000-000000000001')$$,'Child retries without loss');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','goal.confirm','id',pg_temp.fixture('goal'),'submissionId',
 (select id from ghaf_private.academic_results where goal_id=pg_temp.fixture('goal') and reviewed_at is null),'acknowledgement','You practised both passages with support.'))$$,'Parent confirms matching criterion');
select is((select prize_status from ghaf_private.academic_goals where id=pg_temp.fixture('goal')),'unlocked','Criterion unlocks nonfinancial academic prize');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','goal.give','id',pg_temp.fixture('goal')))$$,'Parent records academic prize fulfillment');
select is((select count(*) from ghaf_private.recognitions),1::bigint,'Academic result creates no Seed recognition');

insert into fixture_ids values('circle',(pg_temp.ext('{"type":"circle.create","name":"Synthetic invited relatives"}')->>'id')::uuid);
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','circle.join_child','circleId',pg_temp.fixture('circle'),
 'childId','01930000-0000-4000-8000-000000000001','nickname','Tree A','avatarId','ghaf'))$$,'Parent joins Child using approved public nickname');
insert into fixture_ids select 'leaf-'||n,pg_temp.assignment() from generate_series(1,5) n;
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','league.nominate','circleId',pg_temp.fixture('circle'),
 'childId','01930000-0000-4000-8000-000000000001','assignmentIds',jsonb_build_array(pg_temp.fixture('leaf-1'))))$$,'PT400','five_leaves_required','Partial nomination is denied');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','league.nominate','circleId',pg_temp.fixture('circle'),
 'childId','01930000-0000-4000-8000-000000000001','assignmentIds',(select jsonb_agg(id order by name) from fixture_ids where name like 'leaf-%')))$$,'Exactly five age-appropriate approved Leaves persist');
select lives_ok($$select pg_temp.recognize(pg_temp.fixture('leaf-1'))$$,'Confirmed eligible Leaf contributes to League');
select is((pg_temp.view()->'league'->'circles'->0->'rows'->0->>'score')::integer,20,'One of five Leaves earns twenty score');
select lives_ok($$select pg_temp.recognize(pg_temp.assignment())$$,'Additional tasks still earn private growth');
select is((pg_temp.view()->'league'->'circles'->0->'rows'->0->>'score')::integer,20,'Extra tasks give no League advantage');
select is((select count(*) from jsonb_object_keys(pg_temp.view()->'league'->'circles'->0->'rows'->0)),5::bigint,'Shared row has only five approved fields');
select is((pg_temp.view()->'league'->'circles'->0->>'canopyContributions')::integer,1,'One confirmed Leaf creates one canopy contribution');
select lives_ok($$select pg_temp.recognize(pg_temp.fixture('leaf-1'))$$,'Repeated Leaf confirmation is idempotent');
select is((pg_temp.view()->'league'->'circles'->0->>'canopyContributions')::integer,1,'Repeated callback cannot duplicate canopy');
select is(pg_temp.view('01930000-0000-4000-8000-000000000002','child')->'league'->'circles','[]'::jsonb,'Unenrolled sibling sees no invite-only League');
select is(pg_temp.view('01930000-0000-4000-8000-000000000001','child')->'league'->'circles'->0->>'isOwner','false','Child never gains Circle owner authority');

select throws_ok($$select pg_temp.ext('{"type":"learning.start","learningId":"learning.mangrove_roots.v1","route":"accessible"}',
 'child','01930000-0000-4000-8000-000000000002')$$,'PT409','learning_locked','Learning threshold derives from real immutable evidence');
do $$ begin
 while (select coalesce(sum(amount),0) from ghaf_private.seed_entries where child_id='01930000-0000-4000-8000-000000000001')<132 loop
   perform pg_temp.recognize(pg_temp.assignment());
 end loop;
end $$;
select lives_ok($$select pg_temp.ext('{"type":"learning.start","learningId":"learning.mangrove_roots.v1","route":"accessible"}',
 'child','01930000-0000-4000-8000-000000000001')$$,'Accessible learning unlocks from confirmed Seeds');
select throws_ok($$select pg_temp.ext('{"type":"learning.complete","learningId":"learning.mangrove_roots.v1","route":"accessible"}',
 'child','01930000-0000-4000-8000-000000000001')$$,'PT409','invalid_transition','Cannot skip finite learning steps');
select lives_ok($$select pg_temp.ext('{"type":"learning.step","learningId":"learning.mangrove_roots.v1","route":"accessible","stepId":"accessible_section_1"}',
 'child','01930000-0000-4000-8000-000000000001')$$,'First accessible step persists');
select lives_ok($$select pg_temp.ext('{"type":"learning.step","learningId":"learning.mangrove_roots.v1","route":"accessible","stepId":"accessible_section_2"}',
 'child','01930000-0000-4000-8000-000000000001')$$,'Second accessible step persists');
select lives_ok($$select pg_temp.ext('{"type":"learning.check","learningId":"learning.mangrove_roots.v1","route":"accessible","optionId":"visit_or_task_reward"}',
 'child','01930000-0000-4000-8000-000000000001')$$,'Incorrect learning option allows retry');
select throws_ok($$select pg_temp.ext('{"type":"learning.complete","learningId":"learning.mangrove_roots.v1","route":"accessible"}',
 'child','01930000-0000-4000-8000-000000000001')$$,'PT409','learning_check_required','Completion requires exact objective check');
select lives_ok($$select pg_temp.ext('{"type":"learning.check","learningId":"learning.mangrove_roots.v1","route":"accessible","optionId":"habitat_support_and_care"}',
 'child','01930000-0000-4000-8000-000000000001')$$,'Correct objective check persists');
create temp table before_learning as select count(*) n,coalesce(sum(amount),0) seeds from ghaf_private.seed_entries;
select lives_ok($$select pg_temp.ext('{"type":"learning.complete","learningId":"learning.mangrove_roots.v1","route":"accessible"}',
 'child','01930000-0000-4000-8000-000000000001')$$,'Accessible route creates equal completion credit');
select lives_ok($$select pg_temp.ext('{"type":"learning.complete","learningId":"learning.mangrove_roots.v1","route":"accessible"}',
 'child','01930000-0000-4000-8000-000000000001')$$,'Repeat learning completion is idempotent');
select is((select count(*) from ghaf_private.learning_completions),1::bigint,'Exactly one learning completion');
select is((select count(*) from ghaf_private.seed_entries),(select n from before_learning),'Learning creates zero Seed entries');
select is((select sum(amount) from ghaf_private.seed_entries),(select seeds from before_learning),'Learning never changes Seed balance');
select ok(exists(select 1 from ghaf_private.badge_awards where child_id='01930000-0000-4000-8000-000000000001' and badge_id='badge.journey.expanding_shade.v1'),
 'Seed badge uses actual permanent evidence');
select ok(not exists(select 1 from ghaf_private.badge_awards where badge_id='badge.heritage.sadu_patterns.v1'),'Unavailable cultural activity does not fabricate badge');
select throws_ok($$delete from ghaf_private.badge_awards$$,'PT409','immutable_evidence','Earned badges remain permanent');
select ghaf_read() as contract_snapshot,'parent_all_domains_populated' as contract_label;
select pg_temp.actor('child');
select ghaf_read() as contract_snapshot,'child_recognized_learning_and_league' as contract_label;
select pg_temp.actor('parent');

select throws_ok($$select pg_temp.ext('{"type":"masroofi.controls","expectedVersion":1,"childId":"01930000-0000-4000-8000-000000000001",
 "controls":{"frozen":false,"onlineAllowed":false,"allowedCategories":["stationery"],"perPurchaseLimitFils":2000,"dailyLimitFils":5000}}')$$,
 'PT409','stale_revision','Stale controls draft cannot replace newer server controls');
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','goal.approve','expectedRevision',0,'id',pg_temp.fixture('goal')))$$,
 'PT409','stale_revision','Goal approval binds the reviewed version');
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','goal.accept','expectedRevision',0,'id',pg_temp.fixture('goal')),
 'child','01930000-0000-4000-8000-000000000001')$$,'PT409','stale_revision','Goal acceptance binds the displayed approved version');
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','masroofi.promise','assignmentId',pg_temp.fixture('paid-assignment'),
 'expectedTaskVersion',0,'amountFils',500))$$,'PT409','stale_revision','Payment draft cannot silently attach to a newer task version');

select lives_ok($$select pg_temp.ext('{"type":"masroofi.controls","expectedVersion":2,"childId":"01930000-0000-4000-8000-000000000001",
 "controls":{"frozen":false,"onlineAllowed":false,"allowedCategories":["stationery","books","sports","arts","outings","snacks","gifts","games"],"perPurchaseLimitFils":400,"dailyLimitFils":500}}')$$,
 'All eight categories can be enabled without removing historical controls');
select is(pg_temp.ext('{"type":"masroofi.purchase","fixtureId":"storybook"}','child','01930000-0000-4000-8000-000000000001')->>'declineReason','per_purchase_limit','Server enforces per-purchase ceiling');
select is(pg_temp.ext('{"type":"masroofi.purchase","fixtureId":"stationery"}','child','01930000-0000-4000-8000-000000000001')->>'declineReason','daily_limit','Earlier approved purchase counts toward UAE daily ceiling');
select lives_ok($$select pg_temp.ext('{"type":"masroofi.controls","expectedVersion":3,"childId":"01930000-0000-4000-8000-000000000001",
 "controls":{"frozen":false,"onlineAllowed":false,"allowedCategories":["stationery","books","sports","arts","outings","snacks","gifts","games"],"perPurchaseLimitFils":2000,"dailyLimitFils":5000}}')$$,
 'New controls apply prospectively');
select is(pg_temp.ext('{"type":"masroofi.purchase","fixtureId":"museum_ticket"}','child','01930000-0000-4000-8000-000000000001')->>'declineReason','online_blocked','Online restriction is independent from category');
select is(pg_temp.ext('{"type":"masroofi.purchase","fixtureId":"football"}','child','01930000-0000-4000-8000-000000000001')->>'declineReason','insufficient_balance','Server cannot overdraw card');

create temp table before_retry as select balance_fils from ghaf_private.masroofi_cards where child_id='01930000-0000-4000-8000-000000000001';
select lives_ok($$select ghaf_command('01950000-0000-4000-8000-000000000001',0,
 '{"type":"masroofi.top_up","childId":"01930000-0000-4000-8000-000000000001","amountFils":500}')$$,'Public dispatcher accepts real Parent command');
select lives_ok($$select ghaf_command('01950000-0000-4000-8000-000000000001',0,
 '{"type":"masroofi.top_up","childId":"01930000-0000-4000-8000-000000000001","amountFils":500}')$$,'Network retry returns prior receipt despite old global revision');
select is((select balance_fils from ghaf_private.masroofi_cards where child_id='01930000-0000-4000-8000-000000000001'),
 (select balance_fils+500 from before_retry),'Retried top-up credits exactly once');
select throws_ok($$select ghaf_command('01950000-0000-4000-8000-000000000001',1,
 '{"type":"masroofi.top_up","childId":"01930000-0000-4000-8000-000000000001","amountFils":501}')$$,'PT409','request_conflict','Dedupe UUID cannot be reused with changed amount');

insert into fixture_ids values('invite',(pg_temp.ext(jsonb_build_object('type','circle.invite','circleId',pg_temp.fixture('circle'),
 'invitedOwnerId','01910000-0000-4000-8000-000000000002'))->>'id')::uuid);
select set_config('request.jwt.claim.sub','01910000-0000-4000-8000-000000000002',true);
select set_config('request.jwt.claims',jsonb_build_object('sub','01910000-0000-4000-8000-000000000002','role','authenticated',
 'session_id','01940000-0000-4000-8000-000000000003',
 'amr',jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from now()))))::text,true);
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','circle.accept','invitationId',pg_temp.fixture('invite')),
 'parent',null,'01920000-0000-4000-8000-000000000002')$$,'Invited Parent explicitly accepts private circle');
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','circle.accept','invitationId',pg_temp.fixture('invite')),
 'parent',null,'01920000-0000-4000-8000-000000000002')$$,'PT409','invitation_unavailable','Circle invitation is single-use');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','circle.join_child','circleId',pg_temp.fixture('circle'),
 'childId','01930000-0000-4000-8000-000000000003','nickname','Tree B','avatarId','mangrove'),
 'parent',null,'01920000-0000-4000-8000-000000000002')$$,'Invited household selects its own Child membership');
select is((select count(*) from jsonb_array_elements(pg_temp.view(null,'parent','01920000-0000-4000-8000-000000000002')->'league'->'circles'->0->'memberships')),1::bigint,
 'Foreign household receives only its own private membership mapping');
insert into fixture_ids select 'other-leaf-'||n,pg_temp.assignment('01930000-0000-4000-8000-000000000003') from generate_series(1,5) n;
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','league.nominate','circleId',pg_temp.fixture('circle'),
 'childId','01930000-0000-4000-8000-000000000003','assignmentIds',(select jsonb_agg(id order by name) from fixture_ids where name like 'other-leaf-%')),
 'parent',null,'01920000-0000-4000-8000-000000000002')$$,'Invited household nominates exactly its own five Leaves');
select lives_ok($$select pg_temp.recognize(pg_temp.fixture('other-leaf-1'))$$,'Other household earns one confirmed Leaf');
select ok((select bool_and((value->>'rank')::integer=1 and (value->>'score')::integer=20)
 from jsonb_array_elements(pg_temp.view(null,'parent','01920000-0000-4000-8000-000000000002')->'league'->'circles'->0->'rows')),
 'Equal confirmed scores share rank regardless of confirmation speed');
select ghaf_read() as contract_snapshot,'invited_parent_with_private_own_membership_and_shared_tie' as contract_label;
select pg_temp.actor('parent');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','circle.revoke','circleId',pg_temp.fixture('circle'),
 'familyId','01920000-0000-4000-8000-000000000002'))$$,'Circle owner revokes membership prospectively');
select is(pg_temp.view(null,'parent','01920000-0000-4000-8000-000000000002')->'league'->'circles','[]'::jsonb,'Revoked household loses circle reads');
select is((select count(*) from ghaf_private.children where family_id='01920000-0000-4000-8000-000000000002'),1::bigint,'Revocation preserves the other family records');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','circle.join_child','circleId',pg_temp.fixture('circle'),
 'childId','01930000-0000-4000-8000-000000000002','nickname','Tree sibling','avatarId','sidr'))$$,'Parent may nominate another sibling separately');
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','league.rest','circleId',pg_temp.fixture('circle'),
 'childId','01930000-0000-4000-8000-000000000002'))$$,'Sibling rest week needs no tasks');
select is((select count(*) from jsonb_array_elements(pg_temp.view()->'league'->'circles'->0->'rows')),1::bigint,'Rest week is excluded from ranked rows');
do $$declare i integer; begin for i in 2..5 loop perform pg_temp.recognize(pg_temp.fixture('leaf-'||i)); end loop; end $$;
select is((pg_temp.view()->'league'->'circles'->0->'rows'->0->>'score')::integer,100,'Five confirmed Leaves cap score at100 regardless of extra tasks');
select is((pg_temp.view()->'league'->'circles'->0->>'canopyContributions')::integer,6,'Five own Leaves and prior invited contribution remain permanent after revocation');
insert into fixture_ids values('second-circle',(pg_temp.ext('{"type":"circle.create","name":"Second private circle"}')->>'id')::uuid);
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','circle.join_child','circleId',pg_temp.fixture('second-circle'),
 'childId','01930000-0000-4000-8000-000000000001','nickname','Tree A','avatarId','ghaf'))$$,'Another circle may reuse the same permanent Child identity');
insert into fixture_ids select 'extra-leaf-'||n,pg_temp.assignment() from generate_series(1,5) n;
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','league.nominate','circleId',pg_temp.fixture('second-circle'),
 'childId','01930000-0000-4000-8000-000000000001','assignmentIds',(select jsonb_agg(id order by name) from fixture_ids where name like 'extra-leaf-%')))$$,
 'PT400','five_leaves_required','Additional circles cannot expand one Child beyond five weekly Leaves');
select throws_ok($$select pg_temp.ext(jsonb_build_object('type','league.rest','circleId',pg_temp.fixture('second-circle'),
 'childId','01930000-0000-4000-8000-000000000001'))$$,'PT409','week_locked','Rest week cannot contradict an active week in another circle');

insert into fixture_ids values('revised-assignment',pg_temp.assignment());
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','masroofi.promise','assignmentId',pg_temp.fixture('revised-assignment'),
 'expectedTaskVersion',1,'amountFils',700))$$,'Preacceptance version locks a private promise');
do $$declare a ghaf_private.assignments; begin
 select * into a from ghaf_private.assignments where id=pg_temp.fixture('revised-assignment');
 perform ghaf_private.write_task_version(a.task_id,2,a.family_id,jsonb_build_object('templateId','GI01','locale','en'));
 update ghaf_private.tasks set current_version=2 where id=a.task_id;
 update ghaf_private.assignments set task_version=2 where id=a.id;
end $$;
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','masroofi.promise','assignmentId',pg_temp.fixture('revised-assignment'),
 'expectedTaskVersion',2,'amountFils',300))$$,'Fresh Parent promise may target an explicitly revised unaccepted task');
select is((select count(*) from ghaf_private.masroofi_promises where assignment_id=pg_temp.fixture('revised-assignment')),2::bigint,
 'Old private version terms remain recorded rather than overwritten');
select is((select count(*) from jsonb_array_elements(pg_temp.view('01930000-0000-4000-8000-000000000001','child')->'masroofi'->'promises') p
 where p->>'assignmentId'=pg_temp.fixture('revised-assignment')::text),1::bigint,'Child sees only current unearned version');
create temp table before_revised_credit as select balance_fils from ghaf_private.masroofi_cards where child_id='01930000-0000-4000-8000-000000000001';
select lives_ok($$select pg_temp.recognize(pg_temp.fixture('revised-assignment'))$$,'Revised accepted work credits only its exact version');
select is((select balance_fils from ghaf_private.masroofi_cards where child_id='01930000-0000-4000-8000-000000000001'),
 (select balance_fils+300 from before_revised_credit),'Historical unmatched promise does not duplicate credit');

insert into fixture_ids values('age-correction-assignment',pg_temp.assignment());
select lives_ok($$select pg_temp.ext(jsonb_build_object('type','masroofi.promise','assignmentId',pg_temp.fixture('age-correction-assignment'),
 'expectedTaskVersion',1,'amountFils',200))$$,'Eligible fixed promise is preserved before later profile correction');
create temp table before_age_correction as select balance_fils from ghaf_private.masroofi_cards where child_id='01930000-0000-4000-8000-000000000001';
update ghaf_private.children set age10_plus_confirmed=false where id='01930000-0000-4000-8000-000000000001';
select throws_ok($$select pg_temp.ext('{"type":"masroofi.purchase","fixtureId":"stationery"}',
 'child','01930000-0000-4000-8000-000000000001')$$,'PT409','age_ineligible','Corrected age attestation blocks future spending');
select lives_ok($$select pg_temp.recognize(pg_temp.fixture('age-correction-assignment'))$$,'Prior eligible fixed promise still credits earned work');
select is((select balance_fils from ghaf_private.masroofi_cards where child_id='01930000-0000-4000-8000-000000000001'),
 (select balance_fils+200 from before_age_correction),'Age correction does not confiscate balance or earned credit');
select ghaf_read() as contract_snapshot,'parent_corrected_age_with_historical_card' as contract_label;
select pg_temp.actor('child');
select ghaf_read() as contract_snapshot,'child_corrected_age_with_historical_card' as contract_label;
select pg_temp.actor('parent');
update ghaf_private.children set age10_plus_confirmed=true where id='01930000-0000-4000-8000-000000000001';
select pg_temp.actor('child');
select pg_temp.rpc('{"type":"masroofi.purchase","fixtureId":"stationery"}',
 '01950000-0000-4000-8000-000000000002') as contract_result,'child_public_purchase' as contract_label;
select pg_temp.rpc('{"type":"masroofi.purchase","fixtureId":"stationery"}',
 '01950000-0000-4000-8000-000000000002') as contract_result,'child_public_purchase_retry' as contract_label;
select pg_temp.rpc('{"type":"masroofi.purchase","fixtureId":"museum_ticket"}') as contract_result,'child_public_online_decline' as contract_label;
select pg_temp.actor('parent');
select pg_temp.rpc('{"type":"study.create","childId":"01930000-0000-4000-8000-000000000002",
 "input":{"subject":"Reading","title":"A short passage","nextStep":"Choose a passage together","durationMinutes":5,"dueDate":null,"revisitDate":null}}')
 as contract_result,'parent_public_study_creation' as contract_label;
select ghaf_command('01950000-0000-4000-8000-000000000001',0,
 '{"type":"masroofi.top_up","childId":"01930000-0000-4000-8000-000000000001","amountFils":500}')
 as contract_result,'parent_public_topup_retry_after_other_writes' as contract_label;

select set_config('request.jwt.claims',jsonb_build_object('sub','01910000-0000-4000-8000-000000000001','role','authenticated',
 'amr',jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from now())-600)))::text,true);
select throws_ok($$select pg_temp.ext('{"type":"masroofi.top_up","childId":"01930000-0000-4000-8000-000000000001","amountFils":500}')$$,
 '42501','reauthentication_required','Sensitive Parent changes require fresh provider assurance');

select * from finish();
rollback;
