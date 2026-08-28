import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { JourneyHeader } from '@/components/journey';
import { Button, Screen, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import { P0_RECYCLING_TEMPLATE, TASK_TEMPLATES } from '@/features/tasks/demoContent';
import { localize } from '@/i18n';
import type {
  ApprovedChoiceFixture,
  LandscapeId,
  TaskLifecycleStatus,
  TaskTemplate,
} from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const LANDSCAPE_LABEL_KEYS: Readonly<Record<LandscapeId, string>> = {
  ghaf: 'garden.ghaf',
  samar: 'garden.samar',
  sidr: 'garden.sidr',
  date_palm: 'garden.datePalm',
  mangrove: 'garden.mangrove',
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

function templateFor(choice: ApprovedChoiceFixture): TaskTemplate | null {
  if (choice.taskTemplateId === P0_RECYCLING_TEMPLATE.id) return P0_RECYCLING_TEMPLATE;
  return TASK_TEMPLATES.find((template) => template.id === choice.taskTemplateId) ?? null;
}

export default function ChildHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const role = usePrototypeStore((state) => state.role);
  const children = usePrototypeStore((state) => state.children);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const choicePool = usePrototypeStore((state) => state.choicePool);
  const journey = usePrototypeStore((state) => state.journey);
  const canopy = usePrototypeStore((state) => state.household.combinedCanopy);
  const chooseAssignment = usePrototypeStore((state) => state.chooseAssignment);
  const startAssignment = usePrototypeStore((state) => state.startAssignment);
  const [error, setError] = useState<string | null>(null);
  const preAcceptanceAdjustment = usePrototypeStore((state) => state.preAcceptanceAdjustment);
  const requestSmallerTask = usePrototypeStore((state) => state.requestSmallerTask);
  const respondToPreAcceptanceAdjustment = usePrototypeStore(
    (state) => state.respondToPreAcceptanceAdjustment,
  );

  useEffect(() => {
    if (role !== 'child') router.replace('/role');
  }, [role, router]);

  const previewChoices = useMemo(
    () => choicePool.seededPreviewChoices.filter((choice) => choice.childId === activeChildId),
    [activeChildId, choicePool],
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
  const currentWorkMode = journey
    ? (CURRENT_WORK_MODE_BY_LIFECYCLE[journey.lifecycle] ?? null)
    : null;
  const choices = currentAssignmentChoice
    ? [currentAssignmentChoice, ...previewChoices]
    : previewChoices;

  const choose = (choice: ApprovedChoiceFixture) => {
    setError(null);
    const result = chooseAssignment(choice.id);
    if (!result.ok) setError(t('origin.future'));
  };

  const openTask = () => {
    setError(null);
    if (journey?.lifecycle === 'chosen') {
      const started = startAssignment();
      if (!started.ok) {
        setError(t('errors.safeRetry'));
        return;
      }
    }
    router.push('/child/task');
  };

  const child = children[activeChildId];
  const activeAdjustment =
    preAcceptanceAdjustment?.childId === activeChildId &&
    preAcceptanceAdjustment.sourceAssignmentId === journey?.assignment?.id
      ? preAcceptanceAdjustment
      : null;
  const smallerRequestPending = activeAdjustment?.status === 'parent_review_required';
  const childDecisionRequired = activeAdjustment?.status === 'child_decision_required';
  const adjustmentBlocksChoice = smallerRequestPending || childDecisionRequired;

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

  if (role !== 'child') {
    return (
      <Screen testID="child-home-role-guard">
        <JourneyHeader eyebrow={t('origin.synthetic')} title={t('errors.wrongRole')} />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.screenContent} testID="child-home-screen">
      <JourneyHeader
        action={<LanguageSwitcher compact showGuidance={false} />}
        eyebrow={t('origin.synthetic')}
        subtitle={t('childHome.body')}
        title={t('childHome.title')}
      />

      <View style={styles.progressBand}>
        <View style={styles.progressItem}>
          <Text color="earth" variant="caption">
            {localize(child.displayName, locale)}
          </Text>
          <Text color="forest" variant="heading">
            {t('common.seeds', { count: child.earnedSeeds })}
          </Text>
          <Text color="inkMuted" variant="caption">
            {t('origin.symbolic')}
          </Text>
          <Text color="forest" variant="caption">
            {t('childHome.ownGoal')}
          </Text>
          <View
            accessibilityLabel={t('accessibility.progress', {
              current: child.earnedSeeds,
              goal: 60,
            })}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 60, now: Math.min(child.earnedSeeds, 60) }}
            style={styles.ownGoalTrack}
          >
            <View
              style={[
                styles.ownGoalFill,
                { width: `${Math.min(100, (child.earnedSeeds / 60) * 100)}%` },
              ]}
            />
          </View>
        </View>
        <View style={styles.progressRule} />
        <View style={styles.progressItem}>
          <Text color="earth" variant="caption">
            {t('parentHome.canopyTitle')}
          </Text>
          <Text color="forest" variant="heading">
            {t('common.leaves', { count: canopy.contributionLeaves })}
          </Text>
          <Text color="inkMuted" variant="caption">
            {t('parentHome.canopyMeaning')}
          </Text>
        </View>
      </View>

      {childDecisionRequired && activeAdjustment.proposal ? (
        <View
          accessibilityLiveRegion="polite"
          style={styles.adjustmentPanel}
          testID="pre-acceptance-adjustment-panel"
        >
          <View style={styles.adjustmentHeader}>
            <Text color="earth" variant="caption">
              {t('origin.prepared')}
            </Text>
            <Text color="forest" variant="heading">
              {t('childHome.adjustmentTitle')}
            </Text>
            <Text color="inkMuted">{t('childHome.adjustmentBody')}</Text>
          </View>
          <Text color="mangrove" variant="label">
            {t(
              activeAdjustment.resolvedKind === 'safe_equivalent'
                ? 'childHome.safeEquivalentAlternative'
                : 'childHome.smallerAlternative',
            )}
          </Text>
          <Text color="forest" variant="label">
            {localize(activeAdjustment.proposal.content.title, locale)}
          </Text>
          <View style={styles.proposalDetail}>
            <Text color="earth" variant="caption">
              {t('taskReview.definition')}
            </Text>
            <Text>{localize(activeAdjustment.proposal.content.definitionOfDone, locale)}</Text>
          </View>
          <View style={styles.proposalDetail}>
            <Text color="earth" variant="caption">
              {t('taskReview.help')}
            </Text>
            <Text>{localize(activeAdjustment.proposal.content.permittedHelp, locale)}</Text>
          </View>
          <View style={styles.proposalDetail}>
            <Text color="earth" variant="caption">
              {t('taskReview.safety')}
            </Text>
            <Text>{localize(activeAdjustment.proposal.content.safety.adultPreCheck, locale)}</Text>
            <Text>
              {localize(activeAdjustment.proposal.content.safety.stopAndAskAdult, locale)}
            </Text>
          </View>
          <Text color="forest" variant="label">
            {t('childHome.awardAfterConfirmation', {
              count: activeAdjustment.proposal.content.displayedSeedAward ?? 0,
            })}
          </Text>
          <Text color="inkMuted" variant="caption">
            {t('childHome.adjustmentNoLoss')}
          </Text>
          <View style={styles.adjustmentActions}>
            <Button
              onPress={() => respondToAdjustment('accept')}
              testID="pre-acceptance-accept-button"
            >
              {t('childHome.acceptAlternative')}
            </Button>
            <Button
              onPress={() => respondToAdjustment('keep_current')}
              testID="pre-acceptance-keep-button"
              variant="ghost"
            >
              {t('childHome.keepCurrent')}
            </Button>
          </View>
        </View>
      ) : null}

      {currentAssignmentChoice && currentTemplate && currentWorkMode ? (
        <View style={styles.currentWork} testID="current-assignment">
          <Text color="mangrove" variant="caption">
            {t('childHome.currentWork')}
          </Text>
          <View style={[styles.choiceHeader, direction === 'rtl' ? styles.rowRtl : null]}>
            <View style={styles.grow}>
              <Text color="forest" variant="heading">
                {currentTemplate.id === P0_RECYCLING_TEMPLATE.id
                  ? t('childTask.title')
                  : localize(currentTemplate.title, locale)}
              </Text>
              <Text color="inkMuted">{localize(currentTemplate.whyItMatters, locale)}</Text>
            </View>
          </View>
          <View style={styles.taskMeta}>
            <Text color="earth" variant="caption">
              {localize(currentTemplate.estimatedEffort, locale)} ·{' '}
              {t(LANDSCAPE_LABEL_KEYS[currentTemplate.landscapeId])}
            </Text>
            <Text color="earth" variant="caption">
              {localize(currentTemplate.permittedHelp, locale)}
            </Text>
            <Text color="forest" variant="caption">
              {currentTemplate.displayedSeedAward
                ? t('childHome.awardAfterConfirmation', {
                    count: currentTemplate.displayedSeedAward,
                  })
                : t('origin.future')}{' '}
              · {localize(currentTemplate.supervision, locale)}
            </Text>
            <Text color="forest" variant="caption">
              {t(
                currentTemplate.recognitionMode === 'standard'
                  ? 'taskReview.standardRecognition'
                  : currentTemplate.recognitionMode === 'fade_first'
                    ? 'taskReview.fadeFirstRecognition'
                    : 'taskReview.recognitionOnly',
              )}
            </Text>
          </View>

          {currentWorkMode === 'choose' ? (
            <View style={styles.choiceActions}>
              <Button
                disabled={adjustmentBlocksChoice}
                onPress={() => choose(currentAssignmentChoice)}
                testID="choose-recycling-task-button"
              >
                {t('childHome.choose')}
              </Button>
              {!activeAdjustment ? (
                <Button
                  onPress={requestSmaller}
                  testID="request-smaller-task-button"
                  variant="ghost"
                >
                  {t('childHome.requestSmaller')}
                </Button>
              ) : null}
            </View>
          ) : currentWorkMode === 'start' ? (
            <Button onPress={openTask} testID="start-chosen-task-button">
              {t('childHome.openTask')}
            </Button>
          ) : currentWorkMode === 'resume' ? (
            <Button onPress={openTask} testID="resume-current-task-button">
              {t('childHome.resumeTask')}
            </Button>
          ) : currentWorkMode === 'garden' ? (
            <Button
              onPress={() => router.replace('/garden')}
              testID="open-recognized-garden-button"
            >
              {t('parentHome.openGarden')}
            </Button>
          ) : (
            <View
              accessibilityLiveRegion="polite"
              style={styles.waiting}
              testID="current-task-waiting"
            >
              <Text color="forest" variant="label">
                {currentWorkMode === 'paused'
                  ? t('childHome.returnLater')
                  : t('childHome.waitingForParent')}
              </Text>
            </View>
          )}
        </View>
      ) : null}

      {previewChoices.length > 0 ? (
        <View style={styles.previewSection} testID="preview-only-choices">
          <View style={styles.previewHeading}>
            <Text color="forest" variant="heading">
              {t('childHome.preparedChoices')}
            </Text>
            <Text color="inkMuted" variant="caption">
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
                  style={[styles.previewChoice, direction === 'rtl' ? styles.rowRtl : null]}
                >
                  <View style={styles.grow}>
                    <Text color="forest" variant="label">
                      {localize(template.title, locale)}
                    </Text>
                    <Text color="earth" variant="caption">
                      {t(LANDSCAPE_LABEL_KEYS[template.landscapeId])}
                    </Text>
                  </View>
                  <Text color="inkMuted" variant="caption">
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
          <Text color="forest" variant="label">
            {t('errors.missingTask')}
          </Text>
          <Text color="inkMuted" variant="caption">
            {t('childHome.helpWelcome')}
          </Text>
        </View>
      ) : null}
      {error ? (
        <Text accessibilityLiveRegion="polite" color="danger">
          {error}
        </Text>
      ) : null}
      {smallerRequestPending ? (
        <View accessibilityLiveRegion="polite" style={styles.notice}>
          <Text color="forest" variant="label">
            {t('childHome.smallerRequested')}
          </Text>
          <Text color="inkMuted" variant="caption">
            {t('childHome.helpWelcome')}
          </Text>
        </View>
      ) : null}
      {activeAdjustment?.status === 'accepted' ? (
        <View accessibilityLiveRegion="polite" style={styles.notice}>
          <Text color="forest" variant="label">
            {t('childHome.adjustmentAccepted')}
          </Text>
        </View>
      ) : null}
      {activeAdjustment?.status === 'kept_current' ? (
        <View accessibilityLiveRegion="polite" style={styles.notice}>
          <Text color="forest" variant="label">
            {t('childHome.adjustmentKeptCurrent')}
          </Text>
        </View>
      ) : null}
      <Button onPress={() => router.replace('/role')} variant="ghost">
        {t('navigation.switchToParent')}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.huge },
  progressBand: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.lg,
  },
  progressItem: { gap: spacing.xxs },
  progressRule: { width: 48, height: 1, backgroundColor: colors.gold },
  ownGoalTrack: {
    height: spacing.xs,
    overflow: 'hidden',
    borderRadius: radii.pill,
    backgroundColor: colors.leafLight,
  },
  ownGoalFill: { height: '100%', borderRadius: radii.pill, backgroundColor: colors.ghaf },
  adjustmentPanel: {
    gap: spacing.md,
    borderStartWidth: 1,
    borderStartColor: colors.mangrove,
    backgroundColor: colors.waterLight,
    padding: spacing.lg,
  },
  adjustmentHeader: { gap: spacing.xs },
  proposalDetail: { gap: spacing.xxs },
  adjustmentActions: { gap: spacing.xs },
  currentWork: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.mangrove,
    backgroundColor: colors.waterLight,
    padding: spacing.lg,
  },
  choiceHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  rowRtl: { flexDirection: 'row-reverse' },
  grow: { flex: 1, minWidth: 0, gap: spacing.xs },
  taskMeta: { gap: spacing.xxs },
  choiceActions: { gap: spacing.xs },
  waiting: { borderTopWidth: 1, borderColor: colors.water, paddingTop: spacing.md },
  previewSection: { gap: spacing.md },
  previewHeading: { gap: spacing.xxs },
  previewList: { gap: spacing.sm },
  previewChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.md,
  },
  emptyNotice: {
    gap: spacing.xs,
    borderStartWidth: 1,
    borderStartColor: colors.gold,
    backgroundColor: colors.goldGlow,
    padding: spacing.md,
  },
  notice: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.water,
    backgroundColor: colors.waterLight,
    paddingVertical: spacing.md,
  },
});
