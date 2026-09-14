# Implementation plan

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
