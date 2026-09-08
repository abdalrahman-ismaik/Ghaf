# Prepared ambient soundscapes

## Active: calm soundscape v2

`calm-soundscape-v2.mp3` is a 60-second locally authored, non-verbal soundscape prepared on
2026-09-08 with FFmpeg 7.1.1. It combines three centered, filtered brown/pink noise layers with
fixed seeds (`240619`, `197112`, and `314159`) to suggest soft breeze and distant water without a
recognizable event or motif.

The authoring source uses no sine or tonal generator, bird-like call, melody, beat, speech, alert,
personal data, downloaded recording, field sample, or third-party audio. A 64-second source was
filtered and mixed, then the last four seconds were equal-power crossfaded into the first four
seconds and joined after seconds 4–60 to produce a 60-second circularly blended cycle. The MP3 was
encoded with a Xing header for gapless metadata.

Runtime playback remains local and offline. The one root-owned player loops v2 quietly, ducks below
prepared narration, pauses when Ghaf is inactive/backgrounded or a screen reader is active, and
follows the device-local Settings preference. It never requests recording, microphone,
notification, or network access.

Objective inspection supports identity and regression testing; it cannot establish that a person
finds the result calm, natural, balanced, or seamless. Those qualities require a named human
listening review on the authoritative Android build.

### Technical identity

```text
Format: MP3, mono, 44.1 kHz, 80 kbps
Duration: 60.029 seconds
Size: 600,600 bytes
Integrated loudness: -36.4 LUFS
Loudness range: 0.4 LU
True peak: -22.2 dBFS
Silence check: no interval >=250 ms below -50 dB
SHA-256: ecfcd7c074a7445e79b6de7260defe9a0cc42ac9d9f10ad7b865f833af77d1eb
```

## Rollback: nature soundscape v1

`nature-soundscape-v1.mp3` is the preserved 48-second locally synthesized v1 source authored on
2026-09-07 with FFmpeg 7.1.1 from layered pink/brown noise and two quiet bird-like tonal accents.
It contains no downloaded field recording, speech, personal data, or third-party sample. It is no
longer selected by runtime playback and remains only for a reversible rollback.

```text
Format: MP3, mono, 44.1 kHz, approximately 80 kbps
Duration: 48.039 seconds
Size: 480,698 bytes
SHA-256: d597335684f17773f6ac4c258122951488468fb871af190d8fae171a45253d71
```
