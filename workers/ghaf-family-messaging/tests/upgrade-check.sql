-- The runner inserts this retained Parent message before applying migration002.
do $$
begin
  if not exists (select 1 from fm_private.messages where
    id = '70000000-0000-4000-8000-000000000001' and body = 'Preserved upgrade message'
    and thread_id = '40000000-0000-4000-8000-000000000001' and sequence = 1) then
    raise exception 'Upgrade did not preserve the existing Parent message';
  end if;
  if (select count(*) from fm_private.threads where kind = 'parent_child') <> 3 or
    not exists (select 1 from fm_private.threads where
      id = '40000000-0000-4000-8000-000000000001' and next_sequence = 2
      and child_id = '30000000-0000-4000-8000-000000000001' and peer_child_id is null) then
    raise exception 'Upgrade did not preserve existing thread identity and sequence';
  end if;
end;
$$;
