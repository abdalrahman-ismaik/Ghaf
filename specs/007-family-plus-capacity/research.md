# Research: Family Plus Capacity Preview

**Date**: 2026-09-08
**Status**: Complete for the competition implementation

## Decision 1: Preview the larger-family entitlement without activating it

**Decision**: Family Basics will show a locked 3–6-Child Ghaf Plus option that opens a truthful
Parent-only preview. The existing one/two-Child draft remains the only executable setup.

**Rationale**: `SyntheticChildId`, access credentials, task fixtures, Seed ledgers, Garden,
League, Family Rewards, and profile-isolated service maps currently support only `child_salem` and
`child_alya`. Saving a third local profile without all of those authorities would create a broken
and misleading profile. The preview demonstrates the commercial conversion point without
pretending the production entitlement exists.

**Alternatives considered**:

- Add four profile-only records now: rejected because those Children could not complete the full
  task-to-growth journey.
- Alias additional profiles to Salem or Alya: rejected because it would mix identity, privacy,
  progress, and authorization.
- Hide larger-family capacity until production: rejected because it preserves the misleading
  two-Child product ceiling and misses the requested commercial story.

## Decision 2: Monetize household capacity, not Child outcomes

**Decision**: Free includes the complete current journey for up to two Children. The proposed Plus
benefit is capacity for up to six Children under one household price. Both remain ad-free; there is
no per-Child fee within Plus and no reward, AI, safety, accessibility, privacy, or progression
advantage.

**Rationale**: This places the commercial decision with the Parent at a genuine capacity need. It
avoids monetizing Child attention, data, performance, safety, or earned growth. Current family-app
pricing pages show household subscriptions and extra-member capacity as established patterns:
[ChoreRally](https://chorerally.com/pricing) advertises one $4.99 monthly household subscription,
[Wajly](https://www.wajly.com/) places extra children in a $2.99 monthly Premium plan, and
[Qdos](https://qdos.app/) lists one household at $6.49 monthly or $38.99 annually. These are market
benchmarks, not evidence of UAE demand or Ghaf conversion.

**Alternatives considered**:

- Per-Child pricing: rejected because it penalizes larger families and complicates the promise.
- Ads: rejected because child-directed monetization weakens trust and triggers additional policy
  risk. Google Play applies its Families ads and monetization requirements to commercial content
  shown to children or unknown-age users.
- Premium Seeds, ranks, AI safety, or help: rejected as pay-to-win or dignity/safety inequity.

## Decision 3: Use AED 19.99 monthly and AED 159.99 annual as hypotheses

**Decision**: Show AED 19.99/month and AED 159.99/year with a 33% annual saving against twelve
monthly payments. Every display calls them proposed launch prices.

**Rationale**: AED 19.99 is close to the middle of the observed family-app monthly range after
currency conversion, while AED 159.99 creates a meaningful annual commitment incentive. Twelve
monthly payments equal AED 239.88; annual savings are AED 79.89, or 33.3%, displayed as 33%.

**Alternatives considered**:

- Show no price: rejected because “premium” without a price is not a credible commercial model.
- Claim a validated price or profit margin: rejected because no UAE willingness-to-pay,
  acquisition-cost, retention, tax, store-fee, support, infrastructure, or AI-cost study exists.
- Add a free trial: rejected because the prototype cannot truthfully represent conversion,
  auto-renewal, cancellation, or trial eligibility.

## Decision 4: Keep commercial arithmetic in integer fils

**Decision**: Store price hypotheses in integer fils and expose pure helpers for annual saving and
illustrative gross billings.

**Rationale**: Integer minor units avoid floating-point drift, make the 33% calculation testable,
and prevent UI copy from becoming a second price authority. Scenario outputs are explicitly gross
arithmetic, not forecasts or profit.

**Alternatives considered**:

- Hard-code formatted prices in both locales: rejected because values could drift.
- Add a money/billing library: rejected because the feature processes no transaction and needs no
  dependency.

## Decision 5: Defer real Android billing to a secure production slice

**Decision**: Add no billing dependency or checkout. Document the production path as Google Play
Billing with server-side purchase verification, entitlement lifecycle, cancellation, restoration,
and lapse-safe profile handling.

**Rationale**: Google Play's
[Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738) generally
requires Play Billing for paid app functionality distributed through Google Play. Google's
[billing architecture](https://developer.android.com/google/play/billing/) recommends a secure
backend for purchase verification and subscription lifecycle handling, and its
[subscription policy](https://support.google.com/googleplay/android-developer/answer/9900533)
requires clear price, billing frequency, renewal, management, and cancellation disclosures. None
of those production authorities exists in Ghaf P0.

**Alternatives considered**:

- Add a fake checkout: rejected as deceptive.
- Add direct card or Stripe checkout to the Android app: rejected because it is outside P0 and may
  conflict with Google Play payments policy.
- Add Play Billing now: rejected because there is no Play product, secure verifier, account binding,
  entitlement migration, cancellation design, or approval for production financial behavior.

## Decision 6: Use a focused bottom sheet in the existing visual system

**Decision**: The 3–6-Child row opens one modal bottom sheet with a calm gold capacity accent,
short Free/Plus comparison, price hypothesis, prototype disclosure, and a single return action.

**Rationale**: The sheet is invoked by an explicit Parent request and needs a protected focus
boundary. It keeps the capacity choice understandable without adding a route or turning Family
Basics into a pricing page. Existing Ghaf tokens, typography, icons, motion, and reduced-motion
patterns are sufficient.

**Alternatives considered**:

- Always-expanded pricing cards: rejected because they overwhelm the primary setup task.
- New subscription route: rejected because it expands the route manifest and creates an implied
  checkout destination.
- Generic store/paywall design: rejected because it conflicts with the Living Family Garden system
  and would imply live purchasing.

## Evidence limits

- Market pages establish comparable pricing patterns, not market size or product-market fit.
- Proposed billings exclude Google Play fees, UAE tax treatment, refunds, churn, acquisition,
  infrastructure, AI, support, and operations; they are not profit.
- Google Play states that service fees vary; current official material says most fee-paying
  developers qualify for 15% or less, but Ghaf has no verified fee tier.
- The UAE Federal Tax Authority's e-commerce guidance states a standard 5% VAT rate for taxable
  services; Ghaf requires professional tax advice before sale.
- Named Arabic/UAE, child-safety, legal, pricing, accessibility, and physical Android review remain
  unperformed unless separately recorded.
