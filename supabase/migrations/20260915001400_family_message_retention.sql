begin;

-- Use the available Supabase extension; do not upgrade an installed version or remove other jobs.
create extension if not exists pg_cron with schema pg_catalog;

revoke all on function public.ghaf_family_message_purge_expired() from public,anon,authenticated,service_role;
create function public.ghaf_configure_family_message_retention() returns bigint
language plpgsql security definer set search_path='' set row_security=off as $$
declare
 v_name constant text:='ghaf-main-family-message-retention-v1';
 v_command constant text:='select public.ghaf_family_message_purge_expired();';
 v_schedule constant text:='0 * * * *';
 v_host text:=coalesce(nullif(current_setting('cron.host',true),''),'localhost');
 v_port integer:=current_setting('port')::integer;
 v_job cron.job;v_id bigint;
begin
 if to_regprocedure('cron.schedule(text,text,text)') is null then
  raise exception using errcode='PT503',message='cron_named_schedule_unavailable'; end if;
 if not has_function_privilege(current_user,'public.ghaf_family_message_purge_expired()','EXECUTE') then
  raise exception using errcode='42501',message='retention_operator_required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_name,20014));
 if (select count(*) from cron.job where jobname=v_name)>1 then
  raise exception using errcode='PT409',message='retention_job_conflict'; end if;
 select * into v_job from cron.job where jobname=v_name;
 if found then
  if v_job.username<>current_user or v_job.database<>current_database() or v_job.command<>v_command
   or v_job.schedule<>v_schedule or not v_job.active or v_job.nodename<>v_host or v_job.nodeport<>v_port then
   raise exception using errcode='PT409',message='retention_job_conflict'; end if;
  return v_job.jobid;
 end if;
 v_id:=cron.schedule(v_name,v_schedule,v_command);
 select * into v_job from cron.job where jobid=v_id;
 if not found or v_job.username<>current_user or v_job.database<>current_database() or v_job.command<>v_command
  or v_job.schedule<>v_schedule or not v_job.active or v_job.nodename<>v_host or v_job.nodeport<>v_port then
  raise exception using errcode='PT409',message='retention_job_conflict'; end if;
 return v_id;
end; $$;
revoke all on function public.ghaf_configure_family_message_retention() from public,anon,authenticated,service_role;
select public.ghaf_configure_family_message_retention();

-- Scheduling is not execution evidence; verify the named job's successful run separately.
commit;
