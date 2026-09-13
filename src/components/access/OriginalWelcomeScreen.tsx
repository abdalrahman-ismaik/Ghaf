import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessScreen, PrototypePill } from '@/components/access';
import { GhafRasterLogo } from '@/components/brand/GhafRasterLogo';
import { Button, Text } from '@/components/primitives';
import { layout, r001Radii, spacing } from '@/design/tokens';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';

export interface OriginalWelcomeScreenProps {
  readonly locale: LocaleCode;
  readonly direction: TextDirection;
  readonly onChangeLocale: () => void;
  readonly onParent: () => void;
  readonly onChild: () => void;
  readonly busy?: boolean;
  readonly notice?: string | null;
  readonly busyLabel?: string;
}

export function OriginalWelcomeScreen({
  locale,
  direction,
  onChangeLocale,
  onParent,
  onChild,
  busy = false,
  notice,
  busyLabel,
}: OriginalWelcomeScreenProps) {
  const { t } = useTranslation();

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
            onPress={onChangeLocale}
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
        <View style={styles.brand}>
          <GhafRasterLogo
            accessibilityLabel={t('common.brand')}
            size={208}
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
        </View>
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

      {notice ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          brand
          direction={direction}
          language={locale}
          testID="demo-entry-error"
        >
          {notice}
        </Text>
      ) : null}
      {busyLabel ? (
        <Text
          accessibilityLiveRegion="polite"
          brand
          direction={direction}
          language={locale}
          testID="demo-entry-busy"
        >
          {busyLabel}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Button
          brand
          direction={direction}
          language={locale}
          disabled={busy}
          onPress={onParent}
          size="regular"
          testID="welcome-parent-button"
        >
          {t('access.welcome.parentAction')}
        </Button>
        <Button
          brand
          direction={direction}
          language={locale}
          disabled={busy}
          onPress={onChild}
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
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  hero: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  title: { maxWidth: 340 },
  body: { maxWidth: 340 },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  origin: { marginTop: spacing.xs },
});
