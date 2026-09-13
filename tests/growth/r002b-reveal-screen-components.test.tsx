import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../', import.meta.url));
const componentPath = `${root}src/components/r002b/RevealBundleScreen.tsx`;

function componentSource() {
  return existsSync(componentPath) ? readFileSync(componentPath, 'utf8') : '';
}

describe('R002b combined RevealBundle presentation', () => {
  it('exports a prop-driven consequence list and fixed-safe action region', () => {
    const source = componentSource();

    expect(existsSync(componentPath)).toBe(true);
    for (const contract of [
      'RevealActionPresentation',
      'RevealConsequencePresentation',
      'RevealBundleScreenProps',
      'RevealBundleActionBarProps',
    ]) {
      expect(source, contract).toContain(`export interface ${contract}`);
    }
    expect(source).toContain('export function RevealBundleScreen');
    expect(source).toContain('export function RevealBundleActionBar');
  });

  it('keeps routing, store, flags, translation, and reward authority outside the screen', () => {
    const source = componentSource();

    expect(source).toContain("from 'react-native'");
    expect(source).toContain("from '@/components/primitives'");
    expect(source).toContain("from '@/design/tokens'");
    expect(source).not.toMatch(
      /(?:expo-router|useRouter|usePrototypeStore|@\/state|@\/features|useTranslation|constructRevealBundle|acknowledgeRevealBundle|archiveRevealBundle|applyRecognition|awardBadge)/u,
    );
    expect(source).not.toMatch(
      /(?:WebView|document\.|localStorage|<div\b|className=|https?:\/\/)/u,
    );
  });

  it('renders all consequences in supplied canonical order and gives praise distinct hierarchy', () => {
    const source = componentSource();

    expect(source).toContain('items.map((item) =>');
    expect(source).toContain("item.kind === 'parent_praise'");
    expect(source).toContain('testID={`r002b-reveal-item-${item.kind}`}');
    expect(source).not.toMatch(/\.(?:sort|reverse|splice|push|pop|shift|unshift)\(/u);
  });

  it('supports conservative lifecycle and recovery states without forced celebration timing', () => {
    const source = componentSource();
    const stateContract = source.slice(
      source.indexOf('export type RevealContentState'),
      source.indexOf('export interface RevealActionPresentation'),
    );

    for (const state of [
      'ready',
      'presenting',
      'interrupted',
      'recovered',
      'offline',
      'error',
      'archived',
      'unavailable',
    ]) {
      expect(stateContract).toContain(`'${state}'`);
    }
    expect(source).not.toMatch(/(?:setTimeout|setInterval|Animated\.loop|autoPlay|autoplay)/u);
  });

  it('provides readable touch, live-state, image, heading, and progress semantics', () => {
    const source = componentSource();

    expect(source).toContain('accessibilityLiveRegion="polite"');
    expect(source).toContain('accessibilityRole="header"');
    expect(source).toContain('<LocalIllustration');
    expect(source).toContain('<PrimaryButton');
    expect(source).toContain('busy={primary.busy}');
    expect(source).toContain('disabled={primary.disabled}');
    expect(source).toContain('layout.touchTarget');
    expect(source).toContain('accessibilityLabel={illustrationLabel}');
    expect(source).toContain('accessibilityLabel={item.accessibilityLabel}');
    expect(source).toContain('statusPresentation[contentState]');
    expect(source).toContain("edges={['bottom']}");
  });

  it('focuses one accessible heading deterministically when the route requests initial focus', () => {
    const source = componentSource();

    expect(source).toContain("import { useCallback, useEffect, useRef } from 'react';");
    expect(source).toContain("from '@/utils/accessibilityFocus'");
    expect(source).toContain('readonly initialFocus?: boolean;');
    expect(source).toContain('focusAccessibilityTarget(initialFocusRef.current)');
    expect(source).toContain('focusInitialHeading();');
    expect(source).toContain('onLayout={focusInitialHeading}');
    expect(source).toMatch(
      /<View\s+accessible[\s\S]*?accessibilityRole="header"[\s\S]*?onLayout=\{focusInitialHeading\}[\s\S]*?ref=\{initialFocusRef\}/u,
    );
    expect(source).not.toContain('findNodeHandle');
    expect(source).not.toContain('AccessibilityInfo.setAccessibilityFocus');
  });

  it('uses state-specific status treatment and AA text colors for recovery surfaces', () => {
    const source = componentSource();

    expect(source).toMatch(/error:\s*\{[\s\S]*?iconName:\s*'info'/u);
    expect(source).toMatch(/offline:\s*\{[\s\S]*?iconName:\s*'info'/u);
    expect(source).toContain("valueColor: 'onErrorContainer'");
    expect(source).not.toContain("valueColor: 'coral'");
  });

  it('reflows across supported widths and large text without a fixed reference canvas', () => {
    const source = componentSource();
    const fixedReferenceCanvas =
      /\b(?:width|height|minWidth|minHeight|maxWidth|maxHeight)\s*:\s*(?:390|844)\b/u;
    const disabledScaling =
      /(?:allowFontScaling\s*=\s*\{false\}|adjustsFontSizeToFit|numberOfLines)/u;

    expect(source).toContain('useWindowDimensions');
    expect(source).toContain('width < 360');
    expect(source).toContain('width >= 600');
    expect(source).toContain('fontScale >= 1.5');
    expect(source).toMatch(/minWidth:\s*0/u);
    expect(source).toMatch(/width:\s*'100%'/u);
    expect(source).toMatch(/flexWrap:\s*'wrap'/u);
    expect(source).not.toMatch(fixedReferenceCanvas);
    expect(source).not.toMatch(disabledScaling);
  });

  it('uses branded bilingual type, logical layout, tabular values, and local natural artwork', () => {
    const source = componentSource();

    expect(source).toContain('logicalRowDirection(direction)');
    expect(source).toContain('direction={direction}');
    expect(source).toContain('language={language}');
    expect(source).toContain('tabular');
    expect(source).toContain('brand');
    expect(source).toContain('function RevealNaturalArtwork');
    expect(source).toContain('<LocalIllustration');
    expect(source).toContain('assetId="recognition-reveal"');
    expect(source).not.toMatch(/[\u0600-\u06ff]/u);
    expect(source).not.toMatch(/require\(/u);
  });
});
