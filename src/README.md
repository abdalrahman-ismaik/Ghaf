# Application source

Routes live in [`app/`](../app/). This directory contains the shared application implementation.

| Directory                  | Responsibility                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------- |
| [components/](components/) | Reusable UI, grouped by experience; root primitives serve multiple features        |
| [config/](config/)         | Build-time flags and reviewed asset configuration                                  |
| [design/](design/)         | Shared tokens, typography, Tamagui theme and motion values                         |
| [features/](features/)     | Bounded domain policies, controllers, projections and presentation adapters        |
| [i18n/](i18n/)             | Canonical Arabic/English resources and direction helpers                           |
| [models/](models/)         | Shared TypeScript models and validation schemas                                    |
| [services/](services/)     | Registry, interfaces, prepared providers, local repositories and optional adapters |
| [state/](state/)           | Application command ordering, session ownership and reset                          |
| [utils/](utils/)           | Small shared utilities without feature authority                                   |

Use the existing feature boundary for new behavior. A one-feature helper belongs beside its caller;
move it into a shared module only after another feature actually needs it. Components render
derived state; feature policy and application commands own approval and progression.

`components/r002a/`, `components/r002b/` and `components/r003/` retain revision names because they
encode frozen fallback and gated presentation boundaries. Do not merge them solely for naming
consistency. `features/rewards/` owns recognition/reveal policy; `features/family-rewards/` owns
private Parent promises. Their authorities are distinct.

Read the [architecture](../docs/architecture/ARCHITECTURE.md) and
[placement rules](../docs/architecture/REPOSITORY_STRUCTURE.md) before adding a new abstraction.
