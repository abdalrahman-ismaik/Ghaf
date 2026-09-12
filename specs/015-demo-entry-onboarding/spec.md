# Feature Specification: Fast Demo Entry and Family Onboarding

**Feature Branch**: `redesign/ui-experiments` (preserved by user instruction)
**Created**: 2026-09-12
**Status**: Selected user scope; technical/failure contract reviewed by D; implementation eligible after this contract commit. Human/native acceptance pending.
**Input**: Three accessible synthetic demo accounts without authentication (one Parent and two
Children), attractive modern onboarding, and repair of broken Arabic narration. The user explicitly
starts Session A's native/product batch. Recovery014 remains deferred.

## Authority and compatibility

This additive feature governs a separately configured synthetic demonstration in the existing app.
Ordinary prototype configuration retains003/005/011 access/setup. In demo configuration only, the
three-profile doorway and three optional story moments supersede003's mandatory first-run routing,
six-moment presentation and automatic narration (FR-185/186/203/204/205 and related visual checks).
Parent/Child capabilities, task confirmation, privacy and progression are not superseded. Existing
R002b/live-AI flags stay off. Ordinary exploration remains a separately configured run, not an
in-app mode switch. No managed AGENTS block or historical evidence is rewritten.

The exact contract must be reviewed and committed before source grants. Product intent is already
requested; do not ask again for that scope. Student exact-diff understanding and actual voice listening
review and physical acceptance remain evidence-dependent after implementation.

## User Scenarios & Testing

### User Story 1 — Enter a demo profile immediately (Priority: P1)

A presenter sees a Parent, Salem and Alya and selects one without typing credentials, pairing or
configuring a household. The chosen role has its own screens/actions and is labelled synthetic.

**Why this priority**: Repeated access ceremony consumes the time available to show family value.
**Independent Test**: Select all three profiles separately; reach the correct homes with zero
email, OTP, PIN, picture-sequence or setup screens, and deny wrong-role actions.

**Acceptance Scenarios**:

1. **Given** a fresh demo, **when** entry settles, **then** exactly three named role/profile choices
   and a synthetic label are visible; an introduction cannot block them.
2. **Given** signed-out demo entry, **when** a profile is selected, **then** only its fresh authority
   opens, with no task approval, points, media permission or invented verification.
3. **Given** Salem's assigned task, **when** Alya enters after sign-out, **then** she cannot read,
   submit or confirm his private task; her separate seeded experience remains available.
4. **Given** an active profile, **when** a stale/direct entry action occurs, **then** it cannot
   switch authority or show another role's content.
5. **Given** ordinary configuration, **when** entry opens, **then** existing setup/verification and
   remembered-access rules remain; no quick-entry URL bypass exists.

### User Story 2 — Handoff and reset the demo safely (Priority: P1)

A presenter signs out to the profile selector and enters the next role while keeping the current
run. Explicit reset restores its initial state without touching another local family's stored data.

**Why this priority**: The local Parent/Child demonstration depends on reliable role handoff.
**Independent Test**: Parent approves recycling, Salem completes with help, Parent confirms and
recognizes +12 once; sign out between roles, then reset and repeat.

**Acceptance Scenarios**:

1. **Given** a current task/progression state, **when** profiles change through sign-out, **then**
   the run survives, old authority ends and Back cannot reopen the old experience.
2. **Given** a saved ordinary family, **when** a whole demo/reset is performed, **then** its stored
   family, remembered access, templates and ambience remain unchanged.
3. **Given** an active demo Parent, **when** the existing confirmed reset is used, **then** entry
   is signed-out Arabic with exact initial progression and a new run.
4. **Given** process death/restart, **when** the demo opens, **then** it starts a new signed-out run;
   no principal/session is remembered and no durable task recovery is implied.
5. **Given** failed entry, **when** its error appears, **then** no partial authority remains and
   prior task/progress/permissions are unchanged; a subsequent valid retry works.

### User Story 3 — Explore a short optional family story (Priority: P2)

A family member or judge can explore three clear moments about choosing together, receiving
bounded help and celebrating confirmed actions, then return to profiles whenever they wish.

**Why this priority**: The opening should communicate family value and invite use.
**Independent Test**: Move forward/back, change language, skip, replay and enter a profile on narrow
and enlarged-text layouts; repeat with all optional media unavailable.

**Acceptance Scenarios**:

1. **Given** the selector, **when** the story opens, **then** three optional, manually advanced
   moments explain a safe shared action, help and symbolic growth; no automatic slide timer.
2. **Given** any moment, **when** close/skip or demo entry is used, **then** it works without waiting
   for narration, images or an artificial delay.
3. **Given** Arabic/English or enlarged text, **when** the story is used, **then** complete labels,
   reading order and touch targets remain reachable without horizontal clipping.
4. **Given** missing media or reduced motion, **when** the story is read, **then** all essential
   text/actions remain operable; decorative failure cannot block entry.

### User Story 4 — Hear understandable optional narration (Priority: P2)

Arabic-speaking users can choose natural, accurate narration matching the visible text, stop it,
and continue silently. No narration/ambience plays without their action in the demo entry/story.

**Why this priority**: The user reports poor quality in the existing bundled Arabic voice/script.
**Independent Test**: A actual Arabic reviewer listens to each exact final clip on a phone and
compares its transcript; playback/interruption tests are evidenced separately.

**Acceptance Scenarios**:

1. **Given** entry or a new story moment, **when** no audio action occurs, **then** it stays silent.
2. **Given** a reviewed matching clip, **when** play/stop/replay is used, **then** it behaves
   predictably without a microphone, runtime narrator service or background playback.
3. **Given** audio playing, **when** step/locale changes, profile entry occurs, the app backgrounds
   or the story closes, **then** it stops and stale completion cannot restart it.
4. **Given** unavailable/unreviewed clips or active screen-reader speech, **when** the story is
   used, **then** readable text remains complete and unwanted speech cannot overlap it.
5. **Given** rewritten text, **when** inspected, **then** no old mismatched clip can play. Voice
   acceptance stays pending until an actual reviewer hears the exact replacement.

### Edge Cases

- Unknown/malformed profile, double tap, reentrant entry, active or temporary-session entry.
- Seed failure, second Child marker restoration failure, authorization and cleanup failure.
- Reset invalidation, old callbacks after sign-out/reset, view unmount and stale navigation.
- Mid-reset failure: complete restart-required state, denied profile/role actions, fresh-process recovery;
  no atomic-reset or old-progress-preservation claim.
- Ordinary one/two-Child stored family with remembered access and existing preferences.
- Signed-out deep links to Parent/Child/setup/pairing/verification inside demo configuration.
- Long Arabic names/labels, mixed scripts, language changes, large text, TalkBack and safe areas.
- Missing image/audio, audio-focus loss and still-loading clip when skip is pressed.
- Partial progress, duplicate recognition, permitted help and sibling isolation.

## Requirements

### Functional Requirements

- **FR-001**: Demo entry MUST present exactly one synthetic Parent, Salem and Alya without
  credentials/setup, clearly identifying the synthetic local experience.
- **FR-002**: Only signed-out demo entry may select a profile; no in-experience role toggle or
  ordinary-configuration authentication bypass is permitted.
- **FR-003**: The selected profile MUST receive fresh scoped authority; other roles, siblings,
  sensitive actions and ordinary access routes remain guarded.
- **FR-004**: Entry MUST grant no task approval/acceptance/recognition, media/AI permission, extra
  task or progress. Salem's canonical recycling task remains the sole executable P0 journey.
- **FR-005**: Failed entry MUST leave no partial authority and preserve prior progress/permissions,
  including cleanup failure; later valid retry remains possible.
- **FR-006**: Demo family/access/template/ambience data MUST be isolated from ordinary storage.
  Demo entry/reset MUST NOT replace, migrate, display or clear that ordinary family.
- **FR-007**: Sign-out/handoff MUST retain current-run progress, end authority and clear transient
  assistant/media/access state. Reseeding occurs only for a new/reset run.
- **FR-008**: Restart MUST begin a fresh signed-out demo; principal/session/authority MUST NOT persist.
  No recovery014 or cross-device-sync claim is permitted.
- **FR-009**: Explicit Parent reset MUST invalidate stale work and restore signed-out Arabic entry
  and existing exact defaults without deductions or cross-profile leakage.
- **FR-009a**: A failed demo reset MUST close the experience and deny every profile/role action,
  clearly requiring a full app restart. It MUST NOT claim to preserve the partially cleared run or
  report reset success. A fresh process starts a usable new isolated run. Ordinary reset is unchanged.
- **FR-010**: Profiles MUST be immediately accessible with an optional three-moment story and
  visible language, exit/skip and manual navigation controls.
- **FR-011**: Story content MUST retain Parent approval, full help credit, AI fallibility/adult help,
  private symbolic growth and no measured environmental-impact claim.
- **FR-012**: Story presentation MUST retain the botanical identity, approved typography/local
  artwork, logical RTL/LTR, accessible controls, reduced motion and tolerant media failure.
- **FR-013**: Narration MUST be opt-in and initially silent, match visible text, support play/stop/
  replay and stop across step/locale/exit/background or screen-reader conflict.
- **FR-014**: Only reviewed matching packaged narration may enter the accepted candidate. Missing
  assets/review MUST leave a complete silent flow; old mismatched clips are forbidden.
- **FR-015**: Arabic editorial review MAY be the user-delegated AI review, explicitly identified as AI; listening acceptance MUST come from the actual user with date (personal name may remain unspecified). Record clip
  provenance/settings/rights and rejected takes. Metadata/player tests are not listening evidence.
- **FR-016**: Ordinary access/setup and task/progression/privacy regression coverage MUST remain.
  No package, remote service, real data or R002b activation is selected.

### Key Entities

- **Demo profile**: One fixed synthetic principal with visible role, name and existing avatar.
- **Demo run**: One process-local family experience with a reset generation and existing progression.
- **Entry attempt**: Request for one principal bound to the signed-out state/current run.
- **Story moment**: One of three bilingual optional explanations with approved local visual content.
- **Narration candidate**: Exact script/clip pairing, provenance and editorial/listening status.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All three profiles reach their correct home with one selection and zero credential/
  setup screens. Measure cold-start separately from selection-to-home on actual devices.
- **SC-002**: Every role/sibling/ordinary-bypass case is denied; all failed-entry cases preserve
  prior progress/permissions and leave no live unintended principal.
- **SC-003**: A Parent→Salem→Parent run/reset retains +12-once/help/no-loss and ordinary-storage bytes.
- **SC-004**: Three moments are navigable and skip-safe in both languages with ordinary/large text;
  all essential text/actions remain available without optional media.
- **SC-005**: Every accepted Arabic clip has an identified reviewer/date and passing exact-script
  listening record on a real device; missing records remain pending.
- **SC-006**: The exact Android candidate is independently checked on actual primary/secondary
  devices; absent hardware/voice review remains BLOCKED/NOT RUN.

## Assumptions

- Demo and ordinary prototype are separately configured runs of one app, not an in-app mode switch.
- Resolve the Palm/Al Noor display mismatch to one consistent synthetic demo family name.
- Existing capability controllers remain authoritative; quick entry is not real identity proof.
- Existing assets/fonts/libraries suffice. A complete silent candidate can be inspected while
  replacement clips await Arabic/rights review, without claiming that narration is repaired.
- Recovery014 and reciprocal-support/calendar/study/money/maps/chat/memory remain unselected for
  implementation. A native pass cannot automatically select them.

## September 12 correction — visible story, clear profiles and browser narration

The user rejected the selector-first delivery and asked for the onboarding pages, narration and
Parent/Child entry design to be visible. This selected correction supersedes selector-first
FR-010/Story1 scenario1 and SC-001's fresh-launch one-selection condition only. All access,
synthetic-data, task, reset, current-run and ordinary-mode boundaries remain unchanged.

- Fresh demo entry (entry epoch zero) opens moment1 of the existing three-moment introduction.
  Each is a distinct manually advanced page. No timer, new route or storage flag is introduced.
- Every moment has a visible Choose a profile action. Skip/finish returns to exactly the existing
  Parent, Salem and Alya choices; no credential form or extra intermediate role chooser is added.
  After authenticated handoff, a nonzero entry epoch opens those profiles directly. Reset/fresh
  process starts the introduction again. Replaying the introduction remains possible.
- Next/Back and profile entry stay reachable while the complete text scrolls independently.
  No safety/body script is shortened; approved audio still matches exactly. Existing artwork/fonts
  receive a new page composition, with separate profile heading and clear Parent/Child labels.
- All three Arabic clips have visible opt-in Listen/Stop/Replay controls in a foreground browser.
  Browser inability to detect a screen reader must not be represented as detection of no reader.
  A direct Play/Replay gesture is the explicit web permission; no autoplay or automatic resumption.
  Native retains known reader-disabled observation before playback. English stays text-only with
  a clear Arabic-only explanation. Clip failure leaves all text/navigation available.
- Web hiding/backgrounding, step/locale/profile/close/reset changes cancel the current player.
  Browser testing establishes media playback and cancellation only, never actual native sound,
  native focus handling, new rights or student acceptance. Public distribution stays pending.

Acceptance: fresh launch shows1/3; Next shows2/3 then3/3; Skip/finish exposes all three profiles;
ordinary access remains unchanged; nonzero-epoch handoff avoids re-onboarding; Arabic explicit Play
advances the actual media clock, Stop/step/locale/navigation leave no playback, no initial audio;
English explains Arabic-only audio; narrow and enlarged layouts retain full text and controls.
Actual student/native review remains pending. Poster artifacts remain frozen to their recorded source.
