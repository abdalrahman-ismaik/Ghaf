import { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  GardenLandscape,
  type LandscapeTrackContent,
} from '@/components/family-growth/GardenLandscape';
import { Text } from '@/components/primitives';
import { selectCloudFamilyProgress, type CloudFamilyController } from '@/features/cloud-family';
import type { CloudFamilySnapshot } from '@/models/cloudFamily';
import type { LandscapeId } from '@/models/familyGrowth';

import { CloudAction, CloudActions, CloudSection, cloudStyles, useCloudCopy } from './common';

const landscapeIds: readonly LandscapeId[] = ['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove'];

export function CloudGardenView({
  snapshot,
  controller,
  disabled,
  recognitionId,
}: {
  readonly snapshot: CloudFamilySnapshot;
  readonly controller: CloudFamilyController;
  readonly disabled: boolean;
  readonly recognitionId: string | null;
}) {
  const { text, locale } = useCloudCopy();
  const progress = useMemo(() => selectCloudFamilyProgress(snapshot), [snapshot]);
  const parent = snapshot.actor.role === 'parent';
  const children = snapshot.children.filter(
    (child) => child.active && (parent || child.id === snapshot.actor.childId),
  );
  const receipt = snapshot.recognitions.find((item) => item.id === recognitionId);
  const [selectedChildId, setSelectedChildId] = useState(
    receipt?.childId ?? snapshot.actor.childId ?? children[0]?.id ?? '',
  );
  const [activeLandscapeId, setActiveLandscapeId] = useState<LandscapeId>(
    receipt?.landscapeId ?? 'ghaf',
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const selectedChild = children.find((child) => child.id === selectedChildId) ?? children[0];
  const childProgress = selectedChild ? progress.children[selectedChild.id] : null;
  const tracks = childProgress
    ? (Object.fromEntries(
        landscapeIds.map((id) => {
          const landscape = childProgress.landscapes[id];
          const content: LandscapeTrackContent = {
            accessibilityLabel: `${text(`tracks.${id}`)}: ${text(`stages.${landscape.stage}`)}`,
            categoryLabel: selectedChild?.displayName ?? '',
            cumulativeSeeds: landscape.cumulativeSeeds,
            name: text(`tracks.${id}`),
            progressLabel: landscape.nextThreshold
              ? text('progress', {
                  count: landscape.cumulativeSeeds,
                  target: landscape.nextThreshold,
                })
              : text('matureProgress', { count: landscape.cumulativeSeeds }),
            stage: landscape.stage,
            stageLabel: text(`stages.${landscape.stage}`),
            targetSeeds: landscape.nextThreshold ?? Math.max(1, landscape.cumulativeSeeds),
          };
          return [id, content];
        }),
      ) as Record<LandscapeId, LandscapeTrackContent>)
    : null;
  const memories = snapshot.memories.filter(
    (memory) => parent || memory.childId === snapshot.actor.childId,
  );
  const candidates = parent
    ? snapshot.tasks.filter(
        (task) =>
          !snapshot.deletedMemoryTaskIds.includes(task.id) &&
          snapshot.recognitions.some(
            (receipt) => receipt.taskId === task.id && receipt.canopyContribution === 1,
          ) &&
          !memories.some((memory) => memory.taskId === task.id),
      )
    : [];
  return (
    <>
      <CloudSection title={text('sharedCanopy')} testID="cloud-family-canopy">
        <Text brand variant="screenTitle" tabular>
          {text('canopyCount', { count: progress.canopyContributions })}
        </Text>
        {progress.canopyContributions === 0 &&
        Object.values(progress.children).every((child) => child.seeds === 0) ? (
          <Text brand>{text('zeroGarden')}</Text>
        ) : null}
        <Text brand color="onSurfaceVariant">
          {text('symbolic')}
        </Text>
      </CloudSection>
      {children.length ? (
        <CloudSection title={text('garden')}>
          {parent ? (
            <CloudActions>
              {children.map((child) => (
                <CloudAction
                  key={child.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: child.id === selectedChild?.id }}
                  variant={child.id === selectedChild?.id ? 'primary' : 'secondary'}
                  onPress={() => setSelectedChildId(child.id)}
                >
                  {child.displayName}
                </CloudAction>
              ))}
            </CloudActions>
          ) : null}
          <Text brand variant="label" tabular>
            {text('seedsTotal', { count: childProgress?.seeds ?? 0 })}
          </Text>
          <CloudActions>
            {landscapeIds.map((id) => (
              <CloudAction
                key={id}
                accessibilityRole="radio"
                accessibilityState={{ checked: activeLandscapeId === id }}
                variant={activeLandscapeId === id ? 'primary' : 'secondary'}
                onPress={() => setActiveLandscapeId(id)}
              >
                {text(`tracks.${id}`)}
              </CloudAction>
            ))}
          </CloudActions>
          {tracks ? (
            <GardenLandscape
              tracks={tracks}
              accessibilityLabel={text('garden')}
              activeLandscapeId={activeLandscapeId}
              labels={{
                activeTrack: text('activeTrack'),
                inspiredBy: text('landscapeInspired'),
                symbolicDisclosure: text('symbolic'),
              }}
              recognitionReveal={
                receipt && receipt.childId === selectedChild?.id
                  ? { play: true, sequenceKey: receipt.id }
                  : undefined
              }
              testID="cloud-personal-landscape"
            />
          ) : null}
        </CloudSection>
      ) : (
        <Text brand>{text('noChildren')}</Text>
      )}
      <CloudSection title={text('memories')} testID="cloud-memories">
        {!memories.length ? <Text brand>{text('noMemories')}</Text> : null}
        {memories.map((memory) => {
          const task = snapshot.tasks.find((item) => item.id === memory.taskId);
          return (
            <View style={cloudStyles.card} key={memory.id} testID={`cloud-memory-${memory.id}`}>
              <Text brand variant="label">
                {memory.title[locale]}
              </Text>
              <Text brand variant="caption">
                {new Date(memory.createdAt).toLocaleString(locale)}
              </Text>
              {parent && task ? (
                deleteId === memory.id ? (
                  <>
                    <Text brand>{text('deleteMemoryConfirm')}</Text>
                    <CloudActions>
                      <CloudAction
                        disabled={disabled}
                        onPress={() =>
                          void controller.command({
                            type: 'delete_memory',
                            taskId: task.id,
                            expectedRevision: task.revision,
                          })
                        }
                        testID="cloud-memory-delete-confirm"
                      >
                        {text('deleteMemory')}
                      </CloudAction>
                      <CloudAction
                        disabled={disabled}
                        variant="quiet"
                        onPress={() => setDeleteId(null)}
                      >
                        {text('cancel')}
                      </CloudAction>
                    </CloudActions>
                  </>
                ) : (
                  <CloudAction
                    disabled={disabled}
                    variant="quiet"
                    onPress={() => setDeleteId(memory.id)}
                  >
                    {text('deleteMemory')}
                  </CloudAction>
                )
              ) : null}
            </View>
          );
        })}
        {candidates.map((task) => (
          <View style={cloudStyles.card} key={task.id}>
            <Text brand>{task.template.title[locale]}</Text>
            <CloudAction
              disabled={disabled}
              onPress={() =>
                void controller.command({
                  type: 'save_memory',
                  taskId: task.id,
                  expectedRevision: task.revision,
                })
              }
              testID={`cloud-memory-save-${task.id}`}
            >
              {text('saveMemory')}
            </CloudAction>
          </View>
        ))}
      </CloudSection>
    </>
  );
}
