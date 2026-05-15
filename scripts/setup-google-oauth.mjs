/**
 * Configura o Google OAuth no Supabase via Management API.
 *
 * Uso:
 *   node scripts/setup-google-oauth.mjs <SUPABASE_ACCESS_TOKEN>
 *
 * Como obter o token:
 *   https://supabase.com/dashboard/account/tokens
 *   → "Generate new token" → copie e cole aqui
 */

const PROJECT_REF      = process.env.SUPABASE_PROJECT_REF    || 'qsgmdwbkvmxpjelozwuc'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID        || ''
const GOOGLE_SECRET    = process.env.GOOGLE_CLIENT_SECRET    || ''

const token = process.argv[2]
if (!token) {
  console.error('Uso: node scripts/setup-google-oauth.mjs <SUPABASE_ACCESS_TOKEN>')
  console.error('Token: https://supabase.com/dashboard/account/tokens')
  process.exit(1)
}

if (!GOOGLE_CLIENT_ID || !GOOGLE_SECRET) {
  console.error('❌ Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET antes de executar.')
  console.error('   export GOOGLE_CLIENT_ID="seu-client-id"')
  console.error('   export GOOGLE_CLIENT_SECRET="seu-secret"')
  process.exit(1)
}

const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`

const res = await fetch(url, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    external_google_enabled: true,
    external_google_client_id: GOOGLE_CLIENT_ID,
    external_google_secret: GOOGLE_SECRET,
  }),
})

if (res.ok) {
  const data = await res.json()
  const enabled = data.external_google_enabled
  console.log(`✅ Google OAuth configurado com sucesso!`)
  console.log(`   external_google_enabled: ${enabled}`)
  console.log(`   Client ID: ${GOOGLE_CLIENT_ID.slice(0, 20)}...`)
  console.log()
  console.log('⚠️  Lembre de adicionar o URI de redirecionamento no Google Cloud Console:')
  console.log(`   https://${PROJECT_REF}.supabase.co/auth/v1/callback`)
} else {
  const err = await res.json().catch(() => ({}))
  console.error(`❌ Erro ${res.status}: ${JSON.stringify(err)}`)
  process.exit(1)
}
