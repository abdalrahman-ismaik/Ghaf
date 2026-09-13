# Feature 006: Real Parent Pilot Login

**Authority:** User-approved implementation plan, 2026-09-13.
**Status:** Implementation authorized; hosted activation pending direct evidence.

## Outcome and boundary

Adults register with email/password, verify email using an emailed code, await
administrator approval, and explore a synthetic sample family on Android and web.
Supabase in Mumbai stores only adult identities, sessions and pilot approval.
No real Child accounts/data, family cloud storage, task/progression persistence,
remote pairing, admin app, or AI changes are included.

## Requirements

- FR-001: Authentication mode is independently `demo | supabase`, default `demo`.
  Demo mode makes no Supabase authentication calls and preserves Features 003–005.
- FR-002: Supabase owns email/password credentials. Verification and recovery use
  provider-issued single-use email codes, never the synthetic verification code.
  Recovery remains isolated until a password has been set and normal login resumes.
- FR-003: A server-created `pilot_access` row references `auth.users.id` and begins
  `pending`. Status is `pending | approved | suspended`; missing rows deny access.
  RLS permits authenticated users to select their own row only. Only trusted
  administrators can mutate status; editable user metadata never authorizes entry.
- FR-004: A separate asynchronous account/session boundary validates real identity
  and approval before mounting any demo navigator, including direct links. It
  rechecks on foreground, manual refresh, and each active minute. Failures close
  the gate and offer retry without synthetic authentication fallback.
- FR-005: Native sessions use SecureStore only; web uses namespaced browser auth
  storage. Passwords/codes stay transient. No token enters local family records,
  logs, route parameters, fixtures or public environment variables. Only Supabase
  URL and publishable key are public configuration.
- FR-006: Approved accounts see a sample launcher. Opening the sample bootstraps
  canonical fixtures and enters Parent without another simulated email form.
  Real email never populates the synthetic family. Pilot sample storage is memory
  only, independent of existing demo device records. Child access remains simulated.
- FR-007: A persistent account control is available in Parent and Child samples.
  Restart sample clears sample state/history and returns to the launcher while
  retaining real login. Real signout closes the gate immediately, clears sample
  state and credentials, and rejects stale asynchronous results. It works from
  Child, signed-out sample, pending, suspended, recovery and error states.
- FR-008: All new copy is Arabic-first with equivalent English, approved typography,
  logical direction, accessible labels, long-label and keyboard resilience.
- FR-009: Use Resend SMTP and a verified owner-supplied sender domain. Admin approval,
  suspension and deletion use the Supabase dashboard. No approval emails or new
  notification service are included.
- FR-010: No production readiness, real Child privacy, compliance, or cloud-progress
  claim follows from this adult login feature. Default flags remain unchanged.

## Acceptance

Verify registration/verification/recovery, pending-to-approved and suspended
transitions, isolation of two adult accounts, denied approval writes, startup and
foreground failures, late callbacks, Child-view logout, sample reset, default-demo
regressions, bilingual browser presentation and direct physical Android behavior.
Record PASSED, FAILED, BLOCKED or NOT RUN with exact evidence; no inherited passes.
