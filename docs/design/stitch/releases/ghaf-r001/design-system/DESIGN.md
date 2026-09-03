---
name: Ghaf Organic Growth
colors:
  surface: '#f9faf5'
  surface-dim: '#d9dad6'
  surface-bright: '#f9faf5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4ef'
  surface-container: '#edeee9'
  surface-container-high: '#e7e9e4'
  surface-container-highest: '#e2e3de'
  on-surface: '#1a1c19'
  on-surface-variant: '#3f4944'
  inverse-surface: '#2e312e'
  inverse-on-surface: '#f0f1ec'
  outline: '#6f7973'
  outline-variant: '#bec9c2'
  surface-tint: '#146b51'
  primary: '#00503b'
  on-primary: '#ffffff'
  primary-container: '#126a50'
  on-primary-container: '#98e7c6'
  inverse-primary: '#87d6b6'
  secondary: '#006a64'
  on-secondary: '#ffffff'
  secondary-container: '#8ef1e7'
  on-secondary-container: '#006f68'
  tertiary: '#5e4100'
  on-tertiary: '#ffffff'
  tertiary-container: '#7c5700'
  on-tertiary-container: '#ffd182'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3f3d1'
  primary-fixed-dim: '#87d6b6'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#00513c'
  secondary-fixed: '#91f3e9'
  secondary-fixed-dim: '#74d7cd'
  on-secondary-fixed: '#00201e'
  on-secondary-fixed-variant: '#00504b'
  tertiary-fixed: '#ffdeaa'
  tertiary-fixed-dim: '#f7bd4f'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5f4100'
  background: '#f9faf5'
  on-background: '#1a1c19'
  surface-variant: '#e2e3de'
  ghaf-emerald: '#126A50'
  deep-forest: '#0D3128'
  mangrove-teal: '#188B83'
  solar-amber: '#F2B84B'
  pearl-ground: '#F7F8F3'
  ink: '#14221D'
typography:
  display-lg:
    fontFamily: Alexandria
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.2'
  display-lg-mobile:
    fontFamily: Alexandria
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Alexandria
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Alexandria
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Readex Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Readex Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Readex Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
  label-sm:
    fontFamily: Readex Pro
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-mobile: 20px
  margin-desktop: 64px
  gutter: 16px
  touch-target: 48px
  unit: 4px
---

## Brand & Style

**Ghaf** is a family-oriented digital garden designed to foster positive habits through shared achievement. The brand personality is **nurturing, organic, and rooted in heritage**, taking inspiration from the resilient Ghaf tree. 

The visual style is **Soft Organic Modernism**. It avoids the sterile coldness of typical SaaS platforms in favor of:
- **Biophilic Elements:** Using soft curves, landscape-inspired SVG masks, and a palette rooted in forest and earth tones.
- **Micro-Texture:** A subtle radial dot pattern creates a sense of physical paper or fabric, grounding the digital experience.
- **Approachable Sophistication:** Balancing playful organic shapes with professional typography (Alexandria) to appeal to both children and parents.

## Colors

The color palette is derived from a desert oasis ecosystem:
- **Primary (Ghaf Emerald):** A deep, life-giving green used for main actions and branding. It represents growth and stability.
- **Secondary (Mangrove Teal):** Used for supporting UI elements and accents, providing a cooler, calming contrast.
- **Tertiary (Solar Amber):** Reserved for highlights, achievements, and "sunlight" metaphors in the garden UI.
- **Neutral (Pearl Ground):** A warm, off-white base that feels more natural and less fatiguing than pure white.
- **Surface Tints:** We use varying levels of `pearl-ground` and `surface-container` (soft greys with green undertones) to create organic depth without relying on heavy shadows.

## Typography

The typography system is optimized for Arabic/English bilingual legibility:
- **Alexandria** is used for headlines. Its geometric yet friendly structure provides a strong brand voice and high impact at large sizes.
- **Readex Pro** is used for all functional text, body copy, and labels. It is highly readable and maintains the "rounded" friendly aesthetic of the brand.
- **Visual Hierarchy:** Primary headlines should use `font-extrabold` (800) for brand impact, while supporting headlines use `font-bold` (700). Body text is kept at `font-normal` (400) to ensure the organic background patterns don't interfere with readability.

## Layout & Spacing

The system uses a **Fluid Organic Layout** with generous safe zones.
- **Mobile Grid:** A single-column layout with 20px side margins. 
- **Desktop/Tablet:** Content is centered in a container with a max-width of 1200px and 64px margins.
- **Spacing Logic:** All spacing is based on a 4px `unit`. 
- **The "Organic Lift":** The hero area is slightly offset (e.g., `-10vh`) to break the rigid vertical center and create a more dynamic, floating feel. 
- **Interactive Zones:** All interactive elements must adhere to a minimum 48px `touch-target` to ensure accessibility for both children and elderly family members.

## Elevation & Depth

Ghaf uses **Tonal Layering and SVG Masking** rather than traditional elevation:
- **Background Layer:** A subtle dot pattern (`opacity-5`) on a `pearl-ground` surface.
- **Atmospheric Layer:** Large, sweeping SVG paths in the background (`surface-container-low`) create a "landscape" that suggests depth and horizon.
- **Content Layer:** Elements are mostly flat or use extremely soft `shadow-sm` (subtle ambient occlusion) to feel like they are resting on the paper, not floating high above it.
- **Glassmorphism:** Contextual footers and temporary overlays use a `backdrop-blur-sm` with a semi-transparent `surface-container-low/50` fill to maintain the sense of a continuous environment.

## Shapes

The shape language is characterized by **Soft Geometric Curves**:
- **Primary Components:** Buttons and cards use a `16px` (rounded-2xl equivalent) corner radius to feel friendly and safe.
- **Pill Shapes:** Labels, language switchers, and status chips use `full` roundedness to provide a distinct visual contrast against structural components.
- **Landscape Masks:** Background decorative elements use fluid, non-uniform Bézier curves to mimic hills or dunes, reinforcing the "Garden" metaphor.

## Components

### Buttons
- **Primary:** Solid `ghaf-emerald` with `on-primary` (white) text. 16px rounded corners. High-impact for parent-level actions.
- **Secondary/Child:** `ghaf-emerald/10` tint with emerald text. Provides a "gentle" interaction feel suitable for frequent use by children.
- **Ghost/Utility:** `rounded-full` with no border, using `hover:bg-surface-container-low` for subtle feedback.

### Chips & Tags
- Used for trial notices or status indicators. Should use `rounded-full`, a `backdrop-blur`, and small `label-sm` typography to remain unobtrusive.

### Surface Patterns
- **The Dot Grid:** A 24px x 24px radial dot grid should be applied to the background of main landing canvases to provide texture.

### Top App Bar
- Transactional and minimal. It should be transparent to let the organic background show through, with elements pushed to the edges of the safe area.