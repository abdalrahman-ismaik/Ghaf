# Data model

All server identifiers are UUIDs independent of the local prototype's household/profile IDs.

- ParentAccount: provider user ID, household ID, display name, active. Operator-provisioned only.
- Child: ID, Parent account/household, display name1–60codepoints, ageBand6_8/9_11/12_14, active.
- Device: ID, provider user ID + provider session ID, Parent/Child participant binding, label1–60,
  active, createdAt. A refreshed token keeps its session; a revoked session cannot re-register itself.
- Invitation: hash of random>=80bit code, Child, creating Parent, expiresAt10minutes, usedBySession,
  revoked. Only code/hash is retained; return plaintext once on creation. Enrollment atomically consumes.
- Thread: UUID, Parent account, Child, household, nextSequence. Unique Parent/Child pair.
- Message: UUID, thread, sender participant, immutable plain body, authoritative createdAt/sequence,
  clientKey. Unique sender/clientKey; same key+body+thread returns original, conflict rejects.
- EnrollmentAttempt: scoped provider user rate-window/count; contains no message/code plaintext.

Read/send authorization traverses active provider user/session→active device→active Parent account
and Child relationship→exact thread. Direct table access is denied. Real membership is never inferred
from demo store, user_metadata, route parameter or display name.

Client state: configuration unavailable | signedOut | authenticating | validating | ready | locked |
revoked. Ready carries one verified Context. Thread has chronological server messages, cursors,
identity-scoped draft and at most one pending send. Pending send: sending | accepted | unknown |
failed, original key/body/attemptTime. Epoch guards apply to every completion. Accepted records never
receive a client-fabricated service timestamp. Logout/account change clears context/history/drafts.

Retention: messages expire after30days (API excludes expired records, hourly cleanup deletes them).
Retained-history idempotency is30days; client uncertain attempts expire after24hours. No durable
client outbox or automatic replay after process restart. Native only stores credentials securely;
web stores nothing across reload. Provider operational/backup metadata is an explicit setup/rollout
inventory, not a claim that logout deletes provider data.
