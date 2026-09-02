import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PreparedMedia } from '@/components/family-growth/PreparedMedia';
import { RoutinePhaseReview } from '@/components/family-growth/TaskPanels';
import { Button, Input, Text } from '@/components/primitives';
import { colors, spacing } from '@/design/tokens';
import { bilingualResource, localize } from '@/i18n';
import type { LocalizedText } from '@/models/familyGrowth';
import { PREPARED_PRAISE, serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface ParentCheckInProps {
  onRecognized: () => void;
  onResumeChild: () => void;
}

export function ParentCheckIn({ onRecognized, onResumeChild }: ParentCheckInProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
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

  if (!journey?.submission) return null;

  const submission = journey.submission;
  const preparedMedia = submission.preparedMediaFixtureId
    ? (serviceRegistry.media
        .listPrepared()
        .find((fixture) => fixture.id === submission.preparedMediaFixtureId) ?? null)
    : null;

  const retry = () => {
    setError(null);
    const result = requestKindRetry(bilingualResource('checkIn.retryObservation'));
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
  };

  const resume = () => {
    setError(null);
    const result = resumeRetry();
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
    onResumeChild();
  };

  const plan = () => {
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
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const presentPraise = () => {
    setError(null);
    const result = markPraisePresented({
      actionId: 'parent-praise-present-v1',
      source: 'parent_press',
      presentedAt: '2026-08-26T10:00:00.000Z',
    });
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const recognize = () => {
    setError(null);
    if (confirmationPlan?.renderState !== 'praise_presented') {
      setError(t('errors.invalidState'));
      return;
    }
    const result = applyRecognition({
      actionId: 'parent-recognition-continue-v1',
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: confirmationPlan.presentationActionId,
    });
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
    onRecognized();
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
    const storedReceipt = journey.checkIn?.recognitionKey
      ? recognitionLedger[journey.checkIn.recognitionKey]
      : null;
    const phaseReview =
      lastRecognitionAttempt?.receipt.phaseReview ?? storedReceipt?.phaseReview ?? null;
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
    return (
      <View style={styles.alreadyConfirmed} testID="already-confirmed-state">
        <View style={styles.confirmedLeaf} />
        <Text color="forest" variant="heading">
          {t('checkIn.alreadyConfirmed')}
        </Text>
        <Text color="inkMuted">{t('checkIn.duplicateNoChange')}</Text>
        {phaseReview ? (
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
        ) : null}
        {phaseSelection ? (
          <Text accessibilityLiveRegion="polite" color="forest" variant="caption">
            {t('checkIn.phaseReviewRecorded')}
          </Text>
        ) : null}
        <Button onPress={onRecognized}>{t('navigation.garden')}</Button>
      </View>
    );
  }

  if (journey.lifecycle === 'retry') {
    return (
      <View style={styles.retryPanel} testID="kind-retry-state">
        <Text color="forest" variant="heading">
          {t('checkIn.retry')}
        </Text>
        <Text color="inkMuted">
          {localize(journey.checkIn?.neutralObservation ?? { ar: '', en: '' }, locale)}
        </Text>
        <Text color="forest" variant="label">
          {t('childHome.helpWelcome')}
        </Text>
        {error ? <Text color="danger">{error}</Text> : null}
        <Button onPress={resume}>{t('childHome.openTask')}</Button>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.factLedger}>
        <FactGroup label={t('checkIn.completionMode')}>
          <Text>
            {t(
              submission.completionMode === 'permitted_help'
                ? 'checkIn.permittedHelpCompletion'
                : 'checkIn.independentCompletion',
            )}
          </Text>
        </FactGroup>
        <FactGroup label={t('checkIn.facts')}>
          {submission.observableFacts.map((fact) => (
            <Text key={fact.en}>{localize(fact, locale)}</Text>
          ))}
        </FactGroup>
        <FactGroup label={t('checkIn.help')}>
          <Text>
            {submission.helpUsed
              ? localize(submission.helpUsed, locale)
              : localize(journey.task.content.permittedHelp, locale)}
          </Text>
        </FactGroup>
        <FactGroup label={t('checkIn.media')}>
          {preparedMedia ? (
            <PreparedMedia fixture={preparedMedia} testID="parent-check-in-prepared-evidence" />
          ) : (
            <Text color="inkMuted">{t('common.optional')}</Text>
          )}
        </FactGroup>
        <FactGroup label={t('checkIn.reflection')}>
          <Text color="inkMuted">
            {submission.reflection ? localize(submission.reflection, locale) : t('common.optional')}
          </Text>
        </FactGroup>
        <FactGroup label={t('checkIn.uncertainty')}>
          <Text color="inkMuted">{t('parentHome.summaryDisclosure')}</Text>
        </FactGroup>
      </View>

      {confirmationPlan?.renderState === 'praise_presented' ? (
        <View
          accessibilityLiveRegion="polite"
          style={styles.praisePresented}
          testID="praise-presented-state"
        >
          <Text color="earth" variant="caption">
            {t('checkIn.praisePresented')}
          </Text>
          <Text color="forest" variant="heading">
            {localize(confirmationPlan.praise, locale)}
          </Text>
          <Text color="inkMuted" variant="caption">
            {t('taskReview.noEarlyReward')}
          </Text>
          <Button onPress={recognize} testID="apply-recognition-button">
            {t('checkIn.applyRecognition')}
          </Button>
        </View>
      ) : confirmationPlan?.renderState === 'confirmation_pending' ? (
        <View style={styles.praisePending} testID="confirmation-pending-state">
          <Text color="forest" variant="heading">
            {localize(confirmationPlan.praise, locale)}
          </Text>
          <Text color="inkMuted" variant="caption">
            {t('taskReview.noEarlyReward')}
          </Text>
          <Button onPress={presentPraise} testID="present-praise-button">
            {t('checkIn.presentPraise')}
          </Button>
        </View>
      ) : (
        <View style={styles.decisions}>
          <View style={styles.praiseEditor}>
            <Text color="forest" variant="heading">
              {t('checkIn.praiseLabel')}
            </Text>
            <Input
              direction="rtl"
              label={t('language.arabic')}
              language="ar"
              multiline
              onChangeText={(ar) => setPraise((current) => ({ ...current, ar }))}
              value={praise.ar}
            />
            <Input
              direction="ltr"
              label={t('language.english')}
              language="en"
              multiline
              onChangeText={(en) => setPraise((current) => ({ ...current, en }))}
              value={praise.en}
            />
            <Button onPress={plan} testID="plan-confirmation-button">
              {t('common.confirm')}
            </Button>
          </View>
          <View style={styles.adjustments}>
            <Button onPress={retry} testID="kind-retry-button" variant="secondary">
              {t('checkIn.retry')}
            </Button>
            <Button
              onPress={() => planFutureAdjustment('smaller')}
              testID="plan-smaller-future-task"
              variant="ghost"
            >
              {t('checkIn.smallerFuture')}
            </Button>
            <Button
              onPress={() => planFutureAdjustment('safe_equivalent')}
              testID="plan-safe-future-equivalent"
              variant="ghost"
            >
              {t('checkIn.safeEquivalent')}
            </Button>
          </View>
          {prospectiveTaskAdjustment?.requestedBy === 'parent' ? (
            <View accessibilityLiveRegion="polite" style={styles.futureNotice}>
              <Text color="forest" variant="label">
                {t(
                  prospectiveTaskAdjustment.kind === 'smaller'
                    ? 'checkIn.smallerFuture'
                    : 'checkIn.safeEquivalent',
                )}
              </Text>
              <Text color="inkMuted" variant="caption">
                {t('origin.future')}
              </Text>
            </View>
          ) : null}
        </View>
      )}
      {error ? (
        <Text accessibilityLiveRegion="polite" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function FactGroup({ children, label }: React.PropsWithChildren<{ label: string }>) {
  return (
    <View style={styles.factGroup}>
      <Text color="earth" variant="caption">
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.xl },
  factLedger: { borderTopWidth: 1, borderTopColor: colors.line },
  factGroup: {
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.md,
  },
  decisions: { gap: spacing.xl },
  praiseEditor: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.goldGlow,
    padding: spacing.lg,
  },
  adjustments: { gap: spacing.xs },
  praisePending: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gold,
    paddingVertical: spacing.xl,
  },
  praisePresented: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.ghaf,
    backgroundColor: colors.leafLight,
    padding: spacing.lg,
  },
  retryPanel: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.water,
    backgroundColor: colors.waterLight,
    padding: spacing.lg,
  },
  futureNotice: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.water,
    padding: spacing.md,
  },
  alreadyConfirmed: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  confirmedLeaf: {
    width: 52,
    height: 72,
    borderTopLeftRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: colors.ghaf,
    transform: [{ rotate: '20deg' }],
  },
});
