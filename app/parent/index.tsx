import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ParentPatternSummary } from '@/components/family-growth/ParentPatternSummary';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button, Screen, Text } from '@/components/primitives';
import { GhafIcon } from '@/components/access';
import {
  ParentAdjustmentReview,
  ParentCanopySummaryCard,
  ParentChildrenSection,
  ParentHomeHeader,
  ParentHomeNavigation,
  ParentHomeUtilities,
  ParentLifecycleCard,
  ParentTasksView,
  R002aScreen,
  type ParentChildSummaryItem,
} from '@/components/r002a';
import { colors, layout, logicalRowDirection, opacity, r001Radii, spacing } from '@/design/tokens';
import { PARENT_NEXT_ACTIONS } from '@/features/family/overview';
import { P0_SAFE_EQUIVALENT_TEMPLATE } from '@/features/tasks/demoContent';
import { localize } from '@/i18n';
import type {
  ProspectiveTaskAdjustmentKind,
  SyntheticChildId,
  TaskLifecycleStatus,
} from '@/models/familyGrowth';
import { PARENT_SUMMARY_FIXTURE, serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { replaceHistoryWithEntry } from '@/utils/navigation';

type ParentSection = 'home' | 'tasks';
type TaskListFilter = 'assigned' | 'pending' | 'completed';

function taskFilterForLifecycle(lifecycle: TaskLifecycleStatus): TaskListFilter {
  if (lifecycle === 'submitted' || lifecycle === 'retry' || lifecycle === 'confirmed') {
    return 'pending';
  }
  if (lifecycle === 'recognized') return 'completed';
  return 'assigned';
}

function taskStatusKey(lifecycle: TaskLifecycleStatus) {
  const keys: Record<TaskLifecycleStatus, string> = {
    draft: 'r002aTasks.statusDraft',
    reviewed: 'r002aTasks.statusReviewed',
    assigned: 'r002aTasks.statusAssigned',
    chosen: 'r002aTasks.statusChosen',
    in_progress: 'r002aTasks.statusInProgress',
    retry: 'r002aTasks.statusRetry',
    submitted: 'r002aTasks.statusSubmitted',
    confirmed: 'r002aTasks.statusConfirmed',
    recognized: 'r002aTasks.statusRecognized',
  };
  return keys[lifecycle];
}

export default function ParentHomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ added?: string; section?: string }>();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const role = usePrototypeStore((state) => state.role);
  const householdName = usePrototypeStore((state) => state.household.displayName);
  const canopy = usePrototypeStore((state) => state.household.combinedCanopy);
  const children = usePrototypeStore((state) => state.children);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const journey = usePrototypeStore((state) => state.journey);
  const preAcceptanceAdjustment = usePrototypeStore((state) => state.preAcceptanceAdjustment);
  const resolvePreAcceptanceAdjustment = usePrototypeStore(
    (state) => state.resolvePreAcceptanceAdjustment,
  );
  const resetPrototype = usePrototypeStore((state) => state.resetPrototype);
  const setActiveChild = usePrototypeStore((state) => state.setActiveChild);
  const setRole = usePrototypeStore((state) => state.setRole);
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<TaskListFilter>('assigned');
  const [dismissedTaskAddedToken, setDismissedTaskAddedToken] = useState<string | null>(null);

  const rawSection = Array.isArray(params.section) ? params.section[0] : params.section;
  const section: ParentSection = rawSection === 'tasks' ? 'tasks' : 'home';
  const taskAddedToken = Array.isArray(params.added) ? params.added[0] : params.added;
  const taskAddedVisible = Boolean(taskAddedToken && taskAddedToken !== dismissedTaskAddedToken);
  const dismissTaskAdded = () => {
    if (taskAddedToken) setDismissedTaskAddedToken(taskAddedToken);
  };

  useEffect(() => {
    if (role !== 'parent') router.replace('/role');
  }, [role, router]);

  if (role !== 'parent') {
    return (
      <Screen testID="parent-home-role-guard">
        <Text brand color="deepForest" variant="screenTitle">
          {t('errors.wrongRole')}
        </Text>
      </Screen>
    );
  }

  const adjustmentUnderReview =
    preAcceptanceAdjustment?.status === 'parent_review_required' &&
    preAcceptanceAdjustment.sourceAssignmentId === journey?.assignment?.id &&
    preAcceptanceAdjustment.sourceTaskId === journey?.task.id
      ? preAcceptanceAdjustment
      : null;
  const smallerCandidate = serviceRegistry.task
    .listTemplates('green_impact')
    .find((template) => template.id === 'GI01');

  const resolveAdjustment = (decision: ProspectiveTaskAdjustmentKind) => {
    setAdjustmentError(null);
    const result = resolvePreAcceptanceAdjustment({ decision });
    if (!result.ok) {
      setAdjustmentError(t('errors.safeRetry'));
      return;
    }
    setRole('child');
    requestAnimationFrame(() => router.replace('/child'));
  };

  const nextRoute =
    journey?.lifecycle === 'retry'
      ? '/parent/check-in'
      : journey?.lifecycle === 'submitted' || journey?.lifecycle === 'confirmed'
        ? '/parent/check-in'
        : journey?.lifecycle === 'recognized'
          ? '/garden'
          : journey?.lifecycle === 'assigned' ||
              journey?.lifecycle === 'chosen' ||
              journey?.lifecycle === 'in_progress'
            ? '/child'
            : '/parent/task/new';
  const nextLabel =
    journey?.lifecycle === 'confirmed'
      ? t('parentHome.continueRecognition')
      : nextRoute === '/parent/check-in'
        ? t('parentHome.reviewTask')
        : nextRoute === '/garden'
          ? t('parentHome.openGarden')
          : nextRoute === '/child'
            ? t('navigation.childHome')
            : t('parentHome.createTask');
  const lifecycleStatus = journey
    ? journey.lifecycle === 'submitted'
      ? t('parentHome.awaitingReview')
      : journey.lifecycle === 'confirmed'
        ? t('parentHome.approvalRecorded')
        : journey.lifecycle === 'retry'
          ? t('parentHome.retryRequested')
          : journey.lifecycle === 'recognized'
            ? t('parentHome.recognitionComplete')
            : t('parentHome.taskInProgress')
    : t('parentHome.readyStatus');
  const activeChild = children[activeChildId];
  const remainingLeaves = Math.max(0, canopy.goalLeaves - canopy.contributionLeaves);
  const childItems: readonly ParentChildSummaryItem[] = PARENT_NEXT_ACTIONS.map((action) => ({
    id: action.childId,
    name: localize(children[action.childId].displayName, locale),
    next: t(action.nextKey),
    selected: activeChildId === action.childId,
    support: t(action.supportKey),
  }));

  const openPrimaryAction = () => {
    router.push(nextRoute === '/child' ? '/role' : nextRoute);
  };

  const chooseChild = (childId: SyntheticChildId) => {
    dismissTaskAdded();
    setActiveChild(childId);
  };

  const confirmReset = () => {
    setResetError(null);
    const result = resetPrototype();
    setConfirmingReset(false);
    if (!result.ok) {
      setResetError(t('errors.safeRetry'));
      return;
    }
    replaceHistoryWithEntry(router);
  };

  const selectedJourney = journey?.task.targetChildId === activeChildId ? journey : null;
  const visibleJourney =
    selectedJourney && taskFilterForLifecycle(selectedJourney.lifecycle) === taskFilter
      ? selectedJourney
      : null;
  const emptyCopy = {
    assigned: {
      body: t('r002aTasks.emptyAssignedBody'),
      title: t('r002aTasks.emptyAssignedTitle'),
    },
    pending: {
      body: t('r002aTasks.emptyPendingBody'),
      title: t('r002aTasks.emptyPendingTitle'),
    },
    completed: {
      body: t('r002aTasks.emptyCompletedBody'),
      title: t('r002aTasks.emptyCompletedTitle'),
    },
  }[taskFilter];
  const openTaskAction = () => {
    dismissTaskAdded();
    if (!journey) {
      router.push('/parent/task/new');
      return;
    }
    if (!visibleJourney) {
      setActiveChild(journey.task.targetChildId);
      setTaskFilter(taskFilterForLifecycle(journey.lifecycle));
      return;
    }
    if (visibleJourney.lifecycle === 'draft') {
      router.push('/parent/task/new');
      return;
    }
    if (visibleJourney.lifecycle === 'reviewed') {
      router.push('/parent/task/review');
      return;
    }
    if (
      visibleJourney.lifecycle === 'assigned' ||
      visibleJourney.lifecycle === 'chosen' ||
      visibleJourney.lifecycle === 'in_progress'
    ) {
      router.push('/role');
      return;
    }
    if (
      visibleJourney.lifecycle === 'submitted' ||
      visibleJourney.lifecycle === 'retry' ||
      visibleJourney.lifecycle === 'confirmed'
    ) {
      router.push('/parent/check-in');
      return;
    }
    router.push('/garden');
  };
  const taskActionLabel = !journey
    ? t('r002aTasks.createTask')
    : !visibleJourney
      ? t('r002aTasks.viewCurrentTask')
      : visibleJourney.lifecycle === 'draft'
        ? t('r002aTasks.openBuilder')
        : visibleJourney.lifecycle === 'reviewed'
          ? t('r002aTasks.openReview')
          : visibleJourney.lifecycle === 'recognized'
            ? t('r002aTasks.openGarden')
            : visibleJourney.lifecycle === 'retry'
              ? t('r002aTasks.resumeSupport')
              : visibleJourney.lifecycle === 'confirmed'
                ? t('r002aTasks.continueRecognition')
                : visibleJourney.lifecycle === 'submitted'
                  ? t('parentHome.reviewTask')
                  : t('r002aTasks.openChild');

  if (section === 'tasks') {
    return (
      <R002aScreen
        footer={
          <ParentHomeNavigation
            activeKey="tasks"
            circleLabel={t('navigation.circle')}
            direction={direction}
            gardenLabel={t('navigation.garden')}
            homeLabel={t('parentHome.homeLabel')}
            onCircle={() => router.push('/circle')}
            onGarden={() => router.push('/garden')}
            onHome={() => router.replace('/parent')}
            onTasks={() => undefined}
            tasksLabel={t('parentHome.tasksLabel')}
          />
        }
        header={
          <ParentHomeHeader
            direction={direction}
            onToggleSettings={() => {
              setResetError(null);
              setSettingsOpen((current) => !current);
            }}
            profileLabel={t('parentHome.selectedChild', {
              child: localize(activeChild.displayName, locale),
            })}
            settingsLabel={t('parentHome.settingsLabel')}
            settingsOpen={settingsOpen}
            title={t('common.brand')}
          />
        }
        testID="parent-tasks-screen"
      >
        <ParentHomeUtilities
          cancelLabel={t('common.cancel')}
          confirmingReset={confirmingReset}
          description={t('parentHome.settingsBody')}
          error={resetError}
          languageControl={<LanguageSwitcher compact showGuidance={false} />}
          onCancelReset={() => setConfirmingReset(false)}
          onConfirmReset={confirmReset}
          onRequestReset={() => setConfirmingReset(true)}
          onSwitchRole={() => router.replace('/role')}
          open={settingsOpen}
          resetActionLabel={t('reset.action')}
          resetConfirmLabel={t('reset.confirm')}
          resetTitle={t('reset.title')}
          switchRoleLabel={t('navigation.switchToChild')}
          title={t('parentHome.settingsTitle')}
        />

        <View style={styles.greeting}>
          <View
            style={[styles.prototypeIdentity, { flexDirection: logicalRowDirection(direction) }]}
          >
            <View aria-hidden style={styles.prototypeDot} />
            <Text brand color="onSurfaceVariant" style={styles.prototypeLabel} variant="caption">
              {t('common.prototype')} · {t('origin.synthetic')}
            </Text>
          </View>
          <Text brand color="deepForest" variant="parentHero">
            {t('r002aTasks.title')}
          </Text>
          <Text brand color="onSurfaceVariant" variant="bodyLarge">
            {t('r002aTasks.body')}
          </Text>
        </View>

        {!journey ? (
          <Button
            brand
            direction={direction}
            icon={<GhafIcon color={colors.onPrimary} name="plus" size={24} />}
            onPress={openTaskAction}
            size="regular"
            testID="parent-tasks-create-task"
          >
            {t('r002aTasks.createTask')}
          </Button>
        ) : null}

        <View
          accessibilityRole="radiogroup"
          style={[styles.childFilter, { flexDirection: logicalRowDirection(direction) }]}
        >
          {Object.values(children).map((child) => {
            const selected = child.id === activeChildId;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                aria-checked={selected}
                key={child.id}
                onPress={() => chooseChild(child.id)}
                style={({ pressed }) => [
                  styles.childFilterItem,
                  selected ? styles.childFilterItemActive : null,
                  pressed ? styles.pressed : null,
                ]}
                testID={`parent-tasks-child-${child.id}`}
              >
                <Text
                  align="center"
                  brand
                  color={selected ? 'onPrimary' : 'onSurfaceVariant'}
                  variant="label"
                >
                  {localize(child.displayName, locale)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          accessibilityRole="tablist"
          style={[styles.taskTabs, { flexDirection: logicalRowDirection(direction) }]}
        >
          {(
            [
              ['assigned', t('r002aTasks.assignedTab')],
              ['pending', t('r002aTasks.pendingTab')],
              ['completed', t('r002aTasks.completedTab')],
            ] as const
          ).map(([key, label]) => {
            const selected = taskFilter === key;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                aria-selected={selected}
                key={key}
                onPress={() => {
                  dismissTaskAdded();
                  setTaskFilter(key);
                }}
                style={({ pressed }) => [
                  styles.taskTab,
                  selected ? styles.taskTabActive : null,
                  pressed ? styles.pressed : null,
                ]}
                testID={`parent-tasks-tab-${key}`}
              >
                <Text
                  align="center"
                  brand
                  color={selected ? 'primary' : 'onSurfaceVariant'}
                  variant="label"
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View accessibilityLiveRegion="polite">
          <ParentTasksView
            actionLabel={taskActionLabel}
            actionTestID="parent-tasks-primary-action"
            current={
              visibleJourney
                ? {
                    childLabel: localize(
                      children[visibleJourney.task.targetChildId].displayName,
                      locale,
                    ),
                    metaLabel: visibleJourney.task.content.displayedSeedAward
                      ? t('childHome.awardAfterConfirmation', {
                          count: visibleJourney.task.content.displayedSeedAward,
                        })
                      : undefined,
                    statusLabel: t(taskStatusKey(visibleJourney.lifecycle)),
                    supportLabel: localize(visibleJourney.task.content.permittedHelp, locale),
                    title: localize(visibleJourney.task.content.title, locale),
                  }
                : null
            }
            direction={direction}
            emptyMessage={emptyCopy.body}
            emptyTitle={emptyCopy.title}
            heading={t('r002aTasks.currentTask')}
            onAction={openTaskAction}
            showAction={Boolean(journey)}
            state={visibleJourney ? (taskAddedVisible ? 'task_added' : 'current') : 'empty'}
            taskAddedMessage={t('r002aTasks.taskAdded')}
            testID="parent-tasks-list"
          />
        </View>
      </R002aScreen>
    );
  }

  return (
    <R002aScreen
      footer={
        <ParentHomeNavigation
          activeKey="home"
          circleLabel={t('navigation.circle')}
          direction={direction}
          gardenLabel={t('navigation.garden')}
          homeLabel={t('parentHome.homeLabel')}
          onCircle={() => router.push('/circle')}
          onGarden={() => router.push('/garden')}
          onHome={() => router.replace('/parent')}
          onTasks={() => router.replace({ pathname: '/parent', params: { section: 'tasks' } })}
          tasksLabel={t('parentHome.tasksLabel')}
        />
      }
      header={
        <ParentHomeHeader
          direction={direction}
          onToggleSettings={() => {
            setResetError(null);
            setSettingsOpen((current) => !current);
          }}
          profileLabel={t('parentHome.selectedChild', {
            child: localize(activeChild.displayName, locale),
          })}
          settingsLabel={t('parentHome.settingsLabel')}
          settingsOpen={settingsOpen}
          title={t('common.brand')}
        />
      }
      keyboardAware
      testID="parent-home-screen"
    >
      <ParentHomeUtilities
        cancelLabel={t('common.cancel')}
        confirmingReset={confirmingReset}
        description={t('parentHome.settingsBody')}
        error={resetError}
        languageControl={<LanguageSwitcher compact showGuidance={false} />}
        onCancelReset={() => setConfirmingReset(false)}
        onConfirmReset={confirmReset}
        onRequestReset={() => setConfirmingReset(true)}
        onSwitchRole={() => router.replace('/role')}
        open={settingsOpen}
        resetActionLabel={t('reset.action')}
        resetConfirmLabel={t('reset.confirm')}
        resetTitle={t('reset.title')}
        switchRoleLabel={t('navigation.switchToChild')}
        title={t('parentHome.settingsTitle')}
      />

      <View style={styles.greeting}>
        <View
          style={[styles.prototypeIdentity, { flexDirection: logicalRowDirection(direction) }]}
          testID="prototype-status-bar"
        >
          <View aria-hidden style={styles.prototypeDot} />
          <Text brand color="onSurfaceVariant" style={styles.prototypeLabel} variant="caption">
            {t('common.prototype')} · {t('origin.synthetic')}
          </Text>
        </View>
        <Text brand color="onSurfaceVariant" variant="caption">
          {localize(householdName, locale)}
        </Text>
        <Text brand color="deepForest" variant="parentHero">
          {t('parentHome.welcome')}
        </Text>
        <Text brand color="onSurfaceVariant" variant="bodyLarge">
          {t('parentHome.title')}
        </Text>
      </View>

      <ParentCanopySummaryCard
        current={canopy.contributionLeaves}
        direction={direction}
        goal={canopy.goalLeaves}
        meaning={t('parentHome.canopyMeaning')}
        progressLabel={t('parentHome.canopyProgressLive', {
          current: canopy.contributionLeaves,
          goal: canopy.goalLeaves,
        })}
        remainingLabel={t('parentHome.remainingLeaves', { count: remainingLeaves })}
        title={t('parentHome.canopyTitle')}
      />

      {!adjustmentUnderReview ? (
        <ParentLifecycleCard
          actionLabel={nextLabel}
          categoryLabel={journey ? t('taskNew.greenImpact') : undefined}
          childLabel={
            journey ? localize(children[journey.task.targetChildId].displayName, locale) : undefined
          }
          direction={direction}
          metaLabel={
            journey?.task.content.displayedSeedAward
              ? t('childHome.awardAfterConfirmation', {
                  count: journey.task.content.displayedSeedAward,
                })
              : undefined
          }
          onPress={openPrimaryAction}
          statusLabel={lifecycleStatus}
          supportLabel={
            journey
              ? localize(journey.task.content.permittedHelp, locale)
              : t('parentHome.readyTaskBody')
          }
          title={
            journey ? localize(journey.task.content.title, locale) : t('parentHome.readyTaskTitle')
          }
        />
      ) : null}

      {adjustmentUnderReview && journey?.assignment ? (
        <ParentAdjustmentReview
          body={t('parentHome.adjustmentReviewBody')}
          childDecisionLabel={t('parentHome.childDecisionNext')}
          current={{
            awardLabel: t('childHome.awardAfterConfirmation', {
              count: journey.task.content.displayedSeedAward ?? 0,
            }),
            body: localize(journey.task.content.definitionOfDone, locale),
            label: t('parentHome.currentAssignment'),
            title: localize(journey.task.content.title, locale),
          }}
          error={adjustmentError}
          onResolveSafeEquivalent={() => resolveAdjustment('safe_equivalent')}
          onResolveSmaller={() => resolveAdjustment('smaller')}
          safeEquivalent={{
            awardLabel: t('childHome.awardAfterConfirmation', {
              count: P0_SAFE_EQUIVALENT_TEMPLATE.displayedSeedAward ?? 0,
            }),
            body: localize(P0_SAFE_EQUIVALENT_TEMPLATE.definitionOfDone, locale),
            label: t('parentHome.safeEquivalentResolution'),
            safetyLabel: localize(
              P0_SAFE_EQUIVALENT_TEMPLATE.safety.routeConstraint ??
                P0_SAFE_EQUIVALENT_TEMPLATE.safety.stopAndAskAdult,
              locale,
            ),
            title: localize(P0_SAFE_EQUIVALENT_TEMPLATE.title, locale),
          }}
          safeEquivalentAction={t('parentHome.resolveSafeEquivalent')}
          safeEquivalentTestID="resolve-safe-equivalent-button"
          smaller={
            smallerCandidate
              ? {
                  awardLabel: t('childHome.awardAfterConfirmation', {
                    count: smallerCandidate.displayedSeedAward ?? 0,
                  }),
                  body: localize(smallerCandidate.definitionOfDone, locale),
                  label: t('parentHome.smallerResolution'),
                  title: localize(smallerCandidate.title, locale),
                }
              : null
          }
          smallerAction={t('parentHome.resolveSmaller')}
          smallerTestID="resolve-smaller-task-button"
          testID="pre-acceptance-parent-review"
          title={t('parentHome.adjustmentReviewTitle')}
        />
      ) : null}

      <ParentChildrenSection
        createTaskLabel={t('parentHome.createTask')}
        direction={direction}
        items={childItems}
        onCreateTask={() => router.push('/parent/task/new')}
        onSelectChild={chooseChild}
        selectedLabel={t('parentHome.selectedLabel')}
        title={t('parentHome.todayWithChildren')}
      />

      <ParentPatternSummary
        appearance="r002a"
        summary={PARENT_SUMMARY_FIXTURE}
        testID="prepared-parent-summary"
      />

      <View style={styles.privacyNote}>
        <Text brand color="primary" variant="label">
          {t('origin.synthetic')}
        </Text>
        <Text brand color="onSurfaceVariant" variant="caption">
          {t('parentHome.syntheticPrivacyBoundary')}
        </Text>
      </View>
    </R002aScreen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    gap: spacing.xxs,
  },
  prototypeIdentity: {
    minWidth: 0,
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  prototypeDot: {
    width: 8,
    height: 8,
    flexShrink: 0,
    borderRadius: 4,
    backgroundColor: colors.mangroveTeal,
  },
  prototypeLabel: {
    minWidth: 0,
    flex: 1,
  },
  privacyNote: {
    gap: spacing.xs,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.ghafEmeraldTint,
    padding: spacing.md,
  },
  childFilter: {
    minHeight: layout.touchTarget,
    width: '100%',
    alignSelf: 'stretch',
    flexWrap: 'wrap',
    gap: spacing.xs,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.xxs,
  },
  childFilterItem: {
    minWidth: 88,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    paddingHorizontal: spacing.md,
  },
  childFilterItemActive: {
    backgroundColor: colors.ghafEmerald,
  },
  taskTabs: {
    minHeight: layout.touchTarget,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.xxs,
  },
  taskTab: {
    minHeight: layout.touchTarget,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  taskTabActive: {
    backgroundColor: colors.ghafEmeraldTint,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
