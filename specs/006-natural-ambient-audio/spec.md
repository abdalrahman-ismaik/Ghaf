# Feature Specification: Natural Ambient Audio

**Feature Branch**: `006-natural-ambient-audio`

**Created**: 2026-09-07

**Status**: Approved for implementation

**Input**: User description: "Replace the current background music with ambient sounds that keep
looping and add an option in the settings menu to turn it off. The sounds should feel ambient and
natural."

## User Scenarios & Testing

### User Story 1 - Hear calm continuous nature ambience (Priority: P1)

A family using Ghaf hears a quiet, non-musical nature soundscape that continues across the app
without a distracting stop at the end of the recording. It remains supporting atmosphere and is
never required to understand or complete an action.

**Why this priority**: Replacing the music with a convincing, continuous natural atmosphere is the
core requested experience.

**Independent Test**: Start Ghaf with the default preference, move from onboarding into Parent and
Child surfaces, and confirm that one low-volume non-verbal nature soundscape continues, loops at
its boundary, and does not change any screen or task state.

**Acceptance Scenarios**:

1. **Given** Ghaf is active in the foreground with ambient sound enabled, **when** startup settles,
   **then** a quiet nature soundscape plays and repeats without requiring a screen-specific action.
2. **Given** the soundscape reaches its end while the app remains active, **when** playback loops,
   **then** it continues without switching to music, speech, an alert, or a different volume level.
3. **Given** prepared narration is playing, **when** ambience is also enabled, **then** narration
   remains clear and the ambience stays subordinate to it.

---

### User Story 2 - Turn ambience off from either settings space (Priority: P1)

A Parent or Child can silence ambient sound from their own Settings screen with one understandable
control. The choice applies immediately to the installation and remains in effect after the app is
restarted.

**Why this priority**: Optional audio is an accessibility and comfort requirement, and a setting
that does not control current playback would be misleading.

**Independent Test**: Open Parent Settings and Child Settings independently, turn nature ambience
off, confirm immediate silence and the same off state after restart, then turn it back on and
confirm playback resumes without changing role or permission state.

**Acceptance Scenarios**:

1. **Given** ambience is on, **when** a Parent or Child turns the Settings control off, **then**
   current ambient playback stops immediately and the control announces the off state.
2. **Given** ambience was turned off, **when** Ghaf restarts or the active role changes, **then** it
   remains off and both settings surfaces show the same device-level preference.
3. **Given** ambience is off, **when** a Parent or Child turns it on, **then** playback resumes while
   the app is active without requesting a recording or media permission.
4. **Given** the preference cannot be saved, **when** a user tries to change it, **then** the prior
   state remains authoritative and Settings shows a recoverable neutral error.

---

### User Story 3 - Remain quiet when audio is inappropriate (Priority: P2)

Ghaf automatically pauses ambience when the app is no longer active or a screen reader is active,
then resumes only when the app is active, the preference is on, and playback is allowed. The exact
prototype reset returns the preference to its documented default.

**Why this priority**: Foreground-only, assistive-technology-aware playback prevents an optional
atmosphere from becoming intrusive.

**Independent Test**: With ambience enabled, background and foreground the app, enable and disable
a screen reader, and perform the Parent-authorized reset; verify pause/resume behavior and the
reset default without any effect on task, access, AI, or progression state.

**Acceptance Scenarios**:

1. **Given** ambience is playing, **when** Ghaf becomes inactive or enters the background, **then**
   ambience pauses and no operating-system background playback continues.
2. **Given** a screen reader is active, **when** the app is in the foreground, **then** ambience is
   silent while all visible content remains available.
3. **Given** ambience is enabled and was paused by app or accessibility state, **when** the blocking
   condition ends, **then** playback resumes automatically if the platform permits it.
4. **Given** a Parent authorizes the exact prototype reset, **when** reset completes, **then** the
   stored preference is cleared and ambience returns to the default-on state for the first-run
   presentation.

### Edge Cases

- An unreadable, malformed, or future-version preference record falls back to silence until a valid
  choice is stored; a cleanly absent record uses the documented default-on state, and neither case
  crashes startup.
- A browser that blocks automatic playback remains silent until the first user interaction and
  does not show a false playing state.
- Rapid repeated toggles leave the stored and displayed state consistent with the last successful
  change and never create overlapping players.
- Route changes, role handoffs, sign-out, narration replay, and language changes do not start a
  second soundscape or reset the preference.
- Audio loading or playback failure leaves the app fully usable and silent without repeated alerts.

## Requirements

### Functional Requirements

- **FR-001**: Ghaf MUST use one locally packaged, non-verbal nature soundscape instead of background
  music for ambient presentation.
- **FR-002**: The soundscape MUST contain no melody, beat, spoken content, personal data, downloaded
  field recording, or unlicensed third-party sample, and its origin MUST be documented.
- **FR-003**: Enabled ambience MUST repeat continuously while Ghaf is active in the foreground,
  without requiring navigation to remain on one screen.
- **FR-004**: Ambience MUST remain quiet and MUST become quieter than prepared narration whenever
  both play.
- **FR-005**: Ambience MUST pause when the app is inactive/backgrounded or a screen reader is
  active, and MUST NOT enable operating-system background playback.
- **FR-006**: Parent Settings and Child Settings MUST each expose the same device-level ambient
  sound on/off control without reauthentication or a role-permission change.
- **FR-007**: The control MUST apply to current playback immediately and present its current state
  accessibly in Arabic and English.
- **FR-008**: A successful preference change MUST persist locally across restart, sign-out, and role
  handoff; it MUST NOT be represented as account sync or a family-wide remote setting.
- **FR-009**: A failed preference write MUST retain the previous authoritative state and present a
  recoverable error without interrupting any other app behavior.
- **FR-010**: Corrupt, unreadable, or unsupported preference data MUST fail safely to ambience off
  for that launch; a successful absent-record result MUST use the documented default-on state.
- **FR-011**: The Parent-authorized exact prototype reset MUST clear the preference record and
  restore the default-on state atomically with the existing reset.
- **FR-012**: Ambient playback MUST use no network request, recording, microphone, speech
  recognition, user media, notification, or new external service.
- **FR-013**: The feature MUST create at most one active ambient player and MUST preserve all
  existing narration, access, AI, privacy, task, reward, and progression behavior.
- **FR-014**: The Settings row MUST support logical RTL/LTR order, at least a 48dp interaction
  target, 200% text scaling without hiding the control, and meaning that does not rely on sound or
  color alone.

### Key Entities

- **Ambient Audio Preference**: One versioned device-local Boolean stating whether nature ambience
  is enabled. It contains no identity, account, Child, task, media, or assistant data.
- **Ambient Playback State**: A transient decision derived from the saved preference, app activity,
  assistive-technology state, startup readiness, platform playback permission, and narration focus.
- **Nature Soundscape**: One prepared local, non-verbal audio asset with documented authorship and
  ownership, designed to repeat as quiet atmosphere rather than music.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A user can turn ambient sound off or on from either Settings screen with one control,
  and audible playback responds within one second.
- **SC-002**: The last successful choice is reflected identically in Parent and Child Settings and
  remains unchanged through restart, sign-out, language change, and role handoff in every automated
  scenario.
- **SC-003**: Two consecutive loop boundaries complete with no silence longer than 250ms, volume
  jump, melody, speech, or alert during a physical-device listening review.
- **SC-004**: Backgrounding and screen-reader activation stop ambience in every supported test, and
  zero background playback or recording permission is observed.
- **SC-005**: Arabic and English Settings controls remain understandable and operable at compact
  width and 200% font scale, with an announced on/off state and a minimum 48dp target.
- **SC-006**: Preference corruption, read failure, write failure, and audio failure each leave the
  complete deterministic app journey usable with silence and no lost product state.

## Assumptions

- Ambient sound is enabled by default because the request is to provide an off option for the
  replacement background experience; users can silence it immediately from either Settings space.
- “Keep looping” means continuous foreground app ambience, not operating-system background audio.
- “Natural” means a calm non-musical soundscape inspired by breeze, foliage, water, and restrained
  bird activity; it does not claim to be a field recording.
- The existing locally authored nature soundscape is the approved source unless listening review
  identifies a clearly audible musical or loop-seam defect.
- Subjective naturalness, loudness, and seam quality require a named human listening review on the
  authoritative Android device; source inspection and automated tests cannot pass that gate.
