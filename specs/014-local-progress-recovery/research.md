# Recovery design decisions and local evidence

Status: DRAFT proposal. This is repository analysis, not a scientific or completed-runtime study.

1. **Recover evidence, not aggregate state.** B's audit at `b1fc581` identifies independent Seeds,
   landscapes, Green, League and private Reward authorities and strict recognition boundary modules.
   Raw store persistence would retain private/transient content and trust UI totals. Use strict
   minimal facts and existing validators instead. Exact lossless receipt projection needs a bounded
   implementation design review against current types; do not accept a field list that loses provenance.
2. **One family/evidence commit key.** Existing synchronous KV exposes get/set/remove, not a multi-key
   transaction. A versioned family envelope prevents replacement writing the directory separately
   from its new evidence generation. A separate independently committed progress key was rejected
   because a reused synthetic identity could admit mismatched state after interruption.
3. **Fresh opaque generation.** Fixed family/Child IDs, timestamps and even Parent identifiers can
   be reused. Local family generation and affinity binding must change only on accepted creation/
   replacement/migration. Generation is non-secret and cannot bypass controller verification.
4. **Save before visible success.** Failing writes reject the mutation and keep the last acknowledged
   task state. This is simpler to explain than an unsaved award that disappears on restart. Pending
   feedback must be clear and no duplicate retry may award twice.
5. **No resumed presentation authority.** Restore recognized results statically; pending recognition
   requires fresh Parent access and praise presentation. Prepared assistant/media drafts are not
   durable. This avoids treating persisted presentation commitments as award permission.
6. **Known legacy migration only.** Preserve a valid directory with empty new task evidence and
   re-establish remembered access through normal verification/pairing. Do not claim historical lost
   progress can be reconstructed. This one-time user-visible tradeoff needs scope acceptance.
7. **Dependency first.** B-004 repairs an existing Feature 011 replacement omission before recovery
   builds on that path. Physical Android/native single-key atomicity remains unverified until an
   actual APK is built and exercised; local memory/browser tests alone do not pass it.

Evidence: `docs/competition-readiness/workstreams/b-recovery-audit.md`, `qa-report.md`, existing
003/005/008/011 specifications and `src/services/local/storageTypes.ts`. No web research needed
for these observed repository choices; platform claims must be verified through installed code,
official documentation and direct native evidence during implementation.
