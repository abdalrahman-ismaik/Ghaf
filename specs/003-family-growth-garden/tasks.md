# Tasks: Family Growth Garden — Revision 3 Planning Amendment

**Input**: Revision 3 artifacts in `specs/003-family-growth-garden/` and user-supplied planning input
in `docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/`

**Revision 3 status**: Growth Journey product/domain planning amended 2026-09-03. Ghaf R001 Batch 1
is **PARTIALLY RELEASED** for foundations, Welcome, and first-time Parent onboarding. Full T120,
unfinished Revision 2 foundations, the new Growth Stitch gate, and all Growth runtime remain
**BLOCKED**.

**Format**: `- [ ] T### [P?] [US#?] Description with file path`

Only the scoped R001 design-intake tasks checked below are complete. No runtime task is complete from
design approval alone. Do not check a task from Revision 1 code/evidence.

## Historical Revision 1 Summary — Not Reusable

T001–T110 belong exclusively to Revision 1. They planned, implemented, converged, and web-validated
the historical linear ten-route experience. Their completed markers, 305-test result, web
walkthrough, route inventory, and open Android/human gates remain historical records. They do not
implement or validate separate access, role navigation, Challenge Leaves, Family Rewards,
Revision 2 voice/permissions, Alexandria/Readex typography, or the pending Stitch designs.

## Phase 1: Revision 2 Documentation and Stitch Intake

**Purpose**: Receive approved visual sources in bounded releases, audit each release, and retain the
full implementation block until complete reconciliation.

- [x] T111 Record the supplied Ghaf R001 identifier, Soft Organic Modernism direction, 2026-09-02 user approval, and preservation location in `specs/003-family-growth-garden/design-intake/stitch-inventory.md`
- [x] T112 Inventory every supplied R001 file plus missing locale/state/spec/font/asset evidence in `specs/003-family-growth-garden/design-intake/stitch-inventory.md`
- [x] T113 Map the approved Batch 1 frames, routes, contextual states, and out-of-batch boundary in `specs/003-family-growth-garden/design-intake/screen-state-map.md`
- [x] T114 [P] Audit Batch 1 Child safety, access isolation, data minimization, media/privacy statements, and capability labels in `specs/003-family-growth-garden/design-intake/product-safety-audit.md`
- [x] T115 [P] Audit Batch 1 Arabic RTL, English parity target, Alexandria/Readex hierarchy, bidi controls, scaling, targets, contrast, reading order, keyboard, and reduced motion in `specs/003-family-growth-garden/design-intake/accessibility-audit.md`
- [x] T116 [P] Audit Batch 1 hierarchy, card density, dominant actions, botanical identity, responsive composition, and native motion/sheet translation in `specs/003-family-growth-garden/design-intake/visual-audit.md`
- [x] T117 Resolve every R001 Batch 1 conflict and record accepted dispositions and explicit later blockers in `specs/003-family-growth-garden/design-intake/decision-log.md`
- [x] T118 Freeze exact Batch 1 route paths, Back behavior, states, component boundaries, and guards in `specs/003-family-growth-garden/design-intake/route-component-map.md`
- [x] T119 Update `DESIGN.md` and `DESIGN_DIRECTION.md` with the approved R001 system while preserving later design blocks and product invariants
- [ ] T120 Reconcile `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, `CODEX_IMPLEMENTATION_PROMPT.md`, `DEMO_RUNBOOK.md`, `specs/003-family-growth-garden/{spec.md,plan.md,research.md,data-model.md,quickstart.md,tasks.md}`, all three `specs/003-family-growth-garden/contracts/*.md`, and `specs/003-family-growth-garden/checklists/requirements.md`; run cross-artifact analysis and record an explicit integration-owner gate result in `specs/003-family-growth-garden/design-intake/release-gate.md`

**Full gate**: T120 remains blocked because later Arabic/English/state frames and full artifact
reconciliation are absent.

**R001 partial exception**: The integration owner may execute only the Batch 1 portions of T121,
T126, T128, T131–T136, and T167: Parent-onboarding access/localization tests; the smallest
access/draft model, policy, service, state, fixture, and bilingual resources; the seven approved
routes; shared access components; the root access Stack and authenticated Parent destination guard;
and canonical tokens/local fonts. Every Child access/pairing/reauthentication, persistent tab,
later route, League, reward,
assistant, garden, recognition, full reset, and unrelated portion of those tasks remains blocked.
Partial work does not complete a broad task checkbox unless its entire stated scope is directly
verified.

## Phase 2: Revision 2 Test and Domain Foundation

- [ ] T121 [P] Add failing synthetic Parent/Child access, pairing, role-isolation, and reauthentication tests in `tests/revision2-access.test.ts`
- [ ] T122 [P] Add failing five-Leaf scoring, 100-cap, ties, full-help credit, extra-task, rollover, and privacy-projection tests in `tests/revision2-league.test.ts`
- [ ] T123 [P] Add failing Family Reward source-eligibility/provenance, Seed/landscape milestone, privacy, state-machine, nonretroactive-version, monthly-maximum, reauthentication, and no-custody/exchange tests in `tests/revision2-family-reward.test.ts`
- [ ] T124 [P] Add failing praise-first ordered consequence, exact deltas, single canopy contribution, and duplicate no-op tests in `tests/revision2-recognition.test.ts`
- [ ] T125 [P] Add failing age-band Coach, prepared voice, transcript/delete/replay/captions/slower-playback, permission-denial, and adult-exit tests in `tests/revision2-coach-voice.test.ts`
- [ ] T126 [P] Add failing Arabic/English resource parity, Alexandria/Readex style, bidi data, long-label, and reset tests in `tests/revision2-localization-reset.test.ts`
- [ ] T127 Run T121–T126 and record intentional RED evidence before production changes in `specs/003-family-growth-garden/checklists/revision2-red-green.md`
- [ ] T128 Define Revision 2 access, pairing, permission, League, Challenge Leaf, Family Reward, receipt, and session contracts in `src/models/familyGrowth.ts`
- [ ] T129 [P] Implement pure League scoring/ranking/eligibility/privacy and weekly-rollover policy in `src/features/league/**`
- [ ] T130 [P] Implement fail-closed Family Reward contribution eligibility/provenance plus milestone/version/state/monthly-maximum/prohibited-category policy in `src/features/rewards/**`
- [ ] T131 [P] Implement synthetic access/pairing/reauthentication and age-band Coach/voice policies in `src/features/access/**` and `src/features/assistants/**`
- [ ] T132 Implement one atomic Revision 2 session, exact reset, and ledger-first ordered recognition commands in `src/state/usePrototypeStore.ts`
- [ ] T133 Wire deterministic local access, pairing, League, reward, assistant, voice, and reset providers through `src/services/interfaces/**`, `src/services/mock/**`, and `src/services/index.ts`
- [ ] T134 Replace Revision 2 bilingual copy and canonical prepared fixtures in `src/i18n/resources.ts` and `src/services/mock/fixtures.ts`

## Phase 3: User Story 1 — Parent Protected Experience

- [ ] T135 [US1] Implement the approved Parent sign-in/setup frames and synthetic access states at the exact `app/**` paths frozen in `specs/003-family-growth-garden/design-intake/route-component-map.md`
- [ ] T136 [P] [US1] Build Stitch-matched Parent verification, setup, PIN/passkey/biometric-gate, and reauthentication components in `src/components/access/**`
- [ ] T137 [US1] Implement Parent Home with review priority, family canopy, next tasks/support, create action, and bounded summary at the frozen `app/**` path
- [ ] T138 [US1] Prove Child sessions and unauthenticated deep links cannot expose Parent surfaces in `tests/revision2-access.test.ts`

## Phase 4: User Story 2 — Child Access and Pairing

- [ ] T139 [US2] Implement shared-device profile/PIN/picture-sequence and separate-device prepared QR/code flows at the frozen `app/**` paths
- [ ] T140 [P] [US2] Build wrong/forgotten PIN, awaiting approval, approved, denied, expired, offline, and revoked-device states in `src/components/access/**`
- [ ] T141 [US2] Implement Parent approval/revocation controls behind reauthentication at the frozen Parent Family/settings `app/**` paths
- [ ] T142 [US2] Run the independent Child access/pairing and protected-role test in `tests/revision2-access.test.ts`

## Phase 5: User Story 3 — Parent Tasks and Builder

- [ ] T143 [US3] Implement Parent Tasks with assigned/pending/completed filters and one Create task action at the frozen `app/**` path
- [ ] T144 [US3] Implement Task Builder Choose, Adjust, and Review/Assign states at the frozen `app/**` path family
- [ ] T145 [P] [US3] Build Stitch-matched task selector, Guide comparison, safety, reward, privacy, and Challenge Leaf components in `src/components/family-growth/**`
- [ ] T146 [US3] Verify assignment creates no Seed, garden, canopy, Leaf, score, or reward progress in `tests/revision2-recognition.test.ts`

## Phase 6: User Story 4 — Child Today, Task, and Coach

- [ ] T147 [US4] Implement Child Today with at most three choices, five weekly Leaves, private reward progress, smaller-task request, and start action at the frozen `app/**` path
- [ ] T148 [US4] Implement Child Task with definition, four-or-fewer steps, adult boundary, fixed award, Challenge Leaf, submit, and pending states at the frozen `app/**` path
- [ ] T149 [P] [US4] Build the bounded Coach and simulated push-to-talk sheet from approved frames in `src/components/family-growth/**`
- [ ] T150 [US4] Verify help/accessibility/equivalent completion preserves full award/Leaf credit and submission creates no early consequence in `tests/revision2-coach-voice.test.ts` and `tests/revision2-recognition.test.ts`

## Phase 7: User Story 5 — Parent Check-in and Ordered Consequence

- [ ] T151 [US5] Implement Check-in facts/evidence/praise/confirm/retry/smaller/equivalent states at the frozen Parent `app/**` path
- [ ] T152 [US5] Implement the single immutable receipt producing praise → 12 Seeds → Mangrove → canopy → fifth Leaf → private reward unlock in `src/state/usePrototypeStore.ts`
- [ ] T153 [P] [US5] Build the Stitch-matched Garden celebration and reduced-motion final state in `src/components/family-growth/**`
- [ ] T154 [US5] Prove the exact P0 deltas and five duplicate no-ops in `tests/revision2-recognition.test.ts`

## Phase 8: User Story 6 — Ghaf Family League

- [ ] T155 [US6] Implement the Child League with exact 1/1/3/4 standings, five Leaves, cooperative canopy, rest/completed/no-members states, and prepared encouragement at the frozen `app/**` path
- [ ] T156 [P] [US6] Build allowlisted League row, Leaf progress, tied-position, canopy goal, and prepared reaction components in `src/components/league/**`
- [ ] T157 [US6] Implement privacy projection before every shared League visual/counter in `src/features/league/**`
- [ ] T158 [US6] Verify extra tasks, weekly rollover, ties, full help credit, prohibited categories, and field-injection rejection in `tests/revision2-league.test.ts`

## Phase 9: User Story 7 — Parent Family, League, and Rewards

- [ ] T159 [US7] Implement Parent Family household/device/League/privacy sections and exactly-five weekly setup at the frozen `app/**` path
- [ ] T160 [US7] Implement Family Rewards plan list/create/detail, Promised/Unlocked/Given, and private monthly maximum at the frozen contextual `app/**` paths
- [ ] T161 [P] [US7] Build milestone, promise, progress, monthly-maximum, reauthentication, and irreversible-unlock components in `src/components/rewards/**`
- [ ] T162 [US7] Verify reward privacy, fail-closed Seed/landscape provenance, rank independence, no exchange/custody, prohibited milestones, and nonretroactive versions in `tests/revision2-family-reward.test.ts`

## Phase 10: User Story 8 — Navigation, Settings, Reset, and Offline Demo

- [ ] T163 [US8] Implement the frozen Parent four-tab and Child three-tab shells with protected Back/deep-link behavior in `app/**` and `src/utils/navigation.ts`
- [ ] T164 [US8] Implement role-appropriate settings, language, prepared voice, captions, speed, motion, text size, permissions, devices, PIN reset, and reauthentication at the frozen `app/**` paths
- [ ] T165 [US8] Implement atomic Parent-authorized reset from every named Revision 2 state in `src/state/usePrototypeStore.ts` and the frozen reset UI path
- [ ] T166 [US8] Verify five Arabic and five English external-service-denied journeys and exact resets in `tests/revision2-localization-reset.test.ts`

## Phase 11: Typography, Visual Integration, and Acceptance

- [ ] T167 Apply the approved Stitch tokens and Alexandria/Readex loading method in `src/design/**`, `app/_layout.tsx`, and the exact font asset/dependency files approved at T120
- [ ] T168 [P] Verify Arabic RTL, English LTR, bidi values, tabular numerals, no Arabic tracking, 200% scaling, 48dp targets, contrast, reading order, and reduced motion in `tests/revision2-localization-reset.test.ts`
- [ ] T169 Re-run T121–T126 and all story tests GREEN, then record exact results in `specs/003-family-growth-garden/checklists/revision2-red-green.md`
- [ ] T170 Run typecheck, lint, format, full tests, Expo dependency/config checks, route inventory, static web export, source/privacy/secret/network/permission scans, and diff checks; record results in `DEMO_RUNBOOK.md`
- [ ] T171 Walk every Revision 2 Arabic RTL and English LTR frame/state on the web proxy and record only web evidence in `specs/003-family-growth-garden/checklists/revision2-web-proxy.md`
- [ ] T172 Attempt the named physical Android access, navigation, offline, Back, keyboard, prepared voice, permissions, reduced motion, TalkBack, 200% font, touch, and exact reset journey; record `PASSED`, `FAILED`, or truthful `BLOCKED` in `DEMO_RUNBOOK.md`
- [ ] T173 Conduct five timed rehearsals, three-person comprehension, and named Arabic/UAE, safeguarding, reward-ethics, accessibility, and sustainability reviews; record only direct evidence in `DEMO_RUNBOOK.md`
- [ ] T174 Run final cross-artifact convergence and product/design review, resolve every P0-critical finding, and record integration readiness in `specs/003-family-growth-garden/checklists/revision2-release.md`

## Phase 12: Revision 3 Growth Journey Planning Amendment

**Purpose**: Reconcile the supplied Growth Journey direction into the canonical product/domain
documentation without authorizing screens or runtime.

- [x] T175 Inventory and classify the Growth Journey prompt pack, preserve it as non-runtime input, and record conflicts and precedence in `specs/003-family-growth-garden/design-intake/growth-journey-preflight.md`
- [x] T176 Reconcile the Growth direction, R001 boundary, inherited League/task/reward contracts, and runtime hold across `PRODUCT.md`, `RESEARCH_BASIS.md`, `DESIGN.md`, `DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, and `specs/003-family-growth-garden/{spec.md,plan.md,research.md}`
- [x] T177 Record the proposed projection architecture, exact 16-badge registry, Mangrove learning/equal-credit contract, and open review ledger in `docs/architecture/adr/0002-impact-path-projection.md`, `docs/content/BADGE_CATALOG.md`, and `docs/content/LEARNING_STORIES.md`
- [x] T178 Amend the proposed Growth entities, separate progress authorities, exact reset/result oracles, profile isolation, migration, and recovery contracts in `specs/003-family-growth-garden/data-model.md` and `specs/003-family-growth-garden/contracts/acceptance-contract.md`
- [x] T179 Reconcile operator guidance, document maps, future judge oracle, architecture overview, and readiness checklists in `README.md`, `docs/README.md`, `CODEX_IMPLEMENTATION_PROMPT.md`, `DEMO_RUNBOOK.md`, `docs/architecture/ARCHITECTURE.md`, `specs/003-family-growth-garden/quickstart.md`, and `specs/003-family-growth-garden/checklists/*.md`
- [x] T180 Run the Spec Kit context update and cross-artifact analysis, resolve every P0-critical finding, run documentation/repository validation, and commit the Revision 3 planning amendment without staging ignored Windows metadata or generated Android files

## Phase 13: Post-Stitch Growth Journey Execution — Blocked

**Purpose**: Execute only after a complete user-approved Growth release and its prerequisite
Revision 2 shells receive an explicit integration-owner release.

- [ ] T181 Preserve and inventory the approved Growth Stitch release, canonical PNGs, matched English frames, screen specs, non-runtime exports, states, motion, assets, hashes, provenance, and approval under its exact user-approved ID in `docs/design/stitch/releases/` and `specs/003-family-growth-garden/design-intake/`
- [ ] T182 Audit that the release supplies complete Child access/Today/Garden/League and result handoff, Parent Check-in and selected-Child origins, and every Growth route/state prerequisite in `specs/003-family-growth-garden/design-intake/`
- [ ] T183 Freeze exact routes, Back/deep-link behavior, components, responsive rules, persistence/migration choice, digit strategy, content dispositions, and a bounded release gate in `specs/003-family-growth-garden/{plan.md,quickstart.md}` and `specs/003-family-growth-garden/design-intake/`
- [ ] T184 [P] [US9] Add failing introduction, replay, deferred-deep-link, and split-reset tests in `tests/revision3-introduction.test.ts`
- [ ] T185 [P] [US10] Add failing Path/badge/mastery evaluator, idempotency, profile-isolation, migration, and reveal-recovery tests in `tests/revision3-growth-journey.test.ts`
- [ ] T186 [P] [US11] Add failing learning/equal-credit/zero-Seed and Parent selected-Child view tests in `tests/revision3-learning-progress.test.ts`, then record intentional RED results for T184–T186 in `specs/003-family-growth-garden/checklists/revision3-red-green.md`
- [ ] T187 Implement approved Growth models, pure evaluator, exact fixtures, migration, service seam, store integration, and the smallest approved local persistence adapter in `src/models/**`, `src/features/growth-journey/**`, `src/services/**`, and `src/state/**`
- [ ] T188 [US9] Implement the approved native launch configuration, interruptible Opening Moment, exactly three introduction panels, Finish/Skip R001 handoff, and safe replay/origin recovery in `app/**` and `src/components/growth-journey/**`
- [ ] T189 [P] [US10] Build approved reusable native Impact Path, My Badges, Badge Detail, RevealBundle, and reduced-motion components in `src/components/growth-journey/**` without DOM, copied CSS, or web dependencies
- [ ] T190 [US10] Integrate the approved Today/Garden entry points and Parent Check-in/Child result handoff into the exact released `app/**` paths
- [ ] T191 [US11] Integrate the approved Mangrove story/equal-credit route and Parent selected-Child progress into the exact released `app/**` paths
- [ ] T192 [P] Complete Arabic/English resources, bidi/accessibility semantics, source rows, original-art provenance, and named factual/cultural/safeguarding/accessibility/rights dispositions in `src/i18n/**`, `docs/content/**`, and the applicable release/checklist records
- [ ] T193 Run all tests and repository checks plus 390×844 comparison, small/large/tablet responsive, keyboard, 200% text, RTL/LTR, bidi, TalkBack, reduced-motion, offline, Back/deep-link, kill/relaunch, reset, physical Android, and rehearsal evidence; record truthful results in `DEMO_RUNBOOK.md` and `specs/003-family-growth-garden/checklists/revision3-release.md`

## Dependencies and Execution Order

- T111–T119 are complete for R001 Batch 1; T120 remains open for the complete Revision 2 intake.
- T175–T179 are documentation-only and do not complete or bypass T120 or any runtime task. T180
  closes only after analysis, validation, and the authorized documentation commits.
- Only the exact R001 partial slices named above may proceed before a full `RELEASED` T120 gate.
- Every other portion of T121–T174 depends on an explicit full release.
- US1 and US2 depend on the shared access foundation; US3 depends on Parent access; US4 depends on
  assigned-task contracts; US5 depends on submission; US6 depends on League policy and the receipt;
  US7 depends on League/reward policy; US8 integrates all stories.
- The Batch 1 portion of T167 may proceed now; its complete task and T168–T174 remain dependent on
  all story phases and the later selected Stitch systems.
- T181–T193 depend on a separate complete Growth Stitch release, T120 or an explicitly bounded
  successor gate, and the relevant Child access/shell, Parent Check-in, result, and selected-Child
  foundations from T121–T174. Growth frames never authorize those prerequisites implicitly.
- Within Phase 13, T181 → T182 → T183 → T184–T186 RED → T187 domain → T188–T192 UI/content → T193
  verification. Tasks marked `[P]` still require disjoint file ownership.
- Parallel `[P]` work owns disjoint files only and never authorizes overlapping route, store, i18n,
  token, test, or design-intake edits.

## Revision 3 MVP

No single story is the MVP. The competition slice requires separate Parent/Child access, Parent
task assignment, Child bounded completion, praise-first confirmation, permanent garden growth,
five-Leaf League, private Family Reward unlock, bilingual navigation, and deterministic reset.
The Growth amendment adds only one first-run introduction, one Water & Coast chapter, the exact 16
configured private badges, one combined reveal, one Mangrove learning package with equal-credit
alternative, and one Parent read-only progress view. It adds no fourth tab, second currency,
public badge profile, location proof, live media/AI, additional chapter, or production sync.

## Evidence Discipline

- Checked T111–T119 prove only the recorded R001 design-intake work. Runtime and evidence tasks stay
  unchecked until directly completed for their exact scope.
- Checked T175–T179 prove documentation reconciliation only. They do not prove Stitch design,
  runtime, persistence, content approval, web, Android, accessibility, or human review.
- Revision 1 results remain `HISTORICAL`.
- Web/source evidence cannot pass Android or named-human gates.
- Synthetic access is not production authentication; Family Reward is not payment/custody; prepared
  voice is not live recording or unrestricted speech understanding.
- No task authorizes commit, push, merge, deployment, dependency change, or history rewrite without
  separate user/integration-owner authority.
