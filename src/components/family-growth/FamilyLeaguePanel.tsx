import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Card, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import type { LeagueParticipantProjection, LeagueTreeAvatarToken } from '@/models/familyLeague';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export interface FamilyLeaguePanelProps {
  readonly canSendEncouragement: boolean;
  readonly cooperativeConfirmedCount: number;
  readonly cooperativeGoal: number;
  readonly encouragementSent: boolean;
  readonly error: string | null;
  readonly onSendEncouragement: () => void;
  readonly onStart: () => void;
  readonly participants: readonly LeagueParticipantProjection[];
  readonly role: 'parent' | 'child';
  readonly started: boolean;
}

const AVATAR_KEYS: Readonly<Record<LeagueTreeAvatarToken, string>> = {
  mangrove_shoot: 'familyLeague.mangroveShoot',
  ghaf_leaf: 'familyLeague.ghafLeaf',
  sidr_sapling: 'familyLeague.sidrSapling',
};

export function FamilyLeaguePanel({
  canSendEncouragement,
  cooperativeConfirmedCount,
  cooperativeGoal,
  encouragementSent,
  error,
  onSendEncouragement,
  onStart,
  participants,
  role,
  started,
}: FamilyLeaguePanelProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const safeGoal = Math.max(1, cooperativeGoal);
  const progress = Math.min(100, (Math.max(0, cooperativeConfirmedCount) / safeGoal) * 100);

  return (
    <Card testID="family-league-panel" variant="tonal">
      <View style={styles.heading}>
        <Text color="forest" variant="heading">
          {t('familyLeague.title')}
        </Text>
        <Text color="inkMuted">
          {t(role === 'parent' ? 'familyLeague.parentBody' : 'familyLeague.childBody')}
        </Text>
        <Text color="mangrove" variant="caption">
          {t('familyLeague.fixedParticipants')}
        </Text>
      </View>

      {!started ? (
        role === 'parent' ? (
          <Button onPress={onStart} testID="start-family-league" variant="secondary">
            {t('familyLeague.start')}
          </Button>
        ) : (
          <Text color="inkMuted">{t('familyLeague.notStarted')}</Text>
        )
      ) : (
        <View style={styles.league} testID="family-league-week">
          <View style={styles.cooperative}>
            <Text color="forest" variant="label">
              {t('familyLeague.cooperative', {
                current: cooperativeConfirmedCount,
                goal: cooperativeGoal,
              })}
            </Text>
            <View
              accessibilityLabel={t('accessibility.progress', {
                current: cooperativeConfirmedCount,
                goal: cooperativeGoal,
              })}
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: cooperativeGoal,
                now: cooperativeConfirmedCount,
              }}
              style={styles.progressTrack}
            >
              <View
                style={[
                  styles.progressFill,
                  direction === 'rtl' ? styles.progressRtl : styles.progressLtr,
                  { width: `${progress}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.participants}>
            {participants.map((participant) => (
              <View
                key={`${participant.nickname.en}-${participant.treeAvatarToken}`}
                style={[styles.participant, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
              >
                <View aria-hidden style={styles.avatarMark} />
                <View style={styles.participantCopy}>
                  <Text color="forest" variant="label">
                    {localize(participant.nickname, locale)}
                  </Text>
                  <Text color="earth" variant="caption">
                    {t(AVATAR_KEYS[participant.treeAvatarToken])}
                  </Text>
                  <Text>
                    {t('familyLeague.completed', { count: participant.completedLeafCount })} ·{' '}
                    {t('familyLeague.score', { count: participant.score })}
                  </Text>
                  <Text color="mangrove" variant="caption">
                    {t('familyLeague.position', { count: participant.position })}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {role === 'child' && canSendEncouragement ? (
            <View style={styles.encouragement}>
              <Text color="forest" variant="label">
                {t('familyLeague.encouragement')}
              </Text>
              {encouragementSent ? (
                <Text accessibilityLiveRegion="polite" color="mangrove" variant="caption">
                  {t('familyLeague.encouragementSent')}
                </Text>
              ) : (
                <Button
                  onPress={onSendEncouragement}
                  testID="send-family-league-encouragement"
                  variant="quiet"
                >
                  {t('familyLeague.sendEncouragement')}
                </Button>
              )}
            </View>
          ) : null}
          <Text color="inkMuted" variant="caption">
            {t('familyLeague.projectionBoundary')}
          </Text>
        </View>
      )}

      {error ? (
        <Text accessibilityLiveRegion="polite" color="danger" testID="family-league-error">
          {error}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.xs },
  league: { gap: spacing.md },
  cooperative: { gap: spacing.xs },
  progressTrack: {
    height: spacing.sm,
    overflow: 'hidden',
    borderRadius: radii.pill,
    backgroundColor: colors.leafLight,
  },
  progressFill: {
    height: '100%',
    position: 'absolute',
    backgroundColor: colors.ghaf,
  },
  progressRtl: { end: 0 },
  progressLtr: { start: 0 },
  participants: { borderTopWidth: 1, borderTopColor: colors.line },
  participant: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.sm,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  avatarMark: {
    width: spacing.lg,
    height: spacing.xl,
    flexShrink: 0,
    marginTop: spacing.xxs,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    backgroundColor: colors.mangrove,
  },
  participantCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  encouragement: { gap: spacing.xs },
});
