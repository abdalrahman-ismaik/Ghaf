import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));
const componentPath = `${root}src/components/r002b/LearningScreens.tsx`;

function componentSource() {
  return existsSync(componentPath) ? readFileSync(componentPath, 'utf8') : '';
}

describe('R002b equal-credit Learning presentation components', () => {
  it('exports one shared presentation contract and both approved route surfaces', () => {
    const source = componentSource();

    expect(existsSync(componentPath)).toBe(true);
    for (const contract of [
      'LearningActionPresentation',
      'LearningProgressPresentation',
      'LearningSectionPresentation',
      'LearningCheckOptionPresentation',
      'LearningCheckPresentation',
      'LearningScreenPresentationProps',
      'MangroveStoryScreenProps',
      'AccessibleLearningScreenProps',
    ]) {
      expect(source, contract).toContain(`export interface ${contract}`);
    }
    expect(source).toContain('export function MangroveStoryScreen');
    expect(source).toContain('export function AccessibleLearningScreen');
  });

  it('keeps routing, flags, stores, translations, domain engines, and reward authority outside', () => {
    const source = componentSource();
    const forbiddenBoundary =
      /(?:expo-router|useRouter|useLocalSearchParams|usePrototypeStore|@\/state|@\/features|@\/i18n|@\/models|useTranslation|r002b_[a-z_]+|learning\.mangrove|task_recycling_p0_v1|badge\.(?:journey|skill|habitat)|(?:seed|gardenGrowth|canopy|league|challengeLeaf|familyReward)(?:Delta|Ids?)|(?:award|grant|commit|complete)Learning\s*\()/u;
    const webRuntime =
      /(?:WebView|document\.|window\.|localStorage|<div\b|className=|\.html["'`])/u;

    expect(source).toContain("from 'react-native'");
    expect(source).toContain("from '@/components/primitives'");
    expect(source).toContain("from '@/design/tokens'");
    expect(source).not.toMatch(forbiddenBoundary);
    expect(source).not.toMatch(webRuntime);
  });

  it('accepts live copy, status, progress, equivalence, disclosure, and actions through props', () => {
    const source = componentSource();

    for (const field of [
      "direction: 'ltr' | 'rtl'",
      "language: 'ar' | 'en'",
      'reducedMotion: boolean',
      'title: string',
      'modeLabel: string',
      'packageIdentityText: string',
      'equivalenceText: string',
      'objectiveText: string',
      'statusLabel: string',
      'disclosureText: string',
      'sourceHeading: string',
      'sourceText: string',
      'accessibilityLabel: string',
      'onPress: () => void',
    ]) {
      expect(source, field).toContain(field);
    }

    expect(source).not.toMatch(/[\u0600-\u06ff]/u);
    expect(source).not.toContain('EN:S');
  });

  it('models usable local states without inventing a business outcome', () => {
    const source = componentSource();
    const stateContract = source.slice(
      source.indexOf('export type LearningContentState'),
      source.indexOf('export interface LearningActionPresentation'),
    );

    for (const state of [
      'loading',
      'ready',
      'offline',
      'interrupted',
      'resumed',
      'error',
      'submitting',
      'completed',
      'already_completed',
      'locked',
      'stories_disabled',
      'unavailable',
    ]) {
      expect(stateContract, state).toContain(`'${state}'`);
    }
  });

  it('keeps the accessible route usable when illustrated stories are disabled', () => {
    const source = componentSource();
    const accessibleSource = source.slice(
      source.indexOf('export function AccessibleLearningScreen'),
      source.indexOf('function LearningScreenFrame'),
    );

    expect(accessibleSource).toContain('contentAvailableWhenStoriesDisabled');
    expect(source).toContain(
      "contentState !== 'stories_disabled' || contentAvailableWhenStoriesDisabled",
    );
  });

  it('presents finite progress and the same no-fail check in both modes', () => {
    const source = componentSource();

    expect(source).toContain('progress: LearningProgressPresentation');
    expect(source).toContain('sections: readonly LearningSectionPresentation[]');
    expect(source).toContain('check?: LearningCheckPresentation');
    expect(source).toContain('modeSwitchAction: LearningActionPresentation');
    expect(source).toContain('primaryAction?: LearningActionPresentation');
    expect(source).toContain('accessibilityRole="progressbar"');
    expect(source).toContain('accessibilityValue={{');
    expect(source).toContain('options.map((option) =>');
    expect(source).toContain('sections.map((section) =>');
    expect(source).not.toMatch(/\.(?:sort|reverse|splice|push|pop|shift|unshift)\(/u);
  });

  it('makes route equivalence, zero-reward disclosure, and source review visible', () => {
    const source = componentSource();

    expect(source).toContain('{packageIdentityText}');
    expect(source).toContain('{title}');
    expect(source).toContain('{equivalenceText}');
    expect(source).toContain('{disclosureText}');
    expect(source).toContain('{sourceHeading}');
    expect(source).toContain('{sourceText}');
    expect(source).toContain('modeSwitchAction={modeSwitchAction}');
    expect(source).not.toMatch(/(?:\+\s*\d+\s*(?:Seeds|seeds)|rewardAmount|seedAmount)/u);
  });

  it('provides semantic headings, progress, options, state, and live recovery feedback', () => {
    const source = componentSource();

    expect(source).toContain('accessibilityRole="header"');
    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain('accessibilityRole="radio"');
    expect(source).toContain('accessibilityState={{ checked: selected, disabled }}');
    expect(source).toContain('accessibilityLabel={check.accessibilityLabel}');
    expect(source).toContain('accessibilityState={{ busy: contentState ===');
    expect(source).toContain('accessibilityLiveRegion="polite"');
    expect(source).toContain('accessibilityLabel={illustrationAccessibilityLabel}');
    expect(source).toContain('<LocalIllustration');
    expect(source).toContain('aria-hidden');
  });

  it('reflows from compact phones to wide windows and large text without a fixed canvas', () => {
    const source = componentSource();
    const fixedReferenceCanvas =
      /\b(?:width|height|minWidth|minHeight|maxWidth|maxHeight)\s*:\s*(?:390|844)\b/u;
    const disabledScaling =
      /(?:allowFontScaling\s*=\s*\{false\}|adjustsFontSizeToFit|numberOfLines)/u;

    expect(source).toContain('useWindowDimensions');
    expect(source).toContain('width < 360');
    expect(source).toContain('width >= 600');
    expect(source).toContain('fontScale >= 1.5');
    expect(source).toContain('layout.touchTarget');
    expect(source).toMatch(/minWidth:\s*0/u);
    expect(source).toMatch(/width:\s*'100%'/u);
    expect(source).toMatch(/flexWrap:\s*'wrap'/u);
    expect(source).toContain("contextColumnExpanded: {\n    width: 'auto'");
    expect(source).not.toMatch(fixedReferenceCanvas);
    expect(source).not.toMatch(disabledScaling);
  });

  it('uses logical direction, branded scalable type, and restrained reduced-motion feedback', () => {
    const source = componentSource();

    expect(source).toContain('logicalRowDirection(direction)');
    expect(source).toContain('direction={direction}');
    expect(source).toContain('language={language}');
    expect(source).toContain("direction === 'rtl' ? 'flex-end' : 'flex-start'");
    expect(source).toContain('accessibilityLabel={groupLabel}');
    expect(source).toContain('accessibilityLabel={accessibilityLabel}');
    expect(source).toContain('brand');
    expect(source).toMatch(
      /pressed\s*\?\s*\(?\s*reducedMotion\s*\?\s*styles\.pressedStatic\s*:\s*styles\.pressedMotion/u,
    );
    expect(source).not.toMatch(/(?:useEffect|setTimeout|autoPlay|autoplay|Animated\.loop)/u);
    expect(source).not.toContain('opacity: opacity.disabled');
  });

  it('keeps story art local and provenanced while the accessible route stays independent', () => {
    const source = componentSource();
    const accessibleSource = source.slice(
      source.indexOf('export function AccessibleLearningScreen'),
      source.indexOf('function LearningScreenFrame'),
    );

    expect(source).toContain('function MangroveHabitatArtwork');
    expect(source).toContain('<LocalIllustration');
    expect(source).toContain('assetId="mangrove-habitat"');
    expect(source).toContain('illustrationUnavailableText?: string');
    expect(accessibleSource).not.toContain('<MangroveHabitatArtwork');
    expect(source).not.toMatch(/(?:require\(|https?:\/\/)/u);
  });
});
