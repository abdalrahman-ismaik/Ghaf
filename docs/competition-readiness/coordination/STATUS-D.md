# Session D status — Independent QA and rehearsal

**Sole live writer: Session D lead.** Canonical location only. D registered against active board revision 2, grant D-001-r1. Prior preactivation observations below remain historical. No prior active D instance was recorded when inspected. A alone stages coordination records.

## Current snapshot

| Field | Value |
| --- | --- |
| State | D-005 COMPLETE; report/jobs/helpers RELEASED; status-write PAUSED for A-026 checkpoint |
| Instance / human owner | D-20260911T2218Z-p177313 / actual human owner pending |
| Last actual update UTC | 2026-09-11T23:31:33+00:00 |
| Worktree / branch / HEAD | `/home/smyk/projects/Ghaf-qa-rehearsal` / `redesign/qa-reset-20260912` / `93a98c0296486b185ac96b7113cae90d9bef7b61` |
| Exact runtime source | `7fff0f3c2dc0e802ba1da6a67cd2513a75824809`; app/src/tests/config/package diff empty |
| Board revision / task | 19 ACTIVE; D-005-r17 finished; ACK A-034 through A-037 |
| Contract | Existing 003/005/008/013; 014 unaccepted/unimplemented; no memory or new provider selected |
| Held paths | No completed source/report/evidence boundary held; STATUS-D sole-writer identity retained but writes paused |
| Released paths | `docs/competition-readiness/workstreams/d-candidate.md`; ignored `output/competition-readiness/d-{b862eb6,b2208aa,7fff0f3}/**`; preview lane and helper allocation |
| Current verdict | D-R02 closed for tested browser scope; three successive UI reset cycles; A four checks pass 138 files / 1,677 tests |
| Remaining gaps | P3 Arabic CSS 200% secondary clipping; broader matrix unrun; no APK/devices/native/human acceptance; 0 timed rehearsals; qualification unknown |
| Next action | A integrates report-only sequence below and stages paused coordination; D resumes only on next exact eligible grant or real APK/device availability |
| Settings | Lead config gpt-6-astra / xhigh / fast; actual runtime reasoning/tier unexposed, Ultra not verified. Helpers explicitly launched Astra/ultra; tier unexposed. No config changed |

## Helpers and local jobs

**CURRENT: zero D helpers, descendants, command jobs, Metro or browser.**
`/root/rehearsal_packet_review` completed final read-only artifact audit, accepted narrow reset
closure and explicitly released. `/root/privacy_matrix_review` released its source review and
verbatim prompt retrieval; no jobs or descendants. No helper wrote lead status or product source.

Final preview: Metro278873 / exec66015 stopped by Ctrl-C, exit130; Firefox279164 closed with
owned browser_close. Fresh PID check found both absent. MCP service177703 existed independently
and is preserved, as is ADB daemon136846. Source/check commands complete. No D full suite, build,
export or install. Shared node_modules symlink remains ignored/read-only. A alone ran full checks.

Historical preview jobs were also stopped: initial230277/231443, uncached241063/241247 and
258963/259258. Artifact directories preserve invalid initial mixed-worktree evidence and the
successful uncached candidates. Raw MCP output stays under canonical output/playwright/177671.
No active process or test slot is retained from those historical sections.

## Completed slices and evidence

**Completed D-001**: commit `f95c57d54b4c8202b36b188f0f38b8a494518fd7`, base 02b9618, only
`docs/competition-readiness/workstreams/d-baseline.md` (294 lines). Prettier, 17 explicit local path
checks, staged whitespace/exact-file review and commit all exit 0. Report and helper allocations
released; ready for source-audit integration, not runtime/native/human acceptance. Durable report
includes helper corrections and supersedes the draft matrix copied below. QA worktree remaining
dirt: `?? node_modules` (A-created symlink, preserved). No source changes, app suites or browser run.

Historical startup command observations:

- `git status --short`, branch, HEAD, and `git worktree list --porcelain`: exit 0; only main Ghaf
  checkout and historical R002 reconciliation worktree exist. Initial untracked user material:
  `docs/SMAC 2026/` (preserved).
- Attempted command in `/home/smyk/projects/Ghaf-qa-rehearsal`: process could not start because the
  directory is absent; no shell exit code exists for that attempt.
- `node --version`, `npm --version`, `git --version`, `python3 --version`: exit 0;
  v24.16.0, 11.13.0, 2.43.0, 3.12.3 respectively.
- `adb devices -l`: exit 0 at 2026-09-11 22:18 UTC, empty device list. Physical model/OS/build,
  installation and native execution remain unknown, not inferred from browser sizes.

## Findings and decisions needed

- D-ORIENT-01 — coordination blocker, observed on `02b9618`: BOARD revision 0 is NOT STARTED,
  D-001 remains PROPOSED, no candidate/path/resource grant, expected QA worktree absent. Owner A.
  Reproduce by reading canonical BOARD and `git worktree list --porcelain`; current run cannot
  claim tests or source ownership on the basis of initial templates.
- D-ORIENT-02 — physical acceptance BLOCKED: fresh empty ADB inventory, not a native pass.
  Owner A/operator; provide exact APK/commit and connected primary/secondary devices for execution.
- Historical `qa-report.md` describes reload loss at `55f9f2b` and profile/bidi retest at `236bbae`.
  These remain attributed historical observations, not fresh candidate passes or newly reproduced
  D defects. D is tracing the current process-local boundary read-only.

## Outbox

1. **D-20260911T2218Z-p177313-001** — To A; type STARTUP/GRANT REQUEST; proposed D-001.
   Board 0 has no live candidate; QA worktree is absent. Please activate the board and publish
   exact D baseline hash, worktree, acceptance scope, durable evidence paths (proposed
   `docs/competition-readiness/workstreams/d-baseline.md`), helper quota and heavy/browser slots.
   D continues read-only audit in the canonical checkout and has started no resource jobs.
   This is a coordination request, not a new user permission round. Status: acknowledged by A-DEC-001, board revision 1.
2. **D-20260911T2218Z-p177313-002** — To A; type NATIVE GAP; proposed D-003.
   Fresh `adb devices -l` exit 0 is empty. No primary/secondary identity or rehearsal evidence
   exists in this run. Keep hardware/qualification/named human gates pending while other
   authorized verification continues. Status: acknowledged by A-DEC-002.

3. **D-20260911T2218Z-p177313-003** — To A; type BASELINE CHECKPOINT; proposed D-001.
   Read-only audit and draft D-M01–D-M24 matrix are below. Runtime/test/config source matches
   historical `236bbae` within the explicit compared paths, but no fresh suite/browser pass or
   native result is claimed. Installed dependency subset matches lockfile. No APK found in the
   stated inventory scope. Grant a durable report path to preserve this beyond live coordination.
   Status: unacknowledged.
4. **D-20260911T2218Z-p177313-004** — To A and B; type CONTRACT CHALLENGE; proposed A-002/B-002.
   Trace confirms fixture initialization is separate from directory/access restoration. Select
   exactly what is durable across pre-assignment/acceptance/help/submission/confirmation/growth/reset.
   Include late-clear failure, coherent recovery, family generation and stale asynchronous work.
   These are source-derived unexecuted challenges, not newly reproduced regression defects.
   Source references and matrix D-M17/D-M18 are below. Status: unacknowledged.
5. **D-20260911T2218Z-p177313-005** — To A; type RATIONALE CONTRACT INPUT; proposed A-002/B-003.
   Actual profile recommendation implementation includes bounded custom keyword signals, covered
   by the later required-profile amendment/checklist. Select that current input contract along
   with the older curated-profile text before testing new rationale. No new generalized/live
   recommendation or memory is accepted by the board. Status: unacknowledged.

6. **D-20260911T2218Z-p177313-006** — To A; type GRANT ACK / NEXT-RESOURCE REQUEST.
   ACK D-001-r1 at board revision 2; QA worktree clean at 02b9618. D lead now holds only
   `docs/competition-readiness/workstreams/d-baseline.md`; live read-only helper
   `/root/privacy_matrix_review`, Astra/ultra launcher selection, one quota slot, no descendants.
   After A-004 candidate publication, please grant D-002 exact candidate/worktree synchronization,
   durable retest path, and the Metro/browser slot for independent real handoff/regression actions.
   Prefer A's full candidate suites once with logs, then D's changed-boundary browser retest;
   no duplicate full suite requested. D report production continues. Status: unacknowledged.

7. **D-20260911T2218Z-p177313-007** — To A; type D-001 HANDOFF / EXPLICIT RELEASE.
   Commit `f95c57d54b4c8202b36b188f0f38b8a494518fd7` on redesign/qa-rehearsal, base 02b9618;
   only `docs/competition-readiness/workstreams/d-baseline.md`, now RELEASED for A integration.
   Report includes 24 evidence-classed acceptance rows, known/process-local vs proposed cases,
   device scripts, Q&A and actual bounded helper prompts/contributions. Two sequential helpers
   finished; D has zero live helpers/jobs. Prettier/path/staged whitespace checks PASSED (exit 0).
   Source-audit ready; app/browser/native/human results remain NOT RUN/BLOCKED. Keep packet's
   internal lifetime projection with flags off distinct from gated presentation. Awaiting exact
   next candidate plus D-002 retest/output grants requested in message 006. Status: unacknowledged.

8. **D-20260911T2218Z-p177313-008** — To A; type EARLY DRAFT REVIEW (not implementation defect).
   ACK A-008; reviewing 014 spec SHA-256
   `84750776fbc37e985b477c853e7160f6bfba34323ae3029536b92ac7096bc067` at canonical HEAD
   `233df14a21d3250e293118e06c8ef1ae1ff92980`. Plan is still a template; no incompleteness defect
   is claimed. Two source-independent acceptance clarifications for your plan/spec:
   (a) distinguish latest durable commit from last UI-acknowledged state when process death occurs
   after evidence write but before success rendering; restore that committed receipt statically,
   never re-award or roll it back; (b) distinguish a new generation with no saved task from a
   missing record referenced by known committed evidence/revision. The latter should be invalid/
   retryable, not silently treated as the initial empty task (current Edge Cases says missing
   evidence on a valid family means no saved task). Helper separately reviews minimum private
   facts/accepted variants. Report re-held only for this granted appendix. Status: unacknowledged.

9. **D-20260911T2218Z-p177313-009** — To A; type 014 DRAFT PRIVACY/VARIANT REVIEW.
   Same stable spec snapshot as 008. Helper `/root/privacy_matrix_review` completed (read-only,
   no jobs/descendants) with three accepted draft clarifications: FR-004 needs a closed evidence
   allowlist and omitted-content restoration rules; current full Journey contains media/reflection/
   help text and custom praise, which cannot simply be serialized. SC-002 must scope FR-008's
   +12 and secondary counters to canonical @1: existing smaller @2 earns +8, safe-equivalent @2
   +12, and neither automatically gets canonical League/Reward eligibility. Story 1/FR-001 must
   name pending pre-acceptance `parent_review_required` and `child_decision_required`; recovery
   must preserve remaining decisions, not auto-accept a proposal. Exact refs/IDs in report appendix
   being committed; no implementation defect reproduced. Reject assumption that help explanation
   text is needed to retain permitted-help credit. Status: unacknowledged.

10. **D-20260911T2218Z-p177313-010** — To A; type DRAFT REVIEW COMMIT / RELEASE.
    Commit `c56141b9612ddd189c9cc647a9a54ec88463a113`, parent f95c57d, app source still 02b9618;
    only d-baseline.md appendix, now RELEASED. Five draft clarifications D-014-01..05 are tied
    to exact unchanged spec SHA 84750776…; plan was an unfilled template and not judged complete.
    Scoped Prettier, staged exact-file and whitespace checks PASSED; no runtime test claimed.
    Privacy helper follow-up finished and released; D has zero helpers/jobs. Continue review of
    revised complete draft when available, and actual router/full journey on released candidate
    after C preview release. D does not require a new routine user permission. Status: unacknowledged.

11. **D-20260911T2218Z-p177313-011** — To A; type FULL DRAFT FOLLOW-UP at board r6.
    Reviewed full 014 plan/data-model/contract/tasks. D-014-01/02 are ADDRESSED in spec
    `9f7fc55c…`, plan `b17abcc3…`: durable commit precedes visible acknowledgment; explicit
    empty/journey discriminant rejects missing referenced evidence. D-014-03/04/05 from 009
    remain OPEN in the reviewed snapshot (closed fact allowlist/praise handling, variant-specific
    deltas/eligibility, pending negotiation substates).
    New P1 D-014-06: reset removes the envelope before clearing other keys. On process death
    between those operations, how does startup distinguish a fresh installation from cleanup
    pending, and prevent old saved templates/preferences/affinity from reaching a new family?
    Define durable tombstone OR mandatory orphan cleanup while family absent, including failure
    and retry authority without minting a Parent role. Current missing-envelope rule invalidates
    progress but does not itself establish the claimed cleanup_pending state. Add a crash-after-
    remove/before-secondary-clear then restart/new-family test.
    Small path correction D-014-07: tasks T006 names nonexistent
    `src/services/local/localFamilyRepository.ts`; existing adaptation seam is
    `src/services/local/repository.ts` (plan says adapt existing). Clarify rename vs actual path.
    No implementation defect or native guarantee asserted. Status: unacknowledged.

12. **D-20260911T2218Z-p177313-012** — To A; type REVISED DRAFT CHECKPOINT / ACK.
    ACK A-015 RESUME; status writes resumed, board r8. D-014-07 is ADDRESSED: T006 now names
    existing `src/services/local/repository.ts`. D-014-01/02 remain addressed; variants and pending
    decisions now explicit, privacy product semantics receive a short independent helper recheck.
    D-014-06 remains OPEN in plan SHA `b937fe11...` / contract SHA `63fac5f2...`: clearing legacy
    family keys before v5 prevents migration resurrection, but does not detect the different crash
    window after v5 removal and before affinity/templates/preferences cleanup. The new version-5
    key plus legacy-first removal is acknowledged. Please specify startup orphan-cleanup/tombstone
    detection and retry authority for that window; cleanup_pending cannot be recovered solely from
    an absent envelope. No runtime claim. D holds report only; one read-only helper, no jobs.
    D-006 exact integrated candidate/output/preview request remains pending. Status: unacknowledged.

13. **D-20260911T2218Z-p177313-013** — To A; type REPORT COMMIT / RELEASE.
    Commit `513ee40ebe523fb34038e66739a606be5653fb91`, parent c56141b; only d-baseline.md
    third checkpoint (+70 lines), application still 02b9618. Exact evolving draft hashes and actual
    helper prompt recorded. D-014-01..05 product clarifications ADDRESSED; T004 exact mapping still
    BLOCKED before implementation readiness. D-014-07 repository path ADDRESSED. D-014-06 reset
    orphan detection remains OPEN at recorded snapshot; message 012 distinguishes it from legacy
    migration order. Later approved-task-recovery proposal read/attributed separately from helper
    snapshot; no duplicated A technical audit. Scoped Prettier/diff/staged checks and commit exit 0.
    Report RELEASED, QA clean; zero helpers/jobs. Ready for A evidence integration. D-002 queued
    candidate/preview request 006 remains pending; C active producer verified. Status: unacknowledged.

14. **D-20260911T2218Z-p177313-014** — To A; type FINAL DRAFT VERDICT / RELEASE.
    Commit `242cd497cd031b1d578e234f1edb0060bec59855`, parent 513ee40; only d-baseline.md
    +25 lines; scoped format/whitespace/exact-stage/commit exit 0, clean QA tree. D-014-06 now
    ADDRESSED in recovery-v1 SHA `50c1c290...` / plan `d3ae2976...` at canonical HEAD b862eb6:
    proven all-family-key absence, finite orphan cleanup, blocked entry and no-role idempotent
    retry cover the missing restart oracle. All seven proposal findings addressed at product/design
    direction level; ready for A scope decision, NOT implementation-ready. T004 exact serializer/
    approved-execution/receipt mapping and review/failing tests remain required. Existing approved-
    task seam c969eb4e read. No native/runtime/human pass. Report RELEASED; zero helpers/jobs.
    Please integrate 513ee40 then 242cd49 if not yet integrated. Next D-002 exact candidate and
    preview/output/sync grant queued after C's released a356998. Status: unacknowledged.

15. **D-20260911T2218Z-p177313-015** — To A; type P1 PREVIEW IDENTITY FAILURE.
    Actual D port8097 browser loaded route module `../Ghaf-ui-studio/app/index.tsx` WITHOUT A-004,
    although D disk HEAD b862eb6 contains the correction. Current role child / activeExperience
    signed_out / temporaryParentAccess present rendered Welcome after actual Child Parent-access
    press. This is mixed-worktree preview/cache evidence, not a reproduced defect of b862eb6.
    Preserve initial AR journey/captures as candidate-ineligible. Evidence:
    QA output/competition-readiness/d-b862eb6/preview-route-mismatch.json (full loaded function).
    D will stop owned Metro/browser and rerun relevant uncached preview with verified router root;
    no dependency or product change. All previous browser PASSED statements now withdrawn for
    exact-candidate attribution; full A source suite remains separately attributed. Status: unacknowledged.

16. **D-20260911T2218Z-p177313-016** — To A; type UNCACHED CHECKPOINT.
    --clear preview rebuilt; loaded Welcome module now `app/index.tsx`, has A-004, foreign route
    list empty. Initial mixed-route evidence remains ineligible, not erased. Fresh `uncached-*`
    artifacts show AR actual setup/Guide/approval/PIN/pairing/accept/help/submit/praise/recognition/
    Garden/Circle/Reward/League path. Seeds48→60, Mangrove48→60, canopy19→20, Circle11→12,
    Reward108+12 unlocked, internal lifetime108→120, Alya36; all8 flags false. Separately labeled
    duplicate command returns already_confirmed with all authorities unchanged. Decisive A-004:
    reload auto-restored remembered Child; Parent access directly sign-in, neither role authorized
    before code, Back returns Child, invalid000000 rejected, valid424242 opens Parent. Reload
    loses journey/progress as known process-local limitation, separately recorded (not new regression).
    Exact artifacts: uncached-a004-verdict.json / uncached-ar-confirmation-growth.json / uncached-
    ar-post-growth.json in QA output/competition-readiness/d-b862eb6/. Metro241063/exec6231 and
    Firefox241247 HELD; old roots stopped. EN/visual/B/reset work continues; no final verdict yet.
    One read-only evidence helper active. Status: unacknowledged.

17. **D-20260911T2218Z-p177313-017** — To A; type OBSERVED RESET NAVIGATION DEFECT.
    D-R02 / P2 web development demo, candidate b862eb6, Firefox. From remembered Child after
    reload → Parent access/verification → Parent Settings → Reset/confirm, then browser Back and
    English first-run/signup continuation: raw console records unhandled POP_TO_TOP at306117ms,
    log lines20353–20357. Expo error toast intercepted actual Verify and continue pointer clicks
    for30seconds; clicking its visible dismiss control restored normal continuation. No forced click.
    Expected reset/history cleanup with usable fresh entry. Screenshots uncached-reset-error-
    overlay.png, raw console /home/smyk/projects/Ghaf/output/playwright/177671/console-2026-09-11T22-52-06-466Z.log,
    initial action error uncached-reset-english-setup.json. Suspect existing src/utils/navigation.ts
    replaceHistoryWithEntry dismissAll after reset/guard redirect. Source comparison/isolated repeat
    pending; do not attribute to A004/B004/C002 yet. Console explicitly says development-only,
    production/native impact NOT RUN. D will repeat reset separately after EN growth while continuing
    independent work; A may inspect/queue fix without D source edits. Audio sink warnings also
    observed (NS_ERROR_DOM_MEDIA_MEDIASINK_ERR); no audio playback pass claimed. Status: unacknowledged.

## Acknowledgments and responses

ACK **A-20260911T2220Z-027** / r12: A alone owns reset utility/test fix. D stays b862eb6 until new exact sync grant; continue EN/B and preserve initial reset failure. d-candidate.md transferred to helper for initial draft only; D will re-hold after explicit release.

ACK **A-20260911T2220Z-026**: continue assigned retest before final commit/release/pause. Helper evidence request accepted; reload trace will be strengthened.

ACK **A-019/020/021/022** (A-20260911T2220Z prefix): r10 and exact A suite inspected; draft ca54e40 is proposal only. Decisive remembered-Child-after-reload oracle accepted, separately from task loss. Current roots/helper/preview section corrected; A never needed to edit or reclaim D files.

ACK **A-20260911T2220Z-017** / D-002-r9: clean worktree verified; new branch at exact b862eb6, prior QA branch retained at 242cd49. D holds new report/ignored artifacts and preview only; no runtime edits or duplicate full suite. Initial relative STATUS-D update failed (no such file); no forked status was written. Corrected here immediately. Metro launch continued in the same shell after that failure under the actual r9 grant; exec30041, port8097, roots pending inspection.

ACK **A-20260911T2220Z-016** at 2026-09-11T22:41:58+00:00: read final cleanup/approved-task proposal and append final independent disposition; report re-held. C explicit release observed; D candidate/preview grant still pending.

ACK **A-20260911T2220Z-015**: coordination commit 1f80f05 inspected; status writes resumed.

ACK **A-20260911T2220Z-012**: re-hold d-baseline.md to record revised full draft review;
T004 exact mapping remains a design gate, not an implementation pass. ACK
**A-20260911T2220Z-013** at 2026-09-11T22:36:59+00:00: this is D's final status write until A records RESUME.
Status snapshot ready for A alone to stage; source/draft review may continue under existing grants.
D has zero helpers/jobs; report path re-held as above, both prior commits released/integrated by A.
Pending requests/findings retained (006 preview/candidate; 011 full draft follow-up).


ACK `A-20260911T2220Z-003`: D-001-r1 accepted at revision 2; exact report/worktree and one helper quota verified. ACK `A-20260911T2220Z-004`: A owns A-004 entry repair; keep D audit at 02b9618 and wait for exact candidate for retest. A-DEC-001 acknowledges D-001 outbox; A-DEC-002 acknowledges D-002 native gap. ACK `A-20260911T2220Z-007`: upcoming integrated target includes A-004/B-004/C-002; keep baseline audit separate. ACK `A-20260911T2220Z-008`: board r4 grants read-only 014 draft review/report append. ACK `A-20260911T2220Z-009`: full draft is now available; review continues. ACK `A-20260911T2220Z-010`: A owns Arabic duration copy; include exact later copy commit in browser retest, human Arabic/native pending. B/C now executing report grants.

## AI assistance and review

Actual user task: “Session D — independent QA and rehearsal,” supplied in this conversation.
Applied skill: `.agents/skills/ghaf-quality-workflow/SKILL.md`. Contribution so far: bounded
repository/coordination/environment inspection and this status; zero product code generated.
No helper prompts or rejected helper suggestions exist yet. Rejected actions: treating template
quotas as live grants, inheriting historical passes, or calling config `xhigh` proven Ultra.
Student owner, understanding, exact-diff review and named Arabic/accessibility/safeguarding review
remain pending/not run. No GitHub history or rehearsal is invented.

## Read-only baseline audit checkpoint

**Identity**: `02b9618631fa9fc1b29f2cda5fa68c6adb2003fd`, canonical Ghaf checkout only; this is an
observed baseline, not an A-published D candidate. No product source has been executed by D.

- **PASSED — source identity comparison only**: `git diff --name-only 236bbae..02b9618 -- app src
  tests package.json package-lock.json app.config.ts eslint.config.js vitest.config.mts tsconfig.json`
  exited 0 with no paths. The three intervening commits are documentation/coordination. Historical
  QA results can be considered by A with that explicit source scope; they are not rerun here and
  do not establish current environment, full bilingual journey or native acceptance.
- **PASSED — inspected package identity subset**: installed versions equal lockfile for Expo
  57.0.20, React Native 0.86.3, Expo Router 57.0.19, SQLite 57.0.2, React 19.2.3, TypeScript 6.0.3,
  Vitest 4.1.11, ESLint 9.39.5, Prettier 3.9.6, Tamagui 2.7.7 and Reanimated 4.5.1. This is not a
  complete dependency installation/audit or test pass.
- Lockfile SHA-256: `d312af8f6b07994c983b02908cad16c7d6c52aadebe68ac33ea068ccc1685ccb`.
  `app.config.ts` SHA-256: `65646459c410de9f985550fe22127add7919dadaf3829e8336fe6881b42bc44b`.
  Source package `ae.ac.ku.ghaf.prototype`, version 0.1.0; installed Android identity unknown.
- **BLOCKED — build/device evidence**: repository `rg --files -uu` inventory for APK/AAB/eas.json,
  excluding Git/dependency/tool trees, returned no match (exit 1, expected search result). This
  does not inventory the entire machine. No APK hash, signing result, model, OS or installation
  established. Fresh ADB list remains empty; no native commands run against a device.
- **NOT RUN — candidate checks**: typecheck, lint, format:check, full/focused tests, browser and
  exports await an active grant. Preserve the prior report's initial lint exit 1/cached missing-
  module evidence and subsequent uncached result; do not erase initial failures. If reproduced
  on a granted candidate, use the relevant uncached lint check, not a dependency autofix.
- **PASSED — source default observation only**: `src/config/r002bFeatureFlags.ts:16` constructs all
  eight defaults as false; each flag is independently resolved. No EXPO_PUBLIC_R002B_* variable
  was present in this shell. Built/preview flags are not verified; release activation remains blocked.
- Tooling discovery: system `pdftotext` was absent (command exit 1); pypdf/fitz/pdfplumber were absent
  from default Python. Existing reviewed `output/competition-readiness/template-review/pdf-tools`
  supplied PyMuPDF successfully (exit 0, fitz deprecation warning retained). No install performed.
  Guessed nonexistent source directories during rg discovery were corrected through the actual
  test imports; these are audit lookup errors, not application defects.

### Source authority trace and contract challenges

1. `src/components/family-growth/ParentCheckIn.tsx:180` calls `confirmAndPresentPraise`; its separate
   recognition continuation at line 219 calls `applyRecognition` after praise is presented.
   `src/state/usePrototypeStore.ts:4527` validates the confirmation; `applyRecognition` stages
   domain/provider reconciliation, separate Growth/Reward/League consequences and one reveal,
   then updates them together at line 5033. The duplicate branch at line 4930 validates existing
   secondary authority and returns the detached existing result. Source inspection supports the
   intended design; actual repeated pointer actions and runtime effects are NOT RUN in D.
2. `src/state/usePrototypeStore.ts:366` restores directory/paired markers and line 450 obtains a
   fresh prototype session. Store initialization at line 1409 creates fresh Family Reward, Growth,
   League and reveal authorities. `src/services/mock/index.ts:2073` returns
   `createInitialPrototypeSession()`. Registry local repositories cover directory, remembered
   access, audio preference and saved templates, not accepted-task/progress recovery.
   Feature 003 spec's directory amendment explicitly excludes task/reward/garden persistence;
   Feature 005 affinity contains no progression. Historical QA-01 is therefore a known process-
   local limitation and a proposed recovery gap, not newly reproduced regression evidence.
3. Recovery must preserve the distinction between confirmation/praise presentation and committed
   recognition. Saving only the visible 60 total cannot prove exactly-once +12 or all secondary
   authorities. A's accepted story should define behavior at every interruption boundary, including
   failed writes and whether the user was told a durable commit succeeded.
4. `resetPrototype` at `src/state/usePrototypeStore.ts:2589` clears affinity, directory, audio and
   saved templates sequentially before the final in-memory reset. **Unexecuted challenge**: inject
   failure on a later clear after earlier stores cleared, then retry/reload; define one coherent
   fail-closed recovery result. Do not report a reproduced atomic-reset defect from this read.
   Also test stale loads/writes after reset/family replacement using stable family/profile/epoch
   binding: canonical Child IDs and household fixture IDs alone do not distinguish two local
   family generations. No new persistence contract has been selected by A yet.
5. `src/features/family-connections/index.ts:159` derives Parent planning entries with
   `recognitionMode: recognition_only`, `progressEffects: none`, no scheduling authority and
   `origin: prepared_local`. `src/state/usePrototypeStore.ts:2231` guards the getter with active
   Parent authority. Feature 008 must retain zero progression and private projection; direct
   wrong-role/browser/storage cases are still NOT RUN in this D run.
6. Actual recommendation policy is deterministic category ordering in
   `src/features/assistants/profilePersonalization.ts:149`, including bounded keyword signals
   from supported custom answers. It is not a generalized live Connection Coach. The later
   required-profile amendment/checklist must be included when A selects a rationale contract;
   older descriptions of curated-only inputs must not be blindly used as the current input oracle.
7. A private durable memory leaf has no selected accepted story in this board. Internal recognition
   history/reveal queues are not evidence of that feature. Its absence is not a regression. If
   selected later, require minimal synthetic content, explicit audience, family/profile binding,
   at most one entry/event, deletion/reset, and zero effects on every progression authority.

### Draft acceptance matrix — NOT an executed journey

All browser actions must be actual pointer/keyboard interactions in isolated synthetic contexts;
store injection is separate labeled fault testing. Every row needs an exact A candidate plus flags
and artifact path before execution. A assigns final task IDs and evidence paths; owners below are
proposed queue mappings only. AR and EN each need their own full local journey, not just one mixed-
locale run. Source/test references describe where to verify, not inherited passes.

| ID | Acceptance / oracle | Required evidence and source/test entry | Proposed owner/task | Current result |
| --- | --- | --- | --- | --- |
| D-M01 | Exact commit, dirt, dependencies, checks, build flags | Git; four npm checks; app.config; APK hash/signing | A-001/A-003; D-001 | Source subset above; runtime NOT RUN |
| D-M02 | Signed-out Arabic reset; no privileged Back/deep-link entry | `reset-navigation`, `access-control`, `r003-store-access-flow`; browser AR/EN, native Back | D-001/D-002 | NOT RUN |
| D-M03 | Unknown identifier denied; verified first/returning Parent entry | `parent-onboarding-*`, `r003-returning-family-entry`; browser pointer/keyboard | D-001/D-002 | NOT RUN |
| D-M04 | One/two renamed profiles, mixed scripts and current age bands | `parent-task-composer-profiles`, `required-child-profile-personalization`; AR/EN compact views | D-001/D-002 | NOT RUN; historical 236bbae retest attributed only |
| D-M05 | Parent chooses prepared suggestion, accepts wording, reviews then assigns +0 | `parent-task-flow`, `profile-task-recommendations`, `parent-task-drafting-authority`; UI + service trace | D-001/D-002 | NOT RUN |
| D-M06 | Separate Child credential/pairing; wrong Child, expiry/revoke, temporary Parent handoff | `r003-child-access-controller`, `device-remembered-access`; AR/EN route attempts | D-001/D-002 | NOT RUN |
| D-M07 | Child chooses/accepts/starts current task; help retains accepted +12 | `child-task-flow`, `task-lifecycle`, `reward-matrix`; actual Coach/help UI | D-001/D-002 | NOT RUN |
| D-M08 | Completion waits for Parent; retry removes nothing; no media required | Same suites plus `r002a-child-support-follow-up`; UI submit/retry | D-001/D-002 | NOT RUN |
| D-M09 | Parent-specific praise precedes recognition; repeated confirm adds nothing | `parent-check-in-flow`, `recognition-provider-store-boundary`; actual duplicate UI actions | D-001/D-002 | NOT RUN |
| D-M10 | Default Seeds 48→60; Mangrove 48/60→60/60; Alya unchanged | `garden-progression`, `r002b-progression-store`, `operator-demo-flow`; exact before/after UI | D-001/D-002 | NOT RUN |
| D-M11 | Canopy 19/25→20/25; eligible Green Circle 11/12→12/12 only | `privacy-projection`, `garden-circle-flow`, `src/features/circle/projection.ts`; private rejection | D-001/D-002 | NOT RUN |
| D-M12 | Exactly five Leaves; 80→100; shared ties, no speed, extra-task exclusion, weekly isolation | `family-league`, `src/features/league/index.ts`; minimal shared DTO and UI | D-001/D-002 | NOT RUN |
| D-M13 | Private Reward 108/120→120/120 only on eligible provenance; promised→unlocked→given | `family-reward`; Parent privacy, rank independence, prospective reauth, immutable unlock | D-001/D-002 | NOT RUN |
| D-M14 | Feature 008 remains private recognition-only with zero effects | `family-connections`; Parent view and Child/shared negative cases | D-001/D-002 | NOT RUN |
| D-M15 | Prepared/local/fallible labels; task-bounded age intents; safe offline fallback | `assistant-safety`, `assistant-age-adaptation`, `bounded-ai-prepared-services`; UI labels | D-001/D-002 | NOT RUN |
| D-M16 | All eight R002b flags independently off; gated lifetime 108→120 not default balance | `r002b-feature-flags`, `r002b-lifetime-seed-projection`; runtime config + guarded routes | D-001/D-002 | Source defaults inspected; runtime NOT RUN |
| D-M17 | Every meaningful-state reset, repeated reset, no stale Back or resurrection | `mock-core-flow`, `prototype-state`, `reset-navigation`, family replacement; injected faults separately | D-002; A-002/B-002 contract for durable cases | NOT RUN |
| D-M18 | Accepted recovery: seven interruption points × reload/process death/write failures | Accepted version/schema, profile/family/epoch, idempotency and stale-load tests plus native execution | A-002/B-002 then D-002/D-003 | BLOCKED: contract/candidate absent |
| D-M19 | Memory only if selected: private, one/event, restore/delete/reset, all effects zero | Accepted story and new bounded tests/actual UI | A-002/B-003 then D-002 | NOT RUN: unselected feature, not regression |
| D-M20 | AR/EN 320/390; long labels/mixed scripts; large text and reduced motion | `localization-parity`, `bilingual-typography`; captures, widths, focus, pointer/keyboard | D-001/D-002 | NOT RUN |
| D-M21 | Primary RTL/touch/TalkBack/Back/IME/font scaling/foreground/audio/permissions/reduced motion | Direct device identity, installed APK, recorded actions/outcomes | A-003 then D-003 | BLOCKED: no device or APK |
| D-M22 | Secondary independent install/touch/layout/restart/reset | Separate device/OS/serial, same APK hash; no shared-state claim | A-003 then D-003 | BLOCKED: no device or APK |
| D-M23 | Ten actual 2–3 minute primary rehearsals including cold start/offline/reset | Run ID, actual duration, operator, locale/flags, help/fault/outcome | D-003 + actual human operator | NOT RUN: 0 runs |
| D-M24 | Named student teach-back, Arabic/cultural/accessibility/safeguarding review | Actual person, exact scope/date, questions/observations | A/human owner; D evidence | NOT RUN; owners pending |

### Unexecuted device and student handoff

Before native work, A provides the exact signed APK, SHA-256, source hash, flag configuration and
build versions. Record primary and secondary serial/model/OS/build independently. Existing source
package is provisional; confirm the installed package/version, not merely app.config values.
Use targeted `adb -s <observed-serial>` commands only after device selection. Never use unqualified
multi-device installation or represent an Android JavaScript export as an APK.

On the primary, perform actual normal access/setup/pairing and the Parent→Child→Parent journey.
Record all initial counters, permitted help, pending completion with no award, praise and one
recognition, the before/after Garden and private League, then duplicate and reset attempts.
Run the complete journey independently in Arabic and English. For offline native evidence, cold
launch the installed build with Metro unavailable and internet off; browser request blocking is a
separate proxy. Inspect TalkBack reading/focus, native Back/IME, OS text scale, touch, background/
foreground, audio interruption, permissions and reduced motion individually. Real Child recording
remains unauthorized; use prepared synthetic fixtures. Repeat installation/restart/reset on the
secondary independently without transferring application state or claiming synchronized devices.

For an approved recovery candidate, use these seven checkpoints: before assignment, after
acceptance, during help, after Child completion, during confirmation, after growth, during reset.
At each, record the previously acknowledged durable state and the expected post-restart state.
Cover reload and actual native force-stop/process restart separately. Fault tests independently
cover corrupt/unknown records, unavailable storage, interrupted writes, family replacement,
repeated reset and stale reads/writes; label fault injection. Reopening the screen must neither
re-award +12 nor recreate deleted memory or another family's data.

Prepare ten empty run records only after the final build is known; completed count currently zero.
Each actual record needs start/end UTC, seconds, operator, device/OS, APK/commit, locale/flags,
preparation, faults/help and outcome. The 2–3 minute live target and ten runs are internal goals;
the supplied orientation independently requires a 2–3 minute video. Qualification remains unknown.

Student teach-back packet (suggested questions; no student has answered):

- Trace `ParentCheckIn` → store confirmation/praise → `applyRecognition` → independent authorities.
  Explain what prevents a second +12 and what remains unproven across reload.
- Explain why asking for help retains +12 and why a retry/Child submission grants no progress.
  Open `reward-matrix.test.ts` and `task-lifecycle.test.ts`; tests were not rerun in this audit.
- Explain directory/affinity versus session/task/progress; open registry repositories and initial
  store construction. Identify process-local reset truth rather than claiming durable history.
- Explain the actual deterministic recommendation inputs and Parent acceptance; identify the
  prepared mode label. Do not describe a live Connection Coach or infer personality.
- Explain why League rows omit private details and why the Green Circle and private Reward use
  separate eligibility. Open `privacy-projection.test.ts` and `family-reward.test.ts`.
- Identify the actual human's own contribution and supporting AI prompts/diffs. Record unanswered
  questions and follow-up learning; never fill an understanding/review row from this answer guide.

Supplied organizer materials were directly read through the existing PDF reader: Orientation
physical pages 3/9/10/12/13/17 and GitHub Guide physical pages 7–11. Orientation SHA-256
`134921ede4b12532d2b49e32ea4c87253b3de0930959ff64939fb2f2aa3eb6a9`; GitHub Guide SHA-256
`55e7c4cfc31923cb45721b1fd6af0bf0357f704cbea0eb2aa24f31f95144768d`. These substantiate the bounded
supporting-AI and real student-understanding requirements; no qualification or human participation
is established. Raw files remain untracked/unmodified.

## Resume cursor

QA b862eb6 unchanged. Initial AR journey/captures marked candidate-ineligible because cached route
resolved ../Ghaf-ui-studio/app/index.tsx. Preserved mismatch evidence and outbox015. Owned preview
restarted with --clear; actual module now app/index.tsx with A-004. Uncached Metro241063/exec6231,
port8097 and new browser HELD; zero helpers. Repeat actual AR/EN journey and A-004 reload case;
record fresh artifact names with uncached prefix, then B replacement/duplicates and bounded stress.
A full candidate checks pass; do not rerun. New d-candidate.md HELD, no product writes.

## Current checkpoint — 2026-09-11T23:06:59+00:00

ACK A-027/028/029, boardr14 and D-004-r13. b862eb6 EN help/retry/core and separately labeled B004 store-command/fault probe completed. B cancellation/save failure preserve all authorities; successful replacement clears both old League/reveal commitments; new recognition grants once. Report helper released, zero active helpers. A004 earlier actual reload call ended in null-journey observation error; stronger successful trace will be captured on correction candidate, not silently inferred. D retains report/preview; no source edits.

18. **D-20260911T2218Z-p177313-018 → A — BASELINE CHECKPOINT / CORRECTION ACK.** EN retry with permitted help retains +12 and all pre-confirmation authorities, then one praise/growth bundle. B004 direct command probe with one injected save failure PASSED cancel/fail preservation, new epoch and cleared commitments/League, new recognition+duplicate. Raw uncached-b004-command-probe-result.json. Helper report released. Preparing scoped checkpoint commit before authorized clean branch b2208aa and uncached reset retest. Earlier A004 access outcomes stand, but helper found returned reload artifact lost binding provenance due null-journey inspection error; fresh successful reload trace will close that evidence gap. Native/human absent, no full pass.

19. **D-20260911T2218Z-p177313-019 → A — D002 CHECKPOINT / D004 STARTED.** Baseline report committed29195c7; sourceb862eb6 branch preserved. Clean status verified; created authorized redesign/qa-reset-20260912 at b2208aa and cherry-picked only own report asadcec89. d-candidate.md re-held for correction evidence; do not edit until release. Old Metro241063 exec6231 stoppedCtrlC exit130, browser closed. New owned uncached preview launching; exact roots next refresh. No active helpers or heavy jobs. ACK A028/029 and no full-suite duplication.

20. **D-20260911T2218Z-p177313-020 → A — D004 FAILED / ASYNC RACE REPRODUCED.** Exact sourceb2208aa (QAHEADadcec89 only report difference), own loaded app/index.tsx and utility canDismiss verified. Actual fresh AR setup/Guide/pair→task/Coach→page.reload restores remembered Child→Parent access/cancel/invalid/valid code→Settings reset. Before click router.canDismiss()=true, Parent authorized, temporary markertrue. Reset/Back yields Arabic signed-out cleared directory/device/journey, BUT console still unhandled POP_TO_TOP and error-toast present. Successful artifact output/competition-readiness/d-b2208aa/reset-remembered-child.json, screenshot reset-after-remembered-child.png; new console23-08-01-547Z. A004 full remembered-binding/reload trace now substantiated separately a004-complete-reload-trace.json. D-R02 P2 remains OPEN onb2208aa; no production/native claim. Please assign correction if selected. D keeps preview/report and continues root-only/bilingual continuation; no product edits. Report helper read-only review finished/released; 0activehelpers.

21. **D-20260911T2218Z-p177313-021 → A — ROOT BRANCH / STRESS DISPOSITION.** ACK A030–033, boardr15. root-only reset canDismiss=false PASSED after real remembered-Parent reload at /parent/settings: reset→browserBack→fresh English signup verification succeeds, zero new consoleerrors/visibletoast (reset-root-only.json). D-R02 remains FAILED only observed dismissible branch; A008 expected. Arabic CSS200% probe doubles35computedtextnodes at320, primary240×138usable, but secondarysmaller-taskfinalwordclipped in ar-large-secondary.png. Treat as P3 browser CSS-stress observation, not native or ordinary-scale regression; no all-label pass. ARCoach and ENGuide successfultexttraces now captured b2208aa; browser offline preparedGuide new adapt_age request metadata originprepared while navigator offline, no Seed effects. Preloadedbrowser only, no standaloneAPKofflineclaim. D updates report checkpoint now; nohelper/heavyjob, ownedpreviewrunning.

22. **D-20260911T2218Z-p177313-022 → A — D004 CHECKPOINT COMMITTED.** cf2f740 updates sole d-candidate.md with failed dismissible/reset, passed root-only and stronger A004/ARCoach/ENGuide/offline evidence, explicit P3 CSS-stress crop and narrowed B in-memory assertion. Scoped Prettier check/diff/staging/commit exit0; Git clean. Prior report commits29195c7 (carriedadcec89) preserved. Report remains HELD for expected A008 correction, preview258963/259258 port8097 exec46510 remainsD-owned. Nohelpers/heavyjobs. A008 verified active producer perboardr15; awaiting exact source grant while report/source attribution review continues. No native/human/rehearsal pass.

23. **D-20260911T2218Z-p177313-023 → A — MOUNTED ROOT / HANDOFF DETAIL.** Read-only mounted navigation shape at b2208aa available in mounted-root-shape.json; only observation, no reset injection. Normal Parent draft reset additionally returned cleared signed-out Arabic Welcome; harness expecting intro timed out because completed first-run state persists in same process. Afterward actual Back stayed signed-out root, no visible errorbutton. Preserve reset-normal-parent-draft.json timeout as harness limitation, not fresh failure. Intro after reload and Welcome in same process are distinct; do not require intro in every reset probe unless contract selects it. Helper returned exact priorBprompt, nowreleased;0helpers. Browser155.0, Node24.16.0/npm11.13.0; fresh adb devices -l empty. A script still has older pending reset wording; final published correction disposition should update that and keep “after recognition” distinct from confirmation/praise counters. D holds report/preview while verified A008sourcewriter active.

24. **D-20260911T2218Z-p177313-024 → A — CLEAN CHECKPOINT / PREVIEW STOPPED.** Additional report provenance commit04ffee9 (onlyd-candidate.md), formatting/diff checks pass, cleanQA. Old preview/browser stopped; zero jobs/helpers. D retains reserved preview/report awaiting exact published A008 grant (Gitnewcommitobserved, no syncyet). Planned bounded browser retest includes rememberedChild/reload→ParentSettings reset, normalParent statusbar via /circle reset, repeated reset, root-only Settings, Back/reload/fresh bilingual access. Legacy statusbar publicroot hook matters because it is outside appStack. PriorhelperreturnedexactBprompt nowverbatimreport; allreleased.

25. **D-20260911T2218Z-p177313-025 → A — READY FOR EXACT NEXT GRANT.** At 2026-09-11T23:23:24+00:00 source7fff0f3 is committed in integration; boardr16 still describes A008draft/sourceheld and no D sync grant. D has finished useful b2208aa checks, clean report04ffee9, zerojobs/helpers, previewreserved. Please publish exact candidate/branch synchronization grant when your source review is released. D will run only the requested reset branches, both real callers, Back/reload and fresh entry; no full-suite duplicate or newfeature. This outbox does not wake A automatically; D continues bounded polling while A008producer is recorded active.

ACK A034 and D-005-r17 before synchronization. Clean04ffee9 verified below; only7fff0f3 cherry-pick authorized, report/history retained. D re-holds d-candidate and new ignored d-7fff0f3/**. A fullrunner ownschecks; no Dsuite. Previewreserved nojobs untilnextlaunch.

26. **D-20260911T2218Z-p177313-026 → A — D005 BROWSER RETEST PASSED, REPORT FINISHING.** Source7fff0f3 matchesQA a1f1852 app/src/tests/config/package comparison (no source diff). Verified loaded prepareEntryReset and both public-container-ref callers. Three successive actual resets passed: rememberedChild task/help→reload→temporaryParent→Settings; freshEnglishfamily→Garden→/circle statusbar; freshArabicfamily→rememberedParent verification→Settingsreload root-only. Eachresetroot only__root/index with freshkeys/nullparams, clearedpair/family/task/roles, no consoleerror/visibletoast; actualBack stayedsignedout. Finalreload and direct/parent/settings,/child attemptsreturnArabicentry with nooldauthority. FreshENverification andARsetupafterpriorresets succeed. Fullrawtracesd-7fff0f3. A035checksACK138/1677; no Dsuite. Onehelper /root/rehearsal_packet_review read-onlyfinalartifactaudit active; sole reportwriterD. Metro278873/exec66015, Firefox279164 (MCP177703) currentlyheld; allfinish/release/statuspauseafterreportcommit. P3CSSstressremainsbounded, native/human/rehearsalsblocked/notrun.

## Final report release and paused coordination — 2026-09-11T23:31:33+00:00

27. **D-20260911T2218Z-p177313-027 → A — FINAL D-005 RELEASE / A-026 PAUSE ACK.**
Final report commit `93a98c0296486b185ac96b7113cae90d9bef7b61`, only d-candidate.md;
scoped Prettier, diff/staged review and commit passed. QA Git clean; exact runtime source7fff0f3
unchanged. Integrate these **report-only commits in order**: `adcec89`, `cf2f740`, `04ffee9`,
`93a98c0`. First is equivalent to original29195c7; choose one, not both. Do NOT cherry-pick
`a1f1852`, which only carries your already-integrated7fff0f3 source. Prior d-baseline commits
were already integrated and are not repeated.

D-R02 narrow browser closure is supported by independent helper review and successful exact traces
for remembered Child/reload/temporary Parent Settings, normal Parent /circle statusbar and root-only
Settings; three successive resets with fresh setup, not rapid duplicate presses or every interruption.
Actual Back, reload, fresh bilingual verification/setup and denied post-reset role deep links pass.
A four checks attributed (138/1,677); no D duplicate suite. Source-identical older core/retry/B probes
remain explicitly attributed. Splash captures are transitional, and final-welcome-settled JSON/PNG
records operable Arabic entry; no complete visual/native pass. P3 CSS-stress clipping remains open.

**RELEASED:** d-candidate.md, all assigned ignored evidence paths, preview lane and helper quota.
Zero active helpers/jobs; final Metro278873/exec66015 stopped exit130 and Firefox279164 closed,
verified absent. No unfinished D write remains. Exact APK/native phones, named human reviews,
qualification and real rehearsals remain absent; current physical count0. No other eligible D task
or new source producer remains selected after this evidence handoff. Recovery014 stays pending.

**ACK A-026 final status-write pause** after cleanup and release. This is D's last write until A
publishes RESUME; A alone may stage this canonical record. All numbered outbox messages remain
retained; received ACKs A034–037 and boardr19 recorded here. Read-only polling of A's handoff may
continue without altering paused status.

## Final recovery cursor

Clean QA HEAD93a98c0, source7fff0f3. Report and jobs released, status paused for A snapshot.
Next read canonical BOARD/STATUS-A and own Git; do not revive old preview or treat old grants as
new work. D-003 needs an exact APK plus actual identified primary/secondary devices/operator;
all device scripts and unanswered student Q&A are in d-baseline.md. Any new source candidate needs
A's exact acceptance scope/paths. No push, merge, deployment, release activation or submission.
