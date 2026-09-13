-- Operator only. Enable Supabase Cron (pg_cron) in this dedicated project first.
-- Review the project's region/backups separately: this deletes live rows, not provider backups.
begin;
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise exception 'Enable the reviewed Supabase Cron extension before scheduling retention';
  end if;
end;
$$;
select cron.schedule(
  'ghaf-family-message-retention',
  '0 * * * *',
  'select public.fm_purge_expired();'
);
select public.fm_purge_expired() as initially_deleted_messages;
commit;

-- Inspect after the next hourly boundary; a schedule row alone does not prove execution.
select j.jobid, j.jobname, j.schedule, j.active, r.status, r.start_time, r.end_time
from cron.job j left join lateral (
  select d.status, d.start_time, d.end_time from cron.job_run_details d
  where d.jobid = j.jobid order by d.start_time desc limit 1
) r on true
where j.jobname = 'ghaf-family-message-retention';

