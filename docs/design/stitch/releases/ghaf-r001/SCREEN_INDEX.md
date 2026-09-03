# Screen Index

**Release status:** **PARTIALLY RELEASED** by the user on 2026-09-02.

**Coverage:** Arabic RTL Welcome and first-time Parent onboarding only. This is not the complete
Revision 2 screen-family or state inventory.

|   # | Screen                 | Canonical PNG                                             | Exported hint                                 | Native route/state                                                    | Approval                                       |
| --: | ---------------------- | --------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------- |
|  01 | Welcome                | `screens/01-welcome/screen.png` · 487×772                 | `screens/01-welcome/code.html`                | `/`                                                                   | Default Arabic composition approved            |
|  02 | Parent sign-in         | `screens/02-parent-sign-in/screen.png` · 487×883          | `screens/02-parent-sign-in/code.html`         | `/access/parent/sign-in`                                              | Default Arabic composition approved            |
|  03 | Verification code      | `screens/03-verification/screen.png` · 487×1055           | `screens/03-verification/code.html`           | `/access/parent/verification`                                         | Empty/disabled Arabic composition approved     |
|  04 | Family basics          | `screens/04-family-basics/screen.png` · 487×1105          | `screens/04-family-basics/code.html`          | `/access/parent/family-basics`                                        | Populated Arabic composition approved          |
|  05 | Add first Child        | `screens/05-add-first-child/screen.png` · 487×1137        | `screens/05-add-first-child/code.html`        | `/access/parent/add-first-child`                                      | Populated/selected Arabic composition approved |
|  06 | Review and create      | `screens/06-review-create/screen.png` · 487×1242          | `screens/06-review-create/code.html`          | `/access/parent/review-create`                                        | Review Arabic composition approved             |
|  07 | Family created success | `screens/07-family-created-success/screen.png` · 487×1242 | `screens/07-family-created-success/code.html` | `/access/parent/family-created-success` transparent modal over review | Success-sheet Arabic composition approved      |

All seven exports are Arabic RTL. No matched English LTR frame is supplied. English must preserve
the same inventory and hierarchy using reviewed localized resources and true LTR, but remains a
runtime parity target rather than approved visual evidence.

## Interaction and State Coverage

| Screen            | Interaction evidenced by export                                                           | Required native states without a separate approved frame                                   |
| ----------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Welcome           | Locale action; Parent and Child entry actions are present in HTML below the PNG crop      | Child entry shows a truthful unavailable-for-this-batch state; offline remains fully local |
| Parent sign-in    | Identifier input, Continue, simulated biometric action, create-family action, Back        | Focused, empty/invalid, disabled, loading, offline fallback, success                       |
| Verification      | Six-digit entry, auto-advance/backspace hint, resend countdown, change identifier, Back   | Partial/paste/delete, focused, invalid, resend-ready, loading, offline fallback, success   |
| Family basics     | Family display name, primary app language, progress 1/3, Back, Continue                   | Focused, validation error, disabled, loading, offline fallback, success                    |
| Add first Child   | Nickname, tree avatar, age band, preferred language, accessibility defaults, progress 2/3 | Selection/focus, validation error, disabled, loading, offline fallback, success            |
| Review and create | Read-only draft summary, privacy/access statements, Create, edit/back, progress 3/3       | Loading, disabled, local failure/offline fallback, success                                 |
| Success           | Modal overlay, confirmation copy, go-to-Home action                                       | Open/dismiss/Back, focus containment, loading, success navigation                          |

No `screen-spec.md` exists in any screen directory. Accordingly, the interaction map above uses
only visible PNG controls, conservative HTML hints, the active product contract, and the user's
explicit request for native state handling. It does not treat Stitch Preview behavior as evidence.

## Reference Interpretation

- Compare the native implementation at 390×844 by proportional width and composition, not by
  forcing a 487 px or fixed-height canvas.
- Screens 03–07 are taller than the target viewport and require natural scrolling or an anchored
  action region as documented in the route/component map.
- The PNG wins over HTML for visual placement. The product/accessibility contract wins when an
  export shows text below 14/22, a control below 48dp, clipped bidirectional labels, or a behavior
  that would weaken child safety or capability truth.
- The generated bottom sheet is a visual reference; its open/dismiss/navigation state must be a
  native modal route.

Every later Revision 2 family—including Child access, Parent Home, role tabs, Task Builder,
Check-in, Garden, League, Family Rewards, Coach/Guide, settings, permissions, devices, and reset—
remains outside this release.
