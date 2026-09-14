import { describe, expect, it, vi } from 'vitest';

import { createPilotController } from '../../src/features/pilot/controller';
import {
  ParentAccountError,
  type ParentAccountEvent,
  type ParentAccountService,
  type RealAccountSession,
} from '../../src/models/parentAccount';

const child: RealAccountSession = {
  userId: '02000000-0000-4000-8000-000000000001',
  email: '',
  role: 'child',
  familyId: '02000000-0000-4000-8000-000000000002',
  childId: '02000000-0000-4000-8000-000000000003',
};
const parent: RealAccountSession = {
  userId: '02000000-0000-4000-8000-000000000004',
  email: 'synthetic-parent@example.invalid',
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

function harness(restored: RealAccountSession | null = null) {
  let listener: (event: ParentAccountEvent) => void = () => undefined;
  const service = {
    signUp: vi.fn(async () => undefined),
    signIn: vi.fn(async () => parent),
    verifyEmail: vi.fn(async () => parent),
    pairChildDevice: vi.fn(async () => child),
    restoreSession: vi.fn(async (): Promise<RealAccountSession | null> => restored),
    getAccess: vi.fn(async () => 'approved' as const),
    loadProfile: vi.fn(async () => ({
      userId: parent.userId,
      displayName: '',
      preferredLocale: 'ar' as const,
      revision: 0,
      updatedAt: '2026-09-14T00:00:00Z',
    })),
    saveProfile: vi.fn(async () => {
      throw new ParentAccountError('access_unavailable');
    }),
    loadWorkspace: vi.fn(async () => {
      throw new ParentAccountError('access_unavailable');
    }),
    updateWorkspace: vi.fn(async () => {
      throw new ParentAccountError('access_unavailable');
    }),
    resendVerification: vi.fn(async () => undefined),
    requestPasswordReset: vi.fn(async () => undefined),
    verifyRecovery: vi.fn(async () => undefined),
    updatePassword: vi.fn(async () => undefined),
    signOut: vi.fn(async () => undefined),
    onSessionChange: vi.fn((callback: typeof listener) => {
      listener = callback;
      return vi.fn();
    }),
    setAppActive: vi.fn(),
    dispose: vi.fn(),
  } satisfies ParentAccountService;
  const sample = {
    start: vi.fn(async () => undefined),
    clear: vi.fn(),
    clearPrivate: vi.fn(async () => undefined),
  };
  const controller = createPilotController(service, sample);
  return { service, sample, controller, emit: (event: ParentAccountEvent) => listener(event) };
}

describe('paired Child controller boundary', () => {
  it('accepts a server-validated Child without loading an adult profile or sample', async () => {
    const h = harness();
    await h.controller.initialize();
    expect(h.controller.pairChildAvailable).toBe(true);
    await h.controller.pairChildDevice('synthetic-token', 'synthetic-request');
    expect(h.service.pairChildDevice).toHaveBeenCalledWith('synthetic-token', 'synthetic-request');
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'ready',
      account: child,
      profile: null,
      profileDraft: null,
      sampleOpen: false,
    });
    expect(h.service.getAccess).toHaveBeenCalledWith(child.userId);
    expect(h.service.loadProfile).not.toHaveBeenCalled();
    await h.controller.explore();
    await h.controller.reloadProfile();
    h.controller.restartSample();
    h.controller.continueSample();
    expect(h.sample.start).not.toHaveBeenCalled();
    expect(h.service.loadProfile).not.toHaveBeenCalled();
  });

  it('restores a paired Child through access verification and closes on revocation', async () => {
    const h = harness(child);
    await h.controller.initialize();
    expect(h.controller.getSnapshot()).toMatchObject({ phase: 'ready', account: child });
    h.service.getAccess.mockRejectedValueOnce(new ParentAccountError('access_unavailable'));
    await h.controller.refresh();
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'error',
      account: null,
      error: 'access_unavailable',
      sampleOpen: false,
    });
    expect(h.service.loadProfile).not.toHaveBeenCalled();
    expect(h.sample.clearPrivate).toHaveBeenCalled();
  });

  it('rejects an adapter that returns Parent identity from Child pairing', async () => {
    const h = harness();
    await h.controller.initialize();
    h.service.pairChildDevice.mockResolvedValueOnce(parent);
    await h.controller.pairChildDevice('synthetic-token', 'synthetic-request');
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'signin',
      account: null,
      error: 'access_unavailable',
    });
    expect(h.service.loadProfile).not.toHaveBeenCalled();
  });

  it('does not pair over a signed-in Parent or during restoration', async () => {
    const h = harness(parent);
    await h.controller.pairChildDevice('synthetic-token', 'synthetic-request');
    expect(h.service.pairChildDevice).not.toHaveBeenCalled();
    await h.controller.initialize();
    await h.controller.pairChildDevice('synthetic-token', 'synthetic-request');
    expect(h.service.pairChildDevice).not.toHaveBeenCalled();
    expect(h.controller.getSnapshot()).toMatchObject({ account: parent, phase: 'ready' });
  });

  it('drops delayed pairing after signout and suppresses duplicate taps', async () => {
    const h = harness();
    await h.controller.initialize();
    const pending = deferred<RealAccountSession>();
    h.service.pairChildDevice.mockReturnValueOnce(pending.promise);
    const first = h.controller.pairChildDevice('synthetic-token', 'synthetic-request');
    await h.controller.pairChildDevice('synthetic-token', 'synthetic-request');
    expect(h.service.pairChildDevice).toHaveBeenCalledOnce();
    await h.controller.signOut();
    pending.resolve(child);
    await first;
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'signin',
      account: null,
      busy: false,
    });
    expect(h.service.getAccess).not.toHaveBeenCalled();
  });

  it('keeps pairing failure visible and permits the exact retry without a demo fallback', async () => {
    const h = harness();
    await h.controller.initialize();
    h.service.pairChildDevice.mockRejectedValueOnce(new ParentAccountError('network_unavailable'));
    await h.controller.pairChildDevice('synthetic-token', 'same-request');
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'signin',
      account: null,
      error: 'network_unavailable',
    });
    await h.controller.pairChildDevice('synthetic-token', 'same-request');
    expect(h.controller.getSnapshot()).toMatchObject({ phase: 'ready', account: child });
    expect(h.service.pairChildDevice).toHaveBeenNthCalledWith(2, 'synthetic-token', 'same-request');
    expect(h.sample.start).not.toHaveBeenCalled();
  });

  it('clears an old Parent profile before accepting a changed Child session', async () => {
    const h = harness(parent);
    await h.controller.initialize();
    const waiting = deferred<RealAccountSession | null>();
    h.service.restoreSession.mockReturnValueOnce(waiting.promise);
    h.emit('changed');
    expect(h.controller.getSnapshot()).toMatchObject({ phase: 'restoring', profile: null });
    waiting.resolve(child);
    await vi.waitFor(() =>
      expect(h.controller.getSnapshot()).toMatchObject({
        phase: 'ready',
        account: child,
        profile: null,
        profileDraft: null,
      }),
    );
    expect(h.service.loadProfile).toHaveBeenCalledOnce();
  });
});
