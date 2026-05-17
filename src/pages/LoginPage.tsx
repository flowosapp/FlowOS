import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import {
  signInWithPassword, signUpWithPassword, signInWithGoogle, sendPasswordReset,
} from '../services/supabase'

type Mode = 'login' | 'signup' | 'confirm' | 'reset'

const BLUE  = '#3b82f6'
const CYAN  = '#06b6d4'
const grad  = `linear-gradient(135deg, ${BLUE}, ${CYAN})`

function Spinner() {
  return (
    <span style={{
      width: 14, height: 14, flexShrink: 0, display: 'inline-block',
      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    }} />
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function InputField({
  icon: Icon, type = 'text', placeholder, value, onChange, autoFocus = false,
  rightSlot, disabled = false,
}: {
  icon: typeof Mail
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
  rightSlot?: React.ReactNode
  disabled?: boolean
}) {
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={14} style={{
        position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--text-dim)', pointerEvents: 'none',
      }} />
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
        disabled={disabled}
        style={{ paddingLeft: 38, paddingRight: rightSlot ? 42 : 14 }}
      />
      {rightSlot && (
        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
          {rightSlot}
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  const { t } = useTranslation(['auth', 'common'])
  const [mode, setMode] = useState<Mode>('login')

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPwd, setShowLoginPwd] = useState(false)

  // Signup
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [showSignupPwd, setShowSignupPwd] = useState(false)

  // Reset
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

  // Common
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function clearError() { if (error) setError('') }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await signInWithPassword(loginEmail.trim(), loginPassword)
    if (!res.ok) setError(res.message)
    setLoading(false)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (signupPassword !== signupConfirm) { setError(t('passwords_no_match')); return }
    if (signupPassword.length < 6) { setError(t('password_too_short')); return }
    setLoading(true); setError('')
    const res = await signUpWithPassword(signupEmail.trim(), signupPassword, signupName.trim())
    if (res.ok) setMode('confirm')
    else setError(res.message)
    setLoading(false)
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await sendPasswordReset(resetEmail.trim())
    if (res.ok) setResetSent(true)
    else setError(res.message)
    setLoading(false)
  }

  async function handleGoogle() {
    setError('')
    await signInWithGoogle()
  }

  const pwdToggle = (show: boolean, toggle: () => void) => (
    <button type="button" onClick={toggle} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: 'var(--text-dim)', padding: 2, display: 'flex',
    }}>
      {show ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  )

  return (
    <div style={{
      height: '100%', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, background: grad, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(59,130,246,0.35)' }}>
            <Zap size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.06em', background: 'linear-gradient(135deg, #fff 40%, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FLOWOS
          </span>
        </div>

        <div className="card animate-in" style={{ padding: '32px 32px 28px', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* ─── CONFIRM ────────────────────────────────────────────────── */}
          {mode === 'confirm' && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={26} color="#10b981" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>{t('account_created')}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
                {t('check_email_confirm', { email: signupEmail })}
              </p>
              <button onClick={() => { setMode('login'); setError('') }} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                {t('sign_in')}
              </button>
            </div>
          )}

          {/* ─── RESET SENT ─────────────────────────────────────────────── */}
          {mode === 'reset' && resetSent && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Mail size={26} color={BLUE} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{t('email_sent')}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 28 }}>
                {t('check_inbox')} — <strong style={{ color: 'var(--text-primary)' }}>{resetEmail}</strong>
              </p>
              <button onClick={() => { setMode('login'); setResetSent(false) }} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                {t('sign_in')}
              </button>
            </div>
          )}

          {/* ─── RESET FORM ─────────────────────────────────────────────── */}
          {mode === 'reset' && !resetSent && (
            <>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.025em' }}>{t('reset_password')}</h1>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                {t('enter_email')}
              </p>
              <form onSubmit={handleReset}>
                <label className="label">{t('email')}</label>
                <div style={{ marginBottom: 16 }}>
                  <InputField icon={Mail} type="email" placeholder="seu@email.com" value={resetEmail} onChange={v => { setResetEmail(v); clearError() }} autoFocus />
                </div>
                {error && <ErrorBox msg={error} />}
                <button type="submit" className="btn-primary" disabled={loading || !resetEmail.trim()} style={{ width: '100%', justifyContent: 'center', gap: 8, opacity: loading || !resetEmail.trim() ? 0.65 : 1 }}>
                  {loading ? <Spinner /> : <Mail size={14} />}
                  {t('send_reset_link')}
                </button>
              </form>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-dim)', marginTop: 20 }}>
                <button onClick={() => { setMode('login'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer' }}>← {t('sign_in')}</button>
              </p>
            </>
          )}

          {/* ─── TABS: LOGIN / SIGNUP ─────────────────────────────────── */}
          {(mode === 'login' || mode === 'signup') && (
            <>
              {/* Tab bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 24 }}>
                {(['login', 'signup'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError('') }}
                    style={{
                      flex: 1, background: 'none', border: 'none', padding: '0 0 14px',
                      fontSize: 14, fontWeight: mode === m ? 700 : 400, cursor: 'pointer',
                      color: mode === m ? 'var(--text-primary)' : 'var(--text-dim)',
                      borderBottom: mode === m ? `2px solid ${BLUE}` : '2px solid transparent',
                      marginBottom: -1, transition: 'all 0.2s',
                    }}
                  >
                    {m === 'login' ? t('sign_in') : t('sign_up')}
                  </button>
                ))}
              </div>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={handleGoogle}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '11px 16px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                  color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer', marginBottom: 20,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.18)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                <GoogleIcon />
                {t('continue_google')}
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>{t('common:or')}</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* ── LOGIN FORM ──────────────────────────────────────────── */}
              {mode === 'login' && (
                <form onSubmit={handleLogin}>
                  <label className="label">{t('email')}</label>
                  <div style={{ marginBottom: 14 }}>
                    <InputField icon={Mail} type="email" placeholder="seu@email.com" value={loginEmail} onChange={v => { setLoginEmail(v); clearError() }} autoFocus />
                  </div>
                  <label className="label">{t('password')}</label>
                  <div style={{ marginBottom: error ? 12 : 6 }}>
                    <InputField icon={Lock} type={showLoginPwd ? 'text' : 'password'} placeholder="••••••••" value={loginPassword} onChange={v => { setLoginPassword(v); clearError() }} rightSlot={pwdToggle(showLoginPwd, () => setShowLoginPwd(v => !v))} />
                  </div>
                  <div style={{ textAlign: 'right', marginBottom: error ? 0 : 20 }}>
                    <button type="button" onClick={() => { setMode('reset'); setResetEmail(loginEmail); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer' }}>
                      {t('forgot_password')}
                    </button>
                  </div>
                  {error && <ErrorBox msg={error} />}
                  <button type="submit" className="btn-primary" disabled={loading || !loginEmail.trim() || !loginPassword} style={{ width: '100%', justifyContent: 'center', gap: 8, marginTop: 4, opacity: loading || !loginEmail.trim() || !loginPassword ? 0.65 : 1 }}>
                    {loading ? <Spinner /> : <ArrowRight size={14} />}
                    {loading ? t('signing_in') : t('sign_in')}
                  </button>
                </form>
              )}

              {/* ── SIGNUP FORM ─────────────────────────────────────────── */}
              {mode === 'signup' && (
                <form onSubmit={handleSignup}>
                  <label className="label">{t('full_name')}</label>
                  <div style={{ marginBottom: 14 }}>
                    <InputField icon={User} placeholder={t('your_name')} value={signupName} onChange={v => { setSignupName(v); clearError() }} autoFocus />
                  </div>
                  <label className="label">{t('email')}</label>
                  <div style={{ marginBottom: 14 }}>
                    <InputField icon={Mail} type="email" placeholder="seu@email.com" value={signupEmail} onChange={v => { setSignupEmail(v); clearError() }} />
                  </div>
                  <label className="label">{t('password')}</label>
                  <div style={{ marginBottom: 14 }}>
                    <InputField icon={Lock} type={showSignupPwd ? 'text' : 'password'} placeholder={t('min_6_chars')} value={signupPassword} onChange={v => { setSignupPassword(v); clearError() }} rightSlot={pwdToggle(showSignupPwd, () => setShowSignupPwd(v => !v))} />
                  </div>
                  <label className="label">{t('password')}</label>
                  <div style={{ marginBottom: error ? 12 : 20 }}>
                    <InputField icon={Lock} type={showSignupPwd ? 'text' : 'password'} placeholder={t('repeat_password')} value={signupConfirm} onChange={v => { setSignupConfirm(v); clearError() }} />
                  </div>
                  {error && <ErrorBox msg={error} />}
                  <button type="submit" className="btn-primary" disabled={loading || !signupName.trim() || !signupEmail.trim() || !signupPassword || !signupConfirm} style={{ width: '100%', justifyContent: 'center', gap: 8, opacity: loading || !signupName.trim() || !signupEmail.trim() || !signupPassword || !signupConfirm ? 0.65 : 1 }}>
                    {loading ? <Spinner /> : <ArrowRight size={14} />}
                    {loading ? t('signing_up') : t('sign_up')}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', marginTop: 20, lineHeight: 1.5 }}>
          {t('legal').split(t('terms'))[0]}
          <a href="/termos" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{t('terms')}</a>
          {t('legal').split(t('terms'))[1]?.split(t('privacy'))[0]}
          <a href="/privacidade" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{t('privacy')}</a>.
        </p>
      </div>
    </div>
  )
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '9px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 16 }}>
      <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 13, color: '#ef4444', lineHeight: 1.4 }}>{msg}</span>
    </div>
  )
}
