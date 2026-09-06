# R003 First-run Experience Contract

**Authority:** user-authorized presentation refinement, 2026-09-06  
**Owner:** `/root`  
**Route impact:** none; all onboarding states remain inside `/`

## Product promise

The first launch should make Ghaf understandable before asking the family to choose an access
path. Three short moments tell one honest story: choose a safe approved action, receive help and
Parent confirmation, then keep permanent symbolic growth in a private family garden. The tone is
warm, energetic, and capable rather than game-like, childish, or behaviorist.

## State and navigation contract

| State     | Purpose                                                                        | Primary action               | Secondary action | Exit                           |
| --------- | ------------------------------------------------------------------------------ | ---------------------------- | ---------------- | ------------------------------ |
| `choose`  | Show that a Child chooses among Parent-approved real-world actions             | Next                         | Skip             | `support` or Welcome           |
| `support` | Show that permitted help keeps full credit and Parent confirmation is required | Next                         | Back / Skip      | `growth` or Welcome            |
| `growth`  | Show permanent private symbolic Garden growth without an impact claim          | Start Ghaf                   | Back             | Existing Welcome access choice |
| `welcome` | Preserve separate Parent and Child access                                      | Parent access / Child access | Language         | Existing access routes         |

Onboarding completion is session-local and intentionally makes no production persistence promise.
An already-active Parent or Child session bypasses onboarding and keeps the existing redirect.
Skip is always visible. Reload may restore the first moment; the existing prototype disclosure
continues to describe this in-memory limitation. Reset remains deterministic and signed out.

## Splash and transition contract

- Expo's native splash continues to use the immutable official raster icon and local background.
- Once the React root mounts, the native splash yields to a branded app-owned splash. It remains
  only while local fonts settle, then closes on the next render frame with no fake progress
  percentage, remote request, artificial delay, or network claim.
- A transition buffer may appear only when crossing Welcome → Parent access, Welcome → Child
  access, Welcome → an already-active Parent/Child experience, Parent access → Parent experience,
  or Child access → Child experience.
- Parent-to-Parent, Child-to-Child, bottom-tab, nested-screen, Back, and locale changes never show
  the transition buffer.
- Reduced motion removes travel/scale choreography and uses a direct short opacity handoff.

## Visual and asset contract

Use the official raster Ghaf logo plus exactly four new local raster photographs:

1. `onboarding-action` — a safe household sustainability-action still life;
2. `onboarding-support` — a sheltered Ghaf seedling as a non-literal support metaphor;
3. `onboarding-growth` — a seed-to-leaf botanical study that clearly reads as symbolic growth;
4. `section-transition` — a quiet Ghaf leaf-shadow texture with open space for live status copy.

All generated assets follow Quiet UAE Botanical Editorial: natural warm light, tactile detail,
crop-safe composition, no people, faces, hands, readable text, logos, brands, UI, vectors, hazards,
fantasy effects, or environmental-quantity claims. Copy, logo, progress, and controls remain live.
The images are never mirrored for RTL and load through the existing local illustration registry.

## Layout, copy, and accessibility

- Arabic is first; English is equivalent, not a shortened alternate.
- Alexandria owns display text; Readex Pro owns body, status, and controls.
- One dominant action per onboarding moment, minimum 48 dp targets, visible progress (`1/3` plus
  dots), resilient wrapping at 320 and 390 widths, and no horizontal swipe dependency.
- Every meaningful photograph has localized alternative text. Decorative transition texture is
  hidden from accessibility. Step changes use a polite live-region announcement.
- The final Welcome retains the visible local/synthetic prototype disclosure and distinct Parent
  and Child actions; onboarding does not grant either role.

## Acceptance and evidence

- Source and flow tests prove three ordered states, skip/back/next/start, exact route count,
  active-session bypass, no new authority, local raster mapping, and bounded transition groups.
- Arabic RTL and English LTR are inspected at 320×720 and 390×844 with standard and reduced motion;
  text must wrap without clipping or horizontal overflow.
- Automated and web-proxy evidence cannot pass physical Android splash timing, TalkBack, native
  font scale, or named Arabic/UAE/accessibility review. Those remain `BLOCKED` or `NOT RUN` until
  directly observed.
