# Quickstart: Access Family Portraits Validation

## Automated checks

```bash
npx vitest run tests/access-family-portraits.test.tsx tests/parent-access-portrait.test.tsx tests/r001-onboarding-flow.test.ts tests/device-remembered-access.test.tsx
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build:web
git diff --check
```

## Secondary visual flow

1. Reset to signed-out Arabic, complete or skip the first-run story, and inspect Welcome at 320×720
   and 390×844. Confirm the habitat frame is 3:2 and both access actions are reachable.
2. Open Parent sign-in, sign-up, and verification in Arabic and English. Confirm the same father-
   and-mother image, safe complete faces/headwear, 3:2 frame, and reachable controls.
3. Open Child profile access in both locales. Confirm the boy-and-girl image appears before the tree-
   avatar profile list and is visually separate from every selection target.
4. Simulate 200% web text where feasible; confirm routes scroll without horizontal overflow or
   image mirroring.
5. Record browser review as secondary evidence only. Do not promote physical Android, cultural,
   safeguarding, accessibility, visual, or image-rights gates without direct named evidence.
