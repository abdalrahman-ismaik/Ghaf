import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ExpandableSection } from '@/components/botanical';
import { Button, Text } from '@/components/primitives';
import { selectAssignedTasks } from '@/features/tasks/assignmentInstances';
import { localize } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { CatalogDetails, catalogStyles } from './CatalogDetails';

export function CatalogTaskList({
  role,
  filter,
}: {
  role: 'parent' | 'child';
  filter?: 'assigned' | 'pending' | 'completed';
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const childId = usePrototypeStore((state) => state.activeChildId);
  const collection = usePrototypeStore((state) => state.taskAssignments);
  const support = usePrototypeStore((state) => state.catalogSupportRequests);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const entries = selectAssignedTasks(collection, childId).filter((entry) => {
    if (!filter) return true;
    const lifecycle = entry.journey.lifecycle;
    if (filter === 'completed') return lifecycle === 'recognized';
    if (filter === 'pending') return ['submitted', 'confirmed', 'retry'].includes(lifecycle);
    return ['assigned', 'chosen', 'in_progress'].includes(lifecycle);
  });
  const create = () => {
    if (!usePrototypeStore.getState().beginNewTask().ok) {
      setError(true);
      return;
    }
    router.push('/parent/task/new');
  };
  const open = (id: string) => {
    const state = usePrototypeStore.getState();
    if (!state.selectTaskOccurrence(id).ok) {
      setError(true);
      return;
    }
    const selected = usePrototypeStore.getState().journey;
    if (role === 'parent') {
      if (selected?.submission) router.push('/parent/check-in');
      else setExpanded(expanded === id ? null : id);
    } else if (selected?.task.content.catalogExecution) {
      router.push('/child/task');
    } else {
      if (selected?.lifecycle === 'recognized') {
        router.push('/garden');
        return;
      }
      if (selected?.lifecycle === 'confirmed' || selected?.lifecycle === 'retry') {
        router.replace('/child');
        return;
      }
      if (selected?.lifecycle === 'assigned') {
        const choice = usePrototypeStore.getState().choicePool.p0AssignmentChoice;
        if (!choice || !state.chooseAssignment(choice.id).ok) {
          setError(true);
          return;
        }
      }
      router.push('/child/task');
    }
  };
  return (
    <View style={catalogStyles.stack} testID={`catalog-${role}-list`}>
      <Text brand direction={direction} variant="heading">
        {t('catalog.history')}
      </Text>
      {entries.length === 0 ? (
        <Text brand direction={direction}>
          {t(filter ? 'catalog.emptySection' : 'catalog.empty')}
        </Text>
      ) : null}
      {[...entries].reverse().map((entry) => (
        <View
          key={entry.id}
          style={catalogStyles.card}
          testID={`catalog-item-${entry.journey.task.templateId}`}
        >
          <Text brand direction={direction} variant="heading">
            {localize(entry.journey.task.content.title, locale)}
          </Text>
          <Text brand direction={direction}>
            {t(`catalog.${entry.journey.lifecycle}`)}
          </Text>
          {role === 'parent' && support[entry.id] ? (
            <Text brand direction={direction}>
              {t('catalog.supportNeeded')}
            </Text>
          ) : null}
          <Button
            brand
            direction={direction}
            onPress={() => open(entry.id)}
            testID={`open-${entry.id}`}
          >
            {role === 'parent' ? t('catalog.review') : t('common.continue')}
          </Button>
          {role === 'parent' ? (
            <ExpandableSection
              expanded={expanded === entry.id}
              testID={`catalog-details-${entry.id}`}
            >
              <CatalogDetails content={entry.journey.task.content} safety />
            </ExpandableSection>
          ) : null}
        </View>
      ))}
      {role === 'parent' ? (
        <Button brand direction={direction} onPress={create} testID="catalog-create">
          {t('catalog.create')}
        </Button>
      ) : null}
      {error ? (
        <Text brand direction={direction} color="error" accessibilityLiveRegion="assertive">
          {t('errors.safeRetry')}
        </Text>
      ) : null}
      <Text brand direction={direction} color="onSurfaceVariant" variant="caption">
        {t('catalog.restart')}
      </Text>
    </View>
  );
}
