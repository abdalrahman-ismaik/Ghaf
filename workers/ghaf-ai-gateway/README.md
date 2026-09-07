# Ghaf bounded AI reference gateway

This directory is a default-off implementation and fake-provider test boundary for Feature 004.
It is not deployable or approved for real Parent/Child content. The gateway authenticates one
exact-scope, five-minute synthetic capability before reading a request body. The Parent task-draft
handler is implemented with fake-model tests; Child text and voice still fail closed with
`BUDGET_BLOCKED` until their story-specific handlers and tests land.

The Expo app does not mint capability tokens and contains no gateway/provider secret. A future
trusted broker must issue the exact signed claims. The in-memory replay store exists only for local
single-process tests; release requires an approved atomic shared replay and daily/concurrency
budget implementation.

Do not deploy or call a real provider from this repository state. Activation remains blocked on
the authorization, provider/retention, privacy/legal, safeguarding, Arabic/UAE, accessibility,
incident, physical Android, deletion, and human-rehearsal evidence listed in the Feature 004
approval packet.
