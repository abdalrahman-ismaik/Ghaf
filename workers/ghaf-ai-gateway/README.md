# Ghaf bounded AI reference gateway

This directory is a default-off implementation and fake-provider test boundary for Feature 004.
It is not deployable or approved for real Parent/Child content. The gateway authenticates one
exact-scope, five-minute synthetic capability before reading a request body. The Parent task-draft
and Child text handlers are implemented with fake-model tests. The separate voice route is also
implemented for bounded synthetic multipart tests, remeasures the complete request and audio,
returns text only after in-memory audio cleanup, and remains outside MCP.

The Expo app does not mint capability tokens and contains no gateway/provider secret. A future
trusted broker must issue the exact signed claims. The in-memory replay store exists only for local
single-process tests; release requires an approved atomic shared replay and daily/concurrency
budget implementation.

Do not deploy or call a real provider from this repository state. Activation remains blocked on
the authorization, provider/retention, privacy/legal, safeguarding, Arabic/UAE, accessibility,
incident, physical Android, deletion, and human-rehearsal evidence listed in the Feature 004
approval packet.

## Minimal MCP projection

The same Worker may expose `POST /mcp` only when the server-side `MCP_ENABLED` value is exactly
`true` and `MCP_ALLOWED_HOST` names the exact expected host. It defaults off and returns a safe
not-found response when omitted or false. The Expo app never imports the MCP package or calls this
route, and the normal competition journey never asks judges to configure a client.

The local endpoint implements the MCP 2026-07-28 stateless Streamable HTTP revision through the
pinned official TypeScript server SDK and rejects legacy traffic. It advertises exactly two
read-only tools:

- `draft_parent_task` projects `draft_parent_task_v1`.
- `coach_current_task` projects `coach_approved_task_v1`.

Tool calls require the same short-lived, exact-scope synthetic capability as the matching HTTPS
operation and reuse its operation function, strict schemas, capacity policy, timeout, output
validation, and safe error mapping. Content-free discovery is available only while MCP is enabled.
There are no MCP voice/media tools, resources, prompts, sampling, roots, tasks, apps, accounts,
state mutation, or persistence.

Run the fake-boundary evidence without a deployment or provider credential:

```bash
npx vitest run tests/bounded-ai-mcp.test.ts tests/gateway-parent-task-drafting.test.ts tests/gateway-child-coach.test.ts tests/gateway-voice-transcription.test.ts tests/bounded-ai-gateway-security.test.ts
```

Passing this suite proves only local transport and parity behavior with synthetic fixtures. It is
not provider, public-hosting, OAuth, real Child data, production security, or release evidence.

## Optional Gemini text adapter — Feature 019

The Worker has a server-only `generateContent` adapter for the existing Parent draft and
Child text operations. The server variable `TEXT_AI_PROVIDER=gemini` selects it explicitly.
Omitting that variable, or setting `workers_ai`, keeps the existing Workers AI implementation;
unknown values fail closed. Voice transcription is unchanged. This source addition enables no
mobile live flags, deployment or provider call.

Configuration for a later authorized synthetic integration:

- Store `GEMINI_API_KEY` as a Worker secret, never an Expo public variable, URL parameter or file
  committed to Git. Supply it only to the trusted server deployment through its secret manager.
- Set server `GEMINI_MODEL` to the exact provider model ID selected and verified by the operator.
  There is no default model and no discovery request. Supply the bare ID, without `models/`,
  slashes, a URL or query parameters. Model/API availability is an outstanding service check.
- Set server `TEXT_AI_PROVIDER=gemini`. Keep the existing trusted capability issuer, audience,
  HMAC secret, shared replay/budget stores and operation rate limits; model selection is not
  authentication. The missing trusted broker and activation evidence remain blockers.
- Keep `EXPO_PUBLIC_GHAF_AI_PARENT_TASK_DRAFTING_LIVE`,
  `EXPO_PUBLIC_GHAF_AI_CHILD_COACH_TEXT_LIVE` and
  `EXPO_PUBLIC_GHAF_AI_CHILD_COACH_VOICE_LIVE` false until their separate release gates pass.

Requests use the fixed `https://generativelanguage.googleapis.com/v1beta/models/` origin,
`x-goog-api-key` header and `generationConfig.responseMimeType`/`responseJsonSchema` documented
by the [generateContent API reference](https://ai.google.dev/api/generate-content).
The [structured-output guide](https://ai.google.dev/gemini-api/docs/generate-content/structured-output?hl=en)
also shows the newer `responseFormat.text` syntax; this adapter deliberately uses the still
documented reference fields. Google currently labels this API family legacy. Verify the chosen
model with this exact request shape before claiming provider compatibility.

The existing reviewed prompts and schema are reused. Gemini's provider-schema projection omits
unsupported string-length hints and boolean enums; the complete Ghaf output validators still
enforce lengths, terminal output, correlation, age policy and content restrictions. No tools,
grounding, cached conversations, media or automatic provider fallback are added. Redirects are
rejected. One STOP candidate containing only text parts is accepted; blocked, truncated,
multiple-candidate, tool/media/thought, malformed or oversized output is rejected. Response
consumption is stream-measured up to 64 KiB and shares the existing 2.2-second Parent or
1.5-second Child deadline. Timeouts abort transport/body reading. Errors contain no provider
body, key or prompt, and the adapter adds no content logging.

`npx vitest run tests/gateway/gemini-provider.test.ts` exercises synthetic fetch responses,
timeouts, response limits, real operation validation and missing-authorization denial. It
does not establish a live Gemini response, provider retention, selected-model compatibility,
deployment, native behavior or permission to submit Child content. Existing gateway/MCP
security tests remain required alongside it. Live verification is **NOT RUN**.
