# Quickstart: Remembered Device Access

## Deterministic fixtures

- Parent identifier: `parent@example.com`
- Parent verification code: `424242`
- Salem PIN: `2468`
- Alya picture sequence: Leaf → Water → Tree

## Parent-owned installation

1. Reset the prototype and create the synthetic family.
2. On Parent verification, select **Remember me on this device** before continuing.
3. Reload/restart the app and confirm Parent Home opens without identifier or code entry.
4. Open Parent settings and sign out.
5. Reload/restart again and confirm signed-out Welcome remains visible.

## Child-owned installation

1. Complete the existing Salem pairing with Parent approval.
2. Reload/restart the app and confirm Salem's Today screen opens without profile/PIN entry.
3. From Child Help or Child Settings, choose **Parent access**.
4. Confirm the Child route is no longer authorized, then sign in as Parent.
5. Confirm the remember-Parent option is replaced by a message that this is temporary access.
6. Sign out as Parent and confirm Salem returns without PIN or re-pairing.
7. As Parent, revoke Salem's paired device; after logout/restart, confirm Salem is not restored.

## Validation

```bash
npx vitest run tests/device-remembered-access.test.tsx
npm run typecheck
npm run lint
npm run format:check
npm test
git diff --check
```

## Evidence labels

- Automated/source evidence may be marked `PASSED` only for the exact checks run.
- Physical Android restart, process death, Back behavior, TalkBack, large fonts, and secure storage
  remain `BLOCKED` or `NOT RUN` until directly observed.
- Never describe this local affinity marker as a login token, production authentication, secure
  device registration, cloud account, or Parent/Child synchronization.
