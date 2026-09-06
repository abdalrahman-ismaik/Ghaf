import { useCallback, useEffect, useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessHeader, AccessScreen, AccessTextField, StatusBanner } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { colors, layout, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentSignInScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const requestExistingParentVerification = usePrototypeStore(
    (state) => state.requestExistingParentVerification,
  );
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const networkAvailable = preview !== 'offline';
  const signUpHref =
    preview === 'offline' ? '/access/parent/sign-up?preview=offline' : '/access/parent/sign-up';

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
    const result = requestExistingParentVerification({
      identifier: candidate,
      networkAvailable,
    });
    if (!result.ok) {
      setError(
        result.error.code === 'INVALID_INPUT'
          ? t('access.signIn.invalidIdentifier')
          : result.error.code === 'NOT_FOUND'
            ? t('access.signIn.accountNotFound')
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
  if (parentOnboarding.status === 'verified' && parentOnboarding.completionReceipt) {
    return <Redirect href="/access/parent/verification" />;
  }
  if (parentOnboarding.status === 'authenticated_parent') {
    return <Redirect href={activeExperience === 'parent' ? '/parent' : '/'} />;
  }

  return (
    <AccessScreen
      background="organic"
      contentContainerStyle={styles.viewport}
      contentMaxWidth={layout.readableContentWidth}
      contentStyle={styles.content}
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
        <Text
          align="center"
          brand
          color="deepForest"
          direction={direction}
          language={locale}
          variant="parentHero"
        >
          {t('access.signIn.title')}
        </Text>
        <Text
          align="center"
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={locale}
          variant="body"
        >
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

      <View style={styles.signInPanel}>
        <View style={styles.credentials}>
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
        </View>

        {parentOnboarding.completionReceipt ? null : (
          <View style={styles.createFamilyGroup}>
            <Button
              brand
              direction={direction}
              disabled={busy}
              language={locale}
              onPress={() => router.push(signUpHref)}
              size="regular"
              style={styles.createFamilyButton}
              testID="create-family-button"
              variant="quiet"
            >
              {t('access.signIn.createFamily')}
            </Button>
          </View>
        )}
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  viewport: { paddingTop: spacing.xs },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  intro: { width: '100%', alignItems: 'center', gap: spacing.xxs },
  signInPanel: {
    width: '100%',
    gap: spacing.md,
  },
  credentials: { gap: spacing.sm },
  createFamilyGroup: { paddingTop: spacing.xs },
  createFamilyButton: {
    borderColor: colors.ghafEmerald,
  },
});
