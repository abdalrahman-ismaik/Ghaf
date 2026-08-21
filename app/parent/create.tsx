import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  DisclosureCard,
  JourneyHeader,
  PreparedAudioButton,
  PreparedSelectionCard,
  SectionHeading,
} from '@/components/journey';
import { Button, Card, Input, Screen, Text } from '@/components/primitives';
import { formatQuantity } from '@/components/prototype';
import { colors, layout, radii, spacing } from '@/design/tokens';
import {
  missionFormSchema,
  missionFormToInput,
  type MissionFormValues,
  type ParsedMissionFormValues,
} from '@/features/missions/form';
import type { MissionInput, QuantityUnit } from '@/models/prototype';
import { usePrototypeStore } from '@/state/usePrototypeStore';

function toFormValues(input: MissionInput): MissionFormValues {
  return {
    childId: input.childId ?? '',
    foodImageId: input.foodImageId ?? '',
    voiceNoteId: input.voiceNoteId ?? '',
    quantityValue: input.quantity?.value ?? 250,
    quantityUnit: input.quantity?.unit ?? 'grams',
    availableMinutes: input.availableMinutes,
    rewardAr: input.reward?.ar ?? 'ورقة الغاف الذهبية',
    rewardEn: input.reward?.en ?? 'Golden Ghaf Leaf',
  };
}

export default function CreateMissionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const missionInput = usePrototypeStore((state) => state.missionInput);
  const updateMissionInput = usePrototypeStore((state) => state.updateMissionInput);
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<MissionFormValues, unknown, ParsedMissionFormValues>({
    defaultValues: toFormValues(missionInput),
    resolver: zodResolver(missionFormSchema),
  });

  const [childId, foodImageId, voiceNoteId, quantityUnit, rewardAr, rewardEn] = useWatch({
    control,
    name: ['childId', 'foodImageId', 'voiceNoteId', 'quantityUnit', 'rewardAr', 'rewardEn'],
  });
  const selectedChild = childId !== '';
  const selectedImage = foodImageId !== '';
  const selectedVoice = voiceNoteId !== '';
  const selectedVoiceMediaId =
    voiceNoteId === 'family-wisdom-en' ? 'family-wisdom-en' : 'family-wisdom-ar';
  const hasReward = Boolean(rewardAr && rewardEn);

  const chooseUnit = (unit: QuantityUnit) => {
    setValue('quantityUnit', unit, { shouldValidate: true });
    setValue('quantityValue', unit === 'grams' ? 250 : 2, { shouldValidate: true });
  };

  const toggleReward = () => {
    setValue('rewardAr', hasReward ? '' : 'ورقة الغاف الذهبية', { shouldValidate: true });
    setValue('rewardEn', hasReward ? '' : 'Golden Ghaf Leaf', { shouldValidate: true });
  };

  const submit = (values: ParsedMissionFormValues) => {
    const pending = usePrototypeStore.getState();
    if (pending.journeyStatus === 'generating' && pending.generation) {
      pending.cancelGeneration(pending.generation.attemptId);
    }
    const current = usePrototypeStore.getState().missionInput;
    updateMissionInput(
      missionFormToInput(values, {
        id: current.id,
        updatedAt: new Date().toISOString(),
      }),
    );
    const result = usePrototypeStore.getState().startGeneration();
    if (result.ok) router.push('/parent/generating');
  };

  return (
    <Screen keyboardAware testID="parent-create-screen">
      <JourneyHeader
        eyebrow={t('createMission.eyebrow')}
        onBack={() => router.back()}
        subtitle={t('createMission.intro')}
        title={t('createMission.title')}
      />

      <View style={styles.section}>
        <SectionHeading
          detail={t('createMission.ageValue')}
          title={t('createMission.childLabel')}
        />
        <PreparedSelectionCard
          detail={`${t('createMission.childValue')} · ${t('createMission.ageValue')}`}
          label={t('createMission.childLabel')}
          onPress={() => setValue('childId', 'child-salem-demo', { shouldValidate: true })}
          selected={selectedChild}
          testID="select-child-button"
        />
        {errors.childId ? (
          <Text color="danger" variant="caption">
            {t('validation.childRequired')}
          </Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <SectionHeading title={t('createMission.foodImageLabel')} />
        <PreparedSelectionCard
          detail={t('createMission.foodImageValue')}
          label={t('createMission.choosePreparedImage')}
          mediaId="food-rescue-bread"
          onPress={() => setValue('foodImageId', 'food-rescue-bread', { shouldValidate: true })}
          selected={selectedImage}
          testID="prepared-food-button"
        />
        <Text color="inkMuted" variant="caption">
          {t('media.noCamera')}
        </Text>
        {errors.foodImageId ? (
          <Text color="danger" variant="caption">
            {t('validation.imageRequired')}
          </Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <SectionHeading title={t('createMission.voiceNoteLabel')} />
        <PreparedSelectionCard
          detail={t('createMission.voiceNoteValue')}
          label={t('createMission.choosePreparedVoice')}
          onPress={() =>
            setValue('voiceNoteId', `family-wisdom-${locale}`, { shouldValidate: true })
          }
          selected={selectedVoice}
          testID="prepared-wisdom-button"
        />
        {selectedVoice ? (
          <PreparedAudioButton
            label={t('media.playVoice')}
            playingLabel={t('media.stopAudio')}
            mediaId={selectedVoiceMediaId}
            testID="play-family-wisdom-button"
          />
        ) : null}
        <Text color="inkMuted" variant="caption">
          {t('media.noRecording')}
        </Text>
        {errors.voiceNoteId ? (
          <Text color="danger" variant="caption">
            {t('validation.voiceRequired')}
          </Text>
        ) : null}
      </View>

      <Card style={styles.formCard}>
        <SectionHeading title={t('createMission.quantityLabel')} />
        <View style={styles.unitRow}>
          {(['grams', 'portions'] as const).map((unit) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: quantityUnit === unit }}
              key={unit}
              onPress={() => chooseUnit(unit)}
              style={({ pressed }) => [
                styles.unitButton,
                quantityUnit === unit ? styles.unitButtonSelected : null,
                pressed ? styles.pressed : null,
              ]}
              testID={`quantity-unit-${unit}`}
            >
              <Text
                align="center"
                color={quantityUnit === unit ? 'white' : 'forest'}
                variant="label"
              >
                {unit === 'grams'
                  ? formatQuantity({ value: 250, unit: 'grams' }, locale, t)
                  : formatQuantity({ value: 2, unit: 'portions' }, locale, t)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Controller
          control={control}
          name="quantityValue"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input
              errorText={errors.quantityValue ? t('validation.quantityRange') : undefined}
              keyboardType="number-pad"
              label={t('createMission.quantityLabel')}
              onBlur={onBlur}
              onChangeText={onChange}
              testID="quantity-input"
              value={String(value ?? '')}
            />
          )}
        />
        <Controller
          control={control}
          name="availableMinutes"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input
              errorText={errors.availableMinutes ? t('validation.timeRange') : undefined}
              keyboardType="number-pad"
              label={t('createMission.timeLabel')}
              onBlur={onBlur}
              onChangeText={onChange}
              testID="available-minutes-input"
              value={String(value ?? '')}
            />
          )}
        />
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: hasReward }}
          onPress={toggleReward}
          style={({ pressed }) => [
            styles.rewardBlock,
            hasReward ? styles.rewardBlockSelected : null,
            pressed ? styles.pressed : null,
          ]}
          testID="symbolic-reward-button"
        >
          <View style={styles.rewardCopy}>
            <Text color="forest" variant="label">
              {t('createMission.rewardLabel')}
            </Text>
            <Text color="earth">
              {hasReward ? t('createMission.rewardValue') : t('common.optional')}
            </Text>
            <Text color="inkMuted" variant="caption">
              {t('createMission.rewardDisclosure')}
            </Text>
          </View>
          <View style={[styles.rewardCheck, hasReward ? styles.rewardCheckSelected : null]}>
            <Text align="center" color={hasReward ? 'white' : 'inkMuted'} variant="caption">
              {hasReward ? '✓' : '+'}
            </Text>
          </View>
        </Pressable>
      </Card>

      <DisclosureCard body={t('createMission.safetyNote')} kind="safety" />

      <Button onPress={handleSubmit(submit)} testID="generate-mission-button">
        {t('createMission.generate')}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  formCard: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  unitRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  unitButton: {
    minHeight: layout.touchTarget,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
  },
  unitButtonSelected: {
    borderColor: colors.ghaf,
    backgroundColor: colors.ghaf,
  },
  rewardBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.goldLight,
    backgroundColor: colors.goldGlow,
    padding: spacing.md,
  },
  rewardBlockSelected: {
    borderColor: colors.gold,
  },
  rewardCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xs,
  },
  rewardCheck: {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  rewardCheckSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.ghaf,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
