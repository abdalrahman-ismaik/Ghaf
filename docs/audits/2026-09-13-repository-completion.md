# Repository completion review — 2026-09-13

## Scope and starting state

Review approved Features 003–005 for unfinished implementation, ordinary runtime
defects, and gaps in regression coverage. Preserve all existing uncommitted
maintainer, configured-age and static-web hydration changes. No dependency,
fixture, default flag, provider, recording, deployment or release change is part
of this review.

The starting integrated worktree passed typecheck, lint, formatting and all
**1,699 tests across 130 files**. Exact baseline commands and output are retained
in ignored `.expo/repository-completion/`; `baseline-results.json` records four
zero exit codes. These checks ran sequentially to avoid cold-start resource
contention. They establish local behavior, not native or provider acceptance.

## Unfinished work inventory

- Feature 004 T001–T091 and Feature 005 T001–T032 are implemented and checked.
- Feature 003's six unchecked historical RED records
  T038/T046/T052/T058/T064/T073 cannot be supplied retroactively.
- Feature 003 T154–T158 are explicitly superseded historical work.
- T080, T086, T218 and T245 still require accessibility, responsive presentation,
  native, content/rights, rehearsal or named-human evidence. No flag is enabled
  merely to close one of these task rows.
- The user explicitly approved confirmed local recovery for the prior audit's
  R-02 dead end: rejected local data prevented the Parent sign-in required by reset.
  Feature 003 FR-220–224 and Feature 005 compatibility amendments now authorize
  the narrow signed-out recovery path described below.
- Runtime TODO/FIXME and skipped/todo/focused test searches found no actionable
  unfinished marker. This does not establish that every possible defect is absent.

## Confirmed fixes

### Onboarding audio follows visible foreground presentation

Onboarding mounted underneath the opaque startup splash and began narration when
its image and short settle timer completed. The first sentence could therefore
play before its transcript was visible. Root startup completion now reaches the
onboarding context and gates both prepared audio players.

The same readiness gate includes route focus and the existing React Native
AppState foreground signal. React Native Web maps that signal to document
visibility. Losing focus or foreground pauses both players and invalidates pending
playback; screen-reader suppression and explicit web-gesture recovery are preserved.
No recording, background audio mode, provider or new dependency is introduced.

Finally, the onboarding illustration is keyed by artwork. Returning to an image
that previously failed now gets a fresh load/error settlement, so the local fallback
can become ready and narration/replay is no longer stuck on another slide's image.

All seven new behavioral cases failed before the repair, then passed with the
existing first-run, playback cancellation and hydration suites: 4 files / 31 tests.
Independent review also reran those tests, typecheck, scoped zero-warning ESLint,
formatting and whitespace checks successfully. The test harness executes the actual
root/context/component/hooks with mocked native players, focus and AppState; it
does not establish browser autoplay, physical audio focus or TalkBack acceptance.

### League setup after an encouragement

`DeterministicFamilyLeagueService.createWeek` previously refused to fill an empty
rolled week after a Child sent a permitted prepared encouragement. Week creation
now retains that ledger and validates the complete proposed week before consuming
the Parent proof or storing it. Valid retained or expanded membership can receive
its five-Leaf plans. Incompatible membership remains rejected without dropping
messages or consuming the proof. Assigned/confirmed weeks remain nonreplaceable.

The new ordinary rollover → encouragement → Parent setup regression failed before
the repair (1 failed / 16 passed) and passed afterward (17 passed). It also checks
unchanged zero scores, preserved/idempotent encouragements, incompatible membership
rejection and retry with the same unused proof. Independent read-only review found
no material issue. The deterministic League service remains separate from R002b's
main recognition authority.

### Parent Progress suggestions match the editor

The Parent Progress selector offered the single recycling task after recognition,
although its Task Builder route redirected completed work to Tasks. It also hid
the suggestion while a draft or reviewed task could still be edited. The selector
now offers it only before assignment, matching the existing route's absent/draft/
reviewed states. Selected-sibling and noncanonical-task behavior remain unchanged;
this adds no repeat-task capability.

Three regression cases failed before the fix, then all 15 focused cases and
45 cases across five Parent Progress suites passed. The normal confirmation
regression separately verifies lifetime Seeds of 120 and the existing 60-Seed
presentation, with no mutation of recognition or Growth ledgers when reading
progress. An unsafe test-array access found by typecheck was corrected. Independent
read-only review found no blocking issue.

### Evidence reconciliation

Feature 004's task ledger now appends the later September 12 configured-age browser
verification and hydration repair. It preserves the earlier blocked browser attempt
and all native/provider/human limits instead of presenting that historical blocker
as the latest status. The evidence is attributed to the existing dated audit, not
claimed as a new browser run.

### Confirmed local recovery

Welcome now presents bilingual recovery before first-run onboarding when the saved
family cannot be loaded. Only positively identified corrupt data exposes the reset
proposal and separate confirmation. Storage or migration failures offer a
non-destructive Retry. Cancel and Back leave saved data intact.

The signed-out command requires explicit confirmation and a fresh corruption read
before deleting anything. Valid, absent, externally repaired or unreadable data
cannot authorize deletion. It removes and verifies remembered device affinity,
then legacy family data, then current family data. Partial failures remain
retryable; private in-memory confirmation context can finish a previously confirmed
clear only after verifying that no replacement family or remembered affinity exists.
Ordinary reset retains its Parent authority guard.

Successful recovery uses the shared deterministic reset, releases existing access
and voice authority, replaces navigation history and returns to Arabic signed-out
Welcome. Normal Parent setup is required again. No production authentication or
remote recovery is implied.

## Verification checkpoints

Before the recovery amendment, the integrated worktree passed typecheck, lint,
formatting, whitespace and **1,716 tests across 131 files**. Web export passed with
39 routes. Android's first sandbox attempt could not execute the installed Hermes
compiler; the approved execution retry passed and produced a Hermes bundle. These
are compilation checks, not physical-device acceptance.

Final recovery integration passed all checks:

| Check                                                     | Result  | Evidence                                                              |
| --------------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| TypeScript, ESLint, Prettier, whitespace                  | PASSED  | `recovery-final-results.json`, all five command exit codes zero       |
| Full regression suite                                     | PASSED  | 1,768 tests / 133 files; `recovery-final-tests.log`                   |
| Web export                                                | PASSED  | 39 routes; `recovery-web-export.log`                                  |
| Android Hermes export                                     | PASSED  | One bundle; `recovery-android-export-retry.log`                       |
| Independent recovery review                               | PASSED  | Final 6-file / 119-test reviewer run, static checks and source review |
| Physical Android, TalkBack, native media                  | NOT RUN | No physical-device session in this review                             |
| Named Arabic/content review, external provider acceptance | NOT RUN | Existing release gates remain authoritative                           |

All command logs above are in ignored `.expo/repository-completion/`. The updated
Android export initially hit the same sandbox compiler-execution denial; the
approved retry passed. No package download or dependency change was required.

The core writer passed 35 recovery cases and a six-file / 120-test related batch.
The UI writer passed 17 recovery cases and 36 cases with localization/onboarding
regressions. Independent review found and corrected a cold-start Retry issue: a
valid repaired family now skips the intro and restores normal access, while an
absent family retains onboarding. Its regression failed before the correction.
Coverage includes strict confirmation, fresh corruption checks, replacement data,
storage/migration failures, ordered deletion and verification failures, partial
clear continuation, authority teardown, exact deterministic state, and fresh setup.

## Interactive recovery evidence

The exported default web build was served only at `127.0.0.1:8094`. An ignored
fixture page first verified that the three repository keys were absent, then
created disposable malformed synthetic records through an explicit UI action.
No pre-existing family data was overwritten or cleared.

- PASSED: Arabic recovery appears before first-run presentation on corrupt startup.
- PASSED: proposal requires a separate confirmation; Cancel and header Back return
  to recovery. Reopening the fixture inspector showed all three keys still present.
- PASSED: corrupt Retry remains recoverable and shows localized generic failure.
- PASSED: Arabic/English long confirmation copy, controls and mirrored Back are
  readable. Browser scaling was accounted for using DOM measurements; at actual
  320×720 CSS pixels both languages had `scrollWidth === clientWidth === 320`, with
  confirmation visible inside the viewport. Earlier larger-width captures were
  also inspected but are not labeled canonical 390-pixel evidence.
- PASSED: confirming from English returns directly to Arabic signed-out Welcome.
  The fixture inspector showed affinity, legacy and current family keys all absent.
- PASSED: a clean reload remains signed out; skipping the normal intro and choosing
  Parent → Create a new family opens normal setup without granting a role.

These observations and screenshots are in the browser tool transcript; no saved
PNG artifact is claimed. One test tab lost its debugger connection and was replaced
with a fresh tab on the same isolated origin. Viewport overrides were reset and
the preview server stopped after verification. Physical Back/focus/TalkBack remains
unverified; Node UI tests simulate those events and do not replace native evidence.

## Changed boundaries and handoff

- Onboarding: `app/_layout.tsx` presentation-ready prop only;
  `src/components/onboarding/{FirstRunExperienceContext,FirstRunOnboarding}.tsx`;
  new `useOnboardingForeground.ts`; `tests/r003-first-run-experience.test.ts` and
  new `tests/onboarding-presentation-readiness.test.tsx`.
- League: `src/services/mock/index.ts` week creation and `tests/family-league.test.ts`.
- Parent Progress: `src/features/growth/parentProgress.ts` and its existing test.
- Recovery core: `src/models/localFamily.ts`, both local repositories,
  `src/state/usePrototypeStore.ts` recovery/reset sections and new
  `tests/corrupt-local-family-recovery.test.ts`.
- Recovery UI: `app/index.tsx`, new
  `src/components/access/LocalFamilyRecovery.tsx`, additive `src/i18n/resources.ts`
  copy and new `tests/local-family-recovery-ui.test.tsx`.
- Contract/evidence: Feature 003/005 spec, plan and task amendments; Feature 004
  later-evidence addendum; PRODUCT, DESIGN, DESIGN_DIRECTION, PROTOTYPE_LIMITATIONS,
  DEMO_RUNBOOK, TEAM_OWNERSHIP and this audit.

The implemented boundaries are ready for local integration with the preserved
maintainer/age/hydration work. R-02 is resolved by the explicit owner decision and
verified recovery. Remaining historical RED records, native/human/content gates
and provider acceptance are not falsely marked complete. No release activation,
production account recovery, real Child media processing or deployment is claimed.

## Local checkpoints

- `3cd3885`: League rollover preserves prepared encouragements.
- `ffce9bd`: Parent Progress suggestions match editable task states.
- `e4f4c30`: Onboarding prepared audio follows visible foreground content.
- `4aa3303`: Confirmed corrupt local recovery, bilingual UI, tests and contract.

Shared files were staged by bounded patches. Existing configured-age, live-voice,
hydration and historical documentation changes remain unstaged. Recovery includes
the prior legacy-first clearing prerequisite in its repository hunk because the
verified recovery contract depends on that order; the existing repository test
changes remain untouched. The final tests/export/browser evidence describes the
complete integrated worktree, not a claim that every earlier change is committed.
No push, merge, deployment or history rewrite was performed.
