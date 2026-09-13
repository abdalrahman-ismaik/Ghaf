# Pre-implementation cross-artifact analysis

Reviewed spec→plan→data model→service contract→tasks against current constitution and C proposal.

1. Old P0 excludes real networking/accounts and requires deterministic fallback. Direct user now
   explicitly authorizes real messaging. Bounded constitution amendment names Feature016 and forbids
   fake fallback only for real transport; existing task demo is preserved. Resolved before runtime.
2. Local Child/profile IDs and AI age permissions are not server enrollment authority. Separate IDs,
   own route guards, server age policy and explicit identity resolution are required. Resolved in FR001–4/14–18.
3. Stateless access JWTs alone do not provide immediate revocation. Every RPC checks provider session
   existence plus active Ghaf device/account/relationship. Resolved in plan/API and T004/005/012.
4. Global sequence allocation alone can skip concurrent uncommitted messages. Lock each thread for
   allocation+insert in one transaction. Resolved in FR006/plan/T008.
5. Unknown sends must not silently change body/key or become mock success. Fixed pending attempt,
   explicit retry and conservative timeout/malformed-success classification. Resolved FR007–9/T011.
6. Proposed multi-turn history, custom goals, attachments and calls are not first-release behavior.
   Existing one-shot prepared helper plus generic editable human draft only. Resolved US4/FR017–21.
   7.30day retention is a chosen implementation assumption; physical cleanup/backup policies require
   actual service evidence. No assumption of E2EE, production compliance or real-Child rollout.

No unresolved P0 contract conflict for source implementation. Hosted configuration, provider operation,
two-installation exchange, physical Android and named-human acceptance remain gates, not inferred passes.
Optional Spec Kit agent-context hooks were not invoked: existing AGENTS managed context is protected.
No branch hook exists; same branch retained. Spec Kit setup scripts resolved this feature explicitly.
