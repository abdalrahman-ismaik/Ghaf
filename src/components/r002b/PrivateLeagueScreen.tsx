import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from 'react-native';

import { GhafIcon } from '@/components/access';
import { leagueAvatarArtworkIds, LocalIllustration } from '@/components/illustrations';
import { QuietButton, Text } from '@/components/primitives';
import { colors, logicalRowDirection, r001Radii, r001Shadows, spacing } from '@/design/tokens';
import type { LeagueTreeAvatarToken } from '@/models/familyLeague';

export type PrivateLeagueContentState = 'ready' | 'loading' | 'empty' | 'error' | 'offline';

export interface PrivateLeagueParticipantItem {
  readonly accessibilityLabel: string;
  readonly completedLeafCount: number;
  readonly displayName: string;
  readonly isActiveProfile: boolean;
  readonly leafProgressLabel: string;
  readonly positionLabel: string;
  readonly positionValue: string;
  readonly score: number;
  readonly scoreLabel: string;
  readonly treeAvatarToken: LeagueTreeAvatarToken;
}

export interface PrivateLeagueScreenProps {
  readonly activeChildLabel: string;
  readonly activeParticipant?: PrivateLeagueParticipantItem;
  readonly contentState: PrivateLeagueContentState;
  readonly direction: 'ltr' | 'rtl';
  readonly emptyMessage: string;
  readonly heroBody: string;
  readonly heroTitle: string;
  readonly language: 'ar' | 'en';
  readonly leafCompletedLabel: string;
  readonly leafPendingLabel: string;
  readonly leavesGroupLabel: string;
  readonly participants: readonly PrivateLeagueParticipantItem[];
  readonly privacyBody: string;
  readonly privacyTitle: string;
  readonly privateLabel: string;
  readonly onStateAction?: () => void;
  readonly stateActionLabel?: string;
  readonly stateMessage: string;
  readonly standingsBody: string;
  readonly standingsTitle: string;
  readonly syntheticLabel: string;
}

export function PrivateLeagueScreen({
  activeChildLabel,
  activeParticipant,
  contentState,
  direction,
  emptyMessage,
  heroBody,
  heroTitle,
  language,
  leafCompletedLabel,
  leafPendingLabel,
  leavesGroupLabel,
  participants,
  privacyBody,
  privacyTitle,
  privateLabel,
  onStateAction,
  stateActionLabel,
  stateMessage,
  standingsBody,
  standingsTitle,
  syntheticLabel,
}: PrivateLeagueScreenProps) {
  const { fontScale, width } = useWindowDimensions();
  const compact = width < 360 || fontScale >= 1.5;

  if (contentState === 'loading') {
    return (
      <LeagueStateCard direction={direction} language={language} message={stateMessage} loading />
    );
  }
  if (contentState === 'error' || contentState === 'empty' || !activeParticipant) {
    return (
      <LeagueStateCard
        actionLabel={stateActionLabel}
        direction={direction}
        language={language}
        message={contentState === 'empty' ? emptyMessage : stateMessage}
        onAction={onStateAction}
      />
    );
  }

  return (
    <View style={styles.root} testID="private-league-content">
      <View style={styles.hero}>
        <View
          style={[
            styles.heroMeta,
            compact ? styles.heroMetaCompact : null,
            { flexDirection: compact ? 'column' : logicalRowDirection(direction) },
          ]}
        >
          <View style={[styles.privateChip, { flexDirection: logicalRowDirection(direction) }]}>
            <GhafIcon color={colors.onPrimaryContainer} name="lock" size={17} />
            <Text
              brand
              color="onPrimaryContainer"
              direction={direction}
              language={language}
              style={styles.flexText}
              variant="caption"
            >
              {privateLabel}
            </Text>
          </View>
          <Text
            brand
            color="onPrimaryContainer"
            direction={direction}
            language={language}
            variant="caption"
          >
            {syntheticLabel}
          </Text>
        </View>

        <View style={styles.heroCopy}>
          <Text
            accessibilityRole="header"
            brand
            color="onPrimary"
            direction={direction}
            language={language}
            variant="hero"
          >
            {heroTitle}
          </Text>
          <Text
            brand
            color="onPrimaryContainer"
            direction={direction}
            language={language}
            variant="body"
          >
            {heroBody}
          </Text>
        </View>

        <View style={styles.activePanel}>
          <View
            style={[
              styles.activeSummary,
              compact ? styles.activeSummaryCompact : null,
              { flexDirection: compact ? 'column' : logicalRowDirection(direction) },
            ]}
          >
            <View style={styles.activeCopy}>
              <Text
                brand
                color="onPrimaryContainer"
                direction={direction}
                language={language}
                variant="caption"
              >
                {activeChildLabel}
              </Text>
              <Text
                brand
                color="onPrimary"
                direction={direction}
                language={language}
                variant="screenTitle"
              >
                {activeParticipant.displayName}
              </Text>
              <Text
                brand
                color="onPrimaryContainer"
                direction={direction}
                language={language}
                variant="label"
              >
                {activeParticipant.leafProgressLabel}
              </Text>
            </View>
            <View style={styles.scoreToken}>
              <Text
                align="center"
                brand
                color="deepForest"
                direction={direction}
                language={language}
                tabular
                variant="heading"
              >
                {activeParticipant.scoreLabel}
              </Text>
            </View>
          </View>

          <LeafProgress
            completed={activeParticipant.completedLeafCount}
            completedLabel={leafCompletedLabel}
            direction={direction}
            groupLabel={leavesGroupLabel}
            pendingLabel={leafPendingLabel}
          />
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text
          accessibilityRole="header"
          brand
          color="deepForest"
          direction={direction}
          language={language}
          variant="screenTitle"
        >
          {standingsTitle}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} language={language}>
          {standingsBody}
        </Text>
      </View>

      <View accessibilityRole="list" style={styles.standingsCard}>
        {participants.map((participant, index) => (
          <ParticipantRow
            compact={compact}
            direction={direction}
            key={`${participant.displayName}-${participant.positionLabel}`}
            language={language}
            last={index === participants.length - 1}
            participant={participant}
          />
        ))}
      </View>

      <View
        style={[
          styles.privacyCard,
          compact ? styles.privacyCardCompact : null,
          { flexDirection: compact ? 'column' : logicalRowDirection(direction) },
        ]}
      >
        <View
          style={[
            styles.privacyIcon,
            compact
              ? { alignSelf: direction === 'rtl' ? ('flex-end' as const) : ('flex-start' as const) }
              : null,
          ]}
        >
          <GhafIcon color={colors.secondary} name="shield" size={26} />
        </View>
        <View style={styles.privacyCopy}>
          <Text
            accessibilityRole="header"
            brand
            color="deepForest"
            direction={direction}
            language={language}
            variant="label"
          >
            {privacyTitle}
          </Text>
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={language}
            variant="caption"
          >
            {privacyBody}
          </Text>
        </View>
      </View>

      {contentState === 'offline' ? (
        <Text
          accessibilityLiveRegion="polite"
          align="center"
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={language}
          variant="caption"
        >
          {stateMessage}
        </Text>
      ) : null}
    </View>
  );
}

function LeafProgress({
  completed,
  completedLabel,
  direction,
  groupLabel,
  pendingLabel,
}: {
  completed: number;
  completedLabel: string;
  direction: 'ltr' | 'rtl';
  groupLabel: string;
  pendingLabel: string;
}) {
  return (
    <View
      accessibilityLabel={groupLabel}
      accessible
      style={[styles.leafGroup, { flexDirection: logicalRowDirection(direction) }]}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const isComplete = index < completed;
        return (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            key={index}
            style={[styles.leafMarker, isComplete ? styles.leafComplete : styles.leafPending]}
          >
            <GhafIcon
              color={isComplete ? colors.onPrimary : colors.onPrimaryContainer}
              name={isComplete ? 'check-filled' : 'leaf'}
              size={22}
            />
            <Text
              align="center"
              brand
              color={isComplete ? 'onPrimary' : 'onPrimaryContainer'}
              direction={direction}
              variant="caption"
            >
              {isComplete ? completedLabel : pendingLabel}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ParticipantRow({
  compact,
  direction,
  language,
  last,
  participant,
}: {
  compact: boolean;
  direction: 'ltr' | 'rtl';
  language: 'ar' | 'en';
  last: boolean;
  participant: PrivateLeagueParticipantItem;
}) {
  const copy = (
    <View style={styles.participantCopy}>
      <Text brand color="deepForest" direction={direction} language={language} variant="label">
        {participant.displayName}
      </Text>
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        language={language}
        variant="caption"
      >
        {participant.leafProgressLabel}
      </Text>
      <Text brand color="primary" direction={direction} language={language} variant="caption">
        {participant.positionLabel}
      </Text>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start',
              width: `${participant.score}%`,
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <View
      accessibilityLabel={participant.accessibilityLabel}
      accessible
      style={[
        styles.participantRow,
        compact ? styles.participantRowCompact : null,
        last ? null : styles.participantDivider,
        { flexDirection: compact ? 'column' : logicalRowDirection(direction) },
      ]}
    >
      <View
        style={[
          styles.participantLead,
          compact ? styles.participantLeadCompact : null,
          { flexDirection: logicalRowDirection(direction) },
        ]}
      >
        <View
          style={[styles.positionToken, participant.isActiveProfile ? styles.activePosition : null]}
        >
          <Text
            align="center"
            brand
            color={participant.isActiveProfile ? 'onPrimary' : 'primary'}
            direction={direction}
            language={language}
            tabular
            variant="label"
          >
            {participant.positionValue}
          </Text>
        </View>
        <View style={styles.avatarToken}>
          <LocalIllustration
            assetId={leagueAvatarArtworkIds[participant.treeAvatarToken]}
            decorative
            direction={direction}
            style={styles.avatarArtwork}
          />
        </View>
        {compact ? null : copy}
      </View>
      {compact ? copy : null}
      <View style={[styles.rowScore, compact ? styles.rowScoreCompact : null]}>
        <Text
          align="center"
          brand
          color="primary"
          direction={direction}
          language={language}
          tabular
          variant="label"
        >
          {participant.scoreLabel}
        </Text>
      </View>
    </View>
  );
}

function LeagueStateCard({
  actionLabel,
  direction,
  language,
  loading = false,
  message,
  onAction,
}: {
  actionLabel?: string;
  direction: 'ltr' | 'rtl';
  language: 'ar' | 'en';
  loading?: boolean;
  message: string;
  onAction?: () => void;
}) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.stateCard} testID="private-league-state">
      {loading ? <ActivityIndicator color={colors.ghafEmerald} /> : null}
      <GhafIcon color={colors.ghafEmerald} name={loading ? 'leaf' : 'info'} size={28} />
      <Text align="center" brand color="onSurfaceVariant" direction={direction} language={language}>
        {message}
      </Text>
      {!loading && actionLabel && onAction ? (
        <QuietButton
          accessibilityLabel={actionLabel}
          brand
          direction={direction}
          language={language}
          onPress={onAction}
        >
          {actionLabel}
        </QuietButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: spacing.xl,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    gap: spacing.lg,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.deepForest,
    padding: spacing.xl,
    ...r001Shadows.soft,
  },
  heroMeta: {
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingEnd: spacing.huge,
  },
  heroMetaCompact: {
    alignItems: 'stretch',
    paddingEnd: 0,
  },
  privateChip: {
    minHeight: 32,
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: r001Radii.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  flexText: {
    flexShrink: 1,
  },
  heroCopy: {
    gap: spacing.xs,
  },
  activePanel: {
    gap: spacing.lg,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.primary,
    padding: spacing.lg,
  },
  activeSummary: {
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  activeSummaryCompact: {
    alignItems: 'stretch',
  },
  activeCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  scoreToken: {
    minWidth: 88,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.solarAmberTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  leafGroup: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  leafMarker: {
    minWidth: 46,
    minHeight: 54,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: r001Radii.md,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  leafComplete: {
    backgroundColor: colors.ghafEmerald,
  },
  leafPending: {
    borderWidth: 1,
    borderColor: colors.onPrimaryContainer,
    backgroundColor: colors.deepForest,
  },
  sectionHeading: {
    gap: spacing.xxs,
  },
  standingsCard: {
    overflow: 'hidden',
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.lg,
    ...r001Shadows.soft,
  },
  participantRow: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  participantRowCompact: {
    alignItems: 'stretch',
  },
  participantLead: {
    minWidth: 0,
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  participantLeadCompact: {
    flex: 0,
    alignSelf: 'stretch',
  },
  participantDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  positionToken: {
    minWidth: 38,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.primaryFixedTint,
    paddingHorizontal: spacing.xxs,
  },
  activePosition: {
    backgroundColor: colors.ghafEmerald,
  },
  avatarToken: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: colors.mangroveTealTint,
  },
  avatarArtwork: {
    width: '100%',
    height: '100%',
  },
  participantCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    overflow: 'hidden',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerHigh,
  },
  progressFill: {
    height: '100%',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.solarAmber,
  },
  rowScore: {
    minWidth: 70,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.solarAmberTint,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  rowScoreCompact: {
    width: '100%',
    minHeight: 48,
    alignSelf: 'stretch',
  },
  privacyCard: {
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.mangroveTealTint,
    padding: spacing.lg,
  },
  privacyCardCompact: {
    alignItems: 'stretch',
  },
  privacyIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
  },
  privacyCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  stateCard: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.xl,
    ...r001Shadows.soft,
  },
});
