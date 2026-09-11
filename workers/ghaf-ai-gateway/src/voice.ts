import { liveChildCoachBoundedTextIsSafe } from '../../../src/features/assistants/liveChildCoach';
import {
  voiceTranscriptionMetadataV1Schema,
  voiceTranscriptionResponseV1Schema,
  type VoiceTranscriptionMetadataV1,
  type VoiceTranscriptionResponseV1,
} from '../../../src/models/boundedAi';
import type { WorkersAiBinding } from './operations';
import { BOUNDED_AI_OPERATION_POLICIES, type GatewayErrorCode } from './security';

export interface VoiceTranscriptionOperationEnv {
  readonly AI: WorkersAiBinding;
  readonly VOICE_TRANSCRIPTION_MODEL?: string;
}

export type VoiceTranscriptionOperationResult =
  | { readonly ok: true; readonly data: VoiceTranscriptionResponseV1 }
  | { readonly ok: false; readonly code: GatewayErrorCode; readonly status: number };

const DEFAULT_VOICE_TRANSCRIPTION_MODEL = '@cf/openai/whisper-large-v3-turbo';

function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = '';
  for (let offset = 0; offset < bytes.byteLength; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function runTranscriptionModel(input: {
  readonly env: VoiceTranscriptionOperationEnv;
  readonly metadata: VoiceTranscriptionMetadataV1;
  readonly audioBytes: Uint8Array;
}) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      input.env.AI.run(
        input.env.VOICE_TRANSCRIPTION_MODEL?.trim() || DEFAULT_VOICE_TRANSCRIPTION_MODEL,
        {
          audio: bytesToBase64(input.audioBytes),
          task: 'transcribe',
          language: input.metadata.locale,
          vad_filter: true,
          condition_on_previous_text: false,
        },
      ).then((value) => ({ status: 'ok' as const, value })),
      new Promise<{ readonly status: 'timeout' }>((resolve) => {
        timeout = setTimeout(
          () => resolve({ status: 'timeout' }),
          BOUNDED_AI_OPERATION_POLICIES.transcribe_child_task_voice_v1.providerTimeoutMs,
        );
      }),
    ]);
  } catch {
    return { status: 'error' as const };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function modelTranscript(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const text = (value as { readonly text?: unknown }).text;
  return typeof text === 'string' ? text : null;
}

export async function executeVoiceTranscription(
  env: VoiceTranscriptionOperationEnv,
  metadata: VoiceTranscriptionMetadataV1,
  audioBytes: Uint8Array,
): Promise<VoiceTranscriptionOperationResult> {
  const parsed = voiceTranscriptionMetadataV1Schema.safeParse(metadata);
  if (
    !parsed.success ||
    audioBytes.byteLength === 0 ||
    audioBytes.byteLength !== parsed.data.declaredByteCount
  ) {
    audioBytes.fill(0);
    return { ok: false, code: 'INVALID_INPUT', status: 400 };
  }

  try {
    const modelResult = await runTranscriptionModel({
      env,
      metadata: parsed.data,
      audioBytes,
    });
    if (modelResult.status === 'timeout') {
      return { ok: false, code: 'TIMEOUT', status: 504 };
    }
    if (modelResult.status === 'error') {
      return { ok: false, code: 'REMOTE_UNAVAILABLE', status: 503 };
    }
    const text = modelTranscript(modelResult.value);
    if (text === null) return { ok: false, code: 'INVALID_RESPONSE', status: 502 };
    if (!liveChildCoachBoundedTextIsSafe(parsed.data.taskArchetypeId, text)) {
      return { ok: false, code: 'SAFETY_REJECTED', status: 422 };
    }
    const response = voiceTranscriptionResponseV1Schema.safeParse({
      schemaVersion: parsed.data.schemaVersion,
      requestId: parsed.data.requestId,
      bindingNonce: parsed.data.bindingNonce,
      text,
      locale: parsed.data.locale,
      audioDeleted: true,
    });
    return response.success
      ? { ok: true, data: response.data }
      : { ok: false, code: 'INVALID_RESPONSE', status: 502 };
  } finally {
    audioBytes.fill(0);
  }
}
