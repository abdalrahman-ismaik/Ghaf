begin;

-- New main-account transport metadata contains no imported people or message history.
alter table public.app_family_members add constraint app_message_member_family unique(id,family_id);
create table public.app_family_message_threads (
 id uuid primary key default gen_random_uuid(),family_id uuid not null references public.app_families(id),
 kind text not null check(kind in ('parent_child','child_child')),
 parent_member_id uuid,child_id uuid not null,peer_child_id uuid,
 peer_enabled boolean not null default false,next_sequence bigint not null default 1 check(next_sequence between 1 and 9007199254740991),
 foreign key(child_id,family_id) references public.app_children(id,family_id),
 foreign key(peer_child_id,family_id) references public.app_children(id,family_id),
 foreign key(parent_member_id,family_id) references public.app_family_members(id,family_id),
 unique(id,family_id),check((kind='parent_child' and parent_member_id is not null and peer_child_id is null and not peer_enabled)
  or (kind='child_child' and parent_member_id is null and peer_child_id is not null and child_id<peer_child_id))
);
create unique index app_message_parent_pair on public.app_family_message_threads(parent_member_id,child_id) where kind='parent_child';
create unique index app_message_child_pair on public.app_family_message_threads(child_id,peer_child_id) where kind='child_child';
create index app_message_thread_family on public.app_family_message_threads(family_id);
create table public.app_family_messages (
 id uuid primary key default gen_random_uuid(),family_id uuid not null,thread_id uuid not null,
 sender_id uuid not null,client_key uuid not null,body text not null check(char_length(body) between 1 and 500),
 phrase_id text check(phrase_id in ('help','ready','thanks','pause')),sequence bigint not null check(sequence between 1 and 9007199254740990),
 created_at timestamptz not null default clock_timestamp(),
 foreign key(thread_id,family_id) references public.app_family_message_threads(id,family_id),
 unique(sender_id,client_key),unique(thread_id,sequence)
);
create index app_message_retention on public.app_family_messages(created_at);
create table public.app_family_message_reads (
 thread_id uuid not null references public.app_family_message_threads(id),person_id uuid not null,
 sequence bigint not null default 0 check(sequence between 0 and 9007199254740990),primary key(thread_id,person_id)
);
alter table public.app_family_message_threads enable row level security;
alter table public.app_family_messages enable row level security;
alter table public.app_family_message_reads enable row level security;
revoke all on public.app_family_message_threads,public.app_family_messages,public.app_family_message_reads from public,anon,authenticated;

create function public.ghaf_message_parent_name(p_member_id uuid) returns text
language sql stable security definer set search_path='' as $$
 select coalesce(nullif(m.display_name,''),nullif(p.display_name,'')) from public.app_family_members m
 join auth.users u on u.id=m.auth_user_id join public.pilot_access a on a.user_id=u.id
 left join public.account_profiles p on p.user_id=u.id
 where m.id=p_member_id and m.active and m.role='parent' and a.status='approved'
  and u.is_anonymous is false and u.email_confirmed_at is not null and u.deleted_at is null
  and (u.banned_until is null or u.banned_until<=now());
$$;
create function public.ghaf_message_child_available(p_family_id uuid,p_child_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.app_children c join public.app_family_members m on m.child_id=c.id and m.family_id=c.family_id
  join auth.sessions s on s.id=m.session_id and s.user_id=m.auth_user_id
  join auth.users u on u.id=m.auth_user_id
  where c.family_id=p_family_id and c.id=p_child_id and c.active and m.active and m.role='child'
   and u.is_anonymous and u.deleted_at is null and (u.banned_until is null or u.banned_until<=now())
   and (s.not_after is null or s.not_after>now()));
$$;
create function public.ghaf_message_thread(p_family_id uuid,p_thread_id uuid)
returns public.app_family_message_threads language plpgsql security definer set search_path='' as $$
declare v_actor record;v_thread public.app_family_message_threads;
begin
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 select t.* into v_thread from public.app_family_message_threads t join public.app_children c
  on c.id=t.child_id and c.family_id=t.family_id and c.active where t.id=p_thread_id and t.family_id=p_family_id;
 if not found then raise exception using errcode='42501',message='access_unavailable'; end if;
 if v_thread.kind='parent_child' then
  if not exists(select 1 from public.app_family_members m where m.id=v_thread.parent_member_id and m.family_id=p_family_id
    and m.active and m.role='parent' and public.ghaf_message_parent_name(m.id) is not null)
   or not ((v_actor.role='parent' and v_actor.member_id=v_thread.parent_member_id)
    or (v_actor.role='child' and v_actor.child_id=v_thread.child_id)) then
    raise exception using errcode='42501',message='access_unavailable'; end if;
 else
  if v_actor.role<>'child' or v_actor.child_id not in(v_thread.child_id,v_thread.peer_child_id) or not v_thread.peer_enabled
   or not public.ghaf_message_child_available(p_family_id,v_thread.child_id)
   or not public.ghaf_message_child_available(p_family_id,v_thread.peer_child_id) then
   raise exception using errcode='42501',message='access_unavailable'; end if;
 end if;
 return v_thread;
end; $$;
create function public.ghaf_message_dto(p_message public.app_family_messages) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('id',p_message.id,'threadId',p_message.thread_id,'senderId',p_message.sender_id,
  'body',p_message.body,'sequence',p_message.sequence,'createdAt',p_message.created_at,'clientKey',p_message.client_key);
$$;
create function public.ghaf_family_message_threads(p_family_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_actor record;v_person uuid;v_age text;v_threads jsonb;
begin
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 perform 1 from public.app_families where id=p_family_id for update;
 perform public.ghaf_family_actor(p_family_id);
 v_person:=coalesce(v_actor.child_id,v_actor.auth_user_id);
 select age_band into v_age from public.app_children where id=v_actor.child_id;
 insert into public.app_family_message_threads(family_id,kind,parent_member_id,child_id)
  select p_family_id,'parent_child',m.id,c.id from public.app_family_members m
   join public.app_children c on c.family_id=m.family_id and c.active
   where m.family_id=p_family_id and m.role='parent' and m.active and public.ghaf_message_parent_name(m.id) is not null
  on conflict(parent_member_id,child_id) where kind='parent_child' do nothing;
 select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'kind',t.kind,'childId',t.child_id,
  'otherName',case when t.kind='child_child' then case when v_actor.child_id=t.child_id then peer.display_name else c.display_name end
    when v_actor.role='child' then public.ghaf_message_parent_name(m.id) else c.display_name end,
  'otherRole',case when t.kind='parent_child' and v_actor.role='child' then 'parent' else 'child' end,
  'otherPersonId',case when t.kind='child_child' then case when v_actor.child_id=t.child_id then t.peer_child_id else t.child_id end
    when v_actor.role='child' then m.auth_user_id else t.child_id end,
  'lastSequence',t.next_sequence-1,'readSequence',coalesce(r.sequence,0),
  'unreadCount',(select count(*) from public.app_family_messages msg where msg.thread_id=t.id and msg.sender_id<>v_person
    and msg.sequence>coalesce(r.sequence,0) and msg.created_at>clock_timestamp()-interval '30 days')) order by t.kind,t.id),'[]')
 into v_threads from public.app_family_message_threads t
 join public.app_children c on c.id=t.child_id and c.family_id=p_family_id and c.active
 left join public.app_children peer on peer.id=t.peer_child_id and peer.family_id=p_family_id
 left join public.app_family_members m on m.id=t.parent_member_id and m.family_id=p_family_id
 left join public.app_family_message_reads r on r.thread_id=t.id and r.person_id=v_person
 where t.family_id=p_family_id and ((t.kind='parent_child' and m.active and public.ghaf_message_parent_name(m.id) is not null
  and ((v_actor.role='parent' and m.id=v_actor.member_id) or (v_actor.role='child' and t.child_id=v_actor.child_id)))
  or (t.kind='child_child' and v_actor.role='child' and v_actor.child_id in(t.child_id,t.peer_child_id) and t.peer_enabled
   and public.ghaf_message_child_available(p_family_id,t.child_id) and public.ghaf_message_child_available(p_family_id,t.peer_child_id)));
 return jsonb_build_object('actor',jsonb_build_object('personId',v_person,'role',v_actor.role,'ageBand',v_age),'threads',v_threads);
end; $$;
create function public.ghaf_family_message_page(p_family_id uuid,p_thread_id uuid,p_before bigint default null,
 p_after bigint default null,p_limit integer default 30) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_items jsonb;v_more boolean;
begin
 perform public.ghaf_family_actor(p_family_id);
 perform 1 from public.app_families where id=p_family_id for share;
 perform public.ghaf_message_thread(p_family_id,p_thread_id);
 if p_limit is null or p_limit not between 1 and 30 or (p_before is not null and p_after is not null)
  or p_before not between 1 and 9007199254740991 or p_after not between 0 and 9007199254740990 then
  raise exception using errcode='PT400',message='invalid_command'; end if;
 with filtered as (select m.* from public.app_family_messages m where m.thread_id=p_thread_id
  and m.created_at>clock_timestamp()-interval '30 days' and (p_before is null or m.sequence<p_before)
  and (p_after is null or m.sequence>p_after)
  order by case when p_after is not null then m.sequence else -m.sequence end limit p_limit+1),
 selected as (select * from filtered order by case when p_after is not null then sequence else -sequence end limit p_limit)
 select (select coalesce(jsonb_agg(public.ghaf_message_dto(s::public.app_family_messages) order by s.sequence),'[]') from selected s),
  (select count(*)>p_limit from filtered) into v_items,v_more;
 return jsonb_build_object('messages',v_items,'hasMore',v_more);
end; $$;
create function public.ghaf_family_message_send(p_family_id uuid,p_thread_id uuid,p_request_id uuid,p_body text,p_phrase_id text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor record;v_person uuid;v_age text;v_thread public.app_family_message_threads;v_message public.app_family_messages;
begin
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 v_person:=coalesce(v_actor.child_id,v_actor.auth_user_id);
 perform pg_advisory_xact_lock(hashtextextended(v_person::text,20024));
 perform 1 from public.app_families where id=p_family_id for update;
 v_thread:=public.ghaf_message_thread(p_family_id,p_thread_id);
 if p_request_id is null or p_body is null or char_length(p_body) not between 1 and 500 or not(p_body ~ '[^[:space:]\u0085]')
  or (p_phrase_id is not null and p_phrase_id not in ('help','ready','thanks','pause')) then
  raise exception using errcode='PT400',message='invalid_command'; end if;
 select age_band into v_age from public.app_children where id=v_actor.child_id;
 if v_age='6_8' and not coalesce(case p_phrase_id
  when 'help' then p_body in ('هل يمكنك مساعدتي؟','Can you help me?')
  when 'ready' then p_body in ('أنا مستعدّ.','I am ready.')
  when 'thanks' then p_body in ('شكرًا لمساعدتك.','Thank you for helping.')
  when 'pause' then p_body in ('أحتاج إلى استراحة قصيرة.','I need a short break.') else false end,false) then
  raise exception using errcode='PT400',message='invalid_command'; end if;
 select * into v_message from public.app_family_messages where sender_id=v_person and client_key=p_request_id;
 if found and v_message.created_at>clock_timestamp()-interval '30 days' then
  if v_message.thread_id<>p_thread_id or v_message.body<>p_body or v_message.phrase_id is distinct from p_phrase_id then
   raise exception using errcode='PT409',message='request_conflict'; end if;
  return public.ghaf_message_dto(v_message);
 end if;
 if (select count(*) from public.app_family_messages where sender_id=v_person and created_at>clock_timestamp()-interval '1 minute')>=30 then
  raise exception using errcode='PT429',message='rate_limited'; end if;
 if v_thread.next_sequence>=9007199254740991 then raise exception using errcode='PT409',message='request_conflict'; end if;
 delete from public.app_family_messages where sender_id=v_person and client_key=p_request_id and created_at<=clock_timestamp()-interval '30 days';
 insert into public.app_family_messages(family_id,thread_id,sender_id,client_key,body,phrase_id,sequence)
  values(p_family_id,p_thread_id,v_person,p_request_id,p_body,p_phrase_id,v_thread.next_sequence) returning * into v_message;
 update public.app_family_message_threads set next_sequence=next_sequence+1 where id=p_thread_id;
 update public.app_families set revision=revision+1 where id=p_family_id;
 return public.ghaf_message_dto(v_message);
end; $$;
create function public.ghaf_family_message_mark_read(p_family_id uuid,p_thread_id uuid,p_sequence bigint) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_actor record;v_person uuid;v_thread public.app_family_message_threads;
begin
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 perform 1 from public.app_families where id=p_family_id for update;
 v_thread:=public.ghaf_message_thread(p_family_id,p_thread_id);v_person:=coalesce(v_actor.child_id,v_actor.auth_user_id);
 if p_sequence is null or p_sequence<0 or p_sequence>=v_thread.next_sequence then
  raise exception using errcode='PT400',message='invalid_command'; end if;
 insert into public.app_family_message_reads(thread_id,person_id,sequence) values(p_thread_id,v_person,p_sequence)
  on conflict(thread_id,person_id) do update set sequence=excluded.sequence
   where public.app_family_message_reads.sequence<excluded.sequence;
 if found then update public.app_families set revision=revision+1 where id=p_family_id; end if;
 return '{"ok":true}'::jsonb;
end; $$;
create function public.ghaf_family_peer_permissions(p_family_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_actor record;v_result jsonb;
begin
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 if v_actor.role<>'parent' then raise exception using errcode='42501',message='access_unavailable'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('firstChildId',a.id,'secondChildId',b.id,'firstName',a.display_name,'secondName',b.display_name,
  'threadId',t.id,'enabled',coalesce(t.peer_enabled,false),'available',public.ghaf_message_child_available(p_family_id,a.id)
   and public.ghaf_message_child_available(p_family_id,b.id)) order by a.id,b.id),'[]') into v_result
  from public.app_children a join public.app_children b on a.family_id=b.family_id and a.id<b.id and b.active
  left join public.app_family_message_threads t on t.child_id=a.id and t.peer_child_id=b.id and t.kind='child_child'
  where a.family_id=p_family_id and a.active;
 return v_result;
end; $$;
create function public.ghaf_family_peer_permission(p_family_id uuid,p_first_child_id uuid,p_second_child_id uuid,p_enabled boolean,p_request_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor record;v_first uuid:=least(p_first_child_id,p_second_child_id);v_second uuid:=greatest(p_first_child_id,p_second_child_id);
 v_command jsonb;v_receipt public.app_command_receipts;
begin
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 if v_actor.role<>'parent' then raise exception using errcode='42501',message='access_unavailable'; end if;
 if p_request_id is null or p_first_child_id is null or p_second_child_id is null or v_first=v_second or p_enabled is null then
  raise exception using errcode='PT400',message='invalid_command'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,20020));
 perform 1 from public.app_families where id=p_family_id for update;
 perform public.ghaf_family_actor(p_family_id);
 if (select count(*) from public.app_children where family_id=p_family_id and id in(v_first,v_second) and active)<>2 then
  raise exception using errcode='42501',message='access_unavailable'; end if;
 v_command:=jsonb_build_object('type','peer_permission','firstChildId',p_first_child_id,'secondChildId',p_second_child_id,'enabled',p_enabled);
 select * into v_receipt from public.app_command_receipts where auth_user_id=auth.uid() and request_id=p_request_id;
 if found then
  if v_receipt.family_id<>p_family_id or v_receipt.command<>v_command then raise exception using errcode='PT409',message='request_conflict'; end if;
  return '{"ok":true}'::jsonb;
 end if;
 if p_enabled and not(public.ghaf_message_child_available(p_family_id,v_first) and public.ghaf_message_child_available(p_family_id,v_second)) then
  raise exception using errcode='42501',message='access_unavailable'; end if;
 insert into public.app_family_message_threads(family_id,kind,child_id,peer_child_id,peer_enabled)
  values(p_family_id,'child_child',v_first,v_second,p_enabled)
  on conflict(child_id,peer_child_id) where kind='child_child' do update set peer_enabled=excluded.peer_enabled;
 update public.app_families set revision=revision+1 where id=p_family_id;
 insert into public.app_command_receipts(auth_user_id,request_id,family_id,command,result)
  values(auth.uid(),p_request_id,p_family_id,v_command,'{"ok":true}');
 return '{"ok":true}'::jsonb;
end; $$;
create function public.ghaf_family_peer_leave(p_family_id uuid,p_thread_id uuid,p_request_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_actor record;v_thread public.app_family_message_threads;v_command jsonb;v_receipt public.app_command_receipts;
begin
 select * into v_actor from public.ghaf_family_actor(p_family_id);
 if v_actor.role<>'child' then raise exception using errcode='42501',message='access_unavailable'; end if;
 if p_request_id is null then raise exception using errcode='PT400',message='invalid_command'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,20020));
 perform 1 from public.app_families where id=p_family_id for update;
 perform public.ghaf_family_actor(p_family_id);
 select * into v_thread from public.app_family_message_threads where id=p_thread_id and family_id=p_family_id and kind='child_child';
 if not found or v_actor.child_id not in(v_thread.child_id,v_thread.peer_child_id) then
  raise exception using errcode='42501',message='access_unavailable'; end if;
 v_command:=jsonb_build_object('type','peer_leave','threadId',p_thread_id);
 select * into v_receipt from public.app_command_receipts where auth_user_id=auth.uid() and request_id=p_request_id;
 if found then
  if v_receipt.family_id<>p_family_id or v_receipt.command<>v_command then raise exception using errcode='PT409',message='request_conflict'; end if;
  return '{"ok":true}'::jsonb;
 end if;
 update public.app_family_message_threads set peer_enabled=false where id=p_thread_id;
 update public.app_families set revision=revision+1 where id=p_family_id;
 insert into public.app_command_receipts(auth_user_id,request_id,family_id,command,result)
  values(auth.uid(),p_request_id,p_family_id,v_command,'{"ok":true}');
 return '{"ok":true}'::jsonb;
end; $$;
create function public.ghaf_family_message_purge_expired() returns bigint
language plpgsql security definer set search_path='' as $$
declare v_count bigint;
begin
 delete from public.app_family_messages where created_at<=clock_timestamp()-interval '30 days';
 get diagnostics v_count=row_count;return v_count;
end; $$;

revoke all on function public.ghaf_message_parent_name(uuid),public.ghaf_message_child_available(uuid,uuid),public.ghaf_message_thread(uuid,uuid),
 public.ghaf_message_dto(public.app_family_messages),public.ghaf_family_message_purge_expired(),
 public.ghaf_family_message_threads(uuid),public.ghaf_family_message_page(uuid,uuid,bigint,bigint,integer),
 public.ghaf_family_message_send(uuid,uuid,uuid,text,text),public.ghaf_family_message_mark_read(uuid,uuid,bigint),
 public.ghaf_family_peer_permissions(uuid),public.ghaf_family_peer_permission(uuid,uuid,uuid,boolean,uuid),
 public.ghaf_family_peer_leave(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.ghaf_family_message_threads(uuid),public.ghaf_family_message_page(uuid,uuid,bigint,bigint,integer),
 public.ghaf_family_message_send(uuid,uuid,uuid,text,text),public.ghaf_family_message_mark_read(uuid,uuid,bigint),
 public.ghaf_family_peer_permissions(uuid),public.ghaf_family_peer_permission(uuid,uuid,uuid,boolean,uuid),
 public.ghaf_family_peer_leave(uuid,uuid,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
