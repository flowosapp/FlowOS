import { createClient } from '@supabase/supabase-js'

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
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

  res.json({ ok: true })
}
