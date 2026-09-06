import type { LocaleCode, TextDirection } from './familyGrowth';

export type { LocaleCode, LocalizedText, TextDirection } from './familyGrowth';

export function coerceLocale(value: unknown): LocaleCode {
  return value === 'en' ? 'en' : 'ar';
}

export function getLocaleDirection(value: unknown): TextDirection {
  return coerceLocale(value) === 'ar' ? 'rtl' : 'ltr';
}
