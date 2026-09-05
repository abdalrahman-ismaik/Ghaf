# R002b code-native screen index

> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

Status: default-off implementation candidates exist for all indexed surfaces. These records and
the current implementation are not visual, bilingual, accessibility, content, provenance, or
release approval. R001 and R002a remain the exact fallback when the applicable flag is disabled.

Final implementation checkpoint: `2e09419` on
`integration/r3-r002b-implementation-20260905`; 78 test files and 979/979 tests passed. The earlier
core checkpoint `895af72` passed 76 files and 967/967 tests before the private League compatibility
slice. See the
[bounded validation record](../../../../../specs/003-family-growth-garden/design-intake/r002b-validation-evidence.md).

## Authority and evidence

- Product behavior: `specs/003-family-growth-garden/design-intake/r002b-implementation-contract.md`.
- Growth rules: `specs/003-family-growth-garden/spec.md`, `docs/content/BADGE_CATALOG.md`, and
  `docs/content/LEARNING_STORIES.md`.
- Visual system: existing R001/R002a Soft Geometric tokens and native components.
- Raw R002 exports: supporting evidence only. No complete approved PNG exists for these surfaces;
  no HTML, CSS, JavaScript, remote asset, or screenshot value may enter runtime code.
- Candidate art: repository-owned code-native vector/botanical primitives only until a provenance
  manifest explicitly approves another asset.

Every surface must be captured from the implementation at 390×844 after it exists. That capture is
then a review candidate, not automatic authority. Equivalent English LTR, 320/360/430/768 layouts,
200% text, reduced motion, and physical Android evidence remain separate gates.

## Surface register

| ID     | Surface                    | Owner                                  | Form                      | Default-off flag                              | Specification                                           | Local 390×844 browser-proxy evidence                                      |
| ------ | -------------------------- | -------------------------------------- | ------------------------- | --------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| R2B-01 | Compact Impact Path card   | `/child`                               | route-owned card          | `r002b_impact_path_ui`                        | [spec](screens/01-child-today-path-card/screen-spec.md) | `01-child-today-390x844.png` — retained locally                           |
| R2B-02 | Garden chapter and entries | `/garden`                              | additive route section    | Path and Badge flags independently            | [spec](screens/02-garden-chapter/screen-spec.md)        | `02-garden-chapter-390x844.png` — retained locally                        |
| R2B-03 | Impact Path                | `/garden/impact-path`                  | nested Child route        | `r002b_impact_path_ui`                        | [spec](screens/03-impact-path/screen-spec.md)           | `03-impact-path-390x844.png` — retained locally                           |
| R2B-04 | Badge Gallery              | `/garden/badges`                       | nested Child route        | `r002b_badges_ui`                             | [spec](screens/04-badge-gallery/screen-spec.md)         | `04-badge-gallery-390x844.png` — retained locally                         |
| R2B-05 | Badge Detail               | `/garden/badges/:badgeId`              | nested Child route        | `r002b_badges_ui`                             | [spec](screens/05-badge-detail/screen-spec.md)          | `05-badge-detail-390x844.png` — retained locally                          |
| R2B-06 | Mangrove Learning Story    | `/garden/learn/:learningId/story`      | nested Child route        | `r002b_learning_ui`                           | [spec](screens/06-learning-story/screen-spec.md)        | blocked: normal fixture has not reached station 132                       |
| R2B-07 | Accessible Learning        | `/garden/learn/:learningId/accessible` | nested Child route        | `r002b_learning_ui`                           | [spec](screens/07-learning-accessible/screen-spec.md)   | blocked: normal fixture has not reached station 132                       |
| R2B-08 | Combined Child Reveal      | `/child/reveal/:bundleId`              | route-owned modal surface | `r002b_reveal_bundle_v2`                      | [spec](screens/08-child-reveal/screen-spec.md)          | blocked: complete approval consequence receipts are not yet authoritative |
| R2B-09 | Parent Child Progress      | `/parent/family/:profileId/progress`   | nested Parent route       | `r002b_parent_progress_ui`                    | [spec](screens/09-parent-child-progress/screen-spec.md) | `09-parent-progress-390x844.png` — retained locally                       |
| R2B-10 | Shared Growth              | `/circle/shared-growth`                | nested Child route        | `r002b_shared_growth_view`                    | [spec](screens/10-shared-growth/screen-spec.md)         | `10-shared-growth-child-390x844.png` — retained locally                   |
| R2B-11 | Shared Garden settings     | `/parent/family/shared-garden`         | nested Parent route       | view and contribution flags independently     | [spec](screens/11-parent-shared-garden/screen-spec.md)  | `11-parent-shared-garden-390x844.png` — retained locally                  |
| R2B-12 | Private five-Leaf League   | `/league`                              | Child navigation root     | `r002b_progression_engine` compatibility gate | [spec](screens/12-private-league/screen-spec.md)        | `12-private-league-390x844.png` — retained locally                        |

The named captures live under untracked `output/playwright/r002b/` and are deliberately excluded
from the implementation/documentation commit. They are bounded local review evidence, not durable
or approved design assets. Responsive samples additionally cover English Child Today at 320 and
390 widths and Arabic Impact Path at 320 and 768 widths. Private League has Arabic 320, 360, 390,
and 200%-text captures plus English 390, 430, and 768 captures. These samples do not constitute a
complete width, state, or locale matrix for every surface.

## Shared native composition contract

- Use a safe-area root, natural vertical scrolling, a readable centered content width, and no fixed
  390×844 canvas. Only a route-owned bottom action or modal action region may remain fixed.
- Alexandria owns display headings; Readex Pro owns controls, body, and tabular data. Arabic uses
  true RTL and no artificial letter spacing; mixed identifiers use bidi isolation.
- Nested Child routes omit bottom navigation. Arabic Back is physically right. Root Child
  navigation remains physically `الدوري | حديقتي | اليوم` from left to right.
- Minimum target is 48×48. State never relies on color alone. All progress has a text equivalent;
  decorative art is hidden from assistive technology.
- Animations are optional enhancement. Reduced motion renders the same stable state immediately.
- Invalid role, profile, origin, entity ID, or flag state resolves to the active role's safe root;
  arbitrary return URLs are never accepted.
- Loading, empty, recoverable error, offline-ready, interrupted/recovered, disabled, and success or
  already-complete states use deterministic local data and never invent a business outcome.

## Release review record

Product contract: **APPROVED**. Default-off engineering candidates: **IMPLEMENTED**, except the live
approval RevealBundle remains fail-closed until all legacy consequence receipts are authoritative.
The private League candidate restores the canonical `الدوري / League` root without renaming the
separate Green Circle or Shared Growth experience. Its bounded local capture and compact/large-text
samples do not pass physical Android or human review.
Learning and Reveal live captures remain blocked by truthful fixture/authority state. Arabic/English
copy, content/culture, safeguarding, privacy/consent, accessibility, visual design, asset
provenance, physical Android, TalkBack, native Back/IME, and OS font-scaling reviews remain
**NOT RUN / BLOCKED**. All flags remain off by default until their applicable evidence is recorded.
