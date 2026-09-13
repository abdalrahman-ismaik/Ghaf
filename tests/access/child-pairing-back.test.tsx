import { createRequire } from 'node:module';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PairChildDeviceScreen from '../../app/access/child/pair';
import { usePrototypeStore, type PrototypeStoreState } from '../../src/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from '../helpers/prototypeStore';

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup(node: ReactNode): string;
};

const screen = vi.hoisted(() => ({
  back: null as (() => void) | null,
  replace: vi.fn(),
}));

vi.mock('@/state/usePrototypeStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/state/usePrototypeStore')>();
  return {
    ...actual,
    // Server rendering reads the current real store; all actions retain their real controllers.
    usePrototypeStore: Object.assign(
      (selector: (state: PrototypeStoreState) => unknown) =>
        selector(actual.usePrototypeStore.getState()),
      actual.usePrototypeStore,
    ),
  };
});

vi.mock('expo-router', () => ({
  Redirect: () => null,
  useRouter: () => ({ replace: screen.replace }),
}));

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-native', async () => {
  const { createElement } = await import('react');
  return {
    Platform: { select: (options: Record<string, unknown>) => options.default },
    StyleSheet: { create: (styles: unknown) => styles },
    View: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
  };
});

vi.mock('@/components/access', async () => {
  const { createElement } = await import('react');
  return {
    AccessHeader: ({ onBack }: { onBack: () => void }) => {
      screen.back = onBack;
      return null;
    },
    AccessScreen: ({ children, header }: { children?: ReactNode; header?: ReactNode }) =>
      createElement('section', null, header, children),
    BotanicalAvatar: () => null,
  };
});

vi.mock('@/components/primitives', async () => {
  const { createElement } = await import('react');
  const content = ({ children }: { children?: ReactNode }) => createElement('span', null, children);
  return { Text: content, PrimaryButton: content, SecondaryButton: content };
});

vi.mock('@/components/r003', async () => {
  const { createElement } = await import('react');
  const content = ({ children }: { children?: ReactNode }) => createElement('div', null, children);
  return { R003Hero: content, R003Section: content, R003Status: content };
});

function expectOk(result: { readonly ok: boolean }) {
  expect(result.ok).toBe(true);
}

function pairingBack(): () => void {
  screen.back = null;
  renderToStaticMarkup(createElement(PairChildDeviceScreen));
  if (!screen.back) throw new Error('Expected the actual pairing header Back callback');
  return screen.back;
}

describe('Child pairing Back navigation', () => {
  beforeEach(async () => {
    expectOk(resetPrototypeForTest());
    await enterParentExperienceForTest();
    expectOk(usePrototypeStore.getState().signOutExperience());
    expectOk(usePrototypeStore.getState().selectChildAccessProfile('child_salem'));
    expectOk(usePrototypeStore.getState().verifyChildCredential('2468'));
  });

  it.each(['credential_verified', 'pairing_pending'] as const)(
    'restores credential entry from %s so the same correct PIN works again',
    (status) => {
      if (status === 'pairing_pending')
        expectOk(usePrototypeStore.getState().requestChildPairing());
      expect(usePrototypeStore.getState().childAccess.status).toBe(status);

      pairingBack()();

      expect(usePrototypeStore.getState().childAccess).toMatchObject({
        status: 'profile_selected',
        selectedChildId: 'child_salem',
        pairingRequest: null,
        canEnterChildExperience: false,
      });
      expect(screen.replace).toHaveBeenCalledExactlyOnceWith('/access/child/pin');
      expectOk(usePrototypeStore.getState().verifyChildCredential('2468'));
      expect(usePrototypeStore.getState().childAccess.status).toBe('credential_verified');
      expectOk(usePrototypeStore.getState().requestChildPairing());
      expect(usePrototypeStore.getState().childAccess.status).toBe('pairing_pending');
    },
  );

  it('does not navigate or weaken an already authenticated Child when Back is rejected', async () => {
    await enterChildExperienceForTest('child_salem');
    const childAccess = usePrototypeStore.getState().childAccess;

    pairingBack()();

    expect(screen.replace).not.toHaveBeenCalled();
    expect(usePrototypeStore.getState().childAccess).toBe(childAccess);
    expectOk(usePrototypeStore.getState().authorizeChildExperience());
  });
});
