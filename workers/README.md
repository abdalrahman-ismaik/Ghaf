# Optional server boundaries

These Workers are optional server-side adapters. The ordinary competition app uses prepared
providers and requires neither a deployed Worker nor a provider credential.

| Worker                                   | Contract and setup                                                                |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| [ghaf-parent-guide/](ghaf-parent-guide/) | [Single synthetic Parent transformation](ghaf-parent-guide/README.md)             |
| [ghaf-ai-gateway/](ghaf-ai-gateway/)     | [Feature 004 bounded operations and capability checks](ghaf-ai-gateway/README.md) |

Worker contract tests live in [`tests/gateway/`](../tests/gateway/). Application adapters live in
[`src/services/remote/`](../src/services/remote/), behind the existing registry and independent
default-off flags. Shared contracts stay in the existing models/features; routes must not import
Worker implementations. No deployment or live-provider acceptance follows from passing mock tests.
