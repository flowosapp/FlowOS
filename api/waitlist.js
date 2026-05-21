import { createClient } from '@supabase/supabase-js'
import { sendEmail } from './_resend.js'
import { buildWaitlistConfirmHtml } from './_resend.js'

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // GET /api/waitlist → retorna contagem pública
  if (req.method === 'GET') {
    if (!supabase) return res.json({ count: 0 })
    const { count } = await supabase.from('waitlist').select('*', { count: 'exact', head: true })
    return res.json({ count: count ?? 0 })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, name, plan, source } = req.body ?? {}
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'E-mail inválido.' })
  }

  if (!supabase) return res.status(501).json({ error: 'Banco não configurado.' })

  const { error } = await supabase
    .from('waitlist')
    .upsert(
      {
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        plan: plan ?? 'starter',
        source: source ?? 'launch_page',
        created_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )

  if (error) return res.status(500).json({ error: error.message })

  // Email de confirmação
  if (process.env.RESEND_API_KEY) {
    await sendEmail({
      to: email,
      subject: 'Você está na lista — FlowOS lança em 08/06 ⚡',
      html: buildWaitlistConfirmHtml({ name: name?.trim() || null, plan: plan ?? 'starter' }),
    }).catch(() => {})
  }

  return res.json({ ok: true })
}
