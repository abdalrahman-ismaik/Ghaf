begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous)
 values('02110000-0000-4000-8000-000000000001','authenticated','authenticated','content-guard@example.invalid',now(),false);
insert into auth.sessions(id,user_id,created_at,updated_at)
 values('02120000-0000-4000-8000-000000000001','02110000-0000-4000-8000-000000000001',now(),now());
update public.pilot_access set status='approved' where user_id='02110000-0000-4000-8000-000000000001';
create temporary table content_test_state(key text primary key,value jsonb);
grant all on content_test_state to authenticated;
create function pg_temp.family_id() returns uuid language sql as $$select(value#>>'{snapshot,family,id}')::uuid from content_test_state where key='family';$$;
create function pg_temp.child_id() returns uuid language sql as $$select(value#>>'{result,childId}')::uuid from content_test_state where key='child';$$;
create function pg_temp.custom(p_en text,p_ar text default 'خطوة متفق عليها',p_category text default 'home_responsibility') returns jsonb language sql as $$
 select jsonb_build_object('type','create_custom_template','title',jsonb_build_object('ar','مهمة خاصة','en','Private task'),
  'positiveAction',jsonb_build_object('ar',p_ar,'en',p_en),'categoryId',p_category,'recurrence','once','reviewed',true);
$$;
create function pg_temp.assign_title(p_en text,p_ar text default 'عنوان متفق عليه') returns jsonb language sql as $$
 select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_task',
  'childId',pg_temp.child_id(),'catalogId','GI01','content',jsonb_build_object('title',jsonb_build_object('ar',p_ar,'en',p_en))));
$$;
set local role authenticated;
select set_config('request.jwt.claim.sub','02110000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"02110000-0000-4000-8000-000000000001","session_id":"02120000-0000-4000-8000-000000000001","role":"authenticated"}',true);
insert into content_test_state values('family',public.ghaf_family_command(null,gen_random_uuid(),'{"type":"create_family","name":"Content guard family","displayName":"Actual Parent"}'));
insert into content_test_state values('child',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),'{"type":"add_child","displayName":"Actual Child","ageBand":"9_11"}'));
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),pg_temp.custom('Carry glass'))$$,'PT400','invalid_command','Custom action cannot contradict the existing glass boundary');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),pg_temp.custom('Sort safe items','افرز البطاريات'))$$,'PT400','invalid_command','Arabic action cannot contradict the existing battery boundary');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),pg_temp.custom('Walk alone'))$$,'PT400','invalid_command','Existing English unsupervised-route guard is authoritative');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),pg_temp.custom('Agreed route','اعبر الطريق'))$$,'PT400','invalid_command','Existing Arabic unsupervised-route guard is authoritative');
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),pg_temp.custom('Finish every bite','خطوة متفق عليها','food_hospitality'))$$,'PT400','invalid_command','Food category preserves the existing non-pressure schema rule');
select throws_ok($$select pg_temp.assign_title('Carry glass')$$,'PT400','invalid_command','Catalog title override cannot poison the readable family snapshot');
select throws_ok($$select pg_temp.assign_title('A battery reminder')$$,'PT400','invalid_command','Direct instruction nouns retain the existing guard without new negation inference');
select throws_ok($$select pg_temp.assign_title('Do not carry glass')$$,'PT400','invalid_command','Negated hazard copy is rejected exactly as the existing client validator');
select throws_ok($$select pg_temp.assign_title('بglass')$$,'PT400','invalid_command','Mixed-script boundary follows JavaScript word semantics');
select throws_ok($$select pg_temp.assign_title('ſharp objects')$$,'PT400','invalid_command','Unicode simple-case-folding matches the existing JavaScript guard');
select is(jsonb_array_length(public.ghaf_family_snapshot(pg_temp.family_id())->'customTemplates'),0,'Rejected custom definitions leave no persistent unreadable rows');
select is(jsonb_array_length(public.ghaf_family_snapshot(pg_temp.family_id())->'tasks'),0,'Rejected title overrides leave no assignments or growth');
select lives_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),pg_temp.custom('Sort non-sharp paper shapes'))$$,'The existing non-sharp exception is preserved');
select lives_ok($$select pg_temp.assign_title('Our glasshouse drawing')$$,'English hazard nouns do not match unrelated word substrings');
select lives_ok($$select pg_temp.assign_title(E'Walk\nalone')$$,'Route dot does not cross newline boundaries that the client keeps separate');
insert into content_test_state values('safe-task',pg_temp.assign_title('Agreed safe sorting'));
select throws_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','edit_task',
 'taskId',(select value#>>'{result,taskId}' from content_test_state where key='safe-task'),'expectedRevision',0,
 'content','{"title":{"ar":"عنوان","en":"Handle chemicals"}}'::jsonb))$$,'PT400','invalid_command','Pre-acceptance edits receive the same instruction guard');
select is((select t#>>'{template,title,en}' from jsonb_array_elements(public.ghaf_family_snapshot(pg_temp.family_id())->'tasks')t
 where t->>'id'=(select value#>>'{result,taskId}' from content_test_state where key='safe-task')),'Agreed safe sorting','Failed edit preserves previous valid title');
select is((select t->>'revision' from jsonb_array_elements(public.ghaf_family_snapshot(pg_temp.family_id())->'tasks')t
 where t->>'id'=(select value#>>'{result,taskId}' from content_test_state where key='safe-task')),'0','Failed edit preserves revision and retryability');
reset role;
select ok(not has_function_privilege('authenticated','public.ghaf_task_instruction_pattern(text)','EXECUTE'),'No client access to internal guard helpers');
select * from finish();
rollback;
