# Parent entry without a local verification-code step

User request: “remove this step: أدخل رمز التحقق from the login process”.

Implemented under committed Feature015 amendment56c9063; runtime42eb809. Workspace
/home/smyk/projects/Ghaf, branch redesign/ui-experiments. This supersedes the prior chooser report's
retained verification step for new-family creation, replacement and legacy profile repair.

## Result and file boundaries

- app/access/parent/sign-in.tsx opens repair details directly; the existing saved/demo account
  still opens Parent Home with one selection and no email, password or code.
- app/access/parent/sign-up.tsx keeps the existing new-family details form and identifier validation.
  Continue stages local setup and opens family-basics directly, including offline-preview mode.
- app/access/parent/verification.tsx is now a redirect-only compatibility route. Direct query strings
  create no authority. Stale OTP state is cancelled; valid staged setup resumes its details.
- app/access/parent/family-basics.tsx receives the existing optional Remember checkbox, unchecked
  by default; temporary Child-device access shows its existing notice instead.
- src/features/access/parentOnboarding/controller.ts adds local staging with no OTP call/session/save.
  The legacy internal status name verified means setup-ready here, never real identity proof.
- src/state/usePrototypeStore.ts exposes transactional local setup/repair commands with ordinary-mode,
  signed-out, authoritative-storage and interruption guards. Replacement still saves only at the
  existing final action; cancellation restores the old family. Locale, Child affinity, task and
  progression authorities are preserved. Profile repair uses the stored candidate identifier only.
- src/i18n/resources.ts updates setup/repair/remember wording in both languages. Legacy unused OTP
  resource keys/domain APIs remain for compatibility; no local Parent route renders their form.

Seven helper domain tests and thirteen rendered route/account cases were added. Existing source
expectations in access, platform and presentation tests were updated only where the accepted
amendment superseded OTP rendering or automatic verified entry. No packages, flags, assets, original
Welcome/onboarding, Child PIN, messaging authentication or shared task behavior were changed.

## Validation

Evidence directory: **/home/smyk/projects/Ghaf/output/competition-readiness/parent-no-code-20260913/**.
Machine-readable checks.json, source-receipt.json and browser.json record source and results.

| Check | Status | Evidence / limitation |
| --- | --- | --- |
| Full TypeScript | PASSED | typecheck.log; runtime unchanged afterward |
| Full lint | PASSED | lint.log; corrected-test lint also passed |
| Full formatting | PASSED | format.log; four later test files formatted without changes |
| Initial full suite | FAILED | tests-initial.log: 2110 passed, four obsolete OTP source assertions failed; all new behavior tests passed |
| Corrected affected suite | PASSED | corrected-tests.log: 44 tests, four files, maxWorkers1; all observed failures resolved, full suite not repeated |
| Fresh local setup / final completion | PASSED | local-parent-setup tests: no OTP/session/save while staging; final explicit completion remains required |
| Replacement / cancel / failure rollback | PASSED | same tests plus existing replacement/returning-family suite; old bytes, receipt and progression retained until final replacement |
| Profile repair / stale callback / Child isolation | PASSED | authoritative-candidate, temporary Child-return and late verification-callback tests; synthetic domain evidence |
| AR actual browser | PASSED | Firefox155 Linux, 390×844: original Skip → Welcome Parent → Create → identifier → details without OTP; Back → demo account → Home |
| EN actual browser | PASSED | 320×740: sign out, language switch, replacement setup via Enter → details, cancel → saved account retained |
| Retired verification link | PASSED | actual browser query flow=create-family returns to chooser with zero OTP inputs and zero Parent Home screens |
| Remember control | PASSED | unchecked accessible checkbox in both locales; AR350×102, EN280×96 CSS pixels, readable complete label and scrollable next action |
| Native / named human Arabic review | NOT RUN | No physical Android Back, TalkBack, native keyboard/font scaling, device or human acceptance inferred |
| Real hosted messaging | BLOCKED | User confirmed no Supabase project exists; unrelated real Auth remains separate |

Screenshots: family-details-ar-390.png, remember-choice-ar-390.png,
family-details-en-320.png and retired-link-chooser-en-320.png. Captures follow section-overlay
retirement; lead visually inspected Arabic and English checkbox/action captures. English showed no
horizontal overflow. Profile repair and final replacement were covered by domain/rendered checks,
not a full manual browser completion or physical-device run.

The full test command unintentionally used default workers (15 observed). The lead stopped its own
wrapper to bound the pool, but the pool had already completed. Its output establishes failures;
the wrapper did not capture an exit code, so checks.json leaves it null. Only the four affected
files were retested afterward with maxWorkers1. No other session's job was interrupted.

Browser console includes existing expo-file-system web/deprecated-pointerEvents warnings and an
ambient-audio media-sink decode warning; no audio conclusion or fix is included in this change.
Browser/check/helper allocations closed; existing user Metro62701 on8082 preserved. Other sessions'
narration, original-entry and status edits were not staged. Final-status.txt records their boundary.

## Assistance and review

Lead applied the previously read local Spec Kit, Expo design-system and Impeccable guidance.
One helper, messaging_seams, owned only the controller staging method, two store actions and seven
domain tests after the contract commit. Lead owned routes, resources, presentation/route tests,
formatting, validation, evidence and commits. No descendants or helper jobs ran.

The helper assignment was: implement local setup/repair staging without OTP, preserve transaction
rollback, replacement intent, current locale and temporary Child return; derive repair identity
from authoritative storage, retain new-family identifier validation, and add focused tests. This
paragraph summarizes the assignment; the literal latest user prompt is recorded above.

Observed lead configuration from workspace reconciliation: GPT-6 Astra, xhigh, Fast; effective
runtime settings are unexposed. Helper was originally requested as Astra/Ultra; effective service
tier is unexposed. No settings change was made. Human exact-diff acceptance is pending.

Rejected: auto-submitting a fake code, giving stale links Parent authority, skipping final family
replacement consent, silently remembering Parent, using a demo marker for real messaging, changing
Child PIN, or adding another family/account system. Boundary is ready for local integration;
physical Android and human review remain separate gates.
