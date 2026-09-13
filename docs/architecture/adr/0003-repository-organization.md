# ADR 0003: Organize verification and navigation around the existing application

- Date: 2026-09-13
- Status: Accepted for the user-authorized repository maintenance scope

## Context

The application already separates routes, UI, domain policy, models, services and state. However,
153 tests occupy one directory, supporting areas lack entry guides, GitHub CI is absent, and
historical evidence shares paths with ignored generated output. Renaming canonical root documents
or protected evidence would break established planning and review references.

## Decision

Keep one Expo application and the existing runtime module boundaries. Group tests by subject,
preserve their filenames/assertions, and retain a machine-readable map from their old paths.
Add concise folder guides, a current repository map, PR/issue templates and a repeatable CI gate.
Preserve canonical documents and exact historical artifact paths. Reject new tracked generated
output through a small dependency-free repository check and an explicit historical exception list.

## Alternatives considered

- Moving everything into `apps/mobile/` would add workspace configuration and path churn with no
  second application requirement.
- Renaming revision-specific components would obscure frozen fallback and default-off boundaries.
- Moving every historical document and screenshot would create extensive evidence-reference churn.
- Extracting the store during folder cleanup would mix transaction changes with organizational
  work and require a separately owned behavioral refactoring effort.

## Consequences

Test commands using the old complete paths must use the relocation map. Basenames, recursive
discovery and assertions remain stable. Historical documents remain readable at their original
paths. The root keeps several intentional contract files. Large runtime files remain technical
debt, explicitly identified in the [audit](../REPOSITORY_AUDIT.md).

The new GitHub workflow is locally prepared. A hosted CI result exists only after a separately
authorized push and an observed Actions run; it cannot establish physical Android acceptance.

See [placement rules](../REPOSITORY_STRUCTURE.md) and the [test guide](../../../tests/README.md).
