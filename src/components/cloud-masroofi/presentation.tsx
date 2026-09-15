import { View } from 'react-native';

import { MASROOFI_PURCHASE_REFERENCES } from '@/features/cloud-masroofi/reference';
import type { CloudFamilyTask } from '@/models/cloudFamily';
import type {
  CloudMasroofiCard,
  CloudMasroofiErrorCode,
  CloudMasroofiPromise,
  CloudMasroofiTransaction,
} from '@/models/cloudMasroofi';
import {
  MASROOFI_CATEGORIES,
  type MasroofiDeclineReason,
  type MasroofiPurchaseFixtureId,
} from '@/models/masroofi';

import {
  MasroofiButton,
  MasroofiRow,
  MasroofiText,
  masroofiStyles as s,
  useMasroofiCopy,
} from './common';

export function masroofiErrorCopy(code: CloudMasroofiErrorCode): string {
  switch (code) {
    case 'schema_unavailable':
      return 'schemaUnavailable';
    case 'invalid_response':
      return 'invalidResponse';
    case 'access_unavailable':
    case 'family_unavailable':
      return 'accessUnavailable';
    case 'reauth_required':
      return 'reauthError';
    case 'request_conflict':
      return 'conflict';
    case 'age_ineligible':
      return 'errorAge';
    case 'task_ineligible':
    case 'invalid_transition':
      return 'errorTask';
    case 'promise_locked':
      return 'immutableTask';
    case 'balance_limit':
      return 'balanceLimit';
    case 'invalid_command':
      return 'error';
    default:
      return 'unavailable';
  }
}

const declineCopy: Readonly<Record<MasroofiDeclineReason, string>> = {
  card_disabled: 'waitingParent',
  card_frozen: 'errorFrozen',
  category_blocked: 'errorCategory',
  online_blocked: 'errorOnline',
  per_purchase_limit: 'errorPurchaseLimit',
  daily_limit: 'errorDailyLimit',
  insufficient_balance: 'errorBalance',
};

export function MasroofiCardSummary({ card }: { readonly card: CloudMasroofiCard }) {
  const { text, money } = useMasroofiCopy();
  return (
    <View style={s.stack} testID="hosted-masroofi-balance">
      <MasroofiRow>
        <MasroofiText variant="control">{text('balance')}</MasroofiText>
        <MasroofiText variant="heading" style={s.amount}>
          {money(card.balanceFils)}
        </MasroofiText>
      </MasroofiRow>
      <MasroofiText>{text(card.controls.frozen ? 'frozen' : 'active')}</MasroofiText>
    </View>
  );
}

export function MasroofiRulesSummary({ card }: { readonly card: CloudMasroofiCard }) {
  const { text, money } = useMasroofiCopy();
  return (
    <View style={s.section} testID="hosted-masroofi-rules-summary">
      <MasroofiText variant="heading" accessibilityRole="header">
        {text('rules')}
      </MasroofiText>
      <MasroofiRow>
        <MasroofiText>{text('purchaseLimit')}</MasroofiText>
        <MasroofiText style={s.amount}>{money(card.controls.perPurchaseLimitFils)}</MasroofiText>
      </MasroofiRow>
      <MasroofiRow>
        <MasroofiText>{text('dailyLimit')}</MasroofiText>
        <MasroofiText style={s.amount}>{money(card.controls.dailyLimitFils)}</MasroofiText>
      </MasroofiRow>
      <MasroofiText>
        {text('online')} · {text(card.controls.onlineAllowed ? 'allowed' : 'blocked')}
      </MasroofiText>
      <MasroofiText variant="control">{text('categories')}</MasroofiText>
      <MasroofiText>
        {card.controls.allowedCategories.length
          ? MASROOFI_CATEGORIES.filter((category) =>
              card.controls.allowedCategories.includes(category),
            )
              .map((category) => text(category))
              .join(' · ')
          : text('noCategories')}
      </MasroofiText>
    </View>
  );
}

export function MasroofiPromises({
  promises,
  tasks,
  childId,
  parent,
}: {
  readonly promises: readonly CloudMasroofiPromise[];
  readonly tasks: readonly CloudFamilyTask[];
  readonly childId: string;
  readonly parent: boolean;
}) {
  const { text, money, locale } = useMasroofiCopy();
  const records = promises.filter((promise) => promise.childId === childId);
  return (
    <View style={s.section} testID="hosted-masroofi-promises">
      <MasroofiText variant="heading" accessibilityRole="header">
        {text('promisesTitle')}
      </MasroofiText>
      {records.length === 0 ? (
        <MasroofiText>{text('emptyPromises')}</MasroofiText>
      ) : (
        records.map((promise) => {
          const task = tasks.find((item) => item.id === promise.taskId && item.childId === childId);
          const showAmount =
            (parent || promise.status === 'credited') && promise.amountFils !== undefined;
          return (
            <View key={promise.id} style={s.section}>
              <MasroofiText variant="control">
                {task?.template.title[locale] ?? text('taskFallback')}
              </MasroofiText>
              {showAmount ? (
                <MasroofiText style={s.amount}>{money(promise.amountFils!)}</MasroofiText>
              ) : null}
              <MasroofiText>
                {text(
                  promise.status === 'credited'
                    ? 'rewardCredited'
                    : parent
                      ? 'rewardWaiting'
                      : 'rewardNotice',
                )}
              </MasroofiText>
            </View>
          );
        })
      )}
    </View>
  );
}

export function MasroofiPurchaseShop({
  card,
  busy,
  onPurchase,
}: {
  readonly card: CloudMasroofiCard;
  readonly busy: boolean;
  readonly onPurchase: (fixtureId: MasroofiPurchaseFixtureId) => void;
}) {
  const { text, money } = useMasroofiCopy();
  return (
    <View style={s.section} testID="hosted-masroofi-shop">
      <MasroofiText variant="heading" accessibilityRole="header">
        {text('shopTitle')}
      </MasroofiText>
      <MasroofiText>{text('shopBody')}</MasroofiText>
      {Object.values(MASROOFI_PURCHASE_REFERENCES).map((item) => (
        <View key={item.id} style={s.section}>
          <MasroofiText variant="control">{text(`item_${item.id}`)}</MasroofiText>
          <MasroofiText variant="caption">
            {text('purchaseDetail', {
              category: text(item.category),
              channel: text(item.online ? 'channelOnline' : 'channelInStore'),
            })}
          </MasroofiText>
          <MasroofiText variant="caption">
            {text(card.controls.allowedCategories.includes(item.category) ? 'allowed' : 'blocked')}
          </MasroofiText>
          <MasroofiButton disabled={busy} onPress={() => onPurchase(item.id)}>
            {text('tryPurchase', { amount: money(item.amountFils) })}
          </MasroofiButton>
        </View>
      ))}
    </View>
  );
}

export function MasroofiHistory({
  transactions,
  childId,
}: {
  readonly transactions: readonly CloudMasroofiTransaction[];
  readonly childId: string;
}) {
  const { text, money, date } = useMasroofiCopy();
  const records = transactions
    .filter((transaction) => transaction.childId === childId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  return (
    <View style={s.section} testID="hosted-masroofi-history">
      <MasroofiText variant="heading" accessibilityRole="header">
        {text('historyTitle')}
      </MasroofiText>
      <MasroofiText variant="caption">{text('historyPrivate')}</MasroofiText>
      {records.length === 0 ? (
        <MasroofiText>{text('historyEmpty')}</MasroofiText>
      ) : (
        records.map((transaction) => (
          <View key={transaction.id} style={s.section}>
            <MasroofiRow>
              <MasroofiText variant="control" style={s.grow}>
                {text(
                  transaction.kind === 'reward'
                    ? 'transactionReward'
                    : transaction.kind === 'top_up'
                      ? 'transactionTopup'
                      : transaction.fixtureId
                        ? `item_${transaction.fixtureId}`
                        : 'transactionPurchase',
                )}
              </MasroofiText>
              <MasroofiText style={s.amount}>{money(transaction.amountFils)}</MasroofiText>
            </MasroofiRow>
            <MasroofiText>{text(transaction.status)}</MasroofiText>
            {transaction.declineReason ? (
              <MasroofiText>{text(declineCopy[transaction.declineReason])}</MasroofiText>
            ) : null}
            <MasroofiText variant="caption">{date(transaction.createdAt)}</MasroofiText>
            <MasroofiText variant="caption">
              {text('transactionBalance', { amount: money(transaction.balanceAfterFils) })}
            </MasroofiText>
          </View>
        ))
      )}
    </View>
  );
}
