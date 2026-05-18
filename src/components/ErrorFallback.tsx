import { Sentry } from '../services/sentry'

interface Props {
  error: Error
  resetError: () => void
}

export function ErrorFallback({ error, resetError }: Props) {
  const eventId = Sentry.lastEventId?.()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#04040e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: 24,
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 28,
        }}>⚡</div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.03em' }}>
          Algo deu errado
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: 32, fontWeight: 300 }}>
          Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
          {eventId && (
            <><br /><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>ID: {eventId}</span></>
          )}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={resetError}
            style={{
              background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
              border: 'none', borderRadius: 10, padding: '10px 24px',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Tentar novamente
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '10px 24px', color: 'rgba(255,255,255,0.7)',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Ir para o início
          </button>
        </div>

        {import.meta.env.DEV && (
          <pre style={{
            marginTop: 32, padding: 16, background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10,
            fontSize: 11, color: '#f87171', textAlign: 'left',
            overflow: 'auto', maxHeight: 200, whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {error.message}{'\n'}{error.stack}
          </pre>
        )}
      </div>
    </div>
  )
}
