# Quickstart: Validate Family Plus Capacity Preview

## Preconditions

- Use synthetic demo data only.
- Start from the signed-out Arabic Welcome and enter the new-family Parent path.
- Complete the deterministic Parent verification step to reach Family Basics.
- Do not configure or expect a Play product, payment method, purchase, or entitlement.

## Automated checks

```bash
npm run typecheck
npm run lint
npx prettier --check app/access/parent/family-basics.tsx \
  src/components/access/FamilyPlusPreview.tsx \
  src/features/family-plan/index.ts \
  src/i18n/resources.ts \
  tests/family-plus-capacity.test.tsx
npx vitest run tests/family-plus-capacity.test.tsx \
  tests/r003-local-family-onboarding.test.ts \
  tests/local-family-repository.test.ts \
  tests/r001-onboarding-flow.test.ts
npm test
git diff --check
```

Expected automated outcomes:

- Free capacity is exactly two and Plus preview capacity is exactly six.
- Integer price arithmetic yields AED 79.89 annual savings and 33% display savings.
- A 1,000-household annual example yields AED 159,990.00 gross billings and remains labeled
  illustrative, not profit.
- Arabic/English resources contain equivalent capacity, price-hypothesis, and prototype-truth
  content.
- The trigger and modal contracts exist only on Parent Family Basics.
- Existing onboarding policy and local-family schema continue rejecting a third stored profile.

## Parent journey

1. On Family Basics, enter a valid family name.
2. Confirm that One Child and Two Children remain the normal selectable choices.
3. Select the separate `3–6 Children · Ghaf Plus` row.
4. Confirm the preview states one household, up to six profiles, no per-Child fee, Free core parity,
   no ads, and proposed AED monthly/annual pricing.
5. Confirm the no-purchase prototype disclosure is visible before the action.
6. Press Android Back. The sheet closes and Family Basics remains.
7. Open it again and use the visible return action.
8. Confirm the family name, locale, and selected free Child count did not change.
9. Continue setup and complete the existing one/two-Child family journey.

## Bilingual and compact layout

Repeat at 320×720 and 390×844 in Arabic RTL and English LTR:

- no horizontal overflow;
- logical icon/copy order;
- complete prices and disclosure;
- scrollable sheet content;
- 48dp trigger and action;
- no clipped text at 200% font scale.

Record browser results only as secondary visual evidence. Android Back, TalkBack, font scaling,
reduced motion, and focus restoration require direct physical-device evidence.

## Offline and authority checks

- Deny external network access; open/dismiss behavior must remain identical.
- Inspect storage before and after: no plan, subscription, price, entitlement, or analytics record
  may appear.
- Inspect Child routes: no commercial trigger, price, plan, trial, or purchase copy may appear.
- Confirm Seeds, Garden, League, Family Reward, AI, access, privacy, audio, and reset behavior are
  byte-for-byte or outcome-equivalent to the pre-feature path.

## Judge explanation

Use the commercial case in `docs/GHAF_PLUS_COMMERCIAL_CASE.md`. Describe the price as a proposed
test, the examples as gross arithmetic, and the implemented surface as a conversion preview. Do not
claim live billing, activated additional profiles, validated market demand, revenue, margin, or
profit.
