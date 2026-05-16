import { useState } from 'react'
import { PublicShell } from '../../components/PublicShell'
import { ChevronRight } from 'lucide-react'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

const SECTIONS = [
  {
    title: 'Introdução', color: '#3b82f6', items: [
      { name: 'O que é o FlowOS', desc: 'Entenda a filosofia por trás do Life Operating System.' },
      { name: 'Primeiros passos', desc: 'Configure sua conta, hábitos iniciais e o Life Score em 5 minutos.' },
      { name: 'Tour pela interface', desc: 'Um guia visual por todas as seções do dashboard.' },
    ],
  },
  {
    title: 'Life Score', color: '#8b5cf6', items: [
      { name: 'Como o score é calculado', desc: 'Entenda os pesos de cada dimensão: Hábitos, Foco, Saúde, Finanças, Streak.' },
      { name: 'Dimensões do score', desc: 'Detalhamento técnico de cada categoria e suas sub-métricas.' },
      { name: 'Histórico e tendências', desc: 'Como ler os gráficos de evolução do seu score ao longo do tempo.' },
    ],
  },
  {
    title: 'Central IA', color: '#06b6d4', items: [
      { name: 'Contexto e memória', desc: 'Como a IA usa seu histórico para gerar insights personalizados.' },
      { name: 'Prompts eficazes', desc: 'Como fazer as perguntas certas para obter análises mais profundas.' },
      { name: 'Limites e privacidade', desc: 'O que a IA vê e o que nunca é compartilhado.' },
    ],
  },
  {
    title: 'Integrações', color: '#10b981', items: [
      { name: 'API pública (Flow+)', desc: 'Documentação da API REST para conectar ferramentas externas.' },
      { name: 'Webhooks', desc: 'Configure notificações em tempo real para eventos do FlowOS.' },
      { name: 'Exportação de dados', desc: 'Exporte todo seu histórico em JSON ou CSV a qualquer momento.' },
    ],
  },
]

export default function DocsPage() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <PublicShell>
      <p className="pub-section-label">Documentação</p>
      <h1 className="pub-h1">
        Tudo que você precisa<br />
        <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>para dominar o FlowOS.</span>
      </h1>
      <p className="pub-body" style={{ maxWidth: 560, marginBottom: 64 }}>
        Guias, referências e exemplos para extrair o máximo do sistema. Em construção — novos artigos toda semana.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {SECTIONS.map(({ title, color, items }) => (
          <div key={title}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>{title}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map(({ name, desc }) => (
                <div key={name}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', background: active === name ? `${color}10` : 'rgba(255,255,255,0.02)', border: `1px solid ${active === name ? `${color}35` : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => setActive(name)} onMouseLeave={() => setActive(null)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>{desc}</div>
                  </div>
                  <ChevronRight size={15} color={active === name ? color : 'rgba(255,255,255,0.2)'} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 64, padding: '28px 32px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 16 }}>
        <p style={{ fontSize: 15, color: '#fff', fontWeight: 600, marginBottom: 6 }}>Não encontrou o que procurava?</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>Fale com o suporte em <span style={{ color: '#c4b5fd' }}>suporte@flowosapp.io</span> — respondemos em menos de 4 horas nos dias úteis.</p>
      </div>
    </PublicShell>
  )
}
