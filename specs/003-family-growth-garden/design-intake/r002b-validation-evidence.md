# R002b Feature-Flagged Implementation Evidence

**Status:** IMPLEMENTED AS DEFAULT-OFF CANDIDATES — RELEASE ACTIVATION BLOCKED

**Evidence date:** 2026-09-05

> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

## Authority and evidence boundary

This record covers the local R002b implementation on
`integration/r3-r002b-implementation-20260905`. It does not activate a feature flag, approve copy
or assets, release a screen, or replace the frozen R001/R002a fallback. The
[implementation contract](r002b-implementation-contract.md), active
[specification](../spec.md), and [code-native screen index](../../../docs/design/stitch/releases/ghaf-r002b/SCREEN_INDEX.md)
remain the governing sources.

The product behavior baseline is `0501cf3` — `docs(r002): record validation and deferred scope`.
The final implementation checkpoint inspected for this record is `2e09419` —
`feat(league): add private five-leaf child experience`, 40 local commits after that baseline. The
earlier core checkpoint `895af72` passed 76 files and 967 tests; the final League-integrated
checkpoint passes 78 files and 979 tests. The six divergent historical commits remain non-ancestors
and unapplied. The original worktree remains at `ecbfb3a` with only
`docs/design/stitch/releases/ghaf-r002/` untracked.

Thirty-eight of the 44 R002b tasks are evidence-complete. The six open tasks are intentionally
limited to the incomplete cross-surface visual/native matrix and the approval RevealBundle path
that remains fail-closed until every legacy consequence has an authoritative receipt.

## Checkpoint summary

| Evidence area                                  | Result                             | Exact evidence                                                                                                                                                                                                              |
| ---------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eight feature flags                            | `PASSED` automated/source          | `src/config/r002bFeatureFlags.ts` defines the eight independent flags and resolves every absent value to `false`                                                                                                            |
| R002a fallback                                 | `PASSED` automated/source          | Flag-off and route-request tests preserve the existing R002a presentation and behavior                                                                                                                                      |
| Full automated suite                           | `PASSED`                           | Core: 76 files and 967/967 tests at `895af72`; final: 78 files and 979/979 tests at `2e09419`                                                                                                                               |
| Authored route inventory                       | `PASSED` source                    | 26 product route files: the 16 R001/R002a routes plus nine guarded nested R002b routes and the gated private League root                                                                                                    |
| Screen specifications                          | `PASSED` source                    | Twelve `screen-spec.md` records exist, including the compatibility presentation for the already-approved private League                                                                                                     |
| Code-native presentation                       | `PASSED` implementation            | All twelve indexed surfaces have native route or route-owned component integration; raw Stitch HTML/PNG is not runtime UI                                                                                                   |
| Browser-proxy review                           | `PARTIAL`                          | Nine R002b/League surfaces plus one R002a regression surface have retained local 390×844 captures; representative English, 320/360/430-wide, 200%-text, and 768-wide captures also exist                                    |
| Learning live capture                          | `BLOCKED` by fixture state         | The normal Salem fixture reaches lifetime 120; the learning package correctly remains locked until station 132                                                                                                              |
| Approval RevealBundle v2                       | `BLOCKED` by consequence authority | The route and receipt-only bundle are implemented, but the live approval path intentionally stays on the R002a result until authoritative private League, Challenge Leaf, and Family Reward receipts are available together |
| Physical Android and native assistive behavior | `BLOCKED / NOT RUN`                | No named configured device result exists for install, TalkBack, native Back/IME, safe areas, reduced motion, or OS font scaling                                                                                             |
| Human review                                   | `NOT RUN`                          | Arabic/English copy, learning facts, culture/safeguarding, privacy/consent, visual design, comprehension, and asset provenance still require named reviewers                                                                |

`PASSED` above is bounded to the named evidence. Automated and web-proxy results do not prove
physical Android behavior or human acceptance.

## Implemented product boundaries

| Boundary                               | Implementation evidence                                                                                                               | Behavioral result                                                                                                                                                                                                                                                                   | Activation status                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Lifetime Seed projection and migration | `src/features/growth/seedLedger.ts`, `src/features/growth/bootstrap.ts`, and progression/store tests                                  | Salem alone may receive the approved synthetic carry-forward receipt; lifetime Seeds are derived from unique committed entries and remain separate from current Mangrove growth                                                                                                     | Default off; release blocked                               |
| Water & Coast Impact Path              | `src/features/growth/presentation.ts`, `src/features/growth/r002bViewModel.ts`, `/garden/impact-path`                                 | Stations 120/132/144/156/168/180 are private read-only projections; no second currency or visit claim                                                                                                                                                                               | Default off; release blocked                               |
| Badge registry and views               | `src/features/growth/badgeRegistry.ts`, `src/features/growth/achievements.ts`, `/garden/badges`, `/garden/badges/[badgeId]`           | Exactly 16 stable private badges, deterministic criteria, no fabricated mastery, and contextual actions that cannot assign a Child task                                                                                                                                             | Default off; release blocked                               |
| Equal-credit Mangrove learning         | `src/features/learning/**`, Story and accessible routes                                                                               | One finite package identity, resumable/no-fail flow, equal credit, idempotent completion, and zero task/Garden/League/Reward minting                                                                                                                                                | Default off; content and live-capture gates open           |
| RevealBundle v2                        | `src/features/rewards/revealBundle.ts`, `src/features/rewards/r002bRevealViewModel.ts`, `/child/reveal/[bundleId]`                    | Stable identity, deterministic queue, one visible bundle, resumable lifecycle, and zero-Seed learning outcome reveal only for a genuinely new badge                                                                                                                                 | Default off; live approval parity blocks activation        |
| Parent Child Progress                  | `src/features/growth/parentProgress.ts`, `src/features/growth/r002bParentProgressViewModel.ts`, `/parent/family/[profileId]/progress` | Parent-only selected-Child read-only projection; suitable-task action is prefill-only and still requires normal review/save                                                                                                                                                         | Default off; privacy/copy/native gates open                |
| Shared Growth view                     | `src/features/shared-growth/**`, `/circle/shared-growth`                                                                              | Additive qualitative synthetic anonymous view with no identity, rank, percentage, count, task, Seed, badge, or reward disclosure                                                                                                                                                    | Default off; privacy/copy/native gates open                |
| Shared Garden settings                 | `/parent/family/shared-garden` and the existing access/reauthentication adapter                                                       | Continue/Pause/End affect only future anonymous signals; returning after End requires fresh Parent consent                                                                                                                                                                          | Default off; guardian-governance/privacy/native gates open |
| Private five-Leaf League               | `src/features/league/presentation.ts`, `src/components/r002b/PrivateLeagueScreen.tsx`, `/league`                                      | Restores the canonical Child League root through the strict privacy projector; the provenance-tagged synthetic reset summary contains only approved participant/count/score fields, and 4/5→5/5 requires the exact committed task, Seed, Mangrove, canopy, and Green-event evidence | Compatibility-gated; visual/native review open             |
| Closed origin recovery                 | `src/features/navigation/r002bOrigin.ts`, `src/features/navigation/r002bBack.ts`, and `895af72`                                       | Same-role route/profile/filter/scroll/focus restoration uses allowlisted tokens and falls back safely on invalid input                                                                                                                                                              | Implemented; native Back remains unobserved                |
| Accessibility hardening                | `f5e0142`, `f8e203a`, and `895af72`                                                                                                   | System reduced motion disables route fades, safe-area ownership is explicit, busy-state contrast is preserved, and focus restoration is safe on web and native                                                                                                                      | Source/automated pass; TalkBack remains unobserved         |

## Preserved transaction behavior

The implementation retains `task_recycling_p0_v1`, Parent-controlled assignment and review, zero
reward through Child submission and praise presentation, and the existing atomic/idempotent `+12`
recognition. One eligible approval still owns current Mangrove 48/60→60/60, canopy, eligible Green
Circle, private League, Challenge Leaf, private Family Reward, and Parent-praise consequences.

The approved cumulative projection interprets the same event as lifetime 108→120 only after the
Salem-specific, immutable synthetic baseline receipt. It does not copy Salem's receipt to Alya,
invent task/mastery/learning history, or make lifetime Seeds writable or spendable.

The task-approval RevealBundle adapter remains deliberately fail-closed. The current store does not
yet provide the full set of authoritative private League, Challenge Leaf, and Family Reward source
receipts required to prove one complete v2 approval presentation. Consequently, the flag-off R002a
result remains the only live approval experience; no incomplete or fabricated v2 bundle is shown.

## Automated evidence

The core suite was run from the implementation worktree at `895af72`, then rerun at `2e09419` after
the private League compatibility slice:

```bash
npm test
```

Core result: **PASSED** — exit 0, 76 test files, 967/967 tests. League-integrated result:
**PASSED** — exit 0, 78 test files, 979/979 tests. The suite includes Schema-3
characterization, migration eligibility/atomicity/idempotency, threshold and badge evaluation,
equal-credit learning, zero-reward invariants, RevealBundle construction/lifecycle/fail-closed
integration, Parent Progress access/isolation, Shared Growth privacy/participation, independent
flags, guarded routes, origin restoration, bilingual resources, accessibility source contracts,
private League projection/privacy/provenance, and the complete R001/R002a regression set.

Static checks and export results belong in the final repository gate below only when rerun against
the documentation checkpoint. A test pass does not change any default-off flag.

## Browser-proxy visual evidence

The following screenshots are local, untracked evidence under `output/playwright/r002b/`. They are
intentionally excluded from the source commit and therefore are not durable design authority.

| Surface or exercise           | Local file                            | Actual dimensions | Result                                     |
| ----------------------------- | ------------------------------------- | ----------------: | ------------------------------------------ |
| Child Today compact Path card | `01-child-today-390x844.png`          |           390×844 | `PASSED` bounded visual review             |
| Garden chapter and entries    | `02-garden-chapter-390x844.png`       |           390×844 | `PASSED` bounded visual review             |
| Impact Path                   | `03-impact-path-390x844.png`          |           390×844 | `PASSED` bounded visual review             |
| Badge Gallery                 | `04-badge-gallery-390x844.png`        |           390×844 | `PASSED` bounded visual review             |
| Badge Detail                  | `05-badge-detail-390x844.png`         |           390×844 | `PASSED` bounded visual review             |
| Parent Progress               | `09-parent-progress-390x844.png`      |           390×844 | `PASSED` bounded visual review             |
| Shared Growth                 | `10-shared-growth-child-390x844.png`  |           390×844 | `PASSED` bounded visual review             |
| Parent Shared Garden settings | `11-parent-shared-garden-390x844.png` |           390×844 | `PASSED` bounded visual review             |
| Private five-Leaf League      | `12-private-league-390x844.png`       |           390×844 | `PASSED` bounded visual/overflow review    |
| English Child Today           | `english-child-today-390x844.png`     |           390×844 | `PASSED` representative LTR review         |
| English compact Child Today   | `english-child-today-320x844.png`     |           320×844 | `PASSED` representative compact LTR review |
| Compact Impact Path           | `responsive-impact-320x844.png`       |           320×844 | `PASSED` representative compact review     |
| Wide Impact Path              | `responsive-impact-768x1024.png`      |          768×1024 | `PASSED` representative wide review        |

`08-parent-home-390x844.png` is a refreshed R002a fallback/regression capture after the Parent
canopy RTL correction, not an R002b surface. The two `debug-*.png` crops only confirmed physical
Back-target visibility and are not canonical screen evidence.

No retained live implementation capture exists for Learning Story, Accessible Learning, or the
combined Child Reveal. Learning and task-approval Reveal are blocked for the truthful
fixture/authority reasons above. The private League slice additionally retains Arabic 320, 360,
390, and 200%-text samples plus English 390, 430, and 768 samples. That does not complete those
width/locale/state combinations for every R002b surface. No complete console or network ledger was
retained with the screenshot set, so its overall status is `NOT RECORDED`; the corrected Parent
Progress capture stayed on its guarded route, reported zero horizontal overflow, and produced zero
console errors. The private League samples also reported no horizontal overflow at their named
sizes.

## Final repository gate

| Command or exercise                                                   | Result at this record              | Boundary                                                                                             |
| --------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm test`                                                            | `PASSED` — 78 files, 979/979 tests | Fresh at `2e09419`                                                                                   |
| `npm run typecheck`                                                   | `PASSED`                           | Fresh after the private League compatibility slice                                                   |
| `npm run lint`                                                        | `PASSED`                           | Fresh after the private League compatibility slice                                                   |
| `npm run format:check`                                                | `PASSED`                           | Fresh after the private League compatibility slice; explicit proposal Markdown is checked separately |
| Expo dependency/configuration checks                                  | `PASSED`                           | `expo install --check`, public config, and Expo Doctor 21/21 passed                                  |
| Production web export                                                 | `PASSED`                           | Fresh Expo export generated 28 static routes; web remains secondary evidence                         |
| Android JavaScript export                                             | `PASSED`                           | Fresh Expo export bundled 2,024 modules and 35 assets; this is not a native build/device pass        |
| Route/reset scan                                                      | `PASSED` automated/source          | 26 product route files; guarded/reset tests are included in the automated suite                      |
| `git diff --check`                                                    | `PASSED`                           | Fresh with the final documentation diff                                                              |
| Physical Android install/journey                                      | `BLOCKED`                          | Requires a named configured device/build                                                             |
| TalkBack, native Back/IME, safe area, reduced motion, OS font scaling | `NOT RUN`                          | Must be exercised physically; web/source evidence cannot pass these gates                            |

## Release blockers and required next evidence

1. Keep all eight flags off for release until their individual gates pass.
2. Add authoritative private League, Challenge Leaf, and Family Reward source receipts to the
   existing approval projection before enabling RevealBundle v2; prove complete parity without a
   second reward transaction.
3. Reach learning station 132 through a reviewed deterministic fixture or approved event history,
   then capture both equal-credit routes without bypassing the unlock.
4. Retain the missing Learning and Reveal 390×844 candidate captures and complete
   320/360/390/430/768, Arabic/English,
   200% text, reduced-motion, overflow, keyboard/focus, and state review.
5. Complete named Arabic/English factual, cultural/safeguarding, privacy/consent, visual,
   accessibility-equivalence, comprehension, and asset-provenance reviews.
6. Install and exercise the exact branch on a named Android build/device with TalkBack, native Back,
   IME/keyboard, safe areas, reduced motion, offline/reset recovery, and 200% OS font scaling.

Until those gates are recorded, R002b is an implemented, test-backed, default-off candidate—not a
released or demo-accepted feature.
