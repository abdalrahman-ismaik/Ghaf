import { Platform } from 'react-native';

// R001 semantic names are additive. Legacy keys remain byte-for-byte compatible so the preserved
// ten-route surfaces are not restyled before their own approved design release.
export const colors = {
  surface: '#FBFAF5',
  surfaceDim: '#D9DAD6',
  surfaceBright: '#F9FAF5',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F3F4EF',
  surfaceContainer: '#EDEEE9',
  surfaceContainerHigh: '#E7E9E4',
  surfaceContainerHighest: '#E2E3DE',
  onSurface: '#1A1C19',
  onSurfaceVariant: '#3F4944',
  inverseSurface: '#2E312E',
  inverseOnSurface: '#F0F1EC',
  outline: '#6F7973',
  outlineVariant: '#BEC9C2',
  surfaceTint: '#146B51',
  primary: '#00503B',
  onPrimary: '#FFFFFF',
  primaryContainer: '#126A50',
  onPrimaryContainer: '#98E7C6',
  inversePrimary: '#87D6B6',
  primaryFixed: '#A3F3D1',
  primaryFixedDim: '#87D6B6',
  onPrimaryFixed: '#002116',
  onPrimaryFixedVariant: '#00513C',
  secondary: '#006A64',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#8EF1E7',
  onSecondaryContainer: '#006F68',
  secondaryFixed: '#91F3E9',
  secondaryFixedDim: '#74D7CD',
  onSecondaryFixed: '#00201E',
  onSecondaryFixedVariant: '#00504B',
  tertiary: '#5E4100',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#7C5700',
  onTertiaryContainer: '#FFD182',
  tertiaryFixed: '#FFDEAA',
  tertiaryFixedDim: '#F7BD4F',
  onTertiaryFixed: '#271900',
  onTertiaryFixedVariant: '#5F4100',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  ghafEmerald: '#126A50',
  ghafEmeraldTint: 'rgba(18, 106, 80, 0.10)',
  deepForest: '#0D3128',
  mangroveTeal: '#188B83',
  solarAmber: '#F2B84B',
  pearlGround: '#F7F8F3',
  r001Surface: '#F9FAF5',
  r001Ink: '#14221D',
  ink: '#172621',
  white: '#FFFFFF',
  transparent: 'transparent',

  // Compatibility aliases used by the preserved ten-route implementation.
  ghaf: '#1D684F',
  ghafPressed: '#14513E',
  forest: '#12372D',
  forestSoft: '#35594D',
  leaf: '#718E6A',
  leafLight: '#DCE5D7',
  leafMist: '#EDF1E8',
  mangrove: '#246B64',
  water: '#77A8A1',
  waterLight: '#D9E9E5',
  sand: '#CBB98F',
  sandLight: '#E9E0CC',
  ivory: '#F3F0E7',
  earth: '#6F513D',
  gold: '#B87524',
  goldLight: '#E7D2A5',
  goldGlow: '#F3E8D1',
  sky: '#D6E2DE',
  inkMuted: '#5B665F',
  line: '#CBCDC2',
  success: '#317655',
  successLight: '#DDEBE1',
  danger: '#963E36',
  dangerLight: '#F1DEDA',
  coral: '#A94A3F',
  coralLight: '#F1DEDA',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
  massive: 64,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
} as const;

export const r001Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  sheet: 28,
  pill: 999,
} as const;

const systemFontFamilies = {
  ar:
    Platform.select({
      ios: 'System',
      android: 'sans-serif',
      web: 'system-ui',
      default: 'System',
    }) ?? 'System',
  en:
    Platform.select({
      ios: 'System',
      android: 'sans-serif',
      web: 'system-ui',
      default: 'System',
    }) ?? 'System',
} as const;

// These names match the exports from @expo-google-fonts/alexandria and
// @expo-google-fonts/readex-pro. Screens use the fallback family until the root loader confirms
// that the local font files are ready.
export const fontFamilies = {
  fallback: systemFontFamilies,
  runtime: {
    alexandriaRegular: 'Alexandria_400Regular',
    alexandriaBold: 'Alexandria_700Bold',
    alexandriaExtraBold: 'Alexandria_800ExtraBold',
    readexRegular: 'ReadexPro_400Regular',
    readexMedium: 'ReadexPro_500Medium',
    readexSemiBold: 'ReadexPro_600SemiBold',
    readexBold: 'ReadexPro_700Bold',
  },
} as const;

// The preserved Feature 003 typography remains stable for every existing consumer.
export const typography = {
  families: systemFontFamilies,
  roles: {
    display: {
      fontSize: 42,
      fontWeight: '800',
      ar: { lineHeight: 58, letterSpacing: 0 },
      en: { lineHeight: 51, letterSpacing: -0.8 },
    },
    title: {
      fontSize: 30,
      fontWeight: '700',
      ar: { lineHeight: 43, letterSpacing: 0 },
      en: { lineHeight: 39, letterSpacing: -0.4 },
    },
    heading: {
      fontSize: 21,
      fontWeight: '700',
      ar: { lineHeight: 34, letterSpacing: 0 },
      en: { lineHeight: 30, letterSpacing: 0 },
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      ar: { lineHeight: 28, letterSpacing: 0 },
      en: { lineHeight: 26, letterSpacing: 0 },
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      ar: { lineHeight: 23, letterSpacing: 0 },
      en: { lineHeight: 21, letterSpacing: 0 },
    },
    caption: {
      fontSize: 12,
      fontWeight: '500',
      ar: { lineHeight: 20, letterSpacing: 0 },
      en: { lineHeight: 19, letterSpacing: 0 },
    },
  },
} as const;

type R001FontFamily = 'alexandria' | 'readexPro';
type R001FontWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';

interface R001RoleDefinition {
  family: R001FontFamily;
  fontSize: number;
  weight: R001FontWeight;
  ar: { lineHeight: number; letterSpacing: number };
  en: { lineHeight: number; letterSpacing: number };
}

// R001 introduces branded roles without changing the six-role remote contract above.
export const r001Typography = {
  roles: {
    display: {
      family: 'alexandria',
      fontSize: 48,
      weight: 'heavy',
      ar: { lineHeight: 60, letterSpacing: 0 },
      en: { lineHeight: 58, letterSpacing: -0.6 },
    },
    wordmark: {
      family: 'alexandria',
      fontSize: 36,
      weight: 'heavy',
      ar: { lineHeight: 46, letterSpacing: 0 },
      en: { lineHeight: 44, letterSpacing: -0.4 },
    },
    hero: {
      family: 'alexandria',
      fontSize: 32,
      weight: 'bold',
      ar: { lineHeight: 44, letterSpacing: 0 },
      en: { lineHeight: 42, letterSpacing: -0.3 },
    },
    parentHero: {
      family: 'alexandria',
      fontSize: 30,
      weight: 'bold',
      ar: { lineHeight: 44, letterSpacing: 0 },
      en: { lineHeight: 42, letterSpacing: -0.2 },
    },
    screenTitle: {
      family: 'alexandria',
      fontSize: 24,
      weight: 'bold',
      ar: { lineHeight: 36, letterSpacing: 0 },
      en: { lineHeight: 34, letterSpacing: 0 },
    },
    bodyLarge: {
      family: 'readexPro',
      fontSize: 18,
      weight: 'regular',
      ar: { lineHeight: 31, letterSpacing: 0 },
      en: { lineHeight: 30, letterSpacing: 0 },
    },
    body: {
      family: 'readexPro',
      fontSize: 16,
      weight: 'regular',
      ar: { lineHeight: 26, letterSpacing: 0 },
      en: { lineHeight: 26, letterSpacing: 0 },
    },
    compactBody: {
      family: 'readexPro',
      fontSize: 16,
      weight: 'regular',
      ar: { lineHeight: 27, letterSpacing: 0 },
      en: { lineHeight: 26, letterSpacing: 0 },
    },
    control: {
      family: 'readexPro',
      fontSize: 16,
      weight: 'medium',
      ar: { lineHeight: 26, letterSpacing: 0 },
      en: { lineHeight: 24, letterSpacing: 0 },
    },
    label: {
      family: 'readexPro',
      fontSize: 14,
      weight: 'medium',
      ar: { lineHeight: 24, letterSpacing: 0 },
      en: { lineHeight: 22, letterSpacing: 0 },
    },
    caption: {
      family: 'readexPro',
      fontSize: 12,
      weight: 'regular',
      ar: { lineHeight: 20, letterSpacing: 0 },
      en: { lineHeight: 18, letterSpacing: 0 },
    },
  } satisfies Record<string, R001RoleDefinition>,
} as const;

export type TypographyLanguage = keyof typeof typography.families;
export type TypographyRole = keyof typeof typography.roles;
export type R001TypographyRole = keyof typeof r001Typography.roles;
export type LayoutDirection = 'ltr' | 'rtl';

const runtimeFamilyByRole = {
  alexandria: {
    regular: fontFamilies.runtime.alexandriaRegular,
    medium: fontFamilies.runtime.alexandriaBold,
    semibold: fontFamilies.runtime.alexandriaBold,
    bold: fontFamilies.runtime.alexandriaBold,
    heavy: fontFamilies.runtime.alexandriaExtraBold,
  },
  readexPro: {
    regular: fontFamilies.runtime.readexRegular,
    medium: fontFamilies.runtime.readexMedium,
    semibold: fontFamilies.runtime.readexSemiBold,
    bold: fontFamilies.runtime.readexBold,
    heavy: fontFamilies.runtime.readexBold,
  },
} as const;

const fontWeightByRole = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

export function resolveTypographyRole(role: TypographyRole, language: TypographyLanguage) {
  const roleToken = typography.roles[role];
  const scriptToken = roleToken[language];
  return {
    fontFamily: typography.families[language],
    fontSize: roleToken.fontSize,
    fontWeight: roleToken.fontWeight,
    lineHeight: scriptToken.lineHeight,
    letterSpacing: scriptToken.letterSpacing,
  } as const;
}

export function resolveR001TypographyRole(
  role: R001TypographyRole,
  language: TypographyLanguage,
  fontsLoaded = false,
) {
  const roleToken = r001Typography.roles[role];
  const scriptToken = roleToken[language];
  const fontFamily = fontsLoaded
    ? runtimeFamilyByRole[roleToken.family][roleToken.weight]
    : fontFamilies.fallback[language];

  return {
    fontFamily,
    fontSize: roleToken.fontSize,
    fontWeight: fontsLoaded ? undefined : fontWeightByRole[roleToken.weight],
    lineHeight: scriptToken.lineHeight,
    letterSpacing: scriptToken.letterSpacing,
  } as const;
}

export function logicalRowDirection(direction: LayoutDirection, reverse = false) {
  const rtl = direction === 'rtl';
  return rtl !== reverse ? ('row-reverse' as const) : ('row' as const);
}

export function logicalTextAlign(align: 'start' | 'center' | 'end', direction: LayoutDirection) {
  if (align === 'center') return 'center' as const;
  if (align === 'start') return direction === 'rtl' ? ('right' as const) : ('left' as const);
  return direction === 'rtl' ? ('left' as const) : ('right' as const);
}

export function isolateBidiText(value: string, direction: LayoutDirection) {
  return `${direction === 'rtl' ? '\u2067' : '\u2066'}${value}\u2069`;
}

export const shadows = {
  soft: {
    boxShadow: '0 2px 10px rgba(24, 49, 39, 0.06)',
  },
  lifted: {
    boxShadow: '0 16px 40px rgba(24, 49, 39, 0.14)',
  },
} as const;

export const r001Shadows = {
  soft: {
    boxShadow: '0 2px 10px rgba(20, 34, 29, 0.06)',
  },
  lifted: {
    boxShadow: '0 16px 40px rgba(20, 34, 29, 0.12)',
  },
  sheet: {
    boxShadow: '0 -8px 30px rgba(20, 34, 29, 0.08)',
  },
} as const;

export const motion = {
  duration: {
    quick: 120,
    standard: 220,
    slow: 220,
    reveal: 650,
    growth: 650,
  },
  easing: [0.2, 0.8, 0.2, 1] as const,
} as const;

export const r001Motion = {
  duration: {
    quick: 120,
    standard: 220,
    slow: 280,
    reveal: 420,
  },
  easing: [0.2, 0.8, 0.2, 1] as const,
  sheetEasing: [0.32, 0.72, 0, 1] as const,
} as const;

export const layout = {
  maxContentWidth: 720,
  accessContentWidth: 600,
  compactContentWidth: 520,
  readableContentWidth: 440,
  touchTarget: 48,
  controlHeight: 56,
  screenPadding: 20,
  desktopPadding: 64,
} as const;

export const opacity = {
  disabled: 0.48,
  pressed: 0.78,
  subtle: 0.62,
  scrim: 0.46,
} as const;

export const tokens = {
  colors,
  fontFamilies,
  layout,
  motion,
  opacity,
  radii,
  r001Motion,
  r001Radii,
  r001Shadows,
  r001Typography,
  shadows,
  spacing,
  typography,
} as const;

export type AppColor = keyof typeof colors;
