import type { LocaleCode } from '@/models/familyGrowth';

export type FamilyPlanId = 'free' | 'ghaf_plus';
export type FamilyPlanAvailability = 'available' | 'future_preview';
export type FamilyCapacityDecision = 'free_available' | 'plus_preview_required' | 'unsupported';

export interface FamilyPlanOffer {
  readonly advertising: 'none';
  readonly annualPriceFils: number | null;
  readonly availability: FamilyPlanAvailability;
  readonly childFacingPromotion: false;
  readonly coreJourneyIncluded: true;
  readonly currency: 'AED';
  readonly householdWide: true;
  readonly id: FamilyPlanId;
  readonly maximumChildProfiles: number;
  readonly minimumChildProfiles: number;
  readonly monthlyPriceFils: number | null;
  readonly perChildFee: false;
  readonly purchaseProcessing: false;
}

const FREE_PLAN: FamilyPlanOffer = Object.freeze({
  advertising: 'none',
  annualPriceFils: null,
  availability: 'available',
  childFacingPromotion: false,
  coreJourneyIncluded: true,
  currency: 'AED',
  householdWide: true,
  id: 'free',
  maximumChildProfiles: 2,
  minimumChildProfiles: 1,
  monthlyPriceFils: null,
  perChildFee: false,
  purchaseProcessing: false,
});

const GHAF_PLUS_PLAN: FamilyPlanOffer = Object.freeze({
  advertising: 'none',
  annualPriceFils: 15_999,
  availability: 'future_preview',
  childFacingPromotion: false,
  coreJourneyIncluded: true,
  currency: 'AED',
  householdWide: true,
  id: 'ghaf_plus',
  maximumChildProfiles: 6,
  minimumChildProfiles: 3,
  monthlyPriceFils: 1_999,
  perChildFee: false,
  purchaseProcessing: false,
});

export const FAMILY_PLAN_CATALOG = Object.freeze({
  free: FREE_PLAN,
  ghafPlus: GHAF_PLUS_PLAN,
});

export function evaluateFamilyCapacity(requestedChildProfiles: number): FamilyCapacityDecision {
  if (!Number.isInteger(requestedChildProfiles)) return 'unsupported';
  if (
    requestedChildProfiles >= FREE_PLAN.minimumChildProfiles &&
    requestedChildProfiles <= FREE_PLAN.maximumChildProfiles
  ) {
    return 'free_available';
  }
  if (
    requestedChildProfiles >= GHAF_PLUS_PLAN.minimumChildProfiles &&
    requestedChildProfiles <= GHAF_PLUS_PLAN.maximumChildProfiles
  ) {
    return 'plus_preview_required';
  }
  return 'unsupported';
}

export function calculateAnnualSavingsFils(): number {
  const monthlyPriceFils = GHAF_PLUS_PLAN.monthlyPriceFils;
  const annualPriceFils = GHAF_PLUS_PLAN.annualPriceFils;
  if (monthlyPriceFils === null || annualPriceFils === null) return 0;
  return monthlyPriceFils * 12 - annualPriceFils;
}

export function calculateAnnualSavingsPercent(): number {
  const monthlyPriceFils = GHAF_PLUS_PLAN.monthlyPriceFils;
  if (monthlyPriceFils === null) return 0;
  const twelveMonthlyPaymentsFils = monthlyPriceFils * 12;
  return Math.round((calculateAnnualSavingsFils() / twelveMonthlyPaymentsFils) * 100);
}

export function calculateIllustrativeAnnualBillingsFils(payingHouseholds: number): number | null {
  const annualPriceFils = GHAF_PLUS_PLAN.annualPriceFils;
  if (annualPriceFils === null || !Number.isSafeInteger(payingHouseholds) || payingHouseholds < 0) {
    return null;
  }
  const billingsFils = annualPriceFils * payingHouseholds;
  return Number.isSafeInteger(billingsFils) ? billingsFils : null;
}

export function formatPriceFils(priceFils: number, locale: LocaleCode): string | null {
  if (!Number.isSafeInteger(priceFils) || priceFils < 0) return null;
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    numberingSystem: locale === 'ar' ? 'arab' : 'latn',
  }).format(priceFils / 100);
}
