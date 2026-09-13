# Parent account chooser — selected local-entry amendment

Authority: user instruction, 2026-09-13: the Parent “مرحبًا بعودتك” screen should show
preconfigured accounts and Create new family, with demo access requiring no email, password or code.
This explicitly supersedes ordinary-mode mandatory credential entry in Feature015 US1 scenario5,
FR-002/016 and the relevant Feature003/005 returning-Parent presentation only. The original six
onboarding pages, two-choice Welcome, separate Child access and Feature016 real Auth are preserved.

## User-visible contract

- `/access/parent/sign-in` displays the current device-local family account, or the existing prepared
  Al Noor Parent when no family is stored. Choose once to open Parent Home with fresh synthetic
  authority. The account is visibly local/demo; it is never called an authenticated remote account.
- No email/phone/password/code field appears on this screen. Do not fabricate multiple saved accounts:
  the current local repository holds one family. Never replace that family merely to show a demo row.
- Create new family retains the existing setup, explicit replacement confirmation and cancellation.
  Legacy profile repair may retain its existing explicit verification/repair route without asking
  for the already known identifier on this chooser. Unavailable storage fails closed, no reseeding.
- Returning from a temporary Parent handoff keeps the Child pairing/marker and returns to that Child
  on cancel/sign-out. Active Child access cannot invoke the chooser command as a role switch.
- The selected prototype Parent never receives Supabase credentials or household/thread access.
  Existing real messaging authentication remains independent. No task/approval/Seed/Garden changes.

## Implementation contract

Add one ordinary-only synchronous store action `enterLocalParentAccount()` returning a normal
`ServiceResult<ParentOnboardingHandoff>`. It requires signed-out local state and ready family data;
reject active/reset-failed/incomplete/reentrant attempts. Read the authoritative repository; use the
existing saved record or pure `createCanonicalDemoFamily` only after a successful empty read.
Reuse validated receipt restoration, `resumeRememberedParent`, Child pairing restoration when
initializing, and the existing access/Parent/Child transaction wrappers. Verify authority before
persisting a newly prepared family. Save last; no other fallible work follows save. Repository
write failure rolls back controller authority. Existing family bytes, device affinity, temporary
Child context and task/progression stay unchanged. No fake OTP calls or release/config flags.

Keep route composition small, use shared botanical components/tokens and bilingual resources.
Show busy/disabled/error feedback, 48dp-or-larger targets, complete wrapping text and RTL Back.

## Acceptance and retest

1. Fresh ordinary run: account row → Parent Home, no verification request/code/session fabrication
   in UI; canonical family is initialized once; Parent authority only, default growth unchanged.
2. Existing family: exact stored profile/pairing/progress and affinity retained through sign-in/out.
3. Active Child/direct command, duplicate, invalid/unavailable storage and provider failure deny
   unintended entry. Retry after a failed attempt works without partial authority.
4. Temporary Child → Parent selection → Parent sign-out returns to the same Child; cancel grants
   no Parent authority. Real messaging adapter never receives synthetic credentials.
5. Actual Arabic/English preview: Welcome Parent → chooser → home; Create family and Back work;
   compact/regular widths and enlarged-text simulation show usable actions. Native acceptance and
   named Arabic/human review remain NOT RUN unless directly observed.

## Ownership and dependencies

Lead owns route, chooser component, resources, rendered tests and old presentation assertions.
The sole helper owns new `src/features/access/localParentEntry.ts`, the bounded action in
`src/state/usePrototypeStore.ts`, and new `tests/access/local-parent-entry.test.ts` after this commit.
No controller/provider method changes or dependencies are expected. Lead owns one serialized check
lane then one isolated browser using existing8082; helper has no jobs/browser/descendants unless
explicitly transferred. Shared narration work remains separately owned and untouched.
