import { AccessibilityInfo, findNodeHandle, Platform } from 'react-native';

interface WebFocusTarget {
  focus?: (options?: { readonly preventScroll?: boolean }) => void;
}

export function focusAccessibilityTarget(target: unknown): boolean {
  if (target === null || target === undefined) return false;

  if (Platform.OS === 'web') {
    const webTarget = target as WebFocusTarget;
    if (typeof webTarget.focus !== 'function') return false;
    try {
      webTarget.focus({ preventScroll: true });
      return true;
    } catch {
      return false;
    }
  }

  try {
    const handle = findNodeHandle(target as Parameters<typeof findNodeHandle>[0]);
    if (handle === null) return false;
    AccessibilityInfo.setAccessibilityFocus(handle);
    return true;
  } catch {
    return false;
  }
}
