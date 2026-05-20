import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Zap, ArrowLeft } from 'lucide-react'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'
const sans = "'Inter', -apple-system, sans-serif"

interface PublicShellProps { children: ReactNode }

export function PublicShell({ children }: PublicShellProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('common')

  return (
    <div style={{ background: '#04040e', color: '#e2e8f0', minHeight: '100vh', fontFamily: sans }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: inherit; }
        .pub-link { color: rgba(255,255,255,0.4); transition: color 0.2s; cursor: pointer; }
        .pub-link:hover { color: rgba(255,255,255,0.8); }
        .pub-badge { display: inline-flex; align-items: center; padding: 4px 12px; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); border-radius: 100px; font-size: 11px; color: #93c5fd; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500; }
        .pub-section-label { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.18); margin-bottom: 14px; }
        .pub-h1 { font-size: clamp(28px, 4vw, 52px); font-weight: 900; letter-spacing: -0.032em; color: #fff; line-height: 1.05; margin-bottom: 18px; }
        .pub-body { font-size: 15px; color: rgba(255,255,255,0.62); line-height: 1.88; font-weight: 300; }
        .pub-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 28px 32px; position: relative; overflow: hidden; }
        .pub-card::before { content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px; background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent); }
        .pub-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 48px 0; }
      `}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '14px clamp(20px, 5vw, 48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(4,4,14,0.92)', backdropFilter: 'blur(24px) saturate(1.5)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', padding: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}>
            <Zap size={12} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>FLOWOS</span>
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '8px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}
        >
          <ArrowLeft size={13} /> {t('back')}
        </button>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) clamp(20px, 5vw, 48px) 120px' }}>
        {children}
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px clamp(20px, 5vw, 48px)', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.1)' }}>© 2026 FlowOS</p>
      </footer>
    </div>
  )
}
