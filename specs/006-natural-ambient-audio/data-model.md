# Data Model: Natural Ambient Audio

## Ambient Audio Preference Record

One device-local, versioned presentation preference.

| Field | Type | Rule |
| --- | --- | --- |
| `schemaVersion` | literal `1` | Exact current version; unknown versions are rejected |
| `ambientSoundEnabled` | Boolean | The only persisted user choice |
| `origin` | literal `device_local` | Prevents account/cloud-sync interpretation |

Exact keys only are accepted. The record contains no identity, role, Child, household, account,
session, task, media, AI, or progression data.

## Ambient Audio Preference View

Transient store projection consumed by UI and playback.

| Field | Type | Rule |
| --- | --- | --- |
| `enabled` | Boolean | Default `true` when no record exists; `false` on invalid/unreadable data |
| `status` | `ready` or `unavailable` | `unavailable` records a safe startup fallback |
| `source` | `default`, `stored`, or `safe_fallback` | Truthful origin of the current Boolean |

### State transitions

```text
No record -> ready/default/on
Valid record -> ready/stored/<stored Boolean>
Invalid or read failure -> unavailable/safe_fallback/off
Successful setting write -> ready/stored/<new Boolean>
Failed setting write -> unchanged prior view
Successful prototype reset -> ready/default/on
```

## Ambient Playback Decision

Transient derived state; never persisted.

| Input | Play requirement |
| --- | --- |
| Startup ready | Must be true |
| Preference enabled | Must be true |
| App state | Must be active |
| Screen reader active | Must be false and known |
| Browser playback unlocked | Must be true on web; ignored on native |
| Exclusive voice/capture work | Must be false |

When every play requirement passes, narration focus selects the ducked volume; otherwise the
single player pauses. Route, role, language, and playback position do not create a state transition.

## Nature Soundscape Asset

| Property | Value |
| --- | --- |
| Content | Non-verbal synthesized nature ambience |
| Duration | 48.039 seconds |
| Format | MP3, mono, 44.1kHz, approximately 80kbps |
| Runtime source | Static local package only |
| Loop behavior | Player-owned continuous repeat |
| Human gate | Android naturalness, loudness, narration balance, and seam review |
