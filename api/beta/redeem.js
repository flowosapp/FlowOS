export default function handler(req, res) {
  res.status(410).json({ error: 'Beta program encerrado. Assine um plano em flow-os-app.vercel.app.' })
}
