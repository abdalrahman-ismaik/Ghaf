# ADR 0004: Move product and working documents out of the repository root

- Date: 2026-09-13
- Status: Accepted by the user's explicit root-cleanup instruction
- Supersedes: ADR 0003's choice to retain all canonical Markdown at the root

## Context

The earlier maintenance pass preserved root paths conservatively. The user now explicitly requests
that movable documents be relocated and redundant/local files be cleaned up. The installed design
tooling supports `docs/PRODUCT.md` and `docs/DESIGN.md`; no application module requires these
documents at the root. Another owner is implementing Feature 016 concurrently.

## Decision

Keep README, contributing instructions, AGENTS and conventional tool configuration at the root.
Move eight product, design, research, capability, demonstration, ownership and historical-prompt
documents into `docs/`. Rebase their links, update current entry guidance and preserve an exact
path map for historical references. Keep the managed Spec Kit block byte-for-byte unchanged.

Ignore raw local references, private working notes and machine-local tool state. Remove only
redundant download metadata from the bounded input folders. Keep original inputs and all public
AI-assistance/development evidence. Do not reinterpret cleanup as evidence of student authorship
or competition eligibility. Preserve separately owned source, package and coordination changes.

## Consequences

Readers use the [documentation index](../../README.md) and
[root-file guide](../PUBLIC_REPOSITORY.md). Older narrative paths can be resolved through
`docs/architecture/document-relocations.json`. Active owners may update their own held records
after the move; their files are not rewritten concurrently. Root config discovery and design
context continue to work, without compatibility stubs or dependency changes.
