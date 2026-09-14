import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../', import.meta.url));
const componentPath = `${root}src/components/r002b/SharedGrowthScreens.tsx`;

function componentSource() {
  return existsSync(componentPath) ? readFileSync(componentPath, 'utf8') : '';
}

describe('R002b Shared Growth presentation components', () => {
  it('exports the two approved presentation surfaces and typed contracts', () => {
    const source = componentSource();

    expect(existsSync(componentPath)).toBe(true);
    expect(source).toContain('export function SharedGrowthChildScreen');
    expect(source).toContain('export function ParentSharedGardenScreen');
    expect(source).toContain('export function SharedGrowthEntryCard');
    for (const contract of [
      'SharedGrowthActionPresentation',
      'SharedGrowthObservationPresentation',
      'SharedGrowthEntryCardProps',
      'SharedGrowthChildScreenProps',
      'ParentSharedGrowthActionPresentation',
      'ParentSharedGrowthConfirmationPresentation',
      'ParentSharedGardenScreenProps',
    ]) {
      expect(source, contract).toContain(`export interface ${contract}`);
    }
  });

  it('provides one reusable, bilingual, touch-sized entry card for Garden and Circle surfaces', () => {
    const source = componentSource();
    const entrySource = source.slice(
      source.indexOf('export function SharedGrowthEntryCard'),
      source.indexOf('export function SharedGrowthChildScreen'),
    );

    expect(entrySource).toContain('accessibilityRole="button"');
    expect(entrySource).toContain('accessibilityHint={body}');
    expect(entrySource).toContain(
      'accessibilityLabel={`${title}. ${statusLabel}. ${body}. ${actionLabel}`}',
    );
    expect(entrySource).toContain('direction={direction}');
    expect(entrySource).toContain('language={language}');
    expect(entrySource).toContain("direction={direction === 'rtl' ? 'ltr' : 'rtl'}");
    expect(source).toMatch(/entryCard:\s*\{[\s\S]*?minHeight:\s*layout\.touchTarget/u);
  });

  it('keeps routing, state, translations, domain mutation, and web runtime outside', () => {
    const source = componentSource();
    const forbidden =
      /(?:expo-router|useRouter|useLocalSearchParams|usePrototypeStore|@\/state|@\/features|@\/i18n|@\/models|useTranslation|applySharedGrowth|recordSharedGrowth|Date\(|new Date|performance\.now|WebView|document\.|window\.|localStorage|<div\b|className=)/u;

    expect(source).toContain("from 'react-native'");
    expect(source).toContain("from '@/components/primitives'");
    expect(source).toContain("from '@/design/tokens'");
    expect(source).not.toMatch(forbidden);
    expect(source).not.toMatch(/[\u0600-\u06ff]/u);
  });

  it('gives the Child no participation or mutation controls', () => {
    const source = componentSource();
    const childSource = source.slice(
      source.indexOf('export function SharedGrowthChildScreen'),
      source.indexOf('export function ParentSharedGardenScreen'),
    );

    expect(childSource).toContain('observations={observations}');
    expect(childSource).not.toContain('backAction={backAction}');
    expect(childSource).not.toContain('accessibilityLabel={`${groupLabel}. ${title}`}');
    expect(childSource).not.toMatch(
      /participationActions|contributionEnabled|pause_new_contributions|end_participation|onParticipation|onAction/u,
    );
  });

  it('renders only qualitative text equivalents and an explicit privacy/synthetic explanation', () => {
    const source = componentSource();

    expect(source).toContain('{observation.themeLabel}');
    expect(source).toContain('{observation.outlookLabel}');
    expect(source).toContain('{privacyHeading}');
    expect(source).toContain('{privacyBody}');
    expect(source).toContain('{syntheticLabel}');
    expect(source).toContain('{viewOnlyHeading}');
    expect(source).toContain('{viewOnlyBody}');
    expect(source).not.toMatch(/(?:percent|participantCount|rank|seedTotal|badgeTotal|taskTitle)/u);
  });

  it('distinguishes Parent current status, bounded actions, future effects, and read-only mode', () => {
    const source = componentSource();
    const parentSource = source.slice(source.indexOf('export function ParentSharedGardenScreen'));

    expect(parentSource).toContain('{currentStatusLabel}');
    expect(parentSource).toContain('{currentStatusDescription}');
    expect(parentSource).toContain('{futureOnlyHeading}');
    expect(parentSource).toContain('{futureOnlyBody}');
    expect(parentSource).toContain('{noEffectHeading}');
    expect(parentSource).toContain('{noEffectBody}');
    expect(parentSource).toContain('participationActions.map((action) =>');
    expect(parentSource).toContain('contributionEnabled ?');
    expect(parentSource).toContain('{readOnlyHeading}');
    expect(parentSource).toContain('{readOnlyBody}');
    expect(parentSource).toContain('{freshConsentMessage}');
    expect(parentSource).toContain('{existingConsentMessage}');
    expect(parentSource).toContain('<ParentParticipationConfirmation');
  });

  it('uses a native modal confirmation with focus entry, trapping, close, and restoration hooks', () => {
    const source = componentSource();

    expect(source).toContain('<Modal');
    expect(source).toContain('accessibilityViewIsModal');
    expect(source).toContain('onShow={focusHeading}');
    expect(source).toContain('focusAccessibilityTarget');
    expect(source).toContain('onRequestClose={requestCancel}');
    expect(source).toContain('InteractionManager.runAfterInteractions');
    expect(source).toContain('requestAnimationFrame');
    expect(source).toContain('dismissed.onRequestFocusRestore(targetTestID)');
    expect(source.match(/focusAccessibilityTarget\(/gu)).toHaveLength(3);
    expect(source).not.toContain('findNodeHandle');
    expect(source).toContain('actionRefs.current[targetTestID] ?? statusRef.current');
    expect(source).toContain('confirmation.confirmAction.onPress()');
    expect(source).toContain('confirmation.cancelAction.onPress()');
  });

  it('exposes semantic headings, status, observations, actions, and live recovery copy', () => {
    const source = componentSource();

    expect(source).toContain('accessibilityRole="header"');
    expect(source).toContain('accessibilityRole="summary"');
    expect(source).toContain('accessibilityRole="list"');
    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain('accessibilityState={{ busy, disabled }}');
    expect(source).toContain('accessibilityHint={action.description}');
    expect(source).toContain('accessibilityLiveRegion="polite"');
    expect(source).toContain('<LocalIllustration');
    expect(source).toContain('aria-hidden');
  });

  it('renders the failed-save recovery as one accessible touch-sized presentation action', () => {
    const source = componentSource();
    const recoverySource = source.slice(
      source.indexOf('function SharedGrowthRecoveryAction'),
      source.indexOf('function SharedGrowthStatus'),
    );

    expect(source).toContain('recoveryAction?: SharedGrowthActionPresentation');
    expect(source).toContain('{recoveryAction ? (');
    expect(recoverySource).toContain('accessibilityLabel={action.accessibilityLabel}');
    expect(recoverySource).toContain('accessibilityRole="button"');
    expect(recoverySource).toContain('accessibilityState={{ busy, disabled }}');
    expect(recoverySource).toContain('onPress={action.onPress}');
    expect(recoverySource).toContain('testID={action.testID}');
    expect(source).toMatch(/recoveryAction:\s*\{[\s\S]*?minHeight:\s*layout\.touchTarget/u);
  });

  it('reflows at compact, wide, and 200-percent-text breakpoints without a fixed canvas', () => {
    const source = componentSource();

    expect(source).toContain('useWindowDimensions');
    expect(source).toContain('onLayout={onLayout}');
    expect(source).toContain('event.nativeEvent.layout.width');
    expect(source).toContain('availableWidth < 360');
    expect(source).toContain('availableWidth >= 600');
    expect(source).toContain('Math.min(windowWidth, layout.compactContentWidth)');
    expect(source).toContain('fontScale >= 1.5');
    expect(source).toContain('layout.touchTarget');
    expect(source.match(/style=\{styles\.shrinkCopy\}/gu)?.length).toBeGreaterThanOrEqual(3);
    expect(source).toMatch(/maxWidth:\s*'100%'/u);
    expect(source).toMatch(/flexShrink:\s*1/u);
    expect(source).toMatch(/minWidth:\s*0/u);
    expect(source).toMatch(/width:\s*'100%'/u);
    expect(source).toMatch(/flexWrap:\s*'wrap'/u);
    expect(source).toMatch(/expandedCell:\s*\{[\s\S]*?width:\s*'auto'[\s\S]*?flex:\s*1/u);
    expect(source).not.toMatch(
      /\b(?:width|height|minWidth|minHeight|maxWidth|maxHeight)\s*:\s*(?:390|844)\b/u,
    );
    expect(source).not.toMatch(/(?:allowFontScaling\s*=\s*\{false\}|numberOfLines)/u);
  });

  it('places Arabic return controls physically right and preserves logical rows', () => {
    const source = componentSource();

    expect(source).toContain('logicalRowDirection(direction)');
    expect(source).toContain("alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start'");
    expect(source).not.toContain('accessibilityLabel={`${groupLabel}. ${title}`}');
    expect(source).toContain('direction={direction}');
    expect(source).toContain('language={language}');
  });

  it('uses restrained reduced-motion press feedback and readable disabled actions', () => {
    const source = componentSource();

    expect(source).toContain('<BotanicalPressable');
    expect(source).toContain('reducedMotion={reducedMotion}');
    expect(source).not.toContain('styles.pressedMotion');
    expect(source).not.toMatch(/(?:useEffect|setTimeout|Animated\.loop|autoPlay|autoplay)/u);
    expect(source).not.toContain('opacity: opacity.disabled');
    expect(source).toContain("borderStyle: 'dashed'");
    expect(source.match(/<ActivityIndicator/gu)?.length).toBeGreaterThanOrEqual(3);
  });

  it('uses static local coastal artwork with a textual missing-art fallback', () => {
    const source = componentSource();

    expect(source).toContain('function SharedCoastalArtwork');
    expect(source).toContain('<LocalIllustration');
    expect(source).toContain('assetId="shared-coastal-canopy"');
    expect(source).toContain('artUnavailableText: string');
    expect(source).toContain("const artIsUnavailable = contentState === 'art_unavailable'");
    expect(source).toContain('artIsUnavailable ?');
    expect(source).not.toContain('artUnavailable ?');
    expect(source).not.toMatch(/(?:require\(|https?:\/\/)/u);
  });

  it('stays a presentation body for one route-owned safe-area and scrolling shell', () => {
    const source = componentSource();

    expect(source).not.toMatch(
      /(?:SafeAreaView|R002aScreen|R002bNestedScreen|KeyboardAvoidingView)/u,
    );
    expect(source.match(/<ScrollView/gu)).toHaveLength(1);
    expect(source).toContain('contentContainerStyle={styles.confirmationContent}');
  });
});
