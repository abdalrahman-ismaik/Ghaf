import { afterEach, describe, expect, it, vi } from 'vitest';
import { StackActions, StackRouter } from 'expo-router/build/react-navigation/routers/StackRouter';

import { synchronizeWebDocumentLocale } from '../src/i18n';
import { prepareEntryReset, type EntryResetState } from '../src/utils/navigation';

// Exercise the reducer bundled with the pinned Expo Router; no internal import enters runtime code.
const appStack = StackRouter({ initialRouteName: 'index' });
const appOptions = {
  routeNames: ['index', 'parent'],
  routeParamList: {},
  routeGetIdList: {},
};
const outerStack = StackRouter({ initialRouteName: 'fixture-shell' });
const outerOptions = {
  routeNames: ['fixture-shell'],
  routeParamList: {},
  routeGetIdList: {},
};

function outerState(appState: ReturnType<typeof appStack.getInitialState>) {
  const outer = outerStack.getInitialState(outerOptions);
  return { ...outer, routes: [{ ...outer.routes[0]!, state: appState }] };
}

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

  it.each(['root-only', 'dismissible', 'entry-absent', 'collapsed-after-prepare'] as const)(
    'resets %s history to the sole entry using the installed reducer',
    (scenario) => {
      vi.stubGlobal('window', undefined);
      const entry = appStack.getInitialState(appOptions);
      const history = appStack.getRehydratedState(
        appStack.getStateForAction(entry, StackActions.push('parent'), appOptions)!,
        appOptions,
      );
      const prior =
        scenario === 'root-only'
          ? entry
          : scenario === 'entry-absent'
            ? { ...history, index: 0, routes: [history.routes[1]!] }
            : history;
      let mounted = outerState(prior);
      const navigation = {
        getRootState: () => mounted,
        resetRoot: vi.fn((payload: EntryResetState) => {
          const result = outerStack.getStateForAction(
            mounted,
            { type: 'RESET', payload },
            outerOptions,
          );
          expect(result).not.toBeNull();
          expect(result?.routes.map((route) => route.name)).toEqual(['fixture-shell']);
          expect(result?.routes[0]?.state).toEqual(payload.routes[0].state);
          const restored = appStack.getRehydratedState(payload.routes[0].state, appOptions);
          expect(restored.index).toBe(0);
          expect(restored.routes.map((route) => route.name)).toEqual(['index']);
          expect(restored.routes[0]?.params).toBeUndefined();
        }),
      };

      const reset = prepareEntryReset(navigation);
      expect(reset).not.toBeNull();
      expect(navigation.resetRoot).not.toHaveBeenCalled();
      if (scenario === 'collapsed-after-prepare') mounted = outerState(entry);
      reset?.();

      expect(navigation.resetRoot).toHaveBeenCalledExactlyOnceWith({
        index: 0,
        routes: [{ name: 'fixture-shell', state: { index: 0, routes: [{ name: 'index' }] } }],
      });
    },
  );

  it.each([
    undefined,
    { index: 0, routes: [{ name: 'fixture-shell' }] },
    {
      index: 0,
      routes: [{ name: 'fixture-shell', state: { type: 'stack', routeNames: ['parent'] } }],
    },
  ])('declines an unavailable entry boundary before any navigation mutation', (state) => {
    const navigation = { getRootState: () => state, resetRoot: vi.fn() };
    expect(prepareEntryReset(navigation)).toBeNull();
    expect(navigation.resetRoot).not.toHaveBeenCalled();
  });

  it('does not install browser history handlers on a non-browser window', () => {
    const requestAnimationFrame = vi.fn();
    vi.stubGlobal('window', { requestAnimationFrame });
    const navigation = {
      getRootState: () => outerState(appStack.getInitialState(appOptions)),
      resetRoot: vi.fn(),
    };
    prepareEntryReset(navigation)?.();
    expect(navigation.resetRoot).toHaveBeenCalledOnce();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('replaces the visible route and traps Back at a reset root boundary', () => {
    const animationFrames: FrameRequestCallback[] = [];
    const popstateListeners: ((event: PopStateEvent) => void)[] = [];
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

    const navigation = {
      getRootState: () => outerState(appStack.getInitialState(appOptions)),
      resetRoot: vi.fn(),
    };

    prepareEntryReset(navigation)?.();

    expect(navigation.resetRoot).toHaveBeenCalledOnce();
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
