begin;

alter table public.app_family_documents
  add constraint app_family_documents_child_family_fk foreign key(child_id,family_id)
  references public.app_children(id,family_id) not valid;
alter table public.app_family_documents validate constraint app_family_documents_child_family_fk;

create or replace function public.ghaf_doc_text(v jsonb,minimum integer,maximum integer)
returns boolean language sql immutable set search_path='' as $$
  select coalesce(jsonb_typeof(v)='string'
    and (v#>>'{}')=btrim(v#>>'{}')
    and char_length(v#>>'{}') between minimum and maximum
    and translate(v#>>'{}',E'\n\r\t','') !~ '[[:cntrl:]]',false)
$$;

create function public.ghaf_template_canonical_fingerprint(v jsonb)
returns jsonb language sql immutable set search_path='' as $$
  select jsonb_build_array(lower(btrim(v->>'categoryId')),
    lower(btrim(v->'title'->>'ar')),lower(btrim(v->'title'->>'en')),
    lower(btrim(v->'positiveAction'->>'ar')),lower(btrim(v->'positiveAction'->>'en')))
$$;
create function public.ghaf_guard_template_duplicate()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.kind<>'saved_template' then return new; end if;
  perform 1 from public.app_families where id=new.family_id for update;
  if exists(select 1 from public.app_family_documents d
    where d.family_id=new.family_id and d.kind='saved_template' and d.id<>new.id
      and public.ghaf_template_canonical_fingerprint(d.payload)=public.ghaf_template_canonical_fingerprint(new.payload)) then
    raise exception using errcode='40001',message='request_conflict';
  end if;
  return new;
end $$;
create trigger app_family_templates_no_duplicates before insert or update on public.app_family_documents
  for each row execute function public.ghaf_guard_template_duplicate();
revoke all on function public.ghaf_template_canonical_fingerprint(jsonb),public.ghaf_guard_template_duplicate()
  from public,anon,authenticated,service_role;

commit;
