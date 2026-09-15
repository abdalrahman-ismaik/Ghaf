# Claude co-author cleanup — 2026-09-15

## Authority and objective

The user explicitly approved removing Claude's historical co-author credit and publishing the
rewritten main history after discussion of the required guarded force push and GitHub refresh.
The requested change preserves all commit contents, the other contributor's backend work and
the repository's AI-assistance records. Human author/committer identities are not reassigned.

## Exact scope and backups

Original main: `3b5b22381b3a14b1492535797b45d47c946f2912`.
Backend merge parent: `8ce97131791700c7321e5e0f2ace9ada72fe0d63`.
Rewritten merge: `e4caedd376f3f4c32300f722a181aac7770090de`.
Both merge trees: `b1f01fcfbce6bd7f0522af4974bdda54750e6d14`.

Exactly ten commit messages lose their Claude co-author trailer. Those ten commit IDs and the
dependent final merge ID change. The final merge's second parent remains the original backend
tip. No patches are replayed, files discarded, merges flattened or backend commits recreated.
All 599 commits reachable from that backend tip retain their original IDs and remain reachable.

Local backup branch `backup/pre-coauthor-cleanup-20260915` retains the complete original main.
The earlier local backup remains too. A verified incremental bundle at
`output/coauthor-cleanup-20260915/pre-cleanup.bundle` preserves the changed history and requires
the original common ancestor `35631f7` and backend tip `8ce9713`. These backups stay local and
intentionally retain the old trailers. They must not be pushed back into the cleaned history.
The exact old/new mapping and raw-object verification receipt are in the same ignored directory.

## Verification and prevention

- PASSED: exactly ten matching trailers removed and eleven commit objects recreated.
- PASSED: every original/replacement tree is identical; all human author/committer metadata,
  timestamps, other header bytes and remaining message bytes are preserved.
- PASSED: ordered parent links follow only the old/new mapping; merge topology is preserved.
- PASSED: zero file diff between the original main and rewritten merge; zero remaining Claude
  co-author trailers on the rewritten history; original backend ancestry remains reachable.
- PASSED: independent raw-object review of all eleven pairs. Both histories contain 610 commits;
  their reachable sets differ exactly by the eleven mapped IDs, with no other additions or losses.
- PASSED: five repository tests, navigation/artifact policy, scoped formatting and JSON parsing.
- The separate administrative commit adds `.claude/settings.json` with empty commit attribution,
  this record, the ownership entry and the append-only AI-assistance entry. Application code,
  dependencies, Supabase migrations, translations, tests and prior evidence remain unchanged.
- Full application tests are not repeated for identical source trees. The original merge's
  3,964 passes and seven skips remain historical evidence documented in the prior delivery record.
- No hosted database changes, native checks, contributor-cache reset or support ticket are implied.

## Delivery and collaborator synchronization

Root publishes only main with an explicit expected remote SHA of the original tip. The push
must fail if remote main changes first. All other remote branches and tags remain unchanged;
remote readback and actual contributor-list observations are saved in the ignored delivery receipt.

Collaborators should save uncommitted work and local-only commits before synchronizing. A fresh
clone provides the cleanest starting point; transfer any unpublished changes onto the new main.
Do not merge or push the old affected main history back into the cleaned branch. Unchanged
backend feature branches can continue from their existing commit IDs.

GitHub documents that contributor displays can take about 24 hours to refresh after history
changes. If the displayed entry remains incorrect after that, the owner should contact GitHub
Support. See [GitHub's contributor refresh guidance](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-a-projects-contributors#contributor-data-is-stale-after-history-changes).
The repository setting follows [Claude Code's attribution configuration](https://code.claude.com/docs/en/configuration#attribution-settings).
