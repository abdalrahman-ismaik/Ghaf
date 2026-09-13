# Repository publication — 13 September 2026

The user requested an updated README with the new logo and current information,
then a professional push of all latest changes. The user explicitly confirmed
that other editing sessions were paused and asked root to finalize everything.
The publication target is `origin/redesign/ui-experiments`; no main merge,
force-push, deployment or release-flag activation is selected.

## Integrated changes

- `b2902a1`: README uses the selected 5A mark in light and dark modes and describes
  the executable catalog, personal landscapes, Arabic v2 narration, current local
  entry, service boundaries and retained historical screenshots.
- `3b58e95`: 24 reviewed catalog tasks execute through independent approved
  occurrences, Child completion and Parent recognition. Personal landscapes and
  immutable receipt replay remain separate from shared canopy, League and rewards.
  The slice includes the corresponding routes, components, resources and tests.
- `6913c52`: all six supplied Arabic v2 clips accompany their runtime mappings,
  missing-source behavior, demo locale selection, provenance notes and regressions.
- The final documentation checkpoint preserves the paused sessions' pending
  coordination records and companion-plan handoff, and records this validation.
  Proposed companion work is not represented as an implemented feature.

The initial source was `bc21189`. Original changes were preserved before integration
in ignored `output/publication-20260913/initial-tracked.patch` and a path inventory.
No private inputs, generated poster packets, dependency folders or build outputs
were force-added. Earlier committed branding, access, messaging, repository and
poster work remains in the branch history and accompanies the push.

## Corrections before publication

Initial regression: 2,251 passed and six failed across four files. A missing
`landscapesForChild` import caused three failures. A rendered test lacked the new
`Pressable` host mock, and a source assertion still required Salem-only creation
after the accepted per-Child catalog change. These were corrected without removing
denial or isolation assertions. TypeScript also required explicit missing-entry
handling in four assignment-collection assertions.

Independent source review found that Garden still highlighted Mangrove for every
catalog receipt. It now selects the matching receipt's landscape, or the current
Child's task landscape when no receipt exists. New Arabic/English rendered-props
tests exercise HR01's actual Samar mapping and stale/sibling-context isolation.
The first test draft incorrectly expected Ghaf; the preserved canonical mapping
and actual receipt established Samar, and only the test expectation was corrected.

Lint exposed a discarded task-added presentation state. The new catalog list now
retains the existing no-early-award acknowledgement only for the matching task,
and dismisses it when changing Child or task-list context. Bilingual regressions
cover acknowledgement, unchanged progress and unknown route-token rejection.

## Verification

| Check                                                  | Result                        | Evidence                                                                        |
| ------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------- |
| Strict TypeScript                                      | PASSED                        | `typecheck-final.log`                                                           |
| Zero-warning lint                                      | PASSED                        | `lint-final.log`                                                                |
| Maintained formatting                                  | PASSED                        | `format-check-final.log`                                                        |
| Full regression                                        | PASSED                        | 167 files / 2,269 tests; `tests-final.log`                                      |
| Repository navigation and artifact checks              | PASSED                        | Five tooling tests plus repository scan; `repo-check-final-unrestricted.log`    |
| Expo dependency compatibility                          | PASSED with offline warning   | Installed dependencies reported current; not an online advisory audit           |
| Web static export                                      | PASSED with platform warnings | `web-export.log`; exit 0 and `dist/` exported                                   |
| Credential-pattern / large-artifact inspection         | PASSED for inspected patterns | No matching values in tracked or pending text; no tracked file over 10 MiB      |
| Browser / physical Android / human voice review        | NOT RUN                       | No new device, browser or listening claim                                       |
| Live Gemini, Firebase and messaging service validation | NOT RUN                       | Documentation distinguishes team architecture from observed repository behavior |

Logs are under `output/publication-20260913/`. The repository check initially hit a
sandbox `spawnSync git EPERM`; its unchanged command passed outside the sandbox.
Application checks ran with Node 24.16.0; CI remains pinned to Node 22.13.0.
Hosted CI is not represented as passed before a result is observed.

## Assistance and handoff

Codex reviewed the pending work, updated README copy, repaired integration defects,
prepared regressions, formatted owned files and ran the recorded checks. One
read-only reviewer inspected CE1 authority seams; after its release, one bounded
test helper wrote the Garden regressions. Helpers had no descendants or competing
test/build jobs, and both released their scopes. These are AI contributions, not
student authorship or named human acceptance. Existing assistance history remains
tracked and unchanged.

The public repository is `abdalrahman-ismaik/Ghaf`. All source/helper/check boundaries
are released. Export reported unsupported web file-system capability and a graceful
shutdown warning, then exited with status 0. Root retains only the final documentation
checkpoint and normal branch push; no preview, native build or helper job remains.
