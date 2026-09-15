import { botanical, colors } from './tokens';

// These colors belong to the card artwork; application controls retain the botanical theme.
export const masroofiCardPalette = {
  pearl: '#FFFCF7',
  sand: '#EBDDC3',
  ink: '#302C26',
  mutedInk: '#6B5A45',
  engraving: '#927544',
  wovenRed: '#AA3038',
  wovenDeep: '#76282F',
  wovenInk: '#30292A',
  wovenIvory: '#F4E7CF',
  gold: botanical.colors.amber,
  goldLight: botanical.colors.amberWash,
  goldShadow: colors.earth,
  flagRed: '#EF3340',
  flagGreen: '#009739',
  flagWhite: '#FFFFFF',
  flagBlack: '#000000',
} as const;
