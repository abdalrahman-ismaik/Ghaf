import { describe, expect, it, vi } from 'vitest';
import { FamilyMessagingController } from '../../src/features/familyMessaging/controller';
import { MessagingError } from '../../src/features/familyMessaging/contracts';
import { createPilotPrivateBoundary } from '../../src/features/pilot/privateBoundary';
import { deferred, fakeService, ids } from '../messaging/fixtures';

describe('adult account private messaging boundary', () => {
  it('clears visible sample immediately and blocks entry until messaging credentials are cleared', async () => {
    let finish!: () => void;
    const messaging = {
      clearAccountSession: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      ),
    };
    const sample = { clear: vi.fn(), start: vi.fn(async () => {}) };
    const boundary = createPilotPrivateBoundary(sample, messaging);
    boundary.clear();
    boundary.clear();
    const entering = boundary.start();
    expect(sample.clear).toHaveBeenCalledTimes(2);
    expect(messaging.clearAccountSession).toHaveBeenCalledTimes(1);
    expect(sample.start).not.toHaveBeenCalled();
    finish();
    await entering;
    expect(sample.start).toHaveBeenCalledTimes(1);
  });

  it('fails closed on credential cleanup rejection and permits an explicit cleanup retry', async () => {
    let error: string | null = 'storage';
    const sample = { clear: vi.fn(), start: vi.fn(async () => {}) };
    const boundary = createPilotPrivateBoundary(sample, {
      async clearAccountSession() {
        if (error) throw new MessagingError('storage_failed');
      },
    });
    boundary.clear();
    await expect(boundary.clearPrivate!()).rejects.toMatchObject({ code: 'storage_unavailable' });
    await expect(boundary.start()).rejects.toMatchObject({ code: 'storage_unavailable' });
    expect(sample.start).not.toHaveBeenCalled();
    error = null;
    boundary.clear();
    await boundary.start();
    expect(sample.start).toHaveBeenCalledOnce();
  });

  it('starts credential cleanup even if sample clearing throws', async () => {
    const messaging = { clearAccountSession: vi.fn(async () => {}) };
    const boundary = createPilotPrivateBoundary(
      {
        clear() {
          throw new Error('sample cleanup');
        },
        start: async () => {},
      },
      messaging,
    );
    expect(() => boundary.clear()).toThrow('sample cleanup');
    await boundary.clearPrivate!();
    expect(messaging.clearAccountSession).toHaveBeenCalledOnce();
  });

  it.each(['context change', 'backgrounding'])(
    'retains authoritative cleanup failure after %s invalidates messaging UI work',
    async (interruption) => {
      const service = fakeService();
      const clearing = deferred<{ remoteConfirmed: boolean }>();
      vi.mocked(service.signOut).mockReturnValue(clearing.promise);
      const messaging = new FamilyMessagingController(service, async () => ids.key);
      messaging.setLocalContext('sample:active', 'parent');
      const sample = {
        clear: vi.fn(() => {
          if (interruption === 'context change') messaging.setLocalContext('sample:cleared', null);
          else messaging.setForeground(false);
        }),
        start: vi.fn(async () => {}),
      };
      const boundary = createPilotPrivateBoundary(sample, messaging);

      boundary.clear();
      expect(sample.clear).toHaveBeenCalledOnce();
      expect(service.signOut).toHaveBeenCalledOnce();
      clearing.reject(new MessagingError('storage_failed'));

      await expect(boundary.clearPrivate!()).rejects.toMatchObject({
        code: 'storage_unavailable',
      });
      await expect(boundary.start()).rejects.toMatchObject({ code: 'storage_unavailable' });
      expect(messaging.getSnapshot().error).toBeNull();
      expect(sample.start).not.toHaveBeenCalled();
    },
  );

  it('preserves handled screen signout errors while exposing authoritative cleanup rejection', async () => {
    const service = fakeService();
    vi.mocked(service.signOut).mockRejectedValue(new MessagingError('storage_failed'));
    const messaging = new FamilyMessagingController(service, async () => ids.key);

    await expect(messaging.signOut()).resolves.toBeUndefined();
    expect(messaging.getSnapshot().error).toBe('storage_failed');
    await expect(messaging.clearAccountSession()).rejects.toMatchObject({
      code: 'storage_failed',
    });
    expect(messaging.getSnapshot().busy).toBe(false);
  });

  it('allows entry after local cleanup when remote signout cannot be confirmed', async () => {
    const service = fakeService();
    vi.mocked(service.signOut).mockResolvedValue({ remoteConfirmed: false });
    const messaging = new FamilyMessagingController(service, async () => ids.key);
    const sample = { clear: vi.fn(), start: vi.fn(async () => {}) };
    const boundary = createPilotPrivateBoundary(sample, messaging);

    boundary.clear();
    await boundary.start();

    expect(messaging.getSnapshot().remoteSignoutUnconfirmed).toBe(true);
    expect(sample.start).toHaveBeenCalledOnce();
  });
});
