import {
  createR002bOrigin,
  resolveR002bOrigin,
  serializeR002bOrigin,
  type ResolveR002bOriginResult,
} from './r002bOrigin';

type RestoredOrigin = Extract<ResolveR002bOriginResult, { restored: true }>;

export interface R002bBackNavigationTarget {
  readonly pathname:
    | '/child'
    | '/garden'
    | '/circle'
    | '/parent'
    | '/parent/family'
    | '/garden/impact-path'
    | '/garden/badges'
    | '/garden/badges/[badgeId]';
  readonly params: {
    readonly badgeId?: string;
    readonly profileId?: string;
    readonly originId?: string;
    readonly originProfileId?: string;
    readonly originScrollOffset?: string;
    readonly originGalleryScrollOffset?: string;
    readonly originFilter?: string;
    readonly originEntityId?: string;
    readonly restoreFocusTarget: string;
    readonly restoreProfileId: string;
    readonly restoreScrollOffset: string;
    readonly restoreFilter?: string;
  };
}

function restoreParams(back: RestoredOrigin, profileId: string) {
  return {
    restoreFocusTarget: back.focusTarget,
    restoreProfileId: profileId,
    restoreScrollOffset: String(back.scrollOffset),
    ...(back.filter === null ? {} : { restoreFilter: back.filter }),
  } as const;
}

function nestedTarget(back: RestoredOrigin, profileId: string): R002bBackNavigationTarget | null {
  if (back.origin.id === 'impact_path_badges_action') {
    const entryOrigin = createR002bOrigin({
      id: 'child_today_path_card',
      profileId,
      scrollOffset: 0,
    });
    if (!entryOrigin.ok) return null;
    return {
      pathname: '/garden/impact-path',
      params: {
        profileId,
        ...serializeR002bOrigin(entryOrigin.data),
        ...restoreParams(back, profileId),
      },
    };
  }

  if (back.origin.id === 'badge_gallery_badge_card') {
    const entryOrigin = createR002bOrigin({
      id: 'child_garden_badges_card',
      profileId,
      scrollOffset: 0,
    });
    if (!entryOrigin.ok) return null;
    return {
      pathname: '/garden/badges',
      params: {
        profileId,
        ...serializeR002bOrigin(entryOrigin.data),
        ...restoreParams(back, profileId),
      },
    };
  }

  if (
    back.origin.id !== 'badge_detail_path_action' &&
    back.origin.id !== 'badge_detail_learning_action'
  ) {
    return null;
  }
  const badgeId = back.origin.entityId;
  if (!badgeId) return null;
  const galleryOrigin = createR002bOrigin({
    id: 'badge_gallery_badge_card',
    profileId,
    entityId: badgeId,
    filter: back.filter ?? 'all',
    scrollOffset: back.galleryScrollOffset ?? 0,
  });
  if (!galleryOrigin.ok) return null;
  return {
    pathname: '/garden/badges/[badgeId]',
    params: {
      badgeId,
      profileId,
      ...serializeR002bOrigin(galleryOrigin.data),
      ...restoreParams(back, profileId),
    },
  };
}

function directRoot(href: string): R002bBackNavigationTarget['pathname'] | null {
  if (
    href === '/child' ||
    href === '/garden' ||
    href === '/circle' ||
    href === '/parent' ||
    href === '/parent/family'
  ) {
    return href;
  }
  return null;
}

export function createValidatedBackHandler(input: {
  readonly back: RestoredOrigin;
  readonly profileId: string;
  readonly replace: (target: R002bBackNavigationTarget | '/child' | '/parent') => void;
  readonly safeRoot: '/child' | '/parent';
}): () => void {
  return () => {
    const back = resolveR002bOrigin({
      origin: input.back.origin,
      activeRole: input.safeRoot === '/child' ? 'child' : 'parent',
      activeProfileId: input.profileId,
    });
    if (!back.restored) {
      input.replace(input.safeRoot);
      return;
    }

    const pathname = directRoot(back.href);
    if (pathname) {
      input.replace({
        pathname,
        params: restoreParams(back, input.profileId),
      });
      return;
    }

    input.replace(nestedTarget(back, input.profileId) ?? input.safeRoot);
  };
}
