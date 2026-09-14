import { ParentAccountError } from '../../models/parentAccount';
import type { PilotSampleActions } from './controller';

interface MessagingBoundary {
  clearAccountSession(): Promise<void>;
}

export function createPilotPrivateBoundary(
  sample: Pick<PilotSampleActions, 'start' | 'clear'>,
  messaging: MessagingBoundary,
): PilotSampleActions {
  let pending: Promise<void> | null = null;
  let barrier: Promise<void> = Promise.resolve();
  return {
    clear() {
      // Clear independent messaging credentials even if synthetic sample cleanup fails.
      if (!pending) {
        const cleanup = messaging.clearAccountSession().catch(() => {
          throw new ParentAccountError('storage_unavailable');
        });
        pending = cleanup;
        barrier = cleanup;
        void cleanup.then(
          () => {
            if (pending === cleanup) pending = null;
          },
          () => {
            if (pending === cleanup) pending = null;
          },
        );
      }
      sample.clear();
    },
    clearPrivate: () => barrier,
    async start() {
      await barrier;
      await sample.start();
    },
  };
}
