# R002a Parent Home screen specification

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**  
> **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

Status: selected presentation specification. Existing remote-head behavior is authoritative.

## Evidence

- PNG: `docs/design/stitch/releases/ghaf-r002/ghaf_parent_home/screen.png` — 402×1600 — SHA-256 ae4d529261c97010b51938bc0c1c484cb5d1eadb71bb7c6971f18c15536fc910.
- HTML hint: `docs/design/stitch/releases/ghaf-r002/ghaf_parent_home/code.html` — SHA-256 26b6b0ad2cea588e87d2fd5591f7789bf122056267127f9f888ef1ac9a5fe48a — title “Ghaf — Parent Home”; viewport width=device-width, initial-scale=1.0.

## Route and behavior

Owner route is /parent behind the existing Parent capability guard. Entry is the completed R001 onboarding/sign-in handoff or existing Parent navigation. Verified destinations/actions are /parent/task/new, /parent/check-in, /role, /garden, /circle, pre-acceptance adjustment resolution, prepared-summary correction, locale switching, and Parent-authorized reset. Downstream private League, Family Reward, guide, voice, selected-Child, reauthentication, privacy, and profile-isolation capabilities remain regression-protected; this redesign does not fabricate direct Parent Home exits for them.

Translate the warm pearl background, centered Ghaf header, welcoming hierarchy, rounded cards, restrained botanical canopy, Child summaries, lifecycle action, and bottom navigation. Preserve all existing capabilities even when absent from the PNG. Do not create a second state authority.

Every displayed Child, canopy, task, or journey value is selected live. League and Family Reward fragments appear only when an existing authoritative selector is wired to this route. Screenshot values such as 19/25, 4/5, 108/120, names, and task copy are examples only; hide a card or show its conservative empty state when no authoritative selector exists.

## States and layout

- Default: selected Child plus lifecycle-relevant primary action.
- Loading/offline/error: calm inline status and retry; deterministic local data remains truthfully labeled.
- Empty: invite task creation without blame or fake progress.
- Submitting/success: disable duplicate action and announce the resulting route/state.
- Interrupted: re-read canonical store state on focus.
- Responsive: safe-area shell, natural scroll, fixed bottom navigation only, and no horizontal overflow at 320–430 widths, wider view, or 200% text.
- Arabic: Help physical left, avatar right, title mathematically centered. English uses semantic LTR.
- Accessibility: 48×48 targets, 4.5:1 text contrast, named cards/actions, non-color status, logical focus order, reduced-motion static updates.

## Acceptance boundary

The redesign changes presentation only. task_recycling_p0_v1, Schema-3 rewards, five-Leaf League, Family Rewards, voice, reset, route guards, privacy, and profile isolation remain unchanged. No R002b Impact Path, Shared Growth, Next Stage, badges, or revised RevealBundle appears.
