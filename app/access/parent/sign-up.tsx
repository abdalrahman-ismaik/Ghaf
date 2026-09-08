import { useCallback, useEffect, useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessHeader,
  AccessScreen,
  AccessTextField,
  GhafIcon,
  StatusBanner,
} from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { colors, layout, r001Radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentSignUpScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const requestParentVerification = usePrototypeStore((state) => state.requestParentVerification);
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const networkAvailable = preview !== 'offline';
  const verificationHref =
    preview === 'offline'
      ? '/access/parent/verification?flow=create-family&preview=offline'
      : '/access/parent/verification?flow=create-family';

  const returnToSignIn = useCallback(() => {
    if (preview === 'offline') {
      router.replace('/access/parent/sign-in?preview=offline');
      return;
    }
    router.replace('/access/parent/sign-in');
  }, [preview, router]);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      returnToSignIn();
      return true;
    });
    return () => subscription.remove();
  }, [returnToSignIn]);

  const requestCode = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    await Promise.resolve();
    const result = requestParentVerification({ identifier, networkAvailable });
    if (!result.ok) {
      setError(
        result.error.code === 'INVALID_INPUT'
          ? t('access.signIn.invalidIdentifier')
          : t('access.states.interrupted'),
      );
      setBusy(false);
      return;
    }
    router.replace(verificationHref);
  };

  if (parentOnboarding.status === 'authenticated_parent') {
    return <Redirect href={activeExperience === 'parent' ? '/parent' : '/'} />;
  }
  if (parentOnboarding.completionReceipt) {
    return <Redirect href="/access/parent/sign-in" />;
  }
  if (parentOnboarding.status === 'code_sent' || parentOnboarding.status === 'verifying') {
    return <Redirect href={verificationHref} />;
  }
  if (parentOnboarding.status === 'verified') {
    return <Redirect href="/access/parent/family-basics" />;
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
          onBack={returnToSignIn}
        />
      }
      keyboardAware
      testID="parent-sign-up-screen"
    >
      <View style={styles.intro}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.iconPlate}
        >
          <GhafIcon direction={direction} name="family" size={32} />
        </View>
        <Text
          align="center"
          brand
          color="deepForest"
          direction={direction}
          language={locale}
          variant="parentHero"
        >
          {t('access.signUp.title')}
        </Text>
        <Text
          align="center"
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={locale}
          variant="body"
        >
          {t('access.signUp.body')}
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
          onSubmitEditing={() => void requestCode()}
          placeholder={t('access.signIn.identifierPlaceholder')}
          returnKeyType="go"
          testID="parent-sign-up-identifier-input"
          textContentType="username"
          value={identifier}
        />

        <Button
          brand
          busy={busy}
          busyLabel={t('access.signUp.loading')}
          direction={direction}
          language={locale}
          onPress={() => void requestCode()}
          size="regular"
          testID="request-parent-sign-up-code-button"
        >
          {t('access.signUp.action')}
        </Button>
      </View>

      <View style={styles.returningFamilyGroup}>
        <Text
          align="center"
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={locale}
          variant="caption"
        >
          {t('access.signUp.returningPrompt')}
        </Text>
        <Button
          brand
          direction={direction}
          disabled={busy}
          language={locale}
          onPress={returnToSignIn}
          size="regular"
          style={styles.returnButton}
          testID="return-to-parent-sign-in-button"
          variant="quiet"
        >
          {t('access.signUp.returnToSignIn')}
        </Button>
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  viewport: { paddingTop: spacing.xs },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  intro: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconPlate: {
    width: spacing.massive,
    height: spacing.massive,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerHigh,
  },
  form: { width: '100%', gap: spacing.sm },
  returningFamilyGroup: {
    width: '100%',
    gap: spacing.xxs,
    paddingTop: spacing.xs,
  },
  returnButton: {
    borderColor: colors.ghafEmerald,
  },
});
