import { describe, expect, it, vi } from 'vitest';

import { createValidatedBackHandler } from '@/features/navigation/r002bBack';

describe('R002b validated Back navigation', () => {
  it('uses the live guarded stack so nested route state, scroll, and focus remain mounted', () => {
    const goBack = vi.fn();
    const replace = vi.fn();
    const onBack = createValidatedBackHandler({
      back: {
        restored: true,
        href: '/garden',
        focusTarget: 'r002b-garden-path-action',
        scrollOffset: 420,
        filter: null,
      },
      profileId: 'child_salem',
      safeRoot: '/child',
      canGoBack: () => true,
      goBack,
      replace,
    });

    onBack();

    expect(goBack).toHaveBeenCalledOnce();
    expect(replace).not.toHaveBeenCalled();
  });

  it('reconstructs only a validated root origin when no stack exists', () => {
    const replace = vi.fn();
    const onBack = createValidatedBackHandler({
      back: {
        restored: true,
        href: '/garden',
        focusTarget: 'r002b-garden-badges-action',
        scrollOffset: 384,
        filter: 'in_progress',
      },
      profileId: 'child_salem',
      safeRoot: '/child',
      canGoBack: () => false,
      goBack: vi.fn(),
      replace,
    });

    onBack();

    expect(replace).toHaveBeenCalledWith({
      pathname: '/garden',
      params: {
        restoreFocusTarget: 'r002b-garden-badges-action',
        restoreProfileId: 'child_salem',
        restoreScrollOffset: '384',
        restoreFilter: 'in_progress',
      },
    });
  });

  it('restores the validated Garden entry when Shared Growth was opened there', () => {
    const replace = vi.fn();
    const onBack = createValidatedBackHandler({
      back: {
        restored: true,
        href: '/garden',
        focusTarget: 'r002b-garden-shared-growth-card',
        scrollOffset: 612,
        filter: null,
      },
      profileId: 'child_salem',
      safeRoot: '/child',
      canGoBack: () => false,
      goBack: vi.fn(),
      replace,
    });

    onBack();

    expect(replace).toHaveBeenCalledWith({
      pathname: '/garden',
      params: {
        restoreFocusTarget: 'r002b-garden-shared-growth-card',
        restoreProfileId: 'child_salem',
        restoreScrollOffset: '612',
      },
    });
  });

  it('falls back to the safe role root when a nested origin cannot be reconstructed', () => {
    const replace = vi.fn();
    const onBack = createValidatedBackHandler({
      back: {
        restored: true,
        href: '/garden/impact-path',
        focusTarget: 'r002b-impact-path-badges-action',
        scrollOffset: 0,
        filter: null,
      },
      profileId: 'child_salem',
      safeRoot: '/child',
      canGoBack: () => false,
      goBack: vi.fn(),
      replace,
    });

    onBack();

    expect(replace).toHaveBeenCalledWith('/child');
  });
});
