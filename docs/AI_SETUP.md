# AI feature setup

Ghaf's deterministic `MockAIService` remains the default and the offline acceptance provider. The
AI-only extension adds:

- structured live mission generation;
- an age-adaptive bilingual Ghaf Coach service for ages 6–8, 9–11, and 12–14;
- Parent AI/voice permission validation;
- Arabic-English code-switch detection;
- food-safety, medical/religious-ruling, private-data, and unrelated-chat boundaries;
- a timeout-bounded remote adapter with deterministic fallback.

No AI UI, recording, transcription, authentication, or background capture is implemented.

## Optional free provider

The included Cloudflare Worker uses Workers AI, which currently offers a free daily allocation.
Deploy it as described in `workers/ghaf-ai/README.md`, then set:

```text
EXPO_PUBLIC_GHAF_AI_GATEWAY_URL=https://your-worker.workers.dev
```

Restart Expo after changing the environment. Leave the variable empty to force deterministic mock
mode. Provider credentials stay in Cloudflare's binding; the mobile bundle contains only the
public Worker URL.

The live endpoint is optional and prototype-only. Live output is locally schema-validated, and any
network, timeout, quota, malformed-output, or safety failure returns to the prepared mock path.

## Verification record — 2026-09-01

- `npm run typecheck`: **PASSED**
- `npm run lint`: **PASSED**
- `npm test`: **PASSED** — 6 files, 39 tests
- Focused AI/mission/fallback tests: **PASSED** — 3 files, 21 tests
- Cloudflare Worker standalone TypeScript check: **PASSED**
- Modified-file Prettier check: **PASSED**
- Repository-wide `npm run format:check`: **FAILED** on 36 pre-existing files outside this AI-only
  write boundary; those UI/component/config files were intentionally not modified
- Live Worker deployment and live model call: **NOT RUN** — requires a team Cloudflare account
- Physical push-to-talk, transcript, replay, captions, and slow-playback review: **NOT RUN** — the
  user requested no UI changes, and recording/transcription remain outside this implementation
