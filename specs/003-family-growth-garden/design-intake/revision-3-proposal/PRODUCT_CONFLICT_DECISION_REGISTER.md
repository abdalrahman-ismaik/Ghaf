# Revision 3 Product Conflict Decision Register

> **STATUS: PROPOSED — NOT APPROVED — NOT IMPLEMENTATION AUTHORITY**
>
> **R002 INTAKE RECEIVED — PRODUCT CONFLICTS OPEN — IMPLEMENTATION BLOCKED**

**Prepared:** 2026-09-04

**Decision count:** 25

**Rule:** Every decision is `OPEN` until the named approval owner explicitly approves an option.
Recommendations are evidence-based proposals, not adopted product authority.

Evidence location keys used below:

- unqualified repository paths resolve at remote baseline
  `a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2`;
- “R002 prompt” means original-worktree
  `docs/design/stitch/releases/ghaf-r002/GHAF_CODEX_SCREEN_FLOW_AND_INTEGRATION_PROMPT.md`;
- “R002 export” means the named directory below
  `docs/design/stitch/releases/ghaf-r002/` in the original worktree;
- “R001” means
  `f63e39fc702bb1797791f7543c6316e3b06f3ba9:docs/design/stitch/releases/ghaf-r001/`;
- “Growth README” means
  `96cad3b917f43adad32c491153be54d3ab24f899:docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/README.md`; and
- “local preflight” means
  `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c:specs/003-family-growth-garden/design-intake/growth-journey-preflight.md`.

## Register index

| ID     | Topic                                                     | Compatibility      | Owner                                 | Status |
| ------ | --------------------------------------------------------- | ------------------ | ------------------------------------- | ------ |
| R3-001 | Private five-Leaf League versus Shared Growth             | mutually exclusive | Product + design                      | OPEN   |
| R3-002 | Shared Growth as a complement                             | additive           | Product + privacy + engineering       | OPEN   |
| R3-003 | Canonical recycling task ID                               | migration-required | Product + engineering                 | OPEN   |
| R3-004 | Schema-3 48→60 versus 108→120→180                         | migration-required | Product + engineering                 | OPEN   |
| R3-005 | Separate progression/reward authorities                   | migration-required | Product + engineering                 | OPEN   |
| R3-006 | Combined RevealBundle contents and order                  | migration-required | Product + design + engineering        | OPEN   |
| R3-007 | Missing Growth surfaces                                   | additive           | Product + design                      | OPEN   |
| R3-008 | Access authority and route guards                         | Compatible         | Product + engineering                 | OPEN   |
| R3-009 | Reset and fixture-version semantics                       | migration-required | Product + engineering + demo owner    | OPEN   |
| R3-010 | Synthetic voice and `expo-audio`                          | Compatible         | Product + engineering                 | OPEN   |
| R3-011 | Locale-aware typography migration                         | migration-required | Design + engineering + accessibility  | OPEN   |
| R3-012 | Child navigation physical order and RTL                   | mutually exclusive | Product + design + accessibility      | OPEN   |
| R3-013 | Radii, illustration direction, hierarchy                  | mutually exclusive | Design                                | OPEN   |
| R3-014 | Invalid live copy and unresolved placeholders             | migration-required | Product copy + design                 | OPEN   |
| R3-015 | Invalid PNGs, wrappers, duplicate `Final` variants, pairs | migration-required | Design                                | OPEN   |
| R3-016 | English parity                                            | additive           | Product copy + design + accessibility | OPEN   |
| R3-017 | Asset provenance and permission                           | additive           | Design + legal/rights owner           | OPEN   |
| R3-018 | Motion and non-happy-path state specifications            | additive           | Design + accessibility + engineering  | OPEN   |
| R3-019 | Conflicting Spec Kit task IDs                             | migration-required | Engineering + Spec Kit owner          | OPEN   |
| R3-020 | Decomposition of six local commits                        | migration-required | Engineering + product/design owners   | OPEN   |
| R3-021 | R001 authority and access-route expansion                 | migration-required | Product + design + engineering        | OPEN   |
| R3-022 | Parent approval/support behavior                          | Compatible         | Product + child safety                | OPEN   |
| R3-023 | Profile isolation and privacy projections                 | Compatible         | Product + privacy + engineering       | OPEN   |
| R3-024 | Sixteen permanent badges                                  | additive           | Product + content + engineering       | OPEN   |
| R3-025 | Mangrove learning and equal-credit route                  | additive           | Product + content + accessibility     | OPEN   |

## R3-001 — Private five-Leaf League versus cooperative Shared Growth

| Field                         | Content                                                                                                                                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-001`                                                                                                                                                                                                                         |
| Topic                         | Which experience owns the Child League root?                                                                                                                                                                                     |
| Current remote behavior       | A private synthetic invite-only League assigns exactly five approved Leaves per Child, scores each confirmed Leaf as 20 points up to 100, shares ties, ignores speed, and exposes an allowlisted ranked projection.              |
| Existing approved requirement | Preserve FR-111–FR-115, including five Leaves, normalized score, shared positions, strict projection, opt-out, and separate cooperative family goal.                                                                             |
| Local/R002 proposal           | R002 `/circle` becomes qualitative “دوري النمو” Shared Growth with no ranks, percentages, participant counts, public names, or points table.                                                                                     |
| Evidence                      | `spec.md:934-950`; `src/models/familyLeague.ts:12`; `tests/family-league.test.ts:375-744`; R002 `GHAF_CODEX_SCREEN_FLOW_AND_INTEGRATION_PROMPT.md:379-404`; export `ghaf_child_growth_league_shared_growth/screen.png` 334×1600. |
| Compatibility                 | **mutually exclusive**                                                                                                                                                                                                           |
| Risks                         | Silent removal of approved fairness mechanics; confusing “League” copy; privacy regression; orphaned League records/tests.                                                                                                       |
| Options                       | A) retain private League; B) replace it through explicit versioned product migration; C) keep League and add separately named Shared Growth (see R3-002).                                                                        |
| Recommendation                | A now; consider C only after a separate privacy and information-architecture decision.                                                                                                                                           |
| Required migration            | None for A; domain, fixture, route, copy, test, and stored-state migration for B/C.                                                                                                                                              |
| Approval owner                | Product + design.                                                                                                                                                                                                                |
| Status                        | **OPEN**                                                                                                                                                                                                                         |

## R3-002 — Shared Growth as a complementary experience

| Field                         | Content                                                                                                                                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-002`                                                                                                                                                                                                                            |
| Topic                         | Can Shared Growth coexist with League?                                                                                                                                                                                              |
| Current remote behavior       | League already includes a separate cooperative confirmed-count goal; Green Circle is another strict Green-only projection.                                                                                                          |
| Existing approved requirement | League projection and Green Impact projection remain separate; only allowlisted, eligible data may enter shared visuals.                                                                                                            |
| Local/R002 proposal           | Add Child Shared Growth and Parent participation/privacy settings using anonymous qualitative aggregate data.                                                                                                                       |
| Evidence                      | `spec.md:934-950`; `data-model.md:649-666`; `tests/privacy-projection.test.ts:24-193`; R002 prompt `:379-404`; exports `ghaf_child_growth_league_shared_growth/` and `ghaf_parent_shared_garden_participation_privacy/` (487×1055). |
| Compatibility                 | **additive**                                                                                                                                                                                                                        |
| Risks                         | Third overlapping “shared” counter; accidental household-data leakage; consent confusion; duplicated canopy meaning.                                                                                                                |
| Options                       | A) no Shared Growth; B) replace League; C) separate optional aggregate projection with explicit eligibility and Parent controls.                                                                                                    |
| Recommendation                | Evaluate C; never infer League replacement from the export.                                                                                                                                                                         |
| Required migration            | New projection/consent version and reset fixtures; no change to League/Green ledger.                                                                                                                                                |
| Approval owner                | Product + privacy + engineering.                                                                                                                                                                                                    |
| Status                        | **OPEN**                                                                                                                                                                                                                            |

## R3-003 — Canonical recycling task ID

| Field                         | Content                                                                                                                                                                                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-003`                                                                                                                                                                                                                                                                          |
| Topic                         | `task_recycling_p0_v1` versus `task.recycling_sort.v1`.                                                                                                                                                                                                                           |
| Current remote behavior       | Fixtures, lifecycle, voice transcripts, reward tests, and privacy tests bind to `task_recycling_p0_v1`.                                                                                                                                                                           |
| Existing approved requirement | The exact P0 task is a 12-Seed Green Impact acquisition with Parent approval, help allowed, and no quantified impact claim.                                                                                                                                                       |
| Local/R002 proposal           | R002 declares `task.recycling_sort.v1` canonical; local Growth preflight recommends retaining the underscore ID but is only candidate evidence.                                                                                                                                   |
| Evidence                      | `src/services/mock/fixtures.ts:194-196`; `tests/assistant-voice-session.test.ts:24,63-68`; `tests/reward-matrix.test.ts:216-217`; R002 prompt `:228-236`; `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c:specs/003-family-growth-garden/design-intake/growth-journey-preflight.md:24`. |
| Compatibility                 | **migration-required**                                                                                                                                                                                                                                                            |
| Risks                         | Broken attempt/receipt/voice/Leaf references, double awards, non-idempotent reset.                                                                                                                                                                                                |
| Options                       | A) preserve current ID; B) versioned alias; C) full atomic migration to dotted ID.                                                                                                                                                                                                |
| Recommendation                | A; consider B only when an external contract requires it.                                                                                                                                                                                                                         |
| Required migration            | For B/C: migrate definitions, versions, assignments, attempts, events, receipts, voice bindings, League Leaves, tests, and fixtures with one canonicalization key.                                                                                                                |
| Approval owner                | Product + engineering.                                                                                                                                                                                                                                                            |
| Status                        | **OPEN**                                                                                                                                                                                                                                                                          |

## R3-004 — Schema-3 48→60 versus 108→120→180

| Field                         | Content                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-004`                                                                                                                                             |
| Topic                         | Demo progression baseline and next chapter.                                                                                                          |
| Current remote behavior       | Schema 3 resets Salem to 48 lifetime Seeds/Mangrove 48/60; one +12 recognition produces 60 Seeds, Sapling 60/60, canopy 20/25, and circle 12/12.     |
| Existing approved requirement | Exact reset and confirmation tables plus five landscape thresholds 0/20/60/120/200.                                                                  |
| Local/R002 proposal           | Start at 108 lifetime Seeds with Mangrove 48/60; approval yields lifetime 120, archives Mangrove 60/60, and opens a cumulative 120→180 Impact Path.  |
| Evidence                      | `spec.md:507-544,629-643`; `data-model.md:553-608`; `tests/prototype-state.test.ts:170-255`; R002 prompt `:131-138,306-355`; Growth README `:49-53`. |
| Compatibility                 | **migration-required**                                                                                                                               |
| Risks                         | Conflating lifetime Seeds, plant-stage denominator, Reward progress, and path; corrupt reset; invalid historical receipts.                           |
| Options                       | A) preserve schema 3; B) approved new cumulative schema; C) keep existing consequences and derive an Impact Path projection.                         |
| Recommendation                | Do not choose in this package; investigate C first, with A as fallback.                                                                              |
| Required migration            | Versioned fixture/state migration, rollback, idempotency, cross-profile and duplicate-event tests for B/C.                                           |
| Approval owner                | Product + engineering.                                                                                                                               |
| Status                        | **OPEN**                                                                                                                                             |

## R3-005 — Relationships among progression and reward authorities

| Field                         | Content                                                                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-005`                                                                                                                                                             |
| Topic                         | Personal Seeds, plant growth, canopy, League Leaves, Challenge Leaf, Family Reward, and Impact Path relationships.                                                   |
| Current remote behavior       | Seed receipt, mapped landscape, household canopy, Green Circle, League week, and private Family Reward are separate authorities with separate eligibility.           |
| Existing approved requirement | Family Reward never derives from rank; League/Green projections are separate; protected/private content is filtered before sharing; earned progress never decreases. |
| Local/R002 proposal           | Fixture equality at 108/120 and a combined approval/reveal could make multiple values appear to be one counter.                                                      |
| Evidence                      | `spec.md:606-627,919-950`; `data-model.md:433-510,610-666`; `tests/{privacy-projection,family-reward,family-league}.test.ts`; R002 prompt `:306-355,649-682`.        |
| Compatibility                 | **migration-required**                                                                                                                                               |
| Risks                         | Second currency, rank-funded reward, privacy leak, unrelated landscape growth, accidental reset coupling.                                                            |
| Options                       | A) preserve all authorities and derive Path; B) merge selected ledgers with migration; C) make visual-only equality without semantic coupling.                       |
| Recommendation                | A; document causal joins by event ID, never by equal numbers.                                                                                                        |
| Required migration            | None for a read-only projection; schema/evidence migration for any merged authority.                                                                                 |
| Approval owner                | Product + engineering.                                                                                                                                               |
| Status                        | **OPEN**                                                                                                                                                             |

## R3-006 — Combined RevealBundle contents and ordering

| Field                         | Content                                                                                                                                                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-006`                                                                                                                                                                                                                                        |
| Topic                         | One combined post-event result and its deterministic order.                                                                                                                                                                                     |
| Current remote behavior       | Parent praise is rendered before a distinct recognition continuation; recognition commits Seeds, Mangrove, canopy, circle, receipt, and celebration idempotently. League/Reward domains exist separately.                                       |
| Existing approved requirement | One approved event must preserve every valid consequence; no early reward; duplicate confirmation is a no-op; private data stays scoped.                                                                                                        |
| Local/R002 proposal           | One bundle per `{profileId, triggerEventId}` with praise, garden, Seeds, badges/stations, and safe-help; local preflight additionally proposes canopy/Leaf/League and Family Reward.                                                            |
| Evidence                      | `acceptance-contract.md:162-194`; `tests/parent-check-in-flow.test.ts`; R002 prompt `:330-355,600-630`; `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c:specs/003-family-growth-garden/design-intake/growth-journey-preflight.md:26`.                 |
| Compatibility                 | **migration-required**                                                                                                                                                                                                                          |
| Risks                         | Omitted rewards, double sheets, wrong order, replay duplication, cross-profile bundle, animation-triggered commit.                                                                                                                              |
| Options                       | A) retain current staged UI; B) replace with reduced R002 bundle; C) event-owned superset bundle with deterministic optional slots.                                                                                                             |
| Recommendation                | C, pending explicit approval of inclusion/order for Parent praise, self-reported result, committed Seeds, mapped plant transition, canopy, League/Challenge Leaf, private Family Reward, badge/path/learning unlock, and safe-help recognition. |
| Required migration            | Versioned bundle record/queue, recovery/seen state, legacy-celebration disposition, idempotency tests.                                                                                                                                          |
| Approval owner                | Product + design + engineering.                                                                                                                                                                                                                 |
| Status                        | **OPEN**                                                                                                                                                                                                                                        |

## R3-007 — Missing Growth surfaces

| Field                         | Content                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-007`                                                                                                                                                         |
| Topic                         | Design authority for Impact Path, Gallery, Detail, Learning, Parent Progress, and RevealBundle.                                                                  |
| Current remote behavior       | None of these seven surfaces exists in the ten-route runtime.                                                                                                    |
| Existing approved requirement | No unreleased screen may be implemented without approved Stitch evidence; new routes/states must preserve role isolation and origin return.                      |
| Local/R002 proposal           | R002 prose names all seven and proposes owners, but no matching export directories exist.                                                                        |
| Evidence                      | Remote route list `spec.md:77-95`; R002 prompt `:406-418`; R002 directory inventory has no path/badge/learning/progress/reveal folder; local preflight `:52-75`. |
| Compatibility                 | **additive**                                                                                                                                                     |
| Risks                         | Invented screens/copy/actions, inaccessible modal state, orphan routes, missing English.                                                                         |
| Options                       | A) wait for complete handoff; B) remove surfaces from R3; C) approve purpose/spec before visual design, still block runtime.                                     |
| Recommendation                | A plus C for documentation only.                                                                                                                                 |
| Required migration            | None until approved; later route/origin/state versioning.                                                                                                        |
| Approval owner                | Product + design.                                                                                                                                                |
| Status                        | **OPEN**                                                                                                                                                         |

## R3-008 — Access authority and role guards

| Field                         | Content                                                                                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-008`                                                                                                                                                                   |
| Topic                         | Parent/Child session authority and navigation guards.                                                                                                                      |
| Current remote behavior       | Separate least-privilege session types, immutable capability allowlists, expiring one-use Parent-approved pairing, reauthentication, revocation, and cross-role rejection. |
| Existing approved requirement | FR-100–FR-105; a mutable role value cannot grant Parent capability and Child cannot enter Parent surfaces.                                                                 |
| Local/R002 proposal           | R001 onboarding adds deterministic Parent sign-in/setup; R002 adds profile/PIN/pairing and boot routes, but its prompt may expand navigation authority.                    |
| Evidence                      | `spec.md:902-918`; `src/models/access.ts`; `tests/access-control.test.ts:30-680`; local `1dda546054d0a98661c4ead641f9cf6495041714`; R002 prompt `:155-216`.                |
| Compatibility                 | **Compatible**                                                                                                                                                             |
| Risks                         | Authentication-looking UI over weak guard, cross-profile reads, role-toggle privilege escalation, information leakage on invalid code.                                     |
| Options                       | A) keep remote authority and adapt UI; B) replace access model; C) retain demo role switch.                                                                                |
| Recommendation                | A; label all credentials synthetic and keep generic errors.                                                                                                                |
| Required migration            | Route/session adapter and tests; full replacement requires credential/pairing migration.                                                                                   |
| Approval owner                | Product + engineering.                                                                                                                                                     |
| Status                        | **OPEN**                                                                                                                                                                   |

## R3-009 — Reset and fixture-version semantics

| Field                         | Content                                                                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-009`                                                                                                                                                               |
| Topic                         | Parent reset, ordinary replay, first-run flags, and schema migration.                                                                                                  |
| Current remote behavior       | Parent role is required; reset atomically restores schema-3 Arabic baseline and clears voice/celebration/history state.                                                |
| Existing approved requirement | Parent-only, offline, exact reset; five consecutive resets from named states; earned progress never resets during weekly rollover.                                     |
| Local/R002 proposal           | Distinguish ordinary relaunch/replay, Parent demo reset, and operator first-run reset; migrate old 48→60 data to 108→120→180.                                          |
| Evidence                      | `src/state/usePrototypeStore.ts:394-424`; `acceptance-contract.md:99-135`; `tests/prototype-state.test.ts:170-255`; local preflight `:28`; R002 prompt `:174-216,682`. |
| Compatibility                 | **migration-required**                                                                                                                                                 |
| Risks                         | Child-triggered reset, lost permanent progress, stale deep link, irreproducible demo, non-idempotent migration.                                                        |
| Options                       | A) preserve one reset; B) specify separate Parent/demo/operator commands; C) migrate fixture without split reset.                                                      |
| Recommendation                | Preserve Parent authorization; specify command-by-command retained/cleared fields before choosing B/C.                                                                 |
| Required migration            | Fixture/schema version, rollback, reset oracle, process-interruption and cross-profile tests.                                                                          |
| Approval owner                | Product + engineering + demo owner.                                                                                                                                    |
| Status                        | **OPEN**                                                                                                                                                               |

## R3-010 — Synthetic voice and `expo-audio`

| Field                         | Content                                                                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-010`                                                                                                                                                                                             |
| Topic                         | Preserve deterministic voice behavior and native dependency.                                                                                                                                         |
| Current remote behavior       | Parent-gated prepared push-to-talk state machine; no microphone/audio bytes; captions, replay, 0.75×/1×, delete/send/reset; `expo-audio` remains configured with recording/background disabled.      |
| Existing approved requirement | FR-116–FR-123 preserve deterministic synthetic voice, stored grant, task/version binding, and truthful labels.                                                                                       |
| Local/R002 proposal           | Local design commit replaces the `expo-audio` plugin with `expo-font`; R002 provides no equivalent voice design contract.                                                                            |
| Evidence                      | `package.json:24`; `app.config.ts` expo-audio plugin; `spec.md:951-985`; `tests/assistant-voice-session.test.ts`; `d217520f4e5b8e30b3690091527515dd8fe158cc` diff in `app.config.ts`/`package.json`. |
| Compatibility                 | **Compatible**                                                                                                                                                                                       |
| Risks                         | Regression of prepared playback/permission posture; accidental real recording claim; missing accessible transcript.                                                                                  |
| Options                       | A) retain `expo-audio` and add `expo-font` separately if approved; B) remove audio feature through product change; C) keep visual-only voice without native playback.                                |
| Recommendation                | A; dependency changes must be isolated and measured.                                                                                                                                                 |
| Required migration            | Config/dependency reconciliation and native permission/config tests.                                                                                                                                 |
| Approval owner                | Product + engineering.                                                                                                                                                                               |
| Status                        | **OPEN**                                                                                                                                                                                             |

## R3-011 — Locale-aware typography migration

| Field                         | Content                                                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Decision ID                   | `R3-011`                                                                                                                                                                                         |
| Topic                         | System fonts versus Alexandria headings and Readex Pro UI/body.                                                                                                                                  |
| Current remote behavior       | One system-family token resolver with six roles, explicit Arabic/English leading, zero Arabic tracking, and tests preventing raw typography outside tokens/primitives.                           |
| Existing approved requirement | Remote FR-124 requires current system-family policy; narrow R001 evidence approves Alexandria/Readex for its batch.                                                                              |
| Local/R002 proposal           | Bundle Alexandria 400/700/800 and Readex 400/500/600/700 via Expo font packages and expand role tokens.                                                                                          |
| Evidence                      | `spec.md:986-990`; `src/design/tokens.ts:56-127`; `tests/bilingual-typography.test.ts:37-135`; R001 `STITCH_DESIGN.md:20-21`; `d217520f4e5b8e30b3690091527515dd8fe158cc:assets/fonts/README.md`. |
| Compatibility                 | **migration-required**                                                                                                                                                                           |
| Risks                         | FOUT/reflow, wrong Android family name, missing license, clipped Arabic, font-scale regressions, R001-only approval overreach.                                                                   |
| Options                       | A) keep system fonts; B) migrate only R001 routes; C) approve app-wide locale-aware Alexandria/Readex migration.                                                                                 |
| Recommendation                | B until later screens are measured; require local binaries/licenses, fallback, load/error tests, and Android evidence.                                                                           |
| Required migration            | Token roles, font loader/config, layout baselines, snapshots and accessibility tests.                                                                                                            |
| Approval owner                | Design + engineering + accessibility.                                                                                                                                                            |
| Status                        | **OPEN**                                                                                                                                                                                         |

## R3-012 — Child navigation physical order and RTL

| Field                         | Content                                                                                                                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-012`                                                                                                                                                                                                                                 |
| Topic                         | Physical order, semantic RTL, and root versus nested navigation.                                                                                                                                                                         |
| Current remote behavior       | Ten routes use logical RTL helpers; no approved three-tab Child shell exists at remote head.                                                                                                                                             |
| Existing approved requirement | Arabic starts RTL; directional arrows mirror, nondirectional art does not; Parent/Child routes remain isolated.                                                                                                                          |
| Local/R002 proposal           | Physical left-to-right Child tabs listed as `الدوري، حديقتي، اليوم`, with Help left, title centered, avatar right, and nested Back right. Local R3 design says persistent Today/Garden/League but does not alone approve physical order. |
| Evidence                      | `DESIGN.md:180-188,389-415`; R002 prompt `:356-377,722-740`; `ghaf_impact_path_badges_specification.md:53-57`.                                                                                                                           |
| Compatibility                 | **mutually exclusive**                                                                                                                                                                                                                   |
| Risks                         | Double reversal, misleading reading order, inaccessible focus order, cross-role route exposure.                                                                                                                                          |
| Options                       | A) approve explicit physical R002 order; B) use logical locale order; C) request corrected shell frames/testing.                                                                                                                         |
| Recommendation                | C, then encode geometry separately from semantic/accessibility order.                                                                                                                                                                    |
| Required migration            | Navigation shell, deep-link/back/origin tests, RTL/LTR and TalkBack validation.                                                                                                                                                          |
| Approval owner                | Product + design + accessibility.                                                                                                                                                                                                        |
| Status                        | **OPEN**                                                                                                                                                                                                                                 |

## R3-013 — Radii, illustration direction, and visual hierarchy

| Field                         | Content                                                                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-013`                                                                                                                                                                     |
| Topic                         | One Ghaf visual system for later screens.                                                                                                                                    |
| Current remote behavior       | Radii 6/10/14/18; system typography; connected landscapes and restrained tonal surfaces.                                                                                     |
| Existing approved requirement | R001 narrowly approves Soft Organic Modernism, 16px primary radii, botanical geometry, Alexandria/Readex, 48dp targets.                                                      |
| Local/R002 proposal           | R002 editorial doc uses 4px controls/8px containers; Soft Geometric doc uses 4/8/12/16/24 and organic masks; exports mix editorial and organic variants.                     |
| Evidence                      | Remote `DESIGN.md:78-120`; R001 `STITCH_DESIGN.md:20-42`; R002 `STITCH_DESIGN.md` “Shapes”; `ghaf/DESIGN.md:95-112,158-173`; `ghaf_soft_geometric/DESIGN.md:98-109,155-176`. |
| Compatibility                 | **mutually exclusive**                                                                                                                                                       |
| Risks                         | Inconsistent brand, excessive card softness, mirroring nondirectional art, poor hierarchy and target size.                                                                   |
| Options                       | A) remote tokens; B) R001 organic tokens; C) R002 editorial tokens; D) role-by-role reconciliation tied to selected PNGs.                                                    |
| Recommendation                | D, with R001 frozen only inside its approved boundary until app-wide approval.                                                                                               |
| Required migration            | Token mapping and per-screen visual regression; no direct CSS import.                                                                                                        |
| Approval owner                | Design.                                                                                                                                                                      |
| Status                        | **OPEN**                                                                                                                                                                     |

## R3-014 — Invalid live copy and unresolved placeholders

| Field                         | Content                                                                                                                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-014`                                                                                                                                                                                                                                            |
| Topic                         | `EN:S`, template markers, and generated placeholder copy.                                                                                                                                                                                           |
| Current remote behavior       | User-facing copy lives in paired resources and parity tests; prepared/synthetic labels are explicit.                                                                                                                                                |
| Existing approved requirement | Arabic-first equivalent English; no placeholder, fabricated capability, or second copy source may ship.                                                                                                                                             |
| Local/R002 proposal           | R002 visibly renders `EN:S`/`:EN:S` in the task-card avatar and a mixed `My Garden` heading; its HTML also contains unresolved `{{DATA:SCREEN:SCREEN_34}}` in the avatar source and `{{DATA:SCREEN:SCREEN_51}}` in a navigation URL.                |
| Evidence                      | `tests/localization-parity.test.ts`; R002 `ghaf_parent_task_review_pending_corrected/screen.png` 706×1600 and `code.html:165`; `ghaf_child_growth_moment_approved/screen.png` 519×1600; `ghaf_task_builder_3_review_updated_success/code.html:267`. |
| Compatibility                 | **migration-required**                                                                                                                                                                                                                              |
| Risks                         | Broken visible copy, dead navigation, leaked generator tokens, inaccessible labels.                                                                                                                                                                 |
| Options                       | A) reject affected variants; B) correct through approved copy/spec; C) use a verified alternative export.                                                                                                                                           |
| Recommendation                | A until exact source and approved replacement copy are recorded.                                                                                                                                                                                    |
| Required migration            | Canonical resource keys, translation review, visual and interaction retest.                                                                                                                                                                         |
| Approval owner                | Product copy + design.                                                                                                                                                                                                                              |
| Status                        | **OPEN**                                                                                                                                                                                                                                            |

## R3-015 — Export integrity and canonical selection

| Field                         | Content                                                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Decision ID                   | `R3-015`                                                                                                                                                                                                                 |
| Topic                         | Invalid PNGs, desktop wrappers, duplicate variants, and incomplete pairs.                                                                                                                                                |
| Current remote behavior       | No R002 export is runtime authority.                                                                                                                                                                                     |
| Existing approved requirement | PNG is canonical only after named release approval; HTML is non-runtime measurement evidence; 390×844 is a reference, not fixed canvas.                                                                                  |
| Local/R002 proposal           | 74 folders with many base/refined/corrected/final variants and prompt-authored canonical claims.                                                                                                                         |
| Evidence                      | Counts: 74/71/70/69; `ghaf_task_created_success_2/screen.png` 487×1; `ghaf_system_launch_{1,3}` and `ghaf_opening_moment_2` 1600×1280; `ghaf_task_builder_flow/` HTML-only; two 1024×1024 illustration PNG-only folders. |
| Compatibility                 | **migration-required**                                                                                                                                                                                                   |
| Risks                         | Desktop board adopted as mobile UI, corrupt reference, duplicate routes/sheets, arbitrary `Final` selection.                                                                                                             |
| Options                       | A) classify every folder and approve selected mobile frames; B) reject entire intake; C) request regenerated clean release.                                                                                              |
| Recommendation                | A, with C for invalid/missing pairs; never promote by filename.                                                                                                                                                          |
| Required migration            | Screen manifest, checksums, dimensions, canonical/superseded links, approval record.                                                                                                                                     |
| Approval owner                | Design.                                                                                                                                                                                                                  |
| Status                        | **OPEN**                                                                                                                                                                                                                 |

## R3-016 — English parity

| Field                         | Content                                                                                                                                                         |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-016`                                                                                                                                                        |
| Topic                         | Equivalent English LTR design and copy.                                                                                                                         |
| Current remote behavior       | Arabic/English resources and parity tests cover existing routes; locale switching preserves state.                                                              |
| Existing approved requirement | Complete journey must work Arabic-first and equivalent English LTR; no concatenated fragments.                                                                  |
| Local/R002 proposal           | R001 and R002 mainly supply Arabic frames; occasional “English” buttons do not constitute matched LTR references.                                               |
| Evidence                      | `spec.md:60-61`; `acceptance-contract.md:268-301`; `tests/localization-parity.test.ts`; R001 `SCREEN_INDEX.md:18-20`; R002 exports have no matched English set. |
| Compatibility                 | **additive**                                                                                                                                                    |
| Risks                         | Layout breakage, semantic divergence, bidi bugs, English-only or Arabic-only actions.                                                                           |
| Options                       | A) require paired LTR frames before release; B) approve semantic parity without visual parity for a narrow batch; C) defer English.                             |
| Recommendation                | A for R002; B remains only the recorded R001 limitation.                                                                                                        |
| Required migration            | Resource-key parity, LTR screen references, bidi/long-copy/200% tests.                                                                                          |
| Approval owner                | Product copy + design + accessibility.                                                                                                                          |
| Status                        | **OPEN**                                                                                                                                                        |

## R3-017 — Asset provenance and permission

| Field                         | Content                                                                                                                                                                                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-017`                                                                                                                                                                                                                                              |
| Topic                         | Rights and runtime ownership of fonts/images/illustrations/icons.                                                                                                                                                                                     |
| Current remote behavior       | Code-native SVG and prepared local synthetic fixtures; root design requires source/creation/license/reviewer/date metadata.                                                                                                                           |
| Existing approved requirement | No remote runtime fonts/images, unreviewed marks, real Child data, or unproven rights.                                                                                                                                                                |
| Local/R002 proposal           | R002 HTML references remote Google images/fonts and two PNG-only illustrations; no manifest. Local font README cites OFL packages but native/render evidence is incomplete.                                                                           |
| Evidence                      | Remote `DESIGN.md:443-457`; 18 R002 HTML files/20 distinct `lh3.googleusercontent.com` URLs; all 70 HTML files reference Google-hosted fonts; R002 illustration folders 1024×1024; `d217520f4e5b8e30b3690091527515dd8fe158cc:assets/fonts/README.md`. |
| Compatibility                 | **additive**                                                                                                                                                                                                                                          |
| Risks                         | Copyright/license breach, remote dependency, mutable asset, unreviewed cultural/government imagery.                                                                                                                                                   |
| Options                       | A) replace with original local assets; B) document and clear supplied assets; C) use code-native placeholders.                                                                                                                                        |
| Recommendation                | A/C for MVP; B only with complete evidence.                                                                                                                                                                                                           |
| Required migration            | Asset manifest, local files, metadata removal, hash/license/reviewer records.                                                                                                                                                                         |
| Approval owner                | Design + legal/rights owner.                                                                                                                                                                                                                          |
| Status                        | **OPEN**                                                                                                                                                                                                                                              |

## R3-018 — Motion and non-happy-path state specifications

| Field                         | Content                                                                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-018`                                                                                                                               |
| Topic                         | Motion, reduced motion, loading/error/empty/offline/interrupted recovery.                                                              |
| Current remote behavior       | Existing routes have semantic state handling and reduced-motion contract; physical Android evidence remains open.                      |
| Existing approved requirement | State commits never depend on animation; reduced motion preserves information; keyboard/back/focus/offline remain usable.              |
| Local/R002 proposal           | Prompt prescribes some timings and behavior, but exports do not provide complete state PNGs, motion storyboard, or interruption specs. |
| Evidence                      | Remote `DESIGN.md:429-441`; `acceptance-contract.md:268-301`; R002 prompt `:174-187,742-770`; local preflight `:77-101`.               |
| Compatibility                 | **additive**                                                                                                                           |
| Risks                         | Lost result after interruption, stacked sheets, inaccessible focus, motion-triggered commit, blank error states.                       |
| Options                       | A) require full specs before UI; B) implement semantic states from product contract without visual approval; C) omit advanced states.  |
| Recommendation                | A for Growth; keep existing runtime states untouched.                                                                                  |
| Required migration            | State machine and recovery tests; approved reduced-motion and focus targets.                                                           |
| Approval owner                | Design + accessibility + engineering.                                                                                                  |
| Status                        | **OPEN**                                                                                                                               |

## R3-019 — Conflicting Spec Kit task IDs

| Field                         | Content                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-019`                                                                                                                                             |
| Topic                         | Preserve historical task identity.                                                                                                                   |
| Current remote behavior       | T111–T139 identify redesign authority, access, Reward, League, voice, and presentation work; many are checked.                                       |
| Existing approved requirement | Historical evidence must remain attributable and must not be rewritten.                                                                              |
| Local/R002 proposal           | Local `tasks.md` reuses T111–T119 for R001 and T120+ for different R2/R3 work through T193.                                                          |
| Evidence                      | Remote `specs/003-family-growth-garden/tasks.md:451-595`; `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c:specs/003-family-growth-garden/tasks.md:24-168`. |
| Compatibility                 | **migration-required**                                                                                                                               |
| Risks                         | False completion, broken references, audit ambiguity, accidentally reopening/overwriting completed work.                                             |
| Options                       | A) allocate new IDs after remote T139; B) use an R3-prefixed namespace; C) rewrite history.                                                          |
| Recommendation                | B or next collision-free numeric range; never C.                                                                                                     |
| Required migration            | Cross-reference map in spec/plan/checklists; preserve old IDs verbatim.                                                                              |
| Approval owner                | Engineering + Spec Kit owner.                                                                                                                        |
| Status                        | **OPEN**                                                                                                                                             |

## R3-020 — Decomposition of six local commits

| Field                         | Content                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-020`                                                                                                                                                                                                                                                                                                                                                    |
| Topic                         | Which local changes can become safe additive slices?                                                                                                                                                                                                                                                                                                        |
| Current remote behavior       | Remote independently implements overlapping access, tokens, services, tests, and canonical docs after the common base.                                                                                                                                                                                                                                      |
| Existing approved requirement | Preserve both histories; do not impose product decisions through conflict resolution.                                                                                                                                                                                                                                                                       |
| Local/R002 proposal           | Six broad commits form a dependency chain; first/last rewrite canonical sources, middle commits add R001 runtime, and Growth commits add candidate authority.                                                                                                                                                                                               |
| Evidence                      | Hash sequence `f63e39fc702bb1797791f7543c6316e3b06f3ba9`, `1dda546054d0a98661c4ead641f9cf6495041714`, `d217520f4e5b8e30b3690091527515dd8fe158cc`, `5f3f1a21135d6e0762cc482f11f08bcfde37d2a3`, `96cad3b917f43adad32c491153be54d3ab24f899`, `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c`; `git cherry` marks all unique; exact file lists from `git diff-tree`. |
| Compatibility                 | **migration-required**                                                                                                                                                                                                                                                                                                                                      |
| Risks                         | Obsolete code, lost remote safeguards, dependency removal, canonical-doc overwrite, unapproved Growth runtime.                                                                                                                                                                                                                                              |
| Options                       | A) cherry-pick whole commits; B) reconstruct approved slices; C) abandon all local work.                                                                                                                                                                                                                                                                    |
| Recommendation                | B; R001 evidence, validation rules, visual components, routes/resources, Growth research, and gap contracts each become separate future commits.                                                                                                                                                                                                            |
| Required migration            | Per-slice tests and old-to-new provenance trailers; see `LOCAL_COMMIT_PORT_PLAN.md`.                                                                                                                                                                                                                                                                        |
| Approval owner                | Engineering + product/design owners.                                                                                                                                                                                                                                                                                                                        |
| Status                        | **OPEN**                                                                                                                                                                                                                                                                                                                                                    |

## R3-021 — R001 authority and access-route expansion

| Field                         | Content                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-021`                                                                                                                                             |
| Topic                         | How narrow R001 approval enters remote ten-route architecture.                                                                                       |
| Current remote behavior       | `/` and `/role` are demo entry/role selection; no `/access/parent/**` route family.                                                                  |
| Existing approved requirement | Remote spec fixes ten routes; R001 separately records user approval for seven Parent-onboarding compositions only.                                   |
| Local/R002 proposal           | Replace entry with Welcome → six Parent setup steps → modal success → `/parent`; remove ordinary role toggle.                                        |
| Evidence                      | Remote `spec.md:77-95`; R001 `STITCH_DESIGN.md:8-22`; `SCREEN_INDEX.md:8-16`; local `5f3f1a21135d6e0762cc482f11f08bcfde37d2a3:app/access/parent/**`. |
| Compatibility                 | **migration-required**                                                                                                                               |
| Risks                         | Breaking demo Child entry, deep links/reset, or treating synthetic setup as production authentication.                                               |
| Options                       | A) preserve ten routes; B) approve R001 exception and guarded route expansion; C) model setup as states rather than routes.                          |
| Recommendation                | B only within narrow R001 scope, over remote capability guards and truthful synthetic labels.                                                        |
| Required migration            | Route registry, reset/history/deep-link tests, Child entry disposition, canonical spec amendment.                                                    |
| Approval owner                | Product + design + engineering.                                                                                                                      |
| Status                        | **OPEN**                                                                                                                                             |

## R3-022 — Parent approval and support behavior

| Field                         | Content                                                                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-022`                                                                                                                                                                           |
| Topic                         | Approval, “another try,” preserved work, and guidance.                                                                                                                             |
| Current remote behavior       | Submitted work may be confirmed or kindly retried/sized/equivalenced; praise is editable and separately presented before recognition; no loss occurs.                              |
| Existing approved requirement | Parent approves assignment and result; AI never judges truth/safety; help retains full award; no reject/fail/shame state.                                                          |
| Local/R002 proposal           | Parent review has Approve or Request Another Try; support sheet selects exact steps and optional guidance; accepted steps stay read-only during follow-up.                         |
| Evidence                      | `spec.md:579-604`; `acceptance-contract.md:137-194`; `tests/parent-check-in-flow.test.ts`; R002 prompt `:268-304`; support exports `_support_request_1/2`, child follow-up export. |
| Compatibility                 | **Compatible**                                                                                                                                                                     |
| Risks                         | Parent note becomes unsafe free text, accepted work lost, reward reduced after acceptance, “approval” commits before praise/review.                                                |
| Options                       | A) retain current behavior; B) adopt exact-step support as a new state with bounded guidance; C) replace retry contract.                                                           |
| Recommendation                | B after copy/input policy and idempotent attempt model are approved.                                                                                                               |
| Required migration            | Attempt/support-cycle fields, guidance validation, no-loss and resubmission tests.                                                                                                 |
| Approval owner                | Product + child safety.                                                                                                                                                            |
| Status                        | **OPEN**                                                                                                                                                                           |

## R3-023 — Profile isolation and privacy projections

| Field                         | Content                                                                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-023`                                                                                                                                                                     |
| Topic                         | Child-scoped selectors, League/Shared Growth fields, and Parent view.                                                                                                        |
| Current remote behavior       | Access sessions bind one Child/device; Reward projections reveal a plan only to matching Child/guardian; League and Green projections use strict allowlists.                 |
| Existing approved requirement | No cross-profile read/write; sensitive categories and task/media/money details never enter shared views.                                                                     |
| Local/R002 proposal           | New Child Garden/Path/Badge data, Shared Growth aggregation, and Parent selected-Child Progress view.                                                                        |
| Evidence                      | `spec.md:904-950`; `tests/access-control.test.ts:653-679`; `tests/family-reward.test.ts:380-598`; `tests/privacy-projection.test.ts:24-193`; R002 prompt `:379-418,649-682`. |
| Compatibility                 | **Compatible**                                                                                                                                                               |
| Risks                         | Cross-Child badge/Seed leakage, public status, money exposure, raw task data in aggregate.                                                                                   |
| Options                       | A) extend strict profile-scoped projections; B) store screen-level mixed data; C) aggregate only synthetic fixture data.                                                     |
| Recommendation                | A, with C only as clearly labeled demo source behind the same output allowlist.                                                                                              |
| Required migration            | Profile-scoped Growth selectors, wrong-profile/deep-link/reset tests, privacy threat review.                                                                                 |
| Approval owner                | Product + privacy + engineering.                                                                                                                                             |
| Status                        | **OPEN**                                                                                                                                                                     |

## R3-024 — Sixteen permanent badges

| Field                         | Content                                                                                                                                                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision ID                   | `R3-024`                                                                                                                                                                                                                |
| Topic                         | Registry size, criteria, permanence, and migration provenance.                                                                                                                                                          |
| Current remote behavior       | No badge registry or awards. Seeds/growth are permanent and private.                                                                                                                                                    |
| Existing approved requirement | Remote head has no approved badge registry or badge criteria. Existing privacy, permanence, no-loss, nonfinancial, and nonrandom/public-comparison rules constrain any future badge decision but do not approve badges. |
| Local/R002 proposal           | Exactly 16 deterministic, private, permanent P0 badges with Seed, mastery, station, learning, and activity criteria; states locked/in-progress/awaiting-review/earned.                                                  |
| Evidence                      | `96cad3b917f43adad32c491153be54d3ab24f899:docs/content/BADGE_CATALOG.md:3-56`; R002 `ghaf_impact_path_badges_specification.md:25-51`; no matching Gallery/Detail exports.                                               |
| Compatibility                 | **additive**                                                                                                                                                                                                            |
| Risks                         | Decorative unearned badges, false visit/ecology claims, migration timestamp shown as earned date, seventeenth ad hoc badge.                                                                                             |
| Options                       | A) approve all 16 after review; B) approve a smaller P0; C) defer badges.                                                                                                                                               |
| Recommendation                | Keep 16 as candidate ceiling, but approve each criterion/copy/source/art and historical-evidence rule explicitly.                                                                                                       |
| Required migration            | Versioned registry/evaluator, immutable evidence, historical-date-unavailable state, idempotent awards and profile isolation tests.                                                                                     |
| Approval owner                | Product + content + engineering.                                                                                                                                                                                        |
| Status                        | **OPEN**                                                                                                                                                                                                                |

## R3-025 — Mangrove learning and equal-credit route

| Field                         | Content                                                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Decision ID                   | `R3-025`                                                                                                                                                                                                                             |
| Topic                         | Finite Learning Story and accessible alternative.                                                                                                                                                                                    |
| Current remote behavior       | No learning completion entity or screen; deterministic Coach is task-bounded and prepared.                                                                                                                                           |
| Existing approved requirement | Remote head approves bilingual accessibility, privacy, and bounded Child-assistant constraints, but it has no approved Learning surface, LearningCompletion contract, zero-reward lesson rule, or equal-credit learning alternative. |
| Local/R002 proposal           | `learning.mangrove_roots.v1` unlocks at station 132; Story and accessible/Parent-guided alternative meet the same objective, create one idempotent event, and award zero Seeds/growth.                                               |
| Evidence                      | `96cad3b917f43adad32c491153be54d3ab24f899:docs/content/LEARNING_STORIES.md:3-28,46-59`; R002 prompt `:406-445`; no R002 Learning export.                                                                                             |
| Compatibility                 | **additive**                                                                                                                                                                                                                         |
| Risks                         | Unsourced facts, inequivalent credit, no-fail interaction becoming assessment, badge granted by opening/scrolling.                                                                                                                   |
| Options                       | A) approve one package after reviews; B) accessible route only; C) defer learning.                                                                                                                                                   |
| Recommendation                | A only after named factual, Arabic/English, UAE cultural, safeguarding, accessibility, and rights reviews.                                                                                                                           |
| Required migration            | Learning unlock/completion event, equal-credit tests, zero-Seed RevealBundle variant, origin recovery.                                                                                                                               |
| Approval owner                | Product + content + accessibility.                                                                                                                                                                                                   |
| Status                        | **OPEN**                                                                                                                                                                                                                             |

## Gate condition

No row changes from `OPEN` because this register exists. Approved decisions require an explicit
owner response, followed by a canonical specification update and validation in a separate authorized
phase.

> **R002 INTAKE RECEIVED — PRODUCT CONFLICTS OPEN — IMPLEMENTATION BLOCKED**
