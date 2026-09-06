# R002b Garden chapter integration specification

> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

Status: additive code-native implementation candidate. Owner: existing `/garden`. Applicable flags:
`r002b_impact_path_ui`, `r002b_badges_ui`, and `r002b_shared_growth_view`, each independently off.

## Purpose and composition

Preserve the complete R002a Garden first. Add a compact “Water & Coast journey” section beneath the
authoritative current Mangrove/Garden projection. Its hierarchy is chapter summary, lifetime Seed
projection, completed-stage archive cue, and independently visible entry cards for Impact Path and
Badges. A secondary Shared Growth card may appear later only under its own view flag. The screen
must visually explain that current-stage 48→60 and lifetime 108→120 are distinct projections of the
same approved event.

## Data and actions

Read current landscape progress from the existing Garden authority and lifetime/archive/stations
from Growth selectors. Never sum or migrate in the screen. Impact Path opens
`/garden/impact-path`; Badges opens `/garden/badges`; Shared Growth opens
`/circle/shared-growth`. Each carries a closed Garden origin. Parent Garden must not expose Child
badge/path routes; role-specific sections are projected before render.

Each flag controls only its additive card. Turning every R002b flag off yields the current R002a
Garden byte-for-behavior fallback; no stored progression is reversed.

## States and layout

- Child ready: chapter plus only authorized entries.
- Parent ready: existing Parent Garden only unless a separately approved Parent entry applies.
- No eligible migration: keep current Garden and omit cumulative chapter with no fabricated 60.
- Loading/error/offline/interrupted: preserve existing Garden; isolate failure to additive cards.
- Completed current stage: show archived Mangrove 60/60 from the selector, not screenshot copy.
- Natural page scroll; bottom role navigation alone remains fixed; large text stacks cards.

## Accessibility and review

Use heading levels, textual progress, non-color state labels, 48×48 actions, tabular numerals, and
logical RTL/LTR card content. Botanical art uses the R003 provenanced local state-image registry;
it is nondirectional, never mirrored, and never the progress authority. Local browser-proxy
review now covers Arabic RTL and English LTR at 320×844, 360×844, 390×844, 430×932, and
768×1024; a synthetic 200%-text pass reflows without document horizontal overflow, and the
390×844 reduced-motion pass settles with zero running animations. Named screen-reader review and
physical Android/TalkBack evidence remain pending.

## Acceptance

Prove the R002a fallback, role isolation, independent flags, current/lifetime value separation,
typed origins, no screen-owned unlocks, no Child task creation, no route/nav regression, and no
horizontal overflow.
