# R002b Combined Child Reveal specification

> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

Status: code-native implementation candidate. Flag: `r002b_reveal_bundle_v2`, default off.
Owner route: `/child/reveal/:bundleId`, presented as one route-owned modal surface.

## Purpose and composition

Present every already committed consequence of one authoritative event once, coherently, and without
calculating reward. Use one modal announcement, Parent praise first, a stable scrollable consequence
list, and a single fixed-safe action region. Task approval and zero-Seed learning completion use
distinct truthful introductions. The full stable layout is the reduced-motion experience; optional
botanical transitions never gate comprehension or dismissal.

## Bundle authority and order

Resolve only `reveal:<profileId>:<triggerEventId>` from the active profile queue. Render applicable
committed references in this order: Parent praise; Seed delta and before/after; plant/stage growth;
canopy; eligible Green Circle; private League Leaf; Challenge Leaf; private Family Reward; newly
earned badges; reached Impact Path stations; unlocked learning; optional safe-help recognition.
Absent consequences are omitted; existing ones are never suppressed because art is unavailable.
The route cannot commit, recompute, reverse, or duplicate any consequence.

## Lifecycle, navigation, and recovery

Use `ready → presenting → acknowledged → archived`. Only one bundle is visible; queue order is
deterministic. Interruption resumes the same bundle; acknowledgment/dismissal is idempotent and never
reverses progress; archived bundles never rebuild. Wrong-profile bundles remain deferred. Task
submission before Parent approval creates no reward bundle. Learning may create a zero-Seed bundle
only for a genuinely new eligible outcome.

Entry follows the active Child handoff, not arbitrary deep links. Invalid ID/profile/origin falls
back to `/child` without acknowledging another profile. Actions may return to Today or open one
validated Growth destination. Back follows the same acknowledgment policy and restores focus.
When the flag is off, retain the R002a result experience and never display both.

## States and accessibility

Cover minimal/maximal consequence sets, task approval, learning outcome, ready/presenting,
already-seen/archived, duplicate trigger, queued events, offline, missing art, recoverable lifecycle
error, interrupted/recovered, and reduced-motion stable content. Trap focus within the modal,
announce once, permit scrolling/skip without forced timing, keep 48×48 actions clear of safe areas,
restore focus, and provide text alternatives/non-color distinctions at 200% text.

## Copy, provenance, and acceptance

All copy is bilingual and action-specific; symbolic growth is not measured impact. Artwork uses
the R003 provenanced local recognition image and remains decorative/supporting; sound is optional
and never autoplayed. Prove one
bundle per profile/event, complete consequence parity/order, exactly-once presentation transitions,
queue recovery, profile isolation, zero-reward submission/learning semantics, flag exclusivity,
origin safety, large-text scrolling, and reduced-motion parity. Canonical 390×844 and native modal,
Back, TalkBack, and interruption evidence remain pending.
