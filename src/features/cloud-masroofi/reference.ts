import type {
  MasroofiControls,
  MasroofiCategory,
  MasroofiPurchaseFixtureId,
} from '@/models/masroofi';

// Reference prices describe practice items; persisted balances come only from the family API.
export const MASROOFI_PURCHASE_REFERENCES = {
  stationery: { id: 'stationery', category: 'stationery', online: false, amountFils: 300 },
  storybook: { id: 'storybook', category: 'books', online: false, amountFils: 800 },
  football: { id: 'football', category: 'sports', online: false, amountFils: 1800 },
  art_supplies: { id: 'art_supplies', category: 'arts', online: false, amountFils: 1000 },
  museum_ticket: { id: 'museum_ticket', category: 'outings', online: true, amountFils: 1500 },
  snack: { id: 'snack', category: 'snacks', online: false, amountFils: 400 },
  gift: { id: 'gift', category: 'gifts', online: false, amountFils: 2000 },
  game_online: { id: 'game_online', category: 'games', online: true, amountFils: 1200 },
} as const satisfies Readonly<
  Record<
    MasroofiPurchaseFixtureId,
    {
      readonly id: MasroofiPurchaseFixtureId;
      readonly category: MasroofiCategory;
      readonly online: boolean;
      readonly amountFils: number;
    }
  >
>;

export const MASROOFI_DEFAULT_CONTROLS: MasroofiControls = {
  frozen: false,
  onlineAllowed: false,
  allowedCategories: ['stationery'],
  perPurchaseLimitFils: 2000,
  dailyLimitFils: 5000,
};
export const MASROOFI_MAX_REWARD_FILS = 10000;
export const MASROOFI_MAX_TOP_UP_FILS = 50000;
export const MASROOFI_MAX_BALANCE_FILS = 1000000;
