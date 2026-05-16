import { createClient } from '@supabase/supabase-js'

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { endpoint } = req.body ?? {}
  if (!endpoint) return res.status(400).json({ error: 'endpoint obrigatório.' })

  if (supabase) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  }

  res.json({ ok: true })
}
