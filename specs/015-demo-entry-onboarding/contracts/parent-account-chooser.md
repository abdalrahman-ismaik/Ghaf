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

## September 13 follow-up — remove the local verification step

The user explicitly requests: remove “أدخل رمز التحقق” from the login process. This supersedes
this document's retained verification stage for new family, replacement and legacy profile repair.
The existing local account chooser remains one tap. No local Parent journey displays an OTP form.

- New family form retains its existing identifier validation and family details; Continue stages
  local setup directly and opens family basics. No requestVerification or verifyCode call is made.
- Add a narrow controller method to normalize the supplied local identifier and stage the existing
  internal setup-ready state (legacy name verified), with delivery null. This is not identity proof
  and creates no Parent authority, receipt or storage write. Invalidate old verification callbacks.
- Store commands start fresh/replacement setup or known-profile repair only when ordinary and
  signed out. Reuse transactional controller rollback; retain final replacement consent and backup
  restoration on cancellation. Real messaging credentials and all task/growth state remain untouched.
- The former verification route becomes a safe compatibility redirect. Stale code-sent/verifying
  states return to account selection after cancellation. Direct links/query parameters never
  create authority or silently start/complete replacement. Valid staged setup resumes its next
  details screen; no redirect loop. Active Child remains in its own role.
- Move the existing optional remember-Parent choice into family details, unavailable on temporary
  Child handoff. Do not create a new remember mechanism or silently remember the demo Parent.
- Update visible copy that promises verification to say setup/repair instead. Keep bilingual
  resources and existing layouts; Child PIN/pairing and Feature016 real Auth remain unchanged.

Tests: fresh/replacement/repair stage without OTP/provider/session; invalid input/active Child/demo
mode deny; failed staging rolls back; final replacement still needs confirmation; cancel preserves
stored family/affinity; stale verification navigation clears old pending state; rendered controls
skip OTP in AR/EN. Native and named human acceptance remain separate NOT RUN gates.

## User-selected natural family name — September 13

User: “dont use weird names for the families, use a name like عائلة أبو راشد”. Use exactly
عائلة أبو راشد for the prepared/default Arabic family and Abu Rashid Family in English. Update
new-family examples and the synthetic garden/household labels consistently. Stable household,
Parent and Child identifiers are unchanged. For an already saved, identifiable prepared family,
show the selected localized name without rewriting its record or progress; user-entered custom
family names remain visible. This is a copy refinement, not a storage/account migration.
