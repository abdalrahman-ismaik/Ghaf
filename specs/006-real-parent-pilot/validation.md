# Feature 006 Validation

## Local implementation evidence — 2026-09-13

- PASSED: PostgreSQL policy/migration suite, 37 assertions, using Supabase CLI
  2.117.0 and PostgreSQL 17.6.1.167. Verified rollback leaves zero fixture users and
  approval rows. Local Docker 29.2.1 required excluding optional Studio and
  postgres-meta because their downloaded images failed to execute.
- PASSED: Account service/storage suite, 26 tests including real installed SDK
  with injected transport. Controller lifecycle suite, 16 tests. Pilot UI suite,
  27 tests. Pilot sample and existing access regression selection, 159 tests.
- PASSED: Opt-in real local Supabase integration test against loopback Auth/API,
  PostgreSQL and Mailpit: registration, wrong/reused email code rejection,
  approval/suspension, two-account isolation, mutation denial, recovery/password
  replacement, session restoration, logout and missing approval denial. Only
  uniquely scoped synthetic accounts were created and were removed in cleanup.
- IN PROGRESS: Final integrated static checks, complete regression run, browser
  inspection and exports. Concurrent compiler checks exhausted host memory;
  final checks will run serially with bounded test workers.

## External gates

- BLOCKED: Hosted Mumbai project provisioning; Supabase dashboard is signed out.
  Owner sign-in requested in the opened tab; no hosted project is claimed.
- BLOCKED: External verification/recovery delivery. Owner confirmed no sending
  domain. Resend requires a verified domain; local Mailpit is test evidence only.
- NOT RUN: Physical Android SecureStore, process restart, keyboard, Back, TalkBack
  and provider failure/recovery. JavaScript exports cannot pass these gates.
- NOT RUN: Named Arabic/human pilot review and hosted activation review.
- Default authentication mode remains demo; no hosted activation, provider/SMTP
  secret, real Child data or real family-progress persistence is enabled.
