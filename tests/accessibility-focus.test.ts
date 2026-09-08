import { beforeEach, describe, expect, it, vi } from 'vitest';

import { focusAccessibilityTarget } from '../src/utils/accessibilityFocus';

const reactNative = vi.hoisted(() => ({
  platform: { OS: 'web' as 'android' | 'ios' | 'web' },
  setAccessibilityFocus: vi.fn(),
  findNodeHandle: vi.fn(),
}));

vi.mock('react-native', () => ({
  AccessibilityInfo: {
    setAccessibilityFocus: reactNative.setAccessibilityFocus,
  },
  findNodeHandle: reactNative.findNodeHandle,
  Platform: reactNative.platform,
}));

describe('cross-platform accessibility focus', () => {
  beforeEach(() => {
    reactNative.platform.OS = 'web';
    reactNative.findNodeHandle.mockReset();
    reactNative.setAccessibilityFocus.mockReset();
  });

  it('focuses the host element directly on web without resolving a native handle', () => {
    const focus = vi.fn();

    expect(focusAccessibilityTarget({ focus })).toBe(true);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(reactNative.findNodeHandle).not.toHaveBeenCalled();
    expect(reactNative.setAccessibilityFocus).not.toHaveBeenCalled();
  });

  it('safely skips web targets that are absent, not focusable, or reject focus', () => {
    expect(focusAccessibilityTarget(null)).toBe(false);
    expect(focusAccessibilityTarget({})).toBe(false);
    expect(
      focusAccessibilityTarget({
        focus: () => {
          throw new Error('detached host node');
        },
      }),
    ).toBe(false);
    expect(reactNative.findNodeHandle).not.toHaveBeenCalled();
  });

  it('retains native handle resolution and screen-reader focus', () => {
    reactNative.platform.OS = 'android';
    const target = {};
    reactNative.findNodeHandle.mockReturnValue(42);

    expect(focusAccessibilityTarget(target)).toBe(true);
    expect(reactNative.findNodeHandle).toHaveBeenCalledWith(target);
    expect(reactNative.setAccessibilityFocus).toHaveBeenCalledWith(42);
  });

  it('safely skips native targets whose handle cannot be resolved', () => {
    reactNative.platform.OS = 'ios';
    reactNative.findNodeHandle.mockReturnValue(null);

    expect(focusAccessibilityTarget({})).toBe(false);
    expect(reactNative.setAccessibilityFocus).not.toHaveBeenCalled();
  });
});
