# Catalog execution amendment CE1 — 2026-09-13

Status: USER-SELECTED; bounded local implementation authorized by the integration owner.
Human content, Android and production acceptance remain pending. Source activation follows the
committed contract and exact board99 grants. This is an amendment to Features003/013, not a new
app, backend, release flag or blanket authorization for the remaining product backlog.

## Selection and precedence

The user explicitly asks to fully implement all 24 tasks labeled “Future option, not enabled”.
C115/C116 and c-task-catalog-completion.md are accepted as the engineering/content handoff.
The user also selected “Personal landscapes; separate shared family canopy”. These choices
supersede the sole-executable-task exclusions and related P0-only statements in Feature 003,
and Feature 013 FR-009/its preview-only assumptions, ONLY for the 24 IDs below. Preserve the exact separate
P0 recycling task, all access/privacy/no-loss rules and all unrelated default-off flags.
013's alternate workspace presentation remains default-off. Its normal flag-off builder and
Parent/Child task surfaces must support this new execution authority without flipping that flag.
Saved custom wording, family-connection ideas and unknown templates remain planning-only.

IDs: FA01 FA02 FA03 RK01 RK02 RK04 HR01 HR02 HR05 GI01 GI02 GI03 FH01 FH02 FH04
HE01 HE02 HE03 KC01 KC02 KC03 LW01 LW02 LW03. Exactly three in each existing category.
The reviewed content snapshot is catalog-content-v1.json, derived from C's released proposal.
Adopt its paired action/definition/title corrections, 72 steps, optional/adult distinctions,
indoor GI01 safety, safe HR05 action, accessible duration, privacy and consent boundaries.
This engineering selection is not named human approval of Arabic/cultural/religious content.
No scripture, universal greeting, diagnosis or obedience criteria may be generated.

## User stories and acceptance

- CE01 Parent selects a configured Child and any of24 catalog definitions, reviews its full
  action, completion criterion, safety/adult prerequisites, permitted help, privacy and accepted
  award/recognition meaning, and explicitly approves a versioned occurrence. Cancel creates no
  approved work. Unsupported, materially altered or wrong-age content fails without mutation.
- CE02 Each Child sees only their own approved actionable/pending/completed occurrences. Selecting
  a task changes context, not its owner or status. Parent sees per-Child lists and can create or
  review another task without replacing unfinished or submitted work. No sibling private content.
- CE03 The selected occurrence supplies the actual paired instructions and completion definition.
  Only action steps can be required checkboxes; optional/adult/inapplicable conditional rows never
  block submission or claim that a Child certified adult safety. Parent approval establishes the
  prerequisite plan, and Parent confirmation checks the actual agreed action later.
- CE04 Child chooses, starts, uses the agreed help or chooses independent completion, acknowledges
  the unchanged definition and submits. Help, facts, media and reflection are bound to this task.
  Catalog evidence/reflection remain none: no inherited recycling media, free-text disclosure or
  false default claim of adult help. Optional participation may be declined without loss; declining
  a whole task is not reported as completion. Period/duration tasks require the agreed period,
  not an automatically completed first checkpoint. No timers or scheduling are introduced.
- CE05 Help shows reviewed task steps and an adult-help exit, with prepared/fallible disclosure.
  No unmatched recycling Coach/live adapter is run for catalog tasks. A request for a smaller
  task before acceptance goes to Parent review of another safe reviewed choice; an alternative's
  label is not permission to alter the accepted task. Original approved work remains intact until
  another choice is explicitly approved/selected. Help alone retains the full accepted award.
- CE06 Parent reviews the right occurrence and attempt, its actual selected completion mode and
  bounded facts, chooses prepared action-specific acknowledgement, requests another kind attempt
  or confirms. Retry keeps attempt history and removes no Seeds/growth. Praise precedes award
  application. Duplicate, stale/wrong-instance/version/profile and malformed commands create no
  additional or partial effect. Reentry resumes the selected occurrence truthfully.
- CE07 All 12 recognition-only tasks complete with private acknowledgement, never an “earned0”
  celebration, Seeds, landscape/canopy, Circle, League, Family Reward or badge grant. The 12 award
  tasks retain their existing 4/6/8 acquisition awards; GI01 remains8 and P0 remains12. An accepted
  award and phase are immutable. Future phase reviews never reduce an existing accepted award.
- CE08 New catalog occurrences remain outside existing League/Challenge-Leaf and Family Reward
  allowlists and add no new badge criteria. Existing explicit eligible household Green-only
  Circle projection is retained; no measured environmental-impact quantity is inferred. Shared
  household canopy follows existing household-visible acquisition policy and is separate from
  the fixed five-Leaf League authority. Maintenance creates no persistent growth.
- CE09 Landscapes belong to a Child. Receipt producer and independent verifier replay each
  profile separately; a sibling's task cannot grow the other Child's landscape. Household canopy
  remains cooperative/global. Preserve all existing earned receipts and personal Seed totals.
  Deterministic opening assumption: Salem's proven Mangrove48 stays 48; Alya's36 personal opening
  Seeds have no mapped landscape provenance, so her personal tracks start 0. Her36 Seeds are not
  removed or reassigned. Clearly distinguish total personal Seeds from mapped landscape progress.
  Keep any legacy compatibility projection explicit, never present it as another Child's growth.
- CE10 Full reset clears occurrences, attempts, context and drafts atomically to signed-out Arabic
  baseline; verified family replacement also clears them. Existing local family identity rules
  remain authoritative. Work remains process-local: reload/restart is not durable task recovery;
  explain this boundary, without implementing Recovery014 or synchronizing tasks through messaging.

## Architecture and identity contract

Use existing typed task/recognition services, detached provider validation, store and thin routes.
Add an authoritative store-side assignment collection, with journey/activeAssignmentId as the
compatibility projection of its selected entry. Allocation uses household generation, Child and a
monotonic local occurrence sequence; no mutable provider counter or template-only identity.
Each entry keeps template revision, stable Child/routine identity, immutable approved snapshot,
current journey and archived attempts/check-ins. First legacy P0 IDs remain compatible; repeated
P0/catalog occurrences receive distinct task/assignment/submission/receipt identities. Restore
per-occurrence draft/checklist context or explain an interrupted checklist without fabricated
completion. Switching invalidates stale async assistant/voice/review callbacks.

The provider envelope contains only the selected journey and complete existing recognition
ledger/profile-growth authorities, not mutable sibling assignment collections. Store applies the
verified selected journey, archived attempt and all recognition/reveal authorities atomically.
Catalog metadata includes canonical revision, paired step text/kind, completion scope and prepared
acknowledgement. Full definition equality and real profile age checks establish execution authority;
a copied ID or revision alone cannot authorize custom wording. All validation remains fail-closed.
Routine counts use Child plus stable routine identity, never template-only or occurrence-only.

No package, account, live AI, real media, calendar, call, message transport, notification, map,
payment, remote task storage or feature-flag activation is part of CE1. Existing template rails
and botanical controls are adapted; no supplied template code/artwork is imported.

## Implementation plan and file seams

1. Commit this contract, explicit003/013 amendments, tasks, content snapshot and board grants.
2. Domain helper: model/interfaces/mock, pure assignment-instance functions, task validation and
   recognition producer/verifier. Lead: canonical content, store collection/context integration.
3. Lead: Parent composer/lists/review, Child selected task/steps/help/completion, current Garden
   profile projection. Respect the active screen-clarity writer's route ownership until release.
4. Reuse focused existing suites; add48 template×Child complete-flow cases plus recurrence,
   multiple-task interleaving, help/retry, wrong-profile/stale/duplicate, zero-growth and reset
   regressions. Preserve canonical P0 and separate108→120 setup tests.
5. One serialized complete check lane then one bounded AR/EN320/390 browser pass after the active
   browser releases. Correct observed defects, rerun affected checks, commit coherent slices.

## Completion evidence

All 24 tasks must be selectable and traversable through the real UI and command path, not merely
remove badges. A two-task prototype is an intermediate checkpoint only. Tests cover all 24 for both
synthetic profiles, fixed awards/zero growth, task identity/attempt separation and personal growth.
One browser batch covers categories and representative award/recognition/sensitive/optional tasks,
multiple occurrences and both locales, truthful missing help/error/pending/retry/success states,
48dp targets, long labels, keyboard and reduced motion. Record CSS text scaling separately.
Physical Android, TalkBack/Back/native keyboard/font scale, child suitability, named Arabic/faith/
UAE/safeguarding review and participant comprehension remain NOT RUN/BLOCKED without direct evidence.
No success claim for Supabase/two-device messaging or native installation follows from CE1.
