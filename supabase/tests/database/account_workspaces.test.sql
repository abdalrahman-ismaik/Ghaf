begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

select has_table('public', 'account_workspaces', 'A separate parent-owned cloud workspace exists');
select columns_are('public', 'account_workspaces',
  array['user_id', 'workspace_id', 'family_name', 'members', 'tasks', 'study_plans', 'revision', 'updated_at'],
  'Cloud workspace has no prototype session, Seed, reward or media fields');
select col_is_pk('public', 'account_workspaces', 'user_id', 'Each stable account has one workspace');
select ok((select relrowsecurity from pg_class where oid = 'public.account_workspaces'::regclass),
  'Workspace RLS is enabled');
select ok(not has_table_privilege('anon', 'public.account_workspaces', 'SELECT')
  and not has_table_privilege('authenticated', 'public.account_workspaces', 'INSERT')
  and not has_table_privilege('authenticated', 'public.account_workspaces', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.account_workspaces', 'DELETE'),
  'Anonymous reads and direct client mutations have no grants');
select ok((select bool_and(prosecdef and proconfig @> array['search_path=""']) from pg_proc
  where oid in ('public.get_or_create_account_workspace()'::regprocedure,
    'public.update_account_workspace(bigint,jsonb)'::regprocedure)),
  'Workspace RPCs use definer authority with an empty search path');
select ok(not has_function_privilege('anon', 'public.get_or_create_account_workspace()', 'EXECUTE')
  and not has_function_privilege('anon', 'public.update_account_workspace(bigint,jsonb)', 'EXECUTE'),
  'Anonymous users cannot invoke workspace RPCs');

insert into auth.users (id, aud, role, email, email_confirmed_at, raw_user_meta_data)
values
  ('01810000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'workspace-a@example.invalid', now(), '{}'),
  ('01810000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'workspace-b@example.invalid', now(), '{}'),
  ('01810000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'workspace-pending@example.invalid', now(), '{"status":"approved"}'),
  ('01810000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'workspace-unverified@example.invalid', null, '{}');
update public.pilot_access set status = 'approved'
where user_id in ('01810000-0000-4000-8000-000000000001', '01810000-0000-4000-8000-000000000002', '01810000-0000-4000-8000-000000000004');

set local role anon;
select throws_ok($$select * from public.account_workspaces$$, '42501', null, 'Anonymous table reads fail');
select throws_ok($$select public.get_or_create_account_workspace()$$, '42501', null, 'Anonymous initialization fails');
select throws_ok($$select public.update_account_workspace(0, '{"type":"rename_family","name":"Forged"}')$$,
  '42501', null, 'Anonymous commands fail');
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '01810000-0000-4000-8000-000000000001';
set local request.jwt.claims = '{"sub":"01810000-0000-4000-8000-000000000001","role":"authenticated"}';
select results_eq($$select user_id, family_name, members, tasks, study_plans, revision
  from public.get_or_create_account_workspace()$$,
  $$values ('01810000-0000-4000-8000-000000000001'::uuid, ''::text, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 0::bigint)$$,
  'Initialization derives the owner and creates empty real data only');
select ok((select workspace_id is not null and workspace_id <> user_id from public.account_workspaces),
  'The server generates a separate stable workspace UUID');
select is((select workspace_id from public.get_or_create_account_workspace()),
  (select workspace_id from public.account_workspaces), 'Repeated initialization retains the same workspace ID');
select is((select count(*) from public.account_workspaces), 1::bigint, 'Retries do not create duplicates');

select lives_ok($$select public.update_account_workspace(0, '{"type":"rename_family","name":"  Family A  "}')$$,
  'Rename stores an explicit family name');
select is((select family_name from public.account_workspaces), 'Family A', 'Names are trimmed by the server');
select lives_ok($$select public.update_account_workspace(1, '{"type":"add_member","nickname":"Synthetic member"}')$$,
  'Add a member with a generated identity');
select ok((select (members -> 0 ->> 'id')::uuid is not null and jsonb_array_length(members) = 1
  from public.account_workspaces), 'Member identity is a stable server-generated UUID');
select lives_ok($$select public.update_account_workspace(2, jsonb_build_object('type', 'rename_member',
  'id', (select members -> 0 ->> 'id' from public.account_workspaces), 'nickname', 'Edited nickname'))$$,
  'Rename an existing own member');
select is((select members -> 0 ->> 'nickname' from public.account_workspaces), 'Edited nickname', 'Member edit is durable');
select lives_ok($$select public.update_account_workspace(3, jsonb_build_object('type', 'add_task',
  'childId', (select members -> 0 ->> 'id' from public.account_workspaces), 'title', 'Synthetic task'))$$,
  'Add a task for a member belonging to this workspace');
select ok((select (tasks -> 0 ->> 'id')::uuid is not null and tasks -> 0 ->> 'completed' = 'false'
  from public.account_workspaces), 'New tasks start incomplete with a server UUID');
select lives_ok($$select public.update_account_workspace(4, jsonb_build_object('type', 'edit_task',
  'id', (select tasks -> 0 ->> 'id' from public.account_workspaces), 'title', 'Edited task'))$$,
  'Edit the own task title');
select lives_ok($$select public.update_account_workspace(5, jsonb_build_object('type', 'complete_task',
  'id', (select tasks -> 0 ->> 'id' from public.account_workspaces), 'completed', true))$$,
  'Record task completion as an explicit parent command');
select is((select tasks -> 0 ->> 'completed' from public.account_workspaces), 'true', 'Completion persists');
select lives_ok($$select public.update_account_workspace(6, jsonb_build_object('type', 'complete_task',
  'id', (select tasks -> 0 ->> 'id' from public.account_workspaces), 'completed', false))$$,
  'Completion can be reversed without a reward-engine mutation');
select lives_ok($$select public.update_account_workspace(7, jsonb_build_object('type', 'add_study_plan',
  'childId', (select members -> 0 ->> 'id' from public.account_workspaces), 'subject', 'Math', 'nextStep', 'Read one worked example'))$$,
  'Add a study plan for an own member');
select ok((select (study_plans -> 0 ->> 'id')::uuid is not null
  and study_plans -> 0 ->> 'completed' = 'false' from public.account_workspaces),
  'Study plan receives a UUID and starts incomplete');
select lives_ok($$select public.update_account_workspace(8, jsonb_build_object('type', 'edit_study_plan',
  'id', (select study_plans -> 0 ->> 'id' from public.account_workspaces), 'subject', 'Science', 'nextStep', 'Try the first example'))$$,
  'Edit an own study plan without replacing its identity');
select lives_ok($$select public.update_account_workspace(9, jsonb_build_object('type', 'complete_study_plan',
  'id', (select study_plans -> 0 ->> 'id' from public.account_workspaces), 'completed', true))$$,
  'Record study completion');
select lives_ok($$select public.update_account_workspace(10, jsonb_build_object('type', 'complete_study_plan',
  'id', (select study_plans -> 0 ->> 'id' from public.account_workspaces), 'completed', false))$$,
  'Reverse study completion');
select is((select revision from public.account_workspaces), 11::bigint, 'Each accepted command advances one revision');
select is((select revision from public.get_or_create_account_workspace()), 11::bigint,
  'Login retry preserves command history revision');
select throws_ok($$select public.update_account_workspace(10, '{"type":"rename_family","name":"Stale"}')$$,
  'PT409', 'profile_conflict', 'A stale second-device edit fails');
select is((select family_name from public.account_workspaces), 'Family A', 'Conflict preserves the newer family record');

select throws_ok($$select public.update_account_workspace(11, '{"type":"add_member","nickname":"Forged","id":"01810000-0000-4000-8000-000000000099"}')$$,
  'PT400', 'invalid_profile', 'The client cannot choose a new member UUID');
select throws_ok($$select public.update_account_workspace(11, '{"type":"rename_family","name":"Forged","userId":"01810000-0000-4000-8000-000000000002"}')$$,
  'PT400', 'invalid_profile', 'Commands reject a forged owner key');
select throws_ok($$select public.update_account_workspace(11, '{"type":"rename_family","name":""}')$$,
  'PT400', 'invalid_profile', 'Blank names fail');
select throws_ok($$select public.update_account_workspace(11, jsonb_build_object('type', 'rename_family', 'name', repeat('ن', 81)))$$,
  'PT400', 'invalid_profile', 'Names are bounded in Unicode characters');
select throws_ok($$select public.update_account_workspace(11, '{"type":"rename_family","name":null}')$$,
  'PT400', 'invalid_profile', 'Null text cannot bypass validation');
select throws_ok($$select public.update_account_workspace(11, '{"type":"rename_family"}')$$,
  'PT400', 'invalid_profile', 'Missing required command keys fail');
select throws_ok($$select public.update_account_workspace(11, '[]')$$,
  'PT400', 'invalid_profile', 'Non-object commands fail');
select throws_ok($$select public.update_account_workspace(11, '{"type":"delete_workspace"}')$$,
  'PT400', 'invalid_profile', 'Unapproved commands fail');
select throws_ok($$select public.update_account_workspace(-1, '{"type":"rename_family","name":"Invalid"}')$$,
  'PT400', 'invalid_profile', 'Negative revisions fail');
select throws_ok($$select public.update_account_workspace(9007199254740991, '{"type":"rename_family","name":"Invalid"}')$$,
  'PT400', 'invalid_profile', 'Unsafe revision increments fail');
select throws_ok($$select public.update_account_workspace(11, '{"type":"add_task","childId":"01810000-0000-4000-8000-000000000099","title":"Foreign"}')$$,
  'PT400', 'invalid_profile', 'Tasks cannot reference a foreign or nonexistent member');
select throws_ok($$select public.update_account_workspace(11, '{"type":"rename_member","id":"01810000-0000-4000-8000-000000000099","nickname":"Foreign"}')$$,
  'PT400', 'invalid_profile', 'Member edits cannot target a foreign UUID');
select throws_ok($$select public.update_account_workspace(11, '{"type":"edit_task","id":"01810000-0000-4000-8000-000000000099","title":"Foreign"}')$$,
  'PT400', 'invalid_profile', 'Task edits cannot target a foreign UUID');
select throws_ok($$select public.update_account_workspace(11, '{"type":"complete_task","id":"01810000-0000-4000-8000-000000000099","completed":true}')$$,
  'PT400', 'invalid_profile', 'Task completion cannot target a foreign UUID');
select throws_ok($$select public.update_account_workspace(11, '{"type":"add_study_plan","childId":"01810000-0000-4000-8000-000000000099","subject":"Math","nextStep":"Foreign"}')$$,
  'PT400', 'invalid_profile', 'Study plans cannot reference a foreign member');
select throws_ok($$select public.update_account_workspace(11, '{"type":"edit_study_plan","id":"01810000-0000-4000-8000-000000000099","subject":"Math","nextStep":"Foreign"}')$$,
  'PT400', 'invalid_profile', 'Study edits cannot target a foreign plan');
select throws_ok($$select public.update_account_workspace(11, '{"type":"complete_study_plan","id":"01810000-0000-4000-8000-000000000099","completed":true}')$$,
  'PT400', 'invalid_profile', 'Study completion cannot target a foreign plan');
select throws_ok($$select public.update_account_workspace(11, jsonb_build_object('type', 'edit_task',
  'id', (select tasks -> 0 ->> 'id' from public.account_workspaces), 'title', repeat('x', 161)))$$,
  'PT400', 'invalid_profile', 'Task titles have a server bound');
select throws_ok($$select public.update_account_workspace(11, jsonb_build_object('type', 'edit_study_plan',
  'id', (select study_plans -> 0 ->> 'id' from public.account_workspaces), 'subject', 'Math', 'nextStep', repeat('x', 301)))$$,
  'PT400', 'invalid_profile', 'Next steps have a server bound');
select throws_ok($$select public.update_account_workspace(11, jsonb_build_object('type', 'complete_task',
  'id', (select tasks -> 0 ->> 'id' from public.account_workspaces), 'completed', 'true'))$$,
  'PT400', 'invalid_profile', 'Boolean completion cannot be replaced with a truthy string');
select is((select revision from public.account_workspaces), 11::bigint, 'Rejected commands never mutate the revision');
select throws_ok($$select public.get_or_create_account_workspace(p_user_id => '01810000-0000-4000-8000-000000000002'::uuid)$$,
  '42883', null, 'Initialization accepts no owner parameter');
select throws_ok($$select public.update_account_workspace(11, '{"type":"rename_family","name":"Forged"}',
  p_user_id => '01810000-0000-4000-8000-000000000002'::uuid)$$,
  '42883', null, 'Workspace updates accept no owner parameter');

set local request.jwt.claim.sub = '01810000-0000-4000-8000-000000000002';
set local request.jwt.claims = '{"sub":"01810000-0000-4000-8000-000000000002","role":"authenticated"}';
select is((select count(*) from public.account_workspaces), 0::bigint, 'B sees none of A private workspace');
select is((select count(*) from public.account_workspaces where user_id = '01810000-0000-4000-8000-000000000001'),
  0::bigint, 'An explicit forged select cannot expose A');
select throws_ok($$update public.account_workspaces set family_name = 'Forged'
  where user_id = '01810000-0000-4000-8000-000000000001'$$, '42501', null, 'B cannot directly edit A');
select throws_ok($$delete from public.account_workspaces where user_id = '01810000-0000-4000-8000-000000000001'$$,
  '42501', null, 'B cannot delete A');
select throws_ok($$insert into public.account_workspaces(user_id)
  values ('01810000-0000-4000-8000-000000000002')$$, '42501', null, 'Direct client inserts fail');
select lives_ok($$select public.get_or_create_account_workspace()$$, 'B creates a separate workspace');
select is((select family_name from public.account_workspaces), '', 'B never inherits A family name or local demo data');
reset role;

-- Trusted synthetic fixtures reach each cap without hundreds of RPCs; clients cannot write these arrays.
update public.account_workspaces set
  members = (select jsonb_agg(jsonb_build_object('id', gen_random_uuid(), 'nickname', 'Synthetic member')) from generate_series(1, 20))
where user_id = '01810000-0000-4000-8000-000000000002';
update public.account_workspaces set
  tasks = (select jsonb_agg(jsonb_build_object('id', gen_random_uuid(), 'childId', members -> 0 ->> 'id', 'title', 'Synthetic task ' || item.number::text, 'completed', false)) from generate_series(1, 200) as item(number)),
  study_plans = (select jsonb_agg(jsonb_build_object('id', gen_random_uuid(), 'childId', members -> 0 ->> 'id', 'subject', 'Math', 'nextStep', 'Read example ' || item.number::text, 'completed', false)) from generate_series(1, 200) as item(number))
where user_id = '01810000-0000-4000-8000-000000000002';
set local role authenticated;
select throws_ok($$select public.update_account_workspace(0, '{"type":"add_member","nickname":"Too many"}')$$,
  'PT400', 'invalid_profile', 'Member cap is enforced on the server');
select throws_ok($$select public.update_account_workspace(0, jsonb_build_object('type', 'add_task',
  'childId', (select members -> 0 ->> 'id' from public.account_workspaces), 'title', 'Too many'))$$,
  'PT400', 'invalid_profile', 'Task cap is enforced on the server');
select throws_ok($$select public.update_account_workspace(0, jsonb_build_object('type', 'add_study_plan',
  'childId', (select members -> 0 ->> 'id' from public.account_workspaces), 'subject', 'Math', 'nextStep', 'Too many'))$$,
  'PT400', 'invalid_profile', 'Study plan cap is enforced on the server');
select is((select revision from public.account_workspaces), 0::bigint, 'Cap rejections preserve the revision');

set local request.jwt.claim.sub = '01810000-0000-4000-8000-000000000003';
set local request.jwt.claims = '{"sub":"01810000-0000-4000-8000-000000000003","role":"authenticated","user_metadata":{"status":"approved"}}';
select throws_ok($$select public.get_or_create_account_workspace()$$, '42501', 'access_unavailable',
  'Pending adults cannot forge approval with metadata');
set local request.jwt.claim.sub = '01810000-0000-4000-8000-000000000004';
set local request.jwt.claims = '{"sub":"01810000-0000-4000-8000-000000000004","role":"authenticated"}';
select throws_ok($$select public.get_or_create_account_workspace()$$, '42501', 'access_unavailable',
  'Approval alone does not bypass email verification');
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{"role":"authenticated"}';
select is((select count(*) from public.account_workspaces), 0::bigint, 'Missing identity reveals no workspace');
select throws_ok($$select public.get_or_create_account_workspace()$$, '42501', 'access_unavailable', 'Missing identity fails closed');
reset role;

update public.pilot_access set status = 'suspended' where user_id = '01810000-0000-4000-8000-000000000001';
set local role authenticated;
set local request.jwt.claim.sub = '01810000-0000-4000-8000-000000000001';
set local request.jwt.claims = '{"sub":"01810000-0000-4000-8000-000000000001","role":"authenticated"}';
select is((select count(*) from public.account_workspaces), 0::bigint, 'Suspension denies direct own-workspace reads');
select throws_ok($$select public.get_or_create_account_workspace()$$, '42501', 'access_unavailable', 'Suspension denies workspace refresh');
select throws_ok($$select public.update_account_workspace(11, '{"type":"rename_family","name":"Suspended"}')$$,
  '42501', 'access_unavailable', 'Suspension denies commands');
reset role;
select is((select revision from public.account_workspaces where user_id = '01810000-0000-4000-8000-000000000001'),
  11::bigint, 'Denied access never deletes or changes the cloud records');

select * from finish();
rollback;
