# Quickstart: Validate Bounded Live AI Drafting and Coach

This guide validates default-off implementation with synthetic fixtures and fake adapters. It does
not authorize or prove a deployed provider, real Child data/audio, production authentication,
legal compliance, physical Android acceptance, or release activation.

## 1. Prerequisites

- Node.js 22.13+
- Clean install from the committed lockfile
- No provider credentials in the shell, Expo public configuration, source, or test fixtures
- Feature 004 flags omitted or explicitly false for baseline checks

```bash
npm ci
```

## 2. Confirm the deterministic baseline

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npx expo install --check
```

Expected:

- All three Feature 004 flags resolve false.
- Existing Parent Guide, Child Coach, synthetic voice, reset, task, reward, Garden, Circle, League,
  badges, and learning tests pass.
- No Feature 004 remote adapter receives a call.
- Current Feature 003 screens and routes remain available.

## 3. Run focused contract tests

```bash
npx vitest run \
  tests/bounded-ai-feature-flags.test.ts \
  tests/parent-task-drafting.test.ts \
  tests/live-child-coach.test.ts \
  tests/live-voice-capture.test.ts \
  tests/bounded-ai-gateway.test.ts \
  tests/bounded-ai-integration.test.tsx
```

Expected:

- Strict V1 schemas reject unknown/missing/wrong-version fields.
- F4 mapper retains every non-copy task authority field.
- Ages 6–8 expose intents only, 9–11 structured input only, and 12–14 bounded text/voice transcript
  only with separate grants.
- Every Child response is terminal and has zero progression/reward effects.
- Voice capture state stops and clears on delete, background, revoke, route exit, sign-out, reset,
  interruption, timeout, and failure.
- Gateway tests use fake AI/transcription, capability, replay, and rate bindings only.

## 4. F4 synthetic Parent drafting scenario

1. Enter the synthetic Parent experience and open Task Builder.
2. Select Salem and the reviewed recycling task.
3. Enable only the F4 flag in the test harness; inject a fake live drafting service.
4. Request **Make clearer**.
5. Inspect the retained-versus-suggested bilingual diff and origin label.
6. Choose **Keep mine**, then repeat and choose **Use suggestion**.
7. Continue through existing review and separate Parent approval.
8. Repeat with timeout, malformed output, and network denial.

Expected:

- Only title/action/rationale/steps can differ.
- Reward, safety, category, landscape, evidence, visibility, recognition, recurrence, Circle, League,
  Family Reward, and every growth authority remain identical to the reviewed template.
- Failure produces the same-attempt prepared suggestion.
- No suggestion assigns or confirms a task.

## 5. F5 synthetic Child text scenarios

Use pure-policy/component harnesses for all three bands; the current P0 household does not add a
new 12–14 profile.

### Ages 6–8

- Confirm there is no text or microphone control.
- Submit each curated intent.
- Attempt unknown fields/text/voice and confirm pre-network rejection.

### Ages 9–11

- Confirm only exact support choices and optional step ordinal appear.
- Submit one current approved-task intent.
- Attempt free text, contact data, or stale task binding and confirm rejection/fallback.

### Ages 12–14

- Use a synthetic test profile/grant without persisting it into the P0 household.
- Submit bounded typed text at scalar/byte boundaries.
- Exercise URL/contact/secret/sensitive/crisis/adversarial cases.
- Confirm a reviewed voice transcript follows the same text policy.

Expected for all:

- AI disclosure and **Ask an adult** are local, always available, and bilingual.
- One terminal card is displayed with no reply composer, history, or continuation.
- Unsafe/sensitive input terminates locally without probing.
- Timeout/failure uses the prepared result.
- No task/reward/growth/social state changes.

## 6. Voice synthetic/native-adapter scenario

Implementation automation uses a fake recorder, fake file cleanup, and fake transcriber. Real
microphone/provider evidence remains blocked.

1. Confirm no voice control for ages 6–11, missing grant, disabled flag, or inactive task.
2. For a synthetic ages-12–14 harness, enable the text and voice grants and voice flag.
3. Deny permission; confirm no capture/transcription and a non-pressuring text/prepared fallback.
4. Grant permission, hold push-to-talk, and release; confirm one recording stops.
5. Return a fake transcript; confirm it is displayed but not sent.
6. Delete; confirm fake local/provider cleanup and zero Coach calls.
7. Repeat, explicitly send, and confirm the Coach receives bounded text only.
8. Exercise app background, interruption, process death simulation, task/profile/grant change,
   sign-out, reset, duration/size breach, timeout, low-confidence/unusable transcript, and cleanup
   failure.

Expected:

- No continuous/background capture or automatic restart/send.
- No raw audio reaches Coach state, generation requests, logs, analytics, crash output, or storage.
- Cleanup failure blocks transcript send and remains an explicit failed evidence state.
- Prepared Coach remains usable.

## 7. Gateway fake-binding scenario

The Worker must not be deployed for this validation.

```bash
npx vitest run tests/bounded-ai-gateway.test.ts
```

Expected:

- Missing/expired/wrong issuer/audience/scope/role/grant/notice/synthetic claims stop before body
  parsing, rate use, catalog lookup, or inference.
- Replayed `jti`, disallowed origin, method/content-type/body breach, and rate/concurrency/budget
  limits stop before inference.
- F4 and F5 text use separate route policies and strict response validation.
- Voice remeasures duration/bytes, returns transcript text only, and exercises deletion failure.
- Error envelopes contain no canary input, audio, transcript, credential, URI, or stack content.

## 8. Reset and zero-effects scenario

Capture a before-snapshot of task lifecycle, Seeds, landscapes, canopy, Circle, League, Family
Reward, badges, learning, and current profile. Exercise each F4/F5 success/fallback/error, then
compare the snapshot. Only an explicitly accepted F4 copy may alter allowed draft wording. Run the
one-action reset from every pending/result/voice state.

Expected:

- Zero unauthorized differences.
- Pending requests are invalidated.
- Audio/transcript cleanup is attempted without blocking reset.
- Signed-out Arabic-first initial state matches the existing canonical reset.

## 9. Export and static safety checks

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npx expo install --check
npx expo export --platform web --output-dir dist
npx expo export --platform android --output-dir /tmp/ghaf-feature-004-android
git diff --check
python /home/smyk/.codex/skills/security/security-compliance/scripts/secret_scan.py . --json --output /tmp/ghaf-feature-004-secrets.json
```

Record exact counts and results. Do not commit `dist`, `/tmp` output, secrets reports, Worker cache,
`.dev.vars`, real audio, or provider artifacts.

## 10. Evidence status after source implementation

| Gate                                      | Expected status                                |
| ----------------------------------------- | ---------------------------------------------- |
| Contract/unit/store/component tests       | `PASSED` only with exact output                |
| Fake Worker/provider tests                | `PASSED` only with exact output                |
| Flags-off deterministic regression        | `PASSED` only with exact output                |
| Trusted token broker/deployed auth        | `BLOCKED / NOT RUN`                            |
| Provider retention/ZDR/region/deletion    | `BLOCKED / NOT RUN`                            |
| Real-network/provider outage              | `NOT RUN`                                      |
| Privacy/legal and safeguarding review     | `BLOCKED / NOT RUN`                            |
| Arabic/UAE and accessibility human review | `NOT RUN`                                      |
| Physical Android voice/RTL/TalkBack       | `BLOCKED / NOT RUN` without named device/build |
| Real Child data/audio                     | `PROHIBITED`                                   |
| Deployment/live flags/release activation  | `BLOCKED`                                      |
