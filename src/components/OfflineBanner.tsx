import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const online = useNetworkStatus()

  if (online) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'rgba(245,158,11,0.95)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '8px 16px',
      fontSize: 13,
      fontWeight: 600,
      color: '#000',
      letterSpacing: '-0.01em',
      animation: 'fadeIn 0.2s ease',
    }}>
      <WifiOff size={14} />
      Offline — seus dados estão salvos localmente e serão sincronizados ao reconectar.
    </div>
  )
}
