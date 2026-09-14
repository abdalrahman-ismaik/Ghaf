begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();

select is((select count(*) from public.app_task_catalog),25::bigint,'Exactly 24 catalog entries plus original P0 are reference data');
select ok((select bool_and(relrowsecurity) from pg_class where oid in (
  'public.app_families'::regclass,'public.app_children'::regclass,'public.app_family_members'::regclass,
  'public.app_pairing_invites'::regclass,'public.app_tasks'::regclass,'public.app_recognitions'::regclass,
  'public.app_memories'::regclass,'public.app_command_receipts'::regclass)), 'All family authorities have RLS');
select ok(not has_table_privilege('authenticated','public.app_tasks','INSERT')
  and not has_table_privilege('authenticated','public.app_recognitions','UPDATE')
  and not has_table_privilege('authenticated','public.app_pairing_invites','SELECT')
  and not has_function_privilege('anon','public.ghaf_family_command(uuid,uuid,jsonb)','EXECUTE'),
  'Direct task/award mutation, token reads and unauthenticated commands have no grants');

insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous,raw_user_meta_data) values
 ('02010000-0000-4000-8000-000000000001','authenticated','authenticated','family-a@example.invalid',now(),false,'{}'),
 ('02010000-0000-4000-8000-000000000002','authenticated','authenticated','family-b@example.invalid',now(),false,'{}'),
 ('02010000-0000-4000-8000-000000000003','authenticated','authenticated',null,null,true,'{"role":"parent"}'),
 ('02010000-0000-4000-8000-000000000004','authenticated','authenticated',null,null,true,'{}'),
 ('02010000-0000-4000-8000-000000000005','authenticated','authenticated',null,null,true,'{}'),
 ('02010000-0000-4000-8000-000000000006','authenticated','authenticated','pending@example.invalid',now(),false,'{"status":"approved"}');
insert into auth.sessions(id,user_id,created_at,updated_at) select
  ('02020000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
  ('02010000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,now(),now() from generate_series(1,6)n;
update public.pilot_access set status='approved' where user_id in
 ('02010000-0000-4000-8000-000000000001','02010000-0000-4000-8000-000000000002');
insert into public.account_profiles(user_id,display_name) values
 ('02010000-0000-4000-8000-000000000001','Synthetic Parent A'),
 ('02010000-0000-4000-8000-000000000002','Synthetic Parent B');
insert into public.account_workspaces(user_id,family_name) values
 ('02010000-0000-4000-8000-000000000001','Existing private planning data');

create temporary table family_test_state(key text primary key,value jsonb);
grant all on family_test_state to authenticated;
create function pg_temp.actor(n integer) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub','02010000-0000-4000-8000-'||lpad(n::text,12,'0'),true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub','02010000-0000-4000-8000-'||lpad(n::text,12,'0'),
    'session_id','02020000-0000-4000-8000-'||lpad(n::text,12,'0'),'role','authenticated')::text,true);
end; $$;
create function pg_temp.family_a() returns uuid language sql as $$
  select (value#>>'{snapshot,family,id}')::uuid from family_test_state where key='family_a'; $$;
create function pg_temp.child_a() returns uuid language sql as $$
  select (value#>>'{result,childId}')::uuid from family_test_state where key='child_a'; $$;
create function pg_temp.task_a() returns uuid language sql as $$
  select (value#>>'{result,taskId}')::uuid from family_test_state where key='task_a'; $$;
create function pg_temp.task_action(p_type text,p_extra jsonb default '{}') returns jsonb language plpgsql as $$
declare snapshot jsonb; task jsonb;
begin
 snapshot:=public.ghaf_family_snapshot(pg_temp.family_a());
 select t into task from jsonb_array_elements(snapshot->'tasks')t where t->>'id'=pg_temp.task_a()::text;
 return public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),
  jsonb_build_object('type',p_type,'taskId',pg_temp.task_a(),'expectedRevision',(task->>'revision')::bigint)||p_extra);
end; $$;

set local role authenticated;
select pg_temp.actor(1);
select is(public.ghaf_family_identity()->>'familyId',null,'Fresh account has no family');
select is(public.ghaf_family_snapshot()->'children','[]'::jsonb,'Fresh account has no demo Children');
select is(public.ghaf_family_snapshot()->'recognitions','[]'::jsonb,'Fresh account has zero earned history');
insert into family_test_state values('family_a',public.ghaf_family_command(null,'02030000-0000-4000-8000-000000000001','{"type":"create_family","name":"Actual family A"}'));
select is(public.ghaf_family_command(null,'02030000-0000-4000-8000-000000000001','{"type":"create_family","name":"Actual family A"}')#>>'{snapshot,family,id}',pg_temp.family_a()::text,'Create retry returns the same family');
select is((select family_name from public.account_workspaces),'Existing private planning data','Existing planning content is preserved without import');
select is(public.ghaf_family_snapshot()->'tasks','[]'::jsonb,'Creating a family assigns no reference task');
select is(jsonb_array_length(public.ghaf_family_snapshot()->'members'),1,'Fresh family contains only its founding adult');
select throws_ok($$select public.ghaf_family_command(null,'02030000-0000-4000-8000-000000000001','{"type":"create_family","name":"Changed"}')$$,
 'PT409','request_conflict','A changed idempotency payload fails');
insert into family_test_state values('child_a',public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),'{"type":"add_child","displayName":"Actual Child A","ageBand":"9_11"}'));
insert into family_test_state values('child_b',public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),'{"type":"add_child","displayName":"Actual Child B","ageBand":"9_11"}'));
insert into family_test_state values('invite_a',public.ghaf_family_command(pg_temp.family_a(),'02030000-0000-4000-8000-000000000002',jsonb_build_object('type','invite_child','childId',pg_temp.child_a())));
insert into family_test_state values('invite_b',public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','invite_child','childId',(select value#>>'{result,childId}' from family_test_state where key='child_b'))));
select is(public.ghaf_family_command(pg_temp.family_a(),'02030000-0000-4000-8000-000000000002',jsonb_build_object('type','invite_child','childId',pg_temp.child_a()))#>>'{result,tokenUnavailable}','true','Token replay never stores or returns plaintext again');
insert into family_test_state values('task_a',public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_a(),'catalogId','GI01')));
select throws_ok($$select public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_a(),'catalogId','GI01','content',jsonb_build_object('displayedSeedAward',100)))$$,
 'PT400','invalid_command','Copy customization cannot change award authority');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_a(),'catalogId','GI01','content',jsonb_build_object('positiveAction',jsonb_build_object('ar','عمل مختلف','en','A different activity'))))$$,
 'PT400','invalid_command','Arbitrary action wording cannot inherit a Green activity award');
select throws_ok($$select pg_temp.task_action('recognize_task')$$,'PT409','invalid_transition','Parent cannot award an unsubmitted task');

select pg_temp.actor(2);
select is(public.ghaf_family_snapshot()->'tasks','[]'::jsonb,'Unrelated approved account starts empty');
select is((select count(*) from public.app_families),0::bigint,'RLS hides another family');
select throws_ok($$select public.ghaf_family_snapshot(pg_temp.family_a())$$,'42501','family_unavailable','Forged family UUID does not reveal data');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),'{"type":"rename_family","name":"Attack"}')$$,'42501','family_unavailable','Another family cannot mutate this family');
insert into family_test_state values('family_b',public.ghaf_family_command(null,gen_random_uuid(),'{"type":"create_family","name":"Actual family B"}'));

select pg_temp.actor(3);
select throws_ok($$select public.ghaf_family_identity()$$,'42501','access_unavailable','Anonymous Auth alone and forged Parent metadata confer no access');
select throws_ok($$select public.ghaf_family_command(null,gen_random_uuid(),'{"type":"create_family","name":"Forged parent"}')$$,'42501','access_unavailable','Child cannot become Parent by command');
select lives_ok($$select public.ghaf_redeem_family_invite((select value#>>'{result,token}' from family_test_state where key='invite_a'),'02030000-0000-4000-8000-000000000003')$$,'Child redeems high-entropy Parent token with its own Auth session');
select lives_ok($$select public.ghaf_redeem_family_invite((select value#>>'{result,token}' from family_test_state where key='invite_a'),'02030000-0000-4000-8000-000000000003')$$,'Same committed enrollment request is safely retryable');
select is(public.ghaf_family_identity()->>'childId',pg_temp.child_a()::text,'Managed Child UUID is distinct from provider identity');
select is(jsonb_array_length(public.ghaf_family_snapshot()->'children'),1,'Child sees only its own profile');
select is(public.ghaf_family_snapshot()->'members','[]'::jsonb,'Child cannot enumerate provider member identities');
select throws_ok($$select pg_temp.task_action('recognize_task')$$,'42501','access_unavailable','Child cannot grant Seeds');
select lives_ok($$select pg_temp.task_action('accept_task')$$,'Child accepts its actual assignment');
select lives_ok($$select pg_temp.task_action('start_task')$$,'Child starts its accepted task');
select throws_ok($$select pg_temp.task_action('submit_task')$$,'PT409','invalid_transition','Incomplete action steps block submission');
select throws_ok($$select pg_temp.task_action('set_step','{"stepId":"gi01-step-2","state":"skipped"}')$$,'PT400','invalid_command','Mandatory action cannot be skipped');
select lives_ok($$select pg_temp.task_action('request_help')$$,'Permitted help is recorded without changing the award');
select lives_ok($$select pg_temp.task_action('set_step','{"stepId":"gi01-step-1","state":"done"}')$$,'Task-specific first step persists');
select lives_ok($$select pg_temp.task_action('set_step','{"stepId":"gi01-step-2","state":"done"}')$$,'Task-specific second step persists');
select lives_ok($$select pg_temp.task_action('set_step','{"stepId":"gi01-step-3","state":"done"}')$$,'Task-specific final step persists');
select lives_ok($$select pg_temp.task_action('submit_task')$$,'Child submits actual completion');

select pg_temp.actor(4);
select is(public.ghaf_redeem_family_invite((select value#>>'{result,token}' from family_test_state where key='invite_a'),gen_random_uuid())->>'code','invalid_invite','Another session cannot reuse consumed token');
select lives_ok($$select public.ghaf_redeem_family_invite((select value#>>'{result,token}' from family_test_state where key='invite_b'),gen_random_uuid())$$,'Sibling redeems only its own token');
select is(public.ghaf_family_snapshot()->'tasks','[]'::jsonb,'Sibling task details remain private');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','start_task','taskId',pg_temp.task_a(),'expectedRevision',0))$$,'42501','family_unavailable','Sibling cannot act on another Child task');

select pg_temp.actor(1);
select throws_ok($$select pg_temp.task_action('edit_task','{"content":{"title":{"ar":"نص","en":"Changed"}}}')$$,'PT409','invalid_transition','Accepted task wording is immutable');
select lives_ok($$select pg_temp.task_action('praise_task','{"praise":"You sorted the agreed clean materials with the help you chose."}')$$,'Parent reviews action-focused praise before recognition');
insert into family_test_state values('recognition_command',(select jsonb_build_object('type','recognize_task','taskId',pg_temp.task_a(),'expectedRevision',(t->>'revision')::bigint)
 from jsonb_array_elements(public.ghaf_family_snapshot()->'tasks')t where t->>'id'=pg_temp.task_a()::text));
select lives_ok($$select public.ghaf_family_command(pg_temp.family_a(),'02030000-0000-4000-8000-000000000004',(select value from family_test_state where key='recognition_command'))$$,'Parent recognition atomically creates server award');
select lives_ok($$select public.ghaf_family_command(pg_temp.family_a(),'02030000-0000-4000-8000-000000000004',(select value from family_test_state where key='recognition_command'))$$,'Exact recognition retry does not issue a second award');
select is(public.ghaf_family_snapshot()#>>'{recognitions,0,seeds}','8','GI01 earns exactly its approved 8 Seeds even with help');
select is(jsonb_array_length(public.ghaf_family_snapshot()->'recognitions'),1,'Only one immutable receipt exists');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),(select value from family_test_state where key='recognition_command'))$$,'PT409','request_conflict','Stale task revision cannot reapply recognition');
select lives_ok($$select pg_temp.task_action('save_memory')$$,'Eligible Green recognition becomes an explicit memory');
select lives_ok($$select pg_temp.task_action('save_memory')$$,'Repeated save preserves one source memory');
select is(jsonb_array_length(public.ghaf_family_snapshot()->'memories'),1,'One memory per recognized task');
select lives_ok($$select pg_temp.task_action('delete_memory')$$,'Parent may hide the memory without removing earned evidence');
select is(public.ghaf_family_snapshot()->'deletedMemoryTaskIds',jsonb_build_array(pg_temp.task_a()),'Tombstone projection lets the UI remove the save affordance');
select throws_ok($$select pg_temp.task_action('save_memory')$$,'PT409','invalid_transition','Tombstone prevents deleted-memory recreation');
select is(jsonb_array_length(public.ghaf_family_snapshot()->'recognitions'),1,'Memory deletion never reduces recognition');

select pg_temp.actor(4);
select is(public.ghaf_family_snapshot()->>'familyCanopyContributions','1','Sibling sees coarse family canopy without private sibling receipts');
select is(public.ghaf_family_snapshot()->'recognitions','[]'::jsonb,'Family canopy does not expose sibling Seeds');

select pg_temp.actor(1);
insert into family_test_state values('parent_invite',public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),'{"type":"invite_parent"}'));
select pg_temp.actor(2);
select lives_ok($$select public.ghaf_redeem_family_invite((select value#>>'{result,token}' from family_test_state where key='parent_invite'),gen_random_uuid())$$,'Second verified adult joins by explicit Parent invitation');
select is(jsonb_array_length(public.ghaf_family_snapshot()->'families'),2,'Legitimate adult can select both independently owned/shared families');
select is(public.ghaf_family_snapshot(pg_temp.family_a())#>>'{family,name}','Actual family A','Joined Parent sees the authorized family');

select pg_temp.actor(5);
do $$ begin for n in 1..10 loop perform public.ghaf_redeem_family_invite(repeat('a',64),gen_random_uuid()); end loop; end; $$;
select is(public.ghaf_redeem_family_invite(repeat('a',64),gen_random_uuid())->>'code','rate_limited','Rejected guesses commit their rate counter');
select pg_temp.actor(6);
select throws_ok($$select public.ghaf_family_snapshot()$$,'42501','access_unavailable','Pending adult metadata cannot bypass administrator admission');

-- Every reference task executes its distinct reviewed steps and exact policy award.
select pg_temp.actor(1);
do $$
declare reference jsonb; assigned jsonb; task_id uuid; revision bigint; step jsonb; command jsonb;
begin
 for reference in select c from jsonb_array_elements(public.ghaf_family_snapshot()->'catalog')c loop
   perform pg_temp.actor(1);
   assigned:=public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_a(),'catalogId',reference->>'id'));
   task_id:=(assigned#>>'{result,taskId}')::uuid;
   perform pg_temp.actor(3);
   perform public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','accept_task','taskId',task_id,'expectedRevision',0));
   perform public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','start_task','taskId',task_id,'expectedRevision',1));
   revision:=2;
   for step in select s from jsonb_array_elements(coalesce(reference#>'{catalogExecution,steps}','[]'))s loop
     perform public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','set_step','taskId',task_id,'expectedRevision',revision,
       'stepId',step->>'id','state',case when step->>'kind'='action' then 'done' else 'skipped' end));
     revision:=revision+1;
   end loop;
   perform public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','submit_task','taskId',task_id,'expectedRevision',revision));
   perform pg_temp.actor(1);
   perform public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','praise_task','taskId',task_id,'expectedRevision',revision+1,'praise','You followed the agreed steps and used the help you needed.'));
   perform public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','recognize_task','taskId',task_id,'expectedRevision',revision+2));
 end loop;
end; $$;
reset role;
select is((select count(*) from public.app_recognitions where family_id=pg_temp.family_a()),26::bigint,'All 25 reference tasks plus first real assignment have one receipt each');
select ok(not exists(select 1 from public.app_recognitions r join public.app_tasks t on t.id=r.task_id
  where r.family_id=pg_temp.family_a() and r.seeds<>case when t.template->>'recognitionMode'='recognition_only' or t.template->>'routinePhase'<>'acquisition' then 0 else (t.template->>'displayedSeedAward')::integer end),
  'All reference awards match exact server policy and recognition-only earns zero');
select ok(not exists(select 1 from public.app_recognitions r join public.app_tasks t on t.id=r.task_id
  where r.family_id=pg_temp.family_a() and r.created_at<>t.recognized_at),'Recognition and task commit share one authoritative instant');
select ok(not exists(select 1 from public.app_tasks where family_id=pg_temp.family_a() and catalog_id='task_recycling_p0_v1'
  and (template#>>'{definitionOfDone,en}' like '%Salem%' or template#>>'{definitionOfDone,ar}' like '%سالم%')),'P0 substitutes only the actual assigned Child name');
select is((select template->>'displayedSeedAward' from public.app_tasks where family_id=pg_temp.family_a() and catalog_id='task_recycling_p0_v1'),'12','P0 name substitution preserves exact policy award');
select ok(not exists(select 1 from public.app_command_receipts where command::text like '%"token":%' or result::text like '%"token":%'),'No raw invitation token enters persisted command receipts');
select ok(not exists(select 1 from public.app_recognitions r join public.app_tasks t on t.id=r.task_id
  where t.template->>'recognitionMode'='recognition_only' and (r.seeds<>0 or r.canopy_contribution<>0)),'Recognition-only task never creates persistent growth');

set local role authenticated;
select pg_temp.actor(1);
select lives_ok($$select public.ghaf_family_command(pg_temp.family_a(),gen_random_uuid(),jsonb_build_object('type','revoke_child','childId',pg_temp.child_a()))$$,'Parent revokes every device of the Child while retaining history');
select pg_temp.actor(3);
select throws_ok($$select public.ghaf_family_snapshot(pg_temp.family_a())$$,'42501',null,'Revoked Child cannot read using an unexpired JWT');
select throws_ok($$select public.ghaf_redeem_family_invite((select value#>>'{result,token}' from family_test_state where key='invite_a'),'02030000-0000-4000-8000-000000000003')$$,'42501','family_unavailable','Revoked Child cannot replay enrollment receipt');
reset role;
delete from auth.sessions where id='02020000-0000-4000-8000-000000000004';
set local role authenticated;
select pg_temp.actor(4);
select throws_ok($$select public.ghaf_family_snapshot(pg_temp.family_a())$$,'42501','access_unavailable','Deleted provider session immediately loses access');
reset role;
select is((select count(*) from public.app_recognitions where family_id=pg_temp.family_a()),26::bigint,'Revocation retains immutable task recognition');
select * from finish();
rollback;
