# Requirements Quality Checklist: Bounded Live AI Drafting and Coach

**Purpose**: Validate that the Phase 1 proposal is complete, testable, internally consistent, and
clearly non-authorizing before product review.

**Created**: 2026-09-07  
**Feature**: [spec.md](../spec.md)  
**Approval detail**: [approval-packet.md](../approval-packet.md)

**Marker semantics**: `[x]` means the proposal's requirements quality was reviewed and the
criterion is satisfied. It does not mean the feature, implementation, provider, legal review, or
release gate is approved or complete.

## Scope and authorization

- [x] CHK001 The proposal is explicitly marked proposed, non-authorizing, and separate from the
      active Feature 003 contract.
- [x] CHK002 F4 Parent drafting, F5 text Coach, and F5 voice have independent scope and gates.
- [x] CHK003 The deterministic competition path, prepared fallback, and exact reset remain required.
- [x] CHK004 Product exclusions cover autonomous assignment, business-authority changes, open
      Child chat, companion/therapy/diagnosis/judgment, real Child photo/video, and unapproved voice.

## Requirement completeness

- [x] CHK005 Prioritized, independently testable Parent, Child, guardian, and later voice stories
      include Given/When/Then acceptance scenarios.
- [x] CHK006 Requirements define reviewed-archetype scope, copy-only mapping, Parent diff/review,
      age-band input restrictions, terminal Child output, consent/revocation, and offline fallback.
- [x] CHK007 Requirements define zero AI state effects for tasks, Seeds, Garden/canopy, Circle,
      League, Family Reward, badges, and learning.
- [x] CHK008 Edge cases cover malformed/refused/incomplete model output, stale/reset/profile/grant
      races, replay, Unicode/mixed-bidi attacks, unsafe/sensitive/crisis input, body/rate limits,
      network denial, and semantic authority injection.
- [x] CHK009 Key request, response, task-authority, grant, and operational-evidence entities are
      identified without reviving the historical mission model.

## Safety, privacy, and security quality

- [x] CHK010 Field-level request/response allowlists and explicit prohibited fields exist for F4
      and every F5 age band.
- [x] CHK011 Guardian enable/disable, Parent reauthentication, Child notice/decline, grant version,
      expiry, revocation, deletion, retention, provider training/ZDR expectations, incident response,
      and operator access are addressed.
- [x] CHK012 The gateway contract covers short-lived credentials, authorization before inference,
      exact route/method/origin/content type, actual body size, replay, rate/budget/concurrency,
      timeout/cancellation, no retry, no-store, strict schemas, logging, rollback, and kill switch.
- [x] CHK013 Model output is untrusted and has no tools, browsing, retrieval, memory, household
      history, cross-turn transcript, or model-selected business fields.
- [x] CHK014 The proposal distinguishes request `store:false`/equivalent from contractual zero data
      retention and leaves legal compliance unclaimed.
- [x] CHK015 A five-item threat model, trust-boundary control checklist, risk register with owner and
      gate, and evidence list are present.

## Testability and evidence

- [x] CHK016 Functional requirements use mandatory language and identify observable acceptance or
      rejection behavior.
- [x] CHK017 Success criteria are measurable without asserting that implementation or human/native
      evidence already exists.
- [x] CHK018 The test matrix covers schemas, authority retention, all age bands, profile/task/grant
      isolation, auth/gateway abuse, fallback, logging/deletion, zero effects, i18n/accessibility,
      Android, and flag-off regression.
- [x] CHK019 PASS/FAIL/BLOCKED/NOT RUN gates separate repository, gateway, provider, security/privacy,
      legal/consent, safeguarding, Arabic/UAE, Android, real-network, rehearsal, and release evidence.
- [x] CHK020 The dependency plan is ordered and split into shared prerequisites, F4, F5 text, and
      later F5 voice.

## Decision readiness

- [x] CHK021 Reasonable proposed defaults are supplied for limits, retention, age policy, task
      scope, consent duration, provider data treatment, and abuse identifiers.
- [x] CHK022 Every material unresolved decision is listed for explicit approval rather than hidden
      as an assumption.
- [x] CHK023 The packet ends with the required F4-only, F5-TEXT-only, both, or neither checkpoint and
      states that voice remains separately blocked.
- [x] CHK024 No `[NEEDS CLARIFICATION]` marker remains; open choices are consolidated in the approval
      section with recommended defaults.

## Review result

Requirements-quality review is complete for Phase 1. Product approval, runtime implementation,
provider execution, legal/privacy/safeguarding/Arabic review, Android evidence, and release
activation all remain incomplete or blocked as recorded in the packet.
