# Revision 3 Progression and Migration Options

> **STATUS: PROPOSED — NOT APPROVED — NOT IMPLEMENTATION AUTHORITY**
>
> **R002 INTAKE RECEIVED — PRODUCT CONFLICTS OPEN — IMPLEMENTATION BLOCKED**

This paper compares three decision paths. It does not select a path, change a fixture, authorize a
schema, or permit implementation. Remote head
`a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2` remains the behavioral baseline; existing approved
specifications remain the product baseline; and the six local commits plus untracked R002 intake
remain candidate evidence only.

## Evidence and authority

| ID            | Classification                                    | Exact evidence                                                                                                                                                                                                                                          |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-RESET       | Verified remote behavior and approved baseline    | `a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2`: `specs/003-family-growth-garden/spec.md:507-544` (`Exact Reset and Confirmation Values`); `src/services/mock/fixtures.ts:286-340` (`createInitialPrototypeSession`); `tests/prototype-state.test.ts:68-163` |
| R-RECOGNITION | Verified remote behavior                          | `a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2`: `src/services/mock/index.ts:991-1191` (`applyRecognition`); `tests/prototype-state.test.ts:361-445`                                                                                                         |
| R-GARDEN      | Existing approved requirement                     | `a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2`: `specs/003-family-growth-garden/spec.md:788-810` (`FR-056`–`FR-066`)                                                                                                                                        |
| R-LEAGUE      | Existing approved requirement and verified domain | `a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2`: `specs/003-family-growth-garden/spec.md:934-950` (`FR-111`–`FR-115`); `src/models/familyLeague.ts:12-209`; `tests/family-league.test.ts:167-207,242-415`                                                    |
| R-REWARD      | Existing approved requirement and verified domain | `a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2`: `specs/003-family-growth-garden/spec.md:919-933` (`FR-106`–`FR-110`); `src/models/familyReward.ts:11-120`; `src/features/family-rewards/index.ts:331-455`; `tests/family-reward.test.ts:160-228,297-440`    |
| L-R3          | Candidate, not authority                          | `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c`: `specs/003-family-growth-garden/data-model.md:404-721` (`Growth Journey Evidence and Projections`, migration receipt, receipt/bundle)                                                                       |
| L-ADR         | Candidate, not authority                          | `96cad3b917f43adad32c491153be54d3ab24f899`: `docs/architecture/adr/0002-impact-path-projection.md:18-74,106-111` (`Status: Proposed`)                                                                                                                   |
| R002          | Candidate intake, not authority                   | Original worktree, untracked `docs/design/stitch/releases/ghaf-r002/GHAF_CODEX_SCREEN_FLOW_AND_INTEGRATION_PROMPT.md:129-138,304-356,406-485,613-628`                                                                                                   |

### Facts every option must preserve

- **Verified fact:** Schema 3 starts Salem at 48 personal Seeds, Mangrove 48/60 Shoot, canopy 19/25,
  and Green Circle 11/12. One valid approval commits 12 Seeds, reaches Mangrove 60/60 Sapling,
  canopy 20/25, and Circle 12/12. Five duplicate approvals do nothing (`R-RESET`,
  `R-RECOGNITION`).
- **Verified fact:** League and Family Reward are separate deterministic domain services. They are
  not integrated into schema-3 `applyRecognition`; this separation is asserted by
  `tests/family-league.test.ts:167-207` and the domain-only boundary in
  `specs/003-family-growth-garden/tasks.md:451-518` at `a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2`.
- **Approved baseline:** Private five-Leaf League, Challenge Leaves, private Family Rewards,
  Parent approval, permanent Seeds/growth, `task_recycling_p0_v1`, and profile isolation cannot be
  changed by migration mechanics.
- **Candidate proposal:** R002 asks for 108 → 120 personal lifetime Seeds and a 120 → 180 Impact Path
  while Mangrove remains 48 → 60 (`R002:304-356`). No approved evidence explains the extra 60
  personal Seeds between remote 48 and candidate 108.
- **Inference:** The remote session stores an opening scalar and recognition receipts, not a complete
  historical Seed ledger (`src/models/familyGrowth.ts:243-251,388-413`). A historical projection
  therefore needs explicit provenance-bearing opening evidence; it cannot silently infer 108.

## Comparison

| Dimension               | A — Preserve Schema 3                            | B — Versioned cumulative migration                                                  | C — Revised combined model                                         |
| ----------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Reset numbers           | Keep 48 → 60                                     | New schema opens at 108, then 108 → 120                                             | Keep 48 → 60                                                       |
| Impact Path             | Compatible preview only; no new ledger semantics | Activate candidate 120 → 180 chapter                                                | Derive Path from existing Seed authority; chapter locked until 120 |
| Seed authority          | Existing scalar/receipts                         | Versioned opening evidence plus transactions                                        | Existing amount normalized behind one read projection              |
| Existing tests          | Unchanged                                        | Numerical reset/flow tests intentionally revised or retained as compatibility tests | Existing numerical tests unchanged; additive projection tests      |
| Migration risk          | Low                                              | High                                                                                | Medium                                                             |
| R002 numerical fidelity | No                                               | Yes, only after approval                                                            | Partial; R002 numerical copy must change                           |

No row is an approval or selection.

## Option A — Preserve Schema 3

Keep the remote reset and recognition behavior exactly as implemented. Adapt only R002 compositions
whose meaning remains correct at 48 → 60. Achievements may be shown only as deterministic views of
provable evidence; do not persist a new currency, rebase a balance, or claim Salem reached 120.

| Required consideration     | Proposal                                                                                                                                                                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User-visible effect        | Salem starts at 48. Approval shows 48 → 60, Mangrove 48/60 → 60/60, canopy 19/25 → 20/25, and Circle 11/12 → 12/12. A 120 → 180 chapter may appear only as an approved future/locked preview. R002 108/120 and 120/180 frames cannot ship unchanged. |
| Data-model changes         | None for recognition. A later badge preview may be a pure read projection, but persistent awards need separate approval.                                                                                                                             |
| Migration                  | None. Keep `PrototypeSession.schemaVersion = 3`; no balance rewrite, backfill, or migration receipt.                                                                                                                                                 |
| Existing tests             | Keep `tests/prototype-state.test.ts:68-163,361-445`, reset, route, League, and Family Reward tests unchanged.                                                                                                                                        |
| Fixture changes            | None numerically. Any new presentation fixture must truthfully use 48/60.                                                                                                                                                                            |
| Risks                      | Candidate R002 no longer opens the Path in the judge flow; its 108/120 and achievement compositions become misleading unless redrawn. Ephemeral achievements cannot meet a permanent-badge promise.                                                  |
| Estimated scope            | **Small** for copy/composition adaptation; **none** for migration. Persistent badges are out of this option unless separately specified.                                                                                                             |
| Conditional recommendation | Prefer only for the lowest-risk MVP when Product accepts deferring or redrawing the active 120 → 180 story. Not selected.                                                                                                                            |

Required approval evidence: an approved 48 → 60 visual/copy set; regression proof for every reset
value; confirmation that no demo promise needs 108; and an explicit decision to omit or authorize a
non-persistent badge preview.

## Option B — Versioned cumulative migration

Create a formally approved schema that changes the synthetic personal opening from 48 to 108, keeps
Mangrove 48/60, and lets the same approval produce personal 120 plus Mangrove 60/60. This is
prohibited unless Product approves the rebase, provenance, reset version, and downstream effects.

### Required migration by authority

The names below describe responsibilities, not approved interfaces.

| Authority               | Exact required behavior                                                                                                                                                                                                                  | Prohibited shortcut                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Session/schema          | New schema plus one receipt keyed by `{profileId,schemaFrom,schemaTo,evaluatorVersion}`; retry returns the same receipt.                                                                                                                 | In-place fixture mutation without a receipt.                                                  |
| Personal Seeds          | Preserve known opening 48. Add an explicitly approved **synthetic fixture-opening adjustment** of 60, separately labeled non-transactional, so the new opening projection is 108.                                                        | Fabricating earned tasks/approvals or deriving 108 from Mangrove, League, canopy, or reward.  |
| Recognition ledger      | Copy existing receipts and keys exactly; map each once to the new evaluator.                                                                                                                                                             | Re-keying or replaying `recognition:submission_recycling_p0_v1_attempt_1`.                    |
| Mangrove/landscapes     | Keep Mangrove 48/60 and other landscapes unchanged; the approval alone adds the established 12. Document why personal and landscape totals differ.                                                                                       | Setting Mangrove to 108/120 to match personal Seeds.                                          |
| Canopy                  | Preserve 19/25 and history; migration adds zero; approval may add one eligible leaf once.                                                                                                                                                | Backfilling canopy from the opening adjustment.                                               |
| Green Circle            | Preserve 11/12 and its ledger; migration adds zero; approval may add one current eligible event once.                                                                                                                                    | Replacing Circle through migration.                                                           |
| Private League          | Preserve week, membership/opt-out, five slots, confirmation ledger, scores, ties, and encouragement; migration adds no Leaf or score.                                                                                                    | Converting Seeds to League credit.                                                            |
| Challenge Leaf          | Preserve task/version and recognition keys. Only an explicitly nominated eligible `task_recycling_p0_v1` approval may confirm one Leaf.                                                                                                  | Treating historical Seeds as Leaves.                                                          |
| Family Reward           | Preserve every plan/version and lifecycle. A new 108/120 fixture needs separate eligible-event or explicit synthetic opening-progress provenance. The next eligible +12 unlocks only after confirmation, praise, and Garden recognition. | Rewriting unlocked/given plans, using League rank, or counting the 60 adjustment as eligible. |
| Impact Path             | Derive 120 → 180 from migrated personal Seed evidence. Backfill only provable criteria; unknown dates stay unknown; migration queues no reveal.                                                                                          | Letting station 180 advance an unrelated garden.                                              |
| Badges/mastery/learning | Use versioned profile-scoped evaluators; infer no mastery, learning, safe-help, or badge from the total.                                                                                                                                 | Awarding candidate badges from the rebase.                                                    |
| Reveal queue            | Preserve existing pending/seen records if later present; migration creates no bundle.                                                                                                                                                    | Celebrating migration as a new Child event.                                                   |

The local candidate receipt requires `seedDelta: 0`, `inferredMasteryCredits: 0`, and
`revealQueued: false`
(`ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c:specs/003-family-growth-garden/data-model.md:641-652`). It cannot itself authorize the 60-Seed
opening adjustment. Product and Engineering must define that provenance or reject Option B.

| Required consideration     | Proposal                                                                                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| User-visible effect        | Candidate R002 story becomes possible: personal 108 → 120, Mangrove 48/60 → 60/60 archived, active Path 120/180, next station 132. Separate authorities need explicit labels.                                            |
| Data-model changes         | Versioned session, opening evidence, migration receipt, lifetime projection, stations, awards, learning/activity, reveal records, and schema-3 adapter. League/reward remain separate authorities referenced explicitly. |
| Migration                  | One atomic pass per profile with before/after hashes; preserve keys; emit no domain event beyond the approved fixture adjustment; reject partial/mismatched state.                                                       |
| Existing tests             | Safety/privacy/access/voice/League/reward semantics remain. Exact reset and 48 → 60 tests must intentionally change or remain schema-3 compatibility tests; they may not silently disappear.                             |
| Fixture changes            | Retain schema-3 input oracle. New reset would be personal 108, Mangrove 48, canopy 19, Circle 11, grants off, no pending reveal.                                                                                         |
| Risks                      | Highest: invented history, reward leakage, contradictory totals, cross-profile contamination, reset churn, and broad visual/test rewrite. R002's word “approved” is not current authority.                               |
| Estimated scope            | **Large**: schema/adapter/evaluator, two-version fixtures, integration, recovery/rollback, focused tests, full regression, and approved redesigns.                                                                       |
| Conditional recommendation | Do not pursue without explicit Product approval of 108 → 120 → 180 and opening-evidence semantics. If chosen, use a new schema and retained schema-3 oracle, never a direct fixture edit. Not selected.                  |

### Rollback, reset, and idempotency

- Deterministically recreate the complete pre-migration schema-3 snapshot and record its hash.
- Commit a migration receipt only after every target record validates. Interruption before commit
  leaves schema 3 authoritative.
- Same migration key plus same input returns the same result; same key plus different input fails.
- A schema-3 build may reopen data only before a new-schema-only event, unless an approved reverse
  adapter preserves all new immutable history. Reset is not rollback.
- Test Salem, Alya, and a new Child independently. No key, award, station, reveal, League state, or
  Family Reward state may cross profiles.

## Option C — Revised combined model

Keep current numbers and consequences, but add one profile-scoped Impact Path derived from the same
Seed authority. Normalize schema-3's opening scalar into provenance-bearing opening evidence without
changing its amount. The Path is not a wallet or second balance.

| Required consideration     | Proposal                                                                                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User-visible effect        | Salem remains 48 → 60. The projection may show provable archived 12/60 milestones; Water & Coast 120 → 180 stays future/locked until confirmed lifetime Seeds reach 120. Garden, canopy, Circle, League, and reward remain independent.                       |
| Data-model changes         | Add immutable `SeedOpeningEvidence`, read-only `LifetimeSeedProjection`, versioned definitions, profile-scoped receipts, and event-owned reveal queue. Projection is the sum of opening evidence and unique committed Seed transactions; it has no write API. |
| Migration                  | One idempotent normalization receipt records existing 48 with `seedDelta = 0`, no mastery inference, no reveal, and unchanged recognition keys. No 48 → 108 rebase.                                                                                           |
| Existing tests             | All remote numerical tests remain. Add projection equality, duplicate no-op, profile-isolation, and non-mutation tests for Garden/League/reward.                                                                                                              |
| Fixture changes            | Keep reset at personal 48 and Mangrove 48/60. Add derived expectations: Path 48 at reset and 60 after approval; 120 chapter locked. Candidate 108/120 vectors remain noncanonical.                                                                            |
| Risks                      | R002 numerical frames need correction. Careless normalization could double-count opening 48 or create a duplicate balance.                                                                                                                                    |
| Estimated scope            | **Medium**: normalization adapter, pure projections/evaluators, event records, additive tests, and corrected visual copy.                                                                                                                                     |
| Conditional recommendation | Strongest migration-safe candidate if R3 needs a durable Path while preserving remote behavior. Product must still approve criteria, badge registry, designs, and a locked 120 chapter. Recommendation only; not selected.                                    |

Proof obligations: no `impactPathBalance` or debit/transfer API; every total exposes source keys;
same evidence recomputes identically; station reads mutate no domain; composite badges require their
own evidence; and wrong-profile/wrong-role selectors fail closed.

## Decisions required before selection

1. Is the canonical personal Seed story 48 → 60 or 108 → 120?
2. Is Water & Coast 120 → 180 active, future/locked, or deferred?
3. Is a synthetic opening-fixture adjustment legitimate evidence?
4. Which Garden, canopy, Circle, Challenge Leaf/League, Family Reward, phase-review, badge, and
   safe-help consequences belong to one approval event?
5. Is versioned local persistence authorized for this MVP?
6. What reset/version/rollback oracle is approved for Salem, Alya, and a new Child?

All options remain open. The implementation gate remains unchanged.
