import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { R002bNestedScreen, R002bUnavailableState } from '@/components/r002b/R002bNestedScreen';
import { ImpactPathScreen } from '@/components/r002b/GrowthJourneyScreens';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { useR002bGrowthPresentation } from '@/features/growth/useR002bGrowthPresentation';
import { createValidatedBackHandler } from '@/features/navigation/r002bBack';
import { createR002bOrigin, serializeR002bOrigin } from '@/features/navigation/r002bOrigin';
import {
  resolveR002bRouteRequest,
  type R002bRouteParam,
} from '@/features/navigation/r002bRouteRequest';
import type { SyntheticChildId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface ImpactPathParams extends Record<string, R002bRouteParam> {
  readonly profileId?: R002bRouteParam;
  readonly originId?: R002bRouteParam;
  readonly originProfileId?: R002bRouteParam;
  readonly originScrollOffset?: R002bRouteParam;
  readonly originFilter?: R002bRouteParam;
  readonly originEntityId?: R002bRouteParam;
}

const ALLOWED_ORIGINS = [
  'child_today_path_card',
  'child_garden_path_card',
  'badge_detail_path_action',
  'child_reveal_growth_action',
] as const;

export default function ImpactPathRoute() {
  const params = useLocalSearchParams() as unknown as ImpactPathParams;
  const role = usePrototypeStore((state) => state.role);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const access = resolveR002bRouteRequest({
    routeId: 'impact_path',
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

  return <AuthorizedImpactPath access={access} profileId={activeChildId} />;
}

function AuthorizedImpactPath({
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

  const openBadges = () => {
    const origin = createR002bOrigin({
      id: 'impact_path_badges_action',
      profileId,
      scrollOffset: 0,
    });
    if (!origin.ok) return;
    router.push({
      pathname: '/garden/badges',
      params: { profileId, ...serializeR002bOrigin(origin.data) },
    } as unknown as Href);
  };
  const presentation = useR002bGrowthPresentation({
    enabled: true,
    profileId,
    actions: {
      openBadge: () => undefined,
      ...(r002bFeatureFlags.r002b_badges_ui ? { openBadges } : {}),
    },
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
      reducedMotion={presentation.ok ? presentation.data.impactPath.reducedMotion : true}
      testID="r002b-impact-path-route"
      title={t('r002bGrowth.chapter.pathEntryTitle')}
    >
      {presentation.ok ? (
        <ImpactPathScreen {...presentation.data.impactPath} />
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
