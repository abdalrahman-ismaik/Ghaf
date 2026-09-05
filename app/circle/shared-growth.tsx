import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { R002bNestedScreen, R002bUnavailableState } from '@/components/r002b/R002bNestedScreen';
import { SharedGrowthChildScreen } from '@/components/r002b/SharedGrowthScreens';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { createValidatedBackHandler } from '@/features/navigation/r002bBack';
import {
  resolveR002bRouteRequest,
  type R002bRouteParam,
} from '@/features/navigation/r002bRouteRequest';
import { createR002bSharedGrowthChildPresentation } from '@/features/shared-growth/r002bSharedGrowthViewModel';
import type { SyntheticChildId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface SharedGrowthParams extends Record<string, R002bRouteParam> {
  readonly profileId?: R002bRouteParam;
  readonly originId?: R002bRouteParam;
  readonly originProfileId?: R002bRouteParam;
  readonly originScrollOffset?: R002bRouteParam;
}

const ALLOWED_ORIGINS = [
  'child_garden_shared_growth_card',
  'child_league_shared_growth_card',
] as const;

export default function SharedGrowthRoute() {
  const params = useLocalSearchParams() as unknown as SharedGrowthParams;
  const role = usePrototypeStore((state) => state.role);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const access = resolveR002bRouteRequest({
    routeId: 'shared_growth',
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

  return <AuthorizedSharedGrowth access={access} profileId={activeChildId} />;
}

function AuthorizedSharedGrowth({
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
  const projectionRevision = usePrototypeStore((state) => state.sharedGrowth.preference.revision);
  const getSharedGrowthChildView = usePrototypeStore((state) => state.getSharedGrowthChildView);
  const reducedMotion = Boolean(useReducedMotion());
  const onBack = createValidatedBackHandler({
    back: access.back,
    profileId,
    safeRoot: '/child',
    canGoBack: () => router.canGoBack(),
    goBack: () => router.back(),
    replace: (target) => router.replace(target as Href),
  });
  // The revision subscription refreshes this read-only projection after a Parent preference change.
  void projectionRevision;
  const projection = getSharedGrowthChildView();

  if (!projection.ok) {
    return (
      <R002bNestedScreen
        backLabel={t('r002bSharedGrowth.common.back')}
        direction={direction}
        language={language}
        onBack={onBack}
        reducedMotion={reducedMotion}
        testID="r002b-shared-growth-route"
        title={t('r002bSharedGrowth.child.title')}
      >
        <R002bUnavailableState
          actionLabel={t('r002bSharedGrowth.common.back')}
          body={t('r002bSharedGrowth.common.state.error')}
          direction={direction}
          language={language}
          onAction={onBack}
          title={t('r002bSharedGrowth.common.state.unavailable')}
        />
      </R002bNestedScreen>
    );
  }

  const presentation = createR002bSharedGrowthChildPresentation({
    projection: projection.data,
    language,
    direction,
    reducedMotion,
    translate: (key, values) => String(t(key, values)),
  });

  return (
    <R002bNestedScreen
      backLabel={t('r002bSharedGrowth.common.back')}
      direction={direction}
      language={language}
      onBack={onBack}
      reducedMotion={reducedMotion}
      testID="r002b-shared-growth-route"
      title={presentation.title}
    >
      <SharedGrowthChildScreen {...presentation} />
    </R002bNestedScreen>
  );
}
