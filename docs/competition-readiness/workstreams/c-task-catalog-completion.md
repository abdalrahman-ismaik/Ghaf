# Complete the existing task catalog — C implementation handoff

The user has selected making every existing task usable. This selection is recorded; another
choice between a preview and a working catalog is unnecessary. This document prepares the
implementation contract and content for that work. It does not implement or enable the tasks.

Inspected on 2026-09-13 in `/home/smyk/projects/Ghaf`, branch `redesign/ui-experiments`.
Initial source `7fcb8b61e04fbd9a2ed2caef924b872a400c31d0`; subsequent HEAD
`e7fa118593616cc3ab2562eb76c37588add3d98e` commits A's independent Slice2 accessibility contract.
Canonical board revision97 grants no catalog execution changes. C has not edited runtime,
shared localization, services, the store, specifications, flags or the Git index for this task.

## Why almost every task is unavailable

The catalog has **24 templates in eight categories**, plus a separate executable recycling
fixture. The existing implementation deliberately allows only `task_recycling_p0_v1`, assigned
to Salem, through the full Parent approval → Child action → Parent confirmation journey.
Feature013 FR-009 explicitly requires other catalog and saved entries to remain planning
previews until separately approved. The badge accurately describes this implementation gap.

There are twelve recognition-only templates and twelve templates with existing awards of
4, 6 or 8 Seeds. Recognition-only tasks should become usable with private acknowledgement and
zero growth; enabling them must not turn faith, gratitude, affection or relationship closeness
into a points system. The separate recycling demonstration retains its accepted **+12** award.

| Observed boundary        | Current implementation                                                                                                                                                    | Required change                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parent composer          | `src/components/family-growth/ParentTaskComposer.tsx:191` requires Salem + Green Impact + P0; line231 drafts the P0 ID. Unavailable cards/labels occur around683/728/743. | Select a reviewed catalog definition and configured Child; create a distinct assignment instance after review.                                              |
| Service approval         | `src/services/mock/index.ts:498` rejects other tasks; store `src/state/usePrototypeStore.ts:3642` independently requires the canonical assignment.                        | Both producer and verifier must agree on reviewed catalog authorization. Removing only a screen guard is ineffective.                                       |
| Child choices            | `src/models/familyGrowth.ts:125` defines two preview choices plus one P0 choice. `app/child/index.tsx:711` displays preview-only cards.                                   | Derive choices from that Child's approved assignments. Keep Parent catalog ideas out of Child execution choices.                                            |
| Task identity            | `familyGrowth.ts:405` keeps one global journey; a new draft replaces it. Service line604 reuses `submission_recycling_p0_v1_attempt_N`.                                   | Separate template, assignment occurrence, submission attempt and receipt identities; retain unfinished assignments when another starts.                     |
| Instructions             | `app/child/task.tsx:224` treats version1 as recycling; line297 always submits permitted-help and recycling facts.                                                         | Bind the actual approved definition, steps, help choice and applicable evidence to each instance. No recycling facts on schoolwork or family tasks.         |
| Awards and eligibility   | Rewards use submission IDs for idempotency. Family Reward and League independently allow only canonical P0; receipt verification checks those rules again.                | Collision-free receipts; preserve existing fixed-award/help/idempotency logic. Execution does not automatically confer Reward, League or badge eligibility. |
| Existing catalog content | `src/features/tasks/demoContent.ts:274–314` supplies shared generic effort/help/safety defaults, not a complete per-task checklist.                                       | Review the task-specific content below, preacceptance accommodations and exact completion criteria.                                                         |

This is a source trace, not a newly reproduced browser or Android failure. No button was enabled
to manufacture a passing journey. A fresh visual pass belongs to the implemented candidate.

## Proposed accepted behavior

Retain the selected botanical identity, current Tamagui system, Alexandria/Readex, logical RTL
helpers and the selected Dailoz Parent composition. No new design exploration or template asset
import is needed. Improve the current catalog and task journey rather than adding a parallel app.

| Moment                  | Before                                                    | Required completed behavior                                                                                                                                                                                                                        |
| ----------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parent chooses a task   | Most categories end in a future badge.                    | Choose a Child, category and one of the 24 reviewed templates. See the actual action, safety conditions, completion criterion and award or recognition-only meaning.                                                                               |
| Parent prepares support | Generic help text; P0-specific smaller alternative.       | Agree a concrete attainable step and permitted help before approval. A smaller replacement is separately agreed before acceptance; help alone never reduces the displayed award.                                                                   |
| Parent approves         | Only Salem recycling proceeds.                            | Approve a versioned instance for the selected Child. Review cancellation creates no assignment or recognition.                                                                                                                                     |
| Child chooses           | One executable choice and prepared previews.              | See only their approved, actionable tasks, with clear selected and pending states. Sibling assignments and Parent-only catalog drafts are absent.                                                                                                  |
| Child acts              | Recycling checklist and prepared recycling Coach content. | Read the correct task steps, ask for permitted help, start and submit the actual agreed action. Step taps do not verify completion. No unmatched prepared Coach response is presented as task-specific advice.                                     |
| Parent checks in        | One global recycling journey.                             | Review the selected Child and assignment, acknowledge help, request a supported retry or confirm once. Another task remains intact.                                                                                                                |
| Recognition             | Recycling praise then +12 and growth.                     | Describe the action/help first. Award-bearing acquisition tasks receive their accepted fixed amount once. Recognition-only and maintenance tasks receive acknowledgement with no Seeds, persistent landscape/canopy growth or reward contribution. |
| Continue                | Another draft can replace the global journey.             | Return to the Child's remaining tasks. A Parent may create a new reviewed occurrence without resetting history or reusing a prior receipt.                                                                                                         |

All normal states must work: no assignments, draft/review, selection, active, waiting for Parent,
retry, confirmation, completed, local command error and reentry. Waiting never shows confirmed
growth. Recognition-only completion must not show an “earned 0 Seeds” growth celebration.
Nothing is automatically scheduled by a saved recurrence preference; a later calendar is separate.

### Authority and instance contract to commit before source work

A should assign the feature/amendment identifier and commit the accepted contract, plan and tasks.
Amend the sole-P0 limitation in Feature003 and Feature013 FR-009 explicitly. The new story must
state how it interacts with Feature013's default-off presentation flag; neither flipping that
flag nor adding a new flag by inference creates execution authority. All R002b flags remain off.

The smallest useful contract needs these distinct concepts:

1. **Reviewed template definition:** stable template ID and content revision; category, allowed
   age bands, paired title/action/steps, exact completion criterion, safety/adult role, permitted
   help and reviewed alternatives; existing recognition mode, phase, award and privacy rules.
   Content-review metadata alone is not human acceptance. Parent custom wording must pass its
   own validated review; it cannot copy an executable template ID to bypass policy.
2. **Assignment occurrence:** household/profile scope, unique occurrence ID, template revision,
   immutable approved snapshot, Parent approval and lifecycle. Selecting it only changes the
   active context pointer. Creating another never discards an active or submitted assignment.
3. **Submission attempt:** unique ID under that occurrence; retry creates a new attempt and
   preserves history. Actual help/evidence must conform to the approved task policy. No default
   recycling fact, media fixture or false “completed with help” claim.
4. **Confirmation/recognition evidence:** existing detached-provider validation, praise-first
   boundary and immutable idempotent receipt. Reject wrong Child, stale version, duplicate or
   malformed commands. Routine review counts use Child + routine identity, not template ID alone.
5. **Profile projections:** selectors expose that Child's active/pending/completed assignments
   and confirmed Seed evidence. Screens never calculate awards, unlocks or eligibility.
   Reset clears the complete new assignment/attempt/context collection and restores the exact
   synthetic baseline without touching another household's retained device identity implicitly.

IDs may be deterministic local sequence IDs under household generation/profile/occurrence, but
must not be generated from the template alone or a reused P0 submission literal. Preserve P0
legacy IDs and existing receipts through an explicit compatibility adapter; do not rewrite earned
history. Actual recurrence scheduling and Recovery014 persistence are outside this catalog slice.
The approved contract must state existing process-lifetime limitations honestly.

### Preserve the separate authorities

- Canonical P0 remains +12 with permitted help; baseline Seeds48→60 and Mangrove48/60→60/60.
  The lifetime108→120 Family Reward fixture remains a separate setup.
- GI01 is a different catalog task with an existing8-Seed acquisition award. Do not equate its
  ID or receipt with P0 recycling or silently change either award.
- The twelve recognition-only templates remain zero for Seeds, Garden, League/canopy and Family
  Reward. Maintenance also creates zero persistent growth. No new badge criteria are inferred.
- Learning practice may retain its existing acquisition award after contract review; marks,
  grades and educational participation cannot become Family Reward eligible.
- Newly executable tasks remain outside the existing League and Family Reward allowlists unless
  A separately commits exact reviewed eligibility and updates producer **and** verifier together.
  More tasks cannot earn extra weekly League rank. Five Leaves, ties and help-equivalent credit
  remain unchanged.
- Green-only household sustainability projection and private category boundaries remain intact.
  An action is not measured environmental impact. No invented quantities or energy-saving totals.
- A's revision97 checkpoint records the user's selection of **personal landscapes per Child,
  with a separate shared family canopy**. That decision is settled; the implementation grant
  remains separate. Reconcile the legacy global landscape projection with profile evidence before
  accepting two-Child growth. C does not implement that authority by rearranging Garden cards.

## Exact proposed implementation sequence and file ownership

These are **requested grants, not active reservations**. A retains shared resources and the index.
Avoid a single broad file grant that lets multiple helpers edit the store or translations.

| Slice                        | Suggested owner and exact existing seams                                                                                                                                                                                                                                                                                                                              | Deliverable before release                                                                                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract/content             | A: `specs/003-family-growth-garden/{spec,plan,tasks}.md`, `specs/013-parent-task-workspace/{spec,plan,tasks}.md`; A chooses one new contract path and accepted identifier. Content: `src/features/tasks/demoContent.ts`, `src/i18n/resources.ts` only after exact grant.                                                                                              | Accepted scope, 24 reviewed definition snapshots, recognition/award decisions, Child age rules, profile/Garden authority, bilingual content and review status.                    |
| Instance model and lifecycle | B after A transfer: `src/models/familyGrowth.ts`, `src/services/interfaces/index.ts`, `src/features/tasks/lifecycle.ts`, `src/features/tasks/validation.ts`, `src/services/mock/index.ts`, `src/state/usePrototypeStore.ts`. Proposed new `src/features/tasks/assignmentInstances.ts` must be explicitly granted.                                                     | Multiple isolated assignments, unique attempts, no lost work, exact task approval/submission policy, P0 adapter and reset. Store serialized with other A work.                    |
| Recognition projections      | A/B sequentially: `src/features/tasks/recognitionProviderBoundary.ts`, `src/features/tasks/recognitionSession.ts`, `src/features/rewards/policy.ts`, `src/features/family-hub/index.ts`, `src/features/league/recognitionRuntime.ts`. Change only if required by the accepted contract.                                                                               | Generic task recognition with unchanged prohibited/unknown eligibility, help credit and duplicate protection. Existing module reuse preferred over another awards engine.         |
| Parent catalog and review    | C requested: `src/components/family-growth/ParentTaskComposer.tsx`, `src/components/r002a/parent/ParentTaskWorkspace.tsx`, `src/components/r002a/parent/ParentTasksView.tsx`, `src/components/r002a/parent/ParentReviewTaskCard.tsx`; focused `tests/tasks/parent-task-composer-profiles.test.tsx`, `tests/tasks/parent-task-workspace.test.tsx`.                     | Real selectable templates, explicit award/recognition meaning, correct selected Child, immutable review, real command loading/error/retry and no future badge on supported tasks. |
| Child task presentation      | C requested after interfaces release: `src/components/r002a/child/ChildTodayTaskCard.tsx`, `ChildTaskPlanCard.tsx`, `ChildTaskChecklist.tsx`, `ChildTaskHero.tsx`, `ChildTaskActionFooter.tsx`, `ChildTaskFollowUpContext.tsx` in that same directory; `tests/presentation/r002a-child-task-presentation.test.ts`, `tests/tasks/child-approved-instruction.test.tsx`. | Actual selected task, correct bilingual steps and non-awarding pending/completed states; help/selection/focus semantics. Reuse current approved controls.                         |
| Routes/check-in integration  | A: `app/child/index.tsx`, `app/child/task.tsx`, `src/components/family-growth/ParentCheckIn.tsx`; exact Parent route and result files only after tracing accepted selectors.                                                                                                                                                                                          | Thin routes select instance and pass authoritative commands. Correct return/Back, Child isolation, actual help facts and private confirmation.                                    |
| Candidate verification       | B/A domain tests; C one reserved AR/EN visual pass; D independent integrated/native checks.                                                                                                                                                                                                                                                                           | All24 coverage, mixed/multiple tasks, both configured profiles, reset and regression results; exact source/capture hashes with native gaps separate.                              |

Current conflict: A's active revision97 owns `ChildTaskPlanCard.tsx` for accessibility repairs.
Its prior writer must release before C receives this file. A also owns the current check/browser
lane. C has not started another Metro, browser, test pool or build. Preserve all released v2
narration edits; onboarding is unrelated to this catalog grant request.

During final preparation, the separate screen-clarity continuation also declared
`app/child/index.tsx`, `ChildTodayLandscape.tsx`, `app/parent/task/review.tsx`, `app/league.tsx`
and its League-header test in its own report. Preserve that active writer's edits and obtain its
release before overlapping integration. Its contract explicitly excludes catalog activation;
it is not an expected producer of the catalog-execution grant.

Recommended domain test seams are existing `tests/tasks/{task-lifecycle,child-task-flow,
parent-task-flow,parent-check-in-flow,reward-matrix,recognition-provider-boundary,
recognition-provider-store-boundary,task-catalog}.test.ts` plus explicitly granted new
`tests/tasks/catalog-assignment-instances.test.ts` and `tests/tasks/catalog-execution.test.ts`.
These proposed new paths do not exist as an implementation claim.

## Acceptance that demonstrates completion

The smallest engineering checkpoint is two different tasks for one Child plus the same template
for both Children, including one recognition-only task. It is a checkpoint, not completion of
the user's request. Continue through all24 templates and their applicable states.

| Check                      | Expected evidence                                                                                                                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalog coverage           | Every listed ID has reviewed AR/EN content, appropriate age/safety conditions and a complete Parent-review → Child-action → Parent-confirmation path. No placeholder handler or hidden mandatory step.    |
| Both Children              | Each permitted template works for Salem and Alya and for a configured Child within its reviewed age band. Wrong-profile/old-version/deep-link commands fail without state mutation.                       |
| Multiple tasks             | Start A, submit B, return to A; B stays pending. Reuse a template for another Child or another reviewed occurrence; all instance/attempt/receipt IDs remain distinct.                                     |
| Permitted help and retry   | Full accepted award with help. Only a smaller replacement agreed before acceptance changes the award. Retry never deducts earned growth; no automatic phase change.                                       |
| Confirmation/idempotency   | Approval alone, checklist taps and submission earn nothing. Confirm twice, double-tap/reenter and duplicate provider callbacks create one receipt and one permitted growth effect.                        |
| Recognition-only           | All twelve zero-growth templates complete with private acknowledgement. No progress delta, Family Reward contribution, League/canopy event or invented badge award.                                       |
| Policy                     | Unsafe/materially changed content, invalid age, prohibited evidence/reflection and unknown eligibility rejected at command boundary. Parent-approved title text cannot confer authority.                  |
| Task-specific presentation | All24 approved step packs selected correctly. Missing prepared Coach content falls back to reviewed steps/adult help; no recycling media, facts or script appear on unrelated tasks.                      |
| Regression                 | P0+12/no-loss, separate reward fixture, five-Leaf privacy/ranking, role isolation, reset and provider-failure fallback retained. Preview flag changes do not secretly alter unrelated R002b behavior.     |
| Bilingual/accessibility    | One batched AR/EN320/390 browser pass with long labels, empty/active/pending/retry/completed/errors, visible selection,48dp targets, focus and reduced motion. CSS large-text stress recorded separately. |
| Native                     | Exact APK/source/hash, actual phone/model/OS/font scale; TalkBack reading order, focus, keyboard/Back/touch and restart/reset. Browser dimensions or historical suites cannot pass these rows.            |

No new live AI, real media, task transport, unrestricted companion chat, notification scheduling,
map, wallet, payment, calendar or automatic recurrence is implemented by this story. Feature016
human messaging does not imply tasks or recognition synchronize across installations.

## Review, evidence and current release state

- **Selected:** user asks to complete all existing tasks. The current visual identity and separate
  Parent/Child boundaries are retained; no new direction vote required.
- **AI contribution:** C traced existing source, proposed the bounded instance contract and
  authored three paired steps per template. One read-only helper traced reusable task/recognition
  mechanisms and separately reviewed content. This is supporting content/design work, not a
  generated whole app or proof of improved wellbeing.
- **Human review:** no named student owner, exact-diff acceptance or new religious/cultural
  content reviewer has been supplied. The user's narration-text review delegation does not imply
  that new faith/cultural task scripts were human-approved. Such rows stay pending; independent
  implementation can proceed once A grants it. Category `reviewed_p0` metadata is not a new
  24-template human acceptance record.
- **Rejected shortcuts:** removing the badge alone; flipping the workspace flag; aliasing every
  task to P0; using one recycled submission ID; fabricating help/facts; granting Seeds for
  relationship closeness; extending Family Reward to education; displaying unreviewed Coach
  advice; assigning Garden authority in the view; inventing native passes or named reviewers.
- **Settings:** requested GPT-6 Astra / Ultra / Fast. Root effective serving settings are not
  exposed here. Reused helper's earlier launch was recorded Astra/ultra; its Fast control and
  current effective serving settings are unexposed. No setting change is claimed.
- **Evidence packet:** `output/native-ui/task-catalog-completion-20260913-c/` contains the
  extracted own-repository inventory, proposed bilingual content, bounded generator, assistance
  record, validation and source/artifact hashes. Originals/templates/assets remain untouched.
- **Implementation/native/browser:** NOT RUN for the new catalog story. No completed runtime
  diff/commit, screenshots or APK acceptance claimed. A revision97 currently grants only its
  unrelated Slice2 accessibility repairs. Runtime starts after A's committed catalog contract
  and exact C/A/B source grants, not after another user selection round.

The following content is a concrete review draft. It preserves each current title and award so
differences can be reviewed explicitly. Duration/title and safety clarifications are listed per
task; A must reconcile them before committing the runtime wording. Read the Arabic and English
steps as paired alternatives, not as instructions to display both languages at once.

## Complete 24-task content and acceptance draft

All rows are proposed content. Current source assigns all24 templates the generic age bands
`6_8`, `9_11`, `12_14`; this is not evidence each task has been individually reviewed for every
age. The contract must validate the actual selected profile and its approved adaptations.

| ID   | Current English title                                | Current acquisition award | Content/execution acceptance                                        |
| ---- | ---------------------------------------------------- | ------------------------- | ------------------------------------------------------------------- |
| FA01 | Prepare a clean prayer space                         | Recognition only;0 Seeds  | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| FA02 | Learn one Parent-approved phrase                     | Recognition only;0 Seeds  | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| RK04 | Spend ten phone-free minutes with a willing relative | Recognition only;0 Seeds  | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| HR02 | Prepare tomorrow's school bag                        | 6 Seeds                   | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| HR05 | Help an adult with a sealed light general-waste bag  | 8 Seeds                   | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| GI01 | Sort locally accepted clean recyclables              | 8 Seeds                   | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| FH01 | Help prepare a shared serving dish                   | 4 Seeds                   | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| FH04 | Arrange dates, water, or napkins for guests          | 6 Seeds                   | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| KC01 | Help with one small job a sibling chooses            | Recognition only;0 Seeds  | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| LW01 | Read or listen to a book for ten minutes             | 6 Seeds                   | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| FA03 | Share one gratitude moment the Child chooses         | Recognition only;0 Seeds  | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| RK01 | Call a relative chosen by the Parent                 | Recognition only;0 Seeds  | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| RK02 | Listen to a short family story                       | Recognition only;0 Seeds  | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| HR01 | Put books and pens in their places                   | 4 Seeds                   | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| GI02 | Switch off unused lights with an adult               | 4 Seeds                   | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| GI03 | Prepare a reusable water bottle                      | 4 Seeds                   | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| FH02 | Arrange napkins and cool utensils                    | 4 Seeds                   | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| HE01 | Choose an appropriate greeting with the Parent       | Recognition only;0 Seeds  | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| HE02 | Practise listening to a speaker in the majlis        | Recognition only;0 Seeds  | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| HE03 | Ask an adult about one heritage object               | Recognition only;0 Seeds  | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| KC02 | Write a short thank-you note                         | Recognition only;0 Seeds  | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| KC03 | Choose one small way to help at home                 | Recognition only;0 Seeds  | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| LW02 | Prepare a calm learning space                        | 4 Seeds                   | Content draft reviewed by AI; human review pending; runtime NOT RUN |
| LW03 | Break one project into three steps                   | 6 Seeds                   | Content draft reviewed by AI; human review pending; runtime NOT RUN |

Step kinds below distinguish Child actions from optional participation, adult responsibilities
and conditional cooperation. They are presentation metadata, never proof that the Child completed
an action. Declining an optional step cannot block submission. Skipping the whole task returns
to choices without fabricated completion or loss of earned progress. Required adult safety checks
and supervision remain prerequisites; informational rows do not require Child certification.

### الإيمان والامتنان / Faith & Gratitude

#### FA01 — تجهيز مكان نظيف للصلاة / Prepare a clean prayer space

Approved-action wording proposed: **جهّز مكاناً نظيفاً يختاره وليّ الأمر.**

Prepare a clean space chosen by the Parent.

| Step type     | Arabic                                      | English                                         |
| ------------- | ------------------------------------------- | ----------------------------------------------- |
| Agreed action | اختر مع وليّ الأمر مكانًا مناسبًا.          | Choose a suitable place with the Parent.        |
| Agreed action | رتّب المواد الآمنة التي اختارها وليّ الأمر. | Arrange the safe items the Parent selected.     |
| Agreed action | راجع المكان مع وليّ الأمر عند الانتهاء.     | Review the space with the Parent when finished. |

Retain `recognition_only` / 0 Seeds. No prayer performance, faith or cleanliness judgment; private acknowledgement, zero growth. Named religious-content review pending.

#### FA02 — التعرّف إلى عبارة يختارها وليّ الأمر / Learn one Parent-approved phrase

Approved-action wording proposed: **تعرّف إلى عبارة من مصدر يختاره وليّ الأمر.**

Learn a phrase from a Parent-approved source.

| Step type                          | Arabic                                  | English                                       |
| ---------------------------------- | --------------------------------------- | --------------------------------------------- |
| Adult responsibility / information | يختار وليّ الأمر العبارة ومصدرها.       | The Parent chooses the phrase and its source. |
| Agreed action                      | استمع أو اقرأ بالطريقة المناسبة لك.     | Listen or read in the way that suits you.     |
| Optional                           | جرّب ترديد العبارة مع المساعدة إن رغبت. | Try saying the phrase with help if you wish.  |

Retain `recognition_only` / 0 Seeds. Parent supplies the phrase/source; no generated scripture or religious judgment. Optional rehearsal, no correctness score. Named review pending.

#### FA03 — مشاركة لحظة امتنان يختارها الطفل / Share one gratitude moment the Child chooses

Approved-action wording proposed: **اختر إن رغبت شيئًا تقدّره؛ يمكنك الاحتفاظ بالفكرة لنفسك ولا يلزم الإفصاح عنها أو تسجيلها.**

If you wish, choose something you appreciate; you may keep it to yourself, with no disclosure or recording required.

| Step type                          | Arabic                                                            | English                                                                                |
| ---------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Optional                           | اختر شيئًا تقدّره إن رغبت.                                        | Choose something you appreciate if you wish.                                           |
| Optional                           | يمكنك التعبير بالكلام أو الرسم أو الكتابة إن رغبت.                | You may express it by speaking, drawing or writing if you wish.                        |
| Adult responsibility / information | يمكنك الاحتفاظ بالفكرة لنفسك؛ لا يلزم مشاركتها أو تسجيلها في غاف. | You may keep the thought to yourself; sharing or recording it in Ghaf is not required. |

Retain `recognition_only` / 0 Seeds. No required disclosure, forced gratitude, screenshot or stored emotional content; declining never removes earned progress. Optional/information metadata explicitly prevents mandatory expression or sharing.

### جذورنا / Roots & Kinship

#### RK04 — قضاء وقت قصير مع قريب يرغب في المشاركة / Spend a short time with a willing relative

Proposed title amendment; current title: قضاء عشر دقائق من دون هاتف مع قريب يرغب في المشاركة / Spend ten phone-free minutes with a willing relative.

Approved-action wording proposed: **اقضِ وقتاً قصيراً مع قريب يرغب في المشاركة.**

Spend a short time with a willing relative.

| Step type     | Arabic                                                                            | English                                                                                       |
| ------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Agreed action | اتفق مع وليّ الأمر وقريبك على وقت قصير.                                           | Agree a short time with the Parent and relative.                                              |
| Agreed action | اختر نشاطًا بسيطًا يرغب فيه الجميع.                                               | Choose a simple activity everyone wants.                                                      |
| Agreed action | شارك في الوقت المتفق عليه مع حرية التوقف واستخدام وسائل الإتاحة التي تحتاج إليها. | Take part for the agreed time, with freedom to stop and use the accessibility tools you need. |

Retain `recognition_only` / 0 Seeds. Reconcile fixed ten-minute title with an agreed duration before assignment; never force affection, time pressure or continued participation. Concrete proposed title removes fixed duration/phone prohibition; agreed duration and accessibility tools retained.

#### RK01 — الاتصال بقريب يختاره وليّ الأمر / Call a relative chosen by the Parent

Approved-action wording proposed: **اختر تحية أو سؤالًا قصيرًا مع وليّ الأمر، وشارك إن رغبت في مكالمة يرتّبها وليّ الأمر خارج غاف مع قريب موافق. يمكنك الاكتفاء بالتدرّب على التحية مع وليّ الأمر.**

Choose a short greeting or question with the Parent, and optionally join a call the Parent arranges outside Ghaf with a willing relative. You may just rehearse the greeting with the Parent.

| Step type     | Arabic                                                                              | English                                                                                           |
| ------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Agreed action | اختر مع وليّ الأمر قريبًا يرغب في التواصل.                                          | Choose a willing relative with the Parent.                                                        |
| Optional      | يمكنك التدرّب على تحية مع وليّ الأمر، أو المشاركة إن رغبت في اتصال يرتّبه خارج غاف. | You may rehearse a greeting with the Parent, or optionally join a call they arrange outside Ghaf. |
| Optional      | استخدم تحية أو سؤالًا تختاره، ويمكنك إنهاء المشاركة.                                | Use a greeting or question you choose; you may finish participating.                              |

Retain `recognition_only` / 0 Seeds. A real-world Parent-managed call is the task; this does not activate unimplemented Ghaf voice/video calling or import contacts. Rehearsal and an actual call must have different truthful completion descriptions; no answer is not a completed call.

#### RK02 — الاستماع إلى قصة عائلية قصيرة / Listen to a short family story

Approved-action wording proposed: **استمع إلى قصة يختار قريب مشاركتها، مع إمكانية التوقف في أي وقت.**

Listen to a story a relative chooses to share, with the option to stop at any time.

| Step type     | Arabic                               | English                                         |
| ------------- | ------------------------------------ | ----------------------------------------------- |
| Agreed action | اختر قريبًا يرغب في مشاركة قصة.      | Choose a relative who wants to share a story.   |
| Agreed action | استمع بالطريقة والمدة المتفق عليهما. | Listen in the agreed way for the agreed time.   |
| Optional      | يمكنك طرح سؤال أو إنهاء المشاركة.    | You may ask a question or finish participating. |

Retain `recognition_only` / 0 Seeds. No story recording, transcript or inferred family closeness. Willing participant and accessible listening; private acknowledgement.

### مسؤوليتي / Home Responsibility

#### HR02 — تجهيز حقيبة المدرسة للغد / Prepare tomorrow's school bag

Approved-action wording proposed: **ضع مواد الغد في الحقيبة باستخدام قائمة.**

Use a checklist to place tomorrow items in the bag.

| Step type     | Arabic                                  | English                                      |
| ------------- | --------------------------------------- | -------------------------------------------- |
| Agreed action | راجع قائمة مواد الغد مع وليّ الأمر.     | Review tomorrow’s materials with the Parent. |
| Agreed action | ضع المواد الآمنة في الحقيبة.            | Put the safe materials in the bag.           |
| Agreed action | راجع القائمة واطلب المساعدة عند الحاجة. | Check the list and ask for help when needed. |

Retain `fade_first` / 6 Seeds. Materials from Parent-approved list; adult handles heavy/sharp/unknown objects. Agreed help earns the accepted award.

#### HR05 — مساعدة شخص بالغ في كيس نفايات عامة خفيف ومغلق / Help an adult with a sealed light general-waste bag

Approved-action wording proposed: **ضع كيسًا جديدًا فارغًا يقدمه الشخص البالغ في المكان المتفق عليه داخل المنزل، دون لمس الكيس المستخدم أو الحاوية.**

Put a new, empty bag provided by the adult in the agreed indoor place, without touching the used bag or bin.

| Step type                          | Arabic                                                                                                          | English                                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Adult responsibility / information | يفحص الشخص البالغ الكيس ويتولى حمله.                                                                            | The adult checks the bag and handles all carrying.                                                           |
| Agreed action                      | ضع كيسًا جديدًا فارغًا يقدمه الشخص البالغ في المكان المتفق عليه داخل المنزل، دون لمس الكيس المستخدم أو الحاوية. | Put a new, empty bag provided by the adult in the agreed indoor place, without touching the used bag or bin. |
| Adult responsibility / information | اترك نقل الكيس والتخلص منه للشخص البالغ.                                                                        | Leave moving and disposing of the bag to the adult.                                                          |

Retain `fade_first` / 8 Seeds. Specify the exact safe indoor helping action before assignment; adult alone carries/disposes. No touching unknown waste. Proposed exact action now places a NEW EMPTY adult-provided bag indoors; no used-bag/bin handling. Adult supervises safe bag handling; no play with bags or covering the head/face.

#### HR01 — ترتيب الكتب والأقلام / Put books and pens in their places

Approved-action wording proposed: **أعد الكتب والأقلام إلى أماكنها المتفق عليها.**

Return books and pens to their agreed places.

| Step type     | Arabic                                                 | English                                                    |
| ------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| Agreed action | اختر الكتب والأقلام التي ستُرتّب.                      | Choose the books and pens to put away.                     |
| Agreed action | أعدها إلى الأماكن المتفق عليها مع المساعدة عند الحاجة. | Return them to their agreed places, with help when needed. |
| Agreed action | راجع المساحة التي اخترتها.                             | Check the space you chose.                                 |

Retain `fade_first` / 4 Seeds. Adult excludes sharps/fragile/heavy items. Make completion a bounded chosen set, not a demand for general tidiness.

### أثر أخضر / Green Impact

#### GI01 — فرز المواد النظيفة المقبولة محلياً / Sort locally accepted clean recyclables

Approved-action wording proposed: **افرز داخل المنزل الورق والبلاستيك النظيفين والسليمين وغير الحادّين بعد فحص شخص بالغ.**

Sort only intact, non-sharp clean paper and plastic indoors after an adult check.

| Step type                          | Arabic                                                                               | English                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Adult responsibility / information | يفحص الشخص البالغ المواد المقبولة محليًا.                                            | The adult checks materials accepted locally.                                      |
| Agreed action                      | افرز داخل المنزل الورق والبلاستيك النظيفين والسليمين وغير الحادّين بعد فحص شخص بالغ. | Sort only intact, non-sharp clean paper and plastic indoors after an adult check. |
| Adult responsibility / information | يراجع الشخص البالغ الفرز ويتولى النقل والتخلص.                                       | The adult checks the sorting and handles transport and disposal.                  |

Retain `fade_first` / 8 Seeds. Bind dedicated recycling safeguards to this8Seed template; it is distinct from the preserved P0+12 fixture.

Proposed GI01 safety amendment: indoors only; the adult checks materials and owns all
transport/disposal. Child action excludes sharp, damaged, dirty or unknown materials. Preserve
the existing glass/battery/chemical exclusions and hygiene aftercare. Do not copy the inherited
Salem-named outing into this pack; do not change the separate P0+12 task.

Explicit second-check text: يراجع الشخص البالغ الفرز بعد الانتهاء. / The adult checks the sorting when finished.

Explicit indoor-alternative text: يقتصر نشاط الطفل على الفرز داخل المنزل؛ لا يلزم الخروج. / The Child only sorts indoors; no outing is required.

Replace these fields rather than retaining inherited bag-closing or outdoor-route instructions.

#### GI02 — إطفاء الأنوار غير المستخدمة مع شخص بالغ / Switch off unused lights with an adult

Approved-action wording proposed: **تفقد غرفة واحدة مع شخص بالغ وأطفئ الضوء غير المطلوب.**

Check one room with an adult and switch off an unneeded light.

| Step type                          | Arabic                                                                          | English                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Agreed action                      | اختر غرفة مع شخص بالغ وتحققا من الحاجة إلى الضوء.                               | Choose a room with an adult and check whether its light is needed.                             |
| Agreed action                      | أطفئ الضوء غير المطلوب باستخدام مفتاح سليم وآمن الوصول، مع المساعدة عند الحاجة. | Switch off the unneeded light using an intact, safely reachable switch, with help when needed. |
| Adult responsibility / information | اطلب من الشخص البالغ إتمام الخطوة إذا احتجت إلى مساعدة.                         | Ask the adult to complete the step if you need help.                                           |

Retain `fade_first` / 4 Seeds. Normal safe reachable switch only; no bulb/appliance/electrical repair, climbing or measured energy saving claim.

#### GI03 — استخدام زجاجة ماء قابلة لإعادة الاستخدام / Prepare a reusable water bottle

Approved-action wording proposed: **اطلب من شخص بالغ فحص زجاجة سليمة ثم جهزها للاستخدام.**

Ask an adult to check an intact bottle, then prepare it for use.

| Step type     | Arabic                                            | English                                                |
| ------------- | ------------------------------------------------- | ------------------------------------------------------ |
| Agreed action | اطلب من شخص بالغ فحص زجاجة سليمة غير قابلة للكسر. | Ask an adult to check an intact, non-breakable bottle. |
| Agreed action | جهّزها للاستخدام بالطريقة التي اتفقتما عليها.     | Prepare it for use in the agreed way.                  |
| Agreed action | ضعها في المكان المتفق عليه.                       | Put it in the agreed place.                            |

Retain `standard` / 4 Seeds. Adult owns bottle hygiene/temperature checks; no glass/hot liquids or quantity-of-drinking target.

### النعمة والضيافة / Food & Hospitality

#### FH01 — المساعدة في طبق تقديم مشترك / Help prepare a shared serving dish

Approved-action wording proposed: **ساعد في ترتيب طبق تقديم مشترك باستخدام الطعام والكمية وأدوات التقديم الآمنة التي اختارها وليّ الأمر، دون اشتراط تناول الطعام.**

Help arrange a shared serving dish using the food, amount and safe serving tools the Parent selected, with no requirement to eat it.

| Step type                          | Arabic                                                                                      | English                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Adult responsibility / information | يختار وليّ الأمر الطعام وأدوات تقديم باردة وآمنة وغير قابلة للكسر، ويتولى فحص سلامة الطعام. | The Parent chooses the food and safe, cool, non-breakable serving tools, and handles food-safety checks. |
| Agreed action                      | ساعد في ترتيب طبق مشترك بمواد باردة وآمنة.                                                  | Help arrange a shared dish using safe, cool items.                                                       |
| Agreed action                      | اعرض ما جهّزته على وليّ الأمر؛ لا يلزم تناول الطعام.                                        | Show the Parent what you prepared; eating is not required.                                               |

Retain `fade_first` / 4 Seeds. Adult owns allergens/food safety/temperature. Arrange shared serving items; never require consumption, portion compliance or nutrition scoring.

#### FH04 — ترتيب التمر أو الماء أو المناديل للضيوف / Arrange dates, water, or napkins for guests

Approved-action wording proposed: **رتّب مواد الضيافة الباردة والآمنة.**

Arrange safe, cool hospitality items.

| Step type                          | Arabic                                                        | English                                                    |
| ---------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| Agreed action                      | اختر مع وليّ الأمر مواد الضيافة الباردة والآمنة.              | Choose safe, cool hospitality items with the Parent.       |
| Agreed action                      | رتّب التمر أو الماء أو المناديل.                              | Arrange dates, water or napkins.                           |
| Adult responsibility / information | اترك الأواني الزجاجية والسوائل والأواني الساخنة للشخص البالغ. | Leave glassware, hot liquids and hot vessels to the adult. |

Retain `fade_first` / 6 Seeds. Adult alone handles hot gahwa and hot vessels; cultural wording review remains pending.

#### FH02 — ترتيب المناديل والملاعق الباردة / Arrange napkins and cool utensils

Approved-action wording proposed: **رتّب مواد آمنة وغير قابلة للكسر يحددها وليّ الأمر.**

Arrange safe, non-breakable items selected by the Parent.

| Step type                          | Arabic                                              | English                                             |
| ---------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| Adult responsibility / information | يختار وليّ الأمر مواد باردة وآمنة وغير قابلة للكسر. | The Parent selects safe, cool, non-breakable items. |
| Agreed action                      | رتّب المناديل والملاعق في المكان المتفق عليه.       | Arrange napkins and spoons in the agreed place.     |
| Agreed action                      | راجع الترتيب مع المساعدة عند الحاجة.                | Check the arrangement with help when needed.        |

Retain `fade_first` / 4 Seeds. No knives, hot items or fragile objects. Complete arrangement, not serving/eating under pressure.

### تراثنا وآدابنا / Heritage & Etiquette

#### HE01 — اختيار تحية مناسبة مع وليّ الأمر / Choose an appropriate greeting with the Parent

Approved-action wording proposed: **اختر تحية من الخيارات التي يراجعها وليّ الأمر، ويمكنك التدرّب عليها إن رغبت.**

Choose a greeting from options reviewed by the Parent; you may rehearse it if you wish.

| Step type                          | Arabic                                          | English                                               |
| ---------------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| Adult responsibility / information | يراجع وليّ الأمر خيارات التحية المناسبة للموقف. | The Parent reviews greetings suited to the situation. |
| Agreed action                      | اختر عبارة ترتاح لاستخدامها.                    | Choose a phrase you feel comfortable using.           |
| Optional                           | تدرّب عليها مع وليّ الأمر إن رغبت.              | Practise it with the Parent if you wish.              |

Retain `recognition_only` / 0 Seeds. Parent approves situational phrasing; no universal greeting, religious claim or required human imitation.

#### HE02 — الاستماع إلى المتحدث في المجلس / Practise listening to a speaker in the majlis

Approved-action wording proposed: **تابع حديثًا قصيرًا بالطريقة المناسبة لك، ويمكنك طلب توضيح أو استراحة أو إنهاء المشاركة.**

Follow a short conversation in the way that suits you; you may ask for clarification or a break, or stop participating.

| Step type                          | Arabic                                         | English                                                        |
| ---------------------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| Agreed action                      | اتفق مع وليّ الأمر على وقت قصير مناسب.         | Agree a suitable short time with the Parent.                   |
| Agreed action                      | استمع بالطريقة المناسبة لك دون فرض تواصل بصري. | Listen in the way that suits you; eye contact is not required. |
| Adult responsibility / information | اطلب توضيحًا أو استراحة عند الحاجة.            | Ask for clarification or a break when needed.                  |

Retain `recognition_only` / 0 Seeds. Listening supports accessible participation, not obedience/eye-contact measurement. No morality or cultural-authenticity score.

#### HE03 — سؤال شخص بالغ عن غرض تراثي / Ask an adult about one heritage object

Approved-action wording proposed: **اختر غرضاً آمناً واسأل شخصاً بالغاً عن قصته أو استخدامه.**

Choose one safe object and ask an adult about its story or use.

| Step type                          | Arabic                                                                    | English                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Adult responsibility / information | يختار وليّ الأمر غرضًا آمنًا.                                             | The Parent chooses a safe object.                                         |
| Agreed action                      | اسأل شخصًا بالغًا عن استخدامه أو قصته.                                    | Ask an adult about its use or story.                                      |
| Adult responsibility / information | استمع أو شاهد الغرض دون حمله أو استخدامه؛ يتولى الشخص البالغ التعامل معه. | Listen or look without holding or using the object; the adult handles it. |

Retain `recognition_only` / 0 Seeds. Adult approves object; no fragile/sharp/heavy/unknown objects handled. No cultural fact invented by AI.

### اللطف والمجتمع / Kindness & Community

#### KC01 — المساعدة في مهمة صغيرة يختارها الأخ أو الأخت / Help with one small job a sibling chooses

Approved-action wording proposed: **اعرض المساعدة في مهمة صغيرة وآمنة، وقدّمها فقط إذا رغبتما معًا؛ رفض العرض لا يعني الفشل ولا يوجب متابعة المهمة.**

Offer help with one small, safe job and help only if you both wish; declining is not failure and does not require continuing the task.

| Step type          | Arabic                                          | English                                                  |
| ------------------ | ----------------------------------------------- | -------------------------------------------------------- |
| Agreed action      | اعرض على أخيك أو أختك المساعدة في مهمة صغيرة.   | Offer your sibling help with one small job.              |
| Only if both agree | إذا وافقتما معًا، اتفقا على خطوة صغيرة وآمنة.   | If you both agree, choose one small, safe step together. |
| Only if both agree | قدّم المساعدة إن رغبتما؛ يمكن لأي منكما التوقف. | Help if you both wish; either person may stop.           |

Retain `recognition_only` / 0 Seeds. Voluntary help, no coerced caregiving/affection or public comparison. No Seed, Garden, League or Family Reward effects.

#### KC02 — كتابة رسالة شكر قصيرة / Write a short thank-you note

Approved-action wording proposed: **اكتب أو ارسم رسالة شكر لمن تختاره، أو أمْلها على شخص بالغ يساعدك في كتابتها؛ تسليمها اختياري.**

Write or draw a thank-you note for someone you choose, or dictate it to an adult who helps write it; delivery is optional.

| Step type     | Arabic                                                                     | English                                                                                      |
| ------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Agreed action | اختر شخصًا ترغب في شكره.                                                   | Choose someone you would like to thank.                                                      |
| Agreed action | اكتب أو ارسم رسالة للشخص الذي اخترته، أو اطلب من شخص بالغ كتابتها بإملائك. | Write or draw a note for the person you chose, or dictate it to an adult who helps write it. |
| Optional      | اختر مع وليّ الأمر إن كنت تريد تسليمها.                                    | Choose with the Parent whether to give the note.                                             |

Retain `recognition_only` / 0 Seeds. Optional delivery outside the app; no unbuilt sending/recording control or requirement to disclose feelings.

#### KC03 — اختيار مساعدة صغيرة في المنزل / Choose one small way to help at home

Approved-action wording proposed: **اسأل عمّا يحتاج إلى مساعدة واختر خطوة آمنة يمكنك إنجازها.**

Ask what needs help and choose one safe step you can complete.

| Step type     | Arabic                                  | English                                   |
| ------------- | --------------------------------------- | ----------------------------------------- |
| Agreed action | اسأل وليّ الأمر عن مساعدة بسيطة مطلوبة. | Ask the Parent about a small helpful job. |
| Agreed action | اختر خطوة آمنة تستطيع القيام بها.       | Choose a safe step you can do.            |
| Agreed action | نفّذها مع المساعدة المتفق عليها.        | Do it with the agreed help.               |

Retain `recognition_only` / 0 Seeds. No assumption a relationship task becomes a paid household chore; recognition-only remains zero growth.

### التعلّم والتوازن / Learning & Wellbeing

#### LW01 — قراءة كتاب أو الاستماع إليه / Read or listen to a book

Proposed title amendment; current title: القراءة أو الاستماع إلى كتاب لمدة عشر دقائق / Read or listen to a book for ten minutes.

Approved-action wording proposed: **اقرأ أو استمع بصيغة ميسّرة للمدة المتفق عليها مع وليّ الأمر قبل قبول المهمة، مع الاستراحات والمساعدة المتفق عليها.**

Read or listen in an accessible format for the duration agreed with the Parent before accepting the task, with the agreed breaks and help.

| Step type                          | Arabic                                         | English                                                     |
| ---------------------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| Agreed action                      | اختر كتابًا أو تسجيلًا مناسبًا مع وليّ الأمر.  | Choose a suitable book or recording with the Parent.        |
| Agreed action                      | اقرأ أو استمع بصيغة ميسّرة للمدة المتفق عليها. | Read or listen in an accessible format for the agreed time. |
| Adult responsibility / information | اطلب المساعدة أو استراحة عند الحاجة.           | Ask for help or a break when needed.                        |

Retain `fade_first` / 6 Seeds. Practice/read/listen process only, not marks or test results. Proposed duration adapted before acceptance; Family Reward excluded. Concrete proposed title/definition now remove the conflicting fixed ten-minute requirement; agreed duration is settled before acceptance.

#### LW02 — تجهيز مكان هادئ للتعلّم / Prepare a calm learning space

Approved-action wording proposed: **ضع الأدوات المطلوبة في مكان مناسب يختاره وليّ الأمر.**

Place the needed materials in a suitable space chosen by the Parent.

| Step type     | Arabic                             | English                                  |
| ------------- | ---------------------------------- | ---------------------------------------- |
| Agreed action | اختر مكانًا مناسبًا مع وليّ الأمر. | Choose a suitable space with the Parent. |
| Agreed action | ضع الأدوات المطلوبة في متناولك.    | Place the needed materials within reach. |
| Agreed action | راجع ما تحتاج إليه قبل البدء.      | Check what you need before starting.     |

Retain `fade_first` / 4 Seeds. Accessible arrangement, not a judgment of focus or diagnosis. No education-linked Family Reward eligibility.

#### LW03 — تقسيم مشروع إلى ثلاث خطوات / Break one project into three steps

Approved-action wording proposed: **اكتب ثلاث خطوات قصيرة أو أمْلها على شخص بالغ، مع المساعدة المتفق عليها.**

Write three short steps or dictate them to an adult, with the agreed help.

| Step type     | Arabic                                       | English                                         |
| ------------- | -------------------------------------------- | ----------------------------------------------- |
| Agreed action | اختر مشروعًا صغيرًا مع وليّ الأمر.           | Choose a small project with the Parent.         |
| Agreed action | اكتب أو أمْلِ على شخص بالغ ثلاث خطوات قصيرة. | Write or dictate three short steps to an adult. |
| Optional      | اختر الخطوة الأولى التي ستجربها.             | Choose the first step you will try.             |

Retain `standard` / 6 Seeds. Replace ambiguous record wording with write/dictate-to-adult; no microphone permission or new real Child recording. Family Reward excluded. Canonical proposed definition and positive action replace record; first-step selection is optional, not project execution.

## Content review corrections

The read-only helper identified the following defects in the first draft; C adopted concrete
paired wording/definition changes rather than leaving correction notes as the only safeguard:

- KC01 now offers help to the sibling, and follow-up participation is conditional on both agreeing.
- HR05 has a specific safe indoor Child action; carrying/disposal remain adult responsibilities.
- FH01/FH04 explicitly exclude glass/hot handling; HE03 uses observation while the adult handles the object.
- GI01 has a separate indoor safety pack, without inherited Salem-specific accompaniment.
- RK04/LW01 have proposed title/definition amendments for agreed duration and accessibility.
- FA03 permits private non-disclosure; optional and adult steps are explicitly marked.
- HE02 permits clarification/breaks/ending participation without an eye-contact or obedience requirement.
- RK01 distinguishes greeting rehearsal from an optional external call; neither no-answer nor rehearsal is logged as an actual call.
- KC02 separates the note recipient from the adult helping write it and permits drawing.
- LW03 replaces ambiguous recording in its action/definition; planning does not require project execution.
- C additionally made GI02 explicitly switch off the unneeded light in its actual step text.

The source inventory was completed with actual age-band, effort, supervision, evidence/reflection
and landscape fields after the helper noted their omission. All24 age-band lists are generic
source defaults; human suitability and exact Arabic/cultural acceptance remain pending.
