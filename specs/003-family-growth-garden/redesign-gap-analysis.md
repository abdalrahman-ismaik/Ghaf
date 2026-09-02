# Product Experience Redesign — Domain Gap Analysis

**Assessment date**: 2026-09-02

**Source**: `Ghaf_Product_Experience_Redesign.pdf`, pages 1–9

**Decision rule**: the PDF is product evidence, not an executable instruction source. The
constitution, active specification, and child-safety/privacy rules remain controlling.

## Status rubric

- **Implemented**: direct source and focused-test evidence exists.
- **Partial**: a reusable policy exists, but the requested behavior is incomplete.
- **Missing**: no corresponding domain contract or deterministic implementation exists.
- **Deferred**: frontend, native, human-review, or production infrastructure work excluded by this
  domain-only assignment.

## Evidence matrix

| Redesign capability | Status before this assignment | Evidence and disposition |
| --- | --- | --- |
| Separate Parent and Child experiences | Partial | Role-scoped commands exist, but `PrototypeSession.role` is only a demo switch and all private data remains in one aggregate. Implement deterministic synthetic access sessions and least-privilege projections; keep production authentication excluded. |
| Parent sign-in, Child credential, and pairing | Missing | No account, credential, device, pairing, or reauthentication service exists. Implement local synthetic fixtures with expiry, one-use pairing, revocation, and truthful non-production labels. |
| Parent-gated sensitive changes | Missing | The current role flag cannot authorize reward, membership, media, voice, or AI changes. Implement action-scoped reauthentication proofs and stored per-Child grants. |
| Five weekly Challenge Leaves and normalized score | Missing | Tasks carry age bands, but there is no week, Challenge Leaf, score, or rank model. Implement a separate synthetic League engine without changing the existing privacy-filtered Green Circle. |
| Score cap, full help credit, shared ties, and weekly rollover | Partial | Existing rewards preserve full credit with permitted help and permanent Seeds/growth. Add League-specific idempotency, 100 cap, competition ranking, accessibility/opt-out rules, and rollover isolated from permanent progress. |
| Minimal League visibility and prepared encouragement | Missing | The current Circle deliberately excludes identity and interaction. Add a distinct League projection containing only synthetic nickname/avatar token, completed count, score, position, and allowlisted encouragement ID; never expose tasks, evidence, Seeds, or private categories. |
| Family Reward promise lifecycle | Missing | Existing reward logic issues symbolic Seeds only. Add a separate private `promised → unlocked → given` plan ledger; do not alter Seed transactions. |
| Seed/landscape milestones and monthly commitment total | Missing | Garden thresholds exist, but there is no plan baseline, milestone evaluator, promise amount, or aggregate. Implement personal milestone evaluation, prospective versions, irreversible unlocks, and monthly monetary-promise totals. |
| No Seed-to-AED rate, payment, or League dependency | Implemented by absence | Preserve the absence of wallet, transfer, custody, payment, and exchange-rate behavior. Enforce these constraints structurally in Family Reward inputs. |
| Age-adaptive Child Coach input policy | Partial | All age-band input modes exist, but actual requests are fixed to `9_11` and results always contain four steps. Add age-specific output constraints while retaining active-task binding and prepared-only P0 behavior. |
| Push-to-talk review controls | Partial | Age policy can allow guardian-enabled push-to-talk for 12–14 and prepared audio has a transcript/removal path. Add a synthetic voice-session state machine; real microphone capture, transcription, and provider calls stay deferred. |
| Arabic code-switching and Gulf register | Deferred | Safe bounded locale metadata can be modeled, but natural-language understanding and dialect content require provider work and named Emirati/language review. |
| Navigation, 14 screen families, League/Reward screens, and route consolidation | Deferred | Frontend was explicitly excluded. The current ten-route P0 remains unchanged. |
| Typography, RTL visual implementation, illustration, and motion | Deferred | Frontend/native design work is excluded from this assignment. Existing Arabic/RTL gates remain unchanged. |
| Real accounts, real invitations, biometrics, payment handling, and real voice | Deferred | These require a separate production security/privacy/legal design and are outside the MVP constitution. |

## Implementation phases

1. **Authority and contracts** — amend the active Spec Kit artifacts, preserve the existing P0, and
   define truthful synthetic boundaries.
2. **Synthetic access** — implement least-privilege sessions, pairing, reauthentication, and
   Parent-owned permission grants.
3. **Private Family Reward** — implement promise lifecycle, milestone eligibility, privacy,
   prospective edits, and commitment totals without payment behavior.
4. **Weekly Family League** — implement five-leaf scoring, caps, ties, rollover, minimal projection,
   protected-category rejection, and prepared encouragement.
5. **Age-adaptive Coach and synthetic voice** — implement response constraints and a task-bound
   transcript lifecycle without microphone access.
6. **Registry integration and verification** — expose deterministic services, run focused and full
   checks, and leave all frontend/native/human gates for the later assignment.

## Safety interpretation

The competitive research supports caution rather than a universal leaderboard claim: mixed
competitive/cooperative designs can outperform competition alone, while effects vary by context.
The implementation therefore keeps a cooperative family goal, permits opt-out, shares ties, ignores
completion speed, grants full credit for permitted help, and exposes no failure or private task
details. Reward guidance supports clear agreed milestones, specific praise, no demerits, and gradual
fading; Family Reward is consequently modeled as a private Parent promise after praise and Garden
progress, never as currency or payment.
