import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { GhafIcon } from '@/components/access';
import { Button, PrimaryButton, Text } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
import { MASROOFI_PURCHASE_FIXTURES } from '@/features/masroofi/service';
import { localize } from '@/i18n';
import {
  MASROOFI_CATEGORIES,
  type MasroofiCategory,
  type MasroofiControls,
  type MasroofiErrorCode,
  type MasroofiPurchaseFixtureId,
} from '@/models/masroofi';
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

function ShopGlyph({ kind }: { kind: MasroofiCategory }) {
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
          ) : kind === 'books' ? (
            <>
              <Path
                d="M28 15c-5-4-13-5-20-2v30c7-3 15-2 20 2 5-4 13-5 20-2V13c-7-3-15-2-20 2Z"
                fill={botanical.colors.paper}
              />
              <Path d="M28 15v30M14 20l8 2m-8 5 8 2m12-7 8-2m-8 9 8-2" />
            </>
          ) : kind === 'sports' ? (
            <>
              <Circle cx="28" cy="28" r="20" fill={botanical.colors.paper} />
              <Path d="m28 19 9 7-4 11H23l-4-11 9-7ZM28 8v11m-9 7-10-4m14 15-5 9m15-9 5 9m-1-20 10-4" />
            </>
          ) : kind === 'arts' ? (
            <>
              <Path d="M11 12h34v32H11z" fill={botanical.colors.paper} />
              <Circle cx="20" cy="22" r="4" fill={botanical.colors.amber} />
              <Path d="m14 38 10-9 7 6 7-12 4 15M30 47l14-29 4 2-14 29-5 3 1-5Z" />
            </>
          ) : kind === 'outings' ? (
            <>
              <Path
                d="M9 15h38v9a4 4 0 0 0 0 8v9H9v-9a4 4 0 0 0 0-8v-9Z"
                fill={botanical.colors.paper}
              />
              <Path d="M33 15v5m0 4v5m0 4v8M17 26l6-5 6 5H17Zm2 2v7m8-7v7m-11 2h14" />
            </>
          ) : kind === 'snacks' ? (
            <>
              <Path d="m14 24 4 23h20l4-23H14Z" fill={botanical.colors.paper} />
              <Path d="M11 24h34M17 18a6 6 0 0 1 11 0m0 0a6 6 0 0 1 11 0M28 19V9m0 4c4-6 9-5 10-4-1 4-6 6-10 4" />
              <Circle cx="25" cy="34" r="2" fill={botanical.colors.amber} />
              <Circle cx="32" cy="39" r="2" fill={botanical.colors.amber} />
            </>
          ) : kind === 'gifts' ? (
            <>
              <Path d="M11 25h34v22H11zM8 19h40v8H8z" fill={botanical.colors.paper} />
              <Path d="M24 19h8v28h-8z" fill={botanical.colors.amber} />
              <Path d="M28 19C9 20 13 7 20 9c4 1 6 6 8 10Zm0 0C47 20 43 7 36 9c-4 1-6 6-8 10Z" />
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
  const [feedback, setFeedback] = useState<{
    status: 'approved' | 'declined' | 'error';
    code?: MasroofiErrorCode;
  } | null>(null);
  const fixture = MASROOFI_PURCHASE_FIXTURES[fixtureId];
  return (
    <View style={shopStyles.item} testID={`masroofi-shop-${fixtureId}`}>
      <View style={[shopStyles.itemHeading, { flexDirection: logicalRowDirection(direction) }]}>
        <ShopGlyph kind={fixture.category} />
        <View style={styles.flex}>
          <Text brand direction={direction} variant="control">
            {t(`masroofi.item_${fixtureId}`)}
          </Text>
          <Text brand color="inkMuted" direction={direction} variant="caption">
            {t('masroofi.purchaseDetail', {
              category: t(`masroofi.${fixture.category}`),
              channel: t(fixture.online ? 'masroofi.channelOnline' : 'masroofi.channelInStore'),
            })}
          </Text>
        </View>
      </View>
      <PrimaryButton
        brand
        onPress={() => {
          const requestId = `masroofi-ui-purchase-${activeChildId}-${fixtureId}-${transactionCount}`;
          const result = purchase(fixtureId, requestId);
          if (!result.ok) {
            setFeedback({ status: 'error', code: result.error.code });
            return;
          }
          const transaction = result.data.transactions.find((item) => item.requestId === requestId);
          setFeedback(
            transaction
              ? {
                  status: transaction.status === 'approved' ? 'approved' : 'declined',
                  code: transaction.declineReason ?? undefined,
                }
              : { status: 'error' },
          );
        }}
        testID={`masroofi-purchase-${fixtureId}`}
      >
        {t('masroofi.tryPurchase', { amount: amount(fixture.amountFils) })}
      </PrimaryButton>
      {feedback ? (
        <MasroofiMessage
          error={feedback.status !== 'approved'}
          message={
            feedback.status === 'approved'
              ? t('masroofi.purchaseApproved')
              : feedback.status === 'declined'
                ? `${t('masroofi.purchaseDeclined')} ${feedback.code ? t(masroofiErrorKey(feedback.code)) : ''}`
                : t(feedback.code ? masroofiErrorKey(feedback.code) : 'masroofi.error')
          }
          testID={`masroofi-purchase-result-${fixtureId}`}
        />
      ) : null}
    </View>
  );
}

function PracticeShop({
  childId,
  transactionCount,
}: {
  childId: string;
  transactionCount: number;
}) {
  const { t, direction } = useMasroofiPresentation();
  const [category, setCategory] = useState<MasroofiCategory>('stationery');
  const fixture = Object.values(MASROOFI_PURCHASE_FIXTURES).find(
    (item) => item.category === category,
  )!;
  return (
    <MasroofiSection body={t('masroofi.shopBody')} title={t('masroofi.shopTitle')}>
      <View style={[shopStyles.categories, { flexDirection: logicalRowDirection(direction) }]}>
        {MASROOFI_CATEGORIES.map((name) => (
          <Button
            accessibilityState={{ selected: category === name }}
            brand
            fullWidth={false}
            key={name}
            onPress={() => setCategory(name)}
            style={shopStyles.category}
            testID={`masroofi-shop-category-${name}`}
            variant={category === name ? 'primary' : 'secondary'}
          >
            {t(`masroofi.${name}`)}
          </Button>
        ))}
      </View>
      <PracticePurchase
        fixtureId={fixture.id}
        key={`${childId}:${fixture.id}`}
        transactionCount={transactionCount}
      />
    </MasroofiSection>
  );
}

function ChildRules({ controls }: { controls: MasroofiControls }) {
  const { t, direction, amount } = useMasroofiPresentation();
  const rules = [
    { title: t('masroofi.purchaseLimit'), value: amount(controls.perPurchaseLimitFils) },
    { title: t('masroofi.dailyLimit'), value: amount(controls.dailyLimitFils) },
    ...MASROOFI_CATEGORIES.map((name) => ({
      title: t(`masroofi.${name}`),
      value: t(controls.allowedCategories.includes(name) ? 'masroofi.allowed' : 'masroofi.blocked'),
    })),
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
            <Text
              align="center"
              brand
              color="inkMuted"
              direction={direction}
              testID="masroofi-simulation-notice"
              variant="caption"
            >
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
              message={t('masroofi.cardEarnedNotice', {
                amount: amount(latestTransaction.amountFils),
              })}
              testID="masroofi-earned-reveal"
            />
          ) : null}
          <Text brand color="inkMuted" direction={direction}>
            {t('masroofi.childBody')}
          </Text>
          {card.controls.frozen ? <MasroofiMessage message={t('masroofi.errorFrozen')} /> : null}
          <PracticeShop
            childId={card.childId}
            key={card.childId}
            transactionCount={view.data.transactions.length}
          />
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
  categories: { flexWrap: 'wrap', gap: spacing.xs },
  category: { flexBasis: '46%', flexGrow: 1, minWidth: 0 },
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
