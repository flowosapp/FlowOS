import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, buildBillingFailedHtml, buildCancelledHtml } from '../_resend.js'

// Stripe requires the raw body to verify webhook signatures
export const config = { api: { bodyParser: false } }

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!stripe || !webhookSecret) return res.status(501).json({ error: 'Stripe webhook não configurado.' })

  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }

  if (['checkout.session.completed', 'customer.subscription.updated',
       'customer.subscription.deleted', 'invoice.payment_failed'].includes(event.type)) {
    await syncEvent(event)
  }

  // Emails transacionais
  if (event.type === 'invoice.payment_failed') {
    await handleBillingFailedEmail(event.data.object).catch(e => console.error('[email] billing_failed:', e.message))
  }
  if (event.type === 'customer.subscription.deleted') {
    await handleCancelledEmail(event.data.object).catch(e => console.error('[email] cancelled:', e.message))
  }

  res.json({ received: true })
}

async function syncEvent(event) {
  if (!supabase) return

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object
    await upsert({
      userId: s.client_reference_id || s.metadata?.userId,
      plan: s.metadata?.plan ?? 'starter',
      status: 'active',
      stripeCustomerId: s.customer,
      stripeSubscriptionId: s.subscription,
    })
    return
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const s = event.data.object
    await upsert({
      userId: s.metadata?.userId,
      plan: s.metadata?.plan ?? 'starter',
      status: s.status,
      stripeCustomerId: s.customer,
      stripeSubscriptionId: s.id,
      trialEndsAt: s.trial_end ? new Date(s.trial_end * 1000).toISOString() : null,
      currentPeriodEnd: s.current_period_end ? new Date(s.current_period_end * 1000).toISOString() : null,
    })
    return
  }

  if (event.type === 'invoice.payment_failed') {
    const inv = event.data.object
    const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id
    if (subId) {
      await supabase.from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subId)
    }
  }
}

async function getUserBySubscriptionId(subId) {
  if (!supabase) return null
  const { data } = await supabase.from('subscriptions').select('user_id').eq('stripe_subscription_id', subId).single()
  if (!data?.user_id) return null
  const { data: { user } } = await supabase.auth.admin.getUserById(data.user_id)
  return user ?? null
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('pt-BR')
}

async function handleBillingFailedEmail(inv) {
  const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id
  if (!subId) return
  const user = await getUserBySubscriptionId(subId)
  if (!user?.email) return
  const attemptDate = new Date(inv.created * 1000).toLocaleDateString('pt-BR')
  const amount = inv.currency === 'brl'
    ? `R$${(inv.amount_due / 100).toFixed(2).replace('.', ',')}`
    : `$${(inv.amount_due / 100).toFixed(2)}`
  await sendEmail({
    to: user.email,
    subject: 'Problema na cobrança do FlowOS',
    html: buildBillingFailedHtml({
      name: user.user_metadata?.full_name,
      amount,
      planName: inv.lines?.data?.[0]?.description ?? 'Starter',
      attemptDate,
      retry2: addDays(new Date(inv.created * 1000), 3),
      retry3: addDays(new Date(inv.created * 1000), 5),
    }),
  })
}

async function handleCancelledEmail(sub) {
  const user = await getUserBySubscriptionId(sub.id)
  if (!user?.email) return
  const accessUntil = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toLocaleDateString('pt-BR')
    : '—'
  const deletionDate = sub.current_period_end
    ? new Date((sub.current_period_end + 30 * 86400) * 1000).toLocaleDateString('pt-BR')
    : '—'
  await sendEmail({
    to: user.email,
    subject: 'Sua assinatura FlowOS foi cancelada',
    html: buildCancelledHtml({
      name: user.user_metadata?.full_name,
      planName: sub.metadata?.plan ?? 'Starter',
      accessUntil,
      dataDeletionDate: deletionDate,
    }),
  })
}

async function upsert({ userId, plan, status, stripeCustomerId, stripeSubscriptionId, trialEndsAt, currentPeriodEnd }) {
  const payload = {
    plan, status,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    trial_ends_at: trialEndsAt ?? null,
    current_period_end: currentPeriodEnd ?? null,
    updated_at: new Date().toISOString(),
    ...(userId && { user_id: userId }),
  }

  const { error } = await supabase.from('subscriptions')
    .upsert(payload, { onConflict: 'stripe_subscription_id' })

  if (error) console.error('[webhook] upsert error:', error.message)
}
