begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous,raw_user_meta_data)
values('02070000-0000-4000-8000-000000000001','authenticated','authenticated','capacity@example.invalid',now(),false,'{"plan":"plus","childLimit":99}');
insert into auth.sessions(id,user_id,created_at,updated_at)
values('02070000-0000-4000-8000-000000000002','02070000-0000-4000-8000-000000000001',now(),now());
update public.pilot_access set status='approved' where user_id='02070000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','02070000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"02070000-0000-4000-8000-000000000001","session_id":"02070000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select public.ghaf_family_command(null,gen_random_uuid(),'{"type":"create_family","name":"Capacity test","displayName":"Test Parent"}');
select lives_ok($$select public.ghaf_family_command((public.ghaf_family_identity()->>'familyId')::uuid,gen_random_uuid(),'{"type":"add_child","displayName":"First","ageBand":"6_8"}')$$,'First actual Child may be added');
select lives_ok($$select public.ghaf_family_command((public.ghaf_family_identity()->>'familyId')::uuid,gen_random_uuid(),'{"type":"add_child","displayName":"Second","ageBand":"9_11"}')$$,'Second actual Child may be added');
select throws_ok($$select public.ghaf_family_command((public.ghaf_family_identity()->>'familyId')::uuid,gen_random_uuid(),'{"type":"add_child","displayName":"Denied third","ageBand":"12_14"}')$$,'PT400','capacity_reached','Forged Plus metadata cannot exceed actual free capacity');
select is(jsonb_array_length(public.ghaf_family_snapshot()->'children'),2,'Denied extra profile leaves existing children intact');
select is(jsonb_array_length(public.ghaf_family_snapshot()->'recognitions'),0,'Capacity creates no entitlement grant or fabricated progress');
reset role;
select * from finish();
rollback;
