import { useMemo, useState } from 'react';
import { Redirect, useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafIcon } from '@/components/access';
import { QuietButton, Text } from '@/components/primitives';
import { ChildBottomNavigation, ChildHomeHeader, R002aScreen } from '@/components/r002a';
import {
  PrivateLeagueScreen,
  type PrivateLeagueParticipantItem,
} from '@/components/r002b/PrivateLeagueScreen';
import { colors, logicalRowDirection, r001Radii, r001Shadows, spacing } from '@/design/tokens';
import { buildPrivateLeaguePresentation } from '@/features/league/presentation';
import { localize } from '@/i18n';
import { selectCanEnterChildExperience, usePrototypeStore } from '@/state/usePrototypeStore';

export default function PrivateLeagueRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const canEnterChildExperience = usePrototypeStore(selectCanEnterChildExperience);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const activeChild = usePrototypeStore((state) => state.children[state.activeChildId]);
  const privateLeague = usePrototypeStore((state) => state.privateLeague);
  const [helpOpen, setHelpOpen] = useState(false);
  const formatter = useMemo(
    () => new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', { useGrouping: false }),
    [locale],
  );
  const presentation = useMemo(
    () =>
      buildPrivateLeaguePresentation({
        activeProfileId: activeChildId,
        privateLeague,
      }),
    [activeChildId, privateLeague],
  );
  const leavesPerWeek = presentation.ok ? presentation.data.leavesPerWeek : 5;
  const participants: readonly PrivateLeagueParticipantItem[] = presentation.ok
    ? presentation.data.participants.map((participant) => {
        const displayName = localize(participant.nickname, locale);
        const completed = formatter.format(participant.completedLeafCount);
        const position = formatter.format(participant.position);
        const score = formatter.format(participant.score);
        const total = formatter.format(leavesPerWeek);
        const sharedPosition = presentation.data.participants.some(
          (candidate) => candidate !== participant && candidate.position === participant.position,
        );
        const positionLabel = t(
          sharedPosition ? 'r002bLeague.sharedPosition' : 'r002bLeague.position',
          { position },
        );

        return {
          accessibilityLabel: t('r002bLeague.participantAccessibility', {
            name: displayName,
            positionLabel,
            completed,
            total,
            score,
          }),
          completedLeafCount: participant.completedLeafCount,
          displayName,
          isActiveProfile: participant.isActiveProfile,
          leafProgressLabel: t('r002bLeague.leafProgress', { completed, total }),
          positionLabel,
          positionValue: position,
          score: participant.score,
          scoreLabel: t('r002bLeague.score', { score }),
          treeAvatarToken: participant.treeAvatarToken,
        };
      })
    : [];
  const activeParticipant = participants.find((participant) => participant.isActiveProfile);

  if (activeExperience === 'parent') return <Redirect href="/parent" />;
  if (activeExperience !== 'child' || !canEnterChildExperience) return <Redirect href="/" />;

  const footer = (
    <ChildBottomNavigation
      activeKey="league"
      direction={direction}
      gardenLabel={t('navigation.childGarden')}
      leagueLabel={t('navigation.league')}
      leagueUnavailableHint={t('navigation.leagueUnavailable')}
      onGarden={() => router.replace('/garden')}
      onLeague={() => undefined}
      onToday={() => router.replace('/child')}
      todayLabel={t('navigation.today')}
    />
  );

  return (
    <R002aScreen
      contentContainerStyle={styles.screenContent}
      footer={footer}
      header={
        <ChildHomeHeader
          avatarLabel={localize(activeChild.displayName, locale)}
          direction={direction}
          helpLabel={t('common.help')}
          helpOpen={helpOpen}
          onAvatarPress={() => router.push('/child/settings' as Href)}
          onToggleHelp={() => setHelpOpen((current) => !current)}
          title={t('r002bLeague.screenTitle')}
        />
      }
      testID="private-league-route"
    >
      {helpOpen ? (
        <View accessibilityLiveRegion="polite" style={styles.helpCard} testID="league-help-card">
          <View style={[styles.helpCopy, { flexDirection: logicalRowDirection(direction) }]}>
            <View style={styles.helpIcon}>
              <GhafIcon color={colors.ghafEmerald} name="help" size={24} />
            </View>
            <Text
              brand
              color="onSurfaceVariant"
              direction={direction}
              language={locale}
              style={styles.flexText}
            >
              {t('r002bLeague.helpBody')}
            </Text>
          </View>
          <QuietButton
            accessibilityLabel={t('common.close')}
            brand
            fullWidth
            language={locale}
            onPress={() => setHelpOpen(false)}
          >
            {t('common.close')}
          </QuietButton>
        </View>
      ) : null}

      <PrivateLeagueScreen
        {...(activeParticipant ? { activeParticipant } : {})}
        activeChildLabel={t('r002bLeague.activeChildLabel')}
        contentState={presentation.ok ? 'ready' : 'error'}
        direction={direction}
        emptyMessage={t('r002bLeague.state.empty')}
        heroBody={t('r002bLeague.heroBody')}
        heroTitle={t('r002bLeague.heroTitle')}
        language={locale}
        leafCompletedLabel={t('r002bLeague.leafCompleted')}
        leafPendingLabel={t('r002bLeague.leafPending')}
        leavesGroupLabel={t('r002bLeague.leavesGroup', {
          completed: formatter.format(activeParticipant?.completedLeafCount ?? 0),
          total: formatter.format(leavesPerWeek),
        })}
        onStateAction={() => router.replace('/child')}
        participants={participants}
        privacyBody={t('r002bLeague.privacyBody')}
        privacyTitle={t('r002bLeague.privacyTitle')}
        privateLabel={t('r002bLeague.privateLabel')}
        stateActionLabel={t('r002bLeague.stateAction')}
        stateMessage={t('r002bLeague.state.error')}
        standingsBody={t('r002bLeague.standingsBody')}
        standingsTitle={t('r002bLeague.standingsTitle')}
        syntheticLabel={t('r002bLeague.syntheticLabel')}
      />
    </R002aScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing.xxxl,
  },
  helpCard: {
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  helpCopy: {
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  helpIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.ghafEmeraldTint,
  },
  flexText: {
    minWidth: 0,
    flex: 1,
  },
});
