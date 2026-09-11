import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import WelcomeScreen from '../app/index';
import { FirstRunOnboarding } from '@/components/onboarding';
import { Redirect } from 'expo-router';
import {
  selectCanEnterChildExperience,
  selectHasActiveParentExperience,
  usePrototypeStore,
} from '@/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from './helpers/prototypeStore';

vi.mock('expo-router', () => ({ Redirect: () => null, useRouter: () => ({ push: vi.fn() }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('react-native', () => ({
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: () => null,
}));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'prepared-entry-test' }));
vi.mock('@/components/access', () => ({ AccessScreen: () => null, PrototypePill: () => null }));
vi.mock('@/components/brand/GhafRasterLogo', () => ({ GhafRasterLogo: () => null }));
vi.mock('@/components/illustrations', () => ({ LocalIllustration: () => null }));
vi.mock('@/components/primitives', () => ({ Button: () => null, Text: () => null }));
vi.mock('@/components/onboarding', () => ({
  FirstRunOnboarding: () => null,
  useFirstRunExperience: () => ({ state: { completed: false, step: 'intro' } }),
}));
vi.mock('@/state/usePrototypeStore', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/state/usePrototypeStore')>();
  return {
    ...original,
    usePrototypeStore: Object.assign(
      (selector: (state: ReturnType<typeof original.usePrototypeStore.getState>) => unknown) =>
        selector(original.usePrototypeStore.getState()),
      original.usePrototypeStore,
    ),
  };
});

function expectDestination(path: string) {
  const screen = WelcomeScreen() as ReactElement<{ href: string }>;
  expect(screen.type).toBe(Redirect);
  expect(screen.props.href).toBe(path);
}

beforeEach(() => {
  expect(resetPrototypeForTest().ok).toBe(true);
});

describe('temporary Parent entry with a fresh first-run presentation', () => {
  it('opens existing Parent sign-in after a valid Child handoff without granting Parent access', async () => {
    await enterChildExperienceForTest();
    const affinity = usePrototypeStore.getState().deviceAccess.record;
    expect(usePrototypeStore.getState().beginTemporaryParentAccess().ok).toBe(true);

    expectDestination('/access/parent/sign-in');
    expect(selectCanEnterChildExperience(usePrototypeStore.getState())).toBe(false);
    expect(selectHasActiveParentExperience(usePrototypeStore.getState())).toBe(false);
    expect(usePrototypeStore.getState().deviceAccess.record).toEqual(affinity);
  });

  it('keeps ordinary signed-out entry and a rejected handoff on the introduction', () => {
    expect(usePrototypeStore.getState().beginTemporaryParentAccess().ok).toBe(false);
    expect(WelcomeScreen().type).toBe(FirstRunOnboarding);
  });

  it('returns to the paired Child after cancellation, without replaying the introduction', async () => {
    await enterChildExperienceForTest();
    expect(usePrototypeStore.getState().beginTemporaryParentAccess().ok).toBe(true);
    expect(usePrototypeStore.getState().cancelTemporaryParentAccess().ok).toBe(true);
    expectDestination('/child');
  });

  it('shows the introduction after reset clears a pending handoff', async () => {
    await enterChildExperienceForTest();
    expect(usePrototypeStore.getState().beginTemporaryParentAccess().ok).toBe(true);
    expect(resetPrototypeForTest().ok).toBe(true);
    expect(usePrototypeStore.getState().temporaryParentAccess).toBeNull();
    expect(WelcomeScreen().type).toBe(FirstRunOnboarding);
  });

  it('preserves the authenticated Parent redirect', async () => {
    await enterParentExperienceForTest();
    expectDestination('/parent');
  });
});
