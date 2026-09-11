# Research: Ghaf Repository Foundation

**Date**: 2026-08-22

All decisions below are intentionally provisional until the three-member team validates the first
technical plan. Official or primary maintainer sources were preferred.

## Spec Kit and repository workflow

**Recommendation**: Pin GitHub Spec Kit `v1.0.1` from `github/spec-kit`, initialize Codex skills
with Python scripts, and keep Spec Kit artifacts as the primary planning record.

**Why it helps the MVP**: The current official release supplies the requested Codex skills,
portable Python scripts, and the full `converge` step without a community extension.

**Main downside**: Generated planning artifacts add ceremony, so each feature must remain small.

**Alternative**: Use the official PyPI `specify-cli==1.0.1` distribution; the pinned GitHub tag is
preferred because its provenance is explicit.

**Decision status**: PROPOSED

Sources: [Spec Kit v1.0.1](https://github.com/github/spec-kit/releases/tag/v1.0.1),
[installation](https://github.com/github/spec-kit/blob/v1.0.1/docs/installation.md),
[Codex integration](https://github.com/github/spec-kit/blob/v1.0.1/docs/reference/integrations.md)

## Expo SDK and router

**Recommendation**: Use Expo SDK 57 with the default TypeScript and Expo Router template; require
Node.js 22.13 or newer and keep `expo` at 57.0.9 or newer within the SDK 57 line.

**Why it helps the MVP**: SDK 57 is the current stable supported toolchain and the Router template
provides the small native-stack navigation foundation with little configuration.

**Main downside**: Earlier SDK 57 patches had a Reanimated-related Hermes memory regression, and
the team must use a current Node runtime.

**Alternative**: Use SDK 56 only if a concrete team-machine blocker appears; do not use an SDK 58
prerelease for the competition build.

**Decision status**: PROPOSED

Sources: [SDK reference](https://docs.expo.dev/versions/latest/),
[SDK 57 release](https://expo.dev/changelog/sdk-57),
[Router reference](https://docs.expo.dev/versions/v57.0.0/sdk/router/)

## Styling and component system

**Recommendation**: Use React Native `StyleSheet`, central tokens, and a small set of local
components; do not add NativeWind or a component framework during bootstrap.

**Why it helps the MVP**: Direct styles keep Arabic direction explicit, reduce configuration, and
make the visual language easy for three contributors to trace.

**Main downside**: StyleSheet composition is more verbose than utility classes.

**Alternative**: Time-box a stable NativeWind proof only if the team demonstrates a meaningful
speed advantage and passes Android RTL/input/release checks.

**Decision status**: PROPOSED

Sources: [React Native StyleSheet](https://reactnative.dev/docs/stylesheet),
[NativeWind installation](https://www.nativewind.dev/v5/getting-started/installation)

## Arabic localization and RTL

**Recommendation**: Use `expo-localization`, `i18next`, and `react-i18next`; declare `ar` and `en`,
default to Arabic, use `I18nManager` for native direction, reload when direction changes, and also
apply logical start/end and text alignment in shared components.

**Why it helps the MVP**: It provides native mirroring while preserving a deterministic in-app
language switch for judges.

**Main downside**: Native global direction changes require a reload, and Expo Go does not reliably
retain dynamic RTL overrides; physical validation needs a development build.

**Alternative**: Translate instantly while tying global direction only to device locale, but that
would weaken the bilingual live demo.

**Decision status**: PROPOSED

Sources: [Localization API](https://docs.expo.dev/versions/v57.0.0/sdk/localization/),
[Expo localization and RTL guide](https://docs.expo.dev/guides/localization/)

## Shared prototype state

**Recommendation**: Use one small typed Zustand store for locale, active role, mission, impact,
tree stage, mock mode, and `resetDemo()`; keep isolated inputs in local React state.

**Why it helps the MVP**: The same deterministic journey state can cross file-based routes without
provider boilerplate, and reset behavior remains explicit.

**Main downside**: A global store can become a dumping ground unless its state remains bounded.

**Alternative**: React Context with `useReducer` if shared Feature 002 state proves much smaller
than expected.

**Decision status**: PROPOSED

Source: [Zustand documentation](https://github.com/pmndrs/zustand/blob/main/docs/index.md)

## Ghaf tree visual

**Recommendation**: Build six deterministic layered stages with `react-native-svg`; use Reanimated
transform/opacity and limited stroke-reveal motion when Feature 002 adds growth animation.

**Why it helps the MVP**: The tree stays reusable as hero, progress display, and celebration while
remaining lightweight and deterministic.

**Main downside**: Bespoke SVG artwork takes design time, and complex path morphing would be fragile.

**Alternative**: Use six transparent pre-rendered images; choose Lottie only if finished animation
assets already exist.

**Decision status**: PROPOSED

Sources: [React Native SVG](https://docs.expo.dev/versions/v57.0.0/sdk/svg/),
[Reanimated](https://docs.expo.dev/versions/v57.0.0/sdk/reanimated/)

## Media path

**Recommendation**: In Feature 002, start with prepared audio and image fixtures; use `expo-audio`
for playback and later visible-action recording, and `expo-image-picker` before considering a
custom camera surface.

**Why it helps the MVP**: Prepared assets guarantee the offline demo while the official Expo
packages provide a contained upgrade path to live capture.

**Main downside**: Live recording and camera permissions introduce physical-device failure modes.

**Alternative**: Keep only bundled demonstration media for the entire competition build if live
capture does not materially improve judging.

**Decision status**: PROPOSED

Sources: [Expo Audio](https://docs.expo.dev/versions/v57.0.0/sdk/audio/),
[Image Picker](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/)

## Development and preview builds

**Recommendation**: Use an Expo development build during native-module/RTL work and later create
an Android internal-distribution preview APK that runs without Metro; keep the package identifier
explicitly provisional.

**Why it helps the MVP**: A development build supports realistic iteration, while a preview APK is
the reliable artifact for rehearsals and competition day.

**Main downside**: EAS adds an account, signing setup, build time, and rebuilds after native changes.

**Alternative**: Use `npx expo run:android` locally, but still prepare an installable preview APK
before final rehearsal.

**Decision status**: PROPOSED

Sources: [development build](https://docs.expo.dev/tutorial/eas/android-development-build/),
[internal distribution](https://docs.expo.dev/tutorial/eas/internal-distribution-builds/),
[APK builds](https://docs.expo.dev/build-reference/apk/)

## Testing level

**Recommendation**: Use type checking, linting, formatting checks, a few pure-function/service
tests, one mock-flow smoke test, and manual Android/Arabic/RTL rehearsal.

**Why it helps the MVP**: These checks protect the demonstration path without diverting the team
into a broad test program.

**Main downside**: Automated UI regression coverage remains intentionally limited.

**Alternative**: Add focused React Native Testing Library tests only for components that repeatedly
break during Feature 002.

**Decision status**: PROPOSED

## Codex custom agents

**Recommendation**: Define five standalone project TOML files in `.codex/agents/`, each with
`name`, `description`, and `developer_instructions`; use `.codex/config.toml` only to enable agents
and cap project concurrency at four. Standalone agent discovery needs no duplicate registration.

**Why it helps the MVP**: Current Codex discovers project agents directly, and narrow descriptions
reduce overlapping work.

**Main downside**: Project agent files load only after the repository is trusted and may require a
new Codex session to appear.

**Alternative**: Register every role explicitly under `[agents.<role>]` in `.codex/config.toml`;
this duplicates standalone discovery and is unnecessary for Ghaf.

**Decision status**: PROPOSED

Source: [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
