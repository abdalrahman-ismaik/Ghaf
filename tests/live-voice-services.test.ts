import { describe, expect, it, vi } from 'vitest';

import {
  ExpoEphemeralMediaService,
  ExpoVoiceCaptureService,
  type ExpoAudioRecorderPort,
} from '@/services/native/ExpoVoiceCaptureService';
import { createFeature003ServiceRegistry } from '@/services';

function expectOk<T>(
  result: { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: unknown },
): T {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected voice service success');
  return result.data;
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

describe('voice capture and cleanup adapters', () => {
  it.each(
    (['start', 'stop', 'duration', 'cancel'] as const).flatMap((stage) =>
      [true, false].map((deletionSucceeds) => ({ stage, deletionSucceeds })),
    ),
  )(
    'cleans the released cache file after $stage failure with deletion success $deletionSucceeds',
    async ({ stage, deletionSucceeds }) => {
      const cacheUri = 'file:///cache/failed-capture.m4a';
      let recorderUri: string | null = cacheUri;
      const events: string[] = [];
      const recorder: ExpoAudioRecorderPort = {
        get uri() {
          return recorderUri;
        },
        currentTime: stage === 'duration' ? 0 : 1,
        isRecording: true,
        prepareToRecordAsync: vi.fn(async () => {
          if (stage === 'start') throw new Error('Synthetic prepare failure');
        }),
        record: vi.fn(),
        stop: vi.fn(async () => {
          if (stage === 'stop' || stage === 'cancel') {
            throw new Error('Synthetic stop failure');
          }
        }),
        release: vi.fn(() => {
          events.push('release');
          recorderUri = null;
        }),
      };
      const deletionFailure = {
        ok: false as const,
        error: {
          code: 'REMOTE_UNAVAILABLE' as const,
          message: 'Synthetic cache deletion could not be verified',
          retryable: false,
          fallbackAvailable: false,
        },
      };
      const deleteRecording = vi.fn(async (_uri: string) => {
        events.push('delete');
        return deletionSucceeds
          ? {
              ok: true as const,
              data: true as const,
              meta: { origin: 'live' as const, fallbackUsed: false },
            }
          : deletionFailure;
      });
      const service = new ExpoVoiceCaptureService({
        requestRecordingPermissionsAsync: async () => ({ granted: true }),
        setAudioModeAsync: async () => undefined,
        createRecorder: () => recorder,
        deleteRecording,
      });
      expectOk(await service.requestPermission());
      const started = await service.startHeld();
      if (stage !== 'start') expectOk(started);
      const result =
        stage === 'start'
          ? started
          : stage === 'cancel'
            ? await service.cancel()
            : await service.stopHeld();

      expect(deleteRecording).toHaveBeenCalledExactlyOnceWith(cacheUri);
      expect(events).toEqual(['release', 'delete']);
      expect(recorder.release).toHaveBeenCalledOnce();
      if (stage === 'start') expect(recorder.record).not.toHaveBeenCalled();
      if (deletionSucceeds) {
        expect(result).toMatchObject({
          ok: false,
          error: { code: stage === 'duration' ? 'INVALID_INPUT' : 'REMOTE_UNAVAILABLE' },
        });
      } else expect(result).toEqual(deletionFailure);
    },
  );

  it.each(['create', 'configure', 'prepare'] as const)(
    'cancels pending %s before recording and releases its file before a fresh hold',
    async (stage) => {
      const blocked = deferred<void>();
      const oldRecorder: ExpoAudioRecorderPort = {
        uri: 'file:///cache/cancelled-start.m4a',
        currentTime: 1,
        isRecording: false,
        prepareToRecordAsync: vi.fn(async () => {
          if (stage === 'prepare') await blocked.promise;
        }),
        record: vi.fn(),
        stop: vi.fn(async () => undefined),
        release: vi.fn(),
      };
      const freshRecorder: ExpoAudioRecorderPort = {
        ...oldRecorder,
        uri: 'file:///cache/fresh-start.m4a',
        prepareToRecordAsync: vi.fn(async () => undefined),
        record: vi.fn(),
        stop: vi.fn(async () => undefined),
        release: vi.fn(),
      };
      const createRecorder = vi
        .fn(async () => {
          if (stage === 'create') await blocked.promise;
          return oldRecorder;
        })
        .mockImplementationOnce(async () => {
          if (stage === 'create') await blocked.promise;
          return oldRecorder;
        })
        .mockImplementationOnce(async () => freshRecorder);
      const setAudioModeAsync = vi.fn(async (mode: { allowsRecording?: boolean }) => {
        if (stage === 'configure' && mode.allowsRecording) await blocked.promise;
      });
      const service = new ExpoVoiceCaptureService({
        requestRecordingPermissionsAsync: async () => ({ granted: true }),
        setAudioModeAsync,
        createRecorder,
      });
      expectOk(await service.requestPermission());
      const pendingStart = service.startHeld();
      await vi.waitFor(() => {
        if (stage === 'create') expect(createRecorder).toHaveBeenCalledOnce();
        if (stage === 'configure') expect(setAudioModeAsync).toHaveBeenCalledOnce();
        if (stage === 'prepare') expect(oldRecorder.prepareToRecordAsync).toHaveBeenCalledOnce();
      });

      const pendingCancel = service.cancel();
      blocked.resolve();
      await expect(pendingStart).resolves.toMatchObject({
        ok: false,
        error: { code: 'INVALID_TRANSITION' },
      });
      await expect(pendingCancel).resolves.toMatchObject({
        ok: true,
        data: { uri: oldRecorder.uri },
      });
      expect(oldRecorder.record).not.toHaveBeenCalled();
      expect(oldRecorder.release).toHaveBeenCalledOnce();

      expectOk(await service.startHeld());
      expect(freshRecorder.record).toHaveBeenCalledOnce();
      expect(freshRecorder.release).not.toHaveBeenCalled();
      expect(expectOk(await service.stopHeld()).uri).toBe(freshRecorder.uri);
      expect(freshRecorder.stop).toHaveBeenCalledOnce();
      expect(freshRecorder.release).toHaveBeenCalledOnce();
      expect(oldRecorder.release).toHaveBeenCalledOnce();
    },
  );

  it('requests permission, records only while held, and keeps background modes off', async () => {
    const recorder: ExpoAudioRecorderPort = {
      uri: 'file:///cache/held.m4a',
      currentTime: 4.2,
      isRecording: false,
      prepareToRecordAsync: vi.fn(async () => undefined),
      record: vi.fn(),
      stop: vi.fn(async () => undefined),
      release: vi.fn(),
    };
    const setAudioModeAsync = vi.fn(async () => undefined);
    const service = new ExpoVoiceCaptureService({
      requestRecordingPermissionsAsync: async () => ({ granted: true }),
      setAudioModeAsync,
      createRecorder: () => recorder,
      now: () => new Date('2026-09-07T10:00:00.000Z'),
    });

    expect(expectOk(await service.requestPermission())).toBe('granted');
    expectOk(await service.startHeld());
    expect(recorder.prepareToRecordAsync).toHaveBeenCalledOnce();
    expect(recorder.record).toHaveBeenCalledWith({ forDuration: 15 });
    expect(setAudioModeAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        allowsRecording: true,
        allowsBackgroundRecording: false,
        shouldPlayInBackground: false,
      }),
    );

    const stopped = expectOk(await service.stopHeld());
    expect(stopped).toMatchObject({
      uri: 'file:///cache/held.m4a',
      durationMs: 4_200,
      mediaType: 'audio/m4a',
    });
    expect(recorder.stop).toHaveBeenCalledOnce();
    expect(recorder.release).toHaveBeenCalledOnce();
  });

  it('stops and returns the transient URI on cancellation without restarting', async () => {
    const recorder: ExpoAudioRecorderPort = {
      uri: 'file:///cache/cancel.m4a',
      currentTime: 1,
      isRecording: true,
      prepareToRecordAsync: async () => undefined,
      record: vi.fn(),
      stop: vi.fn(async () => undefined),
      release: vi.fn(),
    };
    const service = new ExpoVoiceCaptureService({
      requestRecordingPermissionsAsync: async () => ({ granted: true }),
      setAudioModeAsync: async () => undefined,
      createRecorder: () => recorder,
    });
    expectOk(await service.requestPermission());
    expectOk(await service.startHeld());
    await expect(service.cancel()).resolves.toMatchObject({
      ok: true,
      data: { uri: expect.any(String) },
    });
    expect(recorder.stop).toHaveBeenCalledOnce();
    expect(recorder.release).toHaveBeenCalledOnce();
  });

  it('inspects, reads, and explicitly deletes only cache-scoped files', async () => {
    let exists = true;
    const deleteFile = vi.fn(() => {
      exists = false;
    });
    const service = new ExpoEphemeralMediaService({
      cachePrefix: 'file:///cache/',
      createFile: (uri) => ({
        uri,
        get exists() {
          return exists;
        },
        size: 4,
        bytes: async () => new Uint8Array([1, 2, 3, 4]),
        delete: deleteFile,
      }),
    });

    expect(expectOk(await service.inspect('file:///cache/voice.m4a'))).toEqual({
      uri: 'file:///cache/voice.m4a',
      byteCount: 4,
    });
    expect(Array.from(expectOk(await service.read('file:///cache/voice.m4a')))).toEqual([
      1, 2, 3, 4,
    ]);
    expectOk(await service.delete('file:///cache/voice.m4a'));
    expect(deleteFile).toHaveBeenCalledOnce();
    await expect(service.inspect('file:///documents/private.m4a')).resolves.toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
  });

  it('removes only orphaned native recording files after process restart', async () => {
    const makeFile = (uri: string) => {
      let exists = true;
      return {
        uri,
        get exists() {
          return exists;
        },
        size: 4,
        bytes: async () => new Uint8Array([1, 2, 3, 4]),
        delete: vi.fn(() => {
          exists = false;
        }),
      };
    };
    const orphan = makeFile('file:///cache/recording-123e4567-e89b-12d3-a456-426614174000.m4a');
    const unrelated = makeFile('file:///cache/onboarding-ambience.m4a');
    const service = new ExpoEphemeralMediaService({
      cachePrefix: 'file:///cache/',
      createFile: (uri) => (uri === orphan.uri ? orphan : unrelated),
      listCacheFiles: () => [orphan, unrelated],
    });

    expect(expectOk(await service.purgeOrphanedRecordings())).toBe(1);
    expect(orphan.delete).toHaveBeenCalledOnce();
    expect(unrelated.delete).not.toHaveBeenCalled();
  });

  it('keeps prepared transcription text-only and correlation-bound', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const result =
      await createFeature003ServiceRegistry().boundedAi.voiceTranscriptionPrepared.transcribe({
        metadata: {
          operation: 'transcribe_child_task_voice_v1',
          schemaVersion: '1.0',
          requestId: 'request_voice_service_123',
          bindingNonce: 'binding_voice_service_123',
          locale: 'en',
          taskArchetypeId: 'task_recycling_p0_v1',
          catalogVersion: 1,
          approvedTaskVersion: 1,
          noticeVersion: 1,
          grantVersion: 2,
          durationMs: 1_000,
          declaredByteCount: bytes.byteLength,
          mediaType: 'audio/m4a',
          synthetic: true,
        },
        audioBytes: bytes,
      });
    expectOk(result);
    expect(result).not.toHaveProperty('data.audio');
    expect(result).not.toHaveProperty('data.confidence');
  });
});
