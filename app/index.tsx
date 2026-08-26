import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafTree } from '@/components/GhafTree';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { DisclosureCard } from '@/components/journey';
import { Button, Screen, Text } from '@/components/primitives';
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

      <View style={styles.heroCard}>
        <GhafTree progressPercent={ghaf.progressPercent} size={226} stage={ghaf.stage} />
        <View style={styles.heroCopy}>
          <Text color="forest" variant="title">
            {t('entry.tagline')}
          </Text>
          <Text color="inkMuted">{t('entry.intro')}</Text>
          <View style={styles.heroRecord}>
            <View style={styles.heroRecordLine} />
            <Text color="earth" variant="caption">
              {t('entry.eyebrow')}
            </Text>
          </View>
        </View>
      </View>

      <Button
        onPress={() => router.push('/role')}
        style={styles.enterButton}
        testID="enter-prototype-button"
      >
        {t('common.enter')}
      </Button>

      <View style={styles.languageBlock}>
        <Text color="forest" variant="label">
          {t('entry.languageTitle')}
        </Text>
        <LanguageSwitcher />
      </View>

      <DisclosureCard body={t('entry.prototypeDisclosure')} kind="prepared" />
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
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  brandMark: {
    width: 32,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.leaf,
    backgroundColor: colors.leafMist,
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
    flex: 1,
    gap: spacing.xs,
  },
  prototypeBadge: {
    borderRadius: radii.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.goldGlow,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  heroCard: {
    alignItems: 'center',
    gap: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    marginBottom: spacing.xl,
  },
  heroCopy: {
    width: '100%',
    gap: spacing.sm,
  },
  heroRecord: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  heroRecordLine: {
    width: 32,
    height: 1,
    backgroundColor: colors.gold,
  },
  languageBlock: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginBottom: spacing.lg,
  },
  enterButton: {
    marginBottom: spacing.xl,
  },
});
