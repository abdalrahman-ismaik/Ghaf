# Ghaf Learning Stories — Content and Review Contract

**Status:** Proposed Feature 003 Revision 3 content workflow. No Child-facing story is approved or
implemented. Growth Journey runtime remains **BLOCKED** pending Stitch and named reviews.

## P0 package

`learning.mangrove_roots.v1` is the only complete P0 learning package to design and implement. It
supports progress toward `badge.habitat.mangrove_care.v1`; reaching station 132 unlocks the package,
not the badge.

| Field              | P0 contract                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arabic title       | **بين جذور القرم**                                                                                                                                  |
| English title      | **Among the Mangrove Roots**                                                                                                                        |
| Objective          | Recognize, in age-appropriate language, that mangrove habitat supports coastal life and requires careful stewardship                                |
| Source ledger      | `E2` in the supplied Growth Journey source ledger                                                                                                   |
| Story route        | Finite sourced story, original art, no-fail knowledge check                                                                                         |
| Equal-credit route | Story-disabled accessible module covering the same objective, followed by the same no-fail check or a Parent-guided offline discussion confirmation |
| Completion effect  | One idempotent `LearningCompletionEvent`; zero Seeds; zero garden growth; evaluate only criteria naming this package                                |
| Exit               | Return to Impact Path or **اكتملت خطوات اليوم**; never autoplay another story or task                                                               |
| Location claim     | Place-inspired only; no GPS, visit proof, check-in, camera, or microphone                                                                           |
| Capability         | Deterministic local content; no generated facts, unrestricted browser, or live AI                                                                   |

Opening, scrolling, elapsed time, or selecting a wrong answer is not completion. A wrong answer
receives a neutral explanation and another try with no loss. Both routes remain free, visible, and
equal in badge credit. If story content is disabled or a source is unavailable, the accessible route
must still work offline.

## Fact and lore separation

Each versioned package stores:

- a reviewed learning objective;
- paraphrased factual claims with source ledger IDs and the source's own date or a clearly labelled
  access date;
- original narrative framing and visual lore in separate fields;
- Arabic and English copy versions;
- factual, cultural, safeguarding, accessibility, and rights-review statuses; and
- the exact badge criteria that may consume its completion event.

Source access dates must never be labelled as Ghaf content review. The app must not display
government, tourism, UNESCO, attraction, UAE emblem, flag, or Nation Brand marks as badge or story
art, and must not imply endorsement or partnership.

## Required review before implementation

| Review                                        | Current status | Exit evidence                                         |
| --------------------------------------------- | -------------- | ----------------------------------------------------- |
| Source-link and mutable-fact revalidation     | `NOT RUN`      | URLs, claim excerpts, dates, and limitations recorded |
| Arabic and English factual equivalence        | `NOT RUN`      | Named reviewer and approved content version           |
| UAE cultural/place wording                    | `NOT RUN`      | Named reviewer, findings, and disposition             |
| Child safeguarding and age 9–11 comprehension | `NOT RUN`      | Named reviewer and comprehension notes                |
| Accessibility and equal-credit alternative    | `NOT RUN`      | Objective-equivalence and assistive-technology review |
| Original illustration and rights              | `NOT RUN`      | Asset manifest, provenance, and clearance             |

Stitch may establish composition, but it cannot approve factual claims or rights. Final live copy
must remain text, support Arabic RTL and English LTR, scale to 200%, and expose a readable
**المصدر / Source** row without requiring an external link to understand the lesson.

## Deferred packages

`learning.jubail_mangrove.v1`, `learning.ghaf_basics.v1`, `learning.wetland_basics.v1`,
`learning.date_palm.v1`, and `learning.sadu.v1` may exist as reviewed fixture prerequisites or P1
content definitions, but P0 does not require five fully authored stories. None may appear as
implemented until its objective, source, copy, equal-credit route, original art, and reviews are
complete.
