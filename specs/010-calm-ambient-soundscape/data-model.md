# Data Model: Calm Ambient Soundscape

This feature adds no database, account record, user data, or persisted state. The existing
device-local Sound preference schema remains unchanged.

## Calm Ambient Asset

Build-time identity for the one source selected by the root player.

| Field             | Rule                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| `version`         | Fixed `v2`; not user-editable                                                 |
| `path`            | Local packaged file under `assets/audio/ambient/`                             |
| `format`          | MP3, mono, 44.1 kHz                                                           |
| `duration`        | 55–65 seconds                                                                 |
| `origin`          | Locally authored from deterministic synthesized noise; no downloaded sample   |
| `contentBoundary` | No speech, melody, beat, alert, tonal/bird generator, or personal data        |
| `sha256`          | Recorded after final encoding; changes require a new identity/evidence update |
| `runtimeRole`     | Supporting foreground ambience only; never product authority                  |

## Prior Ambient Asset

The immutable v1 file and recorded identity remain available only for rollback. The root player
must not reference it after v2 integration.

## Existing Ambient Preference

No field, validation, state transition, or storage key changes. Its existing states remain:

```text
absent + storage available -> default enabled
valid stored Boolean       -> stored value
unreadable/invalid         -> safe fallback disabled
successful settings write -> requested stored value
failed settings write     -> retain prior authoritative value
exact prototype reset     -> clear record -> default enabled
```

Asset version does not enter the preference and cannot change role, identity, permission, narration,
task, reward, Garden, League, assistant, or access state.
