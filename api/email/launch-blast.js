import { createClient } from '@supabase/supabase-js'
import { sendEmail, buildLaunchBlastHtml } from '../_resend.js'

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null

const CRON_SECRET = process.env.CRON_SECRET

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Proteger rota: só Vercel Cron ou chamada manual com secret
  const authHeader = req.headers['authorization']
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!supabase) return res.status(501).json({ error: 'Supabase não configurado.' })
  if (!process.env.RESEND_API_KEY) return res.status(501).json({ error: 'Resend não configurado.' })

  // Buscar toda a lista (paginando em lotes de 1000)
  let allUsers = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('waitlist')
      .select('email, name, plan')
      .range(from, from + PAGE - 1)
    if (error) return res.status(500).json({ error: error.message })
    if (!data || data.length === 0) break
    allUsers = allUsers.concat(data)
    if (data.length < PAGE) break
    from += PAGE
  }

  if (allUsers.length === 0) return res.json({ sent: 0, message: 'Lista vazia.' })

  // Enviar com delay de 100ms entre emails para respeitar rate limit Resend
  let sent = 0
  let failed = 0
  for (const user of allUsers) {
    try {
      await sendEmail({
        to: user.email,
        subject: '⚡ FlowOS está no ar — Comece seu trial de 15 dias agora',
        html: buildLaunchBlastHtml({ name: user.name, plan: user.plan }),
      })
      sent++
    } catch {
      failed++
    }
    await new Promise(r => setTimeout(r, 100))
  }

  return res.json({ sent, failed, total: allUsers.length })
}
