# R002b Child Impact Path specification

> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

Status: code-native implementation candidate. Flag: `r002b_impact_path_ui`, default off.
Owner route: `/garden/impact-path`, nested in the Child Growth stack.

## Purpose and composition

Present one private, read-only projection of confirmed lifetime Seeds for the chapter
“العناية بالمياه والسواحل / Water & Coast Care.” Use a calm vertical journey that remains a logical
list for assistive technology: chapter header; lifetime summary; archived Mangrove 60/60; current
120→180 chapter; stations 120, 132, 144, 156, 168, and 180; truthful symbolic-impact note; and
contextual links to unlocked learning and Badges. A soft water path and code-native mangrove forms
may connect stations visually but never determine order or status.

## Canonical station results

- 120: archive Mangrove 60/60 and Expanding Shade.
- 132: unlock `learning.mangrove_roots.v1`; Mangrove Care is progress only.
- 144: coastal-ripple cosmetic only.
- 156: evaluate Water Care — Bud; threshold alone is insufficient.
- 168: unlock the Jubail learning story without a visit claim.
- 180: Coastal Care and only the configured next Garden stage.

Every result comes from selectors/receipts. The route cannot write Seeds, award badges, complete
learning, assign tasks, or infer the historical 60.

## Navigation and recovery

Allow entry only for an active Child with the flag on and a closed typed origin from Today, Garden,
Badge Detail, or Reveal. Arabic Back is physically right. Restore the validated route, profile,
station, scroll anchor, and focus origin. Reject arbitrary/cross-role origin data and invalid profile
or station IDs; use `/child` or `/garden` as the safe Child fallback. Bottom navigation is omitted.

## States

Ready, before-entry, current, reached, learning-unlocked, chapter-complete, all-complete, loading,
offline-ready, derivation error/retry, unavailable migration, interrupted/recovered, missing local
art, and reduced-motion static states are required. Locked stations show exact requirements. A
missing eligible next action renders no action rather than creating one.

## Accessibility and responsive behavior

Reading order follows the station list, independent of curve direction. Each station announces
threshold, state, criterion, and action. State uses text plus shape/icon; the path line is decorative.
The route scrolls naturally at 320–768 widths and 200% text with no horizontal pan. Targets are at
least 48×48, normal text contrast is 4.5:1, numerals are tabular, mixed IDs are bidi-isolated, and
reduced motion disables auto-pan/bounce while preserving announcements.

## Copy, provenance, and acceptance

Arabic/English strings are centralized. New safety/privacy/factual wording remains marked for human
review. Art is code-native until provenance approval. Prove threshold boundaries, permanent archive,
no Seed mutation, profile/epoch isolation, locked-route rejection, origin restoration, deep-link
fallback, offline/reset determinism, both directions, large-text reflow, and flag-off inaccessibility.
Local browser-proxy review now covers Arabic RTL and English LTR at 320×844, 360×844, 390×844,
430×932, and 768×1024; synthetic 200%-text passes have no document horizontal overflow, and
390×844 reduced-motion passes settle with zero running animations. These remain review candidates;
named accessibility and physical Android/TalkBack evidence remain pending.
