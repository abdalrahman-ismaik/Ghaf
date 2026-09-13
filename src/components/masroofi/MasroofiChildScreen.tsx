import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { GhafIcon } from '@/components/access';
import { PrimaryButton, Text } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
import { MASROOFI_PURCHASE_FIXTURES } from '@/features/masroofi/service';
import { localize } from '@/i18n';
import type { MasroofiControls, MasroofiPurchaseFixtureId } from '@/models/masroofi';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { MasroofiCard } from './MasroofiCard';
import {
  MasroofiActivity,
  MasroofiMessage,
  MasroofiSection,
  masroofiErrorKey,
  styles,
  useMasroofiPresentation,
} from './shared';

function ShopGlyph({ kind }: { kind: MasroofiPurchaseFixtureId }) {
  return (
    <View style={shopStyles.glyph}>
      <Svg aria-hidden height={56} viewBox="0 0 56 56" width={56}>
        <G
          fill="none"
          stroke={botanical.colors.forest}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
        >
          {kind === 'stationery' ? (
            <>
              <Rect fill={botanical.colors.paper} height="34" rx="3" width="25" x="11" y="11" />
              <Path d="M17 11v34M22 20h8M22 26h8M22 32h5M10 17h4M10 24h4M10 31h4M10 38h4" />
              <Path d="M41 13h5v25l-2.5 6-2.5-6z" fill={botanical.colors.amber} />
              <Path d="M41 18h5M41 37h5" />
            </>
          ) : (
            <>
              <Path
                d="M17 19h22c5 0 8 5 9 12 1 6 0 10-4 10-3 0-5-4-8-6H20c-3 2-5 6-8 6-4 0-5-4-4-10 1-7 4-12 9-12Z"
                fill={botanical.colors.paper}
              />
              <Path d="M17 25v9M12.5 29.5h9M24 19l2-5h4" />
              <Circle cx="37" cy="26" fill={botanical.colors.amber} r="1.6" />
              <Circle cx="42" cy="31" fill={botanical.colors.amber} r="1.6" />
            </>
          )}
        </G>
      </Svg>
    </View>
  );
}

function PracticePurchase({
  fixtureId,
  transactionCount,
}: {
  fixtureId: MasroofiPurchaseFixtureId;
  transactionCount: number;
}) {
  const { t, direction, amount } = useMasroofiPresentation();
  const purchase = usePrototypeStore((state) => state.purchaseMasroofi);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);
  const fixture = MASROOFI_PURCHASE_FIXTURES[fixtureId];
  return (
    <View style={shopStyles.item} testID={`masroofi-shop-${fixtureId}`}>
      <View style={[shopStyles.itemHeading, { flexDirection: logicalRowDirection(direction) }]}>
        <ShopGlyph kind={fixtureId} />
        <View style={styles.flex}>
          <Text brand direction={direction} variant="control">
            {t(fixtureId === 'stationery' ? 'masroofi.notebook' : 'masroofi.game')}
          </Text>
          <Text brand color="inkMuted" direction={direction} variant="caption">
            {t(fixtureId === 'stationery' ? 'masroofi.notebookBody' : 'masroofi.gameBody')}
          </Text>
        </View>
      </View>
      <PrimaryButton
        brand
        onPress={() => {
          const requestId = `masroofi-ui-purchase-${activeChildId}-${fixtureId}-${transactionCount}`;
          const result = purchase(fixtureId, requestId);
          if (!result.ok) {
            setFeedback({ message: t(masroofiErrorKey(result.error.code)), error: true });
            return;
          }
          const transaction = result.data.transactions.find((item) => item.requestId === requestId);
          setFeedback(
            transaction
              ? {
                  message:
                    transaction.status === 'approved'
                      ? t('masroofi.purchaseApproved')
                      : `${t('masroofi.purchaseDeclined')} ${transaction.declineReason ? t(masroofiErrorKey(transaction.declineReason)) : ''}`,
                  error: transaction.status !== 'approved',
                }
              : { message: t('masroofi.error'), error: true },
          );
        }}
        testID={`masroofi-purchase-${fixtureId}`}
      >
        {t('masroofi.tryPurchase', { amount: amount(fixture.amountFils) })}
      </PrimaryButton>
      {feedback ? (
        <MasroofiMessage {...feedback} testID={`masroofi-purchase-result-${fixtureId}`} />
      ) : null}
    </View>
  );
}

function ChildRules({ controls }: { controls: MasroofiControls }) {
  const { t, direction, amount } = useMasroofiPresentation();
  const rules = [
    { title: t('masroofi.purchaseLimit'), value: amount(controls.perPurchaseLimitFils) },
    { title: t('masroofi.dailyLimit'), value: amount(controls.dailyLimitFils) },
    {
      title: t('masroofi.stationery'),
      value: t(
        controls.allowedCategories.includes('stationery') ? 'masroofi.allowed' : 'masroofi.blocked',
      ),
    },
    {
      title: t('masroofi.games'),
      value: t(
        controls.allowedCategories.includes('games') ? 'masroofi.allowed' : 'masroofi.blocked',
      ),
    },
    {
      title: t('masroofi.online'),
      value: t(controls.onlineAllowed ? 'masroofi.allowed' : 'masroofi.blocked'),
    },
  ];
  return (
    <MasroofiSection title={t('masroofi.childRules')}>
      {rules.map((rule) => (
        <View
          key={rule.title}
          style={[shopStyles.rule, { flexDirection: logicalRowDirection(direction) }]}
        >
          <Text brand color="inkMuted" direction={direction} style={styles.flex} variant="label">
            {rule.title}
          </Text>
          <Text brand direction={direction} style={shopStyles.ruleValue} tabular variant="label">
            {rule.value}
          </Text>
        </View>
      ))}
      <Text brand color="inkMuted" direction={direction} variant="caption">
        {t('masroofi.rulesNote')}
      </Text>
    </MasroofiSection>
  );
}

export function MasroofiChildScreen() {
  const router = useRouter();
  const { t, direction, locale, amount } = useMasroofiPresentation();
  const masroofi = usePrototypeStore((state) => state.masroofi);
  const getView = usePrototypeStore((state) => state.getMasroofiChild);
  const family = usePrototypeStore((state) => state.localFamily);
  const children = usePrototypeStore((state) => state.children);
  void masroofi;
  const view = getView();
  const card = view.ok ? view.data.card : null;
  const latestTransaction = view.ok
    ? view.data.transactions[view.data.transactions.length - 1]
    : null;
  const name = card
    ? (family.record?.children.find((profile) => profile.id === card.childId)?.nickname ??
      localize(children[card.childId].displayName, locale))
    : '';
  return (
    <R002aScreen
      header={
        <R002aFlowHeader
          backLabel={t('masroofi.back')}
          direction={direction}
          onBack={() => router.replace('/child')}
          title={t('masroofi.title')}
        />
      }
      testID="masroofi-child-screen"
    >
      {view.ok && card ? (
        <>
          <View style={styles.group}>
            <MasroofiCard direction={direction} holderName={name} locale={locale} />
            <View style={[styles.status, { flexDirection: logicalRowDirection(direction) }]}>
              <GhafIcon
                color={botanical.colors.forest}
                name={card.controls.frozen ? 'lock' : 'check'}
                size={18}
              />
              <Text brand direction={direction} variant="label">
                {t(card.controls.frozen ? 'masroofi.frozen' : 'masroofi.active')}
              </Text>
            </View>
            <Text align="center" brand color="inkMuted" direction={direction} variant="caption">
              {t('masroofi.demoNotice')}
            </Text>
          </View>
          <View style={styles.balance}>
            <Text align="center" brand color="inkMuted" direction={direction} variant="label">
              {t('masroofi.balance')}
            </Text>
            <Text
              align="center"
              brand
              direction={direction}
              tabular
              testID="masroofi-child-balance"
              variant="hero"
            >
              {amount(card.balanceFils)}
            </Text>
          </View>
          {latestTransaction?.kind === 'reward' ? (
            <MasroofiMessage
              message={t('masroofi.earnedNotice', { amount: amount(latestTransaction.amountFils) })}
              testID="masroofi-earned-reveal"
            />
          ) : null}
          <Text brand color="inkMuted" direction={direction}>
            {t('masroofi.childBody')}
          </Text>
          {card.controls.frozen ? <MasroofiMessage message={t('masroofi.errorFrozen')} /> : null}
          <MasroofiSection body={t('masroofi.shopBody')} title={t('masroofi.shopTitle')}>
            <PracticePurchase
              fixtureId="stationery"
              key={`${card.childId}:stationery`}
              transactionCount={view.data.transactions.length}
            />
            <PracticePurchase
              fixtureId="game_online"
              key={`${card.childId}:game_online`}
              transactionCount={view.data.transactions.length}
            />
          </MasroofiSection>
          <ChildRules controls={card.controls} />
          <MasroofiActivity transactions={view.data.transactions} />
        </>
      ) : (
        <MasroofiMessage
          error={!view.ok}
          message={t(view.ok ? 'masroofi.waitingParent' : 'masroofi.noAccess')}
        />
      )}
    </R002aScreen>
  );
}

const shopStyles = StyleSheet.create({
  item: {
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: botanical.colors.line,
  },
  itemHeading: { alignItems: 'center', gap: spacing.md },
  glyph: {
    backgroundColor: botanical.colors.sage,
    borderRadius: botanical.radius.control,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rule: { alignItems: 'flex-start', gap: spacing.md, justifyContent: 'space-between' },
  ruleValue: { flexShrink: 1, maxWidth: '45%' },
});
