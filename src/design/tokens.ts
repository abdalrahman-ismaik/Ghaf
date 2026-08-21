import { Platform } from 'react-native';

export const colors = {
  ghaf: '#2F6D4F',
  ghafPressed: '#245A40',
  forest: '#173D2C',
  forestSoft: '#2D5945',
  leaf: '#78A86F',
  leafLight: '#DDEDDD',
  sand: '#E8D1A6',
  sandLight: '#F4E7CF',
  ivory: '#FBF8F1',
  surface: '#FFFFFF',
  earth: '#624938',
  gold: '#C6973E',
  goldLight: '#F4E6C5',
  ink: '#1D2A24',
  inkMuted: '#66716A',
  line: '#DDE3DC',
  white: '#FFFFFF',
  danger: '#A3443F',
  dangerLight: '#F8E4E2',
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
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
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
    label: 14,
    body: 16,
    heading: 22,
    title: 30,
    display: 44,
  },
  lineHeights: {
    caption: 18,
    label: 20,
    body: 25,
    heading: 30,
    title: 38,
    display: 52,
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
    boxShadow: '0 8px 28px rgba(41, 69, 54, 0.09)',
  },
  lifted: {
    boxShadow: '0 14px 36px rgba(40, 65, 51, 0.14)',
  },
} as const;

export const motion = {
  duration: {
    quick: 160,
    standard: 260,
    slow: 520,
  },
} as const;

export const layout = {
  maxContentWidth: 680,
  touchTarget: 48,
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
