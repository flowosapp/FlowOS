import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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
