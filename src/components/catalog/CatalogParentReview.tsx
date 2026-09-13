import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Text } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { CatalogDetails, CatalogToggle } from './CatalogDetails';
import type { SyntheticChildId, TaskTemplate } from '@/models/familyGrowth';
import { allocateTaskOccurrence } from '@/features/tasks/assignmentInstances';
import { localize } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export function CatalogParentReview({
  content,
  childId,
  childName,
  onBack,
  onDone,
}: {
  content: TaskTemplate;
  childId: SyntheticChildId;
  childName: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const collection = usePrototypeStore((state) => state.taskAssignments);
  const routines = usePrototypeStore((state) => state.routineProgressByTask);
  const allocation = allocateTaskOccurrence(collection, {
    householdId: 'household_al_noor',
    childId,
    templateId: content.id,
  });
  const routineKey = allocation.ok ? allocation.data.identity.routineKey : '';
  const phase = routines[routineKey]?.futurePhase ?? content.routinePhase;
  const displayedContent =
    phase === 'maintenance'
      ? { ...content, routinePhase: phase, displayedSeedAward: null }
      : content;
  const [reviewedPhase, setReviewedPhase] = useState<string | null>(null);
  const reviewed = reviewedPhase === phase;
  const [error, setError] = useState(false);
  const submitting = useRef(false);
  const [assigned, setAssigned] = useState(false);
  const approve = () => {
    if (!reviewed || assigned || submitting.current) return;
    submitting.current = true;
    const state = usePrototypeStore.getState();
    if ((state.routineProgressByTask[routineKey]?.futurePhase ?? content.routinePhase) !== phase) {
      submitting.current = false;
      setError(true);
      return;
    }
    const created = state.createTaskDraft({
      childId,
      templateId: content.id,
      parentText: content.positiveAction,
    });
    if (!created.ok || !state.reviewTask().ok || !state.approveAssignment().ok) {
      submitting.current = false;
      setError(true);
      return;
    }
    setAssigned(true);
    onDone();
  };
  return (
    <R002aScreen
      testID="catalog-parent-review"
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
      <CatalogDetails content={displayedContent} safety />
      <Text brand direction={direction} variant="heading">
        {t('catalog.steps')}
      </Text>
      {content.catalogExecution?.steps.map((step) => (
        <Text key={step.id} brand direction={direction}>
          {t(`catalog.${step.kind}`)}: {localize(step.text, locale)}
        </Text>
      ))}
      <CatalogToggle
        label={t('catalog.reviewed')}
        checked={reviewed}
        onChange={() => setReviewedPhase(reviewed ? null : phase)}
        testID="catalog-parent-reviewed"
      />
      {error ? (
        <Text brand direction={direction} color="error" accessibilityLiveRegion="assertive">
          {t('errors.safeRetry')}
        </Text>
      ) : null}
      <Button
        brand
        direction={direction}
        disabled={!reviewed || assigned}
        onPress={approve}
        testID="catalog-approve"
      >
        {t('catalog.approve')}
      </Button>
      <Button brand direction={direction} variant="secondary" onPress={onBack}>
        {t('catalog.cancel')}
      </Button>
    </R002aScreen>
  );
}
