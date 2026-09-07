# Research: Natural Ambient Audio

## Decision 1: Use one root-owned ambient player

**Decision**: Replace the onboarding-only ambience hook with one provider mounted at the app root.
It owns one player for the entire mounted application and derives play/pause from app state,
preference, accessibility state, startup readiness, and browser playback eligibility.

**Rationale**: A settings toggle must control the sound that is currently audible, and ambience
must continue across route changes. Route-local players would restart during navigation and could
overlap. Expo Audio's installed player exposes mutable `loop`, `volume`, `play()`, and `pause()`
controls and releases its native object with the hook lifecycle.

**Alternatives considered**: Keep ambience onboarding-only (the Settings control would have no
immediate effect elsewhere); mount a player on every route (route gaps and overlap risk); introduce
a new audio library (no measured gap and prohibited by the project boundary).

## Decision 2: Reuse the locally authored soundscape, but package it as app ambience

**Decision**: Move the existing 48-second mono nature soundscape from onboarding-specific assets to
an ambient asset directory and preserve its checksum and provenance. Do not download or add an
unreviewed field recording.

**Rationale**: The source is already non-verbal, offline, rights-controlled, low-volume, and built
from layered pink/brown noise with restrained bird-like accents. Its metadata shows a 44.1kHz mono
MP3, 48.039-second duration, approximately 80kbps, and no detected ≥50ms digital silence below
−50dB at the boundaries. That supports implementation, but only a human Android listening review
can judge naturalness and loop quality.

**Alternatives considered**: Download a field recording (unnecessary network, licensing, and
provenance risk); procedurally generate another unchecked asset (no evidence it sounds more
natural); use multiple simultaneous files (more player and mixing complexity with no proven value).

## Decision 3: Persist an independent versioned preference record

**Decision**: Add one strict `ambientSoundEnabled` record through the existing synchronous
device-local storage abstraction. Missing data means the documented default on. Invalid or
unreadable data means safe silence. A failed write retains the previously authoritative value.

**Rationale**: Extending the local-family or remembered-device schemas would couple an accessibility
preference to identity-shaped records and require unrelated migrations. A tiny independent record
survives sign-out and role handoff, is shared by both settings spaces, and can be cleared explicitly
by prototype reset.

**Alternatives considered**: In-memory state (lost on restart); local-family field (wrong ownership
and migration breadth); device-affinity field (would mix a presentation preference with access
continuity and disappear on ordinary logout).

## Decision 4: Derive playback; do not persist player state

**Decision**: Persist only the Boolean preference. Derive whether to play and which of two quiet
volumes to use from current runtime conditions. Unknown screen-reader state, inactive/background
app state, startup not ready, blocked browser autoplay, or playback failure all resolve to pause.
Narration uses the quieter ducked level rather than starting another ambience player.

**Rationale**: Persisting current time, playing status, app state, or narration focus would create
stale sources of truth. Derived state responds immediately and keeps reset deterministic. Pausing
the one player avoids globally disabling narration or the separately gated voice implementation.

**Alternatives considered**: Globally disable the Expo audio subsystem when ambience is off (would
also disable narration and unrelated approved audio); persist playback position (no user value and
additional state drift); continue sound under a screen reader (competes with assistive speech).

## Decision 5: Use one shared native Settings row in both roles

**Decision**: Present a native switch with a concise label and one-line explanation in a dedicated
Sound section after language and before permission/access rows on both Settings screens.

**Rationale**: Audio preference is device-level, non-sensitive, and immediately reversible. A Child
should be able to silence their dedicated device without asking for a Parent permission change,
while the Parent must also have the control required by the product accessibility contract. The
native switch provides familiar semantics and state announcement without a custom control.

**Alternatives considered**: Parent-only setting (poor Child-device autonomy); place it under Child
media permissions (incorrectly implies microphone/AI authority); create a separate route (unneeded
navigation and hierarchy).

## Spatial thesis

This is an **Operate** surface: language and sound are quiet device preferences; permissions and
paired devices remain access controls; reset and sign-out remain destructive/session actions. The
ambient row therefore sits directly after language in its own compact section, with the label and
explanation taking the flexible logical-start column and the native switch anchored at logical end.
It uses the incumbent paper-and-botanical system, existing typography/tokens, 48dp minimum height,
wrapping copy, and no decorative hero treatment, new iconography, or color-only meaning.
