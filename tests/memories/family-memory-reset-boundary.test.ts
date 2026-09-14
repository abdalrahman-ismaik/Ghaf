import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PARENT_VERIFICATION_CODE } from '../../src/features/access';
import { serviceRegistry } from '../../src/services';
import { createResetSourceSession } from '../../src/services/mock/fixtures';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import {
  enterParentExperienceForTest,
  resetPrototypeForTest,
  seedPrototypeStateForTest,
} from '../helpers/prototypeStore';

function ok<T>(result: { ok: true; data: T } | { ok: false; error: unknown }): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.data;
}

const state = () => usePrototypeStore.getState();

beforeEach(async () => {
  vi.restoreAllMocks();
  ok(resetPrototypeForTest());
  await enterParentExperienceForTest();
  seedPrototypeStateForTest(createResetSourceSession('recognized'));
  ok(state().saveFamilyMemory());
  expect(serviceRegistry.onboardingCompletion.complete().ok).toBe(true);
});

describe('single verified clear for new reset records', () => {
  it('preserves a newer saved family and its memories when an outdated Parent session resets', () => {
    const originalFamily = state().localFamily.record!;
    const originalMemories = ok(
      serviceRegistry.familyMemories.load(`memory:${originalFamily.studyInstanceId}`),
    );
    const replacement = {
      ...originalFamily,
      familyName: 'Another synthetic family',
      parent: { ...originalFamily.parent, normalizedIdentifier: 'another-parent@example.com' },
      studyInstanceId: `${originalFamily.studyInstanceId}-replacement`,
    };
    const replacementKey = `memory:${replacement.studyInstanceId}`;
    const replacementMemories = {
      ...originalMemories,
      familyKey: replacementKey,
      memories: originalMemories.memories.map((memory) => ({
        ...memory,
        familyKey: replacementKey,
      })),
    };
    ok(serviceRegistry.localFamily.save(replacement));
    ok(serviceRegistry.familyMemories.clear());
    ok(serviceRegistry.familyMemories.save(replacementMemories));
    const clearMemories = vi.spyOn(serviceRegistry.familyMemories, 'clear');
    const clearFamily = vi.spyOn(serviceRegistry.localFamily, 'clear');
    const clearOnboarding = vi.spyOn(serviceRegistry.onboardingCompletion, 'clear');
    try {
      expect(state().resetPrototype()).toMatchObject({
        ok: false,
        error: { code: 'INVALID_TRANSITION' },
      });
      expect(clearMemories).not.toHaveBeenCalled();
      expect(clearFamily).not.toHaveBeenCalled();
      expect(clearOnboarding).not.toHaveBeenCalled();
      expect(serviceRegistry.localFamily.read()).toEqual({ ok: true, data: replacement });
      expect(ok(serviceRegistry.familyMemories.load(replacementKey))).toEqual(replacementMemories);
      expect(serviceRegistry.onboardingCompletion.read()).toEqual({ ok: true, completed: true });
    } finally {
      clearMemories.mockRestore();
      clearFamily.mockRestore();
      clearOnboarding.mockRestore();
      ok(serviceRegistry.localFamily.save(originalFamily));
      ok(serviceRegistry.familyMemories.clear());
      ok(serviceRegistry.familyMemories.save(originalMemories));
    }
  });

  it('does not clear memories again after the first verified clear and family removal', () => {
    const clear = serviceRegistry.familyMemories.clear;
    const operation = vi
      .spyOn(serviceRegistry.familyMemories, 'clear')
      .mockImplementationOnce(clear)
      .mockReturnValueOnce({ ok: false, error: { code: 'storage_clear' } });

    expect(state().resetPrototype().ok).toBe(true);
    expect(operation).toHaveBeenCalledTimes(1);
    expect(serviceRegistry.localFamily.read()).toEqual({ ok: true, data: null });
    expect(state().activeExperience).toBe('signed_out');
  });

  it('does not clear onboarding completion again after its verified clear', () => {
    const clear = serviceRegistry.onboardingCompletion.clear;
    const operation = vi
      .spyOn(serviceRegistry.onboardingCompletion, 'clear')
      .mockImplementationOnce(clear)
      .mockReturnValueOnce({ ok: false, error: 'clear' });

    expect(state().resetPrototype().ok).toBe(true);
    expect(operation).toHaveBeenCalledTimes(1);
    expect(serviceRegistry.onboardingCompletion.read()).toEqual({ ok: true, completed: false });
    expect(state().activeExperience).toBe('signed_out');
  });

  it.each(['verification_failure', 'cancel_before_complete'] as const)(
    'restores previous memories when replacement deletion is followed by %s',
    async (fault) => {
      const family = state().localFamily.record!;
      const memoryCollection = ok(
        serviceRegistry.familyMemories.load(`memory:${family.studyInstanceId}`),
      );
      ok(state().signOutExperience());
      ok(
        state().requestFamilyReplacementVerification({
          identifier: 'new-parent@example.com',
          networkAvailable: false,
        }),
      );
      ok(await state().verifyParentCode(PARENT_VERIFICATION_CODE));
      ok(state().beginVerifiedFamilyReplacement());
      ok(
        state().updateParentOnboardingDraft({
          familyConnections: {
            primaryGuardianName: 'New Parent',
            secondaryGuardianName: '',
            relatives: [],
          },
          familyName: 'New Family',
          childCount: 1,
          childIndex: 0,
          child: { nickname: 'New Child' },
        }),
      );
      const clear = serviceRegistry.familyMemories.clear;
      vi.spyOn(serviceRegistry.familyMemories, 'clear').mockImplementationOnce(() => {
        const cleared = clear();
        expect(cleared.ok).toBe(true);
        if (fault === 'cancel_before_complete') {
          ok(state().cancelParentVerification());
          return cleared;
        }
        return { ok: false, error: { code: 'storage_clear' } };
      });

      expect(state().completeParentOnboarding().ok).toBe(false);
      expect(serviceRegistry.localFamily.read()).toEqual({ ok: true, data: family });
      expect(ok(serviceRegistry.familyMemories.load(`memory:${family.studyInstanceId}`))).toEqual(
        memoryCollection,
      );
    },
  );
});
