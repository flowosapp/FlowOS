import { PublicShell } from '../../components/PublicShell'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

const RELEASES = [
  {
    version: 'v1.0.0', date: '8 jun 2026', badge: 'Lançamento oficial', badgeColor: '#3b82f6',
    changes: [
      { type: 'new',  text: 'Lançamento público do FlowOS — Life Operating System disponível para todos' },
      { type: 'new',  text: 'Life Score v3: cálculo em tempo real com hábitos (30%), tarefas (25%), streak (20%), foco (15%) e finanças (10%)' },
      { type: 'new',  text: 'Central IA com Gemini 2.0 Flash: contexto completo do usuário, insights personalizados por histórico' },
      { type: 'new',  text: 'PWA completo: funciona offline, sincronização automática ao reconectar, instalável na tela inicial' },
      { type: 'new',  text: 'Push notifications: alertas de hábitos, streaks em risco e relatório semanal de Life Score' },
      { type: 'new',  text: 'Planos Starter (R$29,90), Pro (R$49,90) e Flow+ (R$249,90) com 15 dias grátis no Starter' },
      { type: 'imp',  text: 'Performance: LCP abaixo de 2,5s, score Lighthouse 75+ em mobile' },
      { type: 'imp',  text: 'i18n completo: interface disponível em Português e Inglês' },
    ],
  },
  {
    version: 'v0.9.2', date: '12 mai 2026', badge: '', badgeColor: '',
    changes: [
      { type: 'new',  text: 'Modo Foco: detecção automática de queda de atenção com sugestão de pausa estratégica' },
      { type: 'new',  text: 'Dashboard: novo widget de tendência semanal do Life Score com spark-line' },
      { type: 'fix',  text: 'Corrigido bug onde hábitos marcados após meia-noite não contavam para o dia correto' },
      { type: 'fix',  text: 'Performance: redução de 60% no tempo de carregamento inicial do dashboard' },
      { type: 'imp',  text: 'Central IA: contexto de memória expandido para 90 dias (era 30)' },
    ],
  },
  {
    version: 'v0.9.0', date: '28 abr 2026', badge: 'Major', badgeColor: '#8b5cf6',
    changes: [
      { type: 'new',  text: 'Módulo de Saúde & Sono com tracking de HRV, qualidade de sono e nível de hidratação' },
      { type: 'new',  text: 'Integração com Google Fit e Apple Health (leitura de dados passivos)' },
      { type: 'new',  text: 'Life Score: dimensão de Saúde agora contribui 15% (dimensão Financeira ajustada para 10%)' },
      { type: 'imp',  text: 'Redesign completo do módulo de Finanças com suporte a múltiplas contas' },
      { type: 'imp',  text: 'Onboarding reduzido de 12 para 4 etapas sem perda de personalização' },
    ],
  },
  {
    version: 'v0.8.5', date: '10 abr 2026', badge: '', badgeColor: '',
    changes: [
      { type: 'new',  text: 'Plano Flow+: acesso à API pública REST com autenticação OAuth 2.0' },
      { type: 'new',  text: 'Webhooks para eventos: hábito completado, score calculado, streak quebrado' },
      { type: 'fix',  text: 'Streak não resetava corretamente em fusos horários UTC-5 e UTC+9' },
      { type: 'imp',  text: 'App PWA: cache offline aprimorado para funcionamento sem internet por até 72h' },
    ],
  },
  {
    version: 'v0.8.0', date: '22 mar 2026', badge: 'Beta público', badgeColor: '#f59e0b',
    changes: [
      { type: 'new',  text: 'Abertura do beta público — primeiros 500 usuários externos' },
      { type: 'new',  text: 'Central IA com Claude Sonnet 4.6 para planos Pro e Flow+' },
      { type: 'new',  text: 'Exportação de dados em JSON e CSV via configurações do perfil' },
      { type: 'imp',  text: 'Life Score: algoritmo v2 com correção sazonal e normalização de feriados' },
    ],
  },
]

const typeLabel: Record<string, { label: string; color: string }> = {
  new: { label: 'Novo', color: '#10b981' },
  fix: { label: 'Correção', color: '#f59e0b' },
  imp: { label: 'Melhoria', color: '#3b82f6' },
}

export default function ChangelogPage() {
  return (
    <PublicShell>
      <p className="pub-section-label">Changelog</p>
      <h1 className="pub-h1">
        O que mudou no<br />
        <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>FlowOS.</span>
      </h1>
      <p className="pub-body" style={{ maxWidth: 520, marginBottom: 64 }}>
        Cada versão conta uma história de iteração. Acompanhe as mudanças em tempo real.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 5, top: 12, bottom: 0, width: 1, background: 'rgba(255,255,255,0.06)' }} />

        {RELEASES.map(({ version, date, badge, badgeColor, changes }) => (
          <div key={version} style={{ paddingLeft: 36, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 8, width: 11, height: 11, borderRadius: '50%', background: '#04040e', border: '2px solid rgba(59,130,246,0.6)', boxShadow: '0 0 8px rgba(59,130,246,0.4)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{version}</span>
              {badge && <span style={{ fontSize: 10, color: badgeColor, background: `${badgeColor}18`, border: `1px solid ${badgeColor}35`, borderRadius: 6, padding: '3px 9px', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{badge}</span>}
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{date}</span>
            </div>

            <div className="pub-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {changes.map(({ type, text }, i) => {
                const { label, color } = typeLabel[type]
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 9, color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 5, padding: '3px 7px', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{label}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, fontWeight: 300 }}>{text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </PublicShell>
  )
}
