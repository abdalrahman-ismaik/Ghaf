begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();

insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous) values
 ('02120000-0000-4000-8000-000000000001','authenticated','authenticated','snapshot-parent@example.invalid',now(),false),
 ('02120000-0000-4000-8000-000000000002','authenticated','authenticated','snapshot-other@example.invalid',now(),false),
 ('02120000-0000-4000-8000-000000000003','authenticated','authenticated',null,null,true),
 ('02120000-0000-4000-8000-000000000004','authenticated','authenticated',null,null,true);
insert into auth.sessions(id,user_id,created_at,updated_at) select
 ('02121000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('02120000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,now(),now() from generate_series(1,4)n;
update public.pilot_access set status='approved' where user_id in ('02120000-0000-4000-8000-000000000001','02120000-0000-4000-8000-000000000002');
insert into public.app_families(id,owner_id,name) values
 ('02122000-0000-4000-8000-000000000001','02120000-0000-4000-8000-000000000001','Snapshot fixture family');
insert into public.app_children(id,family_id,display_name,age_band) values
 ('02123000-0000-4000-8000-000000000001','02122000-0000-4000-8000-000000000001','Study Child','9_11'),
 ('02123000-0000-4000-8000-000000000002','02122000-0000-4000-8000-000000000001','Sibling','12_14');
insert into public.app_family_members(family_id,auth_user_id,role,child_id,session_id) values
 ('02122000-0000-4000-8000-000000000001','02120000-0000-4000-8000-000000000001','parent',null,null),
 ('02122000-0000-4000-8000-000000000001','02120000-0000-4000-8000-000000000003','child','02123000-0000-4000-8000-000000000001','02121000-0000-4000-8000-000000000003'),
 ('02122000-0000-4000-8000-000000000001','02120000-0000-4000-8000-000000000004','child','02123000-0000-4000-8000-000000000002','02121000-0000-4000-8000-000000000004');
create temporary table snapshot_test_state(key text primary key,value jsonb);
grant all on snapshot_test_state to authenticated;
create function pg_temp.actor(n integer) returns void language plpgsql as $$ begin
 perform set_config('request.jwt.claim.sub','02120000-0000-4000-8000-'||lpad(n::text,12,'0'),true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub','02120000-0000-4000-8000-'||lpad(n::text,12,'0'),'session_id','02121000-0000-4000-8000-'||lpad(n::text,12,'0'),'role','authenticated')::text,true);
end; $$;
create function pg_temp.documents() returns jsonb language sql as $$ select public.ghaf_family_document_snapshot('02122000-0000-4000-8000-000000000001'); $$;
create function pg_temp.command(p_command jsonb) returns jsonb language sql as $$ select public.ghaf_family_document_command('02122000-0000-4000-8000-000000000001',gen_random_uuid(),p_command); $$;
create function pg_temp.create_study(n integer,p_child uuid default '02123000-0000-4000-8000-000000000001') returns void language plpgsql as $$
declare v_command jsonb;
begin
 if n<=100 then
  v_command:=jsonb_build_object('type','plan.create','id','plan-'||n,'childId',p_child,
   'input',jsonb_build_object('subject','Reading','title','Practice '||n,'nextStep','Choose a page','durationMinutes',15,'dueDate',null,'revisitDate',null));
 else
  v_command:=jsonb_build_object('type','goal.create','id','goal-'||n,'childId',p_child,
   'input',jsonb_build_object('subject','Reading','title','Goal '||n,'nextStep','Choose a page','parentSupport','Read together',
    'criterion',jsonb_build_object('kind','practice_count','target',2),'prize',jsonb_build_object('kind','experience','label','Choose a family game'),
    'targetDate','2026-12-01','reviewDate','2026-12-02'));
 end if;
 perform pg_temp.command(jsonb_build_object('type','study','expectedRevision',0,'command',v_command));
end; $$;

select ok((select not proretset and prorettype='jsonb'::regtype from pg_proc where oid='public.ghaf_family_document_snapshot(uuid)'::regprocedure),'Read returns one JSON value, not a REST-limited set of rows');
select ok(has_function_privilege('authenticated','public.ghaf_family_document_snapshot(uuid)','EXECUTE') and not has_function_privilege('anon','public.ghaf_family_document_snapshot(uuid)','EXECUTE'),'Snapshot requires authenticated membership');
set local role authenticated;
select pg_temp.actor(1);
select is(pg_temp.documents()->'documents','[]'::jsonb,'Fresh family snapshot is a real empty collection');
select is(pg_temp.documents()->>'documentCount','0','Fresh complete count is zero');
select lives_ok($$select pg_temp.create_study(n) from generate_series(1,125)n$$,'100 actual plans plus25 actual goals fit existing authorized limits');
select lives_ok($$select pg_temp.create_study(126,'02123000-0000-4000-8000-000000000002')$$,'Sibling has a distinct private goal');
insert into snapshot_test_state values('last_command',pg_temp.command('{"type":"connections.save","expectedRevision":0,"input":{"primaryGuardianName":"Test Parent","secondaryGuardianName":"","relatives":[]}}'));
insert into snapshot_test_state values('parent_snapshot',pg_temp.documents());
select is(pg_temp.documents()->>'documentCount','127','Parent reload preserves all127 records beyond API row cap100');
select is(jsonb_array_length(pg_temp.documents()->'documents'),127,'Complete JSON collection includes the final records');
select is((select count(*) from jsonb_array_elements(pg_temp.documents()->'documents')d where d->>'kind'='study_plan'),100::bigint,'Every plan survives the read');
select is((select count(*) from jsonb_array_elements(pg_temp.documents()->'documents')d where d->>'kind'='academic_goal'),26::bigint,'Every own and sibling goal survives authorized Parent read');
select is(pg_temp.documents()->'documents',(select value->'documents' from snapshot_test_state where key='last_command'),'Read matches complete mutation response with deterministic ordering');
select is(pg_temp.documents()#>>'{actor,userId}','02120000-0000-4000-8000-000000000001','Snapshot pins actual authenticated account');
select is(pg_temp.documents()#>>'{actor,role}','parent','Actor role is server-derived');
select is(pg_temp.documents()->>'revision','127','Snapshot revision belongs to the same serialized family collection');
select is(pg_temp.documents(),(select value from snapshot_test_state where key='parent_snapshot'),'Restart-style fresh read is stable without changing or losing data');

select pg_temp.actor(3);
select is(pg_temp.documents()->>'documentCount','125','Child also receives all125 own records beyond row cap100');
select is(pg_temp.documents()#>>'{actor,childId}','02123000-0000-4000-8000-000000000001','Child snapshot binds exact managed profile');
select is((select count(*) from jsonb_array_elements(pg_temp.documents()->'documents')d where d->>'child_id'<>'02123000-0000-4000-8000-000000000001'),0::bigint,'Complete read excludes sibling records');
select is((select count(*) from jsonb_array_elements(pg_temp.documents()->'documents')d where d->>'kind'='connections'),0::bigint,'Complete read excludes Parent-only names');
select pg_temp.actor(4);
select is(pg_temp.documents()->>'documentCount','1','Sibling cannot receive the other Child125 records');
select pg_temp.actor(2);
select throws_ok($$select pg_temp.documents()$$,'42501','family_unavailable','Other approved account cannot request this complete snapshot');
reset role;
update public.app_family_members set active=false where auth_user_id='02120000-0000-4000-8000-000000000003';
set local role authenticated;
select pg_temp.actor(3);
select throws_ok($$select pg_temp.documents()$$,'42501','family_unavailable','Revoked Child loses complete collection access');
reset role;
select is((select count(*) from public.app_family_documents where family_id='02122000-0000-4000-8000-000000000001'),127::bigint,'All reads and denied attempts leave stored data untouched');
select * from finish();
rollback;
