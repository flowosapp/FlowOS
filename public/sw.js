/* FLOWOS Service Worker v3 — cache-first + push + background sync + auto-update */

const CACHE_VERSION = 'flowos-v3'
const STATIC_CACHE  = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const MAX_DYNAMIC_ITEMS = 60

const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

// ── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate: limpa caches de versões antigas ────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => {
        // Notifica todos os clientes que o SW foi atualizado
        self.clients.matchAll({ type: 'window' }).then(clients =>
          clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' }))
        )
      })
  )
})

// ── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Passa direto: requests de outros domínios (Supabase, Stripe, Google, etc.)
  if (url.origin !== self.location.origin) return

  // Passa direto: API própria
  if (url.pathname.startsWith('/api/')) return

  // Navegação SPA: network-first, fallback para shell ou offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone))
          }
          return res
        })
        .catch(() =>
          caches.match('/') ??
          caches.match('/offline.html') ??
          new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } })
        )
    )
    return
  }

  // Assets JS/CSS/fontes: cache-first com fallback network + salva no dynamic
  if (['style', 'script', 'font', 'image'].includes(request.destination) ||
      url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(res => {
          if (res.ok && request.method === 'GET') {
            const clone = res.clone()
            caches.open(DYNAMIC_CACHE).then(async c => {
              await c.put(request, clone)
              // Limita crescimento do cache dinâmico
              const keys = await c.keys()
              if (keys.length > MAX_DYNAMIC_ITEMS) {
                await c.delete(keys[0])
              }
            })
          }
          return res
        })
      })
    )
    return
  }
})

// ── Background Sync — re-sincroniza dados do Supabase ao reconectar ──────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-flowos-state') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(c => c.postMessage({ type: 'SYNC_REQUESTED' }))
      })
    )
  }
})

// ── Push: exibe notificação ──────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = { title: 'FLOWOS', body: 'Nova notificação', tag: 'flowos', data: {} }
  try { data = { ...data, ...event.data.json() } } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      tag: data.tag,
      data: data.data,
      vibrate: [200, 100, 200],
      actions: data.actions ?? [],
      requireInteraction: data.requireInteraction ?? false,
    })
  )
})

// ── Notification click ───────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const url = event.notification.data?.url ?? '/dashboard'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin))
      if (existing) { existing.focus(); existing.navigate(url) }
      else self.clients.openWindow(url)
    })
  )
})

// ── Mensagens do cliente ─────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  // Ativação imediata da nova versão quando solicitada pelo app
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }

  // Alarme local via SW (usado pelo Modo Sono e Modo Foco)
  if (event.data?.type === 'SCHEDULE_ALARM') {
    const { delayMs, title, body, url } = event.data
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        tag: 'flowos-alarm',
        vibrate: [300, 100, 300, 100, 300],
        requireInteraction: true,
        data: { url: url ?? '/saude' },
        actions: [
          { action: 'open', title: 'Abrir app' },
          { action: 'dismiss', title: 'Dispensar' },
        ],
      })
    }, delayMs)
    return
  }

  if (event.data?.type === 'CANCEL_ALARM') {
    self.registration.getNotifications({ tag: 'flowos-alarm' })
      .then(notifs => notifs.forEach(n => n.close()))
    return
  }
})
