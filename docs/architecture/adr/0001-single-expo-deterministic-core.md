# ADR 0001: Single Expo application with a deterministic local core

- **Status:** Accepted
- **Date:** 2026-08-26
- **Feature:** 003 — Family Growth Garden

## Context

Ghaf must demonstrate a reliable Arabic-first Parent → Child → confirmation → living-garden journey
on Android for a competition. The team has three members, no approved production backend, no
approved live-model boundary, and no permission to process real Child data or media. The complete
judge path must continue when external services are unavailable.

Feature 002 already established an Expo/React Native app, Expo Router, strict TypeScript, a Zustand
session, provider contracts, deterministic fixtures, bilingual resources, SVG, and focused tests.
Creating another app or production service would duplicate foundations and make the demo less
reliable.

## Decision

Implement Feature 003 inside the existing single Expo application.

- Keep exactly one schema-versioned, resettable in-memory prototype session.
- Put lifecycle, reward, garden, circle, and assistant rules in pure feature modules.
- Access behavior through provider-neutral service interfaces and one central registry.
- Make deterministic local providers and synthetic/prepared fixtures the required P0 path.
- Keep routes focused on composition/navigation and shared UI in local components/tokens.
- Treat Android as authoritative and web as a secondary preview/static-export surface.
- Do not add a live AI adapter until a separately approved server-side boundary can protect secrets,
  validate structured output, enforce age/safety policy, time out, and return the same local
  fallback.

## Consequences

### Positive

- The entire demo works without a backend, account, provider key, or network request.
- Domain policies and recognition/privacy invariants remain directly testable outside React Native.
- Reset, duplicate recognition, and fallback behavior are deterministic.
- The small team has one integration surface and one dependency graph.
- A future provider can implement existing contracts without changing route behavior.

### Trade-offs

- State is not durable across reloads and is not multi-device.
- The store and deterministic provider module carry more orchestration than a production system
  would.
- Static fixtures demonstrate bounded AI/media value but cannot be described as live inference.
- Web behavior cannot satisfy native Android acceptance.

### Guardrails

- Do not add production authentication, persistence, networking, analytics, notifications, public
  family sharing, or a second application inside P0.
- Do not place a provider secret or unrestricted Child input in the mobile bundle.
- Do not bypass Parent approval, idempotency, or privacy projection for implementation convenience.

## Alternatives considered

| Alternative                           | Decision                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Separate Parent and Child apps        | Rejected: doubles navigation/build/integration work and weakens the single-device demo         |
| Production backend and database in P0 | Rejected: no P0 need, operational owner, or approved child-data boundary                       |
| Direct model-provider calls from Expo | Rejected: exposes secrets and cannot enforce the required server-side safety/fallback contract |
| UI-only hard-coded journey            | Rejected: would not prove lifecycle, privacy, fixed-award, idempotency, and reset behavior     |
| Multiple state or UI frameworks       | Rejected: duplicates the existing adequate stack and increases drift                           |

## Related records

- [`plan.md`](../../../specs/003-family-growth-garden/plan.md)
- [`domain-contract.md`](../../../specs/003-family-growth-garden/contracts/domain-contract.md)
- [`assistant-contract.md`](../../../specs/003-family-growth-garden/contracts/assistant-contract.md)
