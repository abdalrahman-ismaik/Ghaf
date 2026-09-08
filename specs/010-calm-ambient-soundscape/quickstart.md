# Quickstart: Calm Ambient Soundscape Validation

## Automated and source-verifiable checks

From the repository root:

```bash
npx vitest run tests/natural-ambient-audio.test.tsx
npm run typecheck
npm run lint
npm run format:check
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_name,sample_rate,channels,channel_layout,bit_rate -of default=noprint_wrappers=1 assets/audio/ambient/calm-soundscape-v2.mp3
ffmpeg -hide_banner -i assets/audio/ambient/calm-soundscape-v2.mp3 -af ebur128=peak=true -f null -
ffmpeg -hide_banner -i assets/audio/ambient/calm-soundscape-v2.mp3 -af silencedetect=noise=-50dB:d=0.25 -f null -
sha256sum assets/audio/ambient/calm-soundscape-v2.mp3
npm test
```

Expected source-verifiable result:

- v2 is mono MP3 at 44.1 kHz and 55–65 seconds;
- loudness and true peak remain within the contract envelope;
- silence detection reports no interval of 250ms or more;
- the provider references only v2 while both v1 and v2 identities are documented;
- preference, lifecycle, accessibility, narration, reset, and failure regressions pass; and
- no dependency or user-facing copy changes.

## Physical Android listening

Use the competition Android device and a quiet room. Keep the device at the intended demo volume.

1. Start Ghaf with Sound enabled and listen through one full cycle plus two loop boundaries.
2. Record whether any chirp, tune, beat, voice, alert, harsh hiss, obvious pumping, hard movement,
   dropout, click, level jump, or startling event is perceived.
3. Replay prepared Arabic narration and then English narration; confirm each remains dominant.
4. Turn Sound off in Parent Settings, confirm silence, and verify the app remains fully usable.
5. Turn it on, background/foreground the app, and exercise the available screen-reader check.
6. Record reviewer name, device/build, date, volume context, and `PASSED`, `FAILED`, `BLOCKED`, or
   `NOT RUN` without inheriting Feature 006 evidence.

This human review is mandatory before claiming that the sound is calm, natural, balanced, or
seamless on Android.
