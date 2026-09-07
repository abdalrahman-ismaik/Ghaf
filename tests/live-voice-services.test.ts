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

describe('voice capture and cleanup adapters', () => {
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
