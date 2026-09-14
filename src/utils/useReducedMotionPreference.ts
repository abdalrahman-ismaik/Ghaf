import { useSyncExternalStore } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';

// Share one native subscription across buttons, sheets and loading indicators.
const listeners = new Set<() => void>();
let reducedMotion = true;
let active = true;
let revision = 0;
let stopObserving: (() => void) | undefined;

const getSnapshot = () => reducedMotion || !active;
const getServerSnapshot = () => true;
const notify = () => listeners.forEach((listener) => listener());

function refreshPreference() {
  const requestedRevision = ++revision;
  void AccessibilityInfo.isReduceMotionEnabled().then(
    (enabled) => {
      if (requestedRevision !== revision || listeners.size === 0) return;
      reducedMotion = enabled;
      notify();
    },
    () => {
      if (requestedRevision !== revision || listeners.size === 0) return;
      reducedMotion = true;
      notify();
    },
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    active = AppState.currentState === null || AppState.currentState === 'active';
    const preferenceSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        revision += 1;
        reducedMotion = enabled;
        notify();
      },
    );
    const appSubscription = AppState.addEventListener('change', (state) => {
      active = state === 'active';
      // Wait for a fresh query before restarting motion after a settings visit.
      if (active) {
        reducedMotion = true;
        refreshPreference();
      } else {
        revision += 1;
      }
      notify();
    });
    stopObserving = () => {
      preferenceSubscription?.remove();
      appSubscription.remove();
    };
    refreshPreference();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size !== 0) return;
    revision += 1;
    stopObserving?.();
    stopObserving = undefined;
    reducedMotion = true;
  };
}

// Unknown settings and background state use the same immediate, static presentation.
export function useReducedMotionPreference(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
