import { createClient } from '@supabase/supabase-js'

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null

const RESEND_API_KEY = process.env.RESEND_API_KEY
const APP_URL = process.env.FLOWOS_APP_URL ?? 'https://flow-os-app.vercel.app'

function buildEmailHtml(email) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Sua semana no FlowOS</title>
</head>
<body style="margin:0;padding:0;background:#060608;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060608;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#3b82f6,#06b6d4);border-radius:14px;padding:10px 14px;">
                    <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Flow</span><span style="font-size:20px;font-weight:800;color:rgba(255,255,255,0.6);letter-spacing:-0.5px;">OS</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header card -->
          <tr>
            <td style="background:#0b0b0f;border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:36px 36px 28px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:2px;color:#62627a;text-transform:uppercase;">Resumo Semanal</p>
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#f2f2f5;letter-spacing:-0.5px;">
                Sua semana em revisão 🔥
              </h1>
              <p style="margin:0;font-size:15px;color:#9898a8;line-height:1.6;">
                Uma nova semana começa. Revise o que conquistou e defina o que vai dominar agora.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="height:16px;"></td></tr>

          <!-- Stats cards -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="background:#0b0b0f;border:1px solid rgba(59,130,246,0.15);border-radius:16px;padding:20px;text-align:center;vertical-align:top;">
                    <div style="font-size:32px;font-weight:800;background:linear-gradient(135deg,#3b82f6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#3b82f6;">7</div>
                    <div style="font-size:12px;color:#9898a8;margin-top:4px;">dias de streak</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#0b0b0f;border:1px solid rgba(16,185,129,0.15);border-radius:16px;padding:20px;text-align:center;vertical-align:top;">
                    <div style="font-size:32px;font-weight:800;color:#10b981;">∞</div>
                    <div style="font-size:12px;color:#9898a8;margin-top:4px;">potencial esta semana</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="height:16px;"></td></tr>

          <!-- Weekly focus card -->
          <tr>
            <td style="background:linear-gradient(135deg,rgba(59,130,246,0.08),rgba(6,182,212,0.04));border:1px solid rgba(59,130,246,0.15);border-radius:16px;padding:24px;">
              <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#60a5fa;">💡 Foco desta semana</h3>
              <p style="margin:0;font-size:14px;color:#9898a8;line-height:1.7;">
                Pequenas ações consistentes constroem grandes resultados. Abra o FlowOS hoje, revise seus hábitos e defina <strong style="color:#f2f2f5;">3 tarefas prioritárias</strong> para a semana.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="height:24px;"></td></tr>

          <!-- CTA -->
          <tr>
            <td align="center">
              <a href="${APP_URL}/dashboard"
                 style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 40px;border-radius:12px;letter-spacing:0.2px;">
                Abrir meu FlowOS
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="height:32px;"></td></tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="border-top:1px solid rgba(255,255,255,0.04);padding-top:24px;">
              <p style="margin:0 0 6px;font-size:12px;color:#3e3e52;">FlowOS · Sistema Operacional de Vida Pessoal</p>
              <p style="margin:0;font-size:11px;color:#3e3e52;">
                Você está recebendo este email porque é assinante FlowOS.<br/>
                <a href="${APP_URL}/perfil" style="color:#3b82f6;">Gerenciar preferências</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabase) return res.status(501).json({ error: 'Supabase não configurado.' })
  if (!RESEND_API_KEY) return res.status(501).json({ error: 'RESEND_API_KEY não configurada.' })

  // Busca todos os assinantes ativos com email
  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('user_id, plan, status')
    .eq('status', 'active')

  if (error) return res.status(500).json({ error: error.message })
  if (!subs?.length) return res.json({ ok: true, sent: 0 })

  const userIds = subs.map(s => s.user_id)

  const { data: users } = await supabase.auth.admin.listUsers()
  const activeUsers = (users?.users ?? []).filter(u => userIds.includes(u.id) && u.email)

  let sent = 0
  const errors = []

  for (const user of activeUsers) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FlowOS <noreply@flowosapp.com>',
          to: [user.email],
          subject: '🔥 Sua semana no FlowOS — hora de dominar mais uma',
          html: buildEmailHtml(user.email),
        }),
      })

      if (response.ok) sent++
      else errors.push({ email: user.email, status: response.status })
    } catch (err) {
      errors.push({ email: user.email, error: err.message })
    }
  }

  res.json({ ok: true, sent, total: activeUsers.length, errors })
}
