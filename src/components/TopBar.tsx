import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useFlowStore, calcularPontuacaoVida } from '../store'
import { useAuthUser } from '../contexts/AuthContext'
import AvatarImage from './AvatarImage'

export default function TopBar() {
  const navigate   = useNavigate()
  const habitos    = useFlowStore(s => s.habitos)
  const tarefas    = useFlowStore(s => s.tarefas)
  const transacoes = useFlowStore(s => s.transacoes)
  const focosHoje  = useFlowStore(s => s.focosHoje)
  const perfil     = useFlowStore(s => s.perfil)
  const authUser   = useAuthUser()

  const score      = calcularPontuacaoVida({ habitos, tarefas, transacoes, focosHoje })
  const clr        = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)'
  const label      = score >= 80 ? 'Excelente 🔥' : score >= 60 ? 'No caminho ⚡' : score >= 40 ? 'Construindo 💪' : 'Iniciando 🌱'

  return (
    <div style={{
      flexShrink: 0,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 10,
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
      background: 'rgba(6,6,8,0.92)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'relative',
      zIndex: 50,
    }}>
      {/* Logo */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 14px rgba(59,130,246,0.4)',
        }}>
          <Zap size={13} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{
          fontSize: 14, fontWeight: 800, letterSpacing: '0.09em',
          background: 'linear-gradient(135deg,#fff 20%,#93c5fd 70%,#67e8f9)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          FLOWOS
        </span>
      </button>

      {/* Score chip + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 11px',
          background: `rgba(255,255,255,0.04)`,
          border: `1px solid ${clr}28`,
          borderRadius: 999,
        }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: clr, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>{score}</span>
          <span style={{ fontSize: 10, color: 'var(--text-2)' }}>{label}</span>
        </div>

        <button
          onClick={() => navigate('/perfil')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)', borderRadius: '50%',
          }}
        >
          <AvatarImage
            avatarUrl={perfil?.avatarUrl}
            avatarGradient={perfil?.avatarGradient}
            nome={perfil?.nome}
            email={authUser?.email}
            size={30}
          />
        </button>
      </div>
    </div>
  )
}
