begin;

-- Custom definitions are private Parent-authored content, never global reference or earned evidence.
create table public.app_custom_task_templates (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.app_families(id),
  template jsonb not null,
  revision bigint not null default 0 check(revision between 0 and 9007199254740990),
  active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default clock_timestamp(),
  unique(id,family_id)
);
alter table public.app_custom_task_templates enable row level security;
revoke all on public.app_custom_task_templates from public,anon,authenticated;
create table public.app_routine_phases (
  family_id uuid not null references public.app_families(id),
  child_id uuid not null,
  catalog_id text not null references public.app_task_catalog(id),
  phase text not null check(phase='maintenance'),
  created_at timestamptz not null default clock_timestamp(),
  reviewed_by uuid not null references auth.users(id),
  primary key(family_id,child_id,catalog_id),
  foreign key(child_id,family_id) references public.app_children(id,family_id)
);
alter table public.app_routine_phases enable row level security;
revoke all on public.app_routine_phases from public,anon,authenticated;
alter table public.app_tasks alter column catalog_id drop not null;
alter table public.app_tasks add column custom_template_id uuid;
alter table public.app_tasks add constraint app_custom_task_family foreign key(custom_template_id,family_id)
  references public.app_custom_task_templates(id,family_id);
alter table public.app_tasks add constraint app_task_definition_source check(
  (catalog_id is not null and custom_template_id is null) or
  (catalog_id is null and custom_template_id is not null));

create function public.ghaf_custom_template(p_id uuid,p_input jsonb) returns jsonb
language plpgsql set search_path='' as $$
declare v_title jsonb:=p_input->'title';v_action jsonb:=p_input->'positiveAction';v_text jsonb;
  v_locale text;v_landscape text;v_category text:=p_input->>'categoryId';v_guide jsonb;v_praise jsonb;
begin
  if p_input-array['type','title','positiveAction','categoryId','recurrence','reviewed']<>'{}'::jsonb
    or not(p_input ?& array['type','title','positiveAction','categoryId','recurrence','reviewed'])
    or p_input->'reviewed'<>'true'::jsonb or jsonb_typeof(p_input->'recurrence')<>'string'
    or p_input->>'recurrence' not in ('once','recurrent') then
    raise exception using errcode='PT400',message='invalid_command'; end if;
  select template->>'landscapeId' into v_landscape from public.app_task_catalog
    where template->>'categoryId'=v_category order by id limit 1;
  if not found then raise exception using errcode='PT400',message='invalid_command'; end if;
  foreach v_text in array array[v_title,v_action] loop
    if jsonb_typeof(v_text)<>'object' or not(v_text ?& array['ar','en']) or v_text-array['ar','en']<>'{}'::jsonb then
      raise exception using errcode='PT400',message='invalid_command'; end if;
    foreach v_locale in array array['ar','en'] loop
      if jsonb_typeof(v_text->v_locale)<>'string' or char_length(btrim(v_text->>v_locale)) not between 1 and 180
        or (v_text->>v_locale) ~ '[[:cntrl:]]'
        or (v_text->>v_locale) ~* '(clean plate|calories|body weight|forced eating|سعرات|وزن الجسم|إنهاء الطبق|كسول|lazy|defiant|diagnos|تشخيص)' then
        raise exception using errcode='PT400',message='invalid_command'; end if;
    end loop;
  end loop;
  v_guide:=jsonb_build_object('ar','يختار وليّ الأمر المهمة المناسبة.','en','A Parent chooses the appropriate task.');
  v_praise:=jsonb_build_object('ar','نفّذت الخطوة الآمنة المتفق عليها.','en','You completed the agreed safe step.');
  return jsonb_build_object('id','custom_'||p_id::text,'categoryId',v_category,'landscapeId',v_landscape,
    'title',v_title,'positiveAction',v_action,'definitionOfDone',v_action,
    'whyItMatters',jsonb_build_object('ar','نشاط خاص متفق عليه مع وليّ الأمر، دون بذور أو نمو مشترك.',
      'en','A private activity agreed with the Parent, without Seeds or shared growth.'),
    'childAgeBands',jsonb_build_array('6_8','9_11','12_14'),
    'estimatedEffort',jsonb_build_object('ar','وفق الاتفاق مع وليّ الأمر','en','As agreed with the Parent'),
    'permittedHelp',jsonb_build_object('ar','يمكنك طلب المساعدة المتفق عليها.','en','You may ask for the agreed help.'),
    'supervision',v_guide,'safety',jsonb_build_object('adultPreCheck',v_guide,
      'adultSecondCheck',jsonb_build_object('ar','يتحقق وليّ الأمر من اكتمال المهمة بأمان.','en','A Parent checks that the task was completed safely.'),
      'adultOwnedActions',jsonb_build_array(jsonb_build_object('ar','يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف.','en','An adult owns any supervised step.')),
      'childAllowedActions',jsonb_build_array(v_action),
      'excludedHazards',jsonb_build_array(jsonb_build_object('ar','لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية.',
        'en','The task excludes sharps, chemicals, and electrical work.')),
      'stopAndAskAdult',jsonb_build_object('ar','توقّف واسأل شخصاً بالغاً عند الشك.','en','Stop and ask an adult when unsure.'),
      'routeConstraint',null,'indoorAlternative',null,'aftercare',null),
    'evidencePolicy','none','reflectionPolicy','none','recognitionMode','recognition_only','routinePhase','not_applicable',
    'recurrence',p_input->>'recurrence','displayedSeedAward',null,'visibilityScope','child_guardian','circleEligible',false,
    'privacyNotice',jsonb_build_object('ar','تظهر المهمة للطفل ووليّ الأمر فقط.','en','Only the Child and authorized Parents see this task.'),
    'origin','prepared','catalogExecution',jsonb_build_object('revision','parent_reviewed_custom_v1',
      'steps',jsonb_build_array(jsonb_build_object('id','custom-action','kind','action','text',v_action,'condition',null)),
      'completionScope','one_session','confirmationPraise',v_praise,'permittedHelpPraise',v_praise,
      'smallerAlternative',null,'safeEquivalent',null));
end; $$;

create function public.ghaf_family_reference_snapshot(p_family_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_identity jsonb; v_actor record; v_family uuid; v_family_dto jsonb:=null;
  v_families jsonb; v_members jsonb:='[]'; v_children jsonb:='[]'; v_tasks jsonb:='[]';
  v_recognitions jsonb:='[]'; v_memories jsonb:='[]'; v_deleted_memories jsonb:='[]'; v_catalog jsonb;
  v_canopy bigint:=0;
begin
  v_identity:=public.ghaf_family_identity();
  v_family:=coalesce(p_family_id,(v_identity->>'familyId')::uuid);
  select coalesce(jsonb_agg(jsonb_build_object('id',f.id,'name',f.name,'revision',f.revision) order by f.created_at,f.id),'[]')
    into v_families from public.app_families f where public.ghaf_family_visible(f.id);
  select coalesce(jsonb_agg(c.template order by c.id),'[]') into v_catalog from public.app_task_catalog c;
  if v_family is not null then
    select * into v_actor from public.ghaf_family_actor(v_family);
    v_identity:=jsonb_build_object('userId',auth.uid(),'role',v_actor.role,'familyId',v_family,'childId',v_actor.child_id);
    select jsonb_build_object('id',f.id,'name',f.name,'revision',f.revision) into v_family_dto
      from public.app_families f where f.id=v_family;
    select coalesce(sum(canopy_contribution),0) into v_canopy from public.app_recognitions where family_id=v_family;
    if v_actor.role='parent' then
      select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'userId',m.auth_user_id,'role',m.role,
        'childId',m.child_id,'active',m.active) order by m.created_at,m.id),'[]') into v_members
        from public.app_family_members m where m.family_id=v_family;
    end if;
    select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'familyId',c.family_id,'displayName',c.display_name,
      'ageBand',c.age_band,'active',c.active) order by c.created_at,c.id),'[]') into v_children
      from public.app_children c where c.family_id=v_family and (v_actor.role='parent' or c.id=v_actor.child_id);
    select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'familyId',t.family_id,'childId',t.child_id,
      'catalogId',coalesce(t.catalog_id,t.template->>'id'),'status',t.status,'revision',t.revision,'stepStates',t.step_states,
      'helpRequested',t.help_requested,'praise',t.praise,'createdAt',t.created_at,'submittedAt',t.submitted_at,
      'recognizedAt',t.recognized_at,'template',t.template) order by t.created_at,t.id),'[]') into v_tasks
      from public.app_tasks t where t.family_id=v_family and (v_actor.role='parent' or t.child_id=v_actor.child_id);
    select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'taskId',r.task_id,'childId',r.child_id,
      'seeds',r.seeds,'landscapeId',r.landscape_id,'canopyContribution',r.canopy_contribution,
      'createdAt',r.created_at) order by r.created_at,r.id),'[]') into v_recognitions
      from public.app_recognitions r where r.family_id=v_family and (v_actor.role='parent' or r.child_id=v_actor.child_id);
    select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'taskId',m.task_id,'childId',m.child_id,
      'title',m.title,'createdAt',m.created_at) order by m.created_at desc,m.id),'[]') into v_memories
      from public.app_memories m where m.family_id=v_family and m.deleted_at is null
        and (v_actor.role='parent' or m.child_id=v_actor.child_id);
    select coalesce(jsonb_agg(m.task_id order by m.task_id),'[]') into v_deleted_memories
      from public.app_memories m where m.family_id=v_family and m.deleted_at is not null
        and (v_actor.role='parent' or m.child_id=v_actor.child_id);
  end if;
  return jsonb_build_object('schemaVersion',1,'actor',v_identity,'families',v_families,'family',v_family_dto,
    'members',v_members,'children',v_children,'tasks',v_tasks,'recognitions',v_recognitions,'memories',v_memories,'catalog',v_catalog,
    'familyCanopyContributions',v_canopy,'deletedMemoryTaskIds',v_deleted_memories);
end; $$;

create or replace function public.ghaf_family_snapshot(p_family_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_snapshot jsonb;v_family uuid;v_actor record;v_templates jsonb:='[]';
begin
  v_snapshot:=public.ghaf_family_reference_snapshot(p_family_id);
  v_family:=(v_snapshot#>>'{family,id}')::uuid;
  if v_family is not null then
    select * into v_actor from public.ghaf_family_actor(v_family);
    if v_actor.role='parent' then
      select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'familyId',t.family_id,'revision',t.revision,
        'template',t.template,'createdAt',t.created_at,'active',t.active) order by t.created_at,t.id),'[]') into v_templates
        from public.app_custom_task_templates t where t.family_id=v_family;
    end if;
  end if;
  return v_snapshot||jsonb_build_object('customTemplates',v_templates);
end; $$;

alter function public.ghaf_family_command(uuid,uuid,jsonb) rename to ghaf_family_core_command;
revoke all on function public.ghaf_family_core_command(uuid,uuid,jsonb) from public,anon,authenticated;
create function public.ghaf_family_command(p_family_id uuid,p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_type text:=p_command->>'type';v_actor record;v_receipt public.app_command_receipts;
 v_template public.app_custom_task_templates;v_id uuid;v_child uuid;v_task public.app_tasks;v_result jsonb:=null;
 v_expected bigint;v_response jsonb;
begin
  if v_type='assign_task' then
    v_response:=public.ghaf_family_core_command(p_family_id,p_request_id,p_command);
    update public.app_tasks t set template=t.template||'{"routinePhase":"maintenance","displayedSeedAward":null}'::jsonb
      from public.app_routine_phases p where t.id=(v_response#>>'{result,taskId}')::uuid
        and t.family_id=p_family_id and p.family_id=t.family_id and p.child_id=t.child_id and p.catalog_id=t.catalog_id
        and t.status='assigned' and t.revision=0 and t.created_at>=p.created_at
        and t.template->>'routinePhase'='acquisition';
    return jsonb_build_object('snapshot',public.ghaf_family_snapshot(p_family_id),'result',v_response->'result');
  end if;
  if v_type is null or v_type not in ('create_custom_template','assign_custom_task','remove_custom_template','begin_maintenance') then
    return public.ghaf_family_core_command(p_family_id,p_request_id,p_command); end if;
  select * into v_actor from public.ghaf_family_actor(p_family_id);
  if v_actor.role<>'parent' then raise exception using errcode='42501',message='access_unavailable'; end if;
  if p_request_id is null or jsonb_typeof(p_command)<>'object' or octet_length(p_command::text)>8192 then
    raise exception using errcode='PT400',message='invalid_command'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,20020));
  perform 1 from public.app_families where id=p_family_id for update;
  perform public.ghaf_family_actor(p_family_id);
  select * into v_receipt from public.app_command_receipts where auth_user_id=auth.uid() and request_id=p_request_id;
  if found then
    if v_receipt.family_id<>p_family_id or v_receipt.command<>p_command then
      raise exception using errcode='PT409',message='request_conflict'; end if;
    return jsonb_build_object('snapshot',public.ghaf_family_snapshot(p_family_id),'result',v_receipt.result);
  end if;
  if v_type='create_custom_template' then
    if (select count(*) from public.app_custom_task_templates where family_id=p_family_id and active)>=20 then
      raise exception using errcode='PT400',message='invalid_command'; end if;
    v_id:=gen_random_uuid();
    insert into public.app_custom_task_templates(id,family_id,template,created_by)
      values(v_id,p_family_id,public.ghaf_custom_template(v_id,p_command),auth.uid());
    v_result:=jsonb_build_object('templateId',v_id);
  elsif v_type in ('assign_custom_task','remove_custom_template') then
    if (v_type='assign_custom_task' and (not(p_command ?& array['type','templateId','childId'])
        or p_command-array['type','templateId','childId']<>'{}'::jsonb))
      or (v_type='remove_custom_template' and (not(p_command ?& array['type','templateId','expectedRevision'])
        or p_command-array['type','templateId','expectedRevision']<>'{}'::jsonb)) then
      raise exception using errcode='PT400',message='invalid_command'; end if;
    begin v_id:=(p_command->>'templateId')::uuid;
    exception when others then raise exception using errcode='PT400',message='invalid_command'; end;
    select * into v_template from public.app_custom_task_templates where id=v_id and family_id=p_family_id for update;
    if not found then raise exception using errcode='42501',message='family_unavailable'; end if;
    if v_type='assign_custom_task' then
      if not v_template.active then raise exception using errcode='PT409',message='invalid_transition'; end if;
      begin v_child:=(p_command->>'childId')::uuid;
      exception when others then raise exception using errcode='PT400',message='invalid_command'; end;
      if not exists(select 1 from public.app_children where id=v_child and family_id=p_family_id and active) then
        raise exception using errcode='42501',message='family_unavailable'; end if;
      insert into public.app_tasks(family_id,child_id,catalog_id,custom_template_id,template)
        values(p_family_id,v_child,null,v_template.id,v_template.template) returning id into v_id;
      v_result:=jsonb_build_object('taskId',v_id);
    else
      if jsonb_typeof(p_command->'expectedRevision')<>'number' or (p_command->>'expectedRevision')!~'^[0-9]{1,16}$' then
        raise exception using errcode='PT400',message='invalid_command'; end if;
      if (p_command->>'expectedRevision')::bigint<>v_template.revision then
        raise exception using errcode='PT409',message='request_conflict'; end if;
      update public.app_custom_task_templates set active=false,revision=revision+1 where id=v_template.id;
    end if;
  else
    if not(p_command ?& array['type','taskId','expectedRevision']) or p_command-array['type','taskId','expectedRevision']<>'{}'::jsonb
      or jsonb_typeof(p_command->'expectedRevision')<>'number' or (p_command->>'expectedRevision')!~'^[0-9]{1,16}$' then
      raise exception using errcode='PT400',message='invalid_command'; end if;
    perform public.ghaf_require_recent_parent_password(p_family_id);
    begin v_id:=(p_command->>'taskId')::uuid;
    exception when others then raise exception using errcode='PT400',message='invalid_command'; end;
    select * into v_task from public.app_tasks where id=v_id and family_id=p_family_id for update;
    if not found then raise exception using errcode='42501',message='family_unavailable'; end if;
    if v_task.revision<>(p_command->>'expectedRevision')::bigint then
      raise exception using errcode='PT409',message='request_conflict'; end if;
    if v_task.status<>'assigned' or v_task.template->>'recognitionMode'<>'fade_first'
      or v_task.template->>'recurrence'<>'recurrent' or v_task.template->>'routinePhase'<>'acquisition'
      or (select count(*) from public.app_recognitions r join public.app_tasks t on t.id=r.task_id
        where r.family_id=p_family_id and r.child_id=v_task.child_id and t.catalog_id=v_task.catalog_id)<3 then
      raise exception using errcode='PT409',message='invalid_transition'; end if;
    update public.app_tasks set template=template||'{"routinePhase":"maintenance","displayedSeedAward":null}'::jsonb,
      revision=revision+1 where id=v_task.id;
    insert into public.app_routine_phases(family_id,child_id,catalog_id,phase,reviewed_by)
      values(p_family_id,v_task.child_id,v_task.catalog_id,'maintenance',auth.uid())
      on conflict(family_id,child_id,catalog_id) do nothing;
  end if;
  update public.app_families set revision=revision+1 where id=p_family_id;
  insert into public.app_command_receipts(auth_user_id,request_id,family_id,command,result)
    values(auth.uid(),p_request_id,p_family_id,p_command,v_result);
  return jsonb_build_object('snapshot',public.ghaf_family_snapshot(p_family_id),'result',v_result);
end; $$;

revoke all on function public.ghaf_custom_template(uuid,jsonb),public.ghaf_family_reference_snapshot(uuid),
  public.ghaf_family_snapshot(uuid),public.ghaf_family_command(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.ghaf_family_snapshot(uuid),public.ghaf_family_command(uuid,uuid,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
