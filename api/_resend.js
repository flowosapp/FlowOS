const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.RESEND_FROM_EMAIL ?? 'FlowOS <noreply@flowosapp.io>'
const APP_URL = process.env.FLOWOS_APP_URL ?? 'https://flowosapp.io'

export { APP_URL }

export async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not set')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ─── HTML builders ────────────────────────────────────────────────────────────

const logo = `
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
  </tr>`

const footer = (unsubUrl = `${APP_URL}/perfil`) => `
  <tr>
    <td align="center" style="padding:28px 0 0;">
      <p style="margin:0 0 6px;font-size:12px;color:#3e3e52;">FlowOS · flowosapp.io</p>
      <p style="margin:0;font-size:11px;color:#2e2e42;">
        <a href="${unsubUrl}" style="color:#3e3e52;">Gerenciar notificações</a>
      </p>
    </td>
  </tr>`

function wrap(innerRows) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#060608;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060608;min-height:100vh;">
    <tr><td align="center" style="padding:48px 16px;">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        ${innerRows}
      </table>
    </td></tr>
  </table>
</body></html>`
}

export function buildBillingFailedHtml({ name, amount, planName, attemptDate, retry2, retry3 }) {
  const first = (name ?? '').split(' ')[0] || 'você'
  return wrap(`
    ${logo}
    <tr><td style="background:#0b0b0f;border:1px solid rgba(239,68,68,0.2);border-radius:20px;padding:40px 40px 36px;text-align:center;">
      <div style="margin-bottom:24px;">
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
          <td style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:50%;width:64px;height:64px;text-align:center;vertical-align:middle;">
            <span style="font-size:28px;line-height:64px;">💳</span>
          </td>
        </tr></table>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f2f2f5;letter-spacing:-0.5px;">Não conseguimos processar seu pagamento</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#9898a8;line-height:1.6;">
        Olá ${first}, a cobrança de <strong style="color:#fff;">${amount}</strong> do plano ${planName} foi recusada em ${attemptDate}.
      </p>
      <a href="${APP_URL}/perfil"
         style="display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;">
        Atualizar método de pagamento
      </a>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr><td style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:16px 20px;text-align:left;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#fff;">Próximas tentativas automáticas</p>
          <p style="margin:4px 0;font-size:12px;color:#62627a;"><span style="color:#fbbf24;margin-right:8px;">›</span>Tentativa 2: ${retry2}</p>
          <p style="margin:4px 0;font-size:12px;color:#62627a;"><span style="color:#fbbf24;margin-right:8px;">›</span>Tentativa 3: ${retry3}</p>
          <p style="margin:4px 0;font-size:12px;color:#f87171;"><span style="margin-right:8px;">›</span>Após 3 falhas: conta suspensa</p>
        </td></tr>
      </table>
    </td></tr>
    ${footer()}`)
}

export function buildCancelledHtml({ name, planName, accessUntil, dataDeletionDate }) {
  const first = (name ?? '').split(' ')[0] || 'você'
  return wrap(`
    ${logo}
    <tr><td style="background:#0b0b0f;border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:40px 40px 36px;text-align:center;">
      <div style="margin-bottom:24px;">
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
          <td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:50%;width:64px;height:64px;text-align:center;vertical-align:middle;">
            <span style="font-size:28px;line-height:64px;">👋</span>
          </td>
        </tr></table>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f2f2f5;letter-spacing:-0.5px;">Assinatura cancelada.</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#9898a8;line-height:1.6;">
        Olá ${first}, confirmamos o cancelamento do plano <strong style="color:#fff;">${planName}</strong>.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td style="background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:14px;padding:20px;text-align:left;">
          <p style="margin:4px 0;font-size:12px;color:#9898a8;"><span style="color:#10b981;margin-right:8px;">✓</span>Acesso ativo até: <strong style="color:#fff;">${accessUntil}</strong></p>
          <p style="margin:4px 0;font-size:12px;color:#9898a8;"><span style="color:#10b981;margin-right:8px;">✓</span>Exportação de dados disponível por 30 dias</p>
          <p style="margin:4px 0;font-size:12px;color:#9898a8;"><span style="color:#10b981;margin-right:8px;">✓</span>Nenhuma cobrança futura será feita</p>
        </td></tr>
      </table>
      <a href="${APP_URL}/precos"
         style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.8);text-decoration:none;font-size:14px;font-weight:500;padding:12px 28px;border-radius:11px;">
        Reativar assinatura
      </a>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
        <tr><td style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.12);border-radius:12px;padding:14px 18px;text-align:left;">
          <p style="margin:0;font-size:12px;color:#9898a8;">
            <span style="color:#fbbf24;">💾</span> Exporte seus dados antes de <strong style="color:#fff;">${dataDeletionDate}</strong>. Após essa data tudo é permanentemente excluído.
          </p>
        </td></tr>
      </table>
    </td></tr>
    ${footer()}`)
}

export function buildTrialEndingHtml({ name, lifeScore, trialEndDate }) {
  const first = (name ?? '').split(' ')[0] || 'você'
  return wrap(`
    ${logo}
    <tr><td style="background:#0b0b0f;border:1px solid rgba(245,158,11,0.2);border-radius:20px;padding:40px 40px 36px;text-align:center;">
      <div style="margin-bottom:24px;">
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
          <td style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);border-radius:50%;width:64px;height:64px;text-align:center;vertical-align:middle;">
            <span style="font-size:28px;line-height:64px;">⏳</span>
          </td>
        </tr></table>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f2f2f5;letter-spacing:-0.5px;">Seu trial termina em 2 dias.</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#9898a8;line-height:1.6;">
        Olá ${first}, seu período gratuito termina em <strong style="color:#fbbf24;">${trialEndDate}</strong>.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td style="background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:14px;padding:20px;">
          <p style="margin:0 0 4px;font-size:11px;color:#9898a8;letter-spacing:0.1em;text-transform:uppercase;">Seu Life Score atual</p>
          <p style="margin:0;font-size:42px;font-weight:900;color:#60a5fa;letter-spacing:-2px;">${lifeScore ?? '—'}</p>
        </td></tr>
      </table>
      <a href="${APP_URL}/precos"
         style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;">
        Continuar por R$29/mês →
      </a>
      <p style="margin:14px 0 0;font-size:12px;color:#62627a;">Cancele a qualquer momento. Sem fidelidade.</p>
    </td></tr>
    ${footer()}`)
}
