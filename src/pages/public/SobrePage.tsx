import { PublicShell } from '../../components/PublicShell'
import { Zap, Brain, Heart, TrendingUp } from 'lucide-react'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

export default function SobrePage() {
  return (
    <PublicShell>
      <p className="pub-section-label">Nossa história</p>
      <h1 className="pub-h1">
        Construído por pessoas que<br />
        <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>sentiram a falta disso.</span>
      </h1>
      <p className="pub-body" style={{ maxWidth: 640, marginBottom: 64 }}>
        O FlowOS nasceu da frustração de tentar conectar dezenas de apps de produtividade, saúde e finanças que nunca conversavam entre si. Queríamos um único lugar que entendesse nossa vida como um sistema — não como silos separados.
      </p>

      <div className="pub-divider" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 64 }}>
        {[
          { Icon: Zap,        color: '#3b82f6', title: 'Missão',  text: 'Dar a cada pessoa um sistema operacional para sua vida — inteligente, integrado e que aprende com ela.' },
          { Icon: Brain,      color: '#8b5cf6', title: 'Visão',   text: 'Ser a plataforma central de bem-estar e performance pessoal da próxima geração de high-performers.' },
          { Icon: Heart,      color: '#ef4444', title: 'Valores', text: 'Privacidade por padrão, design que respeita o usuário, IA que augmenta — nunca substitui — o julgamento humano.' },
          { Icon: TrendingUp, color: '#10b981', title: 'Produto', text: 'Cada feature nasce de dados reais. Nada de roadmap por vaidade — apenas o que move o Life Score de verdade.' },
        ].map(({ Icon, color, title, text }) => (
          <div key={title} className="pub-card">
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Icon size={17} color={color} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{title}</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, fontWeight: 300 }}>{text}</p>
          </div>
        ))}
      </div>

      <div className="pub-divider" />

      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Quem somos</h2>
      <p className="pub-body" style={{ maxWidth: 640, marginBottom: 32 }}>
        Somos uma equipe compacta e intencional — engenheiros, designers e pesquisadores que acreditam que tecnologia deve servir à vida humana, não o contrário. Trabalhamos remotamente, com base no Brasil, construindo produtos que usamos todos os dias.
      </p>
      <p className="pub-body" style={{ maxWidth: 640 }}>
        Se você quer construir o futuro do bem-estar pessoal com a gente, confira nossas vagas abertas em <span style={{ color: '#93c5fd', cursor: 'pointer' }}>Carreiras</span>.
      </p>
    </PublicShell>
  )
}
