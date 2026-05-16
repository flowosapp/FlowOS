/* PWA utilities — install prompt, push subscription, SW messaging */

// ── Install prompt ───────────────────────────────────────────────────────────

let deferredPrompt: BeforeInstallPromptEvent | null = null

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function captureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
  })
}

export function canInstall() {
  return !!deferredPrompt
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable'
  await deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  return outcome
}

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
}

// ── Push Subscription ────────────────────────────────────────────────────────

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const arr = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i)
  return arr.buffer
}

export async function subscribePush(userId?: string): Promise<PushSubscription | null> {
  if (!('PushManager' in window)) return null
  const reg = await navigator.serviceWorker.ready
  if (!VAPID_PUBLIC_KEY) {
    console.warn('[FLOWOS] VITE_VAPID_PUBLIC_KEY não configurada')
    return null
  }
  try {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    const json = sub.toJSON() as { endpoint: string; keys?: { p256dh?: string; auth?: string } }
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...json, userId }),
    }).catch(() => {})
    return sub
  } catch (err) {
    console.warn('[FLOWOS] Falha ao inscrever push:', err)
    return null
  }
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
  const reg = await navigator.serviceWorker.ready
  return reg.pushManager.getSubscription()
}

export async function unsubscribePush(): Promise<void> {
  const sub = await getExistingSubscription()
  if (!sub) return
  const endpoint = sub.endpoint
  await sub.unsubscribe()
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  }).catch(() => {})
}

// ── SW Messaging — agendar alarme via SW ────────────────────────────────────

export async function agendarAlarmeViaSW(
  delayMs: number,
  title: string,
  body: string,
  url?: string,
): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false
  const reg = await navigator.serviceWorker.ready
  if (!reg.active) return false
  reg.active.postMessage({ type: 'SCHEDULE_ALARM', delayMs, title, body, url })
  return true
}

export async function cancelarAlarmeViaSW(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  const reg = await navigator.serviceWorker.ready
  reg.active?.postMessage({ type: 'CANCEL_ALARM' })
}

// ── Background Sync — registra sync para quando a conexão retornar ──────────

export async function registerBackgroundSync(tag = 'sync-flowos-state'): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return false
  try {
    const reg = await navigator.serviceWorker.ready
    await (reg as ServiceWorkerRegistration & { sync: { register(tag: string): Promise<void> } }).sync.register(tag)
    return true
  } catch {
    return false
  }
}

// ── Notification permission ──────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return Notification.requestPermission()
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}
