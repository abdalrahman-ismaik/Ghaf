# Implementation plan

Extend the existing strict TypeScript Expo application. Keep immutable Masroofi state in
usePrototypeStore beside existing reward authorities. A pure local service owns enablement,
fixed assignment/version-bound promises, credit, private projections and practice purchases.
The store validates current Parent/Child authority and configured profile at every call;
recognition integration occurs only after existing recognition validation succeeds.
Use integer fils, explicit finite template eligibility and idempotent event IDs. UI uses only
service/store projections, never computes an unlock or purchase decision.

Root owns integration/store/registry/entries/flags/resources registration and evidence.
One domain helper owns src/models/masroofi.ts, src/features/masroofi/service.ts and
tests/family/masroofi-service.test.ts. One UI helper owns src/components/masroofi/** and
src/i18n/masroofi.ts. No overlapping edits; all checks serialized by root.

Constitution check: synthetic data, no real finance, Parent approval, deterministic offline,
small existing architecture, Arabic-first, no-loss Seeds preserved. No amendment required to
the no-real-banking boundary. This spec explicitly extends simulated presentation only.
