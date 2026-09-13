import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigationContainerRef } from 'expo-router';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessHeader, AccessScreen, PrototypePill, StatusBanner } from '@/components/access';
import { useFirstRunExperience } from '@/components/onboarding';
import { Button, Text } from '@/components/primitives';
import { layout, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { focusAccessibilityTarget } from '@/utils/accessibilityFocus';
import { prepareEntryReset } from '@/utils/navigation';

export function LocalFamilyRecovery() {
  const navigation = useNavigationContainerRef();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const setLocale = usePrototypeStore((state) => state.setLocale);
  const localFamily = usePrototypeStore((state) => state.localFamily);
  const retryLocalFamilyLoad = usePrototypeStore((state) => state.retryLocalFamilyLoad);
  const confirmCorruptLocalFamilyRecovery = usePrototypeStore(
    (state) => state.confirmCorruptLocalFamilyRecovery,
  );
  const { dispatch, presentationReady } = useFirstRunExperience();
  const titleRef = useRef<View>(null);
  const [confirmationRequested, setConfirmationRequested] = useState(false);
  const [failed, setFailed] = useState(false);
  const corrupt = localFamily.errorCode === 'corrupt_local_data';
  const confirming = corrupt && confirmationRequested;

  useEffect(() => {
    if (presentationReady) focusAccessibilityTarget(titleRef.current);
  }, [confirming, corrupt, presentationReady]);

  const cancel = useCallback(() => {
    setConfirmationRequested(false);
    setFailed(false);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android' || !confirming) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      cancel();
      return true;
    });
    return () => subscription.remove();
  }, [cancel, confirming]);

  const retry = () => {
    setFailed(false);
    const result = retryLocalFamilyLoad();
    if (!result.ok) {
      setFailed(true);
      return;
    }
    if (usePrototypeStore.getState().localFamily.record) dispatch({ type: 'skip' });
  };

  const confirm = () => {
    if (!confirming) return;
    setFailed(false);
    const resetNavigation = prepareEntryReset(navigation);
    if (!resetNavigation) {
      setFailed(true);
      return;
    }
    const result = confirmCorruptLocalFamilyRecovery({ confirmed: true });
    if (!result.ok) {
      setFailed(true);
      return;
    }
    dispatch({ type: 'skip' });
    resetNavigation();
  };

  const titleKey = confirming ? 'confirmTitle' : corrupt ? 'corruptTitle' : 'unavailableTitle';
  const bodyKey = confirming ? 'confirmBody' : corrupt ? 'corruptBody' : 'unavailableBody';

  return (
    <AccessScreen
      background="organic"
      contentMaxWidth={layout.readableContentWidth}
      contentStyle={styles.content}
      header={
        <AccessHeader
          backLabel={t('common.back')}
          brand={t('common.brand')}
          direction={direction}
          language={locale}
          onBack={confirming ? cancel : undefined}
          trailing={
            <Button
              accessibilityLabel={t('access.welcome.switchLanguage')}
              brand
              direction="ltr"
              fullWidth={false}
              language={locale}
              onPress={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              testID="local-family-recovery-language"
              variant="quiet"
            >
              {t('access.welcome.switchLanguage')}
            </Button>
          }
        />
      }
      testID="local-family-recovery-screen"
    >
      <View accessibilityLiveRegion="polite" style={styles.intro}>
        <View
          accessible
          accessibilityLabel={t(`access.localRecovery.${titleKey}`)}
          accessibilityLanguage={locale === 'ar' ? 'ar-AE' : 'en-AE'}
          accessibilityRole="header"
          ref={titleRef}
          testID="local-family-recovery-title"
        >
          <Text
            accessibilityRole="none"
            align="center"
            brand
            color="deepForest"
            direction={direction}
            language={locale}
            variant="parentHero"
          >
            {t(`access.localRecovery.${titleKey}`)}
          </Text>
        </View>
        <Text
          align="center"
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={locale}
          variant="body"
        >
          {t(`access.localRecovery.${bodyKey}`)}
        </Text>
      </View>

      {failed ? (
        <StatusBanner
          direction={direction}
          language={locale}
          message={t(`access.localRecovery.${confirming ? 'clearFailed' : 'failed'}`)}
          tone="error"
        />
      ) : null}

      <View style={styles.actions}>
        {confirming ? (
          <>
            <Button
              brand
              direction={direction}
              language={locale}
              onPress={cancel}
              size="regular"
              testID="local-family-recovery-cancel"
              variant="secondary"
            >
              {t('common.cancel')}
            </Button>
            <Button
              accessibilityHint={t('access.localRecovery.confirmHint')}
              brand
              direction={direction}
              language={locale}
              onPress={confirm}
              size="regular"
              testID="local-family-recovery-confirm"
            >
              {t('access.localRecovery.confirmAction')}
            </Button>
          </>
        ) : (
          <>
            <Button
              brand
              direction={direction}
              language={locale}
              onPress={retry}
              size="regular"
              testID="local-family-recovery-retry"
            >
              {t('access.localRecovery.retry')}
            </Button>
            {corrupt ? (
              <Button
                brand
                direction={direction}
                language={locale}
                onPress={() => {
                  setFailed(false);
                  setConfirmationRequested(true);
                }}
                size="regular"
                testID="local-family-recovery-propose"
                variant="secondary"
              >
                {t('access.localRecovery.propose')}
              </Button>
            ) : null}
          </>
        )}
      </View>

      <PrototypePill
        direction={direction}
        language={locale}
        message={t('access.localRecovery.origin')}
      />
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  intro: { gap: spacing.md },
  actions: { gap: spacing.sm },
});
