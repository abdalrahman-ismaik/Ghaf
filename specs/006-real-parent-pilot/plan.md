# Implementation Plan: Real Parent Pilot Login

## Design

Keep the Expo application and deterministic domain. Add a separate provider-neutral
async `ParentAccountService` with a Supabase implementation and injected fake
transports/storage for tests. Types distinguish `RealAccountSession` and
`PilotAccessStatus` from fixed synthetic access IDs.

The root pilot boundary owns account state and the launcher. It withholds the
entire demo tree until identity and approval are validated. Generation counters
discard pending work after signout, recovery, account switching or disposal;
foreground/interval checks do not remount or reset an unchanged approved sample.
Only an explicit explore action bootstraps the sample through a pilot-only store
command. A distinct teardown reuses deterministic cleanup without changing the
existing Parent-only reset guard. Pilot local-family and affinity repositories
use a platform-neutral memory store selected before store initialization.

## Backend

Version SQL migrations and pgTAP tests under `supabase/`. Store no email copy in
the approval table. An auth-user trigger creates `pending`; RLS/grants allow only
own-row SELECT for clients. A constrained status field, foreign-key primary key,
timestamps, and cascading deletion provide the complete data contract.
Use Supabase Auth email/password and typed email codes. Keep recovery sessions
outside the demo; finish password recovery then require normal login.

## Integration

Root owns dependencies: `@supabase/supabase-js`, `expo-secure-store`, and only any
required React Native URL compatibility dependency. Reuse existing state, forms,
i18n, tokens and controls. Add environment examples with auth mode default demo.
Android SecureStore and web browser storage have separate adapters and must surface
failure. Publishable key is public by design; server and SMTP secrets stay outside
the app. No provider is created in default demo mode.

## Deployment and evidence

Prepare a Mumbai pilot project and Resend SMTP instructions. Owner sign-in, project
organization availability and verified sending domain are external prerequisites.
Use local Supabase tests where available and fake provider tests regardless. Do not
claim hosted provisioning, delivered email, native acceptance or release activation
without direct evidence. Build/preview locally before any hosted activation review.
