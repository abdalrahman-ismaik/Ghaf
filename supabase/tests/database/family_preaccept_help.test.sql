begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();

insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous,raw_user_meta_data) values
 ('02110000-0000-4000-8000-000000000001','authenticated','authenticated','release-help-a@example.invalid',now(),false,'{}'),
 ('02110000-0000-4000-8000-000000000002','authenticated','authenticated','release-help-b@example.invalid',now(),false,'{}'),
 ('02110000-0000-4000-8000-000000000003','authenticated','authenticated',null,null,true,'{}');
insert into auth.sessions(id,user_id,created_at,updated_at) select
 ('02120000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
 ('02110000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,now(),now() from generate_series(1,3)n;
update public.pilot_access set status='approved' where user_id in
 ('02110000-0000-4000-8000-000000000001','02110000-0000-4000-8000-000000000002');
create temporary table help_test_state(key text primary key,value jsonb);
grant all on help_test_state to authenticated;
create function pg_temp.help_actor(n integer) returns void language plpgsql as $$
begin
 perform set_config('request.jwt.claim.sub','02110000-0000-4000-8000-'||lpad(n::text,12,'0'),true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub','02110000-0000-4000-8000-'||lpad(n::text,12,'0'),
  'session_id','02120000-0000-4000-8000-'||lpad(n::text,12,'0'),'role','authenticated')::text,true);
end; $$;
create function pg_temp.help_family() returns uuid language sql as $$
 select (value#>>'{snapshot,family,id}')::uuid from help_test_state where key='family'; $$;
create function pg_temp.help_child() returns uuid language sql as $$
 select (value#>>'{result,childId}')::uuid from help_test_state where key='child'; $$;
create function pg_temp.help_task_id() returns uuid language sql as $$
 select (value#>>'{result,taskId}')::uuid from help_test_state where key='task'; $$;
create function pg_temp.help_task() returns jsonb language sql as $$
 select t from jsonb_array_elements(public.ghaf_family_snapshot(pg_temp.help_family())->'tasks')t
 where t->>'id'=pg_temp.help_task_id()::text; $$;
create function pg_temp.help_action(kind text,extra jsonb default '{}') returns jsonb language sql as $$
 select public.ghaf_family_command(pg_temp.help_family(),gen_random_uuid(),
  jsonb_build_object('type',kind,'taskId',pg_temp.help_task_id(),'expectedRevision',(pg_temp.help_task()->>'revision')::bigint)||extra); $$;

set local role authenticated;
select pg_temp.help_actor(1);
insert into help_test_state values('family',public.ghaf_family_command(null,gen_random_uuid(),
 '{"type":"create_family","name":"Release help QA","displayName":"Synthetic Parent"}'));
insert into help_test_state values('child',public.ghaf_family_command(pg_temp.help_family(),gen_random_uuid(),
 '{"type":"add_child","displayName":"Synthetic Child","ageBand":"9_11"}'));
insert into help_test_state values('invite',public.ghaf_family_command(pg_temp.help_family(),gen_random_uuid(),
 jsonb_build_object('type','invite_child','childId',pg_temp.help_child())));
insert into help_test_state values('task',public.ghaf_family_command(pg_temp.help_family(),gen_random_uuid(),
 jsonb_build_object('type','assign_task','childId',pg_temp.help_child(),'catalogId','GI01')));
insert into help_test_state values('help',jsonb_build_object('type','request_help','taskId',pg_temp.help_task_id(),'expectedRevision',0));
select throws_ok($$select public.ghaf_family_command(pg_temp.help_family(),gen_random_uuid(),(select value from help_test_state where key='help'))$$,
 '42501','access_unavailable','A Parent cannot impersonate the Child help action');
select pg_temp.help_actor(2);
select throws_ok($$select public.ghaf_family_command(pg_temp.help_family(),gen_random_uuid(),(select value from help_test_state where key='help'))$$,
 '42501','family_unavailable','Another family cannot request help on this task');
select pg_temp.help_actor(3);
select lives_ok($$select public.ghaf_redeem_family_invite((select value#>>'{result,token}' from help_test_state where key='invite'),gen_random_uuid())$$,
 'Separate Child session is paired through the real RPC');
select lives_ok($$select public.ghaf_family_command(pg_temp.help_family(),'02130000-0000-4000-8000-000000000001',(select value from help_test_state where key='help'))$$,
 'Child may ask for help before accepting');
select is(pg_temp.help_task()->>'status','assigned','Help does not accept the task');
select is(pg_temp.help_task()->>'helpRequested','true','Help is persisted for Parent readback');
select is(pg_temp.help_task()->>'revision','1','First help command increments revision once');
select lives_ok($$select public.ghaf_family_command(pg_temp.help_family(),'02130000-0000-4000-8000-000000000001',(select value from help_test_state where key='help'))$$,
 'An exact network retry succeeds');
select is(pg_temp.help_task()->>'revision','1','Exact retry creates no second revision');
select throws_ok($$select public.ghaf_family_command(pg_temp.help_family(),'02130000-0000-4000-8000-000000000001',(select value||'{"expectedRevision":1}'::jsonb from help_test_state where key='help'))$$,
 'PT409','request_conflict','Changing an existing receipt payload remains denied');
select throws_ok($$select public.ghaf_family_command(pg_temp.help_family(),gen_random_uuid(),(select value from help_test_state where key='help'))$$,
 'PT409','request_conflict','Stale revisions remain denied');
select is(pg_temp.help_task()#>>'{template,displayedSeedAward}','8','Help preserves the agreed award');
select is(public.ghaf_family_snapshot()->'recognitions','[]'::jsonb,'Help grants no Seeds or recognition');
select is(public.ghaf_family_snapshot()->>'familyCanopyContributions','0','Help creates no canopy contribution');
select pg_temp.help_actor(1);
select is(pg_temp.help_task()->>'helpRequested','true','Parent independent readback sees the request');
select pg_temp.help_actor(3);
select lives_ok($$select pg_temp.help_action('accept_task')$$,'Child can accept afterward');
select lives_ok($$select pg_temp.help_action('request_help')$$,'Accepted-state help still works');
select lives_ok($$select pg_temp.help_action('start_task')$$,'Child can start afterward');
select lives_ok($$select pg_temp.help_action('request_help')$$,'In-progress help still works');
select pg_temp.help_action('set_step','{"stepId":"gi01-step-1","state":"done"}');
select pg_temp.help_action('set_step','{"stepId":"gi01-step-2","state":"done"}');
select pg_temp.help_action('set_step','{"stepId":"gi01-step-3","state":"done"}');
select pg_temp.help_action('submit_task');
select throws_ok($$select pg_temp.help_action('request_help')$$,'PT409','invalid_transition','Submitted tasks do not reopen through Help');
select is(pg_temp.help_task()->>'status','submitted','Denied late Help leaves state unchanged');
select pg_temp.help_actor(1);
select public.ghaf_family_command(pg_temp.help_family(),gen_random_uuid(),jsonb_build_object('type','revoke_child','childId',pg_temp.help_child()));
select pg_temp.help_actor(3);
select throws_ok($$select public.ghaf_family_command(pg_temp.help_family(),gen_random_uuid(),(select value from help_test_state where key='help'))$$,
 '42501','family_unavailable','Revoked Child loses help access even with an old receipt');
reset role;
select is((select count(*) from public.app_command_receipts where auth_user_id='02110000-0000-4000-8000-000000000003'
 and request_id='02130000-0000-4000-8000-000000000001'),1::bigint,'Exactly one help receipt is stored');
select ok(not has_function_privilege('authenticated','public.ghaf_family_core_command(uuid,uuid,jsonb)','EXECUTE')
 and not has_function_privilege('anon','public.ghaf_family_command(uuid,uuid,jsonb)','EXECUTE'),
 'Internal and unauthenticated execution remain denied');
select * from finish();
rollback;
