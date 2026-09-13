# Implementation Plan: Calm Ambient Soundscape

**Branch**: `010-calm-ambient-soundscape` | **Date**: 2026-09-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/010-calm-ambient-soundscape/spec.md`

## Summary

Replace only the active app-wide audio source with a versioned, locally authored calm ambience.
The new source uses deterministic filtered-noise layers intended to evoke soft breeze and distant
water, with no tones, bird calls, melody, beat, speech, downloads, or third-party samples. A
circular crossfade makes the end converge on the opening waveform before MP3 encoding. The existing
root player, quiet/ducked volumes, Settings preference, lifecycle rules, accessibility silence,
safe failure, and reset remain unchanged. The prior v1 asset stays in the repository only for
rollback.

## Technical Context

**Language/Version**: TypeScript 6.0 in strict mode; FFmpeg 7.1.1 for deterministic local audio
authoring and inspection

**Primary Dependencies**: Existing Expo 57, React Native 0.86, Expo Audio 57, Vitest 4, Node.js
built-ins, and repository audio preference/playback policy; no dependency addition

**Storage**: One versioned local MP3 asset selected at build time; the existing versioned
device-local Sound Boolean remains unchanged

**Testing**: Vitest source/asset contract tests, TypeScript, Expo ESLint, Prettier, FFprobe metadata,
FFmpeg loudness/silence/spectrum inspection, static web and Android JavaScript exports, followed by
named human listening on physical Android

**Target Platform**: Android is authoritative for listening; web is a secondary playback and export
surface

**Project Type**: Existing single Expo/React Native application

**Performance Goals**: One local source; no new runtime work or network call; 55–65 second source;
no detected silence of 250ms or more; no clipping; unchanged one-second Sound-toggle response

**Constraints**: Offline and deterministic; non-verbal and non-musical; no generated tones;
foreground only; screen-reader silent; subordinate to narration; reversible asset selection; no new
UI, preference, permission, package, recording, streaming, service, or product authority

**Scale/Scope**: One new MP3, one source binding change, one existing test extension, local asset
provenance, and narrow truth/evidence updates

## Constitution Check

_GATE: Passed before research and re-checked after design._

- **MVP Prototype First / One Complete Journey**: Pass. One distracting presentation asset changes;
  the existing deterministic journey and silent fallback remain complete.
- **Design Is a Core Feature**: Pass. The change directly addresses comfort and judge-facing polish
  without introducing another surface or control.
- **Arabic First**: Pass. There is no copy or layout change; the bilingual Sound control is preserved.
- **Mock First / Demo Reliability**: Pass. Playback remains a bundled offline source, and a failure
  remains silent and non-blocking.
- **Keep Architecture Small**: Pass. The existing player, policy, store, repository, and settings are
  reused; there is no dependency or runtime abstraction change.
- **Honest Prototype Boundaries**: Pass. The new sound is documented as locally synthesized, not a
  field recording. Objective inspection cannot pre-claim calmness or physical-device quality.
- **Fast Team Collaboration**: Pass. Exact asset, source, test, spec, and evidence files are reserved
  in `TEAM_OWNERSHIP.md`; unrelated user artifacts stay protected.
- **Visible AI Value / Child safety / access separation**: Not affected. No assistant, media capture,
  identity, role, task, reward, privacy, or progression authority changes.

Post-design re-check: all gates still pass. No constitution exception requires complexity tracking.

## Authoring and Playback Sequence

```text
Deterministic local authoring
  -> generate independent brown/pink filtered-noise textures with fixed seeds
  -> attenuate and mix into one centered, low-contrast mono bed
  -> remove narrow tonal generators and synthetic bird-like accents
  -> circularly crossfade tail into head so the closing waveform converges on the opening waveform
  -> encode one versioned local MP3
  -> record exact identity, command family, provenance, and objective measurements

Existing runtime
  -> root AmbientAudioProvider loads the v2 local asset
  -> existing policy decides pause / quiet play / narration-ducked play
  -> existing Settings preference and exact reset remain authoritative
  -> decode or playback error: preserve the complete app in silence
```

The prior v1 asset remains in the repository for a one-line rollback but is never selected at
runtime. No screen gains audio ownership.

## Project Structure

### Documentation (this feature)

```text
specs/010-calm-ambient-soundscape/
├── checklists/requirements.md
├── contracts/calm-soundscape-v2.md
├── data-model.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
└── tasks.md
```

### Source Code (repository root)

```text
assets/audio/ambient/
├── README.md
├── nature-soundscape-v1.mp3
└── calm-soundscape-v2.mp3

src/components/audio/AmbientAudioProvider.tsx
tests/natural-ambient-audio.test.tsx

PRODUCT.md
DESIGN.md
PROTOTYPE_LIMITATIONS.md
DEMO_RUNBOOK.md
TEAM_OWNERSHIP.md
```

**Structure Decision**: Keep the refinement within the existing app-wide audio boundary. Version
the binary beside v1, switch one static local source binding, extend the existing audio regression
file, and update existing truth/evidence surfaces. Do not add an audio authoring script to the
runtime project because generation is a one-time documented build input and FFmpeg is not an app
dependency.

## Complexity Tracking

No constitution violations.
