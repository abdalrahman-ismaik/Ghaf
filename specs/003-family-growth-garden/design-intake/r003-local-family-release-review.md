# R003 Device-local Family and Guided Setup Release Review

**Prepared:** 2026-09-06

**Implementation status:** COMPLETE LOCAL DEMO CANDIDATE

**Release status:** BLOCKED pending the physical Android and named-human gates below

This is the canonical implementation, manual-test, and reviewer-sign-off packet for the
device-local family directory, one-or-two-Child setup, returning-role entry, dashboard welcome,
and bounded AI profile helper. A checked implementation row records only the named evidence. It
does not claim production authentication, encrypted storage, cloud sync, push notifications, a
live model, legal compliance, or release approval.

## Implementation checklist

- [x] One strict schema-version-1 household record stores one synthetic Parent role and one or two
      ordered configured Child roles.
- [x] Native storage uses Expo SQLite key-value storage, web uses guarded localStorage, and tests
      use a deterministic memory adapter through one repository contract.
- [x] The stored record excludes credentials, verification codes, task/Seed/Garden/League/Reward
      ledgers, media, transcripts, notification history, and free-text Child notes.
- [x] A complete record is validated and saved before first Parent authentication completes; an
      invalid, partial, unknown-version, or failed write cannot create an authenticated family.
- [x] App initialization restores the validated family receipt and approved paired-Child markers
      without restoring a Parent or Child session.
- [x] Returning Parent verification reuses the family, bypasses every first-family screen, opens
      Parent Home, and may show one Parent-authorized welcome summary.
- [x] Returning paired Child verification opens only that Child's Today dashboard and may show one
      Child-authorized welcome summary.
- [x] Fresh setup and first pairing do not show a returning-user welcome summary.
- [x] Parent and Child selectors, Parent summaries, permission access, and direct profile actions
      exclude an unconfigured internal Child slot.
- [x] Parent reset clears the family record and paired markers before exposing signed-out entry;
      pairing revocation removes the local marker before the access revocation completes.
- [x] Family Basics asks for family name, application language, and one or two Children before any
      Child form.
- [x] Setup presents exactly one indexed form for each selected Child, preserves prior drafts on
      Back, then shows one whole-family review and success handoff.
- [x] Each Child form requires nickname, botanical avatar, age band, and preferred language;
      optional choices cover gender, interests, hobbies, support, accessibility, and prepared
      personalization opt-out.
- [x] Gender is optional and never enters the personalization function. No identity, contact,
      free-text note, diagnosis, inferred emotion, media, or task history enters it either.
- [x] The sparkle-marked profile helper is deterministic, prepared, local-only, limited to
      allowlisted coaching style/category suggestions, says AI may be wrong, and leaves every task
      decision with the Parent.
- [x] Arabic and English strings share the central resource, setup uses logical direction, and the
      current Soft Geometric botanical theme is reused without another UI library.

## Automated and source evidence

| Check                                | Status   | Evidence                                                                                                                                                                            |
| ------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local schema/repository              | `PASSED` | strict shape/version, corruption, invalid time, idempotent paired marker, failed-write preservation, and clear coverage                                                             |
| Multi-child onboarding               | `PASSED` | indexed drafts, selected-count validation, immutable completion receipt restoration, and configured-profile authorization coverage                                                  |
| Bounded personalization              | `PASSED` | deterministic output, opt-out, exact allowlist, and rejection of gender/identity/free-text/sensitive inputs                                                                         |
| Store/access integration             | `PASSED` | configured-role filtering, paired-marker lifecycle, returning-role boundaries, role isolation, and reset clearing                                                                   |
| Localization and presentation source | `PASSED` | Arabic/English key parity, shared design primitives, 48dp controls, keyboard-aware scroll, and labeled sparkle helper                                                               |
| Final repository checks and exports  | `PASSED` | typecheck, zero-warning lint, format check, 90 files / 1,085 tests, Expo dependency/public config, 37 product routes, 121-file web and 90-file Android JS exports, clean whitespace |

## Manual demo checklist

Run this checklist once in Arabic RTL and once in English LTR. Use 320×720 and 390×844 for the
compact browser proxy, then repeat the native-only section on the named Android device.

### Fresh one-Child family

- [ ] Reset from Parent Settings and confirm the app returns to signed-out first-run entry.
- [ ] Choose Parent, create a new family, complete the synthetic verification, and reach Family
      Basics at step `1/3`.
- [ ] Select one Child, enter a mixed-script family name, and verify long copy remains contained.
- [ ] Complete Child 1 at step `2/3`; exercise every required control, optional gender, interests,
      hobbies, support, accessibility, and personalization opt-out/on state.
- [ ] Select more than three interests/hobbies/support choices and confirm the fourth is rejected
      with a neutral limit message and no previous choice is lost.
- [ ] Confirm the AI preview updates deterministically, remains present when disabled, and states
      prepared/local/fallible/Parent-decides limits.
- [ ] Review at step `3/3`, create the family once, and confirm Parent Home shows only Child 1.
- [ ] Sign out and confirm Child access offers only Child 1; direct attempts to select Child 2 are
      rejected without changing active identity.

### Fresh two-Child family

- [ ] Reset, select two Children at Family Basics, and confirm progress is `1/4`.
- [ ] Complete Child 1 at `2/4`, continue to Child 2 at `3/4`, go Back, and confirm Child 1 data is
      retained.
- [ ] Give the two Children different names, avatars, languages, interests, hobbies, support, and
      personalization choices; confirm no value leaks between forms.
- [ ] Review both profiles at `4/4`, edit each profile, return to the same review, and create once.
- [ ] Confirm Parent Home, Parent Family, Child chooser, Child Today, Child Garden, and Child
      Settings use only the configured local names/avatars and preserve role separation.

### Returning Parent and Child

- [ ] Reload the application after family creation; verify the local family remains available but
      no Parent or Child session is silently restored.
- [ ] Complete returning Parent verification and confirm the app opens `/parent` directly without
      showing **لنبدأ بعائلتك**, Add Child, Review, or Success.
- [ ] Confirm the Parent welcome dialog is over the fully rendered Parent dashboard, contains no
      more than two Parent-authorized current updates, dismisses safely, and does not recur during
      ordinary navigation.
- [ ] Complete first Child pairing and confirm no returning dialog appears on that first entry.
- [ ] Sign out, reload, enter the same Child credential, and confirm `/child` opens directly with
      only that Child's authorized welcome updates.
- [ ] Revoke the Child device as Parent, then verify the next Child entry requires pairing again.
- [ ] Reset as Parent, reload, and verify both family restoration and paired entry are gone.

### Failure, privacy, and truthful capability labels

- [ ] Exercise empty/too-short names, storage-unavailable copy, interruption/Back, offline mode,
      repeated Continue/Create taps, and a corrupted/unknown local record without partial access.
- [ ] Inspect the device-local value and confirm it contains only the documented family/profile and
      paired-marker fields—never credentials, task/reward/garden history, media, transcripts, or
      free-text sensitive notes.
- [ ] Confirm every AI sparkle is attached to a real bounded assistant/helper action or disclosure,
      with no decorative implication of live inference, open chat, companionship, or autonomous
      approval.
- [ ] Confirm reset and sign-out wording distinguishes clearing local demo state from deleting a
      production account or cloud record.

## Physical Android evidence packet

These rows cannot be passed by source inspection, web screenshots, or an Android JavaScript export.

| Exercise                                                              | Status              | Device/build       | Evidence to record                                      |
| --------------------------------------------------------------------- | ------------------- | ------------------ | ------------------------------------------------------- |
| Cold, warm, and hot launch with family restoration                    | `BLOCKED / NOT RUN` | No attached target | timestamps, route, and session-not-restored observation |
| Native Back through both Child forms, review, modal, and role handoff | `BLOCKED / NOT RUN` | No attached target | route/state before and after each Back action           |
| IME/keyboard on family and Child names                                | `BLOCKED / NOT RUN` | No attached target | keyboard type, scroll visibility, submit behavior       |
| TalkBack order, labels, modal trap/restore, and selected states       | `BLOCKED / NOT RUN` | No attached target | screen recording or narrated observation                |
| 200% OS font scale, safe areas, 320-class phone and tablet            | `BLOCKED / NOT RUN` | No attached target | captures with overflow/target findings                  |
| Reduced motion and offline/corrupt-storage recovery                   | `BLOCKED / NOT RUN` | No attached target | settings, exact result, reset recovery                  |
| SQLite persistence and reset after process termination                | `BLOCKED / NOT RUN` | No attached target | before/after record and route observations              |

## Named-human review packet

Each reviewer records name, role, date, build/commit, `PASSED` or `FAILED`, and actionable notes.
Blank rows are intentionally not approvals.

| Review                            | Reviewer | Date | Result    | Notes                                                    |
| --------------------------------- | -------- | ---- | --------- | -------------------------------------------------------- |
| Arabic and English clarity/parity | —        | —    | `NOT RUN` | Include mixed-script names and long labels               |
| UAE cultural/content suitability  | —        | —    | `NOT RUN` | Review optional gender and family terminology            |
| Child safeguarding/privacy        | —        | —    | `NOT RUN` | Review collection minimization and AI boundaries         |
| Accessibility/usability           | —        | —    | `NOT RUN` | Include TalkBack, cognitive load, targets, and 200% text |
| Visual design/theme               | —        | —    | `NOT RUN` | Review hierarchy, sequence, modal, and compact layouts   |
| Local asset/image rights          | —        | —    | `NOT RUN` | Use the R003 manifest and provenance record              |

## Release decision

The local demo implementation may be reviewed and rehearsed. Release activation remains
`BLOCKED` until every applicable physical row and named-human row is recorded as passed. R002b
flags remain independently default off, and this packet does not approve their activation.
