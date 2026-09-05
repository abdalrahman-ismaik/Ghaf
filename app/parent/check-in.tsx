import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ParentCheckIn } from '@/components/family-growth/ParentCheckIn';
import { Text } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentCheckInScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);
  const role = usePrototypeStore((state) => state.role);
  const journey = usePrototypeStore((state) => state.journey);
  const confirmationPlan = usePrototypeStore((state) => state.confirmationPlan);
  const restoreCheckInState = usePrototypeStore((state) => state.restoreCheckInState);
  const intentionalExitRef = useRef(false);

  const submissionId = journey?.submission?.id;
  const admission =
    role === 'parent' && submissionId
      ? serviceRegistry.recognition.resolveCheckInState(usePrototypeStore.getState(), submissionId)
      : null;

  useEffect(() => {
    if (role !== 'parent') {
      router.replace('/role');
      return;
    }
    if (!admission?.ok && !intentionalExitRef.current) router.replace('/parent');
  }, [admission?.ok, role, router]);

  const resumablePlan =
    admission?.ok && admission.data.state === 'confirmation_pending'
      ? admission.data.attempt.plan
      : null;
  const needsRestore = Boolean(
    resumablePlan &&
    (confirmationPlan?.recognitionKey !== resumablePlan.recognitionKey ||
      confirmationPlan.renderState !== resumablePlan.renderState),
  );

  useEffect(() => {
    if (submissionId && needsRestore) restoreCheckInState(submissionId);
  }, [needsRestore, restoreCheckInState, submissionId]);

  if (role !== 'parent') return null;
  if (!admission?.ok) return null;

  if (needsRestore) {
    return (
      <R002aScreen
        header={
          <R002aFlowHeader
            backLabel={t('common.back')}
            direction={direction}
            onBack={() => router.replace('/parent')}
            title={t('r002aReview.reviewTitle')}
          />
        }
        safeAreaEdges={['top', 'left', 'right', 'bottom']}
        testID="parent-check-in-restore-state"
      >
        <Text accessibilityLiveRegion="polite" brand color="onSurfaceVariant" direction={direction}>
          {t('assistant.loading')}
        </Text>
      </R002aScreen>
    );
  }

  return (
    <ParentCheckIn
      onBack={() => router.replace('/parent')}
      onOpenGarden={() => router.replace('/garden')}
      onResumeChild={() => {
        intentionalExitRef.current = true;
        router.replace('/role');
      }}
      onReturnToTasks={() => router.replace('/parent')}
    />
  );
}
