import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

export default function UpdatePrompt() {
  const [show, setShow] = useState(false)
  const [reg, setReg] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.getRegistration().then(r => {
      if (!r) return
      setReg(r)

      // SW esperando para ativar = nova versão disponível
      if (r.waiting) { setShow(true); return }

      r.addEventListener('updatefound', () => {
        const newWorker = r.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setShow(true)
          }
        })
      })
    })

    // Detecta troca de controller (após skipWaiting do novo SW)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }, [])

  if (!show) return null

  function handleUpdate() {
    reg?.waiting?.postMessage({ type: 'SKIP_WAITING' })
    setShow(false)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9990,
      background: 'var(--bg-3)',
      border: '1px solid rgba(59,130,246,0.35)',
      borderRadius: 12,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.1)',
      animation: 'fadeSlideIn 0.25s ease',
      whiteSpace: 'nowrap',
    }}>
      <div style={{ fontSize: 13, color: 'var(--text-1)' }}>
        ⚡ Nova versão disponível
      </div>
      <button
        onClick={handleUpdate}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
          border: 'none', borderRadius: 8, cursor: 'pointer',
          color: '#fff', fontSize: 12, fontWeight: 600,
          boxShadow: '0 2px 10px rgba(59,130,246,0.35)',
        }}
      >
        <RefreshCw size={12} />
        Atualizar
      </button>
    </div>
  )
}
