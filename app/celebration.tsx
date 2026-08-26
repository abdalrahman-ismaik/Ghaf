import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafTree } from '@/components/GhafTree';
import { DisclosureCard, JourneyHeader, StatPill } from '@/components/journey';
import { Button, Card, Screen, Text } from '@/components/primitives';
import { formatQuantity, ImpactCard, ProgressBar } from '@/components/prototype';
import { EmptyState } from '@/components/states';
import { colors, radii, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function CelebrationScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const ghaf = usePrototypeStore((state) => state.ghaf);
  const impact = usePrototypeStore((state) => state.impactSummary);
  const celebration = usePrototypeStore((state) => state.celebration);
  const clearCelebration = usePrototypeStore((state) => state.clearCelebration);
  const resetDemo = usePrototypeStore((state) => state.resetDemo);

  const continueToFamily = () => {
    clearCelebration();
    router.dismissAll();
    router.replace('/parent');
  };

  const reset = () => {
    resetDemo();
    router.dismissAll();
    router.replace('/parent');
  };

  if (!celebration) {
    return (
      <Screen contentContainerStyle={styles.content} testID="celebration-screen">
        <EmptyState
          action={<Button onPress={() => router.replace('/parent')}>{t('common.back')}</Button>}
          body={t('states.emptyBody')}
          title={t('states.emptyTitle')}
        />
      </Screen>
    );
  }

  const previousStage = celebration.previousStage;
  const currentStage = celebration.currentStage;
  const rescued = t('celebration.rescued', {
    quantity: formatQuantity(celebration.rescuedQuantity, locale, t),
  });
  const progressAward = t('celebration.progressAward', {
    count: celebration.awardedProgressPoints,
  });
  const stageChange = t('celebration.stageChange', {
    from: t(`ghaf.stageNames.${previousStage}`),
    to: t(`ghaf.stageNames.${currentStage}`),
  });

  return (
    <Screen contentContainerStyle={styles.content} testID="celebration-screen">
      <JourneyHeader
        eyebrow={t('celebration.eyebrow')}
        subtitle={t(
          celebration.milestone ? 'celebration.subtitle' : 'celebration.subtitleNoMilestone',
        )}
        title={t('celebration.title')}
      />

      <View style={styles.treeCard} testID="ghaf-growth-celebration">
        <GhafTree
          celebrateMilestone={celebration.milestone !== null}
          progressPercent={ghaf.progressPercent}
          size={278}
          stage={currentStage}
          transitionFromStage={previousStage}
        />
        <ProgressBar value={ghaf.progressPercent} />
        <View style={styles.stageChange}>
          <Text align="center" color="earth" variant="label">
            {stageChange}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <StatPill label={t('impact.foodRescued')} value={rescued} />
        <StatPill label={t('ghaf.progressLabel')} value={progressAward} />
      </View>

      <View style={styles.impactSummary}>
        <ImpactCard impact={impact} />
      </View>

      {celebration.milestone ? (
        <Card style={styles.milestoneCard}>
          <View style={styles.milestoneIcon}>
            <View style={styles.milestoneStem} />
            <View style={[styles.milestoneLeaf, styles.milestoneLeafLeft]} />
            <View style={[styles.milestoneLeaf, styles.milestoneLeafRight]} />
          </View>
          <View style={styles.milestoneCopy}>
            <Text color="earth" variant="label">
              {t('celebration.milestoneTitle')}
            </Text>
            <Text color="forest" variant="heading">
              {localize(celebration.milestone, locale)}
            </Text>
            <Text color="earth" variant="label">
              {t('celebration.rewardTitle')}:{' '}
              {celebration.reward ? localize(celebration.reward, locale) : t('common.optional')}
            </Text>
          </View>
        </Card>
      ) : null}

      <DisclosureCard body={t('celebration.estimateNote')} kind="estimated" />

      <View style={styles.actions}>
        <Button onPress={continueToFamily} testID="celebration-continue-button">
          {t('celebration.continue')}
        </Button>
        <Button onPress={reset} testID="celebration-reset-button" variant="ghost">
          {t('celebration.reset')}
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  treeCard: {
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
  },
  stageChange: {
    borderRadius: radii.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.goldGlow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  impactSummary: {
    marginBottom: spacing.lg,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderColor: colors.gold,
    backgroundColor: colors.goldGlow,
    marginBottom: spacing.lg,
  },
  milestoneIcon: {
    width: 64,
    height: 64,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.goldGlow,
  },
  milestoneStem: {
    width: 3,
    height: 38,
    borderRadius: radii.pill,
    backgroundColor: colors.earth,
    transform: [{ rotate: '8deg' }],
  },
  milestoneLeaf: {
    position: 'absolute',
    width: 18,
    height: 10,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    backgroundColor: colors.ghaf,
  },
  milestoneLeafLeft: {
    top: 21,
    left: 12,
    transform: [{ rotate: '28deg' }],
  },
  milestoneLeafRight: {
    top: 13,
    right: 11,
    transform: [{ rotate: '-30deg' }],
  },
  milestoneCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
