begin;

-- New promises must have a reachable target under the explicit P0-only eligibility map.
alter function public.ghaf_family_growth_command(uuid,uuid,jsonb) rename to ghaf_family_growth_command_before_targets;
revoke all on function public.ghaf_family_growth_command_before_targets(uuid,uuid,jsonb) from public,anon,authenticated;
create function public.ghaf_family_growth_command(p_family_id uuid,p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_actor record; v_type text:=p_command->>'type'; v_child uuid; v_plan public.app_reward_versions;
 v_milestone jsonb:=p_command->'milestone'; v_threshold integer; v_baseline jsonb;
begin
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 perform 1 from public.app_families where id=p_family_id for update;
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 if exists(select 1 from public.app_command_receipts where auth_user_id=auth.uid() and request_id=p_request_id) then
  return public.ghaf_family_growth_command_before_targets(p_family_id,p_request_id,p_command);
 end if;
 if v_type in ('reward.create','reward.revise') then
  if v_actor.role<>'parent' then raise exception using errcode='42501',message='access_unavailable'; end if;
  perform public.ghaf_growth_validate_reward(p_command->'promise',v_milestone,p_command->>'month');
  if v_milestone->>'kind'='landscape_stage' and v_milestone->>'landscapeId'<>'mangrove' then raise exception using errcode='PT400',message='invalid_command'; end if;
  if v_milestone->>'kind'='landscapes_at_stage' and (v_milestone->>'requiredCount')::integer<>1 then raise exception using errcode='PT400',message='invalid_command'; end if;
  if v_type='reward.create' then v_child:=(p_command->>'childId')::uuid;
  else
   select * into v_plan from public.app_reward_versions where id=(p_command->>'planId')::uuid and family_id=p_family_id and current;
   if not found then raise exception using errcode='PT400',message='invalid_command'; end if;
   if v_plan.lifecycle<>'promised' then raise exception using errcode='PT409',message='invalid_transition'; end if;
   v_child:=v_plan.child_id;
  end if;
  if v_milestone->>'kind'<>'eligible_seed_delta' then
   v_threshold:=case v_milestone->>'targetStage' when 'shoot' then 20 when 'sapling' then 60 when 'shade' then 120 when 'flourishing' then 200 end;
   v_baseline:=public.ghaf_growth_landscapes(p_family_id,v_child,null,true);
   if (v_baseline->>'mangrove')::bigint>=v_threshold then raise exception using errcode='PT400',message='invalid_command'; end if;
  end if;
 end if;
 return public.ghaf_family_growth_command_before_targets(p_family_id,p_request_id,p_command);
exception when invalid_text_representation or numeric_value_out_of_range then raise exception using errcode='PT400',message='invalid_command';
end; $$;
revoke all on function public.ghaf_family_growth_command(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.ghaf_family_growth_command(uuid,uuid,jsonb) to authenticated;
commit;
