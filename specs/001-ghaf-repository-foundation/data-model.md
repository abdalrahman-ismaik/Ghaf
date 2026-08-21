# Data Model: Ghaf Repository Foundation

Feature 001 keeps all data synthetic and in memory. These entities are deliberately small and are
shared across routes through a single prototype store.

## Locale Choice

| Field | Type | Rules |
|---|---|---|
| `code` | `'ar' \| 'en'` | Arabic is the reset/default value |
| `direction` | `'rtl' \| 'ltr'` | Derived from `code`; never independently edited |

## Prototype Role

| Field | Type | Rules |
|---|---|---|
| `role` | `'parent' \| 'child'` | Parent is the reset/default value |
| `profileId` | string | References one synthetic seeded profile |

## Family Profile

| Field | Type | Rules |
|---|---|---|
| `id` | string | Stable fixture identifier |
| `displayName` | localized text | Synthetic family name only |
| `parent` | profile | One seeded parent |
| `child` | profile | One seeded child with age band `8-10` |

## Mission Summary

| Field | Type | Rules |
|---|---|---|
| `id` | string | Stable fixture identifier |
| `title` | localized text | Non-empty Arabic and English |
| `story` | localized text | Short, family-specific, no food-safety claim |
| `steps` | three localized step records | Exactly three in Feature 001 |
| `status` | `'assigned'` | Foundation exposes one non-editable state |
| `reward` | localized text | Symbolic prototype reward only |
| `impactTarget` | impact quantity | Approximate portions and grams |
| `source` | `'pregenerated-mock'` | Always disclosed in Feature 001 |

## Impact Summary

| Field | Type | Rules |
|---|---|---|
| `rescuedGrams` | non-negative integer | Reset value 1,250; seeded estimate, not sensor-derived |
| `rescuedPortions` | non-negative integer | Reset value 5; seeded estimate |
| `completedMissions` | non-negative integer | Reset value 3; seeded aggregate |
| `streakDays` | non-negative integer | Reset value 2 |

## Ghaf Progress

| Field | Type | Rules |
|---|---|---|
| `stage` | `0 \| 1 \| 2 \| 3 \| 4 \| 5` | Reset value 2; clamped to six named stages |
| `progressPercent` | integer `0...100` | Reset value 48; presentation helper, clamped |
| `newMilestone` | localized text or null | No real-world reward value |

Stage mapping:

| Stage | Name |
|---:|---|
| 0 | Seed |
| 1 | Germination |
| 2 | Sapling |
| 3 | Young tree |
| 4 | Branching tree |
| 5 | Full Ghaf tree |

## Prototype Session

| Field | Type | Rules |
|---|---|---|
| `locale` | locale code | Defaults/reset to `ar` |
| `role` | prototype role | Defaults/reset to `parent` |
| `family` | family profile | One fixture |
| `mission` | mission summary | One fixture |
| `impact` | impact summary | Same values across roles |
| `ghaf` | Ghaf progress | Stage 2 at 48% after reset; same across roles |
| `mockMode` | `true` | Immutable in Feature 001 |

## State Transitions

```text
reset state (ar, parent, seeded data)
  ├─ select en → (en, parent, same seeded data)
  ├─ switch child → (same locale, child, same seeded data)
  ├─ switch parent → (same locale, parent, same seeded data)
  └─ reset → exact reset state
```

Feature 001 has no mission lifecycle mutation. Draft, approval, evidence, completion, rejection, and
tree-growth transitions are reserved for Feature 002.
