begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

select has_table('public', 'pilot_access', 'Approval table exists');
select columns_are(
  'public',
  'pilot_access',
  array['user_id', 'status', 'created_at', 'updated_at'],
  'Approval stores only identity reference, status and timestamps'
);
select col_is_pk('public', 'pilot_access', 'user_id', 'One approval per identity');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.pilot_access'::regclass),
  'RLS is enabled'
);
select ok(
  not has_table_privilege('anon', 'public.pilot_access', 'SELECT'),
  'Anonymous role has no approval read grant'
);
select ok(
  has_table_privilege('authenticated', 'public.pilot_access', 'SELECT')
    and not has_table_privilege('authenticated', 'public.pilot_access', 'INSERT')
    and not has_table_privilege('authenticated', 'public.pilot_access', 'UPDATE')
    and not has_table_privilege('authenticated', 'public.pilot_access', 'DELETE'),
  'Authenticated role has only SELECT access'
);
select ok(
  (select prosecdef and proconfig @> array['search_path=""']
   from pg_proc where oid = 'public.create_pending_pilot_access()'::regprocedure),
  'Signup trigger uses a definer with an empty search path'
);
select ok(
  not has_function_privilege('anon', 'public.create_pending_pilot_access()', 'EXECUTE')
    and not has_function_privilege('authenticated', 'public.create_pending_pilot_access()', 'EXECUTE'),
  'Clients cannot execute the signup trigger function'
);

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values
  ('00600000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'pilot-one@example.invalid', '{"provider":"email","providers":["email"]}',
   '{"pilot_access":"approved","status":"approved"}'),
  ('00600000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'pilot-two@example.invalid', '{"provider":"email","providers":["email"]}', '{}'),
  ('00600000-0000-4000-8000-000000000003', 'authenticated', 'authenticated',
   'pilot-missing@example.invalid', '{"provider":"email","providers":["email"]}', '{}');

select is(
  (select count(*) from public.pilot_access
   where user_id in ('00600000-0000-4000-8000-000000000001',
                    '00600000-0000-4000-8000-000000000002',
                    '00600000-0000-4000-8000-000000000003')),
  3::bigint,
  'Every synthetic auth registration creates one approval row'
);
select is(
  (select status from public.pilot_access where user_id = '00600000-0000-4000-8000-000000000001'),
  'pending',
  'Registration always starts pending despite editable approved metadata'
);
select ok(
  (select created_at is not null and updated_at is not null
   from public.pilot_access where user_id = '00600000-0000-4000-8000-000000000001'),
  'Registration initializes both timestamps'
);
select throws_ok(
  $$insert into public.pilot_access (user_id)
    values ('00600000-0000-4000-8000-000000000001')$$,
  '23505', null, 'Duplicate approval rows are rejected'
);
select throws_ok(
  $$insert into public.pilot_access (user_id)
    values ('00600000-0000-4000-8000-000000000099')$$,
  '23503', null, 'Approval cannot reference a nonexistent identity'
);
select throws_ok(
  $$update public.pilot_access set status = 'unknown'
    where user_id = '00600000-0000-4000-8000-000000000001'$$,
  '23514', null, 'Unknown approval statuses are rejected'
);
select throws_ok(
  $$update public.pilot_access set status = null
    where user_id = '00600000-0000-4000-8000-000000000001'$$,
  '23502', null, 'Null approval statuses are rejected'
);

set local role anon;
select throws_ok(
  $$select * from public.pilot_access$$,
  '42501', null, 'Anonymous clients cannot read approval rows'
);
select throws_ok(
  $$insert into public.pilot_access (user_id, status)
    values ('00600000-0000-4000-8000-000000000099', 'approved')$$,
  '42501', null, 'Anonymous clients cannot create approval rows'
);
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '00600000-0000-4000-8000-000000000001';
set local request.jwt.claims = '{"sub":"00600000-0000-4000-8000-000000000001","role":"authenticated","user_metadata":{"status":"approved"}}';
select results_eq(
  $$select user_id from public.pilot_access order by user_id$$,
  $$values ('00600000-0000-4000-8000-000000000001'::uuid)$$,
  'First account sees only its own row without a client filter'
);
select is(
  (select count(*) from public.pilot_access where user_id = '00600000-0000-4000-8000-000000000002'),
  0::bigint,
  'First account cannot explicitly select the second account'
);
select is(
  (select status from public.pilot_access),
  'pending',
  'Editable JWT metadata does not replace database approval'
);
select throws_ok(
  $$update public.pilot_access set status = 'approved'
    where user_id = '00600000-0000-4000-8000-000000000001'$$,
  '42501', null, 'An account cannot approve itself'
);
select throws_ok(
  $$update public.pilot_access set status = 'approved'
    where user_id = '00600000-0000-4000-8000-000000000002'$$,
  '42501', null, 'An account cannot approve another account'
);
select throws_ok(
  $$insert into public.pilot_access (user_id, status)
    values ('00600000-0000-4000-8000-000000000001', 'approved')
    on conflict (user_id) do update set status = excluded.status$$,
  '42501', null, 'An account cannot upsert its approval'
);
select throws_ok(
  $$delete from public.pilot_access where user_id = '00600000-0000-4000-8000-000000000001'$$,
  '42501', null, 'An account cannot remove its approval row'
);
select throws_ok(
  $$select public.create_pending_pilot_access()$$,
  '42501', null, 'Direct client calls to signup trigger are denied'
);
select throws_ok(
  $$select public.update_pilot_access_timestamp()$$,
  '42501', null, 'Direct client calls to timestamp trigger are denied'
);

set local request.jwt.claim.sub = '00600000-0000-4000-8000-000000000002';
set local request.jwt.claims = '{"sub":"00600000-0000-4000-8000-000000000002","role":"authenticated"}';
select results_eq(
  $$select user_id from public.pilot_access order by user_id$$,
  $$values ('00600000-0000-4000-8000-000000000002'::uuid)$$,
  'Second account sees only its own row'
);
reset role;

set local role service_role;
select lives_ok(
  $$update public.pilot_access set status = 'approved', updated_at = '2000-01-01T00:00:00Z'
    where user_id = '00600000-0000-4000-8000-000000000001'$$,
  'Trusted administration can approve an account'
);
reset role;
select ok(
  (select updated_at > '2000-01-01T00:00:00Z'::timestamptz and updated_at >= created_at
   from public.pilot_access where user_id = '00600000-0000-4000-8000-000000000001'),
  'Status updates receive a fresh server timestamp'
);
set local role authenticated;
set local request.jwt.claim.sub = '00600000-0000-4000-8000-000000000001';
set local request.jwt.claims = '{"sub":"00600000-0000-4000-8000-000000000001","role":"authenticated"}';
select is((select status from public.pilot_access), 'approved', 'Account reads administrator approval');
reset role;

update public.pilot_access set status = 'suspended'
where user_id = '00600000-0000-4000-8000-000000000001';
set local role authenticated;
select is((select status from public.pilot_access), 'suspended', 'Account reads administrator suspension');
select throws_ok(
  $$update public.pilot_access set status = 'approved'
    where user_id = '00600000-0000-4000-8000-000000000001'$$,
  '42501', null, 'Suspended account cannot restore its own access'
);
reset role;

delete from public.pilot_access where user_id = '00600000-0000-4000-8000-000000000003';
set local role authenticated;
set local request.jwt.claim.sub = '00600000-0000-4000-8000-000000000003';
set local request.jwt.claims = '{"sub":"00600000-0000-4000-8000-000000000003","role":"authenticated","user_metadata":{"status":"approved"}}';
select is((select count(*) from public.pilot_access), 0::bigint, 'Missing approval does not expose any other row');
select throws_ok(
  $$insert into public.pilot_access (user_id, status)
    values ('00600000-0000-4000-8000-000000000003', 'approved')$$,
  '42501', null, 'Missing approval cannot be repaired by the client'
);
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{"role":"authenticated"}';
select is((select count(*) from public.pilot_access), 0::bigint, 'Missing identity claims reveal no approvals');
reset role;

delete from auth.users where id = '00600000-0000-4000-8000-000000000002';
select is(
  (select count(*) from public.pilot_access where user_id = '00600000-0000-4000-8000-000000000002'),
  0::bigint,
  'Deleting the auth identity cascades to its approval row'
);
select is(
  (select count(*) from public.pilot_access where user_id = '00600000-0000-4000-8000-000000000001'),
  1::bigint,
  'Deletion preserves the other account'
);

select * from finish();
rollback;
