# Visual Audit — Ghaf R001 Batch 1

**Date:** 2026-09-02

**Result:** **PASSED FOR PARTIAL NATIVE TRANSLATION**. The seven PNGs establish a coherent Arabic
Parent-onboarding direction. They do not establish the later Parent/Child product modes.

## Shared Direction

- Warm pearl field with a very quiet 24 px dot texture.
- Deep forest reading color, decisive Ghaf emerald actions, and sparse mangrove/amber accents.
- Alexandria establishes the wordmark and headings; Readex Pro keeps forms and explanations calm.
- Strong whitespace, a single-column 20 px phone margin, 16 px rounded fields/actions, and mostly
  flat tonal surfaces.
- Organic background planes appear as atmosphere, not decorative UAE clichés.
- Header content stays minimal: logical Back, centered Ghaf wordmark, and optional three-step
  progress.
- One dominant action per screen; secondary actions remain quiet.

## Per-Screen Composition Findings

| Screen            | Canonical composition                                                                                           | Native translation note                                                                                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Welcome           | Locale action at top, vertically lifted centered wordmark/statement, quiet organic horizon                      | The PNG crop omits the required Parent/Child actions. Preserve its hero composition, then place the two 56dp actions and synthetic disclosure in the naturally scrolling continuation evidenced by HTML and product requirements. |
| Parent sign-in    | Minimal header; large welcome; one field; primary action; divider; biometric alternative; create-family link    | Keep disclosure reachable below the fold. The biometric action remains visibly simulated.                                                                                                                                         |
| Verification      | Centered dialpad emblem/title, six cells, resend/change actions, bottom Verify                                  | Preserve the calm vertical rhythm while making cells responsive and allowing scroll on short devices.                                                                                                                             |
| Family basics     | Progress 1/3, large title, family name, quiet privacy helper, two-option language choice, anchored Continue     | Keep the central form naturally scrollable and the explicit action region clear of the keyboard/safe area.                                                                                                                        |
| Add first Child   | Progress 2/3, nickname, botanical avatar row, age/language pills, support chips, privacy note, Continue         | Carry the actual selected botanical avatar forward. Fix numeric bidi wrapping and enforce 48dp chips rather than reproducing export defects.                                                                                      |
| Review and create | Progress 3/3, one summary surface, four quiet access/privacy statements, primary Create and secondary edit      | Avoid web glass blur; use an opaque tonal card and rare soft native shadow. Display the selected avatar/supports from state.                                                                                                      |
| Success           | Review remains recognizably behind a dim layer; rounded top sheet, handle, check, title, short copy, one action | Use a native transparent modal route. Blur is not required; an accessible dim overlay and tonal sheet preserve the composition.                                                                                                   |

## Visual Conflicts Resolved

- The PNG is authoritative for composition; generated HTML is not copied.
- Product minimum caption size 14/22 and 48dp targets override smaller generated values.
- Parent onboarding headings use the approved Parent typography hierarchy while retaining the PNG's
  visual prominence; the 36 px Welcome wordmark is a brand display exception.
- The Add Child export selects a tree symbol while Review shows a different Child leaf symbol. The
  selected state is source of truth and must carry into Review.
- The release's English/state omissions do not authorize a visually different design. Variants use
  the same component geometry and semantic tokens, then remain subject to later screenshot review.
- Variable PNG heights indicate scroll capture, not a maximum content height.

## Anti-Pattern Check

The batch contains no public leaderboard, money treatment, AI companion, score grid, surveillance
timeline, generic desert photography, camel/falcon/mosque ornament, neon game chrome, stacked
dashboard wall, punitive state, or dying vegetation. Native implementation must retain that
restraint.
