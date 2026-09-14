import { useIsFocused } from 'expo-router';
import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

function subscribe(notify: () => void) {
  const subscription = AppState.addEventListener('change', notify);
  return () => subscription?.remove();
}

function getSnapshot() {
  return AppState.currentState === 'active';
}

function getServerSnapshot() {
  return false;
}

export function useOnboardingForeground(): boolean {
  const focused = useIsFocused();
  // React Native Web maps AppState changes to document visibility changes.
  const foreground = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return focused && foreground;
}
