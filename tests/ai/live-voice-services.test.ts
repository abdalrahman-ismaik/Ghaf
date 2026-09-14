import { describe, expect, it, vi } from 'vitest';
import type { AudioStatus, RecordingStatus } from 'expo-audio';

import {
  ExpoEphemeralMediaService,
  ExpoVoiceCaptureService,
  type ExpoAudioRecorderPort,
} from '@/services/native/ExpoVoiceCaptureService';
import { createFeature003ServiceRegistry, type ServiceResult } from '@/services';

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

function automaticCaptureFixture(duration = 15, isLoaded = true) {
  const uri = 'file:///cache/automatic-completion.m4a';
  let recording = true;
  let notifyRecording: ((status: RecordingStatus) => void) | undefined;
  let notifyMetadata:
    ((status: Pick<AudioStatus, 'duration' | 'isLoaded' | 'error'>) => void) | undefined;
  const removeRecordingListener = vi.fn();
  const removeMetadataListener = vi.fn();
  const recorder = {
    uri,
    get currentTime() {
      return recording ? 14 : 0;
    },
    get isRecording() {
      return recording;
    },
    prepareToRecordAsync: async () => undefined,
    record: vi.fn(),
    stop: vi.fn(async () => ({ durationMillis: 0, url: uri })),
    release: vi.fn(),
    addListener: (_event: string, listener: (status: RecordingStatus) => void) => {
      notifyRecording = listener;
      return { remove: removeRecordingListener };
    },
  };
  const player = {
    isLoaded,
    duration,
    play: vi.fn(),
    addListener: vi.fn((_event: string, listener: NonNullable<typeof notifyMetadata>) => {
      notifyMetadata = listener;
      return { remove: removeMetadataListener };
    }),
    remove: vi.fn(),
  };
  const options = {
    requestRecordingPermissionsAsync: async () => ({ granted: true }),
    setAudioModeAsync: vi.fn(async () => undefined),
    createRecorder: vi.fn<() => ExpoAudioRecorderPort>(() => recorder),
    createDurationPlayer: vi.fn(async () => player),
    deleteRecording: vi.fn(async () => ({
      ok: true as const,
      data: true as const,
      meta: { origin: 'live' as const, fallbackUsed: false },
    })),
  };
  const service = new ExpoVoiceCaptureService(options);
  return {
    uri,
    recorder,
    player,
    service,
    options,
    removeRecordingListener,
    removeMetadataListener,
    async start() {
      expectOk(await service.requestPermission());
      expectOk(await service.startHeld());
    },
    finishRecording(status: Partial<RecordingStatus> = {}) {
      recording = false;
      notifyRecording?.({
        id: 'synthetic-recorder',
        isFinished: true,
        hasError: false,
        error: null,
        url: uri,
        ...status,
      });
    },
    resetNativeState() {
      recording = false;
    },
    finishMetadata(status: Partial<Pick<AudioStatus, 'duration' | 'isLoaded' | 'error'>> = {}) {
      notifyMetadata?.({ duration, isLoaded: true, error: null, ...status });
    },
  };
}

describe('voice capture and cleanup adapters', () => {
  it.each([
    { hasError: true },
    { error: 'Synthetic native completion failure' },
    { mediaServicesDidReset: true },
    { url: 'file:///cache/unrelated-recording.m4a' },
  ])(
    'rejects unsuccessful or mismatched native completion %j before reading metadata',
    async (status) => {
      const fixture = automaticCaptureFixture();
      await fixture.start();
      fixture.finishRecording(status);
      await expect(fixture.service.stopHeld()).resolves.toMatchObject({ ok: false });
      expect(fixture.options.createDurationPlayer).not.toHaveBeenCalled();
      expect(fixture.options.deleteRecording).toHaveBeenCalledExactlyOnceWith(fixture.uri);
      expect(fixture.removeRecordingListener).toHaveBeenCalledOnce();
    },
  );

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, 15.001])(
    'rejects invalid measured duration %s without clamping',
    async (duration) => {
      const fixture = automaticCaptureFixture(duration);
      await fixture.start();
      fixture.finishRecording();
      await expect(fixture.service.stopHeld()).resolves.toMatchObject({ ok: false });
      expect(fixture.options.deleteRecording).toHaveBeenCalledExactlyOnceWith(fixture.uri);
      expect(fixture.removeMetadataListener).toHaveBeenCalledOnce();
      expect(fixture.player.remove).toHaveBeenCalledOnce();
      expect(fixture.player.play).not.toHaveBeenCalled();
    },
  );

  it('waits for the native terminal event after state resets and metadata loads later', async () => {
    const fixture = automaticCaptureFixture(15, false);
    await fixture.start();
    fixture.resetNativeState();
    const stopped = fixture.service.stopHeld();
    await Promise.resolve();
    expect(fixture.options.createDurationPlayer).not.toHaveBeenCalled();
    fixture.finishRecording();
    await vi.waitFor(() => expect(fixture.player.addListener).toHaveBeenCalledOnce());
    fixture.finishMetadata();
    expect(expectOk(await stopped).durationMs).toBe(15_000);
    expect(fixture.recorder.stop).not.toHaveBeenCalled();
    expect(fixture.removeMetadataListener).toHaveBeenCalledOnce();
    expect(fixture.player.remove).toHaveBeenCalledOnce();
  });

  it('recovers native completion racing the explicit stop call', async () => {
    const fixture = automaticCaptureFixture(14.999);
    await fixture.start();
    fixture.recorder.stop.mockImplementationOnce(async () => {
      fixture.finishRecording();
      return { durationMillis: 0, url: fixture.uri };
    });
    expect(expectOk(await fixture.service.stopHeld()).durationMs).toBe(14_999);
    expect(fixture.recorder.stop).toHaveBeenCalledOnce();
    expect(fixture.player.remove).toHaveBeenCalledOnce();
  });

  it.each(['completion', 'metadata'] as const)(
    'bounds waiting for %s and cleans every created resource',
    async (stage) => {
      vi.useFakeTimers();
      try {
        const fixture = automaticCaptureFixture(15, false);
        await fixture.start();
        if (stage === 'completion') fixture.resetNativeState();
        else fixture.finishRecording();
        const stopped = fixture.service.stopHeld();
        await vi.advanceTimersByTimeAsync(2_001);
        await expect(stopped).resolves.toMatchObject({ ok: false });
        expect(fixture.options.deleteRecording).toHaveBeenCalledExactlyOnceWith(fixture.uri);
        expect(fixture.removeRecordingListener).toHaveBeenCalledOnce();
        expect(fixture.recorder.release).toHaveBeenCalledOnce();
        if (stage === 'metadata') {
          expect(fixture.removeMetadataListener).toHaveBeenCalledOnce();
          expect(fixture.player.remove).toHaveBeenCalledOnce();
        } else expect(fixture.options.createDurationPlayer).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    },
  );

  it('fails closed on metadata errors and removes the inactive player', async () => {
    const fixture = automaticCaptureFixture(15, false);
    await fixture.start();
    fixture.finishRecording();
    const stopped = fixture.service.stopHeld();
    await vi.waitFor(() => expect(fixture.player.addListener).toHaveBeenCalledOnce());
    fixture.finishMetadata({ error: 'Synthetic metadata error', isLoaded: false });
    await expect(stopped).resolves.toMatchObject({ ok: false });
    expect(fixture.player.remove).toHaveBeenCalledOnce();
    expect(fixture.removeMetadataListener).toHaveBeenCalledOnce();
    expect(fixture.options.deleteRecording).toHaveBeenCalledExactlyOnceWith(fixture.uri);
  });

  it.each(['cancel', 'timeout'] as const)(
    'removes a metadata player created after %s without disturbing a new hold',
    async (stage) => {
      vi.useFakeTimers();
      try {
        const fixture = automaticCaptureFixture();
        const creation = deferred<typeof fixture.player>();
        fixture.options.createDurationPlayer.mockImplementationOnce(() => creation.promise);
        await fixture.start();
        fixture.finishRecording();
        const stopped = fixture.service.stopHeld();
        await vi.advanceTimersByTimeAsync(0);
        expect(fixture.options.createDurationPlayer).toHaveBeenCalledOnce();
        if (stage === 'cancel') expectOk(await fixture.service.cancel());
        else await vi.advanceTimersByTimeAsync(2_001);
        await expect(stopped).resolves.toMatchObject({ ok: false });
        const freshRecorder: ExpoAudioRecorderPort = {
          uri: 'file:///cache/fresh-after-completion.m4a',
          currentTime: 1,
          isRecording: true,
          prepareToRecordAsync: async () => undefined,
          record: vi.fn(),
          stop: vi.fn(async () => undefined),
          release: vi.fn(),
        };
        fixture.options.createRecorder.mockReturnValueOnce(freshRecorder);
        expectOk(await fixture.service.startHeld());
        creation.resolve(fixture.player);
        fixture.finishRecording({ hasError: true });
        await vi.advanceTimersByTimeAsync(0);
        expect(fixture.player.remove).toHaveBeenCalledOnce();
        expect(fixture.player.addListener).not.toHaveBeenCalled();
        expect(freshRecorder.release).not.toHaveBeenCalled();
        expect(expectOk(await fixture.service.stopHeld()).uri).toBe(freshRecorder.uri);
        expect(fixture.options.deleteRecording).toHaveBeenCalledExactlyOnceWith(fixture.uri);
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    },
  );

  it('retains measured duration after native automatic completion resets currentTime', async () => {
    const uri = 'file:///cache/automatically-finished.m4a';
    let recording = true;
    let notify: ((status: RecordingStatus) => void) | undefined;
    const removeRecordingListener = vi.fn();
    const recorder = {
      uri,
      get currentTime() {
        return recording ? 14 : 0;
      },
      get isRecording() {
        return recording;
      },
      prepareToRecordAsync: async () => undefined,
      record: vi.fn(),
      stop: vi.fn(async () => ({ durationMillis: 0, url: uri })),
      release: vi.fn(),
      addListener: (_event: string, listener: (status: RecordingStatus) => void) => {
        notify = listener;
        return { remove: removeRecordingListener };
      },
    };
    const player = {
      isLoaded: true,
      duration: 14.987,
      addListener: vi.fn(() => ({ remove: vi.fn() })),
      remove: vi.fn(),
    };
    const createDurationPlayer = vi.fn(async () => player);
    const options = {
      requestRecordingPermissionsAsync: async () => ({ granted: true }),
      setAudioModeAsync: async () => undefined,
      createRecorder: () => recorder,
      createDurationPlayer,
      deleteRecording: vi.fn(async () => ({
        ok: true as const,
        data: true as const,
        meta: { origin: 'live' as const, fallbackUsed: false },
      })),
    };
    const service = new ExpoVoiceCaptureService(options);
    expectOk(await service.requestPermission());
    expectOk(await service.startHeld());
    recording = false;
    notify?.({
      id: 'synthetic-recorder',
      isFinished: true,
      hasError: false,
      error: null,
      url: uri,
    });

    expect(expectOk(await service.stopHeld())).toMatchObject({ uri, durationMs: 14_987 });
    expect(recorder.stop).not.toHaveBeenCalled();
    expect(createDurationPlayer).toHaveBeenCalledExactlyOnceWith(uri);
    expect(removeRecordingListener).toHaveBeenCalledOnce();
    expect(player.remove).toHaveBeenCalledOnce();
    expect(recorder.release).toHaveBeenCalledOnce();
    expect(options.deleteRecording).not.toHaveBeenCalled();
  });

  it.each([
    { nativeStatus: { durationMillis: 4_200 }, expectedCode: 'REMOTE_UNAVAILABLE' },
    {
      nativeStatus: { durationMillis: Number.NaN, url: 'file:///cache/native-status.m4a' },
      expectedCode: 'INVALID_INPUT',
    },
    {
      nativeStatus: { durationMillis: 15_001, url: 'file:///cache/native-status.m4a' },
      expectedCode: 'INVALID_INPUT',
    },
    {
      nativeStatus: { durationMillis: 4_350, url: 'file:///cache/native-status.m4a' },
      expectedCode: null,
    },
  ])(
    'honors native resolved stop status with result $expectedCode',
    async ({ nativeStatus, expectedCode }) => {
      const recorder: ExpoAudioRecorderPort = {
        uri: 'file:///cache/native-status.m4a',
        currentTime: 4.2,
        isRecording: true,
        prepareToRecordAsync: async () => undefined,
        record: vi.fn(),
        stop: vi.fn(async () => nativeStatus),
        release: vi.fn(),
      };
      const deleteRecording = vi.fn(async () => ({
        ok: true as const,
        data: true as const,
        meta: { origin: 'live' as const, fallbackUsed: false },
      }));
      const service = new ExpoVoiceCaptureService({
        requestRecordingPermissionsAsync: async () => ({ granted: true }),
        setAudioModeAsync: async () => undefined,
        createRecorder: () => recorder,
        deleteRecording,
      });
      expectOk(await service.requestPermission());
      expectOk(await service.startHeld());
      const result = await service.stopHeld();

      expect(recorder.release).toHaveBeenCalledOnce();
      if (expectedCode) {
        expect(result).toMatchObject({ ok: false, error: { code: expectedCode } });
        expect(deleteRecording).toHaveBeenCalledExactlyOnceWith(recorder.uri);
      } else {
        expect(result).toMatchObject({
          ok: true,
          data: { uri: recorder.uri, durationMs: nativeStatus.durationMillis },
        });
        expect(deleteRecording).not.toHaveBeenCalled();
      }
    },
  );

  it('retries failed released-file deletion on cancellation before a new hold', async () => {
    const uri = 'file:///cache/failed-stop-cleanup.m4a';
    const cleanupFailure = {
      ok: false as const,
      error: {
        code: 'REMOTE_UNAVAILABLE' as const,
        message: 'Synthetic cleanup failure',
        retryable: false,
        fallbackAvailable: false,
      },
    };
    const recorder: ExpoAudioRecorderPort = {
      uri,
      currentTime: 4.2,
      isRecording: true,
      prepareToRecordAsync: async () => undefined,
      record: vi.fn(),
      stop: vi.fn(async () => ({ durationMillis: 4_200 })),
      release: vi.fn(),
    };
    const deleteRecording = vi
      .fn<() => Promise<ServiceResult<true>>>(async () => ({
        ok: true as const,
        data: true as const,
        meta: { origin: 'live' as const, fallbackUsed: false },
      }))
      .mockResolvedValueOnce(cleanupFailure);
    const service = new ExpoVoiceCaptureService({
      requestRecordingPermissionsAsync: async () => ({ granted: true }),
      setAudioModeAsync: async () => undefined,
      createRecorder: () => recorder,
      deleteRecording,
    });
    expectOk(await service.requestPermission());
    expectOk(await service.startHeld());
    await expect(service.stopHeld()).resolves.toEqual(cleanupFailure);
    await expect(service.startHeld()).resolves.toMatchObject({ ok: false });
    expectOk(await service.cancel());
    expect(deleteRecording).toHaveBeenCalledTimes(2);
    expect(deleteRecording).toHaveBeenLastCalledWith(uri);
    expectOk(await service.startHeld());
    expect(recorder.record).toHaveBeenCalledTimes(2);
  });

  it.each([
    { seconds: 4.2, resetOnStop: true, accepted: true },
    { seconds: 15, resetOnStop: true, accepted: true },
    { seconds: 15.001, resetOnStop: false, accepted: false },
    { seconds: 0, resetOnStop: false, accepted: false },
    { seconds: -1, resetOnStop: false, accepted: false },
    { seconds: Number.NaN, resetOnStop: false, accepted: false },
    { seconds: Number.POSITIVE_INFINITY, resetOnStop: false, accepted: false },
  ])(
    'validates $seconds seconds before native stop resets duration: $resetOnStop',
    async ({ seconds, resetOnStop, accepted }) => {
      let currentTime = seconds;
      const recorder: ExpoAudioRecorderPort = {
        uri: 'file:///cache/held-duration.m4a',
        get currentTime() {
          return currentTime;
        },
        isRecording: true,
        prepareToRecordAsync: async () => undefined,
        record: vi.fn(),
        stop: vi.fn(async () => {
          if (resetOnStop) currentTime = 0;
        }),
        release: vi.fn(),
      };
      const deleteRecording = vi.fn(async () => ({
        ok: true as const,
        data: true as const,
        meta: { origin: 'live' as const, fallbackUsed: false },
      }));
      const service = new ExpoVoiceCaptureService({
        requestRecordingPermissionsAsync: async () => ({ granted: true }),
        setAudioModeAsync: async () => undefined,
        createRecorder: () => recorder,
        deleteRecording,
      });
      expectOk(await service.requestPermission());
      expectOk(await service.startHeld());
      const result = await service.stopHeld();

      expect(recorder.stop).toHaveBeenCalledOnce();
      expect(recorder.release).toHaveBeenCalledOnce();
      if (accepted) {
        expect(result).toMatchObject({
          ok: true,
          data: { durationMs: Math.round(seconds * 1_000), uri: recorder.uri },
        });
        expect(deleteRecording).not.toHaveBeenCalled();
      } else {
        expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
        expect(deleteRecording).toHaveBeenCalledExactlyOnceWith(recorder.uri);
      }
    },
  );

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
