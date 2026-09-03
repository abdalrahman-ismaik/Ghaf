import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessFooter,
  AccessHeader,
  AccessScreen,
  GhafIcon,
  StatusBanner,
} from '@/components/access';
import { Button, Input, QuietButton, Text } from '@/components/primitives';
import { colors, spacing } from '@/design/tokens';
import { PARENT_VERIFICATION_CODE } from '@/features/access';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const waitForFeedback = () => new Promise<void>((resolve) => setTimeout(resolve, 260));

export default function ParentSignInScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { t } = useTranslation();
  const requestVerification = usePrototypeStore((state) => state.requestParentVerification);
  const verifyCode = usePrototypeStore((state) => state.verifyParentCode);
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<'identifier' | 'biometric' | null>(null);
  const offline = preview === 'offline';

  const beginVerification = async () => {
    if (busy) return;
    setBusy('identifier');
    setError(null);
    const result = requestVerification({ identifier, networkAvailable: !offline });
    await waitForFeedback();
    setBusy(null);
    if (!result.ok) {
      setError(t('access.signIn.invalidIdentifier'));
      return;
    }
    router.push({ pathname: '/access/parent/verification', params: offline ? { preview } : {} });
  };

  const simulateBiometric = async () => {
    if (busy) return;
    setBusy('biometric');
    setError(null);
    setNotice(t('access.signIn.biometricHint'));
    const requested = requestVerification({
      identifier: 'parent@ghaf.demo',
      networkAvailable: !offline,
    });
    if (!requested.ok) {
      setBusy(null);
      setError(t('access.signIn.invalidIdentifier'));
      return;
    }
    const verified = await verifyCode(PARENT_VERIFICATION_CODE);
    await waitForFeedback();
    setBusy(null);
    if (!verified.ok) {
      setError(t('access.verification.invalidCode'));
      return;
    }
    router.push('/access/parent/family-basics');
  };

  return (
    <AccessScreen
      footer={
        <AccessFooter originLabel={t('access.signIn.origin')}>
          {offline ? (
            <StatusBanner
              message={`${t('access.states.offline')} ${t('access.states.localFallback')}`}
              tone="offline"
            />
          ) : null}
        </AccessFooter>
      }
      header={
        <AccessHeader
          backLabel={t('common.back')}
          onBack={() => router.replace('/')}
          title={t('common.brand')}
        />
      }
      keyboardAware
      testID="parent-sign-in-screen"
    >
      <View style={styles.heading}>
        <Text color="ink" variant="title">
          {t('access.signIn.title')}
        </Text>
        <Text color="inkMuted">{t('access.signIn.body')}</Text>
      </View>

      <View style={styles.form}>
        <Input
          autoCapitalize="none"
          autoComplete="username"
          direction="ltr"
          errorText={error ?? undefined}
          label={t('access.signIn.identifierLabel')}
          onChangeText={(value) => {
            setIdentifier(value);
            setError(null);
          }}
          onSubmitEditing={() => void beginVerification()}
          placeholder={t('access.signIn.identifierPlaceholder')}
          returnKeyType="next"
          testID="parent-identifier-input"
          value={identifier}
        />
        <Text color="inkMuted" direction="ltr" variant="caption">
          {t('access.signIn.identifierExample')}
        </Text>
        <Button
          busy={busy === 'identifier'}
          busyLabel={t('access.signIn.loading')}
          onPress={() => void beginVerification()}
          testID="continue-to-verification-button"
        >
          {t('access.signIn.continue')}
        </Button>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text align="center" color="inkMuted" variant="caption">
          {t('access.signIn.divider')}
        </Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.alternatives}>
        <Button
          busy={busy === 'biometric'}
          icon={<GhafIcon color={colors.ink} name="fingerprint" size={23} />}
          onPress={() => void simulateBiometric()}
          testID="simulated-biometric-button"
          variant="quiet"
        >
          {t('access.signIn.biometric')}
        </Button>
        {notice ? <StatusBanner message={notice} tone="origin" /> : null}
        <QuietButton
          onPress={() => {
            setIdentifier('parent@ghaf.demo');
            setError(null);
            setNotice(t('access.signIn.origin'));
          }}
          testID="create-family-link"
        >
          {t('access.signIn.createFamily')}
        </QuietButton>
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: spacing.xs,
  },
  form: {
    gap: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  alternatives: {
    gap: spacing.md,
  },
});
