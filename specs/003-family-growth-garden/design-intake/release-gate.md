# Design-Intake Release Gate — Ghaf R001 Batch 1

**Recorded:** 2026-09-02

**Integration owner:** `/root`

**Gate result:** **PARTIALLY RELEASED**

The user's 2026-09-02 instruction explicitly approves implementation of the supplied foundations,
Welcome, and first-time Parent onboarding screens. This decision releases only the bounded work
below. Full AC-00 and T120 remain **BLOCKED**.

## Gate Review

| Requirement                                   | Evidence                                                                   | Result                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Selected Stitch release supplied and approved | `ghaf-r001`; explicit user instruction naming the first approved batch     | `PASSED` for Batch 1                                                  |
| Canonical compositions                        | Seven Arabic `screen.png` files inventoried and visually reviewed          | `PASSED` for Batch 1 default states                                   |
| Structure/measurement hints                   | Seven `code.html` files inspected without granting runtime authority       | `PASSED`                                                              |
| Design system                                 | Supplied `design-system/DESIGN.md`; conflicts resolved in root design docs | `PASSED` for Batch 1                                                  |
| Formal screen specifications                  | No `screen-spec.md` exists                                                 | `MISSING`; conservative native behavior recorded                      |
| Matched English LTR frames                    | None supplied                                                              | `BLOCKED` as visual evidence; runtime parity still required           |
| Focus/error/loading/offline/font-scale frames | None supplied                                                              | `BLOCKED` as visual evidence; semantic shared variants still required |
| Exact Batch 1 routes/Back/modal behavior      | `route-component-map.md`                                                   | `PASSED`                                                              |
| Product/child-safety review                   | `product-safety-audit.md`                                                  | `PASSED` for Batch 1 with capability labels                           |
| Arabic/RTL/accessibility design review        | `accessibility-audit.md`                                                   | `CONDITIONAL`; native verification pending                            |
| Visual review                                 | `visual-audit.md`                                                          | `PASSED` for partial native translation                               |
| Font decision                                 | Local Expo-compatible packages; no remote runtime font request             | `RELEASED` for implementation; native rendering pending               |
| Later Revision 2 screen families              | No approved frames                                                         | `BLOCKED`                                                             |
| Physical Android and named human review       | No qualifying evidence in this intake                                      | `BLOCKED` / `NOT RUN`                                                 |

## Released Runtime Boundary

Implementation may change only what is needed for:

- canonical R001 color, typography, spacing, radius, elevation, and motion tokens;
- locally bundled Alexandria 400/700/800 and Readex Pro 400/500/600/700 with deterministic loading and
  fallback;
- true RTL/LTR primitives, accessible shared controls, code-native botanical/icons, and the
  transactional onboarding shell;
- `/`, `/access/parent/sign-in`, `/access/parent/verification`,
  `/access/parent/family-basics`, `/access/parent/add-first-child`,
  `/access/parent/review-create`, and the transparent modal
  `/access/parent/family-created-success`;
- the smallest deterministic local Parent verification/onboarding draft and route-guard state;
- bilingual resource copy and focused tests for only those behaviors; and
- success navigation to the preserved `/parent` integration destination without redesigning it.

This partial release may not be cited as proof that the full Parent access, Child access, pairing,
reauthentication, Parent Home, Parent/Child navigation, or full Revision 2 session is implemented.

## Still Blocked

- All other Parent and Child screens, tabs, routes, states, assets, and interactions.
- Production authentication, identity verification, biometrics, secure pairing, persistence,
  networking, invitation, media capture, unrestricted AI, payments, public League, and measured
  environmental-impact claims.
- Full replacement of the canonical Al Noor/Salem/Alya demonstration state by the screen-local Palm
  Family draft.
- Full T120 cross-artifact release, AC-00 acceptance, complete food-rescue journey, full reset,
  Android acceptance, and named Arabic/UAE/safeguarding/accessibility/family review.

## Evidence Rule

Fresh automated and web evidence may validate only the implemented Batch 1 boundary. English
screens produced from resources and semantic state variants may be tested, but their visual status
must remain “implementation parity without supplied Stitch reference.” Source/web results cannot
pass native keyboard, Back, font loading, TalkBack, physical touch, 200% Android scale, or safe-area
evidence.

## Full-Gate Exit

T120 and AC-00 change from `BLOCKED` only after the remaining Arabic/English screen families and
meaningful states are supplied, audited, reconciled across the complete Feature 003 artifacts, and
explicitly released by the integration owner. Until then, this document is a narrow exception, not
a substitute for the full design-intake gate.
