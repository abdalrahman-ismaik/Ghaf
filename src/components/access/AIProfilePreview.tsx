import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { createPreparedProfilePersonalization } from '@/features/assistants/profilePersonalization';
import type { ParentOnboardingChildDraft } from '@/models/parentOnboarding';
import {
  colors,
  r001Radii,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';
import { Row, Text } from '@/components/primitives';

import { GhafIcon } from './GhafIcon';

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
    interests: child.interests,
    hobbies: child.hobbies,
    accessibilityDefaults: child.accessibilityDefaults,
    supportPreferences: child.supportPreferences,
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
      <Row align="flex-start" direction={direction} gap={spacing.sm}>
        <View style={styles.icon}>
          <GhafIcon color={colors.ghafEmerald} direction={direction} name="sparkle" size={22} />
        </View>
        <View style={styles.copy}>
          <Text brand color="ghafEmerald" direction={direction} language={language} variant="label">
            {t('access.setup.aiPreviewTitle')}
          </Text>
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={language}
            variant="caption"
          >
            {result.data.enabled
              ? t('access.setup.aiPreviewBody', {
                  style: t(`access.setup.aiStyle.${result.data.coachingStyle}`),
                  categories: result.data.recommendedCategoryIds
                    .map((id) => categoryLabels[id])
                    .join(language === 'ar' ? '، ' : ', '),
                })
              : t('access.setup.aiPreviewDisabled')}
          </Text>
        </View>
      </Row>
      <Text brand color="inkMuted" direction={direction} language={language} variant="caption">
        {t('access.setup.aiDisclosure')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.ghafEmeraldTint,
    padding: spacing.md,
  },
  icon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLowest,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
});
