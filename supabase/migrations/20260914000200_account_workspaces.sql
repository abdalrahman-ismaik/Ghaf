begin;

-- Parent-managed cloud records are separate from prototype profiles, Seeds and reward state.
create table public.account_workspaces (
  user_id uuid primary key references auth.users (id) on delete cascade,
  workspace_id uuid not null unique default gen_random_uuid(),
  family_name text not null default ''
    constraint account_workspaces_family_name_check check (
      char_length(family_name) <= 80 and family_name = btrim(family_name)
    ),
  members jsonb not null default '[]'::jsonb
    constraint account_workspaces_members_check check (
      jsonb_typeof(members) = 'array' and jsonb_array_length(members) <= 20
    ),
  tasks jsonb not null default '[]'::jsonb
    constraint account_workspaces_tasks_check check (
      jsonb_typeof(tasks) = 'array' and jsonb_array_length(tasks) <= 200
    ),
  study_plans jsonb not null default '[]'::jsonb
    constraint account_workspaces_study_plans_check check (
      jsonb_typeof(study_plans) = 'array' and jsonb_array_length(study_plans) <= 200
    ),
  revision bigint not null default 0
    constraint account_workspaces_revision_check check (revision between 0 and 9007199254740991),
  updated_at timestamptz not null default now()
);

alter table public.account_workspaces enable row level security;
revoke all on table public.account_workspaces from public, anon, authenticated, service_role;
grant select on table public.account_workspaces to authenticated;
grant select, insert, update, delete on table public.account_workspaces to service_role;

create policy account_workspaces_read_own
  on public.account_workspaces
  for select
  to authenticated
  using (user_id = (select auth.uid()) and (select public.can_access_account_profile()));

create function public.get_or_create_account_workspace()
returns setof public.account_workspaces
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
begin
  if owner_id is null or not public.can_access_account_profile() then
    raise exception using errcode = '42501', message = 'access_unavailable';
  end if;
  insert into public.account_workspaces (user_id) values (owner_id)
  on conflict (user_id) do nothing;
  return query select workspace.* from public.account_workspaces as workspace
  where workspace.user_id = owner_id;
end;
$$;

create function public.update_account_workspace(p_expected_revision bigint, p_command jsonb)
returns setof public.account_workspaces
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  current_workspace public.account_workspaces%rowtype;
  command_type text;
  allowed_keys text[];
  text_key text;
  text_limit integer;
  clean_text text;
  clean_step text;
  target_id text;
  child_id text;
begin
  if owner_id is null or not public.can_access_account_profile() then
    raise exception using errcode = '42501', message = 'access_unavailable';
  end if;
  if p_expected_revision is null or p_expected_revision not between 0 and 9007199254740990
    or p_command is null or pg_catalog.jsonb_typeof(p_command) <> 'object'
    or pg_catalog.jsonb_typeof(p_command -> 'type') is distinct from 'string' then
    raise exception using errcode = 'PT400', message = 'invalid_profile';
  end if;
  command_type := p_command ->> 'type';
  case command_type
    when 'rename_family' then
      allowed_keys := array['type', 'name']; text_key := 'name'; text_limit := 80;
    when 'add_member' then
      allowed_keys := array['type', 'nickname']; text_key := 'nickname'; text_limit := 80;
    when 'rename_member' then
      allowed_keys := array['type', 'id', 'nickname']; text_key := 'nickname'; text_limit := 80;
    when 'add_task' then
      allowed_keys := array['type', 'childId', 'title']; text_key := 'title'; text_limit := 160;
    when 'edit_task' then
      allowed_keys := array['type', 'id', 'title']; text_key := 'title'; text_limit := 160;
    when 'complete_task', 'complete_study_plan' then
      allowed_keys := array['type', 'id', 'completed'];
    when 'add_study_plan' then
      allowed_keys := array['type', 'childId', 'subject', 'nextStep']; text_key := 'subject'; text_limit := 160;
    when 'edit_study_plan' then
      allowed_keys := array['type', 'id', 'subject', 'nextStep']; text_key := 'subject'; text_limit := 160;
    else
      raise exception using errcode = 'PT400', message = 'invalid_profile';
  end case;
  if not (p_command ?& allowed_keys) or p_command - allowed_keys <> '{}'::jsonb then
    raise exception using errcode = 'PT400', message = 'invalid_profile';
  end if;
  if text_key is not null then
    clean_text := pg_catalog.btrim(p_command ->> text_key);
    if pg_catalog.jsonb_typeof(p_command -> text_key) <> 'string'
      or pg_catalog.char_length(clean_text) not between 1 and text_limit then
      raise exception using errcode = 'PT400', message = 'invalid_profile';
    end if;
  end if;
  if p_command ? 'nextStep' then
    clean_step := pg_catalog.btrim(p_command ->> 'nextStep');
    if pg_catalog.jsonb_typeof(p_command -> 'nextStep') <> 'string'
      or pg_catalog.char_length(clean_step) not between 1 and 300 then
      raise exception using errcode = 'PT400', message = 'invalid_profile';
    end if;
  end if;
  if p_command ? 'completed' and pg_catalog.jsonb_typeof(p_command -> 'completed') <> 'boolean' then
    raise exception using errcode = 'PT400', message = 'invalid_profile';
  end if;
  if p_command ? 'id' then
    if pg_catalog.jsonb_typeof(p_command -> 'id') <> 'string'
      or (p_command ->> 'id') !~* '^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$' then
      raise exception using errcode = 'PT400', message = 'invalid_profile';
    end if;
    target_id := (p_command ->> 'id')::uuid::text;
  end if;
  if p_command ? 'childId' then
    if pg_catalog.jsonb_typeof(p_command -> 'childId') <> 'string'
      or (p_command ->> 'childId') !~* '^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$' then
      raise exception using errcode = 'PT400', message = 'invalid_profile';
    end if;
    child_id := (p_command ->> 'childId')::uuid::text;
  end if;

  -- Lock only this owner's revision; concurrent stale requests cannot overwrite a newer command.
  select workspace.* into current_workspace from public.account_workspaces as workspace
  where workspace.user_id = owner_id and workspace.revision = p_expected_revision
  for update;
  if not found then
    raise exception using errcode = 'PT409', message = 'profile_conflict';
  end if;
  if child_id is not null and not exists (
    select 1 from pg_catalog.jsonb_array_elements(current_workspace.members) as member
    where member ->> 'id' = child_id
  ) then
    raise exception using errcode = 'PT400', message = 'invalid_profile';
  end if;

  case command_type
    when 'rename_family' then
      current_workspace.family_name := clean_text;
    when 'add_member' then
      if pg_catalog.jsonb_array_length(current_workspace.members) >= 20 then
        raise exception using errcode = 'PT400', message = 'invalid_profile';
      end if;
      current_workspace.members := current_workspace.members || pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('id', pg_catalog.gen_random_uuid(), 'nickname', clean_text));
    when 'rename_member' then
      if not exists (select 1 from pg_catalog.jsonb_array_elements(current_workspace.members) as member
        where member ->> 'id' = target_id) then
        raise exception using errcode = 'PT400', message = 'invalid_profile';
      end if;
      select pg_catalog.jsonb_agg(case when member ->> 'id' = target_id
        then member || pg_catalog.jsonb_build_object('nickname', clean_text) else member end order by position)
      into current_workspace.members
      from pg_catalog.jsonb_array_elements(current_workspace.members) with ordinality as entries(member, position);
    when 'add_task' then
      if pg_catalog.jsonb_array_length(current_workspace.tasks) >= 200 then
        raise exception using errcode = 'PT400', message = 'invalid_profile';
      end if;
      current_workspace.tasks := current_workspace.tasks || pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('id', pg_catalog.gen_random_uuid(), 'childId', child_id,
          'title', clean_text, 'completed', false));
    when 'edit_task', 'complete_task' then
      if not exists (select 1 from pg_catalog.jsonb_array_elements(current_workspace.tasks) as task
        where task ->> 'id' = target_id) then
        raise exception using errcode = 'PT400', message = 'invalid_profile';
      end if;
      select pg_catalog.jsonb_agg(case when task ->> 'id' = target_id then task ||
        case when command_type = 'edit_task' then pg_catalog.jsonb_build_object('title', clean_text)
          else pg_catalog.jsonb_build_object('completed', p_command -> 'completed') end
        else task end order by position)
      into current_workspace.tasks
      from pg_catalog.jsonb_array_elements(current_workspace.tasks) with ordinality as entries(task, position);
    when 'add_study_plan' then
      if pg_catalog.jsonb_array_length(current_workspace.study_plans) >= 200 then
        raise exception using errcode = 'PT400', message = 'invalid_profile';
      end if;
      current_workspace.study_plans := current_workspace.study_plans || pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('id', pg_catalog.gen_random_uuid(), 'childId', child_id,
          'subject', clean_text, 'nextStep', clean_step, 'completed', false));
    when 'edit_study_plan', 'complete_study_plan' then
      if not exists (select 1 from pg_catalog.jsonb_array_elements(current_workspace.study_plans) as plan
        where plan ->> 'id' = target_id) then
        raise exception using errcode = 'PT400', message = 'invalid_profile';
      end if;
      select pg_catalog.jsonb_agg(case when plan ->> 'id' = target_id then plan ||
        case when command_type = 'edit_study_plan'
          then pg_catalog.jsonb_build_object('subject', clean_text, 'nextStep', clean_step)
          else pg_catalog.jsonb_build_object('completed', p_command -> 'completed') end
        else plan end order by position)
      into current_workspace.study_plans
      from pg_catalog.jsonb_array_elements(current_workspace.study_plans) with ordinality as entries(plan, position);
  end case;

  return query update public.account_workspaces as workspace
  set family_name = current_workspace.family_name, members = current_workspace.members,
      tasks = current_workspace.tasks, study_plans = current_workspace.study_plans,
      revision = workspace.revision + 1, updated_at = pg_catalog.clock_timestamp()
  where workspace.user_id = owner_id and workspace.revision = p_expected_revision
  returning workspace.*;
end;
$$;

revoke all on function public.get_or_create_account_workspace() from public, anon, authenticated, service_role;
revoke all on function public.update_account_workspace(bigint, jsonb) from public, anon, authenticated, service_role;
grant execute on function public.get_or_create_account_workspace() to authenticated;
grant execute on function public.update_account_workspace(bigint, jsonb) to authenticated;

commit;
