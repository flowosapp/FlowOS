export default function handler(_req, res) {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? null })
}
