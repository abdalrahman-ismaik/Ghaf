export interface EntryReplaceRouter {
  dismissAll: () => void;
  replace: (href: '/') => void;
}

const RESET_BOUNDARY_KEY = '__ghafResetBoundary';
const RESET_BOUNDARY = 'boundary';
const RESET_GUARD = 'guard';

let resetHistoryOwner: Window | null = null;
let resetHistoryListener: ((event: PopStateEvent) => void) | null = null;

function historyStateWithMarker(
  state: unknown,
  marker: typeof RESET_BOUNDARY | typeof RESET_GUARD,
): Record<string, unknown> {
  const base = state && typeof state === 'object' ? state : {};
  return { ...base, [RESET_BOUNDARY_KEY]: marker };
}

/**
 * Browsers do not expose an API that deletes earlier same-tab history. Keep a
 * marked root entry in front of pre-reset routes and restore its guard whenever
 * Back reaches the boundary. Post-reset navigation can still move normally,
 * but it cannot reveal a route from the cleared journey.
 */
function armWebResetHistoryBoundary(webWindow: Window): void {
  if (resetHistoryOwner !== webWindow || !resetHistoryListener) {
    if (resetHistoryOwner && resetHistoryListener) {
      resetHistoryOwner.removeEventListener('popstate', resetHistoryListener);
    }

    resetHistoryOwner = webWindow;
    resetHistoryListener = (event: PopStateEvent) => {
      const reachedMarkedBoundary =
        event.state &&
        typeof event.state === 'object' &&
        (event.state as Record<string, unknown>)[RESET_BOUNDARY_KEY] === RESET_BOUNDARY;
      // Expo Router can asynchronously replace history.state after navigation.
      // The root URL is the durable boundary even when its marker is stripped.
      if (reachedMarkedBoundary || webWindow.location.pathname === '/') {
        webWindow.history.pushState(historyStateWithMarker(event.state, RESET_GUARD), '', '/');
      }
    };
    webWindow.addEventListener('popstate', resetHistoryListener);
  }

  const boundaryState = historyStateWithMarker(webWindow.history.state, RESET_BOUNDARY);
  webWindow.history.replaceState(boundaryState, '', '/');
  webWindow.history.pushState(historyStateWithMarker(boundaryState, RESET_GUARD), '', '/');
}

/**
 * Router state is deliberately outside the prototype aggregate. Reset the
 * aggregate first, then collapse the visible stack and replace its root.
 */
export function replaceHistoryWithEntry(router: EntryReplaceRouter): void {
  try {
    router.dismissAll();
  } catch {
    // A root-only stack has nothing to dismiss; replace still establishes `/`.
  }
  router.replace('/');

  if (typeof window !== 'undefined') {
    window.requestAnimationFrame(() => armWebResetHistoryBoundary(window));
  }
}
