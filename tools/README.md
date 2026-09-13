# Optional developer tools

[`codex/`](codex/README.md) is an isolated development-tool package with its own lockfile. Install
it only when using that tooling. The application is installed from the root `package-lock.json`;
this directory does not define another app or a workspace monorepo.

Runnable repository utilities live in [`scripts/`](../scripts/README.md). Agent instructions and
skills live in `.codex/` and `.agents/`; Spec Kit automation lives in `.specify/`.
