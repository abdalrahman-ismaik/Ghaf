begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();

insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous)
 values('020e0000-0000-4000-8000-000000000001','authenticated','authenticated','document-hardening@example.invalid',now(),false);
insert into public.app_families(id,owner_id,name) values
 ('020e2000-0000-4000-8000-000000000001','020e0000-0000-4000-8000-000000000001','First document family'),
 ('020e2000-0000-4000-8000-000000000002','020e0000-0000-4000-8000-000000000001','Second document family');
insert into public.app_children(id,family_id,display_name,age_band)
 values('020e3000-0000-4000-8000-000000000001','020e2000-0000-4000-8000-000000000002','Child in second family','9_11');
select ok((select convalidated from pg_constraint where conname='app_family_documents_child_family_fk'),'Composite child/family ownership is validated for existing rows');
select throws_ok($$insert into public.app_family_documents(family_id,child_id,kind,payload)
 values('020e2000-0000-4000-8000-000000000001','020e3000-0000-4000-8000-000000000001','profile_preferences','{}')$$,
 '23503','insert or update on table "app_family_documents" violates foreign key constraint "app_family_documents_child_family_fk"','Even privileged inserts cannot misbind a Child to another family');
select ok(public.ghaf_doc_text('"A valid title"',1,180),'Normalized new text remains accepted');
select ok(not public.ghaf_doc_text('" A valid title "',1,180),'New text cannot evade canonical matching through spaces');
select ok(public.ghaf_doc_text(to_jsonb(E'Line one\nLine two'::text),1,180),'Internal intentional line breaks are preserved');

insert into public.app_family_documents(id,family_id,kind,payload) values
 ('020e5000-0000-4000-8000-000000000001','020e2000-0000-4000-8000-000000000001','saved_template',
  '{"categoryId":"home_responsibility","title":{"ar":" ترتيب الكتب ","en":" Arrange Books "},"positiveAction":{"ar":" ضع الكتب في مكانها ","en":" Put agreed books away "},"recurrence":"once"}');
select is((select payload->'title'->>'en' from public.app_family_documents where id='020e5000-0000-4000-8000-000000000001'),' Arrange Books ','Existing spaced wording remains unchanged and readable');
select throws_ok($$insert into public.app_family_documents(family_id,kind,payload) values
 ('020e2000-0000-4000-8000-000000000001','saved_template',
  '{"categoryId":"home_responsibility","title":{"ar":"ترتيب الكتب","en":"arrange books"},"positiveAction":{"ar":"ضع الكتب في مكانها","en":"put agreed books away"},"recurrence":"recurrent"}')$$,
 'PT409','request_conflict','Existing and incoming wording are both normalized for duplicate detection');
select lives_ok($$update public.app_family_documents set updated_at=now() where id='020e5000-0000-4000-8000-000000000001'$$,'Unchanged existing row is not mistaken for its own duplicate');
select lives_ok($$insert into public.app_family_documents(family_id,kind,payload) values
 ('020e2000-0000-4000-8000-000000000002','saved_template',
  '{"categoryId":"home_responsibility","title":{"ar":"ترتيب الكتب","en":"arrange books"},"positiveAction":{"ar":"ضع الكتب في مكانها","en":"put agreed books away"},"recurrence":"once"}')$$,'Independent families may save the same ordinary wording');
select ok(not has_function_privilege('authenticated','public.ghaf_template_canonical_fingerprint(jsonb)','EXECUTE'),'Internal canonical matching is not exposed as an application capability');
select * from finish();
rollback;
