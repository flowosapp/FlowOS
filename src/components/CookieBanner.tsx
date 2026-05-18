import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAnalyticsConsent, optInAnalytics, optOutAnalytics } from '../services/analytics'

const copy = {
  'pt-BR': {
    title: 'Usamos cookies',
    body: 'Usamos cookies essenciais para autenticação e cookies de análise (PostHog) para melhorar o produto. Nenhum dado é vendido ou compartilhado com anunciantes.',
    accept: 'Aceitar todos',
    essential: 'Só essenciais',
    manage: 'Política de Cookies',
  },
  'en-US': {
    title: 'We use cookies',
    body: 'We use essential cookies for authentication and analytics cookies (PostHog) to improve the product. No data is sold or shared with advertisers.',
    accept: 'Accept all',
    essential: 'Essential only',
    manage: 'Cookie Policy',
  },
}

export function CookieBanner() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(() => getAnalyticsConsent() === null)

  if (!visible) return null

  const lang = (i18n.language === 'en-US' || i18n.language.startsWith('en')) ? 'en-US' : 'pt-BR'
  const c = copy[lang]

  function handleAccept() {
    optInAnalytics()
    setVisible(false)
  }

  function handleEssential() {
    optOutAnalytics()
    setVisible(false)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'min(600px, calc(100vw - 32px))',
      background: 'rgba(10,10,18,0.96)', backdropFilter: 'blur(24px) saturate(1.5)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18,
      padding: '20px 24px', boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>{c.title}</span>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{c.body}</p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={handleAccept}
          style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', border: 'none', borderRadius: 9, padding: '8px 18px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {c.accept}
        </button>
        <button
          onClick={handleEssential}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '8px 18px', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {c.essential}
        </button>
        <button
          onClick={() => navigate(lang === 'en-US' ? '/cookies?lng=en-US' : '/cookies')}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', padding: '8px 4px', textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          {c.manage}
        </button>
      </div>
    </div>
  )
}
