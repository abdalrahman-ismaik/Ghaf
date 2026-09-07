import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafIcon } from '@/components/access';
import { AssistantIdentity } from '@/components/AssistantIdentity';
import { PreparedMedia } from '@/components/family-growth/PreparedMedia';
import { LiveChildCoachPanel } from '@/components/family-growth/LiveChildCoachPanel';
import { LiveVoiceCapturePanel } from '@/components/family-growth/LiveVoiceCapturePanel';
import { SyntheticVoicePanel } from '@/components/family-growth/SyntheticVoicePanel';
import { TrustedAdultExit } from '@/components/family-growth/TrustedAdultExit';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button, Input, QuietButton, Text } from '@/components/primitives';
import { aiFeatureFlags } from '@/config/aiFeatureFlags';
import {
  ChildCompletionConfirmationSheet,
  ChildDefinitionCard,
  ChildTaskActionFooter,
  ChildTaskChecklist,
  ChildTaskFollowUpContext,
  ChildTaskHero,
  ChildTaskPlanCard,
  ChildWaitingForReview,
  R002aFlowHeader,
  R002aScreen,
  type ChildTaskCheckpoint,
} from '@/components/r002a';
import {
  colors,
  layout,
  logicalRowDirection,
  r001Radii,
  r001Shadows,
  spacing,
} from '@/design/tokens';
import type { ChildVoiceCommand } from '@/features/assistants/childVoiceController';
import { P0_RECYCLING_TEMPLATE, TASK_CATEGORIES } from '@/features/tasks/demoContent';
import { TASK_REFLECTION_MAX_LENGTH } from '@/features/tasks/validation';
import { bilingualResource, localize } from '@/i18n';
import type { AgeAdaptedCoachResult } from '@/models/assistantVoice';
import type {
  AgeBand,
  ChildCoachIntent,
  ChildCoachResult,
  LocalizedText,
} from '@/models/familyGrowth';
import { serviceRegistry } from '@/services';
import { selectCanEnterChildExperience, usePrototypeStore } from '@/state/usePrototypeStore';

const COACH_INTENTS: readonly { intent: ChildCoachIntent; key: string }[] = [
  { intent: 'show_steps', key: 'showSteps' },
  { intent: 'simplify_task', key: 'helpPlan' },
  { intent: 'need_adult', key: 'adultExit' },
] as const;

function coachLinesForIntent(
  coach: ChildCoachResult,
  adapted: AgeAdaptedCoachResult,
  intent: ChildCoachIntent,
): readonly LocalizedText[] {
  switch (intent) {
    case 'show_steps':
      return adapted.steps;
    case 'simplify_task':
      return adapted.steps.slice(0, 2);
    case 'create_if_then_cue':
    case 'rehearse_reviewed_phrase':
    case 'respond_to_prepared_fixture':
      return [coach.ifThenCue];
    case 'offer_optional_reflection':
      return coach.optionalReflection ? [coach.optionalReflection] : [];
    case 'need_adult':
      return [];
  }
}

export default function ChildTaskScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const role = usePrototypeStore((state) => state.role);
  const canEnterChildExperience = usePrototypeStore(selectCanEnterChildExperience);
  const beginTemporaryParentAccess = usePrototypeStore((state) => state.beginTemporaryParentAccess);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const activeChildAgeBand = usePrototypeStore(
    (state): AgeBand => state.children[state.activeChildId].ageBand,
  );
  const journey = usePrototypeStore((state) => state.journey);
  const coach = usePrototypeStore((state) => state.childCoachResult);
  const liveChildCoachView = usePrototypeStore((state) => state.liveChildCoachView);
  const liveChildCoachGrant = usePrototypeStore(
    (state) => state.liveChildAiGrants[state.activeChildId].text,
  );
  const liveChildVoiceGrant = usePrototypeStore(
    (state) => state.liveChildAiGrants[state.activeChildId].voice,
  );
  const liveVoiceCapture = usePrototypeStore((state) => state.liveVoiceCapture);
  const ageAdaptedCoachResult = usePrototypeStore((state) => state.ageAdaptedCoachResult);
  const childVoiceView = usePrototypeStore((state) => state.childVoiceView);
  const childTaskDraft = usePrototypeStore((state) => state.childTaskDraft);
  const startAssignment = usePrototypeStore((state) => state.startAssignment);
  const prepareChildVoice = usePrototypeStore((state) => state.prepareChildVoice);
  const runChildVoiceCommand = usePrototypeStore((state) => state.runChildVoiceCommand);
  const requestChildCoach = usePrototypeStore((state) => state.requestChildCoach);
  const requestLiveChildCoach = usePrototypeStore((state) => state.requestLiveChildCoach);
  const declineLiveChildCoach = usePrototypeStore((state) => state.declineLiveChildCoach);
  const clearLiveChildCoach = usePrototypeStore((state) => state.clearLiveChildCoach);
  const prepareLiveVoiceCapture = usePrototypeStore((state) => state.prepareLiveVoiceCapture);
  const requestLiveVoicePermission = usePrototypeStore((state) => state.requestLiveVoicePermission);
  const startLiveVoiceHold = usePrototypeStore((state) => state.startLiveVoiceHold);
  const stopLiveVoiceHold = usePrototypeStore((state) => state.stopLiveVoiceHold);
  const editLiveVoiceTranscript = usePrototypeStore((state) => state.editLiveVoiceTranscript);
  const markLiveVoiceTranscriptReady = usePrototypeStore(
    (state) => state.markLiveVoiceTranscriptReady,
  );
  const deleteLiveVoiceCapture = usePrototypeStore((state) => state.deleteLiveVoiceCapture);
  const sendLiveVoiceTranscript = usePrototypeStore((state) => state.sendLiveVoiceTranscript);
  const cancelLiveVoiceCapture = usePrototypeStore((state) => state.cancelLiveVoiceCapture);
  const selectPreparedMedia = usePrototypeStore((state) => state.selectPreparedMedia);
  const removePreparedMedia = usePrototypeStore((state) => state.removePreparedMedia);
  const markPreparedMediaUnavailable = usePrototypeStore(
    (state) => state.markPreparedMediaUnavailable,
  );
  const setChildTaskReflection = usePrototypeStore((state) => state.setChildTaskReflection);
  const submitTask = usePrototypeStore((state) => state.submitTask);
  const [busyIntent, setBusyIntent] = useState<ChildCoachIntent | null>(null);
  const [activeCoachIntent, setActiveCoachIntent] = useState<ChildCoachIntent | null>(null);
  const [adultSupportRequested, setAdultSupportRequested] = useState(false);
  const [showDefinitionDetails, setShowDefinitionDetails] = useState(false);
  const [showOptionalMedia, setShowOptionalMedia] = useState(false);
  const [showSupportTools, setShowSupportTools] = useState(false);
  const [completedStepIds, setCompletedStepIds] = useState<readonly string[]>([]);
  const [definitionAcknowledged, setDefinitionAcknowledged] = useState(false);
  const [showCompletionConfirmation, setShowCompletionConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRetryFollowUp = journey?.lifecycle === 'in_progress' && journey.submission !== null;
  const [isInterruptedRecovery] = useState(
    () => journey?.lifecycle === 'in_progress' && journey.submission === null,
  );
  const completionActionRef = useRef<View>(null);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitGuardRef = useRef(false);
  const announcedWaitingIdRef = useRef<string | null>(null);

  const hasTaskPrerequisite = Boolean(
    journey?.assignment &&
    journey.assignment.childId === activeChildId &&
    journey.task.targetChildId === activeChildId &&
    ['chosen', 'in_progress', 'submitted'].includes(journey.lifecycle),
  );

  useEffect(() => {
    if (role !== 'child' || !canEnterChildExperience) {
      router.replace('/');
      return;
    }
    if (!hasTaskPrerequisite) router.replace('/child');
  }, [canEnterChildExperience, hasTaskPrerequisite, role, router]);

  useEffect(() => {
    if (role === 'child' && journey?.lifecycle === 'in_progress') {
      prepareChildVoice();
    }
  }, [journey?.lifecycle, journey?.task.id, journey?.task.version, prepareChildVoice, role]);

  useEffect(
    () => () => {
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
      submitGuardRef.current = false;
    },
    [],
  );

  useEffect(() => {
    const submissionId = journey?.submission?.id;
    if (
      role !== 'child' ||
      journey?.lifecycle !== 'submitted' ||
      !submissionId ||
      announcedWaitingIdRef.current === submissionId
    ) {
      return;
    }
    announcedWaitingIdRef.current = submissionId;
    AccessibilityInfo.announceForAccessibility(
      `${t('childTask.waitingTitle')}. ${t('childTask.waitingBody')}`,
    );
  }, [journey?.lifecycle, journey?.submission?.id, role, t]);

  const physicalBack = () => router.replace('/child');

  const askCoach = async (intent: ChildCoachIntent) => {
    if (busyIntent) return;
    setBusyIntent(intent);
    setError(null);
    const result = await requestChildCoach({ requestId: `child-coach-${intent}-v1`, intent });
    setBusyIntent(null);
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
    setActiveCoachIntent(intent);
  };

  const runVoiceCommand = (command: ChildVoiceCommand) => {
    setError(null);
    const result = runChildVoiceCommand(command);
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  if (role !== 'child') return null;
  if (!hasTaskPrerequisite) return null;
  if (!journey?.assignment) return null;

  const content = journey.task.content;
  const priorSubmission = isRetryFollowUp ? journey.submission : null;
  const childFacingTitle =
    content.id === P0_RECYCLING_TEMPLATE.id
      ? t('childTask.title')
      : localize(content.title, locale);
  const fixtures = serviceRegistry.media.listPrepared();
  const coachDisclosure =
    ageAdaptedCoachResult?.aiDisclosure ??
    coach?.meta.disclosure.text ??
    serviceRegistry.childCoach.disclosure.text;
  const preparedCoachAvailable = journey.task.version === 1;
  const taskCheckpoints: readonly ChildTaskCheckpoint[] = preparedCoachAvailable
    ? [
        {
          id: 'adult-check-and-sort',
          title: t('childTask.stepOne'),
          detail: t('childTask.stepTwo'),
        },
        {
          id: 'stop-route-aftercare',
          title: t('childTask.stepThree'),
          detail: t('childTask.stepFour'),
        },
      ]
    : [
        {
          id: 'adjusted-action',
          title: localize(content.positiveAction, locale),
          detail: localize(content.safety.stopAndAskAdult, locale),
        },
        {
          id: 'adjusted-definition',
          title: t('childTask.definition'),
          detail: localize(content.definitionOfDone, locale),
        },
      ];
  const taskComplete = completedStepIds.length === taskCheckpoints.length;
  const displayedCoachIntent = activeCoachIntent ?? (coach ? 'show_steps' : null);
  const displayedCoachLines =
    coach && ageAdaptedCoachResult && displayedCoachIntent
      ? coachLinesForIntent(coach, ageAdaptedCoachResult, displayedCoachIntent)
      : [];
  const coachIntentLabel = displayedCoachIntent
    ? t(
        displayedCoachIntent === 'need_adult'
          ? 'childTask.adultExit'
          : `childTask.${
              COACH_INTENTS.find(({ intent }) => intent === displayedCoachIntent)?.key ??
              'showSteps'
            }`,
      )
    : null;
  const stepFormatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE');
  const awardLabel = content.displayedSeedAward
    ? t('childHome.awardAfterConfirmation', { count: content.displayedSeedAward })
    : t('taskReview.noSeedRecognition');
  const taskCategory = TASK_CATEGORIES.find((category) => category.id === content.categoryId);
  const categoryLabel = taskCategory ? localize(taskCategory.label, locale) : t('origin.prepared');
  const hasMedia = childTaskDraft.selectedMediaFixtureId !== null;
  const hasReflection = Boolean(
    childTaskDraft.reflection?.ar.trim() || childTaskDraft.reflection?.en.trim(),
  );

  const toggleCheckpoint = (stepId: string) => {
    setCompletedStepIds((current) =>
      current.includes(stepId)
        ? current.filter((currentId) => currentId !== stepId)
        : [...current, stepId],
    );
  };

  const startTask = () => {
    setError(null);
    const result = startAssignment();
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const submit = () => {
    if (submitGuardRef.current || submitting || !taskComplete || !definitionAcknowledged) return;
    submitGuardRef.current = true;
    setSubmitting(true);
    setError(null);
    submitTimerRef.current = setTimeout(() => {
      const result = submitTask({
        definitionAcknowledged,
        completionMode: 'permitted_help',
        helpUsed: bilingualResource('checkIn.recordedHelp'),
        preparedMediaFixtureId: childTaskDraft.selectedMediaFixtureId,
        reflection: childTaskDraft.reflection,
        observableFacts: [bilingualResource('checkIn.recordedFact')],
      });
      submitTimerRef.current = null;
      submitGuardRef.current = false;
      setSubmitting(false);
      if (!result.ok) {
        setError(t('errors.safeRetry'));
        return;
      }
      setShowCompletionConfirmation(false);
    }, 240);
  };

  const headerTitleKey =
    journey.lifecycle === 'chosen'
      ? 'childTask.detailsTitle'
      : isRetryFollowUp
        ? 'r002aFollowUp.headerTitle'
        : 'childTask.activeTitle';
  const header = (
    <R002aFlowHeader
      backLabel={t('common.back')}
      direction={direction}
      onBack={physicalBack}
      title={t(headerTitleKey)}
    />
  );

  if (journey.lifecycle === 'chosen') {
    return (
      <R002aScreen
        contentContainerStyle={styles.screenContent}
        footer={
          <ChildTaskActionFooter
            direction={direction}
            label={t('childTask.startTask')}
            onPress={startTask}
            testID="start-task-button"
          />
        }
        header={header}
        testID="child-task-start-screen"
      >
        <ChildTaskHero
          awardLabel={awardLabel}
          categoryLabel={categoryLabel}
          direction={direction}
          effortLabel={localize(content.estimatedEffort, locale)}
          statusLabel={t('childTask.statusReady')}
          title={childFacingTitle}
        />
        <ChildTaskPlanCard
          direction={direction}
          steps={taskCheckpoints}
          title={t('childTask.planTitle')}
        />
        <ChildDefinitionCard
          direction={direction}
          numberOfLines={showDefinitionDetails ? undefined : 4}
          title={t('childTask.definition')}
          value={localize(content.definitionOfDone, locale)}
        />
        <QuietButton
          accessibilityState={{ expanded: showDefinitionDetails }}
          brand
          direction={direction}
          onPress={() => setShowDefinitionDetails((value) => !value)}
          size="compact"
          testID="toggle-definition-details-button"
        >
          {t(
            showDefinitionDetails
              ? 'childTask.hideDefinitionDetails'
              : 'childTask.showDefinitionDetails',
          )}
        </QuietButton>
        <View style={[styles.notice, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.tertiary} name="info" size={21} />
          <Text brand color="tertiary" direction={direction} style={styles.grow}>
            {localize(content.permittedHelp, locale)}
          </Text>
        </View>
        <LanguageSwitcher compact showGuidance={false} />
        {error ? (
          <Text accessibilityLiveRegion="polite" brand color="danger" direction={direction}>
            {error}
          </Text>
        ) : null}
      </R002aScreen>
    );
  }

  if (journey.lifecycle === 'submitted') {
    return (
      <R002aScreen
        contentContainerStyle={styles.submittedContent}
        header={header}
        safeAreaEdges={['top', 'left', 'right', 'bottom']}
        testID="child-task-submitted-screen"
      >
        <ChildWaitingForReview
          actionLabel={t('navigation.switchToParent')}
          body={t('childTask.waitingBody')}
          direction={direction}
          noEarlyRewardLabel={t('taskReview.noEarlyReward')}
          onAction={() => {
            setError(null);
            const result = beginTemporaryParentAccess();
            if (!result.ok) {
              setError(t('errors.safeRetry'));
              return;
            }
            router.replace('/');
          }}
          statusLabel={t('childTask.waitingStatus')}
          taskLabel={childFacingTitle}
          title={t('childTask.waitingTitle')}
        />
        <LanguageSwitcher compact showGuidance={false} />
        {error ? (
          <Text accessibilityLiveRegion="polite" brand color="danger" direction={direction}>
            {error}
          </Text>
        ) : null}
      </R002aScreen>
    );
  }

  return (
    <>
      <R002aScreen
        contentContainerStyle={styles.screenContent}
        footer={
          <ChildTaskActionFooter
            direction={direction}
            disabled={!taskComplete || !definitionAcknowledged}
            label={t('childTask.completeTask')}
            onPress={() => {
              setError(null);
              setShowCompletionConfirmation(true);
            }}
            ref={completionActionRef}
            testID="complete-task-button"
          />
        }
        header={header}
        keyboardAware
        testID="child-task-screen"
      >
        <ChildTaskHero
          awardLabel={awardLabel}
          categoryLabel={categoryLabel}
          direction={direction}
          effortLabel={localize(content.estimatedEffort, locale)}
          statusLabel={t('childTask.statusActive')}
          title={childFacingTitle}
          variant="active"
        />

        {priorSubmission ? (
          <ChildTaskFollowUpContext
            body={t('r002aFollowUp.body')}
            completionModeLabel={t('checkIn.completionMode')}
            completionModeValue={t(
              priorSubmission.completionMode === 'independent'
                ? 'checkIn.independentCompletion'
                : 'checkIn.permittedHelpCompletion',
            )}
            direction={direction}
            factValues={
              priorSubmission.observableFacts.length > 0
                ? priorSubmission.observableFacts.map((fact) => localize(fact, locale))
                : [t('r002aFollowUp.noFactsRecorded')]
            }
            factsLabel={t('r002aFollowUp.factsLabel')}
            freshStepsBody={t('r002aFollowUp.freshStepsBody')}
            freshStepsTitle={t('r002aFollowUp.freshStepsTitle')}
            helpLabel={t('checkIn.help')}
            helpValue={
              priorSubmission.helpUsed
                ? localize(priorSubmission.helpUsed, locale)
                : t('r002aFollowUp.noHelpRecorded')
            }
            noLossLabel={t('r002aFollowUp.noLoss')}
            parentNote={t('checkIn.retryObservation')}
            parentNoteLabel={t('r002aFollowUp.parentNote')}
            priorAttemptLabel={t('r002aFollowUp.priorAttempt', {
              count: stepFormatter.format(priorSubmission.attempt),
            })}
            statusLabel={t('r002aFollowUp.status')}
            title={t('r002aFollowUp.title')}
          />
        ) : null}

        {isInterruptedRecovery ? (
          <View
            accessibilityLiveRegion="polite"
            style={[styles.recoveryNotice, { flexDirection: logicalRowDirection(direction) }]}
            testID="child-task-interrupted-recovery"
          >
            <GhafIcon color={colors.mangroveTeal} name="info" size={20} />
            <Text
              brand
              color="deepForest"
              direction={direction}
              style={styles.grow}
              variant="caption"
            >
              {t('childTask.interruptedRecovery')}
            </Text>
          </View>
        ) : null}

        <ChildTaskChecklist
          completedLabel={t('childTask.progress', {
            current: stepFormatter.format(completedStepIds.length),
            total: stepFormatter.format(taskCheckpoints.length),
          })}
          completedStepIds={completedStepIds}
          direction={direction}
          onToggle={toggleCheckpoint}
          steps={taskCheckpoints}
          title={t('childTask.checklistTitle')}
        />

        <ChildDefinitionCard
          acknowledgeLabel={t('childTask.acknowledge')}
          acknowledged={definitionAcknowledged}
          direction={direction}
          numberOfLines={showDefinitionDetails ? undefined : 3}
          onToggleAcknowledgement={() => setDefinitionAcknowledged((value) => !value)}
          testID="child-active-definition-of-done"
          title={t('childTask.definition')}
          value={localize(content.definitionOfDone, locale)}
        />
        <QuietButton
          accessibilityState={{ expanded: showDefinitionDetails }}
          brand
          direction={direction}
          onPress={() => setShowDefinitionDetails((value) => !value)}
          size="compact"
          testID="toggle-active-definition-details-button"
        >
          {t(
            showDefinitionDetails
              ? 'childTask.hideDefinitionDetails'
              : 'childTask.showDefinitionDetails',
          )}
        </QuietButton>

        <View style={styles.supportEntry}>
          <View style={[styles.supportHeading, { flexDirection: logicalRowDirection(direction) }]}>
            <View style={styles.supportIcon}>
              <GhafIcon color={colors.ghafEmerald} name="help" size={25} />
            </View>
            <View style={styles.grow}>
              <Text brand color="deepForest" direction={direction} variant="heading">
                {t('childTask.supportToolsTitle')}
              </Text>
              <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                {t('childTask.supportToolsBody')}
              </Text>
            </View>
          </View>
          <TrustedAdultExit
            body={t('childTask.adultExitBody')}
            label={t('childTask.adultExit')}
            onPress={() => {
              setAdultSupportRequested(true);
              if (preparedCoachAvailable && !aiFeatureFlags.ai_child_coach_text_live) {
                setShowSupportTools(true);
                void askCoach('need_adult');
              }
            }}
            testID="trusted-adult-exit"
          />
          <QuietButton
            accessibilityState={{ expanded: showSupportTools }}
            brand
            direction={direction}
            onPress={() => setShowSupportTools((value) => !value)}
            size="compact"
            testID="toggle-support-tools-button"
          >
            {t(showSupportTools ? 'childTask.hideSupportTools' : 'childTask.openSupportTools')}
          </QuietButton>
          {adultSupportRequested ? (
            <Text accessibilityLiveRegion="polite" brand color="deepForest" direction={direction}>
              {t('childTask.adultExitBody')}
            </Text>
          ) : null}
        </View>

        {showSupportTools ? (
          <View style={styles.supportTools} testID="child-support-tools">
            {aiFeatureFlags.ai_child_coach_text_live ? (
              <LiveChildCoachPanel
                ageBand={activeChildAgeBand}
                direction={direction}
                grant={liveChildCoachGrant}
                locale={locale}
                onClear={clearLiveChildCoach}
                onDecline={declineLiveChildCoach}
                onRequest={requestLiveChildCoach}
                view={liveChildCoachView}
              />
            ) : (
              <View style={styles.coach} testID="prepared-child-coach">
                <AssistantIdentity
                  description={t('childTask.coachPreparedPurpose')}
                  direction={direction}
                  language={locale}
                  origin="prepared"
                  originLabel={t('assistant.preparedLabel')}
                  testID="prepared-child-coach-identity"
                  title={t('childTask.coachTitle')}
                />
                {preparedCoachAvailable ? (
                  <>
                    <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                      {localize(coachDisclosure, locale)}
                    </Text>
                    <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                      {t('assistant.noChat')}
                    </Text>
                    <Text
                      brand
                      color="deepForest"
                      direction={direction}
                      testID="coach-actions-heading"
                      variant="label"
                    >
                      {t('childTask.coachActionsTitle')}
                    </Text>
                    <View
                      style={[
                        styles.intentGrid,
                        direction === 'rtl' ? styles.intentGridRtl : styles.intentGridLtr,
                      ]}
                    >
                      {COACH_INTENTS.slice(
                        0,
                        ageAdaptedCoachResult?.policy.quickChoiceLimit ?? COACH_INTENTS.length,
                      ).map(({ intent, key }, index) => (
                        <Button
                          brand
                          busy={busyIntent === intent}
                          busyLabel={t('assistant.loading')}
                          disabled={busyIntent !== null}
                          fullWidth={false}
                          key={intent}
                          onPress={() => void askCoach(intent)}
                          variant="secondary"
                        >
                          {ageAdaptedCoachResult?.quickChoices[index]
                            ? localize(ageAdaptedCoachResult.quickChoices[index], locale)
                            : t(`childTask.${key}`)}
                        </Button>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text
                    brand
                    color="onSurfaceVariant"
                    direction={direction}
                    testID="adjusted-task-coach-unavailable"
                  >
                    {t('childTask.adjustedCoachUnavailable')}
                  </Text>
                )}
                {preparedCoachAvailable && coach && ageAdaptedCoachResult ? (
                  <View
                    accessibilityLiveRegion="polite"
                    style={styles.coachResult}
                    testID="child-coach-result"
                  >
                    {coach.meta.fallbackUsed ? (
                      <Text
                        accessibilityLiveRegion="polite"
                        brand
                        color="tertiary"
                        direction={direction}
                        variant="caption"
                      >
                        {t('assistant.unavailable')}
                      </Text>
                    ) : null}
                    {coachIntentLabel ? (
                      <Text brand color="mangroveTeal" direction={direction} variant="label">
                        {coachIntentLabel}
                      </Text>
                    ) : null}
                    {displayedCoachLines.map((line, index) => (
                      <Text brand direction={direction} key={`${displayedCoachIntent}-${line.en}`}>
                        {displayedCoachLines.length > 1
                          ? `${stepFormatter.format(index + 1)}. `
                          : ''}
                        {localize(line, locale)}
                      </Text>
                    ))}
                    {displayedCoachIntent === 'show_steps' && coach.optionalReflection ? (
                      <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                        {localize(coach.optionalReflection, locale)}
                      </Text>
                    ) : null}
                    {displayedCoachIntent === 'need_adult' ? (
                      <Text brand color="deepForest" direction={direction} variant="label">
                        {localize(coach.adultExit.label, locale)}
                      </Text>
                    ) : null}
                    <View style={styles.coachPolicy} testID="child-coach-age-policy">
                      <Text brand color="deepForest" direction={direction} variant="label">
                        {t('coachPolicy.title')}
                      </Text>
                      <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                        {t('coachPolicy.ageAdapted', {
                          band: ageAdaptedCoachResult.ageBand.replace('_', '–'),
                        })}
                        {' · '}
                        {t('coachPolicy.maximumSteps', {
                          count: ageAdaptedCoachResult.policy.maximumSteps,
                        })}
                        {' · '}
                        {t(
                          ageAdaptedCoachResult.policy.pace === 'slow'
                            ? 'coachPolicy.slowerPace'
                            : 'coachPolicy.standardPace',
                        )}
                      </Text>
                      <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                        {t('coachPolicy.taskBound')} {t('coachPolicy.noOpenChat')}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            )}

            {aiFeatureFlags.ai_child_coach_voice_live && activeChildAgeBand === '12_14' ? (
              <LiveVoiceCapturePanel
                direction={direction}
                grant={liveChildVoiceGrant}
                locale={locale}
                onCancel={cancelLiveVoiceCapture}
                onDelete={deleteLiveVoiceCapture}
                onEditTranscript={editLiveVoiceTranscript}
                onMarkReady={markLiveVoiceTranscriptReady}
                onPrepare={prepareLiveVoiceCapture}
                onRequestPermission={requestLiveVoicePermission}
                onSend={sendLiveVoiceTranscript}
                onStartHold={startLiveVoiceHold}
                onStopHold={stopLiveVoiceHold}
                state={liveVoiceCapture?.state ?? null}
              />
            ) : (
              <SyntheticVoicePanel
                onCommand={runVoiceCommand}
                taskSupported={preparedCoachAvailable}
                view={childVoiceView}
              />
            )}
            <LanguageSwitcher compact showGuidance={false} />
            <QuietButton
              accessibilityState={{ expanded: showOptionalMedia }}
              brand
              direction={direction}
              onPress={() => setShowOptionalMedia((value) => !value)}
              size="compact"
              testID="toggle-optional-media-button"
            >
              {t(
                showOptionalMedia
                  ? 'childTask.hideOptionalDetails'
                  : 'childTask.showOptionalDetails',
              )}
            </QuietButton>
            {showOptionalMedia ? (
              <View style={styles.mediaSection} testID="optional-media-section">
                <Text brand color="deepForest" direction={direction} variant="heading">
                  {t('childTask.mediaTitle')}
                </Text>
                <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                  {t('childTask.mediaDisclosure')}
                </Text>
                {fixtures.map((fixture) => {
                  const selected = childTaskDraft.selectedMediaFixtureId === fixture.id;
                  const unavailable = childTaskDraft.unavailableMediaFixtureIds.includes(
                    fixture.id,
                  );
                  return (
                    <PreparedMedia
                      fixture={fixture}
                      key={fixture.id}
                      onRemove={() => {
                        const result = removePreparedMedia(fixture.id);
                        if (!result.ok) setError(t('errors.safeRetry'));
                      }}
                      onSelect={() => {
                        const result = selectPreparedMedia(fixture.id);
                        if (!result.ok) setError(t('errors.safeRetry'));
                      }}
                      onUnavailable={() => {
                        const result = markPreparedMediaUnavailable(fixture.id);
                        if (!result.ok) setError(t('errors.safeRetry'));
                      }}
                      selected={selected}
                      testID={`prepared-media-${fixture.kind}`}
                      unavailable={unavailable}
                    />
                  );
                })}
                <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                  {t('media.optional')}
                </Text>
                <Input
                  accessibilityLanguage={locale === 'ar' ? 'ar-AE' : 'en-AE'}
                  direction={direction}
                  label={t('childTask.reflection')}
                  maxLength={TASK_REFLECTION_MAX_LENGTH}
                  multiline
                  onChangeText={(value) => {
                    const current = childTaskDraft.reflection ?? { ar: '', en: '' };
                    const result = setChildTaskReflection({ ...current, [locale]: value });
                    if (!result.ok) setError(t('errors.safeRetry'));
                  }}
                  value={childTaskDraft.reflection?.[locale] ?? ''}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={[styles.privacyNotice, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.onSurfaceVariant} name="shield" size={20} />
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            style={styles.grow}
            variant="caption"
          >
            {t('childTask.visibilityBeforeSubmit')}
          </Text>
        </View>
        {error && !showCompletionConfirmation ? (
          <Text accessibilityLiveRegion="polite" brand color="danger" direction={direction}>
            {error}
          </Text>
        ) : null}
      </R002aScreen>

      <ChildCompletionConfirmationSheet
        awardLabel={awardLabel}
        busy={submitting}
        busyLabel={t('childTask.submitting')}
        direction={direction}
        error={error}
        hasMedia={hasMedia}
        mediaLabel={t(
          childTaskDraft.selectedMediaFixtureId
            ? 'childTask.mediaIncluded'
            : 'childTask.mediaNotIncluded',
        )}
        message={t('childTask.confirmationBody')}
        noEarlyRewardLabel={t('taskReview.noEarlyReward')}
        onDismiss={() => setShowCompletionConfirmation(false)}
        onSubmit={submit}
        privacyLabel={t('childTask.visibilityBeforeSubmit')}
        reflectionLabel={t(
          hasReflection ? 'childTask.reflectionIncluded' : 'childTask.reflectionNotIncluded',
        )}
        returnFocusRef={completionActionRef}
        returnLabel={t('childTask.returnToTask')}
        submitLabel={t('childTask.submit')}
        taskCompleteLabel={t('childTask.confirmationTaskComplete')}
        taskTitle={childFacingTitle}
        taskTitleLabel={t('childTask.confirmationTaskLabel')}
        title={t('childTask.confirmationTitle')}
        visible={showCompletionConfirmation}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing.xxl,
  },
  submittedContent: {
    flexGrow: 1,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
  notice: {
    minHeight: layout.touchTarget,
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: r001Radii.md,
    backgroundColor: colors.solarAmberTint,
    padding: spacing.sm,
  },
  recoveryNotice: {
    minHeight: layout.touchTarget,
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: r001Radii.md,
    backgroundColor: colors.mangroveTealTint,
    padding: spacing.sm,
  },
  supportEntry: {
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  supportHeading: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  supportIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.primaryFixedTint,
  },
  supportTools: {
    gap: spacing.xl,
  },
  coach: {
    gap: spacing.md,
  },
  intentGrid: {
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  intentGridRtl: {
    flexDirection: 'row-reverse',
  },
  intentGridLtr: {
    flexDirection: 'row',
  },
  coachResult: {
    gap: spacing.md,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.secondaryContainer,
    padding: spacing.md,
  },
  coachPolicy: {
    gap: spacing.xxs,
    borderRadius: r001Radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.sm,
  },
  mediaSection: {
    gap: spacing.md,
  },
  privacyNotice: {
    minHeight: layout.touchTarget,
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: r001Radii.md,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.sm,
  },
});
