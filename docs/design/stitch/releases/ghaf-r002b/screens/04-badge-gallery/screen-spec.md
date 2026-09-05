# R002b Child Badge Gallery specification

> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

Status: code-native implementation candidate. Flag: `r002b_badges_ui`, default off.
Owner route: `/garden/badges`, nested in the Child Growth stack.

## Purpose and composition

Show exactly the approved 16 private, deterministic, permanent badges. Use a calm header, concise
private/permanent explanation, one recommended-next card, and an adaptive two-column grid that
becomes a one-column list under large text or narrow content. Visually group earned, in progress,
and locked items without rank, rarity, mystery, countdown, trade, payment, or sibling comparison.
Archived context is explanatory only.

## Data and behavior

Render the canonical registry order and active-profile projections supplied by the achievement
domain. Every in-progress or locked card shows a deterministic requirement and text state. Selecting
a badge opens `/garden/badges/:badgeId` with a closed Gallery origin and focus ID. Opening or viewing
does not award, revoke, or re-evaluate a badge. Unknown IDs never render placeholder content.

## States

Mixed ready, earned-only, all locked/new profile, next recommended, all earned, awaiting-review
when the registry projects it, loading, offline-ready, criteria unavailable, recoverable error,
interrupted/recovered filter/scroll/focus, missing art fallback, and reduced-motion static earned
state. A zero-item projection is an integrity error, not an invented empty registry.

## Navigation and guards

Child capability, active profile, and flag are mandatory. Nested routes omit bottom navigation;
Arabic Back is physically right. Origins are closed same-role values from Garden, Impact Path, or
Reveal. Back restores filter, scroll, and focus. Invalid origin/profile deep links fall back safely.

## Accessibility and responsive behavior

Each badge is one button with name, state, criterion summary, and progress announced. Artwork has a
meaningful alternative only when informative; decoration is hidden. Grid visual order equals focus
order in RTL and LTR, while data order stays deterministic. Use 48×48 targets, non-color status,
4.5:1 contrast, tabular counts, natural scroll, and no horizontal overflow at 320–768 or 200% text.

## Copy, provenance, and acceptance

Names/IDs/criteria come from the locked registry; descriptions, why-it-matters copy, and art remain
human-review/provenance pending. Prove exact 16 IDs, stable ordering, profile/reset isolation,
permanent earned state, no public data, transparent locked criteria, Detail origin restoration,
bilingual parity, flag-off route rejection, and missing-art resilience. Canonical 390×844 and native
review remain pending.
