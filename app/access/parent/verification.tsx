import { useEffect, useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessFooter,
  AccessHeader,
  AccessScreen,
  GhafIcon,
  OtpInput,
  StatusBanner,
} from '@/components/access';
import { Button, QuietButton, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function VerificationScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { t } = useTranslation();
  const parentAccess = usePrototypeStore((state) => state.parentAccess);
  const requestVerification = usePrototypeStore((state) => state.requestParentVerification);
  const verifyCode = usePrototypeStore((state) => state.verifyParentCode);
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const offline = preview === 'offline' || parentAccess.offlineFallbackUsed;

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  if (!['code_sent', 'verifying', 'verified'].includes(parentAccess.state)) {
    return <Redirect href="/access/parent/sign-in" />;
  }

  const submit = async () => {
    if (code.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    const result = await verifyCode(code);
    setBusy(false);
    if (!result.ok) {
      setCode('');
      setError(t('access.verification.invalidCode'));
      return;
    }
    router.push('/access/parent/family-basics');
  };

  const resend = () => {
    if (seconds > 0 || !parentAccess.normalizedIdentifier) return;
    requestVerification({
      identifier: parentAccess.normalizedIdentifier,
      networkAvailable: !offline,
    });
    setCode('');
    setError(null);
    setSeconds(30);
  };

  const destination = parentAccess.maskedDestination ?? '42';

  return (
    <AccessScreen
      footer={
        <AccessFooter originLabel={t('access.verification.origin')}>
          <Button
            busy={busy}
            busyLabel={t('access.verification.loading')}
            disabled={code.length !== 6}
            icon={<GhafIcon color={colors.white} name="check" size={21} />}
            onPress={() => void submit()}
            testID="verify-code-button"
          >
            {t('access.verification.action')}
          </Button>
        </AccessFooter>
      }
      header={
        <AccessHeader
          backLabel={t('common.back')}
          onBack={() => router.replace('/access/parent/sign-in')}
          title={t('common.brand')}
        />
      }
      keyboardAware
      testID="verification-screen"
    >
      <View style={styles.hero}>
        <View style={styles.emblem}>
          <GhafIcon color={colors.ghaf} name="dialpad" size={36} />
        </View>
        <Text align="center" color="ghaf" variant="title">
          {t('access.verification.title')}
        </Text>
        <Text align="center" color="ink">
          {t('access.verification.body', { ending: destination })}
        </Text>
      </View>

      {offline ? <StatusBanner message={t('access.verification.offline')} tone="offline" /> : null}

      <OtpInput
        accessibilityLabel={t('access.verification.title')}
        disabled={busy}
        errorText={error ?? undefined}
        onChange={(value: string) => {
          setCode(value);
          setError(null);
        }}
        testID="verification-code-input"
        value={code}
      />

      <View style={styles.secondaryActions}>
        <QuietButton disabled={seconds > 0} onPress={resend} testID="resend-code-button">
          {seconds > 0
            ? t('access.verification.resendIn', {
                seconds: `00:${String(seconds).padStart(2, '0')}`,
              })
            : t('access.verification.resend')}
        </QuietButton>
        <QuietButton
          onPress={() => router.replace('/access/parent/sign-in')}
          testID="change-identifier-button"
        >
          {t('access.verification.changeIdentifier')}
        </QuietButton>
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  emblem: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.leafMist,
  },
  secondaryActions: {
    alignItems: 'center',
    gap: spacing.xs,
  },
});
