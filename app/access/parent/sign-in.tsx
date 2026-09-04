import { useCallback, useEffect, useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessFooter,
  AccessHeader,
  AccessScreen,
  AccessTextField,
  GhafIcon,
  LabeledDivider,
  PrototypePill,
  StatusBanner,
} from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { colors, layout, r001Radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const SYNTHETIC_PARENT_IDENTIFIER = '+971501234567';

export default function ParentSignInScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const requestParentVerification = usePrototypeStore((state) => state.requestParentVerification);
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const networkAvailable = preview !== 'offline';

  const goBack = useCallback(() => router.replace('/'), [router]);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [goBack]);

  const requestCode = async (candidate: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    await Promise.resolve();
    const result = requestParentVerification({
      identifier: candidate,
      networkAvailable,
    });
    if (!result.ok) {
      setError(
        result.error.code === 'INVALID_INPUT'
          ? t('access.signIn.invalidIdentifier')
          : t('access.states.interrupted'),
      );
      setBusy(false);
      return;
    }
    router.replace('/access/parent/verification');
  };

  if (parentOnboarding.status === 'code_sent' || parentOnboarding.status === 'verifying') {
    return <Redirect href="/access/parent/verification" />;
  }
  if (parentOnboarding.status === 'verified') {
    return <Redirect href="/access/parent/family-basics" />;
  }
  if (parentOnboarding.status === 'authenticated_parent') {
    return <Redirect href="/parent" />;
  }

  return (
    <AccessScreen
      background="organic"
      contentContainerStyle={styles.viewport}
      contentMaxWidth={layout.readableContentWidth}
      contentStyle={styles.content}
      footer={
        <AccessFooter>
          <PrototypePill
            direction={direction}
            language={locale}
            message={t('access.signIn.origin')}
          />
        </AccessFooter>
      }
      header={
        <AccessHeader
          backLabel={t('common.back')}
          brand={t('common.brand')}
          direction={direction}
          language={locale}
          onBack={goBack}
        />
      }
      keyboardAware
      testID="parent-sign-in-screen"
    >
      <View style={styles.intro}>
        <Text brand color="onSurface" direction={direction} language={locale} variant="parentHero">
          {t('access.signIn.title')}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} language={locale} variant="body">
          {t('access.signIn.body')}
        </Text>
      </View>

      {preview === 'offline' ? (
        <StatusBanner
          direction={direction}
          language={locale}
          message={t('access.states.localFallback')}
          title={t('access.states.offline')}
          tone="offline"
        />
      ) : null}

      <View style={styles.form}>
        <AccessTextField
          accessibilityHint={t('access.signIn.identifierExample')}
          autoCapitalize="none"
          autoComplete="username"
          autoCorrect={false}
          direction="auto"
          editable={!busy}
          errorText={error ?? undefined}
          helperText={t('access.signIn.identifierExample')}
          label={t('access.signIn.identifierLabel')}
          language={locale}
          onChangeText={(value) => {
            setIdentifier(value);
            setError(null);
          }}
          onSubmitEditing={() => void requestCode(identifier)}
          placeholder={t('access.signIn.identifierPlaceholder')}
          returnKeyType="go"
          testID="parent-identifier-input"
          textContentType="username"
          value={identifier}
        />

        <Button
          brand
          busy={busy}
          busyLabel={t('access.signIn.loading')}
          direction={direction}
          language={locale}
          onPress={() => void requestCode(identifier)}
          size="regular"
          testID="request-parent-code-button"
        >
          {t('access.signIn.continue')}
        </Button>

        <LabeledDivider
          direction={direction}
          label={t('access.signIn.divider')}
          language={locale}
        />

        <Button
          accessibilityHint={t('access.signIn.biometricHint')}
          brand
          direction={direction}
          disabled={busy}
          icon={
            <GhafIcon
              color={colors.onSurfaceVariant}
              direction={direction}
              name="fingerprint"
              size={22}
            />
          }
          language={locale}
          onPress={() => void requestCode(identifier.trim() || SYNTHETIC_PARENT_IDENTIFIER)}
          size="regular"
          testID="simulated-biometric-button"
          variant="neutral"
        >
          {t('access.signIn.biometric')}
        </Button>
        <Text
          align="center"
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={locale}
          variant="caption"
        >
          {t('access.signIn.biometricHint')}
        </Text>

        <Button
          brand
          direction={direction}
          disabled={busy}
          fullWidth={false}
          language={locale}
          onPress={() => void requestCode(identifier.trim() || SYNTHETIC_PARENT_IDENTIFIER)}
          style={styles.createFamilyButton}
          testID="create-family-button"
          variant="quiet"
        >
          {t('access.signIn.createFamily')}
        </Button>
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  viewport: { paddingTop: spacing.xs },
  content: { gap: spacing.xxl },
  intro: { gap: spacing.xs },
  form: {
    width: '100%',
    gap: spacing.xl,
  },
  createFamilyButton: {
    alignSelf: 'center',
    borderRadius: r001Radii.pill,
    paddingHorizontal: spacing.lg,
  },
});
