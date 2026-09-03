# ADR 0002: Project Impact Path from immutable progress evidence

- **Status:** Proposed — runtime blocked pending approved Stitch frames
- **Date:** 2026-09-03
- **Feature:** 003 Revision 3 — Growth Journey

## Context

The supplied Growth Journey pack proposes a cumulative **Impact Path — مسار الأثر**, permanent
private badges, sourced learning, and one combined result surface. Feature 003 already has distinct
authorities for Parent-approved Seed transactions, landscape growth, Challenge Leaves and League
score, family-canopy contributions, and private Family Reward eligibility. Similar numbers may
appear in more than one authority, but they do not have the same meaning.

The proposal must stay deterministic, work offline, preserve the released R001 access slice, and
avoid a second currency, badge farming, public status, or UI-owned reward logic.

## Decision

Impact Path is a read projection of immutable, profile-scoped evidence. It is not a balance and
never writes Seeds.

- Lifetime Seeds are derived only from committed positive Seed transactions created after valid
  Parent approval.
- The P0 chapter ID is `water_coast_care_v1`; its versioned station/unlock ownership lives in the
  active data model. Chapters and stations evaluate cumulative lifetime-Seed thresholds. Station evaluation cannot
  advance an unrelated landscape, League score, canopy, or Family Reward.
- Badge criteria may combine a Seed threshold, reached station, acquisition-phase mastery credit,
  completed learning package, completed activity, or prerequisite badge. Every component remains
  visible; a Seed total alone never proves mastery.
- The established eight task categories, `recognitionMode`, `routinePhase`, visibility, League,
  Green projection, reward eligibility, and safety fields remain authoritative. Growth Journey adds
  reviewed action/mastery mappings to an immutable task version; it does not replace that taxonomy.
- Parent-approval, learning-completion, and activity-completion events have separate immutable
  idempotency keys. Learning and activity events always add zero Seeds and zero garden growth.
- Maintenance evidence is capped at one lifetime credit per Child and mastery family only when a
  future badge definition explicitly permits it. All 16 P0 badge definitions accept acquisition
  evidence only.
- `recognition.safe_help_once.v1` is one-time descriptive recognition, not a badge, station, or
  progress target; it adds zero Seeds and zero mastery.
- Every triggering event produces at most one recoverable `RevealBundle`. For the canonical Parent
  approval, the presentation order is praise → any honestly labelled self-reported activity result
  → Seeds → mapped garden → family canopy and Challenge Leaf/League consequence → Impact Path,
  badges, and safe-help recognition → private Family Reward last.
- The 180-Seed station may award its path badge and chapter result. A garden-stage transition occurs
  only if its independent landscape mapping and provenance also qualify; the lifetime-Seed
  threshold cannot grant it by itself.
- Profile ID is part of every progress, award, completion, reveal, and migration key. No projection
  may leak across Salem, Alya, or a new profile.

## Entry, migration, and persistence boundary

The system launch surface is native configuration, not a route. A brief Opening Moment and exactly
three role-neutral first-run introduction panels may layer before the released R001 `/` access
handoff only after a new Stitch batch explicitly approves that composition and routing.

`openingMomentSeen` and `introductionVersionSeen` are install-level preferences. Story preference is
profile-scoped. Manual replay origin, nested-route origin, and deferred authorized deep link are
transient navigation state; every Child destination carries and validates its Child ID. None is a
reward record. Manual replay cannot mutate profiles, tasks, Seeds, badges, or analytics. The
Parent-authorized competition reset restores the canonical signed-out Arabic `/` domain fixture,
preserves install/profile preferences, and clears transient navigation intent. An operator-only
first-run control may clear the two install-level seen/version flags separately.

Historical migration evaluates only provable immutable evidence under an explicit evaluator
version. It may backfill an earned badge once with `origin = migration`, but it does not mint Seeds,
infer missing mastery, or queue a reveal. It records an earned timestamp only when the source
evidence proves it; otherwise the historical date remains explicitly unavailable. Later criteria
versions never revoke or silently reinterpret an earned award.

Durability across an app restart requires a small versioned local adapter behind the session
boundary. No storage dependency or implementation is approved by this ADR; the integration owner
must measure the existing stack and authorize the smallest option after Stitch intake. Production
accounts, sync, cloud persistence, and multi-device consistency remain out of scope.

## Consequences

### Positive

- The Growth Journey reuses one permanent Seed authority and cannot become a purchasable currency.
- Exact criteria, event provenance, and duplicate no-ops are testable without a screen.
- Existing Garden, League, canopy, and Family Reward semantics survive the new presentation.
- Learning can contribute to a named badge without inflating Seeds or garden growth.
- One finite reveal prevents modal stacks and supports reduced-motion parity.

### Trade-offs

- Composite progress needs structured component projections rather than a single progress number.
- A local persistence seam and migration version add bounded complexity to the current in-memory
  prototype.
- The new entry layer depends on R001 and the still-unapproved Child/Parent shells; Growth frames
  alone cannot create a reachable demo.

## Rejected alternatives

| Alternative                               | Reason rejected                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Add XP, levels, or a paid pass            | Duplicates Seeds and introduces pressure/monetization risk               |
| Infer badges from Seed totals             | Falsely implies a specific skill, learning result, or habitat practice   |
| Replace the current task taxonomy         | Breaks safety, phase, League, Green, and Family Reward policy            |
| Let screens calculate unlocks             | Makes idempotency, privacy, migration, and duplicate handling unreliable |
| Show one modal per outcome                | Obscures causal order and creates an unbounded reward queue              |
| Advance a landscape at every path station | Conflates lifetime progress with category-specific growth                |
| Public badge profiles or rankings         | Conflicts with the private family product and Child privacy boundary     |

## Approval gate

This is a proposed architecture decision. It becomes accepted only after the new Stitch inventory,
route/state map, persistence gap measurement, product conflict dispositions, focused RED tests, and
integration-owner release are recorded. Until then, no runtime, dependency, asset, or migration
change is authorized.

## Related records

- [Feature plan](../../../specs/003-family-growth-garden/plan.md)
- [Feature data model](../../../specs/003-family-growth-garden/data-model.md)
- [Badge catalog](../../content/BADGE_CATALOG.md)
- [Learning stories](../../content/LEARNING_STORIES.md)
- [Growth Journey preflight](../../../specs/003-family-growth-garden/design-intake/growth-journey-preflight.md)
