import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafTree } from '@/components/GhafTree';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button, Card, Screen, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function EntryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const ghaf = usePrototypeStore((state) => state.ghaf);
  const mockMode = usePrototypeStore((state) => state.mockMode);

  return (
    <Screen contentContainerStyle={styles.screenContent} testID="entry-screen">
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <View style={styles.brandLeaf} />
        </View>
        <View style={styles.brandCopy}>
          <Text color="forest" variant="heading">
            Ghaf
          </Text>
          <Text color="ghaf" variant="heading">
            غاف
          </Text>
        </View>
        {mockMode ? (
          <View style={styles.prototypeBadge}>
            <Text color="earth" variant="caption">
              {t('common.prototype')}
            </Text>
          </View>
        ) : null}
      </View>

      <Card elevated style={styles.heroCard}>
        <GhafTree progressPercent={ghaf.progressPercent} size={226} stage={ghaf.stage} />
        <View style={styles.heroCopy}>
          <Text align="center" color="gold" variant="label">
            {t('entry.eyebrow')}
          </Text>
          <Text align="center" color="forest" variant="title">
            {t('entry.tagline')}
          </Text>
          <Text align="center" color="inkMuted">
            {t('entry.intro')}
          </Text>
        </View>
      </Card>

      <View style={styles.languageBlock}>
        <Text align="center" color="forest" variant="label">
          {t('entry.languageTitle')}
        </Text>
        <LanguageSwitcher />
      </View>

      <Button onPress={() => router.push('/role')}>{t('common.enter')}</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  brandMark: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.leafLight,
  },
  brandLeaf: {
    width: 20,
    height: 29,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    backgroundColor: colors.ghaf,
    transform: [{ rotate: '24deg' }],
  },
  brandCopy: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  prototypeBadge: {
    position: 'absolute',
    top: -20,
    right: 0,
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.goldLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  heroCard: {
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderColor: colors.sand,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroCopy: {
    width: '100%',
    gap: spacing.sm,
  },
  languageBlock: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
