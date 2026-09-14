begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();

select ok(position('''40001''' in pg_get_functiondef('public.ghaf_family_document_command(uuid,uuid,jsonb)'::regprocedure))=0,
 'Document business conflicts no longer impersonate serialization failures');
select ok(position('''40001''' in pg_get_functiondef('public.ghaf_guard_template_duplicate()'::regprocedure))=0,
 'Duplicate-template trigger no longer requests PostgREST transaction retries');
select ok(position('''PT409''' in pg_get_functiondef('public.save_account_profile(text,text,bigint)'::regprocedure))>0,
 'Legacy profile business conflicts retain their existing HTTP 409 contract');
select ok(position('''PT409''' in pg_get_functiondef('public.update_account_workspace(bigint,jsonb)'::regprocedure))>0,
 'Legacy workspace business conflicts retain their existing HTTP 409 contract');
select ok(has_function_privilege('authenticated','public.ghaf_family_document_command(uuid,uuid,jsonb)','EXECUTE')
 and not has_function_privilege('anon','public.ghaf_family_document_command(uuid,uuid,jsonb)','EXECUTE'),
 'The migration preserves authenticated-only command execution');
select ok(not has_function_privilege('authenticated','public.ghaf_guard_template_duplicate()','EXECUTE'),
 'The duplicate guard remains private');
select ok((select bool_and(prosecdef and proconfig @> array['search_path=""']) from pg_proc
 where oid in ('public.ghaf_family_document_command(uuid,uuid,jsonb)'::regprocedure,'public.ghaf_guard_template_duplicate()'::regprocedure)),
 'Existing security-definer boundaries and empty search paths are preserved');

insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous)
 values('020f0000-0000-4000-8000-000000000001','authenticated','authenticated','business-conflict@example.invalid',now(),false);
insert into auth.sessions(id,user_id,created_at,updated_at)
 values('020f1000-0000-4000-8000-000000000001','020f0000-0000-4000-8000-000000000001',now(),now());
update public.pilot_access set status='approved' where user_id='020f0000-0000-4000-8000-000000000001';
insert into public.app_families(id,owner_id,name)
 values('020f2000-0000-4000-8000-000000000001','020f0000-0000-4000-8000-000000000001','Synthetic conflict verification');
insert into public.app_family_members(family_id,auth_user_id,role)
 values('020f2000-0000-4000-8000-000000000001','020f0000-0000-4000-8000-000000000001','parent');
create temporary table conflict_before(payload jsonb,revision bigint);
grant all on conflict_before to authenticated;
create function pg_temp.conflict_command(c jsonb,r uuid default gen_random_uuid()) returns jsonb language sql as $$
 select public.ghaf_family_document_command('020f2000-0000-4000-8000-000000000001',r,c) $$;
create function pg_temp.connections_command(n text,revision bigint default 0) returns jsonb language sql as $$
 select jsonb_build_object('type','connections.save','expectedRevision',revision,'input',
 jsonb_build_object('primaryGuardianName',n,'secondaryGuardianName','','relatives','[]'::jsonb)) $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','020f0000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"020f0000-0000-4000-8000-000000000001","session_id":"020f1000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok($$select pg_temp.conflict_command(pg_temp.connections_command('Saved Parent'),'020f4000-0000-4000-8000-000000000001')$$,
 'An authorized fresh document mutation succeeds');
insert into conflict_before select payload,revision from public.app_family_documents where kind='connections';
select lives_ok($$select pg_temp.conflict_command(pg_temp.connections_command('Saved Parent'),'020f4000-0000-4000-8000-000000000001')$$,
 'An exact committed retry still succeeds');
select throws_ok($$select pg_temp.conflict_command(pg_temp.connections_command('Must not replace'),'020f4000-0000-4000-8000-000000000001')$$,
 'PT409','request_conflict','Changed idempotency payload returns a terminal business conflict');
select throws_ok($$select pg_temp.conflict_command(pg_temp.connections_command('Stale replacement'))$$,
 'PT409','request_conflict','A stale revision returns HTTP 409 without pretending it is retryable serialization');
select is((select count(*) from public.app_family_documents where kind='connections'),1::bigint,
 'Retries and conflicts create no duplicate connection record');
select is((select to_jsonb(row(payload,revision)) from public.app_family_documents where kind='connections'),
 (select to_jsonb(row(payload,revision)) from conflict_before),'Denied conflicts preserve exact stored content and revision');
select lives_ok($$select pg_temp.conflict_command('{"type":"template.save","id":null,"expectedRevision":0,"input":{"categoryId":"home_responsibility","title":{"ar":"ترتيب الكتب","en":"Arrange Books"},"positiveAction":{"ar":"ضع الكتب في مكانها","en":"Put Agreed Books Away"},"recurrence":"once"}}')$$,
 'The original reusable wording persists');
select throws_ok($$select pg_temp.conflict_command('{"type":"template.save","id":null,"expectedRevision":0,"input":{"categoryId":"home_responsibility","title":{"ar":"ترتيب الكتب","en":"arrange books"},"positiveAction":{"ar":"ضع الكتب في مكانها","en":"put agreed books away"},"recurrence":"recurrent"}}')$$,
 'PT409','request_conflict','Canonical duplicate detection in the trigger uses the same terminal conflict contract');
select is((select count(*) from public.app_family_documents where kind='saved_template'),1::bigint,
 'The trigger conflict leaves the original template as the only stored record');
select is((select payload#>>'{title,en}' from public.app_family_documents where kind='saved_template'),'Arrange Books',
 'A denied canonical duplicate cannot overwrite original wording');
reset role;
select is((select count(*) from public.app_family_document_requests where auth_user_id='020f0000-0000-4000-8000-000000000001'),2::bigint,
 'Only successful operations create durable request receipts');
select * from finish();
rollback;
