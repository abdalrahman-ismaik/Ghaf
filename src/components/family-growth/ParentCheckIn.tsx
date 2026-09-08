import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GhafIcon } from '@/components/access';
import { PreparedMedia } from '@/components/family-growth/PreparedMedia';
import { RoutinePhaseReview } from '@/components/family-growth/TaskPanels';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Input, PrimaryButton, QuietButton, SecondaryButton, Text } from '@/components/primitives';
import {
  ParentApprovalSuccessSheet,
  ParentReviewTaskCard,
  ParentSupportRequestSheet,
  R002aFlowHeader,
  R002aScreen,
  type ParentSupportStep,
} from '@/components/r002a';
import {
  colors,
  layout,
  logicalRowDirection,
  r001Radii,
  r001Shadows,
  spacing,
} from '@/design/tokens';
import { P0_RECYCLING_TEMPLATE, TASK_CATEGORIES } from '@/features/tasks/demoContent';
import { bilingualResource, localize } from '@/i18n';
import type { GardenStage, LandscapeId, LocalizedText } from '@/models/familyGrowth';
import { PREPARED_PRAISE, serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const LANDSCAPE_LABEL_KEYS: Readonly<Record<LandscapeId, string>> = {
  ghaf: 'garden.ghaf',
  samar: 'garden.samar',
  sidr: 'garden.sidr',
  date_palm: 'garden.datePalm',
  mangrove: 'garden.mangrove',
};

const STAGE_LABEL_KEYS: Readonly<Record<GardenStage, string>> = {
  seed: 'garden.seed',
  shoot: 'garden.shoot',
  sapling: 'garden.sapling',
  shade: 'garden.shade',
  flourishing: 'garden.flourishing',
};

interface ParentCheckInProps {
  onBack: () => void;
  onOpenGarden: () => void;
  onResumeChild: () => boolean;
  onReturnToTasks: () => void;
}

export function ParentCheckIn({
  onBack,
  onOpenGarden,
  onResumeChild,
  onReturnToTasks,
}: ParentCheckInProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const children = usePrototypeStore((state) => state.children);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const journey = usePrototypeStore((state) => state.journey);
  const confirmationPlan = usePrototypeStore((state) => state.confirmationPlan);
  const lastRecognitionAttempt = usePrototypeStore((state) => state.lastRecognitionAttempt);
  const recognitionLedger = usePrototypeStore((state) => state.recognitionLedger);
  const routineProgressByTask = usePrototypeStore((state) => state.routineProgressByTask);
  const requestKindRetry = usePrototypeStore((state) => state.requestKindRetry);
  const resumeRetry = usePrototypeStore((state) => state.resumeRetry);
  const markPraisePresented = usePrototypeStore((state) => state.markPraisePresented);
  const confirmAndPresentPraise = usePrototypeStore((state) => state.confirmAndPresentPraise);
  const applyRecognition = usePrototypeStore((state) => state.applyRecognition);
  const applyRoutinePhaseDecision = usePrototypeStore((state) => state.applyRoutinePhaseDecision);
  const reverseRoutinePhaseDecision = usePrototypeStore(
    (state) => state.reverseRoutinePhaseDecision,
  );
  const prospectiveTaskAdjustment = usePrototypeStore((state) => state.prospectiveTaskAdjustment);
  const planFutureTaskAdjustment = usePrototypeStore((state) => state.planFutureTaskAdjustment);
  const [praise, setPraise] = useState<LocalizedText>({ ...PREPARED_PRAISE });
  const [error, setError] = useState<string | null>(null);
  const [supportVisible, setSupportVisible] = useState(false);
  const [supportBusy, setSupportBusy] = useState(false);
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [showFreshSuccess, setShowFreshSuccess] = useState(false);
  const supportActionRef = useRef<View>(null);
  const supportSentRef = useRef<View>(null);

  useEffect(() => {
    if (journey?.lifecycle !== 'retry' || Platform.OS === 'web') return undefined;
    const frame = requestAnimationFrame(() => {
      const handle = findNodeHandle(supportSentRef.current);
      if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
    });
    return () => cancelAnimationFrame(frame);
  }, [journey?.lifecycle]);

  if (!journey?.submission) return null;

  const submission = journey.submission;
  const content = journey.task.content;
  const child = children[journey.assignment?.childId ?? activeChildId];
  const childName = localize(child.displayName, locale);
  const taskTitle =
    content.id === P0_RECYCLING_TEMPLATE.id
      ? t('childTask.title')
      : localize(content.title, locale);
  const category = TASK_CATEGORIES.find((candidate) => candidate.id === content.categoryId);
  const categoryLabel = category ? localize(category.label, locale) : t('origin.prepared');
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE');
  const awardLabel = content.displayedSeedAward
    ? t('r002aReview.awardAfterApproval', {
        count: formatter.format(content.displayedSeedAward),
      })
    : t('taskReview.noSeedRecognition');
  const supportSteps: readonly ParentSupportStep[] = [
    {
      id: 'approved-safe-action',
      label: localize(content.positiveAction, locale),
    },
    { id: 'stop-and-ask', label: localize(content.safety.stopAndAskAdult, locale) },
  ];
  const preparedMedia = submission.preparedMediaFixtureId
    ? (serviceRegistry.media
        .listPrepared()
        .find((fixture) => fixture.id === submission.preparedMediaFixtureId) ?? null)
    : null;
  const recognitionKey = journey.checkIn?.recognitionKey ?? null;
  const storedReceipt = recognitionKey ? recognitionLedger[recognitionKey] : null;
  const latestReceipt = lastRecognitionAttempt?.receipt ?? null;
  const receipt =
    latestReceipt?.recognitionKey === recognitionKey ? latestReceipt : (storedReceipt ?? null);

  const header = (
    <R002aFlowHeader
      backLabel={t('common.back')}
      direction={direction}
      onBack={onBack}
      title={t('r002aReview.reviewTitle')}
    />
  );

  const retry = () => {
    setError(null);
    const result = requestKindRetry(bilingualResource('checkIn.retryObservation'));
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return false;
    }
    return true;
  };

  const resume = () => {
    setError(null);
    const result = resumeRetry();
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
    if (!onResumeChild()) setError(t('errors.safeRetry'));
  };

  const sendSupport = (stepIds: readonly string[]) => {
    if (supportBusy || stepIds.length === 0) return;
    setSupportBusy(true);
    requestAnimationFrame(() => {
      const succeeded = retry();
      setSupportBusy(false);
      if (succeeded) setSupportVisible(false);
    });
  };

  const plan = () => {
    if (approvalBusy) return;
    setApprovalBusy(true);
    setError(null);
    const result = confirmAndPresentPraise(
      {
        submissionId: submission.id,
        praise,
        neutralObservation: null,
        uncertainty: bilingualResource('checkIn.boundedUncertainty'),
      },
      {
        actionId: 'parent-confirm-and-present-praise-v1',
        source: 'parent_press',
        presentedAt: '2026-08-26T10:00:00.000Z',
      },
    );
    setApprovalBusy(false);
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const presentPraise = () => {
    if (approvalBusy) return;
    setApprovalBusy(true);
    setError(null);
    const result = markPraisePresented({
      actionId: 'parent-praise-present-v1',
      source: 'parent_press',
      presentedAt: '2026-08-26T10:00:00.000Z',
    });
    setApprovalBusy(false);
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const recognize = () => {
    if (approvalBusy) return;
    setApprovalBusy(true);
    setError(null);
    if (confirmationPlan?.renderState !== 'praise_presented') {
      setApprovalBusy(false);
      setError(t('errors.invalidState'));
      return;
    }
    const result = applyRecognition({
      actionId: 'parent-recognition-continue-v1',
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: confirmationPlan.presentationActionId,
    });
    setApprovalBusy(false);
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
    setShowFreshSuccess(result.data.disposition === 'applied');
  };

  const planFutureAdjustment = (kind: 'smaller' | 'safe_equivalent') => {
    setError(null);
    const result = planFutureTaskAdjustment(kind);
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  if (
    journey.lifecycle === 'recognized' ||
    lastRecognitionAttempt?.disposition === 'already_confirmed'
  ) {
    const isReentry =
      !showFreshSuccess || lastRecognitionAttempt?.disposition === 'already_confirmed';
    const phaseReview = receipt?.phaseReview ?? null;
    const routineProgress = routineProgressByTask[journey.task.id] ?? null;
    const phaseSelection = routineProgress?.decision?.selected ?? null;
    const selectPhase = (option: 'keep_acquisition' | 'move_future_to_maintenance') => {
      setError(null);
      const result =
        phaseSelection === option
          ? reverseRoutinePhaseDecision(journey.task.id)
          : applyRoutinePhaseDecision(journey.task.id, option);
      if (!result.ok) setError(t('errors.safeRetry'));
    };
    const phaseReviewControl = phaseReview ? (
      <RoutinePhaseReview
        assuranceText={t('checkIn.phaseReviewAssurance')}
        body={t('checkIn.phaseReviewBody')}
        onSelect={selectPhase}
        options={[
          {
            id: 'keep_acquisition',
            label: t('checkIn.phaseReviewKeep'),
            detail: t('taskReview.acquisitionPhase'),
          },
          {
            id: 'move_future_to_maintenance',
            label: t('checkIn.phaseReviewMaintenance'),
            detail: t('taskReview.maintenancePhase'),
          },
        ]}
        selectedId={phaseSelection}
        testID="future-phase-review"
        title={t('checkIn.phaseReviewTitle')}
      />
    ) : null;

    return (
      <>
        <R002aScreen
          contentContainerStyle={styles.centeredContent}
          footer={
            isReentry ? (
              <ReviewFooter>
                <PrimaryButton
                  brand
                  direction={direction}
                  language={locale}
                  onPress={onReturnToTasks}
                  size="regular"
                >
                  {t('r002aReview.returnToTasks', { child: childName })}
                </PrimaryButton>
                <QuietButton
                  brand
                  direction={direction}
                  language={locale}
                  onPress={onOpenGarden}
                  size="compact"
                >
                  {t('r002aReview.openGarden')}
                </QuietButton>
              </ReviewFooter>
            ) : undefined
          }
          header={header}
          safeAreaEdges={['top', 'left', 'right', 'bottom']}
          testID="parent-check-in-screen"
        >
          <View style={styles.successBackdrop} testID="already-confirmed-state">
            <GhafIcon color={colors.ghafEmerald} name="check-filled" size={48} />
            <Text align="center" brand color="r001Ink" direction={direction} variant="screenTitle">
              {t(isReentry ? 'r002aReview.duplicateTitle' : 'r002aReview.successTitle')}
            </Text>
            <Text
              align="center"
              brand
              color="onSurfaceVariant"
              direction={direction}
              variant="body"
            >
              {t(isReentry ? 'r002aReview.duplicateMessage' : 'r002aReview.successMessage')}
            </Text>
          </View>
          {isReentry ? phaseReviewControl : null}
          {isReentry && error ? <InlineError direction={direction} message={error} /> : null}
        </R002aScreen>
        {receipt && !isReentry ? (
          <ParentApprovalSuccessSheet
            actionLabel={t('r002aReview.returnToTasks', { child: childName })}
            direction={direction}
            language={locale}
            landscapeLabel={t(LANDSCAPE_LABEL_KEYS[content.landscapeId])}
            landscapeStageAfterLabel={t(
              STAGE_LABEL_KEYS[receipt.landscapeGrowth?.stageAfter ?? 'seed'],
            )}
            landscapeStageBeforeLabel={t(
              STAGE_LABEL_KEYS[receipt.landscapeGrowth?.stageBefore ?? 'seed'],
            )}
            message={t('r002aReview.successMessage')}
            onOpenGarden={onOpenGarden}
            onReturnToTasks={onReturnToTasks}
            receipt={receipt}
            secondaryLabel={t('r002aReview.openGarden')}
            title={t('r002aReview.successTitle')}
          >
            {phaseReviewControl}
          </ParentApprovalSuccessSheet>
        ) : null}
      </>
    );
  }

  if (journey.lifecycle === 'retry') {
    return (
      <R002aScreen
        contentContainerStyle={styles.centeredContent}
        header={header}
        safeAreaEdges={['top', 'left', 'right', 'bottom']}
        testID="parent-check-in-screen"
      >
        <View
          accessibilityLabel={`${t('r002aReview.supportSentTitle')}. ${t(
            'r002aReview.supportSentBody',
            { child: childName },
          )}`}
          accessibilityLiveRegion="polite"
          accessible
          ref={supportSentRef}
          style={styles.supportSent}
          testID="kind-retry-state"
        >
          <View style={styles.sentIcon}>
            <GhafIcon color={colors.mangroveTeal} name="check-filled" size={42} />
          </View>
          <Text align="center" brand color="r001Ink" direction={direction} variant="screenTitle">
            {t('r002aReview.supportSentTitle')}
          </Text>
          <Text align="center" brand color="onSurfaceVariant" direction={direction}>
            {t('r002aReview.supportSentBody', { child: childName })}
          </Text>
          <View style={styles.supportNote}>
            <Text brand color="mangroveTeal" direction={direction} variant="label">
              {t('r002aReview.supportNoteTitle')}
            </Text>
            <Text brand color="r001Ink" direction={direction}>
              {localize(journey.checkIn?.neutralObservation ?? { ar: '', en: '' }, locale)}
            </Text>
          </View>
          <View style={[styles.noLoss, { flexDirection: logicalRowDirection(direction) }]}>
            <GhafIcon color={colors.tertiary} name="info" size={20} />
            <Text
              brand
              color="tertiary"
              direction={direction}
              style={styles.grow}
              variant="caption"
            >
              {t('r002aReview.noLoss')}
            </Text>
          </View>
          {error ? (
            <Text accessibilityLiveRegion="assertive" brand color="error" direction={direction}>
              {error}
            </Text>
          ) : null}
          <PrimaryButton
            brand
            direction={direction}
            language={locale}
            onPress={resume}
            size="regular"
          >
            {t('r002aReview.resumeChild', { child: childName })}
          </PrimaryButton>
          <LanguageSwitcher compact showGuidance={false} />
        </View>
      </R002aScreen>
    );
  }

  if (confirmationPlan?.renderState === 'confirmation_pending') {
    return (
      <R002aScreen
        contentContainerStyle={styles.centeredContent}
        footer={
          <ReviewFooter>
            <PrimaryButton
              brand
              busy={approvalBusy}
              busyLabel={t('r002aReview.approvalPreparing')}
              direction={direction}
              language={locale}
              onPress={presentPraise}
              size="regular"
              testID="present-praise-button"
            >
              {t('r002aReview.presentPraise', { child: childName })}
            </PrimaryButton>
          </ReviewFooter>
        }
        header={header}
        testID="parent-check-in-screen"
      >
        <ParentReviewTaskCard
          awardLabel={awardLabel}
          categoryLabel={categoryLabel}
          childName={childName}
          direction={direction}
          submittedLabel={t('r002aReview.submittedForReview', { child: childName })}
          title={taskTitle}
        />
        <PraiseStateCard
          body={t('r002aReview.praiseReadyBody', { child: childName })}
          direction={direction}
          praise={localize(confirmationPlan.praise, locale)}
          title={t('r002aReview.praiseReadyTitle')}
        />
        {error ? <InlineError direction={direction} message={error} /> : null}
      </R002aScreen>
    );
  }

  if (confirmationPlan?.renderState === 'praise_presented') {
    return (
      <R002aScreen
        contentContainerStyle={styles.centeredContent}
        footer={
          <ReviewFooter>
            <PrimaryButton
              brand
              busy={approvalBusy}
              busyLabel={t('r002aReview.applying')}
              direction={direction}
              language={locale}
              onPress={recognize}
              size="regular"
              testID="apply-recognition-button"
            >
              {t('r002aReview.applyRecognition')}
            </PrimaryButton>
          </ReviewFooter>
        }
        header={header}
        testID="parent-check-in-screen"
      >
        <ParentReviewTaskCard
          awardLabel={awardLabel}
          categoryLabel={categoryLabel}
          childName={childName}
          direction={direction}
          submittedLabel={t('r002aReview.submittedForReview', { child: childName })}
          title={taskTitle}
        />
        <View accessibilityLiveRegion="polite" testID="praise-presented-state">
          <PraiseStateCard
            body={t('r002aReview.praiseShownBody')}
            direction={direction}
            praise={localize(confirmationPlan.praise, locale)}
            title={t('r002aReview.praiseShownTitle', { child: childName })}
          />
        </View>
        {error ? <InlineError direction={direction} message={error} /> : null}
      </R002aScreen>
    );
  }

  return (
    <>
      <R002aScreen
        contentContainerStyle={styles.reviewContent}
        footer={
          <ReviewFooter>
            <PrimaryButton
              brand
              busy={approvalBusy}
              busyLabel={t('r002aReview.approvalPreparing')}
              direction={direction}
              language={locale}
              onPress={plan}
              size="regular"
              testID="plan-confirmation-button"
            >
              {content.displayedSeedAward
                ? t('r002aReview.approvalActionWithSeeds', {
                    count: formatter.format(content.displayedSeedAward),
                  })
                : t('r002aReview.approvalAction')}
            </PrimaryButton>
            <View collapsable={false} ref={supportActionRef}>
              <SecondaryButton
                brand
                direction={direction}
                language={locale}
                onPress={() => {
                  setError(null);
                  setSupportVisible(true);
                }}
                size="regular"
                testID="kind-retry-button"
              >
                {t('r002aReview.requestSupport')}
              </SecondaryButton>
            </View>
          </ReviewFooter>
        }
        header={header}
        keyboardAware
        testID="parent-check-in-screen"
      >
        <View
          style={[
            styles.statusPill,
            direction === 'rtl' ? styles.statusPillRtl : styles.statusPillLtr,
          ]}
        >
          <Text align="center" brand color="tertiary" direction={direction} variant="label">
            {t('r002aReview.pendingStatus')}
          </Text>
        </View>

        <View style={styles.intro}>
          <Text brand color="r001Ink" direction={direction} variant="screenTitle">
            {t('r002aReview.pendingTitle', { child: childName })}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} variant="bodyLarge">
            {t('r002aReview.pendingBody', { child: childName })}
          </Text>
        </View>

        <ParentReviewTaskCard
          awardLabel={awardLabel}
          categoryLabel={categoryLabel}
          childName={childName}
          direction={direction}
          submittedLabel={t('r002aReview.submittedForReview', { child: childName })}
          title={taskTitle}
        />

        <View style={styles.section}>
          <View style={[styles.sectionHeading, { flexDirection: logicalRowDirection(direction) }]}>
            <Text
              brand
              color="r001Ink"
              direction={direction}
              style={styles.grow}
              variant="screenTitle"
            >
              {t('r002aReview.completedHeading', { child: childName })}
            </Text>
            <Text brand color="ghafEmerald" direction={direction} tabular variant="label">
              {t('r002aReview.definitionRecorded')}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View
            accessibilityLabel={t('r002aReview.definitionAcknowledged', { child: childName })}
            accessible
            style={[styles.completedStep, { flexDirection: logicalRowDirection(direction) }]}
          >
            <GhafIcon color={colors.ghafEmerald} name="check-filled" size={32} />
            <Text
              brand
              color="r001Ink"
              direction={direction}
              style={styles.grow}
              variant="bodyLarge"
            >
              {t('r002aReview.definitionAcknowledged', { child: childName })}
            </Text>
          </View>
        </View>

        <View style={[styles.helpCard, { flexDirection: logicalRowDirection(direction) }]}>
          <View style={styles.helpIcon}>
            <GhafIcon color={colors.mangroveTeal} name="help" size={26} />
          </View>
          <View style={styles.grow}>
            <Text brand color="r001Ink" direction={direction} variant="label">
              {t('r002aReview.parentHelpTitle')}
            </Text>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {submission.helpUsed
                ? localize(submission.helpUsed, locale)
                : t('r002aReview.parentHelpBody')}
            </Text>
          </View>
        </View>

        <View style={styles.evidenceCard}>
          <Text brand color="r001Ink" direction={direction} variant="screenTitle">
            {t('r002aReview.evidenceTitle')}
          </Text>
          <ReviewFact
            direction={direction}
            label={t('checkIn.completionMode')}
            value={t(
              submission.completionMode === 'permitted_help'
                ? 'checkIn.permittedHelpCompletion'
                : 'checkIn.independentCompletion',
            )}
          />
          <ReviewFact
            direction={direction}
            label={t('checkIn.facts')}
            value={submission.observableFacts.map((fact) => localize(fact, locale)).join(' ')}
          />
          {preparedMedia ? (
            <PreparedMedia fixture={preparedMedia} testID="parent-check-in-prepared-evidence" />
          ) : (
            <ReviewFact
              direction={direction}
              label={t('checkIn.media')}
              value={t('common.optional')}
            />
          )}
          <ReviewFact
            direction={direction}
            label={t('checkIn.reflection')}
            value={
              submission.reflection ? localize(submission.reflection, locale) : t('common.optional')
            }
          />
        </View>

        <View style={styles.praiseEditor}>
          <Text brand color="r001Ink" direction={direction} variant="screenTitle">
            {t('r002aReview.praiseTitle')}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
            {t('r002aReview.praiseBody', { child: childName })}
          </Text>
          <Input
            brand
            direction="rtl"
            label={t('language.arabic')}
            language="ar"
            multiline
            onChangeText={(ar) => setPraise((current) => ({ ...current, ar }))}
            value={praise.ar}
          />
          <Input
            brand
            direction="ltr"
            label={t('language.english')}
            language="en"
            multiline
            onChangeText={(en) => setPraise((current) => ({ ...current, en }))}
            value={praise.en}
          />
        </View>

        <View style={styles.futureOptions}>
          <QuietButton
            brand
            direction={direction}
            onPress={() => planFutureAdjustment('smaller')}
            testID="plan-smaller-future-task"
          >
            {t('checkIn.smallerFuture')}
          </QuietButton>
          <QuietButton
            brand
            direction={direction}
            onPress={() => planFutureAdjustment('safe_equivalent')}
            testID="plan-safe-future-equivalent"
          >
            {t('checkIn.safeEquivalent')}
          </QuietButton>
          {prospectiveTaskAdjustment?.requestedBy === 'parent' ? (
            <View accessibilityLiveRegion="polite" style={styles.futureNotice}>
              <Text brand color="ghafEmerald" direction={direction} variant="label">
                {t(
                  prospectiveTaskAdjustment.kind === 'smaller'
                    ? 'checkIn.smallerFuture'
                    : 'checkIn.safeEquivalent',
                )}
              </Text>
              <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                {t('origin.future')}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.noLoss, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.tertiary} name="info" size={20} />
          <Text brand color="tertiary" direction={direction} style={styles.grow} variant="caption">
            {t('taskReview.noEarlyReward')}
          </Text>
        </View>
        {error ? <InlineError direction={direction} message={error} /> : null}
        <LanguageSwitcher compact showGuidance={false} />
      </R002aScreen>

      <ParentSupportRequestSheet
        backLabel={t('common.back')}
        busy={supportBusy}
        busyLabel={t('r002aReview.supportSubmitting')}
        direction={direction}
        error={supportVisible ? error : null}
        language={locale}
        message={t('r002aReview.supportBody')}
        noRewardLabel={t('r002aReview.supportNoReward')}
        onDismiss={() => {
          if (!supportBusy) setSupportVisible(false);
        }}
        onSubmit={sendSupport}
        returnFocusRef={supportActionRef}
        steps={supportSteps}
        submitLabel={t('r002aReview.supportSubmit')}
        title={t('r002aReview.supportTitle')}
        visible={supportVisible}
      />
    </>
  );
}

function ReviewFooter({ children }: React.PropsWithChildren) {
  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.footerSafeArea}>
      <View style={styles.footer}>{children}</View>
    </SafeAreaView>
  );
}

function ReviewFact({
  direction,
  label,
  value,
}: {
  direction: 'ltr' | 'rtl';
  label: string;
  value: string;
}) {
  return (
    <View style={styles.fact}>
      <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
        {label}
      </Text>
      <Text brand color="r001Ink" direction={direction} variant="body">
        {value}
      </Text>
    </View>
  );
}

function PraiseStateCard({
  body,
  direction,
  praise,
  title,
}: {
  body: string;
  direction: 'ltr' | 'rtl';
  praise: string;
  title: string;
}) {
  return (
    <View style={styles.praiseState} testID="confirmation-pending-state">
      <View style={styles.praiseIcon}>
        <GhafIcon color={colors.ghafEmerald} name="sparkle" size={28} />
      </View>
      <Text align="center" brand color="r001Ink" direction={direction} variant="screenTitle">
        {title}
      </Text>
      <Text align="center" brand color="onSurfaceVariant" direction={direction}>
        {body}
      </Text>
      <View style={styles.praiseQuote}>
        <Text align="center" brand color="ghafEmerald" direction={direction} variant="bodyLarge">
          {praise}
        </Text>
      </View>
    </View>
  );
}

function InlineError({ direction, message }: { direction: 'ltr' | 'rtl'; message: string }) {
  return (
    <View style={styles.errorBox}>
      <Text accessibilityLiveRegion="assertive" brand color="error" direction={direction}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  reviewContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  centeredContent: {
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  statusPill: {
    borderRadius: r001Radii.pill,
    backgroundColor: colors.solarAmberTint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusPillRtl: {
    alignSelf: 'flex-end',
  },
  statusPillLtr: {
    alignSelf: 'flex-start',
  },
  intro: {
    gap: spacing.xs,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeading: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  grow: {
    flex: 1,
  },
  progressTrack: {
    height: 8,
    overflow: 'hidden',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerHigh,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.ghafEmerald,
  },
  completedStep: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  helpCard: {
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.secondaryFixedDim,
    backgroundColor: colors.mangroveTealTint,
    padding: spacing.lg,
  },
  helpIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLowest,
  },
  evidenceCard: {
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
  },
  fact: {
    gap: spacing.xxs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceContainerHigh,
    paddingBottom: spacing.sm,
  },
  praiseEditor: {
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.lg,
  },
  futureOptions: {
    gap: spacing.xs,
  },
  futureNotice: {
    gap: spacing.xxs,
    borderRadius: r001Radii.md,
    backgroundColor: colors.ghafEmeraldTint,
    padding: spacing.md,
  },
  noLoss: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    backgroundColor: colors.solarAmberTint,
    padding: spacing.md,
  },
  footerSafeArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceContainerHigh,
    backgroundColor: colors.r001Surface,
  },
  footer: {
    width: '100%',
    maxWidth: layout.compactContentWidth,
    alignSelf: 'center',
    gap: spacing.xs,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  supportSent: {
    width: '100%',
    gap: spacing.md,
    alignItems: 'stretch',
  },
  sentIcon: {
    width: 72,
    height: 72,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.secondaryTint,
  },
  supportNote: {
    gap: spacing.xs,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.mangroveTealTint,
    padding: spacing.lg,
  },
  praiseState: {
    alignItems: 'stretch',
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.xl,
    ...r001Shadows.soft,
  },
  praiseIcon: {
    width: 56,
    height: 56,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.ghafEmeraldTint,
  },
  praiseQuote: {
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.lg,
  },
  successBackdrop: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.huge,
  },
  errorBox: {
    borderRadius: r001Radii.md,
    backgroundColor: colors.errorContainer,
    padding: spacing.md,
  },
});
