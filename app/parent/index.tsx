import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafTree } from '@/components/GhafTree';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button, Card, Screen, Text } from '@/components/primitives';
import { ImpactCard, MissionCard, ProgressBar, RoleSwitcher } from '@/components/prototype';
import { colors, radii, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import type { PrototypeRole } from '@/models/prototype';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const role = usePrototypeStore((state) => state.role);
  const family = usePrototypeStore((state) => state.family);
  const mission = usePrototypeStore((state) => state.mission);
  const impact = usePrototypeStore((state) => state.impact);
  const ghaf = usePrototypeStore((state) => state.ghaf);
  const mockMode = usePrototypeStore((state) => state.mockMode);
  const setRole = usePrototypeStore((state) => state.setRole);
  const resetDemo = usePrototypeStore((state) => state.resetDemo);
  const familyName = localize(family.displayName, locale);

  const openRole = (nextRole: PrototypeRole) => {
    setRole(nextRole);
    router.replace(nextRole === 'parent' ? '/parent' : '/child');
  };

  const reset = () => {
    resetDemo();
    router.replace('/parent');
  };

  return (
    <Screen testID="parent-home-screen">
      <View style={[styles.topBar, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.brandBlock}>
          <Text color="forest" variant="heading">
            Ghaf · غاف
          </Text>
          {mockMode ? (
            <View
              style={[styles.mockPill, direction === 'rtl' ? styles.alignEnd : styles.alignStart]}
            >
              <Text color="earth" variant="caption">
                {t('common.mockBadge')}
              </Text>
            </View>
          ) : null}
        </View>
        <LanguageSwitcher compact showGuidance={false} />
      </View>

      <View style={styles.intro}>
        <Text color="gold" variant="label">
          {t('parentHome.eyebrow')}
        </Text>
        <Text color="forest" variant="title">
          {t('parentHome.greeting', { name: familyName })}
        </Text>
        <Text color="inkMuted">{t('parentHome.subtitle')}</Text>
      </View>

      <Card elevated style={styles.treeCard} testID="family-ghaf-card">
        <View style={styles.treeCopy}>
          <Text align="center" color="forest" variant="heading">
            {t('parentHome.treeTitle')}
          </Text>
          <Text align="center" color="inkMuted" variant="caption">
            {t('parentHome.treeHint')}
          </Text>
        </View>
        <GhafTree progressPercent={ghaf.progressPercent} size={238} stage={ghaf.stage} />
        <ProgressBar value={ghaf.progressPercent} />
      </Card>

      <View style={styles.section}>
        <ImpactCard impact={impact} />
      </View>

      <View style={styles.section}>
        <Text color="forest" variant="heading">
          {t('parentHome.activeMission')}
        </Text>
        <MissionCard mission={mission} showSteps />
      </View>

      <Card style={styles.controlsCard}>
        <Text color="forest" variant="label">
          {t('common.switchRole')}
        </Text>
        <RoleSwitcher onChange={openRole} role={role} />
        <Button onPress={reset} variant="ghost">
          {t('common.reset')}
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rowLtr: {
    flexDirection: 'row',
  },
  topBar: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  brandBlock: {
    gap: spacing.xxs,
  },
  alignEnd: {
    alignSelf: 'flex-end',
  },
  alignStart: {
    alignSelf: 'flex-start',
  },
  mockPill: {
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.goldLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  intro: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  treeCard: {
    alignItems: 'center',
    overflow: 'hidden',
    borderColor: colors.sand,
    paddingTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  treeCopy: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xs,
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
