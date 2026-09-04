# Feature 003 Revision 3 Badge Registry

**Product status:** approved planning authority
**Design/runtime/content-review status:** `BLOCKED` / `NOT RUN`

> **R002 INTAKE RECEIVED — PRODUCT CONFLICTS OPEN — IMPLEMENTATION BLOCKED**

This is the exact 16-definition P0 registry. Badges are private, deterministic, permanent, free,
and nonfinancial. They are not rank, rarity, visit proof, environmental certification, or public
status. A later screen may not invent a seventeenth badge.

| Stable ID                                   | Arabic / English                             | Deterministic criterion                                                               |
| ------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| `badge.journey.seed_start.v1`               | بذرة البداية / Seed Start                    | confirmed lifetime Seeds ≥ 12                                                         |
| `badge.journey.growing_branch.v1`           | غصن نامٍ / Growing Branch                    | confirmed lifetime Seeds ≥ 60                                                         |
| `badge.journey.expanding_shade.v1`          | ظلّ يتّسع / Expanding Shade                  | confirmed lifetime Seeds ≥ 120                                                        |
| `badge.journey.coastal_care.v1`             | رعاية الساحل / Coastal Care                  | confirmed lifetime Seeds ≥ 180                                                        |
| `badge.skill.sorting.bud.v1`                | الفرز الذكي — برعم / Smart Sorting — Bud     | sorting acquisition credit ≥ 1                                                        |
| `badge.skill.sorting.branch.v1`             | الفرز الذكي — غصن / Smart Sorting — Branch   | Sorting Bud earned and sorting credit ≥ 3                                             |
| `badge.skill.sorting.shade.v1`              | الفرز الذكي — ظل / Smart Sorting — Shade     | Sorting Branch earned and sorting credit ≥ 7                                          |
| `badge.skill.water.bud.v1`                  | ترشيد المياه — برعم / Water Care — Bud       | station 156 reached and water credit ≥ 2                                              |
| `badge.skill.water.branch.v1`               | ترشيد المياه — غصن / Water Care — Branch     | Water Bud earned and water credit ≥ 5                                                 |
| `badge.skill.water.shade.v1`                | ترشيد المياه — ظل / Water Care — Shade       | Water Branch earned and water credit ≥ 10                                             |
| `badge.skill.energy.bud.v1`                 | ترشيد الطاقة — برعم / Energy Care — Bud      | energy acquisition credit ≥ 2                                                         |
| `badge.habitat.ghaf_roots.v1`               | جذور الغاف / Ghaf Roots                      | `learning.ghaf_basics.v1` complete and nature credit ≥ 3                              |
| `badge.habitat.mangrove_care.v1`            | رعاية القرم / Mangrove Care                  | station 132 reached, `learning.mangrove_roots.v1` complete, and coast-care credit ≥ 3 |
| `badge.biodiversity.wetland_exploration.v1` | استكشاف الأراضي الرطبة / Wetland Exploration | wetland learning and observation activity complete                                    |
| `badge.heritage.date_palm_gifts.v1`         | عطاء النخلة / Gifts of the Date Palm         | date-palm learning and Parent-led reuse activity complete                             |
| `badge.heritage.sadu_patterns.v1`           | نقوش السدو / Al-Sadu Patterns                | Sadu learning and original-pattern activity complete                                  |

## Shared evaluation rules

- Stored state is `locked`, `in_progress`, `awaiting_review`, or `earned`.
- Every composite component remains visible. A Seed threshold cannot stand in for an action,
  learning package, station, or prerequisite badge.
- All P0 mastery criteria accept acquisition evidence only. Maintenance and recognition-only work
  create no mastery credit.
- Learning/activity completion is idempotent and creates zero Seeds and zero garden growth.
- Earned status never expires, downgrades, transfers, becomes public, or gains monetary value.
- Backfilled awards require provable immutable evidence. Unknown historical dates remain explicitly
  unknown; migration time is not an earned date and migration queues no celebration.
- Badge art must be original, text-independent, readable without color, and covered by an approved
  provenance/rights manifest before implementation.

The names, criteria, bilingual copy, factual source rows, and art remain subject to named content,
Arabic/English, UAE cultural, safeguarding, accessibility, and rights review. Those reviews do not
become passed merely because this registry is canonical product planning.
