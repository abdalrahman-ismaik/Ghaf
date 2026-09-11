# Service Contracts: Ghaf Core MVP

**Status**: PROPOSED — internal TypeScript boundaries, not a public HTTP API.

Thin routes call bounded Zustand/application commands. Those commands use this five-service registry;
screens never import mock fixtures or a remote provider. Deterministic `Mock*` implementations are
required. Any optional remote provider must return the same results.

## Shared Result Contract

```ts
type CapabilityOrigin = 'seeded' | 'prepared' | 'simulated' | 'pregenerated-mock' | 'live-optional';

interface ServiceMeta {
  origin: CapabilityOrigin;
  fallbackUsed: boolean;
}

interface ServiceError {
  code:
    | 'INVALID_INPUT'
    | 'NOT_FOUND'
    | 'INVALID_TRANSITION'
    | 'PERMISSION_DENIED'
    | 'REMOTE_UNAVAILABLE'
    | 'INVALID_RESPONSE';
  message: string;
  retryable: boolean;
  fallbackAvailable: boolean;
}

type ServiceResult<T> =
  { ok: true; data: T; meta: ServiceMeta } | { ok: false; error: ServiceError };
```

Mock services return stable results and error codes. A remote failure with a prepared fallback sets
`fallbackAvailable: true`; the application preserves valid input and explicitly invokes the mock.

## Structured Mission Contract

`AIService` returns content, not application state. The application adds identifiers, version,
lifecycle, approval, and completion state after schema validation.

```ts
interface LocalizedText {
  ar: string;
  en: string;
}

interface GeneratedMissionPayload {
  schemaVersion: '1.0';
  title: LocalizedText;
  story: LocalizedText;
  steps: readonly [
    { order: 1; instruction: LocalizedText },
    { order: 2; instruction: LocalizedText },
    { order: 3; instruction: LocalizedText },
  ];
  reflectionPrompt: LocalizedText;
  impactTarget: { value: number; unit: 'grams' | 'portions' };
  evidenceMethod: 'prepared-evidence' | 'parent-confirmation' | 'either';
  reward: LocalizedText | null;
  personalization: {
    childAgeBand: string;
    foodSituation: LocalizedText;
    familyWisdomSummary: LocalizedText;
    availableMinutes: number;
  };
}
```

The equivalent JSON Schema used by a pregenerated fixture or optional Structured Outputs provider
must enforce the same shape:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "ghaf.generated-mission.v1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "title",
    "story",
    "steps",
    "reflectionPrompt",
    "impactTarget",
    "evidenceMethod",
    "reward",
    "personalization"
  ],
  "properties": {
    "schemaVersion": { "const": "1.0" },
    "title": { "$ref": "#/$defs/localizedText" },
    "story": { "$ref": "#/$defs/localizedText" },
    "steps": {
      "type": "array",
      "minItems": 3,
      "maxItems": 3,
      "prefixItems": [
        { "$ref": "#/$defs/step1" },
        { "$ref": "#/$defs/step2" },
        { "$ref": "#/$defs/step3" }
      ],
      "items": false
    },
    "reflectionPrompt": { "$ref": "#/$defs/localizedText" },
    "impactTarget": {
      "type": "object",
      "additionalProperties": false,
      "required": ["value", "unit"],
      "properties": {
        "value": { "type": "integer", "minimum": 1 },
        "unit": { "enum": ["grams", "portions"] }
      }
    },
    "evidenceMethod": {
      "enum": ["prepared-evidence", "parent-confirmation", "either"]
    },
    "reward": {
      "anyOf": [{ "$ref": "#/$defs/localizedText" }, { "type": "null" }]
    },
    "personalization": {
      "type": "object",
      "additionalProperties": false,
      "required": ["childAgeBand", "foodSituation", "familyWisdomSummary", "availableMinutes"],
      "properties": {
        "childAgeBand": { "type": "string", "minLength": 1 },
        "foodSituation": { "$ref": "#/$defs/localizedText" },
        "familyWisdomSummary": { "$ref": "#/$defs/localizedText" },
        "availableMinutes": { "type": "integer", "minimum": 1 }
      }
    }
  },
  "$defs": {
    "localizedText": {
      "type": "object",
      "additionalProperties": false,
      "required": ["ar", "en"],
      "properties": {
        "ar": { "type": "string", "minLength": 1 },
        "en": { "type": "string", "minLength": 1 }
      }
    },
    "step1": {
      "type": "object",
      "additionalProperties": false,
      "required": ["order", "instruction"],
      "properties": {
        "order": { "const": 1 },
        "instruction": { "$ref": "#/$defs/localizedText" }
      }
    },
    "step2": {
      "type": "object",
      "additionalProperties": false,
      "required": ["order", "instruction"],
      "properties": {
        "order": { "const": 2 },
        "instruction": { "$ref": "#/$defs/localizedText" }
      }
    },
    "step3": {
      "type": "object",
      "additionalProperties": false,
      "required": ["order", "instruction"],
      "properties": {
        "order": { "const": 3 },
        "instruction": { "$ref": "#/$defs/localizedText" }
      }
    }
  }
}
```

Validation also rejects food-safety verdicts, unrestricted chat output, missing bilingual content,
and values outside the local quantity/time limits. A rejected live result immediately offers the
pregenerated mock for the same attempt.

## `MissionService`

```ts
interface MissionService {
  validateInput(input: MissionInput): ServiceResult<MissionInput>;
  buildReviewMission(
    input: MissionInput,
    payload: GeneratedMissionPayload,
    context: { attemptId: string; origin: CapabilityOrigin },
  ): ServiceResult<Mission>;
  approveForChild(mission: Mission): ServiceResult<Mission>;
  setStepCompleted(mission: Mission, stepId: string, completed: boolean): ServiceResult<Mission>;
  buildSubmission(mission: Mission, draft: SubmissionDraft): ServiceResult<ChildSubmission>;
  requestRetry(
    mission: Mission,
    submission: ChildSubmission,
  ): ServiceResult<{ mission: Mission; submission: ChildSubmission }>;
}
```

Rules:

- `approveForChild` is safe to repeat and cannot skip Parent review.
- `buildSubmission` requires Parent approval, all three steps, a reflection, and prepared evidence
  or a Parent-confirmation request; it awards nothing.
- `requestRetry` returns to Child work and awards nothing.
- Parent edit/regeneration increments mission version and re-enters review before assignment.

## `MediaService`

```ts
interface MediaService {
  listPrepared(kind: MediaKind): Promise<ServiceResult<readonly MediaReference[]>>;
  getPrepared(id: string): Promise<ServiceResult<MediaReference>>;
  playAudio(id: string): Promise<ServiceResult<{ durationMs: number }>>;
  pickImage?(): Promise<ServiceResult<MediaReference>>;
  recordVoiceNote?(): Promise<ServiceResult<MediaReference>>;
}
```

`listPrepared` and `getPrepared` are required offline. Optional capture methods may be absent. If
implemented, recording starts only from a visible microphone action and never runs in background.

## `AIService`

```ts
interface MissionGenerationRequest {
  attemptId: string;
  child: Pick<ChildProfile, 'id' | 'ageBand'>;
  input: MissionInput;
  preparedTranscript?: LocalizedText;
  mode: 'mock' | 'live-optional';
}

interface AIService {
  generateMission(
    request: MissionGenerationRequest,
  ): Promise<ServiceResult<GeneratedMissionPayload>>;
}
```

`MockAIService` selects a curated mission fixture using age band, prepared food scenario, quantity,
and available time, then returns `pregenerated-mock`. An optional remote adapter sends no secret
from the device and selects no model inside this contract; the server owns current provider details.

## `ImpactService`

```ts
interface ApproveCompletionRequest {
  mission: Mission;
  submission: ChildSubmission;
  confirmedQuantity: Quantity;
  currentSummary: ImpactSummary;
  currentGhaf: GhafProgress;
}

interface CompletionAward {
  alreadyApplied: boolean;
  confirmation: ParentConfirmation;
  impactRecord: ImpactRecord;
  impactSummary: ImpactSummary;
  ghaf: GhafProgress;
  celebration: CelebrationPayload;
}

interface ImpactService {
  approveCompletion(
    request: ApproveCompletionRequest,
    existingRecords: readonly ImpactRecord[],
  ): ServiceResult<CompletionAward>;
}
```

The award key is `missionId:submissionId`. An existing record returns the existing award with
`alreadyApplied: true`; totals, progress, streak, reward, and milestones do not increment again.
At the Full Ghaf stage, additional impact is retained while stage remains 5.

## `PrototypeSessionService`

```ts
interface ResetResult {
  session: PrototypeSession;
  navigateTo: '/parent';
}

interface PrototypeSessionService {
  getInitialSession(): PrototypeSession;
  reset(): ResetResult;
}
```

Both session values use the documented baseline: Arabic, Parent, mock mode, empty draft, no active
mission or submission, 1,250 g, 5 portions, 3 completed missions, a 2-day streak, and Sapling stage
at 48%. Prepared assets and the pregenerated mission remain available through services, unassigned.

## Registry and Replacement Rule

```ts
interface ServiceRegistry {
  mission: MissionService;
  media: MediaService;
  ai: AIService;
  impact: ImpactService;
  prototypeSession: PrototypeSessionService;
}
```

- The default registry binds all five interfaces to local deterministic implementations.
- A later live experiment may replace only `ai` and selected optional `media` methods.
- Remote failure never changes a screen contract; the current attempt is retried through
  `MockAIService` and clearly relabeled.
- No service claims authentication, accurate weight measurement, evidence verification, or food
  safety.
