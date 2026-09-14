begin;

-- Stage promises use a future eligible crossing, preserving the approved transition rule.
create function public.ghaf_growth_reward_baseline(p_family uuid,p_child uuid,p_before timestamptz) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_object_agg(l.id,coalesce((select sum(r.seeds) from public.app_recognitions r join public.app_tasks t on t.id=r.task_id
  where r.family_id=p_family and r.child_id=p_child and r.landscape_id=l.id and r.created_at<p_before
  and public.ghaf_growth_eligible(t,r.seeds)),0))
 from (values('ghaf'),('samar'),('sidr'),('date_palm'),('mangrove'))l(id);
$$;
create function public.ghaf_growth_reward_crossed(p_milestone jsonb,p_delta jsonb,p_baseline jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare v_threshold integer; v_landscape text; v_count integer;
begin
 if p_milestone->>'kind'='eligible_seed_delta' then
  return (select sum(value::bigint) from jsonb_each_text(p_delta)) >= (p_milestone->>'requiredSeedDelta')::bigint;
 end if;
 v_threshold:=case p_milestone->>'targetStage' when 'shoot' then 20 when 'sapling' then 60 when 'shade' then 120 when 'flourishing' then 200 end;
 if p_milestone->>'kind'='landscape_stage' then
  v_landscape:=p_milestone->>'landscapeId';
  return (p_baseline->>v_landscape)::bigint<v_threshold and (p_baseline->>v_landscape)::bigint+(p_delta->>v_landscape)::bigint>=v_threshold;
 end if;
 select count(*) into v_count from jsonb_each_text(p_delta)d where (p_baseline->>d.key)::bigint<v_threshold and (p_baseline->>d.key)::bigint+d.value::bigint>=v_threshold;
 return v_count>=(p_milestone->>'requiredCount')::integer;
end; $$;

create or replace function public.ghaf_growth_evaluate(p_family uuid,p_child uuid,p_time timestamptz) returns void
language plpgsql security definer set search_path='' as $$
declare v_seeds bigint; v_credits bigint; v_recognitions jsonb; v_learning uuid; v_badge text; v_plan public.app_reward_versions; v_totals jsonb; v_baseline jsonb;
begin
 select coalesce(sum(r.seeds),0),coalesce(jsonb_agg(r.id order by r.created_at,r.id),'[]') into v_seeds,v_recognitions
  from public.app_recognitions r where r.family_id=p_family and r.child_id=p_child;
 select count(*) into v_credits from public.app_recognitions r join public.app_tasks t on t.id=r.task_id
  where r.family_id=p_family and r.child_id=p_child and public.ghaf_growth_eligible(t,r.seeds);
 select d.id into v_learning from public.app_family_documents d where d.family_id=p_family and d.child_id=p_child and d.kind='learning'
  and d.payload->>'packageId'='learning.mangrove_roots.v1' and d.payload->>'completedAt' is not null
  and d.payload->>'completedRoute' in ('story','accessible') limit 1;
 for v_badge in select id from (values
  ('badge.journey.seed_start.v1',v_seeds>=12),('badge.journey.growing_branch.v1',v_seeds>=60),
  ('badge.journey.expanding_shade.v1',v_seeds>=120),('badge.journey.coastal_care.v1',v_seeds>=180),
  ('badge.skill.sorting.bud.v1',v_credits>=1),('badge.skill.sorting.branch.v1',v_credits>=3),('badge.skill.sorting.shade.v1',v_credits>=7),
  ('badge.habitat.mangrove_care.v1',v_seeds>=132 and v_credits>=3 and v_learning is not null))b(id,reached) where reached
 loop
  insert into public.app_badge_awards(family_id,child_id,badge_id,awarded_at,evidence)
  values(p_family,p_child,v_badge,p_time,jsonb_build_object('recognitionIds',v_recognitions,'lifetimeSeeds',v_seeds,'sortingCredits',v_credits,'coastCareCredits',v_credits,'learningDocumentId',v_learning))
  on conflict(child_id,badge_id) do nothing;
 end loop;
 for v_plan in select * from public.app_reward_versions where family_id=p_family and child_id=p_child and current and lifecycle='promised' for update loop
  v_totals:=public.ghaf_growth_landscapes(p_family,p_child,v_plan.promised_at,true);
  v_baseline:=public.ghaf_growth_reward_baseline(p_family,p_child,v_plan.promised_at);
  if public.ghaf_growth_reward_crossed(v_plan.milestone,v_totals,v_baseline) then
   update public.app_reward_versions set lifecycle='unlocked',unlocked_at=p_time where id=v_plan.id and version=v_plan.version;
  end if;
 end loop;
end; $$;

create or replace function public.ghaf_family_growth(p_family_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_actor record; v_children jsonb; v_rewards jsonb; v_league jsonb:=null; v_week public.app_league_weeks;
 v_rows jsonb; v_nominations jsonb:='[]'; v_encouragements jsonb:='[]'; v_own uuid; v_count integer; v_goal integer; v_revision bigint;
begin
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 select revision into v_revision from public.app_families where id=p_family_id;
 select coalesce(jsonb_agg(jsonb_build_object('childId',c.id,
  'lifetimeSeeds',(select coalesce(sum(r.seeds),0) from public.app_recognitions r where r.family_id=p_family_id and r.child_id=c.id),
  'landscapeSeeds',public.ghaf_growth_landscapes(p_family_id,c.id),
  'sortingCredits',(select count(*) from public.app_recognitions r join public.app_tasks t on t.id=r.task_id where r.child_id=c.id and public.ghaf_growth_eligible(t,r.seeds)),
  'coastCareCredits',(select count(*) from public.app_recognitions r join public.app_tasks t on t.id=r.task_id where r.child_id=c.id and public.ghaf_growth_eligible(t,r.seeds)),
  'learningCompleted',(select coalesce(jsonb_agg(d.payload->>'packageId'),'[]') from public.app_family_documents d where d.family_id=p_family_id and d.child_id=c.id and d.kind='learning' and d.payload->>'completedAt' is not null),
  'badges',(select coalesce(jsonb_agg(jsonb_build_object('badgeId',a.badge_id,'awardedAt',a.awarded_at) order by a.awarded_at,a.badge_id),'[]') from public.app_badge_awards a where a.child_id=c.id)
 ) order by c.created_at,c.id),'[]') into v_children from public.app_children c
 where c.family_id=p_family_id and (v_actor.role='parent' or c.id=v_actor.child_id);
 select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'childId',p.child_id,'version',p.version,'lifecycle',p.lifecycle,
  'month',p.month,'promise',p.promise,'milestone',p.milestone,'promisedAt',p.promised_at,'unlockedAt',p.unlocked_at,'givenAt',p.given_at,
  'eligibleSeeds',(select sum(value::bigint) from jsonb_each_text(public.ghaf_growth_landscapes(p_family_id,p.child_id,p.promised_at,true))),
  'eligibleLandscapeSeeds',public.ghaf_growth_landscapes(p_family_id,p.child_id,p.promised_at,true),
  'eligibleLandscapeBaseline',public.ghaf_growth_reward_baseline(p_family_id,p.child_id,p.promised_at)) order by p.promised_at,p.id),'[]')
 into v_rewards from public.app_reward_versions p where p.family_id=p_family_id and p.current and (v_actor.role='parent' or p.child_id=v_actor.child_id);
 select * into v_week from public.app_league_weeks where family_id=p_family_id and week_key=public.ghaf_growth_week();
 if found then
  select p.id into v_own from public.app_league_participants p where p.week_id=v_week.id and p.child_id=v_actor.child_id and not p.rest;
  select coalesce(jsonb_agg(jsonb_build_object('participantId',q.id,'nickname',q.nickname,'treeAvatarToken',q.tree_avatar,
    'completedLeafCount',q.confirmed,'score',q.confirmed*20,'position',q.position) order by q.position,q.id),'[]'),coalesce(sum(q.confirmed),0),count(*)*5 into v_rows,v_count,v_goal
  from (select p.id,p.nickname,p.tree_avatar,count(l.recognition_id)::integer confirmed,rank() over(order by count(l.recognition_id) desc)::integer position
    from public.app_league_participants p join public.app_children c on c.id=p.child_id and c.active
    left join public.app_league_leaves l on l.participant_id=p.id where p.week_id=v_week.id and not p.rest group by p.id)q;
  if v_actor.role='parent' then
   select coalesce(jsonb_agg(jsonb_build_object('participantId',p.id,'childId',p.child_id,'nickname',p.nickname,'treeAvatarToken',p.tree_avatar,'rest',p.rest,
    'taskIds',(select jsonb_agg(l.task_id order by l.task_id) from public.app_league_leaves l where l.participant_id=p.id)) order by p.id),'[]') into v_nominations from public.app_league_participants p where p.week_id=v_week.id;
  elsif v_own is not null then
   select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'senderId',e.sender_id,'recipientId',e.recipient_id,'phraseId',e.phrase_id,'createdAt',e.created_at) order by e.created_at,e.id),'[]') into v_encouragements
   from public.app_league_encouragements e where e.week_id=v_week.id and (e.sender_id=v_own or e.recipient_id=v_own);
  end if;
  v_league:=jsonb_build_object('weekKey',v_week.week_key,'revision',v_week.revision,'rows',v_rows,'cooperativeConfirmedCount',v_count,'cooperativeGoal',v_goal,
   'nominations',v_nominations,'ownParticipantId',v_own,'encouragements',v_encouragements);
 end if;
 return jsonb_build_object('schemaVersion',1,'actor',jsonb_build_object('userId',auth.uid(),'role',v_actor.role,'familyId',p_family_id,'childId',v_actor.child_id),
 'familyId',p_family_id,'revision',v_revision,'currentWeekKey',public.ghaf_growth_week(),'children',v_children,'rewards',v_rewards,'league',v_league);
end; $$;
revoke all on function public.ghaf_growth_reward_baseline(uuid,uuid,timestamptz),public.ghaf_growth_reward_crossed(jsonb,jsonb,jsonb) from public,anon,authenticated;
commit;
