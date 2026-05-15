import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  emoji?: string
  exiting?: boolean
}

interface ToastCtx {
  show:    (msg: string, type?: ToastType, emoji?: string) => void
  success: (msg: string, emoji?: string) => void
  error:   (msg: string, emoji?: string) => void
  info:    (msg: string, emoji?: string) => void
  warning: (msg: string, emoji?: string) => void
}

const Ctx = createContext<ToastCtx | null>(null)

const COLORS: Record<ToastType, { bg: string; border: string; bar: string }> = {
  success: { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.28)', bar: '#10b981' },
  error:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.28)',  bar: '#ef4444' },
  info:    { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.28)', bar: '#3b82f6' },
  warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.28)', bar: '#f59e0b' },
}
const DEFAULT_EMOJI: Record<ToastType, string> = {
  success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️',
}

const DURATION = 3200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.map(x => x.id === id ? { ...x, exiting: true } : x))
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 220)
  }, [])

  const show = useCallback((msg: string, type: ToastType = 'info', emoji?: string) => {
    const id = crypto.randomUUID()
    setToasts(t => [...t.slice(-4), { id, message: msg, type, emoji }])
    const timer = setTimeout(() => dismiss(id), DURATION)
    timers.current.set(id, timer)
    return id
  }, [dismiss])

  const success = useCallback((m: string, e?: string) => show(m, 'success', e), [show])
  const error   = useCallback((m: string, e?: string) => show(m, 'error', e), [show])
  const info    = useCallback((m: string, e?: string) => show(m, 'info', e), [show])
  const warning = useCallback((m: string, e?: string) => show(m, 'warning', e), [show])

  return (
    <Ctx.Provider value={{ show, success, error, info, warning }}>
      {children}

      {/* ── Toast stack ───────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 8,
        pointerEvents: 'none',
        width: 'min(380px, calc(100vw - 32px))',
      }}>
        {toasts.map(t => {
          const clr = COLORS[t.type]
          return (
            <div
              key={t.id}
              className={t.exiting ? 'toast-exit' : 'toast-enter'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px 11px 14px',
                background: `rgba(10,10,15,0.97)`,
                border: `1px solid ${clr.border}`,
                borderRadius: 12,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: `0 6px 28px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)`,
                pointerEvents: 'auto',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Accent bar */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: clr.bar, borderRadius: '12px 0 0 12px' }} />

              <span style={{ fontSize: 16, flexShrink: 0, marginLeft: 4 }}>
                {t.emoji ?? DEFAULT_EMOJI[t.type]}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-0)', lineHeight: 1.45, flex: 1 }}>
                {t.message}
              </span>
              <button
                onClick={() => dismiss(t.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-2)', padding: 2, borderRadius: 4, flexShrink: 0,
                  display: 'flex', alignItems: 'center',
                }}
              >
                <X size={13} />
              </button>

              {/* Progress bar */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0,
                height: 2,
                background: clr.bar,
                opacity: 0.5,
                animation: `shrink ${DURATION}ms linear`,
                transformOrigin: 'left',
              }} />
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
