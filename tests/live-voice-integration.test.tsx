import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SYNTHETIC_PARENT_REAUTHENTICATION_CODE } from '@/models/access';
import type {
  EphemeralMediaService,
  LiveChildCoachTextService,
  VoiceCaptureService,
  VoiceTranscriptionService,
} from '@/services';
import { usePrototypeStore, type PrototypeStoreState } from '@/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from './helpers/prototypeStore';

const parentText = {
  ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
  en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
};

function expectOk<T>(
  result: { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: unknown },
): T {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected valid voice integration result');
  return result.data;
}

async function prepareChild({ grants = true, eligibleAge = true } = {}) {
  if (eligibleAge) {
    const state = usePrototypeStore.getState();
    usePrototypeStore.setState({
      children: {
        ...state.children,
        child_salem: { ...state.children.child_salem, age: 14, ageBand: '12_14' },
      },
    } as unknown as Partial<PrototypeStoreState>);
  }
  if (grants) {
    const capabilities: readonly ('text' | 'voice')[] = eligibleAge ? ['text', 'voice'] : ['text'];
    for (const capability of capabilities) {
      expectOk(
        usePrototypeStore.getState().updateLiveChildAiGrant({
          childId: 'child_salem',
          capability,
          granted: true,
          reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
        }),
      );
    }
  }
  expectOk(
    usePrototypeStore.getState().createTaskDraft({
      childId: 'child_salem',
      templateId: 'task_recycling_p0_v1',
      parentText,
    }),
  );
  expectOk(usePrototypeStore.getState().reviewTask());
  expectOk(usePrototypeStore.getState().approveAssignment());
  await enterChildExperienceForTest('child_salem');
  expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
  expectOk(usePrototypeStore.getState().startAssignment());
}

function dependencies() {
  const capture: VoiceCaptureService = {
    requestPermission: vi.fn(async () => ({
      ok: true as const,
      data: 'granted' as const,
      meta: { origin: 'live' as const, fallbackUsed: false },
    })),
    startHeld: vi.fn(async () => ({
      ok: true as const,
      data: { startedAt: '2026-09-07T10:00:00.000Z' },
      meta: { origin: 'live' as const, fallbackUsed: false },
    })),
    stopHeld: vi.fn(async () => ({
      ok: true as const,
      data: { uri: 'file:///cache/voice.m4a', durationMs: 1_000, mediaType: 'audio/m4a' as const },
      meta: { origin: 'live' as const, fallbackUsed: false },
    })),
    cancel: vi.fn(async () => ({
      ok: true as const,
      data: { uri: 'file:///cache/voice.m4a' },
      meta: { origin: 'live' as const, fallbackUsed: false },
    })),
  };
  const media: EphemeralMediaService = {
    inspect: vi.fn(async () => ({
      ok: true as const,
      data: { uri: 'file:///cache/voice.m4a', byteCount: 4 },
      meta: { origin: 'live' as const, fallbackUsed: false },
    })),
    read: vi.fn(async () => ({
      ok: true as const,
      data: new Uint8Array([1, 2, 3, 4]),
      meta: { origin: 'live' as const, fallbackUsed: false },
    })),
    delete: vi.fn(async () => ({
      ok: true as const,
      data: true as const,
      meta: { origin: 'live' as const, fallbackUsed: false },
    })),
  };
  const transcription: VoiceTranscriptionService = {
    transcribe: vi.fn(async (input) => ({
      ok: true as const,
      data: {
        schemaVersion: '1.0' as const,
        requestId: input.metadata.requestId,
        bindingNonce: input.metadata.bindingNonce,
        text: 'Please clarify the first step.',
        locale: input.metadata.locale,
        audioDeleted: true as const,
      },
      meta: { origin: 'live' as const, fallbackUsed: false },
    })),
  };
  return { capture, media, transcription };
}

describe('live voice integration', () => {
  beforeEach(async () => {
    expectOk(resetPrototypeForTest());
    await enterParentExperienceForTest();
  });

  it('keeps current P0 ages 9–11 unable to reach real capture', async () => {
    await prepareChild({ eligibleAge: false });
    expect(
      usePrototypeStore.getState().prepareLiveVoiceCapture({
        voiceSessionId: 'voice_current_p0_123',
        requestId: 'request_current_p0_123',
        bindingNonce: 'binding_current_p0_123',
      }),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
    expect(usePrototypeStore.getState().liveVoiceCapture).toBeNull();
  });

  it('captures one held clip, deletes audio, and waits for transcript review', async () => {
    await prepareChild();
    const { capture, media, transcription } = dependencies();
    expectOk(
      usePrototypeStore.getState().prepareLiveVoiceCapture({
        voiceSessionId: 'voice_review_123456',
        requestId: 'request_review_123456',
        bindingNonce: 'binding_review_123456',
      }),
    );
    expectOk(await usePrototypeStore.getState().requestLiveVoicePermission(capture));
    expectOk(await usePrototypeStore.getState().startLiveVoiceHold(capture));
    expectOk(
      await usePrototypeStore.getState().stopLiveVoiceHold({ capture, media, transcription }),
    );
    expect(usePrototypeStore.getState().liveVoiceCapture?.state).toMatchObject({
      envelope: { status: 'transcript_review', cacheUri: null, deletionStatus: 'deleted' },
      transcript: { text: 'Please clarify the first step.', reviewStatus: 'unreviewed' },
    });
    expect(media.delete).toHaveBeenCalledWith('file:///cache/voice.m4a');
    expect(usePrototypeStore.getState().liveChildCoachView.status).toBe('idle');
  });

  it('sends only explicitly reviewed text to the terminal Coach', async () => {
    await prepareChild();
    const deps = dependencies();
    expectOk(
      usePrototypeStore.getState().prepareLiveVoiceCapture({
        voiceSessionId: 'voice_send_1234567',
        requestId: 'request_send_1234567',
        bindingNonce: 'binding_send_1234567',
      }),
    );
    expectOk(await usePrototypeStore.getState().requestLiveVoicePermission(deps.capture));
    expectOk(await usePrototypeStore.getState().startLiveVoiceHold(deps.capture));
    expectOk(await usePrototypeStore.getState().stopLiveVoiceHold(deps));
    expectOk(
      usePrototypeStore.getState().editLiveVoiceTranscript('Please clarify the first step.'),
    );
    expectOk(usePrototypeStore.getState().markLiveVoiceTranscriptReady());
    const coachRespond = vi.fn<LiveChildCoachTextService['respond']>(async (request) => ({
      ok: true as const,
      data: {
        schemaVersion: '1.0' as const,
        requestId: request.requestId,
        taskBindingNonce: request.taskBindingNonce,
        intent: request.intent,
        disposition: 'coach' as const,
        steps: [{ ar: 'ابدأ بالخطوة الأولى.', en: 'Start with the first step.' }],
        ifThenCue: null,
        reflectionQuestion: null,
        reviewedPhrase: null,
        terminal: true as const,
      },
      meta: { origin: 'live' as const, fallbackUsed: false },
    }));
    const coach: LiveChildCoachTextService = { respond: coachRespond };
    expectOk(
      await usePrototypeStore.getState().sendLiveVoiceTranscript(
        {
          requestId: 'request_voice_coach_123',
          bindingNonce: 'binding_voice_coach_123',
          intent: 'clarify_step',
        },
        coach,
      ),
    );
    expect(coachRespond).toHaveBeenCalledWith(
      expect.objectContaining({
        boundedText: 'Please clarify the first step.',
        inputOrigin: 'reviewed_voice_transcript',
        voiceGrantVersion: expect.any(Number),
        voiceRequestId: 'request_send_1234567',
        voiceBindingNonce: 'binding_send_1234567',
      }),
    );
    expect(JSON.stringify(coachRespond.mock.calls)).not.toContain('audioBytes');
    expect(usePrototypeStore.getState().liveVoiceCapture?.state.envelope.status).toBe('terminal');
  });

  it('cleans up on route/background invalidation and prototype reset', async () => {
    await prepareChild();
    const deps = dependencies();
    expectOk(
      usePrototypeStore.getState().prepareLiveVoiceCapture({
        voiceSessionId: 'voice_cancel_123456',
        requestId: 'request_cancel_123456',
        bindingNonce: 'binding_cancel_123456',
      }),
    );
    expectOk(await usePrototypeStore.getState().requestLiveVoicePermission(deps.capture));
    expectOk(await usePrototypeStore.getState().startLiveVoiceHold(deps.capture));
    expectOk(await usePrototypeStore.getState().cancelLiveVoiceCapture(deps.capture, deps.media));
    expect(deps.capture.cancel).toHaveBeenCalledOnce();
    expect(deps.media.delete).toHaveBeenCalledWith('file:///cache/voice.m4a');
    expect(usePrototypeStore.getState().liveVoiceCapture).toBeNull();
  });

  it('deletes local audio and uses a prepared transcript when transcription throws', async () => {
    await prepareChild();
    const deps = dependencies();
    const transcription: VoiceTranscriptionService = {
      transcribe: vi.fn(async () => {
        throw new Error('provider crash');
      }),
    };
    expectOk(
      usePrototypeStore.getState().prepareLiveVoiceCapture({
        voiceSessionId: 'voice_throw_1234567',
        requestId: 'request_throw_1234567',
        bindingNonce: 'binding_throw_1234567',
      }),
    );
    expectOk(await usePrototypeStore.getState().requestLiveVoicePermission(deps.capture));
    expectOk(await usePrototypeStore.getState().startLiveVoiceHold(deps.capture));

    await expect(
      usePrototypeStore.getState().stopLiveVoiceHold({ ...deps, transcription }),
    ).resolves.toMatchObject({ ok: true });
    expect(deps.media.delete).toHaveBeenCalledWith('file:///cache/voice.m4a');
    expect(usePrototypeStore.getState().liveVoiceCapture?.state.transcript).toMatchObject({
      origin: 'prepared_synthetic',
    });
  });

  it('never displays a transcript unless local deletion is verified', async () => {
    await prepareChild();
    const deps = dependencies();
    deps.media.delete = vi.fn(async () => ({
      ok: false as const,
      error: {
        code: 'REMOTE_UNAVAILABLE' as const,
        message: 'delete failed',
        retryable: false,
        fallbackAvailable: false,
      },
    }));
    expectOk(
      usePrototypeStore.getState().prepareLiveVoiceCapture({
        voiceSessionId: 'voice_delete_123456',
        requestId: 'request_delete_123456',
        bindingNonce: 'binding_delete_123456',
      }),
    );
    expectOk(await usePrototypeStore.getState().requestLiveVoicePermission(deps.capture));
    expectOk(await usePrototypeStore.getState().startLiveVoiceHold(deps.capture));

    await expect(usePrototypeStore.getState().stopLiveVoiceHold(deps)).resolves.toMatchObject({
      ok: false,
      error: { code: 'REMOTE_UNAVAILABLE' },
    });
    expect(usePrototypeStore.getState().liveVoiceCapture?.state).toMatchObject({
      envelope: { status: 'failed', deletionStatus: 'failed' },
      transcript: null,
    });
  });

  it('discards a transcription that settles after sign-out while still deleting audio', async () => {
    await prepareChild();
    const deps = dependencies();
    type TranscriptionResult = Awaited<ReturnType<VoiceTranscriptionService['transcribe']>>;
    let resolveTranscript: (value: TranscriptionResult) => void = () => undefined;
    const transcribe = vi.fn<VoiceTranscriptionService['transcribe']>(
      () =>
        new Promise<TranscriptionResult>((resolve) => {
          resolveTranscript = resolve;
        }),
    );
    const transcription: VoiceTranscriptionService = {
      transcribe,
    };
    expectOk(
      usePrototypeStore.getState().prepareLiveVoiceCapture({
        voiceSessionId: 'voice_stale_1234567',
        requestId: 'request_stale_1234567',
        bindingNonce: 'binding_stale_1234567',
      }),
    );
    expectOk(await usePrototypeStore.getState().requestLiveVoicePermission(deps.capture));
    expectOk(await usePrototypeStore.getState().startLiveVoiceHold(deps.capture));
    const pending = usePrototypeStore.getState().stopLiveVoiceHold({ ...deps, transcription });
    await vi.waitFor(() => expect(transcription.transcribe).toHaveBeenCalledOnce());
    expectOk(usePrototypeStore.getState().signOutExperience());
    const metadata = transcribe.mock.calls[0]?.[0].metadata;
    if (!metadata) throw new Error('Expected transcription metadata');
    resolveTranscript({
      ok: true,
      data: {
        schemaVersion: '1.0',
        requestId: metadata.requestId,
        bindingNonce: metadata.bindingNonce,
        text: 'Please clarify the first step.',
        locale: metadata.locale,
        audioDeleted: true,
      },
      meta: { origin: 'live', fallbackUsed: false },
    });

    await expect(pending).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(deps.media.delete).toHaveBeenCalledWith('file:///cache/voice.m4a');
    expect(usePrototypeStore.getState().liveVoiceCapture).toBeNull();
  });
});
