# Prototype Limitations

## Repository Status

> Ghaf is an MVP Prototype for competition evaluation. It is designed to demonstrate the product concept, core interactions, AI value, cultural identity, visual quality, and sustainability impact. It is not intended to demonstrate production infrastructure, regulatory compliance, financial integration, large-scale security, or store-ready deployment.

**Project:** Ghaf — غاف

**Stage:** MVP Prototype

**Purpose:** SMAC 2026 competition demo

**Production-ready:** No

The repository contains one Expo application, one synthetic family, one Parent, one Child, ten
approved screens, five replaceable service contracts, deterministic local mocks, and a resettable
competition journey. Feature 002 implementation is locally complete; physical Android and human
rehearsal acceptance remain open.

## Exact Approved Screen Scope

```text
/
/role
/parent
/parent/create
/parent/generating
/parent/review
/child
/child/mission
/parent/confirmation
/celebration
```

Expo also generates `_sitemap` and `+not-found`; they are framework built-ins, not product screens.
No additional product route is approved.

## Capability Boundaries

### Real in this MVP

- navigation across the ten approved screens;
- Arabic/English switching and locale-aware RTL/LTR layout;
- one-device Parent/Child role switching, clearly labeled as a shortcut;
- mission input selection, bounded quantity/time/reward validation, and edit recovery;
- four visible processing stages;
- bilingual Parent review and explicit assignment approval;
- Child narration control, three interactive steps, prepared evidence or Parent confirmation, and
  required reflection;
- Parent retry, bounded estimated-quantity confirmation, and idempotent completion;
- local impact totals, six-stage Ghaf progression, deterministic growth motion, milestone, and
  one-action reset.

These interactions passed focused tests and five browser journeys. Native Android behavior remains
`BLOCKED`, not inferred from web evidence.

### Prepared and synthetic

- `food-rescue-bread.jpg` and `child-evidence.jpg` are generated, metadata-stripped demo images;
- four Arabic/English MP3 files are synthetic text-to-speech, not recordings of real people;
- transcripts, durations, and media IDs are declared in `src/features/missions/demoContent.ts`;
- Metro's static asset references live behind one media-ID resolver;
- no prepared asset contains a child, face, personal information, brand, or food-safety verdict.

Prepared playback is implemented with `expo-audio`. The app requests no microphone or Android
recording permission and enables neither background recording nor background playback. Native
playback is not marked passed until the physical phone is tested.

### Mocked, simulated, and pregenerated

- `MockMissionService`, `MockMediaService`, `MockAIService`, `MockImpactService`, and
  `MockPrototypeSessionService` provide the required path;
- visible AI processing is a timed local simulation;
- the structured bilingual mission is curated and pregenerated, then adjusted deterministically to
  the entered quantity, time, and optional symbolic reward;
- transcription, image interpretation, evidence judgment, notifications, authentication, and
  persistence do not occur;
- impact is a Parent-entered estimate, not a sensor, scale, or computer-vision result.

Mock, prepared, simulated, pregenerated, and estimated states are labeled in the interface. The
complete required journey makes no remote API call.

### Seeded reset state

- Arabic/RTL, Parent, mock mode;
- an empty ready-to-create mission draft and no assignment/submission/celebration;
- one synthetic family and Salem, age range 8–10;
- 1,250 rescued grams, 5 rescued portions, 3 completed missions, and a 2-day streak;
- Ghaf stage 2 (Sapling) at 48%;
- prepared media and one unassigned pregenerated mission still available.

### Optional later—only after the Android mock gate passes

- one minimal server-side proxy for voice transcription and structured mission generation;
- visible-action audio recording;
- image picker or camera capture;
- small local persistence or Supabase storage;
- saved mission history.

Any optional adapter must preserve the current contracts and deterministic offline fallback. An
OpenAI secret belongs only on a server-side proxy, never in the mobile application or repository.

### Explicit future work

- production registration, authentication, child accounts, permissions, and password recovery;
- production privacy controls, compliance programs, or legal claims;
- multiple families, schools, administration, and tenancy;
- banking, cards, real financial rewards, marketplace, or social feed;
- scalable backend, monitoring, deployment automation, store signing, or release;
- accurate image-based food weighing, food-safety assessment, or unrestricted Child chat.

These are intentionally out of scope, not missing competition deliverables.

## Minimum Safeguards

1. Never commit API keys or place an OpenAI secret in the mobile application.
2. Use only synthetic/team-created demonstration data; no real child data.
3. Recording, if later approved, starts only after a visible microphone action and never runs in
   the background.
4. Ghaf never claims to decide whether food is safe to eat; a Parent decides what is suitable.
5. Parent review and approval remain part of the journey.
6. Never call this prototype production-ready or legally compliant.

These safeguards do not create a threat-modeling, incident-response, compliance, retention,
enterprise-secret, or penetration-testing workstream.

## Current Technical Limitations

- Session state is in memory; a browser/app reload restores the initial session.
- Native global direction changes may require an app reopen; screen-level direction updates
  immediately.
- Web static export has no offline service worker. Its visible text fallback keeps the journey
  usable if an audio file was not cached before network disablement.
- Android launch, native media playback, keyboard behavior, RTL, touch, reduced motion, and Back
  handling await a named physical-device rehearsal.
- The Ghaf tree is a deterministic layered SVG with six discrete stages, not a biological model or
  real-time 3D experience.
- The Golden Ghaf Leaf is symbolic and has no monetary value.
- Android package and iOS bundle identifiers are provisional.
- The focused 32-test suite protects demo logic; it is intentionally not a production regression
  program.
- iOS and web are secondary development surfaces.

## Scope Audit — 2026-08-22

| Audit                                                                  | Result                                                               |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Exactly ten authored product routes                                    | PASSED                                                               |
| Arabic/English resource parity                                         | PASSED — 279 / 279 leaf keys                                         |
| Synthetic-only family/media data                                       | PASSED                                                               |
| Secret-pattern scan                                                    | PASSED                                                               |
| Legacy product-brand scan                                              | PASSED; Arabic `أثر` appears only with its ordinary meaning “impact” |
| No network client or production backend in `app/` or `src/`            | PASSED                                                               |
| No banking, payment, marketplace, social feed, or unrestricted chatbot | PASSED                                                               |
| Honest mock/prepared/simulated/estimated labels                        | PASSED                                                               |
| No microphone/recording/background-audio permission                    | PASSED                                                               |
| Physical Android evidence                                              | BLOCKED                                                              |
| Human 75–105-second and three-person review                            | NOT RUN                                                              |

During the pitch, say: the interaction and product concept are real; AI processing, transcription,
image understanding, evidence judgment, and persistence are deliberately mocked or pregenerated
for a reliable MVP Prototype.
