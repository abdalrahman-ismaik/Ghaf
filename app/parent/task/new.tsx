import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const params = useLocalSearchParams();
  const initialPrefill = resolveParentProgressTaskPrefill({
    enabled: r002bFeatureFlags.r002b_parent_progress_ui,
    activeChildId,
    params,
  });
  const hasPresentedComposer = useRef(false);
  const [composerVisit, setComposerVisit] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (role !== 'parent') {
        router.replace('/');
        return;
      }
    }, [role, router]),
  );

  useFocusEffect(
    useCallback(() => {
      // Slot previously remounted this draft on return; covered stacks must not revive stale text.
      if (hasPresentedComposer.current) setComposerVisit((visit) => visit + 1);
      hasPresentedComposer.current = true;
    }, []),
  );

  if (role !== 'parent') {
    return (
      <Screen testID="parent-task-new-role-guard">
        <JourneyHeader eyebrow={t('origin.synthetic')} title={t('errors.wrongRole')} />
      </Screen>
    );
  }

  return (
    <ParentTaskComposer
      key={composerVisit}
      initialPrefill={initialPrefill ?? undefined}
      onBack={() => router.replace({ pathname: '/parent', params: { section: 'tasks' } })}
      onReadyForReview={() => router.push('/parent/task/review')}
    />
  );
}
