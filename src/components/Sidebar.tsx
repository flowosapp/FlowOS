import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFlowStore, calcularPontuacaoVida } from '../store'
import {
  LayoutDashboard, Sparkles, Flame, Layers, DollarSign,
  Target, LogOut, Zap, Crown, Settings, Heart, TrendingUp,
} from 'lucide-react'
import { useAuthUser } from '../contexts/AuthContext'
import { isSupabaseConfigured, signOut } from '../services/supabase'
import { createCheckoutSession } from '../services/billing'
import AvatarImage from './AvatarImage'
import LanguageSwitcher from './LanguageSwitcher'

export default function Sidebar() {
  const { t } = useTranslation(['navigation', 'common'])

  const NAV = [
    { to: '/dashboard',    icon: LayoutDashboard, label: t('dashboard') },
    { to: '/ia',           icon: Sparkles,         label: t('ai') },
    { to: '/habitos',      icon: Flame,            label: t('habits') },
    { to: '/projetos',     icon: Layers,           label: t('projects') },
    { to: '/financas',     icon: DollarSign,       label: t('finance') },
    { to: '/foco',         icon: Target,           label: t('focus') },
    { to: '/saude',        icon: Heart,            label: t('health') },
    { to: '/crescimento',  icon: TrendingUp,       label: t('growth') },
  ]

  const perfil     = useFlowStore(s => s.perfil)
  const habitos    = useFlowStore(s => s.habitos)
  const tarefas    = useFlowStore(s => s.tarefas)
  const transacoes = useFlowStore(s => s.transacoes)
  const focosHoje  = useFlowStore(s => s.focosHoje)
  const isPro      = useFlowStore(s => s.isPro)
  const upgradePro = useFlowStore(s => s.upgradePro)
  const resetStore = useFlowStore(s => s.resetStore)
  const navigate   = useNavigate()
  const authUser   = useAuthUser()
  const [upgrading, setUpgrading] = useState(false)

  const score      = calcularPontuacaoVida({ habitos, tarefas, transacoes, focosHoje })
  const scoreColor = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)'
  const scoreLabel = score >= 80 ? t('common:score_excellent') : score >= 60 ? t('common:score_ontrack') : score >= 40 ? t('common:score_building') : t('common:score_starting')

  // SVG ring
  const R = 17, cx = 22, circ = 2 * Math.PI * R
  const filled = (score / 100) * circ

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const { url } = await createCheckoutSession({ plan: 'pro', email: authUser?.email, userId: authUser?.id })
      window.location.href = url
    } catch { upgradePro() }
    finally { setUpgrading(false) }
  }

  async function handleSair() {
    if (isSupabaseConfigured) {
      await signOut()
    } else if (confirm(t('common:reset_confirm'))) {
      resetStore(); window.location.reload()
    }
  }

  return (
    <aside style={{
      width: 224,
      minWidth: 224,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '18px 12px',
      flexShrink: 0,
      position: 'relative',
      background: 'rgba(11,11,15,0.88)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      zIndex: 10,
    }}>
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.35) 50%, transparent 100%)', pointerEvents: 'none' }} />

      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '2px 4px', marginBottom: 26, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'opacity var(--t-fast)' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: 'var(--grad-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 18px rgba(59,130,246,0.45), 0 2px 8px rgba(0,0,0,0.4)',
        }}>
          <Zap size={15} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{
          fontSize: 15, fontWeight: 800, letterSpacing: '0.09em',
          background: 'linear-gradient(135deg,#fff 20%,#93c5fd 70%,#67e8f9)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>FLOWOS</span>
      </button>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Icon size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Life Score ring ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '11px 13px', marginBottom: 10,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 11,
      }}>
        <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
          <svg width={44} height={44} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cx} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
            <circle cx={cx} cy={cx} r={R} fill="none" stroke={scoreColor} strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circ}`}
              style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 3px ${scoreColor})` }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: scoreColor, letterSpacing: '-0.04em' }}>{score}</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{t('common:life_score')}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: scoreColor }}>{scoreLabel}</div>
        </div>
      </div>

      {/* ── Upgrade ───────────────────────────────────────────────────────── */}
      {!isPro && (
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 10px', marginBottom: 10, width: '100%',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 9, cursor: upgrading ? 'default' : 'pointer',
            color: 'var(--amber)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            letterSpacing: '-0.01em',
            transition: 'all var(--t-fast)',
            boxShadow: '0 0 14px rgba(245,158,11,0.08)',
          }}
          onMouseEnter={e => !upgrading && (e.currentTarget.style.background = 'rgba(245,158,11,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.1)')}
        >
          {upgrading ? (
            <><span style={{ width: 12, height: 12, border: '2px solid rgba(245,158,11,0.3)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> {t('common:redirecting')}</>
          ) : (
            <><Crown size={13} /> {t('common:upgrade_pro')}</>
          )}
        </button>
      )}

      {/* ── User ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <button
          onClick={() => navigate('/perfil')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px',
            borderRadius: 9, background: 'rgba(255,255,255,0.03)',
            border: '1px solid transparent', cursor: 'pointer', textAlign: 'left', width: '100%',
            transition: 'all var(--t-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'transparent' }}
        >
          <AvatarImage
            avatarUrl={perfil?.avatarUrl}
            avatarGradient={perfil?.avatarGradient}
            nome={perfil?.nome}
            email={authUser?.email}
            size={30}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
              {perfil?.nome ?? t('user_fallback')}
            </div>
            <div style={{ fontSize: 11, color: isPro ? 'var(--amber)' : 'var(--text-2)', fontWeight: isPro ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {authUser?.email ?? (isPro ? '⭐ Pro' : t('common:plan_starter'))}
            </div>
          </div>
          <Settings size={12} color="var(--text-2)" style={{ flexShrink: 0 }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 2 }}>
          <button
            onClick={handleSair}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'transparent', border: 'none', borderRadius: 6, color: 'var(--text-2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'color var(--t-fast)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
          >
            <LogOut size={13} />
            {isSupabaseConfigured ? t('common:sign_out') : t('common:reset')}
          </button>
          <LanguageSwitcher />
        </div>
      </div>
    </aside>
  )
}
