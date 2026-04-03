import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import arAuth from './locales/ar/auth.json'
import arCommon from './locales/ar/common.json'
import arCreateAuction from './locales/ar/createAuction.json'
import enAuth from './locales/en/auth.json'
import enCommon from './locales/en/common.json'
import enCreateAuction from './locales/en/createAuction.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { auth: arAuth, common: arCommon, createAuction: arCreateAuction },
      en: { auth: enAuth, common: enCommon, createAuction: enCreateAuction }
    },
    lng: 'ar',
    fallbackLng: 'ar',
    defaultNS: 'common',
    interpolation: { escapeValue: false }
  })

export default i18n
