import { useCallback, useEffect, useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessActionRegion,
  AccessHeader,
  AccessScreen,
  GhafIcon,
  OtpInput,
  PrototypePill,
  StatusBanner,
} from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { colors, isolateBidiText, layout, r001Radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const RESEND_SECONDS = 30;

export default function ParentVerificationScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const verifyParentCode = usePrototypeStore((state) => state.verifyParentCode);
  const resendParentVerification = usePrototypeStore((state) => state.resendParentVerification);
  const cancelParentVerification = usePrototypeStore((state) => state.cancelParentVerification);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS);
  const isOffline = preview === 'offline' || parentOnboarding.offlineFallbackUsed;
  const isVerifying = busy || parentOnboarding.status === 'verifying';

  const returnToSignIn = useCallback(() => {
    const result = cancelParentVerification();
    if (!result.ok) {
      setError(t('access.states.interrupted'));
      return;
    }
    setCode('');
    router.replace(isOffline ? '/access/parent/sign-in?preview=offline' : '/access/parent/sign-in');
  }, [cancelParentVerification, isOffline, router, t]);

  useEffect(() => {
    if (parentOnboarding.status !== 'code_sent' || resendSeconds <= 0) return;
    const timeout = setTimeout(() => {
      setResendSeconds((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [parentOnboarding.status, resendSeconds]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      returnToSignIn();
      return true;
    });
    return () => subscription.remove();
  }, [returnToSignIn]);

  const verify = async () => {
    if (isVerifying || code.length !== 6) return;
    setBusy(true);
    setError(null);
    const result = await verifyParentCode(code);
    if (!result.ok) {
      setError(
        result.error.code === 'INVALID_INPUT'
          ? t('access.verification.invalidCode')
          : t('access.states.interrupted'),
      );
      setBusy(false);
      return;
    }
    router.replace('/access/parent/family-basics');
  };

  const resend = () => {
    if (resendSeconds > 0 || isVerifying) return;
    const result = resendParentVerification({ networkAvailable: !isOffline });
    if (!result.ok) {
      setError(t('access.states.interrupted'));
      return;
    }
    setCode('');
    setError(null);
    setResendSeconds(RESEND_SECONDS);
  };

  if (parentOnboarding.status === 'signed_out') {
    return <Redirect href="/access/parent/sign-in" />;
  }
  if (parentOnboarding.status === 'verified') {
    return <Redirect href="/access/parent/family-basics" />;
  }
  if (parentOnboarding.status === 'authenticated_parent') {
    return <Redirect href="/parent" />;
  }

  const destination = isolateBidiText(parentOnboarding.maskedDestination ?? '', 'ltr');
  const countdown = `00:${String(resendSeconds).padStart(2, '0')}`;

  return (
    <AccessScreen
      background="organic"
      contentContainerStyle={styles.viewport}
      contentMaxWidth={layout.readableContentWidth}
      contentStyle={styles.content}
      footer={
        <AccessActionRegion direction={direction} language={locale}>
          <Button
            brand
            busy={isVerifying}
            busyLabel={t('access.verification.loading')}
            direction={direction}
            disabled={code.length !== 6}
            icon={
              <GhafIcon color={colors.onPrimary} direction={direction} name="check" size={20} />
            }
            iconPosition="end"
            language={locale}
            onPress={() => void verify()}
            size="regular"
            testID="verify-parent-code-button"
          >
            {t('access.verification.action')}
          </Button>
          <PrototypePill
            direction={direction}
            language={locale}
            message={t('access.verification.origin')}
          />
        </AccessActionRegion>
      }
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
      testID="parent-verification-screen"
    >
      <View style={styles.intro}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.iconPlate}
        >
          <GhafIcon direction={direction} name="dialpad" size={44} />
        </View>
        <Text
          align="center"
          brand
          color="primary"
          direction={direction}
          language={locale}
          variant="screenTitle"
        >
          {t('access.verification.title')}
        </Text>
        <Text
          align="center"
          brand
          color="onSurface"
          direction={direction}
          language={locale}
          variant="body"
        >
          {t('access.verification.body', { ending: destination })}
        </Text>
      </View>

      {isOffline ? (
        <StatusBanner
          direction={direction}
          language={locale}
          message={t('access.verification.offline')}
          tone="offline"
        />
      ) : null}

      <OtpInput
        accessibilityLabel={t('access.verification.title')}
        direction={direction}
        disabled={isVerifying}
        errorText={error ?? undefined}
        language={locale}
        onChange={(value) => {
          setCode(value);
          setError(null);
        }}
        testID="parent-verification-code-input"
        value={code}
      />

      <View style={styles.secondaryActions}>
        <Button
          brand
          direction={direction}
          disabled={resendSeconds > 0 || isVerifying}
          fullWidth={false}
          language={locale}
          onPress={resend}
          style={styles.resendButton}
          testID="resend-parent-code-button"
          variant="quiet"
        >
          {resendSeconds > 0
            ? t('access.verification.resendIn', { seconds: countdown })
            : t('access.verification.resend')}
        </Button>
        <Button
          brand
          direction={direction}
          disabled={isVerifying}
          fullWidth={false}
          language={locale}
          onPress={returnToSignIn}
          style={styles.changeButton}
          testID="change-parent-identifier-button"
          variant="quiet"
        >
          {t('access.verification.changeIdentifier')}
        </Button>
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  viewport: { paddingTop: spacing.xxl },
  content: {
    alignItems: 'center',
    gap: spacing.xxl,
  },
  intro: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconPlate: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerHigh,
  },
  secondaryActions: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  resendButton: {
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.lg,
  },
  changeButton: {
    borderRadius: r001Radii.pill,
    paddingHorizontal: spacing.lg,
  },
});
