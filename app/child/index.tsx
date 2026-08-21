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

export default function ChildHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const role = usePrototypeStore((state) => state.role);
  const child = usePrototypeStore((state) => state.family.child);
  const mission = usePrototypeStore((state) => state.activeMission);
  const journeyStatus = usePrototypeStore((state) => state.journeyStatus);
  const ghaf = usePrototypeStore((state) => state.ghaf);
  const impact = usePrototypeStore((state) => state.impactSummary);
  const setRole = usePrototypeStore((state) => state.setRole);
  const openChildMission = usePrototypeStore((state) => state.openChildMission);
  const childName = localize(child.displayName, locale);

  const openRole = (nextRole: PrototypeRole) => {
    setRole(nextRole);
    router.replace(nextRole === 'parent' ? '/parent' : '/child');
  };

  const openAdventure = () => {
    const result = openChildMission();
    if (result.ok) router.push('/child/mission');
  };

  const action = (() => {
    if (journeyStatus === 'completed') {
      return (
        <Button onPress={() => router.push('/celebration')} testID="open-celebration-button">
          {t('childHome.completed')}
        </Button>
      );
    }
    if (journeyStatus === 'awaiting-parent-confirmation') {
      return (
        <Button onPress={() => openRole('parent')} variant="secondary">
          {t('childHome.awaitingParent')}
        </Button>
      );
    }
    return (
      <Button onPress={openAdventure} testID="open-adventure-button">
        {journeyStatus === 'child-in-progress'
          ? t('childHome.continueAdventure')
          : t('childHome.startAdventure')}
      </Button>
    );
  })();

  return (
    <Screen testID="child-home-screen">
      <JourneyHeader
        action={<LanguageSwitcher compact showGuidance={false} />}
        eyebrow={t('childHome.eyebrow')}
        subtitle={t('childHome.subtitle')}
        title={t('childHome.greeting', { name: childName })}
      />

      <Card elevated style={styles.treeCard} testID="child-ghaf-card">
        <View pointerEvents="none" style={styles.sparkleOne} />
        <View pointerEvents="none" style={styles.sparkleTwo} />
        <GhafTree progressPercent={ghaf.progressPercent} size={246} stage={ghaf.stage} />
        <ProgressBar value={ghaf.progressPercent} />
      </Card>

      <View style={styles.section}>
        <ImpactCard impact={impact} />
      </View>

      <View style={styles.section}>
        <Text color="forest" variant="heading">
          {t('childHome.adventure')}
        </Text>
        {mission?.approvedByParent ? (
          <MissionCard action={action} mission={mission} />
        ) : (
          <EmptyState body={t('states.emptyBody')} title={t('states.emptyTitle')} />
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
  treeCard: {
    alignItems: 'center',
    overflow: 'hidden',
    gap: spacing.sm,
    borderColor: colors.leaf,
    backgroundColor: colors.leafMist,
    paddingTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  sparkleOne: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.goldLight,
    opacity: 0.82,
    top: spacing.lg,
    right: spacing.lg,
  },
  sparkleTwo: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.leafLight,
    opacity: 0.9,
    top: 72,
    left: spacing.xl,
  },
  section: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  controlsCard: {
    backgroundColor: colors.sandLight,
    borderColor: colors.sand,
  },
});
