import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessTextField, ChoiceChip, StatusBanner } from '@/components/access';
import {
  BotanicalAvatar,
  botanicalAvatarOptions,
  type BotanicalAvatarId,
} from '@/components/access/BotanicalAvatar';
import { Button, Text } from '@/components/primitives';
import { logicalRowDirection } from '@/design/tokens';
import type { CloudCommand } from '@/models/normalizedCloudFamily';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import {
  CloudGrowthChildPicker,
  cloudGrowthStyles,
  visibleCloudChildren,
  type CloudGrowthPanelProps,
} from './GrowthPanel';

const providerIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function LeaguePanel({ snapshot, busy, command }: CloudGrowthPanelProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const [circleName, setCircleName] = useState('');
  const [circleId, setCircleId] = useState('');
  const [childId, setChildId] = useState('');
  const [nickname, setNickname] = useState('');
  const [invitedOwnerId, setInvitedOwnerId] = useState('');
  const [selection, setSelection] = useState<{
    circleId: string;
    childId: string;
    ids: string[];
  } | null>(null);
  const [feedback, setFeedback] = useState<'failed' | 'saved' | 'inviteSent' | null>(null);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const text = (key: string, values?: Record<string, string | number>) =>
    t(`normalizedCloudFamily.league.${key}`, values);
  const circles = snapshot.extras.league.circles;
  const circle = circles.find((item) => item.id === circleId) ?? circles[0];
  const children = visibleCloudChildren(snapshot);
  const selectedChild = children.find((child) => child.id === childId);
  const membership = circle?.memberships.find((entry) => entry.childId === selectedChild?.id);
  const isParent = snapshot.actor.role === 'parent';
  const disabled = busy || saving;
  const selectedAssignments =
    selection?.circleId === circle?.id && selection?.childId === childId ? selection.ids : [];
  const eligible = snapshot.assignments.filter((assignment) => {
    if (!membership?.eligibleAssignmentIds.includes(assignment.id)) return false;
    if (
      assignment.child_id !== selectedChild?.id ||
      assignment.family_id !== snapshot.actor.family_id
    )
      return false;
    const task = snapshot.tasks.find(
      (entry) => entry.id === assignment.task_id && entry.version === assignment.task_version,
    );
    return (
      assignment.state === 'assigned' &&
      task?.league_eligible &&
      task.visibility_scope === 'household' &&
      !['faith_gratitude', 'roots_kinship', 'food_hospitality', 'learning_wellbeing'].includes(
        task.category_id,
      )
    );
  });
  const hasSavedLeaves = (membership?.nominatedAssignmentIds.length ?? 0) > 0;
  const send = async (next: CloudCommand): Promise<boolean> => {
    if (disabled || pending.current || !isParent) return false;
    pending.current = true;
    setSaving(true);
    setFeedback(null);
    try {
      const result = await command(next);
      setFeedback(result ? (next.type === 'circle.invite' ? 'inviteSent' : 'saved') : 'failed');
      return !!result;
    } catch {
      setFeedback('failed');
      return false;
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  const toggleAssignment = (id: string) => {
    if (!circle || !selectedChild || disabled) return;
    const ids = selectedAssignments.includes(id)
      ? selectedAssignments.filter((entry) => entry !== id)
      : selectedAssignments.length < 5
        ? [...selectedAssignments, id]
        : selectedAssignments;
    setSelection({ circleId: circle.id, childId: selectedChild.id, ids });
  };

  return (
    <View style={cloudGrowthStyles.panel} testID="cloud-league-panel">
      <Text
        brand
        direction={direction}
        language={locale}
        variant="screenTitle"
        accessibilityRole="header"
      >
        {text('title')}
      </Text>
      <Text brand direction={direction} language={locale}>
        {text('body')}
      </Text>
      {isParent ? (
        <View style={cloudGrowthStyles.section}>
          <AccessTextField
            label={text('circleName')}
            accessibilityLabel={text('circleName')}
            direction="auto"
            language={locale}
            value={circleName}
            editable={!disabled}
            maxLength={80}
            onChangeText={setCircleName}
            testID="cloud-league-name"
          />
          <Button
            brand
            direction={direction}
            language={locale}
            disabled={disabled || circleName.trim().length < 2}
            onPress={() =>
              void send({ type: 'circle.create', name: circleName.trim() }).then((saved) => {
                if (saved) setCircleName('');
              })
            }
            testID="cloud-league-create"
          >
            {text('create')}
          </Button>
          {snapshot.extras.league.invitations.length > 0 ? (
            <Text brand direction={direction} language={locale} variant="heading">
              {text('invitations')}
            </Text>
          ) : null}
          {snapshot.extras.league.invitations.map((invitation) => (
            <View key={invitation.id} style={cloudGrowthStyles.rule}>
              <Text brand direction={direction} language={locale}>
                {text('invitedCircle', { name: invitation.circleName })}
              </Text>
              <Button
                brand
                direction={direction}
                language={locale}
                disabled={disabled}
                variant="secondary"
                onPress={() => void send({ type: 'circle.accept', invitationId: invitation.id })}
                testID={`cloud-league-accept-${invitation.id}`}
              >
                {text('accept')}
              </Button>
            </View>
          ))}
        </View>
      ) : null}
      {!circle ? (
        <Text brand direction={direction} language={locale}>
          {text('empty')}
        </Text>
      ) : (
        <>
          <View style={[cloudGrowthStyles.wrap, { flexDirection: logicalRowDirection(direction) }]}>
            {circles.map((entry) => (
              <ChoiceChip
                key={entry.id}
                direction={direction}
                language={locale}
                disabled={disabled}
                selected={circle.id === entry.id}
                label={entry.name}
                onPress={() => {
                  setCircleId(entry.id);
                  setFeedback(null);
                }}
                testID={`cloud-league-circle-${entry.id}`}
              />
            ))}
          </View>
          <Text brand direction={direction} language={locale} variant="heading">
            {circle.name}
          </Text>
          {circle.rows.length === 0 ? (
            <Text brand direction={direction} language={locale}>
              {text('noMembers')}
            </Text>
          ) : null}
          <View style={cloudGrowthStyles.section} testID="cloud-league-shared-rows">
            {circle.rows.map((entry, index) => (
              <View key={`${entry.nickname}-${index}`} style={cloudGrowthStyles.rule}>
                <BotanicalAvatar
                  direction={direction}
                  id={
                    botanicalAvatarOptions.includes(entry.avatarId as BotanicalAvatarId)
                      ? (entry.avatarId as BotanicalAvatarId)
                      : 'ghaf_tree'
                  }
                />
                <Text brand direction={direction} language={locale} variant="label">
                  {entry.nickname}
                </Text>
                <Text
                  brand
                  direction={direction}
                  language={locale}
                  style={cloudGrowthStyles.numbers}
                >
                  {text('row', {
                    rank: entry.rank,
                    score: entry.score,
                    leaves: entry.confirmedLeaves,
                  })}
                </Text>
              </View>
            ))}
          </View>
          <Text brand direction={direction} language={locale} testID="cloud-league-canopy">
            {text('canopy', { count: circle.canopyContributions })}
          </Text>
          <Text brand direction={direction} language={locale}>
            {text('green', { count: circle.greenActions })}
          </Text>
          {circle.canopyHistory.length > 0 ? (
            <View style={cloudGrowthStyles.section}>
              <Text brand direction={direction} language={locale} variant="label">
                {text('history')}
              </Text>
              {circle.canopyHistory.map((week) => (
                <Text
                  key={week.week}
                  brand
                  direction={direction}
                  language={locale}
                  variant="caption"
                >
                  {text('historyRow', { week: week.week, count: week.contributions })}
                </Text>
              ))}
            </View>
          ) : null}
          {isParent ? (
            <>
              {circle.isOwner ? (
                <View style={cloudGrowthStyles.rule}>
                  <AccessTextField
                    label={text('ownerId')}
                    accessibilityLabel={text('ownerId')}
                    direction="ltr"
                    language={locale}
                    value={invitedOwnerId}
                    editable={!disabled}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={36}
                    onChangeText={setInvitedOwnerId}
                    testID="cloud-league-invited-owner"
                  />
                  <Text brand direction={direction} language={locale} variant="caption">
                    {text('ownerHint')}
                  </Text>
                  <Button
                    brand
                    direction={direction}
                    language={locale}
                    variant="secondary"
                    disabled={disabled || !providerIdPattern.test(invitedOwnerId.trim())}
                    onPress={() =>
                      void send({
                        type: 'circle.invite',
                        circleId: circle.id,
                        invitedOwnerId: invitedOwnerId.trim(),
                      }).then((saved) => {
                        if (saved) setInvitedOwnerId('');
                      })
                    }
                    testID="cloud-league-invite"
                  >
                    {text('invite')}
                  </Button>
                </View>
              ) : null}
              <CloudGrowthChildPicker
                profiles={children}
                selectedId={childId}
                onSelect={(id) => {
                  setChildId(id);
                  setNickname('');
                  setFeedback(null);
                }}
                disabled={disabled}
                label={text('chooseChild')}
              />
              {selectedChild && !membership ? (
                <View style={cloudGrowthStyles.section}>
                  <AccessTextField
                    label={text('nickname')}
                    accessibilityLabel={text('nickname')}
                    direction="auto"
                    language={locale}
                    value={nickname}
                    editable={!disabled}
                    maxLength={40}
                    onChangeText={setNickname}
                    testID="cloud-league-nickname"
                  />
                  <Button
                    brand
                    direction={direction}
                    language={locale}
                    disabled={disabled || nickname.trim().length < 2}
                    onPress={() =>
                      void send({
                        type: 'circle.join_child',
                        circleId: circle.id,
                        childId: selectedChild.id,
                        nickname: nickname.trim(),
                        avatarId: selectedChild.avatar_id,
                      })
                    }
                    testID="cloud-league-join"
                  >
                    {text('join')}
                  </Button>
                </View>
              ) : null}
              {selectedChild && membership ? (
                <View style={cloudGrowthStyles.section}>
                  <Text brand direction={direction} language={locale} variant="heading">
                    {text('nominate')}
                  </Text>
                  {membership.restWeek ? (
                    <Text brand direction={direction} language={locale}>
                      {text('resting')}
                    </Text>
                  ) : hasSavedLeaves ? (
                    <Text brand direction={direction} language={locale}>
                      {text('nominationsSaved')}
                    </Text>
                  ) : (
                    <>
                      {eligible.length < 5 ? (
                        <Text brand direction={direction} language={locale}>
                          {text('noEligible')}
                        </Text>
                      ) : null}
                      <Text brand direction={direction} language={locale}>
                        {text('selected', { count: selectedAssignments.length })}
                      </Text>
                      {eligible.map((assignment) => (
                        <ChoiceChip
                          key={assignment.id}
                          direction={direction}
                          language={locale}
                          disabled={
                            disabled ||
                            (selectedAssignments.length === 5 &&
                              !selectedAssignments.includes(assignment.id))
                          }
                          selected={selectedAssignments.includes(assignment.id)}
                          label={
                            snapshot.tasks.find((task) => task.id === assignment.task_id)!.title
                          }
                          onPress={() => toggleAssignment(assignment.id)}
                          testID={`cloud-league-leaf-${assignment.id}`}
                        />
                      ))}
                      <Button
                        brand
                        direction={direction}
                        language={locale}
                        disabled={disabled || selectedAssignments.length !== 5}
                        onPress={() =>
                          void send({
                            type: 'league.nominate',
                            circleId: circle.id,
                            childId: selectedChild.id,
                            assignmentIds: selectedAssignments,
                          })
                        }
                        testID="cloud-league-nominate"
                      >
                        {text('saveLeaves')}
                      </Button>
                      <Button
                        brand
                        direction={direction}
                        language={locale}
                        variant="quiet"
                        disabled={disabled}
                        onPress={() =>
                          void send({
                            type: 'league.rest',
                            circleId: circle.id,
                            childId: selectedChild.id,
                          })
                        }
                        testID="cloud-league-rest"
                      >
                        {text('rest')}
                      </Button>
                    </>
                  )}
                </View>
              ) : null}
            </>
          ) : null}
        </>
      )}
      {feedback ? (
        <StatusBanner
          direction={direction}
          language={locale}
          message={text(feedback)}
          tone={feedback === 'failed' ? 'error' : 'success'}
        />
      ) : null}
      <Text
        brand
        direction={direction}
        language={locale}
        color="onSurfaceVariant"
        variant="caption"
      >
        {text('privacy')}
      </Text>
    </View>
  );
}
