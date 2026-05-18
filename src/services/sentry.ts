import * as Sentry from '@sentry/react'
import { browserTracingIntegration } from '@sentry/react'

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
  if (!dsn || import.meta.env.DEV) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION as string | undefined,
    integrations: [browserTracingIntegration()],
    // 10% das transações para performance — ajuste conforme volume
    tracesSampleRate: 0.1,
    // Replay desativado — usamos PostHog Session Replay
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // Ignora erros de extensões de browser e third-party scripts
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /^chrome-extension:/,
      /^moz-extension:/,
    ],
  })
}

export { Sentry }
