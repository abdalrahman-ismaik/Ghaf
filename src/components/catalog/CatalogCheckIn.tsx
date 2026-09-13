import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Text } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { routineProgressKey } from '@/features/tasks/assignmentInstances';
import { bilingualResource, localize } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { CatalogDetails, catalogStyles } from './CatalogDetails';

export function CatalogCheckIn({
  onBack,
  onOpenGarden,
  onReturnToTasks,
  onResumeChild,
}: {
  onBack: () => void;
  onOpenGarden: () => void;
  onReturnToTasks: () => void;
  onResumeChild: () => boolean;
}) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const journey = usePrototypeStore((state) => state.journey);
  const plan = usePrototypeStore((state) => state.confirmationPlan);
  const routines = usePrototypeStore((state) => state.routineProgressByTask);
  const localFamily = usePrototypeStore((state) => state.localFamily);
  const [error, setError] = useState(false);
  if (!journey?.submission || !journey.task.content.catalogExecution) return null;
  const childName =
    localFamily.record?.children.find((child) => child.id === journey.task.targetChildId)
      ?.nickname ??
    localize(usePrototypeStore.getState().children[journey.task.targetChildId].displayName, locale);
  const content = journey.task.content;
  const metadata = content.catalogExecution!;
  const submission = journey.submission;
  const praise =
    submission.completionMode === 'permitted_help'
      ? metadata.permittedHelpPraise
      : metadata.confirmationPraise;
  const run = (command: () => { ok: boolean }) => {
    setError(!command().ok);
  };
  const confirm = () =>
    run(() =>
      usePrototypeStore.getState().confirmAndPresentPraise(
        {
          submissionId: submission.id,
          praise,
          neutralObservation: null,
          uncertainty: bilingualResource('checkIn.boundedUncertainty'),
        },
        {
          actionId: `praise:${submission.id}`,
          source: 'parent_press',
          presentedAt: new Date().toISOString(),
        },
      ),
    );
  const recognize = () => {
    if (!plan || plan.renderState !== 'praise_presented') return;
    run(() =>
      usePrototypeStore.getState().applyRecognition({
        actionId: `recognition:${submission.id}`,
        source: 'parent_press',
        observedRenderState: 'praise_presented',
        presentationActionId: plan.presentationActionId,
      }),
    );
  };
  const retry = () =>
    run(() =>
      usePrototypeStore.getState().requestKindRetry(bilingualResource('catalog.retryNote')),
    );
  const routineKey = routineProgressKey(journey.task);
  const routine = routines[routineKey];
  return (
    <R002aScreen
      testID="catalog-check-in"
      header={
        <R002aFlowHeader
          direction={direction}
          backLabel={t('common.back')}
          title={t('catalog.review')}
          onBack={onBack}
        />
      }
    >
      <Text brand direction={direction} variant="heading">
        {childName}
      </Text>
      <CatalogDetails content={content} />
      <Text brand direction={direction} variant="heading" accessibilityLiveRegion="polite">
        {t(`catalog.${journey.lifecycle}`)}
      </Text>
      <Text brand direction={direction}>
        {t('catalog.attempt', { count: submission.attempt })}
      </Text>
      <Text brand direction={direction}>
        {t(
          submission.completionMode === 'permitted_help'
            ? 'catalog.withHelp'
            : 'catalog.independent',
        )}
      </Text>
      {submission.helpUsed ? (
        <Text brand direction={direction}>
          {localize(submission.helpUsed, locale)}
        </Text>
      ) : null}
      {journey.lifecycle === 'submitted' ? (
        <>
          <Text brand direction={direction}>
            {t('catalog.ack')}
          </Text>
          <Text brand direction={direction}>
            {localize(praise, locale)}
          </Text>
          <Button brand direction={direction} onPress={confirm} testID="catalog-confirm">
            {t('catalog.confirm')}
          </Button>
          <Button
            brand
            direction={direction}
            variant="secondary"
            onPress={retry}
            testID="catalog-retry"
          >
            {t('catalog.retry')}
          </Button>
        </>
      ) : null}
      {journey.lifecycle === 'retry' ? (
        <>
          <Text brand direction={direction}>
            {t('catalog.retryNote')}
          </Text>
          <Button
            brand
            direction={direction}
            onPress={() => {
              const result = usePrototypeStore.getState().resumeRetry();
              if (!result.ok || !onResumeChild()) setError(true);
            }}
            testID="catalog-resume"
          >
            {t('r002aReview.resumeChild', { child: childName })}
          </Button>
        </>
      ) : null}
      {journey.lifecycle === 'confirmed' ? (
        <View style={catalogStyles.card}>
          <Text brand direction={direction} variant="heading" accessibilityLiveRegion="polite">
            {localize(praise, locale)}
          </Text>
          <Button
            brand
            direction={direction}
            onPress={recognize}
            disabled={plan?.renderState !== 'praise_presented'}
            testID="catalog-recognize"
          >
            {t('catalog.continue')}
          </Button>
        </View>
      ) : null}
      {journey.lifecycle === 'recognized' ? (
        <>
          <Text brand direction={direction} accessibilityLiveRegion="polite">
            {t('catalog.complete')}
          </Text>
          {routine?.phaseReview ? (
            <View style={catalogStyles.card}>
              <Text brand direction={direction}>
                {t('checkIn.phaseReviewBody')}
              </Text>
              <Button
                brand
                direction={direction}
                onPress={() =>
                  run(() =>
                    usePrototypeStore
                      .getState()
                      .applyRoutinePhaseDecision(routineKey, 'move_future_to_maintenance'),
                  )
                }
              >
                {t('checkIn.phaseReviewMaintenance')}
              </Button>
              <Button
                brand
                direction={direction}
                variant="secondary"
                onPress={() =>
                  run(() =>
                    usePrototypeStore
                      .getState()
                      .applyRoutinePhaseDecision(routineKey, 'keep_acquisition'),
                  )
                }
              >
                {t('checkIn.phaseReviewKeep')}
              </Button>
            </View>
          ) : null}
          <Button brand direction={direction} onPress={onReturnToTasks}>
            {t('catalog.history')}
          </Button>
          {content.recognitionMode !== 'recognition_only' ? (
            <Button brand direction={direction} variant="secondary" onPress={onOpenGarden}>
              {t('r002aReview.openGarden')}
            </Button>
          ) : null}
        </>
      ) : null}
      {error ? (
        <Text brand direction={direction} color="error" accessibilityLiveRegion="assertive">
          {t('errors.safeRetry')}
        </Text>
      ) : null}
    </R002aScreen>
  );
}
