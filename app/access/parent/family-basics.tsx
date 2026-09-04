import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessActionRegion,
  AccessHeader,
  AccessScreen,
  AccessTextField,
  InfoRow,
  SegmentedControl,
  StatusBanner,
} from '@/components/access';
import { PrimaryButton, Text } from '@/components/primitives';
import { spacing } from '@/design/tokens';
import { configureNativeDirection, setI18nLocale } from '@/i18n';
import type { LocaleCode } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const LANGUAGE_OPTIONS: readonly LocaleCode[] = ['ar', 'en'];

export default function FamilyBasicsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const setLocale = usePrototypeStore((state) => state.setLocale);
  const cancelParentVerification = usePrototypeStore((state) => state.cancelParentVerification);
  const updateParentOnboardingDraft = usePrototypeStore(
    (state) => state.updateParentOnboardingDraft,
  );
  const [familyName, setFamilyName] = useState(parentOnboarding.draft.familyName);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const goBack = useCallback(() => {
    updateParentOnboardingDraft({ familyName, appLanguage: locale });
    const result = cancelParentVerification();
    if (!result.ok) {
      setError(t('access.states.interrupted'));
      return;
    }
    router.replace('/access/parent/sign-in');
  }, [cancelParentVerification, familyName, locale, router, t, updateParentOnboardingDraft]);

  useEffect(() => {
    if (parentOnboarding.status === 'signed_out') {
      router.replace('/access/parent/sign-in');
    } else if (parentOnboarding.status === 'code_sent' || parentOnboarding.status === 'verifying') {
      router.replace('/access/parent/verification');
    } else if (parentOnboarding.status === 'authenticated_parent') {
      router.replace('/parent');
    }
  }, [parentOnboarding.status, router]);

  useEffect(() => {
    if (Platform.OS !== 'android' || parentOnboarding.status !== 'verified') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [goBack, parentOnboarding.status]);

  if (parentOnboarding.status !== 'verified') return null;

  const validateName = () => {
    const valid = familyName.trim().length >= 2;
    setError(valid ? null : t('access.setup.familyNameError'));
    return valid;
  };

  const chooseLanguage = (nextLocale: LocaleCode) => {
    setError(null);
    const result = updateParentOnboardingDraft({ appLanguage: nextLocale });
    if (!result.ok) {
      setError(t('access.states.interrupted'));
      return;
    }

    setLocale(nextLocale);
    void setI18nLocale(nextLocale);
    void configureNativeDirection(nextLocale);
  };

  const continueSetup = () => {
    if (busy || !validateName()) return;

    setBusy(true);
    const result = updateParentOnboardingDraft({
      appLanguage: locale,
      familyName: familyName.trim(),
    });
    if (!result.ok) {
      setBusy(false);
      setError(t('access.states.interrupted'));
      return;
    }

    requestAnimationFrame(() => router.replace('/access/parent/add-first-child'));
  };

  const languageOptions = LANGUAGE_OPTIONS.map((value) => ({
    value,
    label: value === 'ar' ? t('language.arabic') : t('language.english'),
  }));

  return (
    <AccessScreen
      background="organic"
      footer={
        <AccessActionRegion
          direction={direction}
          language={locale}
          supportingText={t('access.setup.origin')}
        >
          <PrimaryButton
            brand
            busy={busy}
            busyLabel={t('access.setup.continue')}
            direction={direction}
            disabled={familyName.trim().length < 2}
            language={locale}
            onPress={continueSetup}
            size="regular"
            testID="family-basics-continue"
          >
            {t('access.setup.continue')}
          </PrimaryButton>
        </AccessActionRegion>
      }
      header={
        <AccessHeader
          backLabel={t('common.back')}
          brand={t('common.brand')}
          direction={direction}
          language={locale}
          onBack={goBack}
          progressLabel={t('access.setup.progress', { step: 1, total: 3 })}
        />
      }
      keyboardAware
      testID="family-basics-screen"
    >
      <View style={styles.heading}>
        <Text brand direction={direction} language={locale} variant="hero">
          {t('access.setup.familyTitle')}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} language={locale} variant="body">
          {t('access.setup.familyBody')}
        </Text>
      </View>

      {parentOnboarding.offlineFallbackUsed ? (
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
          accessibilityLabel={t('access.setup.familyNameLabel')}
          autoCapitalize="words"
          autoCorrect={false}
          direction="auto"
          editable={!busy}
          errorText={error ?? undefined}
          label={t('access.setup.familyNameLabel')}
          language={locale}
          maxLength={60}
          onBlur={validateName}
          onChangeText={(value) => {
            setFamilyName(value);
            if (error && value.trim().length >= 2) setError(null);
          }}
          onSubmitEditing={continueSetup}
          placeholder={t('access.setup.familyNamePlaceholder')}
          returnKeyType="next"
          testID="family-name-input"
          value={familyName}
        />
        <View style={styles.privacyCopy}>
          <InfoRow
            direction={direction}
            icon="lock"
            language={locale}
            message={t('access.setup.familyPrivacy')}
          />
        </View>

        <SegmentedControl
          accessibilityLabel={t('access.setup.appLanguage')}
          direction={direction}
          disabled={busy}
          label={t('access.setup.appLanguage')}
          language={locale}
          onChange={chooseLanguage}
          options={languageOptions}
          testID="family-language"
          value={locale}
        />
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: spacing.xs,
  },
  form: {
    gap: spacing.xxl,
  },
  privacyCopy: {
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.xxs,
  },
});
