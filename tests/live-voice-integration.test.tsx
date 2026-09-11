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

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
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

  it.each(['reviewed_voice_transcript', 'typed'] as const)(
    'cancels only the matching voice Coach request while a %s request is pending',
    async (inputOrigin) => {
      await prepareChild();
      const deps = dependencies();
      expectOk(
        usePrototypeStore.getState().prepareLiveVoiceCapture({
          voiceSessionId: 'voice_coach_cancel_123',
          requestId: 'request_coach_cancel_123',
          bindingNonce: 'binding_coach_cancel_123',
        }),
      );
      expectOk(await usePrototypeStore.getState().requestLiveVoicePermission(deps.capture));
      expectOk(await usePrototypeStore.getState().startLiveVoiceHold(deps.capture));
      expectOk(await usePrototypeStore.getState().stopLiveVoiceHold(deps));
      expectOk(usePrototypeStore.getState().markLiveVoiceTranscriptReady());
      const blocked = deferred<void>();
      const entered = deferred<void>();
      const coach: LiveChildCoachTextService = {
        respond: vi.fn(async (request) => {
          entered.resolve();
          await blocked.promise;
          return {
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
          };
        }),
      };
      const request = {
        requestId: 'request_pending_coach_123',
        bindingNonce: 'binding_pending_coach_123',
        intent: 'clarify_step' as const,
      };
      const pendingCoach =
        inputOrigin === 'reviewed_voice_transcript'
          ? usePrototypeStore.getState().sendLiveVoiceTranscript(request, coach)
          : usePrototypeStore
              .getState()
              .requestLiveChildCoach(
                { ...request, inputOrigin, boundedText: 'Please clarify the first step.' },
                coach,
              );
      await entered.promise;
      const requesting = usePrototypeStore.getState().liveChildCoachView;
      expect(requesting.activeRequest).toMatchObject({ inputOrigin });
      const cleanup = deferred<Awaited<ReturnType<VoiceCaptureService['cancel']>>>();
      deps.capture.cancel = vi.fn(() => cleanup.promise);
      const pendingCancel = usePrototypeStore
        .getState()
        .cancelLiveVoiceCapture(deps.capture, deps.media);
      const immediateView = usePrototypeStore.getState().liveChildCoachView;
      const published = vi.fn();
      const unsubscribe = usePrototypeStore.subscribe((state) =>
        published(state.liveChildCoachView),
      );
      blocked.resolve();
      const coachResult = await pendingCoach;
      cleanup.resolve({
        ok: true,
        data: { uri: null },
        meta: { origin: 'live', fallbackUsed: false },
      });
      expectOk(await pendingCancel);
      unsubscribe();

      if (inputOrigin === 'reviewed_voice_transcript') {
        expect(immediateView).toMatchObject({
          status: 'idle',
          activeRequest: null,
          response: null,
        });
        expect(immediateView.requestRevision).toBeGreaterThan(requesting.requestRevision);
        expect(coachResult).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
        expect(usePrototypeStore.getState().liveChildCoachView).toMatchObject({
          status: 'idle',
          activeRequest: null,
          response: null,
        });
        expect(published.mock.calls.every(([view]) => view.response === null)).toBe(true);
      } else {
        expect(immediateView).toBe(requesting);
        expectOk(coachResult);
        expect(usePrototypeStore.getState().liveChildCoachView).toMatchObject({
          status: 'terminal',
          activeRequest: { inputOrigin: 'typed', requestId: request.requestId },
          response: { requestId: request.requestId },
        });
      }
      expect(usePrototypeStore.getState().liveVoiceCapture).toBeNull();
    },
  );

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

  it.each(
    (['stop', 'inspect', 'read'] as const).flatMap((stage) =>
      (['cancel', 'reset', 'replace'] as const).map((invalidation) => ({
        stage,
        invalidation,
      })),
    ),
  )(
    'discards a pending $stage after $invalidation before transcription',
    async ({ stage, invalidation }) => {
      await prepareChild();
      const deps = dependencies();
      const blocked = deferred<void>();
      const entered = deferred<void>();
      const bytes = new Uint8Array([1, 2, 3, 4]);
      const stopHeld = deps.capture.stopHeld;
      const inspect = deps.media.inspect;
      deps.capture.stopHeld = vi.fn(async () => {
        if (stage === 'stop') {
          entered.resolve();
          await blocked.promise;
        }
        return stopHeld();
      });
      deps.media.inspect = vi.fn(async (uri) => {
        if (stage === 'inspect') {
          entered.resolve();
          await blocked.promise;
        }
        return inspect(uri);
      });
      deps.media.read = vi.fn(async () => {
        if (stage === 'read') {
          entered.resolve();
          await blocked.promise;
        }
        return {
          ok: true as const,
          data: bytes,
          meta: { origin: 'live' as const, fallbackUsed: false },
        };
      });
      expectOk(
        usePrototypeStore.getState().prepareLiveVoiceCapture({
          voiceSessionId: 'voice_pending_123456',
          requestId: 'request_pending_123456',
          bindingNonce: 'binding_pending_123456',
        }),
      );
      expectOk(await usePrototypeStore.getState().requestLiveVoicePermission(deps.capture));
      expectOk(await usePrototypeStore.getState().startLiveVoiceHold(deps.capture));
      const pending = usePrototypeStore.getState().stopLiveVoiceHold(deps);
      await entered.promise;

      if (invalidation === 'cancel') {
        expectOk(
          await usePrototypeStore.getState().cancelLiveVoiceCapture(deps.capture, deps.media),
        );
      } else if (invalidation === 'reset') {
        expectOk(resetPrototypeForTest());
      } else {
        expectOk(
          usePrototypeStore.getState().prepareLiveVoiceCapture({
            voiceSessionId: 'voice_replacement_123',
            requestId: 'request_replacement_123',
            bindingNonce: 'binding_replacement_123',
          }),
        );
      }
      const expectedCapture = usePrototypeStore.getState().liveVoiceCapture;
      const publish = vi.fn();
      const unsubscribe = usePrototypeStore.subscribe((state) => publish(state.liveVoiceCapture));
      blocked.resolve();
      const result = await pending;
      unsubscribe();

      expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
      expect(deps.transcription.transcribe).not.toHaveBeenCalled();
      if (stage === 'stop') expect(deps.media.inspect).not.toHaveBeenCalled();
      if (stage !== 'read') expect(deps.media.read).not.toHaveBeenCalled();
      if (stage === 'read') expect(Array.from(bytes)).toEqual([0, 0, 0, 0]);
      expect(deps.media.delete).toHaveBeenCalledWith('file:///cache/voice.m4a');
      expect(usePrototypeStore.getState().liveVoiceCapture).toBe(expectedCapture);
      expect(publish.mock.calls.every(([capture]) => capture === expectedCapture)).toBe(true);
    },
  );

  it('clears cancelled content immediately and preserves a replacement when cleanup settles', async () => {
    await prepareChild();
    const deps = dependencies();
    expectOk(
      usePrototypeStore.getState().prepareLiveVoiceCapture({
        voiceSessionId: 'voice_cancel_slow_123',
        requestId: 'request_cancel_slow_123',
        bindingNonce: 'binding_cancel_slow_123',
      }),
    );
    expectOk(await usePrototypeStore.getState().requestLiveVoicePermission(deps.capture));
    expectOk(await usePrototypeStore.getState().startLiveVoiceHold(deps.capture));
    const cleanup = deferred<Awaited<ReturnType<VoiceCaptureService['cancel']>>>();
    deps.capture.cancel = vi.fn(() => cleanup.promise);
    const pending = usePrototypeStore.getState().cancelLiveVoiceCapture(deps.capture, deps.media);
    const immediateCapture = usePrototypeStore.getState().liveVoiceCapture;
    expectOk(
      usePrototypeStore.getState().prepareLiveVoiceCapture({
        voiceSessionId: 'voice_cancel_fresh_123',
        requestId: 'request_cancel_fresh_123',
        bindingNonce: 'binding_cancel_fresh_123',
      }),
    );
    const replacement = usePrototypeStore.getState().liveVoiceCapture;
    cleanup.resolve({
      ok: true,
      data: { uri: 'file:///cache/voice.m4a' },
      meta: { origin: 'live', fallbackUsed: false },
    });
    expectOk(await pending);
    expect(immediateCapture).toBeNull();
    expect(deps.media.delete).toHaveBeenCalledWith('file:///cache/voice.m4a');
    expect(usePrototypeStore.getState().liveVoiceCapture).toBe(replacement);
  });

  it.each(['capture', 'delete'] as const)(
    'reports a cancellation %s failure without restoring cancelled content',
    async (failingStage) => {
      await prepareChild();
      const deps = dependencies();
      expectOk(
        usePrototypeStore.getState().prepareLiveVoiceCapture({
          voiceSessionId: 'voice_cancel_failure_123',
          requestId: 'request_cancel_failure_123',
          bindingNonce: 'binding_cancel_failure_123',
        }),
      );
      expectOk(await usePrototypeStore.getState().requestLiveVoicePermission(deps.capture));
      expectOk(await usePrototypeStore.getState().startLiveVoiceHold(deps.capture));
      const failure = {
        ok: false as const,
        error: {
          code: 'REMOTE_UNAVAILABLE' as const,
          message: 'Synthetic cleanup failed',
          retryable: false,
          fallbackAvailable: false,
        },
      };
      if (failingStage === 'capture') deps.capture.cancel = vi.fn(async () => failure);
      else deps.media.delete = vi.fn(async () => failure);

      const pending = usePrototypeStore.getState().cancelLiveVoiceCapture(deps.capture, deps.media);
      const immediateCapture = usePrototypeStore.getState().liveVoiceCapture;
      const result = await pending;
      expect(result).toMatchObject({ ok: false, error: { code: 'REMOTE_UNAVAILABLE' } });
      expect(immediateCapture).toBeNull();
      expect(usePrototypeStore.getState().liveVoiceCapture).toBeNull();
      expect(deps.transcription.transcribe).not.toHaveBeenCalled();
    },
  );

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
