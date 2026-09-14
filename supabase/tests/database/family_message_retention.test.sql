begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();

select ok(exists(select 1 from pg_extension where extname='pg_cron'),'Supabase Cron extension is installed');
select is((select count(*) from cron.job where jobname='ghaf-main-family-message-retention-v1'),1::bigint,'Exactly one dedicated versioned retention job exists');
select is((select command from cron.job where jobname='ghaf-main-family-message-retention-v1'),'select public.ghaf_family_message_purge_expired();','The job calls only the new main-family message purge');
select is((select schedule from cron.job where jobname='ghaf-main-family-message-retention-v1'),'0 * * * *','Retention runs on the approved hourly cadence');
select ok((select active and username=current_user and database=current_database() from cron.job where jobname='ghaf-main-family-message-retention-v1'),'The active job belongs to this database operator and database');
select is(public.ghaf_configure_family_message_retention(),(select jobid from cron.job where jobname='ghaf-main-family-message-retention-v1'),'Reapplying the exact configuration keeps the same job');
select is((select count(*) from cron.job where jobname='ghaf-main-family-message-retention-v1'),1::bigint,'Idempotent configuration does not create duplicate jobs');
select ok(not has_function_privilege('authenticated','public.ghaf_family_message_purge_expired()','EXECUTE')
 and not has_function_privilege('anon','public.ghaf_family_message_purge_expired()','EXECUTE')
 and not has_function_privilege('service_role','public.ghaf_family_message_purge_expired()','EXECUTE'),'App, anonymous and service-role clients cannot invoke global content purge');
select ok(not has_function_privilege('authenticated','public.ghaf_configure_family_message_retention()','EXECUTE')
 and not has_function_privilege('anon','public.ghaf_configure_family_message_retention()','EXECUTE')
 and not has_function_privilege('service_role','public.ghaf_configure_family_message_retention()','EXECUTE'),'Retention configuration is operator-only');
select ok((select prosecdef and proconfig @> array['search_path=""'] from pg_proc
 where oid='public.ghaf_family_message_purge_expired()'::regprocedure),'Purge retains its fixed security-definer search path');

create temporary table retention_job_baseline as select * from cron.job;
select cron.alter_job((select jobid from retention_job_baseline where jobname='ghaf-main-family-message-retention-v1'),command:='select 1;');
select throws_ok($$select public.ghaf_configure_family_message_retention()$$,'PT409','retention_job_conflict','A same-name different command is rejected rather than overwritten');
select is((select command from cron.job where jobname='ghaf-main-family-message-retention-v1'),'select 1;','Conflict rejection preserves the prior operator command');
select cron.alter_job(jobid,command:=command) from retention_job_baseline where jobname='ghaf-main-family-message-retention-v1';
select cron.alter_job((select jobid from retention_job_baseline where jobname='ghaf-main-family-message-retention-v1'),active:=false);
select throws_ok($$select public.ghaf_configure_family_message_retention()$$,'PT409','retention_job_conflict','An explicitly paused job is not silently reactivated');
select cron.alter_job(jobid,active:=active) from retention_job_baseline where jobname='ghaf-main-family-message-retention-v1';
select cron.alter_job((select jobid from retention_job_baseline where jobname='ghaf-main-family-message-retention-v1'),database:='template1');
select throws_ok($$select public.ghaf_configure_family_message_retention()$$,'PT409','retention_job_conflict','Same-name jobs targeting another database fail closed');
select cron.alter_job(jobid,database:=database) from retention_job_baseline where jobname='ghaf-main-family-message-retention-v1';
select results_eq($$select jobid,jobname,command,schedule,database,username,active,nodename,nodeport from cron.job order by jobid$$,
 $$select jobid,jobname,command,schedule,database,username,active,nodename,nodeport from retention_job_baseline order by jobid$$,
 'Configuration checks preserve all existing job definitions');

insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous)
 values('02140000-0000-4000-8000-000000000001','authenticated','authenticated','retention-parent@example.invalid',now(),false);
insert into public.app_families(id,owner_id,name)
 values('02140000-0000-4000-8000-000000000002','02140000-0000-4000-8000-000000000001','Synthetic retention family');
insert into public.app_children(id,family_id,display_name,age_band)
 values('02140000-0000-4000-8000-000000000003','02140000-0000-4000-8000-000000000002','Synthetic retention Child','9_11');
insert into public.app_family_members(id,family_id,auth_user_id,role,display_name)
 values('02140000-0000-4000-8000-000000000004','02140000-0000-4000-8000-000000000002','02140000-0000-4000-8000-000000000001','parent','Synthetic Parent');
insert into public.app_family_message_threads(id,family_id,kind,parent_member_id,child_id,next_sequence)
 values('02140000-0000-4000-8000-000000000005','02140000-0000-4000-8000-000000000002','parent_child','02140000-0000-4000-8000-000000000004','02140000-0000-4000-8000-000000000003',4);
insert into public.app_family_message_reads(thread_id,person_id,sequence)
 values('02140000-0000-4000-8000-000000000005','02140000-0000-4000-8000-000000000001',3);
insert into public.app_family_messages(id,family_id,thread_id,sender_id,client_key,body,sequence,created_at) values
 ('02140000-0000-4000-8000-000000000006','02140000-0000-4000-8000-000000000002','02140000-0000-4000-8000-000000000005','02140000-0000-4000-8000-000000000001','02140000-0000-4000-8000-000000000006','Synthetic expired content',1,clock_timestamp()-interval '31 days'),
 ('02140000-0000-4000-8000-000000000007','02140000-0000-4000-8000-000000000002','02140000-0000-4000-8000-000000000005','02140000-0000-4000-8000-000000000001','02140000-0000-4000-8000-000000000007','Synthetic retained content',2,clock_timestamp()-interval '29 days'),
 ('02140000-0000-4000-8000-000000000008','02140000-0000-4000-8000-000000000002','02140000-0000-4000-8000-000000000005','02140000-0000-4000-8000-000000000001','02140000-0000-4000-8000-000000000008','Synthetic future content',3,clock_timestamp()+interval '1 day');
create temporary table retention_recent_baseline as select * from public.app_family_messages where created_at>clock_timestamp()-interval '30 days';
select cmp_ok(public.ghaf_family_message_purge_expired(),'>=',1::bigint,'The real operator purge removes expired synthetic content');
select is((select count(*) from public.app_family_messages where id='02140000-0000-4000-8000-000000000006'),0::bigint,'Expired raw message body is actually deleted');
select results_eq($$select id,body,sequence,created_at from public.app_family_messages order by id$$,
 $$select id,body,sequence,created_at from retention_recent_baseline order by id$$,'Every recent message remains unchanged');
select is((select next_sequence from public.app_family_message_threads where id='02140000-0000-4000-8000-000000000005'),4::bigint,'Retention never rewinds message ordering');
select is((select sequence from public.app_family_message_reads where thread_id='02140000-0000-4000-8000-000000000005'),3::bigint,'Retention preserves the private read cursor');
select is((select count(*) from public.app_children where family_id='02140000-0000-4000-8000-000000000002'),1::bigint,'Retention does not delete managed Child profiles');
select is((select count(*) from public.app_family_members where family_id='02140000-0000-4000-8000-000000000002'),1::bigint,'Retention does not change family memberships');
select is(public.ghaf_family_message_purge_expired(),0::bigint,'Immediate repeated purge is idempotent');
select * from finish();
rollback;
