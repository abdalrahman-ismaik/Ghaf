import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessScreen, GhafIcon, PrototypePill, StatusBanner } from '@/components/access';
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
  const [showChildUnavailable, setShowChildUnavailable] = useState(false);

  const switchLocale = () => {
    setShowChildUnavailable(false);
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  if (parentOnboarding.status === 'authenticated_parent') {
    return <Redirect href="/parent" />;
  }

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
            icon={<GhafIcon direction="ltr" name="language" size={20} />}
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
        {showChildUnavailable ? (
          <StatusBanner
            direction={direction}
            language={locale}
            message={t('access.welcome.childUnavailable')}
            tone="origin"
          />
        ) : null}
        <Button
          brand
          direction={direction}
          icon={<GhafIcon color={colors.onPrimary} direction={direction} name="family" size={20} />}
          language={locale}
          onPress={() => router.push('/access/parent/sign-in')}
          size="regular"
          testID="welcome-parent-button"
        >
          {t('access.welcome.parentAction')}
        </Button>
        <Button
          accessibilityHint={t('access.welcome.childUnavailable')}
          brand
          direction={direction}
          icon={<GhafIcon direction={direction} name="child" size={20} />}
          language={locale}
          onPress={() => setShowChildUnavailable(true)}
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
    minHeight: 390,
    paddingTop: spacing.xl,
  },
  title: { maxWidth: 340 },
  body: { maxWidth: 340 },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  origin: { marginTop: spacing.xs },
});
