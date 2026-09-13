# Reviewed contributor toolkit and bootstrap disposition

Date: 2026-09-12. Branch: `redesign/ui-experiments`. Scope: development tooling and original
workflow skills; no application behavior, application package/lockfile, global Codex settings,
provider account, deployment, or real Child data was changed by this installation.

The bootstrap is an OpenCode/Desktop starter for Apple and Windows, not a drop-in Codex/WSL
project package. Its useful capabilities have been installed or replaced selectively below.
This is **not** a claim that every bundled skill or account-backed provider was installed or
activated. The supplied platform folders and credential files remain untouched and excluded from
Git by the integration owner's ignore rules.

## Installed and configured

| Component                   | Exact version or endpoint                                    | Result and license/provenance                                                                                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native Node/npm             | Node `24.16.0`, npm `11.13.0`                                | Reused existing WSL tools; no second runtime installed                                                                                                                                                                                                                                               |
| Codex CLI                   | `0.154.0`                                                    | Reused installed CLI; no global reconfiguration                                                                                                                                                                                                                                                      |
| Official Playwright MCP     | `@playwright/mcp@0.0.80`                                     | Installed in `tools/codex`; Apache-2.0; [Microsoft upstream](https://github.com/microsoft/playwright-mcp)                                                                                                                                                                                            |
| Playwright browser engine   | `playwright` and `playwright-core` `1.63.0-alpha-2026-08-31` | Exact dependency of MCP release, locked; Apache-2.0; Firefox `155.0`, revision `1542`, matching cached binary validated                                                                                                                                                                              |
| Sequential Thinking MCP     | `@modelcontextprotocol/server-sequential-thinking@2026.8.31` | Installed and locked; thought logging disabled; npm declares `SEE LICENSE IN LICENSE`; [exact upstream commit license](https://github.com/modelcontextprotocol/servers/blob/a40bc270fb5ece62673f8a1196f57116d885c5eb/LICENSE) describes the MIT-to-Apache-2.0 transition and documentation CC-BY-4.0 |
| Context7                    | `https://mcp.context7.com/mcp`                               | Enabled remote basic endpoint; successful public query without credentials; remote service version/availability is provider-controlled                                                                                                                                                               |
| Ghaf presentation skill     | `.agents/skills/ghaf-presentation/`                          | New original instructions for truthful judge narrative, brand, and rehearsal evidence                                                                                                                                                                                                                |
| Ghaf quality workflow skill | `.agents/skills/ghaf-quality-workflow/`                      | New original bounded issue triage, proportional checks, and exact evidence handoff                                                                                                                                                                                                                   |
| Ghaf reference intake skill | `.agents/skills/ghaf-reference-intake/`                      | New original archive/provenance/Expo adaptation workflow                                                                                                                                                                                                                                             |

The isolated install added 115 packages and audited 116 packages with **zero reported
vulnerabilities** at installation time. Package integrity hashes and resolved dependencies are
recorded in `tools/codex/package-lock.json`. This is an npm advisory result for the toolkit,
not a comprehensive security claim. The sequential-thinking package omits its license file from
the published archive and retains older MIT wording in its README; its exact source license is
linked above instead of mislabeling the release as exclusively MIT.

The root application's separate restored `npm ci` reported **15 advisories**. These are
**untriaged by this tooling slice**; use the current [QA report](qa-report.md) for the application
dependency assessment. No `npm audit fix`, automatic dependency upgrade, or root lockfile edit
was performed here.

## MCP behavior and account-dependent providers

`.codex/config.toml` adds three enabled MCP entries and four disabled provider entries.
Local MCPs use `node scripts/tooling/mcp.mjs ...`, the isolated lockfile, and file-relative root
resolution. Launch Codex from a checkout/worktree root or use `codex -C /path/to/checkout`.
The launcher resolves absolute dependency/output paths after startup and was tested from a
temporary working directory. It does not invoke the network package runner at runtime.

Playwright runs headless with an isolated in-memory browser profile, Firefox, and `--sandbox`.
It uses no personal browser extension, account session, shared browser profile, microphone,
camera, or geolocation permission. Output goes to ignored `output/playwright/<process-id>/`.
Sandbox configuration is not an independent proof of operating-system isolation; the browser
smoke validates successful startup and navigation only.

Sequential Thinking runs locally with `DISABLE_THOUGHT_LOGGING=true`. It is optional assistance
for explicit decision records, not a performance multiplier or a requirement to externalize
private reasoning. It has no automatic persistent-mode skill attached.

Context7 receives only the documentation queries intentionally sent to it. Do not include real
family data, credentials, or unnecessary source contents. Its availability and unauthenticated
limits can change; official documentation and local package sources remain usable fallbacks.

| Optional provider | Configured endpoint                | Current disposition                                                                                                  |
| ----------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Mobbin            | `https://api.mobbin.com/mcp`       | Disabled; useful for licensed interaction references after account access is established                             |
| Figma             | `https://mcp.figma.com/mcp`        | Disabled; useful for user-owned design files after supported authentication                                          |
| ElevenLabs        | `https://api.elevenlabs.io/v1/mcp` | Disabled; authentication, credits, endpoint/account compatibility, and any new synthetic voice use are unverified    |
| Higgsfield        | `https://mcp.higgsfield.ai/mcp`    | Disabled; authentication, credits, and generation rights unverified; no face training or real Child media authorized |

These entries are configuration placeholders, **not working authenticated installations**. No
login, authorization flow, remote write, paid generation, voice clone, or provider account action
was performed. Configuration presence must not be shown to judges as an app integration.

## All 16 bundled skill dispositions

Apple and Windows contain the same 16 skill identities. The bootstrap audit found no standalone
license files in those skill directories. Original Ghaf skills above adopt relevant workflow
capabilities; they do not redistribute the bundled wording or claim to install those originals.

| Bundled skill                   | Bundled version | Decision and reason                                                                                                                                   |
| ------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `presentation`                  | `1.3.0`         | Replaced by original `ghaf-presentation`; source imposes unrelated NextLevel copyright/branding and whole-skill redistribution terms are unclear      |
| `hyperframes`                   | Unversioned     | Reference only; depends on missing companion skills and evolving upgrade/runtime behavior; no current Expo/demo need for another presentation runtime |
| `impeccable`                    | `4.0.2`         | Retained existing project `4.1.2`; no downgrade or overwrite; old bootstrap commands are not executed                                                 |
| `ponytail`                      | Unversioned     | Capability adapted in original quality workflow; avoid automatic persistent persona/mode state for unrelated tasks                                    |
| `ponytail-review`               | Unversioned     | Capability adapted in original bounded quality workflow; existing review/test skills already cover implementation review                              |
| `ponytail-audit`                | Unversioned     | Capability adapted in original evidence matrix and risk-based triage                                                                                  |
| `ponytail-debt`                 | Unversioned     | Capability adapted as prioritized actionable issues; no parallel automatic debt system                                                                |
| `ponytail-help`                 | Unversioned     | Not installed; support menu belongs to the omitted Ponytail suite                                                                                     |
| `ponytail-gain`                 | Unversioned     | Not installed; benchmark or productivity claims require actual before/after measurements                                                              |
| `higgsfield-generate`           | `0.12.0`        | Inactive reference; paid/authenticated provider and installer behavior; existing image-generation workflow remains available                          |
| `higgsfield-game-generation`    | `0.12.0`        | Inactive reference; separate game/runtime pipeline is outside this Expo prototype                                                                     |
| `higgsfield-marketplace-cards`  | `0.12.0`        | Inactive reference; marketplace-card workflow is not needed for family task UI                                                                        |
| `higgsfield-product-photoshoot` | `0.12.0`        | Inactive reference; account-backed photoshoot pipeline is unnecessary for current botanical UI work                                                   |
| `higgsfield-soul-id`            | `0.12.0`        | Excluded from activation; identity/face-training workflow has no authorized Child-data use                                                            |
| `higgsfield-video-explainer`    | `0.12.0`        | Inactive reference; a later synthetic pitch video can be scoped separately when the provider and rights are available                                 |
| `higgsfield-websites`           | `0.12.0`        | Inactive reference; alternate React/TanStack/deployment architecture conflicts with one Expo/Tamagui application                                      |

The [Ponytail upstream](https://github.com/DietrichGebert/ponytail) is MIT-licensed; omission here
is a scope/overlap/behavior decision, not a claim that its upstream license prohibits reuse.
Existing `impeccable` support scripts were not activated; pre-existing scripts that bypass
approval/sandbox settings are not endorsed by retaining the existing skill files.

## Other bootstrap exclusions

| Component                                           | Disposition                                                                                                                                                                                         |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Apple/Windows platform installers and verifiers     | Read-only audit; not executed or copied; they target other desktop environments and mutate global tools/configuration                                                                               |
| OpenCode CLI `1.18.30` and desktop app              | Not installed; native Codex is the requested working environment; avoids redundant global tooling and package postinstall behavior                                                                  |
| Bundled MyBrowser `1.2.2` MCP and browser extension | Replaced by official Playwright; supplied provenance commit lookup failed in the audit, public version differed, bundled license was unclear, and extension requested broad browser/debugger access |
| MyBrowser credential/config files                   | Preserved locally without reading or copying credential values; excluded from Git                                                                                                                   |
| Local Context7 npm package `4.1.0`                  | Not installed; remote basic endpoint already demonstrated the needed documentation capability                                                                                                       |
| HyperFrames CLI `0.8.34`                            | Not installed; no current deliverable needs its extra presentation/rendering runtime                                                                                                                |
| Remote shell installers or automatic upgrades       | Not executed; reviewed, pinned package installation is reproducible from the isolated lockfile                                                                                                      |

## Reproduce and verify

Run from the repository/worktree root:

```bash
npm ci --prefix tools/codex --ignore-scripts
npm --prefix tools/codex run browser:install
npm --prefix tools/codex run check
npm --prefix tools/codex run check:online
npm audit --prefix tools/codex
codex mcp get ghaf_playwright --json
codex mcp get ghaf_context7 --json
```

The online check calls only a public Expo documentation lookup. Browser binaries live in the
normal ignored per-user Playwright cache; a new host needs its matching browser and supported
system libraries. The first Chromium attempt failed because WSL lacked NSS libraries; the
final default switched to package-matched Firefox and passed without library-path workarounds.
No system package, persistent library override, or sandbox bypass was added.

| Validation                                       | Status                   | Exact observation                                                                                                                     |
| ------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Isolated install and advisory audit              | PASSED                   | 115 added / 116 audited; zero toolkit advisories                                                                                      |
| Sequential MCP initialize/list/call              | PASSED                   | One tool; synthetic single-step call; supplied text absent from captured stderr                                                       |
| Playwright MCP initialize/list/browser           | PASSED                   | 24 tools; default isolated Firefox loaded a loopback synthetic page, snapshot contained its heading, browser closed                   |
| Context7 initialize/list/query                   | PASSED                   | Two tools; no-key lookup returned public Expo documentation                                                                           |
| Launcher working-directory independence          | PASSED                   | Both local MCP launchers invoked by absolute script path from the system temporary directory                                          |
| TOML parsing / current official JSON Schema      | PASSED                   | Python `tomllib` plus `jsonschema.validate` against the fetched official Codex schema accepted all seven server entries and agent cap |
| Installed Codex configuration reader             | PASSED                   | `codex mcp get ... --json` read the project entries and correct enabled/disabled states                                               |
| Codex `--strict-config` MCP validation           | NOT RUN                  | CLI explicitly rejects this flag for the `mcp` subcommand; not represented as a pass                                                  |
| Three original skill frontmatter/body validation | PASSED                   | Bundled `skill-creator/scripts/quick_validate.py` accepted each skill                                                                 |
| Account-backed providers                         | NOT RUN                  | Four entries disabled; no credentials, auth flows, or provider calls                                                                  |
| New-session skill/MCP discovery                  | NOT RUN                  | Files/config are installed; current session tool catalog is not retroactively reloaded                                                |
| Physical Android and two-device demo             | NOT RUN by tooling slice | MCP browser evidence does not qualify as native/device synchronization evidence                                                       |

Scoped ESLint and Prettier checks passed for the new launch/check scripts, skills, package
manifest, and documentation. `git diff --check` passed. Application behavior checks belong to
the separate QA slice; tooling validation does not replace them.

Project MCP configuration requires project trust and a fresh/reloaded Codex session. See the
[official MCP configuration guide](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).
The installer initially used three spawned threads for the four-worker plan. The user then
explicitly increased `max_concurrent_threads_per_session` to **10**; that current setting is preserved.
The recommended work plan still uses four sessions. Four separate Codex sessions must coordinate their work
manually; the per-session setting is not a global semaphore.

Model/reasoning/Fast defaults were deliberately left unchanged. The integration owner's prompt
pack preserves the requested **GPT-6 Astra / Ultra / Fast** and describes checking the actual
model catalog and session settings. A configuration string alone is not proof of model access,
priority capacity, or speed; no throughput or token-saving benchmark is claimed.

Owned delivery: `.codex/config.toml`, `scripts/tooling/`, `tools/codex/`, the three new skill
directories, and this report. Existing skill files and application source remain unchanged by
this slice. The toolkit is ready for integration subject to the integration owner's final review;
it does not activate any proposed product feature or release gate.
