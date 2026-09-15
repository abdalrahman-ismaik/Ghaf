import { randomUUID } from 'expo-crypto';

import type { CloudFamilyActor } from '@/models/cloudFamily';
import {
  CloudMasroofiError,
  type CloudMasroofiCommand,
  type CloudMasroofiErrorCode,
  type CloudMasroofiSnapshot,
  type CloudMasroofiTransport,
} from '@/models/cloudMasroofi';
import { createCloudMasroofiService } from '@/services/cloud-masroofi';

import { parseCloudMasroofiCommand } from './validation';

export interface CloudMasroofiState {
  readonly snapshot: CloudMasroofiSnapshot | null;
  readonly loading: boolean;
  readonly busy: boolean;
  readonly error: CloudMasroofiErrorCode | null;
  readonly pendingRequestId: string | null;
  readonly retryNeedsPassword: boolean;
  readonly conflict: boolean;
  readonly saved: boolean;
  readonly subscriptionError: boolean;
}

export function masroofiCommandNeedsPassword(command: CloudMasroofiCommand): boolean {
  return command.type !== 'purchase';
}

function errorCode(error: unknown): CloudMasroofiErrorCode {
  if (error instanceof CloudMasroofiError) return error.code;
  const aliases: Readonly<Record<string, CloudMasroofiErrorCode>> = {
    '42501': 'access_unavailable',
    PT409: 'request_conflict',
    PT400: 'invalid_command',
    PT428: 'reauth_required',
    PGRST202: 'schema_unavailable',
    profile_conflict: 'request_conflict',
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
    'schema_unavailable',
    'invalid_response',
    'age_ineligible',
    'task_ineligible',
    'promise_locked',
    'balance_limit',
  ];
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    for (const value of [record.code, record.message]) {
      if (typeof value !== 'string') continue;
      if (codes.includes(value)) return value as CloudMasroofiErrorCode;
      if (Object.hasOwn(aliases, value)) return aliases[value] ?? 'provider_unavailable';
    }
  }
  return error instanceof TypeError ? 'network_unavailable' : 'provider_unavailable';
}

export function createCloudMasroofiController(options: {
  readonly transport: CloudMasroofiTransport;
  readonly userId: string;
  readonly familyId: string;
  readonly actor: CloudFamilyActor;
  readonly makeRequestId?: () => string;
}) {
  const service = createCloudMasroofiService(options);
  const initial: CloudMasroofiState = {
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
  let pending: { id: string; command: CloudMasroofiCommand; sent: boolean } | null = null;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<CloudMasroofiState>) => {
    if (disposed) return;
    state = Object.freeze({ ...state, ...patch });
    listeners.forEach((listener) => listener());
  };
  const current = (attempt: number) => !disposed && active && generation === attempt;
  const pendingState = () => ({
    pendingRequestId: pending?.id ?? null,
    retryNeedsPassword: pending !== null && masroofiCommandNeedsPassword(pending.command),
  });
  const clearSubscription = () => {
    ++subscriptionGeneration;
    subscribing = false;
    try {
      stop?.();
    } catch {
      // Generation checks reject callbacks even when transport cleanup fails.
    }
    stop = null;
  };
  const subscribeRemote = () => {
    if (disposed || !active || stop || subscribing) return;
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
        if (disposed || !active || attempt !== subscriptionGeneration) {
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
  const accept = (snapshot: CloudMasroofiSnapshot) => {
    if (state.snapshot && snapshot.revision < state.snapshot.revision) {
      throw new CloudMasroofiError('invalid_response');
    }
    publish({ snapshot, error: null, conflict: false });
    subscribeRemote();
  };
  const deny = (code: CloudMasroofiErrorCode) => {
    if (
      ![
        'access_unavailable',
        'family_unavailable',
        'invalid_response',
        'schema_unavailable',
      ].includes(code)
    )
      return;
    clearSubscription();
    if (code !== 'invalid_response') pending = null;
    publish({ snapshot: null, saved: false, ...pendingState() });
  };
  const drain = () => {
    if (!disposed && active && refreshPending && !state.busy) {
      refreshPending = false;
      void load();
    }
  };
  const load = async (): Promise<boolean> => {
    if (disposed || !active) return false;
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
    if (disposed || !active || state.busy || !pending || !state.snapshot) return false;
    const request = pending;
    const protectedAction = masroofiCommandNeedsPassword(request.command);
    const attempt = ++generation;
    publish({ busy: true, error: null, saved: false });
    try {
      if (protectedAction) {
        if (!password || !options.transport.reauthenticate)
          throw new CloudMasroofiError('reauth_required');
        await options.transport.reauthenticate(password);
        if (!current(attempt)) return false;
      }
      request.sent = true;
      const snapshot = await service.command(request.id, request.command);
      if (!current(attempt)) return false;
      accept(snapshot);
      pending = null;
      publish({ ...pendingState(), saved: true });
      return true;
    } catch (error) {
      if (current(attempt)) {
        const code = errorCode(error);
        const uncertain = [
          'network_unavailable',
          'provider_unavailable',
          'invalid_response',
        ].includes(code);
        // An earlier ambiguous send must retain its receipt key even if retry reauthentication fails.
        if (!request.sent || (!uncertain && code !== 'reauth_required')) pending = null;
        deny(code);
        publish({ error: code, conflict: code === 'request_conflict', ...pendingState() });
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
      if (!disposed) listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load,
    refresh: load,
    async command(input: CloudMasroofiCommand, password?: string): Promise<boolean> {
      if (disposed || !active || state.busy || state.conflict || pending || !state.snapshot)
        return false;
      try {
        const command = parseCloudMasroofiCommand(input);
        const actor = state.snapshot.actor;
        if (
          actor.role === 'child'
            ? command.type !== 'purchase' || command.childId !== actor.childId
            : command.type === 'purchase'
        ) {
          throw new CloudMasroofiError('access_unavailable');
        }
        pending = { id: (options.makeRequestId ?? randomUUID)(), command, sent: false };
        publish(pendingState());
      } catch (error) {
        publish({ error: errorCode(error), saved: false });
        return false;
      }
      return execute(password);
    },
    async retry(password?: string): Promise<boolean> {
      if (!pending || disposed || !active || state.busy) return false;
      if (!state.snapshot && !(await load())) return false;
      return execute(password);
    },
    async cancelPending(): Promise<boolean> {
      if (disposed || !active || state.busy) return false;
      pending = null;
      publish({ ...pendingState(), saved: false });
      return load();
    },
    setActive(value: boolean) {
      if (disposed || active === value) return;
      active = value;
      if (!active) {
        ++generation;
        clearSubscription();
        if (pending && !pending.sent) pending = null;
        publish({
          snapshot: null,
          busy: false,
          loading: false,
          saved: false,
          error: null,
          ...pendingState(),
        });
      } else {
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

export type CloudMasroofiController = ReturnType<typeof createCloudMasroofiController>;
