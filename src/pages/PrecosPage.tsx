import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, Zap, Cpu, Crown, ArrowLeft, ChevronDown, ChevronUp, Copy, CheckCheck, Tag } from 'lucide-react'
import { isSupabaseConfigured } from '../services/supabase'
import { createCheckoutSession } from '../services/billing'
import type { BillingPlan } from '../services/billing'
import { track, Events } from '../services/analytics'
import LanguageSwitcher from '../components/LanguageSwitcher'

type CompareRow = { label: string; s: boolean; p: boolean; f: boolean }
type FAQ = { q: string; a: string }

export default function PrecosPage() {
  const { t, i18n } = useTranslation(['pricing', 'common', 'auth'])
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState<BillingPlan | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)

  function copyPromoCode() {
    navigator.clipboard.writeText('PH10OFF').then(() => {
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    })
  }

  const faqs        = t('faqs',         { returnObjects: true }) as FAQ[]
  const compareRows = t('compare_rows', { returnObjects: true }) as CompareRow[]

  const PLANS = [
    {
      id: 'starter' as BillingPlan,
      name: t('common:plan_starter'),
      price: t('starter_price'),
      trial: t('trial_badge'),
      desc: t('starter_desc'),
      icon: Zap,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
      features: t('starter_features', { returnObjects: true }) as string[],
      cta: t('cta_start_free'),
    },
    {
      id: 'pro' as BillingPlan,
      name: t('common:plan_pro'),
      price: t('pro_price'),
      badge: t('most_popular'),
      desc: t('pro_desc'),
      icon: Cpu,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)',
      highlight: true,
      features: t('pro_features', { returnObjects: true }) as string[],
      cta: t('cta_subscribe_pro'),
    },
    {
      id: 'flowplus' as BillingPlan,
      name: t('common:plan_flowplus'),
      price: t('flowplus_price'),
      desc: t('flowplus_desc'),
      icon: Crown,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
      features: t('flowplus_features', { returnObjects: true }) as string[],
      cta: t('cta_contact'),
    },
  ]

  async function handlePlan(plan: BillingPlan) {
    if (!isSupabaseConfigured) { navigate('/login'); return }
    if (plan === 'flowplus') {
      window.location.href = 'mailto:flowosapp@gmail.com?subject=Flow%2B%20-%20Interesse'
      return
    }
    setLoadingPlan(plan)
    track(Events.CHECKOUT_STARTED, { plan })
    try {
      const { url } = await createCheckoutSession({ plan, locale: i18n.language })
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
            {t('common:back')}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', borderRadius: 10, padding: '6px 10px' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Flow</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>OS</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageSwitcher />
            <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 16px', color: '#f2f2f5', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              {t('sign_in', { ns: 'auth' })}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 600, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            {t('title')}
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 16px' }}>
            <span style={{ background: 'linear-gradient(135deg,#fff 30%,#3b82f6 70%,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t('subtitle')}
            </span>
          </h1>
          <p style={{ fontSize: 18, color: '#9898a8', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            {t('desc')}
          </p>
        </div>

        {/* Promo Banner */}
        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(139,92,246,0.22)', borderRadius: 16, padding: '14px 20px', marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Tag size={15} color="#a78bfa" />
          <span style={{ fontSize: 13, color: '#c4b5fd', lineHeight: 1.5 }}>
            Código <strong style={{ color: '#fff' }}>Product Hunt</strong>: use{' '}
            <button
              onClick={copyPromoCode}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 6, padding: '2px 10px', color: '#e9d5ff', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.25)')}
            >
              PH10OFF
              {codeCopied ? <CheckCheck size={12} color="#86efac" /> : <Copy size={12} />}
            </button>{' '}
            no checkout e ganhe <strong style={{ color: '#a78bfa' }}>3 meses grátis no PRO</strong>
          </span>
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
                {'badge' in plan && plan.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.gradient, borderRadius: 20, padding: '4px 16px', fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                    ★ {plan.badge}
                  </div>
                )}
                {plan.id === 'pro' && (
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: 8, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: '#c4b5fd', letterSpacing: '0.04em' }}>
                    <Tag size={9} />
                    PH10OFF · 3 meses grátis
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
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 14, color: '#62627a', marginLeft: 4 }}>{t('per_month')}</span>
                </div>

                {'trial' in plan && plan.trial && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#34d399', marginBottom: 16, width: 'fit-content' }}>
                    ✦ {plan.trial}
                  </div>
                )}

                <p style={{ fontSize: 13, color: '#9898a8', lineHeight: 1.6, marginBottom: 24 }}>{plan.desc}</p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
                  {Array.isArray(plan.features) && plan.features.map((f: string) => (
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
          <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 32 }}>{t('compare')}</h2>
          <div style={{ background: '#0b0b0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, color: '#62627a', fontWeight: 500 }}>—</th>
                  {PLANS.map(p => (
                    <th key={p.id} style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#f2f2f5', width: 100 }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(compareRows) && compareRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < compareRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: '#9898a8' }}>{row.label}</td>
                    {[row.s, row.p, row.f].map((has, j) => (
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
          <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 32 }}>{t('faq_title')}</h2>
          {Array.isArray(faqs) && faqs.map((faq, i) => (
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
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px' }}>{t('bottom_cta')}</h2>
          <p style={{ fontSize: 15, color: '#9898a8', margin: '0 0 28px' }}>{t('bottom_desc')}</p>
          <button
            onClick={() => handlePlan('starter')}
            disabled={loadingPlan === 'starter'}
            style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', border: 'none', borderRadius: 12, padding: '14px 36px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
          >
            {t('cta_start_free')}
          </button>
        </div>

      </div>
    </div>
  )
}
