# Research: Ghaf Core MVP

**Date**: 2026-08-22

**Scope**: Only choices that materially affect the competition prototype are included. Every
decision remains proposed until the team reviews the Feature 002 plan. Primary maintainer sources
are used, and no live model identifier is selected during bootstrap.

## Expo SDK 57 and Expo Router

**Recommendation**: Continue with the installed Expo SDK 57, React Native 0.86, strict TypeScript,
and Expo Router 57. Extend the existing file-based application to exactly ten screens.

**Why it helps the MVP**: The foundation is already validated on this current stable Expo line, so
the team can add the complete flow without migrating tooling or introducing a second navigation
system.

**Main downside**: Native dependencies and direction changes still require development-build and
physical-device validation; web behavior alone is not proof of Android behavior.

**Alternative**: Freeze on an older Expo SDK only if the primary team machine or demo device has a
demonstrated blocker. Do not move to a prerelease SDK for the competition build.

**Decision status: PROPOSED**

Sources: [Expo SDK reference](https://docs.expo.dev/versions/latest/),
[Expo SDK 57 release](https://expo.dev/changelog/sdk-57),
[Expo Router](https://docs.expo.dev/versions/v57.0.0/sdk/router/)

## Styling: StyleSheet rather than NativeWind

**Recommendation**: Keep React Native `StyleSheet`, the Feature 001 design tokens, and small local
components. Do not add NativeWind or a large component framework for Feature 002.

**Why it helps the MVP**: The existing approach makes direction, spacing, animation composition,
and the bespoke Ghaf visual explicit while avoiding another build-time configuration surface for
three contributors.

**Main downside**: Repeated StyleSheet objects are more verbose than utility classes, and visual
iteration may require touching more local declarations.

**Alternative**: Time-box a NativeWind proof only if the mobile owner demonstrates a clear speed
gain and passes Android development-build, RTL, input, and release-bundle checks before adoption.

**Decision status: PROPOSED**

Sources: [React Native StyleSheet](https://reactnative.dev/docs/stylesheet),
[NativeWind installation](https://www.nativewind.dev/v5/getting-started/installation)

## Arabic, English, and RTL

**Recommendation**: Retain `expo-localization`, `i18next`, and `react-i18next`; keep Arabic as the
default; combine `I18nManager` native direction with logical start/end spacing, locale-aware text
alignment, and explicit directional icons in shared components. Mission results contain both
languages and never regenerate on a locale change.

**Why it helps the MVP**: Judges can switch language without losing journey state, while every
screen remains readable even when native navigation chrome needs an application reload to mirror.

**Main downside**: Runtime global RTL changes are platform-sensitive and need a development build
plus manual Android testing; Expo Go or web does not fully represent the behavior.

**Alternative**: Follow only the device locale and require a restart for every switch, but this is
less effective for a bilingual live demonstration.

**Decision status: PROPOSED**

Sources: [Expo localization API](https://docs.expo.dev/versions/v57.0.0/sdk/localization/),
[Expo localization and RTL guide](https://docs.expo.dev/guides/localization/),
[React Native I18nManager](https://reactnative.dev/docs/i18nmanager)

## Shared state and application use cases

**Recommendation**: Evolve the existing Zustand store into bounded session slices or actions for
mission creation, lifecycle, impact, and reset. Keep lifecycle calculations as small pure
functions; keep isolated form and animation state local to its screen.

**Why it helps the MVP**: One-device role switching needs coherent state across routes, and one
atomic command can prevent duplicate impact while restoring the exact demo baseline reliably.

**Main downside**: A shared store can become difficult to understand if every temporary UI value is
added to it or if screens mutate fields directly.

**Alternative**: React Context with `useReducer`; it removes one dependency but adds provider and
composition ceremony to a foundation that already uses Zustand successfully.

**Decision status: PROPOSED**

Source: [Zustand documentation](https://github.com/pmndrs/zustand/blob/main/docs/index.md)

## Mission form and validation

**Recommendation**: Add React Hook Form, Zod, and the Hook Form Zod resolver for the Create Mission
and Parent Confirmation forms. Keep schemas local and validate only values that can break the demo:
required Child/media, positive bounded quantity with a unit, supported time, and non-empty required
text.

**Why it helps the MVP**: The Parent receives immediate, consistent validation while TypeScript and
the mission-generation contract share the same small input shape.

**Main downside**: Three libraries add dependency and schema ceremony for only two forms.

**Alternative**: Use controlled local state with small validation functions if the final forms stay
short enough that the team finds the libraries slower rather than faster.

**Decision status: PROPOSED**

Sources: [React Hook Form](https://react-hook-form.com/get-started),
[Hook Form resolvers](https://github.com/react-hook-form/resolvers),
[Zod](https://zod.dev/)

## Prepared media first; live capture later

**Recommendation**: Make bundled, team-created image, voice-note, and evidence fixtures the required
path. Use `expo-audio` for prepared playback and only later for user-initiated recording; use
`expo-image-picker` before adding a custom `expo-camera` screen.

**Why it helps the MVP**: The complete story works offline without permission dialogs, noisy rooms,
camera framing, or missing venue connectivity, while official Expo packages leave a small upgrade
path if rehearsal time remains.

**Main downside**: Prepared assets demonstrate the intended interaction rather than proving live
capture or transcription, and the distinction must remain visible.

**Alternative**: Keep prepared assets for the final competition build. Add camera or recording only
if judges materially benefit and the prepared path remains immediately selectable after denial or
failure.

**Decision status: PROPOSED**

Sources: [Expo Audio](https://docs.expo.dev/versions/v57.0.0/sdk/audio/),
[Expo Image Picker](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/),
[Expo Camera](https://docs.expo.dev/versions/v57.0.0/sdk/camera/)

## Ghaf tree visual and growth animation

**Recommendation**: Extend the existing `react-native-svg` tree into six deterministic layered
stages. Use Reanimated only for bounded opacity, scale, translation, and short stroke-reveal motion;
drive stages and unlocks from data rather than animation completion.

**Why it helps the MVP**: The Ghaf remains a reusable hero, progress indicator, emotional anchor,
and demo climax while the same state renders reliably after navigation, reset, or animation skip.

**Main downside**: Creating polished staged artwork takes focused design time, and intricate path
morphing can be fragile on a demo device.

**Alternative**: Use six transparent pre-rendered images. Use a small Lottie sequence only if a
finished team-owned animation already exists; do not build a real-time 3D tree.

**Decision status: PROPOSED**

Sources: [React Native SVG](https://docs.expo.dev/versions/v57.0.0/sdk/svg/),
[React Native Reanimated](https://docs.expo.dev/versions/v57.0.0/sdk/reanimated/)

## Optional OpenAI mission generation

**Recommendation**: Keep `MockAIService` as the acceptance provider. If time permits, bind one
optional remote `AIService` to a server-side proxy that uses the OpenAI Responses API with
Structured Outputs matching the versioned mission JSON schema. Do not choose a live model ID until
the team separately validates current availability, latency, quality, and cost.

**Why it helps the MVP**: A schema-constrained response can demonstrate real transformation without
changing screens or mission state, and the mock response remains an immediate deterministic
fallback.

**Main downside**: Live transcription or generation introduces network, latency, output-quality,
quota, and model-availability risk that is unnecessary for the judging path.

**Alternative**: Ship only a curated template selector keyed by Child age, food scenario, quantity,
and available time. This already communicates the intended product behavior when truthfully labeled
pregenerated.

**Decision status: PROPOSED**

Sources: [OpenAI API authentication](https://developers.openai.com/api/reference/overview#authentication),
[OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

## Optional server-side proxy and storage

**Recommendation**: Require no backend. If the live AI experiment is approved, use one Supabase Edge
Function as the smallest server-side proxy, keep the OpenAI key in project secrets, and return only
the same `ServiceResult<GeneratedMission>` contract. Add Supabase storage only for optional saved
demo media or history after the offline path is complete.

**Why it helps the MVP**: One function prevents an OpenAI secret from entering the mobile bundle and
avoids designing a full application backend, authentication system, or database layer.

**Main downside**: Supabase still adds an account, deployment, secret configuration, network
dependency, and another failure surface for a three-person prototype team.

**Alternative**: Use another small serverless endpoint already controlled by the team, or omit live
AI entirely. Never call OpenAI directly from the mobile app with a secret key.

**Decision status: PROPOSED**

Sources: [Supabase Edge Functions](https://supabase.com/docs/guides/functions),
[Supabase function secrets](https://supabase.com/docs/guides/functions/secrets)

## Prototype-level testing

**Recommendation**: Keep the existing typecheck, lint, format, and Vitest checks; add focused tests
for lifecycle guards, exact-three-step validation, retry-without-award, idempotent approval, tree
thresholds, and reset. Add one complete mock-flow smoke test, then rely on a recorded manual Android
matrix for Arabic, English, RTL, offline behavior, permissions fallback, and the 90-second journey.

**Why it helps the MVP**: The most damaging logic regressions are caught cheaply while visual and
native behavior is verified where judges will actually see it.

**Main downside**: Broad component and end-to-end automation remains intentionally limited, so the
team must rehearse consistently after UI changes.

**Alternative**: Add React Native Testing Library or a single scripted device flow only if a
specific recurring failure justifies its setup cost; do not pursue an arbitrary coverage number.

**Decision status: PROPOSED**

Sources: [Expo unit testing](https://docs.expo.dev/develop/unit-testing/),
[Vitest guide](https://vitest.dev/guide/)

## Android development and preview build

**Recommendation**: Iterate with an Expo development build on the named Android demo device, then
produce one internal-distribution preview APK that launches without Metro. Keep package and bundle
identifiers marked provisional until the team intentionally finalizes them.

**Why it helps the MVP**: The development build exposes real RTL and native media behavior, while an
installable APK is more reliable for rehearsal and competition day than a laptop-dependent session.

**Main downside**: Native rebuilds and EAS signing/account setup take time, especially after adding
new native packages.

**Alternative**: Use `npx expo run:android` for local iteration, but still create and rehearse an
installable offline build before the event.

**Decision status: PROPOSED**

Sources: [Android development build](https://docs.expo.dev/tutorial/eas/android-development-build/),
[internal distribution](https://docs.expo.dev/tutorial/eas/internal-distribution-builds/),
[APK build configuration](https://docs.expo.dev/build-reference/apk/)

## Research Outcome

No technical unknown remains blocking for task generation. Team choices about media scope, Ghaf
thresholds, optional live AI, the primary device, and integration ownership are review decisions,
not reasons to delay planning. The acceptance architecture remains fully local and deterministic.
