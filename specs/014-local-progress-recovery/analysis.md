# Recovery proposal consistency and review disposition

September 12, 2026. A's draft analysis; no runtime implementation or student/native acceptance.
The independent D report remains attributed to its reviewed snapshots; this file does not rewrite
D's status or declare D agreement with later A changes.

| Review item                                       | A disposition in current draft                                                                                                       | Remaining gate                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| D-014-01 durable commit before UI acknowledgment  | Spec/plan explicitly restore a completed durable write even if success rendering was interrupted                                     | D re-review; fault/native test                                                                                          |
| D-014-02 missing versus empty evidence            | Required empty/journey discriminant; absent committed facts are invalid, not baseline                                                | D re-review; parser/fault test                                                                                          |
| D-014-03 closed allowlist/omitted private content | Closed fact list plus explicit recovered-approved task seam; actual accepted final copy/praise, no raw draft, notes or Child content | D + student scope acceptance and typed implementation review                                                            |
| D-014-04 variants and separate eligibility        | Original @1 oracle distinct from GI01 @2 +8 and safe @2 +12; no inherited League/Reward eligibility                                  | D re-review; accepted-variant tests                                                                                     |
| D-014-05 unresolved negotiation                   | Parent review, Child decision, accepted and kept-current are explicit separate states                                                | D re-review; restart at each pending decision                                                                           |
| D-014-06 orphan/legacy reset cleanup              | v5-first reads, no invalid-v5 fallback; clear legacy family keys before v5 last; missing family invalidates affinity                 | Explicit absent-family/auxiliary-key cleanup predicate and no-role retry now specified; D re-review/fault proof pending |
| D-014-07 repository path                          | Existing `src/services/local/repository.ts` replaces the nonexistent guessed filename                                                | Resolved in draft; no runtime rename                                                                                    |
| A-T004 original input required by execution       | New explicit approved execution projection; authoring Task stays strict, no fabricated original text or caller flag bypass           | Concrete design is proposed; no runtime grant until reviewed/accepted                                                   |
| A-T004 accepted source coverage                   | Exact final title/action/rationale/definition/help for bounded draft source, not only action/praise                                  | Approve final-copy allowlist and field limits; no stored provider exchange                                              |
| A-T004 historical praise order                    | Actual recognized `praisePresentedAt` retained as fact; pending presentation reset; no continuation restored                         | Pure historical validation then static projection tests                                                                 |

## Requirement-to-task coverage

| Requirement              | Proposed tasks       | Notes                                                                   |
| ------------------------ | -------------------- | ----------------------------------------------------------------------- |
| FR-001 / FR-002          | T004, T009–013       | Canonical source/variant/stage/negotiation identity                     |
| FR-003                   | T005, T011–014       | Durable write before success; post-write/pre-render death case          |
| FR-004 / FR-005          | T004, T009–013, T017 | Closed allowlist, explicit absent-original projection and Child privacy |
| FR-006                   | T008, T012–015       | Current role authority and fresh pending praise remain required         |
| FR-007 / FR-008 / FR-009 | T009–015, T018       | Independent projections, canonical/variant oracles, no loss/duplicate   |
| FR-010 / FR-011          | T005–008, T014–015   | Durable generation, same IDs, legacy cleanup, late work                 |
| FR-012                   | T007, T011, T017     | Known migration only; unknown/corrupt/read errors                       |
| FR-013                   | T016–019             | Finite bilingual recovery states, authorized retry/reset                |
| FR-014                   | T018–019, T021       | No extra feature/provider/package/flag activation                       |
| FR-015                   | T020–021             | Exact APK/native and named student acceptance                           |

All 15 functional requirements have proposed tasks. No implementation checkbox is claimed passed.
No constitution waiver is proposed. D's final review `242cd49` (integrated as `217f095`) addresses
all seven proposal findings at product/design-direction level, including the orphan predicate.
This supersedes the earlier pending-review cells for those reviewed design choices, without
passing any implementation or fault test. User acceptance and T004's exact typed serializer,
approved-execution and historical-receipt mapping/review remain open. A roadmap or checked
document structure is not a READY runtime grant.

Do not execute `speckit-implement` against this draft. Resolve those items, record the actual scope
decision, then commit an accepted contract and exact disjoint implementation grants. Existing
A-004/B-004/C-002/A-006 repairs and candidate testing continue independently.
