import { CatalogTaskList } from '@/components/catalog/CatalogTaskList';
import { StudyEntries } from '@/components/study/StudyEntries';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ParentPatternSummary } from '@/components/family-growth/ParentPatternSummary';
import { Button, Screen, Text } from '@/components/primitives';
import { GhafIcon } from '@/components/access';
import {
  ReturningWelcomeDialog,
  type ReturningWelcomeUpdate,
} from '@/components/session/ReturningWelcomeDialog';
import {
  ParentAdjustmentReview,
  ParentCanopySummaryCard,
  ParentChildrenSection,
  ParentHomeHeader,
  ParentHomeNavigation,
  ParentLifecycleCard,
  ParentTaskWorkspace,
  R002aScreen,
  type ParentChildSummaryItem,
} from '@/components/r002a';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { taskWorkspaceFeatureFlag } from '@/config/taskWorkspaceFeatureFlag';
import { botanical, colors, layout, logicalRowDirection, opacity, spacing } from '@/design/tokens';
import { PARENT_NEXT_ACTIONS } from '@/features/family/overview';
import {
  readLegacyParentHomeParam,
  readStrictParentHomeParam,
  type ParentHomeRouteParam,
} from '@/features/navigation/parentHomeParams';
import { createR002bOrigin, serializeR002bOrigin } from '@/features/navigation/r002bOrigin';
import { resolveLocalFamilyDisplayName } from '@/features/access/localFamilyDisplayName';
import { P0_SAFE_EQUIVALENT_TEMPLATE } from '@/features/tasks/demoContent';
import { localize } from '@/i18n';
import type {
  ProspectiveTaskAdjustmentKind,
  SyntheticChildId,
  TaskLifecycleStatus,
} from '@/models/familyGrowth';
import { PARENT_SUMMARY_FIXTURE, serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { focusAccessibilityTarget } from '@/utils/accessibilityFocus';

type ParentSection = 'home' | 'tasks';
type TaskListFilter = 'assigned' | 'pending' | 'completed';

interface ParentHomeParams {
  readonly added?: ParentHomeRouteParam;
  readonly section?: ParentHomeRouteParam;
  readonly restoreFocusTarget?: ParentHomeRouteParam;
  readonly restoreProfileId?: ParentHomeRouteParam;
  readonly restoreScrollOffset?: ParentHomeRouteParam;
}

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
  const params = useLocalSearchParams() as unknown as ParentHomeParams;
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const role = usePrototypeStore((state) => state.role);
  const householdName = usePrototypeStore((state) => state.household.displayName);
  const localFamily = usePrototypeStore((state) => state.localFamily);
  const canopy = usePrototypeStore((state) => state.household.combinedCanopy);
  const children = usePrototypeStore((state) => state.children);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const journey = usePrototypeStore((state) => state.journey);
  const preAcceptanceAdjustment = usePrototypeStore((state) => state.preAcceptanceAdjustment);
  const resolvePreAcceptanceAdjustment = usePrototypeStore(
    (state) => state.resolvePreAcceptanceAdjustment,
  );
  const setActiveChild = usePrototypeStore((state) => state.setActiveChild);
  const signOutExperience = usePrototypeStore((state) => state.signOutExperience);
  const returningUserWelcome = usePrototypeStore((state) => state.returningUserWelcome);
  const dismissReturningUserWelcome = usePrototypeStore(
    (state) => state.dismissReturningUserWelcome,
  );
  const progressEntryRef = useRef<View | null>(null);
  const homeScrollOffsetRef = useRef(0);
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<TaskListFilter>('assigned');
  const [dismissedTaskAddedToken, setDismissedTaskAddedToken] = useState<string | null>(null);

  const rawSection = readLegacyParentHomeParam(params.section);
  const section: ParentSection = rawSection === 'tasks' ? 'tasks' : 'home';
  const taskAddedToken = readLegacyParentHomeParam(params.added);
  const restoreProfileId = readStrictParentHomeParam(params.restoreProfileId);
  const restoreFocusTarget = readStrictParentHomeParam(params.restoreFocusTarget);
  const rawRestoreScrollOffset = readStrictParentHomeParam(params.restoreScrollOffset);
  const restoreScrollOffset =
    rawRestoreScrollOffset && /^\d+$/u.test(rawRestoreScrollOffset)
      ? Math.min(100_000, Number(rawRestoreScrollOffset))
      : 0;
  const hasValidProgressRestore =
    r002bFeatureFlags.r002b_parent_progress_ui &&
    restoreFocusTarget === 'r002b-parent-family-progress-card' &&
    restoreProfileId === activeChildId;
  const taskAddedVisible = Boolean(taskAddedToken && taskAddedToken !== dismissedTaskAddedToken);
  const dismissTaskAdded = () => {
    if (taskAddedToken) setDismissedTaskAddedToken(taskAddedToken);
  };

  useEffect(() => {
    if (role !== 'parent') router.replace('/');
  }, [role, router]);

  useEffect(() => {
    if (role !== 'parent' || section !== 'home' || !hasValidProgressRestore) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      focusAccessibilityTarget(progressEntryRef.current);
    });
    return () => cancelAnimationFrame(frame);
  }, [hasValidProgressRestore, role, section]);

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

  const handoffToChildAccess = () => {
    setAdjustmentError(null);
    const result = signOutExperience();
    if (!result.ok) {
      setAdjustmentError(t('errors.safeRetry'));
      return false;
    }
    requestAnimationFrame(() => router.replace('/access/child' as Href));
    return true;
  };

  const resolveAdjustment = (decision: ProspectiveTaskAdjustmentKind) => {
    setAdjustmentError(null);
    const result = resolvePreAcceptanceAdjustment({ decision });
    if (!result.ok) {
      setAdjustmentError(t('errors.safeRetry'));
      return;
    }
    handoffToChildAccess();
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
  const profileName = (childId: SyntheticChildId) =>
    localFamily.record?.children.find((profile) => profile.id === childId)?.nickname ??
    localize(children[childId].displayName, locale);
  const familyDisplayName = localFamily.record
    ? resolveLocalFamilyDisplayName(localFamily.record, localize(householdName, locale))
    : localize(householdName, locale);
  const nextLabel =
    journey?.lifecycle === 'confirmed'
      ? t('parentHome.continueRecognition')
      : nextRoute === '/parent/check-in'
        ? t('parentHome.reviewTask')
        : nextRoute === '/garden'
          ? t('parentHome.openGarden')
          : nextRoute === '/child'
            ? t('navigation.childHome')
            : t('parentHome.createTask', { child: profileName(activeChildId) });
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
  const remainingLeaves = Math.max(0, canopy.goalLeaves - canopy.contributionLeaves);
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE');
  const childItems: readonly ParentChildSummaryItem[] = PARENT_NEXT_ACTIONS.filter((action) =>
    localFamily.configuredChildIds.includes(action.childId),
  ).map((action) => ({
    id: action.childId,
    name: profileName(action.childId),
    next: t(action.nextKey, { child: profileName(action.childId) }),
    selected: activeChildId === action.childId,
    support: t(action.supportKey, { child: profileName(action.childId) }),
  }));

  const openSelectedChildTaskBuilder = () => {
    dismissTaskAdded();
    setAdjustmentError(null);
    const result = setActiveChild(activeChildId);
    if (!result.ok) {
      setAdjustmentError(t('errors.safeRetry'));
      return;
    }
    const cleared = usePrototypeStore.getState().beginNewTask();
    if (cleared.ok) router.push('/parent/task/new');
  };

  const openTaskBuilderFor = (childId: SyntheticChildId) => {
    dismissTaskAdded();
    setAdjustmentError(null);
    const result = setActiveChild(childId);
    if (!result.ok) {
      setAdjustmentError(t('errors.safeRetry'));
      return;
    }
    const cleared = usePrototypeStore.getState().beginNewTask();
    if (cleared.ok) router.push('/parent/task/new');
  };

  const openPrimaryAction = () => {
    if (nextRoute === '/child') {
      handoffToChildAccess();
      return;
    }
    if (nextRoute === '/parent/task/new') {
      openSelectedChildTaskBuilder();
      return;
    }
    router.push(nextRoute);
  };

  const chooseChild = (childId: SyntheticChildId) => {
    dismissTaskAdded();
    setAdjustmentError(null);
    const result = setActiveChild(childId);
    if (!result.ok) setAdjustmentError(t('errors.safeRetry'));
  };

  const openParentProgress = () => {
    const origin = createR002bOrigin({
      id: 'parent_family_progress_card',
      profileId: activeChildId,
      scrollOffset: homeScrollOffsetRef.current,
    });
    if (!origin.ok) return;
    router.push({
      pathname: '/parent/family/[profileId]/progress',
      params: {
        profileId: activeChildId,
        ...serializeR002bOrigin(origin.data),
      },
    } as unknown as Href);
  };

  const selectedJourney = journey?.task.targetChildId === activeChildId ? journey : null;
  const visibleJourney =
    selectedJourney && taskFilterForLifecycle(selectedJourney.lifecycle) === taskFilter
      ? selectedJourney
      : null;
  const openTaskAction = () => {
    dismissTaskAdded();
    if (!journey) {
      openSelectedChildTaskBuilder();
      return;
    }
    if (!visibleJourney) {
      const selected = setActiveChild(journey.task.targetChildId);
      if (!selected.ok) {
        setAdjustmentError(t('errors.safeRetry'));
        return;
      }
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
      handoffToChildAccess();
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

  const parentWelcomeUpdates: readonly ReturningWelcomeUpdate[] = [
    {
      body: journey
        ? t('r003.welcomeBack.parentTaskBody', {
            status: lifecycleStatus,
            task: localize(journey.task.content.title, locale),
          })
        : t('r003.welcomeBack.parentReadyBody'),
      icon: 'leaf',
      id: 'task',
      title: journey
        ? t('r003.welcomeBack.parentTaskTitle')
        : t('r003.welcomeBack.parentReadyTitle'),
    },
    {
      body: t('r003.welcomeBack.familyProgressBody', {
        current: formatter.format(canopy.contributionLeaves),
        goal: formatter.format(canopy.goalLeaves),
      }),
      icon: 'ghaf-tree',
      id: 'family',
      onPress: () => {
        dismissReturningUserWelcome();
        router.push('/parent/family' as Href);
      },
      title: t('r003.welcomeBack.familyProgressTitle'),
    },
  ];

  if (section === 'tasks') {
    return (
      <R002aScreen
        footer={
          <ParentHomeNavigation
            activeKey="tasks"
            direction={direction}
            familyLabel={t('navigation.family')}
            gardenLabel={t('navigation.garden')}
            homeLabel={t('parentHome.homeLabel')}
            onFamily={() => router.push('/parent/family' as Href)}
            onGarden={() => router.push('/garden')}
            onHome={() => router.replace('/parent')}
            onTasks={() => undefined}
            tasksLabel={t('parentHome.tasksLabel')}
          />
        }
        header={
          <ParentHomeHeader
            direction={direction}
            onToggleSettings={() => router.push('/parent/settings' as Href)}
            profileLabel={t('parentHome.selectedChild', {
              child: profileName(activeChildId),
            })}
            settingsLabel={t('parentHome.settingsLabel')}
            settingsOpen={false}
            title={t('common.brand')}
          />
        }
        testID="parent-tasks-screen"
      >
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

        {taskAddedVisible && visibleJourney?.task.id === taskAddedToken ? (
          <Text
            accessibilityLiveRegion="polite"
            brand
            color="ghafEmerald"
            direction={direction}
            testID="parent-tasks-added"
          >
            {t('r002aTasks.taskAdded')}
          </Text>
        ) : null}

        {taskWorkspaceFeatureFlag ? (
          <ParentTaskWorkspace
            activeChildId={activeChildId}
            childProfiles={Object.values(children)
              .filter((child) => localFamily.configuredChildIds.includes(child.id))
              .map((child) => ({ id: child.id, label: profileName(child.id) }))}
            current={
              journey
                ? {
                    childId: journey.task.targetChildId,
                    childLabel: profileName(journey.task.targetChildId),
                    metaLabel: journey.task.content.displayedSeedAward
                      ? t('childHome.awardAfterConfirmation', {
                          count: journey.task.content.displayedSeedAward,
                        })
                      : undefined,
                    statusLabel: t(taskStatusKey(journey.lifecycle)),
                    supportLabel: localize(journey.task.content.permittedHelp, locale),
                    title: localize(journey.task.content.title, locale),
                  }
                : null
            }
            direction={direction}
            locale={locale}
            onCreateTask={openTaskBuilderFor}
            onOpenCurrent={openTaskAction}
          />
        ) : (
          <>
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

            {adjustmentError ? (
              <Text accessibilityLiveRegion="polite" brand color="danger" direction={direction}>
                {adjustmentError}
              </Text>
            ) : null}

            <View
              accessibilityRole="radiogroup"
              style={[styles.childFilter, { flexDirection: logicalRowDirection(direction) }]}
            >
              {Object.values(children)
                .filter((child) => localFamily.configuredChildIds.includes(child.id))
                .map((child) => {
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
                        {profileName(child.id)}
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
              <CatalogTaskList role="parent" filter={taskFilter} />
            </View>
          </>
        )}
      </R002aScreen>
    );
  }

  return (
    <R002aScreen
      footer={
        <ParentHomeNavigation
          activeKey="home"
          direction={direction}
          familyLabel={t('navigation.family')}
          gardenLabel={t('navigation.garden')}
          homeLabel={t('parentHome.homeLabel')}
          onFamily={() => router.push('/parent/family' as Href)}
          onGarden={() => router.push('/garden')}
          onHome={() => router.replace('/parent')}
          onTasks={() => router.replace({ pathname: '/parent', params: { section: 'tasks' } })}
          tasksLabel={t('parentHome.tasksLabel')}
        />
      }
      header={
        <ParentHomeHeader
          direction={direction}
          onToggleSettings={() => router.push('/parent/settings' as Href)}
          profileLabel={t('parentHome.selectedChild', {
            child: profileName(activeChildId),
          })}
          settingsLabel={t('parentHome.settingsLabel')}
          settingsOpen={false}
          title={t('common.brand')}
        />
      }
      keyboardAware
      scrollProps={
        r002bFeatureFlags.r002b_parent_progress_ui
          ? {
              contentOffset: { x: 0, y: hasValidProgressRestore ? restoreScrollOffset : 0 },
              onScroll: (event) => {
                homeScrollOffsetRef.current = Math.max(
                  0,
                  Math.round(event.nativeEvent.contentOffset.y),
                );
              },
              scrollEventThrottle: 16,
            }
          : undefined
      }
      testID="parent-home-screen"
    >
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
          {familyDisplayName}
        </Text>
        <Text brand color="deepForest" direction={direction} variant="screenTitle">
          {t('parentHome.welcome')}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} variant="body">
          {t('parentHome.title')}
        </Text>
      </View>

      {adjustmentError && !adjustmentUnderReview ? (
        <Text accessibilityLiveRegion="polite" brand color="danger" direction={direction}>
          {adjustmentError}
        </Text>
      ) : null}

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
        createTaskLabel={t('parentHome.createTask', { child: profileName(activeChildId) })}
        direction={direction}
        items={childItems}
        onCreateTask={openSelectedChildTaskBuilder}
        onSelectChild={chooseChild}
        selectedLabel={t('parentHome.selectedLabel')}
        title={t('parentHome.todayWithChildren')}
      />

      <StudyEntries role="parent" />

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

      {r002bFeatureFlags.r002b_parent_progress_ui ? (
        <Pressable
          accessibilityHint={t('r002bParentProgress.entryHint')}
          accessibilityLabel={t('r002bParentProgress.entryAccessibility', {
            child: profileName(activeChildId),
          })}
          accessibilityRole="button"
          onPress={openParentProgress}
          ref={progressEntryRef}
          style={({ pressed }) => [
            styles.progressEntry,
            { flexDirection: logicalRowDirection(direction) },
            pressed ? styles.pressed : null,
          ]}
          testID="r002b-parent-family-progress-card"
        >
          <View style={styles.progressEntryIcon}>
            <GhafIcon color={colors.ghafEmerald} name="sparkle" size={26} />
          </View>
          <View style={styles.progressEntryCopy}>
            <Text brand color="deepForest" direction={direction} variant="bodyLarge">
              {t('r002bParentProgress.entryTitle', {
                child: profileName(activeChildId),
              })}
            </Text>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {t('r002bParentProgress.entryBody')}
            </Text>
          </View>
          <GhafIcon color={colors.ghafEmerald} direction={direction} name="chevron" size={22} />
        </Pressable>
      ) : null}

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
      <ReturningWelcomeDialog
        actionLabel={t('r003.welcomeBack.continue')}
        direction={direction}
        language={locale}
        message={t('r003.welcomeBack.parentMessage', {
          family: familyDisplayName,
        })}
        onDismiss={dismissReturningUserWelcome}
        summaryLabel={t('r003.welcomeBack.privateSummary')}
        testID="parent-returning-welcome"
        title={t('r003.welcomeBack.parentTitle')}
        updates={parentWelcomeUpdates}
        visible={returningUserWelcome?.kind === 'returning_parent'}
      />
    </R002aScreen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    gap: spacing.xxs,
    paddingBottom: spacing.xs,
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: botanical.colors.line,
    paddingTop: spacing.md,
  },
  progressEntry: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
    padding: spacing.md,
  },
  progressEntryIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.sage,
  },
  progressEntryCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  childFilter: {
    minHeight: layout.touchTarget,
    width: '100%',
    alignSelf: 'stretch',
    flexWrap: 'wrap',
    gap: spacing.xs,
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.canvas,
    padding: spacing.xxs,
  },
  childFilterItem: {
    minWidth: 88,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    paddingHorizontal: spacing.md,
  },
  childFilterItemActive: {
    backgroundColor: colors.ghafEmerald,
  },
  taskTabs: {
    minHeight: layout.touchTarget,
    borderBottomWidth: 1,
    borderBottomColor: botanical.colors.line,
    padding: spacing.xxs,
  },
  taskTab: {
    minHeight: layout.touchTarget,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.small,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  taskTabActive: {
    backgroundColor: botanical.colors.sage,
    borderRadius: botanical.radius.control,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
