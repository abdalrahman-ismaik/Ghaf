import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  FAMILY_PLAN_CATALOG,
  calculateAnnualSavingsFils,
  calculateAnnualSavingsPercent,
  calculateIllustrativeAnnualBillingsFils,
  evaluateFamilyCapacity,
  formatPriceFils,
} from '../../src/features/family-plan';
import {
  createInitialParentOnboardingDraft,
  updateParentOnboardingDraft,
} from '../../src/features/access/parentOnboarding';
import { resources } from '../../src/i18n/resources';

const repositoryRoot = resolve(import.meta.dirname, '../..');

function source(relativePath: string): string {
  return readFileSync(join(repositoryRoot, relativePath), 'utf8');
}

function nestedSources(relativeDirectory: string): string {
  const directory = join(repositoryRoot, relativeDirectory);
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const relativePath = join(relativeDirectory, entry.name);
      return entry.isDirectory() ? nestedSources(relativePath) : [source(relativePath)];
    })
    .join('\n');
}

describe('Family Plus capacity model', () => {
  it('keeps the complete free journey for two profiles and previews one household plan up to six', () => {
    expect(FAMILY_PLAN_CATALOG.free).toMatchObject({
      availability: 'available',
      maximumChildProfiles: 2,
      householdWide: true,
      perChildFee: false,
      advertising: 'none',
      coreJourneyIncluded: true,
      purchaseProcessing: false,
      childFacingPromotion: false,
    });
    expect(FAMILY_PLAN_CATALOG.ghafPlus).toMatchObject({
      availability: 'future_preview',
      minimumChildProfiles: 3,
      maximumChildProfiles: 6,
      householdWide: true,
      perChildFee: false,
      advertising: 'none',
      coreJourneyIncluded: true,
      purchaseProcessing: false,
      childFacingPromotion: false,
    });
  });

  it('fails closed outside the free and preview capacity bands', () => {
    expect(evaluateFamilyCapacity(1)).toBe('free_available');
    expect(evaluateFamilyCapacity(2)).toBe('free_available');
    expect(evaluateFamilyCapacity(3)).toBe('plus_preview_required');
    expect(evaluateFamilyCapacity(6)).toBe('plus_preview_required');

    for (const unsupported of [-1, 0, 2.5, 7, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(evaluateFamilyCapacity(unsupported)).toBe('unsupported');
    }
  });

  it('uses exact integer-fils arithmetic and labels formatting independently of billing', () => {
    expect(FAMILY_PLAN_CATALOG.ghafPlus.monthlyPriceFils).toBe(1_999);
    expect(FAMILY_PLAN_CATALOG.ghafPlus.annualPriceFils).toBe(15_999);
    expect(calculateAnnualSavingsFils()).toBe(7_989);
    expect(calculateAnnualSavingsPercent()).toBe(33);
    expect(calculateIllustrativeAnnualBillingsFils(1_000)).toBe(15_999_000);
    expect(calculateIllustrativeAnnualBillingsFils(-1)).toBeNull();
    expect(calculateIllustrativeAnnualBillingsFils(1.5)).toBeNull();
    expect(formatPriceFils(1_999, 'en')).toBe('19.99');
    expect(formatPriceFils(15_999_000, 'en')).toBe('159,990.00');
    expect(formatPriceFils(1_999, 'ar')).toBe('١٩٫٩٩');
    expect(formatPriceFils(-1, 'en')).toBeNull();
  });
});

describe('Family Plus presentation boundary', () => {
  it('provides equivalent Parent-facing Arabic and English offer resources', () => {
    const ar = resources.ar.translation.access.setup;
    const en = resources.en.translation.access.setup;
    const keys = [
      'plusCapacity',
      'plusCapacitySummary',
      'plusAccessibilityLabel',
      'plusPreviewTitle',
      'plusPreviewBody',
      'freePlanName',
      'freePlanDetail',
      'plusPlanName',
      'plusPlanDetail',
      'plusOneHousehold',
      'plusNoPerChildFee',
      'plusSameCore',
      'plusNoChildPromotion',
      'plusProposedPrice',
      'plusMonthlyPrice',
      'plusAnnualPrice',
      'plusAnnualSaving',
      'plusPrototypeTruth',
      'plusBack',
    ] as const;

    for (const key of keys) {
      expect(ar[key], `Arabic ${key}`).toBeTruthy();
      expect(en[key], `English ${key}`).toBeTruthy();
    }

    expect(en.plusPrototypeTruth).toMatch(/no subscription|does not activate/iu);
    expect(en.plusPrototypeTruth).toMatch(/purchase|charge/iu);
    expect(en.plusPrototypeTruth).toMatch(/extra (?:Child )?profile/iu);
    expect(ar.plusPrototypeTruth).toMatch(/اشتراك|شراء|دفع/u);
  });

  it('keeps the trigger inside verified Parent setup and outside the Child experience', () => {
    const route = source('app/access/parent/family-basics.tsx');
    const childRoutes = nestedSources('app/child');

    expect(route).toContain('testID="family-plus-capacity-trigger"');
    expect(route).toContain('<FamilyPlusPreview');
    expect(route).toContain("parentOnboarding.status !== 'verified'");
    expect(route).toContain('setPlusPreviewVisible(true)');
    expect(childRoutes).not.toMatch(/FamilyPlusPreview|family-plus-capacity|plusProposedPrice/iu);
  });

  it('uses one accessible offline modal without purchase or remote authority', () => {
    const component = source('src/components/access/FamilyPlusPreview.tsx');
    const route = source('app/access/parent/family-basics.tsx');
    const packageJson = source('package.json');

    expect(component).toContain('<Modal');
    expect(component).toContain('onRequestClose={onDismiss}');
    expect(component).toContain('accessibilityViewIsModal');
    expect(component).toContain('useReducedMotion');
    expect(component).toContain('AccessibilityInfo.setAccessibilityFocus');
    expect(component).toContain('testID="family-plus-preview-content"');
    expect(route).toContain('if (plusPreviewVisible)');

    const authoritySources = `${component}\n${route}`;
    expect(authoritySources).not.toMatch(/fetch\s*\(|https?:\/\/|usePrototypeStore\.getState/iu);
    expect(authoritySources).not.toMatch(/billing|checkout|purchaseToken|entitlement/iu);
    expect(packageJson).not.toMatch(/react-native-iap|stripe|play-billing/iu);
  });

  it('preserves the authoritative one-or-two-Child onboarding draft', () => {
    const initial = createInitialParentOnboardingDraft();
    expect(initial.childCount).toBe(2);
    expect(
      updateParentOnboardingDraft(initial, {
        childCount: 3,
      } as never),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });
});
