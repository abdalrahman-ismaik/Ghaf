import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card, Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import type {
  CapabilityOrigin,
  ImpactSummary,
  LocaleCode,
  Mission,
  MissionLifecycleStatus,
  PrototypeRole,
  Quantity,
} from '@/models/prototype';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const numberFormatters: Record<LocaleCode, Intl.NumberFormat> = {
  ar: new Intl.NumberFormat('ar-AE'),
  en: new Intl.NumberFormat('en-AE'),
};

const originKeys: Record<CapabilityOrigin, string> = {
  seeded: 'origin.seeded',
  prepared: 'origin.prepared',
  simulated: 'origin.simulated',
  'pregenerated-mock': 'origin.pregeneratedMock',
  'live-optional': 'origin.liveOptional',
};

const statusKeys: Record<MissionLifecycleStatus, string> = {
  'draft-input': 'lifecycleStatus.draftInput',
  generating: 'lifecycleStatus.generating',
  'parent-review': 'lifecycleStatus.parentReview',
  assigned: 'lifecycleStatus.assigned',
  'child-in-progress': 'lifecycleStatus.childInProgress',
  'awaiting-parent-confirmation': 'lifecycleStatus.awaitingParentConfirmation',
  completed: 'lifecycleStatus.completed',
};

export function formatQuantity(
  quantity: Quantity,
  locale: LocaleCode,
  translate: (key: string, options?: Record<string, unknown>) => string,
): string {
  const count = numberFormatters[locale].format(quantity.value);
  return translate(quantity.unit === 'grams' ? 'mission.grams' : 'mission.portions', {
    count: quantity.value,
    formattedCount: count,
  });
}

interface ProgressBarProps {
  label?: string;
  value: number;
}

export function ProgressBar({ label, value }: ProgressBarProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const boundedValue = Math.max(0, Math.min(100, Math.round(value)));
  const fillOrigin =
    Platform.OS === 'web'
      ? direction === 'rtl'
        ? styles.progressFillRight
        : styles.progressFillLeft
      : styles.progressFillInlineStart;

  return (
    <View style={styles.progressGroup}>
      <View style={styles.progressCopy}>
        <Text color="inkMuted" variant="caption">
          {label ?? t('ghaf.progressLabel')}
        </Text>
        <Text color="forest" variant="caption">
          {numberFormatters[locale].format(boundedValue)}%
        </Text>
      </View>
      <View
        accessibilityLabel={label ?? t('ghaf.progressLabel')}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: boundedValue }}
        style={styles.progressTrack}
      >
        <View style={[styles.progressFill, fillOrigin, { width: `${boundedValue}%` }]} />
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

  return (
    <View
      accessibilityLabel={t('common.switchRole')}
      accessibilityRole="radiogroup"
      style={styles.roleSwitcher}
    >
      {roles.map((option) => {
        const selected = option === role;

        return (
          <Pressable
            accessibilityLabel={t(`common.${option}`)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            key={option}
            onPress={() => onChange(option)}
            style={({ pressed }) => [
              styles.roleOption,
              selected ? styles.roleOptionSelected : null,
              pressed ? styles.pressed : null,
            ]}
            testID={`switch-to-${option}-button`}
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

interface OriginPillProps {
  origin: CapabilityOrigin;
}

export function OriginPill({ origin }: OriginPillProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.originBadge}>
      <View style={styles.mockDot} />
      <Text color="forest" variant="caption">
        {t(originKeys[origin])}
      </Text>
    </View>
  );
}

interface MissionCardProps {
  action?: ReactNode;
  mission: Mission;
  showSteps?: boolean;
}

export function MissionCard({ action, mission, showSteps = false }: MissionCardProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const formatter = numberFormatters[locale];

  return (
    <Card accessibilityLabel={localize(mission.title, locale)} elevated testID="mock-mission-card">
      <View style={styles.cardHeader}>
        <OriginPill origin={mission.origin} />
        <View style={styles.statusBadge}>
          <Text color="earth" variant="caption">
            {t(statusKeys[mission.status])}
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
          {mission.steps.map((step) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text align="center" color="white" variant="caption">
                  {formatter.format(step.order)}
                </Text>
              </View>
              <Text style={styles.stepText}>{localize(step.instruction, locale)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.missionFooter}>
        <View style={styles.footerItem}>
          <Text color="inkMuted" variant="caption">
            {t('mission.impactTarget')}
          </Text>
          <Text color="forest" variant="label">
            {formatQuantity(mission.impactTarget, locale, t)}
          </Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerItem}>
          <Text color="inkMuted" variant="caption">
            {t('mission.reward')}
          </Text>
          <Text color="earth" variant="label">
            {mission.reward ? localize(mission.reward, locale) : t('common.optional')}
          </Text>
        </View>
      </View>

      <Text color="inkMuted" variant="caption">
        {t('mission.sourceNote')}
      </Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </Card>
  );
}

interface ImpactCardProps {
  impact: ImpactSummary;
}

export function ImpactCard({ impact }: ImpactCardProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const formatter = numberFormatters[locale];
  const kilograms = impact.rescuedGrams / 1000;

  const metrics = [
    {
      label: t('impact.foodRescued'),
      value: t('impact.kilograms', { count: formatter.format(kilograms) }),
    },
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
      <View style={styles.metricsGrid}>
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
  progressGroup: {
    width: '100%',
    gap: spacing.xs,
  },
  progressCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  progressTrack: {
    position: 'relative',
    height: 10,
    width: '100%',
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    height: '100%',
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.ghaf,
  },
  progressFillInlineStart: {
    insetInlineStart: 0,
  },
  progressFillRight: {
    right: 0,
  },
  progressFillLeft: {
    left: 0,
  },
  roleSwitcher: {
    flexDirection: 'row',
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
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
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
    paddingVertical: spacing.xs,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepNumber: {
    width: 32,
    height: 32,
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
    flexDirection: 'row',
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
  action: {
    paddingTop: spacing.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
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
