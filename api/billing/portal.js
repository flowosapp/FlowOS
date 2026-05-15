import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

const appUrl = process.env.FLOWOS_APP_URL ?? 'http://localhost:5174'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!stripe) return res.status(501).json({ error: 'Stripe não configurado.' })

  const { customerId } = req.body ?? {}
  if (!customerId) return res.status(400).json({ error: 'customerId obrigatório.' })

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}?billing=portal-return`,
    })
    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
