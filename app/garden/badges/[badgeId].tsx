import { useRef } from 'react';
import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { BadgeDetail } from '@/components/r002b/GrowthJourneyScreens';
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

interface BadgeDetailParams extends Record<string, R002bRouteParam> {
  readonly badgeId?: R002bRouteParam;
  readonly profileId?: R002bRouteParam;
  readonly originId?: R002bRouteParam;
  readonly originProfileId?: R002bRouteParam;
  readonly originScrollOffset?: R002bRouteParam;
  readonly originFilter?: R002bRouteParam;
  readonly originEntityId?: R002bRouteParam;
  readonly restoreFocusTarget?: R002bRouteParam;
  readonly restoreScrollOffset?: R002bRouteParam;
}

const ALLOWED_ORIGINS = ['badge_gallery_badge_card'] as const;

export default function BadgeDetailRoute() {
  const params = useLocalSearchParams() as unknown as BadgeDetailParams;
  const role = usePrototypeStore((state) => state.role);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const access = resolveR002bRouteRequest({
    routeId: 'badge_detail',
    role,
    activeProfileId: activeChildId,
    authorizedProfileIds: [activeChildId],
    flags: r002bFeatureFlags,
    requestedProfileParam: params.profileId,
    entityParam: params.badgeId,
    originParams: params,
    allowedOriginIds: ALLOWED_ORIGINS,
  });

  if (!access.allowed) return <Redirect href={access.fallback} />;

  return (
    <AuthorizedBadgeDetail
      access={access}
      badgeId={access.entityId as BadgeId}
      profileId={activeChildId}
      restoredScrollOffset={
        typeof params.restoreScrollOffset === 'string' &&
        /^\d+$/u.test(params.restoreScrollOffset) &&
        Number(params.restoreScrollOffset) <= 100_000
          ? Number(params.restoreScrollOffset)
          : 0
      }
      restoreFocusTarget={
        params.restoreFocusTarget === 'r002b-badge-detail-learning-action'
          ? params.restoreFocusTarget
          : undefined
      }
    />
  );
}

function AuthorizedBadgeDetail({
  access,
  badgeId,
  profileId,
  restoredScrollOffset,
  restoreFocusTarget,
}: {
  readonly access: Extract<ReturnType<typeof resolveR002bRouteRequest>, { allowed: true }>;
  readonly badgeId: BadgeId;
  readonly profileId: SyntheticChildId;
  readonly restoredScrollOffset: number;
  readonly restoreFocusTarget: 'r002b-badge-detail-learning-action' | undefined;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const language = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const scrollOffsetRef = useRef(restoredScrollOffset);

  const openImpactStation = () => {
    const origin = createR002bOrigin({
      id: 'badge_detail_path_action',
      profileId,
      entityId: badgeId,
      scrollOffset: 0,
    });
    if (!origin.ok) return;
    router.push({
      pathname: '/garden/impact-path',
      params: { profileId, ...serializeR002bOrigin(origin.data) },
    } as unknown as Href);
  };
  const openAssignedTask = (assignmentId: string, taskId: string) => {
    const journey = usePrototypeStore.getState().journey;
    if (
      journey?.assignment?.id !== assignmentId ||
      journey.assignment.childId !== profileId ||
      journey.task.id !== taskId ||
      (journey.lifecycle !== 'assigned' &&
        journey.lifecycle !== 'chosen' &&
        journey.lifecycle !== 'in_progress')
    ) {
      return;
    }
    router.push('/child/task');
  };
  const openLearning = (learningId: 'learning.mangrove_roots.v1') => {
    const routeOrigin = createR002bOrigin({
      id: 'badge_detail_learning_action',
      profileId,
      entityId: badgeId,
      scrollOffset: 0,
    });
    if (!routeOrigin.ok) return;
    const started = usePrototypeStore.getState().startMangroveLearning('story', {
      kind: 'badge_detail',
      route: '/garden/badges/[badgeId]',
      profileId,
      badgeId,
      filter: access.origin.filter ?? 'all',
      focusTargetId: 'r002b-badge-detail-learning-action',
      galleryScrollOffset: access.origin.scrollOffset ?? 0,
      scrollOffset: scrollOffsetRef.current,
    });
    if (!started.ok) return;
    router.push({
      pathname: '/garden/learn/[learningId]/story',
      params: {
        learningId,
        profileId,
        ...serializeR002bOrigin(routeOrigin.data),
      },
    } as unknown as Href);
  };
  const presentation = useR002bGrowthPresentation({
    enabled: true,
    profileId,
    actions: {
      openBadge: () => undefined,
      openImpactStation,
      openAssignedTask,
      ...(r002bFeatureFlags.r002b_learning_ui ? { openLearning } : {}),
    },
  });
  const detail = presentation.ok ? presentation.data.badgeDetail(badgeId) : null;
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
      reducedMotion={detail?.reducedMotion ?? true}
      scrollProps={{
        contentOffset: { x: 0, y: restoredScrollOffset },
        onScroll: (event) => {
          scrollOffsetRef.current = Math.max(0, Math.round(event.nativeEvent.contentOffset.y));
        },
        scrollEventThrottle: 16,
      }}
      testID="r002b-badge-detail-route"
      title={t('r002bGrowth.badges.title')}
    >
      {detail ? (
        <BadgeDetail {...detail} initialFocusTargetId={restoreFocusTarget} />
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
