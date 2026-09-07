import {
  liveChildCoachGrantSchema,
  MAX_SYNTHETIC_GRANT_LIFETIME_MS,
  childCoachTextRequestV1Schema,
  childCoachTextResponseV1Schema,
  parentTaskDraftRequestV1Schema,
  parentTaskDraftSuggestionV1Schema,
  voiceTranscriptionMetadataV1Schema,
  voiceTranscriptionResponseV1Schema,
} from '../../models/boundedAi';
import type { LiveChildCoachCapability, LiveChildCoachGrant } from '../../models/boundedAi';
import { createInitialLiveChildCoachGrant, liveChildSubjectFor } from '../../features/access';
import type { SyntheticChildId } from '../../models/familyGrowth';
import type {
  CapabilityTokenRequest,
  CapabilityTokenService,
  LiveChildCoachTextService,
  LiveChildAiGrantService,
  ParentTaskDraftingService,
  PreparedLiveChildCoachTextProvider,
  PreparedParentTaskDraftingProvider,
  PreparedVoiceTranscriptionProvider,
  ServiceResult,
  VoiceTranscriptionInput,
} from '../interfaces';
import {
  createPreparedChildCoachResponse,
  createPreparedParentTaskDraftSuggestion,
  createPreparedVoiceTranscription,
} from './boundedAiFixtures';

function preparedSuccess<T>(data: T, fixtureId: string): ServiceResult<T> {
  return {
    ok: true,
    data,
    meta: { origin: 'prepared', fallbackUsed: false, fixtureId },
  };
}

function invalid(message: string): ServiceResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_INPUT',
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

export class DeterministicParentTaskDraftingProvider implements PreparedParentTaskDraftingProvider {
  readonly mode = 'deterministic_prepared' as const;

  async draft(request: Parameters<ParentTaskDraftingService['draft']>[0]) {
    const parsedRequest = parentTaskDraftRequestV1Schema.safeParse(request);
    if (!parsedRequest.success) return invalid('Parent task drafting request is outside policy');
    const fixture = createPreparedParentTaskDraftSuggestion(parsedRequest.data);
    const parsedFixture = parentTaskDraftSuggestionV1Schema.safeParse(fixture);
    if (!parsedFixture.success) return invalid('Prepared Parent task draft is unavailable');
    return preparedSuccess(parsedFixture.data, `parent-task-draft-${request.archetypeId}-v1`);
  }
}

export class DeterministicLiveChildCoachTextProvider implements PreparedLiveChildCoachTextProvider {
  readonly mode = 'deterministic_prepared' as const;

  async respond(request: Parameters<LiveChildCoachTextService['respond']>[0]) {
    const parsedRequest = childCoachTextRequestV1Schema.safeParse(request);
    if (!parsedRequest.success || request.taskArchetypeId !== 'task_recycling_p0_v1') {
      return invalid('Child Coach request is outside the approved prepared task');
    }
    const fixture = createPreparedChildCoachResponse(parsedRequest.data);
    const parsedFixture = childCoachTextResponseV1Schema.safeParse(fixture);
    if (!parsedFixture.success) return invalid('Prepared Child Coach response is unavailable');
    return preparedSuccess(parsedFixture.data, 'child-coach-bounded-v1');
  }
}

export class DeterministicVoiceTranscriptionProvider implements PreparedVoiceTranscriptionProvider {
  readonly mode = 'deterministic_prepared' as const;

  async transcribe(input: VoiceTranscriptionInput) {
    const metadata = voiceTranscriptionMetadataV1Schema.safeParse(input.metadata);
    if (
      !metadata.success ||
      input.audioBytes.byteLength !== metadata.data.declaredByteCount ||
      input.audioBytes.byteLength === 0
    ) {
      return invalid('Voice transcription request is outside the synthetic fixture boundary');
    }
    const fixture = createPreparedVoiceTranscription(metadata.data);
    const parsedFixture = voiceTranscriptionResponseV1Schema.safeParse(fixture);
    if (!parsedFixture.success) return invalid('Prepared transcript is unavailable');
    return preparedSuccess(parsedFixture.data, 'voice-transcript-synthetic-v1');
  }
}

export class BlockedCapabilityTokenService implements CapabilityTokenService {
  async getToken(_request: CapabilityTokenRequest): Promise<ServiceResult<string>> {
    return {
      ok: false,
      error: {
        code: 'REMOTE_UNAVAILABLE',
        message: 'No trusted capability-token broker is configured',
        retryable: false,
        fallbackAvailable: true,
      },
    };
  }
}

function grantKey(childId: SyntheticChildId, capability: LiveChildCoachCapability): string {
  return `${childId}:${capability}`;
}

export class DeterministicLiveChildAiGrantService implements LiveChildAiGrantService {
  private readonly grants = new Map<string, LiveChildCoachGrant>();

  constructor() {
    this.reset();
  }

  get(input: {
    readonly childId: SyntheticChildId;
    readonly capability: LiveChildCoachCapability;
    readonly now: string;
  }): ServiceResult<LiveChildCoachGrant> {
    const current = this.grants.get(grantKey(input.childId, input.capability));
    const now = Date.parse(input.now);
    if (!current || !Number.isFinite(now)) return invalid('Bounded Child AI grant is unavailable');
    if (current.status === 'granted' && now >= Date.parse(current.expiresAt)) {
      const expired = liveChildCoachGrantSchema.parse({ ...current, status: 'expired' });
      this.grants.set(grantKey(input.childId, input.capability), expired);
      return preparedSuccess({ ...expired }, 'bounded-child-ai-grant-v1');
    }
    return preparedSuccess({ ...current }, 'bounded-child-ai-grant-v1');
  }

  update(input: {
    readonly childId: SyntheticChildId;
    readonly capability: LiveChildCoachCapability;
    readonly granted: boolean;
    readonly expectedVersion: number;
    readonly noticeVersion: number;
    readonly policyVersion: string;
    readonly providerVersion: string;
    readonly reauthenticationProofId: string;
    readonly now: string;
  }): ServiceResult<LiveChildCoachGrant> {
    const key = grantKey(input.childId, input.capability);
    const current = this.grants.get(key);
    const now = Date.parse(input.now);
    if (!current || !Number.isFinite(now)) return invalid('Bounded Child AI grant is unavailable');
    if (current.grantVersion !== input.expectedVersion) {
      return {
        ok: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: 'The bounded Child AI grant version is stale',
          retryable: false,
          fallbackAvailable: false,
        },
      };
    }
    const next = liveChildCoachGrantSchema.safeParse({
      capability: input.capability,
      status: input.granted ? 'granted' : 'revoked',
      childSubject: liveChildSubjectFor(input.childId),
      grantVersion: current.grantVersion + 1,
      noticeVersion: input.noticeVersion,
      policyVersion: input.policyVersion,
      providerVersion: input.providerVersion,
      issuedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + MAX_SYNTHETIC_GRANT_LIFETIME_MS).toISOString(),
      revokedAt: input.granted ? null : new Date(now).toISOString(),
      reauthenticationProofId: input.reauthenticationProofId,
      capabilityTruth: 'synthetic_implementation_only',
    });
    if (!next.success) return invalid('Bounded Child AI grant update is outside policy');
    this.grants.set(key, next.data);
    return preparedSuccess({ ...next.data }, 'bounded-child-ai-grant-v1');
  }

  reset(): ServiceResult<true> {
    this.grants.clear();
    for (const childId of ['child_salem', 'child_alya'] as const) {
      for (const capability of ['text', 'voice'] as const) {
        this.grants.set(
          grantKey(childId, capability),
          createInitialLiveChildCoachGrant(childId, capability),
        );
      }
    }
    return preparedSuccess(true, 'bounded-child-ai-grant-v1');
  }
}

export function createPreparedBoundedAiServices() {
  const parentTaskDraftingPrepared = new DeterministicParentTaskDraftingProvider();
  const childCoachTextPrepared = new DeterministicLiveChildCoachTextProvider();
  const voiceTranscriptionPrepared = new DeterministicVoiceTranscriptionProvider();
  return {
    parentTaskDraftingPrepared,
    childCoachTextPrepared,
    voiceTranscriptionPrepared,
    capabilityToken: new BlockedCapabilityTokenService(),
    childAiGrants: new DeterministicLiveChildAiGrantService(),
  };
}
