# Quickstart: Ghaf Repository Foundation

## Prerequisites

- Node.js 22.13 or newer
- npm
- Android Studio/emulator or an Android device for native direction checks
- A trusted Codex project session to discover `.codex/agents/`

No API key, backend, Expo account, or real child information is required.

## Install and validate

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test
```

Expected result: every command exits successfully.

Use `npm install` only when intentionally changing dependencies and refreshing `package-lock.json`.

## Start

```bash
npm start
```

Use the displayed Expo controls for the desired development surface. Android is the primary target.

## Foundation validation scenario

1. Open the app and confirm `Ghaf` and `غاف` are visible.
2. Select Arabic and enter the prototype.
3. Confirm the role selector and right-to-left visual ordering.
4. Open Parent and confirm a staged Ghaf tree plus one mock mission.
5. Switch to Child and confirm the same mission appears as a child adventure.
6. Switch to English and confirm left-to-right visual ordering.
7. Use Reset Demo and confirm Arabic, Parent, assigned mission, 1,250 g, 5 portions, 3 completed
   missions, 2 streak days, and Sapling stage at 48% are restored.

## Manual checks

- Long Arabic copy wraps without covering actions.
- Mixed Arabic/English text and numbers remain readable.
- Directional icons mirror appropriately.
- Progress fills from the logical start edge in both Arabic and English.
- The role switch is clearly labeled as a prototype shortcut.
- Mock/pregenerated content is visibly disclosed.
- The flow works after network access is disabled.
- Arabic, English, mixed-script copy, back icons, inputs, and progress direction are checked on the
  primary physical Android demo device; record the device and result in the README status table.

## Scope guard

If a route asks to record audio, capture an image, generate a mission, submit evidence, confirm
completion, or show a growth celebration, Feature 001 has exceeded its specification. Those screens
belong to `specs/002-ghaf-core-mvp/` after team review.
