# Design-Intake Release Gate — R001 Batch 1

**Recorded:** 2026-09-04
**Release decision:** `PARTIALLY RELEASED`
**Source provenance:** original commit
`f63e39fc702bb1797791f7543c6316e3b06f3ba9`; its 17-file R001 subtree is preserved byte-for-byte in
this integration branch. See [the artifact manifest](r001-artifact-manifest.md).

> **R002 INTAKE RECEIVED — PRODUCT CONFLICTS OPEN — IMPLEMENTATION BLOCKED**

## Authority

The user approved only Ghaf R001 native foundations, Welcome, and first-time Parent onboarding. The
PNG files in that release are canonical composition references. Stitch HTML/CSS/JS is non-runtime
measurement and structure evidence only.

This narrow release does not approve R002, a later Parent/Child screen, a Growth Journey screen, or
a replacement for remote access, League, Family Reward, voice, privacy, profile-isolation, or reset
behavior.

## Released boundary

| Area          | Released work                                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation    | Canonical R001 tokens; Alexandria display and Readex Pro UI/data roles; true RTL/LTR primitives; shared native controls; responsive safe-area, scroll, keyboard, and navigation/modal shell |
| Welcome       | `/` with language, Parent entry, honest unavailable Child entry, and synthetic-prototype disclosure                                                                                         |
| Parent access | `/access/parent/sign-in` and `/access/parent/verification` using deterministic local fixtures; no SMS, email, biometric, or production-auth claim                                           |
| Parent setup  | `/access/parent/family-basics`, `/access/parent/add-first-child`, and `/access/parent/review-create` with draft preservation and validation                                                 |
| Success       | Native transparent modal `/access/parent/family-created-success`; Back/dismiss restores Review; primary action replaces onboarding history with preserved `/parent`                         |
| Behavior      | Focused, disabled, loading, validation-error, offline, success, Back, reset, and idempotent local-create states within this route family                                                    |
| Evidence      | Fresh focused tests, full repository checks, web proxy, visual comparison, and physical-device results reported only for what was actually observed                                         |

`/parent` is an integration destination only. This release does not redesign Parent Home or expose
an ordinary role toggle.

## Required preservation

- Adapt the existing capability-scoped access service/store; never replace it with screen-local
  role authority.
- Keep Child data profile-scoped and Parent-only controls inaccessible to Child sessions.
- Preserve the private five-Leaf League, private Family Reward, deterministic synthetic voice,
  `expo-audio`, Parent-authorized reset, and `task_recycling_p0_v1`.
- Keep the screen-local family/Child onboarding draft separate from the canonical Salem/Alya demo
  fixture until an approved migration joins them.
- Use local assets and code-native SVG. Do not import a generated web project, DOM, CSS/Tailwind,
  Material Symbols font, remote fonts/images, or generated interaction JavaScript.

## Evidence gaps

| Evidence                                                       | Status                                             | Consequence                                                                             |
| -------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Seven Arabic PNG/HTML pairs                                    | `PRESERVED`; source tree and SHA-256 checks passed | May guide this batch only                                                               |
| `screen-spec.md`                                               | `MISSING`                                          | Native interaction contract above is conservative; no fabricated Stitch state approval  |
| Matched English LTR frames                                     | `MISSING`                                          | English functionality/parity required; visual match cannot be claimed                   |
| Focus/loading/error/offline/keyboard/font-scale frames         | `MISSING`                                          | Implement semantic variants consistently; keep visual evidence `NOT RUN` until compared |
| Physical Android RTL/LTR, Back, keyboard, TalkBack, 200% scale | `NOT RUN` for this integration branch              | Source/web evidence cannot pass these gates                                             |
| R002 asset provenance, variants, Growth frames, and approval   | `BLOCKED`                                          | No post-R001 runtime work                                                               |

## Exit rules

R001 may be marked implemented only after the original release bytes are preserved, focused and full
checks pass, all seven routes are compared with their PNGs, and evidence status is truthful.

The full design gate remains blocked until R002 has selected mobile references, Arabic/English
parity, mandatory screen specifications, material states, asset provenance/permissions, product
conflict dispositions, and explicit user/integration-owner approval.

This document does not itself authorize R002 or Growth implementation.
