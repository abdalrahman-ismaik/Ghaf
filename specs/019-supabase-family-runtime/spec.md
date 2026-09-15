# Feature 019 — Complete Supabase family runtime

Authority: the user's direct correction on 2026-09-14: “for the database, you didn't create proper
database cheme in supabase to handle the tasks and other stuff, I want a full migration to supabase
from predefined”. This supersedes Feature018's narrow planning-only boundary. The complete real
application must use account-owned database records, not the old JSON planning page or synthetic
Salem/Alya projections. Email/password Parent access remains the selected method.

## Required behavior

1. Use normalized relational tables with UUID primary keys, foreign keys, household ownership,
   indexes, validation, RLS and explicit grants. Tables cover households/guardians/Child profiles,
   task categories/templates/versions/steps/assignments/submissions/check-ins, permanent recognition,
   Seeds and landscape growth, private reward plans, Masroofi controls/promises/ledger, study plans,
   jointly agreed goals/results/prizes, learning completions/badges, League membership/nominations,
   and revocable Child-device enrollment. Static catalogs may be seeded as reference definitions;
   user families, task history, money and progress must never be seeded or invented.
2. Full task behavior persists: Parent draft/review/assignment, Child acceptance/start/help/retry/
   submission, Parent descriptive praise/confirmation and permanent recognition. Server transitions
   enforce the fixed award, permission, privacy, recognition mode and routine phase. Accepted terms
   cannot be silently weakened. Repeated requests or concurrent approvals cannot duplicate awards.
3. Earned Seeds/growth, eligible reward progress, League score and simulated card balances retain
   separate server authorities. Recognition-only and maintenance award no Seeds/growth. Reward
   eligibility is explicit and fail-closed; prohibited private categories never produce money.
4. Masroofi retains the UAE card and all spending categories. Parent sets eligible task rewards
   before acceptance; the backend omits the amount from Child reads until earned. Server ledger
   operations enforce age attestation, freeze/category/online/amount/daily/balance controls and
   idempotency. Values remain simulated money, not a bank/payment integration.
5. Family Reward plans and academic goals retain accepted/unlocked terms and their existing private
   lifecycles. Study plans and results persist. Learning credit is idempotent and creates no Seeds;
   badge criteria remain deterministic. League uses five nominated Leaves, a score capped at 100,
   shared ties and no speed or extra-task advantage; shared projections expose only allowed fields.
6. Existing genuine Parent identity and secure session storage are reused. Child enrollment uses
   explicit Parent-issued, expiring, single-use invitations and a distinct server-bound identity;
   selecting a nickname or hiding a button is not authorization. Revocation removes access. Parent
   and Child clients cannot impersonate each other, access siblings or read unreleased amounts.
7. Replace fixture-backed state in the primary real app with an async account-scoped runtime and
   server reads/commands. Reuse botanical UI, the original garden/card artwork and bilingual
   controls. Do not remap database UUIDs to fixed synthetic profile IDs or compute unlock authority
   in screens. All supported domains have usable navigation and real create/read/update workflows.
8. Preserve existing account_workspaces and local sample records. Add an idempotent, auditable
   server import/cutover for existing owned family/member/task/study records. Unknown ages require
   Parent profile completion. Legacy completion remains an imported planning fact, never fabricated
   Child approval, Seeds, garden growth or money. Prevent competing legacy/new writers after cutover.
9. Real mode starts empty and reports network/service errors truthfully. No mock success or seeded
   family fallback. Refresh/restart/independent sessions retrieve the same records; logout/account
   changes invalidate pending work and clear private state. A separate explicit demo remains for
   historical rehearsal; no user data is deleted and existing features are preserved.
10. Apply reviewed additive migrations to the configured adult Supabase project when administrative
    access is available; verify history/schema and real authenticated read/write/isolation queries.
    Public keys are not DDL authorization. Preserve the separate existing messaging project and
    its contents; identity linking is explicit, never inferred from email/nickname. No paid service,
    real Child media upload, financial processor or public deployment is part of this migration.

## Acceptance

Use synthetic test people with real Postgres semantics and, when available, real provider sessions.
Verify independent Parent/Child sessions, cross-household/sibling/role denial, task retry/help,
double approval, fixed terms, zero-evidence empty state, permanent awards, hidden reward amounts,
card concurrency/limits, family/academic reward immutability, learning idempotency, League privacy
and scoring, legacy import repeatability and retained original records. Run TypeScript/lint/format,
domain/UI tests and bilingual runtime inspection. Report SQL engine, provider, native and human
evidence separately; do not describe authored-but-unapplied SQL as a completed hosted migration.
