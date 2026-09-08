# Calm Soundscape v2 Contract

## Active source

- Runtime path: `assets/audio/ambient/calm-soundscape-v2.mp3`
- Rollback source retained: `assets/audio/ambient/nature-soundscape-v1.mp3`
- Binding owner: the existing app-root ambient audio provider
- Runtime behavior: unchanged Feature 006 playback decision and Settings preference

## Authorship and content

The final asset must be locally authored from deterministic synthesized noise layers. Its README
must record the date, tool version, source family, exact technical identity, and SHA-256 digest. It
must contain no downloaded recording/sample, third-party audio, speech, personal data, sine/tonal
generator, synthetic bird call, melody, beat, or alert.

## Objective delivery envelope

| Property                   | Required value                                              |
| -------------------------- | ----------------------------------------------------------- |
| Codec                      | MP3                                                         |
| Channels                   | 1 (mono)                                                    |
| Sample rate                | 44.1 kHz                                                    |
| Duration                   | 55–65 seconds                                               |
| Integrated source loudness | Between -42 and -30 LUFS                                    |
| True peak                  | At or below -18 dBFS                                        |
| Digital silence            | No interval of 250 ms or more below -50 dB                  |
| Runtime references         | v2 present exactly once; v1 absent from the active provider |
| Network/media permissions  | None                                                        |

These measurements support regression checks. They do not establish subjective calmness, naturalness,
narration balance, or an inaudible decoded loop.

## Human Android listening gate

With app playback using the production quiet volume, a named reviewer must listen on the competition
Android device through one complete cycle and two loop boundaries, then record:

- zero recognized chirps, tunes, beats, voices, alerts, or startling events;
- no perceived clipping, harsh hiss, obvious pumping, hard movement, dropout, click, or abrupt level
  jump;
- prepared Arabic and English narration remains clearly dominant; and
- Sound off stops playback while the full app remains usable.

Until performed, each subjective or physical-device result is `NOT RUN`; automated evidence cannot
promote it to `PASSED`.

## Failure and rollback

Decode or playback failure is silent and non-blocking under the existing provider behavior. If
human review rejects v2, restore the provider's static reference to the preserved v1 source or ship
silence while a new version is authored; no preference or stored-data migration is permitted.
