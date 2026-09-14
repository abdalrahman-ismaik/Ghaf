-- Accepted retained sends may be retried without consuming the new-send attempt budget.
begin;

create or replace function public.fm_send(p_thread_id text, p_client_key text, p_body text,
  p_phrase_id text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_device fm_private.devices;
  v_sender uuid;
  v_message fm_private.messages;
  v_sequence bigint;
  v_age text;
  v_thread_id uuid;
  v_client_key uuid;
  v_retained boolean;
  v_valid_body boolean;
  v_valid_phrase boolean;
  v_exact_retry boolean;
begin
  v_device := fm_private.device();
  v_sender := coalesce(v_device.child_id, v_device.parent_id);
  v_thread_id := fm_private.try_uuid(p_thread_id);
  if v_thread_id is null then return fm_private.failure('invalid_request'); end if;
  -- Authorize the requested thread before any sender/key receipt lookup.
  perform fm_private.authorize_thread(v_device, v_thread_id);
  v_client_key := fm_private.try_uuid(p_client_key);
  select * into v_message from fm_private.messages where sender_id = v_sender and client_key = v_client_key;
  v_retained := found and v_message.created_at > clock_timestamp() - interval '30 days';
  v_valid_body := coalesce(p_body is not null and char_length(p_body) between 1 and 500
    and fm_private.has_text(p_body), false);
  select age_band into v_age from fm_private.children where id = v_device.child_id;
  v_valid_phrase := v_age is distinct from '6_8' or coalesce(case p_phrase_id
    when 'help' then p_body in ('هل يمكنك مساعدتي؟', 'Can you help me?')
    when 'ready' then p_body in ('أنا مستعدّ.', 'I am ready.')
    when 'thanks' then p_body in ('شكرًا لمساعدتك.', 'Thank you for helping.')
    when 'pause' then p_body in ('أحتاج إلى استراحة قصيرة.', 'I need a short break.')
    else false end, false);
  v_exact_retry := coalesce(v_retained and v_client_key is not null and v_valid_body and v_valid_phrase
    and v_message.thread_id = v_thread_id and v_message.body = p_body, false);
  -- Conflicting or invalid known-key attempts still consume the existing abuse budget.
  if not v_exact_retry then
    if not fm_private.take_attempt(v_sender, 'send', 30, interval '1 minute') then
      return fm_private.failure('rate_limited'); end if;
  end if;
  if v_client_key is null then return fm_private.failure('invalid_request'); end if;
  if not v_valid_body or not v_valid_phrase then return fm_private.failure('invalid_message'); end if;
  if v_retained then
    if v_message.thread_id <> v_thread_id or v_message.body <> p_body then
      return fm_private.failure('idempotency_conflict'); end if;
    return fm_private.message_dto(v_message);
  end if;
  -- Expired receipts are outside the guarantee, even if hourly cleanup has not run yet.
  delete from fm_private.messages where sender_id = v_sender and client_key = v_client_key
    and created_at <= clock_timestamp() - interval '30 days';
  select next_sequence into v_sequence from fm_private.threads where id = v_thread_id for update;
  if v_sequence >= 9007199254740991 then return fm_private.failure('service_unavailable'); end if;
  insert into fm_private.messages(thread_id, sender_id, body, sequence, client_key)
    values (v_thread_id, v_sender, p_body, v_sequence, v_client_key) returning * into v_message;
  update fm_private.threads set next_sequence = v_sequence + 1 where id = v_thread_id;
  return fm_private.message_dto(v_message);
exception when sqlstate 'P0001' then return fm_private.failure(sqlerrm);
  when others then return fm_private.failure('service_unavailable');
end;
$$;

revoke all on function public.fm_send(text,text,text,text) from public, anon, authenticated;
grant execute on function public.fm_send(text,text,text,text) to authenticated;

commit;
