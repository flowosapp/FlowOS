import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const port = Number(process.env.FLOWOS_API_PORT ?? 8787)
const appUrl = process.env.FLOWOS_APP_URL ?? 'http://localhost:5174'
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null

const supabaseAdmin =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
        },
      })
    : null

const planConfig = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER,
    trialDays: 15,
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO,
    trialDays: 0,
  },
  flowplus: {
    priceId: process.env.STRIPE_PRICE_FLOWPLUS,
    trialDays: 0,
  },
}

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  if (!stripe || !stripeWebhookSecret) {
    response.status(501).json({ error: 'Stripe webhook is not configured.' })
    return
  }

  const signature = request.headers['stripe-signature']

  try {
    const event = stripe.webhooks.constructEvent(request.body, signature, stripeWebhookSecret)

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted' ||
      event.type === 'invoice.payment_failed'
    ) {
      await syncStripeEvent(event)
    }

    response.json({ received: true })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

app.use(cors({ origin: appUrl }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    stripe: Boolean(stripe),
    supabase: Boolean(supabaseAdmin),
  })
})

app.post('/api/billing/checkout', async (request, response) => {
  if (!stripe) {
    response.status(501).json({ error: 'Stripe is not configured.' })
    return
  }

  const { plan, email, userId } = request.body ?? {}
  const selectedPlan = planConfig[plan]

  if (!selectedPlan?.priceId) {
    response.status(400).json({ error: 'Invalid or unconfigured plan.' })
    return
  }

  try {
    const subscriptionData = {
      metadata: {
        plan,
        userId: userId ?? '',
      },
    }

    if (selectedPlan.trialDays > 0) {
      subscriptionData.trial_period_days = selectedPlan.trialDays
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      client_reference_id: userId || undefined,
      metadata: {
        plan,
        userId: userId ?? '',
      },
      subscription_data: subscriptionData,
      allow_promotion_codes: true,
      success_url: `${appUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}?checkout=cancelled`,
    })

    response.json({ url: session.url })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

app.post('/api/billing/portal', async (request, response) => {
  if (!stripe) {
    response.status(501).json({ error: 'Stripe is not configured.' })
    return
  }

  const { customerId } = request.body ?? {}

  if (!customerId) {
    response.status(400).json({ error: 'Missing Stripe customer id.' })
    return
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}?billing=portal-return`,
    })

    response.json({ url: session.url })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

async function syncStripeEvent(event) {
  if (!supabaseAdmin) {
    console.log(`Stripe event received without Supabase admin configured: ${event.type}`)
    return
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    await upsertSubscription({
      userId: session.client_reference_id || session.metadata?.userId,
      plan: session.metadata?.plan ?? 'starter',
      status: 'active',
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
    })
    return
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    await upsertSubscription({
      userId: subscription.metadata?.userId,
      plan: subscription.metadata?.plan ?? 'starter',
      status: subscription.status,
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    })
    return
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    const subscriptionId =
      typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id

    if (subscriptionId) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscriptionId)
    }
  }
}

async function upsertSubscription({
  userId,
  plan,
  status,
  stripeCustomerId,
  stripeSubscriptionId,
  trialEndsAt,
  currentPeriodEnd,
}) {
  const payload = {
    plan,
    status,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    trial_ends_at: trialEndsAt,
    current_period_end: currentPeriodEnd,
    updated_at: new Date().toISOString(),
  }

  if (userId) {
    payload.user_id = userId
  }

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(payload, { onConflict: 'stripe_subscription_id' })

  if (error) {
    console.error('Unable to sync subscription:', error.message)
  }
}

// ── Beta Code Redemption ─────────────────────────────────────────────────────

app.post('/api/beta/redeem', async (request, response) => {
  if (!supabaseAdmin) {
    response.status(501).json({ error: 'Supabase não configurado.' })
    return
  }

  const { code, userId } = request.body ?? {}

  if (!code || !userId) {
    response.status(400).json({ error: 'code e userId são obrigatórios.' })
    return
  }

  const normalizedCode = String(code).trim().toUpperCase()

  // Validate code (service role bypasses RLS)
  const { data: betaCode, error: findErr } = await supabaseAdmin
    .from('beta_codes')
    .select('id, plan, max_uses, uses, expires_at')
    .eq('code', normalizedCode)
    .single()

  if (findErr || !betaCode) {
    response.status(400).json({ error: 'Código inválido.' })
    return
  }

  if (betaCode.uses >= betaCode.max_uses) {
    response.status(400).json({ error: 'Código esgotado.' })
    return
  }

  if (betaCode.expires_at && new Date(betaCode.expires_at) < new Date()) {
    response.status(400).json({ error: 'Código expirado.' })
    return
  }

  // Increment use count
  await supabaseAdmin
    .from('beta_codes')
    .update({ uses: betaCode.uses + 1 })
    .eq('id', betaCode.id)

  // Grant subscription — check if user already has one
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (existing) {
    await supabaseAdmin
      .from('subscriptions')
      .update({ plan: betaCode.plan, status: 'active', updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan: betaCode.plan,
        status: 'active',
        stripe_subscription_id: `beta_${normalizedCode}_${userId}`,
        updated_at: new Date().toISOString(),
      })
  }

  console.log(`[BETA] Código ${normalizedCode} resgatado por ${userId} → plano ${betaCode.plan}`)
  response.json({ ok: true, plan: betaCode.plan })
})

// ── Gemini AI ───────────────────────────────────────────────────────────────

const geminiKey = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.0-flash'

function buildContext(ctx) {
  if (!ctx) return null

  const hoje = new Date().toISOString().split('T')[0]
  const habitosFeitos = ctx.habitos?.filter(h => h.datasConcluidas?.includes(hoje)).length ?? 0
  const tarefasPendentes = ctx.tarefas?.filter(t => !t.concluida) ?? []
  const receitas = ctx.transacoes?.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0) ?? 0
  const gastos = ctx.transacoes?.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.valor, 0) ?? 0
  const saldo = receitas - gastos
  const fmtBRL = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const habitosStr = ctx.habitos?.length
    ? ctx.habitos.slice(0, 10).map(h => `  - ${h.icone} ${h.nome}: streak ${h.streak} dias, hoje=${h.datasConcluidas?.includes(hoje) ? 'feito' : 'pendente'}`).join('\n')
    : '  - nenhum hábito cadastrado'

  const tarefasStr = tarefasPendentes.length
    ? tarefasPendentes.slice(0, 10).map(t => `  - [${t.prioridade}] ${t.titulo}`).join('\n')
    : '  - nenhuma tarefa pendente'

  const projetosStr = ctx.projetos?.filter(p => p.status === 'ativo').slice(0, 5).map(p => `  - ${p.nome}`).join('\n') || '  - nenhum projeto ativo'

  const sonoRecente = ctx.registrosSono?.slice(-1)[0]
  const metasAtivas = ctx.metas?.filter(m => m.status === 'ativa').slice(0, 5).map(m => `  - ${m.titulo} (${m.progresso}%, prazo: ${m.horizonte})`).join('\n') || '  - nenhuma meta'

  return `DADOS REAIS DO USUÁRIO NO FLOWOS (hoje: ${hoje}):
nome: ${ctx.perfil?.nome ?? 'não informado'}
objetivos: ${ctx.perfil?.objetivos?.join(', ') || 'não definidos'}
desafios pessoais: ${ctx.perfil?.desafios?.join(', ') || 'não definidos'}

hábitos (${ctx.habitos?.length ?? 0} total, ${habitosFeitos} feitos hoje):
${habitosStr}

tarefas pendentes (${tarefasPendentes.length}):
${tarefasStr}

projetos ativos:
${projetosStr}

finanças: receitas=${fmtBRL(receitas)}, gastos=${fmtBRL(gastos)}, saldo=${fmtBRL(saldo)}, poupança=${receitas > 0 ? Math.round((saldo / receitas) * 100) : 0}%

metas:
${metasAtivas}

sono recente: ${sonoRecente ? `${sonoRecente.horasDormidas}h (qualidade ${sonoRecente.qualidade}/5)` : 'sem dados'}
sessões de foco hoje: ${ctx.focosHoje ?? 0}`
}

const SYSTEM_INSTRUCTION = `Você é o assistente de IA do FLOWOS, um sistema operacional de vida pessoal premium.
Sempre responda em português brasileiro.
Seja direto, específico e motivador. Nunca dê conselhos genéricos — use sempre os dados reais do usuário.
Quando o usuário perguntar algo, cite os nomes reais dos hábitos, tarefas, valores financeiros e metas dele.
Formate com markdown (negrito, listas) quando ajudar na leitura. Máximo 400 palavras.`

app.post('/api/ai/chat', async (request, response) => {
  if (!geminiKey) {
    response.status(501).json({ error: 'GEMINI_API_KEY não configurada no servidor.' })
    return
  }

  const { messages, userContext } = request.body ?? {}
  if (!messages?.length) {
    response.status(400).json({ error: 'messages é obrigatório.' })
    return
  }

  const contextBlock = buildContext(userContext)

  // Gemini uses "user"/"model" roles; cap at last 20 turns
  const rawContents = messages.slice(-20).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  // Inject context into the first user message so Gemini reliably sees it
  const contents = rawContents.map((msg, i) => {
    if (i === 0 && msg.role === 'user' && contextBlock) {
      return {
        ...msg,
        parts: [{ text: `<flowos_context>\n${contextBlock}\n</flowos_context>\n\n${msg.parts[0].text}` }],
      }
    }
    return msg
  })

  console.log('\n=== [AI DEBUG] ===')
  console.log(`mensagens: ${messages.length} | habitos: ${userContext?.habitos?.length ?? 0} | tarefas: ${userContext?.tarefas?.length ?? 0} | transacoes: ${userContext?.transacoes?.length ?? 0}`)
  console.log('--- contexto injetado na 1ª mensagem ---')
  console.log(contextBlock ?? '(sem contexto)')
  console.log('--- última pergunta do usuário ---')
  console.log(messages.at(-1)?.content)
  console.log('==================\n')

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
      console.error('[AI] Gemini error:', err)
      response.status(res.status).json({ error: err?.error?.message ?? 'Erro na API Gemini.' })
      return
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    response.json({ content: text })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// ── Push Notifications ───────────────────────────────────────────────────────
// Requer: npm install web-push --legacy-peer-deps
// Gerar chaves: node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(k)"
// Adicionar ao .env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL

let webPush = null
const vapidPublic  = process.env.VAPID_PUBLIC_KEY
const vapidPrivate = process.env.VAPID_PRIVATE_KEY
const vapidEmail   = process.env.VAPID_EMAIL

try {
  if (vapidPublic && vapidPrivate) {
    const { default: wp } = await import('web-push').catch(() => ({ default: null }))
    if (wp) {
      wp.setVapidDetails(`mailto:${vapidEmail ?? 'admin@flowos.app'}`, vapidPublic, vapidPrivate)
      webPush = wp
      console.log('[FLOWOS] Push notifications ativadas')
    }
  }
} catch {}

// Push subscriptions persisted in Supabase (falls back to in-memory if Supabase unavailable)
const pushSubscriptionsMemory = new Map()

async function getPushSubscriptions() {
  if (!supabaseAdmin) return [...pushSubscriptionsMemory.values()]
  const { data } = await supabaseAdmin.from('push_subscriptions').select('endpoint, p256dh, auth')
  return (data ?? []).map(r => ({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } }))
}

async function savePushSubscription(sub, userId) {
  if (!supabaseAdmin) { pushSubscriptionsMemory.set(sub.endpoint, sub); return }
  const keys = sub.keys ?? {}
  await supabaseAdmin.from('push_subscriptions').upsert({
    endpoint: sub.endpoint,
    p256dh: keys.p256dh ?? '',
    auth: keys.auth ?? '',
    ...(userId ? { user_id: userId } : {}),
  }, { onConflict: 'endpoint' })
}

async function deletePushSubscription(endpoint) {
  if (!supabaseAdmin) { pushSubscriptionsMemory.delete(endpoint); return }
  await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', endpoint)
}

app.post('/api/push/vapid-key', (_req, res) => {
  res.json({ publicKey: vapidPublic ?? null })
})

app.post('/api/push/subscribe', async (req, res) => {
  const sub = req.body
  if (!sub?.endpoint) return res.status(400).json({ error: 'subscription inválida' })
  await savePushSubscription(sub, sub.userId)
  res.json({ ok: true })
})

app.post('/api/push/unsubscribe', async (req, res) => {
  const { endpoint } = req.body ?? {}
  if (endpoint) await deletePushSubscription(endpoint)
  res.json({ ok: true })
})

// Endpoint interno para testar/enviar push manualmente
app.post('/api/push/send', async (req, res) => {
  if (!webPush) return res.status(503).json({ error: 'web-push não configurado' })
  const { title = 'FLOWOS', body = 'Notificação', tag = 'flowos', url = '/dashboard' } = req.body ?? {}
  const payload = JSON.stringify({ title, body, tag, data: { url } })
  const subs = await getPushSubscriptions()
  const results = await Promise.allSettled(
    subs.map(sub =>
      webPush.sendNotification(sub, payload).catch(async err => {
        if (err.statusCode === 410) await deletePushSubscription(sub.endpoint)
        throw err
      })
    )
  )
  const sent = results.filter(r => r.status === 'fulfilled').length
  res.json({ sent, total: subs.length })
})

app.listen(port, () => {
  console.log(`FLOWOS API listening on http://localhost:${port}`)
})
