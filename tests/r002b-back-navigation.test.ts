import { describe, expect, it, vi } from 'vitest';

import { createValidatedBackHandler } from '@/features/navigation/r002bBack';

describe('R002b validated Back navigation', () => {
  it('uses the live guarded stack so nested route state, scroll, and focus remain mounted', () => {
    const goBack = vi.fn();
    const replace = vi.fn();
    const onBack = createValidatedBackHandler({
      back: {
        restored: true,
        origin: {
          version: 1,
          id: 'child_garden_path_card',
          profileId: 'child_salem',
          scrollOffset: 420,
        },
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
        origin: {
          version: 1,
          id: 'child_garden_badges_card',
          profileId: 'child_salem',
          scrollOffset: 384,
        },
        href: '/garden',
        focusTarget: 'r002b-garden-badges-action',
        scrollOffset: 384,
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
        restoreFocusTarget: 'r002b-garden-badges-action',
        restoreProfileId: 'child_salem',
        restoreScrollOffset: '384',
      },
    });
  });

  it('restores the validated Garden entry when Shared Growth was opened there', () => {
    const replace = vi.fn();
    const onBack = createValidatedBackHandler({
      back: {
        restored: true,
        origin: {
          version: 1,
          id: 'child_garden_shared_growth_card',
          profileId: 'child_salem',
          scrollOffset: 612,
        },
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

  it('reconstructs a validated Impact Path origin when the live stack was interrupted', () => {
    const replace = vi.fn();
    const onBack = createValidatedBackHandler({
      back: {
        restored: true,
        origin: {
          version: 1,
          id: 'impact_path_badges_action',
          profileId: 'child_salem',
          scrollOffset: 612,
        },
        href: '/garden/impact-path',
        focusTarget: 'r002b-impact-path-badges-action',
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
      pathname: '/garden/impact-path',
      params: {
        profileId: 'child_salem',
        originId: 'child_today_path_card',
        originProfileId: 'child_salem',
        originScrollOffset: '0',
        restoreFocusTarget: 'r002b-impact-path-badges-action',
        restoreProfileId: 'child_salem',
        restoreScrollOffset: '612',
      },
    });
  });

  it('reconstructs Badge Gallery with its validated filter, scroll, and focused badge', () => {
    const replace = vi.fn();
    const onBack = createValidatedBackHandler({
      back: {
        restored: true,
        origin: {
          version: 1,
          id: 'badge_gallery_badge_card',
          profileId: 'child_salem',
          entityId: 'badge.skill.sorting.bud.v1',
          filter: 'in_progress',
          scrollOffset: 384,
        },
        href: '/garden/badges',
        focusTarget: 'r002b-badge-badge.skill.sorting.bud.v1',
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
      pathname: '/garden/badges',
      params: {
        profileId: 'child_salem',
        originId: 'child_garden_badges_card',
        originProfileId: 'child_salem',
        originScrollOffset: '0',
        restoreFilter: 'in_progress',
        restoreFocusTarget: 'r002b-badge-badge.skill.sorting.bud.v1',
        restoreProfileId: 'child_salem',
        restoreScrollOffset: '384',
      },
    });
  });

  it('reconstructs Badge Detail with a validated badge identity and action focus', () => {
    const replace = vi.fn();
    const onBack = createValidatedBackHandler({
      back: {
        restored: true,
        origin: {
          version: 1,
          id: 'badge_detail_path_action',
          profileId: 'child_salem',
          entityId: 'badge.skill.sorting.bud.v1',
          filter: 'earned',
          galleryScrollOffset: 384,
          scrollOffset: 248,
        },
        href: '/garden/badges/badge.skill.sorting.bud.v1',
        focusTarget: 'r002b-badge-detail-path-action',
        galleryScrollOffset: 384,
        scrollOffset: 248,
        filter: 'earned',
      },
      profileId: 'child_salem',
      safeRoot: '/child',
      canGoBack: () => false,
      goBack: vi.fn(),
      replace,
    });

    onBack();

    expect(replace).toHaveBeenCalledWith({
      pathname: '/garden/badges/[badgeId]',
      params: {
        badgeId: 'badge.skill.sorting.bud.v1',
        profileId: 'child_salem',
        originEntityId: 'badge.skill.sorting.bud.v1',
        originFilter: 'earned',
        originId: 'badge_gallery_badge_card',
        originProfileId: 'child_salem',
        originScrollOffset: '384',
        restoreFilter: 'earned',
        restoreFocusTarget: 'r002b-badge-detail-path-action',
        restoreProfileId: 'child_salem',
        restoreScrollOffset: '248',
      },
    });
  });

  it('falls back to the safe role root for a forged nested destination', () => {
    const replace = vi.fn();
    const onBack = createValidatedBackHandler({
      back: {
        restored: true,
        origin: {
          version: 1,
          id: 'badge_detail_path_action',
          profileId: 'child_salem',
          entityId: 'not-a-canonical-badge',
          scrollOffset: 0,
        },
        href: '/garden/badges/not-a-canonical-badge',
        focusTarget: 'r002b-badge-detail-path-action',
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
