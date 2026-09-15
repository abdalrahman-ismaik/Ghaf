begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();

insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous,raw_user_meta_data) values
 ('02510000-0000-4000-8000-000000000001','authenticated','authenticated','masroofi-parent@example.invalid',now(),false,'{}'),
 ('02510000-0000-4000-8000-000000000002','authenticated','authenticated','masroofi-other@example.invalid',now(),false,'{}'),
 ('02510000-0000-4000-8000-000000000003','authenticated','authenticated',null,null,true,'{}'),
 ('02510000-0000-4000-8000-000000000004','authenticated','authenticated',null,null,true,'{}');
insert into auth.sessions(id,user_id,created_at,updated_at) select
 ('02520000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
 ('02510000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,now(),now() from generate_series(1,4)n;
update public.pilot_access set status='approved' where user_id in
 ('02510000-0000-4000-8000-000000000001','02510000-0000-4000-8000-000000000002');
create temporary table masroofi_test_state(key text primary key,value jsonb);
grant all on masroofi_test_state to authenticated;
create function pg_temp.actor(n integer,p_amr jsonb default null) returns void language plpgsql as $$
begin
 perform set_config('request.jwt.claim.sub','02510000-0000-4000-8000-'||lpad(n::text,12,'0'),true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub','02510000-0000-4000-8000-'||lpad(n::text,12,'0'),
   'session_id','02520000-0000-4000-8000-'||lpad(n::text,12,'0'),'role','authenticated','amr',p_amr)::text,true);
end; $$;
create function pg_temp.parent() returns void language sql as $$
 select pg_temp.actor(1,jsonb_build_array(jsonb_build_object('method','password','timestamp',floor(extract(epoch from clock_timestamp()))))); $$;
create function pg_temp.family_id(p_key text default 'family') returns uuid language sql as $$
 select (value#>>'{snapshot,family,id}')::uuid from masroofi_test_state where key=p_key; $$;
create function pg_temp.child_id(p_key text default 'child') returns uuid language sql as $$
 select (value#>>'{result,childId}')::uuid from masroofi_test_state where key=p_key; $$;
create function pg_temp.task_id(p_key text default 'task') returns uuid language sql as $$
 select (value#>>'{result,taskId}')::uuid from masroofi_test_state where key=p_key; $$;
create function pg_temp.snapshot() returns jsonb language sql as $$ select public.ghaf_family_masroofi(pg_temp.family_id()); $$;
create function pg_temp.card(p_child uuid default pg_temp.child_id()) returns jsonb language sql as $$
 select c from jsonb_array_elements(pg_temp.snapshot()->'cards')c where c->>'childId'=p_child::text; $$;
create function pg_temp.command(p_command jsonb,p_request uuid default gen_random_uuid()) returns jsonb language sql as $$
 select public.ghaf_family_masroofi_command(pg_temp.family_id(),p_request,p_command); $$;
create function pg_temp.enable(p_child uuid default pg_temp.child_id()) returns jsonb language sql as $$
 select jsonb_build_object('type','card.enable','childId',p_child,'age10PlusConfirmed',true); $$;
create function pg_temp.top_up(p_amount integer default 2000,p_child uuid default pg_temp.child_id()) returns jsonb language sql as $$
 select jsonb_build_object('type','card.top_up','childId',p_child,'amountFils',p_amount); $$;
create function pg_temp.promise(p_key text default 'task',p_amount integer default 1000) returns jsonb language sql as $$
 select jsonb_build_object('type','reward.promise','taskId',pg_temp.task_id(p_key),'expectedTaskRevision',0,'amountFils',p_amount); $$;
create function pg_temp.purchase(p_fixture text default 'stationery',p_child uuid default pg_temp.child_id()) returns jsonb language sql as $$
 select jsonb_build_object('type','purchase','childId',p_child,'fixtureId',p_fixture); $$;
create function pg_temp.controls(p_patch jsonb default '{}',p_child uuid default pg_temp.child_id()) returns jsonb language sql as $$
 select jsonb_build_object('type','card.controls','childId',p_child,'expectedVersion',(pg_temp.card(p_child)->>'controlsVersion')::bigint,
   'controls',(pg_temp.card(p_child)->'controls')||p_patch); $$;
create function pg_temp.last_decline() returns text language sql as $$
 select pg_temp.snapshot()#>>'{transactions,-1,declineReason}'; $$;
create function pg_temp.task_action(p_type text,p_key text default 'task',p_extra jsonb default '{}') returns jsonb language plpgsql as $$
declare v_task jsonb;
begin
 select t into v_task from jsonb_array_elements(public.ghaf_family_snapshot(pg_temp.family_id())->'tasks')t where t->>'id'=pg_temp.task_id(p_key)::text;
 return public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type',p_type,
   'taskId',pg_temp.task_id(p_key),'expectedRevision',(v_task->>'revision')::bigint)||p_extra);
end; $$;
create function pg_temp.submit(p_key text default 'task') returns void language plpgsql as $$
declare v_step jsonb;
begin
 perform pg_temp.actor(3); perform pg_temp.task_action('accept_task',p_key); perform pg_temp.task_action('start_task',p_key);
 perform pg_temp.task_action('request_help',p_key);
 for v_step in select s from jsonb_array_elements(public.ghaf_family_snapshot(pg_temp.family_id())->'tasks')t,
   jsonb_array_elements(t#>'{template,catalogExecution,steps}')s where t->>'id'=pg_temp.task_id(p_key)::text loop
   perform pg_temp.task_action('set_step',p_key,jsonb_build_object('stepId',v_step->>'id','state','done'));
 end loop;
 perform pg_temp.task_action('submit_task',p_key);
 perform pg_temp.parent(); perform pg_temp.task_action('praise_task',p_key,'{"praise":"You completed the safe steps and asked for help."}');
end; $$;

select ok((select bool_and(relrowsecurity) from pg_class where relnamespace='public'::regnamespace and relkind='r' and relname like 'app_masroofi_%'),'Every Masroofi table has RLS');
select ok((select bool_and(not has_table_privilege('authenticated',oid,'SELECT,INSERT,UPDATE,DELETE')) from pg_class
 where relnamespace='public'::regnamespace and relkind='r' and relname like 'app_masroofi_%'),'No raw client read/write grants expose money or pending amounts');
select ok(not has_function_privilege('anon','public.ghaf_family_masroofi(uuid)','EXECUTE'),'Anonymous unauthenticated role cannot read cards');
select ok(not has_function_privilege('authenticated','public.ghaf_masroofi_credit_recognition()','EXECUTE'),'Client cannot call internal credit trigger');
select ok(not has_function_privilege('authenticated','public.ghaf_masroofi_eligible(public.app_tasks)','EXECUTE'),'Eligibility helper is not a client data oracle');
set local role authenticated;
select pg_temp.parent();
insert into masroofi_test_state values('family',public.ghaf_family_command(null,gen_random_uuid(),'{"type":"create_family","name":"Masroofi Test Family","displayName":"Test Parent"}'));
insert into masroofi_test_state values('child',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),'{"type":"add_child","displayName":"Test Child","ageBand":"9_11"}'));
insert into masroofi_test_state values('sibling',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),'{"type":"add_child","displayName":"Test Sibling","ageBand":"12_14"}'));
insert into masroofi_test_state values('young_family',public.ghaf_family_command(null,gen_random_uuid(),'{"type":"create_family","name":"Underage Test Family","displayName":"Test Parent"}'));
insert into masroofi_test_state values('young',public.ghaf_family_command(pg_temp.family_id('young_family'),gen_random_uuid(),'{"type":"add_child","displayName":"Young Test Child","ageBand":"6_8"}'));
select is(pg_temp.snapshot()->'cards','[]'::jsonb,'Real family starts without sample cards');
select is(pg_temp.snapshot()->'transactions','[]'::jsonb,'Real family starts without sample balance history');
select 'parent_empty' as contract_label,pg_temp.snapshot() as contract_snapshot,public.ghaf_family_snapshot(pg_temp.family_id()) as contract_family_snapshot;
select pg_temp.actor(1);
select throws_ok($$select pg_temp.command(pg_temp.enable())$$,'PT428','reauth_required','Enrollment requires recent password');
select pg_temp.actor(1,jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from clock_timestamp())-121)));
select throws_ok($$select pg_temp.command(pg_temp.enable())$$,'PT428','reauth_required','Stale password fails');
select pg_temp.actor(1,jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from clock_timestamp())+60)));
select throws_ok($$select pg_temp.command(pg_temp.enable())$$,'PT428','reauth_required','Future password fails');
select pg_temp.parent();
select throws_ok($$select public.ghaf_family_masroofi_command(pg_temp.family_id('young_family'),gen_random_uuid(),pg_temp.enable(pg_temp.child_id('young')))$$,'PT400','age_ineligible','6-8 band cannot enroll even with checkbox');
select throws_ok($$select pg_temp.command(pg_temp.enable()||'{"age10PlusConfirmed":false}')$$,'PT400','age_ineligible','9-11 band does not establish age 10 without confirmation');
select throws_ok($$select pg_temp.command(pg_temp.enable()||'{"age10PlusConfirmed":"true"}')$$,'PT400','age_ineligible','String age confirmation is denied');
select throws_ok($$select pg_temp.command(pg_temp.enable()-'age10PlusConfirmed')$$,'PT400','invalid_command','Missing enrollment confirmation fails closed');
select throws_ok($$select pg_temp.command(pg_temp.enable()||'{"balanceFils":90000}')$$,'PT400','invalid_command','Client cannot choose initial balance');
select lives_ok($$select pg_temp.command(pg_temp.enable(),'02530000-0000-4000-8000-000000000001')$$,'Fresh Parent enrolls confirmed eligible Child');
select lives_ok($$select pg_temp.command(pg_temp.enable(),'02530000-0000-4000-8000-000000000001')$$,'Exact enrollment retry is idempotent');
select is(pg_temp.card()->>'balanceFils','0','Enabled card starts at zero');
select is(pg_temp.card()#>'{controls,allowedCategories}','["stationery"]'::jsonb,'Initial allowed spending is restrictive');
select is(pg_temp.card()#>>'{controls,onlineAllowed}','false','Online purchases default blocked');
select throws_ok($$select pg_temp.command(pg_temp.enable())$$,'PT400','invalid_transition','Different request cannot re-enroll/reset a card');
select throws_ok($$select pg_temp.command(pg_temp.enable(pg_temp.child_id('sibling')),'02530000-0000-4000-8000-000000000001')$$,'PT409','request_conflict','Changed enrollment cannot reuse receipt');
select lives_ok($$select pg_temp.command(pg_temp.enable(pg_temp.child_id('sibling')))$$,'Parent may enable second actual Child');
select throws_ok($$select pg_temp.command(pg_temp.purchase())$$,'42501','access_unavailable','Parent cannot impersonate a Child purchase');
select throws_ok($$select pg_temp.command(pg_temp.top_up()||'{"amountFils":0}')$$,'PT400','invalid_command','Zero top-up rejected');
select throws_ok($$select pg_temp.command(pg_temp.top_up()||'{"amountFils":50001}')$$,'PT400','invalid_command','Top-up maximum enforced');
select throws_ok($$select pg_temp.command(pg_temp.top_up()||'{"amountFils":1.5}')$$,'PT400','invalid_command','Fractional fils rejected');
select throws_ok($$select pg_temp.command(pg_temp.top_up()||'{"amountFils":"2000"}')$$,'PT400','invalid_command','String fils rejected');
select lives_ok($$select pg_temp.command(pg_temp.top_up(),'02530000-0000-4000-8000-000000000002')$$,'Parent can add simulated funds');
select lives_ok($$select pg_temp.command(pg_temp.top_up(),'02530000-0000-4000-8000-000000000002')$$,'Top-up replay cannot double balance');
select is(pg_temp.card()->>'balanceFils','2000','Exactly one top-up is applied');
select throws_ok($$select pg_temp.command(pg_temp.top_up(3000),'02530000-0000-4000-8000-000000000002')$$,'PT409','request_conflict','Changed amount cannot reuse receipt');
select throws_ok($$select pg_temp.command(pg_temp.controls('{"allowedCategories":["stationery","stationery"]}'))$$,'PT400','invalid_command','Duplicate categories rejected');
select throws_ok($$select pg_temp.command(pg_temp.controls('{"allowedCategories":["unknown"]}'))$$,'PT400','invalid_command','Unknown categories rejected');
select throws_ok($$select pg_temp.command(pg_temp.controls('{"frozen":null}'))$$,'PT400','invalid_command','Null freeze cannot bypass boolean validation');
select throws_ok($$select pg_temp.command(pg_temp.controls('{"dailyLimitFils":0}'))$$,'PT400','invalid_command','Zero daily limit rejected');
select throws_ok($$select pg_temp.command(pg_temp.controls()||'{"expectedVersion":null}')$$,'PT400','invalid_command','Null version cannot bypass control concurrency');
select throws_ok($$select pg_temp.command(pg_temp.controls()||'{"expectedVersion":0}')$$,'PT409','request_conflict','Stale controls rejected');
insert into masroofi_test_state values('task',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_id(),'catalogId','task_recycling_p0_v1')));
insert into masroofi_test_state values('altered',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_id(),'catalogId','GI01','content','{"title":{"ar":"عنوان خاص","en":"Custom private title"}}'::jsonb)));
insert into masroofi_test_state values('education',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_id(),'catalogId','HR02')));
select throws_ok($$select pg_temp.command(pg_temp.promise('altered'))$$,'PT400','task_ineligible','Edited canonical title cannot become paid content');
select throws_ok($$select pg_temp.command(pg_temp.promise('education'))$$,'PT400','task_ineligible','School preparation stays outside paid tasks');
select throws_ok($$select pg_temp.command(pg_temp.promise()||'{"expectedTaskRevision":1}')$$,'PT409','request_conflict','Stale task revision rejected');
select throws_ok($$select pg_temp.command(pg_temp.promise()||'{"expectedTaskRevision":null}')$$,'PT400','invalid_command','Missing numeric revision fails closed');
select throws_ok($$select pg_temp.command(pg_temp.promise('task',10001))$$,'PT400','invalid_command','Reward maximum is 10000 fils');
select lives_ok($$select pg_temp.command(pg_temp.promise(),'02530000-0000-4000-8000-000000000003')$$,'Localized P0 canonical task accepts a fixed promise');
select lives_ok($$select pg_temp.command(pg_temp.promise(),'02530000-0000-4000-8000-000000000003')$$,'Exact promise retry is idempotent');
select is(jsonb_array_length(pg_temp.snapshot()->'promises'),1,'One promise per task');
select is(pg_temp.snapshot()#>>'{promises,0,amountFils}','1000','Parent sees fixed private promised amount');
select 'parent_promised' as contract_label,pg_temp.snapshot() as contract_snapshot,public.ghaf_family_snapshot(pg_temp.family_id()) as contract_family_snapshot;
select throws_ok($$select pg_temp.command(pg_temp.promise('task',500))$$,'PT400','promise_locked','Promise cannot be weakened before acceptance');
select throws_ok($$select pg_temp.task_action('edit_task','task','{"content":{"title":{"ar":"عنوان آخر","en":"Changed title"}}}')$$,'PT400','promise_locked','Parent task editor cannot change promised content');
select throws_ok($$select pg_temp.command(pg_temp.top_up(),(pg_temp.snapshot()#>>'{promises,0,id}')::uuid)$$,'PT409','request_conflict','Client cannot consume reserved reward transaction id');
insert into masroofi_test_state values('invite',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','invite_child','childId',pg_temp.child_id())));
insert into masroofi_test_state values('sibling_invite',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','invite_child','childId',pg_temp.child_id('sibling'))));
select pg_temp.actor(3);
select lives_ok($$select public.ghaf_redeem_family_invite((select value#>>'{result,token}' from masroofi_test_state where key='invite'),gen_random_uuid())$$,'Separate Child provider session pairs');
select is(jsonb_array_length(pg_temp.snapshot()->'cards'),1,'Child sees only own card');
select ok(not(pg_temp.snapshot()#>'{promises,0}' ? 'amountFils'),'Pending amount key is absent in Child response');
select 'child_promised' as contract_label,pg_temp.snapshot() as contract_snapshot,public.ghaf_family_snapshot(pg_temp.family_id()) as contract_family_snapshot;
select throws_ok($$select * from public.app_masroofi_promises$$,'42501',null,'Child cannot query hidden raw promise table');
select throws_ok($$select pg_temp.command(pg_temp.top_up())$$,'42501','access_unavailable','Child cannot top up');
select throws_ok($$select pg_temp.command(pg_temp.controls())$$,'42501','access_unavailable','Child cannot alter controls');
select throws_ok($$select pg_temp.command(pg_temp.promise())$$,'42501','access_unavailable','Child cannot set rewards');
select throws_ok($$select pg_temp.command(pg_temp.purchase('stationery',pg_temp.child_id('sibling')))$$,'42501','family_unavailable','Supplied childId cannot spend sibling funds');
select throws_ok($$select pg_temp.command(pg_temp.purchase()||'{"amountFils":1}')$$,'PT400','invalid_command','Child cannot override reference price');
select throws_ok($$select pg_temp.command(pg_temp.purchase()||'{"day":"2000-01-01"}')$$,'PT400','invalid_command','Client day cannot bypass server daily limit');
select throws_ok($$select pg_temp.command(pg_temp.purchase('unknown'))$$,'PT400','invalid_command','Unknown reference item denied');
select lives_ok($$select pg_temp.command(pg_temp.purchase(),'02530000-0000-4000-8000-000000000004')$$,'Allowed purchase debits authoritative price');
select is(pg_temp.card()->>'balanceFils','1700','Stationery price is exactly 300 fils');
select lives_ok($$select pg_temp.command(pg_temp.purchase(),'02530000-0000-4000-8000-000000000004')$$,'Purchase retry cannot debit twice');
select is(pg_temp.card()->>'balanceFils','1700','Purchase retry keeps balance');
select lives_ok($$select pg_temp.command(pg_temp.purchase('storybook'),'02530000-0000-4000-8000-000000000005')$$,'Blocked category creates a decline receipt');
select is(pg_temp.last_decline(),'category_blocked','Category restriction has precise reason');
select pg_temp.parent();
select lives_ok($$select pg_temp.command(pg_temp.controls('{"allowedCategories":["stationery","books","sports","arts","outings","snacks","gifts","games"]}'))$$,'All eight reviewed spending categories can be configured');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.command(pg_temp.purchase('storybook'),'02530000-0000-4000-8000-000000000005')$$,'Old declined request stays declined after controls change');
select is(pg_temp.card()->>'balanceFils','1700','A declined retry never turns into a new debit');
select lives_ok($$select pg_temp.command(pg_temp.purchase('museum_ticket'))$$,'Online item records a decline');
select is(pg_temp.last_decline(),'online_blocked','Online control enforced');
select pg_temp.parent();
select lives_ok($$select pg_temp.command(pg_temp.controls('{"frozen":true}'))$$,'Parent freezes card');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.command(pg_temp.purchase())$$,'Frozen card records a decline');
select is(pg_temp.last_decline(),'card_frozen','Freeze enforced before other spend limits');
select lives_ok($$select pg_temp.submit()$$,'Help-supported Child completion and Parent praise follow original task flow');
select is(pg_temp.card()->>'balanceFils','1700','Submission and praise do not prematurely credit promise');
select lives_ok($$select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','rename_child','childId',pg_temp.child_id(),'displayName','Renamed Test Child'))$$,'Child rename preserves original promised content');
select lives_ok($$select pg_temp.task_action('recognize_task')$$,'Existing Parent recognition atomically credits frozen card');
select is(pg_temp.card()->>'balanceFils','2700','Frozen card still receives full fixed reward');
select is(pg_temp.snapshot()#>>'{promises,0,status}','credited','Promise advances once to credited');
select is((select count(*) from jsonb_array_elements(pg_temp.snapshot()->'transactions')t where t->>'kind'='reward'),1::bigint,'Exactly one reward ledger entry');
select is((select t->>'seeds' from jsonb_array_elements(public.ghaf_family_snapshot(pg_temp.family_id())->'recognitions')t where t->>'taskId'=pg_temp.task_id()::text),'12','Masroofi credit does not alter canonical Seeds');
select throws_ok($$select pg_temp.task_action('recognize_task')$$,'PT409','invalid_transition','Different recognition request cannot credit twice');
select pg_temp.actor(3);
select is(pg_temp.snapshot()#>>'{promises,0,amountFils}','1000','Recognized amount is revealed only after credit');
select 'child_credited' as contract_label,pg_temp.snapshot() as contract_snapshot,public.ghaf_family_snapshot(pg_temp.family_id()) as contract_family_snapshot;
select pg_temp.parent();
select lives_ok($$select pg_temp.command(pg_temp.controls('{"frozen":false,"onlineAllowed":true,"perPurchaseLimitFils":500,"dailyLimitFils":600}'))$$,'Parent can revise prospective spend controls');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.command(pg_temp.purchase('storybook'))$$,'Over-limit item records a decline');
select is(pg_temp.last_decline(),'per_purchase_limit','Per-purchase maximum enforced');
select lives_ok($$select pg_temp.command(pg_temp.purchase())$$,'Second 300 fils purchase reaches exact daily limit');
select lives_ok($$select pg_temp.command(pg_temp.purchase())$$,'Next purchase records a daily decline');
select is(pg_temp.last_decline(),'daily_limit','Daily spend totals include approved purchases only');
select is(pg_temp.card()->>'balanceFils','2400','Declines never change balance');
select pg_temp.parent();
select lives_ok($$select pg_temp.command(pg_temp.controls('{"dailyLimitFils":50000,"perPurchaseLimitFils":50000}'))$$,'Limits may increase prospectively');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.command(pg_temp.purchase('gift'))$$,'Approved gift debits 2000 fils');
select lives_ok($$select pg_temp.command(pg_temp.purchase('storybook'))$$,'Insufficient balance records decline');
select is(pg_temp.last_decline(),'insufficient_balance','Insufficient balance never creates debt');
select is(pg_temp.card()->>'balanceFils','400','Balance stays nonnegative');
select pg_temp.actor(4);
select lives_ok($$select public.ghaf_redeem_family_invite((select value#>>'{result,token}' from masroofi_test_state where key='sibling_invite'),gen_random_uuid())$$,'Sibling receives separate paired identity');
select is(jsonb_array_length(pg_temp.snapshot()->'promises'),0,'Sibling sees no private reward promise');
select is(jsonb_array_length(pg_temp.snapshot()->'transactions'),0,'Sibling sees no other Child transactions');
select is(pg_temp.card(pg_temp.child_id('sibling'))->>'balanceFils','0','Sibling balance is independent');
select pg_temp.actor(2);
select throws_ok($$select pg_temp.snapshot()$$,'42501','family_unavailable','Other Parent cannot read family cards');
select throws_ok($$select pg_temp.command(pg_temp.top_up())$$,'42501','family_unavailable','Other Parent cannot mutate cards');
select pg_temp.parent();
insert into masroofi_test_state values('reserve_task',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_id('sibling'),'catalogId','GI01')));
select lives_ok($$select pg_temp.command(pg_temp.promise('reserve_task',10000))$$,'Sibling pending reward reserves maximum amount');
select lives_ok($$select pg_temp.command(pg_temp.top_up(50000,pg_temp.child_id('sibling'))) from generate_series(1,19)$$,'Balance can approach maximum through bounded top-ups');
select lives_ok($$select pg_temp.command(pg_temp.top_up(40000,pg_temp.child_id('sibling')))$$,'Balance plus promised reserves may equal 1000000 fils');
select is(pg_temp.card(pg_temp.child_id('sibling'))->>'balanceFils','990000','Pending promise does not appear as spendable balance');
select throws_ok($$select pg_temp.command(pg_temp.top_up(1,pg_temp.child_id('sibling')))$$,'PT400','balance_limit','Outstanding promised amounts reserve future credit capacity');
insert into masroofi_test_state values('reserve_task2',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','assign_task','childId',pg_temp.child_id('sibling'),'catalogId','GI01')));
select throws_ok($$select pg_temp.command(pg_temp.promise('reserve_task2',1))$$,'PT400','balance_limit','Second promise cannot overbook maximum balance');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.command(pg_temp.top_up())$$,'PT428','reauth_required','Top-up still requires fresh password');
select throws_ok($$select pg_temp.command(pg_temp.controls())$$,'PT428','reauth_required','Control change still requires fresh password');
select throws_ok($$select pg_temp.command(pg_temp.promise('reserve_task2'))$$,'PT428','reauth_required','Reward promise still requires fresh password');
select pg_temp.parent();
select 'parent_final' as contract_label,pg_temp.snapshot() as contract_snapshot,public.ghaf_family_snapshot(pg_temp.family_id()) as contract_family_snapshot;
reset role;
select throws_ok($$update public.app_masroofi_promises set amount_fils=1 where task_id=pg_temp.task_id()$$,'PT400','promise_locked','Even direct promise rewrites hit immutability guard');
select throws_ok($$delete from public.app_masroofi_promises where task_id=pg_temp.task_id()$$,'PT400','promise_locked','Promise evidence cannot be removed');
select throws_ok($$update public.app_tasks set template=template||'{"routinePhase":"maintenance"}'::jsonb where id=pg_temp.task_id()$$,'PT400','promise_locked','Task phase cannot weaken existing promised content');
select throws_ok($$delete from public.app_tasks where id=pg_temp.task_id()$$,'PT400','promise_locked','Promised task cannot be removed');
select throws_ok($$update public.app_masroofi_transactions set amount_fils=1 where task_id=pg_temp.task_id()$$,'PT400','promise_locked','Reward ledger is immutable');
select throws_ok($$delete from public.app_masroofi_command_receipts where request_id='02530000-0000-4000-8000-000000000002'$$,'PT400','promise_locked','Idempotency receipts cannot be removed');
select throws_ok($$update public.app_masroofi_control_versions set daily_limit_fils=1 where child_id=pg_temp.child_id() and version=1$$,'PT400','promise_locked','Control history cannot be rewritten');
select throws_ok($$delete from public.app_masroofi_allowed_categories where child_id=pg_temp.child_id() and controls_version=1$$,'PT400','promise_locked','Prior category decisions remain immutable');
select is((select count(*) from public.app_recognitions where family_id=pg_temp.family_id()),1::bigint,'Only actual task recognition creates source evidence');
select is((select count(*) from public.app_masroofi_transactions where task_id=pg_temp.task_id()),1::bigint,'Reward transaction stays unique');
select is((select sum(case when kind='purchase' and status='approved' then -amount_fils when status='credited' then amount_fils else 0 end)
  from public.app_masroofi_transactions where child_id=pg_temp.child_id()),400::bigint,'Ledger sum exactly matches Child balance');
select is((select count(*) from public.app_masroofi_control_versions where child_id=pg_temp.child_id()),5::bigint,'Every control update adds a new version');
update public.app_family_members set active=false where child_id=pg_temp.child_id() and role='child';
set local role authenticated;
select pg_temp.actor(3);
select throws_ok($$select pg_temp.snapshot()$$,'42501','family_unavailable','Revoked Child cannot reload money');
select throws_ok($$select pg_temp.command(pg_temp.purchase(),'02530000-0000-4000-8000-000000000004')$$,'42501','family_unavailable','Revoked Child cannot replay an old successful receipt');
reset role;
delete from auth.sessions where id='02520000-0000-4000-8000-000000000004';
set local role authenticated;
select pg_temp.actor(4);
select throws_ok($$select pg_temp.snapshot()$$,'42501','access_unavailable','Ended provider session cannot load card');
select pg_temp.parent();
set local transaction_read_only=on;
select is(current_setting('transaction_read_only'),'on','Exercise actual read-only transaction mode');
select lives_ok($$select pg_temp.snapshot()$$,'Read-only transaction can load complete Parent money snapshot');
select pg_temp.actor(3);
select throws_ok($$select pg_temp.snapshot()$$,'42501','family_unavailable','Read-only snapshot still rejects revoked Child');
reset role;
select * from finish();
rollback;
