# D-002 candidate browser checkpoint

**Verdict: bounded checkpoint; final gate pending.** Exact-candidate automated checks passed in
Session A. D observed Arabic and English browser progression and separate access handoffs, with
the evidence limits below. The development reset overlay remains an open defect on this candidate.
This report does not pass physical Android, durable recovery, human review or demo readiness.

## Identity, ownership and evidence classes

- Candidate: `b862eb6f85321935d297a411aaa58744cf72f18b`, branch
  `redesign/qa-candidate-20260912`, worktree `/home/smyk/projects/Ghaf-qa-rehearsal`.
  The helper inspected that exact HEAD and clean Git status before this report was created.
- Grant: D-002-r9. D owns browser evidence and this checkpoint; helper
  `/root/rehearsal_packet_review` received this new report as its sole initial write boundary.
  Implementation, tests, dependencies, coordination and other reports remain outside that boundary.
- Lead configuration inspected earlier: `gpt-6-astra` / `xhigh` / `fast`; effective runtime
  reasoning/service tier is unexposed. Helper launcher selection: Astra / ultra; tier unexposed.
  A requested setting is not proof of the effective runtime setting.
- D browser: Firefox, Playwright MCP, `http://127.0.0.1:8097`, browser root PID 241247 and MCP
  parent 177703 in the lead's session record. Exact Firefox version is not in these raw captures.
  These are desktop browser viewports, not identified phones or Android builds.
- Corrected preview command: `expo start --web --port 8097 --clear`, through the existing npm web
  script. `metro-uncached.log` records the QA worktree, empty-cache rebuild and CI mode.
  React Native DevTools failed to launch because `libnss3.so` was unavailable; Metro still served.
- Evidence root below: `output/competition-readiness/d-b862eb6/` in the QA worktree. JSON files
  retain Playwright results, executed code when returned, page paths and console references.
  Raw artifacts are ignored local files; they are not bundled into this Markdown checkpoint.
- Classes: **A-run automated** means A executed and D inspected; **D browser** means actual
  pointer/keyboard actions with observed UI; **state observation** means read-only store sampling;
  **command probe** means direct invocation, not UI. Source and human evidence stay distinct.
- B-004 independent source review and labeled command/fault execution are recorded below.
  The report helper released its file; the lead reviewed and completed this checkpoint.

## A's checks on the exact integrated candidate

D inspected `/home/smyk/projects/Ghaf/output/competition-readiness/integration-b862eb6/results.json`
and `tests.log`; D did not rerun the full suite or inherit a historical candidate's result.

| Command run by A             | UTC interval, 2026-09-11        | Result                                  |
| ---------------------------- | ------------------------------- | --------------------------------------- |
| `npm run typecheck`          | 22:42:00.961693–22:42:14.133255 | PASSED, exit 0                          |
| `npm run lint`               | 22:42:14.133597–22:42:40.484237 | PASSED, exit 0                          |
| `npm run format:check`       | 22:42:40.484857–22:42:48.323537 | PASSED, exit 0                          |
| `npm test -- --maxWorkers=2` | 22:42:48.323880–22:43:21.796290 | PASSED, exit 0; 138 files / 1,669 tests |

These results precede this new report. They do not establish its formatting, an installed APK,
production behavior or physical-device acceptance. Matching log files remain beside `results.json`.

## Accepted browser observations

**Arabic setup and task.** `uncached-ar-setup-identity.json` records local `app/index.tsx` with the
temporary-Parent redirect and no foreign routes, Arabic first-run skip, synthetic Parent setup,
prepared Guide `make_clearer`, acceptance and task review showing 12 symbolic Seeds.
`uncached-ar-pair-assigned.json` records assignment, Child PIN entry, Parent-approved pairing and
Child Today. The task remains the safe canonical `task_recycling_p0_v1`, version 1.

`uncached-ar-parent-review.json` records actual Parent verification and review of the Child's
permitted-help submission. `uncached-ar-confirmation-growth.json` records submitted, visible
praise and recognized states. `uncached-ar-post-growth.json` records actual Garden, Circle,
private Reward and Child League navigation with their displayed outcomes. Praise and Garden
captures are `uncached-ar-praise.png` and `uncached-ar-growth.png`.

**Arabic trace limitation.** `uncached-ar-help-submit-review.json` contains a timeout waiting for
`welcome-parent-button`, not a successful Coach response transcript. Later review/state artifacts
substantiate permitted-help submission; the detailed uncached Arabic Coach action/response trace
remains for the lead to append. The earlier cached `ar-coach-tool.json` cannot fill that gap.

**English supported completion and retry.** `uncached-en-pair-assigned.json` records completing
pairing and Child Today. `uncached-en-coach.json` records prepared, fallible, current-task-bounded
steps, permitted adult help and optional media controls. `uncached-en-submit-review.json` records
Child submission, no early growth, separate Parent access and Parent review.
`uncached-en-retry-start.json`, `uncached-en-retry-sent.json` and `uncached-en-retry-resubmit.json`
record a support request, retry without deductions and a new permitted-help submission.
`uncached-en-confirmation-growth.json` records praise before recognition and Garden navigation;
`uncached-en-post-growth.json` records private Reward and Child League. English setup/Guide
continuation was reported by the lead; its successful uncached action trace remains to append,
because `uncached-reset-english-setup.json` preserves the reset-overlay failure rather than success.

**Media and truthful labels.** The English Coach capture displays prepared-image provenance,
optional participation and Parent visibility without other-household sharing. Parent review shows
the selected synthetic image. The unavailable prepared audio offers its transcript and continuing
without microphone permission. This proves the rendered fallback and disclosure, not recording,
audio playback, live inference or every privacy rejection case. Synthetic voice was permission-disabled.

| Separate authority                              | Submitted / praise visible      | After one recognition, AR and EN                    |
| ----------------------------------------------- | ------------------------------- | --------------------------------------------------- |
| Salem's displayed Seeds; Alya                   | 48; 36                          | 60; 36 unchanged                                    |
| Mangrove                                        | 48, shoot, next threshold 60    | 60, sapling, next threshold 120; UI milestone 60/60 |
| Cooperative canopy                              | 19/25                           | 20/25                                               |
| Green Circle                                    | 11/12 eligible actions          | 12/12; Arabic Circle UI also observed               |
| League canonical Leaf receipt                   | assigned; 0 receipts            | confirmed; 1 receipt; UI 5/5 and 100 points         |
| Private Family Reward                           | baseline 108, delta 0, promised | delta 12, unlocked; UI 120/120 eligible Seeds       |
| Lifetime ledger                                 | 108                             | 120; distinct from displayed 48→60                  |
| Recognition / reveal commitment / bundle counts | 0 / 0 / 0                       | 1 / 1 / 1                                           |

The snapshots in both confirmation files keep all eight independent R002b flags false before and
after recognition. Observing the internal lifetime ledger is not activation of gated Growth UI.
The Arabic `uncached-ar-post-growth.json` duplicate probe returns `already_confirmed` and unchanged
children, landscapes, household, Circle, League, Reward, Growth, recognition and reveal fields.
**PASSED — command probe only:** this is not repeated confirmation via pointer actions or a
durable exactly-once result across reload. The English retry snapshots retain the same baseline
authorities before and after requesting another attempt, then grant the accepted +12 once.

## A-004 remembered-Child entry and known progress loss

`uncached-a004-after-reload.json` observes `/child`, Arabic, Salem 48, Mangrove shoot/48, canopy 19,
Circle 11, Reward promised, lifetime 108, zero receipts and no current task. Compared with the
recognized snapshots, this records the known process-local task/progress loss; it is not recovery.
Feature 014 remains an unaccepted recovery draft and supplies no new implementation acceptance.

`uncached-a004-verdict.json` records actual Child-profile Parent entry to `/access/parent/sign-in`:
active experience signed out, Parent and Child authorization false, temporary-Parent marker true.
Cancel returns to the Child screen. Code `000000` produces the Arabic validation error; code
`424242` reaches Parent Home. The entry screenshot is `uncached-a004-parent-entry.png`.

**Pending trace gap:** the after-reload file's returned code only samples state.
`uncached-a004-reload-start.json` preserves an inspection error reading `s.journey.lifecycle`
when the journey is null; it does not independently retain the reload action/remembered-binding
hydration. The observed access branches are substantiated, but the lead must append its stronger
reload/remembering action trace before calling the complete decisive A-004 regression PASSED.

## Browser visual and accessibility scope

Arabic and English assignment captures sampled 390×844 and 320×844. Their respective pair-assigned
JSON records document root RTL/LTR and scroll widths equal to viewport widths. English retains
the Arabic profile name in its greeting, providing a mixed-script sample. Width equality alone
does not prove every label, focus target or directional icon is correct throughout the application.

`uncached-large-reduced.json` applies browser-only text stress and reduced-motion emulation.
`uncached-en-large-reduced.png` visibly shows enlarged, wrapped task controls at 320px; the recorded
main action is 240×130px and document width stays 320px. This is a sampled browser result, not OS
font scaling or a physical touch measurement. Unchanged state is not proof of native motion handling.

**Arabic 200% visual acceptance remains NOT RUN.** Initial inline styles reset during rendering.
`uncached-ar-large-stable.json` subsequently measures doubled CSS font sizes, but the associated
capture does not independently establish a settled 200% visual state. Do not use its filename or
`allDoubled: true` as that pass. `uncached-ar-assigned-actions-320.png` also captured the Child-space
transition screen rather than settled task actions. Fresh stable Arabic captures are pending the lead.

## Defects and preserved contrary evidence

**D-R01 — P1, preview identity, environment/cache; resolved for uncached retest.** The initial
preview loaded `../Ghaf-ui-studio/app/index.tsx` without the candidate's temporary-Parent redirect.
`preview-route-mismatch.json` preserves that observed route and source. All earlier behavioral
captures without the `uncached-` prefix are INVALID for this candidate and excluded from passes.
This is a preview provenance failure, not evidence of an app regression on `b862eb6`.
The lead stopped the initial preview/browser, restarted with `--clear`, and checked the corrected
identity in `uncached-ar-setup-identity.json`. `metro.log` and `metro-uncached.log` remain distinct.

**D-R02 — P2, development-browser reset overlay; OPEN on `b862eb6`.** Trigger: remembered Child
after reload → temporary Parent verification → Parent Settings → reset/confirm → browser Back
and English first-run/sign-up continuation. Expected: reset baseline and operable access controls.
Observed: unhandled `POP_TO_TOP`, followed by a development error overlay intercepting clicks on
the otherwise visible verification button. `uncached-reset-english-setup.json` records the pointer
interception; `uncached-reset-error-overlay.png` captures the overlay. The exact raw console is
`/home/smyk/projects/Ghaf/output/playwright/177671/console-2026-09-11T22-52-06-466Z.log`,
lines **20353–20357**, at 306117ms. It explicitly calls this development-only; neither a
production failure nor production success is established. A owns the correction; new-candidate
retest and final reset evidence remain pending. No fix was made by D or this helper.

Harness failures are preserved separately: unsuitable wrapper test IDs, duplicate hidden IDs,
wrong expected return routes and unsupported dynamic import are selector/evaluation failures,
not independently reproduced app defects. The null-journey read above is also a probe error.
The overlay's actual pointer interception is an application-development observation and must not
be erased as a selector problem. During report inspection, `python` was unavailable; the helper
used `python3` for JSON reads. No dependency installation or application test followed that lookup error.

## Acceptance matrix against D-001

These map to [D-001's acceptance matrix](d-baseline.md#draft-acceptance-matrix--not-an-executed-journey).
Each PASSED cell applies only to the stated evidence class/subset, never every case in a baseline row.

| Baseline IDs | Current result and class                                | Evidence / remaining acceptance                                                                                         |
| ------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| D-M01        | PASSED, A-run automated and D identity inspection       | Exact four checks above; APK/build identity BLOCKED                                                                     |
| D-M02, D-M17 | FAILED, development-browser reset continuation          | D-R02; final reset and broad meaningful-state reset matrix pending                                                      |
| D-M03, D-M06 | PASSED, sampled D browser access branches               | AR setup/pairing and A-004 entry/cancel/code outcomes; complete reload trace pending; wrong Child/expiry/revoke NOT RUN |
| D-M04        | PASSED, limited mixed-script observation                | EN greeting with Arabic name; renamed-profile/age-band matrix NOT RUN                                                   |
| D-M05        | PASSED, AR browser Guide acceptance/review/assignment   | Setup identity and pair-assigned files; EN successful Guide trace pending                                               |
| D-M07, D-M08 | PASSED, sampled supported completion and EN retry       | Both confirmation files; EN Coach/submission/retry files; AR detailed Coach trace pending                               |
| D-M09        | PASSED, praise-before-award and command-probe duplicate | UI/state snapshots; repeated UI confirmation and reload idempotency NOT RUN                                             |
| D-M10, D-M11 | PASSED, sampled UI/state authorities                    | Separate 48→60, Alya unchanged, canopy +1, Circle +1; wider private rejection matrix NOT RUN                            |
| D-M12        | PASSED, sampled confirmed Leaf and final League UI      | One receipt, 5/5, 100 points; fresh ties/extra-task/weekly-reset interaction checks NOT RUN                             |
| D-M13        | PASSED, sampled private promised→unlocked UI/state      | Eligible delta +12; given/prospective edits/prohibited provenance branches NOT RUN                                      |
| D-M14        | NOT RUN, new browser negative projection cases          | B review and broad privacy results require separate attribution, not inferred from shared UI                            |
| D-M15        | PASSED, EN prepared Coach/media fallback labels         | No live AI claim; full disconnected-browser journey and native offline launch NOT RUN                                   |
| D-M16        | PASSED, runtime flag snapshots                          | All eight false; gated release remains blocked                                                                          |
| D-M18, D-M19 | BLOCKED / NOT RUN                                       | Recovery 014 unaccepted; durable memory unselected; no recovery or memory pass                                          |
| D-M20        | PASSED, limited browser metrics/EN text stress          | AR/EN 320/390 samples; settled Arabic 200% evidence and broader visual checks pending                                   |
| D-M21, D-M22 | BLOCKED, primary and secondary native                   | No exact APK or independently executed physical-device records                                                          |
| D-M23, D-M24 | NOT RUN, rehearsal and human                            | Zero actual timed runs; student/reviewer identities and qualification remain unknown                                    |

Reuse [D-001's unexecuted device and student handoff](d-baseline.md#unexecuted-device-and-student-handoff)
for the next assigned native/human work. It carries no inherited pass. Both phones need independent
records; secondary text scaling, Back, persistence, touch, layout, installation, restart and reset
cannot inherit primary evidence. Ten actual 2–3 minute main runs are an internal target, not an
official ten-run rule. Missing hardware or human review does not prevent other granted checks.

## Assistance record and lead completion boundary

The helper used `ghaf-quality-workflow` for bounded artifact review and drafted only this report.
It read the exact candidate/artifacts and A's results, inspected three existing PNGs, and generated
no app code, tests, device observations, human answers or rehearsal runs. No commit or job was started.
The lead remains responsible for final commands, source-review attribution, new captures and verdict.

Earlier evidence-review prompt, received from the lead:

> New bounded D-002-r9 read-only evidence check, D quota1. Candidate /home/smyk/projects/Ghaf-qa-rehearsal b862eb6f85321935d297a411aaa58744cf72f18b. You are not alone; preserve all work. No writes/status/test/browser/jobs/descendants. Read ignored output/competition-readiness/d-b862eb6/uncached-ar-setup-identity.json, uncached-ar-confirmation-growth.json, uncached-ar-post-growth.json, uncached-a004-after-reload.json, uncached-a004-verdict.json. Concrete question: do actual artifacts substantiate AR canonical +12 separate authorities/no duplication, and decisive A-004 remembered-Child reload→Parent entry/cancel/invalid-code/valid-code while distinguishing known progress loss? Flag only unsupported claims/missing material evidence, not native/human gaps already explicit. Important: initial files WITHOUT uncached prefix loaded ../Ghaf-ui-studio/app/index.tsx from shared transform cache; they are preserved but INVALID for candidate, see preview-route-mismatch.json. Later --clear verified own app/index.tsx with redirect. Lead continues English actual UI and B replacement/visual checks and owns d-candidate.md. Return compact evidential verdict, exact file refs, no inference of full pass. Existing Astra/ultra launch selection; tier unexposed. Record this prompt/result in lead report.

Result: separate +12 authorities and access branch outcomes substantiated; duplicate is a direct
command probe; actual reload/remembering trace absent from those five files. No full pass was inferred.

Current report-writing prompt, received from the lead:

> Concrete report drafting task; D quota1 reserved. You are not alone and must preserve all changes. Sole initial write boundary transferred to you NOW: /home/smyk/projects/Ghaf-qa-rehearsal/docs/competition-readiness/workstreams/d-candidate.md only (new file, root has not written). No other writes, status/BOARD, tests, commits, browser, jobs, descendants. Candidate b862eb6 on redesign/qa-candidate-20260912. Draft a self-contained bounded QA checkpoint from actual ignored artifacts in output/competition-readiness/d-b862eb6/ and A result file /home/smyk/projects/Ghaf/output/competition-readiness/integration-b862eb6/results.json. Include actual exact candidate/tool/settings (lead config Astra/xhigh/fast; runtime unexposed; helper launch Astra/ultra tierunexposed), source/read-only B review attributed to pending root addition, full A checks138files1669tests exit0 (A ran, D inspected), actual uncached AR and EN core/Guide/help/submission/praise/growth/Garden/Reward/League, EN retry no loss + preparedimage privacy/audio transcript fallback, all8 flags false; initial mixed-route evidence WITHOUT uncached excluded, --clear identity corrected. D-R01 P1 preview identity environment/cache resolved, D-R02 P2 development reset warning POP_TO_TOP that intercepts clicks OPEN on b862eb6, A fixing, no production/native assumption. Exact raw console /home/smyk/projects/Ghaf/output/playwright/177671/console-2026-09-11T22-52-06-466Z.log lines20353–20357 and uncached-reset-error-overlay.png. Preserve harness failures (wrapper IDs, duplicate hiddenID, wrong returnroute expectations, unsupported dynamicimport) distinct from app. Your earlier reload evidence gap remains pending root stronger trace; B command and final reset/AR large-text captures pending. Do NOT claim Arabic 200% visual pass: first inline styles reset, later CSS measured2x but screenshot transient/blank; root completing final stable capture. English large text and AR/EN320/390 compact evidence exist, browser notphones. Native/build/human/qualification/rehearsals gates absent (0 real runs), recovery014 unaccepted and process-local taskloss known. Include compact matrix mapped to D-M baseline IDs with exact evidence classes, gaps and integration status 'bounded checkpoint; final gate pending'. Reuse existing d-baseline.md native/Q&A handoff by explicit link, no inheritedpasses. Document this actual prompt/contribution and your earlier evidence-review prompt if available; root appends other exact helper prompts and completion. Do not format whole repo or commit; release this file explicitly when drafted (~150–230 lines preferred). Root continues disjoint browser artifacts/B/A004, won't edit report until your release.

Draft contribution: this evidence-classified checkpoint, authority table, open-defect record and
matrix. Unsupported full-journey, Arabic 200%, duplicate-UI and reload-provenance conclusions were
withheld. The lead will append other actual helper prompts, final trace evidence and completion.
This draft's integration status remains **bounded checkpoint; final gate pending**.

## B-004 independent replacement verification

**PASSED — source review and separate command/fault probe, not a UI journey.** Helper
`/root/privacy_matrix_review` inspected candidate b862eb6 and integrated B-004 f38f21d read-only.
The six added store lines construct a fresh private League with the new Growth epoch and publish
it with an empty approval/reveal commitment map only in the successful replacement branch.
Cancellation and failed save must retain the original authorities. The helper found no material
regression in that bounded diff or its tests; it did not execute tests or establish late rollback.

D executed `b004-command-probe.js`; full result is `uncached-b004-command-probe-result.json`.
Precondition was the recognized English UI journey. The script invoked normal store commands,
with one explicitly injected synchronous local-family save failure restored in `finally`.
It did not call `setState`, simulate user clicks or claim an ordinary replacement UI journey.

- Cancelled replacement: directory and all sampled authorities unchanged.
- Failed replacement: injected `INVALID_TRANSITION`, one save call; directory and all authorities
  unchanged. This is one failure seam, not every interrupted-write or rollback case.
- Successful replacement: epoch `prototype-reset-0001`→`0002`; League uses the new Growth epoch;
  recognition receipts, League receipts, approval/reveal commitments and bundles all clear.
  Seeds reset to 48, Leaf returns to 4/5 and 80, Mangrove 48, canopy 19, Circle 11,
  private Reward promised with 108 eligible baseline, lifetime ledger 108.
- New-family task commands then perform approval, pairing, supported completion, Parent praise
  and recognition. One accepted event yields Seeds 60, Leaf 5/5 and 100, Mangrove 60, canopy 20,
  Circle 12, Reward unlocked at 120 and lifetime 120. Each receipt/commitment/bundle count is one.
- A fresh action ID repeating recognition returns `already_confirmed`; every sampled authority
  remains unchanged. Alya's separate fixture balance remains 36.

The first filename invocation was refused because the MCP tool could not read the QA worktree
path. `uncached-b004-command-probe.json` preserves that harness failure; no command ran then.
An identical script copied to D's owned MCP output directory executed the successful probe.
These results close the B-004 bounded command oracle, not durable recovery, all privacy cases
or a second full browser journey. No product source or dependency was modified.

Actual bounded helper prompt:

> D-002-r9 one read-only helper allocation. Exact candidate /home/smyk/projects/Ghaf-qa-rehearsal HEAD b862eb6f85321935d297a411aaa58744cf72f18b (branch redesign/qa-candidate-20260912). You are not alone in the codebase; preserve every other writer's work. No writes, lead status, tests, browser, jobs, descendants. Question: independently review integrated B-004 f38f21d family replacement diff/tests for correctness of privateLeague and approvalRevealCommitments reset, cancellation/failed-save preservation, and recognized→new-family recognition/duplicate flow. Return only material regression concerns with exact references and a small before/after oracle for a separately labeled browser command probe. D lead continues actual role/core/card browser verification and A already ran the full candidate suite. Actual launch selection Astra/ultra; effective tier unexposed.

Contribution: source/test reasoning and the replacement oracle. The lead executed the separate
probe and reviewed its results. Suggestions to infer full privacy, durable recovery, native or
ordinary UI replacement acceptance were not adopted. No student or human review occurred.

## Checkpoint release and next exact candidate

This checkpoint preserves b862eb6 failures and limited passes. A published correction
`b2208aaaf06ec16d7fb12cc0781aeaba754a7eff` under D-004-r13 for the narrow reset retest.
After this report's scoped format/diff check and commit, D will create the authorized clean
`redesign/qa-reset-20260912` branch at that candidate, preserve this branch, carry only this
report commit, restart the owned preview with `--clear` and verify loaded source identity.
The stronger remembered-Child reload trace and root-only/dismissible/repeated reset checks
remain pending that correction retest. No release activation or complete readiness is claimed.
