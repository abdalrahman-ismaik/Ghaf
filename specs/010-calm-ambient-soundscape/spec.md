# Feature Specification: Calm Ambient Soundscape

**Feature Branch**: `010-calm-ambient-soundscape`

**Created**: 2026-09-08

**Status**: Approved for implementation

**Input**: User description: "The current background music is weird; replace it with calm and
relaxing sounds."

## User Scenarios & Testing

### User Story 1 - Hear calm, unobtrusive ambience (Priority: P1)

A family using Ghaf hears a soft, continuous natural texture that supports the app's calm family
experience without sounding musical, artificial, repetitive, or startling.

**Why this priority**: The current sound is distracting enough that the user explicitly asked for
it to be replaced. A calmer atmosphere directly improves comfort and judge-facing polish.

**Independent Test**: Start Ghaf with Sound enabled, listen through a complete repetition and its
next boundary on the demo device, and confirm that the ambience remains soft and even with no
recognizable tune, beat, speech, bird-like chirp, alert, sharp peak, silence gap, or obvious loop.

**Acceptance Scenarios**:

1. **Given** Ghaf is active with Sound enabled, **when** startup settles, **then** one calm,
   non-verbal natural ambience plays quietly without changing any product state.
2. **Given** the ambience continues for a complete cycle, **when** prominent moments are heard,
   **then** none resemble a repeating bird call, tune, beat, alert, voice, or sudden sound.
3. **Given** playback crosses its loop boundary, **when** the next cycle begins, **then** there is no
   distracting click, abrupt level jump, or silence gap.

---

### User Story 2 - Retain quiet control and safe fallback (Priority: P1)

A Parent or Child retains the existing Sound setting and all foreground, narration, accessibility,
and reset behavior while benefiting from the calmer ambience.

**Why this priority**: A more pleasant asset must not weaken the user's ability to silence it or
change the already approved accessibility and deterministic-demo behavior.

**Independent Test**: Turn Sound off and on from Parent and Child Settings, play prepared narration,
background and foreground Ghaf, exercise screen-reader and reset states, and confirm that the same
setting and pause/duck/resume behavior remain authoritative.

**Acceptance Scenarios**:

1. **Given** the calmer ambience is playing, **when** Sound is turned off in either Settings space,
   **then** it stops immediately and remains off under the existing device-local preference.
2. **Given** prepared narration or a blocking accessibility/lifecycle state is active, **when** the
   ambience would otherwise play, **then** it ducks or pauses under the existing approved rules.
3. **Given** the ambience cannot load or play, **when** the family continues using Ghaf, **then** the
   complete app remains usable in silence.

### Edge Cases

- Very quiet phone speakers must not turn narrow high-frequency details into a repeated whistle or
  chirp.
- Headphones must not reveal hard left/right movement, speech-like patterns, or sharp transients
  hidden by a phone speaker.
- Repeated listening must not expose a short, obvious motif or boundary that makes the ambience
  feel mechanical.
- Audio loading or decoding failure must preserve the existing complete silent fallback.
- Turning Sound off during playback must not start another player or leave a residual audible tail.

## Requirements

### Functional Requirements

- **FR-001**: Ghaf MUST replace the current active ambience with one calm, locally available,
  non-verbal natural soundscape.
- **FR-002**: The active soundscape MUST contain no melody, beat, speech, alert, synthetic bird-like
  call, personal data, downloaded field recording, or third-party sample.
- **FR-003**: The active soundscape MUST avoid repeated tonal motifs, abrupt peaks, hard stereo
  movement, and prominent high-frequency events that could feel artificial or startling.
- **FR-004**: The ambience MUST maintain a soft, low-contrast level and remain subordinate to every
  spoken narration surface.
- **FR-005**: Repeated playback MUST avoid an audible click, abrupt level jump, or silence gap at its
  boundary.
- **FR-006**: The sound's origin, identity, and objective technical measurements MUST be documented,
  while subjective calmness and device listening MUST be reported only from actual human review.
- **FR-007**: The existing Parent and Child Sound setting, device-local persistence, foreground-only
  playback, accessibility silence, narration ducking, safe failure, and exact reset behavior MUST
  remain unchanged.
- **FR-008**: The replacement MUST introduce no recording, microphone use, network request,
  streaming, notification, account authority, or product-state change.
- **FR-009**: The prior soundscape MUST remain available for a reversible rollback and MUST NOT be
  selected by active playback.
- **FR-010**: The complete Arabic-first offline demo journey MUST remain usable whether the calmer
  ambience plays or fails safely to silence.

### Key Entities

- **Calm Ambient Soundscape**: One prepared, local, non-verbal audio work with documented origin,
  identity, measurements, and intended role as supporting atmosphere rather than music.
- **Prior Soundscape**: The previously active local audio work retained only as a rollback source and
  excluded from normal playback.
- **Listening Evidence**: Objective source measurements plus separately recorded, named human/device
  observations; source analysis never substitutes for subjective listening.

## Success Criteria

### Measurable Outcomes

- **SC-001**: During a complete-cycle plus two-boundary human listening review on the demo Android
  device, reviewers identify zero bird-like chirps, tunes, beats, voices, alerts, or startling
  events in the active soundscape.
- **SC-002**: The active soundscape contains no silence lasting 250 milliseconds or more and crosses
  two consecutive loop boundaries without a listener identifying a click or abrupt level jump.
- **SC-003**: The Sound control and all existing pause, duck, persistence, reset, and safe-fallback
  scenarios continue to pass with no change in visible workflow or product state.
- **SC-004**: Objective inspection finds one documented local active source, no remote dependency,
  no detected clipping, and no active reference to the prior soundscape.
- **SC-005**: The full Parent-to-Child offline demo remains completable with Sound enabled and with
  playback unavailable.

## Assumptions

- “Calm and relaxing sounds” is satisfied by one continuous nature-inspired soundscape rather than
  a playlist or a new sound-selection interface.
- A soft breeze-and-distant-water texture is the safest default because it avoids the current
  repeated bird-like tones without adding music or speech.
- The existing default-on Sound preference remains approved; the user can still silence ambience
  immediately from either Settings space.
- Human perception is the authority for calmness and seam quality; automated measurements provide
  supporting evidence only.
