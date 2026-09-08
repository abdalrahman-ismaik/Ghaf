import { useCallback, useEffect, useState } from 'react';
import { Redirect, type Href, useRouter } from 'expo-router';
import { ActivityIndicator, BackHandler, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { StatusBanner, SuccessSheet } from '@/components/access';
import { PrimaryButton, Text } from '@/components/primitives';
import { colors, layout, opacity, r001Radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

type AuthorizationState = 'checking' | 'authorized' | 'denied';

export default function FamilyCreatedSuccessScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const returningUserWelcome = usePrototypeStore((state) => state.returningUserWelcome);
  const childAccess = usePrototypeStore((state) => state.childAccess);
  const authorizeParentExperience = usePrototypeStore((state) => state.authorizeParentExperience);
  const [authorization, setAuthorization] = useState<AuthorizationState>('checking');

  const familyIsValid = parentOnboarding.draft.familyName.trim().length >= 2;
  const configuredChildren = parentOnboarding.draft.children.slice(
    0,
    parentOnboarding.draft.childCount,
  );
  const childIsValid = configuredChildren.every((child) => child.nickname.trim().length >= 2);

  const dismiss = useCallback(() => {
    router.dismissTo('/access/parent/review-create');
  }, [router]);

  const checkAuthorization = useCallback(() => {
    setAuthorization('checking');
    const result = authorizeParentExperience();
    setAuthorization(result.ok ? 'authorized' : 'denied');
    return result.ok;
  }, [authorizeParentExperience]);

  useEffect(() => {
    if (parentOnboarding.status === 'signed_out') {
      router.replace('/access/parent/sign-in');
      return;
    }
    if (parentOnboarding.status === 'code_sent' || parentOnboarding.status === 'verifying') {
      router.replace('/access/parent/verification');
      return;
    }
    if (!familyIsValid) {
      router.replace('/access/parent/family-basics');
      return;
    }
    if (!childIsValid || parentOnboarding.status === 'verified') {
      router.replace(
        childIsValid ? '/access/parent/review-create' : '/access/parent/add-first-child',
      );
      return;
    }
    if (parentOnboarding.status === 'authenticated_parent') {
      const frame = requestAnimationFrame(checkAuthorization);
      return () => cancelAnimationFrame(frame);
    }
  }, [checkAuthorization, childIsValid, familyIsValid, parentOnboarding.status, router]);

  useEffect(() => {
    if (Platform.OS !== 'android' || authorization !== 'authorized') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      dismiss();
      return true;
    });
    return () => subscription.remove();
  }, [authorization, dismiss]);

  const goHome = () => {
    if (!checkAuthorization()) return;
    router.dismissAll();
    const destination =
      childAccess.status === 'pairing_pending' ? '/parent/settings/devices' : '/parent';
    router.replace(destination as Href);
  };

  if (returningUserWelcome?.kind === 'returning_parent') {
    return <Redirect href="/parent" />;
  }
  if (parentOnboarding.status !== 'authenticated_parent' || !familyIsValid || !childIsValid)
    return null;

  if (authorization === 'checking') {
    return (
      <View
        accessibilityLiveRegion="polite"
        accessibilityViewIsModal
        importantForAccessibility="yes"
        style={styles.errorSurface}
        testID="success-authorization-loading"
      >
        <View style={styles.scrim} />
        <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.errorCard}>
          <ActivityIndicator color={colors.ghafEmerald} size="small" />
          <Text align="center" brand direction={direction} language={locale} variant="body">
            {t('access.success.loading')}
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  if (authorization === 'denied') {
    return (
      <View
        accessibilityViewIsModal
        importantForAccessibility="yes"
        style={styles.errorSurface}
        testID="success-authorization-error"
      >
        <View style={styles.scrim} />
        <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.errorCard}>
          <StatusBanner
            direction={direction}
            language={locale}
            message={t('access.states.interrupted')}
            tone="error"
          />
          <PrimaryButton
            brand
            direction={direction}
            language={locale}
            onPress={checkAuthorization}
            size="regular"
          >
            {t('access.states.retry')}
          </PrimaryButton>
        </SafeAreaView>
      </View>
    );
  }

  const childNames = (parentOnboarding.completionReceipt?.children ?? configuredChildren)
    .map((child) => child.nickname)
    .join(locale === 'ar' ? ' و' : ' and ');

  return (
    <SuccessSheet
      actionLabel={
        childAccess.status === 'pairing_pending'
          ? t('r003.devices.approvePairing')
          : t('access.success.action')
      }
      direction={direction}
      dismissLabel={t('common.close')}
      language={locale}
      message={t(
        configuredChildren.length === 1 ? 'access.success.bodyOne' : 'access.success.bodyTwo',
        {
          children: childNames,
        },
      )}
      onAction={goHome}
      onDismiss={dismiss}
      testID="family-created-success-sheet"
      title={t('access.success.title')}
      visible={authorization === 'authorized'}
    />
  );
}

const styles = StyleSheet.create({
  errorSurface: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.inverseSurface,
    opacity: opacity.scrim,
  },
  errorCard: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.accessContentWidth,
    gap: spacing.md,
    borderTopLeftRadius: r001Radii.sheet,
    borderTopRightRadius: r001Radii.sheet,
    borderCurve: 'continuous',
    backgroundColor: colors.r001Surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
});
