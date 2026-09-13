import type { PropsWithChildren } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafIcon } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { botanical, colors, logicalRowDirection, spacing } from '@/design/tokens';
import type { MasroofiErrorCode, MasroofiTransaction } from '@/models/masroofi';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export function useMasroofiPresentation() {
  const { t } = useTranslation();
  // Recompute private projections immediately when profile or access authority changes.
  usePrototypeStore(
    (state) =>
      `${state.activeExperience}:${state.role}:${state.activeChildId}:${state.demoResetFailed}`,
  );
  usePrototypeStore((state) => state.parentOnboarding);
  usePrototypeStore((state) => state.childAccess);
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const amount = (fils: number) =>
    t('masroofi.amount', {
      amount: new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
        minimumFractionDigits: fils % 100 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(fils / 100),
    });
  return { t, locale, direction, amount };
}

const errorKeys: Partial<Record<MasroofiErrorCode, string>> = {
  age_ineligible: 'errorAge',
  card_disabled: 'waitingParent',
  card_frozen: 'errorFrozen',
  category_blocked: 'errorCategory',
  online_blocked: 'errorOnline',
  per_purchase_limit: 'errorPurchaseLimit',
  daily_limit: 'errorDailyLimit',
  insufficient_balance: 'errorBalance',
  invalid_amount: 'errorAmount',
  task_ineligible: 'errorTask',
  task_not_available: 'errorTask',
  promise_locked: 'errorTask',
  parent_required: 'noAccess',
  child_required: 'noAccess',
  profile_mismatch: 'noAccess',
  feature_disabled: 'noAccess',
  profile_unavailable: 'noAccess',
  access_denied: 'noAccess',
};

export function masroofiErrorKey(code: MasroofiErrorCode) {
  return `masroofi.${errorKeys[code] ?? 'error'}`;
}

export function MasroofiSection({
  title,
  body,
  children,
}: PropsWithChildren<{ title: string; body?: string }>) {
  const { direction } = useMasroofiPresentation();
  return (
    <View style={styles.section}>
      <Text brand direction={direction} variant="heading">
        {title}
      </Text>
      {body ? (
        <Text brand color="inkMuted" direction={direction}>
          {body}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function MasroofiMessage({
  message,
  error = false,
  testID,
}: {
  message: string;
  error?: boolean;
  testID?: string;
}) {
  const { direction } = useMasroofiPresentation();
  return (
    <View
      style={[
        styles.message,
        error ? styles.errorMessage : null,
        { flexDirection: logicalRowDirection(direction) },
      ]}
      testID={testID}
    >
      <GhafIcon
        color={error ? colors.danger : botanical.colors.forest}
        name={error ? 'info' : 'check'}
        size={22}
      />
      <Text
        accessibilityLiveRegion="polite"
        brand
        color={error ? 'danger' : 'ink'}
        direction={direction}
        style={styles.flex}
        variant="label"
      >
        {message}
      </Text>
    </View>
  );
}

export function MasroofiToggle({
  label,
  value,
  onChange,
  helper,
  disabled,
  testID,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  helper?: string;
  disabled?: boolean;
  testID?: string;
}) {
  const { direction } = useMasroofiPresentation();
  return (
    <View style={[styles.toggleRow, { flexDirection: logicalRowDirection(direction) }]}>
      <View style={styles.flex}>
        <Text brand direction={direction} variant="control">
          {label}
        </Text>
        {helper ? (
          <Text brand color="inkMuted" direction={direction} variant="caption">
            {helper}
          </Text>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={label}
        disabled={disabled}
        onValueChange={onChange}
        testID={testID}
        thumbColor={botanical.colors.paper}
        trackColor={{ false: botanical.colors.muted, true: botanical.colors.forest }}
        value={value}
      />
    </View>
  );
}

export function AmountChoices({
  label,
  values,
  value,
  onChange,
  testID,
}: {
  label: string;
  values: readonly number[];
  value: number;
  onChange: (value: number) => void;
  testID: string;
}) {
  const { direction, amount } = useMasroofiPresentation();
  return (
    <View style={styles.group}>
      <Text brand direction={direction} variant="control">
        {label}
      </Text>
      <View style={[styles.choices, { flexDirection: logicalRowDirection(direction) }]}>
        {values.map((item) => (
          <Button
            accessibilityState={{ selected: item === value }}
            brand
            fullWidth={false}
            key={item}
            onPress={() => onChange(item)}
            style={styles.amountChoice}
            testID={`${testID}-${item}`}
            variant={item === value ? 'primary' : 'secondary'}
          >
            {amount(item)}
          </Button>
        ))}
      </View>
    </View>
  );
}

export function MasroofiActivity({
  transactions,
}: {
  transactions: readonly MasroofiTransaction[];
}) {
  const { t, direction, amount } = useMasroofiPresentation();
  return (
    <MasroofiSection title={t('masroofi.historyTitle')}>
      {transactions.length === 0 ? (
        <Text brand color="inkMuted" direction={direction}>
          {t('masroofi.historyEmpty')}
        </Text>
      ) : null}
      {[...transactions].reverse().map((transaction) => {
        const declined = transaction.status === 'declined';
        const incoming = transaction.kind !== 'purchase';
        const titleKey =
          transaction.kind === 'reward'
            ? 'transactionReward'
            : transaction.kind === 'top_up'
              ? 'transactionTopup'
              : declined
                ? 'transactionDeclined'
                : 'transactionPurchase';
        return (
          <View
            key={transaction.id}
            style={styles.activity}
            testID={`masroofi-transaction-${transaction.id}`}
          >
            <View style={[styles.activityMain, { flexDirection: logicalRowDirection(direction) }]}>
              <GhafIcon
                color={declined ? botanical.colors.muted : botanical.colors.forest}
                name={incoming ? 'plus' : declined ? 'info' : 'check'}
                size={22}
              />
              <View style={styles.flex}>
                <Text brand direction={direction} variant="control">
                  {t(`masroofi.${titleKey}`)}
                </Text>
                {transaction.fixtureId ? (
                  <Text brand color="inkMuted" direction={direction} variant="caption">
                    {t(
                      transaction.fixtureId === 'stationery'
                        ? 'masroofi.notebook'
                        : 'masroofi.game',
                    )}
                  </Text>
                ) : null}
              </View>
              <Text
                brand
                color={declined ? 'inkMuted' : 'forest'}
                direction={direction}
                style={styles.activityAmount}
                tabular
                variant="label"
              >
                {declined ? amount(0) : `${incoming ? '+' : '−'} ${amount(transaction.amountFils)}`}
              </Text>
            </View>
            {declined && transaction.declineReason ? (
              <Text brand color="inkMuted" direction={direction} variant="caption">
                {t(masroofiErrorKey(transaction.declineReason))}
              </Text>
            ) : null}
          </View>
        );
      })}
      <Text brand color="inkMuted" direction={direction} variant="caption">
        {t('masroofi.historyPrivate')}
      </Text>
    </MasroofiSection>
  );
}

export const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  section: { gap: spacing.md },
  flex: { flex: 1, minWidth: 0, gap: spacing.xxs },
  hero: { gap: spacing.xs },
  message: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: botanical.radius.control,
    backgroundColor: botanical.colors.sage,
  },
  errorMessage: { backgroundColor: colors.dangerLight },
  toggleRow: {
    minHeight: spacing.huge,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  choices: { gap: spacing.xs, flexWrap: 'wrap', alignItems: 'stretch' },
  amountChoice: { flexGrow: 1, minWidth: 80 },
  balance: { gap: spacing.xxs, alignItems: 'center', paddingVertical: spacing.xs },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: botanical.colors.line },
  status: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  activity: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: botanical.colors.line,
  },
  activityMain: { alignItems: 'center', gap: spacing.sm },
  activityAmount: { flexShrink: 1, maxWidth: '42%' },
  taskOption: { flexDirection: 'column', alignItems: 'stretch' },
});
