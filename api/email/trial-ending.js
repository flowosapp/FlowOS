import { createClient } from '@supabase/supabase-js'
import { sendEmail, buildTrialEndingHtml } from '../_resend.js'

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!supabase) return res.status(501).json({ error: 'Supabase não configurado.' })

  const now = new Date()
  const in2days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

  // Assinantes em trial que encerram nas próximas 48h e ainda não receberam o aviso hoje
  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('user_id, trial_ends_at, plan')
    .eq('status', 'trialing')
    .gte('trial_ends_at', now.toISOString())
    .lte('trial_ends_at', in2days.toISOString())

  if (error) return res.status(500).json({ error: error.message })
  if (!subs?.length) return res.json({ ok: true, sent: 0, message: 'Nenhum trial encerrando em 2 dias.' })

  const userIds = subs.map(s => s.user_id)
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const targets = (users ?? []).filter(u => userIds.includes(u.id) && u.email)

  let sent = 0
  const errors = []

  for (const user of targets) {
    const sub = subs.find(s => s.user_id === user.id)
    const trialEndDate = sub?.trial_ends_at
      ? new Date(sub.trial_ends_at).toLocaleDateString('pt-BR')
      : '—'

    // Busca Life Score atual (melhor esforço — ignora erro se não existir)
    let lifeScore = null
    const { data: scoreData } = await supabase
      .from('life_scores')
      .select('score')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single()
    if (scoreData?.score) lifeScore = scoreData.score

    try {
      await sendEmail({
        to: user.email,
        subject: '⏳ Seu trial FlowOS termina em 2 dias',
        html: buildTrialEndingHtml({
          name: user.user_metadata?.full_name,
          lifeScore,
          trialEndDate,
        }),
      })
      sent++
    } catch (err) {
      errors.push({ email: user.email, error: err.message })
    }
  }

  res.json({ ok: true, sent, total: targets.length, errors })
}
