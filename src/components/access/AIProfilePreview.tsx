import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AssistantIdentity } from '@/components/AssistantIdentity';
import { Text } from '@/components/primitives';
import {
  colors,
  logicalRowDirection,
  r001Radii,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';
import { createPreparedProfilePersonalization } from '@/features/assistants/profilePersonalization';
import type { ParentOnboardingChildDraft } from '@/models/parentOnboarding';

export function AIProfilePreview({
  child,
  direction,
  language,
}: {
  readonly child: ParentOnboardingChildDraft;
  readonly direction: LayoutDirection;
  readonly language: TypographyLanguage;
}) {
  const { t } = useTranslation();
  const result = createPreparedProfilePersonalization({
    ageBand: child.ageBand,
    sex: child.sex,
    interests: child.interests,
    hobbies: child.hobbies,
    accessibilityDefaults: child.accessibilityDefaults,
    supportPreferences: child.supportPreferences,
    customInterest: child.customInterest,
    customHobby: child.customHobby,
    customSupportPreference: child.customSupportPreference,
    customAccessibility: child.customAccessibility,
    personalizationEnabled: child.personalizationEnabled,
  });
  if (!result.ok) return null;

  const categoryLabels: Readonly<Record<string, string>> = {
    green_impact: t('access.setup.aiCategoryGreen'),
    learning_wellbeing: t('access.setup.aiCategoryLearning'),
    home_responsibility: t('access.setup.aiCategoryHome'),
    kindness_community: t('access.setup.aiCategoryKindness'),
  };

  return (
    <View
      accessibilityLabel={t('access.setup.aiPreviewTitle')}
      style={styles.card}
      testID="ai-profile-preview"
    >
      <AssistantIdentity
        description={t('access.setup.aiDisclosure')}
        direction={direction}
        language={language}
        origin="prepared"
        originLabel={t('origin.prepared')}
        testID="profile-assistant-identity"
        title={t('access.setup.aiPreviewTitle')}
      />
      {result.data.enabled ? (
        <View style={styles.details}>
          <View style={styles.detail} testID="profile-address-form">
            <Text
              brand
              color="onSurfaceVariant"
              direction={direction}
              language={language}
              variant="caption"
            >
              {t('access.setup.aiAddressingLabel')}
            </Text>
            <Text
              brand
              color="deepForest"
              direction={direction}
              language={language}
              variant="label"
            >
              {t(`access.setup.aiAddressForm.${result.data.addressForm}`)}
            </Text>
          </View>
          <View style={styles.detail} testID="profile-support-style">
            <Text
              brand
              color="onSurfaceVariant"
              direction={direction}
              language={language}
              variant="caption"
            >
              {t('access.setup.aiSupportStyleLabel')}
            </Text>
            <Text
              brand
              color="deepForest"
              direction={direction}
              language={language}
              variant="label"
            >
              {t(`access.setup.aiStyle.${result.data.coachingStyle}`)}
            </Text>
          </View>
          <View style={styles.detail} testID="profile-starting-categories">
            <Text
              brand
              color="onSurfaceVariant"
              direction={direction}
              language={language}
              variant="caption"
            >
              {t('access.setup.aiStartingPointsLabel')}
            </Text>
            <View style={[styles.categories, { flexDirection: logicalRowDirection(direction) }]}>
              {result.data.recommendedCategoryIds.map((id) => (
                <View key={id} style={styles.categoryChip}>
                  <Text
                    brand
                    color="primary"
                    direction={direction}
                    language={language}
                    variant="caption"
                  >
                    {categoryLabels[id]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <Text brand color="onSurfaceVariant" direction={direction} language={language}>
          {t('access.setup.aiPreviewDisabled')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.ghafEmeraldTint,
    padding: spacing.md,
  },
  details: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  detail: {
    gap: spacing.xxs,
  },
  categories: {
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: spacing.xxs,
  },
  categoryChip: {
    minHeight: 32,
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
});
