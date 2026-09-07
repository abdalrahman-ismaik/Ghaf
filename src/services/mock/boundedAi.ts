import {
  childCoachTextRequestV1Schema,
  childCoachTextResponseV1Schema,
  parentTaskDraftRequestV1Schema,
  parentTaskDraftSuggestionV1Schema,
  voiceTranscriptionMetadataV1Schema,
  voiceTranscriptionResponseV1Schema,
} from '../../models/boundedAi';
import type {
  CapabilityTokenRequest,
  CapabilityTokenService,
  LiveChildCoachTextService,
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

export function createPreparedBoundedAiServices() {
  const parentTaskDraftingPrepared = new DeterministicParentTaskDraftingProvider();
  const childCoachTextPrepared = new DeterministicLiveChildCoachTextProvider();
  const voiceTranscriptionPrepared = new DeterministicVoiceTranscriptionProvider();
  return {
    parentTaskDraftingPrepared,
    childCoachTextPrepared,
    voiceTranscriptionPrepared,
    capabilityToken: new BlockedCapabilityTokenService(),
  };
}
