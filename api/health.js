export default function handler(_req, res) {
  res.json({
    ok: true,
    ts: new Date().toISOString(),
    services: {
      supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      push: Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
      email: Boolean(process.env.RESEND_API_KEY),
    },
  })
}
