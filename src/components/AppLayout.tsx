import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import InstallPrompt from './InstallPrompt'
import { useIsMobile } from '../hooks/useIsMobile'
import { useNotificationScheduler } from '../hooks/useNotificationScheduler'

interface Props { children: ReactNode }

export default function AppLayout({ children }: Props) {
  const isMobile = useIsMobile()
  useNotificationScheduler()

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', position: 'relative', background: 'var(--bg-0)' }}>
        <div className="app-bg" />
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
          <TopBar />
          <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
          <BottomNav />
        </div>
        <InstallPrompt />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative', background: 'var(--bg-0)' }}>
      <div className="app-bg" />
      <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
      <InstallPrompt />
    </div>
  )
}
