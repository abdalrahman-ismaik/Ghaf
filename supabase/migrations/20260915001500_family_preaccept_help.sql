begin;

-- The visible Help action must work before a Child commits to an assigned task.
-- Preserve the existing identity, revision, receipt and award rules.
do $migration$
declare
  definition text;
  old_fragment constant text := E'when ''request_help'' then\n      if v_task.status not in (''accepted'',''in_progress'') then';
  new_fragment constant text := E'when ''request_help'' then\n      if v_task.status not in (''assigned'',''accepted'',''in_progress'') then';
  old_count integer;
  new_count integer;
begin
  definition := pg_catalog.replace(
    pg_catalog.pg_get_functiondef('public.ghaf_family_core_command(uuid,uuid,jsonb)'::regprocedure),
    E'\r\n', E'\n');
  old_count := (pg_catalog.length(definition)-pg_catalog.length(pg_catalog.replace(definition,old_fragment,'')))/pg_catalog.length(old_fragment);
  new_count := (pg_catalog.length(definition)-pg_catalog.length(pg_catalog.replace(definition,new_fragment,'')))/pg_catalog.length(new_fragment);
  if old_count=1 and new_count=0 then
    execute pg_catalog.replace(definition,old_fragment,new_fragment);
  elsif old_count<>0 or new_count<>1 then
    raise exception 'Unexpected preaccept-help command definition; review before applying';
  end if;
end;
$migration$;

notify pgrst,'reload schema';
commit;
