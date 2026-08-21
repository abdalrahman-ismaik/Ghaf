import type { MissionLifecycleStatus } from '../../models/prototype';
import type { ServiceResult } from '../../services/interfaces';

export type MissionLifecycleEvent =
  | 'start-generation'
  | 'generation-succeeded'
  | 'use-mock-fallback'
  | 'edit-mission'
  | 'approve-mission'
  | 'open-child-mission'
  | 'submit-for-confirmation'
  | 'request-retry'
  | 'approve-completion';

const transitions: Readonly<
  Partial<
    Record<MissionLifecycleStatus, Partial<Record<MissionLifecycleEvent, MissionLifecycleStatus>>>
  >
> = {
  'draft-input': { 'start-generation': 'generating' },
  generating: {
    'generation-succeeded': 'parent-review',
    'use-mock-fallback': 'parent-review',
  },
  'parent-review': {
    'edit-mission': 'draft-input',
    'approve-mission': 'assigned',
  },
  assigned: { 'open-child-mission': 'child-in-progress' },
  'child-in-progress': { 'submit-for-confirmation': 'awaiting-parent-confirmation' },
  'awaiting-parent-confirmation': {
    'request-retry': 'child-in-progress',
    'approve-completion': 'completed',
  },
};

export function transitionLifecycle(
  current: MissionLifecycleStatus,
  event: MissionLifecycleEvent,
): ServiceResult<MissionLifecycleStatus> {
  const next = transitions[current]?.[event];
  if (!next) {
    return {
      ok: false,
      error: {
        code: 'INVALID_TRANSITION',
        message: `Cannot ${event} while mission is ${current}`,
        retryable: false,
        fallbackAvailable: false,
      },
    };
  }

  return {
    ok: true,
    data: next,
    meta: { origin: 'simulated', fallbackUsed: false },
  };
}
