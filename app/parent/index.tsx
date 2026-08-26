import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafTree } from '@/components/GhafTree';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { JourneyHeader } from '@/components/journey';
import { Button, Card, Screen, Text } from '@/components/primitives';
import { ImpactCard, MissionCard, ProgressBar, RoleSwitcher } from '@/components/prototype';
import { EmptyState } from '@/components/states';
import { colors, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import type { PrototypeRole } from '@/models/prototype';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const role = usePrototypeStore((state) => state.role);
  const family = usePrototypeStore((state) => state.family);
  const journeyStatus = usePrototypeStore((state) => state.journeyStatus);
  const mission = usePrototypeStore((state) => state.activeMission);
  const impact = usePrototypeStore((state) => state.impactSummary);
  const ghaf = usePrototypeStore((state) => state.ghaf);
  const setRole = usePrototypeStore((state) => state.setRole);
  const familyName = localize(family.displayName, locale);

  const openRole = (nextRole: PrototypeRole) => {
    setRole(nextRole);
    router.replace(nextRole === 'parent' ? '/parent' : '/child');
  };

  const missionAction = (() => {
    if (journeyStatus === 'draft-input') {
      return (
        <Button onPress={() => router.push('/parent/create')} testID="resume-editing-button">
          {t('parentHome.resumeEditing')}
        </Button>
      );
    }
    if (journeyStatus === 'parent-review') {
      return (
        <Button onPress={() => router.push('/parent/review')} testID="open-review-button">
          {t('parentHome.openReview')}
        </Button>
      );
    }
    if (journeyStatus === 'awaiting-parent-confirmation') {
      return (
        <Button
          onPress={() => router.push('/parent/confirmation')}
          testID="review-submission-button"
        >
          {t('parentHome.reviewSubmission')}
        </Button>
      );
    }
    if (journeyStatus === 'completed') {
      return (
        <Button onPress={() => router.push('/celebration')} variant="secondary">
          {t('parentHome.completedTitle')}
        </Button>
      );
    }
    return (
      <Button onPress={() => openRole('child')} variant="secondary">
        {t('parentHome.switchToChild')}
      </Button>
    );
  })();
  const primaryAction = mission ? (
    missionAction
  ) : (
    <Button onPress={() => router.push('/parent/create')} testID="create-mission-button">
      {t('parentHome.createMission')}
    </Button>
  );

  return (
    <Screen testID="parent-home-screen">
      <JourneyHeader
        action={<LanguageSwitcher compact showGuidance={false} />}
        eyebrow={t('parentHome.eyebrow')}
        subtitle={t('parentHome.subtitle')}
        title={t('parentHome.greeting', { name: familyName })}
      />

      <View style={styles.primaryAction}>{primaryAction}</View>

      <View style={styles.treeCard} testID="family-ghaf-card">
        <View style={styles.treeCopy}>
          <Text align="center" color="forest" variant="heading">
            {t('parentHome.treeTitle')}
          </Text>
          <Text align="center" color="inkMuted" variant="caption">
            {t('parentHome.treeHint')}
          </Text>
        </View>
        <GhafTree progressPercent={ghaf.progressPercent} size={236} stage={ghaf.stage} />
        <ProgressBar value={ghaf.progressPercent} />
      </View>

      <View style={styles.section}>
        <ImpactCard impact={impact} />
      </View>

      <View style={styles.section}>
        <Text color="forest" variant="heading">
          {t('parentHome.activeMission')}
        </Text>
        {mission ? (
          <MissionCard mission={mission} showSteps />
        ) : (
          <EmptyState body={t('parentHome.readyBody')} title={t('parentHome.readyTitle')} />
        )}
      </View>

      <Card style={styles.controlsCard}>
        <Text color="forest" variant="label">
          {t('common.switchRole')}
        </Text>
        <RoleSwitcher onChange={openRole} role={role} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  primaryAction: {
    marginBottom: spacing.xl,
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
  treeCopy: {
    width: '100%',
    gap: spacing.xs,
  },
  section: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  controlsCard: {
    backgroundColor: colors.transparent,
    borderColor: colors.line,
  },
});
