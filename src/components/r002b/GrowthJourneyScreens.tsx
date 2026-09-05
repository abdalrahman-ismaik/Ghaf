import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { Text } from '@/components/primitives';
import {
  colors,
  layout,
  logicalRowDirection,
  opacity,
  r001Radii,
  spacing,
  type AppColor,
} from '@/design/tokens';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';

export interface GrowthJourneyPresentationProps {
  direction: TextDirection;
  language: LocaleCode;
  reducedMotion: boolean;
}

export interface GrowthActionPresentation {
  accessibilityLabel: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
}

export type GrowthContentState =
  | 'ready'
  | 'not_entered'
  | 'loading'
  | 'offline'
  | 'interrupted'
  | 'error'
  | 'complete'
  | 'unavailable';

export interface TodayImpactPathCardProps extends GrowthJourneyPresentationProps {
  action?: GrowthActionPresentation;
  chapterTitle: string;
  contentState: GrowthContentState;
  groupLabel: string;
  lifetimeLabel: string;
  lifetimeValue: string;
  nearestStationLabel: string;
  requirementText: string;
  statusLabel: string;
  supportingText?: string;
  testID?: string;
}

export interface GardenChapterEntryPresentation {
  accessibilityLabel: string;
  action?: GrowthActionPresentation;
  description: string;
  iconName: GhafIconName;
  id: string;
  statusLabel: string;
  title: string;
  tone: 'water' | 'leaf' | 'amber';
}

export interface GardenChapterModuleProps extends GrowthJourneyPresentationProps {
  archiveLabel: string;
  chapterTitle: string;
  contentState: GrowthContentState;
  currentStageLabel: string;
  currentStageValue: string;
  description: string;
  entries: readonly GardenChapterEntryPresentation[];
  groupLabel: string;
  lifetimeLabel: string;
  lifetimeValue: string;
  statusLabel: string;
  testID?: string;
}

export type ImpactPathStationState =
  'locked' | 'current' | 'reached' | 'unlocked' | 'complete' | 'awaiting_review';

export interface ImpactPathStationPresentation {
  accessibilityLabel: string;
  action?: GrowthActionPresentation;
  criterionText: string;
  id: string;
  state: ImpactPathStationState;
  statusLabel: string;
  thresholdLabel: string;
  title: string;
}

export interface ImpactPathScreenProps extends GrowthJourneyPresentationProps {
  archiveLabel: string;
  archiveValue: string;
  chapterTitle: string;
  contentState: GrowthContentState;
  currentChapterLabel: string;
  currentChapterValue: string;
  disclosureText: string;
  groupLabel: string;
  lifetimeLabel: string;
  lifetimeValue: string;
  relatedActions?: readonly GrowthActionPresentation[];
  stations: readonly ImpactPathStationPresentation[];
  statusLabel: string;
  summaryText: string;
  testID?: string;
}

export type BadgePresentationState =
  'locked' | 'in_progress' | 'awaiting_review' | 'earned' | 'recommended';

export interface BadgeGalleryItemPresentation {
  accessibilityLabel: string;
  criterionText: string;
  id: string;
  onPress: () => void;
  progressText: string;
  state: BadgePresentationState;
  statusLabel: string;
  testID?: string;
  title: string;
}

export interface BadgeGalleryProps extends GrowthJourneyPresentationProps {
  chapterTitle: string;
  contentState: GrowthContentState;
  description: string;
  groupLabel: string;
  items: readonly BadgeGalleryItemPresentation[];
  privacyNote: string;
  recommendedItemId?: string;
  recommendedLabel?: string;
  statusLabel: string;
  testID?: string;
}

export interface BadgeCriterionPresentation {
  accessibilityLabel: string;
  awaitingReview: boolean;
  id: string;
  label: string;
  progressText: string;
  satisfied: boolean;
  statusLabel: string;
}

export interface BadgeDetailProps extends GrowthJourneyPresentationProps {
  accessibilityLabel: string;
  action?: GrowthActionPresentation;
  badgeTitle: string;
  chapterTitle: string;
  contentState: GrowthContentState;
  criteria: readonly BadgeCriterionPresentation[];
  criteriaHeading: string;
  earnedDateText?: string;
  groupLabel: string;
  historicalDateText?: string;
  privacyNote: string;
  progressLabel: string;
  sourceHeading: string;
  sourceNote: string;
  state: BadgePresentationState;
  statusLabel: string;
  testID?: string;
  whyHeading: string;
  whyText: string;
}

interface ResponsiveGrowthLayout {
  compact: boolean;
  expanded: boolean;
}

function useResponsiveGrowthLayout(): ResponsiveGrowthLayout {
  const { fontScale, width } = useWindowDimensions();
  const compact = width < 360 || fontScale >= 1.5;
  const expanded = width >= 430 && fontScale < 1.5;

  return { compact, expanded };
}

export function TodayImpactPathCard({
  action,
  chapterTitle,
  contentState,
  direction,
  groupLabel,
  language,
  lifetimeLabel,
  lifetimeValue,
  nearestStationLabel,
  reducedMotion,
  requirementText,
  statusLabel,
  supportingText,
  testID = 'growth-today-path-card',
}: TodayImpactPathCardProps) {
  const { compact } = useResponsiveGrowthLayout();

  return (
    <View style={[styles.todayCard, contentSurfaceStyle[contentState]]} testID={testID}>
      <View style={styles.informationGroup}>
        <View style={[styles.headingRow, { flexDirection: logicalRowDirection(direction) }]}>
          <GrowthMark iconName="water-drop" tone="water" />
          <View style={styles.headingCopy}>
            <Text
              accessibilityLabel={groupLabel}
              accessibilityRole="header"
              brand
              color="deepForest"
              direction={direction}
              language={language}
              variant="heading"
            >
              {chapterTitle}
            </Text>
            <SurfaceStatus
              contentState={contentState}
              direction={direction}
              language={language}
              statusLabel={statusLabel}
            />
          </View>
        </View>

        <View
          style={[
            styles.summaryGrid,
            {
              flexDirection: compact ? 'column' : logicalRowDirection(direction),
            },
          ]}
        >
          <SummaryValue
            direction={direction}
            label={lifetimeLabel}
            language={language}
            tone="water"
            value={lifetimeValue}
          />
          <View style={styles.requirementBlock}>
            <Text brand color="secondary" direction={direction} language={language} variant="label">
              {nearestStationLabel}
            </Text>
            <Text brand color="deepForest" direction={direction} language={language}>
              {requirementText}
            </Text>
          </View>
        </View>

        {supportingText ? (
          <Text brand color="onSurfaceVariant" direction={direction} language={language}>
            {supportingText}
          </Text>
        ) : null}
      </View>

      {action ? (
        <GrowthActionButton
          action={action}
          direction={direction}
          language={language}
          reducedMotion={reducedMotion}
          tone="water"
        />
      ) : null}
    </View>
  );
}

export function GardenChapterModule({
  archiveLabel,
  chapterTitle,
  contentState,
  currentStageLabel,
  currentStageValue,
  description,
  direction,
  entries,
  groupLabel,
  language,
  lifetimeLabel,
  lifetimeValue,
  reducedMotion,
  statusLabel,
  testID = 'growth-garden-chapter',
}: GardenChapterModuleProps) {
  const { expanded } = useResponsiveGrowthLayout();

  return (
    <View style={styles.chapterSection} testID={testID}>
      <View style={[styles.headingRow, { flexDirection: logicalRowDirection(direction) }]}>
        <GrowthMark iconName="water-drop" tone="water" />
        <View style={styles.headingCopy}>
          <Text
            accessibilityLabel={groupLabel}
            accessibilityRole="header"
            brand
            color="deepForest"
            direction={direction}
            language={language}
            variant="heading"
          >
            {chapterTitle}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} language={language}>
            {description}
          </Text>
        </View>
      </View>

      <SurfaceStatus
        contentState={contentState}
        direction={direction}
        language={language}
        statusLabel={statusLabel}
      />

      <View
        style={[
          styles.projectionPair,
          expanded ? { flexDirection: logicalRowDirection(direction) } : null,
        ]}
      >
        <SummaryValue
          direction={direction}
          label={currentStageLabel}
          language={language}
          tone="leaf"
          value={currentStageValue}
        />
        <SummaryValue
          direction={direction}
          label={lifetimeLabel}
          language={language}
          tone="water"
          value={lifetimeValue}
        />
      </View>

      <View style={[styles.archiveCue, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon color={colors.ghafEmerald} name="check" size={20} />
        <Text
          brand
          color="deepForest"
          direction={direction}
          language={language}
          style={styles.flexCopy}
          variant="label"
        >
          {archiveLabel}
        </Text>
      </View>

      <View
        style={[
          styles.entryGrid,
          expanded ? styles.entryGridExpanded : null,
          expanded ? { flexDirection: logicalRowDirection(direction) } : null,
        ]}
      >
        {entries.map((entry) => (
          <GardenChapterEntry
            direction={direction}
            entry={entry}
            expanded={expanded}
            key={entry.id}
            language={language}
            reducedMotion={reducedMotion}
          />
        ))}
      </View>
    </View>
  );
}

export function ImpactPathScreen({
  archiveLabel,
  archiveValue,
  chapterTitle,
  contentState,
  currentChapterLabel,
  currentChapterValue,
  direction,
  disclosureText,
  groupLabel,
  language,
  lifetimeLabel,
  lifetimeValue,
  reducedMotion,
  relatedActions = [],
  stations,
  statusLabel,
  summaryText,
  testID = 'growth-impact-path',
}: ImpactPathScreenProps) {
  const { compact } = useResponsiveGrowthLayout();

  return (
    <View style={styles.screenSection} testID={testID}>
      <View style={[styles.heroHeader, { flexDirection: logicalRowDirection(direction) }]}>
        <GrowthMark iconName="water-drop" tone="water" />
        <View style={styles.headingCopy}>
          <Text
            accessibilityLabel={groupLabel}
            accessibilityRole="header"
            brand
            color="deepForest"
            direction={direction}
            language={language}
            variant="screenTitle"
          >
            {chapterTitle}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} language={language}>
            {summaryText}
          </Text>
        </View>
      </View>

      <SurfaceStatus
        contentState={contentState}
        direction={direction}
        language={language}
        statusLabel={statusLabel}
      />

      <View
        style={[
          styles.summaryGrid,
          {
            flexDirection: compact ? 'column' : logicalRowDirection(direction),
          },
        ]}
      >
        <SummaryValue
          direction={direction}
          label={lifetimeLabel}
          language={language}
          tone="water"
          value={lifetimeValue}
        />
        <SummaryValue
          direction={direction}
          label={currentChapterLabel}
          language={language}
          tone="leaf"
          value={currentChapterValue}
        />
      </View>

      <View style={[styles.archiveCue, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon color={colors.ghafEmerald} name="check-filled" size={22} />
        <View style={styles.flexCopy}>
          <Text brand color="ghafEmerald" direction={direction} language={language} variant="label">
            {archiveLabel}
          </Text>
          <Text brand color="deepForest" direction={direction} language={language} tabular>
            {archiveValue}
          </Text>
        </View>
      </View>

      <View accessibilityRole="list" style={styles.stationList}>
        {stations.map((station) => (
          <ImpactPathStation
            direction={direction}
            key={station.id}
            language={language}
            reducedMotion={reducedMotion}
            station={station}
          />
        ))}
      </View>

      <View style={[styles.disclosure, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon color={colors.secondary} name="info" size={20} />
        <Text
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={language}
          style={styles.flexCopy}
          variant="caption"
        >
          {disclosureText}
        </Text>
      </View>

      {relatedActions.length > 0 ? (
        <View style={styles.actionStack}>
          {relatedActions.map((action) => (
            <GrowthActionButton
              action={action}
              direction={direction}
              key={action.testID ?? action.accessibilityLabel}
              language={language}
              reducedMotion={reducedMotion}
              tone="neutral"
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function BadgeGallery({
  chapterTitle,
  contentState,
  description,
  direction,
  groupLabel,
  items,
  language,
  privacyNote,
  recommendedItemId,
  recommendedLabel,
  reducedMotion,
  statusLabel,
  testID = 'growth-badge-gallery',
}: BadgeGalleryProps) {
  const { compact } = useResponsiveGrowthLayout();
  const recommendedItem = recommendedItemId
    ? items.find((item) => item.id === recommendedItemId)
    : undefined;
  const showRecommended = Boolean(recommendedItem && recommendedLabel);
  const gridItems = showRecommended
    ? items.filter((item) => item.id !== recommendedItem?.id)
    : items;

  return (
    <View style={styles.screenSection} testID={testID}>
      <View style={[styles.heroHeader, { flexDirection: logicalRowDirection(direction) }]}>
        <GrowthMark iconName="flower" tone="amber" />
        <View style={styles.headingCopy}>
          <Text
            accessibilityLabel={groupLabel}
            accessibilityRole="header"
            brand
            color="deepForest"
            direction={direction}
            language={language}
            variant="screenTitle"
          >
            {chapterTitle}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} language={language}>
            {description}
          </Text>
        </View>
      </View>

      <SurfaceStatus
        contentState={contentState}
        direction={direction}
        language={language}
        statusLabel={statusLabel}
      />

      <View style={[styles.privacyCue, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon color={colors.ghafEmerald} name="shield" size={20} />
        <Text
          brand
          color="deepForest"
          direction={direction}
          language={language}
          style={styles.flexCopy}
          variant="caption"
        >
          {privacyNote}
        </Text>
      </View>

      {showRecommended && recommendedItem && recommendedLabel ? (
        <View style={styles.featuredBadge}>
          <Text brand color="secondary" direction={direction} language={language} variant="label">
            {recommendedLabel}
          </Text>
          <BadgeGalleryCard
            direction={direction}
            item={recommendedItem}
            language={language}
            reducedMotion={reducedMotion}
            wide
          />
        </View>
      ) : null}

      <View
        accessibilityRole="list"
        style={[styles.badgeGrid, { flexDirection: logicalRowDirection(direction) }]}
      >
        {gridItems.map((item) => (
          <BadgeGalleryCard
            direction={direction}
            item={item}
            key={item.id}
            language={language}
            reducedMotion={reducedMotion}
            wide={compact}
          />
        ))}
      </View>
    </View>
  );
}

export function BadgeDetail({
  accessibilityLabel,
  action,
  badgeTitle,
  chapterTitle,
  contentState,
  criteria,
  criteriaHeading,
  direction,
  earnedDateText,
  groupLabel,
  historicalDateText,
  language,
  privacyNote,
  progressLabel,
  reducedMotion,
  sourceHeading,
  sourceNote,
  state,
  statusLabel,
  testID = 'growth-badge-detail',
  whyHeading,
  whyText,
}: BadgeDetailProps) {
  return (
    <View style={styles.screenSection} testID={testID}>
      <View style={styles.detailHero}>
        <BadgeMedallion state={state} />
        <Text
          accessibilityLabel={groupLabel}
          accessibilityRole="header"
          align="center"
          brand
          color="deepForest"
          direction={direction}
          language={language}
          variant="screenTitle"
        >
          {badgeTitle}
        </Text>
        <Text
          align="center"
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={language}
        >
          {chapterTitle}
        </Text>
        <View
          accessible
          accessibilityLabel={accessibilityLabel}
          accessibilityLanguage={language === 'ar' ? 'ar-AE' : 'en-AE'}
          style={styles.detailStatus}
        >
          <StatusChip
            direction={direction}
            language={language}
            state={state}
            statusLabel={statusLabel}
          />
          <Text
            align="center"
            brand
            color="deepForest"
            direction={direction}
            language={language}
            tabular
            variant="label"
          >
            {progressLabel}
          </Text>
          {earnedDateText ? (
            <Text
              align="center"
              brand
              color="onSurfaceVariant"
              direction={direction}
              language={language}
              variant="caption"
            >
              {earnedDateText}
            </Text>
          ) : null}
          {historicalDateText ? (
            <Text
              align="center"
              brand
              color="onSurfaceVariant"
              direction={direction}
              language={language}
              variant="caption"
            >
              {historicalDateText}
            </Text>
          ) : null}
        </View>
      </View>

      <SurfaceStatus
        contentState={contentState}
        direction={direction}
        language={language}
        statusLabel={statusLabel}
      />

      <View style={styles.detailSection}>
        <Text
          accessibilityRole="header"
          brand
          color="deepForest"
          direction={direction}
          language={language}
          variant="heading"
        >
          {criteriaHeading}
        </Text>
        <View accessibilityRole="list" style={styles.criteriaList}>
          {criteria.map((criterion) => (
            <CriterionRow
              criterion={criterion}
              direction={direction}
              key={criterion.id}
              language={language}
            />
          ))}
        </View>
      </View>

      <DetailCopySection
        body={whyText}
        direction={direction}
        language={language}
        title={whyHeading}
      />
      <DetailCopySection
        body={sourceNote}
        direction={direction}
        language={language}
        title={sourceHeading}
      />

      <View style={[styles.privacyCue, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon color={colors.ghafEmerald} name="shield" size={20} />
        <Text
          brand
          color="deepForest"
          direction={direction}
          language={language}
          style={styles.flexCopy}
          variant="caption"
        >
          {privacyNote}
        </Text>
      </View>

      {action ? (
        <GrowthActionButton
          action={action}
          direction={direction}
          language={language}
          reducedMotion={reducedMotion}
          tone="primary"
        />
      ) : null}
    </View>
  );
}

function SurfaceStatus({
  contentState,
  direction,
  language,
  statusLabel,
}: {
  contentState: GrowthContentState;
  direction: TextDirection;
  language: LocaleCode;
  statusLabel: string;
}) {
  return (
    <View
      style={[
        styles.surfaceStatus,
        statusSurfaceStyle[contentState],
        { flexDirection: logicalRowDirection(direction) },
      ]}
    >
      <GhafIcon
        color={colors[statusColorForContentState(contentState)]}
        name={contentIconForState(contentState)}
        size={16}
      />
      <Text
        accessibilityLiveRegion="polite"
        brand
        color={statusColorForContentState(contentState)}
        direction={direction}
        language={language}
        style={styles.flexCopy}
        variant="caption"
      >
        {statusLabel}
      </Text>
    </View>
  );
}

function SummaryValue({
  direction,
  label,
  language,
  tone,
  value,
}: {
  direction: TextDirection;
  label: string;
  language: LocaleCode;
  tone: 'water' | 'leaf';
  value: string;
}) {
  return (
    <View
      style={[styles.summaryValue, tone === 'water' ? styles.waterSummary : styles.leafSummary]}
    >
      <Text
        brand
        color={tone === 'water' ? 'secondary' : 'ghafEmerald'}
        direction={direction}
        language={language}
        variant="caption"
      >
        {label}
      </Text>
      <Text
        brand
        color="deepForest"
        direction={direction}
        language={language}
        tabular
        variant="heading"
      >
        {value}
      </Text>
    </View>
  );
}

function GardenChapterEntry({
  direction,
  entry,
  expanded,
  language,
  reducedMotion,
}: GrowthJourneyPresentationProps & {
  entry: GardenChapterEntryPresentation;
  expanded: boolean;
}) {
  return (
    <View style={[styles.entryCard, expanded ? styles.entryCardExpanded : null]}>
      <View
        accessible
        accessibilityLabel={entry.accessibilityLabel}
        accessibilityLanguage={language === 'ar' ? 'ar-AE' : 'en-AE'}
        style={[styles.headingRow, { flexDirection: logicalRowDirection(direction) }]}
      >
        <GrowthMark iconName={entry.iconName} tone={entry.tone} />
        <View style={styles.headingCopy}>
          <Text brand color="deepForest" direction={direction} language={language} variant="label">
            {entry.title}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} language={language}>
            {entry.description}
          </Text>
          <Text
            brand
            color={toneTextColor[entry.tone]}
            direction={direction}
            language={language}
            variant="caption"
          >
            {entry.statusLabel}
          </Text>
        </View>
      </View>
      {entry.action ? (
        <GrowthActionButton
          action={entry.action}
          direction={direction}
          language={language}
          reducedMotion={reducedMotion}
          tone={entry.tone === 'amber' ? 'neutral' : entry.tone}
        />
      ) : null}
    </View>
  );
}

function ImpactPathStation({
  direction,
  language,
  reducedMotion,
  station,
}: GrowthJourneyPresentationProps & { station: ImpactPathStationPresentation }) {
  return (
    <View style={[styles.stationRow, { flexDirection: logicalRowDirection(direction) }]}>
      <View aria-hidden style={styles.stationRail}>
        <View style={[styles.stationMarker, stationMarkerStyle[station.state]]}>
          <GhafIcon
            color={colors[stationColorForState(station.state)]}
            name={stationIconForState(station.state)}
            size={20}
          />
        </View>
        <View style={styles.stationLine} />
      </View>
      <View style={[styles.stationCard, stationCardStyle[station.state]]}>
        <View
          accessible
          accessibilityLabel={station.accessibilityLabel}
          accessibilityLanguage={language === 'ar' ? 'ar-AE' : 'en-AE'}
          style={styles.stationCopy}
        >
          <Text
            brand
            color={stationColorForState(station.state)}
            direction={direction}
            language={language}
            tabular
            variant="label"
          >
            {station.thresholdLabel}
          </Text>
          <Text
            brand
            color="deepForest"
            direction={direction}
            language={language}
            variant="heading"
          >
            {station.title}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} language={language}>
            {station.criterionText}
          </Text>
          <StatusChip
            direction={direction}
            language={language}
            state={station.state}
            statusLabel={station.statusLabel}
          />
        </View>
        {station.action ? (
          <GrowthActionButton
            action={station.action}
            direction={direction}
            language={language}
            reducedMotion={reducedMotion}
            tone="water"
          />
        ) : null}
      </View>
    </View>
  );
}

function BadgeGalleryCard({
  direction,
  item,
  language,
  reducedMotion,
  wide,
}: GrowthJourneyPresentationProps & {
  item: BadgeGalleryItemPresentation;
  wide: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={item.accessibilityLabel}
      accessibilityLanguage={language === 'ar' ? 'ar-AE' : 'en-AE'}
      accessibilityRole="button"
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.badgeCard,
        wide ? styles.badgeCardWide : null,
        badgeCardStyle[item.state],
        pressed ? (reducedMotion ? styles.pressedStatic : styles.pressedMotion) : null,
      ]}
      testID={item.testID}
    >
      <BadgeMedallion state={item.state} />
      <View style={styles.badgeCopy}>
        <Text
          align="center"
          brand
          color="deepForest"
          direction={direction}
          language={language}
          variant="label"
        >
          {item.title}
        </Text>
        <StatusChip
          direction={direction}
          language={language}
          state={item.state}
          statusLabel={item.statusLabel}
        />
        <Text
          align="center"
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={language}
          variant="caption"
        >
          {item.criterionText}
        </Text>
        <Text
          align="center"
          brand
          color="deepForest"
          direction={direction}
          language={language}
          tabular
          variant="caption"
        >
          {item.progressText}
        </Text>
      </View>
    </Pressable>
  );
}

function CriterionRow({
  criterion,
  direction,
  language,
}: {
  criterion: BadgeCriterionPresentation;
  direction: TextDirection;
  language: LocaleCode;
}) {
  const iconName = criterion.satisfied
    ? 'check-filled'
    : criterion.awaitingReview
      ? 'info'
      : 'lock';
  const tone: AppColor = criterion.satisfied
    ? 'ghafEmerald'
    : criterion.awaitingReview
      ? 'secondary'
      : 'onSurfaceVariant';

  return (
    <View
      accessible
      accessibilityLabel={criterion.accessibilityLabel}
      accessibilityLanguage={language === 'ar' ? 'ar-AE' : 'en-AE'}
      style={[styles.criterionRow, { flexDirection: logicalRowDirection(direction) }]}
    >
      <View aria-hidden style={styles.criterionIcon}>
        <GhafIcon color={colors[tone]} name={iconName} size={22} />
      </View>
      <View style={styles.flexCopy}>
        <Text brand color="deepForest" direction={direction} language={language} variant="label">
          {criterion.label}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} language={language} tabular>
          {criterion.progressText}
        </Text>
        <Text brand color={tone} direction={direction} language={language} variant="caption">
          {criterion.statusLabel}
        </Text>
      </View>
    </View>
  );
}

function DetailCopySection({
  body,
  direction,
  language,
  title,
}: {
  body: string;
  direction: TextDirection;
  language: LocaleCode;
  title: string;
}) {
  return (
    <View style={styles.detailSection}>
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
      <Text brand color="onSurfaceVariant" direction={direction} language={language}>
        {body}
      </Text>
    </View>
  );
}

function GrowthActionButton({
  action,
  direction,
  language,
  reducedMotion,
  tone,
}: GrowthJourneyPresentationProps & {
  action: GrowthActionPresentation;
  tone: 'primary' | 'water' | 'leaf' | 'neutral';
}) {
  const { accessibilityLabel, disabled = false, label, testID } = action;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityLanguage={language === 'ar' ? 'ar-AE' : 'en-AE'}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={action.onPress}
      style={({ pressed }) => [
        styles.actionButton,
        actionButtonStyle[tone],
        { flexDirection: logicalRowDirection(direction) },
        pressed ? (reducedMotion ? styles.pressedStatic : styles.pressedMotion) : null,
        disabled ? styles.disabled : null,
      ]}
      testID={testID}
    >
      <Text
        align="center"
        brand
        color={actionTextColor[tone]}
        direction={direction}
        language={language}
        style={styles.actionLabel}
        variant="control"
      >
        {label}
      </Text>
      <View aria-hidden style={styles.actionIcon}>
        <GhafIcon
          color={colors[actionTextColor[tone]]}
          direction={direction === 'rtl' ? 'ltr' : 'rtl'}
          name="arrow-back"
          size={20}
        />
      </View>
    </Pressable>
  );
}

function GrowthMark({
  iconName,
  tone,
}: {
  iconName: GhafIconName;
  tone: 'water' | 'leaf' | 'amber';
}) {
  return (
    <View aria-hidden style={[styles.growthMark, growthMarkStyle[tone]]}>
      <GhafIcon color={colors[toneTextColor[tone]]} name={iconName} size={24} />
    </View>
  );
}

function BadgeMedallion({ state }: { state: BadgePresentationState }) {
  return (
    <View aria-hidden style={[styles.badgeMedallion, badgeMedallionStyle[state]]}>
      <GhafIcon
        color={colors[badgeColorForState(state)]}
        name={badgeIconForState(state)}
        size={28}
        strokeWidth={2}
      />
    </View>
  );
}

function StatusChip({
  direction,
  language,
  state,
  statusLabel,
}: {
  direction: TextDirection;
  language: LocaleCode;
  state: BadgePresentationState | ImpactPathStationState;
  statusLabel: string;
}) {
  const tone = statusColorForState(state);

  return (
    <View
      style={[
        styles.statusChip,
        statusChipStyle[state],
        { flexDirection: logicalRowDirection(direction) },
      ]}
    >
      <GhafIcon color={colors[tone]} name={statusIconForState(state)} size={15} />
      <Text brand color={tone} direction={direction} language={language} variant="caption">
        {statusLabel}
      </Text>
    </View>
  );
}

function contentIconForState(state: GrowthContentState): GhafIconName {
  switch (state) {
    case 'complete':
      return 'check-filled';
    case 'error':
      return 'info';
    case 'offline':
      return 'media-off';
    case 'interrupted':
      return 'info';
    case 'unavailable':
      return 'lock';
    case 'loading':
      return 'simple';
    case 'not_entered':
      return 'water-drop';
    case 'ready':
      return 'leaf';
  }
}

function statusColorForContentState(state: GrowthContentState): AppColor {
  switch (state) {
    case 'complete':
    case 'ready':
      return 'ghafEmerald';
    case 'error':
      return 'error';
    case 'not_entered':
      return 'secondary';
    case 'offline':
    case 'interrupted':
      return 'tertiaryContainer';
    case 'loading':
    case 'unavailable':
      return 'onSurfaceVariant';
  }
}

function stationIconForState(state: ImpactPathStationState): GhafIconName {
  switch (state) {
    case 'complete':
    case 'reached':
      return 'check-filled';
    case 'current':
    case 'unlocked':
      return 'water-drop';
    case 'awaiting_review':
      return 'info';
    case 'locked':
      return 'lock';
  }
}

function stationColorForState(state: ImpactPathStationState): AppColor {
  switch (state) {
    case 'complete':
    case 'reached':
      return 'ghafEmerald';
    case 'current':
    case 'unlocked':
      return 'secondary';
    case 'awaiting_review':
      return 'tertiaryContainer';
    case 'locked':
      return 'onSurfaceVariant';
  }
}

function badgeIconForState(state: BadgePresentationState): GhafIconName {
  switch (state) {
    case 'earned':
      return 'check-filled';
    case 'in_progress':
    case 'recommended':
      return 'flower';
    case 'awaiting_review':
      return 'info';
    case 'locked':
      return 'lock';
  }
}

function badgeColorForState(state: BadgePresentationState): AppColor {
  switch (state) {
    case 'earned':
      return 'ghafEmerald';
    case 'in_progress':
    case 'recommended':
      return 'secondary';
    case 'awaiting_review':
      return 'tertiaryContainer';
    case 'locked':
      return 'onSurfaceVariant';
  }
}

function statusColorForState(state: BadgePresentationState | ImpactPathStationState): AppColor {
  if (state === 'earned' || state === 'complete' || state === 'reached') return 'ghafEmerald';
  if (
    state === 'in_progress' ||
    state === 'recommended' ||
    state === 'current' ||
    state === 'unlocked'
  )
    return 'secondary';
  if (state === 'awaiting_review') return 'tertiaryContainer';
  return 'onSurfaceVariant';
}

function statusIconForState(state: BadgePresentationState | ImpactPathStationState): GhafIconName {
  if (state === 'earned' || state === 'complete' || state === 'reached') return 'check-filled';
  if (state === 'in_progress' || state === 'recommended') return 'flower';
  if (state === 'current' || state === 'unlocked') return 'water-drop';
  if (state === 'awaiting_review') return 'info';
  return 'lock';
}

const toneTextColor = {
  amber: 'tertiaryContainer',
  leaf: 'ghafEmerald',
  water: 'secondary',
} as const satisfies Record<GardenChapterEntryPresentation['tone'], AppColor>;

const actionTextColor = {
  leaf: 'ghafEmerald',
  neutral: 'deepForest',
  primary: 'onPrimary',
  water: 'secondary',
} as const satisfies Record<'primary' | 'water' | 'leaf' | 'neutral', AppColor>;

const contentSurfaceStyle = StyleSheet.create({
  complete: { borderColor: colors.primaryFixedDim },
  error: { borderColor: colors.error },
  interrupted: { borderColor: colors.solarAmberBorder },
  loading: { borderColor: colors.outlineVariant },
  not_entered: { borderColor: colors.secondaryFixedDim },
  offline: { borderColor: colors.solarAmberBorder },
  ready: { borderColor: colors.secondaryFixedDim },
  unavailable: { borderColor: colors.outlineVariant },
});

const statusSurfaceStyle = StyleSheet.create({
  complete: { backgroundColor: colors.primaryFixedTint },
  error: { backgroundColor: colors.errorContainer },
  interrupted: { backgroundColor: colors.solarAmberTint },
  loading: { backgroundColor: colors.surfaceContainer },
  not_entered: { backgroundColor: colors.mangroveTealTint },
  offline: { backgroundColor: colors.solarAmberTint },
  ready: { backgroundColor: colors.ghafEmeraldTint },
  unavailable: { backgroundColor: colors.surfaceContainer },
});

const growthMarkStyle = StyleSheet.create({
  amber: { backgroundColor: colors.solarAmberTint },
  leaf: { backgroundColor: colors.primaryFixedTint },
  water: { backgroundColor: colors.mangroveTealTint },
});

const stationMarkerStyle = StyleSheet.create({
  awaiting_review: { backgroundColor: colors.solarAmberTint, borderColor: colors.solarAmberBorder },
  complete: { backgroundColor: colors.primaryFixedTint, borderColor: colors.primaryFixedDim },
  current: { backgroundColor: colors.mangroveTealTint, borderColor: colors.mangroveTeal },
  locked: { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant },
  reached: { backgroundColor: colors.primaryFixedTint, borderColor: colors.primaryFixedDim },
  unlocked: { backgroundColor: colors.mangroveTealTint, borderColor: colors.secondaryFixedDim },
});

const stationCardStyle = StyleSheet.create({
  awaiting_review: { backgroundColor: colors.solarAmberTint },
  complete: { backgroundColor: colors.primaryFixedTint },
  current: { backgroundColor: colors.mangroveTealTint },
  locked: { backgroundColor: colors.surfaceContainerLow },
  reached: { backgroundColor: colors.surfaceContainerLowest },
  unlocked: { backgroundColor: colors.secondaryTint },
});

const badgeCardStyle = StyleSheet.create({
  awaiting_review: { backgroundColor: colors.solarAmberTint, borderColor: colors.solarAmberBorder },
  earned: { backgroundColor: colors.primaryFixedTint, borderColor: colors.primaryFixedDim },
  in_progress: { backgroundColor: colors.mangroveTealTint, borderColor: colors.secondaryFixedDim },
  locked: { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant },
  recommended: { backgroundColor: colors.secondaryTint, borderColor: colors.mangroveTeal },
});

const badgeMedallionStyle = StyleSheet.create({
  awaiting_review: { backgroundColor: colors.solarAmberTint, borderColor: colors.solarAmberBorder },
  earned: { backgroundColor: colors.primaryFixedTint, borderColor: colors.primaryFixedDim },
  in_progress: { backgroundColor: colors.mangroveTealTint, borderColor: colors.secondaryFixedDim },
  locked: { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant },
  recommended: { backgroundColor: colors.secondaryTint, borderColor: colors.mangroveTeal },
});

const statusChipStyle = StyleSheet.create({
  awaiting_review: { backgroundColor: colors.solarAmberTint },
  complete: { backgroundColor: colors.primaryFixedTint },
  current: { backgroundColor: colors.mangroveTealTint },
  earned: { backgroundColor: colors.primaryFixedTint },
  in_progress: { backgroundColor: colors.mangroveTealTint },
  locked: { backgroundColor: colors.surfaceContainer },
  reached: { backgroundColor: colors.primaryFixedTint },
  recommended: { backgroundColor: colors.secondaryTint },
  unlocked: { backgroundColor: colors.secondaryTint },
});

const actionButtonStyle = StyleSheet.create({
  leaf: {
    backgroundColor: colors.primaryFixedTint,
    borderColor: colors.primaryFixedDim,
  },
  neutral: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
  },
  primary: {
    backgroundColor: colors.ghafEmerald,
    borderColor: colors.ghafEmerald,
  },
  water: {
    backgroundColor: colors.mangroveTealTint,
    borderColor: colors.secondaryFixedDim,
  },
});

const styles = StyleSheet.create({
  screenSection: {
    width: '100%',
    minWidth: 0,
    gap: spacing.xl,
  },
  todayCard: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.mangroveTealTint,
    padding: spacing.lg,
  },
  chapterSection: {
    width: '100%',
    minWidth: 0,
    gap: spacing.lg,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.lg,
  },
  headingRow: {
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  heroHeader: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  informationGroup: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
  },
  growthMark: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
  },
  surfaceStatus: {
    minWidth: 0,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: r001Radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  summaryGrid: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  summaryValue: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
    borderRadius: r001Radii.md,
    padding: spacing.md,
  },
  waterSummary: {
    backgroundColor: colors.mangroveTealTint,
  },
  leafSummary: {
    backgroundColor: colors.primaryFixedTint,
  },
  requirementBlock: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
    borderRadius: r001Radii.md,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
  },
  projectionPair: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  archiveCue: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.md,
  },
  entryGrid: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  entryGridExpanded: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  entryCard: {
    width: '100%',
    flexGrow: 1,
    minWidth: 0,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
  },
  entryCardExpanded: {
    width: '48%',
    maxWidth: '48%',
  },
  flexCopy: {
    flex: 1,
    minWidth: 0,
  },
  stationList: {
    width: '100%',
    minWidth: 0,
    gap: spacing.xs,
  },
  stationRow: {
    width: '100%',
    minWidth: 0,
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  stationRail: {
    width: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
  },
  stationMarker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: r001Radii.pill,
  },
  stationLine: {
    width: 2,
    minHeight: spacing.xxl,
    flex: 1,
    backgroundColor: colors.secondaryFixedDim,
  },
  stationCard: {
    flex: 1,
    minWidth: 0,
    gap: spacing.md,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    padding: spacing.md,
  },
  stationCopy: {
    minWidth: 0,
    gap: spacing.xs,
  },
  disclosure: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
  },
  actionStack: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  privacyCue: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.md,
  },
  featuredBadge: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.secondaryTint,
    padding: spacing.md,
  },
  badgeGrid: {
    width: '100%',
    minWidth: 0,
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  badgeCard: {
    minHeight: layout.touchTarget,
    width: '48%',
    maxWidth: '48%',
    minWidth: 0,
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    padding: spacing.md,
  },
  badgeCardWide: {
    width: '100%',
    maxWidth: '100%',
  },
  badgeMedallion: {
    width: spacing.huge,
    height: spacing.huge,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: r001Radii.pill,
  },
  badgeCopy: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusChip: {
    maxWidth: '100%',
    minHeight: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderRadius: r001Radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  detailHero: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.mangroveTealTint,
    padding: spacing.xl,
  },
  detailStatus: {
    maxWidth: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailSection: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  criteriaList: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  criterionRow: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
  },
  criterionIcon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
    backgroundColor: colors.surfaceContainerLowest,
  },
  actionButton: {
    width: '100%',
    minWidth: 0,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionLabel: {
    flex: 1,
    minWidth: 0,
  },
  actionIcon: {
    width: 24,
    height: 24,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedStatic: {
    opacity: opacity.pressed,
  },
  pressedMotion: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: opacity.disabled,
  },
});
