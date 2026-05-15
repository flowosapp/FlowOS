import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { canInstall, promptInstall, isStandalone, captureInstallPrompt } from '../services/pwa'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa-install-dismissed') === '1')

  useEffect(() => {
    captureInstallPrompt()
    const check = () => {
      if (!isStandalone() && !dismissed && canInstall()) setShow(true)
    }
    // Check agora e após o evento beforeinstallprompt
    check()
    window.addEventListener('beforeinstallprompt', () => setTimeout(check, 100))
    return () => window.removeEventListener('beforeinstallprompt', check)
  }, [dismissed])

  if (!show) return null

  async function handleInstall() {
    const outcome = await promptInstall()
    if (outcome === 'accepted') setShow(false)
  }

  function handleDismiss() {
    localStorage.setItem('pwa-install-dismissed', '1')
    setDismissed(true)
    setShow(false)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, maxWidth: 380, width: 'calc(100vw - 40px)',
      background: 'var(--bg-secondary)', border: '1px solid rgba(59,130,246,0.3)',
      borderRadius: 14, padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'fadeSlideIn 0.3s ease',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, #3b82f6, #00d4ff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Smartphone size={20} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Instalar FLOWOS</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Acesso rápido na tela inicial, funciona offline.</div>
      </div>
      <button onClick={handleInstall} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
        background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, flexShrink: 0,
      }}>
        <Download size={13} /> Instalar
      </button>
      <button onClick={handleDismiss} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-dim)', padding: 4, flexShrink: 0,
      }}>
        <X size={16} />
      </button>
    </div>
  )
}
