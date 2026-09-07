import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafIcon } from '@/components/access';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PrimaryButton, QuietButton, SecondaryButton, Text } from '@/components/primitives';
import {
  ReturningWelcomeDialog,
  type ReturningWelcomeUpdate,
} from '@/components/session/ReturningWelcomeDialog';
import {
  ChildBottomNavigation,
  ChildGardenProgressCard,
  ChildHomeHeader,
  ChildTodayTaskCard,
  R002aScreen,
} from '@/components/r002a';
import { TodayImpactPathCard } from '@/components/r002b/GrowthJourneyScreens';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { colors, logicalRowDirection, r001Radii, r001Shadows, spacing } from '@/design/tokens';
import {
  P0_RECYCLING_TEMPLATE,
  TASK_CATEGORIES,
  TASK_TEMPLATES,
} from '@/features/tasks/demoContent';
import { useR002bGrowthPresentation } from '@/features/growth/useR002bGrowthPresentation';
import { createR002bOrigin, serializeR002bOrigin } from '@/features/navigation/r002bOrigin';
import type { R002bRouteParam } from '@/features/navigation/r002bRouteRequest';
import { localize } from '@/i18n';
import type {
  ApprovedChoiceFixture,
  LandscapeId,
  RecognitionMode,
  SyntheticChildId,
  TaskLifecycleStatus,
  TaskTemplate,
} from '@/models/familyGrowth';
import { selectCanEnterChildExperience, usePrototypeStore } from '@/state/usePrototypeStore';
import { focusAccessibilityTarget } from '@/utils/accessibilityFocus';

const LANDSCAPE_LABEL_KEYS: Readonly<Record<LandscapeId, string>> = {
  ghaf: 'garden.ghaf',
  samar: 'garden.samar',
  sidr: 'garden.sidr',
  date_palm: 'garden.datePalm',
  mangrove: 'garden.mangrove',
};

const RECOGNITION_LABEL_KEYS: Readonly<Record<RecognitionMode, string>> = {
  standard: 'taskReview.standardRecognition',
  fade_first: 'taskReview.fadeFirstRecognition',
  recognition_only: 'taskReview.recognitionOnly',
};

type CurrentWorkMode = 'choose' | 'start' | 'resume' | 'waiting' | 'paused' | 'garden';

const CURRENT_WORK_MODE_BY_LIFECYCLE: Partial<Record<TaskLifecycleStatus, CurrentWorkMode>> = {
  assigned: 'choose',
  chosen: 'start',
  in_progress: 'resume',
  submitted: 'waiting',
  retry: 'paused',
  confirmed: 'waiting',
  recognized: 'garden',
};

const STATUS_KEY_BY_LIFECYCLE: Partial<Record<TaskLifecycleStatus, string>> = {
  assigned: 'childHome.statusAvailable',
  chosen: 'childHome.statusReady',
  in_progress: 'childHome.statusActive',
  submitted: 'childHome.statusSubmitted',
  retry: 'childHome.statusRetry',
  confirmed: 'childHome.statusConfirmed',
  recognized: 'childHome.statusRecognized',
};

interface ChildHomeParams extends Record<string, R002bRouteParam> {
  readonly restoreFocusTarget?: R002bRouteParam;
  readonly restoreProfileId?: R002bRouteParam;
  readonly restoreScrollOffset?: R002bRouteParam;
}

function restoredChildHomePosition(
  params: ChildHomeParams,
  activeChildId: SyntheticChildId,
  enabled: { readonly impactPath: boolean; readonly reveal: boolean },
) {
  const profileMatches = params.restoreProfileId === activeChildId;
  const rawOffset = params.restoreScrollOffset;
  const scrollOffset =
    profileMatches &&
    typeof rawOffset === 'string' &&
    /^\d+$/u.test(rawOffset) &&
    Number(rawOffset) <= 100_000
      ? Number(rawOffset)
      : 0;
  const pathTarget = enabled.impactPath && params.restoreFocusTarget === 'r002b-today-path-action';
  const revealTarget =
    enabled.reveal &&
    (params.restoreFocusTarget === 'open-r002b-reveal-button' ||
      params.restoreFocusTarget === 'r002b-child-reveal-growth-action');
  const focusTarget =
    profileMatches && (pathTarget || revealTarget) ? params.restoreFocusTarget : undefined;
  return { focusTarget, scrollOffset } as const;
}

function templateFor(choice: ApprovedChoiceFixture): TaskTemplate | null {
  if (choice.taskTemplateId === P0_RECYCLING_TEMPLATE.id) return P0_RECYCLING_TEMPLATE;
  return TASK_TEMPLATES.find((template) => template.id === choice.taskTemplateId) ?? null;
}

export default function ChildHomeScreen() {
  const params = useLocalSearchParams() as unknown as ChildHomeParams;
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const role = usePrototypeStore((state) => state.role);
  const canEnterChildExperience = usePrototypeStore(selectCanEnterChildExperience);
  const beginTemporaryParentAccess = usePrototypeStore((state) => state.beginTemporaryParentAccess);
  const returningUserWelcome = usePrototypeStore((state) => state.returningUserWelcome);
  const dismissReturningUserWelcome = usePrototypeStore(
    (state) => state.dismissReturningUserWelcome,
  );
  const children = usePrototypeStore((state) => state.children);
  const localFamily = usePrototypeStore((state) => state.localFamily);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const choicePool = usePrototypeStore((state) => state.choicePool);
  const journey = usePrototypeStore((state) => state.journey);
  const revealBundleQueue = usePrototypeStore((state) => state.revealBundleQueue);
  const profileEpochId = usePrototypeStore(
    (state) => state.growthJourney.ledgersByProfile[state.activeChildId].profileEpochId,
  );
  const canopy = usePrototypeStore((state) => state.household.combinedCanopy);
  const chooseAssignment = usePrototypeStore((state) => state.chooseAssignment);
  const preAcceptanceAdjustment = usePrototypeStore((state) => state.preAcceptanceAdjustment);
  const requestSmallerTask = usePrototypeStore((state) => state.requestSmallerTask);
  const respondToPreAcceptanceAdjustment = usePrototypeStore(
    (state) => state.respondToPreAcceptanceAdjustment,
  );
  const [error, setError] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const r002bGrowthEnabled = role === 'child' && r002bFeatureFlags.r002b_impact_path_ui;
  const r002bRevealEnabled = role === 'child' && r002bFeatureFlags.r002b_reveal_bundle_v2;
  const restored = restoredChildHomePosition(params, activeChildId, {
    impactPath: r002bGrowthEnabled,
    reveal: r002bRevealEnabled,
  });
  const restoredFocusTarget = restored.focusTarget;
  const restoredScrollOffset = restored.scrollOffset;
  const childScrollOffsetRef = useRef(restoredScrollOffset);
  const revealReturnFocusRef = useRef<View>(null);
  const revealReturnFocusApplied = useRef(false);
  const pendingReveal = r002bRevealEnabled
    ? (revealBundleQueue.bundles.find(
        (bundle) =>
          bundle.lifecycle === 'acknowledged' &&
          bundle.profileId === activeChildId &&
          bundle.profileEpochId === profileEpochId,
      ) ??
      revealBundleQueue.bundles.find(
        (bundle) =>
          bundle.lifecycle === 'presenting' &&
          bundle.profileId === activeChildId &&
          bundle.profileEpochId === profileEpochId,
      ) ??
      revealBundleQueue.bundles.find(
        (bundle) =>
          bundle.lifecycle === 'ready' &&
          bundle.profileId === activeChildId &&
          bundle.profileEpochId === profileEpochId,
      ))
    : undefined;

  const openImpactPath = () => {
    const origin = createR002bOrigin({
      id: 'child_today_path_card',
      profileId: activeChildId,
      scrollOffset: childScrollOffsetRef.current,
    });
    if (!origin.ok) return;
    router.push({
      pathname: '/garden/impact-path',
      params: { profileId: activeChildId, ...serializeR002bOrigin(origin.data) },
    } as unknown as Href);
  };
  const openReveal = () => {
    if (!pendingReveal) return;
    const origin = createR002bOrigin({
      id: 'child_today_reveal_handoff',
      profileId: activeChildId,
      entityId: pendingReveal.id,
      scrollOffset: 0,
    });
    if (!origin.ok) return;
    router.push({
      pathname: '/child/reveal/[bundleId]',
      params: {
        bundleId: pendingReveal.id,
        profileId: activeChildId,
        ...serializeR002bOrigin(origin.data),
      },
    } as unknown as Href);
  };
  const r002bGrowth = useR002bGrowthPresentation({
    enabled: r002bGrowthEnabled,
    profileId: activeChildId,
    actions: {
      openBadge: () => undefined,
      openImpactPath,
    },
  });

  useEffect(() => {
    if (role !== 'child' || !canEnterChildExperience) router.replace('/');
  }, [canEnterChildExperience, role, router]);

  useEffect(() => {
    childScrollOffsetRef.current = restoredScrollOffset;
  }, [activeChildId, restoredScrollOffset]);

  const focusRevealReturnAfterLayout = () => {
    if (
      (restoredFocusTarget !== 'open-r002b-reveal-button' &&
        restoredFocusTarget !== 'r002b-child-reveal-growth-action') ||
      revealReturnFocusApplied.current
    ) {
      return;
    }
    revealReturnFocusApplied.current = focusAccessibilityTarget(revealReturnFocusRef.current);
  };

  const previewChoices = useMemo(
    () => choicePool.seededPreviewChoices.filter((choice) => choice.childId === activeChildId),
    [activeChildId, choicePool.seededPreviewChoices],
  );
  const currentAssignmentChoice =
    choicePool.p0AssignmentChoice?.childId === activeChildId &&
    journey?.assignment?.childId === activeChildId
      ? choicePool.p0AssignmentChoice
      : null;
  const currentTemplate =
    currentAssignmentChoice && journey?.task.templateId === currentAssignmentChoice.taskTemplateId
      ? journey.task.content
      : currentAssignmentChoice
        ? templateFor(currentAssignmentChoice)
        : null;
  const currentCategory = currentTemplate
    ? TASK_CATEGORIES.find((category) => category.id === currentTemplate.categoryId)
    : null;
  const currentWorkMode = journey
    ? (CURRENT_WORK_MODE_BY_LIFECYCLE[journey.lifecycle] ?? null)
    : null;
  const hasCurrentWork = Boolean(
    currentAssignmentChoice && currentTemplate && currentWorkMode && journey,
  );
  const choices = currentAssignmentChoice
    ? [currentAssignmentChoice, ...previewChoices]
    : previewChoices;
  const child = children[activeChildId];
  const childName =
    localFamily.record?.children.find((profile) => profile.id === activeChildId)?.nickname ??
    localize(child.displayName, locale);
  const gardenTarget = 60;
  const gardenCurrent = Math.min(child.earnedSeeds, gardenTarget);
  const gardenRemaining = Math.max(0, gardenTarget - gardenCurrent);
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE');

  const activeAdjustment =
    preAcceptanceAdjustment?.childId === activeChildId &&
    preAcceptanceAdjustment.sourceAssignmentId === journey?.assignment?.id
      ? preAcceptanceAdjustment
      : null;
  const smallerRequestPending = activeAdjustment?.status === 'parent_review_required';
  const childDecisionRequired = activeAdjustment?.status === 'child_decision_required';
  const adjustmentBlocksChoice = smallerRequestPending || childDecisionRequired;

  const choose = (choice: ApprovedChoiceFixture) => {
    setError(null);
    const result = chooseAssignment(choice.id);
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const openTask = () => {
    setError(null);
    router.push('/child/task');
  };

  const requestSmaller = () => {
    setError(null);
    const result = requestSmallerTask();
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const respondToAdjustment = (decision: 'accept' | 'keep_current') => {
    setError(null);
    const result = respondToPreAcceptanceAdjustment(decision);
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  if (role !== 'child' || !canEnterChildExperience) return null;

  const taskAction = (() => {
    switch (currentWorkMode) {
      case 'choose':
        return {
          label: t('childHome.choose'),
          onPress: () => currentAssignmentChoice && choose(currentAssignmentChoice),
          testID: 'choose-recycling-task-button',
        };
      case 'start':
        return {
          label: t('childHome.viewTask'),
          onPress: openTask,
          testID: 'start-chosen-task-button',
        };
      case 'resume':
        return {
          label: t('childHome.resumeTask'),
          onPress: openTask,
          testID: 'resume-current-task-button',
        };
      case 'waiting':
        return journey?.lifecycle === 'submitted'
          ? {
              label: t('childHome.viewSubmission'),
              onPress: openTask,
              testID: 'view-submitted-task-button',
            }
          : null;
      case 'garden':
        return pendingReveal
          ? {
              label: t('r002bReveal.action.open.label'),
              onPress: openReveal,
              testID: 'open-r002b-reveal-button',
            }
          : {
              label: t('parentHome.openGarden'),
              onPress: () => router.push('/garden'),
              testID: 'open-recognized-garden-button',
            };
      default:
        return null;
    }
  })();
  const showReturningWelcome =
    returningUserWelcome?.kind === 'returning_child' &&
    returningUserWelcome.childId === activeChildId;
  const childTaskStatus = journey
    ? t(STATUS_KEY_BY_LIFECYCLE[journey.lifecycle] ?? 'origin.prepared')
    : null;
  const childWelcomeUpdates: readonly ReturningWelcomeUpdate[] = [
    {
      body:
        journey && currentTemplate && childTaskStatus
          ? t('r003.welcomeBack.childTaskBody', {
              status: childTaskStatus,
              task:
                currentTemplate.id === P0_RECYCLING_TEMPLATE.id
                  ? t('childTask.title')
                  : localize(currentTemplate.title, locale),
            })
          : t('r003.welcomeBack.childReadyBody'),
      icon: 'leaf',
      id: 'task',
      title:
        journey && currentTemplate
          ? t('r003.welcomeBack.childTaskTitle')
          : t('r003.welcomeBack.childReadyTitle'),
    },
    {
      body: t('r003.welcomeBack.gardenBody', {
        count: formatter.format(child.earnedSeeds),
      }),
      icon: 'ghaf-tree',
      id: 'garden',
      onPress: () => {
        dismissReturningUserWelcome();
        router.push('/garden');
      },
      title: t('r003.welcomeBack.gardenTitle'),
    },
  ];

  const footer = (
    <ChildBottomNavigation
      activeKey="today"
      direction={direction}
      gardenLabel={t('navigation.childGarden')}
      leagueLabel={t('navigation.league')}
      leagueUnavailableHint={t('navigation.leagueUnavailable')}
      onGarden={() => router.push('/garden')}
      onLeague={() => router.replace('/league' as Href)}
      onToday={() => undefined}
      todayLabel={t('navigation.today')}
    />
  );

  return (
    <R002aScreen
      contentContainerStyle={styles.screenContent}
      footer={footer}
      header={
        <ChildHomeHeader
          avatarId={
            localFamily.record?.children.find((profile) => profile.id === activeChildId)?.avatarId
          }
          avatarLabel={childName}
          direction={direction}
          helpLabel={t('common.help')}
          helpOpen={helpOpen}
          onAvatarPress={() => router.push('/child/settings' as Href)}
          onToggleHelp={() => setHelpOpen((value) => !value)}
          title={t('childHome.todayTitle')}
        />
      }
      scrollProps={{
        contentOffset: { x: 0, y: restoredScrollOffset },
        onScroll: (event) => {
          childScrollOffsetRef.current = Math.max(0, Math.round(event.nativeEvent.contentOffset.y));
        },
        scrollEventThrottle: 16,
      }}
      testID="child-home-screen"
    >
      <View style={styles.welcome}>
        <Text brand color="r001Ink" direction={direction} variant="hero">
          {t('childHome.welcome', { child: childName })}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} variant="bodyLarge">
          {t(hasCurrentWork ? 'childHome.todaySummary' : 'childHome.noCurrentTaskSummary')}
        </Text>
      </View>

      {helpOpen ? (
        <View accessibilityLiveRegion="polite" style={styles.helpPanel} testID="child-help-panel">
          <View style={[styles.panelHeading, { flexDirection: logicalRowDirection(direction) }]}>
            <View style={styles.iconBubble}>
              <GhafIcon color={colors.ghafEmerald} name="help" size={24} />
            </View>
            <View style={styles.grow}>
              <Text brand color="deepForest" direction={direction} variant="label">
                {t('childHome.helpTitle')}
              </Text>
              <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                {t('childHome.helpBody')}
              </Text>
            </View>
          </View>
          <LanguageSwitcher compact showGuidance={false} />
          <QuietButton
            brand
            direction={direction}
            onPress={() => {
              setError(null);
              const result = beginTemporaryParentAccess();
              if (!result.ok) {
                setError(t('errors.safeRetry'));
                return;
              }
              router.replace('/');
            }}
            size="compact"
            testID="child-return-to-access-button"
          >
            {t('navigation.switchToParent')}
          </QuietButton>
        </View>
      ) : null}

      {childDecisionRequired && activeAdjustment.proposal ? (
        <View
          accessibilityLiveRegion="polite"
          style={styles.adjustmentPanel}
          testID="pre-acceptance-adjustment-panel"
        >
          <View style={[styles.panelHeading, { flexDirection: logicalRowDirection(direction) }]}>
            <View style={styles.iconBubble}>
              <GhafIcon color={colors.mangroveTeal} name="info" size={23} />
            </View>
            <View style={styles.grow}>
              <Text brand color="deepForest" direction={direction} variant="screenTitle">
                {t('childHome.adjustmentTitle')}
              </Text>
              <Text brand color="onSurfaceVariant" direction={direction}>
                {t('childHome.adjustmentBody')}
              </Text>
            </View>
          </View>
          <Text brand color="mangroveTeal" direction={direction} variant="label">
            {t(
              activeAdjustment.resolvedKind === 'safe_equivalent'
                ? 'childHome.safeEquivalentAlternative'
                : 'childHome.smallerAlternative',
            )}
          </Text>
          <Text brand color="deepForest" direction={direction} variant="bodyLarge">
            {localize(activeAdjustment.proposal.content.title, locale)}
          </Text>
          <View style={styles.proposalDetail}>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {t('taskReview.definition')}
            </Text>
            <Text brand direction={direction}>
              {localize(activeAdjustment.proposal.content.definitionOfDone, locale)}
            </Text>
          </View>
          <View style={styles.proposalDetail}>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {t('taskReview.safety')}
            </Text>
            <Text brand direction={direction}>
              {localize(activeAdjustment.proposal.content.safety.adultPreCheck, locale)}
            </Text>
            <Text brand color="tertiary" direction={direction} variant="label">
              {localize(activeAdjustment.proposal.content.safety.stopAndAskAdult, locale)}
            </Text>
          </View>
          <View style={styles.proposalDetail}>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {t('taskReview.help')}
            </Text>
            <Text brand direction={direction}>
              {localize(activeAdjustment.proposal.content.permittedHelp, locale)}
            </Text>
          </View>
          <Text brand color="deepForest" direction={direction} variant="label">
            {activeAdjustment.proposal.content.displayedSeedAward
              ? t('childHome.awardAfterConfirmation', {
                  count: activeAdjustment.proposal.content.displayedSeedAward,
                })
              : t('taskReview.noSeedRecognition')}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
            {t('childHome.adjustmentNoLoss')}
          </Text>
          <View style={styles.adjustmentActions}>
            <PrimaryButton
              brand
              direction={direction}
              onPress={() => respondToAdjustment('accept')}
              testID="pre-acceptance-accept-button"
            >
              {t('childHome.acceptAlternative')}
            </PrimaryButton>
            <SecondaryButton
              brand
              direction={direction}
              onPress={() => respondToAdjustment('keep_current')}
              testID="pre-acceptance-keep-button"
            >
              {t('childHome.keepCurrent')}
            </SecondaryButton>
          </View>
        </View>
      ) : null}

      {currentAssignmentChoice && currentTemplate && currentWorkMode && journey ? (
        <View style={styles.currentWork} testID="current-assignment">
          <View
            accessible
            accessibilityLabel={`${t('childHome.currentWork')}. ${formatter.format(child.earnedSeeds)} ${t('common.seedUnit')}`}
            accessibilityRole="header"
            nativeID="open-r002b-reveal-button"
            onLayout={focusRevealReturnAfterLayout}
            ref={revealReturnFocusRef}
            style={[styles.sectionHeading, { flexDirection: logicalRowDirection(direction) }]}
            testID="child-today-reveal-return-region"
          >
            <Text
              accessibilityRole="none"
              brand
              color="ghafEmerald"
              direction={direction}
              variant="screenTitle"
            >
              {t('childHome.currentWork')}
            </Text>
            <Text brand color="onSurfaceVariant" direction={direction} tabular variant="caption">
              {formatter.format(child.earnedSeeds)} {t('common.seedUnit')}
            </Text>
          </View>
          <ChildTodayTaskCard
            actionDisabled={currentWorkMode === 'choose' && adjustmentBlocksChoice}
            actionLabel={taskAction?.label}
            actionTestID={taskAction?.testID}
            awardLabel={
              currentTemplate.displayedSeedAward
                ? t('childHome.awardAfterConfirmation', {
                    count: currentTemplate.displayedSeedAward,
                  })
                : t('taskReview.noSeedRecognition')
            }
            categoryLabel={
              currentCategory ? localize(currentCategory.label, locale) : t('origin.prepared')
            }
            direction={direction}
            effortLabel={localize(currentTemplate.estimatedEffort, locale)}
            helpLabel={localize(currentTemplate.permittedHelp, locale)}
            recognitionLabel={t('taskReview.recognition')}
            recognitionValue={t(RECOGNITION_LABEL_KEYS[currentTemplate.recognitionMode])}
            onAction={taskAction?.onPress}
            onSecondaryAction={
              currentWorkMode === 'choose' && !activeAdjustment ? requestSmaller : undefined
            }
            secondaryActionLabel={
              currentWorkMode === 'choose' && !activeAdjustment
                ? t('childHome.requestSmaller')
                : undefined
            }
            secondaryActionTestID="request-smaller-task-button"
            statusLabel={t(STATUS_KEY_BY_LIFECYCLE[journey.lifecycle] ?? 'origin.prepared')}
            supervisionLabel={t('taskReview.supervision')}
            supervisionValue={localize(currentTemplate.supervision, locale)}
            title={
              currentTemplate.id === P0_RECYCLING_TEMPLATE.id
                ? t('childTask.title')
                : localize(currentTemplate.title, locale)
            }
            whyItMatters={localize(currentTemplate.whyItMatters, locale)}
            whyLabel={t('taskReview.why')}
          />
          {adjustmentBlocksChoice && currentWorkMode === 'choose' ? (
            <Text accessibilityLiveRegion="polite" brand color="tertiary" direction={direction}>
              {smallerRequestPending
                ? t('childHome.smallerRequested')
                : t('childHome.adjustmentBody')}
            </Text>
          ) : null}
          {currentWorkMode === 'waiting' ? (
            <View
              accessibilityLiveRegion="polite"
              style={styles.statusNotice}
              testID="current-task-waiting"
            >
              <GhafIcon color={colors.ghafEmerald} name="info" size={20} />
              <Text
                brand
                color="deepForest"
                direction={direction}
                style={styles.grow}
                variant="caption"
              >
                {journey.lifecycle === 'submitted'
                  ? t('childHome.waitingForParent')
                  : t('childHome.waitingForRecognition')}
              </Text>
            </View>
          ) : null}
          {currentWorkMode === 'paused' ? (
            <View accessibilityLiveRegion="polite" style={styles.statusNotice}>
              <GhafIcon color={colors.tertiary} name="info" size={20} />
              <Text
                brand
                color="tertiary"
                direction={direction}
                style={styles.grow}
                variant="caption"
              >
                {t('childHome.returnLater')}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {r002bGrowth.ok ? (
        <TodayImpactPathCard
          {...r002bGrowth.data.today}
          initialFocusTargetId={
            restoredFocusTarget === 'r002b-today-path-action' ? restoredFocusTarget : undefined
          }
          testID="r002b-today-path-card"
        />
      ) : null}

      <ChildGardenProgressCard
        actionLabel={t('childHome.visitGarden')}
        canopyLabel={t('childHome.sharedCanopyDynamic', {
          current: formatter.format(canopy.contributionLeaves),
          goal: formatter.format(canopy.goalLeaves),
        })}
        current={gardenCurrent}
        direction={direction}
        onAction={() => router.push('/garden')}
        progressLabel={t('childHome.personalGardenProgress')}
        remainingLabel={t(
          gardenRemaining > 0 ? 'childHome.gardenRemaining' : 'childHome.gardenMilestoneComplete',
          { count: formatter.format(gardenRemaining) },
        )}
        symbolicLabel={t('origin.symbolic')}
        target={gardenTarget}
        title={t('childHome.howGardenHelps')}
      />

      {previewChoices.length > 0 ? (
        <View style={styles.previewSection} testID="preview-only-choices">
          <View style={styles.previewHeading}>
            <Text brand color="deepForest" direction={direction} variant="screenTitle">
              {t('childHome.preparedChoices')}
            </Text>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {t('childHome.previewOnlyBody')}
            </Text>
          </View>
          <View style={styles.previewList}>
            {previewChoices.map((choice) => {
              const template = templateFor(choice);
              if (!template) return null;
              return (
                <View
                  key={choice.id}
                  style={[styles.previewChoice, { flexDirection: logicalRowDirection(direction) }]}
                >
                  <View style={styles.previewIcon}>
                    <GhafIcon color={colors.mangroveTeal} name="leaf" size={20} />
                  </View>
                  <View style={styles.grow}>
                    <Text brand color="deepForest" direction={direction} variant="label">
                      {localize(template.title, locale)}
                    </Text>
                    <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                      {t(LANDSCAPE_LABEL_KEYS[template.landscapeId])}
                    </Text>
                  </View>
                  <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                    {t('origin.future')}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {choices.length === 0 ? (
        <View style={styles.emptyNotice}>
          <GhafIcon color={colors.ghafEmerald} name="leaf" size={25} />
          <View style={styles.grow}>
            <Text brand color="deepForest" direction={direction} variant="label">
              {t('errors.missingTask')}
            </Text>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {t('childHome.helpWelcome')}
            </Text>
          </View>
        </View>
      ) : null}

      {error ? (
        <Text accessibilityLiveRegion="polite" brand color="danger" direction={direction}>
          {error}
        </Text>
      ) : null}
      {smallerRequestPending ? (
        <View accessibilityLiveRegion="polite" style={styles.statusNotice}>
          <GhafIcon color={colors.mangroveTeal} name="info" size={20} />
          <Text brand color="deepForest" direction={direction} style={styles.grow}>
            {t('childHome.smallerRequested')}
          </Text>
        </View>
      ) : null}
      {activeAdjustment?.status === 'accepted' ? (
        <Text accessibilityLiveRegion="polite" brand color="deepForest" direction={direction}>
          {t('childHome.adjustmentAccepted')}
        </Text>
      ) : null}
      {activeAdjustment?.status === 'kept_current' ? (
        <Text accessibilityLiveRegion="polite" brand color="deepForest" direction={direction}>
          {t('childHome.adjustmentKeptCurrent')}
        </Text>
      ) : null}
      <ReturningWelcomeDialog
        actionLabel={t('r003.welcomeBack.continue')}
        direction={direction}
        language={locale}
        message={t('r003.welcomeBack.childMessage')}
        onDismiss={dismissReturningUserWelcome}
        summaryLabel={t('r003.welcomeBack.privateSummary')}
        testID="child-returning-welcome"
        title={t('r003.welcomeBack.childTitle', {
          name: childName,
        })}
        updates={childWelcomeUpdates}
        visible={showReturningWelcome}
      />
    </R002aScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing.xxl,
  },
  welcome: {
    gap: spacing.xs,
  },
  helpPanel: {
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  panelHeading: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconBubble: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.primaryFixedTint,
  },
  grow: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  adjustmentPanel: {
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.mangroveTeal,
    backgroundColor: colors.mangroveTealTint,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  proposalDetail: {
    gap: spacing.xxs,
    borderStartWidth: 2,
    borderStartColor: colors.mangroveTeal,
    paddingStart: spacing.sm,
  },
  adjustmentActions: {
    gap: spacing.xs,
  },
  currentWork: {
    gap: spacing.md,
  },
  sectionHeading: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statusNotice: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: r001Radii.md,
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.sm,
  },
  previewSection: {
    gap: spacing.md,
  },
  previewHeading: {
    gap: spacing.xxs,
  },
  previewList: {
    overflow: 'hidden',
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  previewChoice: {
    minHeight: 72,
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceContainerHigh,
    padding: spacing.md,
  },
  previewIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.mangroveTealTint,
  },
  emptyNotice: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.xl,
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.lg,
  },
});
