# Private growth RPC contract v1

Owner-approved Feature020 migration reuses the exact Feature003 rules. Real accounts
start at zero. No synthetic progress, automatic League nominees, or sample promise is
imported. Authoritative source: immutable `app_recognitions`, canonical assigned task
metadata, and validated permanent learning documents from migration002.

The exact TypeScript DTO/command definitions are in `src/models/cloudGrowth.ts`.
`ghaf_family_growth(p_family_id uuid)` returns `CloudGrowthSnapshot`.
`ghaf_family_growth_command(p_family_id uuid,p_request_id uuid,p_command jsonb)` returns
`{snapshot:CloudGrowthSnapshot}`. Every mutation locks the family and binds its request
UUID to the exact actor/family/payload. Replay rechecks authorization and returns current
authorized state. The server never accepts totals, awards, timestamps or actor roles.

Private children, badges, learning and promises project to guardians or the own Child.
League rows expose only an opaque participant key, approved nickname, tree avatar,
confirmed Leaves, score and shared tie position. Parent-only nominations contain task
and Child references; Child projections never expose those records. Encouragement is
one of three existing prepared phrases and projects only to its sender/recipient.
The current week is the server's ISO week in Asia/Dubai. Historical weeks are retained;
the current empty week never copies nominations or score from a prior week.

The 16 canonical badge definitions remain in `BADGE_REGISTRY`. Only the canonical
P0 recycling task currently has approved sorting/coast-care mastery metadata. Each
positive acquisition recognition contributes one credit to each, once. Journey badges
derive from lifetime Seeds at 12/60/120/180. Sorting badges use 1/3/7 credits; Mangrove
Care additionally needs lifetime132, coast3 and the permanent Mangrove learning receipt.
Other badges remain locked until their exact approved evidence exists. No broad category
mapping is invented. Impact Path stations120/132/144/156/168/180 use actual lifetime
Seeds. Landscape archives use their own actual60-Seed totals, not a sample assumption.

Promises support the existing four kinds and three milestone kinds. They remain private
Parent promises fulfilled outside Ghaf, without transfers/custody/rates. The only current
explicit task/version reward-eligibility decision is canonical P0 acquisition; unknown,
maintenance, custom, zero and protected activity contribute zero. Progress includes only
eligible receipts after that version's server `promisedAt`. Landscape milestones use
the exact approved future crossing: the eligible baseline before the promise must be
below the target, and baseline plus subsequent eligible contributions must reach it.
`eligibleLandscapeBaseline` and `eligibleLandscapeSeeds` keep those authorities separate
from the overall displayed garden. An already-crossed stage cannot unlock a new promise.
Migration009 rejects newly created/revised targets without a current approved eligibility
route: only Mangrove stages and single-landscape counts are presently reachable, and the
chosen stage must still be ahead of eligible progress. Existing promises and exact request
replays retain their evidence; no prior unlocked/given promise is weakened or deleted.
Thresholds
are shoot20/sapling60/shade120/flourishing200, matching the existing garden progression.
`promised → unlocked → given` is immutable;
only promised versions may be prospectively revised, with version history retained.

`reward.revise`, monetary `reward.create`, and `reward.give` require fresh same-user
password authentication. League nomination/rest controls require it too. The shared
`ghaf_require_recent_parent_password(p_family_id uuid)` checks live membership/session
and a signed `auth.jwt().amr` password entry whose timestamp is not future and no older
than120 seconds. Missing/stale/future claims fail `reauth_required`; token `iat` alone
is never evidence. The client uses existing Auth `reauthenticate(password)` explicitly.

Parent nomination chooses five distinct already-approved, age-compatible, household
Green tasks before any is recognized. Only canonical task references with approved
challenge eligibility qualify; custom/zero/maintenance never qualify. Each selected
recognition confirms one Leaf,20points, maximum100, ties shared; extra tasks add no rank.
`expectedRevision=0` creates the first current week. Existing nominations can only change
before any credit for that participant. Rest hides that participant from rankings and
does not erase evidence, rewards, Seeds or growth. The cooperative Leaf count is separate
from Green canopy contributions and cannot award growth a second time.

Source code and automated sandbox checks do not establish hosted/native/two-device
verification. Arabic cultural/badge-copy review and original feature release gates remain
separate from truthful server persistence evidence.
