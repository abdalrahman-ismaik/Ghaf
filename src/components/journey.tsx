import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { IconButton, Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface JourneyHeaderProps {
  readonly action?: ReactNode;
  readonly backLabel?: string;
  readonly context?: string;
  readonly eyebrow?: string;
  readonly onBack?: () => void;
  readonly subtitle?: string;
  readonly title: string;
}

export function JourneyHeader({
  action,
  backLabel,
  context,
  eyebrow,
  onBack,
  subtitle,
  title,
}: JourneyHeaderProps) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);
  const resolvedContext = context ?? eyebrow;

  return (
    <View style={styles.header}>
      {onBack || action ? (
        <View style={[styles.headerActions, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
          {onBack ? (
            <IconButton
              icon={<DirectionArrow reverse={direction === 'rtl'} />}
              label={backLabel ?? t('common.back')}
              onPress={onBack}
              testID="back-button"
            />
          ) : (
            <View style={styles.headerSpacer} />
          )}
          {action ?? <View style={styles.headerSpacer} />}
        </View>
      ) : null}
      <View style={styles.headerCopy}>
        <Text color="forest" variant="title">
          {title}
        </Text>
        {subtitle ? <Text color="inkMuted">{subtitle}</Text> : null}
        {resolvedContext ? (
          <View style={[styles.headerContext, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
            <View style={styles.headerContextLine} />
            <Text color="earth" style={styles.headerContextText} variant="caption">
              {resolvedContext}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function DirectionArrow({ reverse }: { readonly reverse: boolean }) {
  return (
    <Svg
      aria-hidden
      height={spacing.lg}
      style={reverse ? styles.arrowReverse : undefined}
      viewBox="0 0 24 20"
      width={spacing.xl}
    >
      <Path
        d="M21 10H4M10 4l-6 6 6 6"
        fill="none"
        stroke={colors.forest}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

export type DisclosureOrigin = 'prepared' | 'synthetic' | 'simulated' | 'live';

interface OriginDisclosureProps {
  readonly body: string;
  readonly compact?: boolean;
  readonly label: string;
  readonly origin: DisclosureOrigin;
  readonly testID?: string;
  readonly title?: string;
}

/** Capability truth stays beside the object it qualifies, not in a remote footer. */
export function OriginDisclosure({
  body,
  compact = false,
  label,
  origin,
  testID,
  title,
}: OriginDisclosureProps) {
  const direction = usePrototypeStore((state) => state.direction);
  return (
    <View
      accessibilityLabel={[label, title, body].filter(Boolean).join('. ')}
      accessible
      style={[
        styles.originDisclosure,
        disclosureOriginStyles[origin],
        compact ? styles.originDisclosureCompact : null,
        direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
      ]}
      testID={testID}
    >
      <View style={[styles.originRail, originRailStyles[origin]]} />
      <View style={styles.disclosureCopy}>
        <Text color="forest" variant="caption">
          {label}
        </Text>
        {title ? (
          <Text color="forest" variant="label">
            {title}
          </Text>
        ) : null}
        <Text color="inkMuted" variant="caption">
          {body}
        </Text>
      </View>
    </View>
  );
}

const disclosureOriginStyles = StyleSheet.create({
  prepared: { backgroundColor: colors.goldGlow, borderColor: colors.sand },
  synthetic: { backgroundColor: colors.waterLight, borderColor: colors.water },
  simulated: { backgroundColor: colors.leafMist, borderColor: colors.leaf },
  live: { backgroundColor: colors.successLight, borderColor: colors.success },
});

const originRailStyles = StyleSheet.create({
  prepared: { backgroundColor: colors.gold },
  synthetic: { backgroundColor: colors.mangrove },
  simulated: { backgroundColor: colors.ghaf },
  live: { backgroundColor: colors.success },
});

const styles = StyleSheet.create({
  header: { gap: spacing.lg },
  headerActions: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerSpacer: { width: layout.touchTarget, height: layout.touchTarget },
  headerCopy: { gap: spacing.sm },
  headerContext: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xs },
  headerContextLine: { width: spacing.xxl, height: 1, backgroundColor: colors.gold },
  headerContextText: { flexShrink: 1 },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  arrowReverse: { transform: [{ scaleX: -1 }] },
  originDisclosure: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    padding: spacing.md,
  },
  originDisclosureCompact: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  originRail: { width: spacing.sm, height: spacing.sm, flexShrink: 0, borderRadius: radii.sm },
  disclosureCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
});
