import { useState } from 'react';
import { View } from 'react-native';

import { LocalIllustration, leagueAvatarArtworkIds } from '@/components/illustrations';
import { PREPARED_LEAGUE_ENCOURAGEMENTS } from '@/features/league';
import type { CloudFamilyChild, CloudFamilyTask } from '@/models/cloudFamily';
import type {
  CloudGrowthCommand,
  CloudLeagueNomination,
  CloudLeagueWeek,
} from '@/models/cloudGrowth';
import type { LeagueTreeAvatarToken, PreparedLeagueEncouragementId } from '@/models/familyLeague';

import {
  GrowthButton,
  GrowthField,
  GrowthRow,
  GrowthText,
  growthStyles as s,
  useGrowthCopy,
  useGrowthPassword,
} from './common';

const avatars: readonly LeagueTreeAvatarToken[] = ['mangrove_shoot', 'ghaf_leaf', 'sidr_sapling'];
const phrases: readonly PreparedLeagueEncouragementId[] = [
  'great_growing',
  'keep_growing',
  'one_leaf_together',
];

export function eligibleChallengeTasks(
  tasks: readonly CloudFamilyTask[],
  child: CloudFamilyChild,
): readonly CloudFamilyTask[] {
  return tasks.filter(
    (task) =>
      task.childId === child.id &&
      task.familyId === child.familyId &&
      task.catalogId === 'task_recycling_p0_v1' &&
      task.status !== 'recognized' &&
      task.template.childAgeBands.includes(child.ageBand) &&
      task.template.categoryId === 'green_impact' &&
      task.template.visibilityScope === 'household' &&
      task.template.routinePhase === 'acquisition' &&
      task.template.recognitionMode !== 'recognition_only' &&
      (task.template.displayedSeedAward ?? 0) > 0,
  );
}

export function CloudLeagueForm({
  child,
  tasks,
  revision,
  nomination,
  busy,
  onSave,
  onCancel,
}: {
  readonly child: CloudFamilyChild;
  readonly tasks: readonly CloudFamilyTask[];
  readonly revision: number;
  readonly nomination?: CloudLeagueNomination;
  readonly busy: boolean;
  readonly onSave: (command: CloudGrowthCommand, password?: string) => Promise<boolean>;
  readonly onCancel: () => void;
}) {
  const { text, locale, direction, number } = useGrowthCopy();
  const [nickname, setNickname] = useState(nomination?.nickname[locale] ?? '');
  const [avatar, setAvatar] = useState<LeagueTreeAvatarToken>(
    nomination?.treeAvatarToken ?? 'ghaf_leaf',
  );
  const [selection, setSelection] = useState<readonly string[]>(nomination?.taskIds ?? []);
  const [password, setPassword] = useGrowthPassword();
  const [invalid, setInvalid] = useState(false);
  const eligible = eligibleChallengeTasks(tasks, child);
  const chosen = selection.filter((id) => eligible.some((task) => task.id === id));
  const save = () => {
    if (!nickname.trim() || chosen.length !== 5 || !password) {
      setInvalid(true);
      return;
    }
    const label = nickname.trim();
    const command: CloudGrowthCommand = {
      type: 'league.nominate',
      childId: child.id,
      expectedRevision: revision,
      nickname: { ...(nomination?.nickname ?? { ar: label, en: label }), [locale]: label },
      treeAvatarToken: avatar,
      taskIds: chosen,
    };
    setPassword('');
    setInvalid(false);
    void onSave(command, password);
  };
  return (
    <View style={s.card} testID="cloud-league-form">
      <GrowthText variant="heading" accessibilityRole="header">
        {text('nominate')}
      </GrowthText>
      <GrowthText>{text('nominationNotice')}</GrowthText>
      <GrowthField
        label={text('nickname')}
        value={nickname}
        onChangeText={setNickname}
        maxLength={40}
        editable={!busy}
      />
      <GrowthText>{text('avatar')}</GrowthText>
      <GrowthRow>
        {avatars.map((value) => (
          <GrowthButton
            key={value}
            variant={avatar === value ? 'primary' : 'secondary'}
            disabled={busy}
            accessibilityState={{ selected: value === avatar }}
            onPress={() => setAvatar(value)}
          >
            {text(value)}
          </GrowthButton>
        ))}
      </GrowthRow>
      <LocalIllustration
        assetId={leagueAvatarArtworkIds[avatar]}
        decorative
        direction={direction}
        style={{ width: 72, height: 72 }}
      />
      <GrowthText accessibilityLiveRegion="polite">
        {text('selected', { count: number(chosen.length) })}
      </GrowthText>
      {eligible.length === 0 ? <GrowthText>{text('noEligible')}</GrowthText> : null}
      {eligible.map((task, index) => {
        const selected = chosen.includes(task.id);
        return (
          <GrowthButton
            key={task.id}
            variant={selected ? 'primary' : 'secondary'}
            accessibilityState={{ selected }}
            disabled={busy || (!selected && chosen.length === 5)}
            onPress={() =>
              setSelection(selected ? chosen.filter((id) => id !== task.id) : [...chosen, task.id])
            }
          >
            {number(index + 1)}. {task.template.title[locale]}
          </GrowthButton>
        );
      })}
      <GrowthText>{text('passwordNotice')}</GrowthText>
      <GrowthField
        label={text('password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        autoCapitalize="none"
        editable={!busy}
      />
      {invalid ? (
        <GrowthText accessibilityRole="alert">{text('invalidNomination')}</GrowthText>
      ) : null}
      <GrowthRow>
        <GrowthButton disabled={busy || chosen.length !== 5} onPress={save}>
          {text('confirm')}
        </GrowthButton>
        <GrowthButton
          variant="secondary"
          disabled={busy}
          onPress={() => {
            setPassword('');
            onCancel();
          }}
        >
          {text('cancel')}
        </GrowthButton>
      </GrowthRow>
    </View>
  );
}

export function CloudLeagueView({
  league,
  currentWeekKey,
  child,
  parent,
  busy,
  onNominate,
  onRest,
  onEncourage,
}: {
  readonly league: CloudLeagueWeek | null;
  readonly currentWeekKey: string;
  readonly child: CloudFamilyChild | null;
  readonly parent: boolean;
  readonly busy: boolean;
  readonly onNominate: () => void;
  readonly onRest: (nomination: CloudLeagueNomination) => void;
  readonly onEncourage: (recipientId: string, phraseId: PreparedLeagueEncouragementId) => void;
}) {
  const { text, locale, direction, number } = useGrowthCopy();
  const nomination = child
    ? league?.nominations.find((row) => row.childId === child.id)
    : undefined;
  const selectedRow = nomination
    ? league?.rows.find((row) => row.participantId === nomination.participantId)
    : null;
  const canNominate = !selectedRow || selectedRow.completedLeafCount === 0;
  return (
    <View style={s.stack} testID="cloud-league-view">
      <GrowthText>{text('leagueBody')}</GrowthText>
      <GrowthText>{text('week', { week: currentWeekKey })}</GrowthText>
      <GrowthText>{text('leagueRules')}</GrowthText>
      {parent && child ? (
        <GrowthRow>
          <GrowthButton disabled={busy || !canNominate} onPress={onNominate}>
            {text('nominate')}
          </GrowthButton>
          {nomination ? (
            <GrowthButton variant="secondary" disabled={busy} onPress={() => onRest(nomination)}>
              {text(nomination.rest ? 'resume' : 'rest')}
            </GrowthButton>
          ) : null}
        </GrowthRow>
      ) : null}
      {nomination?.rest ? <GrowthText>{text('resting')}</GrowthText> : null}
      {!league || league.rows.length === 0 ? (
        <GrowthText testID="cloud-league-empty">{text('noLeague')}</GrowthText>
      ) : (
        <>
          <GrowthText>
            {text('cooperative', {
              count: number(league.cooperativeConfirmedCount),
              goal: number(league.cooperativeGoal),
            })}
          </GrowthText>
          {league.rows.map((row) => (
            <View key={row.participantId} style={s.card}>
              <GrowthRow>
                <LocalIllustration
                  assetId={leagueAvatarArtworkIds[row.treeAvatarToken]}
                  decorative
                  direction={direction}
                  style={{ width: 60, height: 60 }}
                />
                <GrowthText variant="heading">
                  {row.nickname[locale]}
                  {row.participantId === league.ownParticipantId ? ` · ${text('own')}` : ''}
                </GrowthText>
              </GrowthRow>
              <GrowthText>{text('position', { position: number(row.position) })}</GrowthText>
              <GrowthText>
                {text('score', { count: number(row.score) })} ·{' '}
                {text('leaves', { count: number(row.completedLeafCount) })}
              </GrowthText>
              {!parent &&
              league.ownParticipantId &&
              row.participantId !== league.ownParticipantId ? (
                <>
                  <GrowthText>{text('encourage')}</GrowthText>
                  <GrowthRow>
                    {phrases.map((phraseId) => (
                      <GrowthButton
                        key={phraseId}
                        variant="secondary"
                        disabled={busy}
                        onPress={() => onEncourage(row.participantId, phraseId)}
                      >
                        {PREPARED_LEAGUE_ENCOURAGEMENTS[phraseId][locale]}
                      </GrowthButton>
                    ))}
                  </GrowthRow>
                </>
              ) : null}
            </View>
          ))}
          {league.encouragements.map((entry) => (
            <View key={entry.id} style={s.notice}>
              <GrowthText>{text('encouragementSaved')}</GrowthText>
              <GrowthText>{PREPARED_LEAGUE_ENCOURAGEMENTS[entry.phraseId][locale]}</GrowthText>
            </View>
          ))}
        </>
      )}
    </View>
  );
}
