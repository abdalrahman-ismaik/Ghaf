# Quickstart: Verified Family Replacement

## Prerequisites

- Install repository dependencies with `npm ci` if needed.
- Use only synthetic data.
- Start from the current integration branch with no unrelated edits in reserved files.

## Focused automated validation

```bash
npx vitest run tests/family-replacement-flow.test.ts tests/parent-onboarding-controller.test.ts tests/parent-onboarding-store.test.ts tests/r003-returning-family-entry.test.ts tests/r001-onboarding-flow.test.ts --maxWorkers=1
npm run typecheck
npm run lint
npm run format:check
git diff --check
```

Expected result: all focused behavior and source contracts pass; no TypeScript, lint, formatting, or
whitespace error is reported.

## Successful replacement journey

1. Create the existing synthetic family using `parent@example.com` and operator code `424242`.
2. Sign out and confirm **Create a new family** remains visible.
3. Open it and confirm the notice says the current family stays until final review.
4. Enter `new-parent@example.com`, continue, and enter `424242`.
5. Complete Parent/guardian and family details, then every selected Child profile.
6. On Review Family, confirm the replacement warning and explicit replacement action.
7. Complete replacement and confirm Parent Home opens.
8. Sign out; confirm returning sign-in accepts `new-parent@example.com` and rejects the old email.
9. Confirm prior pairing, progress, grants, drafts, assistant state, and welcome state are reset.

## Preservation and failure journeys

- Wrong code: old family remains saved and returning sign-in still works.
- Change identifier/Back from verification: old family remains saved.
- Back from Family Basics after accepted code: old family receipt/draft are restored.
- Restart during replacement setup: the persisted old family is restored; the transient draft is
  discarded.
- Injected final write failure: old family remains the sole saved family; no partial new family or
  Parent experience appears; retry/cancel remains available.

## Bilingual compact presentation

Review Parent sign-in, sign-up, verification, Family Basics, and Review Family in:

- Arabic RTL and English LTR;
- 320×720 and 390×844 viewports;
- default and increased text size;
- keyboard-visible identifier entry;
- visible/system Back paths.

Confirm no horizontal overflow, hidden action, ambiguous replacement copy, reversed directional
icon, inaccessible focus order, or target below 48dp.

## Full repository handoff

```bash
npm run verify
npx expo export --platform android --output-dir /tmp/ghaf-feature011-android
```

Record the pre-existing Expo dependency-alignment result separately if `npm run verify` stops after
all source/tests pass. Physical Android, TalkBack, IME, Back, and font-scale evidence must remain
`NOT RUN` unless directly observed on the connected device.
