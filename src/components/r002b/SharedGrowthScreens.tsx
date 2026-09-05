import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AccessibilityInfo,
  findNodeHandle,
  InteractionManager,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';

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

export type SharedGrowthLanguage = 'ar' | 'en';
export type SharedGrowthDirection = 'ltr' | 'rtl';
export type SharedGrowthParticipationState = 'continued' | 'paused' | 'ended';
export type SharedGrowthParticipationAction =
  'continue' | 'pause_new_contributions' | 'end_participation';

export type SharedGrowthChildContentState =
  | 'ready'
  | 'loading'
  | 'offline'
  | 'unavailable'
  | 'error'
  | 'interrupted'
  | 'recovered'
  | 'art_unavailable';

export type ParentSharedGardenContentState =
  | 'ready'
  | 'loading'
  | 'offline'
  | 'unavailable'
  | 'error'
  | 'interrupted'
  | 'recovered'
  | 'submitting'
  | 'saved'
  | 'duplicate';

export type SharedGrowthContentState =
  SharedGrowthChildContentState | ParentSharedGardenContentState;

export interface SharedGrowthActionPresentation {
  accessibilityLabel: string;
  busy?: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
}

export interface SharedGrowthObservationPresentation {
  accessibilityLabel: string;
  id: string;
  outlookLabel: string;
  themeLabel: string;
  tone: 'coast' | 'water' | 'canopy';
}

export interface SharedGrowthEntryCardProps {
  readonly actionLabel: string;
  readonly body: string;
  readonly direction: SharedGrowthDirection;
  readonly language: SharedGrowthLanguage;
  readonly onPress: () => void;
  readonly reducedMotion: boolean;
  readonly statusLabel: string;
  readonly testID: string;
  readonly title: string;
  readonly tone: 'child' | 'parent';
}

export interface SharedGrowthChildScreenProps {
  artUnavailable: boolean;
  artUnavailableText: string;
  backAction?: SharedGrowthActionPresentation;
  contentState: SharedGrowthChildContentState;
  direction: SharedGrowthDirection;
  emptyObservationText: string;
  groupLabel: string;
  language: SharedGrowthLanguage;
  observationHeading: string;
  observations: readonly SharedGrowthObservationPresentation[];
  participationHeading: string;
  participationLabel: string;
  participationState: SharedGrowthParticipationState;
  privacyBody: string;
  privacyHeading: string;
  reducedMotion: boolean;
  sceneAccessibilityLabel: string;
  stateMessage: string;
  statusLabel: string;
  subtitle: string;
  syntheticLabel: string;
  testID?: string;
  title: string;
  viewOnlyBody: string;
  viewOnlyHeading: string;
}

export interface ParentSharedGrowthActionPresentation extends SharedGrowthActionPresentation {
  action: SharedGrowthParticipationAction;
  description: string;
  tone: 'primary' | 'caution' | 'danger';
}

export interface ParentSharedGrowthConfirmationPresentation {
  action: Extract<SharedGrowthParticipationAction, 'continue' | 'end_participation'>;
  body: string;
  cancelAction: SharedGrowthActionPresentation;
  confirmAction: SharedGrowthActionPresentation;
  focusReturnTargetTestID: string;
  groupLabel: string;
  onRequestFocusRestore: (targetTestID: string) => void;
  title: string;
  tone: 'primary' | 'danger';
}

export interface ParentSharedGardenScreenProps {
  backAction?: SharedGrowthActionPresentation;
  confirmation?: ParentSharedGrowthConfirmationPresentation;
  contentState: ParentSharedGardenContentState;
  contributionEnabled: boolean;
  currentHeading: string;
  currentStatusDescription: string;
  currentStatusLabel: string;
  direction: SharedGrowthDirection;
  existingConsentMessage?: string;
  freshConsentMessage?: string;
  futureOnlyBody: string;
  futureOnlyHeading: string;
  groupLabel: string;
  language: SharedGrowthLanguage;
  noEffectBody: string;
  noEffectHeading: string;
  participationActions: readonly ParentSharedGrowthActionPresentation[];
  participationState: SharedGrowthParticipationState;
  pendingMessage?: string;
  privacyBody: string;
  privacyHeading: string;
  readOnlyBody: string;
  readOnlyHeading: string;
  reducedMotion: boolean;
  settingsHeading: string;
  stateMessage: string;
  statusLabel: string;
  subtitle: string;
  testID?: string;
  title: string;
}

interface ResponsiveSharedGrowthLayout {
  compact: boolean;
  expanded: boolean;
  onLayout: (event: LayoutChangeEvent) => void;
}

function useResponsiveSharedGrowthLayout(): ResponsiveSharedGrowthLayout {
  const { fontScale, width: windowWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number>();
  const availableWidth = measuredWidth ?? Math.min(windowWidth, layout.compactContentWidth);
  const compact = availableWidth < 360 || fontScale >= 1.5;
  const expanded = availableWidth >= 600 && fontScale < 1.5;
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    setMeasuredWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
  }, []);

  return { compact, expanded, onLayout };
}

export function SharedGrowthEntryCard({
  actionLabel,
  body,
  direction,
  language,
  onPress,
  reducedMotion,
  statusLabel,
  testID,
  title,
  tone,
}: SharedGrowthEntryCardProps) {
  return (
    <Pressable
      accessibilityHint={body}
      accessibilityLabel={`${title}. ${statusLabel}. ${body}. ${actionLabel}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.entryCard,
        tone === 'parent' ? styles.entryCardParent : styles.entryCardChild,
        pressed ? (reducedMotion ? styles.pressedStatic : styles.pressedMotion) : null,
      ]}
      testID={testID}
    >
      <View style={[styles.entryHeading, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={styles.entryIcon}>
          <GhafIcon
            color={tone === 'parent' ? colors.secondary : colors.ghafEmerald}
            name={tone === 'parent' ? 'settings' : 'ghaf-tree'}
            size={26}
          />
        </View>
        <View style={styles.flexCopy}>
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={language}
            style={styles.shrinkCopy}
            variant="caption"
          >
            {statusLabel}
          </Text>
          <Text
            accessibilityRole="header"
            brand
            color="deepForest"
            direction={direction}
            language={language}
            style={styles.shrinkCopy}
            variant="heading"
          >
            {title}
          </Text>
        </View>
      </View>
      <Text brand color="onSurfaceVariant" direction={direction} language={language}>
        {body}
      </Text>
      <View style={[styles.entryAction, { flexDirection: logicalRowDirection(direction) }]}>
        <Text
          brand
          color="primary"
          direction={direction}
          language={language}
          style={styles.shrinkCopy}
          variant="control"
        >
          {actionLabel}
        </Text>
        <GhafIcon
          color={colors.ghafEmerald}
          direction={direction === 'rtl' ? 'ltr' : 'rtl'}
          name="arrow-back"
          size={22}
        />
      </View>
    </Pressable>
  );
}

export function SharedGrowthChildScreen({
  artUnavailableText,
  contentState,
  direction,
  emptyObservationText,
  language,
  observationHeading,
  observations,
  participationHeading,
  participationLabel,
  participationState,
  privacyBody,
  privacyHeading,
  reducedMotion,
  sceneAccessibilityLabel,
  stateMessage,
  statusLabel,
  subtitle,
  syntheticLabel,
  testID = 'shared-growth-child-screen',
  viewOnlyBody,
  viewOnlyHeading,
}: SharedGrowthChildScreenProps) {
  const { compact, expanded, onLayout } = useResponsiveSharedGrowthLayout();
  // Keep the legacy presentation field compatible while deriving the rendered state from one
  // authoritative content-state value.
  const artIsUnavailable = contentState === 'art_unavailable';
  const observationsVisible =
    contentState !== 'loading' && contentState !== 'unavailable' && contentState !== 'error';

  return (
    <View
      onLayout={onLayout}
      style={[styles.screen, compact ? styles.screenCompact : null]}
      testID={testID}
    >
      <Text brand color="onSurfaceVariant" direction={direction} language={language}>
        {subtitle}
      </Text>

      <View
        style={[
          styles.syntheticChip,
          {
            alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start',
            flexDirection: logicalRowDirection(direction),
          },
        ]}
      >
        <GhafIcon color={colors.secondary} name="simple" size={18} />
        <Text
          brand
          color="secondary"
          direction={direction}
          language={language}
          style={styles.shrinkCopy}
          variant="caption"
        >
          {syntheticLabel}
        </Text>
      </View>

      <SharedGrowthStatus
        contentState={contentState}
        direction={direction}
        language={language}
        stateMessage={stateMessage}
        statusLabel={statusLabel}
      />

      {artIsUnavailable ? (
        <SharedArtUnavailable direction={direction} language={language} text={artUnavailableText} />
      ) : (
        <SharedCoastalCanopyScene accessibilityLabel={sceneAccessibilityLabel} compact={compact} />
      )}

      <View
        style={[
          styles.contentColumns,
          expanded ? { flexDirection: logicalRowDirection(direction) } : null,
        ]}
      >
        <View style={styles.primaryColumn}>
          <SectionHeading direction={direction} language={language} text={observationHeading} />
          {observationsVisible ? (
            <SharedObservationList
              direction={direction}
              emptyText={emptyObservationText}
              expanded={expanded}
              language={language}
              observations={observations}
            />
          ) : null}
        </View>

        <View style={[styles.contextColumn, expanded ? styles.contextColumnExpanded : null]}>
          <SharedInformationPanel
            body={viewOnlyBody}
            direction={direction}
            heading={viewOnlyHeading}
            iconName="info"
            language={language}
            tone="water"
          />
          <ParticipationSummary
            direction={direction}
            heading={participationHeading}
            label={participationLabel}
            language={language}
            state={participationState}
          />
          <SharedInformationPanel
            body={privacyBody}
            direction={direction}
            heading={privacyHeading}
            iconName="shield"
            language={language}
            tone="leaf"
          />
        </View>
      </View>
    </View>
  );
}

export function ParentSharedGardenScreen({
  confirmation,
  contentState,
  contributionEnabled,
  currentHeading,
  currentStatusDescription,
  currentStatusLabel,
  direction,
  existingConsentMessage,
  freshConsentMessage,
  futureOnlyBody,
  futureOnlyHeading,
  language,
  noEffectBody,
  noEffectHeading,
  participationActions,
  participationState,
  pendingMessage,
  privacyBody,
  privacyHeading,
  readOnlyBody,
  readOnlyHeading,
  reducedMotion,
  settingsHeading,
  stateMessage,
  statusLabel,
  subtitle,
  testID = 'shared-garden-parent-screen',
}: ParentSharedGardenScreenProps) {
  const { compact, expanded, onLayout } = useResponsiveSharedGrowthLayout();
  const actionRefs = useRef<Record<string, View | null>>({});
  const statusRef = useRef<View>(null);

  const restoreParticipationFocus = (targetTestID: string) => {
    const target = actionRefs.current[targetTestID] ?? statusRef.current;
    if (Platform.OS !== 'web') {
      const handle = findNodeHandle(target);
      if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
    }
    confirmation?.onRequestFocusRestore(targetTestID);
  };

  return (
    <View
      onLayout={onLayout}
      style={[styles.screen, compact ? styles.screenCompact : null]}
      testID={testID}
    >
      <Text brand color="onSurfaceVariant" direction={direction} language={language}>
        {subtitle}
      </Text>

      <SharedGrowthStatus
        contentState={contentState}
        direction={direction}
        language={language}
        stateMessage={stateMessage}
        statusLabel={statusLabel}
      />

      <ParentCurrentStatus
        description={currentStatusDescription}
        direction={direction}
        elementRef={(node) => {
          statusRef.current = node;
        }}
        heading={currentHeading}
        label={currentStatusLabel}
        language={language}
        state={participationState}
      />

      <View
        style={[
          styles.parentInformationGrid,
          expanded ? { flexDirection: logicalRowDirection(direction) } : null,
        ]}
      >
        <View style={[styles.parentInformationCell, expanded ? styles.expandedCell : null]}>
          <SharedInformationPanel
            body={futureOnlyBody}
            direction={direction}
            heading={futureOnlyHeading}
            iconName="leaf"
            language={language}
            tone="water"
          />
        </View>
        <View style={[styles.parentInformationCell, expanded ? styles.expandedCell : null]}>
          <SharedInformationPanel
            body={noEffectBody}
            direction={direction}
            heading={noEffectHeading}
            iconName="shield"
            language={language}
            tone="leaf"
          />
        </View>
      </View>

      <SharedInformationPanel
        body={privacyBody}
        direction={direction}
        heading={privacyHeading}
        iconName="lock"
        language={language}
        tone="neutral"
      />

      {freshConsentMessage ? (
        <ConsentNotice
          direction={direction}
          language={language}
          text={freshConsentMessage}
          tone="caution"
        />
      ) : null}
      {existingConsentMessage ? (
        <ConsentNotice
          direction={direction}
          language={language}
          text={existingConsentMessage}
          tone="leaf"
        />
      ) : null}

      {contributionEnabled ? (
        <View style={styles.actionSection}>
          <SectionHeading direction={direction} language={language} text={settingsHeading} />
          {pendingMessage ? (
            <Text
              accessibilityLiveRegion="polite"
              brand
              color="onSurfaceVariant"
              direction={direction}
              language={language}
              variant="label"
            >
              {pendingMessage}
            </Text>
          ) : null}
          <View accessibilityRole="list" style={styles.actionList}>
            {participationActions.map((action) => (
              <ParentParticipationAction
                action={action}
                actionRef={(node) => {
                  if (action.testID) actionRefs.current[action.testID] = node;
                }}
                direction={direction}
                key={action.action}
                language={language}
                reducedMotion={reducedMotion}
              />
            ))}
          </View>
        </View>
      ) : (
        <SharedInformationPanel
          body={readOnlyBody}
          direction={direction}
          heading={readOnlyHeading}
          iconName="lock"
          language={language}
          tone="neutral"
        />
      )}

      {confirmation ? (
        <ParentParticipationConfirmation
          confirmation={confirmation}
          direction={direction}
          language={language}
          onRestoreFocus={restoreParticipationFocus}
          reducedMotion={reducedMotion}
        />
      ) : null}
    </View>
  );
}

function SharedGrowthStatus({
  contentState,
  direction,
  language,
  stateMessage,
  statusLabel,
}: {
  contentState: SharedGrowthContentState;
  direction: SharedGrowthDirection;
  language: SharedGrowthLanguage;
  stateMessage: string;
  statusLabel: string;
}) {
  const tone = contentStateColor(contentState);
  const busy = contentState === 'loading' || contentState === 'submitting';

  return (
    <View
      accessibilityLabel={
        stateMessage === statusLabel ? statusLabel : `${statusLabel}. ${stateMessage}`
      }
      accessibilityLiveRegion="polite"
      accessibilityRole="summary"
      accessibilityState={{ busy }}
      style={[
        styles.surfaceStatus,
        contentStateSurface[contentState],
        { flexDirection: logicalRowDirection(direction) },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={colors[tone]} size="small" />
      ) : (
        <GhafIcon color={colors[tone]} name={contentStateIcon(contentState)} size={22} />
      )}
      <View style={styles.flexCopy}>
        <Text brand color={tone} direction={direction} language={language} variant="label">
          {statusLabel}
        </Text>
        {stateMessage === statusLabel ? null : (
          <Text brand color="onSurfaceVariant" direction={direction} language={language}>
            {stateMessage}
          </Text>
        )}
      </View>
    </View>
  );
}

function SharedObservationList({
  direction,
  emptyText,
  expanded,
  language,
  observations,
}: {
  direction: SharedGrowthDirection;
  emptyText: string;
  expanded: boolean;
  language: SharedGrowthLanguage;
  observations: readonly SharedGrowthObservationPresentation[];
}) {
  if (observations.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View aria-hidden style={{ alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start' }}>
          <GhafIcon color={colors.onSurfaceVariant} name="info" size={22} />
        </View>
        <Text brand color="onSurfaceVariant" direction={direction} language={language}>
          {emptyText}
        </Text>
      </View>
    );
  }

  return (
    <View
      accessibilityRole="list"
      style={[
        styles.observationList,
        expanded ? { flexDirection: logicalRowDirection(direction), flexWrap: 'wrap' } : undefined,
      ]}
    >
      {observations.map((observation) => (
        <View
          accessibilityLabel={observation.accessibilityLabel}
          accessibilityRole="summary"
          key={observation.id}
          style={[styles.observationCard, expanded ? styles.observationCardExpanded : null]}
        >
          <View
            aria-hidden
            style={[
              styles.observationMark,
              observationMarkStyle[observation.tone],
              { alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start' },
            ]}
          >
            <GhafIcon
              color={colors[observationColor[observation.tone]]}
              name={observationIcon[observation.tone]}
              size={26}
            />
          </View>
          <Text
            accessibilityRole="header"
            brand
            color="deepForest"
            direction={direction}
            language={language}
            variant="heading"
          >
            {observation.themeLabel}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} language={language}>
            {observation.outlookLabel}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SharedInformationPanel({
  body,
  direction,
  heading,
  iconName,
  language,
  tone,
}: {
  body: string;
  direction: SharedGrowthDirection;
  heading: string;
  iconName: GhafIconName;
  language: SharedGrowthLanguage;
  tone: 'leaf' | 'water' | 'neutral';
}) {
  return (
    <View style={[styles.informationPanel, informationPanelStyle[tone]]}>
      <View style={[styles.informationHeading, { flexDirection: logicalRowDirection(direction) }]}>
        <View aria-hidden style={[styles.informationMark, informationMarkStyle[tone]]}>
          <GhafIcon color={colors[informationColor[tone]]} name={iconName} size={22} />
        </View>
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
        {body}
      </Text>
    </View>
  );
}

function ParticipationSummary({
  direction,
  heading,
  label,
  language,
  state,
}: {
  direction: SharedGrowthDirection;
  heading: string;
  label: string;
  language: SharedGrowthLanguage;
  state: SharedGrowthParticipationState;
}) {
  return (
    <View
      accessibilityLabel={`${heading}. ${label}`}
      accessibilityRole="summary"
      style={[
        styles.participationSummary,
        participationSurface[state],
        { flexDirection: logicalRowDirection(direction) },
      ]}
    >
      <GhafIcon
        color={colors[participationColor[state]]}
        name={participationIcon[state]}
        size={22}
      />
      <View style={styles.flexCopy}>
        <Text brand color="deepForest" direction={direction} language={language} variant="caption">
          {heading}
        </Text>
        <Text
          brand
          color={participationColor[state]}
          direction={direction}
          language={language}
          variant="label"
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

function ParentCurrentStatus({
  description,
  direction,
  elementRef,
  heading,
  label,
  language,
  state,
}: {
  description: string;
  direction: SharedGrowthDirection;
  elementRef?: (node: View | null) => void;
  heading: string;
  label: string;
  language: SharedGrowthLanguage;
  state: SharedGrowthParticipationState;
}) {
  return (
    <View
      accessibilityLabel={`${heading}. ${label}. ${description}`}
      accessibilityRole="summary"
      ref={elementRef}
      style={[styles.currentStatus, participationSurface[state]]}
    >
      <View style={[styles.informationHeading, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon
          color={colors[participationColor[state]]}
          name={participationIcon[state]}
          size={26}
        />
        <View style={styles.flexCopy}>
          <Text brand color="deepForest" direction={direction} language={language} variant="label">
            {heading}
          </Text>
          <Text
            brand
            color={participationColor[state]}
            direction={direction}
            language={language}
            variant="heading"
          >
            {label}
          </Text>
        </View>
      </View>
      <Text brand color="onSurfaceVariant" direction={direction} language={language}>
        {description}
      </Text>
    </View>
  );
}

function ConsentNotice({
  direction,
  language,
  text,
  tone,
}: {
  direction: SharedGrowthDirection;
  language: SharedGrowthLanguage;
  text: string;
  tone: 'leaf' | 'caution';
}) {
  const color: AppColor = tone === 'leaf' ? 'ghafEmerald' : 'tertiaryContainer';

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.consentNotice,
        tone === 'leaf' ? styles.consentLeaf : styles.consentCaution,
        { flexDirection: logicalRowDirection(direction) },
      ]}
    >
      <GhafIcon color={colors[color]} name={tone === 'leaf' ? 'check' : 'info'} size={22} />
      <Text
        brand
        color={color}
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

function ParentParticipationAction({
  action,
  actionRef,
  direction,
  language,
  reducedMotion,
}: {
  action: ParentSharedGrowthActionPresentation;
  actionRef?: (node: View | null) => void;
  direction: SharedGrowthDirection;
  language: SharedGrowthLanguage;
  reducedMotion: boolean;
}) {
  const { busy = false, disabled = false } = action;
  const color = busy || disabled ? 'onSurfaceVariant' : actionTextColor[action.tone];

  return (
    <Pressable
      accessibilityLabel={action.accessibilityLabel}
      accessibilityHint={action.description}
      accessibilityRole="button"
      accessibilityState={{ busy, disabled }}
      disabled={busy || disabled}
      onPress={action.onPress}
      ref={actionRef}
      style={({ pressed }) => [
        styles.parentAction,
        actionSurfaceStyle[action.tone],
        pressed ? (reducedMotion ? styles.pressedStatic : styles.pressedMotion) : null,
        busy || disabled ? styles.disabled : null,
      ]}
      testID={action.testID}
    >
      <View style={[styles.actionHeading, { flexDirection: logicalRowDirection(direction) }]}>
        <Text
          brand
          color={color}
          direction={direction}
          language={language}
          style={styles.flexCopy}
          variant="control"
        >
          {action.label}
        </Text>
        {busy ? (
          <ActivityIndicator color={colors[color]} size="small" />
        ) : (
          <GhafIcon
            color={colors[color]}
            name={
              action.tone === 'danger' ? 'shield' : action.tone === 'caution' ? 'info' : 'check'
            }
            size={22}
          />
        )}
      </View>
      <Text
        brand
        color={color}
        direction={direction}
        language={language}
        style={styles.shrinkCopy}
        variant="caption"
      >
        {action.description}
      </Text>
    </Pressable>
  );
}

function ParentParticipationConfirmation({
  confirmation,
  direction,
  language,
  onRestoreFocus,
  reducedMotion,
}: {
  confirmation: ParentSharedGrowthConfirmationPresentation;
  direction: SharedGrowthDirection;
  language: SharedGrowthLanguage;
  onRestoreFocus: (targetTestID: string) => void;
  reducedMotion: boolean;
}) {
  const headingRef = useRef<View>(null);
  const restorationTaskRef =
    useRef<ReturnType<typeof InteractionManager.runAfterInteractions>>(undefined);

  const focusHeading = () => {
    if (Platform.OS === 'web') return;
    const handle = findNodeHandle(headingRef.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  };

  const restoreFocusAfterDismissal = () => {
    restorationTaskRef.current?.cancel();
    restorationTaskRef.current = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => onRestoreFocus(confirmation.focusReturnTargetTestID));
    });
  };

  const cancelAndRestoreFocus = () => {
    if (confirmation.cancelAction.busy || confirmation.cancelAction.disabled) return;
    confirmation.cancelAction.onPress();
    restoreFocusAfterDismissal();
  };

  const confirmAndRestoreFocus = () => {
    if (confirmation.confirmAction.busy || confirmation.confirmAction.disabled) return;
    confirmation.confirmAction.onPress();
    restoreFocusAfterDismissal();
  };

  return (
    <Modal
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={cancelAndRestoreFocus}
      onShow={focusHeading}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible
    >
      <View
        accessibilityViewIsModal
        importantForAccessibility="yes"
        style={styles.confirmationBoundary}
        testID="shared-growth-participation-confirmation"
      >
        <Pressable
          accessibilityElementsHidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          onPress={cancelAndRestoreFocus}
          style={styles.confirmationScrim}
        />
        <View style={styles.confirmationCard}>
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.confirmationContent}
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
          >
            <View
              accessibilityLabel={`${confirmation.groupLabel}. ${confirmation.title}. ${confirmation.body}`}
              accessibilityRole="alert"
              accessible
              ref={headingRef}
              style={styles.confirmationHeading}
            >
              <Text
                align="center"
                brand
                color="deepForest"
                direction={direction}
                language={language}
                variant="screenTitle"
              >
                {confirmation.title}
              </Text>
              <Text
                align="center"
                brand
                color="onSurfaceVariant"
                direction={direction}
                language={language}
              >
                {confirmation.body}
              </Text>
            </View>

            <View style={styles.confirmationActions}>
              <ConfirmationButton
                action={confirmation.confirmAction}
                direction={direction}
                language={language}
                onPress={confirmAndRestoreFocus}
                reducedMotion={reducedMotion}
                tone={confirmation.tone}
              />
              <ConfirmationButton
                action={confirmation.cancelAction}
                direction={direction}
                language={language}
                onPress={cancelAndRestoreFocus}
                reducedMotion={reducedMotion}
                tone="neutral"
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ConfirmationButton({
  action,
  direction,
  language,
  onPress,
  reducedMotion,
  tone,
}: {
  action: SharedGrowthActionPresentation;
  direction: SharedGrowthDirection;
  language: SharedGrowthLanguage;
  onPress: () => void;
  reducedMotion: boolean;
  tone: 'primary' | 'danger' | 'neutral';
}) {
  const { busy = false, disabled = false } = action;
  const color: AppColor =
    busy || disabled
      ? 'onSurfaceVariant'
      : tone === 'primary'
        ? 'onPrimary'
        : tone === 'danger'
          ? 'error'
          : 'deepForest';

  return (
    <Pressable
      accessibilityLabel={action.accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy, disabled }}
      disabled={busy || disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.confirmationButton,
        confirmationButtonSurface[tone],
        pressed ? (reducedMotion ? styles.pressedStatic : styles.pressedMotion) : null,
        busy || disabled ? styles.disabled : null,
      ]}
      testID={action.testID}
    >
      {busy ? <ActivityIndicator color={colors[color]} size="small" /> : null}
      <Text
        align="center"
        brand
        color={color}
        direction={direction}
        language={language}
        style={styles.shrinkCopy}
        variant="control"
      >
        {action.label}
      </Text>
    </Pressable>
  );
}

function SectionHeading({
  direction,
  language,
  text,
}: {
  direction: SharedGrowthDirection;
  language: SharedGrowthLanguage;
  text: string;
}) {
  return (
    <Text
      accessibilityRole="header"
      brand
      color="deepForest"
      direction={direction}
      language={language}
      variant="heading"
    >
      {text}
    </Text>
  );
}

function SharedArtUnavailable({
  direction,
  language,
  text,
}: {
  direction: SharedGrowthDirection;
  language: SharedGrowthLanguage;
  text: string;
}) {
  return (
    <View style={[styles.artUnavailable, { flexDirection: logicalRowDirection(direction) }]}>
      <GhafIcon color={colors.onSurfaceVariant} name="media-off" size={26} />
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

function SharedCoastalCanopyScene({
  accessibilityLabel,
  compact,
}: {
  accessibilityLabel: string;
  compact: boolean;
}) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[styles.scene, compact ? styles.sceneCompact : null]}
    >
      <View aria-hidden style={styles.sceneSky} />
      <View aria-hidden style={styles.sceneSun} />
      <View aria-hidden style={styles.sceneCoast} />
      <View aria-hidden style={styles.sceneWater} />
      <View aria-hidden style={styles.canopyBack} />
      <View aria-hidden style={styles.canopyLeft} />
      <View aria-hidden style={styles.canopyRight} />
      <View aria-hidden style={styles.canopyTrunk} />
      <View aria-hidden style={styles.canopyRootLeft} />
      <View aria-hidden style={styles.canopyRootRight} />
      <View aria-hidden style={styles.anonymousPlantOne} />
      <View aria-hidden style={styles.anonymousPlantTwo} />
      <View aria-hidden style={styles.anonymousPlantThree} />
      <View aria-hidden style={styles.sceneRippleOne} />
      <View aria-hidden style={styles.sceneRippleTwo} />
    </View>
  );
}

function contentStateIcon(state: SharedGrowthContentState): GhafIconName {
  switch (state) {
    case 'ready':
    case 'recovered':
      return 'leaf';
    case 'saved':
    case 'duplicate':
      return 'check-filled';
    case 'loading':
    case 'submitting':
      return 'simple';
    case 'offline':
    case 'art_unavailable':
      return 'media-off';
    case 'error':
    case 'interrupted':
      return 'info';
    case 'unavailable':
      return 'lock';
  }
}

function contentStateColor(state: SharedGrowthContentState): AppColor {
  switch (state) {
    case 'ready':
    case 'recovered':
    case 'saved':
    case 'duplicate':
      return 'ghafEmerald';
    case 'offline':
    case 'interrupted':
      return 'tertiaryContainer';
    case 'error':
      return 'error';
    case 'loading':
    case 'submitting':
    case 'art_unavailable':
    case 'unavailable':
      return 'onSurfaceVariant';
  }
}

const contentStateSurface = StyleSheet.create({
  art_unavailable: { backgroundColor: colors.surfaceContainer },
  duplicate: { backgroundColor: colors.primaryFixedTint },
  error: { backgroundColor: colors.errorContainer },
  interrupted: { backgroundColor: colors.solarAmberTint },
  loading: { backgroundColor: colors.surfaceContainer },
  offline: { backgroundColor: colors.solarAmberTint },
  ready: { backgroundColor: colors.primaryFixedTint },
  recovered: { backgroundColor: colors.primaryFixedTint },
  saved: { backgroundColor: colors.primaryFixedTint },
  submitting: { backgroundColor: colors.surfaceContainer },
  unavailable: { backgroundColor: colors.surfaceContainer },
});

const observationColor = {
  canopy: 'ghafEmerald',
  coast: 'tertiaryContainer',
  water: 'secondary',
} as const satisfies Record<SharedGrowthObservationPresentation['tone'], AppColor>;

const observationIcon = {
  canopy: 'ghaf-tree',
  coast: 'leaf',
  water: 'water-drop',
} as const satisfies Record<SharedGrowthObservationPresentation['tone'], GhafIconName>;

const observationMarkStyle = StyleSheet.create({
  canopy: { backgroundColor: colors.primaryFixedTint },
  coast: { backgroundColor: colors.solarAmberTint },
  water: { backgroundColor: colors.mangroveTealTint },
});

const informationColor = {
  leaf: 'ghafEmerald',
  neutral: 'onSurfaceVariant',
  water: 'secondary',
} as const satisfies Record<'leaf' | 'water' | 'neutral', AppColor>;

const informationPanelStyle = StyleSheet.create({
  leaf: { backgroundColor: colors.primaryFixedTint },
  neutral: { backgroundColor: colors.surfaceContainerLow },
  water: { backgroundColor: colors.mangroveTealTint },
});

const informationMarkStyle = StyleSheet.create({
  leaf: { backgroundColor: colors.surfaceContainerLowest },
  neutral: { backgroundColor: colors.surfaceContainer },
  water: { backgroundColor: colors.surfaceContainerLowest },
});

const participationColor = {
  continued: 'ghafEmerald',
  ended: 'onSurfaceVariant',
  paused: 'tertiaryContainer',
} as const satisfies Record<SharedGrowthParticipationState, AppColor>;

const participationIcon = {
  continued: 'check-filled',
  ended: 'lock',
  paused: 'info',
} as const satisfies Record<SharedGrowthParticipationState, GhafIconName>;

const participationSurface = StyleSheet.create({
  continued: { backgroundColor: colors.primaryFixedTint },
  ended: { backgroundColor: colors.surfaceContainer },
  paused: { backgroundColor: colors.solarAmberTint },
});

const actionTextColor = {
  caution: 'tertiaryContainer',
  danger: 'error',
  primary: 'onPrimary',
} as const satisfies Record<ParentSharedGrowthActionPresentation['tone'], AppColor>;

const actionSurfaceStyle = StyleSheet.create({
  caution: {
    backgroundColor: colors.solarAmberTint,
    borderColor: colors.solarAmberBorder,
  },
  danger: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
  },
  primary: {
    backgroundColor: colors.ghafEmerald,
    borderColor: colors.ghafEmerald,
  },
});

const confirmationButtonSurface = StyleSheet.create({
  danger: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
  },
  neutral: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outline,
  },
  primary: {
    backgroundColor: colors.ghafEmerald,
    borderColor: colors.ghafEmerald,
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
    gap: spacing.md,
    padding: spacing.md,
  },
  entryCard: {
    width: '100%',
    minWidth: 0,
    minHeight: layout.touchTarget,
    gap: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    padding: spacing.lg,
  },
  entryCardChild: {
    borderColor: colors.secondaryFixedDim,
    backgroundColor: colors.primaryFixedTint,
  },
  entryCardParent: {
    borderColor: colors.outlineVariant,
    backgroundColor: colors.mangroveTealTint,
  },
  entryHeading: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.md,
  },
  entryIcon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
    backgroundColor: colors.surfaceContainerLowest,
  },
  entryAction: {
    width: '100%',
    minWidth: 0,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.sm,
  },
  syntheticChip: {
    maxWidth: '100%',
    minWidth: 0,
    flexShrink: 1,
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.mangroveTealTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  surfaceStatus: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    padding: spacing.md,
  },
  contentColumns: {
    width: '100%',
    minWidth: 0,
    gap: spacing.lg,
  },
  primaryColumn: {
    flex: 1,
    minWidth: 0,
    gap: spacing.md,
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
  observationList: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
  },
  observationCard: {
    width: '100%',
    minWidth: 0,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
  },
  observationCardExpanded: {
    width: 'auto',
    flexGrow: 1,
    flexBasis: '46%',
  },
  observationMark: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
  },
  emptyState: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.lg,
  },
  informationPanel: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    padding: spacing.md,
  },
  informationHeading: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  informationMark: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
  },
  participationSummary: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    padding: spacing.md,
  },
  parentInformationGrid: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
  },
  parentInformationCell: {
    width: '100%',
    minWidth: 0,
  },
  expandedCell: {
    width: 'auto',
    minWidth: 0,
    flex: 1,
  },
  currentStatus: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    padding: spacing.lg,
  },
  consentNotice: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    padding: spacing.md,
  },
  consentLeaf: {
    backgroundColor: colors.primaryFixedTint,
  },
  consentCaution: {
    backgroundColor: colors.solarAmberTint,
  },
  actionSection: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
  },
  actionList: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  parentAction: {
    width: '100%',
    minWidth: 0,
    minHeight: layout.touchTarget,
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionHeading: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  artUnavailable: {
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.surfaceContainer,
    padding: spacing.md,
  },
  scene: {
    width: '100%',
    minWidth: 0,
    height: 224,
    overflow: 'hidden',
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.mangroveTealTint,
  },
  sceneCompact: {
    height: 184,
  },
  sceneSky: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 68,
    left: 0,
    backgroundColor: colors.secondaryTint,
  },
  sceneSun: {
    position: 'absolute',
    top: 24,
    right: 34,
    width: 48,
    height: 48,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.solarAmber,
    opacity: 0.76,
  },
  sceneCoast: {
    position: 'absolute',
    right: -20,
    bottom: 56,
    left: -20,
    height: 54,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.sandLight,
    transform: [{ rotate: '-2deg' }],
  },
  sceneWater: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 72,
    backgroundColor: colors.waterLight,
  },
  canopyBack: {
    position: 'absolute',
    top: 34,
    left: '27%',
    width: 170,
    height: 96,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.leaf,
  },
  canopyLeft: {
    position: 'absolute',
    top: 55,
    left: '20%',
    width: 120,
    height: 76,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.ghafEmerald,
    transform: [{ rotate: '-8deg' }],
  },
  canopyRight: {
    position: 'absolute',
    top: 48,
    left: '43%',
    width: 126,
    height: 80,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.ghafEmerald,
    transform: [{ rotate: '7deg' }],
  },
  canopyTrunk: {
    position: 'absolute',
    left: '46%',
    bottom: 49,
    width: 18,
    height: 80,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.earth,
  },
  canopyRootLeft: {
    position: 'absolute',
    left: '37%',
    bottom: 42,
    width: 78,
    height: 8,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.earth,
    transform: [{ rotate: '-22deg' }],
  },
  canopyRootRight: {
    position: 'absolute',
    left: '44%',
    bottom: 38,
    width: 82,
    height: 8,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.earth,
    transform: [{ rotate: '20deg' }],
  },
  anonymousPlantOne: {
    position: 'absolute',
    left: 28,
    bottom: 48,
    width: 24,
    height: 34,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.mangrove,
    transform: [{ rotate: '-16deg' }],
  },
  anonymousPlantTwo: {
    position: 'absolute',
    right: 74,
    bottom: 51,
    width: 22,
    height: 32,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.leaf,
    transform: [{ rotate: '14deg' }],
  },
  anonymousPlantThree: {
    position: 'absolute',
    right: 30,
    bottom: 47,
    width: 25,
    height: 36,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.mangrove,
    transform: [{ rotate: '-8deg' }],
  },
  sceneRippleOne: {
    position: 'absolute',
    left: 24,
    bottom: 24,
    width: 110,
    height: 16,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: r001Radii.pill,
    opacity: opacity.subtle,
  },
  sceneRippleTwo: {
    position: 'absolute',
    right: 26,
    bottom: 18,
    width: 126,
    height: 15,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: r001Radii.pill,
    opacity: opacity.subtle,
  },
  flexCopy: {
    flex: 1,
    minWidth: 0,
  },
  shrinkCopy: {
    minWidth: 0,
    flexShrink: 1,
  },
  confirmationBoundary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  confirmationScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.inverseSurface,
    opacity: opacity.scrim,
  },
  confirmationCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.pearlGround,
  },
  confirmationContent: {
    minWidth: 0,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  confirmationHeading: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  confirmationActions: {
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  confirmationButton: {
    width: '100%',
    minWidth: 0,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
