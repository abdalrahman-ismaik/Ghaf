import { useRef } from 'react';
import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { R002bNestedScreen, R002bUnavailableState } from '@/components/r002b/R002bNestedScreen';
import { ImpactPathScreen } from '@/components/r002b/GrowthJourneyScreens';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { MANGROVE_ROOTS_LEARNING_PACKAGE } from '@/features/learning/mangroveLearning';
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
  readonly restoreFocusTarget?: R002bRouteParam;
  readonly restoreProfileId?: R002bRouteParam;
  readonly restoreScrollOffset?: R002bRouteParam;
}

const ALLOWED_ORIGINS = [
  'child_today_path_card',
  'child_garden_path_card',
  'badge_detail_path_action',
  'child_reveal_growth_action',
  'impact_path_learning_action',
] as const;

function restoredPosition(params: ImpactPathParams, activeChildId: SyntheticChildId) {
  const profileMatches = params.restoreProfileId === activeChildId;
  const focusTarget =
    profileMatches &&
    (params.restoreFocusTarget === 'impact-path-learning-station-132' ||
      (params.restoreFocusTarget === 'r002b-impact-path-badges-action' &&
        r002bFeatureFlags.r002b_badges_ui))
      ? params.restoreFocusTarget
      : undefined;
  const rawOffset = params.restoreScrollOffset;
  const scrollOffset =
    profileMatches &&
    typeof rawOffset === 'string' &&
    /^\d+$/u.test(rawOffset) &&
    Number(rawOffset) <= 100_000
      ? Number(rawOffset)
      : 0;
  return { focusTarget, scrollOffset } as const;
}

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

  const restored = restoredPosition(params, activeChildId);
  return <AuthorizedImpactPath access={access} profileId={activeChildId} restored={restored} />;
}

function AuthorizedImpactPath({
  access,
  profileId,
  restored,
}: {
  readonly access: Extract<ReturnType<typeof resolveR002bRouteRequest>, { allowed: true }>;
  readonly profileId: SyntheticChildId;
  readonly restored: {
    readonly focusTarget:
      'impact-path-learning-station-132' | 'r002b-impact-path-badges-action' | undefined;
    readonly scrollOffset: number;
  };
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const language = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const scrollOffsetRef = useRef(restored.scrollOffset);

  const openBadges = () => {
    const origin = createR002bOrigin({
      id: 'impact_path_badges_action',
      profileId,
      scrollOffset: scrollOffsetRef.current,
    });
    if (!origin.ok) return;
    router.push({
      pathname: '/garden/badges',
      params: { profileId, ...serializeR002bOrigin(origin.data) },
    } as unknown as Href);
  };
  const openLearningRoute = (
    route: 'story' | 'accessible',
    learningId: 'learning.mangrove_roots.v1',
  ) => {
    if (learningId !== MANGROVE_ROOTS_LEARNING_PACKAGE.id) return;
    const routeOrigin = createR002bOrigin({
      id: 'impact_path_learning_action',
      profileId,
      scrollOffset: scrollOffsetRef.current,
    });
    if (!routeOrigin.ok) return;
    const started = usePrototypeStore.getState().startMangroveLearning(route, {
      kind: 'impact_path',
      route: '/garden/impact-path',
      profileId,
      focusTargetId: 'impact-path-learning-station-132',
      scrollOffset: scrollOffsetRef.current,
    });
    if (!started.ok) return;
    router.push({
      pathname:
        route === 'story'
          ? '/garden/learn/[learningId]/story'
          : '/garden/learn/[learningId]/accessible',
      params: {
        learningId,
        profileId,
        ...serializeR002bOrigin(routeOrigin.data),
      },
    } as unknown as Href);
  };
  const openLearning = (learningId: 'learning.mangrove_roots.v1') => {
    openLearningRoute('story', learningId);
  };
  const openAccessibleLearning = (learningId: 'learning.mangrove_roots.v1') => {
    openLearningRoute('accessible', learningId);
  };
  const presentation = useR002bGrowthPresentation({
    enabled: true,
    profileId,
    actions: {
      openBadge: () => undefined,
      ...(r002bFeatureFlags.r002b_badges_ui ? { openBadges } : {}),
      ...(r002bFeatureFlags.r002b_learning_ui ? { openLearning } : {}),
      ...(r002bFeatureFlags.r002b_learning_ui ? { openAccessibleLearning } : {}),
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
      scrollProps={{
        contentOffset: { x: 0, y: restored.scrollOffset },
        onScroll: (event) => {
          scrollOffsetRef.current = Math.max(0, Math.round(event.nativeEvent.contentOffset.y));
        },
        scrollEventThrottle: 16,
      }}
      testID="r002b-impact-path-route"
      title={t('r002bGrowth.chapter.pathEntryTitle')}
    >
      {presentation.ok ? (
        <ImpactPathScreen
          {...presentation.data.impactPath}
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
