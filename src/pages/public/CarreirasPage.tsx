import { PublicShell } from '../../components/PublicShell'
import { ArrowRight } from 'lucide-react'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

const OPENINGS = [
  { area: 'Engenharia', role: 'Senior Full-Stack Engineer', level: 'Sênior', type: 'Remoto', color: '#3b82f6', desc: 'React, TypeScript, Supabase. Você vai construir features que afetam o Life Score de milhares de pessoas.' },
  { area: 'IA & Data', role: 'AI Product Engineer', level: 'Sênior', type: 'Remoto', color: '#8b5cf6', desc: 'Integração com Claude API, análise de padrões comportamentais, construção de pipelines de insights personalizados.' },
  { area: 'Design', role: 'Product Designer', level: 'Pleno/Sênior', type: 'Remoto', color: '#06b6d4', desc: 'Motion design, sistemas de design, UX para complexidade cognitiva zero. Figma + Framer obrigatório.' },
  { area: 'Crescimento', role: 'Growth Lead', level: 'Sênior', type: 'Remoto / SP', color: '#10b981', desc: 'Produto-led growth, onboarding optimization, loops de retenção. Não é marketing tradicional.' },
]

const PERKS = [
  '100% remoto, sem microgerenciamento',
  'Equity desde o primeiro dia',
  'Budget de R$ 500/mês para aprendizado',
  'Plano de saúde premium (Bradesco)',
  'FlowOS Pro vitalício para você e família',
  'Workation de 30 dias por ano',
]

export default function CarreirasPage() {
  return (
    <PublicShell>
      <p className="pub-section-label">Carreiras</p>
      <h1 className="pub-h1">
        Construa o sistema<br />
        <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>que opera vidas.</span>
      </h1>
      <p className="pub-body" style={{ maxWidth: 580, marginBottom: 64 }}>
        Somos um time pequeno com impacto desproporcional. Se você quer construir produto que as pessoas usam todo dia — e que melhora vidas de verdade — este é o lugar.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Vagas abertas</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 64 }}>
        {OPENINGS.map(({ area, role, level, type, color, desc }) => (
          <div key={role} className="pub-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 20, cursor: 'pointer', transition: 'border-color 0.3s, transform 0.3s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}40`; (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(0)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, color, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 6, padding: '3px 9px', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{area}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{level} · {type}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{role}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontWeight: 300 }}>{desc}</p>
            </div>
            <ArrowRight size={18} color={color} style={{ flexShrink: 0, marginTop: 4 }} />
          </div>
        ))}
      </div>

      <div className="pub-divider" />

      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Por que trabalhar aqui</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {PERKS.map(perk => (
          <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, boxShadow: '0 0 8px rgba(59,130,246,0.5)' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}>{perk}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48, padding: '28px 32px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16 }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Não encontrou sua vaga?</p>
        <p style={{ fontSize: 15, color: '#fff', fontWeight: 500 }}>Mande seu currículo para <span style={{ color: '#93c5fd' }}>careers@flowos.app</span></p>
      </div>
    </PublicShell>
  )
}
