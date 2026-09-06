# ADR 0002: Device-local family directory

- **Status:** Accepted for the local demonstration
- **Date:** 2026-09-06
- **Revised:** 2026-09-07
- **Feature:** 003 — Family Growth Garden

## Context

A returning Parent must not repeat first-family creation after an app restart, and the setup must
support one or two configured Child profiles with safe preferences for bounded personalization.
The existing immutable completion receipt and paired-device map live only in module memory. A
production account/database is not authorized, and persisting the full task/reward domain would
expand the safety and migration surface beyond the competition need.

## Decision

Persist one strict version-2 `LocalFamilyRecord` behind a `LocalFamilyRepository` contract.

- Native builds use `expo-sqlite/kv-store`; the small JSON value is SQLite-backed and written/read
  synchronously so access decisions and reset cannot race.
- Web preview uses guarded `localStorage`; tests inject a deterministic memory adapter.
- The repository validates after serialization and again after parsing. Unknown versions,
  corruption, invalid ids, duplicate selections, and over-limit text fail closed.
- Schema 2 adds the normalized synthetic Parent phone/email identifier and kind solely for local
  returning-family membership lookup. The deterministic code, passwords, and sessions remain out
  of the record.
- A prior valid schema-1 fixture migrates once from its legacy key to schema 2 using only the
  canonical prepared `parent@example.com` identifier; the new value is written before the legacy
  key is removed. Reset clears both keys.
- Startup restores only the Parent completion receipt, configured profile display projection, and
  allowlisted synthetic paired-device markers.
- Parent reset clears the directory before exposing the canonical signed-out state.
- Task, Seed, Garden, League, Family Reward, media, assistant results, and notification history stay
  out of this record and keep their existing authorities.

## Consequences

Returning family recognition now survives app restarts on the same device, and Child selectors can
show only configured slots. Returning Parent verification begins only after the candidate
identifier normalizes to the stored value. The app still has no production account recovery,
encryption claim, cloud backup, cross-device consistency, or reinstall guarantee. A missing,
mismatched, or corrupt record never grants a role.

The native package adds one Expo-SDK-aligned dependency and no ORM. Web storage is only a preview
adapter because Expo SQLite web support would otherwise require a WASM and cross-origin-isolation
configuration that the current static demonstration does not need.

## Alternatives considered

| Alternative                          | Decision                                                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Persist the complete Zustand session | Rejected: duplicates domain migration/authority and stores unnecessary Child/task data                            |
| AsyncStorage plus SQLite             | Rejected: overlapping dependencies for one small record                                                           |
| Raw relational tables and an ORM     | Rejected: unnecessary for one bounded versioned aggregate                                                         |
| Expo SQLite on web                   | Deferred: alpha web support requires WASM/COOP/COEP setup; guarded localStorage is sufficient for visual evidence |
| Production backend/account service   | Rejected: unauthorized, network-dependent, and outside P0                                                         |
| Store no Parent lookup identifier    | Superseded: it could not distinguish a returning Parent from an unknown email before verification                 |

## Related records

- [`plan.md`](../../../specs/003-family-growth-garden/plan.md)
- [`data-model.md`](../../../specs/003-family-growth-garden/data-model.md)
- [Expo SQLite documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
