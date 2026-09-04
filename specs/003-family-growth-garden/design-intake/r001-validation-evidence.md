# R001 Batch 1 Validation Evidence

**Status:** R001 BATCH 1 IMPLEMENTED — AUTOMATED AND WEB-PROXY CHECKS PASSED — NATIVE AND HUMAN
EVIDENCE REMAINS OPEN

**Evidence date:** 2026-09-05

> **R002 INTAKE RECEIVED — PRODUCT CONFLICTS OPEN — IMPLEMENTATION BLOCKED**

## Authority and scope

This record covers only the released R001 native foundation and seven-surface first-time Parent
onboarding flow. The [R001 release gate](release-gate.md) and
[artifact manifest](r001-artifact-manifest.md) remain the authority for what was released. The
seven PNG files are canonical composition references; their HTML exports were used only as
read-only measurement hints and are not runtime code.

No result below releases R002, a later Parent or Child screen, or a Revision 3 Growth Journey
surface. The preserved `/parent` route is only the post-onboarding handoff destination.

## Validated implementation checkpoint

| Field                        | Value                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| Worktree                     | `/home/smyk/projects/Ghaf-r002-reconciliation-20260904`           |
| Branch                       | `integration/r3-r001-implementation-20260904`                     |
| Preserved remote baseline    | `a6ca21a6`                                                        |
| R001 design-reference commit | `79943d2`                                                         |
| Access implementation        | `df3349f`                                                         |
| Design foundation            | `b7d6631`                                                         |
| Expo Audio peer declaration  | `c3f75f1`                                                         |
| Parent-onboarding routes     | `4b47394`                                                         |
| Font-bundle optimization     | `f4451c1fdc057ae36cc4d0b586ebb1ff9b329acc`                        |
| Upstream at validation       | `origin/integration/r3-r001-implementation-20260904` at `f4451c1` |
| Divergence at validation     | `0` behind / `0` ahead                                            |

The post-R001 inventory is **16 product route files**: the preserved ten-route implementation,
with `/` recomposed in place, plus the six approved `/access/parent/**` additions. Layout files and
`app/+html.tsx` are framework files and are not counted as product routes. The static web export
contains 18 generated routes because Expo also emits `/_sitemap` and `/+not-found`.

## RED-to-GREEN evidence

The final audit intentionally exercised the route, access, loading, and modal contracts with:

```bash
npx vitest run tests/parent-onboarding-controller.test.ts tests/parent-onboarding-store.test.ts tests/r001-onboarding-flow.test.ts tests/r001-design-foundation.test.ts tests/operator-demo-flow.test.ts --reporter=default
```

The RED run produced **4 intended failures with 75/79 tests passing**:

- completed onboarding entries and Success dismissal could reopen Review instead of handing off to
  `/parent`;
- Family Basics and Add Child inputs remained editable during their loading transitions;
- status announcements were conditional instead of covering every status change; and
- the neutral button variant used by the approved sign-in composition was not in the primitive
  contract.

After the bounded fixes, the same command passed **5 files and 79/79 tests**. The final source audit
also verified that React hooks precede conditional returns, modal gestures are disabled, completed
entry guards hand off to `/parent`, the onboarding receipt remains capability-scoped, and reset
invalidates onboarding authority without changing the synthetic Salem/Alya fixtures.

Earlier access and design-foundation RED/GREEN work remains attributed to commits `df3349f` and
`b7d6631`; this section does not reconstruct or invent command output that was not retained.

## Automated and build validation

| Check                                       | Result   | Observed evidence                                                                                                                                     |
| ------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused access/onboarding/route suite above | `PASSED` | 5 files, 79/79 tests                                                                                                                                  |
| `npm run verify`                            | `PASSED` | TypeScript, Expo ESLint, maintained-file Prettier check, 29 files / 482 tests, Expo dependency check, and production web export all completed         |
| `npx expo-doctor`                           | `PASSED` | 21/21 checks passed                                                                                                                                   |
| `npx expo config --type public`             | `PASSED` | Public config resolved; Android predictive Back is enabled                                                                                            |
| Android JavaScript export                   | `PASSED` | `npx expo export --platform android --output-dir <temporary-directory>` produced one Hermes bundle from 1,947 modules, 35 assets, and a 5.2 MB `.hbc` |
| Product-route inventory                     | `PASSED` | Exactly 16 product route files; all ten remote route files remain and only six approved access-route files were added                                 |
| `git diff --check` at runtime checkpoint    | `PASSED` | No whitespace errors                                                                                                                                  |

The Android export bundled only the approved Ghaf weights—Alexandria 400/700/800 and Readex Pro
400/500/600/700—from the direct font imports. Material Symbols remained a transitive Expo Router /
Expo Symbols asset, not a copied Stitch web dependency.

The production web export generated all 16 product routes plus Expo's sitemap and not-found output.
The emitted bundle is generated build output and is not retained as source evidence.

## Canonical PNG comparison at 390×844

Each current Arabic surface was rendered at 390×844 and manually compared with its canonical PNG.
The source PNGs are 487 pixels wide and have varying heights; they were treated as proportional
composition references, not fixed React Native canvases or maximum content heights.

| Surface / route        | Result   | Browser-proxy evidence and disposition                                                                                                            |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Welcome `/`            | `PASSED` | Ghaf hero, locale control, hierarchy, Parent action, unavailable Child action, and disclosure match the approved composition                      |
| Parent sign-in         | `PASSED` | Centered title, identifier field, neutral biometric action, dominant action, validation, and disclosure retain the reference hierarchy            |
| Verification           | `PASSED` | Six-cell visual code treatment, real accessible input, resend/status behavior, and fixed action region preserve the reference structure           |
| Family Basics          | `PASSED` | Progress, back action, form hierarchy, lock/privacy explanation, and dominant continuation align with the reference                               |
| Add First Child        | `PASSED` | Avatar, name, age, support choice, natural scroll, and fixed continuation preserve the intended hierarchy and RTL order                           |
| Review and Create      | `PASSED` | Family/Child summary, privacy points, natural-scroll action region, avatar treatment, and create/edit hierarchy align with the long reference     |
| Family Created Success | `PASSED` | Native modal ownership, dimmed Review context, compact bottom sheet, success mark, message, and primary handoff preserve the approved composition |

Curated evidence files:

- [`release-01-welcome-ar-390x844.png`](../../../output/playwright/r001-batch-1/release-01-welcome-ar-390x844.png)
- [`release-02-parent-sign-in-ar-390x844.png`](../../../output/playwright/r001-batch-1/release-02-parent-sign-in-ar-390x844.png)
- [`release-03-verification-ar-390x844.png`](../../../output/playwright/r001-batch-1/release-03-verification-ar-390x844.png)
- [`release-04-family-basics-ar-390x844.png`](../../../output/playwright/r001-batch-1/release-04-family-basics-ar-390x844.png)
- [`release-05-add-first-child-ar-390x844.png`](../../../output/playwright/r001-batch-1/release-05-add-first-child-ar-390x844.png)
- [`release-06-review-create-ar-390x844.png`](../../../output/playwright/r001-batch-1/release-06-review-create-ar-390x844.png)
- [`release-07-family-created-success-ar-390x844.png`](../../../output/playwright/r001-batch-1/release-07-family-created-success-ar-390x844.png)

The older duplicate captures, generated comparison boards, and raw browser-session files are not
release evidence and should remain untracked.

## Responsive, state, and interaction evidence

| Exercise                                                   | Result                            | Direct observation and limitation                                                                                                                                                                                                                 |
| ---------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arabic RTL, 390×844                                        | `PASSED`                          | Full seven-surface journey; zero horizontal overflow and zero browser console errors                                                                                                                                                              |
| Small viewport, 320×568                                    | `PASSED`                          | Full Arabic journey; long forms and Review recovered through natural scrolling; [`release-responsive-small-add-child-ar-320x568.png`](../../../output/playwright/r001-batch-1/release-responsive-small-add-child-ar-320x568.png) retained         |
| Large phone, 430×932                                       | `PASSED`                          | Full English LTR journey; [`release-responsive-english-success-430x932.png`](../../../output/playwright/r001-batch-1/release-responsive-english-success-430x932.png) retained                                                                     |
| Tablet proxy, 800×1280                                     | `PASSED`                          | Full Arabic journey retained centered, bounded content without fixed-canvas stretching; [`release-responsive-tablet-welcome-ar-800x1280.png`](../../../output/playwright/r001-batch-1/release-responsive-tablet-welcome-ar-800x1280.png) retained |
| Natural scrolling                                          | `PASSED`                          | Add Child and Review retained all content and dominant actions without horizontal overflow                                                                                                                                                        |
| Reduced browser height                                     | `PASSED` as web proxy             | At 320×360 and 390×480, focused forms required manual scroll and then recovered; this is not native IME evidence                                                                                                                                  |
| Reduced motion                                             | `PASSED` on web proxy             | Full journey under `prefers-reduced-motion: reduce`; Success settled at opacity 1 with identity transform and zero errors                                                                                                                         |
| Offline presentation                                       | `PASSED` as deterministic preview | `?preview=offline` retained the sign-in banner, local-fallback disclosure, Verification offline copy, and zero errors                                                                                                                             |
| Real connectivity loss detection                           | `NOT RUN`                         | No device/network-offline exercise was performed; the MVP intentionally adds no connectivity library                                                                                                                                              |
| Loading/disabled/validation/error/success source contracts | `PASSED`                          | Focused tests cover locked transitions, status announcements, validation, retry, idempotent creation, and modal ownership                                                                                                                         |
| Success exit and browser Back                              | `PASSED` on web proxy             | Both Success exits handed off to `/parent`; subsequent Back stayed at `/parent` with zero errors                                                                                                                                                  |
| Success accessibility containment                          | `PASSED` on web proxy             | Accessibility snapshot hid underlying Review content and disabled its controls while the modal was open                                                                                                                                           |
| Default browser font rendering                             | `PASSED`                          | Alexandria/Readex roles loaded and the inspected layouts remained readable                                                                                                                                                                        |
| Native 130% and 200% font scale                            | `NOT RUN`                         | No named Android build/device was exercised                                                                                                                                                                                                       |

## Native Android and human evidence boundary

| Gate                                                                       | Result    | Required next evidence                                                                  |
| -------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| Install and launch on a named Android device                               | `NOT RUN` | Install this exact runtime checkpoint and record device/OS/build                        |
| Android system/predictive Back and modal gesture timing                    | `NOT RUN` | Exercise authorized, loading, denied, dismiss, post-success, and reset states on device |
| Native keyboard/IME avoidance                                              | `NOT RUN` | Exercise every form with the actual device keyboard                                     |
| TalkBack order, focus containment, announcement, and restoration           | `NOT RUN` | Named device/build and recorded reading/focus order                                     |
| Native safe areas and 48dp physical touch behavior                         | `NOT RUN` | Named phone and target tablet observations                                              |
| Native reduced motion and 130%/200% font scale                             | `NOT RUN` | Android accessibility settings on the named build                                       |
| Native offline launch/continuation                                         | `NOT RUN` | Disable connectivity on the named device and complete the deterministic flow            |
| Fluent Arabic/UAE, safeguarding, sustainability, and accessibility reviews | `NOT RUN` | Named reviewers, reviewed build/content version, findings, and disposition              |

The Android JavaScript export proves bundle construction only. Browser/source evidence does not
pass any native or human gate.

## Remaining deviations and assumptions

- R001 has no `screen-spec.md`, matched English PNGs, or Stitch frames for focus, loading, error,
  offline, keyboard, large-font, or reduced-motion states. Those states use the shared native
  system, but visual approval is not claimed.
- The deterministic prototype uses truthful local-fixture copy, which can wrap differently from
  the shorter composition reference. Safety and capability truth take precedence over reproducing
  misleading placeholder behavior.
- Long reference screens become naturally scrollable at runtime. Only explicitly released action
  regions remain fixed.
- The Success surface uses a lightweight translucent scrim rather than adding a blur dependency.
  Its hierarchy and modal accessibility ownership remain intact.
- The web proxy does not include a physical Android status/navigation bar, OEM font rendering,
  TalkBack, or real IME behavior.
- Actual connectivity detection is not part of this deterministic local MVP; the offline preview
  verifies messaging and fallback presentation only.

## Preservation confirmation

- The private five-Leaf League, `task_recycling_p0_v1`, Family Reward, deterministic synthetic
  voice with `expo-audio`, profile isolation, privacy projectors, and Parent-authorized reset remain
  in place and their regression tests pass within the 482-test suite.
- No Stitch HTML/CSS/JavaScript, DOM element, generated web project, remote font, overlapping UI
  library, production authentication, backend, payment, or real Child media path was added.
- The original worktree was not switched or edited during this validation. Its R002 directory
  remains untracked and outside this integration worktree.
- No R002 or Growth screen was implemented, imported, staged, or released.

The implementation gate remains exactly:

> **R002 INTAKE RECEIVED — PRODUCT CONFLICTS OPEN — IMPLEMENTATION BLOCKED**
