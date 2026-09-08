# Research: Family Connection Planning

## Existing family setup is the correct entry point

- **Decision**: Extend `/access/parent/family-basics` and keep it as setup step 1 rather than adding
  a new route.
- **Rationale**: The route already owns family name, language, capacity, Back-state preservation,
  compact access styling, Parent authority, and the transition to indexed Child setup. Parent/
  guardian information can appear first within that established step without increasing route or
  rehearsal complexity.
- **Alternatives considered**: A separate adult-directory route would lengthen the judge spine and
  require new route guards/progress arithmetic. Collecting relatives after Child setup would break
  the requested order and weaken whole-family review.

## The local-family directory should own the minimized data

- **Decision**: Add structured guardian/relative data to the Parent draft and completion receipt and
  as separate non-authority fields in the local family record; upgrade the strict record to schema
  3 and migrate both current schema 2 and older schema 1 fixtures.
- **Rationale**: The directory already provides device-local persistence, strict parsing, clone
  isolation, startup restoration, and exact reset. A second repository would introduce partial-save
  states and another reset/migration authority for data that belongs to the same family-creation
  transaction.
- **Alternatives considered**: A separate connection-plan repository was rejected because family
  creation could succeed while relatives failed to save. Session-only state was rejected because
  Parent Family must remain useful after restart.

## Structured fields minimize family sensitivity

- **Decision**: Store a 2–40-character primary Parent/guardian display name, an optional additional
  Parent/guardian display name, and zero to six relatives containing only a stable local slot ID,
  2–40-character display name, one allowlisted relationship, and one allowlisted rhythm.
- **Rationale**: This is enough to personalize local task ideas while avoiding contact, location,
  free-text family history, family-status inference, and other data the MVP does not need.
- **Alternatives considered**: A free-form family tree, maternal/paternal branches, contact import,
  phone/address fields, birthday, notes, and unlimited relatives were rejected as unnecessary and
  sensitive.

## Rhythm is descriptive, not a scheduling engine

- **Decision**: Offer weekly, monthly, every three months, and no schedule as Parent-selected labels
  with no dates, elapsed-time logic, reminders, overdue state, or completion history.
- **Rationale**: The user can express “each period” while the competition build stays offline,
  deterministic, non-punitive, and free from production notification/calendar infrastructure.
- **Alternatives considered**: Real recurrence dates and local notifications were rejected because
  they require time-zone, permission, background, cancellation, and missed-period behavior beyond
  this MVP.

## Derive plan entries; do not persist or execute them

- **Decision**: A pure module validates the directory and derives exactly one current plan entry
  per relative. The entry uses an allowlisted bilingual idea ID, declares recognition-only/no-
  effects behavior, requires Parent review, preserves Child choice, and includes an equal remote
  alternative. Entries are displayed on Parent Family and are never passed to task, reward,
  assistant, League, Circle, or shared-growth services.
- **Rationale**: Derived state cannot drift from the directory and cannot become a second task or
  reward authority. It makes the family-bond concept judge-visible without contradicting the sole
  executable P0 recycling task.
- **Alternatives considered**: Persisted plan objects duplicate source data. Enabling all Roots &
  Kinship templates in the assignment service would materially widen the approved P0 lifecycle and
  its Child/check-in/reward regression surface.

## Use sourced MSA ideas with a bounded candidate addition

- **Decision**: Use the existing Roots & Kinship patterns—guardian-arranged visit/call, ask for a
  family story, phone-free time with a willing relative, and a thank-you message—and one bounded
  “offer small safe help” candidate. Label the whole result prepared/local and keep named UAE
  cultural, Arabic, safeguarding, and accessibility review `NOT RUN` until performed.
- **Rationale**: These ideas directly support the user's family-cohesion goal and match the existing
  research/product rules: human recognition over material rewards, several family-approved options,
  no forced affection, and adult ownership of safety and contact.
- **Alternatives considered**: Dialect, religious wording, gahwa handling, mandatory visits,
  culturally universal claims, and relationship-quality scoring were rejected.

## Progressive disclosure keeps Family Basics usable

- **Decision**: Show the primary name first, mark the second guardian and relatives optional, and
  open one inline relative editor at a time. Saved relatives become compact summary rows with 48dp
  Edit/Remove actions; the editor uses wrapping radio-like chips and keeps one clear Continue action.
- **Rationale**: The existing route is already information-dense. Progressive disclosure preserves
  the fast skip path while making optional entries obvious, editable, and touch accessible.
- **Alternatives considered**: Six empty relative cards, a family-tree illustration, dropdown-only
  controls, and a modal-per-relative flow were rejected for cognitive load, keyboard friction, or
  extra state.

## Parent Family is the smallest useful post-creation surface

- **Decision**: Add one tonal Family Connections section directly below the Parent Family hero,
  before configured Children. It shows guardian names once and one dedicated stacked row per
  relative with rhythm, idea, alternative, and recognition-only/local-prepared boundary.
- **Rationale**: Parent Family already owns private household information and selected-Child-neutral
  family context. The section remains read-only and does not compete with the primary task journey.
- **Alternatives considered**: Parent Home would add dashboard density; the existing horizontal
  action row is too cramped for long Arabic; Task Builder would imply executability; Child Today
  would expose adult-entered names and create participation pressure.
