import { Platform } from 'react-native';

export const colors = {
  ghaf: '#1D684F',
  ghafPressed: '#14513E',
  forest: '#12372D',
  forestSoft: '#35594D',
  leaf: '#718E6A',
  leafLight: '#DCE5D7',
  leafMist: '#EDF1E8',
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
  inkMuted: '#606B65',
  line: '#CBCDC2',
  white: '#FFFFFF',
  success: '#317655',
  successLight: '#DDEBE1',
  danger: '#963E36',
  dangerLight: '#F1DEDA',
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

export const typography = {
  family: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  sizes: {
    caption: 12,
    label: 13,
    body: 16,
    heading: 21,
    title: 32,
    display: 46,
  },
  lineHeights: {
    caption: 18,
    label: 19,
    body: 25,
    heading: 29,
    title: 39,
    display: 53,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
} as const;

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
    quick: 160,
    standard: 260,
    slow: 520,
    reveal: 760,
  },
} as const;

export const layout = {
  maxContentWidth: 720,
  touchTarget: 48,
  compactContentWidth: 520,
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
