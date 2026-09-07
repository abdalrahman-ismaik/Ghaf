# Research: Bounded Live AI Drafting and Coach

**Date**: 2026-09-07

All implementation decisions below preserve the approved default-off, synthetic-only development
boundary. Provider, region, retention/ZDR, legal, safeguarding, Arabic, physical Android, and
release decisions remain evidence gates rather than inferred approvals.

## Decision 1 — Extend current contracts; do not import Feature 002

**Decision**: Introduce additive Feature 004 DTOs and services over the current `TaskTemplate`,
service registry, Zustand command, access, and deterministic fallback seams.

**Rationale**: Feature 002's mission object delegated reward, evidence, impact, and personalization
to the model and used a broader free-text Child operation. Current Feature 003 already owns the
reviewed task lifecycle, task authority fields, safety policy, profile isolation, reset, and
prepared providers.

**Alternatives considered**:

- Cherry-pick `GatewayAIService`: rejected because its request/response model and auth/CORS/body
  boundaries are obsolete.
- Replace `ParentGuideService`: rejected because F4 is broader task drafting and must not loosen
  the exact P0 Parent Guide fixture validator.
- Create a second app/store: rejected because it would duplicate authority and break the single
  deterministic journey.

## Decision 2 — Copy-only Parent drafting

**Decision**: Permit the model to return only bilingual title, positive action, rationale, one to
four steps, and an advisory support cue. Use a deterministic mapper over an immutable authority
snapshot from one reviewed archetype.

**Rationale**: The user-visible value is clearer, age-adapted task wording. Category, safety,
supervision, reward, evidence, visibility, routine phase, recognition, Circle, League, Family
Reward, and growth eligibility are product authorities and do not require generative discretion.

**Alternatives considered**:

- Generate an entire task: rejected because schema validity cannot prove product-policy safety.
- Generate only from current Parent free text: rejected because the approved first slice uses
  curated fields and no family free text across the network.
- Auto-accept a valid draft: rejected because Parent review is a product invariant.

## Decision 3 — Independent public flags are presentation controls only

**Decision**: Add three exact booleans that default false. A flag can expose an optional action but
cannot create remote authorization or make an adapter available.

**Rationale**: An Expo bundle is user-controlled. Server authorization must independently validate
a short-lived capability. Separating the flags preserves granular rollback and ensures F4 does not
implicitly enable either Child capability.

**Alternatives considered**:

- One `live_ai` flag: rejected because Parent text, Child text, and Child audio have different risk
  and rollback boundaries.
- Treat an environment value as authorization: rejected because public mobile configuration is
  neither secret nor authenticated.

## Decision 4 — Blocked token source in the default app

**Decision**: Define a `CapabilityTokenProvider` interface and a default implementation that
returns no credential. Remote adapters require injected short-lived tokens. The reference Worker
validates issuer, audience, exact operation scope, role, subject, grant/notice version, expiry, and
single-use `jti` before parsing or inference.

**Rationale**: The repository has only synthetic access and no trusted token broker. A static
distributed credential would be extractable and cannot establish Parent/Child authority.

**Alternatives considered**:

- Reuse `GHAF_DEMO_ACCESS_TOKEN` in the mobile app: rejected; it is appropriate only for the
  historical synthetic Parent reference test and cannot authorize Child data.
- Build production accounts now: rejected by the constitution and Feature 004 activation boundary.
- Omit the live adapter until auth exists: rejected because provider-neutral integration and
  fake-boundary testing are approved and valuable without activation.

## Decision 5 — One-turn age-discriminated Child schemas

**Decision**: Use a discriminated union: ages 6–8 select curated intents only; ages 9–11 use exact
structured choices; ages 12–14 may add bounded text or a reviewed voice transcript. All produce one
terminal result with no continuation, memory, tools, browsing, retrieval, or history.

**Rationale**: This applies the approved age policy at the schema boundary rather than depending
only on UI. It sharply reduces data collection and prompt-injection surface.

**Alternatives considered**:

- A universal free-text composer: rejected by the approved Child-safety contract.
- A multi-turn transcript: rejected because it encourages relationship/continuation behavior and
  expands retention and stale-context risk.
- Send full custom tasks: rejected until separate minimization/PII review; initial context is a
  server-owned reviewed catalog.

## Decision 6 — Local deterministic prefilter and post-validation

**Decision**: Normalize and reject prohibited/sensitive/contact/URL/secret/crisis/adversarial input
before network. Revalidate every structured provider response locally and route failures to one
reviewed deterministic terminal result without probing.

**Rationale**: Provider filters are defense-in-depth, not the product policy. Local termination
reduces unnecessary Child-data transfer and makes offline behavior identical.

**Alternatives considered**:

- Send flagged text to the model to ask whether it is safe: rejected because that exports content
  the local policy already knows must not enter generation.
- Retry/repair invalid model output: rejected because it adds cost, latency, nondeterminism, and a
  second exposure. One call then prepared fallback is the approved rule.

## Decision 7 — Expo Audio foreground capture with background disabled

**Decision**: Use the existing Expo Audio package with `enableBackgroundRecording: false`, a held
push-to-talk control, `allowsRecording: true`, a 15-second hard stop, and stop/cleanup on release,
route exit, app background, interruption, revocation, sign-out, and reset. Record into cache only.

**Rationale**: Expo documents that its recorder saves native recordings to the app cache by
default and that background recording requires an explicit config option and additional Android
foreground-service permissions. Keeping that option false supports the approved foreground-only
boundary. The native interface still requires direct physical Android evidence before activation.

**Alternatives considered**:

- Enable background recording and stop opportunistically: rejected because the platform would be
  permitted to continue capture.
- Use a custom native recorder: rejected because Expo Audio already matches the project stack.
- Treat the existing synthetic voice controller as real capture: rejected because it performs no
  recording or transcription and must remain honestly labeled.

**Primary source**: [Expo Audio documentation](https://docs.expo.dev/versions/latest/sdk/audio/)

## Decision 8 — Add Expo FileSystem for explicit deletion

**Decision**: Add the Expo-SDK-compatible `expo-file-system` package and wrap `File.delete()` behind
a small cleanup adapter. Delete cache audio after transcript delivery and on every cancel/failure/
stale/reset boundary.

**Rationale**: Expo Audio exposes the recording URI but no deletion operation. OS cache eviction is
not deterministic deletion. Expo FileSystem is the platform-aligned module and documents direct
`File.delete()` support.

**Alternatives considered**:

- Wait for the OS to evict cache: rejected because it cannot prove delete-before-send or reset.
- Persist in the document directory: rejected because it increases retention.
- Add a general third-party filesystem library: rejected as unnecessary overlap.

**Primary source**: [Expo FileSystem documentation](https://docs.expo.dev/versions/latest/sdk/filesystem/)

## Decision 8A — Use Expo Crypto for correlation identifiers

**Decision**: Add the Expo-SDK-compatible `expo-crypto` package and create each request ID and
binding nonce with `Crypto.randomUUID()` at the explicit user action.

**Rationale**: The approved boundary requires fresh random 128-bit URL-safe correlation values.
The existing app had no cross-platform cryptographic random-ID dependency; timestamps, counters,
and `Math.random()` would weaken the contract.

**Alternatives considered**:

- Combine a timestamp and counter: rejected because it is predictable and not 128-bit random.
- Use `Math.random()`: rejected because it is not a cryptographic source.
- Mint request IDs in the gateway: rejected because the app needs a local stale-request binding
  before sending the request.

**Primary source**: [Expo Crypto documentation](https://docs.expo.dev/versions/latest/sdk/crypto/)

## Decision 9 — Separate transcription from Coach generation

**Decision**: A `VoiceTranscriptionService` receives one bounded ephemeral clip and returns
transcript text. The Child must review/delete/edit and explicitly send it. Only text then enters
the same 12–14 Child Coach request schema.

**Rationale**: This prevents raw audio from entering the generation model, avoids automatic
recording-to-chat behavior, and provides a meaningful consent/deletion checkpoint.

**Alternatives considered**:

- Stream audio directly into a realtime conversation: rejected as continuous/open conversation.
- Automatically call the Coach after transcription: rejected because the Child must see and
  control the data before send.
- Retain audio for replay: rejected; the existing prepared rehearsal already covers replay without
  retaining real Child voice.

## Decision 10 — Reference Cloudflare Workers AI adapters remain non-deployed

**Decision**: Use one new Feature 004 Worker directory with operation-specific routes and policies.
Workers AI binding calls are behind fake test bindings. Text calls request JSON mode and still
undergo strict Zod/policy validation. The transcription adapter targets a configurable automatic
speech-recognition model but is not activated or called.

**Rationale**: Cloudflare documents `env.AI.run()` bindings, JSON-mode schema requests, and hosted
Whisper-family speech-recognition models. Cloudflare also warns that JSON mode cannot guarantee
schema compliance, so local validation and fallback remain mandatory. A new Worker avoids widening
the tested Parent-only P0 gateway.

**Alternatives considered**:

- Extend `workers/ghaf-parent-guide`: rejected because its explicit regression contract denies
  Child/media routes.
- Add a provider SDK to Expo: rejected because provider credentials and policy belong server-side.
- Deploy during implementation: rejected because provider, auth, retention/ZDR, legal, and release
  gates are not passed.

**Primary sources**:

- [Cloudflare Workers AI bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/)
- [Cloudflare Workers AI JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/)
- [Cloudflare Whisper Large V3 Turbo model](https://developers.cloudflare.com/workers-ai/models/whisper-large-v3-turbo/)

## Decision 11 — No-content operational evidence

**Decision**: Runtime code emits typed outcome categories only. Tests use unique canary values and
assert that names, raw input, responses, audio, transcript drafts, credentials, and task text do
not appear in logs/errors/configuration. No analytics or production logging system is added.

**Rationale**: The prototype needs evidence that controls execute but does not need a new telemetry
pipeline. Content logging would conflict with the minimization and deletion contract.

**Alternatives considered**:

- Log prompts/responses for debugging: rejected due Child/family data exposure.
- Add a production observability service: rejected by MVP scope.
- Record nothing: rejected because rate, auth, deletion, fallback, and incident controls need a
  minimal testable event taxonomy.

## Decision 12 — Implementation evidence is not activation evidence

**Decision**: Automated tests may prove contracts, fake gateways, state isolation, UI gating,
fallback, and source configuration. They cannot pass provider retention, real-network, legal,
safeguarding, Arabic human review, accessibility human review, physical Android, real-audio
deletion, incident staffing, deployment, or release activation.

**Rationale**: These depend on external systems, people, policies, or a named native build/device.
Truthful evidence states are a constitutional requirement.

**Alternatives considered**:

- Infer native/provider behavior from source: rejected because it would overclaim readiness.
- Use real Child recordings to validate quality: rejected; only adult/team-created synthetic voice
  fixtures may be used even after a provider sandbox is approved.
