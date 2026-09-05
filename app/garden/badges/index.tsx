import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { BadgeGallery } from '@/components/r002b/GrowthJourneyScreens';
import { R002bNestedScreen, R002bUnavailableState } from '@/components/r002b/R002bNestedScreen';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { useR002bGrowthPresentation } from '@/features/growth/useR002bGrowthPresentation';
import { createValidatedBackHandler } from '@/features/navigation/r002bBack';
import { createR002bOrigin, serializeR002bOrigin } from '@/features/navigation/r002bOrigin';
import {
  resolveR002bRouteRequest,
  type R002bRouteParam,
} from '@/features/navigation/r002bRouteRequest';
import type { BadgeId } from '@/models/achievements';
import type { SyntheticChildId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface BadgeGalleryParams extends Record<string, R002bRouteParam> {
  readonly profileId?: R002bRouteParam;
  readonly originId?: R002bRouteParam;
  readonly originProfileId?: R002bRouteParam;
  readonly originScrollOffset?: R002bRouteParam;
  readonly originFilter?: R002bRouteParam;
  readonly originEntityId?: R002bRouteParam;
}

const ALLOWED_ORIGINS = ['child_garden_badges_card', 'impact_path_badges_action'] as const;

export default function BadgeGalleryRoute() {
  const params = useLocalSearchParams() as unknown as BadgeGalleryParams;
  const role = usePrototypeStore((state) => state.role);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
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

  return <AuthorizedBadgeGallery access={access} profileId={activeChildId} />;
}

function AuthorizedBadgeGallery({
  access,
  profileId,
}: {
  readonly access: Extract<ReturnType<typeof resolveR002bRouteRequest>, { allowed: true }>;
  readonly profileId: SyntheticChildId;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const language = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);

  const openBadge = (badgeId: BadgeId) => {
    const origin = createR002bOrigin({
      id: 'badge_gallery_badge_card',
      profileId,
      entityId: badgeId,
      scrollOffset: 0,
      filter: 'all',
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
    canGoBack: () => router.canGoBack(),
    goBack: () => router.back(),
    replace: (target) => router.replace(target as Href),
  });

  return (
    <R002bNestedScreen
      backLabel={t('common.back')}
      direction={direction}
      language={language}
      onBack={onBack}
      reducedMotion={presentation.ok ? presentation.data.badgeGallery.reducedMotion : true}
      testID="r002b-badge-gallery-route"
      title={t('r002bGrowth.badges.chapter')}
    >
      {presentation.ok ? (
        <BadgeGallery {...presentation.data.badgeGallery} />
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
