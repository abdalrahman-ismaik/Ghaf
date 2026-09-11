import { AccessibilityInfo, findNodeHandle, Platform } from 'react-native';

interface WebFocusTarget {
  focus?: (options?: { readonly preventScroll?: boolean }) => void;
  getAttribute?: (name: string) => string | null;
  isContentEditable?: boolean;
  ownerDocument?: { readonly activeElement?: unknown };
  tabIndex?: number;
  tagName?: string;
}

export function focusAccessibilityTarget(target: unknown): boolean {
  if (target === null || target === undefined) return false;

  if (Platform.OS === 'web') {
    const webTarget = target as WebFocusTarget;
    if (typeof webTarget.focus !== 'function') return false;
    try {
      const needsProgrammaticTabStop =
        typeof webTarget.getAttribute === 'function' &&
        typeof webTarget.tabIndex === 'number' &&
        webTarget.tabIndex < 0 &&
        webTarget.getAttribute('tabindex') === null &&
        webTarget.tagName?.toUpperCase() !== 'BODY' &&
        webTarget.isContentEditable !== true;
      if (needsProgrammaticTabStop) webTarget.tabIndex = -1;

      webTarget.focus({ preventScroll: true });
      const ownerDocument = webTarget.ownerDocument;
      return ownerDocument && 'activeElement' in ownerDocument
        ? ownerDocument.activeElement === target
        : true;
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
