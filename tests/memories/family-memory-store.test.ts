import { beforeEach, describe, expect, it, vi } from 'vitest';

import { serviceRegistry } from '../../src/services';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import {
  createCatalogSubmittedStateForTest,
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
  seedPrototypeStateForTest,
  taskPraiseForTest,
} from '../helpers/prototypeStore';

function ok<T>(result: { ok: true; data: T } | { ok: false; error: unknown }): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.data;
}
const state = () => usePrototypeStore.getState();
function confirmCatalog(template = 'GI01', childId: 'child_salem' | 'child_alya' = 'child_salem') {
  seedPrototypeStateForTest(createCatalogSubmittedStateForTest(template, { childId }));
  const journey = state().journey!;
  ok(
    state().confirmAndPresentPraise(
      {
        submissionId: journey.submission!.id,
        praise: taskPraiseForTest(journey),
        neutralObservation: null,
        uncertainty: {
          ar: 'تأكيد النشاط المتفق عليه.',
          en: 'Confirmation of the agreed activity.',
        },
      },
      {
        actionId: `praise:${journey.submission!.id}`,
        source: 'parent_press',
        presentedAt: '2026-09-14T14:00:00.000Z',
      },
    ),
  );
  const plan = state().confirmationPlan!;
  if (plan.renderState !== 'praise_presented') throw new Error('Expected Parent praise');
  ok(
    state().applyRecognition({
      actionId: `recognize:${journey.submission!.id}`,
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: plan.presentationActionId,
    }),
  );
}

beforeEach(async () => {
  vi.restoreAllMocks();
  ok(resetPrototypeForTest());
  await enterParentExperienceForTest();
});

describe('authorized completion to memory store flow', () => {
  it('saves the real committed completion once without changing progress or awards', () => {
    confirmCatalog();
    const before = state();
    const saved = ok(state().saveFamilyMemory());
    expect(ok(state().saveFamilyMemory())).toEqual(saved);
    expect(ok(state().getFamilyMemories())).toEqual([saved]);
    expect(state().localFamily.record!.studyInstanceId).toBeTruthy();
    expect(state().children).toEqual(before.children);
    expect(state().recognitionLedger).toEqual(before.recognitionLedger);
    expect(state().landscapeProgressByChild).toEqual(before.landscapeProgressByChild);
    expect(state().familyReward).toEqual(before.familyReward);
    expect(state().privateLeague).toEqual(before.privateLeague);
    ok(state().removeFamilyMemory(saved.id));
    expect(ok(state().getFamilyMemories())).toEqual([]);
    expect(state().saveFamilyMemory()).toEqual({ ok: false, error: { code: 'deleted' } });
    expect(state().children).toEqual(before.children);
  });

  it('keeps family history across role changes but projects only the active Child', async () => {
    confirmCatalog();
    const salem = ok(state().saveFamilyMemory());
    confirmCatalog('GI03', 'child_alya');
    const alya = ok(state().saveFamilyMemory());
    await enterChildExperienceForTest('child_salem');
    expect(ok(state().getFamilyMemories())).toEqual([salem]);
    expect(state().saveFamilyMemory().ok).toBe(false);
    expect(state().removeFamilyMemory(alya.id).ok).toBe(false);
    await enterChildExperienceForTest('child_alya');
    expect(ok(state().getFamilyMemories())).toEqual([alya]);
    ok(state().signOutExperience());
    expect(state().getFamilyMemories().ok).toBe(false);
    await enterParentExperienceForTest();
    expect(ok(state().getFamilyMemories())).toHaveLength(2);
  });

  it('excludes non-Green private/sensitive completions and unfinished work', () => {
    expect(state().saveFamilyMemory().ok).toBe(false);
    confirmCatalog('FA01');
    expect(state().saveFamilyMemory()).toEqual({ ok: false, error: { code: 'ineligible' } });
    expect(ok(state().getFamilyMemories())).toEqual([]);
  });

  it('does not report failed writes as saved and safely retries', () => {
    confirmCatalog();
    const save = vi
      .spyOn(serviceRegistry.familyMemories, 'save')
      .mockReturnValueOnce({ ok: false, error: { code: 'storage_write' } });
    expect(state().saveFamilyMemory().ok).toBe(false);
    expect(ok(state().getFamilyMemories())).toEqual([]);
    expect(state().saveFamilyMemory().ok).toBe(true);
    expect(ok(state().getFamilyMemories())).toHaveLength(1);
    save.mockRestore();
  });

  it('resets history and establishes a new family binding even with reused synthetic IDs', async () => {
    confirmCatalog();
    ok(state().saveFamilyMemory());
    const previous = state().localFamily.record!.studyInstanceId;
    ok(state().resetPrototype());
    await enterParentExperienceForTest();
    expect(ok(state().initializeFamilyMemories())).toEqual([]);
    expect(state().localFamily.record!.studyInstanceId).not.toBe(previous);
    expect(state().memoryRunId).toBeNull();
  });

  it('does not erase the family if memory clearing fails at reset entry', () => {
    confirmCatalog();
    ok(state().saveFamilyMemory());
    const family = state().localFamily.record;
    vi.spyOn(serviceRegistry.familyMemories, 'clear').mockReturnValueOnce({
      ok: false,
      error: { code: 'storage_clear' },
    });
    expect(state().resetPrototype().ok).toBe(false);
    expect(serviceRegistry.localFamily.read()).toMatchObject({ ok: true, data: family });
    expect(ok(state().getFamilyMemories())).toHaveLength(1);
  });

  it('denies a stale session after another client replaces the persisted family binding', () => {
    confirmCatalog();
    const saved = ok(state().saveFamilyMemory());
    const family = state().localFamily.record!;
    ok(
      serviceRegistry.localFamily.save({ ...family, studyInstanceId: 'study-replacement-family' }),
    );
    expect(state().getFamilyMemories()).toEqual({ ok: false, error: { code: 'family_mismatch' } });
    expect(state().saveFamilyMemory().ok).toBe(false);
    expect(state().removeFamilyMemory(saved.id).ok).toBe(false);
    ok(serviceRegistry.localFamily.save(family));
    expect(ok(state().getFamilyMemories())).toEqual([saved]);
  });

  it('restores memories if a later reset step fails while the same family remains', () => {
    confirmCatalog();
    const saved = ok(state().saveFamilyMemory());
    vi.spyOn(serviceRegistry.deviceAccess, 'clear').mockReturnValueOnce({
      ok: false,
      error: {
        code: 'INVALID_TRANSITION',
        message: 'Prepared access storage failure',
        retryable: false,
        fallbackAvailable: false,
      },
    });
    expect(state().resetPrototype().ok).toBe(false);
    expect(ok(state().getFamilyMemories())).toEqual([saved]);
  });
});
