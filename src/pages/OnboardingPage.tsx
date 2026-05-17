import { useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFlowStore } from '../store'
import { ArrowRight, ArrowLeft, Check, Zap } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'

// ── Tipos ─────────────────────────────────────────────────────────────────────

const STEPS = ['welcome', 'objetivos', 'desafios', 'habitos', 'pronto'] as const
type Step = typeof STEPS[number]

// ── Step Dots ─────────────────────────────────────────────────────────────────

function StepDots({ current }: { current: number }) {
  const total = STEPS.length
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36 }}>
      {Array.from({ length: total }).map((_, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <div style={{
              width: 28, height: 2,
              background: i <= current ? 'var(--blue)' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.5s ease',
            }} />
          )}
          <div style={{
            width: i === current ? 28 : 10,
            height: 10,
            borderRadius: 5,
            background: i < current
              ? 'var(--blue)'
              : i === current
              ? 'linear-gradient(135deg,#3b82f6,#06b6d4)'
              : 'rgba(255,255,255,0.1)',
            transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: i === current ? '0 0 10px rgba(59,130,246,0.7)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {i < current && (
              <Check size={6} color="#fff" strokeWidth={3} />
            )}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

// ── Grade de seleção ──────────────────────────────────────────────────────────

function GradeSelecao({
  items, selecionados, onAlternar, colunas = 4,
}: {
  items: { id: string; emoji: string; label: string }[]
  selecionados: string[]
  onAlternar: (id: string) => void
  colunas?: number
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colunas}, 1fr)`, gap: 10 }}>
      {items.map(item => {
        const ativo = selecionados.includes(item.id)
        return (
          <button
            key={item.id}
            onClick={() => onAlternar(item.id)}
            style={{
              padding: '14px 8px',
              background: ativo
                ? 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(6,182,212,0.10))'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${ativo ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
              transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
              position: 'relative',
              boxShadow: ativo ? '0 0 18px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.07)' : 'none',
              transform: ativo ? 'translateY(-1px)' : 'none',
            }}
          >
            {ativo && (
              <div style={{
                position: 'absolute', top: 6, right: 6,
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'popIn 0.22s cubic-bezier(0.4,0,0.2,1) both',
              }}>
                <Check size={9} color="#fff" strokeWidth={3} />
              </div>
            )}
            <span style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
            <span style={{
              fontSize: 11, fontWeight: ativo ? 600 : 400,
              textAlign: 'center', lineHeight: 1.2,
              color: ativo ? '#93c5fd' : 'var(--text-1)',
              transition: 'color 0.18s',
            }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── Tela de conclusão — ring animado ─────────────────────────────────────────

function TelaConclusa({ nome, objetivos, habitosSelecionados, onFinalizar, habitos }: {
  nome: string
  objetivos: string[]
  habitosSelecionados: string[]
  onFinalizar: () => void
  habitos: { id: string; emoji: string; label: string }[]
}) {
  const { t } = useTranslation('onboarding')
  const score = 52
  const cx = 60, r = 50, circ = 2 * Math.PI * r
  const filled = (score / 100) * circ

  const systemCreatedLines = t('system_created', { name: nome }).split('\n')

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Ring animado */}
      <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 24px' }}>
        <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
          <circle cx={cx} cy={cx} r={r} fill="none"
            stroke="url(#grad-ring)" strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            style={{ animation: 'ring-grow 1.2s cubic-bezier(0.4,0,0.2,1) both 0.3s' }}
          />
          <defs>
            <linearGradient id="grad-ring" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: '#60a5fa', letterSpacing: '-0.05em', animation: 'countUp 0.5s ease both 0.8s', opacity: 0 }}>{score}</span>
          <span style={{ fontSize: 9, color: 'var(--text-2)', marginTop: 1 }}>Life Score</span>
        </div>
      </div>

      <h2 style={{
        fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1,
        marginBottom: 8,
        background: 'linear-gradient(135deg,#fff 40%,#93c5fd)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        animation: 'countUp 0.4s ease both 0.5s', opacity: 0,
      }}>
        {systemCreatedLines[0]}<br />{systemCreatedLines[1]}
      </h2>

      <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24, animation: 'countUp 0.4s ease both 0.65s', opacity: 0 }}>
        {t('system_ready')}
      </p>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24,
        animation: 'countUp 0.4s ease both 0.75s', opacity: 0,
      }}>
        {[
          { emoji: '🎯', val: objetivos.length, label: t('label_objectives') },
          { emoji: '💪', val: habitosSelecionados.length, label: t('label_habits') },
          { emoji: '⚡', val: score, label: t('label_initial_score') },
        ].map(s => (
          <div key={s.label} style={{
            padding: '12px 8px',
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.emoji}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#60a5fa', letterSpacing: '-0.04em' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Hábitos selecionados */}
      {habitosSelecionados.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
          marginBottom: 28,
          animation: 'countUp 0.4s ease both 0.85s', opacity: 0,
        }}>
          {habitosSelecionados.slice(0, 5).map(id => {
            const h = habitos.find(x => x.id === id)
            return h ? (
              <span key={id} style={{
                padding: '4px 12px', borderRadius: 999,
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.25)',
                fontSize: 12, color: '#93c5fd', fontWeight: 500,
              }}>
                {h.emoji} {h.label}
              </span>
            ) : null
          })}
          {habitosSelecionados.length > 5 && (
            <span style={{ padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: 'var(--text-2)' }}>
              {t('more_items', { count: habitosSelecionados.length - 5 })}
            </span>
          )}
        </div>
      )}

      <button
        className="btn-primary"
        onClick={onFinalizar}
        style={{
          width: '100%', padding: '15px', fontSize: 16, justifyContent: 'center', gap: 10,
          boxShadow: '0 0 40px rgba(59,130,246,0.35)',
          animation: 'countUp 0.4s ease both 1s', opacity: 0,
        }}
      >
        {t('cta_enter')} <ArrowRight size={18} />
      </button>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { t } = useTranslation(['onboarding', 'common'])
  const completarOnboarding = useFlowStore(s => s.completarOnboarding)
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [step, setStep] = useState<Step>('welcome')
  const [dir, setDir] = useState<'right' | 'left'>('right')

  const [nome, setNome]                             = useState('')
  const [objetivos, setObjetivos]                   = useState<string[]>([])
  const [desafios, setDesafios]                     = useState<string[]>([])
  const [habitosSelecionados, setHabitosSelecionados] = useState<string[]>([])

  const OBJETIVOS = [
    { id: 'Produtividade',            emoji: '⚡', label: t('goals.productivity') },
    { id: 'Crescimento Financeiro',   emoji: '💰', label: t('goals.finance') },
    { id: 'Saúde & Condicionamento',  emoji: '💪', label: t('goals.health') },
    { id: 'Aprendizado',              emoji: '🧠', label: t('goals.learning') },
    { id: 'Carreira',                 emoji: '🚀', label: t('goals.career') },
    { id: 'Clareza Mental',           emoji: '🧘', label: t('goals.clarity') },
    { id: 'Relacionamentos',          emoji: '❤️', label: t('goals.relationships') },
    { id: 'Criatividade',             emoji: '🎨', label: t('goals.creativity') },
  ]

  const DESAFIOS = [
    { id: 'Procrastinação',    emoji: '⏳', label: t('challenges.procrastination') },
    { id: 'Falta de Foco',     emoji: '🌀', label: t('challenges.focus') },
    { id: 'Sono Ruim',         emoji: '😴', label: t('challenges.sleep') },
    { id: 'Estresse Financeiro', emoji: '😰', label: t('challenges.financial') },
    { id: 'Desorganização',    emoji: '📦', label: t('challenges.disorganization') },
    { id: 'Sobrecarga',        emoji: '🌊', label: t('challenges.overload') },
    { id: 'Inconsistência',    emoji: '🎲', label: t('challenges.inconsistency') },
    { id: 'Baixa Energia',     emoji: '🔋', label: t('challenges.energy') },
  ]

  const HABITOS = [
    { id: 'Rotina Matinal',       emoji: '☀️', label: t('habits_list.morning') },
    { id: 'Exercício Físico',     emoji: '💪', label: t('habits_list.exercise') },
    { id: 'Meditação',            emoji: '🧘', label: t('habits_list.meditation') },
    { id: 'Leitura',              emoji: '📚', label: t('habits_list.reading') },
    { id: 'Journaling',           emoji: '✍️', label: t('habits_list.journaling') },
    { id: 'Trabalho Profundo',    emoji: '🎯', label: t('habits_list.deep_work') },
    { id: 'Alimentação Saudável', emoji: '🥗', label: t('habits_list.eating') },
    { id: 'Horário de Dormir',    emoji: '🌙', label: t('habits_list.sleep') },
    { id: 'Hidratação',           emoji: '💧', label: t('habits_list.hydration') },
    { id: 'Sem Redes Sociais',    emoji: '🚫', label: t('habits_list.detox') },
  ]

  const stepIndex = STEPS.indexOf(step)

  function goTo(next: Step, direction: 'right' | 'left' = 'right') {
    setDir(direction)
    setStep(next)
  }

  function alternar(arr: string[], setArr: (v: string[]) => void, id: string) {
    setArr(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id])
  }

  function finalizar() {
    completarOnboarding({
      nome: nome.trim() || 'Você',
      objetivos,
      desafios,
      habitosSelecionados,
    })
    navigate('/dashboard')
  }

  const anim = {
    animation: `${dir === 'right' ? 'slideFromRight' : 'slideFromLeft'} 0.3s cubic-bezier(0.4,0,0.2,1) both`,
  }

  const cols4 = isMobile ? 2 : 4
  const cols5 = isMobile ? 3 : 5

  const welcomeLines = t('welcome').split('\n')
  const modules = [
    ['⚡', t('module_lifescore')],
    ['🧠', t('module_ai')],
    ['💰', t('module_finance')],
    ['🎯', t('module_focus')],
    ['❤️', t('module_health')],
  ]

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-0)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '80px 20px 32px' : '80px 24px 40px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Orbs de fundo */}
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', animation: 'float 16s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '15%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', animation: 'float 20s ease-in-out infinite reverse' }} />

      {/* Logo */}
      <div style={{ position: 'fixed', top: isMobile ? 14 : 20, left: isMobile ? 16 : 28, display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
        <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(59,130,246,0.4)' }}>
          <Zap size={13} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', background: 'linear-gradient(135deg,#fff 20%,#93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          FLOWOS
        </span>
      </div>

      {/* Conteúdo */}
      <div key={step} style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1, ...anim }}>

        {/* Step dots — em todas as telas exceto welcome */}
        {step !== 'welcome' && <StepDots current={stepIndex} />}

        {/* ─── WELCOME ─────────────────────────────────────────────────────── */}
        {step === 'welcome' && (
          <div style={{ textAlign: 'center' }}>
            {/* Hero */}
            <div style={{ marginBottom: 36 }}>
              <div style={{
                width: 64, height: 64,
                background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                borderRadius: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 0 40px rgba(59,130,246,0.4)',
                animation: 'popIn 0.5s cubic-bezier(0.4,0,0.2,1) both',
              }}>
                <Zap size={30} color="#fff" strokeWidth={2} />
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                {t('system_subtitle')}
              </p>
              <h1 style={{
                fontSize: isMobile ? 36 : 48,
                fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 14,
                background: 'linear-gradient(135deg,#fff 40%,#93c5fd 75%,#67e8f9)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {welcomeLines[0]}<br />{welcomeLines[1]}
              </h1>
              <p style={{ fontSize: 16, color: 'var(--text-1)', lineHeight: 1.65, maxWidth: 360, margin: '0 auto 28px' }}>
                {t('subtitle', { seconds: 60 }).split('60')[0]}<strong style={{ color: 'var(--text-0)' }}>60</strong>{t('subtitle', { seconds: 60 }).split('60')[1]}
              </p>

              {/* Módulos preview */}
              <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
                {modules.map(([e, l]) => (
                  <span key={l} style={{
                    padding: '5px 12px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: 12, color: 'var(--text-2)',
                  }}>
                    {e} {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Input nome */}
            <div style={{ marginBottom: 18 }}>
              <label className="label" style={{ textAlign: 'left', display: 'block', marginBottom: 8 }}>{t('step_name')}</label>
              <input
                className="input-field"
                placeholder={t('name_placeholder')}
                value={nome}
                onChange={e => setNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && nome.trim() && goTo('objetivos')}
                style={{ fontSize: 16, padding: '14px 16px', textAlign: 'center' }}
                autoFocus
              />
            </div>
            <button
              className="btn-primary"
              onClick={() => goTo('objetivos')}
              disabled={!nome.trim()}
              style={{ width: '100%', padding: '14px', fontSize: 15, justifyContent: 'center', gap: 8, opacity: nome.trim() ? 1 : 0.4 }}
            >
              {t('cta_start')} <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ─── OBJETIVOS ───────────────────────────────────────────────────── */}
        {step === 'objetivos' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
                {t('step_goals')}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
                {t('goals_subtitle')}
              </p>
            </div>
            <GradeSelecao items={OBJETIVOS} selecionados={objetivos} onAlternar={id => alternar(objetivos, setObjetivos, id)} colunas={cols4} />
            {objetivos.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--blue)', animation: 'fadeIn 0.2s ease' }}>
                {t('selected', { count: objetivos.length })}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-ghost" onClick={() => goTo('welcome', 'left')} style={{ gap: 6 }}>
                <ArrowLeft size={14} /> {t('common:back')}
              </button>
              <button
                className="btn-primary"
                onClick={() => goTo('desafios')}
                disabled={objetivos.length === 0}
                style={{ flex: 1, justifyContent: 'center', gap: 8, opacity: objetivos.length ? 1 : 0.4 }}
              >
                {t('cta_continue')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── DESAFIOS ────────────────────────────────────────────────────── */}
        {step === 'desafios' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
                {t('step_challenges')}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
                {t('challenges_subtitle')}
              </p>
            </div>
            <GradeSelecao items={DESAFIOS} selecionados={desafios} onAlternar={id => alternar(desafios, setDesafios, id)} colunas={cols4} />
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-ghost" onClick={() => goTo('objetivos', 'left')} style={{ gap: 6 }}>
                <ArrowLeft size={14} /> {t('common:back')}
              </button>
              <button
                className="btn-primary"
                onClick={() => goTo('habitos')}
                style={{ flex: 1, justifyContent: 'center', gap: 8 }}
              >
                {t('cta_continue')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── HÁBITOS ─────────────────────────────────────────────────────── */}
        {step === 'habitos' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
                {t('step_habits')}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
                {t('habits_hint')}
              </p>
            </div>
            <GradeSelecao items={HABITOS} selecionados={habitosSelecionados} onAlternar={id => alternar(habitosSelecionados, setHabitosSelecionados, id)} colunas={cols5} />
            {habitosSelecionados.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--blue)', animation: 'fadeIn 0.2s ease' }}>
                {t('selected_habits', { count: habitosSelecionados.length })}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-ghost" onClick={() => goTo('desafios', 'left')} style={{ gap: 6 }}>
                <ArrowLeft size={14} /> {t('common:back')}
              </button>
              <button
                className="btn-primary"
                onClick={() => goTo('pronto')}
                disabled={habitosSelecionados.length === 0}
                style={{ flex: 1, justifyContent: 'center', gap: 8, opacity: habitosSelecionados.length ? 1 : 0.4 }}
              >
                {t('cta_create')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── PRONTO ──────────────────────────────────────────────────────── */}
        {step === 'pronto' && (
          <TelaConclusa
            nome={nome.trim() || 'você'}
            objetivos={objetivos}
            habitosSelecionados={habitosSelecionados}
            habitos={HABITOS}
            onFinalizar={finalizar}
          />
        )}

      </div>
    </div>
  )
}
