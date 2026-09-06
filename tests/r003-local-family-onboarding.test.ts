import { describe, expect, it } from 'vitest';

import {
  createChildAccessController,
  DeterministicSyntheticAccessService,
} from '../src/features/access';
import {
  createInitialParentOnboardingDraft,
  createParentOnboardingController,
  PARENT_VERIFICATION_CODE,
  updateParentOnboardingDraft,
  validateCompleteParentOnboardingDraft,
} from '../src/features/access/parentOnboarding';

const NOW = '2026-09-06T14:00:00.000Z';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

describe('multi-child Parent onboarding domain', () => {
  it('keeps two safe draft slots and applies indexed updates without overwriting siblings', () => {
    const initial = createInitialParentOnboardingDraft();
    expect(initial).toMatchObject({ childCount: 2 });
    expect(initial.children).toHaveLength(2);

    const updated = expectOk(
      updateParentOnboardingDraft(initial, {
        childCount: 2,
        childIndex: 1,
        child: {
          nickname: 'Alya',
          gender: 'girl',
          interests: ['stories'],
          hobbies: ['reading'],
          supportPreferences: ['quiet_reminders'],
          personalizationEnabled: true,
        },
      }),
    );

    expect(updated.children[0]).toEqual(initial.children[0]);
    expect(updated.children[1]).toMatchObject({
      nickname: 'Alya',
      gender: 'girl',
      interests: ['stories'],
      hobbies: ['reading'],
      supportPreferences: ['quiet_reminders'],
    });
  });

  it('validates exactly the selected count and keeps optional preference fields bounded', () => {
    const initial = createInitialParentOnboardingDraft();
    const oneChild = expectOk(updateParentOnboardingDraft(initial, { childCount: 1 }));
    expect(expectOk(validateCompleteParentOnboardingDraft(oneChild)).children).toHaveLength(2);

    expect(
      updateParentOnboardingDraft(initial, {
        childCount: 3,
      } as never),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      updateParentOnboardingDraft(initial, {
        childIndex: 1,
        child: { gender: 'unknown' },
      } as never),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('creates and restores one immutable multi-child completion receipt', async () => {
    const access = new DeterministicSyntheticAccessService();
    const controller = createParentOnboardingController(access);
    expectOk(controller.requestVerification({ identifier: 'parent@example.com' }));
    expectOk(await controller.verifyCode(PARENT_VERIFICATION_CODE));
    const receipt = expectOk(controller.complete(NOW));

    expect(receipt.childCount).toBe(2);
    expect(receipt.children).toHaveLength(2);

    const restoredAccess = new DeterministicSyntheticAccessService();
    const restored = createParentOnboardingController(restoredAccess);
    expectOk(restored.restoreCompletionReceipt(receipt));
    expect(restored.getView()).toMatchObject({
      status: 'signed_out',
      canEnterParentExperience: false,
      completionReceipt: receipt,
    });
    expectOk(restored.requestVerification({ identifier: 'parent@example.com' }));
    expectOk(await restored.verifyCode(PARENT_VERIFICATION_CODE));
    expect(restored.complete(NOW)).toEqual({
      ok: true,
      data: receipt,
      meta: {
        origin: 'synthetic',
        fallbackUsed: false,
        fixtureId: 'parent_access_al_noor_v1',
      },
    });
  });

  it('restores an approved device marker without restoring a Child session', () => {
    const access = new DeterministicSyntheticAccessService();
    const parent = createParentOnboardingController(access);
    const childAccess = createChildAccessController(access, parent);
    expectOk(
      childAccess.restorePairedDevices({
        childIds: ['child_salem'],
        pairedAt: NOW,
      }),
    );

    expect(childAccess.getView()).toMatchObject({
      status: 'signed_out',
      canEnterChildExperience: false,
      pairedDevices: [{ childId: 'child_salem', status: 'paired' }],
    });
    expectOk(childAccess.selectProfile('child_salem'));
    expectOk(childAccess.verifyCredential('2468', NOW));
    expect(childAccess.getView()).toMatchObject({
      status: 'authenticated_child',
      canEnterChildExperience: true,
    });
  });
});
