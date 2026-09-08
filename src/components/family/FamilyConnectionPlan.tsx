import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafIcon } from '@/components/access';
import { Row, Text } from '@/components/primitives';
import { R003Section } from '@/components/r003';
import {
  colors,
  logicalRowDirection,
  r001Radii,
  spacing,
  type LayoutDirection,
} from '@/design/tokens';
import type { LocaleCode } from '@/models/familyGrowth';
import type {
  FamilyConnectionIdeaKind,
  FamilyConnectionPlan as FamilyConnectionPlanModel,
  FamilyConnectionRhythm,
} from '@/models/familyConnections';

export interface FamilyConnectionPlanProps {
  readonly direction: LayoutDirection;
  readonly language: LocaleCode;
  readonly plan: FamilyConnectionPlanModel;
}

function rhythmKey(value: FamilyConnectionRhythm): string {
  if (value === 'every_three_months') return 'everyThreeMonths';
  if (value === 'no_schedule') return 'noSchedule';
  return value;
}

function ideaKey(value: FamilyConnectionIdeaKind): string {
  const keys: Readonly<Record<FamilyConnectionIdeaKind, string>> = {
    visit_or_call: 'visitOrCall',
    family_story: 'familyStory',
    safe_help: 'safeHelp',
    thank_you_message: 'thankYouMessage',
    phone_free_moment: 'phoneFreeMoment',
  };
  return keys[value];
}

function isolateFamilyName(value: string): string {
  return '\u2068' + value + '\u2069';
}

export function FamilyConnectionPlan({ direction, language, plan }: FamilyConnectionPlanProps) {
  const { t } = useTranslation();

  return (
    <R003Section testID="family-connection-plan" title={t('r003.family.connectionsTitle')}>
      <Text brand color="onSurfaceVariant" direction={direction} language={language} variant="body">
        {t('r003.family.connectionsBody')}
      </Text>
      <Row align="flex-start" direction={direction} gap={spacing.sm}>
        <View style={styles.guardianIcon}>
          <GhafIcon color={colors.ghafEmerald} direction={direction} name="person" size={20} />
        </View>
        <Text
          brand
          color="deepForest"
          direction={direction}
          language={language}
          style={styles.flexCopy}
          variant="label"
        >
          {t('r003.family.connectionGuardians', {
            names: plan.guardianDisplayNames
              .map(isolateFamilyName)
              .join(language === 'ar' ? '، ' : ', '),
          })}
        </Text>
      </Row>

      <View style={styles.entries}>
        {plan.entries.map((entry, index) => (
          <View
            key={entry.relativeId}
            style={[styles.entry, index === plan.entries.length - 1 ? styles.lastEntry : null]}
            testID={'family-connection-' + entry.relativeId}
          >
            <Row align="flex-start" direction={direction} gap={spacing.sm}>
              <View style={styles.relativeIcon}>
                <GhafIcon
                  color={colors.ghafEmerald}
                  direction={direction}
                  name="family"
                  size={22}
                />
              </View>
              <View style={styles.entryCopy}>
                <Text brand direction="auto" language={language} variant="control">
                  {isolateFamilyName(entry.displayName)}
                </Text>
                <Text
                  brand
                  color="onSurfaceVariant"
                  direction={direction}
                  language={language}
                  variant="caption"
                >
                  {t('access.setup.relationship.' + entry.relationship)} ·{' '}
                  {t('access.setup.rhythm.' + rhythmKey(entry.rhythm))}
                </Text>
              </View>
            </Row>
            <Text
              brand
              color="deepForest"
              direction={direction}
              language={language}
              variant="title"
            >
              {t('r003.family.connectionIdeas.' + ideaKey(entry.ideaKind), {
                name: isolateFamilyName(entry.displayName),
              })}
            </Text>
            <Text
              brand
              color="onSurfaceVariant"
              direction={direction}
              language={language}
              variant="caption"
            >
              {t('r003.family.connectionAlternative')}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.boundary, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon
          color={colors.onSecondaryFixedVariant}
          direction={direction}
          name="shield"
          size={20}
        />
        <Text
          brand
          direction={direction}
          language={language}
          style={styles.boundaryCopy}
          variant="caption"
        >
          {t('r003.family.connectionBoundary')}
        </Text>
      </View>
    </R003Section>
  );
}

const styles = StyleSheet.create({
  guardianIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.primaryFixedTint,
  },
  flexCopy: {
    minWidth: 0,
    flex: 1,
  },
  entries: {
    gap: spacing.md,
  },
  entry: {
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceContainerHigh,
    paddingVertical: spacing.md,
  },
  lastEntry: {
    borderBottomWidth: 0,
  },
  relativeIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.primaryFixedTint,
  },
  entryCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  boundary: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.secondaryTint,
    padding: spacing.md,
  },
  boundaryCopy: {
    minWidth: 0,
    flex: 1,
    color: colors.onSecondaryFixedVariant,
  },
});
