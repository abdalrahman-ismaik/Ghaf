# Implementation Plan: Natural Ambient Audio

**Branch**: `006-natural-ambient-audio` | **Date**: 2026-09-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-natural-ambient-audio/spec.md`

## Summary

Promote the existing locally authored non-musical nature soundscape from an onboarding-only player
to one app-root ambient audio provider. The provider owns exactly one player, continuous looping,
quiet/ducked volume, foreground and screen-reader lifecycle, browser interaction gating, and
failure-to-silence behavior. Add a strictly validated device-local Boolean preference through the
existing synchronous storage abstraction, expose it through the Zustand store, and present the
same native switch in Parent and Child Settings. The exact Parent reset clears the preference and
restores default-on behavior. No asset download, new package, network request, recording path, or
product authority is introduced.

## Technical Context

**Language/Version**: TypeScript 6.0 in strict mode

**Primary Dependencies**: Expo 57, React Native 0.86, Expo Router 57, Expo Audio 57, Zustand 5,
i18next/react-i18next

**Storage**: Existing synchronous `LocalKeyValueStorage`, backed by Expo SQLite KV on native,
browser `localStorage` on web, and deterministic memory storage in tests

**Testing**: Vitest 4 component/source/behavior tests, TypeScript, Expo ESLint, Prettier, local audio
metadata inspection, and physical Android listening/accessibility review

**Target Platform**: Android authoritative; web is a secondary visual and behavior surface

**Project Type**: Single Expo/React Native mobile application

**Performance Goals**: Toggle-to-pause/resume within one second; exactly one ambient player;
no route-level reload; no network dependency; loop discontinuity under 250ms in human listening

**Constraints**: Offline and deterministic; default on; foreground only; screen-reader silent;
subordinate to narration; persisted across restart/sign-out/role handoff; reset to default; Arabic
RTL and English LTR; no new dependency, media permission, recording, streaming, or account-sync claim

**Scale/Scope**: One versioned Boolean record, one repository, one pure playback policy, one root
provider, one reused settings component, two settings integrations, and one existing prepared asset

## Constitution Check

*GATE: Passed before research and re-checked after design.*

- **MVP Prototype First / One Complete Journey**: Pass. The feature improves the existing journey
  without adding a route or external dependency; silence remains a complete fallback.
- **Design / Arabic First**: Pass. The control uses the existing Settings hierarchy, bilingual
  resources, logical row order, native switch semantics, and 48dp sizing.
- **Mock First / Demo Reliability**: Pass. The soundscape is packaged locally, preference storage is
  deterministic, playback failures are non-blocking, and reset restores a known default.
- **Keep Architecture Small**: Pass. One provider replaces the route-local player and reuses the
  installed audio package, storage abstraction, store, tokens, and settings shells.
- **Honest Prototype Boundaries**: Pass. The asset remains documented as locally synthesized, not a
  field recording; there is no background service, recording, streaming, or naturalness claim based
  only on source inspection.
- **Fast Team Collaboration**: Pass. Exact planning, runtime, asset, test, and documentation files
  are reserved in `TEAM_OWNERSHIP.md`; unrelated local artifacts remain protected.
- **Visible AI Value**: Not affected. No AI feature, provider, prompt, grant, or capability label is
  changed.

Post-design re-check: all gates still pass. No constitution exception requires complexity tracking.

## Architecture and Playback Sequence

```text
App startup
  -> read and strictly validate one ambient preference record
  -> absent record: default on
  -> invalid/unreadable record: safe fallback off
  -> root provider creates one local player and configures loop + foreground-only audio mode
  -> derive playback from ready + preference + app active + screen reader off + web unlocked
  -> narration active: keep playing at ducked volume
  -> any blocking state: pause the same player

Parent or Child Settings
  -> native switch requests one Boolean write
  -> successful write: update store -> root provider pauses/resumes immediately
  -> failed write: retain prior store value -> show recoverable error

Parent-authorized prototype reset
  -> clear ambient preference with other device-local prototype records
  -> restore default-on store view
  -> signed-out first-run presentation uses the same root player
```

No screen creates a player. The persisted record expresses only a preference and never grants audio,
access, AI, media, or background authority.

## Project Structure

### Documentation (this feature)

```text
specs/006-natural-ambient-audio/
├── checklists/requirements.md
├── contracts/ambient-audio-v1.md
├── data-model.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── _layout.tsx
├── child/settings.tsx
└── parent/settings/index.tsx

assets/audio/
├── ambient/nature-soundscape-v1.mp3
└── onboarding/
    └── narration-*.mp3

src/
├── components/
│   ├── audio/AmbientAudioProvider.tsx
│   ├── onboarding/FirstRunOnboarding.tsx
│   └── settings/AmbientSoundSetting.tsx
├── features/audio/ambientAudio.ts
├── models/audioPreferences.ts
├── services/local/audioPreferencesRepository.ts
├── services/index.ts
├── state/usePrototypeStore.ts
└── i18n/resources.ts

tests/
└── natural-ambient-audio.test.tsx
```

**Structure Decision**: Keep the feature in the existing Expo application. A pure policy and strict
repository isolate behavior from native playback; the root provider owns the one player; a native
switch component is reused by both role-separated Settings screens. The existing synthesized asset
moves from onboarding-specific packaging to ambient packaging without changing its documented
authorship or adding binary content.

## Complexity Tracking

No constitution violations.
