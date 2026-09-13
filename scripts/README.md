# Repository scripts

Run scripts from the repository root unless their own guide says otherwise.

| Directory                  | Purpose                                                | Entry point                                                                         |
| -------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| [repository/](repository/) | Navigation, test-layout and tracked-artifact checks    | `npm run repo:check`                                                                |
| [brand/](brand/)           | Reproduce reviewed brand derivatives                   | [5A provenance](../docs/design/brand/5a-refined-classic/README.md)                  |
| [native/](native/)         | Bounded local APK build and device-evidence collection | [Android build guide](../docs/competition-readiness/android-build-and-rehearsal.md) |
| [tooling/](tooling/)       | Optional development MCP tooling                       | [Tooling setup](../tools/codex/README.md)                                           |

Prefer package scripts for everyday commands. A utility should have one documented purpose and
write generated output to an ignored location. Native scripts require the toolchain and resource
coordination described in their guide; they are not part of ordinary source verification.
