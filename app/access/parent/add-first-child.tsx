import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { BackHandler, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessActionRegion,
  AccessHeader,
  AccessScreen,
  AccessTextField,
  BotanicalAvatarPicker,
  ChoiceChip,
  GhafIcon,
  InfoRow,
  StatusBanner,
} from '@/components/access';
import { PrimaryButton, Text } from '@/components/primitives';
import {
  colors,
  layout,
  logicalRowDirection,
  opacity,
  r001Radii,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';
import type { AgeBand } from '@/models/familyGrowth';
import type {
  BasicAccessibilityDefault,
  ChildPreferredLanguage,
  ChildTreeAvatarId,
} from '@/models/parentOnboarding';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface RadioOption<Value extends string> {
  readonly direction?: LayoutDirection;
  readonly label: string;
  readonly value: Value;
}

function RadioPillGroup<Value extends string>({
  direction,
  disabled,
  label,
  language,
  onChange,
  options,
  testID,
  value,
}: {
  direction: LayoutDirection;
  disabled: boolean;
  label: string;
  language: TypographyLanguage;
  onChange: (value: Value) => void;
  options: readonly RadioOption<Value>[];
  testID: string;
  value: Value;
}) {
  const [focusedValue, setFocusedValue] = useState<Value | null>(null);

  return (
    <View style={styles.fieldGroup}>
      <Text brand direction={direction} language={language} variant="label">
        {label}
      </Text>
      <View
        accessibilityLabel={label}
        accessibilityRole="radiogroup"
        style={[styles.pillRow, { flexDirection: logicalRowDirection(direction) }]}
        testID={testID}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              aria-checked={selected}
              disabled={disabled}
              key={option.value}
              onBlur={() => setFocusedValue(null)}
              onFocus={() => setFocusedValue(option.value)}
              onPress={() => onChange(option.value)}
              pressRetentionOffset={spacing.sm}
              style={({ pressed }) => [
                styles.radioPill,
                selected ? styles.radioPillSelected : null,
                focusedValue === option.value ? styles.focused : null,
                pressed && !disabled ? styles.pressed : null,
                disabled ? styles.disabled : null,
              ]}
              testID={`${testID}-${option.value}`}
            >
              <Text
                align="center"
                brand
                color={selected ? 'ghafEmerald' : 'onSurfaceVariant'}
                direction={option.direction ?? direction}
                language={language}
                tabular
                variant="label"
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function AddFirstChildScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const updateParentOnboardingDraft = usePrototypeStore(
    (state) => state.updateParentOnboardingDraft,
  );
  const [nickname, setNickname] = useState(parentOnboarding.draft.child.nickname);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const updateChild = useCallback(
    (
      patch: Partial<{
        nickname: string;
        avatarId: ChildTreeAvatarId;
        ageBand: AgeBand;
        preferredLanguage: ChildPreferredLanguage;
        accessibilityDefaults: readonly BasicAccessibilityDefault[];
      }>,
    ) => {
      const result = updateParentOnboardingDraft({ child: patch });
      if (!result.ok) setError(t('access.states.interrupted'));
      return result.ok;
    },
    [t, updateParentOnboardingDraft],
  );

  const goBack = useCallback(() => {
    updateChild({ nickname });
    router.replace('/access/parent/family-basics');
  }, [nickname, router, updateChild]);

  const familyIsValid = parentOnboarding.draft.familyName.trim().length >= 2;
  const child = parentOnboarding.draft.child;

  useEffect(() => {
    if (parentOnboarding.status === 'signed_out') {
      router.replace('/access/parent/sign-in');
    } else if (parentOnboarding.status === 'code_sent' || parentOnboarding.status === 'verifying') {
      router.replace('/access/parent/verification');
    } else if (parentOnboarding.status === 'authenticated_parent') {
      router.replace('/parent');
    } else if (parentOnboarding.status === 'verified' && !familyIsValid) {
      router.replace('/access/parent/family-basics');
    }
  }, [familyIsValid, parentOnboarding.status, router]);

  useEffect(() => {
    if (Platform.OS !== 'android' || parentOnboarding.status !== 'verified') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [goBack, parentOnboarding.status]);

  if (parentOnboarding.status !== 'verified' || !familyIsValid) return null;

  const toggleAccessibility = (option: BasicAccessibilityDefault) => {
    setError(null);
    const next = child.accessibilityDefaults.includes(option)
      ? child.accessibilityDefaults.filter((item) => item !== option)
      : [...child.accessibilityDefaults, option];
    updateChild({ accessibilityDefaults: next });
  };

  const validateName = () => {
    const valid = nickname.trim().length >= 2;
    setError(valid ? null : t('access.setup.childNameError'));
    return valid;
  };

  const continueSetup = () => {
    if (busy || !validateName()) return;
    setBusy(true);
    if (!updateChild({ nickname: nickname.trim() })) {
      setBusy(false);
      return;
    }
    requestAnimationFrame(() => router.replace('/access/parent/review-create'));
  };

  const avatarLabels: Readonly<Record<ChildTreeAvatarId, string>> = {
    ghaf_tree: t('access.setup.avatarGhaf'),
    leaf: t('access.setup.avatarLeaf'),
    flower: t('access.setup.avatarFlower'),
    energy_leaf: t('access.setup.avatarEnergyLeaf'),
    water_drop: t('access.setup.avatarWaterDrop'),
  };
  const ageOptions: readonly RadioOption<AgeBand>[] = [
    { value: '6_8', label: t('access.setup.ageSixEight'), direction: 'ltr' },
    { value: '9_11', label: t('access.setup.ageNineEleven'), direction: 'ltr' },
    { value: '12_14', label: t('access.setup.ageTwelveFourteen'), direction: 'ltr' },
  ];
  const languageOptions: readonly RadioOption<ChildPreferredLanguage>[] = [
    { value: 'ar', label: t('language.arabic'), direction: locale === 'ar' ? 'rtl' : 'ltr' },
    { value: 'en', label: t('language.english'), direction: 'ltr' },
    { value: 'both', label: t('access.setup.bothLanguages') },
  ];
  const accessibilityOptions: readonly {
    icon: ReactNode;
    label: string;
    value: BasicAccessibilityDefault;
  }[] = [
    {
      value: 'larger_text',
      label: t('access.setup.largerText'),
      icon: (
        <GhafIcon color={colors.ghafEmerald} direction={direction} name="large-text" size={18} />
      ),
    },
    {
      value: 'simpler_instructions',
      label: t('access.setup.simplerInstructions'),
      icon: <GhafIcon color={colors.ghafEmerald} direction={direction} name="simple" size={18} />,
    },
    {
      value: 'high_contrast',
      label: t('access.setup.highContrast'),
      icon: <GhafIcon color={colors.ghafEmerald} direction={direction} name="contrast" size={18} />,
    },
    {
      value: 'reduced_motion',
      label: t('access.setup.reducedMotion'),
      icon: <GhafIcon color={colors.ghafEmerald} direction={direction} name="motion" size={18} />,
    },
  ];

  return (
    <AccessScreen
      background="organic"
      footer={
        <AccessActionRegion
          direction={direction}
          language={locale}
          supportingText={t('access.setup.origin')}
        >
          <InfoRow
            direction={direction}
            icon="shield"
            language={locale}
            message={t('access.setup.noChildContact')}
            tone="primary"
          />
          <PrimaryButton
            brand
            busy={busy}
            busyLabel={t('access.setup.continue')}
            direction={direction}
            disabled={nickname.trim().length < 2}
            language={locale}
            onPress={continueSetup}
            size="regular"
            testID="add-child-continue"
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
          progressLabel={t('access.setup.progress', { step: 2, total: 3 })}
        />
      }
      keyboardAware
      testID="add-first-child-screen"
    >
      <View style={styles.heading}>
        <Text brand color="ghafEmerald" direction={direction} language={locale} variant="hero">
          {t('access.setup.childTitle')}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} language={locale} variant="body">
          {t('access.setup.childBody')}
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
          accessibilityLabel={t('access.setup.childNameLabel')}
          autoCapitalize="words"
          autoCorrect={false}
          direction="auto"
          editable={!busy}
          errorText={error ?? undefined}
          label={t('access.setup.childNameLabel')}
          language={locale}
          maxLength={40}
          onBlur={validateName}
          onChangeText={(value) => {
            setNickname(value);
            if (error && value.trim().length >= 2) setError(null);
          }}
          onSubmitEditing={continueSetup}
          placeholder={t('access.setup.childNamePlaceholder')}
          returnKeyType="done"
          testID="child-name-input"
          value={nickname}
        />

        <BotanicalAvatarPicker
          direction={direction}
          disabled={busy}
          label={t('access.setup.chooseAvatar')}
          labels={avatarLabels}
          language={locale}
          onChange={(avatarId) => updateChild({ avatarId })}
          testID="child-avatar"
          value={child.avatarId}
        />

        <RadioPillGroup
          direction={direction}
          disabled={busy}
          label={t('access.setup.ageBand')}
          language={locale}
          onChange={(ageBand) => updateChild({ ageBand })}
          options={ageOptions}
          testID="child-age-band"
          value={child.ageBand}
        />

        <RadioPillGroup
          direction={direction}
          disabled={busy}
          label={t('access.setup.preferredLanguage')}
          language={locale}
          onChange={(preferredLanguage) => updateChild({ preferredLanguage })}
          options={languageOptions}
          testID="child-preferred-language"
          value={child.preferredLanguage}
        />

        <View style={styles.fieldGroup}>
          <Text brand direction={direction} language={locale} variant="label">
            {t('access.setup.accessibility')}
          </Text>
          <View style={[styles.chipRow, { flexDirection: logicalRowDirection(direction) }]}>
            {accessibilityOptions.map((option) => (
              <ChoiceChip
                direction={direction}
                disabled={busy}
                icon={option.icon}
                key={option.value}
                label={option.label}
                language={locale}
                onPress={() => toggleAccessibility(option.value)}
                selected={child.accessibilityDefaults.includes(option.value)}
                testID={`child-accessibility-${option.value}`}
              />
            ))}
            <ChoiceChip
              direction={direction}
              disabled={busy}
              label={t('access.setup.notNow')}
              language={locale}
              onPress={() => updateChild({ accessibilityDefaults: [] })}
              selected={child.accessibilityDefaults.length === 0}
              testID="child-accessibility-none"
            />
          </View>
        </View>
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
  fieldGroup: {
    gap: spacing.sm,
  },
  pillRow: {
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  radioPill: {
    flexBasis: 96,
    flexGrow: 1,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
    borderRadius: r001Radii.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  radioPillSelected: {
    borderColor: colors.ghafEmerald,
    borderWidth: 2,
    backgroundColor: colors.ghafEmeraldTint,
  },
  focused: {
    borderColor: colors.solarAmber,
    borderWidth: 2,
  },
  pressed: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: opacity.disabled,
  },
  chipRow: {
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
