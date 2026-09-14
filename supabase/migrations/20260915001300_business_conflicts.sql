begin;

-- PostgREST retries serialization_failure; business conflicts must return HTTP 409.
-- Patch only the inspected explicit raises, preserving deployed bodies, ACLs and guards.
do $migration$
declare
  target record;
  definition text;
  old_marker constant text := 'errcode=''40001'',message=''request_conflict''';
  new_marker constant text := 'errcode=''PT409'',message=''request_conflict''';
  old_count integer;
  new_count integer;
begin
  for target in select * from (values
    ('public.ghaf_family_document_command(uuid,uuid,jsonb)',7),
    ('public.ghaf_guard_template_duplicate()',1)
  ) as targets(signature,expected_count) loop
    definition := pg_catalog.pg_get_functiondef(pg_catalog.to_regprocedure(target.signature));
    if definition is null then
      raise exception 'Required business-conflict function is absent: %',target.signature;
    end if;
    old_count := (pg_catalog.length(definition)-pg_catalog.length(pg_catalog.replace(definition,old_marker,'')))/pg_catalog.length(old_marker);
    new_count := (pg_catalog.length(definition)-pg_catalog.length(pg_catalog.replace(definition,new_marker,'')))/pg_catalog.length(new_marker);
    if old_count=target.expected_count and new_count=0 then
      execute pg_catalog.replace(definition,old_marker,new_marker);
    elsif old_count<>0 or new_count<>target.expected_count then
      raise exception 'Unexpected business-conflict function definition: %',target.signature;
    end if;
  end loop;
end;
$migration$;

notify pgrst,'reload schema';
commit;
