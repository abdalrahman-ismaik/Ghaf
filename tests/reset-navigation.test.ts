import { afterEach, describe, expect, it, vi } from 'vitest';

import { synchronizeWebDocumentLocale } from '../src/i18n';
import { replaceHistoryWithEntry } from '../src/utils/navigation';

describe('mounted reset locale and history boundary', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('synchronizes the web document language and direction with the canonical locale', () => {
    const documentElement = { dir: 'ltr', lang: 'en' };

    synchronizeWebDocumentLocale('ar', documentElement);
    expect(documentElement).toEqual({ dir: 'rtl', lang: 'ar' });

    synchronizeWebDocumentLocale('en', documentElement);
    expect(documentElement).toEqual({ dir: 'ltr', lang: 'en' });
  });

  it('replaces the visible route and traps Back at a reset root boundary', () => {
    const animationFrames: FrameRequestCallback[] = [];
    const popstateListeners: Array<(event: PopStateEvent) => void> = [];
    const historyState: { current: Record<string, unknown> } = {
      current: { expoRouterIndex: 7 },
    };
    const history = {
      get state() {
        return historyState.current;
      },
      pushState: vi.fn((state: Record<string, unknown>) => {
        historyState.current = state;
      }),
      replaceState: vi.fn((state: Record<string, unknown>) => {
        historyState.current = state;
      }),
    };
    const fakeWindow = {
      addEventListener: vi.fn((type: string, listener: (event: PopStateEvent) => void) => {
        if (type === 'popstate') popstateListeners.push(listener);
      }),
      history,
      location: { pathname: '/' },
      requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        animationFrames.push(callback);
        return animationFrames.length;
      }),
    };
    vi.stubGlobal('window', fakeWindow);

    const router = {
      dismissAll: vi.fn(),
      replace: vi.fn(),
    };

    replaceHistoryWithEntry(router);

    expect(router.dismissAll).toHaveBeenCalledOnce();
    expect(router.replace).toHaveBeenCalledWith('/');
    expect(animationFrames).toHaveLength(1);

    animationFrames[0]?.(0);

    expect(history.replaceState).toHaveBeenCalledWith(
      expect.objectContaining({ __ghafResetBoundary: 'boundary', expoRouterIndex: 7 }),
      '',
      '/',
    );
    expect(history.pushState).toHaveBeenCalledWith(
      expect.objectContaining({ __ghafResetBoundary: 'guard', expoRouterIndex: 7 }),
      '',
      '/',
    );
    expect(popstateListeners).toHaveLength(1);

    const boundaryState = history.replaceState.mock.calls[0]?.[0] as Record<string, unknown>;
    popstateListeners[0]?.({ state: boundaryState } as PopStateEvent);

    expect(history.pushState).toHaveBeenCalledTimes(2);
    expect(history.pushState).toHaveBeenLastCalledWith(
      expect.objectContaining({ __ghafResetBoundary: 'guard' }),
      '',
      '/',
    );

    // Expo Router can replace our marker after reset.
    // Back at the reset root must remain blocked in that case.
    history.replaceState({ id: 'expo-router-root' });
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      popstateListeners[0]?.({ state: { id: `expo-router-root-${attempt}` } } as PopStateEvent);
    }
    expect(history.pushState).toHaveBeenCalledTimes(5);

    // Back still works for routes opened after reset.
    fakeWindow.location.pathname = '/role';
    popstateListeners[0]?.({ state: { id: 'post-reset-role' } } as PopStateEvent);
    expect(history.pushState).toHaveBeenCalledTimes(5);
  });
});
