import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { AccessibilityInfo } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { RevealBundleActionBar, RevealBundleScreen } from '@/components/r002b/RevealBundleScreen';
import { R002bNestedScreen } from '@/components/r002b/R002bNestedScreen';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { createRevealBundlePresentation } from '@/features/rewards/r002bRevealViewModel';
import { createValidatedBackHandler } from '@/features/navigation/r002bBack';
import { createR002bOrigin, serializeR002bOrigin } from '@/features/navigation/r002bOrigin';
import {
  resolveR002bRouteRequest,
  type R002bRouteParam,
} from '@/features/navigation/r002bRouteRequest';
import type { RevealBundle } from '@/models/revealBundle';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface RevealRouteParams extends Record<string, R002bRouteParam> {
  readonly bundleId?: R002bRouteParam;
  readonly profileId?: R002bRouteParam;
  readonly originId?: R002bRouteParam;
  readonly originProfileId?: R002bRouteParam;
  readonly originScrollOffset?: R002bRouteParam;
  readonly originFilter?: R002bRouteParam;
  readonly originEntityId?: R002bRouteParam;
}

const ALLOWED_ORIGINS = ['child_today_reveal_handoff'] as const;

function isLegacyGardenCelebrationReplacement(bundle: RevealBundle): boolean {
  if (bundle.triggerKind !== 'task_approval') return false;
  const hasSeed = bundle.items.some((receipt) => receipt.consequence.kind === 'seed');
  const hasPlantStage = bundle.items.some((receipt) => receipt.consequence.kind === 'plant_stage');
  return hasSeed && hasPlantStage;
}

function isCanonicalPendingBundle(
  queue: readonly RevealBundle[],
  bundleId: string,
  profileId: string,
  profileEpochId: string,
): boolean {
  const bundle = queue.find((candidate) => candidate.id === bundleId);
  if (
    !bundle ||
    bundle.profileId !== profileId ||
    bundle.profileEpochId !== profileEpochId ||
    (bundle.lifecycle !== 'ready' &&
      bundle.lifecycle !== 'presenting' &&
      bundle.lifecycle !== 'acknowledged')
  ) {
    return false;
  }
  const acknowledged = queue.find(
    (candidate) =>
      candidate.lifecycle === 'acknowledged' &&
      candidate.profileId === profileId &&
      candidate.profileEpochId === profileEpochId,
  );
  if (acknowledged) return acknowledged.id === bundle.id;
  const presenting = queue.find((candidate) => candidate.lifecycle === 'presenting');
  if (presenting) return presenting.id === bundle.id;
  return (
    queue.find(
      (candidate) =>
        candidate.lifecycle === 'ready' &&
        candidate.profileId === profileId &&
        candidate.profileEpochId === profileEpochId,
    )?.id === bundle.id
  );
}

export default function ChildRevealRoute() {
  const params = useLocalSearchParams() as unknown as RevealRouteParams;
  const role = usePrototypeStore((state) => state.role);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const revealBundleQueue = usePrototypeStore((state) => state.revealBundleQueue);
  const profileEpochId = usePrototypeStore(
    (state) => state.growthJourney.ledgersByProfile[state.activeChildId].profileEpochId,
  );
  const access = resolveR002bRouteRequest({
    routeId: 'child_reveal',
    role,
    activeProfileId: activeChildId,
    authorizedProfileIds: [activeChildId],
    flags: r002bFeatureFlags,
    requestedProfileParam: params.profileId,
    entityParam: params.bundleId,
    originParams: params,
    allowedOriginIds: ALLOWED_ORIGINS,
  });

  if (!access.allowed) return <Redirect href={access.fallback} />;
  const bundleId = access.entityId;
  const bundle = revealBundleQueue.bundles.find((candidate) => candidate.id === bundleId);
  if (
    !bundleId ||
    !bundle ||
    bundle.profileEpochId !== profileEpochId ||
    !isCanonicalPendingBundle(revealBundleQueue.bundles, bundleId, activeChildId, profileEpochId)
  ) {
    return <Redirect href="/child" />;
  }

  return (
    <AuthorizedChildReveal access={access} bundleId={bundleId} profileEpochId={profileEpochId} />
  );
}

function AuthorizedChildReveal({
  access,
  bundleId,
  profileEpochId,
}: {
  readonly access: Extract<ReturnType<typeof resolveR002bRouteRequest>, { allowed: true }>;
  readonly bundleId: string;
  readonly profileEpochId: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const language = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const profileId = usePrototypeStore((state) => state.activeChildId);
  const bundle = usePrototypeStore((state) =>
    state.revealBundleQueue.bundles.find((candidate) => candidate.id === bundleId),
  );
  const startRevealPresentation = usePrototypeStore((state) => state.startRevealPresentation);
  const acknowledgeRevealPresentation = usePrototypeStore(
    (state) => state.acknowledgeRevealPresentation,
  );
  const archiveRevealPresentation = usePrototypeStore((state) => state.archiveRevealPresentation);
  const consumeCelebration = usePrototypeStore((state) => state.consumeCelebration);
  const reducedMotion = Boolean(useReducedMotion());
  const [busy, setBusy] = useState(false);
  const announcedBundleRef = useRef<string | null>(null);
  const [enteredAsPresenting] = useState(() => bundle?.lifecycle === 'presenting');
  const started = bundle?.lifecycle === 'presenting';

  const restoreToday = useMemo(
    () =>
      createValidatedBackHandler({
        back: access.back,
        profileId,
        safeRoot: '/child',
        replace: (target) => router.replace(target as Href),
      }),
    [access.back, profileId, router],
  );

  const consumeReplacedLegacyCelebration = useCallback(
    (candidate: RevealBundle) => {
      if (!isLegacyGardenCelebrationReplacement(candidate)) return true;
      return consumeCelebration().ok;
    },
    [consumeCelebration],
  );

  const finishPresentation = useCallback(
    (destination: 'back' | 'growth') => {
      if (!bundle || busy) return;
      setBusy(true);
      if (bundle.lifecycle === 'ready') {
        const startedResult = startRevealPresentation(bundle.id);
        if (
          !startedResult.ok ||
          !startedResult.data.bundle ||
          startedResult.data.bundle.id !== bundle.id
        ) {
          router.replace('/child');
          return;
        }
      }
      const acknowledged = acknowledgeRevealPresentation(bundle.id);
      if (!acknowledged.ok) {
        router.replace('/child');
        return;
      }
      if (!consumeReplacedLegacyCelebration(acknowledged.data.bundle)) {
        router.replace('/child');
        return;
      }
      const archived = archiveRevealPresentation(bundle.id);
      if (!archived.ok) {
        router.replace('/child');
        return;
      }
      if (destination === 'back') {
        restoreToday();
        return;
      }
      const origin = createR002bOrigin({
        id: 'child_reveal_growth_action',
        profileId,
        entityId: bundle.id,
        scrollOffset: 0,
      });
      if (!origin.ok) {
        router.replace('/child');
        return;
      }
      router.replace({
        pathname: '/garden/impact-path',
        params: { profileId, ...serializeR002bOrigin(origin.data) },
      } as unknown as Href);
    },
    [
      acknowledgeRevealPresentation,
      archiveRevealPresentation,
      bundle,
      busy,
      consumeReplacedLegacyCelebration,
      profileId,
      restoreToday,
      router,
      startRevealPresentation,
    ],
  );

  const dismissPresentation = useCallback(() => finishPresentation('back'), [finishPresentation]);

  useEffect(() => {
    if (bundle?.lifecycle !== 'ready') return;
    const result = startRevealPresentation(bundle.id);
    if (!result.ok || !result.data.bundle || result.data.bundle.id !== bundle.id) {
      router.replace('/child');
    }
  }, [bundle, router, startRevealPresentation]);

  useEffect(() => {
    if (bundle?.lifecycle !== 'acknowledged') return;
    if (!consumeReplacedLegacyCelebration(bundle)) {
      router.replace('/child');
      return;
    }
    const archived = archiveRevealPresentation(bundle.id);
    if (!archived.ok) {
      router.replace('/child');
      return;
    }
    restoreToday();
  }, [archiveRevealPresentation, bundle, consumeReplacedLegacyCelebration, restoreToday, router]);

  useEffect(() => {
    if (!bundle || !started || announcedBundleRef.current === bundle.id) return;
    announcedBundleRef.current = bundle.id;
    const state = enteredAsPresenting ? 'recovered' : 'presenting';
    AccessibilityInfo.announceForAccessibility(
      `${String(t('r002bReveal.title'))}. ${String(t(`r002bReveal.state.${state}`))}`,
    );
  }, [bundle, enteredAsPresenting, started, t]);

  if (!bundle || bundle.profileEpochId !== profileEpochId) return <Redirect href="/child" />;
  if (bundle.lifecycle === 'acknowledged') return null;
  const presentation = createRevealBundlePresentation({
    bundle,
    profileId,
    profileEpochId,
    language,
    direction,
    reducedMotion,
    recoveryState: enteredAsPresenting ? 'recovered' : 'stable',
    submitting: busy || !started,
    translate: (key, values) => String(t(key, values)),
    onAcknowledge: dismissPresentation,
    onOpenGrowth: r002bFeatureFlags.r002b_impact_path_ui
      ? () => finishPresentation('growth')
      : undefined,
    onRecover: dismissPresentation,
  });
  if (!presentation.ok) return <Redirect href="/child" />;

  return (
    <R002bNestedScreen
      accessibilityViewIsModal
      backLabel={t('common.back')}
      direction={direction}
      footer={<RevealBundleActionBar {...presentation.data.actions} />}
      language={language}
      onBack={dismissPresentation}
      reducedMotion={reducedMotion}
      testID="r002b-child-reveal-route"
      title={t('r002bReveal.title')}
    >
      <RevealBundleScreen initialFocus {...presentation.data.screen} />
    </R002bNestedScreen>
  );
}
