import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { LocalIllustration } from '@/components/illustrations';
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

export type LearningContentState =
  | 'loading'
  | 'ready'
  | 'offline'
  | 'interrupted'
  | 'resumed'
  | 'error'
  | 'submitting'
  | 'completed'
  | 'already_completed'
  | 'locked'
  | 'stories_disabled'
  | 'unavailable';

export interface LearningActionPresentation {
  accessibilityHint?: string;
  accessibilityLabel: string;
  busy?: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
}

export interface LearningProgressPresentation {
  accessibilityLabel: string;
  current: number;
  label: string;
  total: number;
  valueText: string;
  visualPercent: number;
}

export type LearningSectionState = 'complete' | 'current' | 'upcoming';

export interface LearningSectionPresentation {
  body: string;
  id: string;
  state: LearningSectionState;
  statusLabel: string;
  title: string;
}

export interface LearningCheckOptionPresentation {
  accessibilityLabel: string;
  disabled?: boolean;
  id: string;
  label: string;
  onPress: () => void;
  selected: boolean;
  testID?: string;
}

export type LearningCheckResult = 'idle' | 'retry' | 'correct';

export interface LearningCheckPresentation {
  accessibilityLabel: string;
  feedbackText?: string;
  heading: string;
  noFailText: string;
  options: readonly LearningCheckOptionPresentation[];
  prompt: string;
  result: LearningCheckResult;
}

export interface LearningScreenPresentationProps {
  announcementText?: string;
  backAction?: LearningActionPresentation;
  completionSummaryText?: string;
  contentState: LearningContentState;
  direction: 'ltr' | 'rtl';
  disclosureText: string;
  equivalenceText: string;
  groupLabel: string;
  language: 'ar' | 'en';
  modeLabel: string;
  modeSwitchAction: LearningActionPresentation;
  objectiveText: string;
  packageIdentityText: string;
  primaryAction?: LearningActionPresentation;
  progress: LearningProgressPresentation;
  reducedMotion: boolean;
  sections: readonly LearningSectionPresentation[];
  sourceHeading: string;
  sourceText: string;
  statusLabel: string;
  testID?: string;
  title: string;
  check?: LearningCheckPresentation;
}

export interface MangroveStoryScreenProps extends LearningScreenPresentationProps {
  illustrationAccessibilityLabel: string;
  illustrationUnavailable?: boolean;
  illustrationUnavailableText?: string;
}

export interface AccessibleLearningScreenProps extends LearningScreenPresentationProps {
  parentGuideHeading?: string;
  parentGuideText?: string;
}

interface ResponsiveLearningLayout {
  compact: boolean;
  expanded: boolean;
}

function useResponsiveLearningLayout(): ResponsiveLearningLayout {
  const { fontScale, width } = useWindowDimensions();
  const compact = width < 360 || fontScale >= 1.5;
  const expanded = width >= 600 && fontScale < 1.5;

  return { compact, expanded };
}

export function MangroveStoryScreen({
  illustrationAccessibilityLabel,
  illustrationUnavailable = false,
  illustrationUnavailableText,
  testID = 'learning-story-screen',
  ...props
}: MangroveStoryScreenProps) {
  const { compact } = useResponsiveLearningLayout();

  return (
    <LearningScreenFrame
      {...props}
      hero={
        illustrationUnavailable ? (
          illustrationUnavailableText ? (
            <IllustrationUnavailableNotice
              direction={props.direction}
              language={props.language}
              text={illustrationUnavailableText}
            />
          ) : null
        ) : (
          <MangroveHabitatArtwork
            accessibilityLabel={illustrationAccessibilityLabel}
            compact={compact}
            direction={props.direction}
            fallbackLabel={illustrationUnavailableText ?? illustrationAccessibilityLabel}
            language={props.language}
          />
        )
      }
      testID={testID}
    />
  );
}

export function AccessibleLearningScreen({
  parentGuideHeading,
  parentGuideText,
  testID = 'learning-accessible-screen',
  ...props
}: AccessibleLearningScreenProps) {
  const parentGuide =
    parentGuideHeading && parentGuideText ? (
      <ParentGuidePanel
        direction={props.direction}
        heading={parentGuideHeading}
        language={props.language}
        text={parentGuideText}
      />
    ) : undefined;

  return (
    <LearningScreenFrame
      {...props}
      contentAvailableWhenStoriesDisabled
      supportingPanel={parentGuide}
      testID={testID}
    />
  );
}

function LearningScreenFrame({
  announcementText,
  backAction,
  check,
  completionSummaryText,
  contentAvailableWhenStoriesDisabled = false,
  contentState,
  direction,
  disclosureText,
  equivalenceText,
  groupLabel,
  hero,
  language,
  modeLabel,
  modeSwitchAction,
  objectiveText,
  packageIdentityText,
  primaryAction,
  progress,
  reducedMotion,
  sections,
  sourceHeading,
  sourceText,
  statusLabel,
  supportingPanel,
  testID,
  title,
}: LearningScreenPresentationProps & {
  contentAvailableWhenStoriesDisabled?: boolean;
  hero?: React.ReactNode;
  supportingPanel?: React.ReactNode;
}) {
  const { compact, expanded } = useResponsiveLearningLayout();
  const contentAvailable =
    contentState !== 'loading' &&
    contentState !== 'locked' &&
    (contentState !== 'stories_disabled' || contentAvailableWhenStoriesDisabled) &&
    contentState !== 'unavailable';

  return (
    <View style={[styles.screen, compact ? styles.screenCompact : null]} testID={testID}>
      {backAction ? (
        <LearningBackButton
          action={backAction}
          direction={direction}
          language={language}
          reducedMotion={reducedMotion}
        />
      ) : null}

      <View style={styles.introduction}>
        <View
          style={[
            styles.modeRow,
            {
              alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start',
              flexDirection: logicalRowDirection(direction),
            },
          ]}
        >
          <View aria-hidden style={styles.modeMark}>
            <GhafIcon color={colors.secondary} name="water-drop" size={22} />
          </View>
          <Text
            brand
            color="secondary"
            direction={direction}
            language={language}
            style={styles.flexCopy}
            variant="label"
          >
            {modeLabel}
          </Text>
        </View>

        <Text
          accessibilityLabel={groupLabel}
          accessibilityRole="header"
          brand
          color="deepForest"
          direction={direction}
          language={language}
          variant={compact ? 'heading' : 'screenTitle'}
        >
          {title}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} language={language}>
          {objectiveText}
        </Text>

        <View style={[styles.identityRow, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.onSurfaceVariant} name="info" size={18} />
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={language}
            style={styles.flexCopy}
            variant="caption"
          >
            {packageIdentityText}
          </Text>
        </View>

        <View style={[styles.equivalenceBand, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.ghafEmerald} name="check" size={22} />
          <Text
            brand
            color="deepForest"
            direction={direction}
            language={language}
            style={styles.flexCopy}
            variant="label"
          >
            {equivalenceText}
          </Text>
        </View>
      </View>

      {hero}

      <LearningStatus
        contentState={contentState}
        direction={direction}
        language={language}
        statusLabel={statusLabel}
      />

      <View
        style={[
          styles.contentColumns,
          expanded ? { flexDirection: logicalRowDirection(direction) } : null,
        ]}
      >
        <View style={styles.lessonColumn}>
          <LearningProgress direction={direction} language={language} progress={progress} />

          {contentAvailable ? (
            <LearningSectionList direction={direction} language={language} sections={sections} />
          ) : null}

          {contentAvailable && check ? (
            <LearningUnderstandingCheck
              check={check}
              direction={direction}
              language={language}
              reducedMotion={reducedMotion}
            />
          ) : null}

          {contentAvailable && supportingPanel ? supportingPanel : null}

          {completionSummaryText &&
          (contentState === 'completed' || contentState === 'already_completed') ? (
            <CompletionSummary
              direction={direction}
              language={language}
              text={completionSummaryText}
            />
          ) : null}
        </View>

        <View style={[styles.contextColumn, expanded ? styles.contextColumnExpanded : null]}>
          <LearningDisclosure
            direction={direction}
            disclosureText={disclosureText}
            language={language}
          />
          <LearningSource
            direction={direction}
            heading={sourceHeading}
            language={language}
            text={sourceText}
          />
        </View>
      </View>

      <View style={styles.actions}>
        {primaryAction ? (
          <LearningActionButton
            action={primaryAction}
            direction={direction}
            language={language}
            reducedMotion={reducedMotion}
            tone="primary"
          />
        ) : null}
        <LearningModeSwitch
          direction={direction}
          language={language}
          modeSwitchAction={modeSwitchAction}
          reducedMotion={reducedMotion}
        />
      </View>

      {announcementText ? (
        <Text
          accessibilityLiveRegion="polite"
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={language}
          variant="caption"
        >
          {announcementText}
        </Text>
      ) : null}
    </View>
  );
}

function LearningStatus({
  contentState,
  direction,
  language,
  statusLabel,
}: {
  contentState: LearningContentState;
  direction: 'ltr' | 'rtl';
  language: 'ar' | 'en';
  statusLabel: string;
}) {
  const tone = statusColorForContentState(contentState);

  return (
    <View
      accessible
      accessibilityLabel={statusLabel}
      accessibilityLiveRegion="polite"
      accessibilityState={{ busy: contentState === 'loading' || contentState === 'submitting' }}
      style={[
        styles.status,
        statusSurfaceStyle[contentState],
        {
          alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start',
          flexDirection: logicalRowDirection(direction),
        },
      ]}
    >
      <GhafIcon color={colors[tone]} name={statusIconForContentState(contentState)} size={20} />
      <Text
        brand
        color={tone}
        direction={direction}
        language={language}
        style={styles.flexCopy}
        variant="label"
      >
        {statusLabel}
      </Text>
    </View>
  );
}

function LearningProgress({
  direction,
  language,
  progress,
}: {
  direction: 'ltr' | 'rtl';
  language: 'ar' | 'en';
  progress: LearningProgressPresentation;
}) {
  const percent = Math.max(0, Math.min(100, progress.visualPercent));

  return (
    <View
      accessibilityLabel={progress.accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{
        max: progress.total,
        min: 0,
        now: progress.current,
        text: progress.valueText,
      }}
      style={styles.progressCard}
    >
      <View style={[styles.progressCopy, { flexDirection: logicalRowDirection(direction) }]}>
        <Text
          brand
          color="deepForest"
          direction={direction}
          language={language}
          style={styles.flexCopy}
          variant="label"
        >
          {progress.label}
        </Text>
        <Text
          align="end"
          brand
          color="secondary"
          direction={direction}
          language={language}
          tabular
          variant="label"
        >
          {progress.valueText}
        </Text>
      </View>
      <View aria-hidden style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start', width: `${percent}%` },
          ]}
        />
      </View>
    </View>
  );
}

function LearningSectionList({
  direction,
  language,
  sections,
}: {
  direction: 'ltr' | 'rtl';
  language: 'ar' | 'en';
  sections: readonly LearningSectionPresentation[];
}) {
  return (
    <View style={styles.sections}>
      {sections.map((section) => (
        <View
          key={section.id}
          style={[
            styles.sectionCard,
            sectionCardStyle[section.state],
            { flexDirection: logicalRowDirection(direction) },
          ]}
        >
          <View aria-hidden style={[styles.sectionMarker, sectionMarkerStyle[section.state]]}>
            <GhafIcon
              color={colors[sectionColorForState(section.state)]}
              name={sectionIconForState(section.state)}
              size={22}
            />
          </View>
          <View style={styles.sectionCopy}>
            <Text
              accessibilityRole="header"
              brand
              color="deepForest"
              direction={direction}
              language={language}
              variant="heading"
            >
              {section.title}
            </Text>
            <Text brand color="onSurfaceVariant" direction={direction} language={language}>
              {section.body}
            </Text>
            <Text
              brand
              color={sectionColorForState(section.state)}
              direction={direction}
              language={language}
              variant="caption"
            >
              {section.statusLabel}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function LearningUnderstandingCheck({
  check,
  direction,
  language,
  reducedMotion,
}: {
  check: LearningCheckPresentation;
  direction: 'ltr' | 'rtl';
  language: 'ar' | 'en';
  reducedMotion: boolean;
}) {
  return (
    <View style={styles.checkCard}>
      <View style={[styles.checkHeadingRow, { flexDirection: logicalRowDirection(direction) }]}>
        <View aria-hidden style={styles.checkMark}>
          <GhafIcon color={colors.secondary} name="science" size={24} />
        </View>
        <View style={styles.sectionCopy}>
          <Text
            accessibilityLabel={check.accessibilityLabel}
            accessibilityRole="header"
            brand
            color="deepForest"
            direction={direction}
            language={language}
            variant="heading"
          >
            {check.heading}
          </Text>
          <Text brand color="ghafEmerald" direction={direction} language={language} variant="label">
            {check.noFailText}
          </Text>
        </View>
      </View>

      <Text brand color="deepForest" direction={direction} language={language}>
        {check.prompt}
      </Text>

      <View accessibilityRole="radiogroup" style={styles.options}>
        {check.options.map((option) => {
          const { disabled = false, selected } = option;

          return (
            <Pressable
              accessibilityLabel={option.accessibilityLabel}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              key={option.id}
              onPress={option.onPress}
              style={({ pressed }) => [
                styles.option,
                selected ? styles.optionSelected : null,
                pressed ? (reducedMotion ? styles.pressedStatic : styles.pressedMotion) : null,
                disabled ? styles.disabled : null,
                { flexDirection: logicalRowDirection(direction) },
              ]}
              testID={option.testID}
            >
              <View aria-hidden style={[styles.radio, selected ? styles.radioSelected : null]}>
                {selected ? <View style={styles.radioCenter} /> : null}
              </View>
              <Text
                brand
                color="deepForest"
                direction={direction}
                language={language}
                style={styles.flexCopy}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {check.feedbackText ? (
        <View
          accessibilityLiveRegion="polite"
          style={[
            styles.feedback,
            feedbackStyle[check.result],
            { flexDirection: logicalRowDirection(direction) },
          ]}
        >
          <GhafIcon
            color={colors[checkColorForResult(check.result)]}
            name={checkIconForResult(check.result)}
            size={20}
          />
          <Text
            brand
            color={checkColorForResult(check.result)}
            direction={direction}
            language={language}
            style={styles.flexCopy}
            variant="label"
          >
            {check.feedbackText}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function LearningDisclosure({
  direction,
  disclosureText,
  language,
}: {
  direction: 'ltr' | 'rtl';
  disclosureText: string;
  language: 'ar' | 'en';
}) {
  return (
    <View style={[styles.disclosure, { flexDirection: logicalRowDirection(direction) }]}>
      <GhafIcon color={colors.ghafEmerald} name="leaf" size={22} />
      <Text
        brand
        color="deepForest"
        direction={direction}
        language={language}
        style={styles.flexCopy}
        variant="label"
      >
        {disclosureText}
      </Text>
    </View>
  );
}

function LearningSource({
  direction,
  heading,
  language,
  text,
}: {
  direction: 'ltr' | 'rtl';
  heading: string;
  language: 'ar' | 'en';
  text: string;
}) {
  return (
    <View style={styles.sourceCard}>
      <View style={[styles.sourceHeading, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon color={colors.onSurfaceVariant} name="info" size={20} />
        <Text
          accessibilityRole="header"
          brand
          color="deepForest"
          direction={direction}
          language={language}
          style={styles.flexCopy}
          variant="label"
        >
          {heading}
        </Text>
      </View>
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        language={language}
        variant="caption"
      >
        {text}
      </Text>
    </View>
  );
}

function ParentGuidePanel({
  direction,
  heading,
  language,
  text,
}: {
  direction: 'ltr' | 'rtl';
  heading: string;
  language: 'ar' | 'en';
  text: string;
}) {
  return (
    <View style={styles.parentGuide}>
      <View style={[styles.sourceHeading, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon color={colors.tertiaryContainer} name="family" size={22} />
        <Text
          accessibilityRole="header"
          brand
          color="deepForest"
          direction={direction}
          language={language}
          style={styles.flexCopy}
          variant="label"
        >
          {heading}
        </Text>
      </View>
      <Text brand color="onSurfaceVariant" direction={direction} language={language}>
        {text}
      </Text>
    </View>
  );
}

function CompletionSummary({
  direction,
  language,
  text,
}: {
  direction: 'ltr' | 'rtl';
  language: 'ar' | 'en';
  text: string;
}) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.completion, { flexDirection: logicalRowDirection(direction) }]}
    >
      <GhafIcon color={colors.ghafEmerald} name="check-filled" size={28} />
      <Text
        brand
        color="deepForest"
        direction={direction}
        language={language}
        style={styles.flexCopy}
        variant="label"
      >
        {text}
      </Text>
    </View>
  );
}

function LearningModeSwitch({
  direction,
  language,
  modeSwitchAction,
  reducedMotion,
}: {
  direction: 'ltr' | 'rtl';
  language: 'ar' | 'en';
  modeSwitchAction: LearningActionPresentation;
  reducedMotion: boolean;
}) {
  return (
    <LearningActionButton
      action={modeSwitchAction}
      direction={direction}
      language={language}
      reducedMotion={reducedMotion}
      tone="secondary"
    />
  );
}

function LearningBackButton({
  action,
  direction,
  language,
  reducedMotion,
}: {
  action: LearningActionPresentation;
  direction: 'ltr' | 'rtl';
  language: 'ar' | 'en';
  reducedMotion: boolean;
}) {
  const { disabled = false } = action;

  return (
    <Pressable
      accessibilityHint={action.accessibilityHint}
      accessibilityLabel={action.accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={action.onPress}
      style={({ pressed }) => [
        styles.backButton,
        pressed ? (reducedMotion ? styles.pressedStatic : styles.pressedMotion) : null,
        disabled ? styles.disabled : null,
        {
          alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start',
          flexDirection: logicalRowDirection(direction),
        },
      ]}
      testID={action.testID}
    >
      <GhafIcon color={colors.deepForest} direction={direction} name="arrow-back" size={22} />
      <Text brand color="deepForest" direction={direction} language={language} variant="label">
        {action.label}
      </Text>
    </Pressable>
  );
}

function LearningActionButton({
  action,
  direction,
  language,
  reducedMotion,
  tone,
}: {
  action: LearningActionPresentation;
  direction: 'ltr' | 'rtl';
  language: 'ar' | 'en';
  reducedMotion: boolean;
  tone: 'primary' | 'secondary';
}) {
  const { busy = false, disabled = false } = action;

  return (
    <Pressable
      accessibilityHint={action.accessibilityHint}
      accessibilityLabel={action.accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy, disabled }}
      disabled={busy || disabled}
      onPress={action.onPress}
      style={({ pressed }) => [
        styles.actionButton,
        actionButtonStyle[tone],
        pressed ? (reducedMotion ? styles.pressedStatic : styles.pressedMotion) : null,
        busy || disabled ? styles.disabled : null,
      ]}
      testID={action.testID}
    >
      <Text
        align="center"
        brand
        color={
          busy || disabled ? 'onSurfaceVariant' : tone === 'primary' ? 'onPrimary' : 'secondary'
        }
        direction={direction}
        language={language}
        style={styles.actionLabel}
        variant="control"
      >
        {action.label}
      </Text>
    </Pressable>
  );
}

function IllustrationUnavailableNotice({
  direction,
  language,
  text,
}: {
  direction: 'ltr' | 'rtl';
  language: 'ar' | 'en';
  text: string;
}) {
  return (
    <View style={[styles.illustrationNotice, { flexDirection: logicalRowDirection(direction) }]}>
      <GhafIcon color={colors.onSurfaceVariant} name="media-off" size={24} />
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        language={language}
        style={styles.flexCopy}
        variant="label"
      >
        {text}
      </Text>
    </View>
  );
}

function MangroveHabitatArtwork({
  accessibilityLabel,
  compact,
  direction,
  fallbackLabel,
  language,
}: {
  accessibilityLabel: string;
  compact: boolean;
  direction: 'ltr' | 'rtl';
  fallbackLabel: string;
  language: 'ar' | 'en';
}) {
  return (
    <LocalIllustration
      accessibilityLabel={accessibilityLabel}
      assetId="mangrove-habitat"
      direction={direction}
      fallbackLabel={fallbackLabel}
      language={language}
      style={[styles.diagram, compact ? styles.diagramCompact : null]}
      testID="mangrove-habitat-artwork"
    />
  );
}

function statusIconForContentState(state: LearningContentState): GhafIconName {
  switch (state) {
    case 'completed':
    case 'already_completed':
      return 'check-filled';
    case 'locked':
      return 'lock';
    case 'stories_disabled':
    case 'unavailable':
      return 'media-off';
    case 'offline':
      return 'media-off';
    case 'error':
    case 'interrupted':
      return 'info';
    case 'loading':
    case 'submitting':
      return 'simple';
    case 'ready':
    case 'resumed':
      return 'water-drop';
  }
}

function statusColorForContentState(state: LearningContentState): AppColor {
  switch (state) {
    case 'completed':
    case 'already_completed':
      return 'ghafEmerald';
    case 'ready':
    case 'resumed':
      return 'secondary';
    case 'error':
      return 'error';
    case 'offline':
    case 'interrupted':
      return 'tertiaryContainer';
    case 'loading':
    case 'submitting':
    case 'locked':
    case 'stories_disabled':
    case 'unavailable':
      return 'onSurfaceVariant';
  }
}

function sectionIconForState(state: LearningSectionState): GhafIconName {
  switch (state) {
    case 'complete':
      return 'check-filled';
    case 'current':
      return 'water-drop';
    case 'upcoming':
      return 'lock';
  }
}

function sectionColorForState(state: LearningSectionState): AppColor {
  switch (state) {
    case 'complete':
      return 'ghafEmerald';
    case 'current':
      return 'secondary';
    case 'upcoming':
      return 'onSurfaceVariant';
  }
}

function checkIconForResult(result: LearningCheckResult): GhafIconName {
  switch (result) {
    case 'correct':
      return 'check-filled';
    case 'retry':
      return 'info';
    case 'idle':
      return 'simple';
  }
}

function checkColorForResult(result: LearningCheckResult): AppColor {
  switch (result) {
    case 'correct':
      return 'ghafEmerald';
    case 'retry':
      return 'tertiaryContainer';
    case 'idle':
      return 'onSurfaceVariant';
  }
}

const statusSurfaceStyle = StyleSheet.create({
  already_completed: { backgroundColor: colors.primaryFixedTint },
  completed: { backgroundColor: colors.primaryFixedTint },
  error: { backgroundColor: colors.errorContainer },
  interrupted: { backgroundColor: colors.solarAmberTint },
  loading: { backgroundColor: colors.surfaceContainer },
  locked: { backgroundColor: colors.surfaceContainer },
  offline: { backgroundColor: colors.solarAmberTint },
  ready: { backgroundColor: colors.mangroveTealTint },
  resumed: { backgroundColor: colors.mangroveTealTint },
  stories_disabled: { backgroundColor: colors.surfaceContainer },
  submitting: { backgroundColor: colors.surfaceContainer },
  unavailable: { backgroundColor: colors.surfaceContainer },
});

const sectionCardStyle = StyleSheet.create({
  complete: { backgroundColor: colors.primaryFixedTint },
  current: { backgroundColor: colors.surfaceContainerLowest },
  upcoming: { backgroundColor: colors.surfaceContainerLow },
});

const sectionMarkerStyle = StyleSheet.create({
  complete: { backgroundColor: colors.primaryFixed },
  current: { backgroundColor: colors.secondaryTint },
  upcoming: { backgroundColor: colors.surfaceContainer },
});

const feedbackStyle = StyleSheet.create({
  correct: { backgroundColor: colors.primaryFixedTint },
  idle: { backgroundColor: colors.surfaceContainerLow },
  retry: { backgroundColor: colors.solarAmberTint },
});

const actionButtonStyle = StyleSheet.create({
  primary: {
    backgroundColor: colors.ghafEmerald,
    borderColor: colors.ghafEmerald,
  },
  secondary: {
    backgroundColor: colors.mangroveTealTint,
    borderColor: colors.secondaryFixedDim,
  },
});

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    minWidth: 0,
    gap: spacing.lg,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.pearlGround,
    padding: spacing.xl,
  },
  screenCompact: {
    padding: spacing.md,
    gap: spacing.md,
  },
  introduction: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  modeRow: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.mangroveTealTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  modeMark: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLowest,
  },
  equivalenceBand: {
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.md,
  },
  identityRow: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.xs,
  },
  status: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: r001Radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  contentColumns: {
    width: '100%',
    minWidth: 0,
    gap: spacing.lg,
  },
  lessonColumn: {
    flex: 1,
    minWidth: 0,
    gap: spacing.lg,
  },
  contextColumn: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
  },
  contextColumnExpanded: {
    width: 'auto',
    flex: 0.72,
  },
  progressCard: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.mangroveTealTint,
    padding: spacing.md,
  },
  progressCopy: {
    minWidth: 0,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  progressTrack: {
    width: '100%',
    height: 9,
    overflow: 'hidden',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.secondaryFixed,
  },
  progressFill: {
    height: '100%',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.secondary,
  },
  sections: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
  },
  sectionCard: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    padding: spacing.lg,
  },
  sectionMarker: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
  },
  sectionCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  checkCard: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondaryFixedDim,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
  },
  checkHeadingRow: {
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkMark: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
    backgroundColor: colors.secondaryTint,
  },
  options: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  option: {
    width: '100%',
    minWidth: 0,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.md,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.mangroveTealTint,
  },
  radio: {
    width: 24,
    height: 24,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.outline,
    borderRadius: r001Radii.pill,
  },
  radioSelected: {
    borderColor: colors.secondary,
  },
  radioCenter: {
    width: 12,
    height: 12,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.secondary,
  },
  feedback: {
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    padding: spacing.md,
  },
  disclosure: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.md,
  },
  sourceCard: {
    width: '100%',
    minWidth: 0,
    gap: spacing.xs,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
  },
  sourceHeading: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.xs,
  },
  parentGuide: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.solarAmberTint,
    padding: spacing.md,
  },
  completion: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primaryFixedDim,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.md,
  },
  actions: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
    minWidth: 0,
    minHeight: layout.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: r001Radii.md,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionLabel: {
    flexShrink: 1,
    minWidth: 0,
  },
  backButton: {
    minWidth: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: r001Radii.md,
    paddingHorizontal: spacing.sm,
  },
  illustrationNotice: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.surfaceContainer,
    padding: spacing.md,
  },
  diagram: {
    width: '100%',
    minWidth: 0,
    height: 220,
    overflow: 'hidden',
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.secondaryTint,
  },
  diagramCompact: {
    height: 184,
  },
  flexCopy: {
    flex: 1,
    minWidth: 0,
  },
  pressedStatic: {
    opacity: opacity.pressed,
  },
  pressedMotion: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    borderColor: colors.outline,
    borderStyle: 'dashed',
    backgroundColor: colors.surfaceContainer,
  },
});
