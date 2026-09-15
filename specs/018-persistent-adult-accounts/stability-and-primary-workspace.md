# Primary account workspace and stability amendment

Authority: the user's 2026-09-14 request to fix authentication, family/task creation,
completion/build errors and language selectors, and use real Supabase data instead of predefined
records. The user explicitly retains email/password sign-in.

## Behavior

1. A configured real-account launch must reach authentication without depending on an absent
   optional environment file. Explicit pilot launch selects Supabase; existing ordinary/demo
   launch and independent messaging configuration remain available.
2. After verified approved sign-in, the primary screen presents the account-owned family,
   tasks and study workspace. Account/profile settings and the explicit sample are secondary
   actions. No automatic call to startPilotSample and no seeded family/member/task substitutions.
3. An empty account has a clear family-creation sequence: set its name, add a member, then
   create a task for an explicitly selected saved member. Creation, edit and completion reflect
   confirmed server writes; network failure preserves input and never reports synthetic success.
4. Existing revision/ownership checks remain authoritative. Rapid submissions issue one request;
   stale revisions retain drafts with an explicit reload/retry path. Logout/account changes
   invalidate requests and clear private views while retaining server records.
5. Family/task/study sections remain navigable and usable at compact widths, with Arabic RTL
   and English LTR. Language changes update controls and labels consistently without clearing
   family/task drafts, losing the selected member, or being unexpectedly reverted by background
   profile refresh. Account preference editing and current interface language stay coherent.
6. Reproduce and repair concrete failures in the preserved local family/task journey as well.
   User-entered profile/task data must survive language changes; existing assignments must remain
   reachable after another assignment is created.
7. Keep the existing sample Child, growth, academic-goal and Masroofi demonstrations intact and
   explicitly entered. Workspace completion remains Parent-managed planning data; it is not
   permission to mint Seeds or money, invent Child credentials, or project UUIDs onto Salem/Alya.

## Implementation and evidence

Promote the existing AccountWorkspaceBoundary/controller and verified Supabase workspace RPCs;
do not create a parallel cloud store or hydrate the synthetic Zustand runtime. Reuse the existing
botanical components and bilingual resources. Narrow launcher, form, draft, language and navigation
fixes require regression tests for the observed failures. No database migration is required by
the current persisted-data scope; any later discovered schema defect needs an additive reviewed fix.

Root serializes typecheck, lint, formatting, focused/full tests and available browser/backend
verification. Use synthetic accounts/content for tests and preserve all existing user data.
Read-only provider probes do not establish an authenticated write round trip. Missing credentials,
native environment or device evidence must be recorded explicitly. No deletion, database reset,
payment integration, public deployment or production acceptance is authorized by this amendment.
