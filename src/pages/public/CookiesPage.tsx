import { useTranslation } from 'react-i18next'
import { PublicShell } from '../../components/PublicShell'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

type CookieRow = { cookie: string; purpose: string; duration: string }
type CookieType = { name: string; required: boolean; color: string; desc: string; examples: CookieRow[] }

const PT: { label: string; h1: string[]; subtitle: string; updated: string; tableHeaders: string[]; manageTitle: string; manageBody: string; manageEmail: string; requiredLabel: string; optionalLabel: string; types: CookieType[] } = {
  label: 'Política de Cookies',
  h1: ['Apenas o necessário.', 'Sem rastreamento.'],
  subtitle: 'O FlowOS usa cookies exclusivamente para autenticação, preferências e métricas de performance. Nunca para publicidade ou rastreamento cross-site.',
  updated: 'Última atualização: 1 de maio de 2026',
  tableHeaders: ['Cookie', 'Finalidade', 'Duração'],
  requiredLabel: 'Obrigatório',
  optionalLabel: 'Opcional',
  manageTitle: 'Gerenciar cookies',
  manageBody: 'Você pode gerenciar ou excluir cookies nas configurações do seu navegador. Cookies essenciais não podem ser desabilitados sem afetar o funcionamento do app. Para dúvidas:',
  manageEmail: 'privacidade@flowosapp.io',
  types: [
    {
      name: 'Essenciais',
      required: true,
      color: '#10b981',
      desc: 'Necessários para o funcionamento básico do app. Não podem ser desativados.',
      examples: [
        { cookie: 'sb-access-token', purpose: 'Autenticação da sessão do usuário', duration: 'Sessão' },
        { cookie: 'sb-refresh-token', purpose: 'Renovação automática da sessão', duration: '60 dias' },
        { cookie: 'flowos-theme', purpose: 'Preferência de tema da interface', duration: '1 ano' },
      ],
    },
    {
      name: 'Preferências',
      required: false,
      color: '#3b82f6',
      desc: 'Lembram suas configurações para uma experiência personalizada.',
      examples: [
        { cookie: 'flowos-lang', purpose: 'Idioma selecionado pelo usuário', duration: '1 ano' },
        { cookie: 'flowos-sidebar', purpose: 'Estado da sidebar (expandida/recolhida)', duration: '30 dias' },
        { cookie: 'flowos-onboarding', purpose: 'Progresso do onboarding', duration: '90 dias' },
      ],
    },
    {
      name: 'Análise',
      required: false,
      color: '#8b5cf6',
      desc: 'Ajudam a entender como o app é usado para melhorar a experiência. Todos os dados são anonimizados.',
      examples: [
        { cookie: 'ph_distinct_id', purpose: 'Identifica sessões únicas (PostHog, anonimizado)', duration: '1 ano' },
        { cookie: 'ph_session_id', purpose: 'Session replay e analytics de uso', duration: '30 min' },
      ],
    },
  ],
}

const EN: typeof PT = {
  label: 'Cookie Policy',
  h1: ['Only what\'s needed.', 'No tracking.'],
  subtitle: 'FlowOS uses cookies exclusively for authentication, preferences, and performance metrics. Never for advertising or cross-site tracking.',
  updated: 'Last updated: May 1, 2026',
  tableHeaders: ['Cookie', 'Purpose', 'Duration'],
  requiredLabel: 'Required',
  optionalLabel: 'Optional',
  manageTitle: 'Manage cookies',
  manageBody: 'You can manage or delete cookies in your browser settings. Essential cookies cannot be disabled without affecting app functionality. For questions:',
  manageEmail: 'privacy@flowosapp.io',
  types: [
    {
      name: 'Essential',
      required: true,
      color: '#10b981',
      desc: 'Required for basic app functionality. Cannot be disabled.',
      examples: [
        { cookie: 'sb-access-token', purpose: 'User session authentication', duration: 'Session' },
        { cookie: 'sb-refresh-token', purpose: 'Automatic session renewal', duration: '60 days' },
        { cookie: 'flowos-theme', purpose: 'Interface theme preference', duration: '1 year' },
      ],
    },
    {
      name: 'Preferences',
      required: false,
      color: '#3b82f6',
      desc: 'Remember your settings for a personalized experience.',
      examples: [
        { cookie: 'flowos-lang', purpose: 'Language selected by the user', duration: '1 year' },
        { cookie: 'flowos-sidebar', purpose: 'Sidebar state (expanded/collapsed)', duration: '30 days' },
        { cookie: 'flowos-onboarding', purpose: 'Onboarding progress', duration: '90 days' },
      ],
    },
    {
      name: 'Analytics',
      required: false,
      color: '#8b5cf6',
      desc: 'Help understand how the app is used to improve the experience. All data is anonymized.',
      examples: [
        { cookie: 'ph_distinct_id', purpose: 'Identifies unique sessions (PostHog, anonymized)', duration: '1 year' },
        { cookie: 'ph_session_id', purpose: 'Session replay and usage analytics', duration: '30 min' },
      ],
    },
  ],
}

export default function CookiesPage() {
  const { i18n } = useTranslation()
  const c = (i18n.language === 'en-US' || i18n.language.startsWith('en')) ? EN : PT

  return (
    <PublicShell>
      <p className="pub-section-label">{c.label}</p>
      <h1 className="pub-h1">
        {c.h1[0]}<br />
        <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{c.h1[1]}</span>
      </h1>
      <p className="pub-body" style={{ maxWidth: 580, marginBottom: 16 }}>{c.subtitle}</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 56 }}>{c.updated}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {c.types.map(({ name, required, color, desc, examples }) => (
          <div key={name}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{name}</h2>
              <span style={{ fontSize: 10, color, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 6, padding: '3px 9px', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 700 }}>
                {required ? c.requiredLabel : c.optionalLabel}
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontWeight: 300, marginBottom: 20 }}>{desc}</p>

            <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr', padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {c.tableHeaders.map(h => (
                  <span key={h} style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{h}</span>
                ))}
              </div>
              {examples.map(({ cookie, purpose, duration }, i) => (
                <div key={cookie} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr', padding: '14px 20px', borderBottom: i < examples.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <span style={{ fontSize: 12, color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{cookie}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>{purpose}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{duration}</span>
                </div>
              ))}
            </div>
            <div className="pub-divider" />
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 28px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14 }}>
        <p style={{ fontSize: 14, color: '#fff', fontWeight: 500, marginBottom: 6 }}>{c.manageTitle}</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
          {c.manageBody} <span style={{ color: '#93c5fd' }}>{c.manageEmail}</span>
        </p>
      </div>
    </PublicShell>
  )
}
