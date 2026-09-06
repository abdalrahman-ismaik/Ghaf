import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import { layout } from '../src/design/tokens';
import { resources } from '../src/i18n/resources';

vi.mock('react-native', () => ({
  Platform: {
    select: (options: Record<string, string>) => options.default,
  },
}));

const root = fileURLToPath(new URL('../', import.meta.url));

function source(relativePath: string) {
  return readFileSync(`${root}${relativePath}`, 'utf8');
}

const parentPresentationFiles = [
  'src/components/r002a/parent/ParentHomeHeader.tsx',
  'src/components/r002a/parent/ParentCanopySummaryCard.tsx',
  'src/components/r002a/parent/ParentLifecycleCard.tsx',
  'src/components/r002a/parent/ParentChildrenSection.tsx',
  'src/components/r002a/parent/ParentHomeNavigation.tsx',
  'src/components/r002a/parent/ParentHomeUtilities.tsx',
  'src/components/r002a/parent/ParentAdjustmentReview.tsx',
  'src/components/r002a/R002aScreen.tsx',
] as const;

describe('R002a Parent Home presentation', () => {
  it('uses a reusable native Soft Geometric shell with fixed safe-area navigation', () => {
    for (const relativePath of parentPresentationFiles) {
      expect(existsSync(`${root}${relativePath}`), relativePath).toBe(true);
      const contents = source(relativePath);
      expect(contents, relativePath).not.toMatch(/(?:document\.|<div|className=|WebView)/u);
      expect(contents, relativePath).not.toMatch(/https?:\/\//u);
      expect(contents, relativePath).not.toContain('usePrototypeStore');
      expect(contents, relativePath).not.toContain('useRouter');
    }

    const shell = source('src/components/r002a/R002aScreen.tsx');
    const navigation = source('src/components/r002a/parent/ParentHomeNavigation.tsx');
    const header = source('src/components/r002a/parent/ParentHomeHeader.tsx');

    expect(shell).toContain('SafeAreaView');
    expect(shell).toContain('ScrollView');
    expect(shell).toContain('contentInsetAdjustmentBehavior="automatic"');
    expect(shell).toContain('automaticallyAdjustKeyboardInsets');
    expect(shell).toContain('R002aFieldTexture');
    expect(shell).toContain('assetId="field-paper"');
    expect(shell).toContain("Platform.OS === 'web' ? ({ dir: 'ltr' } as const) : {}");
    expect(navigation).toContain('useSafeAreaInsets');
    expect(navigation).toContain('layout.touchTarget');
    expect(navigation).toContain('accessibilityState={{ selected: active }}');
    expect(navigation).toContain('aria-selected={active}');
    expect(navigation).not.toContain('numberOfLines={2}');
    expect(header).toContain('physicalRow');
    expect(shell).toContain("dir: 'ltr'");
    expect(header).toContain('sideSlot');
    expect(header).toContain('titleSlot');
    expect(header).toContain('accessibilityRole="header"');
    expect(layout.touchTarget).toBeGreaterThanOrEqual(48);
  });

  it('keeps the Parent route as the live state and action adapter', () => {
    const route = source('app/parent/index.tsx');
    const parentLayout = source('app/parent/_layout.tsx');
    const rootLayout = source('app/_layout.tsx');
    const summary = source('src/components/family-growth/ParentPatternSummary.tsx');

    expect(parentLayout).toContain('selectHasActiveParentExperience');
    expect(parentLayout).toContain('authorizeParentExperience');
    expect(parentLayout).toContain('<Redirect href="/child" />');
    expect(parentLayout).toContain('<Redirect href="/" />');
    expect(route).toContain('state.household.combinedCanopy');
    expect(route).toContain('state.children');
    expect(route).toContain('state.activeChildId');
    expect(route).toContain('state.journey');
    expect(route).toContain('state.preAcceptanceAdjustment');
    expect(route).toContain('state.resolvePreAcceptanceAdjustment');
    expect(route).toContain('state.signOutExperience');
    expect(summary).toContain('serviceRegistry.parentSummary.applyLocalCorrection');
    expect(route).toContain('signOutExperience()');
    expect(route).toContain("router.replace('/access/child' as Href)");
    expect(route).toContain("router.push('/garden')");
    expect(route).toContain("router.push('/parent/family' as Href)");
    expect(route).toContain("familyLabel={t('navigation.family')}");
    expect(route).toContain('keyboardAware');
    expect(route).toContain("router.push('/parent/settings' as Href)");
    expect(rootLayout).toContain("pathname.startsWith('/parent')");
  });

  it('anchors Parent canopy progress to the reading start edge', () => {
    const canopy = source('src/components/r002a/parent/ParentCanopySummaryCard.tsx');

    expect(canopy).toContain("direction === 'rtl' ? 'flex-end' : 'flex-start'");
    expect(canopy).toMatch(/style=\{\[\s*styles\.progressTrack,[\s\S]*?alignItems:/u);
  });

  it('preserves established automation IDs and lifecycle destinations', () => {
    const route = source('app/parent/index.tsx');
    const summary = source('src/components/family-growth/ParentPatternSummary.tsx');
    const languageSwitcher = source('src/components/LanguageSwitcher.tsx');
    const combined = [
      route,
      summary,
      languageSwitcher,
      ...parentPresentationFiles.map(source),
    ].join('\n');

    for (const testId of [
      'parent-home-screen',
      'parent-home-role-guard',
      'family-combined-canopy',
      'parent-primary-action',
      'pre-acceptance-parent-review',
      'resolve-smaller-task-button',
      'resolve-safe-equivalent-button',
      'prepared-parent-summary',
      'prototype-status-bar',
      'reset-demo-button',
      'confirm-reset-button',
      'cancel-reset-button',
      'language-switcher',
      'parent-summary-fact-ar',
      'parent-summary-fact-en',
      'parent-summary-apply-correction',
      'parent-summary-correction-status',
    ]) {
      expect(combined, testId).toContain(testId);
    }
    expect(languageSwitcher).toContain("const localeOptions: readonly LocaleCode[] = ['ar', 'en']");
    expect(languageSwitcher).toContain('testID={`language-${option}`}');

    expect(route).toContain("journey?.lifecycle === 'retry'");
    expect(route).toContain("journey?.lifecycle === 'confirmed'");
    expect(route).toContain("t('parentHome.continueRecognition')");
    expect(route).toContain("t('parentHome.approvalRecorded')");
    expect(route).toContain("'/parent/check-in'");
    expect(route).toContain("'/parent/task/new'");
    expect(route).toContain("'/garden'");
    expect(route).toContain("'/child'");
    expect(route).toContain('P0_SAFE_EQUIVALENT_TEMPLATE.safety.routeConstraint');
    expect(source('src/components/r002a/parent/ParentAdjustmentReview.tsx')).toContain(
      'option.safetyLabel',
    );
  });

  it('uses live values and does not import R002b mechanics or web exports', () => {
    const route = source('app/parent/index.tsx');
    const combined = [route, ...parentPresentationFiles.map(source)].join('\n');

    expect(combined).not.toMatch(/task\.recycling_sort\.v1/u);
    expect(combined).not.toMatch(/\b(?:108|120|180)\b/u);
    expect(combined).not.toMatch(/["'`]\s*4\s*(?:\/|من)\s*5/u);
    expect(combined).not.toMatch(/(?:Impact Path|Shared Growth|Badge Gallery)/iu);
    expect(combined).not.toMatch(/\.html["']|\.png["']/u);
    expect(combined).not.toMatch(/(?:familyLeague|familyReward)\./u);
    expect(combined).not.toMatch(/League[\s\S]{0,80}\/circle|\/circle[\s\S]{0,80}League/u);
    expect(combined).not.toContain('rgba(');
  });

  it('keeps all new copy paired and removes placeholder copy', () => {
    const arabic = resources.ar.translation.parentHome;
    const english = resources.en.translation.parentHome;

    expect(Object.keys(arabic).sort()).toEqual(Object.keys(english).sort());
    expect(JSON.stringify({ arabic, english })).not.toMatch(/EN:S/u);
    for (const key of [
      'homeLabel',
      'welcome',
      'todayWithChildren',
      'reviewTask',
      'continueRecognition',
      'approvalRecorded',
      'remainingLeaves',
      'selectedChild',
      'settingsLabel',
      'settingsTitle',
    ]) {
      expect(arabic).toHaveProperty(key);
      expect(english).toHaveProperty(key);
    }
  });
});
