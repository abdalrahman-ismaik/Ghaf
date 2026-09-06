import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AgeBand } from '@/models/familyGrowth';
import type {
  BasicAccessibilityDefault,
  ChildPreferredLanguage,
  ChildTreeAvatarId,
  LocalChildGender,
  LocalChildHobby,
  LocalChildInterest,
  LocalSupportPreference,
  ParentOnboardingChildDraft,
} from '@/models/parentOnboarding';
import {
  logicalRowDirection,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';
import { Text } from '@/components/primitives';

import { AccessTextField, ChoiceChip, SegmentedControl } from './AccessControls';
import { AIProfilePreview } from './AIProfilePreview';
import { BotanicalAvatarPicker } from './BotanicalAvatar';

type GenderChoice = LocalChildGender | 'not_selected';

interface ChildProfileFormProps {
  readonly child: ParentOnboardingChildDraft;
  readonly direction: LayoutDirection;
  readonly disabled: boolean;
  readonly errorText?: string;
  readonly language: TypographyLanguage;
  readonly onLimitReached: () => void;
  readonly onPatch: (patch: Partial<ParentOnboardingChildDraft>) => void;
  readonly onValidateName: () => void;
}

function toggleValue<Value extends string>(
  values: readonly Value[],
  value: Value,
  maximum: number,
  onLimitReached: () => void,
): readonly Value[] {
  if (values.includes(value)) return values.filter((item) => item !== value);
  if (values.length >= maximum) {
    onLimitReached();
    return values;
  }
  return [...values, value];
}

export function ChildProfileForm({
  child,
  direction,
  disabled,
  errorText,
  language,
  onLimitReached,
  onPatch,
  onValidateName,
}: ChildProfileFormProps) {
  const { t } = useTranslation();
  const avatarLabels: Readonly<Record<ChildTreeAvatarId, string>> = {
    ghaf_tree: t('access.setup.avatarGhaf'),
    leaf: t('access.setup.avatarLeaf'),
    flower: t('access.setup.avatarFlower'),
    energy_leaf: t('access.setup.avatarEnergyLeaf'),
    water_drop: t('access.setup.avatarWaterDrop'),
  };
  const ageOptions = [
    { value: '6_8', label: t('access.setup.ageSixEight') },
    { value: '9_11', label: t('access.setup.ageNineEleven') },
    { value: '12_14', label: t('access.setup.ageTwelveFourteen') },
  ] satisfies readonly { value: AgeBand; label: string }[];
  const languageOptions = [
    { value: 'ar', label: t('language.arabic') },
    { value: 'en', label: t('language.english') },
    { value: 'both', label: t('access.setup.bothLanguages') },
  ] satisfies readonly { value: ChildPreferredLanguage; label: string }[];
  const genderOptions = [
    { value: 'not_selected', label: t('access.setup.notNow') },
    { value: 'boy', label: t('access.setup.genderBoy') },
    { value: 'girl', label: t('access.setup.genderGirl') },
    { value: 'prefer_not_to_say', label: t('access.setup.genderPreferNot') },
  ] satisfies readonly { value: GenderChoice; label: string }[];
  const interests = [
    ['nature', 'access.setup.interestNature'],
    ['making', 'access.setup.interestMaking'],
    ['stories', 'access.setup.interestStories'],
    ['family_helping', 'access.setup.interestFamily'],
    ['sustainability', 'access.setup.interestSustainability'],
  ] as const;
  const hobbies = [
    ['drawing', 'access.setup.hobbyDrawing'],
    ['reading', 'access.setup.hobbyReading'],
    ['sports', 'access.setup.hobbySports'],
    ['puzzles', 'access.setup.hobbyPuzzles'],
    ['gardening', 'access.setup.hobbyGardening'],
  ] as const;
  const support = [
    ['short_steps', 'access.setup.supportShort'],
    ['visual_examples', 'access.setup.supportVisual'],
    ['extra_time', 'access.setup.supportTime'],
    ['adult_alongside', 'access.setup.supportAdult'],
    ['quiet_reminders', 'access.setup.supportQuiet'],
  ] as const;
  const accessibility = [
    ['larger_text', 'access.setup.largerText'],
    ['simpler_instructions', 'access.setup.simplerInstructions'],
    ['high_contrast', 'access.setup.highContrast'],
    ['reduced_motion', 'access.setup.reducedMotion'],
  ] as const;

  const multiChoice = <Value extends string>(
    label: string,
    hint: string,
    options: readonly (readonly [Value, string])[],
    values: readonly Value[],
    maximum: number,
    update: (next: readonly Value[]) => void,
    testID: string,
  ) => (
    <View style={styles.fieldGroup}>
      <Text brand direction={direction} language={language} variant="label">
        {label}
      </Text>
      <Text brand color="inkMuted" direction={direction} language={language} variant="caption">
        {hint}
      </Text>
      <View style={[styles.chipRow, { flexDirection: logicalRowDirection(direction) }]}>
        {options.map(([value, key]) => (
          <ChoiceChip
            direction={direction}
            disabled={disabled}
            key={value}
            label={t(key)}
            language={language}
            onPress={() => update(toggleValue(values, value, maximum, onLimitReached))}
            selected={values.includes(value)}
            testID={`${testID}-${value}`}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.form}>
      <AccessTextField
        accessibilityLabel={t('access.setup.childNameLabel')}
        autoCapitalize="words"
        autoCorrect={false}
        direction="auto"
        editable={!disabled}
        errorText={errorText}
        label={t('access.setup.childNameLabel')}
        language={language}
        maxLength={40}
        onBlur={onValidateName}
        onChangeText={(nickname) => onPatch({ nickname })}
        placeholder={t('access.setup.childNamePlaceholder')}
        returnKeyType="done"
        testID="child-name-input"
        value={child.nickname}
      />
      <BotanicalAvatarPicker
        direction={direction}
        disabled={disabled}
        label={t('access.setup.chooseAvatar')}
        labels={avatarLabels}
        language={language}
        onChange={(avatarId) => onPatch({ avatarId })}
        testID="child-avatar"
        value={child.avatarId}
      />
      <SegmentedControl
        direction={direction}
        disabled={disabled}
        label={t('access.setup.ageBand')}
        language={language}
        onChange={(ageBand) => onPatch({ ageBand })}
        options={ageOptions}
        testID="child-age-band"
        value={child.ageBand}
      />
      <SegmentedControl
        direction={direction}
        disabled={disabled}
        label={t('access.setup.preferredLanguage')}
        language={language}
        onChange={(preferredLanguage) => onPatch({ preferredLanguage })}
        options={languageOptions}
        testID="child-preferred-language"
        value={child.preferredLanguage}
      />
      <SegmentedControl
        direction={direction}
        disabled={disabled}
        label={t('access.setup.genderOptional')}
        language={language}
        onChange={(gender) => onPatch({ gender: gender === 'not_selected' ? null : gender })}
        options={genderOptions}
        testID="child-gender"
        value={child.gender ?? 'not_selected'}
      />
      <Text brand color="inkMuted" direction={direction} language={language} variant="caption">
        {t('access.setup.genderBoundary')}
      </Text>
      {multiChoice<LocalChildInterest>(
        t('access.setup.interests'),
        t('access.setup.chooseUpToThree'),
        interests,
        child.interests,
        3,
        (values) => onPatch({ interests: values }),
        'child-interest',
      )}
      {multiChoice<LocalChildHobby>(
        t('access.setup.hobbies'),
        t('access.setup.chooseUpToThree'),
        hobbies,
        child.hobbies,
        3,
        (values) => onPatch({ hobbies: values }),
        'child-hobby',
      )}
      {multiChoice<LocalSupportPreference>(
        t('access.setup.supportPreferences'),
        t('access.setup.chooseUpToThree'),
        support,
        child.supportPreferences,
        3,
        (values) => onPatch({ supportPreferences: values }),
        'child-support',
      )}
      {multiChoice<BasicAccessibilityDefault>(
        t('access.setup.accessibility'),
        t('access.setup.accessibilityHint'),
        accessibility,
        child.accessibilityDefaults,
        4,
        (values) => onPatch({ accessibilityDefaults: values }),
        'child-accessibility',
      )}
      <SegmentedControl
        direction={direction}
        disabled={disabled}
        label={t('access.setup.aiPersonalization')}
        language={language}
        onChange={(value) => onPatch({ personalizationEnabled: value === 'enabled' })}
        options={[
          { value: 'enabled', label: t('access.setup.aiEnabled') },
          { value: 'disabled', label: t('access.setup.aiDisabled') },
        ]}
        testID="child-ai-personalization"
        value={child.personalizationEnabled ? 'enabled' : 'disabled'}
      />
      <AIProfilePreview child={child} direction={direction} language={language} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xxl },
  fieldGroup: { gap: spacing.xs },
  chipRow: { flexWrap: 'wrap', gap: spacing.xs },
});
