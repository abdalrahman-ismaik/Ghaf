import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePrototypeStore } from '../src/state/usePrototypeStore';
import { serviceRegistry, type AIService } from '../src/services';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('complete deterministic mock journey', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetDemo();
  });

  it('completes input-to-growth offline, awards once, and resets exactly', async () => {
    const fetchSpy = vi.fn(() => Promise.reject(new Error('Network is disabled')));
    vi.stubGlobal('fetch', fetchSpy);

    const [foodImages, voiceNotes, evidenceImages, narrations] = await Promise.all([
      serviceRegistry.media.listPrepared('food-image'),
      serviceRegistry.media.listPrepared('family-voice-note'),
      serviceRegistry.media.listPrepared('evidence-image'),
      serviceRegistry.media.listPrepared('narration'),
    ]);
    expect(foodImages).toMatchObject({
      ok: true,
      data: [{ id: 'food-rescue-bread', origin: 'prepared' }],
      meta: { origin: 'prepared', fallbackUsed: false },
    });
    expect(voiceNotes.ok && voiceNotes.data.map((item) => item.id)).toEqual([
      'family-wisdom-ar',
      'family-wisdom-en',
    ]);
    expect(evidenceImages).toMatchObject({ ok: true, data: [{ id: 'child-evidence' }] });
    expect(narrations.ok && narrations.data.map((item) => item.id)).toEqual([
      'mission-narration-ar',
      'mission-narration-en',
    ]);

    const unavailableProvider: AIService = {
      generateMission: async () => ({
        ok: false,
        error: {
          code: 'REMOTE_UNAVAILABLE',
          message: 'Network provider unavailable in offline rehearsal',
          retryable: true,
          fallbackAvailable: true,
        },
      }),
    };

    usePrototypeStore.getState().applyDemoInput();
    expect(usePrototypeStore.getState().startGeneration()).toMatchObject({ ok: true });
    const generated = await usePrototypeStore.getState().completeGeneration(unavailableProvider);
    expect(generated).toMatchObject({
      ok: true,
      data: { status: 'parent-review', origin: 'pregenerated-mock' },
      meta: { origin: 'pregenerated-mock', fallbackUsed: true },
    });
    expect(usePrototypeStore.getState().missionInput).toMatchObject({
      childId: 'child-salem-demo',
      foodImageId: 'food-rescue-bread',
      voiceNoteId: 'family-wisdom-ar',
      quantity: { value: 250, unit: 'grams' },
    });
    expect(fetchSpy).not.toHaveBeenCalled();

    expect(usePrototypeStore.getState().approveMission()).toMatchObject({ ok: true });
    usePrototypeStore.getState().setRole('child');
    expect(usePrototypeStore.getState().openChildMission()).toMatchObject({ ok: true });

    const mission = usePrototypeStore.getState().activeMission;
    if (!mission) throw new Error('Expected active mission');
    for (const step of mission.steps) {
      usePrototypeStore.getState().setStepCompleted(step.id, true);
    }
    usePrototypeStore.getState().choosePreparedEvidence();
    usePrototypeStore
      .getState()
      .setReflection('I learned that saving bread respects our blessings.');
    expect(usePrototypeStore.getState().submitForConfirmation()).toMatchObject({ ok: true });

    const beforeApproval = usePrototypeStore.getState();
    expect(beforeApproval.impactSummary.rescuedGrams).toBe(1_250);
    expect(beforeApproval.ghaf.progressPercent).toBe(48);

    usePrototypeStore.getState().setRole('parent');
    expect(
      usePrototypeStore.getState().approveCompletion({ value: 250, unit: 'grams' }),
    ).toMatchObject({ ok: true, data: { alreadyApplied: false } });
    expect(
      usePrototypeStore.getState().approveCompletion({ value: 250, unit: 'grams' }),
    ).toMatchObject({ ok: true, data: { alreadyApplied: true } });

    expect(usePrototypeStore.getState()).toMatchObject({
      journeyStatus: 'completed',
      impactSummary: { rescuedGrams: 1_500, completedMissions: 4 },
      ghaf: { stage: 3, progressPercent: 60 },
    });

    usePrototypeStore.getState().resetDemo();
    expect(usePrototypeStore.getState()).toMatchObject({
      locale: 'ar',
      role: 'parent',
      journeyStatus: 'draft-input',
      activeMission: null,
      submission: null,
      confirmation: null,
      celebration: null,
      impactSummary: { rescuedGrams: 1_250, completedMissions: 3 },
      ghaf: { stage: 2, progressPercent: 48 },
    });
  });
});
