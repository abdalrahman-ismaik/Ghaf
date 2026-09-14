begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

select has_table('public', 'account_profiles', 'Adult profiles exist separately from local family data');
select columns_are('public', 'account_profiles',
  array['user_id', 'display_name', 'preferred_locale', 'revision', 'updated_at'],
  'Only the bounded adult profile is stored');
select col_is_pk('public', 'account_profiles', 'user_id', 'One profile per stable provider identity');
select ok((select relrowsecurity from pg_class where oid = 'public.account_profiles'::regclass),
  'Profile RLS is enabled');
select ok(not has_table_privilege('anon', 'public.account_profiles', 'SELECT'),
  'Anonymous clients cannot read profiles');
select ok(has_table_privilege('authenticated', 'public.account_profiles', 'SELECT')
  and not has_table_privilege('authenticated', 'public.account_profiles', 'INSERT')
  and not has_table_privilege('authenticated', 'public.account_profiles', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.account_profiles', 'DELETE'),
  'Clients can only select; writes require the bounded RPC');
select ok((select bool_and(prosecdef and proconfig @> array['search_path=""'])
  from pg_proc where oid in (
    'public.can_access_account_profile()'::regprocedure,
    'public.get_or_create_account_profile()'::regprocedure,
    'public.save_account_profile(text,text,bigint)'::regprocedure)),
  'Definer functions have an empty search path');
select ok(not has_function_privilege('anon', 'public.get_or_create_account_profile()', 'EXECUTE')
  and not has_function_privilege('anon', 'public.save_account_profile(text,text,bigint)', 'EXECUTE')
  and not has_function_privilege('anon', 'public.can_access_account_profile()', 'EXECUTE'),
  'Anonymous clients cannot invoke profile functions');

insert into auth.users (id, aud, role, email, email_confirmed_at, raw_user_meta_data)
values
  ('01800000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'profile-a@example.invalid', now(), '{}'),
  ('01800000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'profile-b@example.invalid', now(), '{}'),
  ('01800000-0000-4000-8000-000000000003', 'authenticated', 'authenticated',
   'profile-pending@example.invalid', now(), '{"status":"approved"}'),
  ('01800000-0000-4000-8000-000000000004', 'authenticated', 'authenticated',
   'profile-unverified@example.invalid', null, '{}');
update public.pilot_access set status = 'approved'
where user_id in ('01800000-0000-4000-8000-000000000001',
                  '01800000-0000-4000-8000-000000000002',
                  '01800000-0000-4000-8000-000000000004');

set local role anon;
select throws_ok($$select * from public.account_profiles$$, '42501', null, 'Anonymous reads fail');
select throws_ok($$select public.get_or_create_account_profile()$$, '42501', null,
  'Anonymous initialization fails');
select throws_ok($$select public.save_account_profile('Forged', 'en', 0)$$, '42501', null,
  'Anonymous saves fail');
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '01800000-0000-4000-8000-000000000001';
set local request.jwt.claims = '{"sub":"01800000-0000-4000-8000-000000000001","role":"authenticated"}';
select results_eq($$select user_id, display_name, preferred_locale, revision
  from public.get_or_create_account_profile()$$,
  $$values ('01800000-0000-4000-8000-000000000001'::uuid, ''::text, 'ar'::text, 0::bigint)$$,
  'First login initializes one empty Arabic profile for the verified caller');
select results_eq($$select display_name, preferred_locale, revision
  from public.save_account_profile('  Synthetic A  ', 'en', 0)$$,
  $$values ('Synthetic A'::text, 'en'::text, 1::bigint)$$,
  'Save returns the actual normalized row and incremented server revision');
select results_eq($$select display_name, preferred_locale, revision
  from public.get_or_create_account_profile()$$,
  $$values ('Synthetic A'::text, 'en'::text, 1::bigint)$$,
  'Repeated initialization preserves existing saved data');
select is((select count(*) from public.account_profiles), 1::bigint,
  'Retries create no duplicate profiles');
select throws_ok($$select public.save_account_profile('Lost update', 'ar', 0)$$,
  'PT409', 'profile_conflict', 'A stale second-device save conflicts');
select results_eq($$select display_name, revision from public.account_profiles$$,
  $$values ('Synthetic A'::text, 1::bigint)$$, 'Conflict never overwrites the current row');
select throws_ok($$select public.get_or_create_account_profile(
  p_user_id => '01800000-0000-4000-8000-000000000002'::uuid)$$,
  '42883', null, 'Initialization accepts no forged owner parameter');
select throws_ok($$select public.save_account_profile(
  p_display_name => 'Forged', p_preferred_locale => 'en', p_expected_revision => 1,
  p_user_id => '01800000-0000-4000-8000-000000000002'::uuid)$$,
  '42883', null, 'Save accepts no forged owner parameter');
select throws_ok($$insert into public.account_profiles (user_id, display_name)
  values ('01800000-0000-4000-8000-000000000002', 'Forged')$$,
  '42501', null, 'Direct cross-account inserts fail');
select throws_ok($$update public.account_profiles set display_name = 'Bypass'
  where user_id = '01800000-0000-4000-8000-000000000001'$$,
  '42501', null, 'Direct own-row updates cannot bypass revision checks');
select throws_ok($$delete from public.account_profiles
  where user_id = '01800000-0000-4000-8000-000000000001'$$,
  '42501', null, 'Clients cannot delete their cloud profile during logout');
select throws_ok($$select public.save_account_profile('', 'ar', 1)$$,
  'PT400', 'invalid_profile', 'Empty saved names fail');
select throws_ok($$select public.save_account_profile(repeat('ن', 81), 'ar', 1)$$,
  'PT400', 'invalid_profile', 'Name limit counts Unicode characters');
select throws_ok($$select public.save_account_profile(null, 'ar', 1)$$,
  'PT400', 'invalid_profile', 'Null names fail');
select throws_ok($$select public.save_account_profile('A', 'xx', 1)$$,
  'PT400', 'invalid_profile', 'Unknown locales fail');
select throws_ok($$select public.save_account_profile('A', null, 1)$$,
  'PT400', 'invalid_profile', 'Null locales fail');
select throws_ok($$select public.save_account_profile('A', 'ar', -1)$$,
  'PT400', 'invalid_profile', 'Negative revisions fail');
select throws_ok($$select public.save_account_profile('A', 'ar', 9007199254740991)$$,
  'PT400', 'invalid_profile', 'Revision overflow cannot produce an unsafe JSON number');
select throws_ok($$select public.save_account_profile('A', 'ar', null)$$,
  'PT400', 'invalid_profile', 'Null revisions fail');

set local request.jwt.claim.sub = '01800000-0000-4000-8000-000000000002';
set local request.jwt.claims = '{"sub":"01800000-0000-4000-8000-000000000002","role":"authenticated"}';
select is((select count(*) from public.account_profiles), 0::bigint,
  'User B sees none of User A records before initialization');
select is((select count(*) from public.account_profiles
  where user_id = '01800000-0000-4000-8000-000000000001'), 0::bigint,
  'An explicit forged select parameter cannot expose A');
select lives_ok($$select public.get_or_create_account_profile()$$, 'B initializes independently');
select results_eq($$select user_id from public.account_profiles$$,
  $$values ('01800000-0000-4000-8000-000000000002'::uuid)$$,
  'B sees only its own stable profile');
select throws_ok($$update public.account_profiles set display_name = 'Stolen'
  where user_id = '01800000-0000-4000-8000-000000000001'$$,
  '42501', null, 'B cannot modify A via a forged ID');
select throws_ok($$delete from public.account_profiles
  where user_id = '01800000-0000-4000-8000-000000000001'$$,
  '42501', null, 'B cannot delete A via a forged ID');
select lives_ok($$select public.save_account_profile('Synthetic B', 'ar', 0)$$,
  'B can edit its own profile');
reset role;
select is((select display_name from public.account_profiles
  where user_id = '01800000-0000-4000-8000-000000000001'), 'Synthetic A',
  'B writes never alter A');

set local role authenticated;
set local request.jwt.claim.sub = '01800000-0000-4000-8000-000000000003';
set local request.jwt.claims = '{"sub":"01800000-0000-4000-8000-000000000003","role":"authenticated","user_metadata":{"status":"approved"}}';
select throws_ok($$select public.get_or_create_account_profile()$$, '42501', 'access_unavailable',
  'Editable claims never approve a pending account');
select throws_ok($$select public.save_account_profile('Pending', 'ar', 0)$$,
  '42501', 'access_unavailable', 'Pending accounts cannot save');
set local request.jwt.claim.sub = '01800000-0000-4000-8000-000000000004';
set local request.jwt.claims = '{"sub":"01800000-0000-4000-8000-000000000004","role":"authenticated"}';
select throws_ok($$select public.get_or_create_account_profile()$$, '42501', 'access_unavailable',
  'Database email verification is required even with approval');
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{"role":"authenticated"}';
select throws_ok($$select public.get_or_create_account_profile()$$, '42501', 'access_unavailable',
  'Missing JWT subject fails closed');
select is((select count(*) from public.account_profiles), 0::bigint,
  'Missing JWT subject reveals no profiles');
reset role;

update public.pilot_access set status = 'suspended'
where user_id = '01800000-0000-4000-8000-000000000001';
set local role authenticated;
set local request.jwt.claim.sub = '01800000-0000-4000-8000-000000000001';
set local request.jwt.claims = '{"sub":"01800000-0000-4000-8000-000000000001","role":"authenticated"}';
select is((select count(*) from public.account_profiles), 0::bigint,
  'Suspension hides the existing own profile even through direct SELECT');
select throws_ok($$select public.get_or_create_account_profile()$$,
  '42501', 'access_unavailable', 'Suspension denies refresh');
select throws_ok($$select public.save_account_profile('Suspended', 'en', 1)$$,
  '42501', 'access_unavailable', 'Suspension denies save');
reset role;

select results_eq($$select display_name, revision from public.account_profiles
  where user_id = '01800000-0000-4000-8000-000000000001'$$,
  $$values ('Synthetic A'::text, 1::bigint)$$,
  'Loss of access does not delete cloud data');

select * from finish();
rollback;
