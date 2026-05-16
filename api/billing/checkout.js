import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

const appUrl = process.env.FLOWOS_APP_URL ?? 'http://localhost:5174'

const plans = {
  starter:  { priceId: process.env.STRIPE_PRICE_STARTER,  trialDays: 15 },
  pro:      { priceId: process.env.STRIPE_PRICE_PRO,      trialDays: 0 },
  flowplus: { priceId: process.env.STRIPE_PRICE_FLOWPLUS, trialDays: 0 },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!stripe) return res.status(501).json({ error: 'Stripe não configurado.' })

  const { plan, email, userId } = req.body ?? {}
  const selected = plans[plan]

  if (!selected?.priceId) {
    return res.status(400).json({ error: 'Plano inválido ou não configurado.' })
  }

  try {
    const subscriptionData = {
      metadata: { plan, userId: userId ?? '' },
      ...(selected.trialDays > 0 && { trial_period_days: selected.trialDays }),
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: selected.priceId, quantity: 1 }],
      customer_email: email || undefined,
      client_reference_id: userId || undefined,
      metadata: { plan, userId: userId ?? '' },
      subscription_data: subscriptionData,
      payment_method_collection: 'always',
      allow_promotion_codes: true,
      success_url: `${appUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}?checkout=cancelled`,
    })

    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
