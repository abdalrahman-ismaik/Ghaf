import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import {
  colors,
  layout,
  logicalRowDirection,
  opacity,
  r001Radii,
  r001Shadows,
  spacing,
  type AppColor,
} from '@/design/tokens';
import type { BadgeId } from '@/models/achievements';
import type { LocaleCode, SyntheticChildId, TextDirection } from '@/models/familyGrowth';

export type ParentProgressContentState =
  | 'ready'
  | 'loading'
  | 'offline'
  | 'interrupted'
  | 'error'
  | 'unauthorized'
  | 'empty'
  | 'stale'
  | 'unavailable';

export interface ParentProgressPresentationProps {
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly reducedMotion: boolean;
}

export interface ParentProgressActionPresentation {
  readonly accessibilityHint?: string;
  readonly accessibilityLabel: string;
  readonly busy?: boolean;
  readonly disabled?: boolean;
  readonly label: string;
  readonly onPress: () => void;
  readonly testID?: string;
}

export interface ParentProgressProfileOptionPresentation {
  readonly accessibilityLabel: string;
  readonly disabled: boolean;
  readonly id: SyntheticChildId;
  readonly label: string;
  readonly onPress?: () => void;
  readonly selected: boolean;
  readonly testID: string;
}

export interface ParentProgressMetricPresentation {
  readonly accessibilityLabel: string;
  readonly label: string;
  readonly supportingText: string;
  readonly value: string;
}

export interface ParentProgressBarPresentation {
  readonly accessibilityLabel: string;
  readonly current: number;
  readonly maximum: number;
  readonly valueText: string;
  readonly visualPercent: number;
}

export interface ParentProgressSummaryPresentation {
  readonly currentStage: ParentProgressMetricPresentation;
  readonly currentStageProgress?: ParentProgressBarPresentation;
  readonly lifetime: ParentProgressMetricPresentation;
}

export interface ParentProgressArchiveItemPresentation {
  readonly accessibilityLabel: string;
  readonly id: string;
  readonly statusLabel: string;
  readonly title: string;
  readonly value: string;
}

export type ParentProgressBadgeState = 'earned' | 'in_progress' | 'awaiting_review' | 'recommended';

export interface ParentProgressBadgeItemPresentation {
  readonly accessibilityLabel: string;
  readonly criterionText: string;
  readonly id: BadgeId;
  readonly progress: ParentProgressBarPresentation;
  readonly progressText: string;
  readonly state: ParentProgressBadgeState;
  readonly statusLabel: string;
  readonly title: string;
}

export interface ParentProgressLearningItemPresentation {
  readonly accessibilityLabel: string;
  readonly completed: boolean;
  readonly id: string;
  readonly statusLabel: string;
  readonly title: string;
}

export interface ParentProgressSuggestionPresentation {
  readonly accessibilityLabel: string;
  readonly action?: ParentProgressActionPresentation;
  readonly id: string;
  readonly rationale: string;
  readonly reviewNotice: string;
  readonly statusLabel: string;
  readonly title: string;
  readonly unavailableText?: string;
}

export interface ParentProgressScreenProps extends ParentProgressPresentationProps {
  readonly archiveEmptyText: string;
  readonly archiveHeading: string;
  readonly archiveItems: readonly ParentProgressArchiveItemPresentation[];
  readonly badgesEmptyText: string;
  readonly badgesHeading: string;
  readonly badgesSummary: string;
  readonly badgeItems: readonly ParentProgressBadgeItemPresentation[];
  readonly contentState: ParentProgressContentState;
  readonly description: string;
  readonly groupLabel: string;
  readonly learningEmptyText: string;
  readonly learningHeading: string;
  readonly learningItems: readonly ParentProgressLearningItemPresentation[];
  readonly privateNote: string;
  readonly profileSelectorHeading: string;
  readonly profileOptions: readonly ParentProgressProfileOptionPresentation[];
  readonly readOnlyNote: string;
  readonly selectedProfileAnnouncement: string;
  readonly selectedProfileLabel: string;
  readonly stateLabel: string;
  readonly suggestionsEmptyText: string;
  readonly suggestionsHeading: string;
  readonly suggestions: readonly ParentProgressSuggestionPresentation[];
  readonly summary: ParentProgressSummaryPresentation | null;
  readonly summaryHeading: string;
  readonly testID?: string;
  readonly title: string;
}

interface ResponsiveParentProgressLayout {
  readonly compact: boolean;
  readonly expanded: boolean;
}

function useResponsiveParentProgressLayout(): ResponsiveParentProgressLayout {
  const { fontScale, width } = useWindowDimensions();
  return {
    compact: width < 360 || fontScale >= 1.5,
    expanded: width >= 600 && fontScale < 1.5,
  };
}

const stateTone: Readonly<
  Record<
    ParentProgressContentState,
    { readonly background: AppColor; readonly foreground: AppColor }
  >
> = {
  ready: { background: 'primaryFixedTint', foreground: 'deepForest' },
  loading: { background: 'surfaceContainerLow', foreground: 'onSurfaceVariant' },
  offline: { background: 'secondaryTint', foreground: 'secondary' },
  interrupted: { background: 'solarAmberTint', foreground: 'tertiary' },
  error: { background: 'errorContainer', foreground: 'error' },
  unauthorized: { background: 'errorContainer', foreground: 'error' },
  empty: { background: 'surfaceContainerLow', foreground: 'onSurfaceVariant' },
  stale: { background: 'solarAmberTint', foreground: 'tertiary' },
  unavailable: { background: 'surfaceContainerLow', foreground: 'onSurfaceVariant' },
};

const stateIcon: Readonly<Record<ParentProgressContentState, GhafIconName>> = {
  ready: 'check',
  loading: 'sparkle',
  offline: 'info',
  interrupted: 'info',
  error: 'info',
  unauthorized: 'lock',
  empty: 'leaf',
  stale: 'info',
  unavailable: 'info',
};

export function ParentProgressScreen({
  archiveEmptyText,
  archiveHeading,
  archiveItems,
  badgesEmptyText,
  badgesHeading,
  badgesSummary,
  badgeItems,
  contentState,
  description,
  direction,
  groupLabel,
  language,
  learningEmptyText,
  learningHeading,
  learningItems,
  privateNote,
  profileOptions,
  profileSelectorHeading,
  readOnlyNote,
  reducedMotion,
  selectedProfileAnnouncement,
  selectedProfileLabel,
  stateLabel,
  suggestions,
  suggestionsEmptyText,
  suggestionsHeading,
  summary,
  summaryHeading,
  testID = 'r002b-parent-progress-screen',
  title,
}: ParentProgressScreenProps) {
  const { compact, expanded } = useResponsiveParentProgressLayout();

  return (
    <View accessibilityLabel={groupLabel} style={styles.screen} testID={testID}>
      <View style={[styles.hero, { flexDirection: logicalRowDirection(direction) }]}>
        <View aria-hidden importantForAccessibility="no-hide-descendants" style={styles.heroMark}>
          <GhafIcon color={colors.ghafEmerald} name="child" size={28} />
        </View>
        <View style={styles.flexCopy}>
          <Text
            accessibilityRole="header"
            brand
            color="deepForest"
            direction={direction}
            language={language}
            variant="screenTitle"
          >
            {title}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} language={language}>
            {description}
          </Text>
        </View>
      </View>

      <View accessibilityLiveRegion="polite" style={styles.srAnnouncement}>
        <Text direction={direction} language={language}>
          {selectedProfileAnnouncement}
        </Text>
      </View>

      <ProfileSelector
        compact={compact}
        direction={direction}
        heading={profileSelectorHeading}
        language={language}
        options={profileOptions}
        reducedMotion={reducedMotion}
        selectedProfileLabel={selectedProfileLabel}
      />

      <StateBand
        contentState={contentState}
        direction={direction}
        language={language}
        stateLabel={stateLabel}
      />

      <View style={[styles.trustBand, { flexDirection: logicalRowDirection(direction) }]}>
        <View aria-hidden importantForAccessibility="no-hide-descendants">
          <GhafIcon color={colors.ghafEmerald} name="shield" size={22} />
        </View>
        <View style={styles.flexCopy}>
          <Text brand color="deepForest" direction={direction} language={language} variant="label">
            {privateNote}
          </Text>
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={language}
            variant="caption"
          >
            {readOnlyNote}
          </Text>
        </View>
      </View>

      {summary ? (
        <>
          <SectionHeading
            direction={direction}
            icon="ghaf-tree"
            language={language}
            title={summaryHeading}
          />
          <View
            style={[
              styles.summaryGroup,
              expanded ? { flexDirection: logicalRowDirection(direction) } : null,
            ]}
          >
            <MetricPanel
              direction={direction}
              language={language}
              metric={summary.lifetime}
              tone="water"
            />
            <MetricPanel
              direction={direction}
              language={language}
              metric={summary.currentStage}
              progress={summary.currentStageProgress}
              tone="leaf"
            />
          </View>

          <ArchiveSection
            direction={direction}
            emptyText={archiveEmptyText}
            heading={archiveHeading}
            items={archiveItems}
            language={language}
          />
          <BadgeSection
            direction={direction}
            emptyText={badgesEmptyText}
            heading={badgesHeading}
            items={badgeItems}
            language={language}
            summary={badgesSummary}
          />
          <LearningSection
            direction={direction}
            emptyText={learningEmptyText}
            heading={learningHeading}
            items={learningItems}
            language={language}
          />
          <SuggestionSection
            direction={direction}
            emptyText={suggestionsEmptyText}
            heading={suggestionsHeading}
            items={suggestions}
            language={language}
            reducedMotion={reducedMotion}
          />
        </>
      ) : (
        <View accessibilityLiveRegion="polite" style={styles.emptyState}>
          <View
            aria-hidden
            importantForAccessibility="no-hide-descendants"
            style={styles.emptyMark}
          >
            <GhafIcon color={colors.secondary} name={stateIcon[contentState]} size={28} />
          </View>
          <Text
            brand
            color="deepForest"
            direction={direction}
            language={language}
            variant="heading"
          >
            {stateLabel}
          </Text>
        </View>
      )}
    </View>
  );
}

function ProfileSelector({
  compact,
  direction,
  heading,
  language,
  options,
  reducedMotion,
  selectedProfileLabel,
}: {
  readonly compact: boolean;
  readonly direction: TextDirection;
  readonly heading: string;
  readonly language: LocaleCode;
  readonly options: readonly ParentProgressProfileOptionPresentation[];
  readonly reducedMotion: boolean;
  readonly selectedProfileLabel: string;
}) {
  return (
    <View style={styles.selectorSection}>
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        language={language}
        variant="label"
      >
        {heading}
      </Text>
      <View
        accessibilityLabel={selectedProfileLabel}
        accessibilityRole="radiogroup"
        style={[
          styles.profileOptions,
          { flexDirection: compact ? 'column' : logicalRowDirection(direction) },
        ]}
      >
        {options.map((option) => (
          <Pressable
            accessibilityLabel={option.accessibilityLabel}
            accessibilityRole="radio"
            accessibilityState={{ checked: option.selected, disabled: option.disabled }}
            aria-checked={option.selected}
            disabled={option.disabled}
            key={option.id}
            onPress={option.onPress}
            style={({ pressed }) => [
              styles.profileOption,
              option.selected ? styles.profileOptionSelected : null,
              option.disabled ? styles.disabled : null,
              pressed ? (reducedMotion ? styles.pressedStatic : styles.pressedMotion) : null,
            ]}
            testID={option.testID}
          >
            <View aria-hidden importantForAccessibility="no-hide-descendants">
              <GhafIcon
                color={option.selected ? colors.ghafEmerald : colors.onSurfaceVariant}
                name="person"
                size={20}
              />
            </View>
            <Text
              align="center"
              brand
              color={option.selected ? 'ghafEmerald' : 'onSurfaceVariant'}
              direction={direction}
              language={language}
              style={styles.profileLabel}
              variant="label"
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StateBand({
  contentState,
  direction,
  language,
  stateLabel,
}: {
  readonly contentState: ParentProgressContentState;
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly stateLabel: string;
}) {
  const tone = stateTone[contentState];
  const busy = contentState === 'loading';

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityState={{ busy }}
      aria-busy={busy}
      style={[
        styles.stateBand,
        { backgroundColor: colors[tone.background], flexDirection: logicalRowDirection(direction) },
      ]}
    >
      <View aria-hidden importantForAccessibility="no-hide-descendants">
        <GhafIcon color={colors[tone.foreground]} name={stateIcon[contentState]} size={20} />
      </View>
      <Text
        brand
        color={tone.foreground}
        direction={direction}
        language={language}
        style={styles.flexCopy}
        variant="caption"
      >
        {stateLabel}
      </Text>
    </View>
  );
}

function SectionHeading({
  direction,
  icon,
  language,
  supportingText,
  title,
}: {
  readonly direction: TextDirection;
  readonly icon: GhafIconName;
  readonly language: LocaleCode;
  readonly supportingText?: string;
  readonly title: string;
}) {
  return (
    <View style={[styles.sectionHeading, { flexDirection: logicalRowDirection(direction) }]}>
      <View aria-hidden importantForAccessibility="no-hide-descendants" style={styles.sectionMark}>
        <GhafIcon color={colors.ghafEmerald} name={icon} size={22} />
      </View>
      <View style={styles.flexCopy}>
        <Text
          accessibilityRole="header"
          brand
          color="deepForest"
          direction={direction}
          language={language}
          variant="heading"
        >
          {title}
        </Text>
        {supportingText ? (
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={language}
            variant="caption"
          >
            {supportingText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function MetricPanel({
  direction,
  language,
  metric,
  progress,
  tone,
}: {
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly metric: ParentProgressMetricPresentation;
  readonly progress?: ParentProgressBarPresentation;
  readonly tone: 'water' | 'leaf';
}) {
  return (
    <View
      accessibilityLabel={metric.accessibilityLabel}
      style={[styles.metric, tone === 'water' ? styles.metricWater : styles.metricLeaf]}
    >
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        language={language}
        variant="label"
      >
        {metric.label}
      </Text>
      <Text
        brand
        color="deepForest"
        direction={direction}
        language={language}
        tabular
        variant="parentHero"
      >
        {metric.value}
      </Text>
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        language={language}
        variant="caption"
      >
        {metric.supportingText}
      </Text>
      {progress ? (
        <ProgressBar direction={direction} language={language} progress={progress} tone={tone} />
      ) : null}
    </View>
  );
}

function ProgressBar({
  direction,
  language,
  progress,
  tone,
}: {
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly progress: ParentProgressBarPresentation;
  readonly tone: 'water' | 'leaf' | 'amber';
}) {
  const width = `${Math.round(progress.visualPercent)}%` as `${number}%`;
  return (
    <View style={styles.progressGroup}>
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        language={language}
        tabular
        variant="caption"
      >
        {progress.valueText}
      </Text>
      <View
        accessibilityLabel={progress.accessibilityLabel}
        accessibilityRole="progressbar"
        accessibilityValue={{
          max: progress.maximum,
          min: 0,
          now: progress.current,
          text: progress.valueText,
        }}
        style={[
          styles.progressTrack,
          { alignItems: direction === 'rtl' ? 'flex-end' : 'flex-start' },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            tone === 'water'
              ? styles.progressWater
              : tone === 'amber'
                ? styles.progressAmber
                : styles.progressLeaf,
            { width },
          ]}
        />
      </View>
    </View>
  );
}

function ArchiveSection({
  direction,
  emptyText,
  heading,
  items,
  language,
}: {
  readonly direction: TextDirection;
  readonly emptyText: string;
  readonly heading: string;
  readonly items: readonly ParentProgressArchiveItemPresentation[];
  readonly language: LocaleCode;
}) {
  return (
    <View style={styles.section}>
      <SectionHeading direction={direction} icon="leaf" language={language} title={heading} />
      {items.length === 0 ? (
        <EmptyLine direction={direction} language={language} text={emptyText} />
      ) : (
        <View accessibilityRole="list" style={styles.flatList}>
          {items.map((item) => (
            <View
              accessibilityLabel={item.accessibilityLabel}
              accessibilityRole="summary"
              key={item.id}
              style={[styles.listRow, { flexDirection: logicalRowDirection(direction) }]}
            >
              <View
                aria-hidden
                importantForAccessibility="no-hide-descendants"
                style={styles.completeMark}
              >
                <GhafIcon color={colors.ghafEmerald} name="check-filled" size={22} />
              </View>
              <View style={styles.flexCopy}>
                <Text
                  brand
                  color="deepForest"
                  direction={direction}
                  language={language}
                  variant="label"
                >
                  {item.title}
                </Text>
                <Text
                  brand
                  color="onSurfaceVariant"
                  direction={direction}
                  language={language}
                  tabular
                >
                  {item.value}
                </Text>
                <Text
                  brand
                  color="ghafEmerald"
                  direction={direction}
                  language={language}
                  variant="caption"
                >
                  {item.statusLabel}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function BadgeSection({
  direction,
  emptyText,
  heading,
  items,
  language,
  summary,
}: {
  readonly direction: TextDirection;
  readonly emptyText: string;
  readonly heading: string;
  readonly items: readonly ParentProgressBadgeItemPresentation[];
  readonly language: LocaleCode;
  readonly summary: string;
}) {
  return (
    <View style={styles.section}>
      <SectionHeading
        direction={direction}
        icon="flower"
        language={language}
        supportingText={summary}
        title={heading}
      />
      {items.length === 0 ? (
        <EmptyLine direction={direction} language={language} text={emptyText} />
      ) : (
        <View accessibilityRole="list" style={styles.flatList}>
          {items.map((item) => (
            <View
              accessibilityLabel={item.accessibilityLabel}
              accessibilityRole="summary"
              key={item.id}
              style={styles.badgeRow}
            >
              <View
                style={[styles.badgeHeading, { flexDirection: logicalRowDirection(direction) }]}
              >
                <View
                  aria-hidden
                  importantForAccessibility="no-hide-descendants"
                  style={styles.badgeMark}
                >
                  <GhafIcon
                    color={item.state === 'earned' ? colors.ghafEmerald : colors.secondary}
                    name={item.state === 'earned' ? 'check-filled' : 'flower'}
                    size={22}
                  />
                </View>
                <View style={styles.flexCopy}>
                  <Text
                    brand
                    color="deepForest"
                    direction={direction}
                    language={language}
                    variant="label"
                  >
                    {item.title}
                  </Text>
                  <Text
                    brand
                    color={item.state === 'earned' ? 'ghafEmerald' : 'secondary'}
                    direction={direction}
                    language={language}
                    variant="caption"
                  >
                    {item.statusLabel}
                  </Text>
                </View>
              </View>
              <Text brand color="onSurfaceVariant" direction={direction} language={language}>
                {item.criterionText}
              </Text>
              <ProgressBar
                direction={direction}
                language={language}
                progress={item.progress}
                tone="amber"
              />
              <Text
                brand
                color="onSurfaceVariant"
                direction={direction}
                language={language}
                tabular
                variant="caption"
              >
                {item.progressText}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function LearningSection({
  direction,
  emptyText,
  heading,
  items,
  language,
}: {
  readonly direction: TextDirection;
  readonly emptyText: string;
  readonly heading: string;
  readonly items: readonly ParentProgressLearningItemPresentation[];
  readonly language: LocaleCode;
}) {
  return (
    <View style={styles.section}>
      <SectionHeading direction={direction} icon="science" language={language} title={heading} />
      {items.length === 0 ? (
        <EmptyLine direction={direction} language={language} text={emptyText} />
      ) : (
        <View accessibilityRole="list" style={styles.flatList}>
          {items.map((item) => (
            <View
              accessibilityLabel={item.accessibilityLabel}
              accessibilityRole="summary"
              key={item.id}
              style={[styles.listRow, { flexDirection: logicalRowDirection(direction) }]}
            >
              <View
                aria-hidden
                importantForAccessibility="no-hide-descendants"
                style={styles.learningMark}
              >
                <GhafIcon color={colors.secondary} name="science" size={22} />
              </View>
              <View style={styles.flexCopy}>
                <Text
                  brand
                  color="deepForest"
                  direction={direction}
                  language={language}
                  variant="label"
                >
                  {item.title}
                </Text>
                <Text
                  brand
                  color="secondary"
                  direction={direction}
                  language={language}
                  variant="caption"
                >
                  {item.statusLabel}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function SuggestionSection({
  direction,
  emptyText,
  heading,
  items,
  language,
  reducedMotion,
}: {
  readonly direction: TextDirection;
  readonly emptyText: string;
  readonly heading: string;
  readonly items: readonly ParentProgressSuggestionPresentation[];
  readonly language: LocaleCode;
  readonly reducedMotion: boolean;
}) {
  return (
    <View style={styles.section}>
      <SectionHeading direction={direction} icon="plus" language={language} title={heading} />
      {items.length === 0 ? (
        <EmptyLine direction={direction} language={language} text={emptyText} />
      ) : (
        <View accessibilityRole="list" style={styles.suggestionList}>
          {items.map((item) => (
            <View
              accessibilityLabel={item.accessibilityLabel}
              key={item.id}
              style={styles.suggestion}
            >
              <Text
                brand
                color="deepForest"
                direction={direction}
                language={language}
                variant="heading"
              >
                {item.title}
              </Text>
              <Text brand color="onSurfaceVariant" direction={direction} language={language}>
                {item.rationale}
              </Text>
              <View
                style={[styles.suggestionStatus, { flexDirection: logicalRowDirection(direction) }]}
              >
                <View aria-hidden importantForAccessibility="no-hide-descendants">
                  <GhafIcon color={colors.secondary} name="info" size={20} />
                </View>
                <View style={styles.flexCopy}>
                  <Text
                    brand
                    color="secondary"
                    direction={direction}
                    language={language}
                    variant="label"
                  >
                    {item.statusLabel}
                  </Text>
                  <Text
                    brand
                    color="onSurfaceVariant"
                    direction={direction}
                    language={language}
                    variant="caption"
                  >
                    {item.reviewNotice}
                  </Text>
                </View>
              </View>
              {item.action ? (
                <Button
                  accessibilityHint={item.action.accessibilityHint}
                  accessibilityLabel={item.action.accessibilityLabel}
                  brand
                  busy={item.action.busy}
                  direction={direction}
                  disabled={item.action.disabled}
                  language={language}
                  onPress={item.action.onPress}
                  size="regular"
                  style={reducedMotion ? styles.actionStatic : undefined}
                  testID={item.action.testID}
                >
                  {item.action.label}
                </Button>
              ) : item.unavailableText ? (
                <Text
                  brand
                  color="onSurfaceVariant"
                  direction={direction}
                  language={language}
                  variant="caption"
                >
                  {item.unavailableText}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function EmptyLine({
  direction,
  language,
  text,
}: {
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly text: string;
}) {
  return (
    <View style={[styles.emptyLine, { flexDirection: logicalRowDirection(direction) }]}>
      <View aria-hidden importantForAccessibility="no-hide-descendants">
        <GhafIcon color={colors.outline} name="info" size={20} />
      </View>
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        language={language}
        style={styles.flexCopy}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    minWidth: 0,
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  hero: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.lg,
  },
  heroMark: {
    width: 56,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    ...r001Shadows.soft,
  },
  flexCopy: {
    flex: 1,
    minWidth: 0,
  },
  srAnnouncement: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  selectorSection: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  profileOptions: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  profileOption: {
    minWidth: 0,
    minHeight: layout.touchTarget,
    flexGrow: 1,
    flexBasis: 148,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  profileOptionSelected: {
    borderColor: colors.ghafEmerald,
    backgroundColor: colors.ghafEmeraldSelection,
  },
  profileLabel: {
    minWidth: 0,
    flexShrink: 1,
  },
  disabled: {
    opacity: opacity.disabled,
  },
  pressedStatic: {
    opacity: opacity.pressed,
  },
  pressedMotion: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.98 }],
  },
  stateBand: {
    width: '100%',
    minWidth: 0,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  trustBand: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
  },
  section: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
  },
  sectionHeading: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionMark: {
    width: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.lg,
    backgroundColor: colors.ghafEmeraldTint,
  },
  summaryGroup: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
  },
  metric: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    padding: spacing.lg,
  },
  metricWater: {
    borderColor: colors.secondaryFixedDim,
    backgroundColor: colors.secondaryTint,
  },
  metricLeaf: {
    borderColor: colors.outlineVariant,
    backgroundColor: colors.primaryFixedTint,
  },
  progressGroup: {
    width: '100%',
    minWidth: 0,
    gap: spacing.xs,
  },
  progressTrack: {
    width: '100%',
    minWidth: 0,
    minHeight: 10,
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerHigh,
  },
  progressFill: {
    minHeight: 10,
    borderRadius: r001Radii.pill,
  },
  progressWater: {
    backgroundColor: colors.mangroveTeal,
  },
  progressLeaf: {
    backgroundColor: colors.ghafEmerald,
  },
  progressAmber: {
    backgroundColor: colors.solarAmber,
  },
  flatList: {
    width: '100%',
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    overflow: 'hidden',
  },
  listRow: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    padding: spacing.md,
  },
  completeMark: {
    width: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
    backgroundColor: colors.ghafEmeraldTint,
  },
  badgeRow: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    padding: spacing.md,
  },
  badgeHeading: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgeMark: {
    width: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.lg,
    backgroundColor: colors.solarAmberTint,
  },
  learningMark: {
    width: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.lg,
    backgroundColor: colors.secondaryTint,
  },
  suggestionList: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
  },
  suggestion: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondaryFixedDim,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  suggestionStatus: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.secondaryTint,
    padding: spacing.md,
  },
  actionStatic: {
    transform: [{ scale: 1 }],
  },
  emptyLine: {
    width: '100%',
    minWidth: 0,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
  },
  emptyState: {
    width: '100%',
    minWidth: 0,
    minHeight: spacing.massive * 3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.xl,
  },
  emptyMark: {
    width: 56,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.secondaryTint,
  },
});
