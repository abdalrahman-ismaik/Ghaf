begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

select ok((select prosecdef and provolatile = 's' and proconfig @> array['search_path=""']
  from pg_proc where oid = 'public.can_access_account_profile()'::regprocedure),
  'Provider status predicate retains stable definer authority with an empty search path');
select ok(has_function_privilege('authenticated', 'public.can_access_account_profile()', 'EXECUTE')
  and not has_function_privilege('anon', 'public.can_access_account_profile()', 'EXECUTE')
  and not has_function_privilege('service_role', 'public.can_access_account_profile()', 'EXECUTE'),
  'The no-argument access predicate retains its authenticated-only execution grant');

-- These transaction-only identities never reuse the persistent integration fixtures.
insert into auth.users (id, aud, role, email, email_confirmed_at, is_anonymous)
values
  ('01820000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'status-normal@example.invalid', now(), false),
  ('01820000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'status-expired-ban@example.invalid', now(), false),
  ('01820000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'status-active-ban@example.invalid', now(), false),
  ('01820000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'status-deleted@example.invalid', now(), false),
  ('01820000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'status-anonymous@example.invalid', now(), false);
update public.pilot_access set status = 'approved'
where user_id in (
  '01820000-0000-4000-8000-000000000001', '01820000-0000-4000-8000-000000000002',
  '01820000-0000-4000-8000-000000000003', '01820000-0000-4000-8000-000000000004',
  '01820000-0000-4000-8000-000000000005');

insert into public.account_profiles (user_id, display_name, preferred_locale, revision)
select id, 'Synthetic status profile', 'en', 4 from auth.users
where id in ('01820000-0000-4000-8000-000000000003',
  '01820000-0000-4000-8000-000000000004', '01820000-0000-4000-8000-000000000005');
insert into public.account_workspaces (user_id, family_name, members, tasks, study_plans, revision)
select id, 'Synthetic status family',
  '[{"id":"01820000-0000-4000-8000-000000000011","nickname":"Synthetic member"}]',
  '[{"id":"01820000-0000-4000-8000-000000000012","childId":"01820000-0000-4000-8000-000000000011","title":"Synthetic task","completed":false}]',
  '[{"id":"01820000-0000-4000-8000-000000000013","childId":"01820000-0000-4000-8000-000000000011","subject":"Math","nextStep":"Read one example","completed":false}]',
  11 from auth.users
where id in ('01820000-0000-4000-8000-000000000003',
  '01820000-0000-4000-8000-000000000004', '01820000-0000-4000-8000-000000000005');
create temporary table status_profile_before on commit drop as
select profile.user_id, to_jsonb(profile) as saved_row from public.account_profiles as profile
where user_id in ('01820000-0000-4000-8000-000000000003',
  '01820000-0000-4000-8000-000000000004', '01820000-0000-4000-8000-000000000005');
create temporary table status_workspace_before on commit drop as
select workspace.user_id, to_jsonb(workspace) as saved_row from public.account_workspaces as workspace
where user_id in ('01820000-0000-4000-8000-000000000003',
  '01820000-0000-4000-8000-000000000004', '01820000-0000-4000-8000-000000000005');

-- A verified approved account remains usable without enforcing an auth.sessions row.
set local role authenticated;
set local request.jwt.claim.sub = '01820000-0000-4000-8000-000000000001';
set local request.jwt.claims = '{"sub":"01820000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}';
select ok(public.can_access_account_profile(), 'A normal verified approved identity has access');
select is((select user_id from public.get_or_create_account_profile()), auth.uid(),
  'A normal identity initializes its own profile');
select is((select user_id from public.get_or_create_account_workspace()), auth.uid(),
  'A normal identity initializes its own workspace');
select lives_ok($$select public.save_account_profile('Normal saved profile', 'en', 0)$$,
  'A normal identity saves its profile');
select lives_ok($$select public.update_account_workspace(0, '{"type":"rename_family","name":"Normal saved family"}')$$,
  'A normal identity saves its workspace');
select results_eq($$select display_name, revision from public.account_profiles$$,
  $$values ('Normal saved profile'::text, 1::bigint)$$, 'Normal profile RLS returns only its saved own row');
select results_eq($$select family_name, revision from public.account_workspaces$$,
  $$values ('Normal saved family'::text, 1::bigint)$$, 'Normal workspace RLS returns only its saved own row');
reset role;

update auth.users set banned_until = now() - interval '1 second'
where id = '01820000-0000-4000-8000-000000000002';
set local role authenticated;
set local request.jwt.claim.sub = '01820000-0000-4000-8000-000000000002';
set local request.jwt.claims = '{"sub":"01820000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}';
select ok(public.can_access_account_profile(), 'An expired ban restores otherwise approved access');
select is((select user_id from public.get_or_create_account_profile()), auth.uid(),
  'An expired ban permits own-profile initialization');
select is((select user_id from public.get_or_create_account_workspace()), auth.uid(),
  'An expired ban permits own-workspace initialization');
select lives_ok($$select public.save_account_profile('Recovered profile', 'ar', 0)$$,
  'An expired ban permits profile saves');
select lives_ok($$select public.update_account_workspace(0, '{"type":"rename_family","name":"Recovered family"}')$$,
  'An expired ban permits workspace commands');
select results_eq($$select display_name, revision from public.account_profiles$$,
  $$values ('Recovered profile'::text, 1::bigint)$$, 'Expired-ban profile reads retain own-row isolation');
select results_eq($$select family_name, revision from public.account_workspaces$$,
  $$values ('Recovered family'::text, 1::bigint)$$, 'Expired-ban workspace reads retain own-row isolation');
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '01820000-0000-4000-8000-000000000003';
set local request.jwt.claims = '{"sub":"01820000-0000-4000-8000-000000000003","role":"authenticated","is_anonymous":false}';
select ok(public.can_access_account_profile(), 'The account is authorized before its provider ban');
reset role;
update auth.users set banned_until = now() + interval '1 hour'
where id = '01820000-0000-4000-8000-000000000003';
-- Claims deliberately remain unchanged after each provider-side status change.
set local role authenticated;
select ok(not public.can_access_account_profile(), 'An active provider ban overrides retained JWT claims');
select is((select count(*) from public.account_profiles), 0::bigint, 'An active ban hides the existing profile through RLS');
select is((select count(*) from public.account_workspaces), 0::bigint, 'An active ban hides the existing workspace through RLS');
select throws_ok($$select public.get_or_create_account_profile()$$,
  '42501', 'access_unavailable', 'An active ban denies profile get-or-create');
select throws_ok($$select public.save_account_profile('Forbidden ban edit', 'ar', 4)$$,
  '42501', 'access_unavailable', 'An active ban denies a current-revision profile save');
select throws_ok($$select public.get_or_create_account_workspace()$$,
  '42501', 'access_unavailable', 'An active ban denies workspace get-or-create');
select throws_ok($$select public.update_account_workspace(11, '{"type":"rename_family","name":"Forbidden ban edit"}')$$,
  '42501', 'access_unavailable', 'An active ban denies a current-revision workspace command');
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '01820000-0000-4000-8000-000000000004';
set local request.jwt.claims = '{"sub":"01820000-0000-4000-8000-000000000004","role":"authenticated","is_anonymous":false}';
select ok(public.can_access_account_profile(), 'The account is authorized before soft deletion');
reset role;
update auth.users set deleted_at = now()
where id = '01820000-0000-4000-8000-000000000004';
set local role authenticated;
select ok(not public.can_access_account_profile(), 'Soft deletion overrides retained JWT claims');
select is((select count(*) from public.account_profiles), 0::bigint, 'Soft deletion hides the existing profile through RLS');
select is((select count(*) from public.account_workspaces), 0::bigint, 'Soft deletion hides the existing workspace through RLS');
select throws_ok($$select public.get_or_create_account_profile()$$,
  '42501', 'access_unavailable', 'Soft deletion denies profile get-or-create');
select throws_ok($$select public.save_account_profile('Forbidden deleted edit', 'ar', 4)$$,
  '42501', 'access_unavailable', 'Soft deletion denies a current-revision profile save');
select throws_ok($$select public.get_or_create_account_workspace()$$,
  '42501', 'access_unavailable', 'Soft deletion denies workspace get-or-create');
select throws_ok($$select public.update_account_workspace(11, '{"type":"rename_family","name":"Forbidden deleted edit"}')$$,
  '42501', 'access_unavailable', 'Soft deletion denies a current-revision workspace command');
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '01820000-0000-4000-8000-000000000005';
set local request.jwt.claims = '{"sub":"01820000-0000-4000-8000-000000000005","role":"authenticated","is_anonymous":false}';
select ok(public.can_access_account_profile(), 'The non-anonymous account initially has access');
reset role;
update auth.users set is_anonymous = true
where id = '01820000-0000-4000-8000-000000000005';
set local role authenticated;
select ok(not public.can_access_account_profile(), 'Current anonymous status overrides retained non-anonymous JWT claims');
select is((select count(*) from public.account_profiles), 0::bigint, 'Anonymous status hides the existing profile through RLS');
select is((select count(*) from public.account_workspaces), 0::bigint, 'Anonymous status hides the existing workspace through RLS');
select throws_ok($$select public.get_or_create_account_profile()$$,
  '42501', 'access_unavailable', 'Anonymous status denies profile get-or-create');
select throws_ok($$select public.save_account_profile('Forbidden anonymous edit', 'ar', 4)$$,
  '42501', 'access_unavailable', 'Anonymous status denies a current-revision profile save');
select throws_ok($$select public.get_or_create_account_workspace()$$,
  '42501', 'access_unavailable', 'Anonymous status denies workspace get-or-create');
select throws_ok($$select public.update_account_workspace(11, '{"type":"rename_family","name":"Forbidden anonymous edit"}')$$,
  '42501', 'access_unavailable', 'Anonymous status denies a current-revision workspace command');
reset role;

select results_eq($$select to_jsonb(profile) from public.account_profiles as profile
  join status_profile_before as previous using (user_id) order by profile.user_id$$,
  $$select saved_row from status_profile_before order by user_id$$,
  'All denied profile operations preserve the complete saved rows, revisions and timestamps');
select results_eq($$select to_jsonb(workspace) from public.account_workspaces as workspace
  join status_workspace_before as previous using (user_id) order by workspace.user_id$$,
  $$select saved_row from status_workspace_before order by user_id$$,
  'All denied workspace operations preserve family, members, tasks, study, IDs, revisions and timestamps');

select * from finish();
rollback;
