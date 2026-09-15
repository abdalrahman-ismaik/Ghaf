# Feature 017: مصروفي competition card

Status: implementation authorized by the user's 2026-09-13 request. Synthetic competition
experience only; no issuer, account, PAN, custody, funding, real purchase or payment integration.
This additive contract authorizes simulated money/card views beyond Feature 003's private
Family Reward promise. It does not change that promise, Seeds, growth, League or release flags.

## Stories and acceptance

1. Parent opens Family → Masroofi, chooses a configured Child, confirms age 10 or older,
   enables the card, and sets per-purchase/daily limits, online permission and freeze state.
   Age 6–8 is always ineligible; age 9–11 requires explicit age-10+ attestation because the
   directory stores bands, not birthdays. Ages 12–14 still require Parent enablement. In explicit
   competition entry mode, the known fixture ages also apply: Salem (9) is ineligible; Alya (11)
   is the card-demo profile. Parent attestation cannot override a known under-10 fixture age.
2. Parent attaches a fixed AED amount to a specific approved, unaccepted task occurrence.
   The amount is locked immediately, cannot be reduced/deleted, and is hidden from the Child
   until recognition. Child sees a clear fixed-reward notice before acceptance. No random rewards.
   Only exact curated Green Impact/home-responsibility acquisition templates are eligible;
   unknown, modified, recognition-only, maintenance and sensitive tasks fail closed.
3. Child completes the ordinary task with optional permitted help. Submission earns no money.
   Existing Parent praise then recognition credits the fixed amount exactly once. Retries,
   repeated confirmation, navigation and help do not duplicate or reduce credit. A task-version
   mismatch cannot credit a different agreement. Simulated credit is immediately available;
   do not invent a real transfer/pending-bank state.
4. Child and Parent see a realistic native card and private activity. Child projections omit all
   unearned reward amounts and other profiles. No card/money data enters AI or shared projections.
5. A finite practice shop offers eight spending categories: stationery, books, sports, arts and
   crafts, outings, snacks, gifts, and games. Each has one fixed, local sample purchase. Child
   can switch categories without navigating away. Parent sets each category independently;
   the existing stationery-only default remains and new categories require Parent opt-in. Enforce
   enabled/frozen, category, online, per-purchase/daily limits, balance and duplicate request checks.
   Declines explain the rule and never debit. Purchases reduce only simulated money, never Seeds.
6. Parent can add bounded demo funds for practice. All balances begin at zero, and all funding is
   visibly simulated. Controls apply prospectively; freeze does not remove earned credit.
7. Full prototype reset and family replacement clear cards, promises and transactions. State has
   the same in-memory competition-session lifetime as task progress; this is not durable banking.

## Design

Arabic-first, equivalent English; Alexandria/Readex Pro and incumbent botanical tokens.
Card-first composition with pearl/sand, ink and red woven detailing, a UAE flag accent and
crisp architectural engraving. The user rejected the green-dominant first card on 2026-09-13.
The card uses an original UAE-inspired composition; no official emblem or issuer logos.
Native readable text and restrained decoration; no usable card number/CVV.
Remove repeated DEMO stamps and simulated qualifiers from card artwork, balance and routine
feedback. One concise, visible simulation notice immediately below the card on each role's
screen explains that balances and purchases are virtual. Keep the practice-shop and top-up
context honest without repeating that notice throughout the page. Task reward notices retain
their own truthful label because they appear outside the card screen.
Compact-width, long names, font scaling, readable bidi amounts and accessible controls required.
All copy is in bilingual resources. Modern Standard Arabic; human cultural review remains open.

## Scope and validation

One service contract/local implementation integrated through the existing registry/store.
One Parent and one Child contextual route; entries in Parent Family and Child Today/task.
No new dependency. Independent Masroofi build switch; enabled for this authorized synthetic
competition implementation, disableable without activating any R002b or live capability flag.
Focused domain/store/route/resource tests plus typecheck, lint, format and full regression.
Web visual inspection is secondary; physical Android and named human acceptance reported separately.
