import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Flame, Target, Sparkles, MoreHorizontal,
  DollarSign, Layers, Heart, TrendingUp, Settings, LogOut, X, Crown,
} from 'lucide-react'
import { useFlowStore, calcularPontuacaoVida } from '../store'
import { useAuthUser } from '../contexts/AuthContext'
import { isSupabaseConfigured, signOut } from '../services/supabase'
import { createCheckoutSession } from '../services/billing'
import AvatarImage from './AvatarImage'

const PRIMARY = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { to: '/habitos',   icon: Flame,           label: 'Hábitos' },
  { to: '/foco',      icon: Target,          label: 'Foco' },
  { to: '/ia',        icon: Sparkles,        label: 'IA' },
]

const MORE_ITEMS = [
  { to: '/financas',    icon: DollarSign, label: 'Finanças' },
  { to: '/projetos',    icon: Layers,     label: 'Projetos' },
  { to: '/saude',       icon: Heart,      label: 'Saúde' },
  { to: '/crescimento', icon: TrendingUp, label: 'Crescimento' },
  { to: '/perfil',      icon: Settings,   label: 'Perfil' },
]

export default function BottomNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [upgrading, setUpgrading]   = useState(false)

  const location   = useLocation()
  const navigate   = useNavigate()
  const authUser   = useAuthUser()

  const habitos    = useFlowStore(s => s.habitos)
  const tarefas    = useFlowStore(s => s.tarefas)
  const transacoes = useFlowStore(s => s.transacoes)
  const focosHoje  = useFlowStore(s => s.focosHoje)
  const perfil     = useFlowStore(s => s.perfil)
  const isPro      = useFlowStore(s => s.isPro)
  const upgradePro = useFlowStore(s => s.upgradePro)
  const resetStore = useFlowStore(s => s.resetStore)

  const score      = calcularPontuacaoVida({ habitos, tarefas, transacoes, focosHoje })
  const clr        = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)'
  const label      = score >= 80 ? 'Excelente 🔥' : score >= 60 ? 'No caminho ⚡' : score >= 40 ? 'Construindo 💪' : 'Iniciando 🌱'

  const isMoreActive = MORE_ITEMS.some(item => location.pathname.startsWith(item.to))

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const { url } = await createCheckoutSession({ plan: 'pro', email: authUser?.email, userId: authUser?.id })
      window.location.href = url
    } catch { upgradePro() }
    finally { setUpgrading(false) }
  }

  async function handleSair() {
    setDrawerOpen(false)
    if (isSupabaseConfigured) {
      await signOut()
    } else if (confirm('Redefinir o FLOWOS? Todos os dados serão apagados.')) {
      resetStore(); window.location.reload()
    }
  }

  function goTo(path: string) {
    navigate(path)
    setDrawerOpen(false)
  }

  return (
    <>
      {/* ── Drawer overlay ────────────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 90,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.15s ease',
          }}
        />
      )}

      {/* ── Drawer sheet ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        left: 0, right: 0,
        bottom: drawerOpen ? 0 : '-100%',
        zIndex: 95,
        background: 'var(--bg-2)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px 20px 0 0',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
        transition: 'bottom 0.32s cubic-bezier(0.4,0,0.2,1)',
        maxHeight: '78vh',
        overflowY: 'auto',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.18)', borderRadius: 999 }} />
        </div>

        {/* Close button */}
        <button
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 4 }}
        >
          <X size={18} />
        </button>

        <div style={{ padding: '8px 16px 4px' }}>
          {/* Life Score */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', marginBottom: 14,
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${clr}22`,
            borderRadius: 12,
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: clr, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums' }}>{score}</span>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Life Score</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: clr }}>{label}</div>
            </div>
          </div>

          {/* More nav items */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {MORE_ITEMS.map(({ to, icon: Icon, label: lbl }) => {
              const active = location.pathname.startsWith(to)
              return (
                <button
                  key={to}
                  onClick={() => goTo(to)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px',
                    background: active ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 12, cursor: 'pointer',
                    color: active ? '#93c5fd' : 'var(--text-1)',
                    fontFamily: 'inherit',
                    transition: 'all var(--t-fast)',
                  }}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{lbl}</span>
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <AvatarImage
              avatarUrl={perfil?.avatarUrl}
              avatarGradient={perfil?.avatarGradient}
              nome={perfil?.nome}
              email={authUser?.email}
              size={36}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {perfil?.nome ?? 'Usuário'}
              </div>
              <div style={{ fontSize: 11, color: isPro ? 'var(--amber)' : 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {authUser?.email ?? (isPro ? '⭐ Pro' : 'Starter')}
              </div>
            </div>
          </div>

          {/* Upgrade */}
          {!isPro && (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px', marginBottom: 8,
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: 10, cursor: 'pointer', color: 'var(--amber)',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              }}
            >
              <Crown size={13} />
              {upgrading ? 'Redirecionando...' : 'Upgrade para Pro'}
            </button>
          )}

          {/* Sign out */}
          <button
            onClick={handleSair}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px', background: 'transparent',
              border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10,
              color: 'rgba(239,68,68,0.7)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <LogOut size={13} />
            {isSupabaseConfigured ? 'Sair' : 'Redefinir'}
          </button>
        </div>
      </div>

      {/* ── Bottom tab bar ─────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'stretch',
        background: 'rgba(6,6,8,0.94)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        position: 'relative',
        zIndex: 80,
      }}>
        {PRIMARY.map(({ to, icon: Icon, label: lbl }) => (
          <NavLink key={to} to={to} style={{ flex: 1, textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '10px 4px',
                color: isActive ? '#93c5fd' : 'var(--text-2)',
                transition: 'color var(--t-fast)',
              }}>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6}
                  style={{ filter: isActive ? 'drop-shadow(0 0 5px rgba(59,130,246,0.6))' : 'none' }}
                />
                <span style={{ fontSize: 9.5, fontWeight: isActive ? 700 : 400, letterSpacing: '-0.01em' }}>{lbl}</span>
                {isActive && (
                  <div style={{ position: 'absolute', top: 0, width: 24, height: 2, background: 'linear-gradient(90deg,#3b82f6,#06b6d4)', borderRadius: '0 0 2px 2px' }} />
                )}
              </div>
            )}
          </NavLink>
        ))}

        {/* Mais button */}
        <button
          onClick={() => setDrawerOpen(v => !v)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, padding: '10px 4px', background: 'none', border: 'none', cursor: 'pointer',
            color: isMoreActive || drawerOpen ? '#93c5fd' : 'var(--text-2)',
            position: 'relative',
          }}
        >
          <MoreHorizontal size={20} strokeWidth={isMoreActive || drawerOpen ? 2.2 : 1.6}
            style={{ filter: isMoreActive || drawerOpen ? 'drop-shadow(0 0 5px rgba(59,130,246,0.6))' : 'none' }}
          />
          <span style={{ fontSize: 9.5, fontWeight: isMoreActive || drawerOpen ? 700 : 400 }}>Mais</span>
          {(isMoreActive || drawerOpen) && (
            <div style={{ position: 'absolute', top: 0, width: 24, height: 2, background: 'linear-gradient(90deg,#3b82f6,#06b6d4)', borderRadius: '0 0 2px 2px' }} />
          )}
        </button>
      </div>
    </>
  )
}
