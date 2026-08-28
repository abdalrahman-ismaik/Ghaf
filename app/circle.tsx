import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CircleProgress } from '@/components/family-growth/CircleProgress';
import { JourneyHeader } from '@/components/journey';
import { Button, Screen, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import { resolveCircleFixture } from '@/features/circle/projection';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function CircleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const role = usePrototypeStore((state) => state.role);
  const circle = usePrototypeStore((state) => state.circleGoal);
  const circleState = resolveCircleFixture(circle);

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
