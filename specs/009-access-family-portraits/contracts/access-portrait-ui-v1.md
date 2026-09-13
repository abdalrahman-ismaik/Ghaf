# Access Portrait UI Contract V1

## Shared frame

- Full available content width and exact `aspectRatio: 3 / 2`.
- Existing continuous extra-large radius, clipped overflow, and neutral loading surface.
- Local Expo Image with centered `cover`, memory/disk caching, stable recycling key, and a reduced-
  motion-aware transition.
- Decorative: `accessibilityElementsHidden`, `importantForAccessibility="no-hide-descendants"`,
  and `aria-hidden` on the containing frame.
- Non-interactive: no `Pressable`, press handler, gesture, link, role/profile identifier, or state
  action.
- Failure-safe: the component returns `null` after decode error; no broken icon or retained blank
  height.

## Route placement

- Welcome: existing habitat image remains between the wordmark and title; only its frame changes.
- Parent sign-in/sign-up/verification: the existing shared component remains the first content item.
- Child profile access: the new Child component appears after `R003Hero` and before the actionable
  profile list.

## Protected behavior

The contract changes no route, copy, form field, access action, verification behavior, remembered-
device marker, profile choice, active experience, reset, or progress/assistant authority.
