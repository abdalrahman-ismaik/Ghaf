# R002b compact Impact Path card specification

> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

Status: code-native implementation candidate. Flag: `r002b_impact_path_ui`, default off.
Owner: existing Child Today route `/child`; this is a reusable route-owned card, not a route.

## Purpose and composition

Show one quiet, optional summary of the active Child's nearest Water & Coast station. Place it after
the current task/lifecycle priority and before lower-priority Garden navigation. Use one soft teal
card with a small code-native coastal mark, chapter label, current lifetime Seed value, nearest
station requirement, and one action. It must not compete with an assigned task or imply a second
balance, measured environmental impact, or a reward available before Parent approval.

## Data and actions

Read the profile/epoch-scoped lifetime projection and nearest station from the Growth selector.
Never calculate thresholds in the card. At 120 it describes the current 120→180 chapter; at 132,
144, 156, 168, and 180 it reflects stored/derived reached state. The action opens
`/garden/impact-path` with a closed, typed Today origin. No task is created or assigned.

When the flag is off, the card is absent and the R002a Today composition is unchanged. A missing or
invalid projection hides the card and records no state.

## States

- Ready: lifetime value, nearest requirement, and “view path” action.
- Not entered: an explanatory 120 threshold without promising an award.
- Chapter complete: stable completion wording and archive entry; no looping celebration.
- Loading: bounded skeleton/text placeholder with no fake number.
- Offline-ready: same local projection with a truthful local-data note only when needed.
- Recoverable error or profile mismatch: omit the card; never borrow another Child's values.
- 200% text: content stacks vertically and action remains fully visible.

## Accessibility, copy, and review

The card is one named group; progress and requirement are announced as text, and the decorative
mark is hidden. The action is at least 48×48 and has destination context. Arabic order and alignment
are RTL while the surrounding physical Child navigation remains unchanged. All strings belong in
the bilingual resource. Canonical 390×844, English LTR, reduced-motion, content, accessibility, and
physical Android review are pending; no external asset is authorized.

## Acceptance

Prove flag-off equivalence, exact selector values at 107/108/119/120/131/132/179/180, Child-only
profile isolation, no reward mutation, safe origin construction, no horizontal overflow, and an
accessible text equivalent for every visual state.
