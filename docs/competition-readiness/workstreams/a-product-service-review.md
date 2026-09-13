# Product and service review — concrete gaps and next changes

Source inspected: `52c61fc`, runtime `7fff0f3`. Session A, 2026-09-12. Two bounded read-only
helpers traced task/access and assistant/narration services. This is source evidence, not a new
browser or Android acceptance run. The approved-instruction repair described below has its own
subsequent diff/check receipt; all other implementation claims refer to the inspected baseline.

## What has and has not improved

The preceding batch repaired access, family replacement, reset navigation and Arabic duration
presentation, and refined the Child task card. It did **not** implement the user's calendar,
study, money-literacy, map, chat or durable memory ideas. The existing
[research assessment](../research-and-product-strategy.md) examined those ideas; research and a
roadmap are not delivery. The user's concern about disconnected features is supported by the
service traces below, even where the implementation matches a deliberately narrow specification.

## Findings that matter to the experience

| ID  | What the user encounters                                                               | Actual behavior and evidence                                                                                                                                                                                                                                                           | Disposition                                                                                                                                                                                                    |
| --- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 | Parent writes/reviews a specific recycling action; Child receives generic instructions | Approved `positiveAction` survives in [mock task service](../../../src/services/mock/index.ts) and Parent review. The first-version [Child task](../../../app/child/task.tsx) selects fixed checklist text; approved wording was absent from both chosen and active main instructions. | Existing presentation gap; A commissions a bounded repair plus a rendered regression. Keep safety steps, +12 and all authority unchanged.                                                                      |
| P02 | Four Parent Guide choices suggest four different kinds of help                         | [Mock Guide](../../../src/services/mock/index.ts) returns the same `guide_recycling_refine_v1` for all four approved intents. Accept/Keep really changes or retains the draft.                                                                                                         | Honest prepared fixture, required by 003 FR-073. Future improvement should explain the relevant change per intent; distinct transformations need a bounded contract. Do not claim a live personalized coach.   |
| P03 | Family setup collects interests and support preferences                                | [Profile personalization](../../../src/features/assistants/profilePersonalization.ts) changes category order. The Guide request uses the canonical task/fixed age band, not these setup preferences.                                                                                   | Discovery personalization exists; personalized coaching does not follow from it. Expose the existing specific ranking reason before adding more profile collection.                                            |
| P04 | Parent sees a summary that appears useful after an activity                            | [Parent Home](../../../app/parent/index.tsx) passes `PARENT_SUMMARY_FIXTURE` directly. Correction changes component state; it does not create a task or summarize today's event.                                                                                                       | Prepared demonstration, not evidence-derived feedback. A task-bound summary is a separate future story; retain the local/prepared label.                                                                       |
| P05 | Family Connection suggests visits, calls and connection rhythms                        | [Planner](../../../src/features/family-connections/index.ts) selects an idea by relative slot modulo catalog length and copies rhythm. [Plan UI](../../../src/components/family/FamilyConnectionPlan.tsx) is read-only. No scheduled recurrence, Child assignment or memory.           | Consistent with private, zero-progression Feature 008. Clarify planning-only utility. Do not present “rotating” as time-driven rotation.                                                                       |
| P06 | Eight categories and several cards look like a working task organizer                  | [Composer](../../../src/components/family-growth/ParentTaskComposer.tsx) and service guards permit only Salem's `task_recycling_p0_v1`; other Child cards are previews. Feature 013 is separately default-off.                                                                         | Intentional P0 breadth limit, with expectation risk. The demo should focus on the executable task; do not label preview breadth as implemented functionality.                                                  |
| P07 | Child asks an adult for help                                                           | [Child task](../../../app/child/task.tsx) displays a local instruction to ask a trusted adult. No Parent notification/request is created. Parent support selections similarly lead to the disclosed standard retry message.                                                            | Honest offline assistance, but weak visible reciprocity. A task-bound request/acknowledgment could connect the two roles without chat or transport. Proposal only.                                             |
| P08 | Demo presenter traverses onboarding, setup and simulated verification                  | Existing three synthetic principals and no-credential controller resume methods already exist, but the signed-out entry does not expose a direct demo selector.                                                                                                                        | User now explicitly requests one Parent/two Child quick-entry profiles. See the selected-scope implementation brief below; preserve controller authority and isolated synthetic data.                          |
| P09 | Arabic narrator sounds broken                                                          | Six bundled MP3s use prepared `ar-AE-FatimaNeural`, +7% speed/+2 Hz pitch. Visible intro also contains an awkward verb form. Tests check assets/lifecycle, not spoken language.                                                                                                        | User-reported audible defect; source/metadata confirmed, not independently listened to. Rewrite/revoice together and obtain an actual Arabic listening review. Android TTS settings will not fix bundled MP3s. |

Source reference details retained from the audit: P01 `mock/index.ts:383`, Parent review `:342`,
Child task baseline `:211–245`; P02 mock `:1304`, store `:2913/2981`; P03 composer `:132`,
personalization `:245`, store `:1178`; P04 Parent Home `:812`, summary component `:27/50`;
P05 planner `:159/171`, Feature008 spec `:168`; P06 composer `:682`, mock `:498`, Child Today
`:708`; P07 Child task `:565`, ParentCheckIn `:146`. Line numbers describe the inspected baseline
and may move after edits; linked files and named symbols are the durable references.

## The working core should remain the foundation

There is real deterministic logic underneath the presentation. Child submission awards nothing;
Parent confirmation precedes recognition. The accepted recycling task awards +12 exactly once,
including permitted help, and retry removes nothing. Lifetime Seeds, displayed garden, League,
canopy and private Family Reward eligibility have separate authorities. The baseline has meaningful
tests for these rules. This does not establish physical-device quality or catalogue-wide execution.

The real-world task already gives the adult responsibilities: inspect materials, carry them,
choose a safe route and handle disposal. The product opportunity is to make that collaboration
visible and useful inside the app, rather than presenting the Parent mainly as approver/verifier.

## One proposed connected improvement

**Proposal, not selected implementation: “Do the first step together.”** Within the existing
Parent-approved recycling task, the Child may choose a curated request to sort the first items
with the Parent. After an ordinary local role handoff, the Parent sees the same private request
and acknowledges the specific support action. The Child sees that acknowledgment, completes with
help, and receives the already accepted +12 after Parent confirmation. No extra points are attached
to asking, accepting, declining, closeness or emotional disclosure. No chat/backend is required.

| Current experience                       | Proposed connected experience                                       | Observable acceptance                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Child reads “ask an adult”               | Child explicitly requests one bounded support action                | A private request binds family, Child, task and version; no authority/progress change    |
| Parent mainly reviews the result         | Parent can acknowledge that support action                          | Only the current Parent session can acknowledge; Alya cannot see Salem's private request |
| Child returns to the same generic advice | Child sees the Parent's acknowledgment on the same task             | Locale-equivalent wording, no fabricated live notification, no duplicate request effects |
| Completion grows the garden              | Same confirmation/growth, now following an observable shared action | +12 once; no changed League/Reward rules, task approval or expiry pressure               |

Suggested ephemeral states: `none → requested → acknowledged`, with Child withdrawal before
acknowledgment and invalidation on task replacement/reset. Do not use this small proposal to
implement recovery014; restart behavior would remain explicitly session-local. The current
two-phone contract is two independent installs, so the handoff is demonstrated on the primary
phone. It is not synchronized across the devices.

This is a design inference from guidance supporting active listening, clear language, specific
action-focused praise and doing enjoyable things together. UNICEF's article concerns communication
with young children; it is guidance, not a trial of Ghaf or proof across all supported age bands.
[UNICEF communication guidance](https://www.unicef.org/lac/en/parenting-lac/nurturing-care/how-communicate-effectively-young-child)
supports the underlying interaction principles. No cognitive, clinical or family-outcome gain is
claimed. A user/student scope decision and the smallest committed Spec Kit contract precede this
proposal's implementation.

## Where the user's other ideas fit

| Idea                     | Concrete useful form                                                                        | Competition disposition                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calendar                 | Parent and Child agree a local time for one shared activity; Child may ask to move it       | Consider a small agenda only after core native gates and explicit selection. Google Calendar copy/export/sync are different capabilities; none is implemented.                                  |
| Studying/custom goals    | Child chooses a short practice goal, Parent offers help, then they review a strategy        | Strong future family story. Paying for grades/education is outside Family Reward rules. Retrieval/spaced-practice evidence in the existing research report does not validate a Ghaf study mode. |
| Money literacy/allowance | Synthetic allocation exercise: plan spending/saving and discuss a choice with a Parent      | Later learning exercise, not custody/payments or a Seed-to-AED conversion. The CFPB youth-capability model is a design reference, not proof that a budget screen teaches financial competence.  |
| Map/location             | Parent-reviewed discovery prompt for a safe shared outing, with an equal indoor alternative | Later. No tracking, arrival proof, unsafe route or automatic award. A decorative map alone adds little family value.                                                                            |
| Chat                     | A bounded request/acknowledgment tied to the current task                                   | The smallest reciprocal proposal above captures a useful communication action. Free Child-to-Child chat/social networking remains out of scope.                                                 |
| Memory leaf              | Private accepted family event shown as a leaf, with no progression authority                | Still proposed; truthful durability depends on the deferred recovery decision. No timeline is being claimed as built.                                                                           |

The [CFPB source](https://www.consumerfinance.gov/data-research/research-reports/building-blocks-help-youth-achieve-financial-capability/)
describes developmental foundations and promising practices, not an evaluation of this app.
Use the fuller existing research report for the original evidence and limitations; don't repeat
template extraction or treat imported templates as behavior specifications.

## Explicit new user direction: demo entry, onboarding and Arabic voice

The user has selected fast access to three synthetic demo accounts and asks for attractive modern
onboarding plus a proper Arabic narrator. Those are now concrete requested work, distinct from the
unselected reciprocal-task proposal above. The
[entry/onboarding implementation brief](../native-batch/entry-onboarding-contract.md) specifies the
scope, safe seams, before/after journey and verification gates. Session A must turn it into the
smallest committed Spec Kit amendment and typed contract before delegation; no repeat permission
question is needed for the three-profile scope already requested. Exact diff/content acceptance
and actual Arabic/native review remain pending.

## Evidence and student handoff

- Source audit: complete for the bounded findings above; helper scopes released.
- User-reported voice quality: recorded; listening quality, pronunciation and transcript parity NOT RUN here.
- New demo selector/onboarding/voice assets: not implemented by this report.
- Recovery014: explicitly deferred; no implementation or automatic later approval.
- Parent-approved instruction correction: separate narrow source/test task; see the final repair receipt.
- Student exact-diff understanding, Arabic content/voice review and actual phone results: PENDING.

Students should be able to explain why task approval, completion, confirmation and recognition are
different states; why the prepared Guide differs from live AI; why selecting a synthetic profile
does not authorize other profiles; and why a demonstration of help is not evidence of improved
family wellbeing. This is the explanation packet's starting point, not a fabricated Q&A pass.

## P01 repair receipt — 2026-09-12

Committed as `e02d02b3a43c062bd637b57a475b43419a9f9939`:
[Child task](../../../app/child/task.tsx) now shows the exact localized approved action before
starting and during the active/retry version-one task. All fixed safety/checklist content remains;
version-two adjusted instructions are unchanged. No new task, wording, service or progression.

[The rendered regression](../../../tests/child-approved-instruction.test.tsx) failed six cases
before the correction and passes all 18 afterward. It drives real store/controller/service actions
and renders real React task components, with native hosts and peripheral components mocked. It
covers both locales, chosen/active/retry, adjusted tasks and sibling/unassigned isolation.

A's integrated checks ran 2026-09-12 01:11:45–01:12:25 UTC: typecheck, lint, format check and full
suite all exit0; **139 test files / 1,695 tests passed**. Logs/receipts are local ignored evidence at
`output/competition-readiness/product-instruction-repair/`. The scoped Impeccable detector returned
an empty findings array; it is not a visual/native acceptance test. Browser/native inspection of
the extra instruction paragraph and student exact-diff acceptance remain NOT RUN/PENDING.

This is the only runtime change in this review/prompt batch. Demo profiles, new onboarding and
replacement narration are specified in the selected work brief, not implemented here.

## Subsequent selected implementation — Feature015

The earlier report's “only runtime change” statement describes its P01 batch. The subsequently
selected Feature015 is now integrated at5d8a3e8: immediate Parent/Salem/Alya synthetic entry,
controller-owned role separation, isolated demo repositories and short bilingual onboarding.
The prepared Parent Guide remains prepared/local; no live generalized Coach or reciprocal-support
feature has been added. Current-run handoff preserves tasks, while process restart starts fresh.

All four final checks pass,148files/1,919tests. C's integrated browser evidence covers the selector,
three moments and corrected approval handoff; physical Android validation remains pending.
Arabic candidate narration was actually rejected and remains outside the runtime. Two alternative
voice auditions await user selection; the complete new onboarding currently works silently.

The strongest proposed product addition remains reciprocal Parent support within an approved task.
It is unselected and absent from the presentation. Research does not establish that this prototype
improves cognition or family wellbeing. Student review and explanation remain pending.
