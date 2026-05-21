import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// PT-BR
import ptBRCommon from './locales/pt-BR/common.json'
import ptBRNav from './locales/pt-BR/navigation.json'
import ptBRAuth from './locales/pt-BR/auth.json'
import ptBROnboarding from './locales/pt-BR/onboarding.json'
import ptBRDashboard from './locales/pt-BR/dashboard.json'
import ptBRHabits from './locales/pt-BR/habits.json'
import ptBRFinance from './locales/pt-BR/finance.json'
import ptBRProfile from './locales/pt-BR/profile.json'
import ptBRPricing from './locales/pt-BR/pricing.json'
import ptBRLanding from './locales/pt-BR/landing.json'
import ptBRFocus from './locales/pt-BR/focus.json'
import ptBRProjects from './locales/pt-BR/projects.json'
import ptBRAI from './locales/pt-BR/ai.json'
import ptBRSaude from './locales/pt-BR/saude.json'
import ptBRCrescimento from './locales/pt-BR/crescimento.json'

// EN-US
import enUSCommon from './locales/en-US/common.json'
import enUSNav from './locales/en-US/navigation.json'
import enUSAuth from './locales/en-US/auth.json'
import enUSOnboarding from './locales/en-US/onboarding.json'
import enUSDashboard from './locales/en-US/dashboard.json'
import enUSHabits from './locales/en-US/habits.json'
import enUSFinance from './locales/en-US/finance.json'
import enUSProfile from './locales/en-US/profile.json'
import enUSPricing from './locales/en-US/pricing.json'
import enUSLanding from './locales/en-US/landing.json'
import enUSFocus from './locales/en-US/focus.json'
import enUSProjects from './locales/en-US/projects.json'
import enUSAI from './locales/en-US/ai.json'
import enUSSaude from './locales/en-US/saude.json'
import enUSCrescimento from './locales/en-US/crescimento.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt-BR',
    defaultNS: 'common',
    supportedLngs: ['pt-BR', 'pt', 'en-US', 'en'],
    resources: {
      'pt-BR': {
        common: ptBRCommon,
        navigation: ptBRNav,
        auth: ptBRAuth,
        onboarding: ptBROnboarding,
        dashboard: ptBRDashboard,
        habits: ptBRHabits,
        finance: ptBRFinance,
        profile: ptBRProfile,
        pricing: ptBRPricing,
        landing: ptBRLanding,
        focus: ptBRFocus,
        projects: ptBRProjects,
        ai: ptBRAI,
        saude: ptBRSaude,
        crescimento: ptBRCrescimento,
      },
      'en-US': {
        common: enUSCommon,
        navigation: enUSNav,
        auth: enUSAuth,
        onboarding: enUSOnboarding,
        dashboard: enUSDashboard,
        habits: enUSHabits,
        finance: enUSFinance,
        profile: enUSProfile,
        pricing: enUSPricing,
        landing: enUSLanding,
        focus: enUSFocus,
        projects: enUSProjects,
        ai: enUSAI,
        saude: enUSSaude,
        crescimento: enUSCrescimento,
      },
    },
    detection: {
      // querystring (?lng=en-US) sobrepõe tudo — útil para testes e links diretos
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'flowos-lang',
      lookupQuerystring: 'lng',
    },
    interpolation: {
      escapeValue: false, // React já escapa por padrão
    },
  })

// Mapeia 'pt' → 'pt-BR' e 'en' → 'en-US'
const lang = i18n.language
if (lang === 'pt' || lang?.startsWith('pt-')) i18n.changeLanguage('pt-BR')
else if (lang === 'en' || lang?.startsWith('en-')) i18n.changeLanguage('en-US')

export default i18n

/** Troca de idioma — persiste no localStorage */
export function setLanguage(lang: 'pt-BR' | 'en-US') {
  i18n.changeLanguage(lang)
}

export type AppLanguage = 'pt-BR' | 'en-US'
