import {
  CloudFamilyError,
  type CloudCommand,
  type CloudCommandResult,
  type CloudFamilyErrorCode,
  type CloudSnapshot,
} from '@/models/cloudFamily';
import {
  cloudError,
  parseCloudCommandResult,
  parseCloudSnapshot,
  type CloudExpectedActor,
} from './validation';

export interface CloudFamilyService {
  read(): Promise<unknown>;
  command(requestId: string, expectedRevision: number, command: CloudCommand): Promise<unknown>;
}

export interface CloudFamilyState {
  readonly snapshot: CloudSnapshot | null;
  readonly accessible: boolean;
  readonly busy: boolean;
  readonly error: CloudFamilyErrorCode | null;
  readonly saved: boolean;
  readonly uncertain: boolean;
}

interface PendingCommand {
  id: string;
  revision: number;
  command: CloudCommand;
  fingerprint: string;
}

function fingerprint(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(fingerprint).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${fingerprint(item)}`)
      .join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}

export function createCloudFamilyController(
  service: CloudFamilyService,
  expected: CloudExpectedActor,
  requestId: () => string,
) {
  let state: CloudFamilyState = {
    snapshot: null,
    accessible: false,
    busy: false,
    error: null,
    saved: false,
    uncertain: false,
  };
  let generation = 0;
  let disposed = false;
  let pending: PendingCommand | null = null;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<CloudFamilyState>) => {
    if (disposed) return;
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  const alive = (attempt: number) => !disposed && attempt === generation;
  const denied = (error: CloudFamilyErrorCode) =>
    error === 'access_denied' || error === 'access_revoked';
  const validateProgress = (snapshot: CloudSnapshot) => {
    if (state.snapshot && snapshot.revision < state.snapshot.revision)
      throw new CloudFamilyError('service_unavailable');
    if (state.snapshot && snapshot.family.id !== state.snapshot.family.id)
      throw new CloudFamilyError('access_denied');
    return snapshot;
  };
  const load = async () => {
    if (disposed || state.busy) return false;
    const attempt = generation;
    publish({ busy: true, error: null, saved: false });
    try {
      const raw = await service.read();
      if (!alive(attempt)) return false;
      const snapshot = validateProgress(parseCloudSnapshot(raw, expected));
      publish({ snapshot, accessible: true, busy: false });
      return true;
    } catch (error) {
      if (!alive(attempt)) return false;
      const failure = cloudError(error);
      if (denied(failure.code)) pending = null;
      publish({
        snapshot: denied(failure.code) ? null : state.snapshot,
        accessible: false,
        busy: false,
        error: failure.code,
        uncertain: pending !== null,
      });
      return false;
    }
  };
  const command = async (input: CloudCommand): Promise<CloudCommandResult | null> => {
    if (disposed || state.busy || !state.snapshot) return null;
    let normalized: CloudCommand;
    let signature: string;
    try {
      normalized = structuredCommand(input);
      signature = fingerprint(normalized);
    } catch {
      publish({ error: 'invalid_input', saved: false });
      return null;
    }
    if (pending && pending.fingerprint !== signature) {
      publish({ error: 'network_unavailable', uncertain: true });
      return null;
    }
    if (!pending && (!state.accessible || state.error === 'revision_conflict')) return null;
    const attempt = generation;
    let operation: PendingCommand;
    try {
      operation = pending ?? {
        id: requestId(),
        revision: state.snapshot.revision,
        command: normalized,
        fingerprint: signature,
      };
    } catch {
      publish({ error: 'service_unavailable', saved: false });
      return null;
    }
    pending = operation;
    publish({ busy: true, error: null, saved: false });
    try {
      const raw = await service.command(operation.id, operation.revision, operation.command);
      if (!alive(attempt)) return null;
      const result = parseCloudCommandResult(raw, expected);
      validateProgress(result.snapshot);
      pending = null;
      publish({
        snapshot: result.snapshot,
        accessible: true,
        busy: false,
        error: null,
        saved: true,
        uncertain: false,
      });
      return result;
    } catch (error) {
      if (!alive(attempt)) return null;
      const failure = cloudError(error);
      const uncertain =
        failure.code === 'network_unavailable' || failure.code === 'service_unavailable';
      if (!uncertain) pending = null;
      publish({
        snapshot: denied(failure.code) ? null : state.snapshot,
        accessible: denied(failure.code) || uncertain ? false : state.accessible,
        busy: false,
        error: failure.code,
        uncertain,
      });
      return null;
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
    command,
    retry: () => (pending ? command(pending.command) : load().then(() => null)),
    invalidate() {
      generation += 1;
      pending = null;
      publish({
        snapshot: null,
        accessible: false,
        busy: false,
        error: 'access_revoked',
        saved: false,
        uncertain: false,
      });
    },
    dispose() {
      generation += 1;
      pending = null;
      state = {
        snapshot: null,
        accessible: false,
        busy: false,
        error: null,
        saved: false,
        uncertain: false,
      };
      disposed = true;
      listeners.clear();
    },
  };
}

function structuredCommand(command: CloudCommand): CloudCommand {
  return JSON.parse(JSON.stringify(command)) as CloudCommand;
}

export type CloudFamilyController = ReturnType<typeof createCloudFamilyController>;
