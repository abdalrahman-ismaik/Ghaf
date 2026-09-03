# Route, Component, and Navigation Map — Ghaf R001 Batch 1

**Frozen scope:** shared native foundations plus the seven approved routes/states below.

## Route Tree

```text
app/
├── _layout.tsx                                # root native Stack + modal option
├── index.tsx                                  # /
├── access/parent/
│   ├── sign-in.tsx                            # /access/parent/sign-in
│   ├── verification.tsx                       # /access/parent/verification
│   ├── family-basics.tsx                      # /access/parent/family-basics
│   ├── add-first-child.tsx                    # /access/parent/add-first-child
│   ├── review-create.tsx                      # /access/parent/review-create
│   └── family-created-success.tsx             # transparent modal over review
└── parent/
    └── _layout.tsx                            # authenticated Parent guard
```

`/parent` remains the integration destination after success. Its visual redesign and the Parent
Home tabs are outside this release.

## Navigation and Guard Contract

| Route                                   | Required prerequisite                        | Back/dismiss                                                                                | Primary transition                                    |
| --------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `/`                                     | None; canonical reset entry                  | System Back exits/stays per platform root behavior                                          | Parent → sign-in; Child → local unavailable notice    |
| `/access/parent/sign-in`                | None                                         | Replace/back to `/`                                                                         | Valid identifier → verification                       |
| `/access/parent/verification`           | Submitted synthetic identifier               | Missing prerequisite replaces sign-in; Back/change returns to sign-in                       | Valid local code → family basics                      |
| `/access/parent/family-basics`          | Verified synthetic Parent state              | Missing prerequisite replaces sign-in; Back → verification                                  | Valid draft → Add first Child                         |
| `/access/parent/add-first-child`        | Valid family draft                           | Missing prerequisite replaces family basics; Back → family basics                           | Valid Child draft → review                            |
| `/access/parent/review-create`          | Valid family and Child drafts                | Missing prerequisite replaces the earliest invalid setup route; Back/edit → Add first Child | Idempotent local create → success modal               |
| `/access/parent/family-created-success` | Local creation receipt and Review beneath it | Overlay/system Back dismisses to Review and retains the draft                               | Go to Home replaces onboarding history with `/parent` |

Deep links never reveal Parent Home or later protected data without the applicable local access
state. Reset/history integration must return to Arabic RTL `/`; the full atomic Revision 2 reset is
still outside this batch.

## Shared Foundation Boundary

| Responsibility                                                                                                            | Intended native boundary                                                                           |
| ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Canonical color/type/spacing/radius/motion values                                                                         | `src/design/tokens.ts`                                                                             |
| Safe-area, scroll, keyboard, text, input, button, focus/error/busy primitives                                             | `src/components/primitives.tsx`                                                                    |
| Locale control and page-level direction                                                                                   | `src/components/LanguageSwitcher.tsx`, `src/i18n/**`, root layout synchronization                  |
| Native route Stack and transparent-modal presentation                                                                     | `app/_layout.tsx`                                                                                  |
| Authenticated Parent destination guard                                                                                    | `app/parent/_layout.tsx`                                                                           |
| `AccessScreen`, `AccessHeader`, `AccessFooter`, `OrganicBackdrop`                                                         | `src/components/access/AccessShell.tsx`                                                            |
| `OtpInput`, `SegmentedControl`, `ChoiceChip`, `PrototypePill`, `StatusBanner`, `SummaryCard`, `InfoRow`, `LabeledDivider` | `src/components/access/AccessControls.tsx`                                                         |
| `BotanicalAvatar`, `BotanicalAvatarPicker`                                                                                | `src/components/access/BotanicalAvatar.tsx`                                                        |
| Code-native access iconography through `GhafIcon`                                                                         | `src/components/access/GhafIcon.tsx`                                                               |
| Native dim overlay, focus boundary, and animated `SuccessSheet`                                                           | `src/components/access/SuccessSheet.tsx` plus the transparent-modal route                          |
| Stable access-component exports                                                                                           | `src/components/access/index.ts`                                                                   |
| Deterministic Parent access and onboarding draft                                                                          | Existing model → access policy/service → Zustand command path; no route-local authentication logic |

`AccessScreen` owns responsive safe areas, optional keyboard avoidance, central scrolling, and
optional fixed header/footer slots. `OtpInput` uses one native input behind responsive visual cells.
`SuccessSheet` uses native modal semantics and reduced-motion parity. Routes remain thin.

## Onboarding State Contract

The session uses one ground-truth access state plus one draft:

```ts
type ParentAccessState =
  'signed_out' | 'code_sent' | 'verifying' | 'verified' | 'authenticated_parent';

interface ParentOnboardingDraft {
  readonly familyName: string;
  readonly appLanguage: 'ar' | 'en';
  readonly child: {
    readonly nickname: string;
    readonly avatarId: 'ghaf_tree' | 'leaf' | 'flower' | 'energy_leaf' | 'water_drop';
    readonly ageBand: '6_8' | '9_11' | '12_14';
    readonly preferredLanguage: 'ar' | 'en' | 'both';
    readonly accessibilityDefaults: readonly (
      'larger_text' | 'simpler_instructions' | 'high_contrast' | 'reduced_motion'
    )[];
  };
}
```

Routes render state and dispatch commands; they do not validate codes, claim biometric security,
or mutate access directly. Loading/error/offline are explicit operation states, not extra routes.

## Shell Behavior

- Access stack uses the platform-native stack transition; reduced motion uses an immediate/fade
  equivalent.
- Header is safe-area aware and reserves symmetric 48dp side slots so the Ghaf wordmark stays
  centered in both directions.
- Progress text is semantic and direction-aware: 1/3, 2/3, 3/3.
- Form center scrolls naturally. Explicit bottom actions avoid the keyboard and bottom inset; they
  may join the scroll on 320×568 or at increased font scale rather than obscure content.
- The success route uses transparent-modal presentation and one accessible sheet surface. It does
  not import a bottom-sheet library.
- The shell has no bottom tabs, role toggle, cross-role shortcut, remote call, or web-only element.

## Out-of-Batch Routes

Child access/pairing, Parent Home tabs, Child tabs, Task Builder, Check-in, Garden, League, Family
Rewards, Coach/Guide, settings, permissions, devices, reauthentication, celebration, and later
reset/operator controls remain unfrozen and blocked on approved Stitch frames.
