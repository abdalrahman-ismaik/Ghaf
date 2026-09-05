import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { CircleProgress } from '@/components/family-growth/CircleProgress';
import { JourneyHeader } from '@/components/journey';
import { Button, Screen, Text } from '@/components/primitives';
import { SharedGrowthEntryCard } from '@/components/r002b/SharedGrowthScreens';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { colors, radii, spacing } from '@/design/tokens';
import { resolveCircleFixture } from '@/features/circle/projection';
import { createR002bOrigin, serializeR002bOrigin } from '@/features/navigation/r002bOrigin';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function CircleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const role = usePrototypeStore((state) => state.role);
  const language = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const circle = usePrototypeStore((state) => state.circleGoal);
  const reducedMotion = Boolean(useReducedMotion());
  const circleState = resolveCircleFixture(circle);

  const openSharedGrowth = () => {
    const origin = createR002bOrigin({
      id: 'child_league_shared_growth_card',
      profileId: activeChildId,
      scrollOffset: 0,
    });
    if (!origin.ok) return;
    router.push({
      pathname: '/circle/shared-growth',
      params: { profileId: activeChildId, ...serializeR002bOrigin(origin.data) },
    } as unknown as Href);
  };

  const gardens = [
    {
      id: 'household-al-noor',
      label: t('circle.householdGarden'),
      accessibilityLabel: t('circle.householdGarden'),
    },
    {
      id: 'cousin-circle-a',
      label: t('circle.cousinGardenOne'),
      accessibilityLabel: t('circle.cousinGardenOne'),
    },
    {
      id: 'cousin-circle-b',
      label: t('circle.cousinGardenTwo'),
      accessibilityLabel: t('circle.cousinGardenTwo'),
    },
  ];

  return (
    <Screen contentContainerStyle={styles.screenContent} testID="circle-screen">
      <JourneyHeader
        eyebrow={t('origin.synthetic')}
        onBack={() => router.replace('/garden')}
        subtitle={t('circle.body')}
        title={t('circle.title')}
      />
      {circleState.status === 'available' ? (
        <CircleProgress
          accessibilityLabel={t('accessibility.progress', {
            current: circleState.current,
            goal: circleState.goal,
          })}
          announceMilestone={false}
          body={t('circle.body')}
          current={circleState.current}
          gardens={gardens}
          goal={circleState.goal}
          householdContributionLabel={t(
            circleState.current >= circleState.goal ? 'circle.contribution' : 'circle.baseline',
          )}
          milestoneLabel={t('circle.milestone')}
          privacyDisclosure={t('circle.privacy')}
          progressLabel={t('circle.progress', {
            current: circleState.current,
            goal: circleState.goal,
          })}
          showHeading={false}
          syntheticDisclosure={t('circle.syntheticDisclosure')}
          testID="cooperative-circle-progress"
          title={t('circle.title')}
        />
      ) : (
        <View
          accessibilityLiveRegion="polite"
          style={styles.unavailable}
          testID="circle-unavailable"
        >
          <Text color="forest" variant="heading">
            {t('circle.unavailableTitle')}
          </Text>
          <Text color="inkMuted">{t('circle.unavailableBody')}</Text>
          <View style={styles.unavailableGoal}>
            <Text color="forest" variant="label">
              {t('circle.unavailableGoal', { goal: circleState.goal })}
            </Text>
            <Text color="inkMuted" variant="caption">
              {t('circle.unavailablePrivacy')}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.nextRecord}>
        <Text color="forest" variant="label">
          {t('circle.next')}
        </Text>
        <Text color="inkMuted" variant="caption">
          {t('origin.synthetic')}
        </Text>
      </View>
      {role === 'child' && r002bFeatureFlags.r002b_shared_growth_view ? (
        <SharedGrowthEntryCard
          actionLabel={t('r002bGrowth.chapter.sharedGrowthAction')}
          body={t('r002bGrowth.chapter.sharedGrowthEntryDescription')}
          direction={direction}
          language={language}
          onPress={openSharedGrowth}
          reducedMotion={reducedMotion}
          statusLabel={t('r002bGrowth.chapter.sharedGrowthStatus')}
          testID="r002b-child-league-shared-growth-card"
          title={t('r002bGrowth.chapter.sharedGrowthEntryTitle')}
          tone="child"
        />
      ) : null}
      <Button
        onPress={() => router.replace(role === 'parent' ? '/parent' : '/role')}
        testID="finish-demo-button"
      >
        {t('circle.finish')}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.huge },
  nextRecord: {
    gap: spacing.xs,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.goldLight,
    backgroundColor: colors.goldGlow,
    padding: spacing.md,
  },
  unavailable: {
    gap: spacing.md,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.waterLight,
    padding: spacing.lg,
  },
  unavailableGoal: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.water,
    paddingTop: spacing.md,
  },
});
