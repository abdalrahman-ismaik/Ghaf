# Family Connection UI Contract v1

## Family Basics

- Requires verified Parent setup authority through the existing route guard.
- Orders content as: primary Parent/guardian name, optional second Parent/guardian, optional
  relatives, family name, local privacy note, app language, Child capacity, existing Plus preview,
  and setup-sequence note.
- Starts with zero visible relative rows. **Add a relative** opens one inline editor until the
  six-entry limit. The editor has one display-name field, one relationship radio group, one rhythm
  radio group, and Save/Cancel actions. The add action precedes the explanatory body so it remains
  discoverable above the compact footer. Saved rows expose 48dp Edit and Remove actions.
- Continue remains the single dominant action. It is available only when the primary name, family
  name, and all present relative rows are valid. Optional fields may be skipped.
- Back, locale change, and Plus preview opening preserve the full draft.

## Whole-family Review

- Shows primary and optional secondary guardian names before the Child summaries.
- Shows each configured relative's display name, relationship, and rhythm in private summary rows.
- Omits the relative section when none were added.
- Does not claim that an idea is assigned, due, completed, or rewarded.

## Parent Family

- Requires active Parent authority through the existing layout guard.
- Places **Family connections** directly below the hero and before configured Children.
- Shows guardian names in one compact line and exactly one read-only row per configured relative.
- Each dedicated stacked row exposes display name, relationship, rhythm, current prepared idea,
  equal call/message alternative, and recognition-only/no-progress meaning.
- One concise section note states that ideas are local/prepared, optional, and reviewed by the
  Parent. The same note states that the Parent arranges contact and transport and owns hazardous
  actions. It must not use an AI sparkle or live/provider wording.
- If there are no relatives, the personalized plan section is absent; the ordinary Parent Family
  experience remains unchanged.

## Isolation Contract

- Family connection fields may be read only by Parent setup/review and Parent Family presentation.
- They are not serialized into Child choice pools, task journeys, assistant requests, Parent AI
  summaries, League rows, Circle projections, shared-growth signals, rewards, badges, logs, or
  analytics.
- The task service's P0 approval allowlist remains unchanged. Connection entries expose no action
  that invokes task creation, assignment, or confirmation.

## Accessibility and Direction

- Arabic is first; English is equivalent. Standalone display names use automatic bidi direction;
  every name interpolated into another sentence is wrapped in Unicode bidi isolation marks.
- Relationship and rhythm choices use actual single-selection radio semantics rather than checkbox
  semantics.
- All controls are at least 48dp; rows wrap vertically at compact width; no required copy is
  truncated; visible labels and state do not rely on color or icon alone.
- Screen-reader labels include relative position, display name, selected relationship, selected
  rhythm, and remove purpose without announcing another relative's data.
