import { PublicShell } from '../../components/PublicShell'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

const COOKIE_TYPES = [
  {
    name: 'Essenciais', required: true, color: '#10b981',
    desc: 'Necessários para o funcionamento básico do app. Não podem ser desativados.',
    examples: [
      { cookie: 'sb-access-token', purpose: 'Autenticação da sessão do usuário', duration: 'Sessão' },
      { cookie: 'sb-refresh-token', purpose: 'Renovação automática da sessão', duration: '60 dias' },
      { cookie: 'flowos-theme', purpose: 'Preferência de tema da interface', duration: '1 ano' },
    ],
  },
  {
    name: 'Preferências', required: false, color: '#3b82f6',
    desc: 'Lembram suas configurações para uma experiência personalizada.',
    examples: [
      { cookie: 'flowos-locale', purpose: 'Idioma selecionado pelo usuário', duration: '1 ano' },
      { cookie: 'flowos-sidebar', purpose: 'Estado da sidebar (expandida/recolhida)', duration: '30 dias' },
      { cookie: 'flowos-onboarding', purpose: 'Progresso do onboarding', duration: '90 dias' },
    ],
  },
  {
    name: 'Análise', required: false, color: '#8b5cf6',
    desc: 'Ajudam a entender como o app é usado para melhorar a experiência. Todos os dados são anonimizados.',
    examples: [
      { cookie: 'flowos-session-id', purpose: 'Identifica sessões únicas (anonimizado)', duration: '30 min' },
      { cookie: 'flowos-perf', purpose: 'Métricas de performance de carregamento', duration: 'Sessão' },
    ],
  },
]

export default function CookiesPage() {
  return (
    <PublicShell>
      <p className="pub-section-label">Política de Cookies</p>
      <h1 className="pub-h1">
        Apenas o necessário.<br />
        <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Sem rastreamento.</span>
      </h1>
      <p className="pub-body" style={{ maxWidth: 580, marginBottom: 16 }}>
        O FlowOS usa cookies exclusivamente para autenticação, preferências e métricas de performance. Nunca para publicidade ou rastreamento cross-site.
      </p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 56 }}>Última atualização: 1 de maio de 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {COOKIE_TYPES.map(({ name, required, color, desc, examples }) => (
          <div key={name}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{name}</h2>
              <span style={{ fontSize: 10, color, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 6, padding: '3px 9px', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 700 }}>
                {required ? 'Obrigatório' : 'Opcional'}
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontWeight: 300, marginBottom: 20 }}>{desc}</p>

            <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr', padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Cookie', 'Finalidade', 'Duração'].map(h => (
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
        <p style={{ fontSize: 14, color: '#fff', fontWeight: 500, marginBottom: 6 }}>Gerenciar cookies</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
          Você pode gerenciar ou excluir cookies nas configurações do seu navegador. Cookies essenciais não podem ser desabilitados sem afetar o funcionamento do app. Para dúvidas: <span style={{ color: '#93c5fd' }}>privacidade@flowosapp.io</span>
        </p>
      </div>
    </PublicShell>
  )
}
