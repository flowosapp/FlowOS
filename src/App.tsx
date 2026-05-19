import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { Smartphone, X, Download } from 'lucide-react'
import { useFlowStore, DATA_KEYS } from './store'
import type { FlowState } from './types'
import { isSupabaseConfigured, getCurrentUser, onAuthChange, loadUserState, saveUserState, getSubscription, isActiveSubscription } from './services/supabase'
import { canInstall, isStandalone, captureInstallPrompt, promptInstall, registerBackgroundSync } from './services/pwa'
import { AuthContext } from './contexts/AuthContext'
import { identifyUser, resetAnalyticsUser, track, Events } from './services/analytics'
import AppLayout from './components/AppLayout'
import OfflineBanner from './components/OfflineBanner'
import UpdatePrompt from './components/UpdatePrompt'
import { SkeletonDashboard } from './components/Skeleton'
// Lazy-loaded pages — cada rota vira um chunk separado no build
const LandingPage      = lazy(() => import('./pages/LandingPage'))
const LoginPage        = lazy(() => import('./pages/LoginPage'))
const OnboardingPage   = lazy(() => import('./pages/OnboardingPage'))
const DashboardPage    = lazy(() => import('./pages/DashboardPage'))
const AIPage           = lazy(() => import('./pages/AIPage'))
const HabitsPage       = lazy(() => import('./pages/HabitsPage'))
const ProjectsPage     = lazy(() => import('./pages/ProjectsPage'))
const FinancePage      = lazy(() => import('./pages/FinancePage'))
const FocusPage        = lazy(() => import('./pages/FocusPage'))
const ProfilePage      = lazy(() => import('./pages/ProfilePage'))
const SaudePage        = lazy(() => import('./pages/SaudePage'))
const CrescimentoPage  = lazy(() => import('./pages/CrescimentoPage'))
const SobrePage        = lazy(() => import('./pages/public/SobrePage'))
const BlogPage         = lazy(() => import('./pages/public/BlogPage'))
const CarreirasPage    = lazy(() => import('./pages/public/CarreirasPage'))
const DocsPage         = lazy(() => import('./pages/public/DocsPage'))
const ChangelogPage    = lazy(() => import('./pages/public/ChangelogPage'))
const StatusPage       = lazy(() => import('./pages/public/StatusPage'))
const PrivacidadePage  = lazy(() => import('./pages/public/PrivacidadePage'))
const TermosPage       = lazy(() => import('./pages/public/TermosPage'))
const CookiesPage      = lazy(() => import('./pages/public/CookiesPage'))
const ContratoPage     = lazy(() => import('./pages/public/ContratoPage'))
const PrecosPage       = lazy(() => import('./pages/PrecosPage'))
import { CookieBanner } from './components/CookieBanner'
import { Sentry } from './services/sentry'
import { ErrorFallback } from './components/ErrorFallback'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const [checkoutResult, setCheckoutResult] = useState<'success' | 'cancelled' | null>(null)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const prevUser = useRef<User | null>(null)

  const onboardingCompleto = useFlowStore(s => s.onboardingCompleto)
  const storeUserId = useFlowStore(s => s.userId)
  const setUserId = useFlowStore(s => s.setUserId)
  const resetStore = useFlowStore(s => s.resetStore)
  const upgradePro = useFlowStore(s => s.upgradePro)
  const hydrateFromRemote = useFlowStore(s => s.hydrateFromRemote)

  useEffect(() => {
    captureInstallPrompt()
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    getCurrentUser().then(u => {
      setUser(u)
      setAuthLoading(false)
    })

    return onAuthChange(u => {
      // Identify / reset user for analytics
      if (u && !prevUser.current) {
        identifyUser(u.id, u.email)
        track(Events.LOGIN, { provider: u.app_metadata?.provider })
      } else if (!u && prevUser.current) {
        resetAnalyticsUser()
        track(Events.LOGOUT)
      }

      // Show install modal on fresh login (null → user)
      if (!prevUser.current && u && !isStandalone() && !sessionStorage.getItem('install-modal-shown')) {
        setTimeout(() => {
          if (canInstall()) {
            setShowInstallModal(true)
            sessionStorage.setItem('install-modal-shown', '1')
          }
        }, 1200)
      }
      prevUser.current = u
      setUser(u)
      setAuthLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (!user) {
      setUserId(null)
      return
    }
    if (storeUserId && storeUserId !== user.id) {
      resetStore()
    }
    setUserId(user.id)
  }, [user?.id])

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return

    // Load state + subscription in parallel; subscription is authoritative for isPro
    Promise.all([
      loadUserState(user.id),
      getSubscription(user.id),
    ]).then(([remoteState, sub]) => {
      if (remoteState) hydrateFromRemote(remoteState)
      // Override isPro from Supabase — prevents localStorage spoofing
      if (isActiveSubscription(sub)) {
        upgradePro()
      }
    })

    // Sync quando SW aciona Background Sync após reconexão
    const syncHandler = () => {
      const state = useFlowStore.getState()
      if (!state.userId) return
      const data = Object.fromEntries(DATA_KEYS.map(k => [k, state[k as keyof FlowState]]))
      saveUserState(state.userId, data)
    }
    window.addEventListener('flowos:sync', syncHandler)

    let saveTimeout: ReturnType<typeof setTimeout>
    const unsub = useFlowStore.subscribe(state => {
      if (!state.userId) return
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        const uid = state.userId!
        const data = Object.fromEntries(
          DATA_KEYS.map(k => [k, state[k as keyof FlowState]])
        )
        if (navigator.onLine) {
          saveUserState(uid, data)
        } else {
          registerBackgroundSync()
        }
      }, 2000)
    })

    return () => {
      clearTimeout(saveTimeout)
      unsub()
      window.removeEventListener('flowos:sync', syncHandler)
    }
  }, [user?.id])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const checkout = params.get('checkout')
    if (checkout === 'success') {
      upgradePro()
      setCheckoutResult('success')
      track(Events.CHECKOUT_SUCCESS)
      window.history.replaceState({}, '', window.location.pathname)
    } else if (checkout === 'cancelled') {
      setCheckoutResult('cancelled')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const installModal = showInstallModal && (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={() => setShowInstallModal(false)}
    >
      <div
        style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 20, padding: '36px 32px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)', animation: 'fadeSlideIn 0.3s ease' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={() => setShowInstallModal(false)} style={{ position: 'absolute' as const, top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }}>
          <X size={16} />
        </button>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 32px rgba(59,130,246,0.4)' }}>
          <Smartphone size={28} color="#fff" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>
          Instale o FlowOS
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 28 }}>
          Adicione o FlowOS à sua tela inicial e use <strong style={{ color: 'var(--text-primary)' }}>offline</strong> — sem precisar abrir o navegador. Quando voltar a internet, tudo sincroniza automaticamente.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn-primary"
            style={{ justifyContent: 'center', gap: 8 }}
            onClick={async () => {
              await promptInstall()
              setShowInstallModal(false)
            }}
          >
            <Download size={15} />
            Instalar na tela inicial
          </button>
          <button
            onClick={() => setShowInstallModal(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', padding: 8 }}
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  )

  if (authLoading) {
    return (
      <div style={{ height: '100%', background: 'var(--bg-primary)', overflow: 'hidden' }}>
        <SkeletonDashboard />
      </div>
    )
  }

  if (isSupabaseConfigured && !user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sobre" element={<SobrePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/carreiras" element={<CarreirasPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/privacidade" element={<PrivacidadePage />} />
        <Route path="/termos" element={<TermosPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/contrato" element={<ContratoPage />} />
        <Route path="/precos" element={<PrecosPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  if (!onboardingCompleto) {
    return <OnboardingPage />
  }

  return (
    <Sentry.ErrorBoundary fallback={({ error, resetError }) => <ErrorFallback error={error as Error} resetError={resetError} />}>
    <AuthContext.Provider value={user}>
      <OfflineBanner />
      <UpdatePrompt />
      <CookieBanner />
      {installModal}
      <Suspense fallback={<div style={{ background: '#04040e', minHeight: '100vh' }} />}>
      <Routes>
        {/* Páginas públicas acessíveis mesmo logado */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/precos" element={<PrecosPage />} />

        {/* Todas as rotas do app dentro do AppLayout */}
        <Route path="*" element={
          <>
            {checkoutResult === 'success' && (
              <div
                style={{
                  position: 'fixed', inset: 0, zIndex: 1000,
                  background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onClick={() => setCheckoutResult(null)}
              >
                <div
                  className="card animate-in"
                  style={{ maxWidth: 380, width: '90%', padding: '36px 32px', textAlign: 'center', border: '1px solid rgba(245,158,11,0.25)' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ fontSize: 40, marginBottom: 16 }}>⭐</div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
                    Bem-vindo ao Pro!
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                    Sua assinatura foi ativada com sucesso. Aproveite todos os recursos sem limites.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => setCheckoutResult(null)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Continuar no FlowOS
                  </button>
                </div>
              </div>
            )}
            {checkoutResult === 'cancelled' && (
              <div
                style={{
                  position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                  zIndex: 1000, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '12px 20px', display: 'flex', alignItems: 'center',
                  gap: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'fadeSlideIn 0.2s ease',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Checkout cancelado. Você pode tentar novamente quando quiser.
                </span>
                <button
                  onClick={() => setCheckoutResult(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}
                >
                  ×
                </button>
              </div>
            )}
            <AppLayout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/ia" element={<AIPage />} />
                <Route path="/habitos" element={<HabitsPage />} />
                <Route path="/projetos" element={<ProjectsPage />} />
                <Route path="/financas" element={<FinancePage />} />
                <Route path="/foco" element={<FocusPage />} />
                <Route path="/saude" element={<SaudePage />} />
                <Route path="/crescimento" element={<CrescimentoPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/sobre" element={<SobrePage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/carreiras" element={<CarreirasPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/changelog" element={<ChangelogPage />} />
                <Route path="/status" element={<StatusPage />} />
                <Route path="/privacidade" element={<PrivacidadePage />} />
                <Route path="/termos" element={<TermosPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
                <Route path="/contrato" element={<ContratoPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppLayout>
          </>
        } />
      </Routes>
      </Suspense>
    </AuthContext.Provider>
    </Sentry.ErrorBoundary>
  )
}
