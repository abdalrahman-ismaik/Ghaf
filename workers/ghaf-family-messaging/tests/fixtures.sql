-- TEST ONLY, synthetic households and provider identities; IDs never map to the app demo.
truncate fm_private.messages, fm_private.threads, fm_private.invitations, fm_private.devices,
  fm_private.children, fm_private.parents, fm_private.attempts, auth.sessions, auth.users cascade;
insert into auth.users(id, is_anonymous, email_confirmed_at)
  select ('00000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid, i >= 3,
    case when i < 3 then clock_timestamp() end from generate_series(1, 12) i;
insert into auth.sessions(id, user_id)
  select ('10000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid, id
  from (select id, row_number() over (order by id) i from auth.users) u;
insert into fm_private.parents(id, household_id, display_name) values
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Test Parent A'),
  ('00000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Test Parent B');
insert into fm_private.children(id, parent_id, display_name, age_band) values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Test Child A', '9_11'),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Test Child B', '6_8'),
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 'Test Child C', '12_14');
insert into fm_private.threads(id, parent_id, child_id)
  select ('40000000-0000-4000-8000-' || right(c.id::text,12))::uuid, c.parent_id, c.id
  from fm_private.children c;
insert into fm_private.devices(id, provider_user_id, provider_session_id, parent_id, child_id, label) values
  ('50000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', null, 'Parent A test'),
  ('50000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', null, 'Parent B test'),
  ('50000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'Child A test'),
  ('50000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', 'Child B test');
