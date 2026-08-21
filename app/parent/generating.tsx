import { useEffect } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { DisclosureCard, JourneyHeader } from '@/components/journey';
import { MissionGenerationExperience } from '@/components/MissionGenerationExperience';
import { Button, Card, Screen, Text } from '@/components/primitives';
import { formatQuantity } from '@/components/prototype';
import { ErrorState } from '@/components/states';
import { colors, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function MissionGeneratingScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const locale = usePrototypeStore((state) => state.locale);
  const child = usePrototypeStore((state) => state.family.child);
  const missionInput = usePrototypeStore((state) => state.missionInput);
  const journeyStatus = usePrototypeStore((state) => state.journeyStatus);
  const generation = usePrototypeStore((state) => state.generation);
  const lastError = usePrototypeStore((state) => state.lastError);
  const cancelGeneration = usePrototypeStore((state) => state.cancelGeneration);
  const setGenerationStage = usePrototypeStore((state) => state.setGenerationStage);
  const completeGeneration = usePrototypeStore((state) => state.completeGeneration);
  const generationAttemptId = generation?.attemptId;
  const generationStatus = generation?.status;
  const generationContext = [
    localize(child.displayName, locale),
    t('createMission.foodImageValue'),
    missionInput.quantity ? formatQuantity(missionInput.quantity, locale, t) : null,
    t('common.minutes', { count: missionInput.availableMinutes }),
  ]
    .filter(Boolean)
    .join(' • ');

  const stages = [
    t('generation.stages.listeningTitle'),
    t('generation.stages.understandingTitle'),
    t('generation.stages.creatingTitle'),
    t('generation.stages.preparingTitle'),
  ] as const;
  const bodies = [
    t('generation.stages.listeningBody'),
    t('generation.stages.understandingBody'),
    t('generation.stages.creatingBody'),
    t('generation.stages.preparingBody'),
  ] as const;

  useEffect(() => {
    if (journeyStatus === 'parent-review') {
      router.replace('/parent/review');
      return;
    }
    if (journeyStatus !== 'generating' || !generationAttemptId || generationStatus !== 'running') {
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const interval = reducedMotion ? 90 : 640;

    [1, 2, 3].forEach((stageIndex) => {
      timers.push(setTimeout(() => setGenerationStage(stageIndex), stageIndex * interval));
    });
    timers.push(
      setTimeout(() => {
        void completeGeneration().then((result) => {
          if (!cancelled && result.ok) router.replace('/parent/review');
        });
      }, interval * 4),
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [
    completeGeneration,
    generationAttemptId,
    generationStatus,
    journeyStatus,
    reducedMotion,
    router,
    setGenerationStage,
  ]);

  useEffect(() => {
    if (!generationAttemptId) return;
    return navigation.addListener('beforeRemove', () => {
      cancelGeneration(generationAttemptId);
    });
  }, [cancelGeneration, generationAttemptId, navigation]);

  const retryPreparedGeneration = () => {
    void completeGeneration().then((result) => {
      if (result.ok) router.replace('/parent/review');
    });
  };

  return (
    <Screen contentContainerStyle={styles.content} testID="generation-screen">
      <JourneyHeader
        eyebrow={t('generation.eyebrow')}
        subtitle={t('generation.subtitle')}
        title={t('generation.title')}
      />

      {generation ? (
        <>
          <MissionGenerationExperience
            activeIndex={generation.currentStageIndex}
            disclosure={t('origin.simulated')}
            stages={stages}
            title={t('generation.title')}
          />
          <Card style={styles.contextCard}>
            <Text color="gold" variant="label">
              {generationContext}
            </Text>
            <Text accessibilityLiveRegion="polite" color="forest">
              {bodies[generation.currentStageIndex]}
            </Text>
          </Card>
          <DisclosureCard body={t('generation.disclosure')} kind="simulated" />
        </>
      ) : (
        <ErrorState
          body={lastError?.fallbackAvailable ? t('fallback.body') : t('states.errorBody')}
          onRetry={() => router.replace('/parent/create')}
        />
      )}

      {generation?.status === 'failed' ? (
        <View style={styles.retryBlock}>
          <Button onPress={retryPreparedGeneration} variant="secondary">
            {t('generation.useFallback')}
          </Button>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  contextCard: {
    gap: spacing.xs,
    borderColor: colors.goldLight,
    backgroundColor: colors.goldGlow,
    marginVertical: spacing.lg,
  },
  retryBlock: {
    marginTop: spacing.lg,
  },
});
