import { useRef } from 'react';
import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { BadgeGallery } from '@/components/r002b/GrowthJourneyScreens';
import { R002bNestedScreen, R002bUnavailableState } from '@/components/r002b/R002bNestedScreen';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { useR002bGrowthPresentation } from '@/features/growth/useR002bGrowthPresentation';
import { createValidatedBackHandler } from '@/features/navigation/r002bBack';
import {
  createR002bOrigin,
  isR002bBadgeFilter,
  serializeR002bOrigin,
  type R002bBadgeFilter,
} from '@/features/navigation/r002bOrigin';
import {
  resolveR002bRouteRequest,
  type R002bRouteParam,
} from '@/features/navigation/r002bRouteRequest';
import type { BadgeId } from '@/models/achievements';
import type { SyntheticChildId } from '@/models/familyGrowth';
import { selectCanEnterChildExperience, usePrototypeStore } from '@/state/usePrototypeStore';

interface BadgeGalleryParams extends Record<string, R002bRouteParam> {
  readonly profileId?: R002bRouteParam;
  readonly originId?: R002bRouteParam;
  readonly originProfileId?: R002bRouteParam;
  readonly originScrollOffset?: R002bRouteParam;
  readonly originFilter?: R002bRouteParam;
  readonly originEntityId?: R002bRouteParam;
  readonly restoreFilter?: R002bRouteParam;
  readonly restoreFocusTarget?: R002bRouteParam;
  readonly restoreProfileId?: R002bRouteParam;
  readonly restoreScrollOffset?: R002bRouteParam;
}

const ALLOWED_ORIGINS = ['child_garden_badges_card', 'impact_path_badges_action'] as const;

function restoredBadgeGalleryPosition(params: BadgeGalleryParams, activeChildId: SyntheticChildId) {
  const profileMatches = params.restoreProfileId === activeChildId;
  const filter =
    profileMatches && isR002bBadgeFilter(params.restoreFilter) ? params.restoreFilter : 'all';
  const rawOffset = params.restoreScrollOffset;
  const scrollOffset =
    profileMatches &&
    typeof rawOffset === 'string' &&
    /^\d+$/u.test(rawOffset) &&
    Number(rawOffset) <= 100_000
      ? Number(rawOffset)
      : 0;
  const rawFocusTarget = params.restoreFocusTarget;
  const focusedBadgeId =
    profileMatches &&
    typeof rawFocusTarget === 'string' &&
    rawFocusTarget.startsWith('r002b-badge-')
      ? rawFocusTarget.slice('r002b-badge-'.length)
      : undefined;
  const validatedFocus = focusedBadgeId
    ? createR002bOrigin({
        id: 'badge_gallery_badge_card',
        profileId: activeChildId,
        entityId: focusedBadgeId,
        filter,
        scrollOffset,
      })
    : null;
  const focusTarget =
    validatedFocus?.ok && typeof rawFocusTarget === 'string' ? rawFocusTarget : undefined;

  return { filter, focusTarget, scrollOffset } as const;
}

export default function BadgeGalleryRoute() {
  const params = useLocalSearchParams() as unknown as BadgeGalleryParams;
  const role = usePrototypeStore((state) => state.role);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const canEnterChildExperience = usePrototypeStore(selectCanEnterChildExperience);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);

  if (activeExperience === 'parent') return <Redirect href={'/parent' as Href} />;
  if (activeExperience !== 'child' || !canEnterChildExperience) {
    return <Redirect href={'/' as Href} />;
  }
  const access = resolveR002bRouteRequest({
    routeId: 'badge_gallery',
    role,
    activeProfileId: activeChildId,
    authorizedProfileIds: [activeChildId],
    flags: r002bFeatureFlags,
    requestedProfileParam: params.profileId,
    entityParam: undefined,
    originParams: params,
    allowedOriginIds: ALLOWED_ORIGINS,
  });

  if (!access.allowed) return <Redirect href={access.fallback} />;

  return (
    <AuthorizedBadgeGallery
      access={access}
      profileId={activeChildId}
      restored={restoredBadgeGalleryPosition(params, activeChildId)}
    />
  );
}

function AuthorizedBadgeGallery({
  access,
  profileId,
  restored,
}: {
  readonly access: Extract<ReturnType<typeof resolveR002bRouteRequest>, { allowed: true }>;
  readonly profileId: SyntheticChildId;
  readonly restored: {
    readonly filter: R002bBadgeFilter;
    readonly focusTarget: string | undefined;
    readonly scrollOffset: number;
  };
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const language = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const galleryFilterRef = useRef(restored.filter);
  const galleryScrollOffsetRef = useRef(restored.scrollOffset);

  const openBadge = (badgeId: BadgeId) => {
    const origin = createR002bOrigin({
      id: 'badge_gallery_badge_card',
      profileId,
      entityId: badgeId,
      scrollOffset: galleryScrollOffsetRef.current,
      filter: galleryFilterRef.current,
    });
    if (!origin.ok) return;
    router.push({
      pathname: '/garden/badges/[badgeId]',
      params: { badgeId, profileId, ...serializeR002bOrigin(origin.data) },
    } as unknown as Href);
  };
  const presentation = useR002bGrowthPresentation({
    enabled: true,
    profileId,
    actions: { openBadge },
  });
  const onBack = createValidatedBackHandler({
    back: access.back,
    profileId,
    safeRoot: '/child',
    replace: (target) => router.replace(target as Href),
  });

  return (
    <R002bNestedScreen
      backLabel={t('common.back')}
      direction={direction}
      language={language}
      onBack={onBack}
      reducedMotion={presentation.ok ? presentation.data.badgeGallery.reducedMotion : true}
      scrollProps={{
        contentOffset: { x: 0, y: restored.scrollOffset },
        onScroll: (event) => {
          galleryScrollOffsetRef.current = Math.max(
            0,
            Math.round(event.nativeEvent.contentOffset.y),
          );
        },
        scrollEventThrottle: 16,
      }}
      testID="r002b-badge-gallery-route"
      title={t('r002bGrowth.badges.chapter')}
    >
      {presentation.ok ? (
        <BadgeGallery
          {...presentation.data.badgeGallery}
          initialFocusTargetId={restored.focusTarget}
        />
      ) : (
        <R002bUnavailableState
          actionLabel={t('common.back')}
          body={t('r002bGrowth.surfaceStatus.error')}
          direction={direction}
          language={language}
          onAction={onBack}
          title={t('r002bGrowth.surfaceStatus.unavailable')}
        />
      )}
    </R002bNestedScreen>
  );
}
