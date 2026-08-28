import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ParentCheckIn } from '@/components/family-growth/ParentCheckIn';
import { JourneyHeader } from '@/components/journey';
import { Screen, Text } from '@/components/primitives';
import { spacing } from '@/design/tokens';
import { serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentCheckInScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const role = usePrototypeStore((state) => state.role);
  const journey = usePrototypeStore((state) => state.journey);
  const confirmationPlan = usePrototypeStore((state) => state.confirmationPlan);
  const restoreCheckInState = usePrototypeStore((state) => state.restoreCheckInState);

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
    if (!admission?.ok) router.replace('/parent');
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
      <Screen testID="parent-check-in-restore-state">
        <JourneyHeader eyebrow={t('origin.synthetic')} title={t('checkIn.title')} />
        <Text accessibilityLiveRegion="polite" color="inkMuted">
          {t('assistant.loading')}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen
      contentContainerStyle={{ paddingBottom: spacing.huge }}
      keyboardAware
      testID="parent-check-in-screen"
    >
      <JourneyHeader
        eyebrow={t('origin.synthetic')}
        onBack={() => router.replace('/parent')}
        subtitle={t('parentHome.summaryDisclosure')}
        title={t('checkIn.title')}
      />
      <ParentCheckIn
        onRecognized={() => router.replace('/garden')}
        onResumeChild={() => router.replace('/role')}
      />
    </Screen>
  );
}
