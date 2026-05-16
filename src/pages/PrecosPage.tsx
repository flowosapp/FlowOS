import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Zap, Cpu, Crown, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { isSupabaseConfigured } from '../services/supabase'
import { createCheckoutSession } from '../services/billing'
import type { BillingPlan } from '../services/billing'
import { track, Events } from '../services/analytics'

const PLANS = [
  {
    id: 'starter' as BillingPlan,
    name: 'Starter',
    price: 29,
    trial: '15 dias grátis',
    desc: 'Para quem quer começar com o essencial e sentir o poder de um sistema de vida.',
    icon: Zap,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
    features: [
      'Dashboard + Life Score',
      'Hábitos e Projetos ilimitados',
      'Modo Foco (Pomodoro)',
      'Finanças básicas',
      'App mobile (PWA)',
      'Suporte por e-mail',
    ],
    cta: 'Começar grátis',
  },
  {
    id: 'pro' as BillingPlan,
    name: 'Pro',
    price: 49,
    badge: 'Mais popular',
    desc: 'Para quem leva a sério e quer IA desbloqueada com análises profundas da sua vida.',
    icon: Cpu,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)',
    highlight: true,
    features: [
      'Tudo do Starter',
      'Central IA ilimitada',
      'Finanças avançadas + metas',
      'Relatórios semanais com IA',
      'Saúde & Sono avançados',
      'Suporte prioritário',
    ],
    cta: 'Assinar Pro',
  },
  {
    id: 'flowplus' as BillingPlan,
    name: 'Flow+',
    price: 129,
    desc: 'Para high-performers que exigem o máximo de tecnologia, controle e suporte dedicado.',
    icon: Crown,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    features: [
      'Tudo do Pro',
      'IA avançada (Claude Opus)',
      'Múltiplos perfis/famílias',
      'Acesso à API pública',
      'Onboarding 1:1 personalizado',
      'SLA de suporte dedicado',
    ],
    cta: 'Falar com time',
  },
]

const FAQS = [
  { q: 'Como funciona o período de teste gratuito?', a: 'Você tem 15 dias completos do plano Starter preenchendo os dados do cartão. O valor só é cobrado no 16º dia. Cancele a qualquer momento antes disso sem nenhuma cobrança.' },
  { q: 'Posso mudar de plano depois?', a: 'Sim. Upgrade ou downgrade a qualquer momento pelo painel. Upgrades têm efeito imediato com crédito proporcional. Sem taxas de cancelamento.' },
  { q: 'Meus dados ficam salvos se eu cancelar?', a: 'Seus dados ficam armazenados por 30 dias após o cancelamento. Você pode reativar e retomar de onde parou.' },
  { q: 'A Central IA usa qual modelo?', a: 'O plano Pro usa Gemini 2.0 Flash com contexto completo da sua vida. O Flow+ tem acesso a modelos ainda mais avançados com memória de longo prazo.' },
  { q: 'Existe desconto para pagamento anual?', a: 'Em breve. Estamos preparando os planos anuais com até 30% de desconto. Entre na lista de espera pelo perfil.' },
]

const COMPARE = [
  { feature: 'Life Score & Dashboard',      starter: true,  pro: true,  plus: true  },
  { feature: 'Hábitos ilimitados',           starter: true,  pro: true,  plus: true  },
  { feature: 'Projetos e tarefas',           starter: true,  pro: true,  plus: true  },
  { feature: 'Modo Foco (Pomodoro)',          starter: true,  pro: true,  plus: true  },
  { feature: 'App mobile (PWA)',             starter: true,  pro: true,  plus: true  },
  { feature: 'Finanças avançadas',           starter: false, pro: true,  plus: true  },
  { feature: 'Central IA ilimitada',         starter: false, pro: true,  plus: true  },
  { feature: 'Relatórios semanais por IA',   starter: false, pro: true,  plus: true  },
  { feature: 'Saúde & Sono avançados',       starter: false, pro: true,  plus: true  },
  { feature: 'IA avançada (Claude Opus)',    starter: false, pro: false, plus: true  },
  { feature: 'Múltiplos perfis',             starter: false, pro: false, plus: true  },
  { feature: 'API pública',                  starter: false, pro: false, plus: true  },
  { feature: 'Onboarding 1:1',               starter: false, pro: false, plus: true  },
  { feature: 'SLA dedicado',                 starter: false, pro: false, plus: true  },
]

export default function PrecosPage() {
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState<BillingPlan | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  async function handlePlan(plan: BillingPlan) {
    if (!isSupabaseConfigured) {
      navigate('/login')
      return
    }
    if (plan === 'flowplus') {
      window.location.href = 'mailto:flowosapp@gmail.com?subject=Flow%2B%20-%20Interesse'
      return
    }
    setLoadingPlan(plan)
    track(Events.CHECKOUT_STARTED, { plan })
    try {
      const { url } = await createCheckoutSession({ plan })
      window.location.href = url
    } catch {
      setLoadingPlan(null)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#060608', color: '#f2f2f5' }}>

      {/* Nav */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', background: 'rgba(6,6,8,0.8)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#9898a8', cursor: 'pointer', fontSize: 14 }}>
            <ArrowLeft size={16} />
            Voltar
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', borderRadius: 10, padding: '6px 10px' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Flow</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>OS</span>
            </div>
          </div>
          <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 16px', color: '#f2f2f5', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Entrar
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 600, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            Planos & Preços
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 16px' }}>
            Invista no seu<br />
            <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>sistema de vida</span>
          </h1>
          <p style={{ fontSize: 18, color: '#9898a8', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            Comece grátis por 15 dias. Sem compromisso. Cancele quando quiser.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 64 }}>
          {PLANS.map(plan => {
            const Icon = plan.icon
            const isLoading = loadingPlan === plan.id
            return (
              <div
                key={plan.id}
                style={{
                  background: plan.highlight ? 'rgba(59,130,246,0.05)' : '#0b0b0f',
                  border: `1px solid ${plan.highlight ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 20,
                  padding: 28,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  transform: plan.highlight ? 'scale(1.02)' : 'none',
                }}
              >
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.gradient, borderRadius: 20, padding: '4px 16px', fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                    ★ {plan.badge}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}30`, borderRadius: 12, padding: 10 }}>
                    <Icon size={20} color={plan.color} />
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{plan.name}</span>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.03em', background: plan.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    R$ {plan.price}
                  </span>
                  <span style={{ fontSize: 14, color: '#62627a', marginLeft: 4 }}>/mês</span>
                </div>

                {plan.trial && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#34d399', marginBottom: 16, width: 'fit-content' }}>
                    ✦ {plan.trial}
                  </div>
                )}

                <p style={{ fontSize: 13, color: '#9898a8', lineHeight: 1.6, marginBottom: 24 }}>{plan.desc}</p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#d0d0dc', marginBottom: 10 }}>
                      <Check size={14} color={plan.color} style={{ flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlan(plan.id)}
                  disabled={isLoading}
                  style={{
                    background: plan.highlight ? plan.gradient : 'rgba(255,255,255,0.06)',
                    border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '13px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#fff',
                    cursor: isLoading ? 'default' : 'pointer',
                    width: '100%',
                    opacity: isLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {isLoading
                    ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    : plan.cta}
                </button>
              </div>
            )
          })}
        </div>

        {/* Comparison table */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 32 }}>Comparativo completo</h2>
          <div style={{ background: '#0b0b0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, color: '#62627a', fontWeight: 500 }}>Recurso</th>
                  {PLANS.map(p => (
                    <th key={p.id} style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#f2f2f5', width: 100 }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row.feature} style={{ borderBottom: i < COMPARE.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: '#9898a8' }}>{row.feature}</td>
                    {[row.starter, row.pro, row.plus].map((has, j) => (
                      <td key={j} style={{ padding: '13px 20px', textAlign: 'center' }}>
                        {has
                          ? <Check size={16} color={PLANS[j].color} style={{ margin: '0 auto', display: 'block' }} />
                          : <span style={{ color: '#3e3e52', fontSize: 18, lineHeight: 1 }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 680, margin: '0 auto 64px' }}>
          <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 32 }}>Perguntas frequentes</h2>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 1 }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', padding: '20px 0', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: '#f2f2f5' }}>{faq.q}</span>
                {openFaq === i ? <ChevronUp size={16} color="#62627a" /> : <ChevronDown size={16} color="#62627a" />}
              </button>
              {openFaq === i && (
                <p style={{ margin: '0 0 20px', fontSize: 14, color: '#9898a8', lineHeight: 1.7 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', background: '#0b0b0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '48px 32px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px' }}>Pronto para começar?</h2>
          <p style={{ fontSize: 15, color: '#9898a8', margin: '0 0 28px' }}>15 dias grátis. Sem cartão necessário para cancelar.</p>
          <button
            onClick={() => handlePlan('starter')}
            disabled={loadingPlan === 'starter'}
            style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', border: 'none', borderRadius: 12, padding: '14px 36px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
          >
            Começar grátis agora
          </button>
        </div>

      </div>
    </div>
  )
}
