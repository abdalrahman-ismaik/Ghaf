import { beforeEach, describe, expect, it, vi } from 'vitest';

import { focusAccessibilityTarget } from '../../src/utils/accessibilityFocus';

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

  it('makes a non-interactive web heading programmatically focusable before focusing it', () => {
    const ownerDocument: { activeElement: unknown } = { activeElement: {} };
    let tabIndexAttribute: string | null = null;
    const target = {
      focus: vi.fn(function (this: { getAttribute: (name: string) => string | null }) {
        if (this.getAttribute('tabindex') !== null) ownerDocument.activeElement = this;
      }),
      getAttribute: vi.fn(() => tabIndexAttribute),
      ownerDocument,
      tagName: 'H1',
    };
    Object.defineProperty(target, 'tabIndex', {
      configurable: true,
      get: () => (tabIndexAttribute === null ? -1 : Number(tabIndexAttribute)),
      set: (value: number) => {
        tabIndexAttribute = String(value);
      },
    });

    expect(focusAccessibilityTarget(target)).toBe(true);
    expect(tabIndexAttribute).toBe('-1');
    expect(target.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(ownerDocument.activeElement).toBe(target);
  });

  it('reports a silent web focus failure instead of suppressing a later retry', () => {
    const ownerDocument = { activeElement: {} };
    const target = {
      focus: vi.fn(),
      getAttribute: vi.fn(() => '-1'),
      ownerDocument,
      tabIndex: -1,
      tagName: 'H1',
    };

    expect(focusAccessibilityTarget(target)).toBe(false);
    expect(ownerDocument.activeElement).not.toBe(target);
  });

  it('preserves an existing web tab stop while verifying focus', () => {
    const ownerDocument: { activeElement: unknown } = { activeElement: {} };
    const target = {
      focus: vi.fn(function (this: object) {
        ownerDocument.activeElement = this;
      }),
      getAttribute: vi.fn(() => '0'),
      ownerDocument,
      tabIndex: 0,
      tagName: 'BUTTON',
    };

    expect(focusAccessibilityTarget(target)).toBe(true);
    expect(target.tabIndex).toBe(0);
    expect(ownerDocument.activeElement).toBe(target);
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
