import posthog from 'posthog-js'

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://app.posthog.com'

const CONSENT_KEY = 'flowos-cookie-consent'

export type CookieConsent = 'all' | 'essential'

export function getAnalyticsConsent(): CookieConsent | null {
  return localStorage.getItem(CONSENT_KEY) as CookieConsent | null
}

export function initAnalytics() {
  if (!KEY) return
  const hasConsent = getAnalyticsConsent() === 'all'
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
    persistence: 'localStorage',
    opt_out_capturing_by_default: !hasConsent,
    disable_session_recording: import.meta.env.DEV,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: { password: true },
      maskTextSelector: '.ph-mask',
      blockSelector: '.ph-no-capture',
    },
    // Desativa scripts extras do PostHog que impactam performance (43KB)
    disable_surveys: true,
    enable_heatmaps: false,
  })
}

export function optInAnalytics() {
  if (!KEY) return
  localStorage.setItem(CONSENT_KEY, 'all')
  posthog.opt_in_capturing()
}

export function optOutAnalytics() {
  if (!KEY) return
  localStorage.setItem(CONSENT_KEY, 'essential')
  posthog.opt_out_capturing()
}

export function identifyUser(userId: string, email?: string) {
  if (!KEY) return
  posthog.identify(userId, { email })
}

export function resetAnalyticsUser() {
  if (!KEY) return
  posthog.reset()
}

export function track(event: string, props?: Record<string, unknown>) {
  if (!KEY) return
  posthog.capture(event, props)
}

// Eventos padrão FlowOS
export const Events = {
  SIGNUP:              'signup',
  LOGIN:               'login',
  LOGOUT:              'logout',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  HABIT_CREATED:       'habit_created',
  HABIT_CHECKED:       'habit_checked',
  FINANCE_ENTRY_ADDED: 'finance_entry_added',
  AI_MESSAGE_SENT:     'ai_message_sent',
  FOCUS_SESSION_START: 'focus_session_start',
  FOCUS_SESSION_END:   'focus_session_end',
  CHECKOUT_STARTED:    'checkout_started',
  CHECKOUT_SUCCESS:    'checkout_success',
  PWA_INSTALLED:       'pwa_installed',
  PUSH_SUBSCRIBED:     'push_subscribed',
} as const
