# Implementation plan — Feature016

## Authorized service and native integration — 2026-09-14

The user now authorizes backend integration and physical Android testing using
Android Studio. Root may provision/configure a dedicated synthetic team-test
messaging project and apply the reviewed migrations and retention job, then run
real Auth/HTTP and installation checks. This supersedes prior implementation-only
operator deferral for this bounded session. The adult pilot stays separate; no
paid plan, real Child rollout or unrelated feature activation is authorized.
Record actual project/device availability and results in
`backend-android-validation.md`; unavailable physical checks cannot become emulator passes.

## Technical context and selected architecture

Keep one Expo57/React Native0.86 application, Tamagui, shared tokens, Alexandria/Readex, Zod and
existing service-registry pattern. Select **Supabase Auth + PostgreSQL RPCs** for the first real
messaging service. Use a small typed fetch adapter to documented Auth/REST endpoints, not a new
chat/auth SDK. HTTPS public project URL and publishable key are configuration, not authority.
Service-role/database credentials never enter the app. Parent passwords are submitted only to
provider authentication and cleared from UI memory. Provider setup is operator-controlled.

Parent accounts/households are provisioned by the service operator in an allowlist table using
verified provider user UUIDs. Supabase anonymous sessions identify Child installations, but cannot
read any data until a Parent-created invitation is redeemed. Check auth.users and auth.sessions,
active account/relationship and the bound session/device at every RPC. Never trust user_metadata,
client roles, demo marker, nickname, local Child ID or merely the authenticated Postgres role.

Use PostgreSQL transaction locks on the thread row before allocating per-thread sequence; message
insert and idempotency receipt are one transaction. Deny direct table access with RLS/revoked grants;
expose only narrow security-definer functions with fixed empty search_path and explicit qualified
relations. Check authorization inside each function, not just in the screen or PostgREST route.

Client service/controller is separate from usePrototypeStore. Root/UI integration may observe local
role/profile changes to lock/clear messaging views; registry must not import the prototype store.
A real session never grants local task authority. `/messages` has its own hydration/authorization
boundary. Opening from a local Child surface cannot reveal a restored real Parent inbox. Require
explicit role/account resolution and show actual server participant; no name/ID-based association.

Credentials: native `expo-secure-store` platform adapter; web tab-memory adapter. Installed SQLite
KV and localStorage are not credential storage. New dependency is a measured gap; install only the
Expo57-compatible secure-store version after package owner release. No Supabase or chat SDK needed.
Stored credentials are one namespaced versioned record including endpoint identity; serialize writes
and erase on account change. If secure storage fails, fail closed with actionable sign-in/error.
Message history/drafts are memory-only. Poll every3seconds while thread focused/foreground, timeout
8seconds. Refresh token exchanges serialize; stale callbacks require matching auth and thread epochs.

## Constitution check

The direct user request explicitly expands the old P0 exclusions for real identity, network and
message persistence only. Commit a bounded constitution amendment with this contract. The existing
deterministic task demo stays complete; unavailable real messaging never becomes a synthetic success.
All safety, privacy, bilingual, bounded-assistant, approval and no-loss principles remain. No real
Child-data rollout, paid/public deployment or unrelated feature activation is implied.

## File ownership and integration

Lead M016-root: spec/constitution/feature pointer, canonical board amendment, service contracts/client/
controller/storage, messaging components/routes, bilingual resources, registry and small role/helper
entry seams. One backend worker after contract commit: `workers/ghaf-family-messaging/**` and SQL
acceptance evidence only; no shared registry/resource/package edits. At most one helper, no descendants.
One serialized local validation slot and one isolated preview/browser lane. Shared maintenance owner
retains current staged files until its explicit release/commit. Never commit another owner's index.

New files: `src/features/familyMessaging/{contracts,client,controller,credentialStorage*,index}.ts`,
`src/components/familyMessaging/**`, `app/messages/**`, `src/components/companion/**`,
`assets/images/companion/avatar3.png`, `workers/ghaf-family-messaging/**`, `tests/messaging/**`.
Shared seams: `src/services/index.ts`, `src/i18n/resources.ts`, `app/_layout.tsx`,
`app/parent/family/index.tsx`, `app/child/index.tsx`, `app/child/task.tsx` and narrowly config/package
for secure storage. No task-store authority rewrite or theme replacement.

## Delivery sequence

Contract/checklist/analysis commit → SQL authorization/storage and independent client/controller →
credential storage and UI → bounded companion portrait/draft bridge → focused tests → one AR/EN
browser batch, one defect correction/confirmation → real provider/two-installation acceptance if
available → exact handoff and path release. Source work continues while provider/devices are unavailable.

## Validation strategy

Backend: actual isolated PostgreSQL execution with test auth schema/claims (not provider-login proof),
including wrong household/sibling, forged subject, inactive session/device, enroll reuse/expiry,
revocation, idempotency conflict, sequencing/pagination and retention. Do not use existing5432 data;
use a unique temporary cluster/port under output and stop it afterward. Client: fake transport only
in focused tests for timeout/unknown/retry, refresh, cancellation, stale callbacks and storage failure.
UI browser: actual controls; label any intercepted transport as a test fixture, not real messaging.
Use the real configured service for the two-installation gate; without it status is BLOCKED/NOT RUN.
Preserve existing focused task/help/approval/growth/localization regressions and run integrated
static/full checks once on the final candidate, avoiding other sessions' pools.

## Calling roadmap

T1 requires a separate approved-number model/reauth/dialer contract and physical ACTION_DIAL checks.
V1 requires separate invite/token/call lifecycle, verified RTC/Expo57 compatibility and UAE eligibility.
V2 adds camera consent and audio-only answer after V1. V3 requires OS calling/push/native background
work. LiveKit remains a candidate, not selected: current docs require custom native build/plugins;
no proof of this repo's exact versions or UAE eligibility exists. No calling SDK/control is added here.
