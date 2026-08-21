import { beforeEach, describe, expect, it } from 'vitest';

import { coerceLocale, getLocaleDirection } from '../src/models/prototype';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

function expectDocumentedResetState(): void {
  const session = usePrototypeStore.getState();

  expect(session).toMatchObject({
    locale: 'ar',
    direction: 'rtl',
    role: 'parent',
    mode: 'mock',
    mockMode: true,
    journeyStatus: 'draft-input',
    activeMission: null,
    submission: null,
    confirmation: null,
    celebration: null,
    impactSummary: {
      rescuedGrams: 1_250,
      rescuedPortions: 5,
      completedMissions: 3,
      streakDays: 2,
    },
    ghaf: {
      stage: 2,
      progressPercent: 48,
      progressPoints: 48,
      unlockedMilestoneIds: ['sapling'],
      newMilestone: null,
    },
  });
  expect(session.missionInput).toMatchObject({
    childId: null,
    foodImageId: null,
    voiceNoteId: null,
    quantity: null,
    availableMinutes: 15,
    reward: null,
  });
  expect(session.submissionDraft).toEqual({
    evidenceMediaId: null,
    parentConfirmationRequested: false,
    reflection: '',
  });
  expect(session.sessionImpactRecords).toEqual([]);
  expect(session.generation).toBeNull();
  expect(session.lastError).toBeNull();
}

describe('locale handling', () => {
  it('coerces supported locale variants and falls back to Arabic', () => {
    expect(coerceLocale('en')).toBe('en');
    expect(coerceLocale('en-US')).toBe('en');
    expect(coerceLocale('AR_ae')).toBe('ar');
    expect(coerceLocale(undefined)).toBe('ar');
    expect(coerceLocale(null)).toBe('ar');
    expect(coerceLocale('fr')).toBe('ar');
    expect(coerceLocale({ code: 'en' })).toBe('ar');
  });

  it('derives direction from the coerced locale', () => {
    expect(getLocaleDirection('ar')).toBe('rtl');
    expect(getLocaleDirection('en')).toBe('ltr');
    expect(getLocaleDirection('malformed')).toBe('rtl');
  });
});

describe('prototype store', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetDemo();
  });

  it('starts from the exact documented Arabic-first session', () => {
    expectDocumentedResetState();
  });

  it('changes role without replacing the shared mission or progress', () => {
    const initial = usePrototypeStore.getState();
    initial.applyDemoInput();

    initial.setRole('child');

    expect(usePrototypeStore.getState()).toMatchObject({
      locale: 'ar',
      direction: 'rtl',
      role: 'child',
      missionInput: { childId: 'child-salem-demo' },
      impactSummary: initial.impactSummary,
      ghaf: initial.ghaf,
    });

    usePrototypeStore.getState().switchRole();
    expect(usePrototypeStore.getState().role).toBe('parent');
    expect(usePrototypeStore.getState().missionInput.childId).toBe('child-salem-demo');
  });

  it('coerces malformed locale updates and resets every mutable field', () => {
    const store = usePrototypeStore.getState();
    store.setLocale('en-US');
    store.setRole('child');

    expect(usePrototypeStore.getState()).toMatchObject({
      locale: 'en',
      direction: 'ltr',
      role: 'child',
    });

    usePrototypeStore.getState().setLocale('not-a-locale');
    expect(usePrototypeStore.getState()).toMatchObject({ locale: 'ar', direction: 'rtl' });

    usePrototypeStore.getState().resetDemo();
    expectDocumentedResetState();
  });

  it('cancels only the active generation attempt and preserves the completed draft', () => {
    const store = usePrototypeStore.getState();
    store.applyDemoInput();
    const started = store.startGeneration();
    if (!started.ok) throw new Error('Expected generation to start');

    expect(usePrototypeStore.getState().cancelGeneration('stale-attempt')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().journeyStatus).toBe('generating');

    expect(usePrototypeStore.getState().cancelGeneration(started.data)).toMatchObject({
      ok: true,
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      journeyStatus: 'draft-input',
      missionInput: {
        childId: 'child-salem-demo',
        foodImageId: 'food-rescue-bread',
        voiceNoteId: 'family-wisdom-ar',
        quantity: { value: 250, unit: 'grams' },
      },
      activeMission: null,
      generation: null,
      lastError: null,
    });

    expect(usePrototypeStore.getState().startGeneration()).toMatchObject({ ok: true });
  });

  it.each([
    'draft-input',
    'generating',
    'parent-review',
    'awaiting-parent-confirmation',
    'completed',
  ] as const)('atomically restores the baseline from %s', (journeyStatus) => {
    usePrototypeStore.setState({
      journeyStatus,
      locale: 'en',
      direction: 'ltr',
      role: 'child',
      lastError: {
        code: 'REMOTE_UNAVAILABLE',
        message: 'Synthetic test error',
        retryable: true,
        fallbackAvailable: true,
      },
    });

    usePrototypeStore.getState().resetDemo();

    expectDocumentedResetState();
  });
});
