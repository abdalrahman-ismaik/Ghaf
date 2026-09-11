# Data Model: Family Plus Capacity Preview

## Family Plan Offer

Immutable reviewed metadata used for presentation and arithmetic only.

| Field                  | Type                              | Rule                                             |
| ---------------------- | --------------------------------- | ------------------------------------------------ |
| `id`                   | `'free' \| 'ghaf_plus'`           | Stable local identifier; never a Play product ID |
| `availability`         | `'available' \| 'future_preview'` | Free is available; Plus is preview-only          |
| `minimumChildProfiles` | positive integer                  | Free starts at one; Plus begins at three         |
| `maximumChildProfiles` | positive integer                  | Free is two; Plus proposal is six                |
| `monthlyPriceFils`     | non-negative integer or `null`    | Free is `null`; Plus is `1999`                   |
| `annualPriceFils`      | non-negative integer or `null`    | Free is `null`; Plus is `15999`                  |
| `currency`             | `'AED'`                           | Pricing hypothesis currency                      |
| `householdWide`        | `true`                            | One plan for the household                       |
| `perChildFee`          | `false`                           | No per-Child fee within plan capacity            |
| `advertising`          | `'none'`                          | Both plans remain ad-free                        |
| `coreJourneyIncluded`  | `true`                            | No core task-to-growth paywall                   |
| `purchaseProcessing`   | `false`                           | No checkout or charge in the prototype           |
| `childFacingPromotion` | `false`                           | Commercial content is Parent-only                |

### Validation rules

- Plus minimum must equal Free maximum plus one.
- Plus maximum must equal six for this hypothesis.
- Price values use integer fils and cannot be negative.
- Annual price must be less than twelve monthly prices.
- Neither plan may expose reward, progression, safety, privacy, accessibility, or AI-authority
  fields.

## Capacity Decision

A pure interpretation of a requested Child count.

| Requested count | Decision                | Effect                                       |
| --------------- | ----------------------- | -------------------------------------------- |
| `1` or `2`      | `free_available`        | Existing onboarding draft may use that count |
| `3` through `6` | `plus_preview_required` | Open preview; do not mutate draft            |
| Any other value | `unsupported`           | Fail closed; do not mutate draft             |

This decision is transient. Only the existing validated `1 | 2` onboarding draft is stored.

## Price Hypothesis

Derived, deterministic presentation values:

- Monthly: `1999` fils = AED 19.99.
- Annual: `15999` fils = AED 159.99.
- Twelve-month comparison: `23988` fils = AED 239.88.
- Annual saving: `7989` fils = AED 79.89.
- Display saving: `33%`, rounded to the nearest whole percent.

## Commercial Scenario

`annualPriceFils × illustrativePayingHouseholds` produces gross annual billings in fils.

Rules:

- Household count must be a non-negative safe integer.
- Output is exact integer arithmetic.
- The result is labeled illustrative gross billings, never revenue forecast, net revenue, margin,
  valuation, or profit.
- Fees, tax, refunds, churn, acquisition, infrastructure, AI, support, and operations remain
  outside the calculation.

## Transient UI State

`plusPreviewVisible: boolean` belongs only to the mounted Family Basics route.

Transitions:

```text
closed -- Parent selects 3–6 option --> open
open -- return action / scrim / Android Back --> closed
closed -- route unmounts --> discarded
```

Opening or closing the preview changes no store, repository, family draft, route authority, or
entitlement.

## Explicitly absent production entities

The prototype has no subscription, purchase token, order, receipt, renewal, cancellation, trial,
entitlement, billing account, server verification, analytics event, or extra Child profile entity.
