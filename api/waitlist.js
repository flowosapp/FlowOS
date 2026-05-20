import { createClient } from '@supabase/supabase-js'

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, plan, source } = req.body ?? {}
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'E-mail inválido.' })
  }

  if (!supabase) return res.status(501).json({ error: 'Banco não configurado.' })

  const { error } = await supabase
    .from('waitlist')
    .upsert(
      { email: email.toLowerCase().trim(), plan: plan ?? 'unknown', source: source ?? 'launch_page', created_at: new Date().toISOString() },
      { onConflict: 'email' }
    )

  if (error) return res.status(500).json({ error: error.message })

  // Enviar email de confirmação via Resend (silencioso se não configurado)
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'FlowOS <noreply@flowosapp.io>',
      to: email,
      subject: 'Você está na lista — FlowOS lança em 08/06 🚀',
      html: `
        <div style="background:#04040e;color:#e2e8f0;font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;border-radius:16px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px">
            <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#3b82f6,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:16px">⚡</div>
            <span style="font-size:14px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase">FLOWOS</span>
          </div>
          <h1 style="font-size:24px;font-weight:900;color:#fff;margin-bottom:12px;letter-spacing:-0.02em">Você está na lista. 🎉</h1>
          <p style="font-size:15px;color:rgba(255,255,255,0.6);line-height:1.8;margin-bottom:24px">
            Em <strong style="color:#fff">08 de junho</strong> o FlowOS abre as portas. Você será um dos primeiros a acessar — com acesso antecipado e condições especiais de early bird.
          </p>
          <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:12px;padding:20px 24px;margin-bottom:28px">
            <p style="font-size:13px;color:#93c5fd;margin:0;line-height:1.7">
              <strong>O que é o FlowOS?</strong><br/>
              Um Life Operating System que une hábitos, finanças, IA, foco e saúde em um único painel — com um Life Score de 0 a 100 que mede sua performance de vida em tempo real.
            </p>
          </div>
          <p style="font-size:12px;color:rgba(255,255,255,0.25);line-height:1.6">
            Você receberá um e-mail no dia do lançamento com seu link de acesso.<br/>
            Enquanto isso, siga <a href="https://instagram.com/flowosapp.io" style="color:#3b82f6">@flowosapp.io</a> para bastidores.
          </p>
        </div>
      `,
    }).catch(() => {})
  }

  return res.json({ ok: true })
}
