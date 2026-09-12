import { describe, expect, it } from 'vitest';

import { DeterministicSyntheticAccessService } from '../src/features/access';
import { createChildAccessController } from '../src/features/access/childAccess';
import { createParentOnboardingController } from '../src/features/access/parentOnboarding/controller';
import { createInitialParentOnboardingDraft } from '../src/features/access/parentOnboarding/policy';
import { createLocalFamilyRecord, localFamilyRecordToReceipt } from '../src/features/local-family';
import type {
  AccessSession,
  SyntheticChildSignIn,
  SyntheticParentSignIn,
} from '../src/models/access';
import type { ServiceResult } from '../src/services/interfaces';

const NOW = '2026-09-12T01:00:00.000Z';
const PRINCIPALS = ['parent', 'child_salem', 'child_alya'] as const;
type Principal = (typeof PRINCIPALS)[number];

function success<T>(data: T): ServiceResult<T> {
  return { ok: true, data, meta: { origin: 'synthetic', fallbackUsed: false } };
}

class ObservedAccess extends DeterministicSyntheticAccessService {
  attemptedSession: AccessSession | null = null;

  override signInParent(input: SyntheticParentSignIn) {
    const result = super.signInParent(input);
    if (result.ok) this.attemptedSession = result.data;
    return result;
  }

  override signInChild(input: SyntheticChildSignIn) {
    const result = super.signInChild(input);
    if (result.ok) this.attemptedSession = result.data;
    return result;
  }
}

function createHarness() {
  const access = new ObservedAccess();
  const parent = createParentOnboardingController(access, {
    sessionId: 'independent-demo-parent',
    deviceId: 'independent-demo-device',
  });
  const child = createChildAccessController(access, parent);
  const draft = createInitialParentOnboardingDraft();
  const record = createLocalFamilyRecord({
    familyConnections: draft.familyConnections,
    familyName: 'أسرة النور',
    appLanguage: 'ar',
    parentIdentifier: {
      identifierKind: 'email',
      normalizedIdentifier: 'synthetic-parent@example.com',
      maskedDestination: 's***@example.com',
    },
    children: draft.children.map(({ profileId, ...profile }) => ({
      ...profile,
      id: profileId,
      role: 'child',
      sex: profile.sex!,
    })),
    pairedChildIds: ['child_salem', 'child_alya'],
    now: NOW,
  });
  if (!record.ok) throw new Error('Invalid synthetic family fixture');
  const receipt = localFamilyRecordToReceipt(record.data);
  const run = <T>(operation: () => ServiceResult<T>) =>
    access.withDemoEntryTransaction(() =>
      parent.withDemoEntryTransaction(() => child.withDemoEntryTransaction(operation)),
    );
  const enter = (principal: Principal): ServiceResult<true> => {
    const restored = parent.restoreCompletionReceipt(receipt);
    if (!restored.ok) return restored;
    const paired = child.restorePairedDevices({
      childIds: ['child_salem', 'child_alya'],
      pairedAt: NOW,
    });
    if (!paired.ok) return paired;
    const resumed =
      principal === 'parent'
        ? parent.resumeRememberedParent(NOW)
        : child.resumeRememberedChild(principal, NOW);
    return resumed.ok ? success(true) : resumed;
  };
  return { access, parent, child, run, enter };
}

describe('independent demo composite transaction acceptance', () => {
  it.each(PRINCIPALS)(
    'can enter %s through all three real wrappers without injection',
    (principal) => {
      const { parent, child, run, enter } = createHarness();
      expect(run(() => enter(principal)).ok).toBe(true);
      expect(parent.authorizeParentExperience(NOW).ok).toBe(principal === 'parent');
      expect(child.authorizeChildExperience(NOW).ok).toBe(principal !== 'parent');
    },
  );

  it.each([
    ['access', 'parent'],
    ['access', 'child_salem'],
    ['access', 'child_alya'],
    ['parent', 'child_salem'],
    ['parent', 'child_alya'],
  ] as const)(
    'rolls back every participant and permits %s-reentry retry for %s',
    (reentered, principal) => {
      const h = createHarness();
      const parentBefore = h.parent.getView();
      const childBefore = h.child.getView();
      let injected: ServiceResult<true> | undefined;
      let nestedOperationCalled = false;
      const failed = h.run(() => {
        const entered = h.enter(principal);
        if (!entered.ok) return entered;
        // Fault injection: deliberately swallow an outer or middle wrapper's reentry rejection.
        injected = h[reentered].withDemoEntryTransaction(() => {
          nestedOperationCalled = true;
          return success(true);
        });
        return success(true);
      });

      expect(injected).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
      expect(nestedOperationCalled).toBe(false);
      expect(failed).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
      expect(h.access.attemptedSession).not.toBeNull();
      const failedSession = h.access.attemptedSession!;

      expect.soft(h.parent.getView()).toEqual(parentBefore);
      expect.soft(h.child.getView()).toEqual(childBefore);
      expect.soft(h.parent.getView().status).toBe('signed_out');
      expect.soft(h.child.getView().status).toBe('signed_out');
      expect.soft(h.access.projectSession({ session: failedSession, now: NOW }).ok).toBe(false);
      expect.soft(h.parent.authorizeParentExperience(NOW).ok).toBe(false);
      expect.soft(h.child.authorizeChildExperience(NOW).ok).toBe(false);

      // Use the same public preparation/resume path, without reset or private state repair.
      const retried = h.run(() => h.enter(principal));
      expect.soft(retried, 'A rolled-back entry must allow a valid same-run retry').toMatchObject({
        ok: true,
      });
      if (retried.ok) {
        expect(h.parent.authorizeParentExperience(NOW).ok).toBe(principal === 'parent');
        expect(h.child.authorizeChildExperience(NOW).ok).toBe(principal !== 'parent');
      }
    },
  );
});
