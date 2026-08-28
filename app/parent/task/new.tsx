import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ParentTaskComposer } from '@/components/family-growth/ParentTaskComposer';
import { JourneyHeader } from '@/components/journey';
import { Screen } from '@/components/primitives';
import { spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentTaskNewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const role = usePrototypeStore((state) => state.role);

  useEffect(() => {
    if (role !== 'parent') router.replace('/role');
  }, [role, router]);

  if (role !== 'parent') {
    return (
      <Screen testID="parent-task-new-role-guard">
        <JourneyHeader eyebrow={t('origin.synthetic')} title={t('errors.wrongRole')} />
      </Screen>
    );
  }

  return (
    <Screen
      contentContainerStyle={{ paddingBottom: spacing.huge }}
      keyboardAware
      testID="parent-task-new-screen"
    >
      <JourneyHeader
        eyebrow={t('origin.synthetic')}
        onBack={() => router.replace('/parent')}
        subtitle={t('taskNew.body')}
        title={t('taskNew.title')}
      />
      <ParentTaskComposer onReadyForReview={() => router.push('/parent/task/review')} />
    </Screen>
  );
}
