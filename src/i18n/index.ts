import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getLocaleDirection, type LocaleCode, type LocalizedText } from '@/models/prototype';

import { resources } from './resources';

const i18n = createInstance();

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    initAsync: false,
  });
}

interface WebDocumentLocaleTarget {
  dir: string;
  lang: string;
}

// Match the web document language and direction to the current app locale.
export function synchronizeWebDocumentLocale(
  locale: LocaleCode,
  target: WebDocumentLocaleTarget | null = typeof document === 'undefined'
    ? null
    : document.documentElement,
): void {
  if (!target) return;
  target.lang = locale;
  target.dir = getLocaleDirection(locale);
}

export function localize(value: LocalizedText, locale: LocaleCode): string {
  return value[locale] || value.ar || value.en;
}

// Build stored Arabic and English fixture text from the shared translation resources.
export function bilingualResource(key: string): LocalizedText {
  return {
    ar: String(i18n.getFixedT('ar')(key)),
    en: String(i18n.getFixedT('en')(key)),
  };
}

export async function setI18nLocale(locale: LocaleCode): Promise<void> {
  if (i18n.resolvedLanguage !== locale) {
    await i18n.changeLanguage(locale);
  }
}

export { i18n, resources };
