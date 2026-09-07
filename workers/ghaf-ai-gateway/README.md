# Ghaf bounded AI reference gateway

This directory is a default-off implementation and fake-provider test boundary for Feature 004.
It is not deployable or approved for real Parent/Child content. The gateway authenticates one
exact-scope, five-minute synthetic capability before reading a request body. The Parent task-draft
and Child text handlers are implemented with fake-model tests; voice still fails closed with
`BUDGET_BLOCKED` until its story-specific handler and tests land.

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
npx vitest run tests/bounded-ai-mcp.test.ts
```

Passing this suite proves only local transport and parity behavior with synthetic fixtures. It is
not provider, public-hosting, OAuth, real Child data, production security, or release evidence.
