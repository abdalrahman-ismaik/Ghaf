# Feature 017: Study and family support

**Authority:** User selected proposals 8, 9, 10, 11 and 12 on 2026-09-13 and explicitly
confirmed proceeding from the saved proposals. This feature supersedes their former
unselected/later status only for the bounded implementation below.

## Outcomes

1. A Child organizes homework, revision or a project, agrees manageable next steps,
   practices recalling and explaining a prepared example, records completion and
   chooses when to revisit. The Parent can offer a plan and practical support.
2. Parent and Child jointly agree a private practice, school-achievement or numeric
   mark goal, optionally with a nonessential prize. They can request changes or
   pause, review their own reported result and acknowledge progress without loss.
3. Parent and Child exchange actual service-backed text when messaging is configured.
   Parent-approved pairs of enrolled Children in the same family can also communicate.
4. Families can use a small, sourced playbook for listening, planning, recalling,
   explaining and reviewing together, with accessible, skippable guided steps.

## Scope and capability truth

Study/goals use existing synthetic profiles and the shared local repository boundary:
device-local storage in ordinary local-family mode; isolated memory in demo entry and
adult pilot samples. No school account, real student data, cloud study synchronization,
calendar integration, live tutor, recording, attention monitoring or grade verification.
Prepared sample learning material is not represented as curriculum certification.

Messaging retains Feature016 real Supabase Auth/PostgREST identity and delivery. It
never substitutes synthetic send success for an unavailable server. Hosted activation,
external services and physical two-device acceptance require their own direct evidence.
Feature006 adult pilot identities never silently enroll Children or grant messaging access.
This implementation adds no paid service, deployment, live AI activation or calling.

## US1: Study organizer and practice

- FR001: Guard `/parent/study` and `/child/study` with existing role authority. Parent
  chooses a configured Child; Child can only read/change their own study records.
- FR002: Create a bounded plan with subject, title, one next step, a manageable
  duration, optional due date and optional revisit date. Dates are valid calendar
  dates; no overdue punishment, background notification or forced countdown.
- FR003: Parent-created plans begin as proposals requiring Child acceptance. A Child
  can create their own plan, accept a Parent proposal, request help, start, pause and
  complete their own plan. Completion is explicitly self-reported; permitted help,
  pausing and revisiting never remove previous progress. No timer proves completion.
- FR004: Provide prepared finite recall/check/explain practice with explanatory
  feedback and an accessible text route. A wrong answer offers another attempt and
  explanation. Generic planning prompts remain useful for the entered school topic.
  Do not infer mastery, emotion, intelligence or diagnosis from attempts.
- FR005: Parent can see the selected Child's agreed work and help request. No sibling
  marks, comparison, secret monitoring or Child-assistant transcript is projected.
- FR006: Validate bounded persisted records before use. Storage read/write/clear
  failure must be visible and must not claim a successful saved mutation. Reset,
  verified family replacement and pilot teardown clear this feature's own records;
  a different family cannot inherit them. Malformed storage is not silently overwritten.

## US2: Joint academic goals and private prizes

- FR007: Either role may propose a goal for that Child. It includes a title, subject,
  attainable next step, Parent support, and exactly one criterion: agreed practice
  count, explicitly described achievement, or mark threshold with denominator.
  Marks are finite numbers with `0 <= threshold <= denominator`, denominator positive.
- FR008: Parent reviews each proposal and any optional prize; Child accepts that
  exact revision before it becomes active. Child may decline, pause or request a
  change. Editing before acceptance invalidates old approval/acceptance. After
  acceptance, terms and prize remain immutable; a replacement needs a new agreement.
- FR009: Child submits a self-reported result; Parent reviews the agreed criterion
  and gives action-focused acknowledgement. Repeated submission/confirmation is
  idempotent. Below-target results offer retry/support without a public failure,
  debt, deduction, lost tree or lost previously unlocked prize.
- FR010: Optional private prizes are specific, nonessential Parent promises (gift,
  shared experience or privilege), fulfilled outside the app, with
  `promised -> unlocked -> given`. Only Parent confirms or marks given. No payment,
  wallet, automatic grade-to-money rate, purchased status or public ranking.
- FR011: The user's explicit mark/achievement-prize selection is a narrow exception
  to the previous blanket academic-prize exclusion. Basic education/access, meals,
  safety, care, affection and dignity never depend on a goal. These academic records
  create zero Seeds, landscape/canopy/League/Impact Path/badge progress and zero
  existing Family Reward contributions. Existing reward eligibility stays unchanged.

## US3: Human Parent–Child and Child–Child conversations

- FR012: Keep Feature016 Parent–Child threads and history, real server membership,
  session/device checks, 500-code-point limit, pagination, retention and retries.
- FR013: Parent can enable or revoke a pair of distinct active enrolled Children
  belonging to that Parent's provisioned family. No public discovery, cross-family
  contacts, Child-created approval or inference from local demo IDs. Pair creation
  is canonical/idempotent in either input order and requires explicit Parent action.
- FR014: Peer threads are participant-only. Parent manages permission but does not
  silently receive/read/send peer content. Tell Parent and Child this boundary at
  point of use. Either Child may leave/disable their peer thread, requiring a new
  explicit Parent enable to resume. Revocation immediately denies server reads/sends.
- FR015: An additive migration preserves Parent–Child data and introduces explicit
  thread kind and peer membership. Every read/send checks both active Children,
  same-family permission and the current authenticated session/device.
- FR016: Children get a conversation list and Back navigation when peers exist.
  Drafts and pending results are isolated by account, role, thread and generation.
  Revocation clears inaccessible content. The task helper's Message Parent action
  always targets the Parent thread, never the last selected sibling thread.
- FR017: Existing age controls apply: 6–8 curated phrases; older enrolled bands use
  bounded human text. Human conversations are separate from all AI assistance and
  cannot create/approve study goals, tasks, prizes or any progression.

## US4: Sourced family practices

- FR018: Provide four to six short bilingual activities with purpose, practical
  steps, Parent participation, equal accessible alternatives, source links and
  optional completion acknowledgement. Start/step/back/skip/finish are real local
  interactions; no shared wellbeing score, emotional disclosure requirement or reward.
- FR019: Distinguish research-backed strategies from evidence for Ghaf itself. Cite
  primary/official education and parenting sources, explain applicability limits,
  and make no promised mark, cognitive-health or family-relationship improvement.
- FR020: Reuse botanical tokens, Alexandria/Readex, existing components and logical
  RTL. Add entries on existing Home/Today/Family surfaces without expanding bottom
  tabs. All new strings live in bilingual resource modules.

## Acceptance

Prove role/profile isolation, exact joint agreement, immutable accepted terms,
idempotent confirmation and prize fulfillment, invalid mark/date denial, zero
progression side effects, help/pause/retry retention, persistence and reset failure.
Prove sibling approval/revocation and parent-content exclusion on the server, thread
draft isolation and Parent helper targeting. Check resource parity, source references,
interactive AR/EN compact web flows, typecheck/lint/format/full regressions and bundles.
Record actual provider, database, browser, Android and named-human results separately.
