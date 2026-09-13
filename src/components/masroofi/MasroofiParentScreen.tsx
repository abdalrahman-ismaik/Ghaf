import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { entryMode } from '@/config/demoEntry';
import { Button, PrimaryButton, SecondaryButton, Text } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { botanical, logicalRowDirection } from '@/design/tokens';
import { selectAssignedTasks } from '@/features/tasks/assignmentInstances';
import { localize } from '@/i18n';
import type { SyntheticChildId, TaskJourney } from '@/models/familyGrowth';
import type { MasroofiControls, MasroofiParentView, MasroofiResult } from '@/models/masroofi';
import { serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { MasroofiCard } from './MasroofiCard';
import {
  AmountChoices,
  MasroofiActivity,
  MasroofiMessage,
  MasroofiSection,
  MasroofiToggle,
  masroofiErrorKey,
  styles,
  useMasroofiPresentation,
} from './shared';

type Feedback = { readonly message: string; readonly error: boolean } | null;

function ParentControls({
  childId,
  initial,
}: {
  childId: SyntheticChildId;
  initial: MasroofiControls;
}) {
  const { t } = useMasroofiPresentation();
  const [controls, setControls] = useState(initial);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const save = usePrototypeStore((state) => state.setMasroofiControls);
  const category = (name: 'stationery' | 'games', allowed: boolean) =>
    setControls((current) => ({
      ...current,
      allowedCategories: allowed
        ? [...current.allowedCategories.filter((item) => item !== name), name]
        : current.allowedCategories.filter((item) => item !== name),
    }));
  return (
    <MasroofiSection body={t('masroofi.controlsBody')} title={t('masroofi.controlsTitle')}>
      <AmountChoices
        label={t('masroofi.purchaseLimit')}
        onChange={(value) =>
          setControls((current) => ({ ...current, perPurchaseLimitFils: value }))
        }
        testID="masroofi-purchase-limit"
        value={controls.perPurchaseLimitFils}
        values={[500, 1000, 2000, 5000]}
      />
      <AmountChoices
        label={t('masroofi.dailyLimit')}
        onChange={(value) => setControls((current) => ({ ...current, dailyLimitFils: value }))}
        testID="masroofi-daily-limit"
        value={controls.dailyLimitFils}
        values={[1000, 2000, 5000, 10000]}
      />
      <View style={styles.group}>
        <MasroofiToggle
          label={t('masroofi.stationery')}
          onChange={(value) => category('stationery', value)}
          testID="masroofi-category-stationery"
          value={controls.allowedCategories.includes('stationery')}
        />
        <MasroofiToggle
          label={t('masroofi.games')}
          onChange={(value) => category('games', value)}
          testID="masroofi-category-games"
          value={controls.allowedCategories.includes('games')}
        />
        <MasroofiToggle
          label={t('masroofi.online')}
          onChange={(value) => setControls((current) => ({ ...current, onlineAllowed: value }))}
          testID="masroofi-online"
          value={controls.onlineAllowed}
        />
        <MasroofiToggle
          helper={t('masroofi.freezeHelp')}
          label={t('masroofi.freeze')}
          onChange={(value) => setControls((current) => ({ ...current, frozen: value }))}
          testID="masroofi-freeze"
          value={controls.frozen}
        />
      </View>
      <PrimaryButton
        brand
        onPress={() => {
          const result = save(childId, controls);
          setFeedback({
            message: t(result.ok ? 'masroofi.controlsSaved' : masroofiErrorKey(result.error.code)),
            error: !result.ok,
          });
        }}
        testID="masroofi-save-controls"
      >
        {t('masroofi.saveControls')}
      </PrimaryButton>
      {feedback ? <MasroofiMessage {...feedback} /> : null}
    </MasroofiSection>
  );
}

function ParentFunds({
  childId,
  transactionCount,
}: {
  childId: SyntheticChildId;
  transactionCount: number;
}) {
  const { t, direction, amount } = useMasroofiPresentation();
  const topUp = usePrototypeStore((state) => state.topUpMasroofi);
  const [feedback, setFeedback] = useState<Feedback>(null);
  return (
    <MasroofiSection body={t('masroofi.fundsBody')} title={t('masroofi.fundsTitle')}>
      <SecondaryButton
        brand
        onPress={() => {
          const result = topUp(childId, 2000, `masroofi-ui-topup-${childId}-${transactionCount}`);
          setFeedback({
            message: t(result.ok ? 'masroofi.fundsAdded' : masroofiErrorKey(result.error.code)),
            error: !result.ok,
          });
        }}
        testID="masroofi-top-up"
      >
        {t('masroofi.addFunds', { amount: amount(2000) })}
      </SecondaryButton>
      {feedback ? <MasroofiMessage {...feedback} /> : null}
      <Text brand color="inkMuted" direction={direction} variant="caption">
        {t('masroofi.demoNotice')}
      </Text>
    </MasroofiSection>
  );
}

function ParentTaskRewards({
  childId,
  view,
}: {
  childId: SyntheticChildId;
  view: MasroofiParentView;
}) {
  const router = useRouter();
  const { t, direction, locale, amount } = useMasroofiPresentation();
  const collection = usePrototypeStore((state) => state.taskAssignments);
  const currentJourney = usePrototypeStore((state) => state.journey);
  const promise = usePrototypeStore((state) => state.promiseMasroofi);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [rewardFils, setRewardFils] = useState(500);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const journeys: TaskJourney[] = selectAssignedTasks(collection, childId).map(
    (entry) => entry.journey,
  );
  if (
    currentJourney?.assignment?.childId === childId &&
    !journeys.some((item) => item.assignment?.id === currentJourney.assignment?.id)
  )
    journeys.push(currentJourney);
  const candidates = journeys.filter(
    (journey) =>
      serviceRegistry.masroofi.eligibleJourney(journey) &&
      !view.promises.some(
        (item) =>
          item.assignmentId === journey.assignment?.id && item.taskVersion === journey.task.version,
      ),
  );
  const selected =
    candidates.find((item) => item.assignment?.id === selectedAssignment) ?? candidates[0];
  return (
    <>
      <MasroofiSection body={t('masroofi.rewardBody')} title={t('masroofi.rewardTitle')}>
        {candidates.map((journey) => (
          <Button
            accessibilityState={{ selected: selected?.assignment?.id === journey.assignment?.id }}
            brand
            key={journey.assignment?.id}
            onPress={() => setSelectedAssignment(journey.assignment?.id ?? null)}
            style={styles.taskOption}
            testID={`masroofi-task-${journey.assignment?.id}`}
            variant={selected?.assignment?.id === journey.assignment?.id ? 'primary' : 'secondary'}
          >
            {localize(journey.task.content.title, locale)}
          </Button>
        ))}
        {candidates.length === 0 ? (
          <>
            <Text brand color="inkMuted" direction={direction}>
              {t('masroofi.noTasks')}
            </Text>
            <SecondaryButton
              brand
              onPress={() => {
                const result = usePrototypeStore.getState().setActiveChild(childId);
                if (!result.ok) {
                  setFeedback({ message: t('masroofi.noAccess'), error: true });
                  return;
                }
                router.replace({ pathname: '/parent', params: { section: 'tasks' } });
              }}
            >
              {t('masroofi.openTasks')}
            </SecondaryButton>
          </>
        ) : (
          <>
            <AmountChoices
              label={t('masroofi.rewardAmount')}
              onChange={setRewardFils}
              testID="masroofi-reward-amount"
              value={rewardFils}
              values={[200, 500, 1000, 2000]}
            />
            <Text brand color="inkMuted" direction={direction} variant="caption">
              {t('masroofi.immutable')}
            </Text>
            <PrimaryButton
              brand
              onPress={() => {
                if (!selected?.assignment) return;
                const result = promise(selected.assignment.id, rewardFils);
                setFeedback({
                  message: t(
                    result.ok ? 'masroofi.rewardLocked' : masroofiErrorKey(result.error.code),
                  ),
                  error: !result.ok,
                });
              }}
              testID="masroofi-lock-reward"
            >
              {t('masroofi.lockReward')}
            </PrimaryButton>
          </>
        )}
        {feedback ? <MasroofiMessage {...feedback} /> : null}
      </MasroofiSection>
      {view.promises.length > 0 ? (
        <MasroofiSection title={t('masroofi.promisesTitle')}>
          {view.promises.map((reward) => {
            const journey = journeys.find(
              (item) =>
                item.assignment?.id === reward.assignmentId &&
                item.task.version === reward.taskVersion,
            );
            return (
              <View key={reward.id} style={styles.activity}>
                <Text brand direction={direction} variant="control">
                  {journey
                    ? localize(journey.task.content.title, locale)
                    : t('masroofi.transactionReward')}
                </Text>
                <Text brand color="forest" direction={direction} tabular variant="heading">
                  {amount(reward.amountFils)}
                </Text>
                <Text brand color="inkMuted" direction={direction} variant="caption">
                  {t(
                    reward.status === 'credited'
                      ? 'masroofi.rewardCredited'
                      : 'masroofi.rewardWaiting',
                  )}
                </Text>
              </View>
            );
          })}
        </MasroofiSection>
      ) : null}
    </>
  );
}

function ParentCardContent({
  childId,
  view,
  holderName,
  underAge,
}: {
  childId: SyntheticChildId;
  view: MasroofiParentView;
  holderName: string;
  underAge: boolean;
}) {
  const { t, direction, locale, amount } = useMasroofiPresentation();
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const enable = usePrototypeStore((state) => state.enableMasroofi);
  const card = view.card;
  return (
    <>
      <View style={styles.group}>
        <MasroofiCard direction={direction} holderName={holderName} locale={locale} />
        <View style={[styles.status, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon
            color={botanical.colors.forest}
            name={card?.controls.frozen ? 'lock' : card ? 'check' : 'info'}
            size={18}
          />
          <Text brand direction={direction} variant="label">
            {t(
              card?.controls.frozen
                ? 'masroofi.frozen'
                : card
                  ? 'masroofi.active'
                  : 'masroofi.notEnabled',
            )}
          </Text>
        </View>
        <Text align="center" brand color="inkMuted" direction={direction} variant="caption">
          {t('masroofi.demoNotice')}
        </Text>
      </View>
      {card ? (
        <>
          <View style={styles.balance}>
            <Text align="center" brand color="inkMuted" direction={direction} variant="label">
              {t('masroofi.balance')}
            </Text>
            <Text
              align="center"
              brand
              direction={direction}
              tabular
              testID="masroofi-parent-balance"
              variant="hero"
            >
              {amount(card.balanceFils)}
            </Text>
          </View>
          <ParentTaskRewards childId={childId} view={view} />
          <View style={styles.divider} />
          <ParentControls childId={childId} initial={card.controls} />
          <View style={styles.divider} />
          <ParentFunds childId={childId} transactionCount={view.transactions.length} />
          <MasroofiActivity transactions={view.transactions} />
        </>
      ) : (
        <MasroofiSection body={t('masroofi.enableBody')} title={t('masroofi.enableTitle')}>
          {underAge ? (
            <MasroofiMessage error message={t('masroofi.underAge')} />
          ) : (
            <>
              <MasroofiToggle
                label={t('masroofi.ageConfirm')}
                onChange={setConfirmedAge}
                testID="masroofi-confirm-age"
                value={confirmedAge}
              />
              <PrimaryButton
                brand
                disabled={!confirmedAge}
                onPress={() => {
                  const result = enable(childId, confirmedAge);
                  setFeedback({
                    message: t(
                      result.ok ? 'masroofi.enabled' : masroofiErrorKey(result.error.code),
                    ),
                    error: !result.ok,
                  });
                }}
                testID="masroofi-enable"
              >
                {t('masroofi.enable')}
              </PrimaryButton>
            </>
          )}
          {feedback ? <MasroofiMessage {...feedback} /> : null}
        </MasroofiSection>
      )}
    </>
  );
}

export function MasroofiParentScreen() {
  const router = useRouter();
  const { t, direction, locale } = useMasroofiPresentation();
  const initialChildId = usePrototypeStore((state) => state.activeChildId);
  const family = usePrototypeStore((state) => state.localFamily);
  const children = usePrototypeStore((state) => state.children);
  const masroofi = usePrototypeStore((state) => state.masroofi);
  const getView = usePrototypeStore((state) => state.getMasroofiParent);
  const [selectedChildId, setSelectedChildId] = useState(initialChildId);
  void masroofi;
  const childIds = family.configuredChildIds;
  const childId = childIds.includes(selectedChildId) ? selectedChildId : childIds[0];
  const profile = family.record?.children.find((item) => item.id === childId);
  const view: MasroofiResult<MasroofiParentView> | null = childId ? getView(childId) : null;
  const name = childId
    ? (profile?.nickname ?? localize(children[childId].displayName, locale))
    : '';
  return (
    <R002aScreen
      header={
        <R002aFlowHeader
          backLabel={t('masroofi.back')}
          direction={direction}
          onBack={() => router.replace('/parent/family')}
          title={t('masroofi.title')}
        />
      }
      testID="masroofi-parent-screen"
    >
      <View style={styles.hero}>
        <Text brand direction={direction} variant="screenTitle">
          {t('masroofi.parentTitle')}
        </Text>
        <Text brand color="inkMuted" direction={direction}>
          {t('masroofi.parentBody')}
        </Text>
      </View>
      <View style={styles.group}>
        <Text brand direction={direction} variant="label">
          {t('masroofi.selectChild')}
        </Text>
        <View style={[styles.choices, { flexDirection: logicalRowDirection(direction) }]}>
          {childIds.map((id) => (
            <Button
              accessibilityState={{ selected: childId === id }}
              brand
              fullWidth={false}
              key={id}
              onPress={() => setSelectedChildId(id)}
              style={styles.amountChoice}
              testID={`masroofi-select-${id}`}
              variant={childId === id ? 'primary' : 'secondary'}
            >
              {family.record?.children.find((item) => item.id === id)?.nickname ??
                localize(children[id].displayName, locale)}
            </Button>
          ))}
        </View>
      </View>
      {view?.ok && childId ? (
        <ParentCardContent
          childId={childId}
          holderName={name}
          key={childId}
          underAge={
            profile?.ageBand === '6_8' || (entryMode === 'demo' && children[childId].age < 10)
          }
          view={view.data}
        />
      ) : (
        <MasroofiMessage error message={t('masroofi.noAccess')} />
      )}
    </R002aScreen>
  );
}
