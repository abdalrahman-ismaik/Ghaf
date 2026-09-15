begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

select ok((select bool_and(relrowsecurity) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='ghaf_private' and c.relkind='r'),'Every normalized private table has RLS');
select ok(not has_table_privilege('authenticated','ghaf_private.children','SELECT'),'No direct Child profile table access');
select ok(not has_table_privilege('authenticated','ghaf_private.seed_entries','INSERT'),'No client-minted Seeds');
select ok(not has_function_privilege('authenticated','ghaf_private.command_core(jsonb,uuid,uuid,text,uuid)','EXECUTE'),'Caller cannot supply a forged core actor');
select ok(not has_function_privilege('anon','public.ghaf_read()','EXECUTE'),'API-key-only reads denied');
select ok((select bool_and(not prosecdef) from pg_proc where oid in ('public.ghaf_read()'::regprocedure,'public.ghaf_command(uuid,bigint,jsonb)'::regprocedure,'public.ghaf_claim_child(text)'::regprocedure)),'Public wrappers use invoker authority');
select is((select count(*) from ghaf_private.families),0::bigint,'No seeded family');
select is((select count(*) from ghaf_private.seed_entries),0::bigint,'No fabricated opening Seeds');
select is((select count(*) from ghaf_private.categories),8::bigint,'Eight existing category references');
select is((select count(*) from ghaf_private.landscapes),5::bigint,'Five UAE landscape references');

insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous,raw_user_meta_data) values
 ('01940000-0000-4000-8000-000000000001','authenticated','authenticated','core-a@example.invalid',now(),false,'{}'),
 ('01940000-0000-4000-8000-000000000002','authenticated','authenticated','core-b@example.invalid',now(),false,'{}'),
 ('01940000-0000-4000-8000-000000000003','authenticated','authenticated',null,null,true,'{"role":"parent"}'),
 ('01940000-0000-4000-8000-000000000004','authenticated','authenticated',null,null,true,'{}');
update public.pilot_access set status='approved' where user_id in ('01940000-0000-4000-8000-000000000001','01940000-0000-4000-8000-000000000002');
insert into auth.sessions(id,user_id,created_at,updated_at) values
 ('01950000-0000-4000-8000-000000000001','01940000-0000-4000-8000-000000000001',now(),now()),
 ('01950000-0000-4000-8000-000000000002','01940000-0000-4000-8000-000000000002',now(),now()),
 ('01950000-0000-4000-8000-000000000003','01940000-0000-4000-8000-000000000003',now(),now()),
 ('01950000-0000-4000-8000-000000000004','01940000-0000-4000-8000-000000000004',now(),now());
create temp table core_values(name text primary key,value text not null);
grant select,insert,update on core_values to authenticated;
create function pg_temp.actor(n integer) returns void language plpgsql as $$
declare u text:='01940000-0000-4000-8000-'||lpad(n::text,12,'0'); s text:='01950000-0000-4000-8000-'||lpad(n::text,12,'0');
begin
 perform set_config('request.jwt.claim.sub',u,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'role','authenticated','session_id',s,
  'amr',jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from now()))))::text,true);
end $$;
create function pg_temp.remember(k text,v text) returns text language plpgsql as $$ begin
 insert into core_values values(k,v) on conflict(name) do update set value=excluded.value; return v; end $$;
create function pg_temp.value(k text) returns text language sql as $$ select value from core_values where name=k; $$;
create function pg_temp.command(c jsonb,request uuid default gen_random_uuid()) returns jsonb language sql as $$
 select public.ghaf_command(request,(public.ghaf_read()->>'revision')::bigint,c);
$$;
create function pg_temp.make_task(template text default 'task_recycling_p0_v1') returns uuid language plpgsql as $$
declare task uuid;
begin
 task:=(pg_temp.command(jsonb_build_object('type','task.create','childId',pg_temp.value('child'),'templateId',template,'locale','en'))->'result'->>'task_id')::uuid;
 perform pg_temp.command(jsonb_build_object('type','task.review','taskId',task));
 return (pg_temp.command(jsonb_build_object('type','task.assign','taskId',task))->'result'->>'assignment_id')::uuid;
end $$;

create function pg_temp.complete_task(assignment uuid) returns uuid language plpgsql as $$
declare checkin uuid;
begin
 perform pg_temp.actor(3);
 perform pg_temp.command(jsonb_build_object('type','assignment.accept','assignmentId',assignment));
 perform pg_temp.command(jsonb_build_object('type','assignment.start','assignmentId',assignment));
 perform pg_temp.command(jsonb_build_object('type','assignment.submit','assignmentId',assignment,'completionMode','permitted_help','definitionAcknowledged',true));
 perform pg_temp.actor(1);
 checkin:=(pg_temp.command(jsonb_build_object('type','checkin.confirm','assignmentId',assignment,'praise','You completed the agreed step with help.'))->'result'->>'check_in_id')::uuid;
 perform pg_temp.command(jsonb_build_object('type','checkin.praise_presented','checkInId',checkin));
 return (pg_temp.command(jsonb_build_object('type','recognition.apply','checkInId',checkin))->'result'->>'recognition_id')::uuid;
end $$;

set local role authenticated;
select pg_temp.actor(1);
select is(public.ghaf_read()->'children','[]'::jsonb,'New account starts with no predefined children');
select is(public.ghaf_read()->'recognitions','[]'::jsonb,'New account starts with no invented completions');
select pg_temp.remember('family',public.ghaf_read()->'family'->>'id');
select public.ghaf_read() as contract_snapshot,'parent_empty' as contract_label;
select lives_ok($$select pg_temp.command('{"type":"family.update","name":"Core family","locale":"en","guardianNames":["Parent A"]}')$$,'Parent stores an actual family name');
select pg_temp.remember('child',pg_temp.command('{"type":"child.create","nickname":"Core child","ageBand":"9_11","age10PlusConfirmed":true,"preferredLanguage":"en","avatarId":"ghaf_tree","preferences":{"sex":"female","interests":["nature"],"hobbies":["drawing"],"accessibility":[],"support":["together"],"personalization_enabled":true,"custom_interest":"Local plants","custom_hobby":null,"custom_support":null,"custom_accessibility":null}}')->'result'->>'child_id');
select pg_temp.remember('sibling',pg_temp.command('{"type":"child.create","nickname":"Core sibling","ageBand":"6_8","age10PlusConfirmed":false,"preferredLanguage":"ar","avatarId":"leaf"}')->'result'->>'child_id');
select is(jsonb_array_length(public.ghaf_read()->'children'),2,'Both saved profiles persist');
select is(jsonb_array_length(public.ghaf_read()->'landscape_progress'),10,'Server supplies all five zero landscapes for both children');
select ok(not exists(select 1 from jsonb_array_elements(public.ghaf_read()->'landscape_progress') x where x->>'stage'<>'seed' or (x->>'cumulative_seeds')::integer<>0),'Empty gardens have no seeded progress');
select pg_temp.remember('revision',public.ghaf_read()->>'revision');
select pg_temp.command('{"type":"family.update","name":"Saved once","locale":"ar"}','01960000-0000-4000-8000-000000000001');
select lives_ok($$select public.ghaf_command('01960000-0000-4000-8000-000000000001',(pg_temp.value('revision'))::bigint,'{"type":"family.update","name":"Saved once","locale":"ar"}')$$,'Identical network retry returns the retained receipt despite old revision');
select public.ghaf_command('01960000-0000-4000-8000-000000000001',(pg_temp.value('revision'))::bigint,'{"type":"family.update","name":"Saved once","locale":"ar"}') as contract_result,'replayed_family_update' as contract_label;
select is((public.ghaf_read()->>'revision')::bigint,(pg_temp.value('revision'))::bigint+1,'Retry does not advance revision twice');
select throws_ok($$select public.ghaf_command('01960000-0000-4000-8000-000000000001',(pg_temp.value('revision'))::bigint,'{"type":"family.update","name":"Forged retry","locale":"ar"}')$$,'PT409','request_conflict','Changed payload under same request key is rejected');
select throws_ok($$select public.ghaf_command(gen_random_uuid(),(pg_temp.value('revision'))::bigint,'{"type":"family.update","name":"Stale write","locale":"ar"}')$$,'PT409','revision_conflict','Independent stale edit cannot overwrite newer data');
select throws_ok($$select pg_temp.command('{"type":"family.update","name":"Forged owner","locale":"ar","userId":"01940000-0000-4000-8000-000000000002"}')$$,'PT400','invalid_input','Forged owner fields fail closed');
select pg_temp.remember('assignment',pg_temp.make_task()::text);
select pg_temp.remember('task',(select x->>'task_id' from jsonb_array_elements(public.ghaf_read()->'assignments') x where x->>'id'=pg_temp.value('assignment')));
select throws_ok($$select pg_temp.command(jsonb_build_object('type','assignment.accept','assignmentId',pg_temp.value('assignment')))$$,'42501','access_denied','Parent cannot impersonate Child acceptance');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','task.save_template','taskId',pg_temp.value('task')))$$,'Parent saves immutable task content for future use');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','masroofi.enable','childId',pg_temp.value('child')))$$,'Real UUID child can enable simulated card');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','masroofi.promise','assignmentId',pg_temp.value('assignment'),'expectedTaskVersion',1,'amountFils',500))$$,'Parent locks hidden reward to an unaccepted assignment');
select pg_temp.remember('invite_result',pg_temp.command(jsonb_build_object('type','child.invite','childId',pg_temp.value('child')))::text);
select pg_temp.value('invite_result')::jsonb as contract_result,'parent_invites_child' as contract_label;
select pg_temp.remember('token',pg_temp.value('invite_result')::jsonb->'result'->>'token');
select public.ghaf_read() as contract_snapshot,'parent_assigned_promised' as contract_label;

select pg_temp.actor(3);
select throws_ok($$select public.ghaf_read()$$,'42501','access_revoked','Unenrolled anonymous identity has no family access despite Parent metadata');
select lives_ok($$select public.ghaf_claim_child(pg_temp.value('token'))$$,'Distinct anonymous session claims explicit Parent invitation');
select lives_ok($$select public.ghaf_claim_child(pg_temp.value('token'))$$,'Same installation claim retry is idempotent');
select is(public.ghaf_read()->'actor'->>'role','child','Role comes from provider-backed enrollment');
select is(jsonb_array_length(public.ghaf_read()->'children'),1,'Child cannot read sibling profiles');
select is(public.ghaf_read()->'children'->0->>'id',pg_temp.value('child'),'Child projection binds exact enrolled UUID');
select is(jsonb_array_length(public.ghaf_read()->'landscape_progress'),5,'Child gets only their five tracks');
select ok(not((public.ghaf_read()->'extras'->'masroofi'->'promises'->0) ? 'amountFils'),'Unearned promise amount is absent from Child transport');
select is(public.ghaf_read()->'saved_templates','[]'::jsonb,'Parent saved template inventory is private');
select throws_ok($$select pg_temp.command(jsonb_build_object('type','masroofi.top_up','childId',pg_temp.value('child'),'amountFils',1000))$$,'PT403','parent_required','Child cannot top up simulated money');
select throws_ok($$select pg_temp.command(jsonb_build_object('type','child.invite','childId',pg_temp.value('sibling')))$$,'42501','access_denied','Child cannot enroll a sibling');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','assignment.accept','assignmentId',pg_temp.value('assignment')))$$,'Assigned Child chooses their approved task');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','assignment.start','assignmentId',pg_temp.value('assignment')))$$,'Child starts accepted task');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','assignment.help','assignmentId',pg_temp.value('assignment')))$$,'Help request persists without changing award');
select lives_ok($$select pg_temp.remember('submission_result',pg_temp.command(jsonb_build_object('type','assignment.submit','assignmentId',pg_temp.value('assignment'),'completionMode','permitted_help','definitionAcknowledged',true))::text)$$,'Permitted-help submission is a real saved attempt');
select pg_temp.value('submission_result')::jsonb as contract_result,'child_submits_with_help' as contract_label;
select is(public.ghaf_read()->'seed_entries','[]'::jsonb,'Submission alone creates no Seeds');
select public.ghaf_read() as contract_snapshot,'child_submitted_hidden_reward' as contract_label;

select pg_temp.actor(4);
select throws_ok($$select public.ghaf_claim_child(pg_temp.value('token'))$$,'PT400','invalid_invitation','Another session cannot reuse consumed invitation');
select pg_temp.actor(1);
select lives_ok($$select pg_temp.command(jsonb_build_object('type','assignment.help_resolved','assignmentId',pg_temp.value('assignment')))$$,'Parent can resolve the help request');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','checkin.retry','assignmentId',pg_temp.value('assignment'),'observation','Try the final sorting step together.'))$$,'Kind retry preserves the original award and records guidance');
select pg_temp.actor(3);
select is(public.ghaf_read()->'check_ins'->0->>'observation','Try the final sorting step together.','Child can read their retry instruction');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','assignment.resume_retry','assignmentId',pg_temp.value('assignment')))$$,'Child resumes retry');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','assignment.submit','assignmentId',pg_temp.value('assignment'),'completionMode','permitted_help','definitionAcknowledged',true))$$,'Second attempt remains separately recorded');
select is(jsonb_array_length(public.ghaf_read()->'submissions'),2,'Retry never overwrites the first attempt');
select pg_temp.actor(1);
select pg_temp.remember('checkin',pg_temp.command(jsonb_build_object('type','checkin.confirm','assignmentId',pg_temp.value('assignment'),'praise','You sorted the safe materials and asked for help.'))->'result'->>'check_in_id');
select throws_ok($$select pg_temp.command(jsonb_build_object('type','recognition.apply','checkInId',pg_temp.value('checkin')))$$,'PT400','invalid_transition','Recognition cannot skip the recorded praise presentation');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','checkin.praise_presented','checkInId',pg_temp.value('checkin')))$$,'Parent records that praise was presented');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','masroofi.controls','childId',pg_temp.value('child'),'expectedVersion',(public.ghaf_read()#>>'{extras,masroofi,cards,0,controlsVersion}')::integer,'controls',jsonb_build_object('frozen',true,'onlineAllowed',false,'allowedCategories',jsonb_build_array('stationery'),'perPurchaseLimitFils',2000,'dailyLimitFils',5000)))$$,'Parent may freeze spending before recognition');
select pg_temp.remember('recognition_result',pg_temp.command(jsonb_build_object('type','recognition.apply','checkInId',pg_temp.value('checkin')))::text);
select pg_temp.value('recognition_result')::jsonb as contract_result,'parent_applies_recognition' as contract_label;
select pg_temp.remember('recognition',pg_temp.value('recognition_result')::jsonb->'result'->>'recognition_id');
select is((public.ghaf_read()->'seed_entries'->0->>'amount')::integer,12,'Allowed help earns the full fixed twelve Seeds');
select is((public.ghaf_read()->'extras'->'masroofi'->'cards'->0->>'balanceFils')::integer,500,'Frozen spending does not block earned credit');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','recognition.apply','checkInId',pg_temp.value('checkin')))$$,'A separate duplicate approval returns original recognition');
select is(jsonb_array_length(public.ghaf_read()->'recognitions'),1,'Only one receipt exists per assignment');
select is(jsonb_array_length(public.ghaf_read()->'seed_entries'),1,'Duplicate approval cannot award extra Seeds');
select is((public.ghaf_read()->'extras'->'masroofi'->'cards'->0->>'balanceFils')::integer,500,'Duplicate approval cannot credit twice');
select throws_ok($$select pg_temp.command(jsonb_build_object('type','task.update','taskId',pg_temp.value('task'),'expectedVersion',1,'childId',pg_temp.value('child'),'templateId','HR01','locale','en'))$$,'PT400','invalid_transition','Accepted task terms remain immutable');
select public.ghaf_read() as contract_snapshot,'parent_recognized' as contract_label;
select pg_temp.actor(3);
select is((public.ghaf_read()->'extras'->'masroofi'->'transactions'->0->>'amountFils')::integer,500,'Child sees the earned amount only after recognition');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','reveal.acknowledge','revealId',public.ghaf_read()->'reveals'->0->>'id'))$$,'Child acknowledges durable result without duplicating awards');
select public.ghaf_read() as contract_snapshot,'child_recognized' as contract_label;

select pg_temp.actor(1);
select pg_temp.remember('draft',pg_temp.command(jsonb_build_object('type','task.create','childId',pg_temp.value('child'),'templateId','HR01','title','Our custom tidying task','locale','en'))->'result'->>'task_id');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','task.update','taskId',pg_temp.value('draft'),'expectedVersion',1,'childId',pg_temp.value('child'),'templateId','HR01','title','Our revised tidying task','locale','en'))$$,'Reviewed custom content creates a new immutable draft version');
select throws_ok($$select pg_temp.command(jsonb_build_object('type','task.update','taskId',pg_temp.value('draft'),'expectedVersion',1,'childId',pg_temp.value('child'),'templateId','HR01','title','Stale overwrite','locale','en'))$$,'PT409','revision_conflict','Old editor terms fail even with a newly refreshed family revision');
select is((select count(*) from jsonb_array_elements(public.ghaf_read()->'tasks') t where t->>'id'=pg_temp.value('draft')),2::bigint,'Both draft versions remain available without stale overwrite');
select ok(not exists(select 1 from jsonb_array_elements(public.ghaf_read()->'tasks') t where t->>'id'=pg_temp.value('draft') and (t->>'reward_eligible')::boolean),'Modified content cannot inherit canonical money eligibility');

select pg_temp.remember('adjusted_assignment',pg_temp.make_task()::text);
select pg_temp.remember('adjusted_task',(select a->>'task_id' from jsonb_array_elements(public.ghaf_read()->'assignments') a where a->>'id'=pg_temp.value('adjusted_assignment')));
select pg_temp.command(jsonb_build_object('type','masroofi.promise','assignmentId',pg_temp.value('adjusted_assignment'),'expectedTaskVersion',1,'amountFils',300));
select pg_temp.actor(3);
select pg_temp.remember('adjustment',pg_temp.command(jsonb_build_object('type','adjustment.request','assignmentId',pg_temp.value('adjusted_assignment')))->'result'->>'adjustment_id');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.command(jsonb_build_object('type','adjustment.propose','adjustmentId',pg_temp.value('adjustment'),'templateId','FA01'))$$,'PT400','invalid_input','A smaller equivalent cannot substitute an unrelated private category');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','adjustment.propose','adjustmentId',pg_temp.value('adjustment'),'templateId','task_recycling_indoor_safe_equivalent_v1'))$$,'Parent proposes the safe indoor equivalent before acceptance');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.command(jsonb_build_object('type','adjustment.accept','adjustmentId',pg_temp.value('adjustment')))$$,'Child explicitly accepts the new version');
select is((select count(*) from jsonb_array_elements(public.ghaf_read()->'tasks') t where t->>'id'=pg_temp.value('adjusted_task')),2::bigint,'Child keeps source and proposed versions for adjustment history');
select ok(not exists(select 1 from jsonb_array_elements(public.ghaf_read()->'extras'->'masroofi'->'promises') p where p->>'assignmentId'=pg_temp.value('adjusted_assignment')),'Stale unearned promise cannot imply a reward for different task terms');
select public.ghaf_read() as contract_snapshot,'child_adjusted_version' as contract_label;
select lives_ok($$select pg_temp.complete_task(pg_temp.value('adjusted_assignment')::uuid)$$,'Safe equivalent still completes the full approval journey');
select is(jsonb_array_length(public.ghaf_read()->'seed_entries'),2,'Equivalent earns its displayed award without removing the first award');
select is((public.ghaf_read()#>>'{extras,masroofi,cards,0,balanceFils}')::integer,500,'Recognition of new version cannot pay old-version money promise');

select pg_temp.remember('private_assignment',pg_temp.make_task('FA01')::text);
select lives_ok($$select pg_temp.complete_task(pg_temp.value('private_assignment')::uuid)$$,'Recognition-only task records praise and completion');
select is(jsonb_array_length(public.ghaf_read()->'seed_entries'),2,'Recognition-only completion creates zero Seed entries');
select pg_temp.remember('routine_task',pg_temp.command(jsonb_build_object('type','task.create','childId',pg_temp.value('child'),'locale','en',
 'title','Our eight-Seed routine','definitionOfDone','Put the agreed safe items in their places.','positiveAction','Put away the agreed safe items.',
 'whyItMatters','This leaves the shared space ready for the family.','steps',jsonb_build_array('Choose the safe items with an adult.','Put those items in the agreed places.'),
 'categoryId','home_responsibility','recognitionMode','fade_first','routinePhase','acquisition','seedAward',8,'visibilityScope','household','recurrence','recurrent','circleEligible',false,
 'safety',(select t->'safety_en' from jsonb_array_elements(public.ghaf_read()->'templates') t where t->>'id'='HR01')))->'result'->>'task_id');
select pg_temp.command(jsonb_build_object('type','task.review','taskId',pg_temp.value('routine_task')));
select pg_temp.remember('routine_assignment',pg_temp.command(jsonb_build_object('type','task.assign','taskId',pg_temp.value('routine_task')))->'result'->>'assignment_id');
select is((select t->'template_id' from jsonb_array_elements(public.ghaf_read()->'tasks') t where t->>'id'=pg_temp.value('routine_task')),'null'::jsonb,'Custom routine has no catalog award fallback');
select pg_temp.remember('routine_award',(select t->>'seed_award' from jsonb_array_elements(public.ghaf_read()->'tasks') t where t->>'id'=pg_temp.value('routine_task') and t->>'version'='1'));
select lives_ok($$select pg_temp.complete_task(pg_temp.value('routine_assignment')::uuid)$$,'Custom acquisition routine earns its fixed eight-Seed award');
select pg_temp.command(jsonb_build_object('type','routine.phase','taskId',pg_temp.value('routine_task'),'phase','maintenance'));
select pg_temp.remember('maintenance_assignment',pg_temp.command(jsonb_build_object('type','task.assign','taskId',pg_temp.value('routine_task')))->'result'->>'assignment_id');
select is((select t->'seed_award' from jsonb_array_elements(public.ghaf_read()->'tasks') t where t->>'id'=pg_temp.value('routine_task') and t->>'version'='2'),'null'::jsonb,'Future maintenance version displays no Seed award');
select is((select t->>'seed_award' from jsonb_array_elements(public.ghaf_read()->'tasks') t where t->>'id'=pg_temp.value('routine_task') and t->>'version'='1'),pg_temp.value('routine_award'),'Phase review preserves prior accepted terms');
select lives_ok($$select pg_temp.complete_task(pg_temp.value('maintenance_assignment')::uuid)$$,'Maintenance completion remains recordable');
select is(jsonb_array_length(public.ghaf_read()->'seed_entries'),3,'Maintenance cannot mint a fourth Seed entry');
select pg_temp.command(jsonb_build_object('type','routine.phase','taskId',pg_temp.value('routine_task'),'phase','acquisition'));
select pg_temp.command(jsonb_build_object('type','task.assign','taskId',pg_temp.value('routine_task')));
select is((select t->>'seed_award' from jsonb_array_elements(public.ghaf_read()->'tasks') t where t->>'id'=pg_temp.value('routine_task') and t->>'version'='3'),pg_temp.value('routine_award'),'Returning a future routine to acquisition restores the agreed fixed award');
select public.ghaf_read() as contract_snapshot,'parent_routine_and_adjustment_history' as contract_label;

select pg_temp.actor(2);
select is(public.ghaf_read()->'children','[]'::jsonb,'Another approved adult sees an empty independent family');
select throws_ok($$select pg_temp.command(jsonb_build_object('type','task.review','taskId',pg_temp.value('task')))$$,'PT400','not_found','Foreign task UUID cannot be reviewed');
select throws_ok($$select pg_temp.command(jsonb_build_object('type','recognition.apply','checkInId',pg_temp.value('checkin')))$$,'PT400','not_found','Foreign confirmation cannot be recognized');
select pg_temp.actor(1);
select lives_ok($$select pg_temp.command(jsonb_build_object('type','child.permissions','childId',pg_temp.value('child'),'voiceGranted',false,'mediaGranted',false,'aiGranted',true))$$,'Fresh Parent authentication changes explicit permission');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','child.update','childId',pg_temp.value('child'),'nickname','Core child','ageBand','6_8','age10PlusConfirmed',false,'preferredLanguage','en','avatarId','ghaf_tree'))$$,'Parent can correct an age without deleting earned card history');
select is(public.ghaf_read()#>'{extras,masroofi,cards,0,ageEligible}','false'::jsonb,'Server projects corrected age eligibility separately from retained card');
select is((public.ghaf_read()#>>'{extras,masroofi,cards,0,balanceFils}')::integer,500,'Age correction does not erase earned money');
select is((select c#>>'{preferences,custom_interest}' from jsonb_array_elements(public.ghaf_read()->'children') c where c->>'id'=pg_temp.value('child')),'Local plants','An age correction preserves omitted custom profile preferences');
select pg_temp.actor(3);
select throws_ok($$select pg_temp.command('{"type":"masroofi.purchase","fixtureId":"stationery"}')$$,'PT409','age_ineligible','Corrected under-ten profile cannot keep spending through direct RPC');
select public.ghaf_read() as contract_snapshot,'child_corrected_age_retained_ledger' as contract_label;
select pg_temp.actor(1);
select lives_ok($$select pg_temp.command('{"type":"community.participation","action":"continue"}')$$,'Parent grants future community contribution consent');
select lives_ok($$select pg_temp.command('{"type":"community.participation","action":"end_participation"}')$$,'Ending shared participation preserves permanent earned progress');
select is(jsonb_array_length(public.ghaf_read()->'seed_entries'),3,'Consent changes cannot deduct earned Seeds');
select lives_ok($$select pg_temp.command(jsonb_build_object('type','child.revoke','childId',pg_temp.value('child')))$$,'Parent revokes enrolled sessions without deleting Child data');
select pg_temp.actor(3);
select throws_ok($$select public.ghaf_read()$$,'42501','access_revoked','Revoked Child token immediately loses access');

-- A real legacy workspace is retained, imported once, and never treated as reward evidence.
select pg_temp.actor(2);
select pg_temp.command('{"type":"family.update","name":"Current family name","locale":"en"}');
select pg_temp.remember('existing_b_child',pg_temp.command('{"type":"child.create","nickname":"Already configured child","ageBand":"12_14","age10PlusConfirmed":true,"preferredLanguage":"en","avatarId":"leaf"}')->'result'->>'child_id');
select public.get_or_create_account_workspace();
select public.update_account_workspace(0,'{"type":"rename_family","name":"Legacy family"}');
select public.update_account_workspace(1,'{"type":"add_member","nickname":"Legacy child"}');
select pg_temp.remember('legacy_child',(select members->0->>'id' from public.account_workspaces));
select public.update_account_workspace(2,jsonb_build_object('type','add_task','childId',(select members->0->>'id' from public.account_workspaces),'title','Legacy completed task'));
select public.update_account_workspace(3,jsonb_build_object('type','complete_task','id',(select tasks->0->>'id' from public.account_workspaces),'completed',true));
select pg_temp.remember('family_b',public.ghaf_read()->'family'->>'id');
select lives_ok($$select pg_temp.command('{"type":"workspace.import"}')$$,'Existing workspace imports additively after a normalized Child was already created');
select is(public.ghaf_read()->'family'->>'id',pg_temp.value('family_b'),'Import never replaces the current family UUID');
select is(public.ghaf_read()->'family'->>'name','Current family name','Import never overwrites a more recent normalized family name');
select is((select c->>'nickname' from jsonb_array_elements(public.ghaf_read()->'children') c where c->>'id'=pg_temp.value('existing_b_child')),'Already configured child','Import preserves the existing configured profile');
select is((select c->'age_band' from jsonb_array_elements(public.ghaf_read()->'children') c where c->>'id'=pg_temp.value('legacy_child')),'null'::jsonb,'Unknown legacy age stays unknown');
select is(public.ghaf_read()->'legacy_records'->0->'completed','true'::jsonb,'Original Parent completion is preserved as a planning fact');
select is(public.ghaf_read()->'recognitions','[]'::jsonb,'Legacy completion does not fabricate Child/Parent evidence');
select is(public.ghaf_read()->'seed_entries','[]'::jsonb,'Legacy completion does not create Seeds');
select lives_ok($$select pg_temp.command('{"type":"workspace.import"}')$$,'Second import is idempotent');
select is(jsonb_array_length(public.ghaf_read()->'children'),2,'Repeated import preserves both existing and imported children without duplication');
select is((select count(*) from public.account_workspaces),1::bigint,'Original workspace row still exists');
select is((select tasks->0->>'title' from public.account_workspaces),'Legacy completed task','Original task payload is retained');
select throws_ok($$select public.update_account_workspace(4,'{"type":"rename_family","name":"Split writer"}')$$,'PT409','workspace_migrated','Legacy writers cannot compete after cutover');
select public.ghaf_read() as contract_snapshot,'parent_legacy_imported' as contract_label;
reset role;

select is((select count(*) from ghaf_private.community_signals),0::bigint,'Later consent does not backfill older recognition');
select is((select count(*) from ghaf_private.recognitions),5::bigint,'Import and consent retain the five genuine completion receipts');
select is((select count(*) from ghaf_private.children),4::bigint,'Revocation and additive import preserve all four fixture profiles');
select * from finish();
rollback;
