import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ArrowRight, Check, Instagram, Twitter } from 'lucide-react'

const LAUNCH_DATE = new Date('2026-06-08T00:00:00-03:00')
const BLUE  = '#3b82f6'
const CYAN  = '#06b6d4'
const grad  = 'linear-gradient(135deg, #3b82f6, #06b6d4)'
const sans  = "'Inter', -apple-system, sans-serif"

// ── Countdown ─────────────────────────────────────────────────────────────────

function getTimeLeft() {
  const diff = LAUNCH_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done:    false,
  }
}

function CountUnit({ value, label }: { value: number; label: string }) {
  const prev = useRef(value)
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    if (prev.current !== value) {
      setFlip(true)
      const t = setTimeout(() => setFlip(false), 300)
      prev.current = value
      return () => clearTimeout(t)
    }
  }, [value])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}>
      <div style={{
        position: 'relative', width: 80, height: 88,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 32px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(59,130,246,0.04) 0%, transparent 100%)' }} />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: flip ? -30 : 0, opacity: flip ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', zIndex: 1 }}
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 10, fontWeight: 500 }}>
        {label}
      </span>
    </div>
  )
}

// ── Particles ──────────────────────────────────────────────────────────────────

function Particles() {
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <motion.div
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity }}
        style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%)', top: '-20%', left: '-10%', filter: 'blur(80px)' }}
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, -60, 0] }}
        transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity }}
        style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)', bottom: '10%', right: '-10%', filter: 'blur(80px)' }}
      />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 11, ease: 'easeInOut', repeat: Infinity }}
        style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)', top: '40%', left: '40%', filter: 'blur(60px)' }}
      />
    </div>
  )
}

// ── Plan selector ──────────────────────────────────────────────────────────────

const PLANS = [
  { id: 'starter', label: 'Starter', price: 'R$ 29,90', note: '/mês · 15 dias grátis', color: BLUE },
  { id: 'pro',     label: 'Pro',     price: 'R$ 49,90', note: '/mês',                  color: '#8b5cf6', badge: 'Popular' },
  { id: 'flow',    label: 'Flow+',   price: 'R$ 249,90',note: '/mês · API + automações', color: CYAN },
]

// ── Main ───────────────────────────────────────────────────────────────────────

export default function LaunchPage() {
  const [timeLeft, setTimeLeft]   = useState(getTimeLeft())
  const [email, setEmail]         = useState('')
  const [name, setName]           = useState('')
  const [plan, setPlan]           = useState('starter')
  const [status, setStatus]       = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg]   = useState('')
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null)

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetch('/api/waitlist')
      .then(r => r.json())
      .then(d => setWaitlistCount(d.count ?? null))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), plan, source: 'launch_page' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao cadastrar.')
      setStatus('done')
      setWaitlistCount(c => (c ?? 0) + 1)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Tente novamente.')
      setStatus('error')
    }
  }

  return (
    <div style={{ background: '#04040e', minHeight: '100vh', color: '#e2e8f0', fontFamily: sans, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Particles />

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, padding: 'clamp(16px,3vw,24px) clamp(20px,5vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}>
            <Zap size={14} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase' }}>FLOWOS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="https://instagram.com/flowosapp.io" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
            <Instagram size={18} />
          </a>
          <a href="https://twitter.com/flowosapp" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
            <Twitter size={18} />
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'clamp(32px,6vw,64px) clamp(20px,5vw,48px)' }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 100, marginBottom: 32 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE, boxShadow: `0 0 8px ${BLUE}`, animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: '#93c5fd', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Lançamento em 08/06/2026</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ fontSize: 'clamp(36px,6vw,80px)', fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.0, marginBottom: 20, maxWidth: 800 }}
        >
          Seu Life OS está<br />
          <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            quase pronto.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 52, maxWidth: 520 }}
        >
          Hábitos, IA, finanças, foco e saúde em um único painel.<br />
          Um número que mede sua vida inteira: o <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Life Score</strong>.
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(8px,2vw,20px)', marginBottom: 60 }}
        >
          <CountUnit value={timeLeft.days}    label="dias" />
          <span style={{ fontSize: 36, fontWeight: 900, color: 'rgba(59,130,246,0.4)', marginTop: 20, lineHeight: 1 }}>:</span>
          <CountUnit value={timeLeft.hours}   label="horas" />
          <span style={{ fontSize: 36, fontWeight: 900, color: 'rgba(59,130,246,0.4)', marginTop: 20, lineHeight: 1 }}>:</span>
          <CountUnit value={timeLeft.minutes} label="min" />
          <span style={{ fontSize: 36, fontWeight: 900, color: 'rgba(59,130,246,0.4)', marginTop: 20, lineHeight: 1 }}>:</span>
          <CountUnit value={timeLeft.seconds} label="seg" />
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{ width: '100%', maxWidth: 520 }}
        >
          {status === 'done' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 16, padding: '28px 32px', textAlign: 'center' }}
            >
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                {name.trim() ? `${name.trim().split(' ')[0]}, você está na lista! 🎉` : 'Você está na lista! 🎉'}
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>
                Enviamos um e-mail de confirmação para <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{email}</strong>.<br />
                No dia <strong style={{ color: '#fff' }}>08/06</strong> você será um dos primeiros a acessar o trial de 15 dias.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Plan selector */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {PLANS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id)}
                    style={{
                      flex: 1, padding: '10px 6px', borderRadius: 12, cursor: 'pointer',
                      background: plan === p.id ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${plan === p.id ? p.color + '50' : 'rgba(255,255,255,0.08)'}`,
                      color: plan === p.id ? '#fff' : 'rgba(255,255,255,0.45)',
                      fontSize: 11, fontWeight: 700, fontFamily: sans, transition: 'all 0.18s',
                      position: 'relative',
                    }}
                  >
                    {p.badge && (
                      <span style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', fontSize: 8, background: '#8b5cf6', color: '#fff', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                        {p.badge}
                      </span>
                    )}
                    <div style={{ marginBottom: 2 }}>{p.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: plan === p.id ? p.color : 'rgba(255,255,255,0.3)' }}>{p.price}</div>
                  </button>
                ))}
              </div>

              {/* Name + Email */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: 160, flexShrink: 0, padding: '14px 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                    color: '#fff', fontSize: 14, fontFamily: sans, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1, padding: '14px 16px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                    color: '#fff', fontSize: 14, fontFamily: sans, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                style={{
                  width: '100%', padding: '15px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: status === 'loading' ? 'rgba(59,130,246,0.4)' : grad,
                  color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: sans,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 0 32px rgba(59,130,246,0.25)', transition: 'opacity 0.2s',
                  opacity: (!email.trim() || status === 'loading') ? 0.6 : 1,
                }}
              >
                {status === 'loading' ? 'Enviando…' : (<>Garantir minha vaga <ArrowRight size={16} /></>)}
              </button>

              {status === 'error' && (
                <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8, textAlign: 'left' }}>{errorMsg}</p>
              )}

              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 10, lineHeight: 1.6 }}>
                Sem spam. No dia do lançamento você receberá seu link de acesso + 15 dias de trial grátis.
              </p>
            </form>
          )}
        </motion.div>

        {/* Social proof — contador real */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: 44, display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div style={{ display: 'flex' }}>
            {['🧠', '⚡', '🎯', '💪', '🚀'].map((emoji, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${210 + i * 30},80%,${30 + i * 5}%)`, border: '2px solid #04040e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginLeft: i > 0 ? -10 : 0 }}>
                {emoji}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            {waitlistCount !== null && waitlistCount > 0
              ? <><strong style={{ color: 'rgba(255,255,255,0.7)' }}>{waitlistCount.toLocaleString('pt-BR')}</strong> pessoas já garantiram sua vaga</>
              : 'Junte-se à lista de espera'
            }
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, padding: '20px clamp(20px,5vw,48px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>© 2026 FlowOS · Lançamento 08/06/2026</p>
        <div style={{ display: 'flex', gap: 20 }}>
          {[{ label: 'Privacidade', path: '/privacidade' }, { label: 'Termos', path: '/termos' }].map(({ label, path }) => (
            <a key={path} href={path} style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>
              {label}
            </a>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  )
}
