create table public.app_family_documents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.app_families(id),
  child_id uuid references public.app_children(id),
  kind text not null check (kind in ('study_plan','academic_goal','connections','profile_preferences','saved_template','learning')),
  revision bigint not null default 1 check (revision between 1 and 9007199254740991),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 1000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((kind in ('connections','saved_template')) = (child_id is null))
);
create index app_family_documents_family on public.app_family_documents(family_id,child_id,kind);
create unique index app_family_documents_study_id on public.app_family_documents(family_id,(payload->>'id'))
  where kind in ('study_plan','academic_goal');
create unique index app_family_documents_connections on public.app_family_documents(family_id) where kind='connections';
create unique index app_family_documents_child_singleton on public.app_family_documents(family_id,child_id,kind)
  where kind in ('profile_preferences','learning');
create table public.app_family_document_requests (
  auth_user_id uuid not null references auth.users(id),
  request_id uuid not null,
  family_id uuid not null references public.app_families(id),
  command jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key(auth_user_id,request_id)
);
alter table public.app_family_documents enable row level security;
alter table public.app_family_document_requests enable row level security;
revoke all on public.app_family_documents,public.app_family_document_requests from public,anon,authenticated,service_role;
grant select on public.app_family_documents to authenticated;

create function public.ghaf_doc_keys(v jsonb,required_keys text[],optional_keys text[] default '{}')
returns boolean language sql immutable set search_path='' as $$
  select coalesce(jsonb_typeof(v)='object' and v ?& required_keys
    and not exists(select 1 from jsonb_object_keys(v) k where not(k=any(required_keys||optional_keys))),false)
$$;
create function public.ghaf_doc_text(v jsonb,minimum integer,maximum integer)
returns boolean language sql immutable set search_path='' as $$
  select coalesce(jsonb_typeof(v)='string' and char_length(btrim(v#>>'{}')) between minimum and maximum
    and translate(v#>>'{}',E'\n\r\t','') !~ '[[:cntrl:]]',false)
$$;
create function public.ghaf_doc_number(v jsonb,minimum numeric,maximum numeric,whole boolean default false)
returns boolean language plpgsql immutable set search_path='' as $$
declare n numeric;
begin
  if v is null or jsonb_typeof(v)<>'number' then return false; end if;
  n:=(v#>>'{}')::numeric;
  return n between minimum and maximum and (not whole or n=trunc(n));
exception when others then return false;
end $$;
create function public.ghaf_doc_date(v jsonb)
returns boolean language plpgsql immutable set search_path='' as $$
declare s text;
begin
  if v='null'::jsonb then return true; end if;
  if v is null or jsonb_typeof(v)<>'string' then return false; end if;
  s:=v#>>'{}';
  return s ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' and to_char(s::date,'YYYY-MM-DD')=s;
exception when others then return false;
end $$;
create function public.ghaf_doc_options(v jsonb,allowed text[])
returns boolean language plpgsql immutable set search_path='' as $$
begin
  if v is null or jsonb_typeof(v)<>'array' then return false; end if;
  return jsonb_array_length(v)<=cardinality(allowed)
    and not exists(select 1 from jsonb_array_elements(v) x where jsonb_typeof(x)<>'string' or not((x#>>'{}')=any(allowed)))
    and (select count(*)=count(distinct x) from jsonb_array_elements(v) x);
end $$;
create function public.ghaf_doc_study_input(v jsonb,is_goal boolean)
returns jsonb language plpgsql immutable set search_path='' as $$
declare c jsonb; k text; normalized jsonb;
begin
  if not public.ghaf_doc_keys(v,
    case when is_goal then array['subject','title','nextStep','parentSupport','criterion','prize']
    else array['subject','title','nextStep','durationMinutes','dueDate','revisitDate'] end,
    case when is_goal then array['targetDate','reviewDate'] else '{}'::text[] end)
    or not public.ghaf_doc_text(v->'subject',1,80) or not public.ghaf_doc_text(v->'title',1,120)
    or not public.ghaf_doc_text(v->'nextStep',1,300) then raise exception using errcode='22023',message='invalid_command'; end if;
  normalized:=v||jsonb_build_object('subject',btrim(v->>'subject'),'title',btrim(v->>'title'),'nextStep',btrim(v->>'nextStep'));
  if not is_goal then
    if not public.ghaf_doc_number(v->'durationMinutes',1,60,true)
      or not public.ghaf_doc_date(v->'dueDate') or not public.ghaf_doc_date(v->'revisitDate')
      then raise exception using errcode='22023',message='invalid_command'; end if;
    return normalized;
  end if;
  if not public.ghaf_doc_text(v->'parentSupport',1,300) then raise exception using errcode='22023',message='invalid_command'; end if;
  c:=v->'criterion'; k:=c->>'kind';
  if k='practice_count' then
    if not public.ghaf_doc_keys(c,array['kind','target']) or not public.ghaf_doc_number(c->'target',1,1000,true)
      then raise exception using errcode='22023',message='invalid_command'; end if;
  elsif k='achievement' then
    if not public.ghaf_doc_keys(c,array['kind','description']) or not public.ghaf_doc_text(c->'description',1,300)
      then raise exception using errcode='22023',message='invalid_command'; end if;
    c:=c||jsonb_build_object('description',btrim(c->>'description'));
  elsif k='mark' then
    if not public.ghaf_doc_keys(c,array['kind','threshold','denominator'])
      or not public.ghaf_doc_number(c->'threshold',0,1000000)
      or not public.ghaf_doc_number(c->'denominator',0,1000000) or (c->>'denominator')::numeric<=0
      or (c->>'threshold')::numeric>(c->>'denominator')::numeric
      then raise exception using errcode='22023',message='invalid_command'; end if;
  else raise exception using errcode='22023',message='invalid_command'; end if;
  if v->'prize'<>'null'::jsonb and (not public.ghaf_doc_keys(v->'prize',array['kind','label'])
    or coalesce(v->'prize'->>'kind','') not in ('gift','experience','privilege')
    or not public.ghaf_doc_text(v->'prize'->'label',1,160))
    then raise exception using errcode='22023',message='invalid_command'; end if;
  normalized:=normalized||jsonb_build_object('parentSupport',btrim(v->>'parentSupport'),'criterion',c,
    'targetDate',coalesce(v->'targetDate','null'::jsonb),'reviewDate',coalesce(v->'reviewDate','null'::jsonb));
  if not public.ghaf_doc_date(normalized->'targetDate') or not public.ghaf_doc_date(normalized->'reviewDate')
    or (normalized->>'reviewDate'<normalized->>'targetDate')
    then raise exception using errcode='22023',message='invalid_command'; end if;
  return normalized;
end $$;

create function public.ghaf_doc_can_read(f uuid,c uuid,k text)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare a record;
begin
  select * into strict a from public.ghaf_family_actor(f);
  return a.role='parent' or (a.role='child' and c=a.child_id and k in ('study_plan','academic_goal','profile_preferences','learning'));
exception when others then return false;
end $$;
create policy app_family_documents_read on public.app_family_documents for select to authenticated
  using(public.ghaf_doc_can_read(family_id,child_id,kind));
create function public.ghaf_family_documents(p_family_id uuid)
returns setof public.app_family_documents language plpgsql stable security definer set search_path='' as $$
declare a record;
begin
  select * into strict a from public.ghaf_family_actor(p_family_id);
  return query select d.* from public.app_family_documents d where d.family_id=p_family_id
    and (a.role='parent' or (d.child_id=a.child_id and d.kind in ('study_plan','academic_goal','profile_preferences','learning')))
    order by d.created_at,d.id;
end $$;

create function public.ghaf_family_document_command(p_family_id uuid,p_request_id uuid,p_command jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  a record; prior public.app_family_document_requests%rowtype; d public.app_family_documents%rowtype;
  cmd jsonb; v jsonb; next_payload jsonb; normalized jsonb; item jsonb; result_value jsonb;
  action text; kind_value text; target_child uuid; id_value uuid; expected bigint;
  now_text text; old_status text; criterion_kind text; submission_index integer; matched boolean;
  did_delete boolean:=false; changed boolean:=true; route_value text; required_steps text[];
begin
  select * into strict a from public.ghaf_family_actor(p_family_id);
  if p_request_id is null or p_command is null or jsonb_typeof(p_command)<>'object'
    or octet_length(p_command::text)>10000 then raise exception using errcode='22023',message='invalid_command'; end if;
  perform 1 from public.app_families where id=p_family_id for update;
  select * into strict a from public.ghaf_family_actor(p_family_id);
  select * into prior from public.app_family_document_requests where auth_user_id=a.auth_user_id and request_id=p_request_id;
  if found then
    if prior.family_id<>p_family_id or prior.command<>p_command then raise exception using errcode='40001',message='request_conflict'; end if;
    return jsonb_build_object('documents',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from public.ghaf_family_documents(p_family_id) x),'result',prior.result);
  end if;
  now_text:=to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"');
  action:=p_command->>'type'; cmd:=p_command;
  if action='study' then
    if not public.ghaf_doc_keys(cmd,array['type','expectedRevision','command'])
      or not public.ghaf_doc_number(cmd->'expectedRevision',0,9007199254740990,true)
      then raise exception using errcode='22023',message='invalid_command'; end if;
    expected:=(cmd->>'expectedRevision')::bigint; cmd:=cmd->'command'; action:=cmd->>'type';
    if not public.ghaf_doc_text(cmd->'id',1,200) or (cmd->>'id') !~ '^[a-zA-Z0-9_.:@/-]+$'
      then raise exception using errcode='22023',message='invalid_command'; end if;
    if action in ('plan.create','goal.create') then
      if not public.ghaf_doc_keys(cmd,array['type','id','childId','input']) or expected<>0
        then raise exception using errcode='22023',message='invalid_command'; end if;
      target_child:=(cmd->>'childId')::uuid;
      if not exists(select 1 from public.app_children where id=target_child and family_id=p_family_id and active)
        or (a.role='child' and a.child_id<>target_child) then raise exception using errcode='42501',message='access_unavailable'; end if;
      if exists(select 1 from public.app_family_documents where family_id=p_family_id and kind in ('study_plan','academic_goal') and payload->>'id'=cmd->>'id')
        then raise exception using errcode='40001',message='request_conflict'; end if;
      kind_value:=case when action='plan.create' then 'study_plan' else 'academic_goal' end;
      if (select count(*) from public.app_family_documents where family_id=p_family_id and kind=kind_value)>=100
        then raise exception using errcode='54000',message='limit_reached'; end if;
      next_payload:=public.ghaf_doc_study_input(cmd->'input',action='goal.create')||jsonb_build_object(
        'id',cmd->>'id','childId',target_child,'createdBy',a.role,'createdAt',now_text,'updatedAt',now_text);
      if action='plan.create' then
        next_payload:=next_payload||jsonb_build_object('status',case when a.role='parent' then 'proposed' else 'planned' end,'helpRequest',null,'completedAt',null);
      else
        next_payload:=next_payload||jsonb_build_object('status','proposed','revision',1,'parentApprovedRevision',null,'childAcceptedRevision',null,
          'submissions','[]'::jsonb,'prizeStatus',case when next_payload->'prize'='null'::jsonb then null else 'promised' end,
          'acknowledgedAt',null,'unlockedAt',null,'givenAt',null);
      end if;
    else
      select * into d from public.app_family_documents where family_id=p_family_id and kind in ('study_plan','academic_goal') and payload->>'id'=cmd->>'id';
      if not found then raise exception using errcode='22023',message='invalid_command'; end if;
      if a.role='child' and d.child_id<>a.child_id then raise exception using errcode='42501',message='access_unavailable'; end if;
      if not exists(select 1 from public.app_children where id=d.child_id and family_id=p_family_id and active)
        then raise exception using errcode='42501',message='access_unavailable'; end if;
      if expected<>d.revision then raise exception using errcode='40001',message='request_conflict'; end if;
      next_payload:=d.payload; old_status:=d.payload->>'status'; kind_value:=d.kind; target_child:=d.child_id;
      if action like 'plan.%' and d.kind='study_plan' then
        if action='plan.help' then
          if not public.ghaf_doc_keys(cmd,array['type','id','request']) or coalesce(cmd->>'request','') not in ('explain','smaller_step','together')
            then raise exception using errcode='22023',message='invalid_command'; end if;
        elsif action='plan.revisit' then
          if not public.ghaf_doc_keys(cmd,array['type','id','date']) or not public.ghaf_doc_date(cmd->'date')
            then raise exception using errcode='22023',message='invalid_command'; end if;
        elsif not public.ghaf_doc_keys(cmd,array['type','id']) then raise exception using errcode='22023',message='invalid_command'; end if;
        if (action='plan.help_resolved' and a.role<>'parent') or (action<>'plan.help_resolved' and a.role<>'child')
          then raise exception using errcode='42501',message='access_unavailable'; end if;
        case action
          when 'plan.accept' then
            if old_status not in ('proposed','planned') then raise exception using errcode='22023',message='invalid_transition'; end if;
            next_payload:=next_payload||'{"status":"planned"}';
          when 'plan.start' then
            if old_status not in ('planned','paused','active') then raise exception using errcode='22023',message='invalid_transition'; end if;
            next_payload:=next_payload||'{"status":"active"}';
          when 'plan.pause' then
            if old_status not in ('planned','active','paused') then raise exception using errcode='22023',message='invalid_transition'; end if;
            next_payload:=next_payload||'{"status":"paused"}';
          when 'plan.complete' then
            if old_status='proposed' then raise exception using errcode='22023',message='invalid_transition'; end if;
            if old_status<>'completed' then next_payload:=next_payload||jsonb_build_object('status','completed','completedAt',now_text); end if;
          when 'plan.help' then next_payload:=next_payload||jsonb_build_object('helpRequest',cmd->'request');
          when 'plan.help_resolved' then next_payload:=next_payload||'{"helpRequest":null}';
          when 'plan.revisit' then next_payload:=next_payload||jsonb_build_object('revisitDate',cmd->'date');
          else raise exception using errcode='22023',message='invalid_command';
        end case;
      elsif action like 'goal.%' and d.kind='academic_goal' then
        if action='goal.edit' then
          if not public.ghaf_doc_keys(cmd,array['type','id','expectedRevision','input']) then raise exception using errcode='22023',message='invalid_command'; end if;
        elsif action in ('goal.approve','goal.accept') then
          if not public.ghaf_doc_keys(cmd,array['type','id','expectedRevision']) then raise exception using errcode='22023',message='invalid_command'; end if;
        elsif action='goal.submit' then
          if not public.ghaf_doc_keys(cmd,array['type','id','submissionId','result']) then raise exception using errcode='22023',message='invalid_command'; end if;
        elsif action='goal.confirm' then
          if not public.ghaf_doc_keys(cmd,array['type','id','submissionId','acknowledgement']) or not public.ghaf_doc_text(cmd->'acknowledgement',1,300)
            then raise exception using errcode='22023',message='invalid_command'; end if;
        elsif not public.ghaf_doc_keys(cmd,array['type','id']) then raise exception using errcode='22023',message='invalid_command'; end if;
        if action in ('goal.edit','goal.approve','goal.accept') and (not public.ghaf_doc_number(cmd->'expectedRevision',1,10000,true)
          or cmd->'expectedRevision'<>d.payload->'revision') then raise exception using errcode='40001',message='request_conflict'; end if;
        if (action in ('goal.approve','goal.confirm','goal.give') and a.role<>'parent')
          or (action in ('goal.accept','goal.decline','goal.request_change','goal.pause','goal.resume','goal.submit') and a.role<>'child')
          then raise exception using errcode='42501',message='access_unavailable'; end if;
        case action
          when 'goal.edit' then
            if d.payload->'childAcceptedRevision'<>'null'::jsonb then raise exception using errcode='22023',message='invalid_transition'; end if;
            if (d.payload->>'revision')::integer>=10000 then raise exception using errcode='54000',message='limit_reached'; end if;
            normalized:=public.ghaf_doc_study_input(cmd->'input',true);
            next_payload:=next_payload||normalized||jsonb_build_object('revision',(d.payload->>'revision')::integer+1,
              'parentApprovedRevision',null,'childAcceptedRevision',null,'status','proposed',
              'prizeStatus',case when normalized->'prize'='null'::jsonb then null else 'promised' end);
          when 'goal.approve' then
            if d.payload->'parentApprovedRevision'<>d.payload->'revision' then
              if old_status<>'proposed' then raise exception using errcode='22023',message='invalid_transition'; end if;
              next_payload:=next_payload||jsonb_build_object('parentApprovedRevision',d.payload->'revision');
            end if;
          when 'goal.accept' then
            if d.payload->'childAcceptedRevision'<>d.payload->'revision' then
              if old_status<>'proposed' or d.payload->'parentApprovedRevision'<>d.payload->'revision'
                then raise exception using errcode='22023',message='invalid_transition'; end if;
              next_payload:=next_payload||jsonb_build_object('childAcceptedRevision',d.payload->'revision','status','active');
            end if;
          when 'goal.decline' then
            if d.payload->'childAcceptedRevision'<>'null'::jsonb then raise exception using errcode='22023',message='invalid_transition'; end if;
            next_payload:=next_payload||'{"status":"declined","parentApprovedRevision":null}';
          when 'goal.request_change' then
            if old_status in ('acknowledged','awaiting_confirmation') then raise exception using errcode='22023',message='invalid_transition'; end if;
            next_payload:=next_payload||jsonb_build_object('status','change_requested','parentApprovedRevision',
              case when d.payload->'childAcceptedRevision'='null'::jsonb then 'null'::jsonb else d.payload->'parentApprovedRevision' end);
          when 'goal.pause' then
            if old_status not in ('active','paused') then raise exception using errcode='22023',message='invalid_transition'; end if;
            next_payload:=next_payload||'{"status":"paused"}';
          when 'goal.resume' then
            if old_status not in ('active','paused','change_requested') or d.payload->'childAcceptedRevision'<>d.payload->'revision'
              then raise exception using errcode='22023',message='invalid_transition'; end if;
            next_payload:=next_payload||'{"status":"active"}';
          when 'goal.submit' then
            if not public.ghaf_doc_text(cmd->'submissionId',1,200) or (cmd->>'submissionId') !~ '^[a-zA-Z0-9_.:@/-]+$'
              then raise exception using errcode='22023',message='invalid_command'; end if;
            select value into item from jsonb_array_elements(d.payload->'submissions') where value->>'id'=cmd->>'submissionId';
            if found then
              if item->'result'<>cmd->'result' then raise exception using errcode='40001',message='request_conflict'; end if;
            else
              if old_status<>'active' or d.payload->'childAcceptedRevision'<>d.payload->'revision'
                then raise exception using errcode='22023',message='invalid_transition'; end if;
              if jsonb_array_length(d.payload->'submissions')>=30 then raise exception using errcode='54000',message='limit_reached'; end if;
              v:=cmd->'result'; criterion_kind:=d.payload->'criterion'->>'kind';
              if coalesce(v->>'kind','')<>criterion_kind then raise exception using errcode='22023',message='invalid_command'; end if;
              if criterion_kind='practice_count' then
                if not public.ghaf_doc_keys(v,array['kind','count']) or not public.ghaf_doc_number(v->'count',0,1000000,true)
                  then raise exception using errcode='22023',message='invalid_command'; end if;
              elsif criterion_kind='mark' then
                if not public.ghaf_doc_keys(v,array['kind','value']) or not public.ghaf_doc_number(v->'value',0,(d.payload->'criterion'->>'denominator')::numeric)
                  then raise exception using errcode='22023',message='invalid_command'; end if;
              elsif not public.ghaf_doc_keys(v,array['kind','achieved']) or jsonb_typeof(v->'achieved')<>'boolean'
                then raise exception using errcode='22023',message='invalid_command'; end if;
              next_payload:=next_payload||jsonb_build_object('status','awaiting_confirmation','submissions',(d.payload->'submissions')||jsonb_build_array(
                jsonb_build_object('id',cmd->>'submissionId','result',v,'submittedAt',now_text,'reviewedAt',null,'acknowledgement',null,'metCriterion',null)));
            end if;
          when 'goal.confirm' then
            select value,(ordinality-1)::integer into item,submission_index from jsonb_array_elements(d.payload->'submissions') with ordinality where value->>'id'=cmd->>'submissionId';
            if not found then raise exception using errcode='22023',message='invalid_command'; end if;
            if item->'reviewedAt'='null'::jsonb then
              if old_status<>'awaiting_confirmation' then raise exception using errcode='22023',message='invalid_transition'; end if;
              criterion_kind:=d.payload->'criterion'->>'kind';
              matched:=case criterion_kind when 'practice_count' then (item->'result'->>'count')::numeric >= (d.payload->'criterion'->>'target')::numeric
                when 'mark' then (item->'result'->>'value')::numeric >= (d.payload->'criterion'->>'threshold')::numeric
                else (item->'result'->>'achieved')::boolean end;
              item:=item||jsonb_build_object('reviewedAt',now_text,'acknowledgement',btrim(cmd->>'acknowledgement'),'metCriterion',matched);
              next_payload:=jsonb_set(next_payload,array['submissions',submission_index::text],item)||jsonb_build_object('status',case when matched then 'acknowledged' else 'active' end);
              if matched then
                next_payload:=next_payload||jsonb_build_object('acknowledgedAt',now_text);
                if d.payload->'prize'<>'null'::jsonb then next_payload:=next_payload||jsonb_build_object('prizeStatus','unlocked','unlockedAt',now_text); end if;
              end if;
            end if;
          when 'goal.give' then
            if coalesce(d.payload->>'prizeStatus','')<>'given' then
              if coalesce(d.payload->>'prizeStatus','')<>'unlocked' or old_status<>'acknowledged'
                then raise exception using errcode='22023',message='invalid_transition'; end if;
              next_payload:=next_payload||jsonb_build_object('prizeStatus','given','givenAt',now_text);
            end if;
          else raise exception using errcode='22023',message='invalid_command';
        end case;
      else raise exception using errcode='22023',message='invalid_command'; end if;
      if next_payload<>d.payload then next_payload:=next_payload||jsonb_build_object('updatedAt',now_text); end if;
    end if;
  elsif action in ('connections.save','preferences.save','template.save','template.delete') then
    if a.role<>'parent' then raise exception using errcode='42501',message='access_unavailable'; end if;
    if not public.ghaf_doc_number(cmd->'expectedRevision',0,9007199254740990,true)
      then raise exception using errcode='22023',message='invalid_command'; end if;
    expected:=(cmd->>'expectedRevision')::bigint; v:=cmd->'input';
    if action='connections.save' then
      if not public.ghaf_doc_keys(cmd,array['type','expectedRevision','input'])
        or not public.ghaf_doc_keys(v,array['primaryGuardianName','secondaryGuardianName','relatives'])
        or not public.ghaf_doc_text(v->'primaryGuardianName',2,40) or not public.ghaf_doc_text(v->'secondaryGuardianName',0,40)
        or coalesce(jsonb_typeof(v->'relatives'),'')<>'array' then raise exception using errcode='22023',message='invalid_command'; end if;
      if jsonb_array_length(v->'relatives')>6 or (select count(*)<>count(distinct value->>'id') from jsonb_array_elements(v->'relatives'))
        then raise exception using errcode='22023',message='invalid_command'; end if;
      for item in select value from jsonb_array_elements(v->'relatives') loop
        if not public.ghaf_doc_keys(item,array['id','displayName','relationship','rhythm'])
          or coalesce(item->>'id','') !~ '^relative_[1-6]$' or not public.ghaf_doc_text(item->'displayName',2,40)
          or coalesce(item->>'relationship','') not in ('grandmother','grandfather','aunt','uncle')
          or coalesce(item->>'rhythm','') not in ('weekly','monthly','every_three_months','no_schedule')
          then raise exception using errcode='22023',message='invalid_command'; end if;
      end loop;
      kind_value:='connections'; target_child:=null;
      select * into d from public.app_family_documents where family_id=p_family_id and kind=kind_value;
    elsif action='preferences.save' then
      if not public.ghaf_doc_keys(cmd,array['type','childId','expectedRevision','input'])
        or not public.ghaf_doc_keys(v,array['avatarId','preferredLanguage','sex','interests','hobbies','accessibilityDefaults','supportPreferences',
          'customInterest','customHobby','customSupportPreference','customAccessibility','personalizationEnabled'])
        or coalesce(v->>'avatarId','') not in ('ghaf_tree','leaf','flower','energy_leaf','water_drop')
        or coalesce(v->>'preferredLanguage','') not in ('ar','en','both') or coalesce(v->>'sex','') not in ('male','female')
        or coalesce(jsonb_typeof(v->'personalizationEnabled'),'')<>'boolean'
        or not public.ghaf_doc_options(v->'interests',array['nature','making','stories','family_helping','sustainability'])
        or not public.ghaf_doc_options(v->'hobbies',array['drawing','reading','sports','puzzles','gardening'])
        or not public.ghaf_doc_options(v->'accessibilityDefaults',array['larger_text','simpler_instructions','high_contrast','reduced_motion'])
        or not public.ghaf_doc_options(v->'supportPreferences',array['short_steps','visual_examples','extra_time','adult_alongside','quiet_reminders'])
        then raise exception using errcode='22023',message='invalid_command'; end if;
      foreach route_value in array array['customInterest','customHobby','customSupportPreference','customAccessibility'] loop
        if v->route_value<>'null'::jsonb and not public.ghaf_doc_text(v->route_value,1,160)
          then raise exception using errcode='22023',message='invalid_command'; end if;
      end loop;
      target_child:=(cmd->>'childId')::uuid;
      if not exists(select 1 from public.app_children where id=target_child and family_id=p_family_id and active)
        then raise exception using errcode='42501',message='access_unavailable'; end if;
      kind_value:='profile_preferences';
      select * into d from public.app_family_documents where family_id=p_family_id and child_id=target_child and kind=kind_value;
    else
      if action='template.delete' then
        if not public.ghaf_doc_keys(cmd,array['type','id','expectedRevision']) then raise exception using errcode='22023',message='invalid_command'; end if;
      elsif not public.ghaf_doc_keys(cmd,array['type','id','expectedRevision','input'])
        or not public.ghaf_doc_keys(v,array['categoryId','title','positiveAction','recurrence'])
        or coalesce(v->>'categoryId','') not in ('faith_gratitude','roots_kinship','home_responsibility','green_impact','food_hospitality','heritage_etiquette','kindness_community','learning_wellbeing')
        or coalesce(v->>'recurrence','') not in ('once','recurrent')
        then raise exception using errcode='22023',message='invalid_command'; end if;
      if action='template.save' then
        foreach route_value in array array['title','positiveAction'] loop
          if not public.ghaf_doc_keys(v->route_value,array['ar','en']) or not public.ghaf_doc_text(v->route_value->'ar',1,180) or not public.ghaf_doc_text(v->route_value->'en',1,180)
            then raise exception using errcode='22023',message='invalid_command'; end if;
        end loop;
      end if;
      kind_value:='saved_template'; target_child:=null;
      if cmd->'id'<>'null'::jsonb then
        id_value:=(cmd->>'id')::uuid;
        select * into d from public.app_family_documents where id=id_value and family_id=p_family_id and kind=kind_value;
        if not found then raise exception using errcode='22023',message='invalid_command'; end if;
      elsif action='template.delete' then raise exception using errcode='22023',message='invalid_command'; end if;
      if action='template.save' then
        if d.id is null and (select count(*) from public.app_family_documents where family_id=p_family_id and kind=kind_value)>=20
          then raise exception using errcode='54000',message='limit_reached'; end if;
        if exists(select 1 from public.app_family_documents t where t.family_id=p_family_id and t.kind=kind_value
          and t.id is distinct from d.id and lower(t.payload->>'categoryId')=lower(v->>'categoryId')
          and lower(t.payload->'title'->>'ar')=lower(btrim(v->'title'->>'ar')) and lower(t.payload->'title'->>'en')=lower(btrim(v->'title'->>'en'))
          and lower(t.payload->'positiveAction'->>'ar')=lower(btrim(v->'positiveAction'->>'ar')) and lower(t.payload->'positiveAction'->>'en')=lower(btrim(v->'positiveAction'->>'en')))
          then raise exception using errcode='40001',message='request_conflict'; end if;
      end if;
    end if;
    if expected<>coalesce(d.revision,0) then raise exception using errcode='40001',message='request_conflict'; end if;
    next_payload:=v; did_delete:=action='template.delete';
  elsif action in ('learning.start','learning.step','learning.check','learning.complete') then
    if a.role<>'child' then raise exception using errcode='42501',message='access_unavailable'; end if;
    if not public.ghaf_doc_keys(cmd,case action when 'learning.step' then array['type','route','stepId'] when 'learning.check' then array['type','route','optionId'] else array['type','route'] end)
      or coalesce(cmd->>'route','') not in ('story','accessible') then raise exception using errcode='22023',message='invalid_command'; end if;
    target_child:=a.child_id; kind_value:='learning'; route_value:=cmd->>'route';
    if (select coalesce(sum(seeds),0) from public.app_recognitions where family_id=p_family_id and child_id=target_child)<132
      then raise exception using errcode='22023',message='invalid_transition'; end if;
    select * into d from public.app_family_documents where family_id=p_family_id and child_id=target_child and kind=kind_value;
    if d.id is null and action<>'learning.start' then raise exception using errcode='22023',message='invalid_transition'; end if;
    next_payload:=coalesce(d.payload,'{"packageId":"learning.mangrove_roots.v1","routes":{"story":{"steps":[],"checkSatisfied":false},"accessible":{"steps":[],"checkSatisfied":false}},"completedAt":null,"completedRoute":null}'::jsonb);
    required_steps:=case route_value when 'story' then array['story_frame_1','story_frame_2'] else array['accessible_section_1','accessible_section_2'] end;
    if action='learning.step' then
      if coalesce(cmd->>'stepId','')<>all(required_steps) then raise exception using errcode='22023',message='invalid_command'; end if;
      if not (next_payload#>array['routes',route_value,'steps']) ? (cmd->>'stepId') then
        if cmd->>'stepId'=required_steps[2] and not(next_payload#>array['routes',route_value,'steps']) ? required_steps[1]
          then raise exception using errcode='22023',message='invalid_transition'; end if;
        next_payload:=jsonb_set(next_payload,array['routes',route_value,'steps'],(next_payload#>array['routes',route_value,'steps'])||jsonb_build_array(cmd->>'stepId'));
      end if;
    elsif action='learning.check' then
      if coalesce(cmd->>'optionId','') not in ('habitat_support_and_care','visit_or_task_reward') then raise exception using errcode='22023',message='invalid_command'; end if;
      if not(next_payload#>array['routes',route_value,'steps']) ?& required_steps then raise exception using errcode='22023',message='invalid_transition'; end if;
      if cmd->>'optionId'='habitat_support_and_care' then next_payload:=jsonb_set(next_payload,array['routes',route_value,'checkSatisfied'],'true'); end if;
    elsif action='learning.complete' then
      if next_payload->'completedAt'='null'::jsonb then
        if not(next_payload#>array['routes',route_value,'steps']) ?& required_steps or next_payload#>>array['routes',route_value,'checkSatisfied']<>'true'
          then raise exception using errcode='22023',message='invalid_transition'; end if;
        next_payload:=next_payload||jsonb_build_object('completedAt',now_text,'completedRoute',route_value);
      end if;
    end if;
  else raise exception using errcode='22023',message='invalid_command'; end if;

  if did_delete then
    delete from public.app_family_documents where id=d.id;
    result_value:=jsonb_build_object('documentId',d.id,'revision',d.revision+1);
  elsif d.id is null then
    insert into public.app_family_documents(family_id,child_id,kind,payload) values(p_family_id,target_child,kind_value,next_payload) returning * into d;
    result_value:=jsonb_build_object('documentId',d.id,'revision',d.revision);
  else
    changed:=next_payload<>d.payload;
    if changed then update public.app_family_documents set payload=next_payload,revision=revision+1,updated_at=clock_timestamp() where id=d.id returning * into d; end if;
    result_value:=jsonb_build_object('documentId',d.id,'revision',d.revision);
  end if;
  if changed then update public.app_families set revision=revision+1 where id=p_family_id; end if;
  insert into public.app_family_document_requests(auth_user_id,request_id,family_id,command,result) values(a.auth_user_id,p_request_id,p_family_id,p_command,result_value);
  return jsonb_build_object('documents',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from public.ghaf_family_documents(p_family_id) x),'result',result_value);
exception when invalid_text_representation or numeric_value_out_of_range then
  raise exception using errcode='22023',message='invalid_command';
end $$;

revoke all on function public.ghaf_doc_keys(jsonb,text[],text[]),public.ghaf_doc_text(jsonb,integer,integer),
  public.ghaf_doc_number(jsonb,numeric,numeric,boolean),public.ghaf_doc_date(jsonb),public.ghaf_doc_options(jsonb,text[]),
  public.ghaf_doc_study_input(jsonb,boolean),public.ghaf_doc_can_read(uuid,uuid,text),
  public.ghaf_family_documents(uuid),public.ghaf_family_document_command(uuid,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.ghaf_doc_can_read(uuid,uuid,text),public.ghaf_family_documents(uuid),public.ghaf_family_document_command(uuid,uuid,jsonb) to authenticated;
