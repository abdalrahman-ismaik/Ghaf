# Quickstart: Family Connection Planning Validation

## Prerequisites

- Use only synthetic names.
- Start from a Parent-authorized exact reset and Arabic Welcome.
- Keep networking denied; this feature needs no remote service or MCP connection.

## Automated checks

```bash
npx vitest run tests/family-connections.test.tsx tests/local-family-repository.test.ts tests/parent-onboarding-controller.test.ts tests/r003-local-family-onboarding.test.ts
npm run typecheck
npm run lint
npm run format:check
npm test
git diff --check
```

Expected result: schema migration, strict validation, draft/receipt restoration, derivation,
privacy isolation, bilingual copy, reset, and existing journey regressions pass. The plan creates
no network request and does not alter the task-approval allowlist.

## Arabic first-family path

1. Choose Parent access, create a new family, and complete the prepared verification fixture.
2. Confirm the primary Parent/guardian name appears before the existing family fields.
3. Leave the second guardian and relatives empty; confirm Continue reaches Child setup normally.
4. Navigate Back. Add a second guardian, a grandmother on a monthly rhythm, and an uncle on an
   every-three-months rhythm.
5. Confirm each row is editable/removable and all typed names survive Arabic/English switching.
6. Complete the existing Child setup and verify the whole-family review includes only the added
   people and selected rhythms.
7. Create the family and open Parent Family. Confirm exactly two private connection entries, each
   with a current idea, remote alternative, Parent-review note, and recognition-only meaning.

## Privacy and no-effects path

1. Inspect Child Today and Child League, Circle, shared Garden, Parent Guide inputs/results, and
   Family Reward. Confirm no guardian/relative name, relationship, rhythm, or idea appears.
2. Ignore every connection idea. Confirm no overdue/missed state, notification, Seed, Garden,
   canopy, Circle, League, Reward, badge, or Impact Path value changes.
3. Complete the canonical recycling journey and confirm its established 12-Seed atomic Parent-
   approval consequences remain unchanged.
4. Run exact Parent reset and relaunch. Confirm Arabic Welcome appears and the schema-3, schema-2,
   and schema-1 local family keys are absent.

## Compact and native evidence

- Inspect Arabic RTL and English LTR at 320×720 and 390×844, including six relative rows, mixed-
  script names, keyboard movement, 200% font size, and reduced motion.
- On the authoritative Android build, verify hardware/predictive Back, TalkBack radio groups,
  focus/reading order, keyboard avoidance, process restart, SQLite migration, and reset.
- Record physical Android and named Arabic/UAE, safeguarding, privacy, accessibility, and visual
  review as `PASSED`, `FAILED`, `BLOCKED`, or `NOT RUN`; web/source evidence cannot pass them.
