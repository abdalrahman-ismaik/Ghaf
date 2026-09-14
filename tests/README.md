# Test suite

Tests are grouped by the behavior they protect. Run commands from the repository root.
Vitest discovers every `tests/**/*.test.{ts,tsx}` file recursively; moving a file must never remove
it from the suite or change its assertions.

```bash
npm test -- --maxWorkers=2
npm test -- tests/access
npm test -- tests/tasks/task-lifecycle.test.ts
npm run test:watch -- tests/growth
```

| Directory                      | Coverage                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| [access/](access/)             | Parent/Child authority, onboarding, local family, replacement and remembered access  |
| [ai/](ai/)                     | Prepared/live adapter contracts, bounded intents, safety, voice and Parent drafting  |
| [demo/](demo/)                 | Demo entry, role handoff, isolated storage, narration and playback                   |
| [family/](family/)             | Overview, League, private rewards, connection plans and privacy projection           |
| [gateway/](gateway/)           | Worker operation, capability, security and MCP contracts using controlled bindings   |
| [growth/](growth/)             | Garden, lifetime Seeds, badges, reveal, Parent progress and shared-growth boundaries |
| [integration/](integration/)   | Complete deterministic journey, operator flow and prototype state                    |
| [learning/](learning/)         | Finite learning, accessible equivalent credit and idempotent completion              |
| [messaging/](messaging/)       | Family messaging transport, consent, revocation, conversations and scoped drafts     |
| [study/](study/)               | Study plans, academic agreements, family-bound storage and guided family practices   |
| [platform/](platform/)         | Assets, brand, RTL/resources, accessibility, startup, audio and tooling contracts    |
| [presentation/](presentation/) | Released R001/R002a presentation characterization and screen composition             |
| [tasks/](tasks/)               | Task lifecycle, recognition, review, task workspace and saved templates              |
| [helpers/](helpers/)           | Shared test setup; no production code imports this directory                         |

These groups contain a mixture of pure policy, store, rendered-component and source-contract
tests. A `.tsx` suffix alone does not establish browser or native coverage. Read the assertions
to understand what a test proves. Device and named-human acceptance remain separate.

## Historical paths

The 2026-09-13 organization moved 153 tests out of the flat root without renaming their basenames.
[`legacy-paths.json`](legacy-paths.json) maps the exact previous paths to their new locations.
Historical specifications and evidence retain their original references and results. For an old
command, use the map or locate the unchanged filename:

```bash
rg --files tests -g 'task-lifecycle.test.ts'
```

Use the new paths in current work. Add new tests directly to the relevant subject folder; do not
extend the historical map for tests that never had an old path. A test helper is shared only when
multiple suites need it. Repository-tool regressions use Node's built-in runner through
`npm run repo:check` and live beside their tool in `scripts/repository/`.
