# Ghaf Stitch Design Release r001

**User approval:** 2026-09-02

**Release status:** **PARTIALLY RELEASED** for the seven-screen Arabic Parent-onboarding batch and
its native foundations only. This is not a full Feature 003 Revision 2 design release.

## Approved Batch

The user approved these compositions for implementation:

1. Welcome
2. Parent sign-in
3. Verification code
4. Family basics
5. Add first Child
6. Review and create
7. Family-created success sheet

The batch also releases the design tokens, Alexandria/Readex Pro font integration, RTL primitives,
shared access controls, and the transactional onboarding navigation shell needed by those screens.
Parent/Child tab shells and every post-onboarding screen remain blocked.

## Authority Order

1. Each `screen.png` is the canonical composition reference for its named default Arabic state.
2. The constitution, active Feature 003 product/safety/privacy/accessibility requirements, and root
   design contract resolve any conflict that would weaken safety, truth, RTL, type size, or touch
   access.
3. `design-system/DESIGN.md` supplies the approved batch palette, typography families, spacing,
   radii, and tonal-layering language.
4. Each `code.html` is a non-runtime measurement, structure, copy, and interaction hint only.

The generated HTML/CSS/JavaScript, remote font links, Material Symbols font, Tailwind configuration,
DOM elements, web dependencies, and fixed preview canvas must not enter the Expo runtime.

## Viewport Interpretation

The supplied PNGs are 487 px wide and vary from 772 to 1242 px high. They are scaled composition
references for the requested 390×844 review viewport, not fixed runtime canvases. Native screens
must use safe areas, responsive widths, keyboard avoidance, and natural scrolling. Only the
transactional header, explicitly anchored action region, and success sheet may remain fixed.

## Missing Design Evidence

This release contains no `screen-spec.md`, `reference-top.png`, `source.html`, English LTR frame,
separate loading/error/offline/focus/font-scale frame, font binary/license record, or exported
botanical/icon/illustration asset. The `assets/` subdirectories are empty. The implementation must
provide the requested functional states through the shared native system, but those variants do not
gain pixel-level design approval from this release.

See [SCREEN_INDEX.md](./SCREEN_INDEX.md) and the
[design-intake release gate](../../../../../specs/003-family-growth-garden/design-intake/release-gate.md)
for the exact scope and remaining block.
