import { createClient } from '@supabase/supabase-js'

const WEBHOOK_SECRET = process.env.INTERNAL_WEBHOOK_SECRET
const RESEND_API_KEY = process.env.RESEND_API_KEY
const APP_URL = process.env.FLOWOS_APP_URL ?? 'https://flowosapp.io'

function buildWelcomeHtml({ name, email }) {
  const firstName = (name ?? email ?? 'você').split(' ')[0]

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bem-vindo ao FlowOS</title>
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

          <!-- Header hero -->
          <tr>
            <td style="background:linear-gradient(135deg,rgba(59,130,246,0.12),rgba(6,182,212,0.06));border:1px solid rgba(59,130,246,0.2);border-radius:20px;padding:40px 36px 32px;text-align:center;">
              <div style="font-size:48px;margin-bottom:16px;">🚀</div>
              <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#f2f2f5;letter-spacing:-0.5px;">
                Bem-vindo, ${firstName}!
              </h1>
              <p style="margin:0;font-size:16px;color:#9898a8;line-height:1.7;">
                Seu sistema operacional de vida pessoal está pronto.<br/>
                É hora de construir a versão mais produtiva de você.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="height:16px;"></td></tr>

          <!-- What is FlowOS -->
          <tr>
            <td style="background:#0b0b0f;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:28px;">
              <h2 style="margin:0 0 16px;font-size:15px;font-weight:700;color:#f2f2f5;">O que você pode fazer agora</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;font-size:18px;vertical-align:middle;">✅</td>
                        <td style="vertical-align:middle;">
                          <div style="font-size:14px;font-weight:600;color:#f2f2f5;">Criar hábitos diários</div>
                          <div style="font-size:12px;color:#62627a;margin-top:2px;">Rastreie sua consistência com streaks visuais</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;font-size:18px;vertical-align:middle;">💰</td>
                        <td style="vertical-align:middle;">
                          <div style="font-size:14px;font-weight:600;color:#f2f2f5;">Controlar suas finanças</div>
                          <div style="font-size:12px;color:#62627a;margin-top:2px;">Receitas, despesas e metas financeiras integradas</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;font-size:18px;vertical-align:middle;">🤖</td>
                        <td style="vertical-align:middle;">
                          <div style="font-size:14px;font-weight:600;color:#f2f2f5;">Conversar com sua IA pessoal</div>
                          <div style="font-size:12px;color:#62627a;margin-top:2px;">Gemini com contexto completo do seu FlowOS</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;font-size:18px;vertical-align:middle;">⭐</td>
                        <td style="vertical-align:middle;">
                          <div style="font-size:14px;font-weight:600;color:#f2f2f5;">Acompanhar seu Life Score</div>
                          <div style="font-size:12px;color:#62627a;margin-top:2px;">Pontuação unificada de saúde, produtividade e finanças</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="height:16px;"></td></tr>

          <!-- Trial reminder -->
          <tr>
            <td style="background:linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04));border:1px solid rgba(16,185,129,0.2);border-radius:16px;padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:13px;font-weight:700;color:#10b981;margin-bottom:4px;">⏱ Seu período de teste</div>
                    <div style="font-size:13px;color:#9898a8;line-height:1.6;">
                      Você tem <strong style="color:#f2f2f5;">15 dias gratuitos</strong> para explorar tudo. Sem compromisso, cancele quando quiser.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="height:24px;"></td></tr>

          <!-- CTA -->
          <tr>
            <td align="center">
              <a href="${APP_URL}/dashboard"
                 style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 48px;border-radius:12px;letter-spacing:0.2px;">
                Abrir meu FlowOS →
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
                Você recebeu este email porque criou uma conta no FlowOS.<br/>
                <a href="${APP_URL}/perfil" style="color:#3b82f6;">Gerenciar preferências de email</a>
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Valida secret interno (chamado pelo trigger Supabase)
  const secret = req.headers['x-webhook-secret']
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!RESEND_API_KEY) {
    return res.status(501).json({ error: 'RESEND_API_KEY não configurada.' })
  }

  // Aceita chamada direta { email, name } ou payload de Database Webhook do Supabase { record: { email, full_name } }
  const body = req.body ?? {}
  const record = body.record ?? body
  const email = record.email
  const name = record.full_name ?? record.name
  if (!email) return res.status(400).json({ error: 'email obrigatório.' })

  const firstName = (name ?? email).split(' ')[0]

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? 'FlowOS <noreply@flowosapp.io>',
        to: [email],
        subject: `${firstName}, seu FlowOS está pronto 🚀`,
        html: buildWelcomeHtml({ name, email }),
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      return res.status(502).json({ error: 'Resend error', detail: body })
    }

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
