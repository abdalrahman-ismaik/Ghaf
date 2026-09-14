begin;

-- One scalar JSON result preserves the complete bounded document collection across REST row caps.
create function public.ghaf_family_document_snapshot(p_family_id uuid) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare v_actor record; v_revision bigint; v_documents jsonb;
begin
 select * into strict v_actor from public.ghaf_family_actor(p_family_id);
 select f.revision into strict v_revision from public.app_families f where f.id=p_family_id for share;
 select * into strict v_actor from public.ghaf_family_actor(p_family_id);
 select coalesce(jsonb_agg(to_jsonb(d) order by d.created_at,d.id),'[]'::jsonb)
  into v_documents from public.ghaf_family_documents(p_family_id) d;
 return jsonb_build_object('schemaVersion',1,'familyId',p_family_id,'revision',v_revision,
  'actor',jsonb_build_object('userId',auth.uid(),'role',v_actor.role,'familyId',p_family_id,'childId',v_actor.child_id),
  'documentCount',jsonb_array_length(v_documents),'documents',v_documents);
end; $$;
revoke all on function public.ghaf_family_document_snapshot(uuid) from public,anon,authenticated;
grant execute on function public.ghaf_family_document_snapshot(uuid) to authenticated;
commit;
