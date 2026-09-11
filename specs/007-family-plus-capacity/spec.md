# Feature Specification: Family Plus Capacity Preview

**Feature Branch**: `007-family-plus-capacity`

**Created**: 2026-09-08

**Status**: Approved for implementation

**Input**: User description: "In the family creation screen, do not limit the product story to two
children. Add a premium subscription option for larger families and present monetization,
marketability, and profitability as a competition advantage."

## User Scenarios & Testing

### User Story 1 - Discover the larger-family option (Priority: P1)

A Parent choosing how many Children will use Ghaf can still select one or two profiles for the
complete free prototype journey and can also see a distinct Ghaf Plus option for a household that
needs three to six Child profiles.

**Why this priority**: The current two-choice control can imply that Ghaf is unsuitable for a
larger household. The product should acknowledge that need at the natural family-capacity decision
without interrupting the free path.

**Independent Test**: Open Family Basics as a verified Parent, confirm that one and two Children
remain selectable, select the 3–6-Child option, and verify that a Parent-only plan preview opens
without changing the saved onboarding draft.

**Acceptance Scenarios**:

1. **Given** a verified Parent is creating a family, **when** Family Basics loads, **then** one and
   two Children remain normal free choices and a separate 3–6-Child Ghaf Plus choice is visible.
2. **Given** the Parent selects the Ghaf Plus choice, **when** the plan preview opens, **then** it
   explains that one household plan is intended to cover up to six Child profiles.
3. **Given** the Parent closes the preview, **when** setup resumes, **then** the prior family name,
   language, and one-or-two-Child draft remain unchanged.

---

### User Story 2 - Understand a credible and ethical commercial plan (Priority: P1)

A Parent or judge can understand the proposed commercial model in seconds: the complete core
journey is free for up to two Children, a single Ghaf Plus household subscription is proposed for
three to six Children, and no Child sees an advertisement, purchase action, or pay-to-win benefit.

**Why this priority**: A credible revenue model strengthens the competition case only when it is
specific, transparent, and aligned with family trust.

**Independent Test**: Read the bilingual plan preview and verify that it states the proposed
monthly and annual price, capacity, annual saving, household-wide coverage, free-core parity, and
prototype truth without promising actual purchase availability or profitability.

**Acceptance Scenarios**:

1. **Given** the Ghaf Plus preview is open, **when** the Parent reviews the offer, **then** it shows
   a proposed AED 19.99 monthly price and AED 159.99 annual price with a mathematically correct 33%
   saving against twelve monthly payments.
2. **Given** the Parent compares the plans, **when** they read the free plan, **then** it includes
   the complete core task-to-growth journey for up to two Children and remains ad-free.
3. **Given** the Parent reads the Plus plan, **when** they inspect its advantage, **then** capacity
   is the only gated product benefit and it does not alter Seeds, tasks, Garden growth, League,
   Family Rewards, AI safeguards, privacy, accessibility, or support.
4. **Given** a Child uses any Child surface, **when** the Child navigates the app, **then** no price,
   plan promotion, purchase action, scarcity message, or upgrade pressure appears.

---

### User Story 3 - Keep the competition build truthful and reliable (Priority: P2)

The competition build demonstrates the commercial conversion point entirely offline while making
clear that subscription purchase, entitlement verification, and additional live profiles are
future production work.

**Why this priority**: The prototype cannot claim a sellable service that it does not process or
create incomplete Child profiles that cannot enter the full Ghaf journey.

**Independent Test**: Deny all network access, open and dismiss the preview in Arabic and English,
use Android Back while it is open, and complete the existing one-or-two-Child setup unchanged.

**Acceptance Scenarios**:

1. **Given** the device is offline, **when** the Parent opens the Ghaf Plus preview, **then** all
   content and dismissal behavior remain available without an external request.
2. **Given** the preview is open, **when** Android Back or the visible return action is used,
   **then** the preview closes before Family Basics navigates away.
3. **Given** the Parent continues setup, **when** the family is created, **then** the existing
   validated one-or-two-Child record and complete deterministic journey remain authoritative.
4. **Given** the prototype disclosure is visible, **when** a Parent or judge reads it, **then** it
   explicitly says that no subscription, purchase, charge, or extra profile is activated in this
   build.

### Edge Cases

- Repeated taps on the 3–6-Child option open at most one preview and never duplicate or persist an
  entitlement.
- Switching Arabic/English while Family Basics is active keeps the plan meaning equivalent and the
  current free Child count unchanged.
- At 320dp width and 200% text size, the capacity choice, proposed prices, disclosure, and return
  action remain readable and reachable by scrolling.
- Screen readers encounter one modal boundary, a concise plan announcement, benefits in reading
  order, and one clear return action.
- A deep link cannot open the preview outside the verified Parent setup authority.
- A future subscription lapse must never delete a Child profile or remove earned Seeds and Garden
  growth; that lifecycle is a production requirement, not prototype behavior.
- A request for more than six Child profiles is future support work and is not silently accepted.

## Requirements

### Functional Requirements

- **FR-001**: Family Basics MUST retain selectable free choices for one or two Children.
- **FR-002**: Family Basics MUST present a visually distinct Parent-only Ghaf Plus option for three
  to six Child profiles adjacent to the Child-count decision.
- **FR-003**: Selecting the Ghaf Plus option MUST open a dismissible plan preview and MUST NOT
  mutate the family draft, create a Child profile, activate an entitlement, or navigate to a
  purchase flow.
- **FR-004**: The preview MUST state that Free supports up to two Children with the complete core
  journey and that the proposed Ghaf Plus household plan supports up to six.
- **FR-005**: The preview MUST show AED 19.99 monthly and AED 159.99 annual as proposed launch-price
  hypotheses, not live store prices or validated willingness-to-pay.
- **FR-006**: The preview MUST state the 33% annual saving relative to twelve monthly payments and
  the underlying calculation MUST be deterministic and testable.
- **FR-007**: Ghaf Plus MUST be described as one household subscription with no per-Child fee
  within its proposed six-profile capacity.
- **FR-008**: Both plans MUST remain ad-free, and the free plan MUST retain the complete current
  task, help, Parent approval, Seeds, Garden, League, Family Reward, safety, privacy, accessibility,
  and offline-fallback experience for its supported profiles.
- **FR-009**: The offer MUST NOT gate or improve Seed awards, task eligibility, Garden growth,
  League position, Family Reward progress, AI safety, adult help, accessibility, privacy controls,
  or any Child dignity or safeguarding path.
- **FR-010**: No Child-facing screen MUST display plan, price, upgrade, trial, purchase, renewal,
  scarcity, or commercial-persuasion content.
- **FR-011**: The prototype MUST explicitly state at the point of use that it processes no
  subscription, purchase, charge, entitlement, or additional profile.
- **FR-012**: The preview MUST operate without network access and MUST add no payment service,
  billing dependency, external link, analytics event, account, or persistent commercial state.
- **FR-013**: Android Back MUST close the preview first; closing it MUST restore focus and leave the
  prior Family Basics state unchanged.
- **FR-014**: Arabic MUST be the starting locale with equivalent English, logical RTL/LTR order,
  locale-appropriate number presentation, at least 48dp targets, and complete meaning at 200% text
  size.
- **FR-015**: The commercial case MUST separate gross-billings arithmetic from revenue forecasts
  and profit, and MUST disclose store fees, tax, refunds, infrastructure, AI, support, and marketing
  as unvalidated production costs.
- **FR-016**: Actual 3–6-Child activation MUST remain blocked until stable dynamic profile identity,
  complete per-profile access/task/progression/privacy coverage, migration, purchase verification,
  entitlement lifecycle, cancellation, restoration, lapse-safe data behavior, legal review, and
  physical Android evidence are separately approved and implemented.

### Key Entities

- **Family Plan Offer**: A reviewed description of Free and the proposed Ghaf Plus plan, including
  household capacity, proposed price, availability truth, and invariants that are identical across
  plans.
- **Capacity Decision**: The Parent's current one-or-two-Child setup selection or a request to
  inspect the future 3–6-Child offer. Inspecting the offer never becomes an entitlement.
- **Commercial Scenario**: Transparent arithmetic that multiplies a proposed price by an
  illustrative number of paying households. It is not a forecast, valuation, or claim of profit.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A first-time Parent can identify the free two-Child capacity and the 3–6-Child Ghaf
  Plus option within ten seconds on Family Basics.
- **SC-002**: The plan preview communicates capacity, both proposed prices, annual saving,
  household-wide coverage, free-core parity, and prototype truth in one scroll at 320dp width.
- **SC-003**: Opening, dismissing, changing locale, and using Android Back produce zero changes to
  the saved family draft in every automated scenario.
- **SC-004**: The complete existing one-or-two-Child setup and deterministic journey pass with no
  changed task, Seed, Garden, League, Reward, AI, access, privacy, or reset outcome.
- **SC-005**: Automated inspection finds zero Child-route imports or translations for price,
  upgrade, subscription, trial, or purchase promotion.
- **SC-006**: The proposed annual saving and every illustrative gross-billings scenario are exact to
  two decimal places and are labeled as hypotheses rather than forecasts or profit.

## Assumptions

- “More children” is represented in this competition release as a clearly discoverable future
  3–6-Child plan because the current end-to-end domain supports only Salem and Alya; persisting a
  third partial profile would be misleading and unsafe.
- AED 19.99 monthly and AED 159.99 annual are testable launch-price hypotheses informed by current
  family-app benchmarks. UAE willingness-to-pay has not been validated.
- One subscription covers one household, not one Child, because per-Child charging would penalize
  larger families and weaken the product's family-bonding purpose.
- The commercial presentation belongs only at the verified Parent capacity decision; children do
  not participate in purchase decisions.
- Real Android subscriptions, store-localized prices, renewals, cancellation, restore, entitlement
  verification, and additional live profiles require a later production specification.
