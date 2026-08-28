import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { LocaleCode, LocalizedText, TextDirection } from '@/models/prototype';

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

export function getDirection(locale: LocaleCode): TextDirection {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function isRtlLocale(locale: LocaleCode): boolean {
  return getDirection(locale) === 'rtl';
}

interface WebDocumentLocaleTarget {
  dir: string;
  lang: string;
}

/** Keep browser language semantics aligned with the in-app locale and logical layout. */
export function synchronizeWebDocumentLocale(
  locale: LocaleCode,
  target: WebDocumentLocaleTarget | null = typeof document === 'undefined'
    ? null
    : document.documentElement,
): void {
  if (!target) return;
  target.lang = locale;
  target.dir = getDirection(locale);
}

export function localize(value: LocalizedText, locale: LocaleCode): string {
  return value[locale] || value.ar || value.en;
}

/** Build persisted bilingual fixture text from the single i18n source of truth. */
export function bilingualResource(key: string): LocalizedText {
  return {
    ar: String(i18n.getFixedT('ar')(key)),
    en: String(i18n.getFixedT('en')(key)),
  };
}

/**
 * Screen content mirrors immediately through logical styles. Native navigation
 * chrome may require an app restart after forceRTL changes.
 */
export async function configureNativeDirection(locale: LocaleCode): Promise<boolean> {
  const { I18nManager } = await import('react-native');
  const shouldUseRtl = isRtlLocale(locale);
  const restartRecommended = I18nManager.isRTL !== shouldUseRtl;

  if (typeof I18nManager.allowRTL === 'function') {
    I18nManager.allowRTL(true);
  }

  if (typeof I18nManager.swapLeftAndRightInRTL === 'function') {
    I18nManager.swapLeftAndRightInRTL(true);
  }

  if (restartRecommended && typeof I18nManager.forceRTL === 'function') {
    I18nManager.forceRTL(shouldUseRtl);
  }

  return restartRecommended;
}

export async function setI18nLocale(locale: LocaleCode): Promise<void> {
  if (i18n.resolvedLanguage !== locale) {
    await i18n.changeLanguage(locale);
  }
}

export { i18n, resources };
