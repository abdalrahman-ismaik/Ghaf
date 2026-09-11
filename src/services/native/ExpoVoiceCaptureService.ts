import type { AudioMode } from 'expo-audio';

import { MAX_VOICE_BYTES } from '../../models/boundedAi';
import type {
  CapturedVoiceFile,
  EphemeralMediaFile,
  EphemeralMediaService,
  ServiceResult,
  VoiceCaptureService,
} from '../interfaces';

export interface ExpoAudioRecorderPort {
  readonly uri: string | null;
  readonly currentTime: number;
  readonly isRecording: boolean;
  prepareToRecordAsync(): Promise<void>;
  record(options?: { readonly forDuration?: number }): void;
  stop(): Promise<void>;
  release(): void;
}

interface EphemeralFilePort {
  readonly uri: string;
  readonly exists: boolean;
  readonly size: number | null;
  bytes(): Promise<Uint8Array>;
  delete(): void;
}

export interface ExpoVoiceCaptureServiceOptions {
  readonly requestRecordingPermissionsAsync?: () => Promise<{ readonly granted: boolean }>;
  readonly setAudioModeAsync?: (mode: Partial<AudioMode>) => Promise<void>;
  readonly createRecorder?: () => ExpoAudioRecorderPort | Promise<ExpoAudioRecorderPort>;
  readonly deleteRecording?: (uri: string) => Promise<ServiceResult<true>>;
  readonly now?: () => Date;
}

export interface ExpoEphemeralMediaServiceOptions {
  readonly cachePrefix?: string;
  readonly createFile?: (uri: string) => EphemeralFilePort;
  readonly listCacheFiles?: () =>
    readonly EphemeralFilePort[] | Promise<readonly EphemeralFilePort[]>;
}

function failure<T>(
  code: 'INVALID_INPUT' | 'INVALID_TRANSITION' | 'PRIVACY_REJECTED' | 'REMOTE_UNAVAILABLE',
  message: string,
): ServiceResult<T> {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable: true },
  };
}

function success<T>(data: T): ServiceResult<T> {
  return { ok: true, data, meta: { origin: 'live', fallbackUsed: false } };
}

const FOREGROUND_RECORDING_MODE: Partial<AudioMode> = Object.freeze({
  allowsRecording: true,
  allowsBackgroundRecording: false,
  shouldPlayInBackground: false,
  playsInSilentMode: true,
  interruptionMode: 'doNotMix',
  shouldRouteThroughEarpiece: false,
});

const IDLE_AUDIO_MODE: Partial<AudioMode> = Object.freeze({
  allowsRecording: false,
  allowsBackgroundRecording: false,
  shouldPlayInBackground: false,
});

export class ExpoVoiceCaptureService implements VoiceCaptureService {
  private readonly requestNativePermission: () => Promise<{ readonly granted: boolean }>;
  private readonly configureAudio: (mode: Partial<AudioMode>) => Promise<void>;
  private readonly createRecorder: () => Promise<ExpoAudioRecorderPort>;
  private readonly deleteRecording: (uri: string) => Promise<ServiceResult<true>>;
  private readonly now: () => Date;
  private recorder: ExpoAudioRecorderPort | null = null;
  private permissionGranted = false;
  private lifecycleRevision = 0;
  private pendingLifecycle: Promise<unknown> | null = null;

  constructor(options: ExpoVoiceCaptureServiceOptions = {}) {
    this.requestNativePermission =
      options.requestRecordingPermissionsAsync ??
      (async () => (await import('expo-audio')).requestRecordingPermissionsAsync());
    this.configureAudio =
      options.setAudioModeAsync ??
      (async (mode) => (await import('expo-audio')).setAudioModeAsync(mode));
    this.createRecorder = options.createRecorder
      ? async () => options.createRecorder!()
      : async () => {
          const { AudioModule, RecordingPresets } = await import('expo-audio');
          return new AudioModule.AudioRecorder({
            ...RecordingPresets.HIGH_QUALITY,
            numberOfChannels: 1,
            bitRate: 64_000,
            android: {
              ...RecordingPresets.HIGH_QUALITY.android,
              maxFileSize: MAX_VOICE_BYTES,
            },
          });
        };
    this.now = options.now ?? (() => new Date());
    this.deleteRecording =
      options.deleteRecording ?? ((uri) => new ExpoEphemeralMediaService().delete(uri));
  }

  async requestPermission(): Promise<ServiceResult<'granted' | 'denied'>> {
    try {
      const permission = await this.requestNativePermission();
      this.permissionGranted = permission.granted;
      return success(permission.granted ? 'granted' : 'denied');
    } catch {
      this.permissionGranted = false;
      return failure('REMOTE_UNAVAILABLE', 'Microphone permission is unavailable');
    }
  }

  private async runLifecycle<T>(
    operation: () => Promise<ServiceResult<T>>,
  ): Promise<ServiceResult<T>> {
    const previous = this.pendingLifecycle;
    const pending = (async () => {
      await previous?.catch(() => undefined);
      return operation();
    })();
    this.pendingLifecycle = pending;
    try {
      return await pending;
    } finally {
      if (this.pendingLifecycle === pending) this.pendingLifecycle = null;
    }
  }

  private async discardFailedRecording<T>(
    uri: string | null,
    result: ServiceResult<T>,
  ): Promise<ServiceResult<T>> {
    if (!uri) return result;
    try {
      const deleted = await this.deleteRecording(uri);
      return deleted.ok ? result : deleted;
    } catch {
      return failure('REMOTE_UNAVAILABLE', 'Failed voice recording could not be deleted');
    }
  }

  async startHeld(): Promise<ServiceResult<{ readonly startedAt: string }>> {
    if (!this.permissionGranted) {
      return failure('PRIVACY_REJECTED', 'Microphone permission is required before capture');
    }
    if (this.recorder || this.pendingLifecycle) {
      return failure('INVALID_TRANSITION', 'Voice capture or cleanup is already active');
    }
    const revision = this.lifecycleRevision;
    const stale = () => revision !== this.lifecycleRevision;
    const cancelled = () =>
      failure<{ readonly startedAt: string }>(
        'INVALID_TRANSITION',
        'Foreground voice capture start was cancelled',
      );
    return this.runLifecycle(async () => {
      if (stale()) return cancelled();
      try {
        const recorder = await this.createRecorder();
        this.recorder = recorder;
        if (stale()) return cancelled();
        await this.configureAudio(FOREGROUND_RECORDING_MODE);
        if (stale()) return cancelled();
        await recorder.prepareToRecordAsync();
        if (stale()) return cancelled();
        recorder.record({ forDuration: 15 });
        return success({ startedAt: this.now().toISOString() });
      } catch {
        if (stale()) return cancelled();
        const uri = this.recorder?.uri ?? null;
        this.recorder?.release();
        this.recorder = null;
        await this.configureAudio(IDLE_AUDIO_MODE).catch(() => undefined);
        return this.discardFailedRecording(
          uri,
          failure('REMOTE_UNAVAILABLE', 'Foreground voice capture could not start'),
        );
      }
    });
  }

  async stopHeld(): Promise<ServiceResult<CapturedVoiceFile>> {
    const recorder = this.recorder;
    if (!recorder || this.pendingLifecycle) {
      return failure('INVALID_TRANSITION', 'No available held recording is active');
    }
    return this.runLifecycle(async () => {
      let uri = recorder.uri;
      let result: ServiceResult<CapturedVoiceFile>;
      try {
        await recorder.stop();
        uri = recorder.uri ?? uri;
        const durationMs = Math.round(recorder.currentTime * 1_000);
        if (!uri || durationMs <= 0 || durationMs > 15_000) {
          result = failure('INVALID_INPUT', 'Captured voice duration or URI is outside policy');
        } else {
          result = success({ uri, durationMs, mediaType: 'audio/m4a' });
        }
      } catch {
        result = failure('REMOTE_UNAVAILABLE', 'Foreground voice capture could not stop');
      } finally {
        uri = recorder.uri ?? uri;
        recorder.release();
        this.recorder = null;
        await this.configureAudio(IDLE_AUDIO_MODE).catch(() => undefined);
      }
      return result.ok ? result : this.discardFailedRecording(uri, result);
    });
  }

  async cancel(): Promise<ServiceResult<{ readonly uri: string | null }>> {
    this.lifecycleRevision += 1;
    const stoppingUri = this.recorder?.uri ?? null;
    return this.runLifecycle(async () => {
      const recorder = this.recorder;
      if (!recorder) return success({ uri: stoppingUri });
      let uri = recorder.uri;
      let result: ServiceResult<{ readonly uri: string | null }>;
      try {
        if (recorder.isRecording) await recorder.stop();
        result = success({ uri: recorder.uri ?? uri });
      } catch {
        result = failure('REMOTE_UNAVAILABLE', 'Foreground voice capture cancellation failed');
      } finally {
        uri = recorder.uri ?? uri;
        recorder.release();
        this.recorder = null;
        await this.configureAudio(IDLE_AUDIO_MODE).catch(() => undefined);
      }
      return result.ok ? result : this.discardFailedRecording(uri, result);
    });
  }
}

export class ExpoEphemeralMediaService implements EphemeralMediaService {
  private readonly cachePrefix: string | null;
  private readonly createFile: ((uri: string) => EphemeralFilePort) | null;
  private readonly listCacheFiles:
    (() => readonly EphemeralFilePort[] | Promise<readonly EphemeralFilePort[]>) | null;

  constructor(options: ExpoEphemeralMediaServiceOptions = {}) {
    this.cachePrefix = options.cachePrefix ?? null;
    this.createFile = options.createFile ?? null;
    this.listCacheFiles = options.listCacheFiles ?? null;
  }

  private async resolve(uri: string): Promise<ServiceResult<EphemeralFilePort>> {
    try {
      const fileSystem =
        this.cachePrefix && this.createFile ? null : await import('expo-file-system');
      const cachePrefix = this.cachePrefix ?? fileSystem?.Paths.cache.uri;
      const createFile = this.createFile ?? ((value: string) => new fileSystem!.File(value));
      if (!cachePrefix) {
        return failure('REMOTE_UNAVAILABLE', 'Ephemeral cache storage is unavailable');
      }
      const candidate = new URL(uri);
      const cache = new URL(cachePrefix);
      const cachePath = cache.pathname.endsWith('/') ? cache.pathname : `${cache.pathname}/`;
      if (
        candidate.protocol !== 'file:' ||
        cache.protocol !== 'file:' ||
        candidate.origin !== cache.origin ||
        !candidate.pathname.startsWith(cachePath) ||
        /(?:^|\/)(?:\.\.?)(?:\/|$)|%2e/iu.test(uri)
      ) {
        return failure('PRIVACY_REJECTED', 'Ephemeral media is outside the cache boundary');
      }
      return success(createFile(candidate.toString()));
    } catch {
      return failure('INVALID_INPUT', 'Ephemeral media URI is invalid');
    }
  }

  async inspect(uri: string): Promise<ServiceResult<EphemeralMediaFile>> {
    const resolved = await this.resolve(uri);
    if (!resolved.ok) return resolved;
    const file = resolved.data;
    if (!file.exists || !file.size || file.size <= 0) {
      return failure('INVALID_INPUT', 'Ephemeral media file is empty or unavailable');
    }
    return success({ uri: file.uri, byteCount: file.size });
  }

  async read(uri: string): Promise<ServiceResult<Uint8Array>> {
    const resolved = await this.resolve(uri);
    if (!resolved.ok) return resolved;
    if (!resolved.data.exists)
      return failure('INVALID_INPUT', 'Ephemeral media file is unavailable');
    try {
      return success(await resolved.data.bytes());
    } catch {
      return failure('REMOTE_UNAVAILABLE', 'Ephemeral media could not be read');
    }
  }

  async delete(uri: string): Promise<ServiceResult<true>> {
    const resolved = await this.resolve(uri);
    if (!resolved.ok) return resolved;
    try {
      if (resolved.data.exists) resolved.data.delete();
      return resolved.data.exists
        ? failure('REMOTE_UNAVAILABLE', 'Ephemeral media deletion could not be verified')
        : success(true as const);
    } catch {
      return failure('REMOTE_UNAVAILABLE', 'Ephemeral media deletion failed');
    }
  }

  async purgeOrphanedRecordings(): Promise<ServiceResult<number>> {
    try {
      const files = this.listCacheFiles
        ? await this.listCacheFiles()
        : await (async () => {
            const fileSystem = await import('expo-file-system');
            return new fileSystem.Directory(fileSystem.Paths.cache)
              .list()
              .filter(
                (entry): entry is InstanceType<typeof fileSystem.File> =>
                  entry instanceof fileSystem.File,
              );
          })();
      let deletedCount = 0;
      for (const file of files) {
        const name = new URL(file.uri).pathname.split('/').pop() ?? '';
        if (!/^recording-[0-9a-f-]{36}\.m4a$/iu.test(name)) continue;
        const deleted = await this.delete(file.uri);
        if (!deleted.ok) return deleted;
        deletedCount += 1;
      }
      return success(deletedCount);
    } catch {
      return failure('REMOTE_UNAVAILABLE', 'Orphaned voice cleanup could not be verified');
    }
  }
}
