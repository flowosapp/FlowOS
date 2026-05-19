import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? 'flowosapp@gmail.com'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
}

export default async function handler(req, res) {
  const action = req.query.action

  // GET /api/push — retorna VAPID public key
  if (req.method === 'GET') {
    return res.json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? null })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // POST /api/push?action=subscribe
  if (action === 'subscribe') {
    if (!supabase) return res.status(501).json({ error: 'Supabase não configurado.' })
    const { endpoint, keys, userId } = req.body ?? {}
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'endpoint e keys são obrigatórios.' })
    }
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { endpoint, p256dh: keys.p256dh, auth: keys.auth, ...(userId ? { user_id: userId } : {}) },
        { onConflict: 'endpoint' }
      )
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  // POST /api/push?action=unsubscribe
  if (action === 'unsubscribe') {
    const { endpoint } = req.body ?? {}
    if (!endpoint) return res.status(400).json({ error: 'endpoint obrigatório.' })
    if (supabase) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
    }
    return res.json({ ok: true })
  }

  // POST /api/push?action=send
  if (action === 'send') {
    if (!supabase) return res.status(501).json({ error: 'Supabase não configurado.' })
    const { userId, title, body, url } = req.body ?? {}
    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'userId, title e body são obrigatórios.' })
    }
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', userId)
    if (error) return res.status(500).json({ error: error.message })
    if (!subs?.length) return res.json({ ok: true, sent: 0 })

    const payload = JSON.stringify({
      title, body,
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      url: url ?? '/dashboard',
    })
    const results = await Promise.allSettled(
      subs.map(async s => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
          )
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
          }
          throw err
        }
      })
    )
    const sent = results.filter(r => r.status === 'fulfilled').length
    return res.json({ ok: true, sent })
  }

  return res.status(400).json({ error: 'action inválida. Use: subscribe, unsubscribe, send' })
}
