# Service Contracts: Ghaf Repository Foundation

These contracts describe the replaceable boundary used by screens. Feature 001 implements only
deterministic `Mock*` services and makes no network requests.

## Shared Result

All async service calls resolve to a discriminated result:

```ts
type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; retryable: boolean } };
```

Mock failures, when exercised, use stable error codes and bilingual UI messages.

## MissionService

```ts
interface MissionService {
  getActiveMission(): Promise<ServiceResult<MissionSummary>>;
}
```

`MockMissionService` returns the same synthetic assigned mission after every reset.

## MediaService

```ts
interface MediaService {
  getPreparedImage(): Promise<ServiceResult<PreparedMedia>>;
  getPreparedAudio(): Promise<ServiceResult<PreparedMedia>>;
}
```

Feature 001 may return fixture metadata without rendering or capturing live media.

## AIService

```ts
interface AIService {
  getPregeneratedMission(): Promise<ServiceResult<MissionSummary>>;
}
```

The implementation MUST label its output `pregenerated-mock`. It performs no transcription,
image analysis, model call, or food-safety judgment.

## ImpactService

```ts
interface ImpactService {
  getSummary(): Promise<ServiceResult<ImpactSummary>>;
  getGhafProgress(): Promise<ServiceResult<GhafProgress>>;
}
```

Returned quantities are simplified seeded estimates.

## PrototypeSessionService

```ts
interface PrototypeSessionService {
  getInitialSession(): PrototypeSession;
  reset(): PrototypeSession;
}
```

Both calls produce an equivalent deep value: Arabic, Parent, mock mode enabled, one assigned
mission, seeded impact, and the documented Ghaf stage.

## Replacement Rule

Screens import contracts and the central service registry, never concrete remote providers. A later
provider may replace one contract binding, but Feature 002 planning must approve any real API.
