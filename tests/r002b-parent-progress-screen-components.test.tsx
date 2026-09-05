import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, expectTypeOf, it } from 'vitest';

import type {
  ParentProgressPresentationProps,
  ParentProgressScreenProps,
} from '../src/components/r002b/ParentProgressScreen';

const root = fileURLToPath(new URL('../', import.meta.url));
const componentPath = `${root}src/components/r002b/ParentProgressScreen.tsx`;

function componentSource() {
  return existsSync(componentPath) ? readFileSync(componentPath, 'utf8') : '';
}

describe('R002b Parent Progress presentation component', () => {
  it('extends the shared locale, direction, and reduced-motion contract', () => {
    expectTypeOf<ParentProgressScreenProps>().toMatchTypeOf<ParentProgressPresentationProps>();
  });

  it('exports one prop-driven presentation boundary with no route, store, i18n, or feature access', () => {
    const source = componentSource();

    expect(existsSync(componentPath)).toBe(true);
    expect(source).toContain('export interface ParentProgressScreenProps');
    expect(source).toContain('export function ParentProgressScreen');
    expect(source).toContain("from 'react-native'");
    expect(source).toContain("from '@/components/primitives'");
    expect(source).toContain("from '@/design/tokens'");
    expect(source).not.toMatch(
      /(?:expo-router|useRouter|useLocalSearchParams|usePrototypeStore|@\/state|@\/features|@\/i18n|useTranslation|r002b_[a-z_]+)/u,
    );
    expect(source).not.toMatch(
      /(?:WebView|document\.|window\.|localStorage|<div\b|className=|\.html["'`])/u,
    );
  });

  it('accepts every visible phrase, value, and interaction through typed props', () => {
    const source = componentSource();

    for (const prop of [
      'direction: TextDirection',
      'language: LocaleCode',
      'reducedMotion: boolean',
      'selectedProfileAnnouncement: string',
      'privateNote: string',
      'readOnlyNote: string',
      'summary: ParentProgressSummaryPresentation | null',
      'suggestions: readonly ParentProgressSuggestionPresentation[]',
      'accessibilityLabel: string',
      'onPress: () => void',
    ]) {
      expect(source, prop).toContain(prop);
    }

    expect(source).not.toMatch(/[\u0600-\u06ff]/u);
    expect(source).not.toContain('EN:S');
  });

  it('models every conservative local content and recovery state', () => {
    const source = componentSource();
    const stateContract = source.slice(
      source.indexOf('export type ParentProgressContentState'),
      source.indexOf('export interface ParentProgressPresentationProps'),
    );

    for (const state of [
      'ready',
      'loading',
      'offline',
      'interrupted',
      'error',
      'unauthorized',
      'empty',
      'stale',
      'unavailable',
    ]) {
      expect(stateContract, state).toContain(`'${state}'`);
    }
  });

  it('keeps lifetime, current stage, archive, badges, learning, and suggestions distinct', () => {
    const source = componentSource();

    for (const section of [
      'summary.lifetime',
      'summary.currentStage',
      '<ArchiveSection',
      '<BadgeSection',
      '<LearningSection',
      '<SuggestionSection',
    ]) {
      expect(source, section).toContain(section);
    }
    expect(source).toContain('currentStageProgress');
    expect(source).not.toMatch(/\b(?:108|120|180)\b/u);
  });

  it('contains no reward mutation, assignment, or task-creation implementation', () => {
    const source = componentSource();

    expect(source).not.toMatch(
      /(?:grantSeeds|revokeBadge|assignTask|createTask|approveTask|completeLearning|seedDelta|rewardAmount|useMutation)/u,
    );
    expect(source).toContain('item.action.onPress');
    expect(source).toContain('item.unavailableText');
  });

  it('uses semantic headings, lists, radio selection, progress text, and live announcements', () => {
    const source = componentSource();

    expect(source).toContain('accessibilityRole="header"');
    expect(source).toContain('accessibilityRole="list"');
    expect(source).toContain('accessibilityRole="radiogroup"');
    expect(source).toContain('accessibilityRole="radio"');
    expect(source).toContain('accessibilityLabel={option.accessibilityLabel}');
    expect(source).toContain('accessibilityRole="progressbar"');
    expect(source).toContain('accessibilityValue={{');
    expect(source).toContain('accessibilityLiveRegion="polite"');
    expect(source).toContain('accessibilityState={{ busy }}');
    expect(source).toContain(
      'accessibilityState={{ checked: option.selected, disabled: option.disabled }}',
    );
    expect(source).toContain('aria-checked={option.selected}');
    expect(source).toContain('importantForAccessibility="no-hide-descendants"');
  });

  it('adapts across narrow, wide, and large-text layouts without owning a fixed canvas or scroll', () => {
    const source = componentSource();
    const fixedReferenceCanvas =
      /\b(?:width|height|minWidth|minHeight|maxWidth|maxHeight)\s*:\s*(?:390|844)\b/u;
    const disabledScaling =
      /(?:allowFontScaling\s*=\s*\{false\}|adjustsFontSizeToFit|numberOfLines)/u;

    expect(source).toContain('useWindowDimensions');
    expect(source).toContain('fontScale >= 1.5');
    expect(source).toContain('width < 360');
    expect(source).toContain('width >= 600');
    expect(source).toContain('layout.touchTarget');
    expect(source).toMatch(/minWidth:\s*0/u);
    expect(source).toMatch(/width:\s*'100%'/u);
    expect(source).toMatch(/flexWrap:\s*'wrap'/u);
    expect(source).not.toContain('ScrollView');
    expect(source).not.toMatch(fixedReferenceCanvas);
    expect(source).not.toMatch(disabledScaling);
  });

  it('uses physical RTL progress, logical rows, branded scalable type, and tabular values', () => {
    const source = componentSource();

    expect(source).toContain('logicalRowDirection(direction)');
    expect(source).toContain("direction === 'rtl' ? 'flex-end' : 'flex-start'");
    expect(source).toContain('direction={direction}');
    expect(source).toContain('language={language}');
    expect(source).toContain('tabular');
    expect(source).toContain('brand');
  });

  it('provides 48dp controls, non-color feedback, and restrained reduced-motion press states', () => {
    const source = componentSource();

    expect(source).toContain('minHeight: layout.touchTarget');
    expect(source).toContain('{stateLabel}');
    expect(source).toContain('{item.statusLabel}');
    expect(source).toContain('{item.progressText}');
    expect(source).toMatch(
      /pressed[\s\S]*?reducedMotion[\s\S]*?styles\.pressedStatic[\s\S]*?styles\.pressedMotion/u,
    );
    expect(source).toContain('size="regular"');
    expect(source).toContain('r001Radii');
  });
});
