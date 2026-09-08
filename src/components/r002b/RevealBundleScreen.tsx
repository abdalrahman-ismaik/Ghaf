import { useRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { LocalIllustration } from '@/components/illustrations';
import { PrimaryButton, QuietButton, Text } from '@/components/primitives';
import {
  colors,
  layout,
  logicalRowDirection,
  r001Radii,
  r001Shadows,
  spacing,
  type AppColor,
} from '@/design/tokens';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';
import type { RevealConsequence } from '@/models/revealBundle';
import { focusAccessibilityTarget } from '@/utils/accessibilityFocus';

export type RevealContentState =
  | 'ready'
  | 'presenting'
  | 'interrupted'
  | 'recovered'
  | 'offline'
  | 'error'
  | 'archived'
  | 'unavailable';

export interface RevealActionPresentation {
  readonly accessibilityLabel: string;
  readonly busy?: boolean;
  readonly busyLabel?: string;
  readonly disabled?: boolean;
  readonly label: string;
  readonly onPress: () => void;
  readonly testID?: string;
}

export interface RevealConsequencePresentation {
  readonly accessibilityLabel: string;
  readonly detail: string;
  readonly iconName: GhafIconName;
  readonly id: string;
  readonly kind: RevealConsequence['kind'];
  readonly statusLabel?: string;
  readonly title: string;
  readonly tone: 'emerald' | 'water' | 'amber' | 'coral';
  readonly value?: string;
}

export interface RevealBundleScreenProps {
  readonly contentState: RevealContentState;
  readonly direction: TextDirection;
  readonly groupLabel: string;
  readonly illustrationLabel: string;
  readonly initialFocus?: boolean;
  readonly introduction: string;
  readonly items: readonly RevealConsequencePresentation[];
  readonly language: LocaleCode;
  readonly privateNote: string;
  readonly reducedMotion: boolean;
  readonly statusLabel: string;
  readonly symbolicNote: string;
  readonly title: string;
}

export interface RevealBundleActionBarProps {
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly primary: RevealActionPresentation;
  readonly reducedMotion: boolean;
  readonly secondary?: RevealActionPresentation;
}

function useResponsiveRevealLayout() {
  const { fontScale, width } = useWindowDimensions();
  return {
    compact: width < 360 || fontScale >= 1.5,
    expanded: width >= 600 && fontScale < 1.5,
  } as const;
}

export function RevealBundleScreen({
  contentState,
  direction,
  groupLabel,
  illustrationLabel,
  initialFocus = false,
  introduction,
  items,
  language,
  privateNote,
  reducedMotion,
  statusLabel,
  symbolicNote,
  title,
}: RevealBundleScreenProps) {
  const { compact, expanded } = useResponsiveRevealLayout();
  const status = statusPresentation[contentState];
  const initialFocusRef = useRef<View>(null);
  const initialFocusApplied = useRef(false);
  const focusInitialHeadingAfterLayout = () => {
    if (!initialFocus || initialFocusApplied.current) return;
    initialFocusApplied.current = focusAccessibilityTarget(initialFocusRef.current);
  };

  return (
    <View
      accessibilityLabel={`${title}. ${statusLabel}`}
      accessibilityLiveRegion="polite"
      style={styles.root}
      testID={reducedMotion ? 'r002b-reveal-screen-reduced-motion' : 'r002b-reveal-screen'}
    >
      <View
        style={[
          styles.hero,
          contentStateSurface[contentState],
          expanded ? styles.heroExpanded : null,
        ]}
      >
        <RevealNaturalArtwork
          accessibilityLabel={illustrationLabel}
          compact={compact}
          direction={direction}
          language={language}
        />
        <View style={styles.heroCopy}>
          <View
            accessible
            accessibilityLabel={`${groupLabel}. ${title}. ${statusLabel}`}
            accessibilityLanguage={language === 'ar' ? 'ar-AE' : 'en-AE'}
            accessibilityRole="header"
            onLayout={focusInitialHeadingAfterLayout}
            ref={initialFocusRef}
            testID="r002b-reveal-initial-focus"
          >
            <Text
              accessibilityRole="none"
              align={expanded ? 'start' : 'center'}
              brand
              color="deepForest"
              direction={direction}
              language={language}
              variant="hero"
            >
              {title}
            </Text>
          </View>
          <Text
            align={expanded ? 'start' : 'center'}
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={language}
            variant="bodyLarge"
          >
            {introduction}
          </Text>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: status.background,
                flexDirection: logicalRowDirection(direction),
              },
            ]}
          >
            <GhafIcon color={status.iconColor} name={status.iconName} size={18} />
            <Text
              brand
              color={status.textColor}
              direction={direction}
              language={language}
              variant="caption"
            >
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.consequenceList}>
        {items.map((item) => (
          <RevealConsequenceCard
            direction={direction}
            item={item}
            key={item.id}
            language={language}
          />
        ))}
      </View>

      <View style={styles.disclosureGroup}>
        <DisclosureRow
          direction={direction}
          iconName="lock"
          language={language}
          text={privateNote}
        />
        <DisclosureRow
          direction={direction}
          iconName="info"
          language={language}
          text={symbolicNote}
        />
      </View>
    </View>
  );
}

function RevealConsequenceCard({
  direction,
  item,
  language,
}: {
  readonly direction: TextDirection;
  readonly item: RevealConsequencePresentation;
  readonly language: LocaleCode;
}) {
  const praise = item.kind === 'parent_praise';
  const tone = consequenceTones[item.tone];

  return (
    <View
      accessible
      accessibilityLabel={item.accessibilityLabel}
      accessibilityRole="text"
      style={[
        styles.consequenceCard,
        { backgroundColor: tone.background, borderColor: tone.border },
        praise ? styles.praiseCard : null,
      ]}
      testID={`r002b-reveal-item-${item.kind}`}
    >
      <View style={[styles.consequenceRow, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={[styles.consequenceIcon, { backgroundColor: tone.iconBackground }]}>
          <GhafIcon color={tone.icon} direction={direction} name={item.iconName} size={24} />
        </View>
        <View style={styles.consequenceCopy}>
          <View
            style={[
              styles.consequenceHeadingRow,
              { flexDirection: logicalRowDirection(direction) },
            ]}
          >
            <Text
              brand
              color="deepForest"
              direction={direction}
              language={language}
              style={styles.consequenceTitle}
              variant={praise ? 'screenTitle' : 'control'}
            >
              {item.title}
            </Text>
            {item.value ? (
              <Text
                brand
                color={tone.valueColor}
                direction={direction}
                language={language}
                style={styles.consequenceValue}
                tabular
                variant="control"
              >
                {item.value}
              </Text>
            ) : null}
          </View>
          <Text
            brand
            color={praise ? 'deepForest' : 'onSurfaceVariant'}
            direction={direction}
            language={language}
            variant={praise ? 'bodyLarge' : 'compactBody'}
          >
            {item.detail}
          </Text>
          {item.statusLabel ? (
            <Text
              brand
              color={tone.valueColor}
              direction={direction}
              language={language}
              variant="caption"
            >
              {item.statusLabel}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function RevealNaturalArtwork({
  accessibilityLabel,
  compact,
  direction,
  language,
}: {
  readonly accessibilityLabel: string;
  readonly compact: boolean;
  readonly direction: TextDirection;
  readonly language: LocaleCode;
}) {
  return (
    <LocalIllustration
      accessibilityLabel={accessibilityLabel}
      assetId="recognition-reveal"
      direction={direction}
      fallbackLabel={accessibilityLabel}
      language={language}
      priority="high"
      style={[styles.botanicalScene, compact ? styles.botanicalSceneCompact : null]}
      testID="reveal-natural-artwork"
    />
  );
}

function DisclosureRow({
  direction,
  iconName,
  language,
  text,
}: {
  readonly direction: TextDirection;
  readonly iconName: GhafIconName;
  readonly language: LocaleCode;
  readonly text: string;
}) {
  return (
    <View style={[styles.disclosureRow, { flexDirection: logicalRowDirection(direction) }]}>
      <GhafIcon color={colors.onSurfaceVariant} name={iconName} size={18} />
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        language={language}
        style={styles.disclosureText}
        variant="caption"
      >
        {text}
      </Text>
    </View>
  );
}

export function RevealBundleActionBar({
  direction,
  language,
  primary,
  reducedMotion,
  secondary,
}: RevealBundleActionBarProps) {
  const { compact, expanded } = useResponsiveRevealLayout();
  const horizontal = expanded && !compact;

  return (
    <SafeAreaView edges={['bottom']} style={styles.actionSafeArea}>
      <View
        style={[
          styles.actionBar,
          horizontal ? { flexDirection: logicalRowDirection(direction, true) } : null,
        ]}
        testID={reducedMotion ? 'r002b-reveal-actions-reduced-motion' : 'r002b-reveal-actions'}
      >
        <PrimaryButton
          accessibilityLabel={primary.accessibilityLabel}
          brand
          busy={primary.busy}
          busyLabel={primary.busyLabel}
          dimWhenDisabled={false}
          direction={direction}
          disabled={primary.disabled}
          fullWidth={!horizontal}
          language={language}
          onPress={primary.onPress}
          size="regular"
          style={horizontal ? styles.expandedAction : styles.fullAction}
          testID={primary.testID ?? 'r002b-reveal-primary-action'}
        >
          {primary.label}
        </PrimaryButton>
        {secondary ? (
          <QuietButton
            accessibilityLabel={secondary.accessibilityLabel}
            brand
            busy={secondary.busy}
            busyLabel={secondary.busyLabel}
            direction={direction}
            disabled={secondary.disabled}
            fullWidth={!horizontal}
            language={language}
            onPress={secondary.onPress}
            size="regular"
            style={horizontal ? styles.expandedAction : styles.fullAction}
            testID={secondary.testID ?? 'r002b-reveal-secondary-action'}
          >
            {secondary.label}
          </QuietButton>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const consequenceTones: Readonly<
  Record<
    RevealConsequencePresentation['tone'],
    {
      readonly background: string;
      readonly border: string;
      readonly icon: string;
      readonly iconBackground: string;
      readonly valueColor: AppColor;
    }
  >
> = {
  emerald: {
    background: colors.primaryFixedTint,
    border: colors.onPrimaryContainer,
    icon: colors.ghafEmerald,
    iconBackground: colors.ghafEmeraldTint,
    valueColor: 'ghafEmerald',
  },
  water: {
    background: colors.mangroveTealTint,
    border: colors.secondaryFixedDim,
    icon: colors.mangroveTeal,
    iconBackground: colors.secondaryTint,
    valueColor: 'secondary',
  },
  amber: {
    background: colors.solarAmberTint,
    border: colors.solarAmberBorder,
    icon: colors.tertiary,
    iconBackground: colors.tertiaryFixed,
    valueColor: 'tertiary',
  },
  coral: {
    background: colors.errorContainer,
    border: colors.coralLight,
    icon: colors.coral,
    iconBackground: colors.surfaceContainerLowest,
    valueColor: 'onErrorContainer',
  },
};

const statusPresentation: Readonly<
  Record<
    RevealContentState,
    {
      readonly background: string;
      readonly iconColor: string;
      readonly iconName: GhafIconName;
      readonly textColor: AppColor;
    }
  >
> = {
  ready: {
    iconName: 'check-filled',
    iconColor: colors.ghafEmerald,
    background: colors.surfaceContainerLowest,
    textColor: 'deepForest',
  },
  presenting: {
    iconName: 'check-filled',
    iconColor: colors.ghafEmerald,
    background: colors.surfaceContainerLowest,
    textColor: 'deepForest',
  },
  recovered: {
    iconName: 'check-filled',
    iconColor: colors.ghafEmerald,
    background: colors.surfaceContainerLowest,
    textColor: 'deepForest',
  },
  interrupted: {
    iconName: 'info',
    iconColor: colors.tertiary,
    background: colors.tertiaryFixed,
    textColor: 'deepForest',
  },
  offline: {
    iconName: 'info',
    iconColor: colors.onSurfaceVariant,
    background: colors.surfaceContainer,
    textColor: 'deepForest',
  },
  error: {
    iconName: 'info',
    iconColor: colors.error,
    background: colors.errorContainer,
    textColor: 'onErrorContainer',
  },
  archived: {
    iconName: 'lock',
    iconColor: colors.onSurfaceVariant,
    background: colors.surfaceContainer,
    textColor: 'onSurfaceVariant',
  },
  unavailable: {
    iconName: 'info',
    iconColor: colors.onSurfaceVariant,
    background: colors.surfaceContainer,
    textColor: 'onSurfaceVariant',
  },
};

const contentStateSurface: Readonly<Record<RevealContentState, object | null>> = {
  ready: null,
  presenting: null,
  recovered: null,
  interrupted: { borderColor: colors.solarAmber },
  offline: { borderColor: colors.outline },
  error: { borderColor: colors.error },
  archived: { borderColor: colors.outlineVariant },
  unavailable: { borderColor: colors.outlineVariant },
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    minWidth: 0,
    gap: spacing.xl,
  },
  hero: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.secondaryFixedDim,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.secondaryTint,
    padding: spacing.xl,
    ...r001Shadows.soft,
  },
  heroExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusPill: {
    minHeight: 32,
    maxWidth: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    borderRadius: r001Radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  botanicalScene: {
    width: 176,
    height: 158,
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  botanicalSceneCompact: {
    width: 148,
    height: 132,
  },
  consequenceList: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  consequenceCard: {
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    padding: spacing.md,
  },
  praiseCard: {
    borderRadius: r001Radii.xl,
    padding: spacing.lg,
  },
  consequenceRow: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  consequenceIcon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
  },
  consequenceCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  consequenceHeadingRow: {
    width: '100%',
    minWidth: 0,
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  consequenceTitle: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  consequenceValue: {
    flexShrink: 0,
  },
  disclosureGroup: {
    width: '100%',
    minWidth: 0,
    gap: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.md,
  },
  disclosureRow: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  disclosureText: {
    flex: 1,
    minWidth: 0,
  },
  actionSafeArea: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    ...r001Shadows.sheet,
  },
  actionBar: {
    width: '100%',
    maxWidth: layout.compactContentWidth,
    minWidth: 0,
    alignSelf: 'center',
    gap: spacing.xs,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  fullAction: {
    width: '100%',
    minWidth: 0,
    minHeight: layout.controlHeight,
  },
  expandedAction: {
    width: 'auto',
    minWidth: layout.touchTarget * 3,
    minHeight: layout.controlHeight,
    flex: 1,
  },
});
