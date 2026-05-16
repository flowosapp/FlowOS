const appUrl = process.env.FLOWOS_APP_URL ?? 'https://flowosapp.io'

export default function handler(_req, res) {
  res.status(410).json({ error: `Beta program encerrado. Assine um plano em ${appUrl}/precos.` })
}
