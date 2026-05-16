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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
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
    title,
    body,
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    url: url ?? '/dashboard',
  })

  const results = await Promise.allSettled(
    subs.map(s =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload,
      )
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  res.json({ ok: true, sent })
}
