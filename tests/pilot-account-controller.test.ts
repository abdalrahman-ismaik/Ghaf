import { describe, expect, it, vi } from 'vitest';

import { createPilotController } from '../src/features/pilot/controller';
import {
  ParentAccountError,
  type ParentAccountEvent,
  type ParentAccountService,
} from '../src/models/parentAccount';

const account = { userId: 'adult-a', email: 'adult-a@example.test' };
function harness() {
  let notify: (event: ParentAccountEvent) => void = () => undefined;
  const service: ParentAccountService = {
    signUp: vi.fn(async () => undefined),
    signIn: vi.fn(async () => account),
    verifyEmail: vi.fn(async () => account),
    restoreSession: vi.fn(async () => account),
    getAccess: vi.fn(async () => 'approved' as const),
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
  const sample = { start: vi.fn(async () => undefined), clear: vi.fn() };
  const controller = createPilotController(service, sample);
  return { controller, service, sample, notify: (event: ParentAccountEvent) => notify(event) };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

describe('adult pilot controller', () => {
  it('closes an idle sample immediately when a changed session needs approval', async () => {
    const h = harness();
    await h.controller.initialize();
    await h.controller.explore();
    const waiting = deferred<'approved'>();
    vi.mocked(h.service.restoreSession).mockResolvedValue({
      userId: 'adult-b',
      email: 'adult-b@example.test',
    });
    vi.mocked(h.service.getAccess).mockReturnValueOnce(waiting.promise);
    h.notify('changed');
    expect(h.controller.getSnapshot()).toMatchObject({ phase: 'restoring', busy: true });
    await Promise.resolve();
    waiting.resolve('approved');
    await vi.waitFor(() =>
      expect(h.controller.getSnapshot()).toMatchObject({
        phase: 'ready',
        sampleOpen: false,
        account: { userId: 'adult-b' },
      }),
    );
  });

  it('retains sample data when an idle changed-session check confirms the same account', async () => {
    const h = harness();
    await h.controller.initialize();
    await h.controller.explore();
    h.sample.clear.mockClear();
    h.notify('changed');
    expect(h.controller.getSnapshot().phase).toBe('restoring');
    await vi.waitFor(() =>
      expect(h.controller.getSnapshot()).toMatchObject({
        phase: 'ready',
        sampleOpen: true,
        account,
      }),
    );
    expect(h.sample.clear).not.toHaveBeenCalled();
  });

  it('closes the navigator and revalidates an identity change during approval refresh', async () => {
    const h = harness();
    await h.controller.initialize();
    await h.controller.explore();
    const waiting = deferred<'approved'>();
    vi.mocked(h.service.getAccess).mockReturnValueOnce(waiting.promise);
    const check = h.controller.refresh();
    await Promise.resolve();
    vi.mocked(h.service.restoreSession).mockResolvedValue({
      userId: 'adult-b',
      email: 'adult-b@example.test',
    });
    h.notify('changed');
    expect(h.controller.getSnapshot().phase).toBe('restoring');
    waiting.resolve('approved');
    await check;
    await vi.waitFor(() =>
      expect(h.controller.getSnapshot()).toMatchObject({
        phase: 'ready',
        sampleOpen: false,
        account: { userId: 'adult-b' },
      }),
    );
  });
  it('fails closed before configuration or identity restoration', () => {
    const h = harness();
    expect(h.controller.getSnapshot()).toMatchObject({ phase: 'restoring', sampleOpen: false });
    expect(createPilotController(null, h.sample).getSnapshot()).toMatchObject({
      phase: 'configuration',
      sampleOpen: false,
    });
    expect(h.sample.start).not.toHaveBeenCalled();
  });

  it.each(['pending', 'suspended'] as const)(
    'withholds the sample from %s users',
    async (status) => {
      const h = harness();
      vi.mocked(h.service.getAccess).mockResolvedValue(status);
      await h.controller.initialize();
      await h.controller.explore();
      expect(h.controller.getSnapshot()).toMatchObject({ phase: status, sampleOpen: false });
      expect(h.sample.start).not.toHaveBeenCalled();
    },
  );

  it('requires explicit sample entry after approval and revalidates it', async () => {
    const h = harness();
    await h.controller.initialize();
    expect(h.controller.getSnapshot()).toMatchObject({ phase: 'ready', sampleOpen: false });
    await h.controller.explore();
    expect(h.sample.start).toHaveBeenCalledOnce();
    expect(h.service.getAccess).toHaveBeenCalledTimes(2);
    expect(h.controller.getSnapshot().sampleOpen).toBe(true);
  });

  it('refreshing the same approved identity preserves the sample', async () => {
    const h = harness();
    await h.controller.initialize();
    await h.controller.explore();
    h.sample.clear.mockClear();
    await h.controller.refresh();
    expect(h.sample.clear).not.toHaveBeenCalled();
    expect(h.controller.getSnapshot().sampleOpen).toBe(true);
  });

  it('a missing row or network failure closes and clears an open sample', async () => {
    const h = harness();
    await h.controller.initialize();
    await h.controller.explore();
    vi.mocked(h.service.getAccess).mockRejectedValue(new ParentAccountError('access_unavailable'));
    await h.controller.refresh();
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'error',
      sampleOpen: false,
      error: 'access_unavailable',
    });
  });

  it('approval suspension and switching identity discard previous sample authority', async () => {
    const h = harness();
    await h.controller.initialize();
    await h.controller.explore();
    vi.mocked(h.service.getAccess).mockResolvedValue('suspended');
    await h.controller.refresh();
    expect(h.controller.getSnapshot()).toMatchObject({ phase: 'suspended', sampleOpen: false });
    vi.mocked(h.service.getAccess).mockResolvedValue('approved');
    vi.mocked(h.service.restoreSession).mockResolvedValue({
      userId: 'adult-b',
      email: 'adult-b@example.test',
    });
    await h.controller.refresh();
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'ready',
      sampleOpen: false,
      account: { userId: 'adult-b' },
    });
  });

  it('restart and account panel retain login while real signout clears it immediately', async () => {
    const h = harness();
    await h.controller.initialize();
    await h.controller.explore();
    h.controller.openAccount();
    expect(h.controller.getSnapshot().accountPanel).toBe(true);
    h.controller.continueSample();
    expect(h.controller.getSnapshot().sampleOpen).toBe(true);
    h.controller.restartSample();
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'ready',
      sampleOpen: false,
      account,
    });
    const waiting = deferred<void>();
    vi.mocked(h.service.signOut).mockReturnValue(waiting.promise);
    const signout = h.controller.signOut();
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'signin',
      account: null,
      sampleOpen: false,
    });
    waiting.resolve();
    await signout;
  });

  it('late approval cannot restore a signed-out sample', async () => {
    const h = harness();
    const waiting = deferred<'approved'>();
    vi.mocked(h.service.getAccess).mockReturnValue(waiting.promise);
    const restore = h.controller.initialize();
    await Promise.resolve();
    await h.controller.signOut();
    waiting.resolve('approved');
    await restore;
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'signin',
      account: null,
      sampleOpen: false,
    });
  });

  it.each(['signed-out', 'recovery', 'error'] as const)(
    'immediately closes the sample on %s during pending refresh',
    async (event) => {
      const h = harness();
      await h.controller.initialize();
      await h.controller.explore();
      const waiting = deferred<'approved'>();
      vi.mocked(h.service.getAccess).mockReturnValue(waiting.promise);
      const check = h.controller.refresh();
      await Promise.resolve();
      h.notify(event);
      expect(h.controller.getSnapshot().sampleOpen).toBe(false);
      waiting.resolve('approved');
      await check;
      expect(h.controller.getSnapshot().sampleOpen).toBe(false);
    },
  );

  it('keeps recovery sessions outside the sample through restart and password completion', async () => {
    const h = harness();
    vi.mocked(h.service.restoreSession).mockRejectedValue(
      new ParentAccountError('recovery_required'),
    );
    await h.controller.initialize();
    expect(h.controller.getSnapshot()).toMatchObject({ phase: 'new-password', sampleOpen: false });
    await h.controller.refresh();
    expect(h.service.getAccess).not.toHaveBeenCalled();
    vi.mocked(h.service.updatePassword).mockImplementation(async () => h.notify('signed-out'));
    await h.controller.updatePassword('new-password-long');
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'signin',
      account: null,
      notice: 'password_updated',
    });
  });

  it('supports registration and resuming unverified email without another signup', async () => {
    const h = harness();
    vi.mocked(h.service.restoreSession).mockResolvedValue(null);
    await h.controller.initialize();
    h.controller.showForm('register');
    await h.controller.register(' Adult-A@Example.Test ', 'long-password-value');
    expect(h.controller.getSnapshot()).toMatchObject({ phase: 'verify', email: account.email });
    h.controller.showForm('signin');
    h.controller.continueVerification(account.email);
    await h.controller.resend();
    expect(h.service.signUp).toHaveBeenCalledOnce();
    vi.mocked(h.service.getAccess).mockResolvedValue('pending');
    await h.controller.verify('123456');
    expect(h.controller.getSnapshot()).toMatchObject({ phase: 'pending', sampleOpen: false });
  });

  it('keeps invalid verification and recovery codes in their own forms', async () => {
    const h = harness();
    vi.mocked(h.service.restoreSession).mockResolvedValue(null);
    await h.controller.initialize();
    h.controller.continueVerification(account.email);
    vi.mocked(h.service.verifyEmail).mockRejectedValue(new ParentAccountError('invalid_code'));
    await h.controller.verify('000000');
    expect(h.controller.getSnapshot()).toMatchObject({ phase: 'verify', error: 'invalid_code' });
    h.controller.showForm('forgot');
    await h.controller.requestRecovery(account.email);
    vi.mocked(h.service.verifyRecovery).mockRejectedValue(new ParentAccountError('invalid_code'));
    await h.controller.verifyRecovery('000000');
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'recovery-code',
      error: 'invalid_code',
      sampleOpen: false,
    });
  });

  it('does not restore access when credential clearing fails or after disposal', async () => {
    const h = harness();
    await h.controller.initialize();
    vi.mocked(h.service.signOut).mockRejectedValue(new ParentAccountError('storage_unavailable'));
    await h.controller.signOut();
    expect(h.controller.getSnapshot()).toMatchObject({
      phase: 'error',
      account: null,
      sampleOpen: false,
    });
    h.controller.dispose();
    h.notify('changed');
    expect(h.service.dispose).toHaveBeenCalledOnce();
  });
});
