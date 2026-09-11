# Quickstart: Role Header Branding

## Automated validation

```bash
npx vitest run tests/role-header-branding.test.tsx
npm run typecheck
npm run lint
npm run format:check
npm test
git diff --check
npx expo install --check
CI=1 npx expo export --platform web --output-dir /tmp/ghaf-feature012-web
CI=1 npx expo export --platform android --output-dir /tmp/ghaf-feature012-android
```

## Visual validation

Inspect at least one dashboard/tab and one nested screen for each role:

- Arabic RTL at 320 × 720 and 390 × 844
- English LTR at 320 × 720 and 390 × 844
- browser or Android 200% text where available
- one visible official mark in each top header
- title remains primary, readable, and naturally wrapping
- settings/help/profile/Back/action controls remain visible and usable
- no additional logo in a sheet, dialog, bottom navigation, access, onboarding, or splash surface

## Evidence rules

- Record automated results exactly.
- Report physical Android and screen-reader checks as `NOT RUN` unless directly performed.
- Do not claim asset mutation; verify the existing official logo checksum is unchanged.
- Preserve concurrent Feature 011 work and all unrelated user-owned artifacts.
