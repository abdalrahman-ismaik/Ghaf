import { beforeEach, describe, expect, it } from 'vitest';

import { PARENT_VERIFICATION_CODE } from '@/features/access/parentOnboarding';
import { usePrototypeStore } from '@/state/usePrototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  if (!result.ok || result.data === undefined) {
    throw new Error(`Expected result to succeed: ${JSON.stringify(result)}`);
  }
  return result.data;
}

async function completeParentOnboarding(): Promise<void> {
  expectOk(
    usePrototypeStore.getState().requestParentVerification({
      identifier: 'parent@example.com',
      networkAvailable: false,
    }),
  );
  expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  expectOk(usePrototypeStore.getState().completeParentOnboarding());
}

describe('R002b Parent Progress store authority', () => {
  beforeEach(() => {
    usePrototypeStore.setState({ role: 'parent' });
    expectOk(usePrototypeStore.getState().resetPrototype());
  });

  it('fails closed until the synthetic Parent session has report capability', () => {
    expect(usePrototypeStore.getState().getParentChildProgress('child_salem')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('projects only the explicitly selected Child after Parent authorization', async () => {
    await completeParentOnboarding();

    const salem = expectOk(usePrototypeStore.getState().getParentChildProgress('child_salem'));
    const alya = expectOk(usePrototypeStore.getState().getParentChildProgress('child_alya'));

    expect(salem).toMatchObject({
      profileId: 'child_salem',
      lifetimeSeeds: 108,
      currentStage: { cumulativeSeeds: 48 },
      private: true,
      readOnly: true,
    });
    expect(alya).toMatchObject({
      profileId: 'child_alya',
      lifetimeSeeds: 36,
      currentStage: null,
      private: true,
      readOnly: true,
    });
    expect(JSON.stringify(alya)).not.toContain('child_salem');
  });

  it('does not treat the mutable presentation role as Parent report authority', async () => {
    await completeParentOnboarding();
    usePrototypeStore.getState().setRole('child');

    expect(usePrototypeStore.getState().getParentChildProgress('child_salem')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('rejects an unknown profile at runtime and invalidates report authority on reset', async () => {
    await completeParentOnboarding();

    expect(
      usePrototypeStore
        .getState()
        .getParentChildProgress('child_unknown' as unknown as 'child_salem'),
    ).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });

    expectOk(usePrototypeStore.getState().resetPrototype());
    expect(usePrototypeStore.getState().getParentChildProgress('child_salem')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('returns a read-only projection without mutating the canonical session', async () => {
    await completeParentOnboarding();
    const before = usePrototypeStore.getState();
    const beforeSession = {
      activeChildId: before.activeChildId,
      activeAssignmentId: before.activeAssignmentId,
      landscapeProgress: structuredClone(before.landscapeProgress),
      growthJourney: structuredClone(before.growthJourney),
    };

    expectOk(usePrototypeStore.getState().getParentChildProgress('child_salem'));

    const after = usePrototypeStore.getState();
    expect({
      activeChildId: after.activeChildId,
      activeAssignmentId: after.activeAssignmentId,
      landscapeProgress: after.landscapeProgress,
      growthJourney: after.growthJourney,
    }).toEqual(beforeSession);
  });
});
