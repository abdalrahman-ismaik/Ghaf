begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id,aud,role,email,email_confirmed_at,is_anonymous)
select ('02080000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'authenticated','authenticated',
 case when n in(1,4,5) then 'message-'||n||'@example.invalid' else null end,
 case when n in(1,4,5) then now() else null end,n not in(1,4,5) from generate_series(1,7)n;
insert into auth.sessions(id,user_id,created_at,updated_at) select
 ('02090000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
 ('02080000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,now(),now() from generate_series(1,7)n;
update public.pilot_access set status='approved' where user_id in
 ('02080000-0000-4000-8000-000000000001','02080000-0000-4000-8000-000000000004','02080000-0000-4000-8000-000000000005');
insert into public.account_profiles(user_id,display_name) values('02080000-0000-4000-8000-000000000005','Second actual Parent')
 on conflict(user_id) do update set display_name=excluded.display_name;
create temporary table message_test_state(key text primary key,value jsonb);
grant all on message_test_state to authenticated;
create function pg_temp.actor(n integer) returns void language plpgsql as $$ begin
 perform set_config('request.jwt.claim.sub','02080000-0000-4000-8000-'||lpad(n::text,12,'0'),true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub','02080000-0000-4000-8000-'||lpad(n::text,12,'0'),
  'session_id','02090000-0000-4000-8000-'||lpad(n::text,12,'0'),'role','authenticated')::text,true);
end; $$;
create function pg_temp.family_id() returns uuid language sql as $$select(value#>>'{snapshot,family,id}')::uuid from message_test_state where key='family';$$;
create function pg_temp.child_id(n integer) returns uuid language sql as $$select(value#>>'{result,childId}')::uuid from message_test_state where key='child'||n;$$;
create function pg_temp.thread_id() returns uuid language sql as $$select(value#>>'{threads,0,id}')::uuid from message_test_state where key='one-thread';$$;
create function pg_temp.peer_id() returns uuid language sql as $$ select(value->>'id')::uuid from message_test_state where key='peer';$$;
create function pg_temp.invite_child(n integer) returns void language plpgsql as $$begin
 insert into message_test_state values('invite'||n,public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),
  jsonb_build_object('type','invite_child','childId',pg_temp.child_id(n))));end;$$;
create function pg_temp.pair(n integer,p_invite integer) returns void language plpgsql as $$begin
 perform pg_temp.actor(n);perform public.ghaf_redeem_family_invite((select value#>>'{result,token}' from message_test_state where key='invite'||p_invite),gen_random_uuid());end;$$;
set local role authenticated;
select pg_temp.actor(1);
insert into message_test_state values('family',public.ghaf_family_command(null,gen_random_uuid(),'{"type":"create_family","name":"Actual message family","displayName":"First actual Parent"}'));
select is(public.ghaf_family_message_threads(pg_temp.family_id())->'threads','[]'::jsonb,'Fresh account has no fabricated conversations');
insert into message_test_state values('child2',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),'{"type":"add_child","displayName":"Younger Child","ageBand":"6_8"}'));
insert into message_test_state values('child3',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),'{"type":"add_child","displayName":"Older Child","ageBand":"9_11"}'));
select pg_temp.invite_child(2);select pg_temp.invite_child(3);
select throws_ok($$select public.ghaf_family_peer_permission(pg_temp.family_id(),pg_temp.child_id(2),pg_temp.child_id(3),true,gen_random_uuid())$$,'42501','access_unavailable','Unpaired profiles cannot enable peer messaging');
insert into message_test_state values('parent-invite',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),'{"type":"invite_parent"}'));
select pg_temp.actor(4);
insert into message_test_state values('other-family',public.ghaf_family_command(null,gen_random_uuid(),'{"type":"create_family","name":"Other message family","displayName":"Other actual Parent"}'));
insert into message_test_state values('child7',public.ghaf_family_command((select(value#>>'{snapshot,family,id}')::uuid from message_test_state where key='other-family'),gen_random_uuid(),'{"type":"add_child","displayName":"Other family Child","ageBand":"12_14"}'));
insert into message_test_state values('invite7',public.ghaf_family_command((select(value#>>'{snapshot,family,id}')::uuid from message_test_state where key='other-family'),gen_random_uuid(),jsonb_build_object('type','invite_child','childId',pg_temp.child_id(7))));
select pg_temp.pair(2,2);select pg_temp.pair(3,3);select pg_temp.pair(7,7);
select pg_temp.actor(5);
select lives_ok($$select public.ghaf_redeem_family_invite((select value#>>'{result,token}' from message_test_state where key='parent-invite'),gen_random_uuid())$$,'A separate approved Parent joins this actual family');
select pg_temp.actor(1);
insert into message_test_state values('one-thread',jsonb_build_object('threads',(select jsonb_agg(t) from jsonb_array_elements(public.ghaf_family_message_threads(pg_temp.family_id())->'threads')t where t->>'childId'=pg_temp.child_id(2)::text)));
select is(jsonb_array_length(public.ghaf_family_message_threads(pg_temp.family_id())->'threads'),2,'Parent sees only their two actual Child conversations');
select is(public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.thread_id())->'messages','[]'::jsonb,'New real threads contain no sample history');
insert into message_test_state values('sent',public.ghaf_family_message_send(pg_temp.family_id(),pg_temp.thread_id(),'02100000-0000-4000-8000-000000000001','Our agreed activity is ready.',null));
select is(public.ghaf_family_message_send(pg_temp.family_id(),pg_temp.thread_id(),'02100000-0000-4000-8000-000000000001','Our agreed activity is ready.',null),(select value from message_test_state where key='sent'),'Exact send retry returns the same committed message');
select throws_ok($$select public.ghaf_family_message_send(pg_temp.family_id(),pg_temp.thread_id(),'02100000-0000-4000-8000-000000000001','Changed content',null)$$,'PT409','request_conflict','Changed body cannot reuse a committed send key');
select is(jsonb_array_length(public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.thread_id())->'messages'),1,'Send retry persists exactly one message');
select pg_temp.actor(2);
select is(public.ghaf_family_message_threads(pg_temp.family_id())#>>'{actor,personId}',pg_temp.child_id(2)::text,'Authenticated Child is projected as its stable managed identity');
select is((select t->>'unreadCount' from jsonb_array_elements(public.ghaf_family_message_threads(pg_temp.family_id())->'threads')t where t->>'id'=pg_temp.thread_id()::text),'1','Other-client message is unread until this Child opens it');
select is(public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.thread_id())#>>'{messages,0,body}','Our agreed activity is ready.','Separately authenticated Child reads the persisted Parent message');
select lives_ok($$select public.ghaf_family_message_mark_read(pg_temp.family_id(),pg_temp.thread_id(),1)$$,'Child stores its own read cursor');
select lives_ok($$select public.ghaf_family_message_mark_read(pg_temp.family_id(),pg_temp.thread_id(),0)$$,'Stale read cursor does not regress state');
select is((select t->>'readSequence' from jsonb_array_elements(public.ghaf_family_message_threads(pg_temp.family_id())->'threads')t where t->>'id'=pg_temp.thread_id()::text),'1','Read cursor is monotonic');
select throws_ok($$select public.ghaf_family_message_mark_read(pg_temp.family_id(),pg_temp.thread_id(),999)$$,'PT400','invalid_command','Read state cannot claim a future message');
select throws_ok($$select public.ghaf_family_message_send(pg_temp.family_id(),pg_temp.thread_id(),gen_random_uuid(),'Arbitrary young-child text',null)$$,'PT400','invalid_command','Youngest band cannot bypass curated phrases');
select throws_ok($$select public.ghaf_family_message_send(pg_temp.family_id(),pg_temp.thread_id(),gen_random_uuid(),'Different text','help')$$,'PT400','invalid_command','A forged phrase label does not authorize arbitrary text');
select lives_ok($$select public.ghaf_family_message_send(pg_temp.family_id(),pg_temp.thread_id(),'02100000-0000-4000-8000-000000000002','هل يمكنك مساعدتي؟','help')$$,'Approved Arabic phrase is a real persisted Child reply');
select throws_ok($$select public.ghaf_family_peer_permission(pg_temp.family_id(),pg_temp.child_id(2),pg_temp.child_id(3),true,gen_random_uuid())$$,'42501','access_unavailable','Child cannot enable peer messages by direct RPC');
select throws_ok($$select public.ghaf_family_peer_permissions(pg_temp.family_id())$$,'42501','access_unavailable','Child cannot inspect guardian configuration');
select pg_temp.actor(1);
select is(public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.thread_id())#>>'{messages,1,body}','هل يمكنك مساعدتي؟','Parent reads the actual remote Child reply');
select lives_ok($$select public.ghaf_family_peer_permission(pg_temp.family_id(),pg_temp.child_id(2),pg_temp.child_id(3),true,'02100000-0000-4000-8000-000000000003')$$,'Guardian explicitly enables paired sibling conversation');
select pg_temp.actor(2);
insert into message_test_state values('peer',(select t from jsonb_array_elements(public.ghaf_family_message_threads(pg_temp.family_id())->'threads')t where t->>'kind'='child_child'));
insert into message_test_state values('peer-sent',public.ghaf_family_message_send(pg_temp.family_id(),pg_temp.peer_id(),'02100000-0000-4000-8000-000000000004','I am ready.','ready'));
select pg_temp.actor(3);
select is(public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.peer_id())#>>'{messages,0,body}','I am ready.','Authorized sibling reads persisted peer phrase');
select lives_ok($$select public.ghaf_family_message_send(pg_temp.family_id(),pg_temp.peer_id(),gen_random_uuid(),'I will join the agreed activity.',null)$$,'Older Child can use bounded family text');
select pg_temp.actor(7);
select throws_ok($$select public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.peer_id())$$,'42501','family_unavailable','Nonparticipant Child in another family cannot read peer content');
select pg_temp.actor(5);
select throws_ok($$select public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.thread_id())$$,'42501','access_unavailable','Another Parent in the same family cannot read this Parent conversation');
select throws_ok($$select public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.peer_id())$$,'42501','access_unavailable','Guardian membership does not grant peer content access');
select pg_temp.actor(4);
select throws_ok($$select public.ghaf_family_message_threads(pg_temp.family_id())$$,'42501','family_unavailable','Another family cannot enumerate threads');
select throws_ok($$select public.ghaf_family_message_send(pg_temp.family_id(),pg_temp.thread_id(),gen_random_uuid(),'Outside family',null)$$,'42501','family_unavailable','Another family cannot send to a known thread');
select pg_temp.actor(1);
select lives_ok($$select public.ghaf_family_peer_permission(pg_temp.family_id(),pg_temp.child_id(2),pg_temp.child_id(3),false,gen_random_uuid())$$,'Guardian disables the actual peer backend');
select pg_temp.actor(2);
select throws_ok($$select public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.peer_id())$$,'42501','access_unavailable','Disabled peer history is not readable through direct RPC');
select throws_ok($$select public.ghaf_family_message_send(pg_temp.family_id(),pg_temp.peer_id(),'02100000-0000-4000-8000-000000000004','I am ready.','ready')$$,'42501','access_unavailable','Even exact send retries recheck disabled peer authorization');
select pg_temp.actor(1);
select lives_ok($$select public.ghaf_family_peer_permission(pg_temp.family_id(),pg_temp.child_id(2),pg_temp.child_id(3),true,'02100000-0000-4000-8000-000000000003')$$,'Old enable request retry returns without reenabling a subsequently disabled thread');
select is((select p->>'enabled' from jsonb_array_elements(public.ghaf_family_peer_permissions(pg_temp.family_id()))p where p->>'threadId'=pg_temp.peer_id()::text),'false','Committed permission retry never overwrites a newer guardian decision');
select public.ghaf_family_peer_permission(pg_temp.family_id(),pg_temp.child_id(2),pg_temp.child_id(3),true,gen_random_uuid());
select pg_temp.actor(3);
select lives_ok($$select public.ghaf_family_peer_leave(pg_temp.family_id(),pg_temp.peer_id(),'02100000-0000-4000-8000-000000000005')$$,'Either participating Child may disable peer messaging');
select lives_ok($$select public.ghaf_family_peer_leave(pg_temp.family_id(),pg_temp.peer_id(),'02100000-0000-4000-8000-000000000005')$$,'Child leave is safely idempotent while disabled');
select throws_ok($$select public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.peer_id())$$,'42501','access_unavailable','Leaving takes effect beyond the interface');
select pg_temp.actor(1);
insert into message_test_state values('invite6',public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','invite_child','childId',pg_temp.child_id(2))));
select pg_temp.pair(6,6);
select is(public.ghaf_family_message_send(pg_temp.family_id(),pg_temp.thread_id(),'02100000-0000-4000-8000-000000000002','هل يمكنك مساعدتي؟','help')->>'sequence','2','Second paired Child client shares the stable sender and exact receipt');
select is((select t->>'readSequence' from jsonb_array_elements(public.ghaf_family_message_threads(pg_temp.family_id())->'threads')t where t->>'id'=pg_temp.thread_id()::text),'1','Read state survives independently paired Child sessions');
select pg_temp.actor(1);
select throws_ok($$select public.ghaf_family_message_send(pg_temp.family_id(),pg_temp.thread_id(),gen_random_uuid(),repeat('x',501),null)$$,'PT400','invalid_command','Server bounds message length');
select throws_ok($$select public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.thread_id(),1,2,30)$$,'PT400','invalid_command','Conflicting page cursors are rejected');
select is(public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.thread_id(),null,null,1)#>>'{messages,0,sequence}','2','Latest page returns the newest committed sequence');
select is(public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.thread_id(),null,null,1)->>'hasMore','true','Older history has an explicit page indicator');
select is(public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.thread_id(),2,null,1)#>>'{messages,0,sequence}','1','Older cursor returns preceding retained message');
select is(public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.thread_id(),null,1,1)#>>'{messages,0,sequence}','2','Reconnect cursor returns newer messages in order');
select public.ghaf_family_command(pg_temp.family_id(),gen_random_uuid(),jsonb_build_object('type','revoke_child','childId',pg_temp.child_id(2)));
select pg_temp.actor(6);
select throws_ok($$select public.ghaf_family_message_threads(pg_temp.family_id())$$,'42501','family_unavailable','Revocation denies every paired session of the Child');
reset role;
select ok(not has_table_privilege('authenticated','public.app_family_messages','SELECT') and not has_table_privilege('authenticated','public.app_family_messages','INSERT'),'Raw message tables cannot bypass participant authorization');
select ok(not has_function_privilege('authenticated','public.ghaf_family_message_purge_expired()','EXECUTE'),'Client cannot invoke global retention deletion');
update public.app_family_messages set created_at=clock_timestamp()-interval '31 days' where id=(select(value->>'id')::uuid from message_test_state where key='sent');
set local role authenticated;select pg_temp.actor(1);
select is(jsonb_array_length(public.ghaf_family_message_page(pg_temp.family_id(),pg_temp.thread_id())->'messages'),1,'Expired content is unreadable before scheduled cleanup');
reset role;
select is(public.ghaf_family_message_purge_expired(),1::bigint,'Operator purge removes only expired message content');
select is((select count(*) from public.app_family_messages where id=(select(value->>'id')::uuid from message_test_state where key='sent')),0::bigint,'Expired raw body is actually removed');
select * from finish();
rollback;
