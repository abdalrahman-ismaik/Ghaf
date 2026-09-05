import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, expectTypeOf, it } from 'vitest';

import type {
  BadgeDetailProps,
  BadgeGalleryProps,
  GardenChapterModuleProps,
  GrowthJourneyPresentationProps,
  ImpactPathScreenProps,
  TodayImpactPathCardProps,
} from '../src/components/r002b/GrowthJourneyScreens';

const root = fileURLToPath(new URL('../', import.meta.url));
const componentPath = `${root}src/components/r002b/GrowthJourneyScreens.tsx`;

function componentSource() {
  return existsSync(componentPath) ? readFileSync(componentPath, 'utf8') : '';
}

describe('R002b Growth Journey presentation components', () => {
  it('typechecks every screen contract against the shared locale and motion boundary', () => {
    expectTypeOf<TodayImpactPathCardProps>().toMatchTypeOf<GrowthJourneyPresentationProps>();
    expectTypeOf<GardenChapterModuleProps>().toMatchTypeOf<GrowthJourneyPresentationProps>();
    expectTypeOf<ImpactPathScreenProps>().toMatchTypeOf<GrowthJourneyPresentationProps>();
    expectTypeOf<BadgeGalleryProps>().toMatchTypeOf<GrowthJourneyPresentationProps>();
    expectTypeOf<BadgeDetailProps>().toMatchTypeOf<GrowthJourneyPresentationProps>();
  });

  it('exports one typed presentation boundary for each approved Growth surface', () => {
    const source = componentSource();

    expect(existsSync(componentPath)).toBe(true);
    for (const contract of [
      'GrowthJourneyPresentationProps',
      'GrowthActionPresentation',
      'TodayImpactPathCardProps',
      'GardenChapterModuleProps',
      'ImpactPathStationPresentation',
      'ImpactPathScreenProps',
      'BadgeGalleryItemPresentation',
      'BadgeGalleryProps',
      'BadgeCriterionPresentation',
      'BadgeDetailProps',
    ]) {
      expect(source, contract).toContain(`export interface ${contract}`);
    }
    for (const component of [
      'TodayImpactPathCard',
      'GardenChapterModule',
      'ImpactPathScreen',
      'BadgeGallery',
      'BadgeDetail',
    ]) {
      expect(source, component).toContain(`export function ${component}`);
    }
  });

  it('keeps navigation, feature flags, state, translation, and business calculations outside', () => {
    const source = componentSource();
    const forbiddenBoundary =
      /(?:expo-router|useRouter|useLocalSearchParams|usePrototypeStore|@\/state|@\/features|@\/i18n|useTranslation|r002b_[a-z_]+|task_recycling_p0_v1|task\.recycling_sort|learning\.mangrove|badge\.(?:journey|skill|habitat)|(?:108|120|132|144|156|168|180)\s*(?:Seeds|seeds|بذرة))/u;
    const webRuntime =
      /(?:WebView|document\.|window\.|localStorage|<div\b|className=|\.html["'`])/u;

    expect(source).toContain("from 'react-native'");
    expect(source).toContain("from '@/components/primitives'");
    expect(source).toContain("from '@/design/tokens'");
    expect(source).not.toMatch(forbiddenBoundary);
    expect(source).not.toMatch(webRuntime);
  });

  it('accepts all visible copy, values, state labels, and actions through props', () => {
    const source = componentSource();

    for (const prop of [
      'direction: TextDirection',
      'language: LocaleCode',
      'reducedMotion: boolean',
      'groupLabel: string',
      'chapterTitle: string',
      'lifetimeLabel: string',
      'lifetimeValue: string',
      'requirementText: string',
      'statusLabel: string',
      'accessibilityLabel: string',
      'onPress: () => void',
    ]) {
      expect(source, prop).toContain(prop);
    }

    expect(source).not.toMatch(/[\u0600-\u06ff]/u);
    expect(source).not.toContain('EN:S');
  });

  it('models conservative loading, offline, interruption, error, and no-entry states', () => {
    const source = componentSource();
    const stateContract = source.slice(
      source.indexOf('export type GrowthContentState'),
      source.indexOf('export interface TodayImpactPathCardProps'),
    );

    for (const state of [
      'ready',
      'not_entered',
      'loading',
      'offline',
      'interrupted',
      'error',
      'complete',
      'unavailable',
    ]) {
      expect(stateContract, state).toContain(`'${state}'`);
    }
  });

  it('keeps current-stage and lifetime projections visibly distinct in the Garden module', () => {
    const source = componentSource();

    for (const field of [
      'currentStageLabel: string',
      'currentStageValue: string',
      'archiveLabel: string',
      'entries: readonly GardenChapterEntryPresentation[]',
    ]) {
      expect(source, field).toContain(field);
    }
    expect(source).toContain('currentStageValue');
    expect(source).toContain('lifetimeValue');
    expect(source).toContain('initialFocusTargetId?: string');
    expect(source).toContain('restoreFocus={initialFocusTargetId === entry.action?.testID}');
  });

  it('features a recommended badge from the same ordered collection without duplicate focus', () => {
    const source = componentSource();

    expect(source).toContain('recommendedItemId?: string');
    expect(source).not.toContain('recommendedItem?: BadgeGalleryItemPresentation');
    expect(source).toContain(
      'const showRecommended = Boolean(recommendedItem && recommendedLabel)',
    );
    expect(source).toContain('items.find((item) => item.id === recommendedItemId)');
    expect(source).toContain('showRecommended');
    expect(source).toContain('items.filter((item) => item.id !== recommendedItem?.id)');
    expect(source).toContain('gridItems.map((item) =>');
  });

  it('keeps every badge in the grid when recommendation metadata is incomplete', () => {
    const source = componentSource();
    const gallerySource = source.slice(
      source.indexOf('export function BadgeGallery'),
      source.indexOf('export function BadgeDetail'),
    );

    expect(gallerySource).toContain(
      'const showRecommended = Boolean(recommendedItem && recommendedLabel)',
    );
    expect(gallerySource).toMatch(/const gridItems = showRecommended[\s\S]*?: items;/u);
    expect(gallerySource).toContain('{showRecommended && recommendedItem && recommendedLabel ? (');
  });

  it('keeps the Today heading discoverable instead of flattening it into an accessible wrapper', () => {
    const source = componentSource();
    const todaySource = source.slice(
      source.indexOf('export function TodayImpactPathCard'),
      source.indexOf('export function GardenChapterModule'),
    );

    expect(todaySource).toMatch(
      /<Text[\s\S]*?accessibilityLabel=\{groupLabel\}[\s\S]*?accessibilityRole="header"/u,
    );
    expect(todaySource).not.toMatch(/<View\s+accessible\s+accessibilityLabel=\{groupLabel\}/u);
  });

  it('adapts from 320 through 768 and large text without a fixed reference canvas', () => {
    const source = componentSource();
    const fixedReferenceCanvas =
      /\b(?:width|height|minWidth|minHeight|maxWidth|maxHeight)\s*:\s*(?:390|844)\b/u;
    const disabledScaling =
      /(?:allowFontScaling\s*=\s*\{false\}|adjustsFontSizeToFit|numberOfLines)/u;

    expect(source).toContain('useWindowDimensions');
    expect(source).toContain('fontScale >= 1.5');
    expect(source).toContain('width < 360');
    expect(source).toContain('width >= 430');
    expect(source).toContain('layout.touchTarget');
    expect(source).toMatch(/minWidth:\s*0/u);
    expect(source).toMatch(/width:\s*'100%'/u);
    expect(source).toMatch(/flexWrap:\s*'wrap'/u);
    expect(source).not.toMatch(fixedReferenceCanvas);
    expect(source).not.toMatch(disabledScaling);
  });

  it('uses logical direction, scalable branded type, and tabular progress values', () => {
    const source = componentSource();

    expect(source).toContain('logicalRowDirection(direction)');
    expect(source).toContain('direction={direction}');
    expect(source).toContain('language={language}');
    expect(source).toContain('tabular');
    expect(source).toContain('brand');
  });

  it('provides named controls, text state, live recovery feedback, and decorative hiding', () => {
    const source = componentSource();

    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain('accessibilityLabel={accessibilityLabel}');
    expect(source).toContain('accessibilityState={{ disabled }}');
    expect(source).toContain('accessibilityLiveRegion="polite"');
    expect(source).toContain('aria-hidden');
    expect(source).toContain('{statusLabel}');
    expect(source).toMatch(
      /pressed\s*\?\s*\(?\s*reducedMotion\s*\?\s*styles\.pressedStatic\s*:\s*styles\.pressedMotion/u,
    );
  });

  it('renders deterministic station, badge, and criterion order without mutating domain state', () => {
    const source = componentSource();

    expect(source).toContain('stations.map((station) =>');
    expect(source).toContain('gridItems.map((item) =>');
    expect(source).toContain('criteria.map((criterion) =>');
    expect(source).toContain('onPress={action.onPress}');
    expect(source).not.toMatch(/\.(?:sort|reverse|splice|push|pop|shift|unshift)\(/u);
    expect(source).not.toMatch(/(?:createTask|assignTask|awardBadge|commit|dispatch|setState)/u);
  });
});
