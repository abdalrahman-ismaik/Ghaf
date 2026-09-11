import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from 'react-native';

import { GhafIcon } from '@/components/access';
import { leagueAvatarArtworkIds, LocalIllustration } from '@/components/illustrations';
import { QuietButton, Text } from '@/components/primitives';
import { botanical, colors, logicalRowDirection, spacing } from '@/design/tokens';
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
        <View style={styles.heroCopy}>
          <Text
            accessibilityRole="header"
            brand
            color="deepForest"
            direction={direction}
            language={language}
            variant="hero"
          >
            {heroTitle}
          </Text>
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={language}
            variant="body"
          >
            {heroBody}
          </Text>
        </View>

        <View
          style={[
            styles.heroMeta,
            compact ? styles.heroMetaCompact : null,
            { flexDirection: compact ? 'column' : logicalRowDirection(direction) },
          ]}
        >
          <View style={[styles.privateChip, { flexDirection: logicalRowDirection(direction) }]}>
            <GhafIcon color={botanical.colors.forest} name="lock" size={17} />
            <Text
              brand
              color="onSurfaceVariant"
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
            color="onSurfaceVariant"
            direction={direction}
            language={language}
            variant="caption"
          >
            {syntheticLabel}
          </Text>
        </View>

        <View style={styles.activePanel}>
          <View
            style={[
              styles.activeSummary,
              compact ? styles.activeSummaryCompact : null,
              { flexDirection: logicalRowDirection(direction) },
            ]}
          >
            {compact ? null : (
              <LocalIllustration
                assetId={leagueAvatarArtworkIds[activeParticipant.treeAvatarToken]}
                decorative
                direction={direction}
                style={styles.activeAvatar}
              />
            )}
            <View style={styles.activeCopy}>
              <Text
                brand
                color="onPrimary"
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
                color="onPrimary"
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
              color={botanical.colors.onForest}
              name={isComplete ? 'check-filled' : 'leaf'}
              size={22}
            />
            <Text align="center" brand color="onPrimary" direction={direction} variant="caption">
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
      {loading ? <ActivityIndicator color={botanical.colors.forest} /> : null}
      <GhafIcon color={botanical.colors.forest} name={loading ? 'leaf' : 'info'} size={28} />
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
    gap: botanical.space.section,
  },
  hero: {
    gap: botanical.space.row,
  },
  heroMeta: {
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
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
    paddingVertical: spacing.xxs,
  },
  flexText: {
    flexShrink: 1,
  },
  heroCopy: {
    gap: spacing.xs,
  },
  activePanel: {
    gap: botanical.space.inset,
    borderRadius: botanical.radius.hero,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.forest,
    padding: botanical.space.inset,
  },
  activeSummary: {
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  activeSummaryCompact: {
    alignItems: 'stretch',
  },
  activeCopy: {
    minWidth: 0,
    flex: 1,
    flexBasis: 120,
    gap: spacing.xxs,
  },
  activeAvatar: {
    width: 64,
    height: 64,
    flexShrink: 0,
    borderRadius: botanical.radius.control,
  },
  scoreToken: {
    minWidth: 72,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.amberWash,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  leafGroup: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  leafMarker: {
    minWidth: 40,
    minHeight: 54,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: botanical.radius.small,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  leafComplete: {
    backgroundColor: botanical.colors.forestRaised,
  },
  leafPending: {
    borderWidth: 1,
    borderColor: botanical.colors.forestRaised,
    backgroundColor: botanical.colors.forest,
  },
  sectionHeading: {
    gap: spacing.xxs,
  },
  standingsCard: {
    minWidth: 0,
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
    borderBottomColor: botanical.colors.line,
  },
  positionToken: {
    minWidth: 38,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.small,
    borderCurve: 'continuous',
    backgroundColor: colors.transparent,
    paddingHorizontal: spacing.xxs,
  },
  activePosition: {
    backgroundColor: botanical.colors.forest,
  },
  avatarToken: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: botanical.colors.water,
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
    height: 4,
    overflow: 'hidden',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.line,
  },
  progressFill: {
    height: '100%',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.amber,
  },
  rowScore: {
    minWidth: 70,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  rowScoreCompact: {
    width: '100%',
    minHeight: 48,
    alignSelf: 'stretch',
    backgroundColor: botanical.colors.sage,
    borderRadius: botanical.radius.small,
  },
  privacyCard: {
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: botanical.colors.line,
    paddingVertical: botanical.space.inset,
  },
  privacyCardCompact: {
    alignItems: 'stretch',
  },
  privacyIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.small,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.paper,
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
    borderRadius: botanical.radius.hero,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.paper,
    padding: spacing.xl,
  },
});
