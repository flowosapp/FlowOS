import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Share, ArrowUp } from 'lucide-react'
import { canInstall, promptInstall, isStandalone, captureInstallPrompt, isIOS, isIOSSafari, isMacOSSafari } from '../services/pwa'

type InstallMode = 'android' | 'ios' | 'macos-safari' | null

function detectMode(): InstallMode {
  if (isStandalone()) return null
  if (isIOSSafari()) return 'ios'
  if (isMacOSSafari()) return 'macos-safari'
  if (isIOS()) return null  // Chrome/Firefox iOS — use their own install UI
  return null  // will be set to 'android' once beforeinstallprompt fires
}

export default function InstallPrompt() {
  const [mode, setMode] = useState<InstallMode>(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa-install-dismissed') === '1')

  useEffect(() => {
    if (dismissed) return
    captureInstallPrompt()

    // iOS/macOS Safari: show immediately, no event needed
    const initial = detectMode()
    if (initial) { setMode(initial); return }

    // Android/Chrome/Edge: wait for beforeinstallprompt
    const onPrompt = () => {
      if (!isStandalone()) setMode('android')
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    if (canInstall()) setMode('android')

    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [dismissed])

  if (!mode || dismissed) return null

  function handleDismiss() {
    localStorage.setItem('pwa-install-dismissed', '1')
    setDismissed(true)
    setMode(null)
  }

  async function handleAndroidInstall() {
    const outcome = await promptInstall()
    if (outcome === 'accepted') setMode(null)
  }

  const base: React.CSSProperties = {
    position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
    zIndex: 9999, maxWidth: 400, width: 'calc(100vw - 32px)',
    background: 'var(--bg-secondary)', border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: 14, padding: '14px 16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'flex-start', gap: 12,
    animation: 'fadeSlideIn 0.3s ease',
  }

  const icon = (
    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Smartphone size={20} color="#fff" />
    </div>
  )

  const closeBtn = (
    <button onClick={handleDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4, flexShrink: 0 }}>
      <X size={16} />
    </button>
  )

  // ── Android / Chrome / Edge ──────────────────────────────────────────────────
  if (mode === 'android') {
    return (
      <div style={base}>
        {icon}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Instalar FlowOS</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Acesso rápido na tela inicial, funciona offline.</div>
        </div>
        <button
          onClick={handleAndroidInstall}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, flexShrink: 0 }}
        >
          <Download size={13} /> Instalar
        </button>
        {closeBtn}
      </div>
    )
  }

  // ── iOS Safari ───────────────────────────────────────────────────────────────
  if (mode === 'ios') {
    return (
      <div style={{ ...base, flexDirection: 'column', gap: 10, paddingBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
          {icon}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Instalar FlowOS no iPhone</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Funciona offline e salva espaço.</div>
          </div>
          {closeBtn}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 4 }}>
          {[
            { icon: <Share size={14} color="#3b82f6" />, text: <>Toque em <strong style={{ color: '#f2f2f5' }}>Compartilhar</strong> <Share size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> na barra do Safari</> },
            { icon: <ArrowUp size={14} color="#3b82f6" />, text: <>Role para baixo e toque em <strong style={{ color: '#f2f2f5' }}>"Adicionar à Tela de Início"</strong></> },
            { icon: <Smartphone size={14} color="#3b82f6" />, text: <>Toque em <strong style={{ color: '#f2f2f5' }}>Adicionar</strong> — FlowOS aparece como app nativo</> },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(59,130,246,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {step.icon}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── macOS Safari ─────────────────────────────────────────────────────────────
  if (mode === 'macos-safari') {
    return (
      <div style={{ ...base, flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
          {icon}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Instalar FlowOS no Mac</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Abra como app independente, funciona offline.</div>
          </div>
          {closeBtn}
        </div>
        <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
          No Safari: <strong style={{ color: '#f2f2f5' }}>Arquivo → Adicionar ao Dock</strong>
          <br />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Disponível no macOS Sonoma (14+) ou superior</span>
        </div>
      </div>
    )
  }

  return null
}
