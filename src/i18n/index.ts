import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

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

export function localize(value: LocalizedText, locale: LocaleCode): string {
  return value[locale] || value.ar || value.en;
}

/**
 * Screen content mirrors immediately through logical styles. Native navigation
 * chrome may require an app restart after forceRTL changes.
 */
export function configureNativeDirection(locale: LocaleCode): boolean {
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
