import 'intl-pluralrules'; // Polyfil
import i18n, { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { findBestLanguageTag } from 'react-native-localize';
import intervalPlural from 'i18next-intervalplural-postprocessor';

import en from './en.json';
import de from './de.json';
import es from './es.json';
import fr from './fr.json';
import it from './it.json';
import ja from './ja.json';
import zh from './zh.json';
import zhTW from './zh-TW.json';
import zhHK from './zh-HK.json';
import ptBR from './pt-BR.json';

export type LanguageCode =
  | 'en'
  | 'de'
  | 'es'
  | 'fr'
  | 'it'
  | 'ja'
  | 'zh'
  | 'zh-TW'
  | 'zh-HK'
  | 'pt-BR';

export type LocalizedResource<T> = Record<LanguageCode, T>;

// * Here 'translation' refers to default namespace
export const languageResources: Resource = {
  en: { translation: en },
  de: { translation: de },
  es: { translation: es },
  fr: { translation: fr },
  it: { translation: it },
  ja: { translation: ja },
  zh: { translation: zh },
  'zh-TW': { translation: zhTW },
  'zh-HK': { translation: zhHK },
  'pt-BR': { translation: ptBR },
};

export function getSupportedLanguages() {
  return Object.keys(languageResources);
}

export const getSupportedPreferredLanguage = () => {
  const preferredLanguage = findBestLanguageTag(getSupportedLanguages())?.languageTag ?? 'en';
  return preferredLanguage;
};

export const getSelectedDeviceLanguage = () => {
  return i18n.resolvedLanguage;
};

i18n
  .use({
    type: 'languageDetector',
    detect: getSupportedPreferredLanguage,
  })
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(intervalPlural)
  .init({
    // compatibilityJSON: 'v3', //To make it work for Android devices, add this line.
    supportedLngs: getSupportedLanguages(),
    resources: languageResources,
    fallbackLng: 'en',
    // lng: 'en', // if you're using a language detector, do not define the lng option as it overides it
    interpolation: {
      escapeValue: false,
    },
  });

i18n.services.formatter?.add('uppercase', (value: string): string => {
  return value.toUpperCase();
});

export default i18n;
