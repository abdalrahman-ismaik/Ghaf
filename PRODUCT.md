# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

Ghaf serves one synthetic family in the competition prototype: a Parent or grandparent who turns a
household food-waste moment and family wisdom into a supervised mission, and Salem, a Child aged
8–10 who completes that mission. The immediate evaluation audience is the Khalifa University SMAC
2026 judging panel watching a single-device demonstration.

## Product Purpose

Ghaf makes a family sustainability lesson tangible. It transforms prepared household context into
a short bilingual Child adventure, preserves explicit Parent approval, records Parent-confirmed
estimated impact, and makes that impact emotionally visible through the family's growing Ghaf tree.
Success is one clear, memorable, repeatable Parent-to-Child-to-tree-growth journey.

## Positioning

Ghaf connects intergenerational family wisdom, supervised Child action, estimated food-rescue
impact, and one culturally rooted living progression metaphor in the same demonstrable loop.

## Operating Context

The competition journey runs on one shared phone in approximately 90 seconds. Arabic is the default
language, English is available throughout, and the operator switches between Parent and Child roles
without presenting that shortcut as authentication. Prepared synthetic image and audio assets,
simulated processing, and a pregenerated mission keep the journey deterministic and offline.

## Capabilities and Constraints

- Preserve exactly the ten approved screens and the existing mission lifecycle.
- Preserve Arabic-first RTL behavior, corresponding English LTR behavior, logical directional
  icons, readable mixed-script content, and long-label resilience.
- Keep the Ghaf tree as hero visual, progress indicator, emotional anchor, and demo climax.
- Keep Parent approval before assignment and before any impact, reward, or tree growth.
- Clearly label prepared, simulated, pregenerated, synthetic, and estimated behavior.
- Never imply food-safety determination, live AI when the mock path is used, real financial reward,
  production authentication, or production readiness.
- Android is the primary physical-demo target. iOS is compatibility support; web is a secondary
  development and visual-review surface.
- Use the existing Expo/React Native StyleSheet architecture, shared tokens, local components,
  deterministic state, and service contracts. Do not add a second app or production backend.

## Brand Commitments

The product name is Ghaf — غاف. The family Ghaf tree and its six deterministic stages are required
identity assets. The experience must feel distinctly connected to UAE family and environmental
life without reducing that identity to generic desert decoration or ornamental heritage motifs.
The tone is warm, clear, trustworthy, optimistic, and honest about prototype boundaries.

## Evidence on Hand

- Approved product truth and acceptance criteria: `specs/002-ghaf-core-mvp/spec.md`.
- Approved technical and screen plan: `specs/002-ghaf-core-mvp/plan.md`.
- Synthetic bilingual product copy: `src/i18n/resources.ts`.
- Synthetic prepared public-demo media: `assets/demo/`.
- Implemented six-stage SVG progression: `src/components/GhafTree.tsx`.
- Deterministic local journey and reset state: `src/state/usePrototypeStore.ts` and mock services.
- No production user evidence, commercial claims, or live-provider proof is available and none may
  be fabricated.

## Product Principles

1. Make the complete family loop understandable before adding explanation.
2. Let the Ghaf tree carry the emotional meaning of progress.
3. Treat Arabic and RTL as the first composition, not a mirrored afterthought.
4. Keep every mocked or estimated capability visibly honest.
5. Prefer one polished, deterministic demonstration over additional features.

## Accessibility & Inclusion

Both language directions must preserve reading order, hierarchy, touch targets of at least 48dp,
font scaling, visible focus and pressed feedback, reduced-motion behavior, contrast, and meaningful
accessibility roles and labels. No real Child data is used.
