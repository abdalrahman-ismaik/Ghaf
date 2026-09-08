import { useMemo } from 'react';
import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { ParentProgressScreen } from '@/components/r002b/ParentProgressScreen';
import { R002bNestedScreen, R002bUnavailableState } from '@/components/r002b/R002bNestedScreen';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import {
  createR002bParentProgressPresentation,
  type ParentProgressProfileOption,
} from '@/features/growth/r002bParentProgressViewModel';
import type { ParentProgressTaskPrefill } from '@/features/growth/parentProgress';
import { createValidatedBackHandler } from '@/features/navigation/r002bBack';
import { createR002bOrigin, serializeR002bOrigin } from '@/features/navigation/r002bOrigin';
import {
  resolveR002bRouteRequest,
  type R002bRouteParam,
} from '@/features/navigation/r002bRouteRequest';
import { localize } from '@/i18n';
import type { SyntheticChildId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface ParentProgressParams extends Record<string, R002bRouteParam> {
  readonly profileId?: R002bRouteParam;
  readonly originId?: R002bRouteParam;
  readonly originProfileId?: R002bRouteParam;
  readonly originScrollOffset?: R002bRouteParam;
  readonly originFilter?: R002bRouteParam;
  readonly originEntityId?: R002bRouteParam;
}

const ALLOWED_ORIGINS = [
  'parent_family_progress_card',
  'parent_family_overview_progress_row',
] as const;

export default function ParentProgressRoute() {
  const params = useLocalSearchParams() as unknown as ParentProgressParams;
  const role = usePrototypeStore((state) => state.role);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const children = usePrototypeStore((state) => state.children);
  const authorizedProfileIds = Object.keys(children) as SyntheticChildId[];
  const access = resolveR002bRouteRequest({
    routeId: 'parent_progress',
    role,
    activeProfileId: activeChildId,
    authorizedProfileIds,
    flags: r002bFeatureFlags,
    requestedProfileParam: params.profileId,
    entityParam: undefined,
    originParams: params,
    allowedOriginIds: ALLOWED_ORIGINS,
  });

  if (!access.allowed) return <Redirect href={access.fallback} />;

  return (
    <AuthorizedParentProgress
      access={access}
      profileId={access.requestedProfileId as SyntheticChildId}
    />
  );
}

function AuthorizedParentProgress({
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
  const children = usePrototypeStore((state) => state.children);
  const journey = usePrototypeStore((state) => state.journey);
  const progressRevision = usePrototypeStore((state) =>
    JSON.stringify({
      achievements: state.growthJourney.achievementsByProfile[profileId],
      journey: state.journey,
      learning: state.mangroveLearningByProfile[profileId],
      ledger: state.growthJourney.ledgersByProfile[profileId],
      mangrove: state.landscapeProgress.mangrove,
      resetSequence: state.growthJourney.resetSequence,
    }),
  );
  const getParentChildProgress = usePrototypeStore((state) => state.getParentChildProgress);
  const setActiveChild = usePrototypeStore((state) => state.setActiveChild);
  const reducedMotion = Boolean(useReducedMotion());
  const profiles = useMemo<readonly ParentProgressProfileOption[]>(
    () =>
      (Object.keys(children) as SyntheticChildId[]).map((id) => ({
        id,
        name: localize(children[id].displayName, language),
      })),
    [children, language],
  );
  const progress = useMemo(() => {
    // Recompute the authorized projection whenever one of its canonical inputs changes.
    void progressRevision;
    return getParentChildProgress(profileId);
  }, [getParentChildProgress, profileId, progressRevision]);
  const profileName = localize(children[profileId].displayName, language);
  const canOpenTaskBuilder =
    journey === null ||
    (journey.task.targetChildId === profileId &&
      (journey.lifecycle === 'draft' || journey.lifecycle === 'reviewed'));

  const replaceForProfile = (nextProfileId: SyntheticChildId) => {
    if (!children[nextProfileId]) return;
    const selected = setActiveChild(nextProfileId);
    if (!selected.ok) return;
    const origin = createR002bOrigin({
      id:
        access.origin.id === 'parent_family_overview_progress_row'
          ? 'parent_family_overview_progress_row'
          : 'parent_family_progress_card',
      profileId: nextProfileId,
      scrollOffset: access.origin.scrollOffset,
    });
    if (!origin.ok) return;
    router.replace({
      pathname: '/parent/family/[profileId]/progress',
      params: {
        profileId: nextProfileId,
        ...serializeR002bOrigin(origin.data),
      },
    } as unknown as Href);
  };

  const openSuitableTask = (prefill: ParentProgressTaskPrefill) => {
    if (
      !canOpenTaskBuilder ||
      prefill.intent !== 'prefill_only' ||
      prefill.requiresParentReviewAndSave !== true ||
      prefill.route !== '/parent/task/new' ||
      prefill.childId !== profileId ||
      prefill.templateId !== 'task_recycling_p0_v1'
    ) {
      return;
    }
    const selected = setActiveChild(profileId);
    if (!selected.ok) return;
    router.push({
      pathname: '/parent/task/new',
      params: {
        prefillIntent: prefill.intent,
        prefillChildId: prefill.childId,
        prefillTemplateId: prefill.templateId,
      },
    } as unknown as Href);
  };

  const onBack = createValidatedBackHandler({
    back: access.back,
    profileId,
    safeRoot: '/parent',
    replace: (target) => router.replace(target as Href),
  });

  if (!progress.ok) {
    return (
      <R002bNestedScreen
        backLabel={t('common.back')}
        direction={direction}
        language={language}
        onBack={onBack}
        reducedMotion={reducedMotion}
        testID="r002b-parent-progress-route"
        title={t('r002bParentProgress.title')}
      >
        <R002bUnavailableState
          actionLabel={t('common.back')}
          body={t('r002bParentProgress.state.error')}
          direction={direction}
          language={language}
          onAction={onBack}
          title={t('r002bParentProgress.state.unavailable')}
        />
      </R002bNestedScreen>
    );
  }

  const presentation = createR002bParentProgressPresentation({
    projection: progress.data,
    profileName,
    profiles,
    language,
    direction,
    reducedMotion,
    translate: (key, values) => String(t(key, values)),
    onSelectProfile: replaceForProfile,
    ...(canOpenTaskBuilder ? { onOpenSuitableTask: openSuitableTask } : {}),
  });

  return (
    <R002bNestedScreen
      backLabel={t('common.back')}
      direction={direction}
      language={language}
      onBack={onBack}
      reducedMotion={reducedMotion}
      testID="r002b-parent-progress-route"
      title={t('r002bParentProgress.title')}
    >
      <ParentProgressScreen {...presentation} />
    </R002bNestedScreen>
  );
}
