# Research: Calm Ambient Soundscape

## Decision 1: Remove tonal accents instead of tuning them

**Decision**: The v2 source contains filtered noise textures only. It has no sine oscillator,
bird-like tonal generator, melody, rhythm, speech, or alert-like event.

**Rationale**: Objective spectrum inspection of v1 shows repeated narrow events and recurring
energy near the documented bird-like accents. That pattern can make a nominally natural ambience
feel synthetic or mechanical. Removing the entire event class directly answers the user's report.

**Alternatives considered**:

- Lower the v1 bird accents: rejected because a quieter repeated motif can still become obvious
  during looping.
- Replace them with sampled birds or water: rejected because downloads, license review, and field
  recording provenance add avoidable risk to this MVP.
- Add calm music: rejected because melody and rhythm conflict with the existing non-musical ambient
  product contract and may compete with narration.

## Decision 2: Use a centered breeze-and-distant-water texture

**Decision**: Mix low-contrast brown and pink noise bands into one mono texture, with energy focused
below prominent speech detail and upper-frequency content gently limited.

**Rationale**: Filtered broadband textures avoid recognizable motifs and hard stereo movement. Mono
is consistent across the competition phone/tablet speaker and headphones and preserves the current
asset/channel contract. The installed player already applies quiet and narration-ducked levels.

**Alternatives considered**:

- Wide stereo motion: rejected because headphones can make movement distracting and small devices
  can collapse it unpredictably.
- Pure white noise: rejected because its high-frequency emphasis can feel hissy and fatiguing.
- Very low brown noise only: rejected because small mobile speakers may make it disappear or sound
  like electrical hum.

## Decision 3: Version beside v1 and switch one static binding

**Decision**: Add `calm-soundscape-v2.mp3`, preserve `nature-soundscape-v1.mp3`, and change only the
root provider's local source path.

**Rationale**: This is the smallest reversible runtime change. It retains the complete existing
preference, lifecycle, accessibility, narration, offline, reset, and failure behavior and permits a
one-line rollback after device listening.

**Alternatives considered**:

- Overwrite v1: rejected because it destroys exact prior provenance and weakens rollback.
- Add a sound picker: rejected because the user requested a calmer default, not a new settings flow.
- Stream a remote track: rejected because it breaks offline demo reliability and adds privacy,
  availability, and licensing concerns.

## Decision 4: Build a circular crossfade and separate objective from subjective evidence

**Decision**: Author more source material than the delivered cycle, join its ending to its opening
through an equal-power circular crossfade, then inspect duration, channel layout, loudness, peak,
silence, waveform, and spectrum. Reserve calmness and seam acceptance for named human listening on
the authoritative Android build.

**Rationale**: A circular crossfade can reduce boundary discontinuity, but codecs and device output
can still reveal artifacts. Measurements establish identity and catch clipping/dropout regressions;
they cannot prove that a person finds the result relaxing.

**Alternatives considered**:

- Fade to and from silence: rejected because every cycle would expose an obvious breathing gap.
- Rely only on automated metrics: rejected because the user complaint is subjective.
- Claim the sound is relaxing from its source recipe: rejected because authored intent is not human
  listening evidence.
