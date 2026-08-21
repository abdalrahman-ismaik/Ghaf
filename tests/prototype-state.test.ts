import { beforeEach, describe, expect, it } from 'vitest';

import { coerceLocale, getLocaleDirection, type PrototypeSession } from '../src/models/prototype';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

function expectDocumentedResetState(session: PrototypeSession): void {
  expect(session.locale).toBe('ar');
  expect(session.role).toBe('parent');
  expect(session.mockMode).toBe(true);
  expect(session.family.id).toBe('family-ghaf-demo');
  expect(session.mission.id).toBe('mission-bread-rescue-demo');
  expect(session.mission.status).toBe('assigned');
  expect(session.mission.source).toBe('pregenerated-mock');
  expect(session.impact).toEqual({
    rescuedGrams: 1_250,
    rescuedPortions: 5,
    completedMissions: 3,
    streakDays: 2,
  });
  expect(session.ghaf).toMatchObject({
    stage: 2,
    progressPercent: 48,
    newMilestone: null,
  });
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
    expectDocumentedResetState(usePrototypeStore.getState());
    expect(usePrototypeStore.getState().direction).toBe('rtl');
  });

  it('changes role without replacing the shared mission or progress', () => {
    const initial = usePrototypeStore.getState();
    const initialMissionId = initial.mission.id;

    initial.setRole('child');

    expect(usePrototypeStore.getState()).toMatchObject({
      locale: 'ar',
      direction: 'rtl',
      role: 'child',
      mission: { id: initialMissionId },
      impact: initial.impact,
      ghaf: initial.ghaf,
    });

    usePrototypeStore.getState().switchRole();
    expect(usePrototypeStore.getState().role).toBe('parent');
    expect(usePrototypeStore.getState().mission.id).toBe(initialMissionId);
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
    expectDocumentedResetState(usePrototypeStore.getState());
    expect(usePrototypeStore.getState().direction).toBe('rtl');
  });

  it('restores the same documented state across five consecutive trials', () => {
    for (let trial = 0; trial < 5; trial += 1) {
      usePrototypeStore.getState().setLocale('en');
      usePrototypeStore.getState().setRole('child');
      usePrototypeStore.getState().resetDemo();

      expectDocumentedResetState(usePrototypeStore.getState());
      expect(usePrototypeStore.getState().direction).toBe('rtl');
    }
  });
});
