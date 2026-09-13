# Implementation Plan: Access Family Portraits

**Branch**: `009-access-family-portraits` | **Date**: 2026-09-08 | **Spec**:
[spec.md](spec.md)

**Input**: Approved Feature 009 specification from
`specs/009-access-family-portraits/spec.md`

## Summary

Make the existing Welcome habitat and shared Parent access portrait frames responsive 3:2, replace
the single-father Parent candidate with a versioned two-adult composition that adds a fictional
Emirati mother in abaya and hijab, and add a two-child Emirati composition to Child profile access.
Both new images remain locally bundled, decorative, failure-safe, and unrelated to identity or
profile selection. Extend the existing Expo Image presentation and non-blocking section preload;
change no route, copy, state, credential, remembered-device, or progress authority.

## Technical Context

**Language/Version**: TypeScript 6.0 in strict mode

**Primary Dependencies**: Expo 57, React Native 0.86, Expo Router, Expo Image, React Native
Reanimated reduced-motion signal, existing Ghaf access components and design tokens

**Storage**: Two opaque local 1200×800 JPEG assets plus prompt/provenance text; no runtime data or
preference storage

**Testing**: Vitest source and asset-contract tests, JPEG dimension/prompt/checksum inspection,
Arabic RTL and English LTR web-proxy visual review, repository verification; Android remains
authoritative

**Target Platform**: Expo Android application; Arabic-first RTL with equivalent English LTR; web
is a secondary visual/test surface

**Project Type**: One existing Expo/React Native mobile application

**Performance Goals**: Each asset remains under 500,000 bytes; section preloads stay non-blocking;
image failure removes only its frame; no remote request or added startup-critical wait

**Constraints**: Exact responsive 3:2 frames; local `require` sources; no new route, copy,
dependency, press target, account/profile authority, biometric implication, or production claim;
320dp and 200% text resilience; original Parent file preserved; named human and physical Android
review unclaimed

**Scale/Scope**: Welcome style adjustment, one revised Parent component/source, one small Child
component, one Child route integration, two local generated assets, one non-critical preload
extension, focused tests, and narrow truth/evidence documentation

## Constitution Check

_Gate evaluated before research and rechecked after design._

- **Child dignity and privacy**: PASS. The Child composition is fictional, decorative,
  non-interactive, excluded from accessibility and state authority, and contains no real Child
  data or resemblance claim.
- **Access separation**: PASS. Existing tree avatars remain the only Child profile controls; Parent
  and Child routes, credentials, remembered-device access, and session rules do not change.
- **Arabic-first equivalence**: PASS by design. Centered nondirectional crops are not mirrored and
  the feature introduces no user-facing copy.
- **Cultural truth**: PASS for implementation scope. Clothing requirements are concrete, while no
  universal family representation or reviewed cultural-accuracy claim is made; named review stays
  `NOT RUN`.
- **Mock-first and demo reliability**: PASS. Images are local and failures remove only decorative
  frames; startup and access never wait on them.
- **Small architecture**: PASS. Existing Expo Image, tokens, route structure, and preload registry
  are extended with no dependency or state model.
- **Truthful capability labels**: PASS. Portraits have no identity, authentication, profile,
  progress, or AI authority and provenance records generation truth.
- **Specification discipline**: PASS. Feature 009 spec and its 16-item requirements checklist were
  completed before asset or runtime implementation.

Post-design re-check: PASS. One shared Parent composition is more compact and coherent than two
stacked portrait frames; the Child image is separate from the existing actionable tree-avatar
list; versioned assets and failure-safe wrappers preserve every protected boundary. No
constitution exception is required.

## Project Structure

### Source Code and Documentation

```text
app/
├── index.tsx
└── access/
    ├── child/index.tsx
    └── parent/{sign-up.tsx,verification.tsx}

assets/images/access/
├── parent-emirati/
│   ├── parent-access-emirati-family-v2.jpg
│   ├── GENERATION_PROMPT_FAMILY_V2.txt
│   └── PROVENANCE.md
└── child-emirati/
    ├── child-access-emirati-v1.jpg
    ├── GENERATION_PROMPT.txt
    └── PROVENANCE.md

src/
├── components/access/
│   ├── ParentAccessPortrait.tsx
│   ├── ChildAccessPortrait.tsx
│   ├── parentAccessAssets.ts
│   ├── childAccessAssets.ts
│   └── index.ts
└── features/startup/
    └── preloadStartupImages.ts

tests/
├── access-family-portraits.test.tsx
├── parent-access-portrait.test.tsx
└── r001-onboarding-flow.test.ts
```

**Structure Decision**: Keep one shared Parent component so all three routes inherit the
replacement; remove the obsolete compact call-site option so every route uses the same ratio. Add
one analogous Child component because the children’s image
has its own source, recycling key, test ID, and error state. Use `aspectRatio: 3 / 2` on the frame
styles; width remains layout-driven. Keep the Welcome hero on `LocalIllustration`, changing only
its frame geometry. Add Parent and Child sources only to their non-blocking section preload sets.

## Implementation Sequence

1. Record the approved image, crop, failure, cultural-truth, and no-authority contracts.
2. Write a focused RED asset/source test for both new local files and all exact 3:2 frame rules.
3. Generate one versioned Parent family composition from the current father as a style/reference
   input and one new Child composition, inspect originals, normalize to 1200×800 JPEG, embed exact
   prompts, checksum, and document provenance.
4. Point the shared Parent source at v2, convert its frame to 3:2, remove the two compact call-site
   exceptions, add the matching Child portrait, integrate it before profile choices, and convert
   Welcome to 3:2.
5. Extend the existing non-blocking section preload and verify every access action and remembered-
   device behavior remains unchanged.
6. Inspect compact Arabic/English layouts, run focused and full gates, then record only evidence
   directly observed.

## Validation Strategy

- Asset contract: exact 1200×800 JPEG dimensions, byte ceiling, embedded exact prompt, stable
  SHA-256, local source mapping, and original Parent file preservation.
- Subject review: exactly two adults / two children, requested attire, natural anatomy/fabric,
  centered crop, and no text, logo, device, unsafe prop, product state, or identity implication.
- Component contract: Expo Image, centered `cover`, memory/disk cache, reduced-motion transition,
  3:2 frame, accessibility hiding, no press handler, and whole-frame removal on error.
- Route contract: Welcome still exposes Parent/Child actions; Child portrait precedes but does not
  wrap profile choices; all Parent routes still use the same portrait component.
- Preload contract: Parent/Child access sets include their local images; neither is startup-
  critical and failure is settled rather than propagated.
- Regression: focused onboarding, access, remembered-device, reset, Arabic/English, source, and
  startup tests followed by `npm run verify` and `git diff --check`.
- Visual evidence: web proxy at 320×720 and 390×844 in Arabic/English, with 200% text simulation
  where feasible; physical Android and named human review remain `NOT RUN` unless performed.

## Complexity Tracking

No constitution violations require exceptions.
