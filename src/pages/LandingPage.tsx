import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  motion, AnimatePresence, useScroll, useTransform,
  useSpring, useMotionValue, useInView, type Variants,
} from 'framer-motion'
import {
  ArrowRight, Check, ChevronDown, Zap, Brain,
  TrendingUp, Heart, BookOpen, Timer, Star, Menu, X, Sparkles,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Plan = {
  name: string; price: string; priceNote: string
  trial?: string; badge?: string; desc: string
  features: string[]; highlight?: boolean; cta: string; accent: string
}
type Testimonial = { name: string; role: string; avatar: string; text: string; score: number }
type FaqItem = { q: string; a: string }

// ─── Data ─────────────────────────────────────────────────────────────────────

const MARQUEE = [
  'Life Score', 'Hábitos', 'Inteligência Artificial', 'Finanças',
  'Modo Foco', 'Saúde', 'Crescimento', 'Sono', 'Produtividade', 'Streaks', 'Metas', 'Bem-estar',
]

const PLANS: Plan[] = [
  {
    name: 'Starter', price: 'R$ 29', priceNote: '/mês', trial: '15 dias grátis',
    desc: 'Para quem quer começar com o essencial e sentir o poder de um sistema de vida.',
    features: ['Dashboard + Life Score', 'Hábitos e Projetos ilimitados', 'Modo Foco (Pomodoro)', 'Finanças básicas', 'App mobile (PWA)', 'Suporte por e-mail'],
    cta: 'Começar grátis', accent: 'rgba(255,255,255,0.06)',
  },
  {
    name: 'Pro', price: 'R$ 49', priceNote: '/mês', badge: 'Mais popular',
    desc: 'Para quem leva a sério e quer IA desbloqueada com análises profundas da sua vida.',
    features: ['Tudo do Starter', 'Central IA ilimitada', 'Finanças avançadas + metas', 'Relatórios semanais com IA', 'Saúde & Sono avançados', 'Suporte prioritário'],
    highlight: true, cta: 'Assinar Pro', accent: '#3b82f6',
  },
  {
    name: 'Flow+', price: 'R$ 129', priceNote: '/mês',
    desc: 'Para high-performers que exigem o máximo de tecnologia, controle e suporte dedicado.',
    features: ['Tudo do Pro', 'IA avançada (Claude Opus)', 'Múltiplos perfis/famílias', 'Acesso à API pública', 'Onboarding 1:1 personalizado', 'SLA de suporte dedicado'],
    cta: 'Falar com time', accent: '#8b5cf6',
  },
]

const TESTIMONIALS: Testimonial[] = [
  { name: 'Lucas Ferreira', role: 'CTO · Startup de Fintech', avatar: 'LF', text: 'Em 3 semanas meu Life Score saiu de 42 para 78. O FlowOS conecta produtividade com saúde de forma que nenhum outro app consegue.', score: 78 },
  { name: 'Mariana Costa', role: 'Product Manager · Scale-up', avatar: 'MC', text: 'A Central IA entende meu contexto real. Ela sabe que quando durmo mal minha produtividade cai — e me avisa antes de acontecer.', score: 85 },
  { name: 'Rafael Oliveira', role: 'Empreendedor Serial', avatar: 'RO', text: 'Testei 11 apps nos últimos 2 anos. O FlowOS é o primeiro que cria hábito real. Meu streak de 60 dias fala por si só.', score: 91 },
  { name: 'Juliana Santos', role: 'Designer · Agência Criativa', avatar: 'JS', text: 'Finalmente um app bonito que também funciona. O Modo Foco com o Life Score dobrou minha produtividade criativa.', score: 72 },
  { name: 'Pedro Alves', role: 'Engenheiro de Software', avatar: 'PA', text: 'Controle financeiro integrado com hábitos foi um game-changer. Economizei R$2.400 no primeiro mês com os insights da IA.', score: 88 },
  { name: 'Ana Lima', role: 'Médica · Residência', avatar: 'AL', text: 'Como médica com 12h/dia de trabalho, o FlowOS me ajuda a manter saúde mental e física em equilíbrio. O módulo de sono é preciso.', score: 83 },
]

const FAQS: FaqItem[] = [
  { q: 'Como funciona o período de teste gratuito?', a: 'Você tem 15 dias completos do plano Starter sem precisar de cartão de crédito. Acesso total a todos os recursos. No D+15 você escolhe continuar ou cancelar — sem cobranças surpresa.' },
  { q: 'O FlowOS funciona offline?', a: 'Sim. O FlowOS é um PWA com cache inteligente. Você pode registrar hábitos, sessões de foco e transações sem internet. Os dados sincronizam automaticamente quando a conexão retorna.' },
  { q: 'Meus dados ficam seguros?', a: 'Todos os dados são criptografados em trânsito e em repouso via Supabase com Row Level Security. Nunca vendemos dados para terceiros. Você pode exportar ou deletar tudo a qualquer momento.' },
  { q: 'Como o Life Score é calculado?', a: 'O Life Score (0-100) é calculado diariamente: Hábitos 30% + Tarefas & Projetos 25% + Streak 20% + Sessões de Foco 15% + Saúde Financeira 10%.' },
  { q: 'Posso migrar de plano a qualquer momento?', a: 'Sim, upgrade ou downgrade a qualquer momento. Upgrades têm efeito imediato com crédito proporcional. Sem taxas de cancelamento.' },
  { q: 'A Central IA usa qual modelo?', a: 'O plano Pro usa Claude Sonnet com contexto completo da sua vida. O Flow+ tem acesso ao Claude Opus — o modelo mais avançado — com memória de longo prazo.' },
]

const HOW_STEPS = [
  { num: '01', icon: Brain, title: 'Conecte sua vida', desc: 'Registre hábitos, finanças, sono e sessões de foco. O FlowOS estrutura tudo em um sistema unificado e inteligente.' },
  { num: '02', icon: TrendingUp, title: 'A IA aprende com você', desc: 'Em dias, a Central IA identifica padrões e correlações que você nunca perceberia sozinho — entre sono, produtividade e finanças.' },
  { num: '03', icon: Zap, title: 'Opere em modo elite', desc: 'Com o Life Score como bússola, cada decisão passa a ser guiada por dados reais da sua vida. Não por intuição.' },
]

const COMPARE = [
  { label: 'Life Score diário', s: true, p: true, f: true },
  { label: 'Hábitos ilimitados', s: true, p: true, f: true },
  { label: 'Modo Foco (Pomodoro)', s: true, p: true, f: true },
  { label: 'Finanças básicas', s: true, p: true, f: true },
  { label: 'Central IA', s: false, p: true, f: true },
  { label: 'Finanças avançadas + metas', s: false, p: true, f: true },
  { label: 'Relatórios semanais IA', s: false, p: true, f: true },
  { label: 'Saúde avançada + HRV', s: false, p: true, f: true },
  { label: 'Claude Opus (IA premium)', s: false, p: false, f: true },
  { label: 'Múltiplos perfis', s: false, p: false, f: true },
  { label: 'Acesso à API', s: false, p: false, f: true },
  { label: 'Onboarding 1:1', s: false, p: false, f: true },
]

// ─── Design tokens ────────────────────────────────────────────────────────────

const BG = '#04040e'
const BLUE = '#3b82f6'
const PURPLE = '#8b5cf6'
const CYAN = '#06b6d4'
const GREEN = '#10b981'
const AMBER = '#f59e0b'
const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'
const sans = "'Inter', -apple-system, sans-serif"

// ─── Framer Motion variants ───────────────────────────────────────────────────

const vp = { once: false as const, amount: 0.18 }

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.85, ease: 'easeOut' as const } },
}
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: 'easeOut' as const } },
}
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.86, filter: 'blur(12px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1.1, ease: 'easeOut' as const } },
}
const slideLeft: Variants = {
  hidden: { opacity: 0, x: 64, filter: 'blur(8px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: 'easeOut' as const } },
}
const stagger = (d = 0.1): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: d } },
})

// ─── BlobBg ───────────────────────────────────────────────────────────────────

function BlobBg() {
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <motion.div
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity }}
        style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)', top: '-15%', left: '-10%', filter: 'blur(100px)' }}
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, -60, 0] }}
        transition={{ duration: 17, ease: 'easeInOut', repeat: Infinity }}
        style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 65%)', top: '25%', right: '-12%', filter: 'blur(100px)' }}
      />
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 11, ease: 'easeInOut', repeat: Infinity }}
        style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)', bottom: '5%', left: '18%', filter: 'blur(100px)' }}
      />
    </div>
  )
}

// ─── 3D Canvas ────────────────────────────────────────────────────────────────

function Scene3D({ opacity = 0.7 }: { opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let mx = 0.3, my = -0.1, rx = -0.1, ry = 0.3, t = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    const COLS = 16, ROWS = 10, SEP = 82
    const pts = [] as { ox: number; oy: number }[]
    for (let c = 0; c < COLS; c++)
      for (let r = 0; r < ROWS; r++)
        pts.push({ ox: (c - COLS / 2 + 0.5) * SEP, oy: (r - ROWS / 2 + 0.5) * SEP })
    const FOV = 1100
    const project = (ox: number, oy: number, oz: number) => {
      const cosY = Math.cos(ry + t * 0.07), sinY = Math.sin(ry + t * 0.07)
      let nx = ox * cosY + oz * sinY, nz = -ox * sinY + oz * cosY
      const cosX = Math.cos(rx), sinX = Math.sin(rx)
      let ny = oy * cosX - nz * sinX; nz = oy * sinX + nz * cosX
      const d = FOV / (FOV + nz + 600)
      return { sx: nx * d + W() / 2, sy: ny * d + H() / 2, d }
    }
    const draw = () => {
      t += 0.005; ry += (mx * 0.32 - ry) * 0.045; rx += (my * 0.22 - rx) * 0.045
      ctx.clearRect(0, 0, W(), H())
      const proj = pts.map(p => {
        const wz = Math.sin(p.ox * 0.009 + t * 1.1) * 45 + Math.cos(p.oy * 0.011 + t * 0.65) * 30
        return project(p.ox, p.oy, wz)
      })
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].ox - pts[j].ox, dy = pts[i].oy - pts[j].oy
          if (dx * dx + dy * dy > SEP * SEP * 1.6) continue
          const a = Math.min(proj[i].d, proj[j].d) * 0.38
          if (a < 0.03) continue
          ctx.beginPath(); ctx.moveTo(proj[i].sx, proj[i].sy); ctx.lineTo(proj[j].sx, proj[j].sy)
          ctx.strokeStyle = `rgba(59,130,246,${a * 0.55})`; ctx.lineWidth = 0.9; ctx.stroke()
        }
      }
      proj.forEach(({ sx, sy, d }) => {
        if (d < 0.08) return
        const r = d * 3, a = Math.min(d * 1.3, 1)
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 6)
        grd.addColorStop(0, `rgba(99,179,251,${a * 0.4})`); grd.addColorStop(1, 'rgba(59,130,246,0)')
        ctx.beginPath(); ctx.arc(sx, sy, r * 6, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill()
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fillStyle = `rgba(186,230,253,${a * 0.95})`; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove) }
  }, [])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none', zIndex: 1 }} />
}

// ─── BentoCard — FM tilt + spotlight ─────────────────────────────────────────

function BentoCard({ children, className = '', style = {} }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useTransform(my, [-0.5, 0.5], [7, -7])
  const rotY = useTransform(mx, [-0.5, 0.5], [-9, 9])
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null)

  const onMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
    setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }
  const onLeave = () => { mx.set(0); my.set(0); setSpot(null) }

  return (
    <motion.div
      ref={cardRef}
      className={`lp-bento-card ${className}`}
      style={{ ...style, rotateX: rotX, rotateY: rotY, transformPerspective: 1000, position: 'relative', overflow: 'hidden', willChange: 'transform' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.025 }}
      transition={{ duration: 0.35, ease: 'easeOut' as const }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
        background: spot ? `radial-gradient(300px circle at ${spot.x}px ${spot.y}px, rgba(59,130,246,0.14), rgba(139,92,246,0.06) 50%, transparent 80%)` : 'transparent',
        opacity: spot ? 1 : 0, transition: 'opacity 0.3s',
      }} />
      {children}
    </motion.div>
  )
}

// ─── FaqAccordion ─────────────────────────────────────────────────────────────

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {FAQS.map(({ q, a }, i) => {
        const isOpen = open === i
        return (
          <motion.div
            key={i}
            animate={{ borderColor: isOpen ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)' }}
            style={{ background: isOpen ? 'rgba(59,130,246,0.04)' : 'rgba(255,255,255,0.02)', borderRadius: 14, overflow: 'hidden', border: '1px solid' }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px', background: 'transparent', border: 'none', color: '#fff', fontSize: 15, fontWeight: 500, cursor: 'pointer', textAlign: 'left', gap: 20, fontFamily: 'inherit' }}
            >
              <span>{q}</span>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown size={17} color={isOpen ? BLUE : 'rgba(255,255,255,0.25)'} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' as const }}
                >
                  <p style={{ padding: '0 28px 24px', fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, fontWeight: 300 }}>{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── KineticTicker ────────────────────────────────────────────────────────────

function KineticTicker() {
  const WORDS = ['hábitos', 'finanças', 'saúde', 'foco', 'sono', 'energia', 'metas']
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % WORDS.length), 2200)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 36 }}>
      <span>Sistema para</span>
      <span style={{ position: 'relative', minWidth: 80, display: 'inline-block', height: '1.2em' }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={idx}
            initial={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
            transition={{ duration: 0.28, ease: 'easeOut' as const }}
            style={{ position: 'absolute', left: 0, color: '#93c5fd', fontWeight: 600 }}
          >
            {WORDS[idx]}
          </motion.span>
        </AnimatePresence>
      </span>
      <span>e mais.</span>
    </span>
  )
}

// ─── MiniScoreRing ────────────────────────────────────────────────────────────

function MiniScoreRing({ score, color }: { score: number; color: string }) {
  const r = 16, circ = 2 * Math.PI * r
  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ} transform="rotate(-90 20 20)" />
      <text x="20" y="24" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">{score}</text>
    </svg>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function Label({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 18 }}>
      {children}
    </p>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  // Nav scroll effect
  const { scrollY, scrollYProgress } = useScroll()
  const navBg = useTransform(scrollY, [0, 80], ['rgba(4,4,14,0)', 'rgba(4,4,14,0.92)'])
  const navBd = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.06)'])
  const navBlur = useTransform(scrollY, [0, 80], ['blur(0px)', 'blur(24px) saturate(1.4)'])

  // Progress bar
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  // Custom cursor
  const cx = useMotionValue(-100)
  const cy = useMotionValue(-100)
  const dotX = useSpring(cx, { stiffness: 800, damping: 35 })
  const dotY = useSpring(cy, { stiffness: 800, damping: 35 })
  const ringX = useSpring(cx, { stiffness: 160, damping: 22 })
  const ringY = useSpring(cy, { stiffness: 160, damping: 22 })

  // Hero dashboard tilt
  const dashMx = useMotionValue(0)
  const dashMy = useMotionValue(0)
  const dashRotX = useTransform(dashMy, [-0.5, 0.5], [10, -10])
  const dashRotY = useTransform(dashMx, [-0.5, 0.5], [-12, 12])

  // Score section
  const scoreRef = useRef<HTMLElement>(null)
  const scoreNumRef = useRef<HTMLSpanElement>(null)
  const scoreInView = useInView(scoreRef, { once: false, amount: 0.25 })

  useEffect(() => {
    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'

    const isMobile = window.matchMedia('(pointer: coarse)').matches
    if (!isMobile) {
      const onMove = (e: MouseEvent) => { cx.set(e.clientX - 3); cy.set(e.clientY - 3) }
      window.addEventListener('mousemove', onMove)
      const onTilt = (e: MouseEvent) => {
        dashMx.set((e.clientX / window.innerWidth) - 0.5)
        dashMy.set((e.clientY / window.innerHeight) - 0.5)
      }
      window.addEventListener('mousemove', onTilt)
      return () => {
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mousemove', onTilt)
      }
    }
    return () => { document.documentElement.style.overflow = ''; document.body.style.overflow = '' }
  }, [])

  // Score counter — animates on every scroll-in
  useEffect(() => {
    const numEl = scoreNumRef.current
    if (!numEl) return
    if (!scoreInView) {
      numEl.textContent = '0'
      numEl.classList.remove('lp-score-complete')
      return
    }
    const t0 = performance.now(), dur = 3000
    let raf: number
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      numEl.textContent = String(Math.round((1 - Math.pow(1 - p, 3)) * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else numEl.classList.add('lp-score-complete')
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scoreInView])

  const go = () => navigate('/login')

  const scrollTo = (sel: string) => {
    document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }

  const HERO_WORDS = ['Opere', 'sua', 'vida', 'como', 'um', 'sistema.']

  return (
    <div style={{ background: BG, color: '#e2e8f0', overflowX: 'hidden', fontFamily: sans, position: 'relative' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @media (pointer: fine) { *, *::before, *::after { cursor: none !important; } }
        button { font-family: inherit; }

        .lp-btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 32px; background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border: none; border-radius: 12px; color: #fff; font-size: 14px;
          font-weight: 600; letter-spacing: 0.02em; cursor: pointer;
          box-shadow: 0 0 40px rgba(59,130,246,0.4), 0 0 80px rgba(59,130,246,0.12);
          position: relative; overflow: hidden;
        }
        .lp-btn-primary::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-15deg);
        }
        .lp-btn-primary:hover::after { left: 160%; transition: left 0.6s ease; }
        .lp-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 15px 26px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
          color: rgba(255,255,255,0.5); font-size: 14px; cursor: pointer;
        }
        .lp-btn-sm { padding: 9px 18px; font-size: 12px; border-radius: 9px; }

        .lp-nav-link { transition: color 0.2s; position: relative; }
        .lp-nav-link:hover { color: rgba(255,255,255,0.85) !important; }
        .lp-nav-ul::after {
          content: ''; position: absolute; bottom: -3px; left: 0; width: 100%; height: 1px;
          background: rgba(59,130,246,0.65); transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .lp-nav-ul:hover::after { transform: scaleX(1); }

        .lp-bento-card { transition: border-color 0.4s ease; }
        .lp-bento-card:hover { border-color: rgba(59,130,246,0.22) !important; }

        @keyframes text-shimmer { 0%{background-position:0%} 100%{background-position:200%} }
        .lp-shimmer {
          background: linear-gradient(90deg, #93c5fd 0%,#c084fc 22%,#67e8f9 44%,#93c5fd 66%,#c084fc 88%,#67e8f9 100%);
          background-size: 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: text-shimmer 5s linear infinite;
        }
        .lp-score-complete {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4) !important;
          -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
        }
        @keyframes score-pulse { 0%,100%{filter:drop-shadow(0 0 8px rgba(59,130,246,0.4))} 50%{filter:drop-shadow(0 0 48px rgba(139,92,246,0.9))} }

        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes float-y { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes pulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes glow-pulse { 0%,100%{opacity:0.35} 50%{opacity:0.75} }
        @keyframes border-rot { from{--angle:0deg} to{--angle:360deg} }
        @property --angle { syntax:'<angle>'; initial-value:0deg; inherits:false; }
        .lp-grad-border {
          border: 1px solid transparent;
          background: linear-gradient(rgba(8,8,24,0.98),rgba(8,8,24,0.98)) padding-box,
                      conic-gradient(from var(--angle),#3b82f6,#8b5cf6,#06b6d4,#8b5cf6,#3b82f6) border-box;
          animation: border-rot 5s linear infinite;
        }
        .lp-noise {
          position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.025;
          background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='250' height='250'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        @media (max-width: 768px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-hero-right { display: none !important; }
          .lp-bento-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-bento-ai { grid-column: span 2 !important; }
          .lp-bento-score { grid-column: span 2 !important; grid-row: span 1 !important; }
          .lp-bento-focus { grid-column: span 2 !important; }
          .lp-testi-grid { grid-template-columns: 1fr !important; }
          .lp-plans-grid { grid-template-columns: 1fr !important; }
          .lp-score-wrap { flex-direction: column !important; text-align: center; }
          .lp-how-grid { grid-template-columns: 1fr !important; }
          .lp-footer-grid { grid-template-columns: 1fr !important; }
          .lp-nav-desktop { display: none !important; }
        }
        @media (min-width: 769px) { .lp-nav-mobile { display: none !important; } }
      `}</style>

      <BlobBg />
      <div aria-hidden className="lp-noise" />

      {/* Progress bar */}
      <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 201, scaleX, transformOrigin: 'left', background: 'linear-gradient(90deg,#3b82f6,#8b5cf6,#06b6d4)', pointerEvents: 'none' }} />

      {/* Cursor */}
      <motion.div style={{ position: 'fixed', width: 6, height: 6, background: '#fff', borderRadius: '50%', pointerEvents: 'none', zIndex: 9999, x: dotX, y: dotY, mixBlendMode: 'difference' }} />
      <motion.div style={{ position: 'fixed', width: 40, height: 40, border: '1px solid rgba(255,255,255,0.35)', borderRadius: '50%', pointerEvents: 'none', zIndex: 9998, x: ringX, y: ringY, translateX: '-50%', translateY: '-50%', marginLeft: 3, marginTop: 3 }} />

      {/* ── NAV ────────────────────────────────────────────────────────────────── */}
      <motion.nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: navBg, backdropFilter: navBlur, borderBottom: `1px solid`, borderColor: navBd }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <div style={{ width: 30, height: 30, borderRadius: 8, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(59,130,246,0.5)' }}>
            <Zap size={14} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>FLOWOS</span>
        </motion.div>

        <motion.div
          className="lp-nav-desktop"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ display: 'flex', gap: 36, alignItems: 'center' }}
        >
          {['Recursos', 'Como funciona', 'Preços', 'FAQ'].map(l => (
            <span key={l} className="lp-nav-link lp-nav-ul" style={{ fontSize: 13, color: 'rgba(255,255,255,0.32)', cursor: 'none' }}
              onClick={() => scrollTo(l === 'Recursos' ? '.lp-bento' : l === 'Como funciona' ? '.lp-how' : l === 'Preços' ? '.lp-pricing' : '.lp-faq')}>
              {l}
            </span>
          ))}
        </motion.div>

        <motion.div
          className="lp-nav-desktop"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
          <motion.button className="lp-btn-ghost lp-btn-sm" onClick={go} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>Entrar</motion.button>
          <motion.button className="lp-btn-primary lp-btn-sm" onClick={go} whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>Começar grátis →</motion.button>
        </motion.div>

        <button className="lp-nav-mobile" onClick={() => setMenuOpen(v => !v)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 8 }}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99, background: 'rgba(4,4,14,0.97)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '24px 24px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}
          >
            {['Recursos', 'Como funciona', 'Preços', 'FAQ'].map(l => (
              <span key={l} style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} onClick={() => setMenuOpen(false)}>{l}</span>
            ))}
            <motion.button className="lp-btn-primary" onClick={() => { go(); setMenuOpen(false) }} style={{ marginTop: 8 }} whileTap={{ scale: 0.97 }}>
              Começar grátis <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', padding: '140px 48px 100px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <Scene3D opacity={0.65} />
          <div style={{ position: 'absolute', inset: '-20%', background: 'radial-gradient(ellipse at 65% 40%, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.06) 38%, transparent 62%), radial-gradient(ellipse at 25% 85%, rgba(6,182,212,0.07) 0%, transparent 50%)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: `linear-gradient(to top, ${BG} 0%, transparent)`, pointerEvents: 'none', zIndex: 5 }} />

        <div className="lp-hero-grid" style={{ position: 'relative', zIndex: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 72, maxWidth: 1260, margin: '0 auto' }}>
          {/* Left copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.15 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.28)', borderRadius: 100, fontSize: 11, color: '#93c5fd', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 40 }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE, animation: 'pulse 2s infinite', boxShadow: `0 0 6px ${BLUE}` }} />
              Life Operating System
            </motion.div>

            <h1 style={{ fontSize: 'clamp(42px, 5.8vw, 88px)', fontWeight: 900, lineHeight: 0.98, letterSpacing: '-0.038em', marginBottom: 28 }}>
              {HERO_WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 72, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: 'easeOut' as const }}
                  style={{
                    display: 'inline-block', marginRight: '0.28em',
                    ...(i === 5 ? { background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : {}),
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.0 }}
              style={{ fontSize: 17, color: 'rgba(255,255,255,0.68)', lineHeight: 1.82, maxWidth: 430, marginBottom: 24, fontWeight: 300 }}
            >
              Hábitos, finanças, saúde, foco e inteligência artificial — unificados em um número que mede o quanto você está operando no seu potencial máximo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              style={{ marginBottom: 36 }}
            >
              <KineticTicker />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}
            >
              <motion.button className="lp-btn-primary" onClick={go} style={{ fontSize: 15, padding: '16px 36px' }} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                Começar grátis — 15 dias <ArrowRight size={16} />
              </motion.button>
              <motion.button className="lp-btn-ghost" onClick={go} whileHover={{ scale: 1.04, borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.75)' }} whileTap={{ scale: 0.97 }}>
                Ver demo
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
              style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}
            >
              <div style={{ display: 'flex' }}>
                {['LF', 'MC', 'RO', 'PA', 'JS'].map((av, i) => (
                  <div key={av} style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${i%2===0?BLUE:PURPLE},${i%2===0?CYAN:BLUE})`, border: '2px solid rgba(4,4,14,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i }}>
                    {av}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} size={11} fill={AMBER} color={AMBER} />)}
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>+2.400 usuários · 4.9/5</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 20 }}>
                Sem cartão · Cancele quando quiser
              </div>
            </motion.div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="lp-hero-right" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1200px', height: 560 }}>
            <motion.div
              initial={{ opacity: 0, y: 60, rotateX: 14, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' as const }}
              style={{ rotateX: dashRotX, rotateY: dashRotY, transformPerspective: 1200 }}
            >
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity }}
                style={{ width: 340, background: 'rgba(8,8,24,0.98)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: '22px 22px 26px', boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(59,130,246,0.12)', backdropFilter: 'blur(16px)', willChange: 'transform' }}>
                {/* Top bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['#ef4444','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.15em' }}>FLOWOS</div>
                  <Sparkles size={12} color="rgba(255,255,255,0.2)" />
                </div>
                {/* Score + ring */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
                  <div style={{ position: 'relative', width: 82, height: 82, flexShrink: 0 }}>
                    <svg width="82" height="82" viewBox="0 0 82 82">
                      <defs>
                        <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                      <circle cx="41" cy="41" r="33" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                      <circle cx="41" cy="41" r="33" fill="none" stroke="url(#hg)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="207" strokeDashoffset="45" transform="rotate(-90 41 41)" style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.8))' }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 23, fontWeight: 800, lineHeight: 1 }}>78</span>
                      <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em' }}>SCORE</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginBottom: 10 }}>Seu Life Score hoje</div>
                    <span style={{ fontSize: 11, color: GREEN, background: 'rgba(16,185,129,0.1)', padding: '2px 9px', borderRadius: 4, display: 'inline-block', marginBottom: 12 }}>↑ +3.2 vs ontem</span>
                    {[['Hábitos','88%',BLUE],['Foco','72%',CYAN],['Saúde','65%',GREEN]].map(([l,p,c]) => (
                      <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', minWidth: 44 }}>{l}</span>
                        <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                          <div style={{ width: p as string, height: '100%', background: c as string, borderRadius: 1 }} />
                        </div>
                        <span style={{ fontSize: 10, color: c as string, minWidth: 28, textAlign: 'right' }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 18 }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Hábitos de hoje</div>
                  {[{icon: Brain, l:'Meditação 10min', d:true},{icon:BookOpen,l:'Leitura 30min',d:true},{icon:Heart,l:'Treino',d:false}].map(({icon:Icon,l,d}) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 5, background: d ? BLUE : 'rgba(255,255,255,0.04)', border: `1px solid ${d ? BLUE : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: d ? `0 0 8px rgba(59,130,246,0.5)` : 'none' }}>
                        {d && <Check size={9} color="#fff" strokeWidth={3} />}
                      </div>
                      <Icon size={12} color={d ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'} />
                      <span style={{ fontSize: 12, color: d ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', textDecoration: d ? 'line-through' : 'none' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Satellite cards */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -20 }} animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.2, duration: 1 }}
              style={{ position: 'absolute', top: -36, right: -60, background: 'rgba(8,8,24,0.97)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, padding: '12px 16px', boxShadow: '0 24px 70px rgba(0,0,0,0.7), 0 0 24px rgba(245,158,11,0.12)', whiteSpace: 'nowrap', animation: 'float-y 3.2s ease infinite' }}
            >
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginBottom: 3 }}>Streak atual</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Zap size={14} fill="#fbbf24" color="#fbbf24" />47 dias
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.4, duration: 1 }}
              style={{ position: 'absolute', bottom: -24, left: -68, background: 'rgba(8,8,24,0.97)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 14, padding: '12px 16px', boxShadow: '0 24px 70px rgba(0,0,0,0.7)', whiteSpace: 'nowrap', animation: 'float-y 3.8s 0.4s ease infinite' }}
            >
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginBottom: 3 }}>Economia este mês</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399' }}>↑ R$ 847</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6, duration: 1 }}
              style={{ position: 'absolute', top: '36%', left: -84, background: 'rgba(8,8,24,0.97)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 14, padding: '12px 16px', boxShadow: '0 24px 70px rgba(0,0,0,0.7)', maxWidth: 190, animation: 'float-y 2.8s 0.8s ease infinite' }}
            >
              <div style={{ fontSize: 9, color: PURPLE, marginBottom: 5, fontWeight: 600 }}>IA Insight</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>Seu sono melhorou 18% após iniciar meditação diária.</div>
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'float-y 3s ease infinite' }}
        >
          <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, rgba(59,130,246,0.4), transparent)' }} />
          <span style={{ fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.1)' }}>scroll</span>
        </motion.div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={vp}
        transition={{ duration: 0.8 }}
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '18px 0', overflow: 'hidden', position: 'relative', zIndex: 2, background: 'rgba(255,255,255,0.01)' }}
      >
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 28s linear infinite' }}>
          {[0, 1].map(o => (
            <div key={o} style={{ display: 'flex', gap: 56, paddingRight: 56 }}>
              {MARQUEE.map((item, i) => (
                <span key={item} style={{ fontSize: 10, color: i % 3 === 0 ? '#93c5fd' : i % 3 === 1 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap', fontWeight: i % 3 === 0 ? 500 : 400 }}>
                  {item}<span style={{ margin: '0 22px', color: 'rgba(255,255,255,0.04)' }}>·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          MANIFESTO
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: '160px 48px', maxWidth: 920, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial="hidden" whileInView="visible" viewport={vp}
          variants={fadeIn}
          style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 60 }}
        >
          <div style={{ width: 28, height: 1, background: 'rgba(59,130,246,0.4)' }} />
          <Label>Manifesto</Label>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger(0.18)}>
          {[
            { text: 'Você não precisa de mais um app de hábitos.', dim: false },
            { text: 'Você precisa de um sistema.', dim: false },
            { text: 'Que conecta o que você come', dim: true },
            { text: 'com o que você produz.', dim: true },
            { text: 'Que sabe quando você está no seu pico', dim: true },
            { text: 'e quando está em risco de quebrar.', dim: true },
            { text: 'Que não te deixa mentir', dim: false },
            { text: 'para si mesmo.', dim: false },
          ].map(({ text, dim }, i) => (
            <motion.p
              key={i}
              variants={fadeUp}
              style={{ fontSize: 'clamp(26px, 3.8vw, 58px)', fontWeight: dim ? 300 : 900, lineHeight: 1.1, letterSpacing: '-0.028em', color: dim ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.96)', marginBottom: 6, fontStyle: dim ? 'italic' : 'normal' }}
            >
              {text}
            </motion.p>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════
          LIFE SCORE
      ══════════════════════════════════════════════════ */}
      <section ref={scoreRef} style={{ padding: '100px 48px', position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="lp-score-wrap" style={{ display: 'flex', alignItems: 'center', gap: 96, maxWidth: 1100, margin: '0 auto', flexWrap: 'wrap' }}>
          {/* Ring */}
          <motion.div
            variants={scaleIn}
            initial="hidden" animate={scoreInView ? 'visible' : 'hidden'}
            style={{ flexShrink: 0, position: 'relative', width: 268, height: 268, margin: '0 auto', cursor: 'pointer' }}
          >
            <motion.div
              animate={{ opacity: [0.35, 0.75, 0.35] }}
              transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
              style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.14), transparent 70%)', filter: 'blur(20px)' }}
            />
            <svg width="268" height="268" viewBox="0 0 268 268" style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <filter id="glow"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <circle cx="134" cy="134" r="120" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              <circle cx="134" cy="134" r="102" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
              {/* Animated arc using FM */}
              <motion.circle
                cx="134" cy="134" r="102"
                fill="none" stroke="url(#rg)" strokeWidth="3.5" strokeLinecap="round"
                strokeDasharray="641"
                initial={{ strokeDashoffset: 641 }}
                animate={{ strokeDashoffset: scoreInView ? 0 : 641 }}
                transition={{ duration: 3.2, ease: 'easeOut' as const }}
                transform="rotate(-90 134 134)"
                filter="url(#glow)"
              />
              {Array.from({ length: 24 }, (_, i) => {
                const a = (i / 24) * 360 - 90, r2 = (a * Math.PI) / 180
                return <line key={i} x1={134 + Math.cos(r2) * 110} y1={134 + Math.sin(r2) * 110} x2={134 + Math.cos(r2) * 116} y2={134 + Math.sin(r2) * 116} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              })}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span ref={scoreNumRef} className="lp-score-num" style={{ fontSize: 100, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.065em' }}>0</span>
              <span style={{ fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', marginTop: 6 }}>Life Score</span>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div
            variants={slideLeft}
            initial="hidden" animate={scoreInView ? 'visible' : 'hidden'}
            transition={{ delay: 0.2 }}
            style={{ flex: 1, minWidth: 280 }}
          >
            <Label>Seu progresso, quantificado</Label>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 48px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.028em', marginBottom: 20 }}>
              Um número que reflete<br />
              <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 800 }}>o estado real da sua vida.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: 38, fontWeight: 300 }}>
              Calculado toda manhã a partir dos seus hábitos, sono, finanças, foco e humor. Não é uma nota — é um espelho.
            </p>
            <motion.div initial="hidden" animate={scoreInView ? 'visible' : 'hidden'} variants={stagger(0.1)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {([[BLUE,'30%','Hábitos diários'],[PURPLE,'25%','Tarefas & projetos'],[AMBER,'20%','Streak'],[CYAN,'15%','Sessões de foco'],[GREEN,'10%','Saúde financeira']] as [string, string, string][]).map(([color, pct, label], idx) => (
                <motion.div key={label} variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 36 }}>{pct}</span>
                  <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: scoreInView ? pct : 0 }}
                      transition={{ duration: 1.4, delay: 0.4 + idx * 0.1, ease: 'easeOut' as const }}
                      style={{ height: '100%', background: color, opacity: 0.6, borderRadius: 1 }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', minWidth: 140 }}>{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BENTO FEATURES
      ══════════════════════════════════════════════════ */}
      <section className="lp-bento" style={{ padding: '100px 48px 120px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 2 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={fadeUp} style={{ textAlign: 'center', marginBottom: 76 }}>
          <Label>Módulos</Label>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 60px)', fontWeight: 900, letterSpacing: '-0.032em', lineHeight: 1.02 }}>
            Tudo integrado.{' '}
            <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Nada isolado.</span>
          </h2>
        </motion.div>

        <motion.div
          className="lp-bento-grid"
          style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}
          initial="hidden" whileInView="visible" viewport={vp}
          variants={stagger(0.08)}
        >
          {/* IA — span 2×2 */}
          <motion.div variants={fadeUp} style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
            <BentoCard className="lp-bento-ai" style={{ background: 'linear-gradient(145deg, rgba(8,8,28,0.99), rgba(6,6,18,0.99))', border: '1px solid rgba(139,92,246,0.14)', borderRadius: 22, padding: 32, minHeight: 360, height: '100%' }}>
              <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.1))', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={17} color={PURPLE} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: PURPLE, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Central IA</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Assistente com contexto completo</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { from: 'user', text: 'Por que meu score caiu hoje?' },
                    { from: 'ai', text: 'Analisando seus dados: você dormiu 5h20 (−42% da meta). Isso reduz sua dimensão de Saúde em 18 pontos. Além disso, 0 hábitos completados. Quer uma rotina de recuperação?' },
                    { from: 'user', text: 'Sim, me ajuda.' },
                  ].map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.from === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: msg.from === 'user' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${msg.from === 'user' ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.07)'}`, fontSize: 12, color: msg.from === 'user' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['12 Insights hoje', '94% precisão', 'Tempo real'].map(tag => (
                    <span key={tag} style={{ fontSize: 10, color: PURPLE, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: 6, padding: '4px 10px' }}>{tag}</span>
                  ))}
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Hábitos */}
          <motion.div variants={fadeUp}>
            <BentoCard style={{ background: 'linear-gradient(145deg,rgba(8,8,22,0.99),rgba(6,6,16,0.99))', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 22, padding: 26, height: '100%' }}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={14} color={AMBER} />
                  </div>
                  <div style={{ fontSize: 11, color: AMBER, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Hábitos</div>
                </div>
                {['Meditação', 'Leitura', 'Exercício', 'Água 2L'].map((h, i) => (
                  <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: i < 3 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i < 3 ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {i < 3 && <Check size={9} color={AMBER} strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: 12, color: i < 3 ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)', textDecoration: i < 3 ? 'line-through' : 'none' }}>{h}</span>
                    {i < 3 && <span style={{ marginLeft: 'auto', fontSize: 10, color: AMBER }}>✓</span>}
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(245,158,11,0.06)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Streak</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: AMBER }}>🔥 47 dias</span>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Finanças */}
          <motion.div variants={fadeUp}>
            <BentoCard style={{ background: 'linear-gradient(145deg,rgba(8,8,22,0.99),rgba(6,6,16,0.99))', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 22, padding: 26, height: '100%' }}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={14} color={GREEN} />
                  </div>
                  <div style={{ fontSize: 11, color: GREEN, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Finanças</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>R$ 8.420</div>
                <div style={{ fontSize: 11, color: GREEN, marginBottom: 20 }}>↑ +R$ 1.240 este mês</div>
                {[['Investimentos', '42%', GREEN], ['Gastos fixos', '31%', BLUE], ['Lazer', '15%', PURPLE], ['Poupança', '12%', CYAN]].map(([l, p, c]) => (
                  <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c as string }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flex: 1 }}>{l}</span>
                    <span style={{ fontSize: 11, color: c as string, fontWeight: 600 }}>{p}</span>
                  </div>
                ))}
              </div>
            </BentoCard>
          </motion.div>

          {/* Life Score mini */}
          <motion.div variants={fadeUp} className="lp-bento-score" style={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
            <BentoCard style={{ background: 'linear-gradient(145deg,rgba(8,8,22,0.99),rgba(6,6,16,0.99))', border: '1px solid rgba(59,130,246,0.14)', borderRadius: 22, padding: 26, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)' }} />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24 }}>Sua semana</div>
                {TESTIMONIALS.slice(0, 4).map(({ avatar, name, score }, i) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${i%2===0?BLUE:PURPLE},${CYAN})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{avatar}</div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{name.split(' ')[0]}</div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <div style={{ width: `${score}%`, height: '100%', background: `linear-gradient(90deg,${BLUE},${CYAN})`, borderRadius: 2 }} />
                      </div>
                    </div>
                    <MiniScoreRing score={score} color={BLUE} />
                  </div>
                ))}
                <div style={{ marginTop: 20, padding: '12px', background: 'rgba(59,130,246,0.06)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.12)' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginBottom: 6 }}>Seu score médio</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: BLUE, letterSpacing: '-0.04em' }}>82</div>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Modo Foco */}
          <motion.div variants={fadeUp} className="lp-bento-focus">
            <BentoCard style={{ background: 'linear-gradient(145deg,rgba(8,8,22,0.99),rgba(6,6,16,0.99))', border: '1px solid rgba(6,182,212,0.12)', borderRadius: 22, padding: 26, height: '100%' }}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Timer size={14} color={CYAN} />
                  </div>
                  <div style={{ fontSize: 11, color: CYAN, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Modo Foco</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', marginBottom: 4 }}>24:07</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>Deep Work · Sessão 2/4</div>
                  <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: '64%', height: '100%', background: `linear-gradient(90deg,${CYAN},${BLUE})`, borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </BentoCard>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════ */}
      <section className="lp-how" style={{ padding: '100px 48px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 2 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={fadeUp} style={{ textAlign: 'center', marginBottom: 80 }}>
          <Label>Como funciona</Label>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Três passos.{' '}
            <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Uma transformação.</span>
          </h2>
        </motion.div>
        <motion.div
          className="lp-how-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1100, margin: '0 auto', position: 'relative' }}
          initial="hidden" whileInView="visible" viewport={vp}
          variants={stagger(0.16)}
        >
          {HOW_STEPS.map(({ num, icon: Icon, title, desc }, i) => (
            <motion.div
              key={num}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 22, padding: '36px 28px', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: -30, right: -20, fontSize: 100, fontWeight: 900, color: 'rgba(255,255,255,0.02)', lineHeight: 1, userSelect: 'none' }}>{num}</div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${i===0?'rgba(59,130,246,0.15)':i===1?'rgba(139,92,246,0.15)':'rgba(6,182,212,0.15)'}, rgba(255,255,255,0.03))`, border: `1px solid ${i===0?'rgba(59,130,246,0.25)':i===1?'rgba(139,92,246,0.25)':'rgba(6,182,212,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <Icon size={20} color={i===0?BLUE:i===1?PURPLE:CYAN} />
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', marginBottom: 12 }}>{num}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.78, fontWeight: 300 }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 48px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 2 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={fadeUp} style={{ textAlign: 'center', marginBottom: 72 }}>
          <Label>Resultados reais</Label>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Quem já opera com o{' '}
            <span className="lp-shimmer">FlowOS.</span>
          </h2>
        </motion.div>
        <motion.div
          className="lp-testi-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 1200, margin: '0 auto' }}
          initial="hidden" whileInView="visible" viewport={vp}
          variants={stagger(0.09)}
        >
          {TESTIMONIALS.map(({ name, role, avatar, text, score }, i) => (
            <motion.div
              key={name}
              variants={fadeUp}
              whileHover={{ y: -5, borderColor: 'rgba(59,130,246,0.25)' }}
              transition={{ duration: 0.3 }}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, rgba(${i%2===0?'59,130,246':'139,92,246'},0.4), transparent)` }} />
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: 5 }, (_, si) => <Star key={si} size={12} fill={AMBER} color={AMBER} />)}
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.82, fontWeight: 300, flex: 1 }}>"{text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${i%2===0?BLUE:PURPLE},${CYAN})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{role}</div>
                </div>
                <MiniScoreRing score={score} color={i % 2 === 0 ? BLUE : PURPLE} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════ */}
      <section className="lp-pricing" style={{ padding: '100px 48px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 2 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={fadeUp} style={{ textAlign: 'center', marginBottom: 72 }}>
          <Label>Planos</Label>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Invista no seu{' '}
            <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>sistema de vida.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto' }}>
            15 dias grátis no Starter. Sem cartão de crédito. Cancele quando quiser.
          </p>
        </motion.div>

        <motion.div
          className="lp-plans-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 1100, margin: '0 auto 64px' }}
          initial="hidden" whileInView="visible" viewport={vp}
          variants={stagger(0.13)}
        >
          {PLANS.map(({ name, price, priceNote, trial, badge, desc, features, highlight, cta }) => (
            <motion.div
              key={name}
              variants={scaleIn}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.35, ease: 'easeOut' as const }}
              className={highlight ? 'lp-grad-border' : ''}
              style={{
                padding: '36px 28px',
                background: highlight ? 'rgba(8,8,24,0.98)' : `linear-gradient(145deg, rgba(10,10,20,0.98), rgba(8,8,16,0.98))`,
                border: highlight ? 'none' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 22, position: 'relative', display: 'flex', flexDirection: 'column',
                boxShadow: highlight ? '0 0 80px rgba(59,130,246,0.12), 0 0 160px rgba(59,130,246,0.06)' : 'none',
              }}
            >
              {highlight && <div style={{ position: 'absolute', inset: 0, borderRadius: 22, background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.1), transparent 60%)', pointerEvents: 'none' }} />}
              {badge && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', background: grad, borderRadius: 100, padding: '4px 18px', whiteSpace: 'nowrap', fontWeight: 600, boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}>{badge}</div>
              )}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 22 }}>{name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 8 }}>
                  <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>{price}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>{priceNote}</span>
                </div>
                {trial && <div style={{ fontSize: 12, color: GREEN, marginBottom: 8, fontWeight: 500 }}>✓ {trial}</div>}
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 26, fontWeight: 300 }}>{desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  {features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
                      <Check size={13} color={highlight ? BLUE : 'rgba(255,255,255,0.2)'} strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.button
                  onClick={go}
                  whileHover={{ opacity: 0.9, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ width: '100%', padding: '15px', background: highlight ? `linear-gradient(135deg, #3b82f6, #06b6d4)` : 'transparent', border: `1px solid ${highlight ? 'transparent' : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, color: highlight ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: highlight ? 600 : 400, letterSpacing: '0.03em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', boxShadow: highlight ? '0 0 30px rgba(59,130,246,0.35)' : 'none', fontFamily: 'inherit' }}
                >
                  {cta} <ArrowRight size={13} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={vp}
          variants={fadeUp}
          style={{ maxWidth: 860, margin: '0 auto', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', background: 'rgba(255,255,255,0.025)', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Recurso</span>
            {['Starter', 'Pro', 'Flow+'].map(n => <span key={n} style={{ fontSize: 11, color: n === 'Pro' ? BLUE : 'rgba(255,255,255,0.3)', textAlign: 'center', fontWeight: n === 'Pro' ? 600 : 400 }}>{n}</span>)}
          </div>
          {COMPARE.map(({ label, s, p, f }, i) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', padding: '13px 28px', borderBottom: i < COMPARE.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', fontWeight: 300 }}>{label}</span>
              {[s, p, f].map((has, j) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {has ? <Check size={14} color={j === 1 ? BLUE : GREEN} strokeWidth={2.5} /> : <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.08)' }}>–</span>}
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════ */}
      <section className="lp-faq" style={{ padding: '100px 48px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={fadeUp} style={{ textAlign: 'center', marginBottom: 68 }}>
            <Label>FAQ</Label>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 50px)', fontWeight: 900, letterSpacing: '-0.032em' }}>Perguntas frequentes</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={fadeIn}>
            <FaqAccordion />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════ */}
      <section className="lp-cta" style={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', zIndex: 2 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(59,130,246,0.22) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '64px 64px', WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 65%)', maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 65%)' }} />
        <motion.div
          initial="hidden" whileInView="visible" viewport={vp}
          variants={stagger(0.14)}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 860 }}
        >
          <motion.div variants={fadeIn} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36, justifyContent: 'center' }}>
            <div style={{ width: 24, height: 1, background: 'rgba(59,130,246,0.4)' }} />
            <span style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>Está pronto?</span>
            <div style={{ width: 24, height: 1, background: 'rgba(59,130,246,0.4)' }} />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            style={{ fontSize: 'clamp(60px, 11vw, 140px)', fontWeight: 900, lineHeight: 0.86, letterSpacing: '-0.048em', marginBottom: 52 }}
          >
            Comece a<br />
            <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>operar.</span>
          </motion.h2>
          <motion.button
            variants={scaleIn}
            className="lp-btn-primary"
            onClick={go}
            style={{ fontSize: 16, padding: '20px 60px', borderRadius: 14, boxShadow: '0 0 80px rgba(59,130,246,0.5), 0 0 160px rgba(59,130,246,0.18)', marginBottom: 24 }}
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            Criar conta grátis <ArrowRight size={18} />
          </motion.button>
          <motion.p variants={fadeIn} style={{ fontSize: 12, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            15 dias grátis · Sem cartão · Cancele quando quiser
          </motion.p>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────────── */}
      <motion.footer
        initial="hidden" whileInView="visible" viewport={vp}
        variants={fadeIn}
        style={{ padding: '56px 48px 52px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 2 }}
      >
        <div className="lp-footer-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'start', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(59,130,246,0.4)' }}>
                <Zap size={12} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>FLOWOS</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.12)', maxWidth: 220, lineHeight: 1.75 }}>O sistema operacional da sua vida. Construído para quem leva o futuro a sério.</div>
          </div>
          <div style={{ display: 'flex', gap: 48, justifyContent: 'center' }}>
            {[['Produto', ['Recursos', 'Preços', 'Changelog']], ['Empresa', ['Sobre', 'Blog', 'Carreiras']], ['Suporte', ['Docs', 'FAQ', 'Status']]].map(([section, links]) => (
              <div key={section as string}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>{section}</div>
                {(links as string[]).map(l => (
                  <motion.div key={l} whileHover={{ color: 'rgba(255,255,255,0.7)' }} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 10, cursor: 'pointer' }}
                    onClick={() => navigate(`/${l.toLowerCase()}`)}>{l}</motion.div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.1)', marginBottom: 8 }}>© 2026 FlowOS</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.07)' }}>Todos os direitos reservados</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 18, flexWrap: 'wrap' }}>
              {[['Privacidade', '/privacidade'], ['Termos', '/termos'], ['Cookies', '/cookies']].map(([l, href]) => (
                <motion.span key={l} whileHover={{ color: 'rgba(255,255,255,0.6)' }} style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', cursor: 'pointer' }}
                  onClick={() => navigate(href as string)}>{l}</motion.span>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
