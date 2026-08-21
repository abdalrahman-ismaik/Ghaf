import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafTree } from '@/components/GhafTree';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button, Card, Screen, Text } from '@/components/primitives';
import { MissionCard, ProgressBar, RoleSwitcher } from '@/components/prototype';
import { colors, radii, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import type { PrototypeRole } from '@/models/prototype';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ChildHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const role = usePrototypeStore((state) => state.role);
  const child = usePrototypeStore((state) => state.family.child);
  const mission = usePrototypeStore((state) => state.mission);
  const ghaf = usePrototypeStore((state) => state.ghaf);
  const mockMode = usePrototypeStore((state) => state.mockMode);
  const setRole = usePrototypeStore((state) => state.setRole);
  const resetDemo = usePrototypeStore((state) => state.resetDemo);
  const childName = localize(child.displayName, locale);

  const openRole = (nextRole: PrototypeRole) => {
    setRole(nextRole);
    router.replace(nextRole === 'parent' ? '/parent' : '/child');
  };

  const reset = () => {
    resetDemo();
    router.replace('/parent');
  };

  return (
    <Screen testID="child-home-screen">
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
          {t('childHome.eyebrow')}
        </Text>
        <Text color="forest" variant="title">
          {t('childHome.greeting', { name: childName })}
        </Text>
        <Text color="inkMuted">{t('childHome.subtitle')}</Text>
      </View>

      <Card elevated style={styles.treeCard} testID="child-ghaf-card">
        <View pointerEvents="none" style={styles.sparkleOne} />
        <View pointerEvents="none" style={styles.sparkleTwo} />
        <GhafTree progressPercent={ghaf.progressPercent} size={250} stage={ghaf.stage} />
        <ProgressBar value={ghaf.progressPercent} />
      </Card>

      <View style={styles.section}>
        <Text color="forest" variant="heading">
          {t('childHome.adventure')}
        </Text>
        <MissionCard mission={mission} />
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
    borderColor: colors.leaf,
    backgroundColor: '#F7FBF5',
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
