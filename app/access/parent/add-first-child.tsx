import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessFooter,
  AccessHeader,
  AccessScreen,
  BotanicalAvatarPicker,
  ChoiceChip,
  GhafIcon,
  SegmentedControl,
  type BotanicalAvatarId,
} from '@/components/access';
import { Button, Input, Text } from '@/components/primitives';
import { colors, spacing } from '@/design/tokens';
import type {
  AgeBand,
  BasicAccessibilityDefault,
  ChildPreferredLanguage,
  ChildTreeAvatarId,
} from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const PICKER_TO_DRAFT: Record<BotanicalAvatarId, ChildTreeAvatarId> = {
  'ghaf-tree': 'ghaf_tree',
  leaf: 'leaf',
  flower: 'flower',
  'energy-leaf': 'energy_leaf',
  'water-drop': 'water_drop',
};

const DRAFT_TO_PICKER: Record<ChildTreeAvatarId, BotanicalAvatarId> = {
  ghaf_tree: 'ghaf-tree',
  leaf: 'leaf',
  flower: 'flower',
  energy_leaf: 'energy-leaf',
  water_drop: 'water-drop',
};

const preferenceIcons = {
  larger_text: 'large-text',
  simpler_instructions: 'simple',
  high_contrast: 'contrast',
  reduced_motion: 'motion',
} as const;

export default function AddFirstChildScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const parentAccess = usePrototypeStore((state) => state.parentAccess);
  const draft = usePrototypeStore((state) => state.parentOnboardingDraft);
  const updateDraft = usePrototypeStore((state) => state.updateParentOnboardingDraft);
  const [nickname, setNickname] = useState(draft.child.nickname);
  const [error, setError] = useState<string | null>(null);

  if (!['verified', 'authenticated_parent'].includes(parentAccess.state)) {
    return <Redirect href="/access/parent/sign-in" />;
  }
  if (draft.familyName.trim().length < 2) {
    return <Redirect href="/access/parent/family-basics" />;
  }

  const updateChild = (patch: Partial<typeof draft.child>) => {
    updateDraft({ child: patch });
  };

  const togglePreference = (value: BasicAccessibilityDefault) => {
    const selected = draft.child.accessibilityDefaults.includes(value);
    updateChild({
      accessibilityDefaults: selected
        ? draft.child.accessibilityDefaults.filter((item) => item !== value)
        : [...draft.child.accessibilityDefaults, value],
    });
  };

  const continueSetup = () => {
    const normalized = nickname.trim();
    if (normalized.length < 2) {
      setError(t('access.setup.childNameError'));
      return;
    }
    updateChild({ nickname: normalized });
    router.push('/access/parent/review-create');
  };

  const accessibilityOptions: readonly {
    label: string;
    value: BasicAccessibilityDefault;
  }[] = [
    { label: t('access.setup.largerText'), value: 'larger_text' },
    { label: t('access.setup.simplerInstructions'), value: 'simpler_instructions' },
    { label: t('access.setup.highContrast'), value: 'high_contrast' },
    { label: t('access.setup.reducedMotion'), value: 'reduced_motion' },
  ];

  return (
    <AccessScreen
      footer={
        <AccessFooter originLabel={t('access.setup.origin')}>
          <View style={styles.privacyNote}>
            <GhafIcon color={colors.ghaf} name="shield" size={19} />
            <Text color="inkMuted" style={styles.privacyCopy} variant="caption">
              {t('access.setup.noChildContact')}
            </Text>
          </View>
          <Button onPress={continueSetup} testID="child-setup-continue-button">
            {t('access.setup.continue')}
          </Button>
        </AccessFooter>
      }
      header={
        <AccessHeader
          backLabel={t('common.back')}
          onBack={() => router.replace('/access/parent/family-basics')}
          step={2}
          title={t('common.brand')}
          totalSteps={3}
        />
      }
      keyboardAware
      testID="add-first-child-screen"
    >
      <View style={styles.heading}>
        <Text color="ghaf" variant="title">
          {t('access.setup.childTitle')}
        </Text>
        <Text color="inkMuted">{t('access.setup.childBody')}</Text>
      </View>

      <Input
        autoCapitalize="words"
        direction="auto"
        errorText={error ?? undefined}
        label={t('access.setup.childNameLabel')}
        onChangeText={(value) => {
          setNickname(value);
          setError(null);
        }}
        onSubmitEditing={continueSetup}
        maxLength={40}
        placeholder={t('access.setup.childNamePlaceholder')}
        returnKeyType="done"
        testID="child-nickname-input"
        value={nickname}
      />

      <BotanicalAvatarPicker
        label={t('access.setup.chooseAvatar')}
        labels={{
          'ghaf-tree': t('access.setup.avatarGhaf'),
          leaf: t('access.setup.avatarLeaf'),
          flower: t('access.setup.avatarFlower'),
          'energy-leaf': t('access.setup.avatarEnergyLeaf'),
          'water-drop': t('access.setup.avatarWaterDrop'),
        }}
        onChange={(value) => updateChild({ avatarId: PICKER_TO_DRAFT[value] })}
        value={DRAFT_TO_PICKER[draft.child.avatarId]}
      />

      <View style={styles.fieldGroup}>
        <Text variant="label">{t('access.setup.ageBand')}</Text>
        <SegmentedControl<AgeBand>
          accessibilityLabel={t('access.setup.ageBand')}
          onChange={(ageBand) => updateChild({ ageBand })}
          options={[
            { label: `\u20666–8\u2069`, value: '6_8' },
            { label: `\u20669–11\u2069`, value: '9_11' },
            { label: `\u206612–14\u2069`, value: '12_14' },
          ]}
          testID="child-age-band"
          value={draft.child.ageBand}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text variant="label">{t('access.setup.preferredLanguage')}</Text>
        <SegmentedControl<ChildPreferredLanguage>
          accessibilityLabel={t('access.setup.preferredLanguage')}
          onChange={(preferredLanguage) => updateChild({ preferredLanguage })}
          options={[
            { label: t('language.arabic'), value: 'ar' },
            { label: t('language.english'), value: 'en' },
            { label: t('access.setup.bothLanguages'), value: 'both' },
          ]}
          testID="child-preferred-language"
          value={draft.child.preferredLanguage}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text variant="label">{t('access.setup.accessibility')}</Text>
        <View style={styles.chips}>
          {accessibilityOptions.map((option) => (
            <ChoiceChip
              icon={
                <GhafIcon
                  color={
                    draft.child.accessibilityDefaults.includes(option.value)
                      ? colors.ghaf
                      : colors.inkMuted
                  }
                  name={preferenceIcons[option.value]}
                  size={18}
                />
              }
              key={option.value}
              label={option.label}
              onPress={() => togglePreference(option.value)}
              selected={draft.child.accessibilityDefaults.includes(option.value)}
              testID={`accessibility-${option.value}`}
            />
          ))}
          <ChoiceChip
            label={t('access.setup.notNow')}
            onPress={() => updateChild({ accessibilityDefaults: [] })}
            selected={draft.child.accessibilityDefaults.length === 0}
            testID="accessibility-none"
          />
        </View>
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: spacing.xs,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  privacyNote: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  privacyCopy: {
    flex: 1,
    minWidth: 0,
  },
});
