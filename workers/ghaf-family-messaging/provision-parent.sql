-- Operator only: replace the two inputs below in the dedicated team-test project's SQL editor.
-- Never copy a password, token, service key or real Child data into this script.
begin;
do $$
declare
  v_provider_user_id uuid := '00000000-0000-0000-0000-000000000000';
  v_display_name text := 'Synthetic Parent';
  v_restore_inactive boolean := false;
  v_existing fm_private.parents;
begin
  if v_provider_user_id = '00000000-0000-0000-0000-000000000000'::uuid then
    raise exception 'Replace the placeholder with the verified team Parent Auth user UUID';
  end if;
  if not exists (select 1 from auth.users where id = v_provider_user_id
    and not is_anonymous and email_confirmed_at is not null and deleted_at is null
    and (banned_until is null or banned_until <= clock_timestamp())) then
    raise exception 'A confirmed active non-anonymous operator-created Auth user is required';
  end if;
  if v_display_name is null or char_length(v_display_name) not between 1 and 60 or not fm_private.has_text(v_display_name) then
    raise exception 'Use a synthetic Parent display name of 1 to 60 code points';
  end if;
  perform fm_private.lock_parent(v_provider_user_id);
  select * into v_existing from fm_private.parents where id = v_provider_user_id;
  if found then
    if not v_existing.active and not v_restore_inactive then
      raise exception 'Account is revoked; operator must explicitly review restoration first';
    end if;
    if not v_existing.active then
      -- Old devices, invitations and Child relationships remain revoked. Create fresh enrollment.
      update fm_private.parents set active = true, display_name = v_display_name where id = v_provider_user_id;
    end if;
  else
    insert into fm_private.parents(id, display_name) values (v_provider_user_id, v_display_name);
  end if;
end;
$$;
commit;
