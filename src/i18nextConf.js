import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// import Backend from 'i18next-node-fs-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import ar from './locales/ar/translation.ts';
import en from './locales/en/translation.ts';


const fallbackLng = ['en'];
const availableLanguages = ['en', 'ar'];

i18n
  // .use(Backend) // load translations using http (default public/locals/en/translations)
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass the i18n instance to react-i18next.
  .init({
    fallbackLng, // fallback language is english.

    detection: {
      checkWhitelist: true, // options for language detection
    },

    debug: false,

    react: {
      useSuspense: false,
    },

    whitelist: availableLanguages,

    interpolation: {
      escapeValue: false, // no need for react. it escapes by default
    },
    resources: {
      en: {
        translation: en,
      },
      ar: {
        translation: ar,
      },
    },
  });

export default i18n;
