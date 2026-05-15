import { createClient } from '@supabase/supabase-js'

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!supabase) return res.status(501).json({ error: 'Supabase não configurado.' })

  const { code, userId } = req.body ?? {}
  if (!code || !userId) return res.status(400).json({ error: 'code e userId são obrigatórios.' })

  const normalized = String(code).trim().toUpperCase()

  const { data: betaCode, error: findErr } = await supabase
    .from('beta_codes')
    .select('id, plan, max_uses, uses, expires_at')
    .eq('code', normalized)
    .single()

  if (findErr || !betaCode) return res.status(400).json({ error: 'Código inválido.' })
  if (betaCode.uses >= betaCode.max_uses) return res.status(400).json({ error: 'Código esgotado.' })
  if (betaCode.expires_at && new Date(betaCode.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Código expirado.' })
  }

  await supabase.from('beta_codes').update({ uses: betaCode.uses + 1 }).eq('id', betaCode.id)

  const { data: existing } = await supabase
    .from('subscriptions').select('id').eq('user_id', userId).limit(1).maybeSingle()

  if (existing) {
    await supabase.from('subscriptions')
      .update({ plan: betaCode.plan, status: 'active', updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('subscriptions').insert({
      user_id: userId,
      plan: betaCode.plan,
      status: 'active',
      stripe_subscription_id: `beta_${normalized}_${userId}`,
      updated_at: new Date().toISOString(),
    })
  }

  res.json({ ok: true, plan: betaCode.plan })
}
