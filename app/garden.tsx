import { useMemo, useRef, useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { GhafIcon } from '@/components/access';
import { FamilyCanopy } from '@/components/family-growth/FamilyCanopy';
import {
  GardenLandscape,
  type LandscapeTrackContent,
} from '@/components/family-growth/GardenLandscape';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PrimaryButton, QuietButton, Text } from '@/components/primitives';
import {
  ChildBottomNavigation,
  ChildHomeHeader,
  ParentHomeHeader,
  ParentHomeNavigation,
  R002aScreen,
} from '@/components/r002a';
import { R003Status } from '@/components/r003';
import { GardenChapterModule } from '@/components/r002b/GrowthJourneyScreens';
import { SharedGrowthEntryCard } from '@/components/r002b/SharedGrowthScreens';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import {
  colors,
  layout,
  logicalRowDirection,
  r001Radii,
  r001Shadows,
  spacing,
} from '@/design/tokens';
import { buildRecognitionAnnouncement } from '@/features/garden/announcements';
import {
  deriveLandscapeDisplayTarget,
  resolveActiveGardenRecognition,
} from '@/features/garden/presentation';
import { useR002bGrowthPresentation } from '@/features/growth/useR002bGrowthPresentation';
import { createR002bOrigin, serializeR002bOrigin } from '@/features/navigation/r002bOrigin';
import type { R002bRouteParam } from '@/features/navigation/r002bRouteRequest';
import { localize } from '@/i18n';
import type { LandscapeId, TextDirection } from '@/models/familyGrowth';
import {
  selectCanEnterChildExperience,
  selectHasActiveParentExperience,
  usePrototypeStore,
} from '@/state/usePrototypeStore';

const LANDSCAPE_IDS: readonly LandscapeId[] = ['mangrove', 'ghaf', 'samar', 'sidr', 'date_palm'];

const LANDSCAPE_LABEL_KEYS: Readonly<Record<LandscapeId, string>> = {
  mangrove: 'garden.mangrove',
  ghaf: 'garden.ghaf',
  samar: 'garden.samar',
  sidr: 'garden.sidr',
  date_palm: 'garden.datePalm',
};

type LandscapeTrackEntry = readonly [LandscapeId, LandscapeTrackContent];

type GardenRestoreFocusTarget =
  | 'r002b-garden-path-action'
  | 'r002b-garden-badges-action'
  | 'r002b-garden-shared-growth-card'
  | 'r002b-parent-garden-shared-settings-card';

interface GardenRouteParams extends Record<string, R002bRouteParam> {
  readonly restoreFocusTarget?: R002bRouteParam;
  readonly restoreProfileId?: R002bRouteParam;
  readonly restoreScrollOffset?: R002bRouteParam;
}

export default function GardenScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as GardenRouteParams;
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const reducedMotion = Boolean(useReducedMotion());
  const role = usePrototypeStore((state) => state.role);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const children = usePrototypeStore((state) => state.children);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const journey = usePrototypeStore((state) => state.journey);
  const landscapeProgress = usePrototypeStore((state) => state.landscapeProgress);
  const canopy = usePrototypeStore((state) => state.household.combinedCanopy);
  const celebration = usePrototypeStore((state) => state.celebration);
  const circleGoal = usePrototypeStore((state) => state.circleGoal);
  const recognitionLedger = usePrototypeStore((state) => state.recognitionLedger);
  const hasActiveParentExperience = usePrototypeStore(selectHasActiveParentExperience);
  const hasActiveChildExperience = usePrototypeStore(selectCanEnterChildExperience);
  const signOutExperience = usePrototypeStore((state) => state.signOutExperience);
  const consumeCelebration = usePrototypeStore((state) => state.consumeCelebration);
  const [helpOpen, setHelpOpen] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const r002bGrowthEnabled =
    role === 'child' &&
    (r002bFeatureFlags.r002b_impact_path_ui || r002bFeatureFlags.r002b_badges_ui);
  const r002bSharedGrowthEnabled = r002bFeatureFlags.r002b_shared_growth_view;
  const restoreProfileId =
    typeof params.restoreProfileId === 'string' ? params.restoreProfileId : undefined;
  const requestedRestoreFocus =
    typeof params.restoreFocusTarget === 'string' ? params.restoreFocusTarget : undefined;
  const allowedRestoreFocus: GardenRestoreFocusTarget | undefined =
    role === 'child' &&
    r002bFeatureFlags.r002b_impact_path_ui &&
    requestedRestoreFocus === 'r002b-garden-path-action'
      ? requestedRestoreFocus
      : role === 'child' &&
          r002bFeatureFlags.r002b_badges_ui &&
          requestedRestoreFocus === 'r002b-garden-badges-action'
        ? requestedRestoreFocus
        : role === 'child' &&
            r002bSharedGrowthEnabled &&
            requestedRestoreFocus === 'r002b-garden-shared-growth-card'
          ? requestedRestoreFocus
          : role === 'parent' &&
              r002bSharedGrowthEnabled &&
              requestedRestoreFocus === 'r002b-parent-garden-shared-settings-card'
            ? requestedRestoreFocus
            : undefined;
  const restoredFocusTarget = restoreProfileId === activeChildId ? allowedRestoreFocus : undefined;
  const rawRestoreScrollOffset = params.restoreScrollOffset;
  const restoredScrollOffset =
    restoredFocusTarget &&
    typeof rawRestoreScrollOffset === 'string' &&
    /^\d+$/u.test(rawRestoreScrollOffset) &&
    Number(rawRestoreScrollOffset) <= 100_000
      ? Number(rawRestoreScrollOffset)
      : 0;
  const gardenScrollOffsetRef = useRef(restoredScrollOffset);
  const openImpactPath = () => {
    const origin = createR002bOrigin({
      id: 'child_garden_path_card',
      profileId: activeChildId,
      scrollOffset: gardenScrollOffsetRef.current,
    });
    if (!origin.ok) return;
    router.push({
      pathname: '/garden/impact-path',
      params: { profileId: activeChildId, ...serializeR002bOrigin(origin.data) },
    } as unknown as Href);
  };
  const openBadges = () => {
    const origin = createR002bOrigin({
      id: 'child_garden_badges_card',
      profileId: activeChildId,
      scrollOffset: gardenScrollOffsetRef.current,
    });
    if (!origin.ok) return;
    router.push({
      pathname: '/garden/badges',
      params: { profileId: activeChildId, ...serializeR002bOrigin(origin.data) },
    } as unknown as Href);
  };
  const openSharedGrowth = () => {
    const origin = createR002bOrigin({
      id: 'child_garden_shared_growth_card',
      profileId: activeChildId,
      scrollOffset: gardenScrollOffsetRef.current,
    });
    if (!origin.ok) return;
    router.push({
      pathname: '/circle/shared-growth',
      params: { profileId: activeChildId, ...serializeR002bOrigin(origin.data) },
    } as unknown as Href);
  };
  const openParentSharedGarden = () => {
    const origin = createR002bOrigin({
      id: 'parent_garden_shared_settings_card',
      profileId: activeChildId,
      scrollOffset: gardenScrollOffsetRef.current,
    });
    if (!origin.ok) return;
    router.push({
      pathname: '/parent/family/shared-garden',
      params: { profileId: activeChildId, ...serializeR002bOrigin(origin.data) },
    } as unknown as Href);
  };
  const r002bGrowth = useR002bGrowthPresentation({
    enabled: r002bGrowthEnabled,
    profileId: activeChildId,
    actions: {
      openBadge: () => undefined,
      ...(r002bFeatureFlags.r002b_impact_path_ui ? { openImpactPath } : {}),
      ...(r002bFeatureFlags.r002b_badges_ui ? { openBadges } : {}),
    },
  });
  const formatter = useMemo(
    () => new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', { useGrouping: false }),
    [locale],
  );
  const activeChild = children[activeChildId];
  const activeRecognition = resolveActiveGardenRecognition({
    activeChildId,
    journey,
    recognitionLedger,
  });
  const matchingGrowth = activeRecognition?.growth ?? null;
  const [revealOnMount] = useState(
    () =>
      matchingGrowth !== null && celebration.available === true && celebration.consumed === false,
  );

  const recognitionAnnouncement = activeRecognition
    ? buildRecognitionAnnouncement({
        award: activeRecognition.receipt.seedTransaction
          ? t('common.seeds', {
              count: formatter.format(activeRecognition.receipt.seedTransaction.amount),
            })
          : null,
        landscape: matchingGrowth
          ? t('garden.stageChange', {
              landscape: t(LANDSCAPE_LABEL_KEYS[matchingGrowth.landscapeId]),
              stage: t(`garden.${matchingGrowth.stageAfter}`),
            })
          : null,
        canopy: activeRecognition.receipt.canopyContribution ? t('garden.canopy') : null,
        circle: activeRecognition.receipt.circleEvent
          ? circleGoal.eligibleGreenActions >= circleGoal.goal
            ? `${t('circle.milestone')}. ${t('circle.progress', {
                current: formatter.format(circleGoal.eligibleGreenActions),
                goal: formatter.format(circleGoal.goal),
              })}`
            : t('circle.contribution')
          : null,
      })
    : '';

  const trackEntries = LANDSCAPE_IDS.map((id): LandscapeTrackEntry | null => {
    const progress = landscapeProgress[id];
    const exactGrowth = matchingGrowth?.landscapeId === id ? matchingGrowth : null;
    const target =
      progress?.landscapeId === id ? deriveLandscapeDisplayTarget(progress, exactGrowth) : null;
    if (target === null) return null;

    const currentLabel = formatter.format(progress.cumulativeSeeds);
    const targetLabel = formatter.format(target);
    const reachedNow =
      exactGrowth?.seedsAfter === progress.cumulativeSeeds &&
      exactGrowth.crossedThreshold === progress.cumulativeSeeds;
    const progressLabel = reachedNow
      ? t('garden.progressReached', { current: currentLabel, target: targetLabel })
      : t('garden.progressToward', { current: currentLabel, target: targetLabel });
    const content: LandscapeTrackContent = {
      accessibilityLabel: `${t(LANDSCAPE_LABEL_KEYS[id])}. ${t(
        `garden.${progress.stage}`,
      )}. ${progressLabel}`,
      categoryLabel: id === 'mangrove' ? t('garden.greenCategory') : t('garden.otherCategory'),
      cumulativeSeeds: progress.cumulativeSeeds,
      name: t(LANDSCAPE_LABEL_KEYS[id]),
      originNote: t('origin.symbolic'),
      progressLabel,
      stage: progress.stage,
      stageLabel: t(`garden.${progress.stage}`),
      targetSeeds: target,
    };
    return [id, content];
  });
  const validTrackEntries = trackEntries.filter(
    (entry): entry is LandscapeTrackEntry => entry !== null,
  );
  const tracks =
    validTrackEntries.length === LANDSCAPE_IDS.length
      ? (Object.fromEntries(validTrackEntries) as Record<LandscapeId, LandscapeTrackContent>)
      : null;

  const openCircle = () => {
    if (revealOnMount) {
      const result = consumeCelebration();
      if (!result.ok) {
        setTransitionError(t('errors.safeRetry'));
        return;
      }
    }
    router.push('/circle');
  };

  if (activeExperience === 'signed_out') return <Redirect href="/" />;
  if (activeExperience === 'parent' && !hasActiveParentExperience) return <Redirect href="/" />;
  if (activeExperience === 'child' && !hasActiveChildExperience) return <Redirect href="/" />;
  if ((role !== 'parent' && role !== 'child') || !activeChild) {
    return <Redirect href="/" />;
  }

  const header =
    role === 'parent' ? (
      <ParentHomeHeader
        direction={direction}
        onToggleSettings={() => router.push('/parent/settings' as Href)}
        profileLabel={t('parentHome.selectedChild', {
          child: localize(activeChild.displayName, locale),
        })}
        settingsLabel={t('parentHome.settingsLabel')}
        settingsOpen={false}
        title={t('garden.screenTitle')}
      />
    ) : (
      <ChildHomeHeader
        avatarLabel={localize(activeChild.displayName, locale)}
        direction={direction}
        helpLabel={t('common.help')}
        helpOpen={helpOpen}
        onAvatarPress={() => router.push('/child/settings' as Href)}
        onToggleHelp={() => setHelpOpen((value) => !value)}
        title={t('garden.screenTitle')}
      />
    );

  const footer =
    role === 'parent' ? (
      <ParentHomeNavigation
        activeKey="garden"
        direction={direction}
        familyLabel={t('navigation.family')}
        gardenLabel={t('navigation.garden')}
        homeLabel={t('parentHome.homeLabel')}
        onFamily={() => router.push('/parent/family' as Href)}
        onGarden={() => undefined}
        onHome={() => router.replace('/parent')}
        onTasks={() => router.replace({ pathname: '/parent', params: { section: 'tasks' } })}
        tasksLabel={t('parentHome.tasksLabel')}
      />
    ) : (
      <ChildBottomNavigation
        activeKey="garden"
        direction={direction}
        gardenLabel={t('navigation.childGarden')}
        leagueLabel={t('navigation.league')}
        leagueUnavailableHint={t('navigation.leagueUnavailable')}
        onGarden={() => undefined}
        onLeague={() => router.replace('/league' as Href)}
        onToday={() => router.replace('/child')}
        todayLabel={t('navigation.today')}
      />
    );

  return (
    <R002aScreen
      contentContainerStyle={styles.screenContent}
      footer={footer}
      header={header}
      scrollProps={{
        contentOffset: { x: 0, y: restoredScrollOffset },
        onScroll: (event) => {
          gardenScrollOffsetRef.current = Math.max(
            0,
            Math.round(event.nativeEvent.contentOffset.y),
          );
        },
        scrollEventThrottle: 16,
      }}
      testID="garden-screen"
    >
      {role === 'child' && helpOpen ? (
        <ChildGardenHelp
          direction={direction}
          onLeave={() => {
            setTransitionError(null);
            const result = signOutExperience();
            if (!result.ok) {
              setTransitionError(t('errors.safeRetry'));
              return;
            }
            router.replace('/');
          }}
        />
      ) : null}

      {transitionError ? (
        <R003Status
          direction={direction}
          language={locale}
          message={transitionError}
          tone="warning"
        />
      ) : null}

      <View style={styles.intro}>
        <View style={[styles.contextRow, { flexDirection: logicalRowDirection(direction) }]}>
          <View style={styles.contextIcon}>
            <GhafIcon color={colors.ghafEmerald} name="flower" size={24} />
          </View>
          <View style={styles.contextCopy}>
            <Text brand color="primary" direction={direction} variant="label">
              {t('garden.profileContext', { child: localize(activeChild.displayName, locale) })}
            </Text>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {t('origin.symbolic')}
            </Text>
          </View>
        </View>
        <Text brand color="deepForest" direction={direction} variant="parentHero">
          {t('garden.title')}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} variant="bodyLarge">
          {t('garden.body')}
        </Text>
      </View>

      {matchingGrowth && activeRecognition ? (
        <View
          accessibilityLiveRegion="polite"
          style={styles.causeRecord}
          testID="garden-cause-record"
        >
          <View style={[styles.causeHeading, { flexDirection: logicalRowDirection(direction) }]}>
            <View style={styles.causeIcon}>
              <GhafIcon color={colors.tertiary} name="sparkle" size={24} />
            </View>
            <Text brand color="tertiary" direction={direction} style={styles.flex} variant="label">
              {t('checkIn.praiseLabel')}
            </Text>
            <View style={styles.growthPill}>
              <Text brand color="primary" direction={direction} tabular variant="caption">
                {t('garden.progressReached', {
                  current: formatter.format(matchingGrowth.seedsAfter),
                  target: formatter.format(
                    matchingGrowth.crossedThreshold ?? matchingGrowth.seedsAfter,
                  ),
                })}
              </Text>
            </View>
          </View>
          <Text brand color="deepForest" direction={direction} variant="screenTitle">
            {activeRecognition.journey.checkIn?.praise
              ? localize(activeRecognition.journey.checkIn.praise, locale)
              : t('garden.causeDefault', {
                  landscape: t(LANDSCAPE_LABEL_KEYS[matchingGrowth.landscapeId]),
                })}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} variant="body">
            {t('garden.causeDefault', {
              landscape: t(LANDSCAPE_LABEL_KEYS[matchingGrowth.landscapeId]),
            })}
          </Text>
        </View>
      ) : null}

      {tracks ? (
        <GardenLandscape
          accessibilityLabel={`${t('garden.title')}. ${tracks.mangrove.accessibilityLabel}`}
          activeLandscapeId="mangrove"
          labels={{
            activeTrack: t(matchingGrowth ? 'garden.activeTrack' : 'garden.focusTrack'),
            inspiredBy: t('garden.inspiredBy'),
            symbolicDisclosure: t('garden.symbolicDisclosure'),
          }}
          recognitionReveal={
            matchingGrowth && activeRecognition
              ? {
                  accessibilityAnnouncement: recognitionAnnouncement,
                  play: revealOnMount,
                  sequenceKey: activeRecognition.recognitionKey,
                }
              : undefined
          }
          testID="uae-landscape-tracks"
          tracks={tracks}
        />
      ) : (
        <GardenDataUnavailable
          direction={direction}
          onReturn={() => router.replace(role === 'parent' ? '/parent' : '/child')}
        />
      )}

      {role === 'child' && r002bGrowthEnabled && r002bGrowth.ok ? (
        <GardenChapterModule
          {...r002bGrowth.data.garden}
          initialFocusTargetId={restoredFocusTarget}
          testID="r002b-garden-chapter"
        />
      ) : null}

      {role === 'child' && r002bSharedGrowthEnabled ? (
        <SharedGrowthEntryCard
          actionLabel={t('r002bGrowth.chapter.sharedGrowthAction')}
          body={t('r002bGrowth.chapter.sharedGrowthEntryDescription')}
          direction={direction}
          language={locale}
          onPress={openSharedGrowth}
          reducedMotion={reducedMotion}
          restoreFocus={restoredFocusTarget === 'r002b-garden-shared-growth-card'}
          statusLabel={t('r002bGrowth.chapter.sharedGrowthStatus')}
          testID="r002b-garden-shared-growth-card"
          title={t('r002bGrowth.chapter.sharedGrowthEntryTitle')}
          tone="child"
        />
      ) : null}

      {role === 'parent' && r002bSharedGrowthEnabled ? (
        <SharedGrowthEntryCard
          actionLabel={t('r002bSharedGrowth.parent.entryAction')}
          body={t('r002bSharedGrowth.parent.entryBody')}
          direction={direction}
          language={locale}
          onPress={openParentSharedGarden}
          reducedMotion={reducedMotion}
          restoreFocus={restoredFocusTarget === 'r002b-parent-garden-shared-settings-card'}
          statusLabel={t('r002bSharedGrowth.parent.entryStatus')}
          testID="r002b-parent-garden-shared-settings-card"
          title={t('r002bSharedGrowth.parent.entryTitle')}
          tone="parent"
        />
      ) : null}

      <FamilyCanopy
        accessibilityLabel={`${t('parentHome.canopyTitle')}. ${t('accessibility.progress', {
          current: formatter.format(canopy.contributionLeaves),
          goal: formatter.format(canopy.goalLeaves),
        })}`}
        contributionLeaves={canopy.contributionLeaves}
        goalLeaves={canopy.goalLeaves}
        highlightLatestContribution={Boolean(activeRecognition?.receipt.canopyContribution)}
        latestContributionLabel={
          activeRecognition?.receipt.canopyContribution ? t('garden.canopy') : undefined
        }
        meaning={t('parentHome.canopyMeaning')}
        progressAccessibilityLabel={t('accessibility.progress', {
          current: formatter.format(canopy.contributionLeaves),
          goal: formatter.format(canopy.goalLeaves),
        })}
        progressLabel={t('parentHome.canopyProgressLive', {
          current: formatter.format(canopy.contributionLeaves),
          goal: formatter.format(canopy.goalLeaves),
        })}
        testID="recognized-family-canopy"
        title={t('parentHome.canopyTitle')}
      />

      <View style={styles.symbolicBoundary}>
        <View style={[styles.disclosureHeading, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.ghafEmerald} name="info" size={22} />
          <Text brand color="primary" direction={direction} style={styles.flex} variant="label">
            {t('garden.symbolicDisclosure')}
          </Text>
        </View>
        <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
          {t('origin.synthetic')}
        </Text>
      </View>

      <PrimaryButton
        brand
        direction={direction}
        icon={
          <GhafIcon
            color={colors.onPrimary}
            direction={direction === 'rtl' ? 'ltr' : 'rtl'}
            name="arrow-back"
            size={24}
          />
        }
        iconPosition="end"
        onPress={openCircle}
        size="regular"
        testID="open-circle-button"
      >
        {t('garden.circleAction')}
      </PrimaryButton>
    </R002aScreen>
  );
}

function ChildGardenHelp({
  direction,
  onLeave,
}: {
  direction: TextDirection;
  onLeave: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View accessibilityLiveRegion="polite" style={styles.helpPanel} testID="garden-help-panel">
      <View style={[styles.helpHeading, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={styles.contextIcon}>
          <GhafIcon color={colors.ghafEmerald} name="help" size={24} />
        </View>
        <View style={styles.contextCopy}>
          <Text brand color="deepForest" direction={direction} variant="label">
            {t('garden.helpTitle')}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
            {t('garden.helpBody')}
          </Text>
        </View>
      </View>
      <LanguageSwitcher compact showGuidance={false} />
      <QuietButton
        brand
        direction={direction}
        onPress={onLeave}
        size="compact"
        testID="garden-return-to-access-button"
      >
        {t('navigation.switchToParent')}
      </QuietButton>
    </View>
  );
}

function GardenDataUnavailable({
  direction,
  onReturn,
}: {
  direction: TextDirection;
  onReturn: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLiveRegion="polite"
      style={styles.unavailablePanel}
      testID="garden-data-unavailable"
    >
      <View style={[styles.disclosureHeading, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon color={colors.error} name="info" size={22} />
        <Text brand color="error" direction={direction} style={styles.flex} variant="label">
          {t('garden.unavailableTitle')}
        </Text>
      </View>
      <Text brand color="onSurfaceVariant" direction={direction} variant="body">
        {t('garden.unavailableBody')}
      </Text>
      <QuietButton
        brand
        direction={direction}
        onPress={onReturn}
        size="compact"
        testID="garden-unavailable-return-button"
      >
        {t('garden.unavailableAction')}
      </QuietButton>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing.xxl,
  },
  intro: {
    minWidth: 0,
    gap: spacing.xs,
  },
  contextRow: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  contextIcon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.primaryFixedTint,
  },
  contextCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  helpPanel: {
    minWidth: 0,
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  helpHeading: {
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  causeRecord: {
    minWidth: 0,
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.solarAmberBorder,
    backgroundColor: colors.solarAmberTint,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  causeHeading: {
    minWidth: 0,
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  causeIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLowest,
  },
  growthPill: {
    minHeight: 32,
    maxWidth: '100%',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  symbolicBoundary: {
    minWidth: 0,
    gap: spacing.xs,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.secondaryFixedDim,
    backgroundColor: colors.secondaryTint,
    padding: spacing.md,
  },
  unavailablePanel: {
    minWidth: 0,
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.errorContainer,
    padding: spacing.lg,
  },
  disclosureHeading: {
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  flex: {
    minWidth: 0,
    flex: 1,
  },
});
