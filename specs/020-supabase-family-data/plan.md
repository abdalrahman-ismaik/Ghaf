# Implementation plan

September 15 Masroofi continuation: add the existing UAE card and Parent/Child controls to the
hosted family navigation, using a dedicated relational ledger keyed to existing app_children,
app_tasks and app_recognitions. Reuse the actor/session boundary and app_families refresh signal.
Use an additive recognition trigger for atomic credits; do not replace task command wrappers
or activate/remap Feature019. See [the contract](masroofi.md). Root serializes SQL/app/browser
verification; hosted installation requires an authenticated administrative connection.

The September 15 main merge preserves the separate Feature019 normalized runtime under explicit
build selection. Feature020 remains the deployed default. The
[integration contract](normalized-integration.md) owns API/model/session preservation and checks.

Root owns authentication/configuration, contract, integration, final verification
and one serialized database/build lane. Four reused helpers audit then implement
disjoint schema, service/domain and UI boundaries. Preserve the NAV-MOTION working
tree and all prior Feature019 fixes. No dependencies are upgraded.

Use the existing Supabase account project and client. Add a normalized family and
membership authority with narrow RPC commands and immutable recognition evidence.
Do not deserialize synthetic PrototypeSession as real account state. Reuse existing
catalog and prop-driven botanical/task components through a real-family view model.
Keep the old account workspace available until explicit safe conversion; no implicit
award from old completed booleans. Device-only settings stay device-local.

Work order: schema/identity → fresh setup → core task/growth/memory → remaining
implemented domains → account switching/realtime → restricted-client checks → UI
and native acceptance/deployment evidence. The inventory is the single progress map.
