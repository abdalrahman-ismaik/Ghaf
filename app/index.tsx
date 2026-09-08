import { Redirect, useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessScreen, PrototypePill } from '@/components/access';
import { GhafRasterLogo } from '@/components/brand/GhafRasterLogo';
import { LocalIllustration } from '@/components/illustrations';
import { FirstRunOnboarding, useFirstRunExperience } from '@/components/onboarding';
import { Button, Text } from '@/components/primitives';
import { colors, layout, r001Radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const setLocale = usePrototypeStore((state) => state.setLocale);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const childAccess = usePrototypeStore((state) => state.childAccess);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const enterParentExperience = usePrototypeStore((state) => state.enterParentExperience);
  const { state: firstRunState } = useFirstRunExperience();

  const switchLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  if (activeExperience === 'parent' && parentOnboarding.status === 'authenticated_parent') {
    return <Redirect href="/parent" />;
  }
  if (activeExperience === 'child' && childAccess.canEnterChildExperience) {
    return <Redirect href="/child" />;
  }
  if (!firstRunState.completed) return <FirstRunOnboarding />;

  const openParent = () => {
    const existing = enterParentExperience();
    router.push((existing.ok ? '/parent' : '/access/parent/sign-in') as Href);
  };

  return (
    <AccessScreen
      background="welcome"
      contentContainerStyle={styles.viewport}
      contentMaxWidth={layout.readableContentWidth}
      contentStyle={styles.content}
      header={
        <View
          style={[
            styles.languageBar,
            direction === 'rtl' ? styles.languageBarRtl : styles.languageBarLtr,
          ]}
        >
          <Button
            accessibilityLabel={t('access.welcome.switchLanguage')}
            brand
            direction="ltr"
            fullWidth={false}
            language={locale}
            onPress={switchLocale}
            style={styles.languageButton}
            testID="welcome-language-button"
            variant="quiet"
          >
            {t('access.welcome.switchLanguage')}
          </Button>
        </View>
      }
      testID="welcome-screen"
    >
      <View style={styles.hero}>
        <GhafRasterLogo
          accessibilityLabel={t('common.brand')}
          size={76}
          testID="welcome-raster-logo"
        />
        <Text
          align="center"
          brand
          color="ghafEmerald"
          direction="rtl"
          language="ar"
          testID="welcome-wordmark"
          variant="wordmark"
        >
          {t('common.brand')}
        </Text>
        <LocalIllustration
          assetId="welcome-ghaf-habitat"
          decorative
          direction={direction}
          language={locale}
          priority="high"
          style={styles.heroImage}
          testID="welcome-natural-hero"
        />
        <Text
          align="center"
          brand
          color="deepForest"
          direction={direction}
          language={locale}
          style={styles.title}
          testID="welcome-title"
          variant="hero"
        >
          {t('access.welcome.title')}
        </Text>
        <Text
          align="center"
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={locale}
          style={styles.body}
          variant="body"
        >
          {t('access.welcome.body')}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          brand
          direction={direction}
          language={locale}
          onPress={openParent}
          size="regular"
          testID="welcome-parent-button"
        >
          {t('access.welcome.parentAction')}
        </Button>
        <Button
          brand
          direction={direction}
          language={locale}
          onPress={() => router.push('/access/child' as Href)}
          size="regular"
          testID="welcome-child-button"
          variant="secondary"
        >
          {t('access.welcome.childAction')}
        </Button>
      </View>

      <PrototypePill
        direction={direction}
        language={locale}
        message={t('access.welcome.origin')}
        style={styles.origin}
      />
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  languageBar: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.readableContentWidth + layout.screenPadding * 2,
    minHeight: layout.touchTarget + spacing.xs,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xs,
  },
  languageBarRtl: { alignItems: 'flex-end' },
  languageBarLtr: { alignItems: 'flex-start' },
  languageButton: {
    borderRadius: r001Radii.pill,
    paddingHorizontal: spacing.sm,
  },
  viewport: {
    paddingTop: 0,
    paddingBottom: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  hero: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: 500,
    paddingTop: spacing.xl,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 3 / 2,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLow,
  },
  title: { maxWidth: 340 },
  body: { maxWidth: 340 },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  origin: { marginTop: spacing.xs },
});
