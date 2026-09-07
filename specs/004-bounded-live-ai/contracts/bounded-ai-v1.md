# Contract: Bounded AI V1

**Status**: Approved for default-off implementation and fake-provider testing

**Not authorized**: Deployment, real provider execution, real Child content/audio, or release
activation

Every JSON object is closed: unknown keys are invalid. Every response uses `Cache-Control:
no-store`. Authentication and authorization happen before body parsing, rate consumption beyond
the auth bucket, catalog lookup, or inference. Error bodies never echo request content.

## Common transport

### Request headers

```text
Authorization: Bearer <short-lived exact-scope capability>
Accept: application/json
Content-Type: application/json; charset=utf-8
```

Voice transcription uses a bounded binary/multipart content type selected during implementation;
it never accepts JSON-embedded base64 audio.

### Success envelope

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "operation": "operation_literal",
    "schemaVersion": "1.0",
    "origin": "live"
  }
}
```

Provider name/model, token claims, subject, rate state, raw output, reasoning, and storage metadata
are not returned to the mobile client.

### Error envelope

```json
{
  "ok": false,
  "error": {
    "code": "SAFE_ENUM",
    "retryable": false,
    "fallbackAvailable": true
  }
}
```

Allowed error codes:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `REPLAYED`
- `ORIGIN_DENIED`
- `METHOD_NOT_ALLOWED`
- `UNSUPPORTED_MEDIA_TYPE`
- `BODY_TOO_LARGE`
- `RATE_LIMITED`
- `BUDGET_BLOCKED`
- `INVALID_INPUT`
- `SAFETY_REJECTED`
- `TIMEOUT`
- `REMOTE_UNAVAILABLE`
- `INVALID_RESPONSE`
- `AUDIO_DELETION_FAILED`

No endpoint automatically retries or asks a model to repair output.

## Server-only MCP transport

`POST /mcp` is an optional server-only projection behind a switch that defaults false. It uses the
pinned official SDK's current stateless Streamable HTTP revision and rejects legacy
initialization/session behavior. The Expo app never imports the MCP SDK or calls this route, and
judges do not configure an MCP client.

While enabled, content-free discovery exposes exactly these tools:

| Tool name            | Exact operation scope    | Arguments                      | Structured result           |
| -------------------- | ------------------------ | ------------------------------ | --------------------------- |
| `draft_parent_task`  | `draft_parent_task_v1`   | F4 request envelope            | F4 data response            |
| `coach_current_task` | `coach_approved_task_v1` | F5 Child text request envelope | F5 Child text data response |

Both tools declare read-only, non-destructive, and closed-world hints. No voice/media tool,
resource, prompt, sampling, root, task, app, account, Garden, League, reward, persistence, or other
capability exists.

Every tool call requires the same short-lived bearer capability as its HTTPS operation. The
Worker maps the `Mcp-Name` routing header to an exact operation and completes origin, method,
protocol, token, role, scope, and replay checks before the SDK parses arguments. The strict parsed
request must then match the capability's subject/grant boundary before any AI binding is called;
rate, concurrency, and budget controls also pass before inference. Missing/wrong routing metadata,
unknown tools, unknown arguments, legacy requests, and scope mismatches fail closed with no echoed
content.

The MCP callbacks invoke the same operation functions, strict schemas, server-owned context,
provider limits, timeout, post-validation, and safe error mapping as HTTPS. Results contain the
existing DTO in `structuredContent` plus a short non-sensitive `text` content item. The adapter
owns no prompt, retry, provider policy, persistent state, or business authority. Disabling it
returns a safe not-found response and does not alter HTTPS or prepared fallback behavior.

## Capability token contract

Reference implementation tokens are HMAC-signed compact claims for fake-boundary testing. They are
not minted by the Expo app. A future trusted broker may replace the format while preserving claims.

```json
{
  "iss": "configured-exact-issuer",
  "aud": "ghaf-bounded-ai-gateway",
  "sub": "opaque-subject",
  "tenant": "opaque-household",
  "role": "parent",
  "scope": "draft_parent_task_v1",
  "grantVersion": null,
  "noticeVersion": null,
  "iat": 1788768000,
  "exp": 1788768300,
  "jti": "single-use-random-value",
  "synthetic": true
}
```

Child text and transcription require role `child`, an opaque profile subject, and positive exact
`grantVersion`/`noticeVersion`. Maximum lifetime is five minutes. Tokens with unknown claims,
future issue time beyond clock skew, wrong issuer/audience/role/scope, non-synthetic implementation
marker, expired time, or reused `jti` are rejected before operation parsing/inference.

## F4 Parent task drafting

### Endpoint

`POST /v1/parent-task-drafts`

### Limits

- 8 KiB actual UTF-8 body
- 2.5-second client deadline / 2.2-second gateway-provider deadline
- 6 requests/minute/subject
- 30 requests/day/household
- 2 concurrent requests/household
- scope `draft_parent_task_v1`, role `parent`

### Request envelope

```json
{
  "operation": "draft_parent_task_v1",
  "request": {
    "operation": "draft_parent_task_v1",
    "schemaVersion": "1.0",
    "requestId": "random-request-id",
    "bindingNonce": "random-binding-nonce",
    "localeSet": "ar_en",
    "ageBand": "9_11",
    "archetypeId": "task_recycling_p0_v1",
    "catalogVersion": 1,
    "intent": "make_clearer",
    "effortBand": "ten_fifteen",
    "stepCount": 3,
    "supportMode": "short_steps"
  }
}
```

### Data response

```json
{
  "schemaVersion": "1.0",
  "requestId": "random-request-id",
  "bindingNonce": "random-binding-nonce",
  "archetypeId": "task_recycling_p0_v1",
  "title": { "ar": "...", "en": "..." },
  "positiveAction": { "ar": "...", "en": "..." },
  "whyItMatters": { "ar": "...", "en": "..." },
  "steps": [{ "order": 1, "text": { "ar": "...", "en": "..." } }],
  "supportCue": { "ar": "...", "en": "..." }
}
```

The response cannot contain reward, category, safety, evidence, supervision, visibility,
recognition, routine phase, recurrence, eligibility, Circle, League, Family Reward, proof, link,
tool, memory, continuation, or provider-reasoning fields.

## F5 Child Coach text

### Endpoint

`POST /v1/child-coach/text`

### Limits

- 4 KiB actual UTF-8 body
- 1.8-second client deadline / 1.5-second gateway-provider deadline
- 3 requests/minute/Child
- 12 requests/day/Child and 30/day/household
- 1 concurrent request/Child
- scope `coach_approved_task_v1`, role `child`, exact grant/notice versions

### Ages 6–8 request

```json
{
  "operation": "coach_approved_task_v1",
  "request": {
    "operation": "coach_approved_task_v1",
    "schemaVersion": "1.0",
    "requestId": "random-request-id",
    "taskBindingNonce": "random-task-nonce",
    "ageBand": "6_8",
    "locale": "ar",
    "intent": "show_next_step",
    "taskArchetypeId": "task_recycling_p0_v1",
    "catalogVersion": 1,
    "approvedTaskVersion": 1,
    "noticeVersion": 1,
    "grantVersion": 1
  }
}
```

Only `show_next_step`, `make_step_shorter`, and `need_adult` are accepted. No additional field is
valid.

### Ages 9–11 request

Adds only:

```json
{
  "templateInput": {
    "supportChoice": "next_step",
    "stepOrdinal": 2
  }
}
```

Allowed support choices are `first_step`, `next_step`, `smaller_chunk`, `if_then`,
`rehearse_phrase`, and `need_adult`. `stepOrdinal` is optional integer 1–4. No free text is valid.

### Ages 12–14 request

May add exact structured input and:

```json
{
  "topic": "clarify_step",
  "boundedText": "reviewed bounded text",
  "inputOrigin": "typed"
}
```

`inputOrigin` is `typed` or `reviewed_voice_transcript`. The latter requires a separate active voice
grant and voice correlation. Bounded text is one logical line, maximum 240 Unicode scalars and 512
UTF-8 bytes, and must pass the local/server safety policy before provider use.

### Data response

```json
{
  "schemaVersion": "1.0",
  "requestId": "random-request-id",
  "taskBindingNonce": "random-task-nonce",
  "intent": "show_next_step",
  "disposition": "coach",
  "steps": [{ "ar": "...", "en": "..." }],
  "ifThenCue": null,
  "reflectionQuestion": null,
  "reviewedPhrase": null,
  "terminal": true
}
```

The client supplies the reviewed AI disclosure and always-visible adult exit. The response contains
no continuation, quick reply, URL, tool, memory, task/reward authority, provider metadata, or hidden
state.

Sensitive, crisis, unsafe, off-topic, medical, food-safety, religious, sexual, secret, contact,
location, dependency, exclusivity, and adversarial input receives a local reviewed terminal route
without a generation call or request for more detail.

## F5 voice transcription

### Endpoint

`POST /v1/child-coach/transcriptions`

### Limits

- one audio clip, maximum 15 seconds and 256 KiB encoded bytes
- 4-second client deadline / 3.5-second gateway-provider deadline
- 2 requests/minute/Child
- 6 requests/day/Child and 12/day/household
- 1 concurrent request/Child
- scope `transcribe_child_task_voice_v1`, role `child`, exact separate voice grant/notice versions
- no automatic retry

### Request fields

One bounded multipart request:

| Part                                                       | Rule                                                            |
| ---------------------------------------------------------- | --------------------------------------------------------------- |
| `operation`                                                | exact `transcribe_child_task_voice_v1`                          |
| `schemaVersion`                                            | exact `1.0`                                                     |
| `requestId`, `bindingNonce`                                | random, single use                                              |
| `locale`                                                   | exact `ar` or `en`                                              |
| `taskArchetypeId`, `catalogVersion`, `approvedTaskVersion` | reviewed public task context                                    |
| `noticeVersion`, `grantVersion`                            | exact active voice capability                                   |
| `durationMs`, `byteCount`                                  | 1–15,000 and 1–262,144; remeasured server-side                  |
| `audio`                                                    | one supported audio file; no filename supplied to provider logs |

### Data response

```json
{
  "schemaVersion": "1.0",
  "requestId": "random-request-id",
  "bindingNonce": "random-binding-nonce",
  "text": "bounded transcript",
  "locale": "ar",
  "audioDeleted": true
}
```

The gateway rejects or deletes silence, corrupt/unsupported/oversized audio, stale correlation,
provider failure, low-confidence/unusable transcription, unsafe transcript, or failed cleanup. It
returns no segments, VTT, confidence, inferred language, speaker, voiceprint, accent, emotion,
gender, age, health, personality, truthfulness, location, or provider metadata.

The Child reviews the transcript locally. Delete invokes local cleanup and no Coach request. Send
revalidates the transcript as a fresh ages-12–14 text request with
`inputOrigin=reviewed_voice_transcript`; raw audio never enters the Coach endpoint.

## Deterministic fallback contract

- Flags off: no optional adapter is invoked.
- Token unavailable: no fetch; prepared result for accepted F4/F5 intent.
- Timeout/network/4xx/5xx/rate/budget/refusal/incomplete/schema/safety/deletion failure: no retry;
  same-attempt prepared result or safe terminal denial.
- Stale profile/task/draft/grant/notice/correlation: discard without showing any result.
- Voice permission/capture/transcription failure: delete transient audio and offer typed bounded
  input where eligible or prepared Coach; never pressure microphone enablement.

## Zero-effects contract

No request, result, accepted copy, transcript, or error may directly change task completion,
assignment approval, confirmation, Seeds, Garden/landscape/canopy, Circle, League score/rank,
Family Reward, badges, learning, evidence, or recognition. F4 accepted wording may change only the
copy fields allowed by its deterministic mapper before the existing Parent review/approval flow.
