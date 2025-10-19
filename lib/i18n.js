// Only initialize i18n on the client side
if (typeof window !== 'undefined') {
  const { default: i18n } = require('i18next');
  const { initReactI18next } = require('react-i18next');
  const LanguageDetector = require('i18next-browser-languagedetector').default;

  // Import translation files
  const enTranslations = require('../public/locales/en/common.json');
  const esTranslations = require('../public/locales/es/common.json');
  const arTranslations = require('../public/locales/ar/common.json');

  const resources = {
    en: {
      translation: enTranslations
    },
    es: {
      translation: esTranslations
    },
    ar: {
      translation: arTranslations
    }
  };

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      debug: false,
      
      interpolation: {
        escapeValue: false, // React already does escaping
      },
      
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      }
    });
}

export default {};
