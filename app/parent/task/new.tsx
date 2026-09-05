import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ParentTaskComposer } from '@/components/family-growth/ParentTaskComposer';
import { JourneyHeader } from '@/components/journey';
import { Screen } from '@/components/primitives';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { resolveParentProgressTaskPrefill } from '@/features/growth/parentProgress';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentTaskNewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const role = usePrototypeStore((state) => state.role);
  const journey = usePrototypeStore((state) => state.journey);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const params = useLocalSearchParams();
  const initialPrefill = resolveParentProgressTaskPrefill({
    enabled: r002bFeatureFlags.r002b_parent_progress_ui,
    activeChildId,
    params,
  });

  useEffect(() => {
    if (role !== 'parent') {
      router.replace('/');
      return;
    }
    if (journey && journey.lifecycle !== 'draft' && journey.lifecycle !== 'reviewed') {
      router.replace({ pathname: '/parent', params: { section: 'tasks' } });
    }
  }, [journey, role, router]);

  if (role !== 'parent') {
    return (
      <Screen testID="parent-task-new-role-guard">
        <JourneyHeader eyebrow={t('origin.synthetic')} title={t('errors.wrongRole')} />
      </Screen>
    );
  }

  if (journey && journey.lifecycle !== 'draft' && journey.lifecycle !== 'reviewed') return null;

  return (
    <ParentTaskComposer
      initialPrefill={initialPrefill ?? undefined}
      onBack={() => router.replace({ pathname: '/parent', params: { section: 'tasks' } })}
      onReadyForReview={() => router.push('/parent/task/review')}
    />
  );
}
