# Revision 3 Decision Brief

> **STATUS: PROPOSED — NOT APPROVED — NOT IMPLEMENTATION AUTHORITY**
>
> **R002 INTAKE RECEIVED — PRODUCT CONFLICTS OPEN — IMPLEMENTATION BLOCKED**

**Prepared:** 2026-09-04

**Audience:** Product, design, and engineering owners

**Scope:** Decision preparation only. This document authorizes no canonical-specification or runtime
change.

## Executive summary

Reconciliation stopped because three distinct evidence streams do not yet describe one approved
product:

- **Verified fact:** remote head `a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2` implements the
  Feature 003 ten-route baseline plus tested access, private Family Reward, private five-Leaf League,
  synthetic voice, and Parent-authorized reset.
- **Verified fact:** local head `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c` contains six unique
  commits from common ancestor `7860184354d12124887fafee62e1da1b1971095e`. The branches diverge by
  28 remote-only and 6 local-only commits. `git cherry` marks every local commit unique, but each is
  still only candidate evidence until reconciled semantically.
- **Verified fact:** untracked R002 contains 74 export directories, 71 PNGs, 70 HTML files, 69
  PNG/HTML pairs, two PNG-only illustration folders, and one HTML-only folder. It supplies useful
  visuals and prose but lacks complete canonical selection, Growth screens, state specifications,
  English parity, asset provenance, and approval metadata.
- **Inference:** Git conflict mechanics cannot safely decide League semantics, task identity,
  progression, reward ordering, access authority, or reset behavior. Those are product decisions.

Until decisions are approved, remote head is the behavioral baseline, existing approved
specifications are the product baseline, and local commits plus R002 are proposals.

## Proposal package

- [Source-authority matrix](./SOURCE_AUTHORITY_MATRIX.md)
- [Product conflict decision register](./PRODUCT_CONFLICT_DECISION_REGISTER.md)
- [Screen coverage and disposition matrix](./SCREEN_COVERAGE_MATRIX.md)
- [Missing-screen specification plan](./MISSING_SCREEN_SPEC_PLAN.md)
- [Progression and migration options](./PROGRESSION_MIGRATION_OPTIONS.md)
- [RevealBundle requirements](./REVEAL_BUNDLE_REQUIREMENTS.md)
- [Local-commit decomposition plan](./LOCAL_COMMIT_PORT_PLAN.md)
- [Proposed execution order](./REVISION_3_EXECUTION_PLAN.md)

## Verified heads and preservation

| Item                    | Evidence                                                                                                              | Meaning                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Upstream                | `origin/feature/003-family-growth-garden`                                                                             | Verified tracking branch; `main` was not assumed.     |
| Remote/integration head | `a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2`, 2026-09-02, `test: require parent authority for resets`                   | Current behavior/test baseline.                       |
| Local head              | `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c`, 2026-09-03, `docs(spec): plan Stitch-gated Growth Journey implementation` | Candidate history; unapplied.                         |
| Backup                  | `backup/feature-003-local-pre-r002-reconciliation-20260904` → `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c`              | Preserves local provenance.                           |
| Integration branch      | `integration/r002-reconciliation-20260904` at `a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2`                              | Isolated clean reconciliation branch.                 |
| Worktrees               | Integration: `/home/smyk/projects/Ghaf-r002-reconciliation-20260904`; original: `/home/smyk/projects/Ghaf`            | Original worktree and untracked R002 remain separate. |

## Relationship of the sources

| Source                           | Verified status                                                                                                                                                                                                                                                                | Revision 3 treatment                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Remote Feature 003 specification | `spec.md:7-10` explicitly records approval for the 2026-08-26 scope; `spec.md:77-95` defines ten routes; `spec.md:896-1001` adds later domain/presentation requirements.                                                                                                       | Current product baseline only within those documented boundaries.                          |
| Remote runtime/tests             | Schema 3 uses `task_recycling_p0_v1`, 48→60 recognition, separate projections, Parent-only reset, private League/Rewards, and synthetic voice. See `src/services/mock/fixtures.ts:194-196`, `src/state/usePrototypeStore.ts:394-424`, and named tests in the authority matrix. | Current behavior; implementation is evidence, not permission to override a specification.  |
| Six local commits                | R001 documentation, access domain, design system, onboarding UI, Growth guardrails, and Growth Spec Kit amendment.                                                                                                                                                             | Candidate proposals. Reconstruct approved slices on remote head; do not broad-cherry-pick. |
| R001                             | `f63e39fc702bb1797791f7543c6316e3b06f3ba9:docs/design/stitch/releases/ghaf-r001/STITCH_DESIGN.md:3-22` records narrow user approval for seven Arabic Parent-onboarding compositions and foundations.                                                                           | Narrow design evidence only; no later screen family is released by it.                     |
| Growth pack                      | `96cad3b917f43adad32c491153be54d3ab24f899:docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/README.md:6-12` says it is research/specification/prompt input, not screens or code.                                                                                                            | Candidate content and model evidence.                                                      |
| R002                             | Untracked read-only intake received 2026-09-04; no explicit approval record.                                                                                                                                                                                                   | Candidate visual/structural evidence only. `Final` in a filename is not approval.          |

## Why the reconciliation is blocked

1. Remote FR-111–FR-115 require a private five-Leaf League with score and position
   (`spec.md:934-950`); R002 replaces `/circle` with qualitative Shared Growth without ranks or
   percentages (`docs/design/stitch/releases/ghaf-r002/GHAF_CODEX_SCREEN_FLOW_AND_INTEGRATION_PROMPT.md:379-404`).
2. Remote fixtures/tests use `task_recycling_p0_v1`; R002 declares `task.recycling_sort.v1`
   (`docs/design/stitch/releases/ghaf-r002/GHAF_CODEX_SCREEN_FLOW_AND_INTEGRATION_PROMPT.md:228-236`).
3. Remote schema 3 resets Salem to 48 Seeds and commits 48→60, canopy 19→20, and circle 11→12
   (`spec.md:507-544`); R002 demands 108→120 lifetime Seeds plus a 120→180 path
   (`docs/design/stitch/releases/ghaf-r002/GHAF_CODEX_SCREEN_FLOW_AND_INTEGRATION_PROMPT.md:306-355`).
4. The current recognition consequences include personal Seeds, Mangrove, canopy, and circle.
   Revision 3 also proposes League Leaves, private Family Reward, badges, stations, and safe-help
   recognition; one final causal order is not approved.
5. No R002 export directory supplies Child Impact Path, Badge Gallery, Badge Detail, Learning Story,
   accessible learning alternative, Parent Progress, or a combined RevealBundle, although R002 prose
   names them (`docs/design/stitch/releases/ghaf-r002/GHAF_CODEX_SCREEN_FLOW_AND_INTEGRATION_PROMPT.md:406-418`).
6. Intake defects include `ghaf_task_created_success_2/screen.png` at 487×1,
   `ghaf_task_builder_flow/` HTML-only, two PNG-only illustrations, 1600×1280 desktop launch/opening
   boards, and unresolved `final`/`refined`/`corrected` variants.
7. Eighteen R002 HTML files reference 20 distinct `lh3.googleusercontent.com` images; all 70 reference
   Google-hosted fonts. No asset manifest or rights approval is present.
8. The first local commit modifies 55 files, including the constitution and canonical Feature 003
   artifacts. Later commits depend on that candidate rewrite while remote independently implemented
   overlapping, often stronger, behavior.

## Recommended decisions and consequences

These are recommendations, not approvals. All corresponding register entries remain `OPEN`.

| Topic                | Recommendation                                                                                                                   | Accepting it                                                                                                                | Rejecting it                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| League               | Keep the private five-Leaf League canonical.                                                                                     | Preserves score cap, ties, opt-out, strict projection, and tests.                                                           | Requires a formal replacement/migration and revised fairness/privacy tests.   |
| Shared Growth        | Consider a separate optional cooperative projection, not a League replacement.                                                   | Adds collective meaning without erasing private League behavior; needs its own privacy contract.                            | Classify Shared Growth exports as supporting/superseded and keep League only. |
| Task ID              | Preserve `task_recycling_p0_v1`; allow an alias only through versioned migration.                                                | Avoids duplicate receipts and broken task/voice/Leaf links.                                                                 | Requires atomic migration of all references and reset fixtures.               |
| Progression          | Do not adopt 108→120→180 until a new schema is approved; derive Impact Path from lifetime Seeds.                                 | Enables additive Growth without a second currency, with rollback/idempotency tests.                                         | Regenerate R002 number-dependent frames around schema 3.                      |
| RevealBundle         | Make one event-owned bundle a superset of every approved consequence.                                                            | Keeps praise, Seeds, plant, canopy, League/Leaf, private Reward, badge/path, and safe-help outcomes causal and recoverable. | Retain staged remote presentation and supersede combined-reveal proposals.    |
| Access/reset/privacy | Preserve capability-scoped sessions, Parent-owned pairing/permissions/reset, and profile isolation.                              | R001 visuals can be adapted without weakening remote guards.                                                                | Requires a new access contract and regression plan before route changes.      |
| Voice/fonts          | Preserve deterministic synthetic voice and `expo-audio`; migrate to Alexandria/Readex only through measured locale-aware tokens. | Retains tested voice while enabling the R001 visual identity after font/license/native evidence.                            | Keep system fonts and leave R001/R002 typography unapplied.                   |
| Badges/learning      | Keep 16 private permanent badges and one equal-credit Mangrove lesson as bounded candidates.                                     | Creates an ethical Growth P0 after source, copy, art, and accessibility review.                                             | Remove these surfaces; do not show decorative locked content.                 |
| R002 authority       | Require valid mobile pairs, selected canonical variants, English parity, state/motion specs, provenance, and explicit approval.  | Prevents invalid boards and ambiguous variants from becoming runtime truth.                                                 | Reject R002 and request a clean handoff.                                      |

## Safe future treatment of the six commits

- `f63e39fc702bb1797791f7543c6316e3b06f3ba9`: preserve R001 intake as a narrow documentation slice; rewrite canonical-doc changes.
- `1dda546054d0a98661c4ead641f9cf6495041714`: retain only nonduplicated identifier/onboarding-draft validation, adapted to remote
  capability sessions.
- `d217520f4e5b8e30b3690091527515dd8fe158cc`: separate tokens/components from dependencies; never remove `expo-audio`; approve
  font loading independently.
- `5f3f1a21135d6e0762cc482f11f08bcfde37d2a3`: reconstruct only seven R001 routes/states/resources over remote guards; drop its reset
  and access assumptions.
- `96cad3b917f43adad32c491153be54d3ab24f899`: retain research, source ledger, badge and learning proposals as noncanonical pending
  named reviews; do not port broad root-doc rewrites.
- `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c`: reuse gap lists and candidate contracts only after renumbering against remote tasks;
  never overwrite current canonical artifacts wholesale.

## Evidence required before specification work

- Explicit disposition for every mutually exclusive decision in the decision register.
- A versioned progression/migration choice with rollback, idempotency, reset, and cross-profile tests.
- Complete Arabic/English mobile references and `screen-spec.md` for all seven missing Growth
  surfaces plus material states, reduced motion, and origin restoration.
- A canonical manifest for all 74 R002 exports with actual dimensions and disposition.
- Local asset manifest and named rights, factual, Arabic/English, UAE cultural, safeguarding, and
  accessibility reviews.

## Active gate

This proposal approves nothing. The gate remains exactly:

> **R002 INTAKE RECEIVED — PRODUCT CONFLICTS OPEN — IMPLEMENTATION BLOCKED**
