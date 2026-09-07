import {
  MAX_VOICE_BYTES,
  MAX_VOICE_DURATION_MS,
  voiceCaptureEnvelopeV1Schema,
  voiceTranscriptDraftV1Schema,
  voiceTranscriptionResponseV1Schema,
  type VoiceCaptureEnvelopeV1,
  type VoiceTranscriptDraftV1,
  type VoiceTranscriptionResponseV1,
} from '../../models/boundedAi';
import type { DomainResult } from '../../models/familyGrowth';

export interface LiveVoiceCaptureState {
  readonly envelope: VoiceCaptureEnvelopeV1;
  readonly transcript: VoiceTranscriptDraftV1 | null;
}

export interface CreateLiveVoiceCaptureInput {
  readonly voiceSessionId: string;
  readonly requestId: string;
  readonly bindingNonce: string;
  readonly locale: 'ar' | 'en';
  readonly noticeVersion: number;
  readonly grantVersion: number;
  readonly taskArchetypeId: VoiceCaptureEnvelopeV1['taskArchetypeId'];
  readonly approvedTaskVersion: number;
}

function failure(
  code: 'INVALID_INPUT' | 'INVALID_RESPONSE' | 'INVALID_TRANSITION',
  message: string,
): DomainResult<never> {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable: false },
  };
}

function nextEnvelope(
  state: LiveVoiceCaptureState,
  patch: Partial<VoiceCaptureEnvelopeV1>,
): DomainResult<LiveVoiceCaptureState> {
  const parsed = voiceCaptureEnvelopeV1Schema.safeParse({ ...state.envelope, ...patch });
  return parsed.success
    ? { ok: true, data: { envelope: parsed.data, transcript: state.transcript } }
    : failure('INVALID_INPUT', 'Voice capture state is outside the bounded contract');
}

export function createLiveVoiceCaptureState(
  input: CreateLiveVoiceCaptureInput,
): LiveVoiceCaptureState {
  const envelope = voiceCaptureEnvelopeV1Schema.parse({
    ...input,
    status: 'idle',
    permissionState: 'unknown',
    startedAt: null,
    stoppedAt: null,
    durationMs: 0,
    byteCount: null,
    cacheUri: null,
    deletionStatus: 'not_applicable',
  });
  return { envelope, transcript: null };
}

export function beginVoicePermissionRequest(
  state: LiveVoiceCaptureState,
): DomainResult<LiveVoiceCaptureState> {
  if (state.envelope.status !== 'idle' && state.envelope.status !== 'permission_denied') {
    return failure('INVALID_TRANSITION', 'Voice permission can be requested only from idle');
  }
  return nextEnvelope(state, { status: 'requesting_permission' });
}

export function resolveVoicePermission(
  state: LiveVoiceCaptureState,
  granted: boolean,
): DomainResult<LiveVoiceCaptureState> {
  if (state.envelope.status !== 'requesting_permission') {
    return failure('INVALID_TRANSITION', 'Voice permission has not been requested');
  }
  return nextEnvelope(state, {
    status: granted ? 'ready' : 'permission_denied',
    permissionState: granted ? 'granted' : 'denied',
  });
}

export function startHeldVoiceCapture(
  state: LiveVoiceCaptureState,
  startedAt: string,
): DomainResult<LiveVoiceCaptureState> {
  if (state.envelope.status !== 'ready' || state.envelope.permissionState !== 'granted') {
    return failure('INVALID_TRANSITION', 'Voice capture requires foreground permission and hold');
  }
  return nextEnvelope(state, {
    status: 'recording_held',
    startedAt,
    stoppedAt: null,
    durationMs: 0,
    byteCount: null,
    cacheUri: null,
    deletionStatus: 'not_applicable',
  });
}

export function stopHeldVoiceCapture(
  state: LiveVoiceCaptureState,
  input: {
    readonly stoppedAt: string;
    readonly durationMs: number;
    readonly byteCount: number;
    readonly cacheUri: string;
  },
): DomainResult<LiveVoiceCaptureState> {
  if (state.envelope.status !== 'recording_held') {
    return failure('INVALID_TRANSITION', 'Only a held foreground recording can stop');
  }
  if (
    input.durationMs <= 0 ||
    input.durationMs > MAX_VOICE_DURATION_MS ||
    input.byteCount <= 0 ||
    input.byteCount > MAX_VOICE_BYTES
  ) {
    return failure('INVALID_INPUT', 'Voice duration or encoded size is outside policy');
  }
  return nextEnvelope(state, {
    status: 'transcribing',
    stoppedAt: input.stoppedAt,
    durationMs: input.durationMs,
    byteCount: input.byteCount,
    cacheUri: input.cacheUri,
    deletionStatus: 'pending',
  });
}

export function applyVoiceTranscript(
  state: LiveVoiceCaptureState,
  input: VoiceTranscriptionResponseV1,
  origin: VoiceTranscriptDraftV1['origin'] = 'transcribed',
): DomainResult<LiveVoiceCaptureState> {
  const parsed = voiceTranscriptionResponseV1Schema.safeParse(input);
  if (
    state.envelope.status !== 'transcribing' ||
    !parsed.success ||
    parsed.data.requestId !== state.envelope.requestId ||
    parsed.data.bindingNonce !== state.envelope.bindingNonce ||
    parsed.data.locale !== state.envelope.locale
  ) {
    return failure('INVALID_RESPONSE', 'Voice transcript is stale or malformed');
  }
  const transcript = voiceTranscriptDraftV1Schema.safeParse({
    requestId: parsed.data.requestId,
    bindingNonce: parsed.data.bindingNonce,
    text: parsed.data.text,
    locale: parsed.data.locale,
    origin,
    reviewStatus: 'unreviewed',
  });
  if (!transcript.success) return failure('INVALID_RESPONSE', 'Voice transcript is outside policy');
  const envelope = voiceCaptureEnvelopeV1Schema.safeParse({
    ...state.envelope,
    status: 'transcript_review',
    cacheUri: null,
    deletionStatus: 'deleted',
  });
  return envelope.success
    ? { ok: true, data: { envelope: envelope.data, transcript: transcript.data } }
    : failure('INVALID_RESPONSE', 'Voice transcript state is unavailable');
}

export function editVoiceTranscript(
  state: LiveVoiceCaptureState,
  text: string,
): DomainResult<LiveVoiceCaptureState> {
  if (
    !state.transcript ||
    (state.envelope.status !== 'transcript_review' && state.envelope.status !== 'ready_to_send')
  ) {
    return failure('INVALID_TRANSITION', 'A transcript review is required before editing');
  }
  const transcript = voiceTranscriptDraftV1Schema.safeParse({
    ...state.transcript,
    text,
    reviewStatus: 'edited',
  });
  const envelope = voiceCaptureEnvelopeV1Schema.safeParse({
    ...state.envelope,
    status: 'transcript_review',
  });
  return transcript.success && envelope.success
    ? { ok: true, data: { envelope: envelope.data, transcript: transcript.data } }
    : failure('INVALID_INPUT', 'Edited transcript is outside the bounded text policy');
}

export function markVoiceTranscriptReady(
  state: LiveVoiceCaptureState,
): DomainResult<LiveVoiceCaptureState> {
  if (!state.transcript || state.envelope.status !== 'transcript_review') {
    return failure('INVALID_TRANSITION', 'A visible transcript review is required');
  }
  const transcript = voiceTranscriptDraftV1Schema.safeParse({
    ...state.transcript,
    reviewStatus: 'ready_to_send',
  });
  const envelope = voiceCaptureEnvelopeV1Schema.safeParse({
    ...state.envelope,
    status: 'ready_to_send',
  });
  return transcript.success && envelope.success
    ? { ok: true, data: { envelope: envelope.data, transcript: transcript.data } }
    : failure('INVALID_INPUT', 'Reviewed transcript is outside the bounded text policy');
}

export function beginVoiceTranscriptSend(
  state: LiveVoiceCaptureState,
): DomainResult<LiveVoiceCaptureState> {
  if (
    state.envelope.status !== 'ready_to_send' ||
    state.envelope.deletionStatus !== 'deleted' ||
    !state.transcript ||
    state.transcript.reviewStatus !== 'ready_to_send'
  ) {
    return failure('INVALID_TRANSITION', 'Explicit reviewed text is required before send');
  }
  return nextEnvelope(state, { status: 'sending_text' });
}

export function completeVoiceTranscriptSend(
  state: LiveVoiceCaptureState,
): DomainResult<LiveVoiceCaptureState> {
  if (state.envelope.status !== 'sending_text') {
    return failure('INVALID_TRANSITION', 'No reviewed voice transcript send is active');
  }
  return nextEnvelope(state, { status: 'terminal' });
}

export function restoreVoiceTranscriptAfterFailedSend(
  state: LiveVoiceCaptureState,
): DomainResult<LiveVoiceCaptureState> {
  if (state.envelope.status !== 'sending_text' || !state.transcript) {
    return failure('INVALID_TRANSITION', 'No voice transcript send can be restored');
  }
  return nextEnvelope(state, { status: 'ready_to_send' });
}

export function beginVoiceDeletion(
  state: LiveVoiceCaptureState,
): DomainResult<LiveVoiceCaptureState> {
  if (
    !['recording_held', 'transcribing', 'transcript_review', 'ready_to_send', 'failed'].includes(
      state.envelope.status,
    )
  ) {
    return failure('INVALID_TRANSITION', 'No transient voice data is available to delete');
  }
  const envelope = voiceCaptureEnvelopeV1Schema.safeParse({
    ...state.envelope,
    status: 'deleting',
    deletionStatus: 'pending',
  });
  return envelope.success
    ? { ok: true, data: { envelope: envelope.data, transcript: state.transcript } }
    : failure('INVALID_INPUT', 'Voice deletion state is unavailable');
}

export function completeVoiceDeletion(
  state: LiveVoiceCaptureState,
  deleted: boolean,
): DomainResult<LiveVoiceCaptureState> {
  if (state.envelope.status !== 'deleting') {
    return failure('INVALID_TRANSITION', 'Voice deletion is not active');
  }
  const envelope = voiceCaptureEnvelopeV1Schema.safeParse({
    ...state.envelope,
    status: deleted ? 'deleted' : 'failed',
    cacheUri: deleted ? null : state.envelope.cacheUri,
    deletionStatus: deleted ? 'deleted' : 'failed',
  });
  return envelope.success
    ? { ok: true, data: { envelope: envelope.data, transcript: deleted ? null : state.transcript } }
    : failure('INVALID_RESPONSE', 'Voice deletion result is unavailable');
}
