import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface StoreBinding {
  subscribe: (notify: () => void) => () => void;
  getSnapshot: () => boolean;
  getServerSnapshot: () => boolean;
}

const native = vi.hoisted(() => ({
  binding: null as StoreBinding | null,
  currentState: 'active' as string | null,
  query: vi.fn<() => Promise<boolean>>(),
  preferenceListeners: new Set<(enabled: boolean) => void>(),
  appListeners: new Set<(state: string) => void>(),
  removePreference: vi.fn(),
  removeApp: vi.fn(),
}));

vi.mock('react', () => ({
  useSyncExternalStore: (
    subscribe: StoreBinding['subscribe'],
    getSnapshot: StoreBinding['getSnapshot'],
    getServerSnapshot: StoreBinding['getServerSnapshot'],
  ) => {
    native.binding = { subscribe, getSnapshot, getServerSnapshot };
    return getSnapshot();
  },
}));
vi.mock('react-native', () => ({
  AccessibilityInfo: {
    isReduceMotionEnabled: native.query,
    addEventListener: (_event: string, callback: (enabled: boolean) => void) => {
      native.preferenceListeners.add(callback);
      return {
        remove: () => {
          native.preferenceListeners.delete(callback);
          native.removePreference();
        },
      };
    },
  },
  AppState: {
    get currentState() {
      return native.currentState;
    },
    addEventListener: (_event: string, callback: (state: string) => void) => {
      native.appListeners.add(callback);
      return {
        remove: () => {
          native.appListeners.delete(callback);
          native.removeApp();
        },
      };
    },
  },
}));

let invokePreference: typeof import('@/utils/useReducedMotionPreference').useReducedMotionPreference;
const cleanups = new Set<() => void>();

function subscribe() {
  const initial = invokePreference();
  const binding = native.binding!;
  const notify = vi.fn();
  const unsubscribe = binding.subscribe(notify);
  const unmount = () => {
    if (!cleanups.delete(unmount)) return;
    unsubscribe();
  };
  cleanups.add(unmount);
  return { initial, read: binding.getSnapshot, server: binding.getServerSnapshot, notify, unmount };
}

function deferred() {
  let resolve!: (value: boolean) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<boolean>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function preference(enabled: boolean) {
  native.preferenceListeners.forEach((listener) => listener(enabled));
}

function appState(state: string) {
  native.currentState = state;
  native.appListeners.forEach((listener) => listener(state));
}

beforeEach(async () => {
  vi.resetModules();
  native.binding = null;
  native.currentState = 'active';
  native.preferenceListeners.clear();
  native.appListeners.clear();
  native.query.mockReset().mockResolvedValue(false);
  ({ useReducedMotionPreference: invokePreference } =
    await import('@/utils/useReducedMotionPreference'));
});

afterEach(() => {
  [...cleanups].forEach((cleanup) => cleanup());
});

// Exercise the production store through its hook binding, with explicit native events and promises.
// These checks establish subscription policy, not native animation or accessibility performance.
describe('live reduced-motion preference', () => {
  it('shares one pair of native listeners and starts static until the setting is known', async () => {
    const first = subscribe();
    const second = subscribe();

    expect(first.initial).toBe(true);
    expect(second.initial).toBe(true);
    expect(first.server()).toBe(true);
    expect(native.preferenceListeners.size).toBe(1);
    expect(native.appListeners.size).toBe(1);
    expect(native.query).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    expect(first.read()).toBe(false);
    expect(second.read()).toBe(false);
    expect(first.notify).toHaveBeenCalledOnce();
    expect(second.notify).toHaveBeenCalledOnce();

    first.unmount();
    expect(native.preferenceListeners.size).toBe(1);
    expect(native.removePreference).not.toHaveBeenCalled();
    second.unmount();
    expect(native.preferenceListeners.size).toBe(0);
    expect(native.appListeners.size).toBe(0);
    expect(native.removePreference).toHaveBeenCalledOnce();
    expect(native.removeApp).toHaveBeenCalledOnce();
  });

  it('updates every subscriber when the system preference changes during use', async () => {
    const first = subscribe();
    const second = subscribe();
    await Promise.resolve();
    preference(true);
    expect(first.read()).toBe(true);
    expect(second.read()).toBe(true);
    preference(false);
    expect(first.read()).toBe(false);
    expect(second.read()).toBe(false);
    expect(native.query).toHaveBeenCalledTimes(1);
  });

  it('does not overwrite a newer native preference event with an older initial read', async () => {
    const initial = deferred();
    native.query.mockReturnValue(initial.promise);
    const view = subscribe();
    preference(true);
    view.notify.mockClear();
    initial.resolve(false);
    await initial.promise;
    expect(view.read()).toBe(true);
    expect(view.notify).not.toHaveBeenCalled();
  });

  it('ignores pending reads after unmount, including after a new subscriber mounts', async () => {
    const previous = deferred();
    const current = deferred();
    native.query.mockReturnValueOnce(previous.promise).mockReturnValueOnce(current.promise);
    const oldView = subscribe();
    oldView.unmount();
    const newView = subscribe();
    previous.resolve(false);
    await previous.promise;
    expect(oldView.notify).not.toHaveBeenCalled();
    expect(newView.read()).toBe(true);
    expect(newView.notify).not.toHaveBeenCalled();

    current.resolve(false);
    await current.promise;
    expect(newView.read()).toBe(false);
    expect(newView.notify).toHaveBeenCalledOnce();
    expect(native.preferenceListeners.size).toBe(1);
    expect(native.appListeners.size).toBe(1);
  });

  it('uses a static state if the native setting cannot be read', async () => {
    native.query.mockRejectedValue(new Error('Setting unavailable'));
    const view = subscribe();
    await Promise.resolve();
    expect(view.read()).toBe(true);
    preference(false);
    expect(view.read()).toBe(false);
    appState('background');
    appState('active');
    await Promise.resolve();
    expect(view.read()).toBe(true);
  });

  it('stops motion in the background and waits for a fresh foreground preference', async () => {
    const resumed = deferred();
    native.query.mockResolvedValueOnce(false).mockReturnValueOnce(resumed.promise);
    const view = subscribe();
    await Promise.resolve();
    expect(view.read()).toBe(false);
    appState('background');
    expect(view.read()).toBe(true);
    preference(false);
    expect(view.read()).toBe(true);
    appState('active');
    expect(view.read()).toBe(true);
    expect(native.query).toHaveBeenCalledTimes(2);
    resumed.resolve(false);
    await resumed.promise;
    expect(view.read()).toBe(false);
  });

  it('keeps the latest foreground read when asynchronous responses arrive out of order', async () => {
    const previous = deferred();
    const current = deferred();
    native.query
      .mockResolvedValueOnce(false)
      .mockReturnValueOnce(previous.promise)
      .mockReturnValueOnce(current.promise);
    const view = subscribe();
    await Promise.resolve();
    appState('background');
    appState('active');
    appState('background');
    appState('active');
    current.resolve(false);
    await current.promise;
    expect(view.read()).toBe(false);
    view.notify.mockClear();
    previous.resolve(true);
    await previous.promise;
    expect(view.read()).toBe(false);
    expect(view.notify).not.toHaveBeenCalled();
  });

  it('invalidates an outstanding query when backgrounding before its response', async () => {
    const initial = deferred();
    native.query.mockReturnValue(initial.promise);
    const view = subscribe();
    appState('background');
    view.notify.mockClear();
    initial.resolve(false);
    await initial.promise;
    expect(view.read()).toBe(true);
    expect(view.notify).not.toHaveBeenCalled();
  });

  it('remains static when the first subscriber mounts in the background', async () => {
    native.currentState = 'background';
    const view = subscribe();
    await Promise.resolve();
    expect(view.read()).toBe(true);
  });
});
