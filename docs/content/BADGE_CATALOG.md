# Ghaf P0 Badge Catalog — Growth Journey

**Status:** Proposed Feature 003 Revision 3 content contract; runtime **BLOCKED** pending approved
Stitch frames and named factual, Arabic/UAE cultural, accessibility, and rights review.

This is the complete P0 registry. A fixture, screen, migration, or generated design must not add a
seventeenth badge. Each badge is a permanent, private Ghaf product record—not a government,
tourism, UNESCO, or environmental accreditation; not proof of a visit; and not proof of measured
environmental impact.

## Shared rules

- Badge state is `locked`, `in_progress`, `awaiting_review`, or `earned`.
- `next_recommended` and `archived_context` are presentation flags, not stored badge states.
- Mastery stages **برعم · غصن · ظل** / **Bud · Branch · Shade** describe practice, never rarity.
- All P0 `masteryCredit` criteria accept `acquisition` evidence only. Maintenance and
  recognition-only activity contribute zero.
- Every criterion component is shown. Meeting a Seed threshold cannot silently satisfy an action or
  learning component.
- Learning or activity completion is idempotent and adds zero Seeds and zero garden growth.
- Earned badges never expire, downgrade, transfer, become public, or acquire a monetary value.
- A new award shows its provenance-backed event date. A migrated award whose source evidence has no
  trustworthy date shows an explicit historical-date-unavailable state; migration time is never
  presented as earned time.
- Factual details render a **المصدر / Source** row. Product rules render **معيار من نظام غاف**.
- Badge art must be original, readable without color, and cleared before release.

## Canonical synthetic fixture

After the one valid P0 approval, Salem has 120 lifetime Seeds, stations through
`station.water_coast.120`, and acquisition mastery credits `sorting = 1`, `water = 2`,
`energy = 1`, `nature = 2`, and `coast_care = 3`. `learning.ghaf_basics.v1` is complete; all other
P0 learning packages and activities are incomplete. These values are synthetic evidence fixtures,
not inferred user facts. The later 132-Seed variant must not award Sorting Branch unless an
additional immutable sorting acquisition explains credit 2 before the 132 event.

## Exact registry

| Stable ID                                   | Arabic / English                                 | Family · tier                         | Exact criterion                                                                            | Owner                      | Canonical state                                    |
| ------------------------------------------- | ------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------- | -------------------------------------------------- |
| `badge.journey.seed_start.v1`               | **بذرة البداية** / Seed Start                    | `journey` · `seed_start`              | `lifetimeSeeds >= 12`                                                                      | `station.archive.012`      | Earned, 12/12                                      |
| `badge.journey.growing_branch.v1`           | **غصن نامٍ** / Growing Branch                    | `journey` · `growing_branch`          | `lifetimeSeeds >= 60`                                                                      | `station.archive.060`      | Earned, 60/60                                      |
| `badge.journey.expanding_shade.v1`          | **ظلّ يتّسع** / Expanding Shade                  | `journey` · `expanding_shade`         | `lifetimeSeeds >= 120`                                                                     | `station.water_coast.120`  | Earned in approval bundle, 120/120                 |
| `badge.journey.coastal_care.v1`             | **رعاية الساحل** / Coastal Care                  | `journey` · `coastal_care`            | `lifetimeSeeds >= 180`                                                                     | `station.water_coast.180`  | In progress, 120/180                               |
| `badge.skill.sorting.bud.v1`                | **الفرز الذكي — برعم** / Smart Sorting — Bud     | `skill.sorting` · `bud`               | `masteryCredit(skill.sorting) >= 1`                                                        | `gallery.family.sorting`   | Earned in approval bundle, 1/1                     |
| `badge.skill.sorting.branch.v1`             | **الفرز الذكي — غصن** / Smart Sorting — Branch   | `skill.sorting` · `branch`            | Sorting Bud earned AND sorting credit `>= 3`                                               | `gallery.family.sorting`   | In progress, 1/3                                   |
| `badge.skill.sorting.shade.v1`              | **الفرز الذكي — ظل** / Smart Sorting — Shade     | `skill.sorting` · `shade`             | Sorting Branch earned AND sorting credit `>= 7`                                            | `gallery.family.sorting`   | Locked by prerequisite, 1/7 visible                |
| `badge.skill.water.bud.v1`                  | **ترشيد المياه — برعم** / Water Care — Bud       | `skill.water` · `bud`                 | station 156 reached AND water credit `>= 2`                                                | `station.water_coast.156`  | Station locked; actions 2/2, Seeds 120/156         |
| `badge.skill.water.branch.v1`               | **ترشيد المياه — غصن** / Water Care — Branch     | `skill.water` · `branch`              | Water Bud earned AND water credit `>= 5`                                                   | `gallery.family.water`     | Locked by prerequisite, 2/5 visible                |
| `badge.skill.water.shade.v1`                | **ترشيد المياه — ظل** / Water Care — Shade       | `skill.water` · `shade`               | Water Branch earned AND water credit `>= 10`                                               | `gallery.family.water`     | Locked by prerequisite, 2/10 visible               |
| `badge.skill.energy.bud.v1`                 | **ترشيد الطاقة — برعم** / Energy Care — Bud      | `skill.energy` · `bud`                | energy credit `>= 2`                                                                       | `gallery.family.energy`    | In progress, 1/2                                   |
| `badge.habitat.ghaf_roots.v1`               | **جذور الغاف** / Ghaf Roots                      | `habitat.ghaf` · `foundation`         | `learning.ghaf_basics.v1` complete AND nature credit `>= 3`                                | `gallery.family.ghaf`      | Learning 1/1; actions 2/3                          |
| `badge.habitat.mangrove_care.v1`            | **رعاية القرم** / Mangrove Care                  | `habitat.mangrove` · `foundation`     | station 132 reached AND `learning.mangrove_roots.v1` complete AND coast-care credit `>= 3` | `station.water_coast.132`  | Locked: station 120/132; learning 0/1; actions 3/3 |
| `badge.biodiversity.wetland_exploration.v1` | **استكشاف الأراضي الرطبة** / Wetland Exploration | `biodiversity.wetland` · `foundation` | `learning.wetland_basics.v1` AND `activity.wetland_observation.v1` complete                | `gallery.family.wetland`   | Locked, learning 0/1 and activity 0/1              |
| `badge.heritage.date_palm_gifts.v1`         | **عطاء النخلة** / Gifts of the Date Palm         | `heritage.date_palm` · `foundation`   | `learning.date_palm.v1` AND `activity.date_palm_reuse.parent_led.v1` complete              | `gallery.family.date_palm` | Locked, learning 0/1 and activity 0/1              |
| `badge.heritage.sadu_patterns.v1`           | **نقوش السدو** / Al-Sadu Patterns                | `heritage.sadu` · `foundation`        | `learning.sadu.v1` AND `activity.sadu_original_pattern.v1` complete                        | `gallery.family.sadu`      | Locked, learning 0/1 and activity 0/1              |

## Source and review ledger

| Badge families                           | Supplied ledger    | Factual review | Cultural review                                               | Rights/art review                  |
| ---------------------------------------- | ------------------ | -------------- | ------------------------------------------------------------- | ---------------------------------- |
| Journey and skill badges                 | Ghaf product rules | Draft          | Not required unless final copy adds cultural claims           | Original art required; not started |
| Ghaf Roots                               | `E1`               | Not run        | Required; not run                                             | Required; not run                  |
| Mangrove Care                            | `E2`               | Not run        | Required for place/cultural copy; not run                     | Required; not run                  |
| Wetland Exploration                      | `E3`               | Not run        | Required for place copy; not run                              | Required; not run                  |
| Gifts of the Date Palm; Al-Sadu Patterns | `E4`               | Not run        | Named Emirati practitioner/editorial review required; not run | Required; not run                  |

The source IDs refer to
[`report-source.md`](../GHAF_GROWTH_JOURNEY_PROMPT_PACK/report-source.md). Source access is research
input, not Ghaf review approval. URLs and mutable facts must be revalidated before Child-facing
content is frozen.

## P1 candidates

Additional chapters, mastery families, badges, choice stations, reminders, and place stories are
P1 research only. They require new stable IDs, criteria, source/review records, and an explicit
specification change; they must not appear as decorative locked tiles in P0.
