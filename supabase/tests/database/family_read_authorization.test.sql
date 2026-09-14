begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous)
values('02100000-0000-4000-8000-000000000001','authenticated','authenticated','read-only-test@example.invalid',now(),false),
('02100000-0000-4000-8000-000000000003','authenticated','authenticated','read-outsider@example.invalid',now(),false);
insert into auth.sessions(id,user_id,created_at,updated_at)
values('02100000-0000-4000-8000-000000000002','02100000-0000-4000-8000-000000000001',now(),now()),
('02100000-0000-4000-8000-000000000004','02100000-0000-4000-8000-000000000003',now(),now());
update public.pilot_access set status='approved' where user_id in ('02100000-0000-4000-8000-000000000001','02100000-0000-4000-8000-000000000003');
insert into public.app_families(id,owner_id,name) values('02100000-0000-4000-8000-000000000005','02100000-0000-4000-8000-000000000001','Read-only family');
insert into public.app_family_members(family_id,auth_user_id,role,display_name) values('02100000-0000-4000-8000-000000000005','02100000-0000-4000-8000-000000000001','parent','Test Parent');
insert into public.app_family_documents(family_id,kind,payload)
values('02100000-0000-4000-8000-000000000005','connections','{"parentNames":["Test Parent"],"connections":[]}');
set local role authenticated;
select set_config('request.jwt.claim.sub','02100000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"02100000-0000-4000-8000-000000000001","session_id":"02100000-0000-4000-8000-000000000002","role":"authenticated"}',true);
set local transaction_read_only=on;
select is(current_setting('transaction_read_only'),'on','Exercise the actual PostgREST read-only transaction mode');
select is((select count(*) from public.ghaf_family_documents('02100000-0000-4000-8000-000000000005')),1::bigint,'Stable RPC returns authorized documents without a row lock');
select is((select count(*) from public.app_family_documents where family_id='02100000-0000-4000-8000-000000000005'),1::bigint,'Direct GET RLS returns legitimate documents rather than masking an error as empty');
select is((select count(*) from public.app_families where id='02100000-0000-4000-8000-000000000005'),1::bigint,'Family GET and Realtime read authorization works read-only');
select set_config('request.jwt.claim.sub','02100000-0000-4000-8000-000000000003',true);
select set_config('request.jwt.claims','{"sub":"02100000-0000-4000-8000-000000000003","session_id":"02100000-0000-4000-8000-000000000004","role":"authenticated"}',true);
select is((select count(*) from public.app_family_documents where family_id='02100000-0000-4000-8000-000000000005'),0::bigint,'Another identity still sees no private document');
select is((select count(*) from public.app_families where id='02100000-0000-4000-8000-000000000005'),0::bigint,'Another identity still sees no family');
select throws_ok($$select public.ghaf_family_documents('02100000-0000-4000-8000-000000000005')$$,'42501','family_unavailable','Forged-family stable RPC remains denied');
select * from finish();
rollback;
