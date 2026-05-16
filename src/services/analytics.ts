import posthog from 'posthog-js'

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://app.posthog.com'

export function initAnalytics() {
  if (!KEY) return
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
    persistence: 'localStorage',
  })
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
