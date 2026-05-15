import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './contexts/ToastContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// ── Service Worker ───────────────────────────────────────────────────────────

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        console.info('[FLOWOS] SW registrado:', reg.scope)
        // Verifica atualizações a cada 60 minutos
        setInterval(() => reg.update(), 60 * 60 * 1000)
      })
      .catch(err => console.warn('[FLOWOS] SW falhou:', err))
  })

  // Quando SW pede sync, dispara save imediato
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SYNC_REQUESTED') {
      window.dispatchEvent(new CustomEvent('flowos:sync'))
    }
  })
}
