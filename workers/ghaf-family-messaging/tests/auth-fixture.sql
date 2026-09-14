-- TEST ONLY. These synthetic Auth rows/claims do not verify provider login or JWT validation.
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (
  id uuid primary key,
  is_anonymous boolean not null default false,
  email_confirmed_at timestamptz,
  deleted_at timestamptz,
  banned_until timestamptz
);
create table auth.sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id),
  not_after timestamptz
);
create function auth.uid() returns uuid language sql stable as $$
  select (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')::uuid;
$$;
create function auth.jwt() returns jsonb language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb;
$$;
revoke all on schema auth from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
