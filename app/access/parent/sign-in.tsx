import { useCallback, useEffect, useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessHeader,
  AccessScreen,
  ParentAccessPortrait,
  StatusBanner,
} from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { ParentAccountChooser } from '@/components/access/ParentAccountChooser';
import { colors, layout, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentSignInScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const localFamilyProfileRepair = usePrototypeStore((state) => state.localFamilyProfileRepair);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const temporaryParentAccess = usePrototypeStore((state) => state.temporaryParentAccess);
  const cancelTemporaryParentAccess = usePrototypeStore(
    (state) => state.cancelTemporaryParentAccess,
  );
  const requestExistingParentVerification = usePrototypeStore(
    (state) => state.requestExistingParentVerification,
  );
  const localFamily = usePrototypeStore((state) => state.localFamily);
  const enterLocalParentAccount = usePrototypeStore((state) => state.enterLocalParentAccount);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const networkAvailable = preview !== 'offline';
  const signUpHref =
    preview === 'offline' ? '/access/parent/sign-up?preview=offline' : '/access/parent/sign-up';

  const goBack = useCallback(() => {
    if (temporaryParentAccess) {
      const returned = cancelTemporaryParentAccess();
      if (!returned.ok) {
        setError(t('access.states.interrupted'));
        return;
      }
      router.replace('/child');
      return;
    }
    router.replace('/');
  }, [cancelTemporaryParentAccess, router, t, temporaryParentAccess]);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [goBack]);

  const openAccount = () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = localFamilyProfileRepair
      ? requestExistingParentVerification({
          identifier: localFamilyProfileRepair.parent.normalizedIdentifier,
          networkAvailable,
        })
      : enterLocalParentAccount();
    if (!result.ok) {
      setError(t('access.signIn.entryError'));
      setBusy(false);
      return;
    }
    router.replace(localFamilyProfileRepair ? '/access/parent/verification' : '/parent');
  };

  const familyName =
    localFamily.record?.familyName ??
    localFamilyProfileRepair?.familyName ??
    t('access.signIn.demoFamily');
  const accountUnavailable = localFamily.status !== 'ready' && !localFamilyProfileRepair;

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
      testID="parent-sign-in-screen"
    >
      <ParentAccessPortrait />

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

      {localFamilyProfileRepair ? (
        <StatusBanner
          direction={direction}
          language={locale}
          message={t('access.setup.profileRepairBody')}
          title={t('access.setup.profileRepairTitle')}
          tone="origin"
        />
      ) : null}

      <View style={styles.signInPanel}>
        <ParentAccountChooser
          actionLabel={t('access.signIn.continue')}
          busy={busy}
          busyLabel={t('access.signIn.loading')}
          detail={t(
            localFamilyProfileRepair
              ? 'access.signIn.repairAccount'
              : localFamily.record
                ? 'access.signIn.savedAccount'
                : 'access.signIn.demoAccount',
          )}
          direction={direction}
          disabled={accountUnavailable}
          familyName={familyName}
          language={locale}
          onSelect={openAccount}
        />
        {!localFamilyProfileRepair ? (
          <Text
            align="center"
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={locale}
            variant="caption"
          >
            {t('access.signIn.localNotice')}
          </Text>
        ) : null}
        {error || accountUnavailable ? (
          <StatusBanner
            direction={direction}
            language={locale}
            message={error ?? t('access.signIn.entryError')}
            tone="error"
          />
        ) : null}

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
  createFamilyGroup: { paddingTop: spacing.xs },
  createFamilyButton: {
    borderColor: colors.ghafEmerald,
  },
});
