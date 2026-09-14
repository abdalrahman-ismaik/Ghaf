begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous,raw_user_meta_data) values
 ('02810000-0000-4000-8000-000000000001','authenticated','authenticated','growth-learning-parent@example.invalid',now(),false,'{}'),
 ('02810000-0000-4000-8000-000000000002','authenticated','authenticated',null,null,true,'{}');
insert into auth.sessions(id,user_id,created_at,updated_at) select
 ('02820000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('02810000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,now(),now() from generate_series(1,2)n;
update public.pilot_access set status='approved' where user_id='02810000-0000-4000-8000-000000000001';
create temporary table learning_growth_state(key text primary key,value jsonb);
grant all on learning_growth_state to authenticated;
create function pg_temp.learning_actor(n integer) returns void language plpgsql as $$
begin
 perform set_config('request.jwt.claim.sub','02810000-0000-4000-8000-'||lpad(n::text,12,'0'),true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub','02810000-0000-4000-8000-'||lpad(n::text,12,'0'),
  'session_id','02820000-0000-4000-8000-'||lpad(n::text,12,'0'),'role','authenticated')::text,true);
end; $$;
create function pg_temp.family_id() returns uuid language sql as $$ select (value#>>'{snapshot,family,id}')::uuid from learning_growth_state where key='family'; $$;
create function pg_temp.child_id() returns uuid language sql as $$ select (value#>>'{result,childId}')::uuid from learning_growth_state where key='child'; $$;
create function pg_temp.growth() returns jsonb language sql as $$ select public.ghaf_family_growth(pg_temp.family_id()); $$;
create function pg_temp.learning(p_command jsonb,p_request uuid default gen_random_uuid()) returns jsonb language sql as $$
 select public.ghaf_family_document_command(pg_temp.family_id(),p_request,p_command); $$;
create function pg_temp.task_action(p_id uuid,p_type text,p_extra jsonb default '{}') returns void language plpgsql as $$
declare v_task jsonb;
begin
 select t into v_task from jsonb_array_elements(public.ghaf_family_snapshot(pg_temp.family_id())->'tasks')t where t->>'id'=p_id::text;
 perform public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type',p_type,'taskId',p_id,'expectedRevision',(v_task->>'revision')::bigint)||p_extra);
end; $$;
create function pg_temp.perform_activity() returns void language plpgsql as $$
declare v_task uuid;
begin
 perform pg_temp.learning_actor(1);
 v_task:=(public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_id(),'catalogId','task_recycling_p0_v1'))#>>'{result,taskId}')::uuid;
 perform pg_temp.learning_actor(2);
 perform pg_temp.task_action(v_task,'accept_task'); perform pg_temp.task_action(v_task,'start_task'); perform pg_temp.task_action(v_task,'submit_task');
 perform pg_temp.learning_actor(1);
 perform pg_temp.task_action(v_task,'praise_task','{"praise":"You sorted carefully and asked for help."}'); perform pg_temp.task_action(v_task,'recognize_task');
end; $$;
set local role authenticated;
select pg_temp.learning_actor(1);
insert into learning_growth_state values('family',public.ghaf_family_command(null,gen_random_uuid(),'{"type":"create_family","name":"Learning test family","displayName":"Test Parent"}'));
insert into learning_growth_state values('child',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),'{"type":"add_child","displayName":"Test Child","ageBand":"9_11"}'));
insert into learning_growth_state values('invite',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','invite_child','childId',pg_temp.child_id())));
select pg_temp.learning_actor(2);
select public.ghaf_redeem_family_invite((select value#>>'{result,token}' from learning_growth_state where key='invite'),gen_random_uuid()) is not null;
select throws_ok($$select pg_temp.learning('{"type":"learning.start","route":"accessible"}')$$,'22023','invalid_transition','Fresh Child cannot manufacture132-Seed learning unlock');
select lives_ok($$select pg_temp.perform_activity() from generate_series(1,11)$$,'Eleven actual assigned Child submissions and Parent confirmations create the required evidence');
select is(pg_temp.growth()#>>'{children,0,lifetimeSeeds}','132','Threshold comes from eleven immutable12-Seed receipts');
select is(pg_temp.growth()#>>'{children,0,coastCareCredits}','11','Named coast-care evidence is retained independently of Seed thresholds');
select is((select count(*) from jsonb_array_elements(pg_temp.growth()#>'{children,0,badges}')b where b->>'badgeId'='badge.habitat.mangrove_care.v1'),0::bigint,'Threshold and task evidence alone cannot grant learning badge');
insert into learning_growth_state values('reward',public.ghaf_family_growth_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','reward.create','childId',pg_temp.child_id(),'month','2026-09',
 'promise',jsonb_build_object('kind','experience','label',jsonb_build_object('ar','نشاط عائلي','en','Choose a family activity')),'milestone',jsonb_build_object('kind','eligible_seed_delta','requiredSeedDelta',12))));
select throws_ok($$select pg_temp.learning('{"type":"learning.complete","route":"accessible"}')$$,'42501','access_unavailable','Parent cannot impersonate Child learning completion');
select pg_temp.learning_actor(2);
select lives_ok($$select pg_temp.learning('{"type":"learning.start","route":"accessible"}')$$,'Verified Child can choose accessible route at132');
select throws_ok($$select pg_temp.learning('{"type":"learning.complete","route":"accessible"}')$$,'22023','invalid_transition','Starting route does not complete learning');
select lives_ok($$select pg_temp.learning('{"type":"learning.step","route":"accessible","stepId":"accessible_section_1"}')$$,'First actual finite section records');
select lives_ok($$select pg_temp.learning('{"type":"learning.step","route":"accessible","stepId":"accessible_section_2"}')$$,'Second actual finite section records');
select lives_ok($$select pg_temp.learning('{"type":"learning.check","route":"accessible","optionId":"visit_or_task_reward"}')$$,'Incorrect answer allows retry');
select throws_ok($$select pg_temp.learning('{"type":"learning.complete","route":"accessible"}')$$,'22023','invalid_transition','Incorrect answer grants no learning receipt or badge');
select lives_ok($$select pg_temp.learning('{"type":"learning.check","route":"accessible","optionId":"habitat_support_and_care"}')$$,'Exact package answer satisfies completion criterion');
select lives_ok($$select pg_temp.learning('{"type":"learning.complete","route":"accessible"}','02830000-0000-4000-8000-000000000001')$$,'Real document command triggers permanent MangroveCare award');
select is((select count(*) from jsonb_array_elements(pg_temp.growth()#>'{children,0,badges}')b where b->>'badgeId'='badge.habitat.mangrove_care.v1'),1::bigint,'Accessible completion receives one exact badge');
select is(pg_temp.growth()#>'{children,0,learningCompleted}','["learning.mangrove_roots.v1"]'::jsonb,'Private profile exposes actual completed package');
insert into learning_growth_state select 'badge',b from jsonb_array_elements(pg_temp.growth()#>'{children,0,badges}')b where b->>'badgeId'='badge.habitat.mangrove_care.v1';
select lives_ok($$select pg_temp.learning('{"type":"learning.complete","route":"accessible"}','02830000-0000-4000-8000-000000000001')$$,'Uncertain request replay is idempotent');
select lives_ok($$select pg_temp.learning('{"type":"learning.complete","route":"story"}')$$,'Alternate route cannot duplicate the package credit');
select is((select b from jsonb_array_elements(pg_temp.growth()#>'{children,0,badges}')b where b->>'badgeId'='badge.habitat.mangrove_care.v1'),(select value from learning_growth_state where key='badge'),'Badge identity and original award timestamp remain unchanged');
select is(pg_temp.growth()#>>'{children,0,lifetimeSeeds}','132','Learning and its retries create zero additional Seeds');
select is(pg_temp.growth()#>>'{children,0,sortingCredits}','11','Learning does not manufacture task mastery credit');
select is(public.ghaf_family_snapshot(pg_temp.family_id())->>'familyCanopyContributions','11','Learning creates no garden/canopy contribution');
select is(pg_temp.growth()#>>'{rewards,0,eligibleSeeds}','0','Learning creates no private FamilyReward eligibility');
select is(pg_temp.growth()#>>'{rewards,0,lifecycle}','promised','Learning cannot unlock a Parent promise');
select is(pg_temp.growth()->'league','null'::jsonb,'Learning creates no League nominees or points');
reset role;
select is((select count(*) from public.app_badge_awards where child_id=pg_temp.child_id() and badge_id='badge.habitat.mangrove_care.v1'),1::bigint,'Authority contains one permanent private badge row');
select is((select a.evidence->>'learningDocumentId' from public.app_badge_awards a where child_id=pg_temp.child_id() and badge_id='badge.habitat.mangrove_care.v1'),
 (select d.id::text from public.app_family_documents d where child_id=pg_temp.child_id() and kind='learning'),'Badge evidence binds the exact persisted learning document');
select is((select count(*) from public.app_recognitions where child_id=pg_temp.child_id()),11::bigint,'Only actual task receipts exist after learning retries');
select * from finish();
rollback;
