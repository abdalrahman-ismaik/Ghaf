import { describe, expect, it, vi } from 'vitest';

import { createPilotController } from '../../src/features/pilot/controller';
import {
  ParentAccountError,
  type AccountProfile,
  type ParentAccountEvent,
  type ParentAccountService,
} from '../../src/models/parentAccount';

const adultA = { userId: 'adult-a', email: 'adult-a@example.test' };
const adultB = { userId: 'adult-b', email: 'adult-b@example.test' };
const profileA: AccountProfile = {
  userId: adultA.userId,
  displayName: 'Prepared adult A',
  preferredLocale: 'ar',
  revision: 1,
  updatedAt: '2026-09-14T00:00:00.000Z',
};
const profileB: AccountProfile = { ...profileA, userId: adultB.userId, displayName: 'Prepared B' };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((finish, fail) => {
    resolve = finish;
    reject = fail;
  });
  return { promise, resolve, reject };
}

function harness(privateCleanup?: () => Promise<void>) {
  let notify: (event: ParentAccountEvent) => void = () => undefined;
  const service: ParentAccountService = {
    signUp: vi.fn(async () => undefined),
    signIn: vi.fn(async () => adultA),
    verifyEmail: vi.fn(async () => adultA),
    restoreSession: vi.fn(async () => adultA),
    getAccess: vi.fn(async () => 'approved' as const),
    loadWorkspace: vi.fn(async () => {
      throw new ParentAccountError('profile_unavailable');
    }),
    updateWorkspace: vi.fn(async () => {
      throw new ParentAccountError('profile_unavailable');
    }),
    loadProfile: vi.fn(async () => profileA),
    saveProfile: vi.fn(async (update) => ({
      ...profileA,
      displayName: update.displayName.trim(),
      preferredLocale: update.preferredLocale,
      revision: update.expectedRevision + 1,
    })),
    resendVerification: vi.fn(async () => undefined),
    requestPasswordReset: vi.fn(async () => undefined),
    verifyRecovery: vi.fn(async () => undefined),
    updatePassword: vi.fn(async () => undefined),
    signOut: vi.fn(async () => undefined),
    onSessionChange: vi.fn((listener) => {
      notify = listener;
      return vi.fn();
    }),
    setAppActive: vi.fn(),
    dispose: vi.fn(),
  };
  const sample = {
    start: vi.fn(async () => undefined),
    clear: vi.fn(),
    ...(privateCleanup ? { clearPrivate: privateCleanup } : {}),
  };
  const controller = createPilotController(service, sample);
  return { service, controller, notify: (event: ParentAccountEvent) => notify(event) };
}

describe('account-owned profile lifecycle', () => {
  it('keeps the authenticated workspace mounted while a known account refreshes', async () => {
    const h = harness();
    await h.controller.initialize();
    h.controller.editProfile({ displayName: 'Unsaved draft' });
    const waiting = deferred<typeof adultA>();
    vi.mocked(h.service.restoreSession).mockReturnValueOnce(waiting.promise);
    const phases: string[] = [];
    const unsubscribe = h.controller.subscribe(() => phases.push(h.controller.getSnapshot().phase));
    h.notify('refreshed');
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'ready',
      busy: true,
      account: adultA,
    });
    waiting.resolve(adultA);
    await vi.waitFor(() => expect(h.controller.getSnapshot().busy).toBe(false));
    expect(phases.every((phase) => phase === 'ready')).toBe(true);
    expect(h.controller.getSnapshot().profileDraft?.displayName).toBe('Unsaved draft');
    unsubscribe();
  });

  it('defers known-account refresh during a save without cancelling the acknowledged result', async () => {
    const h = harness();
    await h.controller.initialize();
    h.controller.editProfile({ displayName: 'Saved draft' });
    const waiting = deferred<AccountProfile>();
    const saved = { ...profileA, displayName: 'Saved draft', revision: 2 };
    vi.mocked(h.service.saveProfile).mockReturnValueOnce(waiting.promise);
    vi.mocked(h.service.loadProfile).mockResolvedValue(saved);
    const save = h.controller.saveProfile();
    h.notify('refreshed');
    expect(h.controller.getSnapshot().phase).toBe('ready');
    waiting.resolve(saved);
    await save;
    await vi.waitFor(() => expect(h.controller.getSnapshot().busy).toBe(false));
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'ready',
      profile: saved,
      profileDirty: false,
    });
    expect(h.service.saveProfile).toHaveBeenCalledOnce();
  });

  it('loads the approved account profile without synthesizing missing server data', async () => {
    const h = harness();
    vi.mocked(h.service.loadProfile).mockRejectedValue(
      new ParentAccountError('profile_unavailable'),
    );
    await h.controller.initialize();
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'ready',
      account: adultA,
      profile: null,
      profileDraft: null,
      profileError: 'profile_unavailable',
    });
    vi.mocked(h.service.loadProfile).mockResolvedValue(profileA);
    await h.controller.reloadProfile();
    expect(h.controller.getSnapshot()).toMatchObject({ profile: profileA, profileError: null });
    expect(h.service.saveProfile).not.toHaveBeenCalled();
  });

  it.each(['pending', 'suspended'] as const)(
    'does not request private profile while %s',
    async (status) => {
      const h = harness();
      vi.mocked(h.service.getAccess).mockResolvedValue(status);
      await h.controller.initialize();
      await h.controller.reloadProfile();
      expect(h.service.loadProfile).not.toHaveBeenCalled();
      expect(h.controller.getSnapshot().profile).toBeNull();
    },
  );

  it('keeps a dirty draft and its base revision across foreground refresh', async () => {
    const h = harness();
    await h.controller.initialize();
    h.controller.editProfile({ displayName: 'My unsaved draft', preferredLocale: 'en' });
    vi.mocked(h.service.loadProfile).mockResolvedValue({
      ...profileA,
      displayName: 'Other device',
      revision: 2,
    });
    h.controller.setActive(true);
    await vi.waitFor(() => expect(h.controller.getSnapshot().busy).toBe(false));
    expect(h.controller.getSnapshot()).toMatchObject({
      profile: { displayName: 'Other device', revision: 2 },
      profileDraft: { displayName: 'My unsaved draft', preferredLocale: 'en', expectedRevision: 1 },
      profileDirty: true,
    });
    vi.mocked(h.service.saveProfile).mockRejectedValue(new ParentAccountError('profile_conflict'));
    await h.controller.saveProfile();
    expect(h.service.saveProfile).toHaveBeenCalledExactlyOnceWith({
      displayName: 'My unsaved draft',
      preferredLocale: 'en',
      expectedRevision: 1,
    });
    expect(h.controller.getSnapshot()).toMatchObject({
      profileError: 'profile_conflict',
      profileNotice: null,
    });
    h.controller.editProfile({ displayName: 'Still a draft' });
    await h.controller.saveProfile();
    expect(h.service.saveProfile).toHaveBeenCalledOnce();
    await h.controller.refresh();
    expect(h.controller.getSnapshot().profileError).toBe('profile_conflict');
    await h.controller.reloadProfile();
    expect(h.controller.getSnapshot()).toMatchObject({
      profileDraft: { displayName: 'Other device', expectedRevision: 2 },
      profileDirty: false,
      profileError: null,
    });
  });

  it('keeps unsubmitted edits when an explicit reload fails and replaces them only on success', async () => {
    const h = harness();
    await h.controller.initialize();
    h.controller.editProfile({ displayName: 'Draft retained' });
    vi.mocked(h.service.loadProfile).mockRejectedValueOnce(
      new ParentAccountError('network_unavailable'),
    );
    await h.controller.reloadProfile();
    expect(h.controller.getSnapshot()).toMatchObject({
      profile: null,
      profileDraft: { displayName: 'Draft retained' },
      profileDirty: true,
      profileError: 'network_unavailable',
    });
    await h.controller.saveProfile();
    expect(h.service.saveProfile).not.toHaveBeenCalled();
    await h.controller.reloadProfile();
    expect(h.controller.getSnapshot()).toMatchObject({ profile: profileA, profileDirty: false });
  });

  it('deduplicates saves and announces success only after the server returns the owner record', async () => {
    const h = harness();
    await h.controller.initialize();
    h.controller.editProfile({ displayName: 'Changed name' });
    const waiting = deferred<AccountProfile>();
    vi.mocked(h.service.saveProfile).mockReturnValueOnce(waiting.promise);
    const first = h.controller.saveProfile();
    await h.controller.saveProfile();
    h.controller.editProfile({ displayName: 'Cannot overwrite pending save' });
    expect(h.service.saveProfile).toHaveBeenCalledOnce();
    expect(h.controller.getSnapshot()).toMatchObject({
      profileBusy: true,
      profileNotice: null,
      profileDirty: true,
    });
    waiting.resolve({ ...profileA, displayName: 'Changed name', revision: 2 });
    await first;
    expect(h.controller.getSnapshot()).toMatchObject({
      profileBusy: false,
      profileDraft: { displayName: 'Changed name', expectedRevision: 2 },
      profileNotice: 'saved',
      profileDirty: false,
    });
  });

  it('retains unsaved edits and no success notice after a failed write', async () => {
    const h = harness();
    await h.controller.initialize();
    h.controller.editProfile({ displayName: 'Not yet saved' });
    vi.mocked(h.service.saveProfile).mockRejectedValueOnce(
      new ParentAccountError('network_unavailable'),
    );
    await h.controller.saveProfile();
    expect(h.controller.getSnapshot()).toMatchObject({
      profile: profileA,
      profileDirty: true,
      profileNotice: null,
      profileError: 'network_unavailable',
    });
    await h.controller.saveProfile();
    expect(h.controller.getSnapshot()).toMatchObject({
      profileNotice: 'saved',
      profileDirty: false,
    });
  });

  it('validates empty and overlong names before a write without changing the draft', async () => {
    const h = harness();
    await h.controller.initialize();
    for (const displayName of ['   ', 'غ'.repeat(81)]) {
      h.controller.editProfile({ displayName });
      await h.controller.saveProfile();
      expect(h.controller.getSnapshot()).toMatchObject({
        profileDraft: { displayName },
        profileError: 'invalid_profile',
      });
    }
    expect(h.service.saveProfile).not.toHaveBeenCalled();
  });

  it.each(['load', 'save'] as const)(
    'rejects another owner DTO returned by %s',
    async (operation) => {
      const h = harness();
      if (operation === 'load') vi.mocked(h.service.loadProfile).mockResolvedValue(profileB);
      await h.controller.initialize();
      if (operation === 'save') {
        h.controller.editProfile({ displayName: 'Update' });
        vi.mocked(h.service.saveProfile).mockResolvedValue(profileB);
        await h.controller.saveProfile();
      }
      expect(h.controller.getSnapshot()).toMatchObject({
        profileError: 'profile_unavailable',
        profileNotice: null,
      });
      expect(JSON.stringify(h.controller.getSnapshot())).not.toContain(profileB.displayName);
    },
  );

  it.each(['load', 'save'] as const)(
    'ignores a late %s after logout and clears private state immediately',
    async (operation) => {
      const h = harness();
      await h.controller.initialize();
      const waiting = deferred<AccountProfile>();
      let pending: Promise<void>;
      if (operation === 'load') {
        vi.mocked(h.service.loadProfile).mockReturnValueOnce(waiting.promise);
        pending = h.controller.reloadProfile();
        await vi.waitFor(() => expect(h.controller.getSnapshot().profileBusy).toBe(true));
      } else {
        h.controller.editProfile({ displayName: 'Pending write' });
        vi.mocked(h.service.saveProfile).mockReturnValueOnce(waiting.promise);
        pending = h.controller.saveProfile();
      }
      const signout = h.controller.signOut();
      expect(h.controller.getSnapshot()).toMatchObject({
        phase: 'signin',
        account: null,
        profile: null,
        profileDraft: null,
      });
      waiting.resolve(profileA);
      await Promise.all([pending, signout]);
      expect(h.controller.getSnapshot()).toMatchObject({
        phase: 'signin',
        profile: null,
        profileDraft: null,
        profileNotice: null,
      });
    },
  );

  it('invalidates a pending old-account write before accepting another identity', async () => {
    const h = harness();
    await h.controller.initialize();
    h.controller.editProfile({ displayName: 'Old account draft' });
    const waiting = deferred<AccountProfile>();
    vi.mocked(h.service.saveProfile).mockReturnValueOnce(waiting.promise);
    const pending = h.controller.saveProfile();
    vi.mocked(h.service.restoreSession).mockResolvedValue(adultB);
    vi.mocked(h.service.loadProfile).mockResolvedValue(profileB);
    h.notify('changed');
    expect(h.controller.getSnapshot()).toMatchObject({ phase: 'restoring', profile: null });
    waiting.resolve({ ...profileA, displayName: 'Old late write' });
    await pending;
    await vi.waitFor(() => expect(h.controller.getSnapshot().busy).toBe(false));
    expect(h.controller.getSnapshot()).toMatchObject({
      account: adultB,
      profile: profileB,
      profileDirty: false,
      profileNotice: null,
    });
    expect(JSON.stringify(h.controller.getSnapshot())).not.toContain('Old');
  });

  it('clears private profile and draft when session authorization fails', async () => {
    const h = harness();
    await h.controller.initialize();
    h.controller.editProfile({ displayName: 'Private draft' });
    vi.mocked(h.service.loadProfile).mockRejectedValue(new ParentAccountError('session_expired'));
    await h.controller.refresh();
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'error',
      account: null,
      profile: null,
      profileDraft: null,
      error: 'session_expired',
    });
  });

  it('clears in-memory profile on disposal and ignores pending completion', async () => {
    const h = harness();
    await h.controller.initialize();
    const waiting = deferred<AccountProfile>();
    vi.mocked(h.service.loadProfile).mockReturnValueOnce(waiting.promise);
    const pending = h.controller.reloadProfile();
    await vi.waitFor(() => expect(h.controller.getSnapshot().profileBusy).toBe(true));
    h.controller.dispose();
    waiting.resolve(profileA);
    await pending;
    expect(h.controller.getSnapshot()).toMatchObject({
      account: null,
      profile: null,
      profileDraft: null,
    });
  });

  it('waits for private-session cleanup before opening another account', async () => {
    const cleanup = vi.fn(async (): Promise<void> => {});
    const h = harness(cleanup);
    await h.controller.initialize();
    const waiting = deferred<void>();
    cleanup.mockReturnValueOnce(waiting.promise);
    vi.mocked(h.service.restoreSession).mockResolvedValue(adultB);
    vi.mocked(h.service.loadProfile).mockResolvedValue(profileB);
    const refresh = h.controller.refresh();
    await vi.waitFor(() => expect(cleanup).toHaveBeenCalledTimes(2));
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'restoring',
      account: null,
      profile: null,
      profileDraft: null,
      sampleOpen: false,
    });
    expect(h.service.loadProfile).toHaveBeenCalledOnce();
    waiting.resolve();
    await refresh;
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'ready',
      account: adultB,
      profile: profileB,
    });
  });

  it('withholds the account if independent private cleanup cannot finish', async () => {
    const cleanup = vi.fn(async (): Promise<void> => {});
    const h = harness(cleanup);
    await h.controller.initialize();
    cleanup.mockRejectedValueOnce(new ParentAccountError('storage_unavailable'));
    vi.mocked(h.service.restoreSession).mockResolvedValue(adultB);
    await h.controller.refresh();
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'error',
      account: null,
      profile: null,
      sampleOpen: false,
      error: 'storage_unavailable',
    });
  });

  it.each(['private', 'parent'] as const)(
    'attempts both logout paths even if %s cleanup fails',
    async (failed) => {
      const cleanup = vi.fn(async (): Promise<void> => {});
      const h = harness(cleanup);
      await h.controller.initialize();
      cleanup.mockClear();
      const waiting = deferred<void>();
      if (failed === 'private') {
        cleanup.mockRejectedValueOnce(new ParentAccountError('storage_unavailable'));
        vi.mocked(h.service.signOut).mockReturnValueOnce(waiting.promise);
      } else {
        vi.mocked(h.service.signOut).mockRejectedValueOnce(
          new ParentAccountError('network_unavailable'),
        );
        cleanup.mockReturnValueOnce(waiting.promise);
      }
      const logout = h.controller.signOut();
      expect(h.controller.getSnapshot()).toMatchObject({
        account: null,
        profile: null,
        profileDraft: null,
        sampleOpen: false,
      });
      await vi.waitFor(() => expect(cleanup).toHaveBeenCalledOnce());
      expect(h.service.signOut).toHaveBeenCalledOnce();
      expect(h.controller.getSnapshot().busy).toBe(true);
      waiting.resolve();
      await logout;
      expect(h.controller.getSnapshot()).toMatchObject({
        phase: 'logout-error',
        account: null,
        profile: null,
      });
    },
  );
});
