import { useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { R002bNestedScreen } from '@/components/r002b/R002bNestedScreen';
import {
  ParentSharedGardenScreen,
  type ParentSharedGardenContentState,
} from '@/components/r002b/SharedGrowthScreens';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { createValidatedBackHandler } from '@/features/navigation/r002bBack';
import {
  resolveR002bRouteRequest,
  type R002bRouteParam,
} from '@/features/navigation/r002bRouteRequest';
import { createR002bParentSharedGardenPresentation } from '@/features/shared-growth/r002bSharedGrowthViewModel';
import type { SyntheticChildId } from '@/models/familyGrowth';
import type { SharedGrowthParticipationAction } from '@/models/sharedGrowth';
import { selectCanEnterParentExperience, usePrototypeStore } from '@/state/usePrototypeStore';

interface ParentSharedGardenParams extends Record<string, R002bRouteParam> {
  readonly profileId?: R002bRouteParam;
  readonly originId?: R002bRouteParam;
  readonly originProfileId?: R002bRouteParam;
  readonly originScrollOffset?: R002bRouteParam;
}

const ALLOWED_ORIGINS = ['parent_garden_shared_settings_card'] as const;

function deterministicActionTime(revision: number): string {
  const baseMinute = 3 * 24 * 60 + 10 * 60;
  const boundedOffset = Math.min(38_000, Math.max(1, revision + 1));
  const monthMinute = baseMinute + boundedOffset;
  const day = String(Math.floor(monthMinute / (24 * 60)) + 1).padStart(2, '0');
  const dayMinute = monthMinute % (24 * 60);
  const hour = String(Math.floor(dayMinute / 60)).padStart(2, '0');
  const minute = String(dayMinute % 60).padStart(2, '0');
  return `2026-09-${day}T${hour}:${minute}:00.000Z`;
}

export default function ParentSharedGardenRoute() {
  const params = useLocalSearchParams() as unknown as ParentSharedGardenParams;
  const role = usePrototypeStore((state) => state.role);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const children = usePrototypeStore((state) => state.children);
  const access = resolveR002bRouteRequest({
    routeId: 'parent_shared_garden',
    role,
    activeProfileId: activeChildId,
    authorizedProfileIds: Object.keys(children),
    flags: r002bFeatureFlags,
    requestedProfileParam: params.profileId,
    entityParam: undefined,
    originParams: params,
    allowedOriginIds: ALLOWED_ORIGINS,
  });

  if (!access.allowed) return <Redirect href={access.fallback} />;

  return (
    <AuthorizedParentSharedGarden
      access={access}
      profileId={access.requestedProfileId as SyntheticChildId}
    />
  );
}

function AuthorizedParentSharedGarden({
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
  const canEnterParentExperience = usePrototypeStore(selectCanEnterParentExperience);
  const authorizeParentExperience = usePrototypeStore((state) => state.authorizeParentExperience);
  const preference = usePrototypeStore((state) => state.sharedGrowth.preference);
  const changeSharedGrowthParticipation = usePrototypeStore(
    (state) => state.changeSharedGrowthParticipation,
  );
  const reducedMotion = Boolean(useReducedMotion());
  const [confirmationAction, setConfirmationAction] = useState<SharedGrowthParticipationAction>();
  const [pendingAction, setPendingAction] = useState<SharedGrowthParticipationAction>();
  const [contentState, setContentState] = useState<ParentSharedGardenContentState>('ready');
  const parentAuthorization = canEnterParentExperience ? authorizeParentExperience() : null;
  const contributionEnabled = r002bFeatureFlags.r002b_shared_growth_contribution;
  const onBack = createValidatedBackHandler({
    back: access.back,
    profileId,
    safeRoot: '/parent',
    canGoBack: () => router.canGoBack(),
    goBack: () => router.back(),
    replace: (target) => router.replace(target as Href),
  });

  if (!parentAuthorization?.ok) return <Redirect href="/access/parent/sign-in" />;

  const applyAction = (action: SharedGrowthParticipationAction) => {
    if (!contributionEnabled) return;
    const revision = preference.revision + 1;
    const actionId = `shared-growth-ui-${preference.participationEpochId}-${revision}-${action}`;
    const proofId = `shared-growth-ui-proof-${preference.participationEpochId}-${revision}`;
    const actedAt = deterministicActionTime(preference.revision);
    setConfirmationAction(undefined);
    setPendingAction(action);
    setContentState('submitting');
    const result = changeSharedGrowthParticipation({
      actionId,
      action,
      actedAt,
      proofId,
      freshConsentConfirmed: preference.status === 'ended' && action === 'continue',
    });
    setPendingAction(undefined);
    setContentState(
      result.ok ? (result.data.disposition === 'already_applied' ? 'duplicate' : 'saved') : 'error',
    );
  };
  const recoverFromError = () => {
    setConfirmationAction(undefined);
    setPendingAction(undefined);
    setContentState('ready');
  };
  const presentation = createR002bParentSharedGardenPresentation({
    preference,
    language,
    direction,
    reducedMotion,
    contributionEnabled,
    contentState,
    confirmationAction,
    pendingAction,
    translate: (key, values) => String(t(key, values)),
    onAction: applyAction,
    onCancelConfirmation: () => setConfirmationAction(undefined),
    onRecover: recoverFromError,
    onRequestConfirmation: setConfirmationAction,
  });

  return (
    <R002bNestedScreen
      backLabel={t('r002bSharedGrowth.common.back')}
      direction={direction}
      language={language}
      onBack={onBack}
      reducedMotion={reducedMotion}
      testID="r002b-parent-shared-garden-route"
      title={presentation.title}
    >
      <ParentSharedGardenScreen {...presentation} />
    </R002bNestedScreen>
  );
}
