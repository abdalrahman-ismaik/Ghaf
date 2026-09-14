begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();

insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous,raw_user_meta_data) values
 ('02310000-0000-4000-8000-000000000001','authenticated','authenticated','growth-parent@example.invalid',now(),false,'{}'),
 ('02310000-0000-4000-8000-000000000002','authenticated','authenticated','growth-other@example.invalid',now(),false,'{}'),
 ('02310000-0000-4000-8000-000000000003','authenticated','authenticated',null,null,true,'{}');
insert into auth.sessions(id,user_id,created_at,updated_at) select
 ('02320000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('02310000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,now(),now() from generate_series(1,3)n;
update public.pilot_access set status='approved' where user_id in ('02310000-0000-4000-8000-000000000001','02310000-0000-4000-8000-000000000002');
create temporary table growth_test_state(key text primary key,value jsonb);
grant all on growth_test_state to authenticated;
create function pg_temp.actor(n integer,p_amr jsonb default null) returns void language plpgsql as $$
begin
 perform set_config('request.jwt.claim.sub','02310000-0000-4000-8000-'||lpad(n::text,12,'0'),true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub','02310000-0000-4000-8000-'||lpad(n::text,12,'0'),
  'session_id','02320000-0000-4000-8000-'||lpad(n::text,12,'0'),'role','authenticated','iat',extract(epoch from clock_timestamp()),'amr',p_amr)::text,true);
end; $$;
create function pg_temp.fresh_parent() returns void language sql as $$ select pg_temp.actor(1,jsonb_build_array(jsonb_build_object('method','password','timestamp',floor(extract(epoch from clock_timestamp()))))); $$;
create function pg_temp.family_id() returns uuid language sql as $$ select (value#>>'{snapshot,family,id}')::uuid from growth_test_state where key='family'; $$;
create function pg_temp.child_id() returns uuid language sql as $$ select (value#>>'{result,childId}')::uuid from growth_test_state where key='child'; $$;
create function pg_temp.plan_id() returns uuid language sql as $$ select (value#>>'{snapshot,rewards,0,id}')::uuid from growth_test_state where key='reward'; $$;
create function pg_temp.growth() returns jsonb language sql as $$ select public.ghaf_family_growth(pg_temp.family_id()); $$;
create function pg_temp.reward_command(p_type text default 'reward.create') returns jsonb language sql as $$
 select jsonb_build_object('type',p_type,'childId',pg_temp.child_id(),'month','2026-09','promise',jsonb_build_object('kind','experience','label',jsonb_build_object('ar','نشاط عائلي','en','Choose a family activity')),
  'milestone',jsonb_build_object('kind','eligible_seed_delta','requiredSeedDelta',12)); $$;
create function pg_temp.command(p_command jsonb,p_request uuid default gen_random_uuid()) returns jsonb language sql as $$ select public.ghaf_family_growth_command(pg_temp.family_id(),p_request,p_command); $$;
create function pg_temp.task_action(p_id uuid,p_type text,p_extra jsonb default '{}') returns jsonb language plpgsql as $$
declare v_task jsonb;
begin
 select t into v_task from jsonb_array_elements(public.ghaf_family_snapshot(pg_temp.family_id())->'tasks')t where t->>'id'=p_id::text;
 return public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type',p_type,'taskId',p_id,'expectedRevision',(v_task->>'revision')::bigint)||p_extra);
end; $$;
create function pg_temp.confirm(p_id uuid) returns jsonb language plpgsql as $$
declare v_step jsonb;
begin
 perform pg_temp.actor(3); perform pg_temp.task_action(p_id,'accept_task'); perform pg_temp.task_action(p_id,'start_task');
 for v_step in select s from jsonb_array_elements(public.ghaf_family_snapshot(pg_temp.family_id())->'tasks')t,
  jsonb_array_elements(coalesce(t#>'{template,catalogExecution,steps}','[]'))s where t->>'id'=p_id::text loop
  perform pg_temp.task_action(p_id,'set_step',jsonb_build_object('stepId',v_step->>'id','state','done'));
 end loop;
 perform pg_temp.task_action(p_id,'submit_task');
 perform pg_temp.fresh_parent(); perform pg_temp.task_action(p_id,'praise_task','{"praise":"You sorted carefully and asked for help."}');
 return pg_temp.task_action(p_id,'recognize_task');
end; $$;

select ok((select bool_and(relrowsecurity) from pg_class where oid in ('public.app_badge_awards'::regclass,'public.app_reward_versions'::regclass,'public.app_league_weeks'::regclass,'public.app_league_participants'::regclass,'public.app_league_leaves'::regclass,'public.app_league_encouragements'::regclass)), 'Every growth authority enables RLS');
select ok(not has_table_privilege('authenticated','public.app_badge_awards','INSERT') and not has_table_privilege('authenticated','public.app_reward_versions','UPDATE') and not has_table_privilege('authenticated','public.app_league_leaves','SELECT'),'Clients cannot forge awards, edit promises or read raw sibling Leaf references');
select ok(not has_function_privilege('authenticated','public.ghaf_growth_evaluate(uuid,uuid,timestamptz)','EXECUTE') and not has_function_privilege('anon','public.ghaf_family_growth(uuid)','EXECUTE'),'Internal evidence evaluator and unauthenticated snapshots have no client grants');
set local role authenticated;
select pg_temp.actor(1);
insert into growth_test_state values('family',public.ghaf_family_command(null,gen_random_uuid(),'{"type":"create_family","name":"Growth test family","displayName":"Test Parent"}'));
insert into growth_test_state values('child',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),'{"type":"add_child","displayName":"Test Child","ageBand":"9_11"}'));
insert into growth_test_state values('other_child',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),'{"type":"add_child","displayName":"Sibling","ageBand":"9_11"}'));
select is(pg_temp.growth()#>>'{children,0,lifetimeSeeds}','0','New Child starts at zero Seeds');
select is(pg_temp.growth()#>'{children,0,badges}','[]'::jsonb,'New Child has no fabricated badge');
select is(pg_temp.growth()->'rewards','[]'::jsonb,'No sample promise imported');
select is(pg_temp.growth()->'league','null'::jsonb,'No automatic League or nominees');
select throws_ok($$select pg_temp.command(pg_temp.reward_command()||'{"milestone":{"kind":"landscape_stage","landscapeId":"ghaf","targetStage":"shoot"}}')$$,'PT400','invalid_command','New promise cannot target a landscape without approved reward evidence');
select throws_ok($$select pg_temp.command(pg_temp.reward_command()||'{"milestone":{"kind":"landscapes_at_stage","requiredCount":2,"targetStage":"shoot"}}')$$,'PT400','invalid_command','New multi-landscape promise cannot invent a second eligible track');
insert into growth_test_state values('invite',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','invite_child','childId',pg_temp.child_id())));
select pg_temp.actor(3);
select public.ghaf_redeem_family_invite((select value#>>'{result,token}' from growth_test_state where key='invite'),gen_random_uuid()) is not null;
select is(jsonb_array_length(pg_temp.growth()->'children'),1,'Child sees only own private growth profile');
select throws_ok($$select pg_temp.command(pg_temp.reward_command())$$,'42501','access_unavailable','Child cannot grant themselves a private promise');
select pg_temp.actor(2);
select throws_ok($$select pg_temp.growth()$$,'42501','family_unavailable','Other approved family cannot read growth');
select throws_ok($$select pg_temp.command(pg_temp.reward_command())$$,'42501','family_unavailable','Other approved family cannot mutate growth');
select pg_temp.actor(1);
insert into growth_test_state values('reward',pg_temp.command(pg_temp.reward_command(),'02330000-0000-4000-8000-000000000001'));
select is(pg_temp.growth()#>>'{rewards,0,lifecycle}','promised','Parent nonmonetary promise starts promised');
select is(pg_temp.growth()#>>'{rewards,0,eligibleSeeds}','0','Promise starts without fixture allowance');
select is(jsonb_array_length(pg_temp.command(pg_temp.reward_command(),'02330000-0000-4000-8000-000000000001')#>'{snapshot,rewards}'),1,'Exact uncertain replay creates one promise');
select throws_ok($$select pg_temp.command(pg_temp.reward_command()||'{"month":"2026-10"}','02330000-0000-4000-8000-000000000001')$$,'PT409','request_conflict','Changed retry cannot reuse request UUID');
select throws_ok($$select pg_temp.command(pg_temp.reward_command()||'{"promise":{"kind":"money","label":{"ar":"هدية","en":"Gift"},"currency":"AED","amountMinor":100}}')$$,'PT428','reauth_required','Fresh JWT iat without password AMR does not authorize monetary promise');
select pg_temp.actor(1,jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from clock_timestamp())-121)));
select throws_ok($$select pg_temp.command(pg_temp.reward_command()||'{"promise":{"kind":"money","label":{"ar":"هدية","en":"Gift"},"currency":"AED","amountMinor":100}}')$$,'PT428','reauth_required','Stale password AMR fails');
select pg_temp.actor(1,jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from clock_timestamp())+60)));
select throws_ok($$select pg_temp.command(pg_temp.reward_command()||'{"promise":{"kind":"money","label":{"ar":"هدية","en":"Gift"},"currency":"AED","amountMinor":100}}')$$,'PT428','reauth_required','Future password AMR fails');
select pg_temp.actor(1,jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from clock_timestamp())::text)));
select throws_ok($$select pg_temp.command(pg_temp.reward_command()||'{"promise":{"kind":"money","label":{"ar":"هدية","en":"Gift"},"currency":"AED","amountMinor":100}}')$$,'PT428','reauth_required','String AMR timestamp is not signed numeric evidence');
select pg_temp.fresh_parent();
select throws_ok($$select pg_temp.command(pg_temp.reward_command()||'{"promise":{"kind":"gift","label":{"ar":7,"en":"Gift"}}}')$$,'PT400','invalid_command','Numeric bilingual label is rejected at authoritative boundary');
select throws_ok($$select pg_temp.command((pg_temp.reward_command('reward.revise')-'childId')||jsonb_build_object('planId',pg_temp.plan_id()))$$,'PT400','invalid_command','Missing expectedVersion cannot bypass concurrency');
select throws_ok($$select pg_temp.command((pg_temp.reward_command('reward.revise')-'childId')||jsonb_build_object('planId',pg_temp.plan_id(),'expectedVersion',null))$$,'PT400','invalid_command','Null expectedVersion cannot bypass concurrency');
select throws_ok($$select pg_temp.command((pg_temp.reward_command('reward.revise')-'childId')||jsonb_build_object('planId',pg_temp.plan_id(),'expectedVersion','1'))$$,'PT400','invalid_command','String expectedVersion cannot bypass concurrency');
select throws_ok($$select pg_temp.command(jsonb_build_object('type','reward.give','planId',pg_temp.plan_id()))$$,'PT400','invalid_command','Give also requires explicit version');

insert into growth_test_state select 'task_'||n,public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_id(),'catalogId','task_recycling_p0_v1')) from generate_series(1,6)n;
insert into growth_test_state values('nomination',jsonb_build_object('type','league.nominate','childId',pg_temp.child_id(),'expectedRevision',0,'nickname',jsonb_build_object('ar','غصن','en','Branch'),'treeAvatarToken','ghaf_leaf','taskIds',(select jsonb_agg(value#>>'{result,taskId}' order by key) from growth_test_state where key in ('task_1','task_2','task_3','task_4','task_5'))));
select throws_ok($$select pg_temp.command((select value from growth_test_state where key='nomination')||'{"nickname":{"ar":7,"en":"Branch"}}')$$,'PT400','invalid_command','Numeric League nickname rejected');
select throws_ok($$select pg_temp.command((select value from growth_test_state where key='nomination')||'{"taskIds":[]}')$$,'PT400','invalid_command','Exactly five approved Leaves required');
select lives_ok($$select pg_temp.command((select value from growth_test_state where key='nomination'))$$,'Parent explicitly nominates five actual approved occurrences');
select is(pg_temp.growth()#>>'{league,rows,0,score}','0','Nomination itself never awards points');
select is(pg_temp.growth()#>>'{league,cooperativeGoal}','5','Cooperative goal derives from actual opt-in participants');
select lives_ok($$select pg_temp.confirm((select (value#>>'{result,taskId}')::uuid from growth_test_state where key='task_1'))$$,'Actual paired Child submission and Parent recognition updates growth');
select is(pg_temp.growth()#>>'{children,0,lifetimeSeeds}','12','One canonical recognition adds exactly12 permanent Seeds');
select is(pg_temp.growth()#>>'{children,0,sortingCredits}','1','One occurrence creates one approved sorting credit');
select is(jsonb_array_length(pg_temp.growth()#>'{children,0,badges}'),2,'First qualifying receipt creates Seed Start and Sorting Bud');
select is(pg_temp.growth()#>>'{rewards,0,lifecycle}','unlocked','Eligible recognition unlocks private promise');
select is(pg_temp.growth()#>>'{league,rows,0,score}','20','Confirmed nominated Leaf adds20 points');
select is(pg_temp.growth()#>>'{league,cooperativeConfirmedCount}','1','One Leaf contributes once to cooperative count');
insert into growth_test_state values('stage_reward',pg_temp.command(pg_temp.reward_command()||'{"milestone":{"kind":"landscape_stage","landscapeId":"mangrove","targetStage":"shoot"}}'));
select is((select r#>>'{eligibleLandscapeBaseline,mangrove}' from jsonb_array_elements(pg_temp.growth()->'rewards')r where r#>>'{milestone,kind}'='landscape_stage'),'12','Stage promise preserves exact eligible pre-promise baseline');
select is((select r#>>'{eligibleLandscapeSeeds,mangrove}' from jsonb_array_elements(pg_temp.growth()->'rewards')r where r#>>'{milestone,kind}'='landscape_stage'),'0','Historical eligible Seeds are not counted as new promise delta');
select throws_ok($$select pg_temp.command((pg_temp.reward_command('reward.revise')-'childId')||jsonb_build_object('planId',pg_temp.plan_id(),'expectedVersion',1))$$,'PT409','invalid_transition','Unlocked promise cannot be weakened');
select pg_temp.actor(3);
select is(pg_temp.growth()#>'{league,nominations}','[]'::jsonb,'Child League snapshot cannot expose sibling task references');
select is(jsonb_array_length(pg_temp.growth()->'rewards'),2,'Own Child can read only their two private promises');
select throws_ok($$select pg_temp.command(jsonb_build_object('type','reward.give','planId',pg_temp.plan_id(),'expectedVersion',1))$$,'42501','access_unavailable','Child cannot authorize their own reward');
select pg_temp.fresh_parent();
select lives_ok($$select pg_temp.command(jsonb_build_object('type','reward.give','planId',pg_temp.plan_id(),'expectedVersion',1),'02330000-0000-4000-8000-000000000002')$$,'Fresh Parent marks externally fulfilled promise given');
select is(pg_temp.growth()#>>'{rewards,0,lifecycle}','given','Given is persisted without money transfer');
select is(pg_temp.command(jsonb_build_object('type','reward.give','planId',pg_temp.plan_id(),'expectedVersion',1),'02330000-0000-4000-8000-000000000002')#>>'{snapshot,rewards,0,lifecycle}','given','Given retry is idempotent');
select lives_ok($$select pg_temp.confirm((value#>>'{result,taskId}')::uuid) from growth_test_state where key in ('task_2','task_3','task_4','task_5') order by key$$,'Remaining nominated activities execute through real task lifecycle');
select is(pg_temp.growth()#>>'{league,rows,0,score}','100','Five Leaves cap score100');
select is((select r->>'lifecycle' from jsonb_array_elements(pg_temp.growth()->'rewards')r where r#>>'{milestone,kind}'='landscape_stage'),'unlocked','A future12-Seed occurrence crossing20 unlocks the stage promise');
select lives_ok($$select pg_temp.confirm((select (value#>>'{result,taskId}')::uuid from growth_test_state where key='task_6'))$$,'Extra eligible task still earns permanent growth');
select is(pg_temp.growth()#>>'{children,0,lifetimeSeeds}','72','Six actual occurrences permanently earn72Seeds');
select is(pg_temp.growth()#>>'{league,rows,0,score}','100','Extra task cannot improve League rank score');
select is(pg_temp.growth()#>>'{league,cooperativeConfirmedCount}','5','Extra task cannot add cooperative Leaf credit');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','league.rest','childId',pg_temp.child_id(),'expectedRevision',1,'rest',true))$$,'Parent can choose a private rest week');
select is(pg_temp.growth()#>'{league,rows}','[]'::jsonb,'Rest participant is omitted from ranking');
select is(pg_temp.growth()#>>'{children,0,lifetimeSeeds}','72','Rest never deducts permanent Seeds');
select is(pg_temp.growth()#>>'{rewards,0,lifecycle}','given','Rest never reverses fulfilled promise');
select throws_ok($$select pg_temp.command(pg_temp.reward_command()||'{"milestone":{"kind":"landscape_stage","landscapeId":"mangrove","targetStage":"shoot"}}')$$,'PT400','invalid_command','New promise must choose a future stage rather than an already-crossed target');
insert into growth_test_state values('unmapped_task',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_id(),'catalogId','GI01')));
select lives_ok($$select pg_temp.confirm((select (value#>>'{result,taskId}')::uuid from growth_test_state where key='unmapped_task'))$$,'Another catalog activity executes with its intended steps');
select is(pg_temp.growth()#>>'{children,0,lifetimeSeeds}','80','Other canonical task earns only its own fixed8-Seed award');
select is(pg_temp.growth()#>>'{children,0,sortingCredits}','6','Unmapped activity cannot fabricate a sorting mastery credit');
select is(pg_temp.growth()#>>'{rewards,0,eligibleSeeds}','72','Unknown reward eligibility contributes zero even when activity earns ordinary Seeds');
reset role;
select is((select count(*) from public.app_recognitions where family_id=pg_temp.family_id()),7::bigint,'Progress has seven immutable source receipts');
select is((select count(*) from public.app_badge_awards where child_id=pg_temp.child_id()),4::bigint,'Permanent award rows remain unique across repeated evaluations');
select is((select count(*) from public.app_league_leaves where family_id=pg_temp.family_id() and recognition_id is not null),5::bigint,'Rest preserves immutable Leaf evidence');
select ok(public.ghaf_growth_reward_crossed('{"kind":"landscape_stage","landscapeId":"mangrove","targetStage":"shoot"}',
 '{"ghaf":0,"samar":0,"sidr":0,"date_palm":0,"mangrove":12}','{"ghaf":0,"samar":0,"sidr":0,"date_palm":0,"mangrove":12}'),'Eligible12-to24 transition crosses shoot20');
select ok(not public.ghaf_growth_reward_crossed('{"kind":"landscape_stage","landscapeId":"mangrove","targetStage":"shoot"}',
 '{"ghaf":0,"samar":0,"sidr":0,"date_palm":0,"mangrove":12}','{"ghaf":0,"samar":0,"sidr":0,"date_palm":0,"mangrove":24}'),'Already-crossed shoot cannot unlock a later promise');
select ok(not public.ghaf_growth_reward_crossed('{"kind":"landscapes_at_stage","targetStage":"shoot","requiredCount":2}',
 '{"ghaf":0,"samar":0,"sidr":0,"date_palm":0,"mangrove":12}','{"ghaf":24,"samar":0,"sidr":0,"date_palm":0,"mangrove":12}'),'Multiple landscape promise counts future eligible crossings only');
select * from finish();
rollback;
