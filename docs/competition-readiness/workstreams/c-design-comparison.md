# C-001 — Existing Child Today direction and state comparison

- Authoring instance: `C-20260911T221908Z-root`; Session C bounded AI assistance.
- Grant: `C-001-r1`, board revision 1, A message `A-20260911T2220Z-002` acknowledged.
- Worktree / branch: `/home/smyk/projects/Ghaf-ui-studio` / `redesign/ui-studio`.
- Source baseline: `02b9618631fa9fc1b29f2cda5fa68c6adb2003fd`.
- Sole write boundary: this report. Runtime code, tokens, translations, assets and flags unchanged.
- Result: recommend Family Field Journal; direction selection and student review **PENDING**.
- Source inspection and historical-capture review only; fresh browser/native checks **NOT RUN**.
- Root runtime model settings unexposed; user config reads `gpt-6-astra` / `xhigh` / `fast`,
  which does not establish active Ultra. Helper launch accepted `gpt-6-astra` / `ultra`;
  Fast is not exposed by the helper launcher. No configuration was modified.

## Read-only visual/state audit — completed comparison (do not repeat)

**Scope and provenance.** Representative component: `ChildTodayTaskCard` within existing Child
Today, not a new surface. Read current 003 botanical spec/plan/tasks, 005 access plan, PRODUCT,
RESEARCH_BASIS, active DESIGN/DESIGN_DIRECTION, Growth prompt-pack/preflight, limitations,
ownership, runbook, shared contract, strategy, catalog, QA, demo and assistance records. Read
orientation pages 10/17 and the supplied GitHub guide with the existing local PyMuPDF tool;
no document action or imported template executed. Read Impeccable native audit/Android guidance
and Expo design-system audit; do not assign a native conformance score from source.

Current source baseline is `02b9618631fa9fc1b29f2cda5fa68c6adb2003fd`. The relevant committed
003 botanical specification authority is `55f9f2bb91c6097362a7a1cf7f838739e3b79842`.
`git diff 55f9f2b HEAD --` the Child Today route/card/landscape, task fixture and Parent
Home/lifecycle/canopy files returns no changes. This connects source inspection to historical
captures without making the old captures fresh runtime or native passes.

**Visible problem and action.** In prior Arabic 390×844 evidence, the greeting/landscape occupies
the first panel, the task begins around y=328, and the lower navigation begins around y=767.
The primary task action is below the visible viewport after rationale and metadata. Choosing
should be easy to discover while the accepted award, adult requirement and permitted help remain
clear and unclamped. The action is `اختيار هذه المهمة` / `Choose this task`; it chooses the
approved task, not completion or growth. Current JSX places long rationale before metadata,
help and the action (`ChildTodayTaskCard.tsx:86–163`). This is a **P2 hierarchy observation**,
not proof of an unreachable button or a physical-phone failure.

### One three-direction comparison, same component and state set

| Direction requested by user | Hierarchy and composition                                                                                                                                                                           | Image use                                                                                    | Tradeoff / C recommendation                                                                                                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Family Field Journal        | Status + task title; a readable facts/help group; existing primary/secondary choices; full rationale remains in the reading flow. Open spacing and a restrained rule instead of more nested panels. | Keep the existing landscape context outside the card; no new photo or baked-in text.         | Recommended for Child choice/help and the later recognition story; aligns with catalog recommendation and existing botanical system. Exact action position must respect safety and large text. |
| Calm Family Studio          | Same title and facts in a quieter paper panel, one aligned column, more compact secondary status, generous control separation.                                                                      | Existing landscape remains a small supporting anchor; no decorative imagery within the card. | Viable but risks making the Child task feel like a Parent form and weakening the landscape connection. Not selected by C.                                                                      |
| Landscape Explorer          | Same task information follows a larger existing landscape context, with a stable task/action region; no map, route, location or invented milestone.                                                 | Gives approved local artwork the most space; photographs never mirror in RTL.                | Not recommended for this component because image height worsens the observed action-discovery problem at compact height. Retain Garden's existing expressive role without extending this task. |

The catalog labels its alternatives Canopy Atlas and Family Workshop; the table uses the three
names requested in this session and compares their composition on the same existing card.
No new visual authority/token set is created. Official mark, botanical identity, Alexandria,
Readex Pro, logical RTL and current strings stay constant. **A/user selection: PENDING.**
C's rejected directions are recommendations, not a fabricated human rejection or acceptance.

### Actual bilingual state inventory (source evidence, no fresh rendering)

| State / authority                                 | Current visible state and action (Arabic / English)                                                                                                                  | Required verification after grant                                                                                   |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Assigned                                          | `مهمة جاهزة للاختيار` / `Ready to choose`; `اختيار هذه المهمة` / `Choose this task`; optional smaller-task action                                                    | Choice calls existing callback once; zero award; primary and smaller option discoverable; supervision/help visible. |
| Chosen                                            | `جاهزة للبدء` / `Ready to start`; `عرض تفاصيل المهمة` / `View task details`                                                                                          | Opening details is separate from starting; keep route handoff.                                                      |
| In progress                                       | `قيد التنفيذ` / `In progress`; `متابعة المهمة` / `Resume task`                                                                                                       | Preserve task/checklist/Coach state; no new completion logic.                                                       |
| Submitted                                         | `أُرسلت للمراجعة` / `Sent for review`; `عرض حالة الإرسال` / `View submission status`                                                                                 | Existing waiting notice explicitly says no Seeds/growth added. No confirmed visual.                                 |
| Confirmed, recognition pending                    | `سُجّل الاعتماد` / `Approval recorded`; no card primary action                                                                                                       | Existing separate notice says full recognition is next; no UI-owned award.                                          |
| Recognized                                        | `اكتمل التقدير` / `Recognition complete`; existing Garden action                                                                                                     | Default 48→60 and Mangrove 48/60→60/60; R002b flags remain off. No replay award.                                    |
| Retry                                             | `جاهزة لمحاولة لطيفة أخرى` / `Ready for another kind attempt`; existing return-later notice                                                                          | Preserve paused policy and no-loss state; do not invent a resume command.                                           |
| Smaller request pending / Child decision required | Existing route-level explanatory notice, disabled choice; alternate/keep controls outside card                                                                       | Disabled behavior, focus, explanation and full-award permitted-help path stay intact.                               |
| No assignment                                     | Route omits current task card; `لا توجد مهمة معيّنة الآن. اختر الخطوة التالية مع وليّ الأمر.` / `No task is assigned right now. Choose the next step with a Parent.` | No fabricated task, count or CTA.                                                                                   |
| Local command error                               | Existing route-level safe-retry message                                                                                                                              | Preserve input and route-owned error; do not hide a domain failure with layout.                                     |
| Loading / network error                           | Card has no fetch/loading interface; deterministic props                                                                                                             | N/A to card, not a new skeleton/spinner. Prepared Coach busy/fallback belongs to its own surface.                   |
| Reentry / reset / reload                          | Route owns focus/selection guards; known process-local progression limitation                                                                                        | Source-only inspection does not pass restart. B owns recovery contract; C must not promise durable memory.          |

The map is sourced from `app/child/index.tsx:60–78,315–356,592–675` and existing
`childHome` resources at `src/i18n/resources.ts:672` / `:2540`. These are exact current labels,
not new bilingual copy proposals.

### Additional focused findings

- **C-F004 (P2, historical image + unchanged source):** Child action-discovery issue above.
  Candidate fix stays inside the granted card; any hero adjustment is a second exact grant.
- **C-F005 (P2, historical visual observation, fresh browser/native NOT RUN):** The Arabic effort
  line in `ar-390-child-assigned.png` appears as `30–15` rather than the source range `15–30`.
  `src/features/tasks/demoContent.ts:209` uses an unisolated en-dash range and
  `ChildTodayTaskCard.tsx:102` renders it as one RTL label. Source has a reusable bidi isolation
  helper, but do not rewrite shared content from C. Exact canonical copy proposal is in outbox 003.
- **C-F006 (P2, source finding):** Card `MetadataRow` renders the award without the `tabular` prop;
  `Text` defaults that prop to false (`primitives.tsx:205`). The top Seed balance already opts in.
  Correct inside C's card grant when activated; a visual check, not a style-mirroring unit test,
  should establish numeric alignment. This is not evidence of changed award arithmetic.
- **C-F007 (P2, candidate for A review):** Historical Arabic Parent Home places canopy above its
  primary task section; the action begins behind the lower viewport edge. Current route order is
  unchanged (`app/parent/index.tsx:673–693`). An order change belongs to A's route boundary; do not
  disguise it as a C-only lifecycle-card edit. No new Parent pending-state capture was obtained.

**Keep working behavior:** logical row helpers, wrapping labels, scalable typography, token-based
surfaces, native Pressable callbacks, disabled/busy semantics and Reanimated reduced-motion reset
are present. The task card owns no router, store, provider or progression calculation. Its existing
props cover this presentation refinement. No new library, icon system, asset or layout authority
is needed. Essential text remains visible in the scroll flow; 32dp decorative metadata chips are
not buttons and are not misreported as undersized touch targets.

### Evidence used and proposed bounded verification

Inspected existing local images, all under `/home/smyk/projects/Ghaf/output/competition-readiness/qa/`:

| File                        | Scope                                                                     | SHA-256                                                            |
| --------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `ar-390-child-assigned.png` | Prior Arabic assigned Child Today, 390×844                                | `dabb9075edad16998497961b19ca83e30dd4a2556f2d293c313d12e00249b738` |
| `en-320-coach.png`          | Prior English prepared Coach, 320×720; different state, not a locale pair | `ef53e91a1086375409d6523c38e591d62df5c3083ef95cab9c9b24c2bcb2b17b` |
| `ar-390-parent-home.png`    | Prior Arabic Parent Home, 390×844                                         | `a295a09d0c9492074c59a8dcd16fc56e13fe3a450197bd158e226024a7e903e9` |

No fresh captures, paired same-state captures, browser matrix, tests, build or native interaction
were run. The older `output/botanical-review/` directory referenced in historical docs is absent
in this checkout; do not claim its paired images were inspected.

Once A grants a component and the single preview lane, inspect AR/EN × 320×720/390×844 together:
assigned, chosen, active, submitted, confirmed-pending, recognized, retry and adjustment-disabled
props; route-level empty/error/reset only where applicable. Check 200% browser text stress,
long Arabic/mixed-script names, visible keyboard focus, reachable 48dp minimum actions and
standard/reduced motion in one batched pass; correct observed defects, confirm affected cases once.
At 200% scrolling is expected; do not shrink text to force a one-screen fit. Same-state AR/EN
captures must be newly generated at the exact candidate hash. A/D own integrated/native evidence.

Proportional future checks: scoped lint/format + `npm run typecheck`; existing
`tests/r002a-child-task-presentation.test.ts` and `tests/child-task-flow.test.ts` if interaction
wiring changes. No new tests merely assert spacing/order/styles. Full suite/export needs A's
heavy-job slot and is not rerun for this read-only status. Physical keyboard/Back/TalkBack/font
scale/touch/reduced motion and named Arabic/content/student review remain NOT RUN/PENDING.

## Proposed grants and owner handoffs

The numbered messages below are proposals copied from C's canonical outbox. A owns decisions;
these do not make a component READY or authorize shared-file edits.

2. **C-20260911T221908Z-root-002 → A — comparison and proposed component queue (unacknowledged).**
   The single three-direction comparison above is complete. Recommend Family Field Journal;
   record user reconciliation/selection without inventing a human reviewer. Proposed first C
   grant: `src/components/r002a/child/ChildTodayTaskCard.tsx` plus
   `docs/competition-readiness/workstreams/c-design-comparison.md`, existing 003 botanical
   authority `55f9f2b`, base `02b9618`. Preserve the existing props/callbacks and all mandatory
   text; improve action/help proximity and tabular metadata only. After its validated local
   commit/release, proposed second independent grant: `src/components/r002a/child/ChildTodayLandscape.tsx`
   plus the same C report, to reduce image/greeting dominance while preserving every label and
   the existing profile/stage-selected artwork. This second proposal needs its own accepted
   component scope; it is not self-assigned. Reserve the preview lane for the batched locale/state
   matrix, and one helper for a nonduplicative Arabic/English audit after quota activation.
   Shared routes/tokens/i18n/config/tests stay with their owners unless explicitly transferred.
3. **C-20260911T221908Z-root-003 → A (content owner), B/D for awareness — exact bidi-copy proposal
   (unacknowledged; not applied).** For C-F005, propose changing only the existing canonical field:

   ```diff
   --- a/src/features/tasks/demoContent.ts
   +++ b/src/features/tasks/demoContent.ts
   @@
   -  estimatedEffort: text('15–30 دقيقة', '15–30 minutes'),
   +  estimatedEffort: text('من 15 إلى 30 دقيقة', '15–30 minutes'),
   ```

   Arabic rationale: «توضح الصياغة بداية المدة ونهايتها من دون التباس اتجاه الشرطة بين العددين.»
   English rationale: explicit Arabic “from … to …” keeps the same fifteen-to-thirty-minute
   duration while avoiding RTL range ambiguity; English remains equivalent and unchanged.
   This modifies the existing fixture authority, not a second string in the UI. Named Arabic
   review is PENDING; verify affected existing fixture assertions and both Today/task-detail
   renderers. Alternative technical isolation may be chosen by A, not added concurrently by C.

4. **C-20260911T221908Z-root-004 → A and D — scope/evidence handoff (unacknowledged).**
   C's findings are source inspection and review of prior images, not freshly reproduced D
   runtime defects. Parent Home order in C-F007 requires an A-owned route decision; B retains
   restart/progression authority. No new paired captures or native passes exist. Please use the
   recorded candidate-state matrix after integration; do not repeat old baseline audits merely
   because C has finished. All C source/helper/preview allocations remain unacquired.

## AI contribution and exact prompts

C produced this one bounded comparison, source/state inventory, evidence classification and
proposed queue/copy patch. There is no implementation diff, generated image or copied template.
The three directions were compared once; Calm Family Studio and Landscape Explorer were not
recommended for this component. These are C judgments; no human selection was recorded.
Student owner, teach-back, exact-diff acceptance and named Arabic/native reviews remain pending.

The user supplied the full Session C role prompt preserved at source baseline in
`docs/competition-readiness/orchestration/session-c-ui-studio.md`, SHA-256
`861c170ae5ed3fdd236253fd16d99abc7c4c1eee184c9b4dfbf703de034c1cb5`.
No additional user steering was received while preparing this report.

### Exact helper prompt — `/root/duration_review`

```text
Session C scoped read-only helper under board C-001-r1; quota one, no descendants. Worktree /home/smyk/projects/Ghaf-ui-studio branch redesign/ui-studio HEAD 02b9618631fa9fc1b29f2cda5fa68c6adb2003fd. You are not alone in the codebase. Preserve others' edits; NO WRITES, no coordination edits, no browser/server/test-suite/build/install. Read AGENTS/appropriate authority for this bounded source audit. Task: independently check C-F005: historical Arabic 390x844 image /home/smyk/projects/Ghaf/output/competition-readiness/qa/ar-390-child-assigned.png appears to display reversed 30–15 range. Canonical src/features/tasks/demoContent.ts:209 has estimatedEffort text('15–30 دقيقة','15–30 minutes'); ChildTodayTaskCard renders RTL. Review screenshot via view_image and trace consumers + meaningful existing test assertions. C proposes ONLY canonical Arabic text changed to 'من 15 إلى 30 دقيقة', English unchanged (NOT applied). Assess if this is a justified safe proposal, what exact source/fixtures/tests A/B would own, and flag any canonical-fixture parity constraints or better existing bidi helper solution. Do not implement. Report evidence vs inference and native NOT RUN. Root C meanwhile writes direction report; do not duplicate visual direction exploration. Requested actual launch settings GPT-6 Astra / ultra; Fast not controllable here. Send bounded findings and exact references, then release your read-only allocation.
```

## Independent helper findings and lead review

`/root/duration_review` independently inspected the historical Arabic 390×844 image and supports
C-F005: the visible range reads `30–15`, while source expresses `15–30`. The proposed canonical
Arabic wording `من 15 إلى 30 دقيقة` keeps the same duration and does not change +12 or task safety.
Lead C accepts this as a source/historical-image finding and an owner handoff, not a fresh
browser reproduction, human copy approval or permission to change runtime.

If A selects the proposal, the exact coordinated copy/test boundary is:

- `src/features/tasks/demoContent.ts:209` (the existing canonical field).
- `tests/child-task-flow.test.ts:80` and
  `tests/parent-task-flow.test.ts:115,502` (exact expected Arabic text; assertions remain strict).

The prepared fixture and live request/schema derive from that canonical template; do not create
parallel fixture wording or patch only one renderer. Optional live Parent Guide validation uses
exact canonical content (`src/features/assistants/liveParentGuide.ts:115,141,166–168`). A separately
running older gateway could return old wording that is rejected into prepared fallback; no live
gateway is deployed or enabled by this report. Validators and release flags stay unchanged.
Helper final response received and read-only allocation released; no descendants/processes remain.
Helper ran no test, browser, install, source edit or native activity. Named Arabic and device review
remain NOT RUN. This independent contribution checks one bounded finding; it does not repeat the
three-direction comparison or stand in for student review.

## Student explanation packet

A student can explain the proposed change using the existing component interface: the route sends
a status, translated labels and callbacks; the card arranges them. Choosing, starting, submitting
and recognizing are different state transitions. Moving a label or action never computes an award.
The full-credit permitted-help rule remains in domain commands. Garden imagery depicts already
confirmed state, and a smaller pre-acceptance task is an explicit Parent/Child decision.

The design recommendation follows the observed action-discovery problem: keep botanical identity,
group the terms needed to choose safely, and place existing action/help controls near those terms.
No proposed copy, layout or AI suggestion establishes student selection, implementation or native
acceptance. The contribution record is ready for a named student to review and explain.

## Validation and release record

- Initial scoped Prettier check failed formatting only; `prettier --write` corrected this report.
- Final scoped Prettier check PASSED (exit 0); Git whitespace check PASSED (exit 0),
  2026-09-11 22:24 UTC. The final staged report receives the same checks before commit.
- Historical screenshot identities are above; source baseline comparison returned no changes in
  the exact inspected components/route/fixture between `55f9f2b` and `02b9618`.
- No runtime source was edited, so application tests/typecheck/build/browser/native checks were
  not rerun. No dependency install or heavy/preview allocation was used.
- The report commit and exact release are published in canonical `STATUS-C.md`; no source
  implementation or release activation is included. Human selection/acceptance remains pending.
