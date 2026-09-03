import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessScreen, GhafIcon, PrototypePill, StatusBanner } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import type { LocaleCode } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const setLocale = usePrototypeStore((state) => state.setLocale);
  const [showChildBoundary, setShowChildBoundary] = useState(false);

  const switchLanguage = () => {
    const nextLocale: LocaleCode = locale === 'ar' ? 'en' : 'ar';
    setLocale(nextLocale);
  };

  return (
    <AccessScreen background="welcome" contentStyle={styles.content} testID="welcome-screen">
      <View style={styles.languageRow}>
        <Pressable
          accessibilityLabel={t('language.title')}
          accessibilityRole="button"
          onPress={switchLanguage}
          style={({ pressed }) => [
            styles.languageAction,
            locale === 'ar' ? styles.languageActionRtl : null,
            pressed ? styles.pressed : null,
          ]}
          testID="welcome-language-button"
        >
          <GhafIcon color={colors.ghaf} name="language" size={22} />
          <Text color="ghaf" direction={locale === 'ar' ? 'ltr' : 'rtl'} variant="label">
            {t('access.welcome.switchLanguage')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text align="center" color="ghaf" variant="wordmark">
          {t('common.brand')}
        </Text>
        <Text
          accessibilityRole="header"
          align="center"
          color="forest"
          style={styles.heroTitle}
          variant="hero"
        >
          {t('access.welcome.title')}
        </Text>
        <Text align="center" color="inkMuted" style={styles.heroBody}>
          {t('access.welcome.body')}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          icon={<GhafIcon color={colors.white} name="family" size={22} />}
          onPress={() => router.push('/access/parent/sign-in')}
          testID="parent-access-button"
        >
          {t('access.welcome.parentAction')}
        </Button>
        <Button
          icon={<GhafIcon color={colors.ghaf} name="child" size={22} />}
          onPress={() => setShowChildBoundary(true)}
          testID="child-access-button"
          variant="secondary"
        >
          {t('access.welcome.childAction')}
        </Button>
        {showChildBoundary ? (
          <StatusBanner message={t('access.welcome.childUnavailable')} tone="origin" />
        ) : null}
        <PrototypePill message={t('access.welcome.origin')} />
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    minHeight: 760,
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  languageRow: {
    minHeight: layout.touchTarget,
    alignItems: 'flex-start',
  },
  languageAction: {
    minHeight: layout.touchTarget,
    minWidth: 116,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
  },
  languageActionRtl: {
    flexDirection: 'row-reverse',
  },
  hero: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  heroTitle: {
    maxWidth: 350,
  },
  heroBody: {
    maxWidth: 350,
  },
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.leafMist,
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
});
