import { useCallback, useEffect, useRef, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import {
  AccessibilityInfo,
  BackHandler,
  findNodeHandle,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessActionRegion,
  AccessHeader,
  AccessScreen,
  AccessTextField,
  FamilyPeopleEditor,
  InfoRow,
  RememberDeviceChoice,
  SegmentedControl,
  StatusBanner,
} from '@/components/access';
import { FamilyPlusPreview } from '@/components/access/FamilyPlusPreview';
import { GhafIcon } from '@/components/access/GhafIcon';
import { PrimaryButton, Text } from '@/components/primitives';
import { colors, layout, logicalRowDirection, opacity, r001Radii, spacing } from '@/design/tokens';
import { validateCompleteFamilyConnectionDirectory } from '@/features/family-connections';
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
  const localFamily = usePrototypeStore((state) => state.localFamily);
  const setLocale = usePrototypeStore((state) => state.setLocale);
  const rememberParentOnThisDevice = usePrototypeStore((state) => state.rememberParentOnThisDevice);
  const temporaryParentAccess = usePrototypeStore((state) => state.temporaryParentAccess);
  const setRememberParentOnThisDevice = usePrototypeStore(
    (state) => state.setRememberParentOnThisDevice,
  );
  const cancelParentVerification = usePrototypeStore((state) => state.cancelParentVerification);
  const updateParentOnboardingDraft = usePrototypeStore(
    (state) => state.updateParentOnboardingDraft,
  );
  const [familyName, setFamilyName] = useState(parentOnboarding.draft.familyName);
  const [familyConnections, setFamilyConnections] = useState(
    parentOnboarding.draft.familyConnections,
  );
  const [childCount, setChildCount] = useState<'1' | '2'>(
    String(parentOnboarding.draft.childCount) as '1' | '2',
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [relativeEditorOpen, setRelativeEditorOpen] = useState(false);
  const [plusPreviewVisible, setPlusPreviewVisible] = useState(false);
  const plusTriggerRef = useRef<View>(null);

  const closePlusPreview = useCallback(() => {
    setPlusPreviewVisible(false);
    if (Platform.OS === 'web') return;
    requestAnimationFrame(() => {
      const reactTag = findNodeHandle(plusTriggerRef.current);
      if (reactTag) AccessibilityInfo.setAccessibilityFocus(reactTag);
    });
  }, []);

  const goBack = useCallback(() => {
    updateParentOnboardingDraft({
      familyConnections,
      familyName,
      appLanguage: locale,
      childCount: Number(childCount) as 1 | 2,
    });
    const result = cancelParentVerification();
    if (!result.ok) {
      setError(t('access.states.interrupted'));
      return;
    }
    router.replace('/access/parent/sign-in');
  }, [
    cancelParentVerification,
    childCount,
    familyConnections,
    familyName,
    locale,
    router,
    t,
    updateParentOnboardingDraft,
  ]);

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
      if (plusPreviewVisible) {
        closePlusPreview();
        return true;
      }
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [closePlusPreview, goBack, parentOnboarding.status, plusPreviewVisible]);

  if (parentOnboarding.status === 'verified' && parentOnboarding.completionReceipt) {
    return <Redirect href="/access/parent/verification" />;
  }
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
    const validatedConnections = validateCompleteFamilyConnectionDirectory(familyConnections);
    if (busy || relativeEditorOpen || !validateName() || !validatedConnections.ok) return;

    setBusy(true);
    const result = updateParentOnboardingDraft({
      appLanguage: locale,
      childCount: Number(childCount) as 1 | 2,
      familyConnections: validatedConnections.data,
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
  const familyConnectionsValid = validateCompleteFamilyConnectionDirectory(familyConnections).ok;

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
            disabled={familyName.trim().length < 2 || !familyConnectionsValid || relativeEditorOpen}
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
          progressLabel={t('access.setup.progress', {
            step: 1,
            total: Number(childCount) + 2,
          })}
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
      {localFamily.status === 'unavailable' ? (
        <StatusBanner
          direction={direction}
          language={locale}
          message={t('access.states.localDataUnavailable')}
          tone="error"
        />
      ) : null}

      <View style={styles.form}>
        <FamilyPeopleEditor
          direction={direction}
          directory={familyConnections}
          disabled={busy}
          language={locale}
          onChange={setFamilyConnections}
          onEditingChange={setRelativeEditorOpen}
        />

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
        <View style={styles.capacityGroup}>
          <SegmentedControl
            accessibilityLabel={t('access.setup.childCount')}
            direction={direction}
            disabled={busy}
            label={t('access.setup.childCount')}
            language={locale}
            onChange={(value) => {
              setChildCount(value);
              updateParentOnboardingDraft({ childCount: Number(value) as 1 | 2 });
            }}
            options={[
              { value: '1', label: t('access.setup.oneChild') },
              { value: '2', label: t('access.setup.twoChildren') },
            ]}
            testID="family-child-count"
            value={childCount}
          />
          <Pressable
            accessibilityLabel={t('access.setup.plusAccessibilityLabel')}
            accessibilityRole="button"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={() => setPlusPreviewVisible(true)}
            ref={plusTriggerRef}
            style={({ pressed }) => [
              styles.plusTrigger,
              { flexDirection: logicalRowDirection(direction) },
              pressed ? styles.plusTriggerPressed : null,
            ]}
            testID="family-plus-capacity-trigger"
          >
            <View style={styles.plusTriggerIcon}>
              <GhafIcon color={colors.tertiary} direction={direction} name="lock" size={22} />
            </View>
            <View style={styles.plusTriggerCopy}>
              <View
                style={[
                  styles.plusTriggerHeading,
                  { flexDirection: logicalRowDirection(direction) },
                ]}
              >
                <Text
                  brand
                  color="deepForest"
                  direction={direction}
                  language={locale}
                  style={styles.plusTriggerTitle}
                  tabular
                  variant="label"
                >
                  {t('access.setup.plusCapacity')}
                </Text>
                <View style={styles.plusPill}>
                  <Text
                    brand
                    color="onTertiaryFixed"
                    direction="ltr"
                    language={locale}
                    variant="caption"
                  >
                    {t('access.setup.plusPlanName')}
                  </Text>
                </View>
              </View>
              <Text
                brand
                color="onSurfaceVariant"
                direction={direction}
                language={locale}
                variant="caption"
              >
                {t('access.setup.plusCapacitySummary')}
              </Text>
            </View>
            <GhafIcon color={colors.outline} direction={direction} name="chevron" size={22} />
          </Pressable>
        </View>
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
            disabled={busy}
            language={locale}
            onChange={setRememberParentOnThisDevice}
            selected={rememberParentOnThisDevice}
            title={t('access.verification.rememberDeviceTitle')}
          />
        )}
        <InfoRow
          direction={direction}
          icon="sparkle"
          language={locale}
          message={t('access.setup.setupSequence')}
          tone="primary"
        />
      </View>
      <FamilyPlusPreview
        direction={direction}
        language={locale}
        onDismiss={closePlusPreview}
        visible={plusPreviewVisible}
      />
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
  capacityGroup: {
    gap: spacing.sm,
  },
  privacyCopy: {
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.xxs,
  },
  plusTrigger: {
    minHeight: 76,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.solarAmberBorder,
    backgroundColor: colors.solarAmberTint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  plusTriggerPressed: {
    opacity: opacity.pressed,
    backgroundColor: colors.tertiaryFixed,
  },
  plusTriggerIcon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
    backgroundColor: colors.tertiaryFixed,
  },
  plusTriggerCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  plusTriggerHeading: {
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  plusTriggerTitle: {
    flexShrink: 1,
  },
  plusPill: {
    minHeight: 28,
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.tertiaryFixed,
    paddingHorizontal: spacing.sm,
  },
});
