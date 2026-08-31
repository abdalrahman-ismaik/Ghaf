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

// Browsers cannot delete older history entries from the current tab. Keep a marked root
// before pre-reset routes and restore its guard when Back reaches the boundary.
// Later navigation still works but cannot reopen routes from the cleared journey.
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
      // Expo Router may replace history.state after navigation.
      // Use the root URL as a fallback boundary when the marker disappears.
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

// Router state stays outside the prototype store. Reset the store first, then clear
// the visible stack and replace its root.
export function replaceHistoryWithEntry(router: EntryReplaceRouter): void {
  try {
    router.dismissAll();
  } catch {
    // A stack already at root cannot be dismissed, but replace still restores `/`.
  }
  router.replace('/');

  if (typeof window !== 'undefined') {
    window.requestAnimationFrame(() => armWebResetHistoryBoundary(window));
  }
}
