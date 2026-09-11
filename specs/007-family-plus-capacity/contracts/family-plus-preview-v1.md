# Family Plus Preview UI Contract v1

## Authority

This is a Parent-facing presentation contract. It has no billing, entitlement, identity, Child
profile, reward, progression, or navigation authority.

## Entry

- Surface: `/access/parent/family-basics`.
- Authority: `parentOnboarding.status === 'verified'` with no completion receipt.
- Trigger: a full-width 3–6-Child Ghaf Plus capacity row immediately after the existing free
  one/two-Child selector.
- Trigger test ID: `family-plus-capacity-trigger`.

The trigger must expose button semantics, a concise accessibility label, a visible Plus marker,
capacity, household-wide message, and a directional cue. It must remain disabled while Family
Basics is busy.

## Preview

- Component: `FamilyPlusPreview`.
- Root test ID: `family-plus-preview`.
- Content test ID: `family-plus-preview-content`.
- Presentation: one native modal boundary and bottom sheet over the current Family Basics screen.
- Dismissal: visible return action, scrim press, or Android Back.
- Motion: the existing sheet transform/opacity timing; reduced motion presents the final state
  immediately.
- Focus: opening announces/focuses the title and summary; dismissal returns to the still-mounted
  Family Basics context.

### Required visible content

1. Ghaf Plus and 3–6-Child household capacity.
2. Free: up to two Children, complete core journey, ad-free.
3. Plus: up to six Children, one household plan, no per-Child fee, same safe core journey.
4. Proposed price label.
5. AED 19.99 monthly.
6. AED 159.99 annual and 33% saving.
7. No Child-facing ads or purchase pressure.
8. Prototype disclosure: no subscription, purchase, charge, entitlement, or extra profile is
   activated.
9. One dominant “Back to family setup” action.

## State invariants

- The trigger never calls `updateParentOnboardingDraft`.
- `childCount` remains `1 | 2` before, during, and after the preview.
- The preview imports no store, service registry, repository, networking, analytics, or billing
  module.
- The preview adds no route.
- Opening repeatedly results in one visible modal.
- Unmounting discards the transient open state.

## Bilingual and accessibility behavior

- All visible strings come from the existing Arabic/English resource tree.
- Arabic is the starting locale and uses logical start/end order.
- Price values use Arabic UAE or English UAE number formatting and tabular numerals.
- Latin currency/brand runs are isolated where necessary.
- Required content is not truncated; the sheet scrolls at 320dp and 200% text.
- All interactive targets are at least 48dp.
- Meaning does not rely on gold, the lock icon, or animation alone.
- Child screens contain no corresponding commercial resource or component.

## Exit and recovery

After dismissal, the Parent can select one/two Children and continue the unchanged setup. If the
app is offline, the preview behaves identically. No recovery state is required because there is no
remote or persistent operation.
