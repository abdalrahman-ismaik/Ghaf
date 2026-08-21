import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card, Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import type { ImpactSummary, LocaleCode, MissionSummary, PrototypeRole } from '@/models/prototype';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const numberFormatters: Record<LocaleCode, Intl.NumberFormat> = {
  ar: new Intl.NumberFormat('ar-AE'),
  en: new Intl.NumberFormat('en-AE'),
};

interface ProgressBarProps {
  label?: string;
  value: number;
}

export function ProgressBar({ label, value }: ProgressBarProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const boundedValue = Math.max(0, Math.min(100, Math.round(value)));
  const visibleLabel = label ?? t('ghaf.progressLabel');
  const accessibleLabel = label ?? t('ghaf.progress', { percent: boundedValue });

  return (
    <View style={styles.progressGroup}>
      <View style={[styles.progressCopy, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <Text color="inkMuted" variant="caption">
          {visibleLabel}
        </Text>
        <Text color="forest" variant="caption">
          {numberFormatters[locale].format(boundedValue)}%
        </Text>
      </View>
      <View
        accessibilityLabel={accessibleLabel}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: boundedValue }}
        style={[
          styles.progressTrack,
          direction === 'rtl' ? styles.progressTrackRtl : styles.progressTrackLtr,
        ]}
      >
        <View style={[styles.progressFill, { width: `${boundedValue}%` }]} />
      </View>
    </View>
  );
}

interface RoleSwitcherProps {
  onChange: (role: PrototypeRole) => void;
  role: PrototypeRole;
}

const roles: readonly PrototypeRole[] = ['parent', 'child'];

export function RoleSwitcher({ onChange, role }: RoleSwitcherProps) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <View
      accessibilityLabel={t('common.switchRole')}
      accessibilityRole="radiogroup"
      style={[styles.roleSwitcher, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
    >
      {roles.map((option) => {
        const selected = option === role;

        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            key={option}
            onPress={() => onChange(option)}
            style={({ pressed }) => [
              styles.roleOption,
              selected ? styles.roleOptionSelected : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text align="center" color={selected ? 'white' : 'forest'} variant="label">
              {t(`common.${option}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface MissionCardProps {
  mission: MissionSummary;
  showSteps?: boolean;
}

export function MissionCard({ mission, showSteps = false }: MissionCardProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const formatter = numberFormatters[locale];

  return (
    <Card accessibilityLabel={localize(mission.title, locale)} elevated testID="mock-mission-card">
      <View style={[styles.cardHeader, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.mockBadge}>
          <View style={styles.mockDot} />
          <Text color="forest" variant="caption">
            {t('common.mockBadge')}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text color="earth" variant="caption">
            {t('mission.assigned')}
          </Text>
        </View>
      </View>

      <View style={styles.copyStack}>
        <Text color="forest" variant="heading">
          {localize(mission.title, locale)}
        </Text>
        <Text color="inkMuted">{localize(mission.story, locale)}</Text>
      </View>

      {showSteps ? (
        <View style={styles.stepsBlock}>
          <Text color="earth" variant="label">
            {t('mission.steps')}
          </Text>
          {mission.steps.map((step, index) => (
            <View
              key={step.id}
              style={[styles.stepRow, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
            >
              <View style={styles.stepNumber}>
                <Text align="center" color="white" variant="caption">
                  {formatter.format(index + 1)}
                </Text>
              </View>
              <Text style={styles.stepText}>{localize(step.text, locale)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.missionFooter, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.footerItem}>
          <Text color="inkMuted" variant="caption">
            {t('mission.impactTarget')}
          </Text>
          <Text color="forest" variant="label">
            {t('mission.portions', {
              count: formatter.format(mission.impactTarget.estimatedPortions),
            })}
          </Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerItem}>
          <Text color="inkMuted" variant="caption">
            {t('childHome.rewardPreview')}
          </Text>
          <Text color="earth" variant="label">
            {localize(mission.reward, locale)}
          </Text>
        </View>
      </View>

      <Text color="inkMuted" variant="caption">
        {t('mission.sourceNote')}
      </Text>
    </Card>
  );
}

interface ImpactCardProps {
  impact: ImpactSummary;
}

export function ImpactCard({ impact }: ImpactCardProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const formatter = numberFormatters[locale];
  const kilograms = impact.rescuedGrams / 1000;
  const kilogramsLabel = t('impact.kilograms', { count: formatter.format(kilograms) });

  const metrics = [
    { label: t('impact.foodRescued'), value: kilogramsLabel },
    { label: t('impact.portions'), value: formatter.format(impact.rescuedPortions) },
    { label: t('impact.missions'), value: formatter.format(impact.completedMissions) },
    { label: t('impact.streak'), value: formatter.format(impact.streakDays) },
  ] as const;

  return (
    <Card testID="impact-card">
      <View style={styles.copyStack}>
        <Text color="forest" variant="heading">
          {t('impact.title')}
        </Text>
        <Text color="inkMuted" variant="caption">
          {t('impact.estimate')}
        </Text>
      </View>
      <View style={[styles.metricsGrid, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metric}>
            <Text color="ghaf" variant="heading">
              {metric.value}
            </Text>
            <Text color="inkMuted" variant="caption">
              {metric.label}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rowLtr: {
    flexDirection: 'row',
  },
  progressGroup: {
    width: '100%',
    gap: spacing.xs,
  },
  progressCopy: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  progressTrack: {
    height: 10,
    width: '100%',
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  progressTrackRtl: {
    alignItems: 'flex-end',
  },
  progressTrackLtr: {
    alignItems: 'flex-start',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.ghaf,
  },
  roleSwitcher: {
    padding: spacing.xxs,
    gap: spacing.xxs,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  roleOption: {
    flex: 1,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
  },
  roleOptionSelected: {
    backgroundColor: colors.ghaf,
  },
  pressed: {
    opacity: 0.78,
  },
  cardHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  mockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.leafLight,
  },
  mockDot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.ghaf,
  },
  statusBadge: {
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.goldLight,
  },
  copyStack: {
    gap: spacing.xs,
  },
  stepsBlock: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  stepRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ghaf,
  },
  stepText: {
    flex: 1,
  },
  missionFooter: {
    alignItems: 'stretch',
    gap: spacing.md,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.ivory,
    padding: spacing.md,
  },
  footerItem: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  footerDivider: {
    width: 1,
    backgroundColor: colors.line,
  },
  metricsGrid: {
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    minWidth: '45%',
    flexGrow: 1,
    flexBasis: 0,
    gap: spacing.xxs,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.ivory,
    padding: spacing.md,
  },
});
