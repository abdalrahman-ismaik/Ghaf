begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous) values
 ('02050000-0000-4000-8000-000000000001','authenticated','authenticated','custom-parent@example.invalid',now(),false),
 ('02050000-0000-4000-8000-000000000002','authenticated','authenticated',null,null,true),
 ('02050000-0000-4000-8000-000000000003','authenticated','authenticated','custom-other@example.invalid',now(),false);
insert into auth.sessions(id,user_id,created_at,updated_at) select
 ('02060000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
 ('02050000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,now(),now() from generate_series(1,3)n;
update public.pilot_access set status='approved' where user_id in
 ('02050000-0000-4000-8000-000000000001','02050000-0000-4000-8000-000000000003');
create temporary table custom_test_state(key text primary key,value jsonb);
grant all on custom_test_state to authenticated;
create function pg_temp.actor(n integer,p_fresh boolean default true) returns void language plpgsql as $$
begin
 perform set_config('request.jwt.claim.sub','02050000-0000-4000-8000-'||lpad(n::text,12,'0'),true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub','02050000-0000-4000-8000-'||lpad(n::text,12,'0'),
  'session_id','02060000-0000-4000-8000-'||lpad(n::text,12,'0'),'role','authenticated',
  'amr',jsonb_build_array(jsonb_build_object('method','password','timestamp',floor(extract(epoch from clock_timestamp()))::bigint-case when p_fresh then 0 else 1000 end)))::text,true);
end; $$;
create function pg_temp.family_id() returns uuid language sql as $$ select(value#>>'{snapshot,family,id}')::uuid from custom_test_state where key='family'; $$;
create function pg_temp.child_id() returns uuid language sql as $$ select(value#>>'{result,childId}')::uuid from custom_test_state where key='child'; $$;
create function pg_temp.template_id() returns uuid language sql as $$ select(value#>>'{result,templateId}')::uuid from custom_test_state where key='template'; $$;
create function pg_temp.custom_input() returns jsonb language sql as $$ select '{"type":"create_custom_template","title":{"ar":"ترتيب الأوراق","en":"Arrange papers"},"positiveAction":{"ar":"رتب ثلاث أوراق آمنة مع وليّ الأمر.","en":"Arrange three safe sheets with the Parent."},"categoryId":"home_responsibility","recurrence":"once","reviewed":true}'::jsonb; $$;
create function pg_temp.complete_task(p_task uuid,p_custom boolean) returns void language plpgsql as $$
declare v_task jsonb;v_revision bigint:=2;v_step jsonb;
begin
 perform pg_temp.actor(2);
 select t into v_task from jsonb_array_elements(public.ghaf_family_snapshot(pg_temp.family_id())->'tasks')t where t->>'id'=p_task::text;
 perform public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','accept_task','taskId',p_task,'expectedRevision',0));
 perform public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','start_task','taskId',p_task,'expectedRevision',1));
 for v_step in select s from jsonb_array_elements(v_task#>'{template,catalogExecution,steps}')s loop
  perform public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','set_step','taskId',p_task,
   'expectedRevision',v_revision,'stepId',v_step->>'id','state','done'));v_revision:=v_revision+1;
 end loop;
 perform public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','submit_task','taskId',p_task,'expectedRevision',v_revision));
 perform pg_temp.actor(1);
 perform public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','praise_task','taskId',p_task,'expectedRevision',v_revision+1,'praise','You followed the agreed action and asked for help.'));
 perform public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','recognize_task','taskId',p_task,'expectedRevision',v_revision+2));
end; $$;

set local role authenticated;
select pg_temp.actor(1);
insert into custom_test_state values('family',public.ghaf_family_command(null,gen_random_uuid(),'{"type":"create_family","name":"Custom family","displayName":"Actual Parent"}'));
insert into custom_test_state values('child',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),'{"type":"add_child","displayName":"Actual Child","ageBand":"9_11"}'));
insert into custom_test_state values('invite',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','invite_child','childId',pg_temp.child_id())));
select is(public.ghaf_family_snapshot()->'customTemplates','[]'::jsonb,'No sample custom templates are created');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),pg_temp.custom_input()||'{"reviewed":false}'::jsonb)$$,'PT400','invalid_command','Custom action requires explicit Parent review');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),pg_temp.custom_input()||'{"recurrence":null}'::jsonb)$$,'PT400','invalid_command','Null recurrence cannot bypass custom definition validation');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),pg_temp.custom_input()||'{"seeds":100}'::jsonb)$$,'PT400','invalid_command','Custom definitions cannot supply an award');
insert into custom_test_state values('template',public.ghaf_family_command(pg_temp.family_id(),'02070000-0000-4000-8000-000000000001',pg_temp.custom_input()));
select lives_ok($$select public.ghaf_family_command(pg_temp.family_id(),'02070000-0000-4000-8000-000000000001',pg_temp.custom_input())$$,'Custom template retry is idempotent');
select is(jsonb_array_length(public.ghaf_family_snapshot()->'customTemplates'),1,'One private reusable definition survives retry');
select is(public.ghaf_family_snapshot()#>>'{customTemplates,0,template,recognitionMode}','recognition_only','Custom recognition policy is server-owned');
select is(public.ghaf_family_snapshot()#>>'{customTemplates,0,template,visibilityScope}','child_guardian','Custom actions remain private');
insert into custom_test_state values('task',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_custom_task','childId',pg_temp.child_id(),'templateId',pg_temp.template_id())));
select is(public.ghaf_family_snapshot()#>>'{tasks,0,template,positiveAction,en}','Arrange three safe sheets with the Parent.','Saved definition actually populates the assigned action');
select is(public.ghaf_family_snapshot()#>>'{tasks,0,catalogId}','custom_'||pg_temp.template_id()::text,'Private custom task identity is distinct from global catalog');

select pg_temp.actor(2);
select lives_ok($$select public.ghaf_redeem_family_invite((select value#>>'{result,token}' from custom_test_state where key='invite'),gen_random_uuid())$$,'Separate Child session pairs securely');
select is(public.ghaf_family_snapshot()->'customTemplates','[]'::jsonb,'Child sees its assignment without Parent template library');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),pg_temp.custom_input())$$,'42501','access_unavailable','Child cannot create reviewed templates');
select lives_ok($$select pg_temp.complete_task((select(value#>>'{result,taskId}')::uuid from custom_test_state where key='task'),true)$$,'Custom agreed action completes through the actual Child and Parent lifecycle');
select is(public.ghaf_family_snapshot()#>>'{recognitions,0,seeds}','0','Custom completion creates no Seeds');
select is(public.ghaf_family_snapshot()->>'familyCanopyContributions','0','Custom completion creates no shared canopy');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','save_memory','taskId',(select value#>>'{result,taskId}' from custom_test_state where key='task'),'expectedRevision',6))$$,'PT409','invalid_transition','Private custom completion does not become a shared Green memory');
select lives_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','remove_custom_template','templateId',pg_temp.template_id(),'expectedRevision',0))$$,'Parent can retire a reusable definition');
select is(public.ghaf_family_snapshot()#>>'{tasks,0,template,positiveAction,en}','Arrange three safe sheets with the Parent.','Retiring a template preserves accepted task content');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_custom_task','childId',pg_temp.child_id(),'templateId',pg_temp.template_id()))$$,'PT409','invalid_transition','Retired definition cannot create more assignments');

select pg_temp.actor(3);
select throws_ok($$select public.ghaf_family_snapshot(pg_temp.family_id())$$,'42501','family_unavailable','Another approved account cannot read private templates');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),pg_temp.custom_input())$$,'42501','family_unavailable','Another family cannot create templates here');

select pg_temp.actor(1);
insert into custom_test_state values('future',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_id(),'catalogId','HR02')));
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','begin_maintenance','taskId',(select value#>>'{result,taskId}' from custom_test_state where key='future'),'expectedRevision',0))$$,'PT409','invalid_transition','A fade-first routine needs three confirmed completions before this review');
do $$ declare response jsonb; begin
 for n in 1..3 loop
  response:=public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_id(),'catalogId','HR02'));
  perform pg_temp.complete_task((response#>>'{result,taskId}')::uuid,false);
 end loop;
end; $$;
select pg_temp.actor(1,false);
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','begin_maintenance','taskId',(select value#>>'{result,taskId}' from custom_test_state where key='future'),'expectedRevision',0))$$,'PT428','reauth_required','Old password proof cannot change a reward-bearing routine');
select pg_temp.actor(1);
select lives_ok($$select public.ghaf_family_command(pg_temp.family_id(),'02070000-0000-4000-8000-000000000002',jsonb_build_object('type','begin_maintenance','taskId',(select value#>>'{result,taskId}' from custom_test_state where key='future'),'expectedRevision',0))$$,'Fresh Parent review changes only the not-yet-accepted assignment');
select lives_ok($$select public.ghaf_family_command(pg_temp.family_id(),'02070000-0000-4000-8000-000000000002',jsonb_build_object('type','begin_maintenance','taskId',(select value#>>'{result,taskId}' from custom_test_state where key='future'),'expectedRevision',0))$$,'Maintenance review retry is idempotent');
insert into custom_test_state values('later',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_id(),'catalogId','HR02')));
select is((select t#>>'{template,routinePhase}' from jsonb_array_elements(public.ghaf_family_snapshot()->'tasks')t where t->>'id'=(select value#>>'{result,taskId}' from custom_test_state where key='later')),'maintenance','New assignments retain the reviewed maintenance phase');
reset role;
select is((select sum(seeds) from public.app_recognitions where family_id=pg_temp.family_id()),18::bigint,'Phase review never deducts the three previously earned six-Seed awards');
select is((select count(*) from public.app_task_catalog),25::bigint,'Private custom definitions never pollute the global reference catalog');
select ok(not has_table_privilege('authenticated','public.app_custom_task_templates','SELECT') and not has_table_privilege('authenticated','public.app_routine_phases','UPDATE'),'Private template and phase authority cannot be bypassed through direct tables');
select * from finish();
rollback;
