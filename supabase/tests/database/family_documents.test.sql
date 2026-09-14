begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();

insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous) values
 ('020d0000-0000-4000-8000-000000000001','authenticated','authenticated','documents-a@example.invalid',now(),false),
 ('020d0000-0000-4000-8000-000000000002','authenticated','authenticated','documents-b@example.invalid',now(),false),
 ('020d0000-0000-4000-8000-000000000003','authenticated','authenticated',null,null,true),
 ('020d0000-0000-4000-8000-000000000004','authenticated','authenticated',null,null,true);
insert into auth.sessions(id,user_id,created_at,updated_at)
 select ('020d1000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('020d0000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,now(),now() from generate_series(1,4)n;
update public.pilot_access set status='approved' where user_id in ('020d0000-0000-4000-8000-000000000001','020d0000-0000-4000-8000-000000000002');
insert into public.app_families(id,owner_id,name) values
 ('020d2000-0000-4000-8000-000000000001','020d0000-0000-4000-8000-000000000001','Explicit document family A'),
 ('020d2000-0000-4000-8000-000000000002','020d0000-0000-4000-8000-000000000002','Explicit document family B');
insert into public.app_children(id,family_id,display_name,age_band) values
 ('020d3000-0000-4000-8000-000000000001','020d2000-0000-4000-8000-000000000001','Document Child A','9_11'),
 ('020d3000-0000-4000-8000-000000000002','020d2000-0000-4000-8000-000000000001','Document Child B','12_14');
insert into public.app_family_members(family_id,auth_user_id,role,child_id,session_id) values
 ('020d2000-0000-4000-8000-000000000001','020d0000-0000-4000-8000-000000000001','parent',null,null),
 ('020d2000-0000-4000-8000-000000000002','020d0000-0000-4000-8000-000000000002','parent',null,null),
 ('020d2000-0000-4000-8000-000000000001','020d0000-0000-4000-8000-000000000003','child','020d3000-0000-4000-8000-000000000001','020d1000-0000-4000-8000-000000000003'),
 ('020d2000-0000-4000-8000-000000000001','020d0000-0000-4000-8000-000000000004','child','020d3000-0000-4000-8000-000000000002','020d1000-0000-4000-8000-000000000004');
create temporary table document_state(key text primary key,value jsonb);
grant all on document_state to authenticated;
create function pg_temp.doc_actor(n integer) returns void language plpgsql as $$ begin
 perform set_config('request.jwt.claim.sub','020d0000-0000-4000-8000-'||lpad(n::text,12,'0'),true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub','020d0000-0000-4000-8000-'||lpad(n::text,12,'0'),'session_id','020d1000-0000-4000-8000-'||lpad(n::text,12,'0'),'role','authenticated')::text,true);
end $$;
create function pg_temp.doc_command(c jsonb,r uuid default gen_random_uuid()) returns jsonb language sql as $$
 select public.ghaf_family_document_command('020d2000-0000-4000-8000-000000000001',r,c) $$;
create function pg_temp.study_command(c jsonb) returns jsonb language plpgsql as $$ declare rev bigint; begin
 select revision into rev from public.app_family_documents where family_id='020d2000-0000-4000-8000-000000000001' and payload->>'id'=c->>'id';
 return pg_temp.doc_command(jsonb_build_object('type','study','expectedRevision',coalesce(rev,0),'command',c));
end $$;
create function pg_temp.goal_input(c jsonb default '{"kind":"practice_count","target":3}') returns jsonb language sql as $$
 select jsonb_build_object('subject','Reading','title','Read and discuss','nextStep','Read a chosen page','parentSupport','Choose a quiet shared time',
  'criterion',c,'prize',jsonb_build_object('kind','experience','label','Choose a family game'),'targetDate','2026-12-10','reviewDate','2026-12-20') $$;
create function pg_temp.goal_create(i text,c jsonb default '{"kind":"practice_count","target":3}') returns jsonb language sql as $$
 select pg_temp.study_command(jsonb_build_object('type','goal.create','id',i,'childId','020d3000-0000-4000-8000-000000000001','input',pg_temp.goal_input(c))) $$;
create function pg_temp.payload(i text) returns jsonb language sql as $$
 select payload from public.app_family_documents where family_id='020d2000-0000-4000-8000-000000000001' and payload->>'id'=i $$;

select ok((select bool_and(relrowsecurity) from pg_class where oid in ('public.app_family_documents'::regclass,'public.app_family_document_requests'::regclass)),'Documents and request receipts have RLS');
select ok(not has_table_privilege('authenticated','public.app_family_documents','INSERT') and not has_table_privilege('authenticated','public.app_family_document_requests','SELECT'),'Client cannot upload state or read private receipts');
select ok(not has_function_privilege('anon','public.ghaf_family_document_command(uuid,uuid,jsonb)','EXECUTE'),'Unauthenticated callers cannot invoke document commands');
set local role authenticated;
select pg_temp.doc_actor(1);
select is((select count(*) from public.ghaf_family_documents('020d2000-0000-4000-8000-000000000001')),0::bigint,'A new family has no sample study, connections or learning evidence');
select throws_ok($$insert into public.app_family_documents(family_id,kind,payload) values('020d2000-0000-4000-8000-000000000001','connections','{}')$$,'42501','permission denied for table app_family_documents','Direct client state writes are denied');
insert into document_state values('create-command',jsonb_build_object('type','study','expectedRevision',0,'command',jsonb_build_object('type','plan.create','id','plan-one','childId','020d3000-0000-4000-8000-000000000001','input',jsonb_build_object('subject','Math','title','Recall one example','nextStep','Choose an example','durationMinutes',15,'dueDate','2026-12-11','revisitDate',null))));
select lives_ok($$select pg_temp.doc_command((select value from document_state where key='create-command'),'020d4000-0000-4000-8000-000000000001')$$,'Parent creates a full study proposal');
select is(pg_temp.payload('plan-one')->>'status','proposed','Parent plan requires Child acceptance');
select lives_ok($$select pg_temp.doc_command((select value from document_state where key='create-command'),'020d4000-0000-4000-8000-000000000001')$$,'Exact uncertain-network create retry succeeds');
select is((select count(*) from public.app_family_documents where kind='study_plan'),1::bigint,'Create retry does not duplicate the plan');
select throws_ok($$select pg_temp.doc_command(jsonb_set((select value from document_state where key='create-command'),'{command,input,title}','"Changed"'),'020d4000-0000-4000-8000-000000000001')$$,'40001','request_conflict','A request UUID cannot bind new wording');
select throws_ok($$select pg_temp.study_command('{"type":"plan.complete","id":"plan-one"}')$$,'42501','access_unavailable','Parent cannot impersonate Child completion');
select throws_ok($$select pg_temp.doc_command(jsonb_set((select value from document_state where key='create-command'),'{command,input,dueDate}','"2026-02-30"'))$$,'40001','request_conflict','Existing plan ID cannot be overwritten by another create');
select throws_ok($$select pg_temp.study_command('{"type":"plan.create","id":"invalid-date","childId":"020d3000-0000-4000-8000-000000000001","input":{"subject":"Math","title":"Work","nextStep":"Read","durationMinutes":15,"dueDate":"2026-02-30","revisitDate":null}}')$$,'22023','invalid_command','Real calendar dates are validated by the server');
select lives_ok($$select pg_temp.goal_create('goal-one')$$,'Full dated practice goal and private prize persist');
select throws_ok($$select pg_temp.study_command(jsonb_build_object('type','goal.edit','id','goal-one','expectedRevision',1,'input',pg_temp.goal_input()||'{"reviewDate":"2026-12-01"}'))$$,'22023','invalid_command','Review-before-target is rejected');
select lives_ok($$select pg_temp.study_command('{"type":"goal.approve","id":"goal-one","expectedRevision":1}')$$,'Parent approves exact goal revision');
select lives_ok($$select pg_temp.study_command(jsonb_build_object('type','goal.edit','id','goal-one','expectedRevision',1,'input',pg_temp.goal_input()||'{"title":"Updated before agreement"}'))$$,'Editing unaccepted terms creates a new agreement');
select is(pg_temp.payload('goal-one')->'parentApprovedRevision','null'::jsonb,'Editing invalidates earlier Parent approval');
select lives_ok($$select pg_temp.study_command('{"type":"goal.approve","id":"goal-one","expectedRevision":2}')$$,'Parent approves replacement revision');

select pg_temp.doc_actor(3);
select throws_ok($$select pg_temp.study_command('{"type":"plan.complete","id":"plan-one"}')$$,'22023','invalid_transition','Unaccepted Parent plan cannot complete');
select lives_ok($$select pg_temp.study_command('{"type":"plan.accept","id":"plan-one"}')$$,'Child accepts its own plan');
select lives_ok($$select pg_temp.study_command('{"type":"plan.start","id":"plan-one"}')$$,'Child starts');
select lives_ok($$select pg_temp.study_command('{"type":"plan.help","id":"plan-one","request":"together"}')$$,'Child requests permitted help');
select lives_ok($$select pg_temp.study_command('{"type":"plan.pause","id":"plan-one"}')$$,'Child pauses without losing progress');
select lives_ok($$select pg_temp.study_command('{"type":"plan.start","id":"plan-one"}')$$,'Child resumes');
select lives_ok($$select pg_temp.study_command('{"type":"plan.complete","id":"plan-one"}')$$,'Child self-reports completion');
insert into document_state values('completed-at',pg_temp.payload('plan-one')->'completedAt');
select lives_ok($$select pg_temp.study_command('{"type":"plan.complete","id":"plan-one"}')$$,'Repeated completion is idempotent');
select is(pg_temp.payload('plan-one')->'completedAt',(select value from document_state where key='completed-at'),'Original completion evidence remains unchanged');
select lives_ok($$select pg_temp.study_command('{"type":"plan.revisit","id":"plan-one","date":"2027-01-02"}')$$,'Revisit preserves completed history');
select throws_ok($$select pg_temp.study_command('{"type":"goal.approve","id":"goal-one","expectedRevision":2}')$$,'42501','access_unavailable','Child cannot approve its own goal');
select lives_ok($$select pg_temp.study_command('{"type":"goal.accept","id":"goal-one","expectedRevision":2}')$$,'Child agrees to exact Parent-approved terms');
select lives_ok($$select pg_temp.study_command('{"type":"goal.pause","id":"goal-one"}')$$,'Accepted goal can pause');
select lives_ok($$select pg_temp.study_command('{"type":"goal.resume","id":"goal-one"}')$$,'Paused goal can resume');
select lives_ok($$select pg_temp.study_command('{"type":"goal.request_change","id":"goal-one"}')$$,'Child may request a change without mutating agreement');
select lives_ok($$select pg_temp.study_command('{"type":"goal.resume","id":"goal-one"}')$$,'Child may resume unchanged agreement');
select throws_ok($$select pg_temp.study_command(jsonb_build_object('type','goal.edit','id','goal-one','expectedRevision',2,'input',pg_temp.goal_input()||'{"targetDate":"2027-01-01","reviewDate":"2027-01-02"}'))$$,'22023','invalid_transition','Accepted dates and prize cannot be edited');
select lives_ok($$select pg_temp.study_command('{"type":"goal.submit","id":"goal-one","submissionId":"report-one","result":{"kind":"practice_count","count":1}}')$$,'Child submits a below-target self-report');
select throws_ok($$select pg_temp.study_command('{"type":"goal.confirm","id":"goal-one","submissionId":"report-one","acknowledgement":"I read one page"}')$$,'42501','access_unavailable','Child cannot confirm or unlock its prize');
select pg_temp.doc_actor(1);
select lives_ok($$select pg_temp.study_command('{"type":"plan.help_resolved","id":"plan-one"}')$$,'Parent resolves requested help');
select lives_ok($$select pg_temp.study_command('{"type":"goal.confirm","id":"goal-one","submissionId":"report-one","acknowledgement":"You chose a manageable step"}')$$,'Parent reviews actual reported criterion');
select is(pg_temp.payload('goal-one')->>'status','active','Below-target review returns to active without loss');
select is(pg_temp.payload('goal-one')->>'prizeStatus','promised','Below-target review does not unlock a prize');
select pg_temp.doc_actor(3);
select lives_ok($$select pg_temp.study_command('{"type":"goal.submit","id":"goal-one","submissionId":"report-two","result":{"kind":"practice_count","count":3}}')$$,'Child can retry with another result');
select pg_temp.doc_actor(1);
select lives_ok($$select pg_temp.study_command('{"type":"goal.confirm","id":"goal-one","submissionId":"report-two","acknowledgement":"You completed the agreed practice with help"}')$$,'Parent confirms successful agreed criterion');
select is(pg_temp.payload('goal-one')->>'prizeStatus','unlocked','Confirmed achievement unlocks only the private promise');
insert into document_state values('unlocked',pg_temp.payload('goal-one'));
select lives_ok($$select pg_temp.study_command('{"type":"goal.confirm","id":"goal-one","submissionId":"report-two","acknowledgement":"A repeated request"}')$$,'Repeated confirmation is idempotent');
select is(pg_temp.payload('goal-one'),(select value from document_state where key='unlocked'),'Retry cannot overwrite acknowledgement or unlock timestamp');
select lives_ok($$select pg_temp.study_command('{"type":"goal.give","id":"goal-one"}')$$,'Only Parent records external prize fulfillment');
select is(pg_temp.payload('goal-one')->>'prizeStatus','given','Fulfilled prize remains given');
select is(jsonb_array_length(public.ghaf_family_snapshot('020d2000-0000-4000-8000-000000000001')->'recognitions'),0,'Study and prizes create no Seeds or garden authority');

select lives_ok($$select pg_temp.goal_create('mark-goal','{"kind":"mark","threshold":8,"denominator":10}')$$,'Numeric criteria preserve threshold and denominator');
select lives_ok($$select pg_temp.goal_create('achievement-goal','{"kind":"achievement","description":"Finish an agreed draft"}')$$,'Described achievement criteria persist');
select lives_ok($$select pg_temp.study_command('{"type":"goal.approve","id":"mark-goal","expectedRevision":1}')$$,'Parent approves numeric goal');
select lives_ok($$select pg_temp.study_command('{"type":"goal.approve","id":"achievement-goal","expectedRevision":1}')$$,'Parent approves described achievement');
select pg_temp.doc_actor(3);
select lives_ok($$select pg_temp.study_command('{"type":"goal.accept","id":"mark-goal","expectedRevision":1}')$$,'Child accepts numeric goal');
select throws_ok($$select pg_temp.study_command('{"type":"goal.submit","id":"mark-goal","submissionId":"invalid-mark","result":{"kind":"mark","value":11}}')$$,'22023','invalid_command','Reported mark cannot exceed the agreed denominator');
select lives_ok($$select pg_temp.study_command('{"type":"goal.submit","id":"mark-goal","submissionId":"mark-report","result":{"kind":"mark","value":8.5}}')$$,'Decimal self-reported mark stays measurable');
select lives_ok($$select pg_temp.study_command('{"type":"goal.accept","id":"achievement-goal","expectedRevision":1}')$$,'Child accepts described achievement');
select lives_ok($$select pg_temp.study_command('{"type":"goal.submit","id":"achievement-goal","submissionId":"achievement-report","result":{"kind":"achievement","achieved":true}}')$$,'Child reports described achievement');
select pg_temp.doc_actor(1);
select lives_ok($$select pg_temp.study_command('{"type":"goal.confirm","id":"mark-goal","submissionId":"mark-report","acknowledgement":"You reviewed your work"}')$$,'Parent confirms reported numeric threshold');
select lives_ok($$select pg_temp.study_command('{"type":"goal.confirm","id":"achievement-goal","submissionId":"achievement-report","acknowledgement":"You finished your chosen draft"}')$$,'Parent confirms described achievement');
select is(pg_temp.payload('mark-goal')->>'prizeStatus','unlocked','Numeric goal prize uses the same protected lifecycle');
select throws_ok($$select pg_temp.goal_create('bad-mark','{"kind":"mark","threshold":11,"denominator":10}')$$,'22023','invalid_command','Invalid mark denominator/threshold rejected');
select lives_ok($$select pg_temp.doc_command('{"type":"connections.save","expectedRevision":0,"input":{"primaryGuardianName":"Actual Parent","secondaryGuardianName":"","relatives":[]}}')$$,'First explicit connections save needs no relatives or fake names');
select lives_ok($$select pg_temp.doc_command('{"type":"template.save","id":null,"expectedRevision":0,"input":{"categoryId":"home_responsibility","title":{"ar":"ترتيب الكتب","en":"Arrange books"},"positiveAction":{"ar":"ضع الكتب في مكانها","en":"Put agreed books away"},"recurrence":"once"}}')$$,'Parent saves reusable bilingual wording');
insert into document_state select 'template-id',to_jsonb(id) from public.app_family_documents where kind='saved_template';
select throws_ok($$select pg_temp.doc_command('{"type":"template.save","id":null,"expectedRevision":0,"input":{"categoryId":"home_responsibility","title":{"ar":"ترتيب الكتب","en":"Arrange books"},"positiveAction":{"ar":"ضع الكتب في مكانها","en":"Put agreed books away"},"recurrence":"once"}}')$$,'40001','request_conflict','Duplicate saved wording is rejected under the family lock');
select lives_ok($$select pg_temp.doc_command('{"type":"preferences.save","childId":"020d3000-0000-4000-8000-000000000001","expectedRevision":0,"input":{"avatarId":"leaf","preferredLanguage":"both","sex":"male","interests":["nature"],"hobbies":[],"accessibilityDefaults":["reduced_motion"],"supportPreferences":["adult_alongside"],"customInterest":null,"customHobby":null,"customSupportPreference":null,"customAccessibility":null,"personalizationEnabled":false}}')$$,'Parent persists explicit preference opt-out and accessibility');
select pg_temp.doc_actor(3);
select is((select count(*) from public.app_family_documents where kind in ('connections','saved_template')),0::bigint,'Parent-only names and saved wording are excluded by RLS');
select throws_ok($$select pg_temp.doc_command('{"type":"connections.save","expectedRevision":1,"input":{"primaryGuardianName":"Impersonated","secondaryGuardianName":"","relatives":[]}}')$$,'42501','access_unavailable','Child cannot bypass Parent directory control');
select throws_ok($$select pg_temp.doc_command('{"type":"learning.complete","route":"story"}')$$,'22023','invalid_transition','Unstarted locked learning cannot be manufactured');
reset role;
insert into public.app_tasks(family_id,child_id,catalog_id,template,status)
 select '020d2000-0000-4000-8000-000000000001','020d3000-0000-4000-8000-000000000001',c.id,c.template,'recognized'
 from public.app_task_catalog c cross join generate_series(1,11) n where c.id='task_recycling_p0_v1';
insert into public.app_recognitions(family_id,child_id,task_id,seeds,landscape_id,canopy_contribution)
 select family_id,child_id,id,12,'mangrove',1 from public.app_tasks where family_id='020d2000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.doc_actor(3);
select lives_ok($$select pg_temp.doc_command('{"type":"learning.start","route":"accessible"}')$$,'Actual server threshold unlocks the accessible learning route');
select throws_ok($$select pg_temp.doc_command('{"type":"learning.step","route":"accessible","stepId":"accessible_section_2"}')$$,'22023','invalid_transition','Learning sections cannot skip prerequisite order');
select lives_ok($$select pg_temp.doc_command('{"type":"learning.step","route":"accessible","stepId":"accessible_section_1"}')$$,'First accessible section persists');
select lives_ok($$select pg_temp.doc_command('{"type":"learning.step","route":"accessible","stepId":"accessible_section_2"}')$$,'Second accessible section persists');
select lives_ok($$select pg_temp.doc_command('{"type":"learning.check","route":"accessible","optionId":"visit_or_task_reward"}')$$,'An incorrect check retains progress and permits retry');
select throws_ok($$select pg_temp.doc_command('{"type":"learning.complete","route":"accessible"}')$$,'22023','invalid_transition','Incorrect check cannot manufacture completion');
select lives_ok($$select pg_temp.doc_command('{"type":"learning.check","route":"accessible","optionId":"habitat_support_and_care"}')$$,'Exact package check satisfies accessible route');
select lives_ok($$select pg_temp.doc_command('{"type":"learning.complete","route":"accessible"}')$$,'Accessible completion persists once');
insert into document_state select 'learning-completed',payload->'completedAt' from public.app_family_documents where kind='learning';
select lives_ok($$select pg_temp.doc_command('{"type":"learning.complete","route":"story"}')$$,'Another route cannot duplicate package credit');
select is((select payload->'completedAt' from public.app_family_documents where kind='learning'),(select value from document_state where key='learning-completed'),'Package completion timestamp remains immutable');
select is((select sum((value->>'seeds')::bigint) from jsonb_array_elements(public.ghaf_family_snapshot('020d2000-0000-4000-8000-000000000001')->'recognitions')),132::numeric,'Learning creates no extra Seed recognition');
select pg_temp.doc_actor(4);
select is((select count(*) from public.ghaf_family_documents('020d2000-0000-4000-8000-000000000001')),0::bigint,'Sibling sees no other Child study, marks or preferences');
select throws_ok($$select pg_temp.doc_command('{"type":"study","expectedRevision":1,"command":{"type":"goal.give","id":"goal-one"}}')$$,'42501','access_unavailable','Sibling cannot mutate another Child goal');
select pg_temp.doc_actor(2);
select is((select count(*) from public.app_family_documents),0::bigint,'Another family sees no documents');
select throws_ok($$select public.ghaf_family_documents('020d2000-0000-4000-8000-000000000001')$$,'42501','family_unavailable','Forged family read denied');
select throws_ok($$select pg_temp.doc_command((select value from document_state where key='create-command'),'020d4000-0000-4000-8000-000000000001')$$,'42501','family_unavailable','Foreign caller cannot replay another family request');
reset role;
update public.app_family_members set active=false where auth_user_id='020d0000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.doc_actor(1);
select throws_ok($$select pg_temp.doc_command((select value from document_state where key='create-command'),'020d4000-0000-4000-8000-000000000001')$$,'42501','family_unavailable','Revocation is checked before a previously committed retry');
select is((select count(*) from public.app_family_documents),0::bigint,'Revoked membership loses direct RLS reads');
reset role;
select * from finish();
rollback;
