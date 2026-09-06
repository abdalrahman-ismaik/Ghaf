import { Platform } from 'react-native';

export const colors = {
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
  surface: '#FBFAF5',
  earth: '#6F513D',
  gold: '#B87524',
  goldLight: '#E7D2A5',
  goldGlow: '#F3E8D1',
  sky: '#D6E2DE',
  ink: '#172621',
  inkMuted: '#5B665F',
  line: '#CBCDC2',
  white: '#FFFFFF',
  success: '#317655',
  successLight: '#DDEBE1',
  danger: '#963E36',
  dangerLight: '#F1DEDA',
  coral: '#A94A3F',
  coralLight: '#F1DEDA',
  transparent: 'transparent',
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
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
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

export type TypographyLanguage = keyof typeof typography.families;
export type TypographyRole = keyof typeof typography.roles;

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

export const shadows = {
  soft: {
    boxShadow: '0 2px 10px rgba(24, 49, 39, 0.06)',
  },
  lifted: {
    boxShadow: '0 16px 40px rgba(24, 49, 39, 0.14)',
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

export const layout = {
  maxContentWidth: 720,
  touchTarget: 48,
  compactContentWidth: 520,
  screenPadding: 20,
} as const;

export const tokens = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
  motion,
  layout,
} as const;

export type AppColor = keyof typeof colors;
