# Ghaf contributor tooling

Development tools live in this isolated package. They are not application dependencies and are
not imported into the Expo bundle. The lockfile pins the complete dependency tree; installation
does not run dependency lifecycle scripts.

From the checkout or worktree root:

```bash
npm ci --prefix tools/codex --ignore-scripts
npm --prefix tools/codex run browser:install
npm --prefix tools/codex run check
npm --prefix tools/codex run check:online
codex mcp get ghaf_playwright --json
codex mcp get ghaf_context7 --json
codex -C .
```

`check` launches the local servers from a temporary directory, verifies their MCP handshakes,
calls the synthetic sequential-thinking fixture, and opens a local synthetic page in Firefox.
`check:online` additionally sends a generic public Expo-documentation query to Context7. Neither
check sends repository contents, credentials, or Child information to a remote service.

Firefox is the tested browser: the pinned Playwright package selects its matching revision.
Browsers use Playwright's normal per-user cache, outside Git. On another host, missing browser
system libraries may require that host's standard Playwright dependency setup. Do not disable the
browser sandbox to hide such a failure. Chromium was not selected because this WSL host lacks
its NSS shared libraries.

Launch Codex from the checkout root, or use `codex -C /path/to/checkout`. The relative MCP command
then starts `scripts/tooling/mcp.mjs`, which resolves dependencies and output from its own file
location. A separate worktree needs its own `npm ci --prefix tools/codex --ignore-scripts`.
There are no hard-coded home paths or runtime `npx @latest` calls.

Restart or open a fresh Codex session to discover new MCPs and skills. Project configuration is
loaded only for trusted projects. Optional Mobbin, Figma, ElevenLabs, and Higgsfield entries are
disabled and contain no credentials. Enabling an entry is separate from authenticating it; check
the provider's current supported authentication and account entitlement before using it.

The repository does not change model, reasoning, Fast mode, approval, or sandbox preferences.
The multi-session prompt pack describes the requested GPT-6 Astra / Ultra / Fast selection and
how to verify the actual session settings.

See [the installation and disposition report](../../docs/competition-readiness/tooling-report.md)
for exact versions, licenses, bootstrap exclusions, and validation limits.
