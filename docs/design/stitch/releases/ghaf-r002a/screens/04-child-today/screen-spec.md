# R002a Child Today screen specification

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**  
> **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

Status: selected presentation specification for the existing Child root.

## Evidence

- PNG: `docs/design/stitch/releases/ghaf-r002/ghaf_child_today_final/screen.png` — 706×1600 — SHA-256 e56ed8aadac23a41ad0b145fe7c417ec20e4424571cb90a59eb846708c9aa468.
- HTML: `docs/design/stitch/releases/ghaf-r002/ghaf_child_today_final/code.html` — SHA-256 dbe4c7f8d45e86ef169fdacd046cc155f15c75b2501f548c6d7b193e88b6542b — title “Ghaf — Child Today — اليوم”; viewport width=device-width, initial-scale=1.0.

## Route and content

Owner is /child behind the existing Child capability/profile guard. Entry follows the approved Child access path or Child navigation. The current task card opens /child/task; the existing Garden and cooperative /circle destinations remain wired. Private League domain behavior remains regression-protected, but this presentation does not fabricate a private-League route or relabel /circle as private League.

Translate the friendly botanical header, clear Today hierarchy, one primary assigned-task card, live award/status, calm empty state, and Child bottom navigation. Use the existing selected-profile and assignment selectors. No Parent control, private note, reward amount, or other profile data may leak.

## Interaction and quality

Loading and recoverable error retain the selected profile. No-task copy is dignified and never frames absence as failure. Route transitions do not mutate task state. Interrupted entry re-reads canonical lifecycle. Use owned/code-native task illustration only.

At Arabic RTL, Help is physical left, avatar right, root title mathematically centered, and the visible navigation order from physical left to right is الدوري | حديقتي | اليوم. English uses natural LTR semantics. Support 320–430 widths, wider layout, safe areas, scrolling, 200% text, 48×48 targets, semantic card/button names, 4.5:1 contrast, and reduced-motion static transitions.

## Acceptance boundary

Today never exposes Shared Growth, Impact Path, badges, cumulative Next Stage, or revised RevealBundle. Task identity, award, access, privacy, and reset remain unchanged.
