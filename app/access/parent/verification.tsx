import { useCallback, useEffect, useState } from 'react';
import { Redirect, type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessActionRegion,
  AccessHeader,
  AccessScreen,
  GhafIcon,
  OtpInput,
  ParentAccessPortrait,
  RememberDeviceChoice,
  StatusBanner,
} from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { colors, isolateBidiText, layout, r001Radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const RESEND_SECONDS = 30;

export default function ParentVerificationScreen() {
  const router = useRouter();
  const { flow, preview } = useLocalSearchParams<{ flow?: string; preview?: string }>();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const pendingFamilyCreation = usePrototypeStore((state) => state.pendingFamilyCreation);
  const childAccess = usePrototypeStore((state) => state.childAccess);
  const rememberParentOnThisDevice = usePrototypeStore((state) => state.rememberParentOnThisDevice);
  const temporaryParentAccess = usePrototypeStore((state) => state.temporaryParentAccess);
  const setRememberParentOnThisDevice = usePrototypeStore(
    (state) => state.setRememberParentOnThisDevice,
  );
  const verifyParentCode = usePrototypeStore((state) => state.verifyParentCode);
  const beginVerifiedFamilyReplacement = usePrototypeStore(
    (state) => state.beginVerifiedFamilyReplacement,
  );
  const beginVerifiedFamilyProfileRepair = usePrototypeStore(
    (state) => state.beginVerifiedFamilyProfileRepair,
  );
  const completeParentOnboarding = usePrototypeStore((state) => state.completeParentOnboarding);
  const resendParentVerification = usePrototypeStore((state) => state.resendParentVerification);
  const cancelParentVerification = usePrototypeStore((state) => state.cancelParentVerification);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS);
  const isOffline = preview === 'offline' || parentOnboarding.offlineFallbackUsed;
  const isVerifying = busy || parentOnboarding.status === 'verifying';
  const isCreateFamilyFlow = flow === 'create-family';
  const entryHref: Href = isCreateFamilyFlow
    ? isOffline
      ? '/access/parent/sign-up?preview=offline'
      : '/access/parent/sign-up'
    : isOffline
      ? '/access/parent/sign-in?preview=offline'
      : '/access/parent/sign-in';

  const returnToEntry = useCallback(() => {
    const result = cancelParentVerification();
    if (!result.ok) {
      setError(t('access.states.interrupted'));
      return;
    }
    setCode('');
    router.replace(entryHref);
  }, [cancelParentVerification, entryHref, router, t]);

  const enterExistingFamily = useCallback(() => {
    const completed = completeParentOnboarding();
    if (!completed.ok) {
      setError(t('access.states.interrupted'));
      setBusy(false);
      return false;
    }
    const destination =
      childAccess.status === 'pairing_pending' ? '/parent/settings/devices' : '/parent';
    router.replace(destination as Href);
    return true;
  }, [childAccess.status, completeParentOnboarding, router, t]);

  useEffect(() => {
    if (parentOnboarding.status !== 'code_sent' || resendSeconds <= 0) return;
    const timeout = setTimeout(() => {
      setResendSeconds((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [parentOnboarding.status, resendSeconds]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      returnToEntry();
      return true;
    });
    return () => subscription.remove();
  }, [returnToEntry]);

  useEffect(() => {
    if (
      isCreateFamilyFlow ||
      parentOnboarding.status !== 'verified' ||
      !parentOnboarding.completionReceipt
    ) {
      return;
    }
    const frame = requestAnimationFrame(enterExistingFamily);
    return () => cancelAnimationFrame(frame);
  }, [
    enterExistingFamily,
    isCreateFamilyFlow,
    parentOnboarding.completionReceipt,
    parentOnboarding.status,
  ]);

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
    if (!isCreateFamilyFlow && pendingFamilyCreation === 'profile_repair') {
      const staged = beginVerifiedFamilyProfileRepair();
      if (!staged.ok) {
        setError(t('access.states.interrupted'));
        setBusy(false);
        return;
      }
      router.replace('/access/parent/add-first-child');
      return;
    }
    if (!isCreateFamilyFlow && result.data.completionReceipt) {
      enterExistingFamily();
      return;
    }
    if (isCreateFamilyFlow && pendingFamilyCreation === 'replacement') {
      const staged = beginVerifiedFamilyReplacement();
      if (!staged.ok) {
        setError(t('access.states.interrupted'));
        setBusy(false);
        return;
      }
      router.replace('/access/parent/family-basics');
      return;
    }
    if (!isCreateFamilyFlow || result.data.completionReceipt) {
      router.replace(entryHref);
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
    return <Redirect href={entryHref} />;
  }
  if (
    parentOnboarding.status === 'verified' &&
    isCreateFamilyFlow &&
    !parentOnboarding.completionReceipt
  ) {
    return <Redirect href="/access/parent/family-basics" />;
  }
  if (
    parentOnboarding.status === 'verified' &&
    ((isCreateFamilyFlow &&
      parentOnboarding.completionReceipt &&
      pendingFamilyCreation !== 'replacement') ||
      (!isCreateFamilyFlow &&
        !parentOnboarding.completionReceipt &&
        pendingFamilyCreation !== 'profile_repair'))
  ) {
    return <Redirect href={entryHref} />;
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
        </AccessActionRegion>
      }
      header={
        <AccessHeader
          backLabel={t('common.back')}
          brand={t('common.brand')}
          direction={direction}
          language={locale}
          onBack={returnToEntry}
        />
      }
      keyboardAware
      testID="parent-verification-screen"
    >
      <ParentAccessPortrait />

      <View style={styles.intro}>
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

      {temporaryParentAccess ? (
        <StatusBanner
          direction={direction}
          language={locale}
          message={t('access.verification.temporaryParentAccess')}
          tone="origin"
        />
      ) : (
        <RememberDeviceChoice
          body={t('access.verification.rememberDeviceBody')}
          direction={direction}
          disabled={isVerifying}
          language={locale}
          onChange={setRememberParentOnThisDevice}
          selected={rememberParentOnThisDevice}
          title={t('access.verification.rememberDeviceTitle')}
        />
      )}

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
          onPress={returnToEntry}
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
