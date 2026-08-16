import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { EN_TRANSLATIONS } from './resources/en'

void i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  lng: 'en',
  resources: {
    en: {
      translation: EN_TRANSLATIONS,
    },
  },
})

export { default as i18n } from 'i18next'
