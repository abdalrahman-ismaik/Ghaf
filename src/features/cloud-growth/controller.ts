import { randomUUID } from 'expo-crypto';

import {
  CloudGrowthError,
  type CloudGrowthCommand,
  type CloudGrowthErrorCode,
  type CloudGrowthSnapshot,
  type CloudGrowthTransport,
} from '@/models/cloudGrowth';
import { createCloudGrowthService } from '@/services/cloud-growth';

import { parseCloudGrowthCommand } from './validation';

export interface CloudGrowthState {
  readonly snapshot: CloudGrowthSnapshot | null;
  readonly loading: boolean;
  readonly busy: boolean;
  readonly error: CloudGrowthErrorCode | null;
  readonly pendingRequestId: string | null;
  readonly retryNeedsPassword: boolean;
  readonly conflict: boolean;
  readonly saved: boolean;
  readonly subscriptionError: boolean;
}

export function growthCommandNeedsPassword(command: CloudGrowthCommand): boolean {
  return command.type === 'reward.create'
    ? command.promise.kind === 'money'
    : command.type !== 'league.encourage';
}

function errorCode(error: unknown): CloudGrowthErrorCode {
  if (error instanceof CloudGrowthError) return error.code;
  const aliases: Readonly<Record<string, CloudGrowthErrorCode>> = {
    '42501': 'access_unavailable',
    PT409: 'request_conflict',
    PT400: 'invalid_command',
    profile_conflict: 'request_conflict',
    invalid_profile: 'invalid_command',
    account_unavailable: 'access_unavailable',
    session_expired: 'access_unavailable',
    operation_cancelled: 'access_unavailable',
    recovery_required: 'access_unavailable',
    invalid_credentials: 'reauth_required',
  };
  const codes: readonly string[] = [
    'access_unavailable',
    'family_unavailable',
    'invalid_command',
    'invalid_transition',
    'request_conflict',
    'reauth_required',
    'network_unavailable',
    'provider_unavailable',
    'invalid_response',
  ];
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    for (const value of [record.code, record.message]) {
      if (typeof value !== 'string') continue;
      if (codes.includes(value)) return value as CloudGrowthErrorCode;
      if (aliases[value]) return aliases[value];
    }
  }
  return error instanceof TypeError ? 'network_unavailable' : 'provider_unavailable';
}

export function createCloudGrowthController(options: {
  readonly transport: CloudGrowthTransport;
  readonly userId: string;
  readonly familyId: string;
  readonly makeRequestId?: () => string;
}) {
  const service = createCloudGrowthService(options);
  const initial: CloudGrowthState = {
    snapshot: null,
    loading: true,
    busy: false,
    error: null,
    pendingRequestId: null,
    retryNeedsPassword: false,
    conflict: false,
    saved: false,
    subscriptionError: false,
  };
  let state = initial;
  let generation = 0;
  let disposed = false;
  let active = true;
  let refreshPending = false;
  let stop: (() => void) | null = null;
  let subscriptionGeneration = 0;
  let subscribing = false;
  let pending: { id: string; command: CloudGrowthCommand } | null = null;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<CloudGrowthState>) => {
    if (disposed) return;
    state = Object.freeze({ ...state, ...patch });
    listeners.forEach((listener) => listener());
  };
  const current = (attempt: number) => !disposed && generation === attempt;
  const clearSubscription = () => {
    ++subscriptionGeneration;
    subscribing = false;
    try {
      stop?.();
    } catch {
      // Callbacks are also generation-guarded when transport cleanup fails.
    }
    stop = null;
  };
  const subscribeRemote = () => {
    if (disposed || stop || subscribing) return;
    subscribing = true;
    const attempt = subscriptionGeneration;
    void Promise.resolve()
      .then(() =>
        options.transport.subscribeFamily(options.familyId, () => {
          if (disposed || attempt !== subscriptionGeneration) return;
          if (!active || state.busy) refreshPending = true;
          else void load();
        }),
      )
      .then((cleanup) => {
        if (disposed || attempt !== subscriptionGeneration) {
          cleanup();
          return;
        }
        stop = cleanup;
        publish({ subscriptionError: false });
      })
      .catch(() => {
        if (!disposed && attempt === subscriptionGeneration) publish({ subscriptionError: true });
      })
      .finally(() => {
        if (attempt === subscriptionGeneration) subscribing = false;
      });
  };
  const accept = (snapshot: CloudGrowthSnapshot) => {
    publish({ snapshot, error: null, conflict: false });
    subscribeRemote();
  };
  const deny = (code: CloudGrowthErrorCode) => {
    if (!['access_unavailable', 'family_unavailable', 'invalid_response'].includes(code)) return;
    clearSubscription();
    publish({ snapshot: null });
    if (code !== 'invalid_response') {
      pending = null;
      publish({ pendingRequestId: null, retryNeedsPassword: false });
    }
  };
  const drain = () => {
    if (!disposed && active && refreshPending && !state.busy) {
      refreshPending = false;
      void load();
    }
  };
  const load = async (): Promise<boolean> => {
    if (disposed) return false;
    if (state.busy) {
      refreshPending = true;
      return false;
    }
    const attempt = ++generation;
    publish({ busy: true, loading: state.snapshot === null, error: null, saved: false });
    try {
      const snapshot = await service.load();
      if (!current(attempt)) return false;
      accept(snapshot);
      return true;
    } catch (error) {
      if (current(attempt)) {
        const code = errorCode(error);
        deny(code);
        publish({ error: code });
      }
      return false;
    } finally {
      if (current(attempt)) {
        publish({ busy: false, loading: false });
        drain();
      }
    }
  };
  const execute = async (password?: string): Promise<boolean> => {
    if (disposed || state.busy || !pending) return false;
    const request = pending;
    const protectedAction = growthCommandNeedsPassword(request.command);
    const attempt = ++generation;
    let mutationStarted = false;
    publish({ busy: true, error: null, saved: false });
    try {
      if (protectedAction) {
        if (!password || !options.transport.reauthenticate)
          throw new CloudGrowthError('reauth_required');
        await options.transport.reauthenticate(password);
        if (!current(attempt)) return false;
      }
      mutationStarted = true;
      const snapshot = await service.command(request.id, request.command);
      if (!current(attempt)) return false;
      pending = null;
      accept(snapshot);
      publish({ pendingRequestId: null, retryNeedsPassword: false, saved: true });
      return true;
    } catch (error) {
      if (current(attempt)) {
        const code = errorCode(error);
        const uncertain = [
          'network_unavailable',
          'provider_unavailable',
          'invalid_response',
        ].includes(code);
        if (!uncertain || !mutationStarted) pending = null;
        deny(code);
        publish({
          error: code,
          conflict: code === 'request_conflict',
          pendingRequestId: pending?.id ?? null,
          retryNeedsPassword: pending !== null && protectedAction,
        });
      }
      return false;
    } finally {
      if (current(attempt)) {
        publish({ busy: false, loading: false });
        drain();
      }
    }
  };
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load,
    refresh: load,
    async command(input: CloudGrowthCommand, password?: string): Promise<boolean> {
      if (disposed || state.busy || state.conflict || pending || !state.snapshot) return false;
      try {
        const command = parseCloudGrowthCommand(input);
        const actor = state.snapshot.actor;
        if (actor.role === 'child' && command.type !== 'league.encourage') {
          throw new CloudGrowthError('access_unavailable');
        }
        if (actor.role === 'parent' && command.type === 'league.encourage') {
          throw new CloudGrowthError('access_unavailable');
        }
        pending = { id: (options.makeRequestId ?? randomUUID)(), command };
        publish({
          pendingRequestId: pending.id,
          retryNeedsPassword: growthCommandNeedsPassword(command),
        });
      } catch (error) {
        publish({ error: errorCode(error), saved: false });
        return false;
      }
      return execute(password);
    },
    retry: execute,
    setActive(value: boolean) {
      if (disposed) return;
      const changed = active !== value;
      active = value;
      if (changed && active) {
        refreshPending = true;
        drain();
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      ++generation;
      pending = null;
      clearSubscription();
      state = { ...initial, loading: false };
      listeners.clear();
    },
  };
}

export type CloudGrowthController = ReturnType<typeof createCloudGrowthController>;
