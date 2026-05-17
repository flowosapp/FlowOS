import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  User, Target, CreditCard, Database, Save, Download,
  AlertTriangle, Crown, Check, Flame, Sparkles, Activity,
  RefreshCw, LogOut, Bell, BellOff, Smartphone, Download as DLIcon,
  Clock, CreditCard as FinCard, Zap, Camera, Trash2, Upload,
} from 'lucide-react'
import { useFlowStore, calcularPontuacaoVida } from '../store'
import { useAuthUser } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { isSupabaseConfigured, signOut, uploadAvatar, deleteAvatar } from '../services/supabase'
import { createCheckoutSession } from '../services/billing'
import {
  requestNotificationPermission, getNotificationPermission,
  subscribePush, getExistingSubscription, unsubscribePush,
  promptInstall, canInstall, isStandalone,
} from '../services/pwa'
import type { Moeda } from '../types'

const MOEDAS: { valor: Moeda; label: string }[] = [
  { valor: 'BRL', label: 'Real Brasileiro (R$)' },
  { valor: 'USD', label: 'Dólar Americano ($)' },
  { valor: 'EUR', label: 'Euro (€)' },
  { valor: 'GBP', label: 'Libra Esterlina (£)' },
]

const GRADIENTES_AVATAR = [
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #10b981, #00d4ff)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #84cc16, #10b981)',
]

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const cx = size / 2
  const r = (size - 12) / 2
  const circumference = 2 * Math.PI * r
  const filled = (score / 100) * circumference
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.14, color: 'var(--text-dim)', marginTop: 2 }}>score</span>
      </div>
    </div>
  )
}

type Tab = 'identidade' | 'performance' | 'assinatura' | 'notificacoes' | 'dados'

export default function ProfilePage() {
  const { t } = useTranslation(['profile', 'common'])

  const TABS: { id: Tab; icon: typeof User; label: string }[] = [
    { id: 'identidade',    icon: User,       label: t('tab_identity') },
    { id: 'performance',   icon: Activity,   label: t('tab_performance') },
    { id: 'assinatura',    icon: CreditCard, label: t('tab_subscription') },
    { id: 'notificacoes',  icon: Bell,       label: t('tab_notifications') },
    { id: 'dados',         icon: Database,   label: t('tab_data') },
  ]
  const perfil = useFlowStore(s => s.perfil)
  const habitos = useFlowStore(s => s.habitos)
  const tarefas = useFlowStore(s => s.tarefas)
  const transacoes = useFlowStore(s => s.transacoes)
  const focosHoje = useFlowStore(s => s.focosHoje)
  const isPro = useFlowStore(s => s.isPro)
  const upgradePro = useFlowStore(s => s.upgradePro)
  const atualizarPerfil = useFlowStore(s => s.atualizarPerfil)
  const resetStore = useFlowStore(s => s.resetStore)
  const authUser = useAuthUser()

  const toast = useToast()
  const [tab, setTab] = useState<Tab>('identidade')
  const [saved, setSaved] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nome, setNome] = useState(perfil?.nome ?? '')
  const [mantra, setMantra] = useState(perfil?.mantra ?? '')
  const [moeda, setMoeda] = useState<Moeda>(perfil?.moeda ?? 'BRL')
  const [avatarGradient, setAvatarGradient] = useState(
    perfil?.avatarGradient ?? GRADIENTES_AVATAR[0]
  )

  const pontuacao = calcularPontuacaoVida({ habitos, tarefas, transacoes, focosHoje })
  const hoje = new Date().toISOString().split('T')[0]
  const habitosConcluidos = habitos.filter(h => h.datasConcluidas.includes(hoje)).length
  const tarefasConcluidas = tarefas.filter(t => t.concluida).length
  const streakMedio = habitos.length > 0
    ? Math.round(habitos.reduce((s, h) => s + h.streak, 0) / habitos.length)
    : 0

  function handleSalvar() {
    atualizarPerfil({ nome, mantra, moeda, avatarGradient })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    toast.success('Perfil salvo com sucesso!', '✅')
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !authUser?.id) return
    setAvatarError(null)

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Imagem muito grande. Máximo: 2 MB.')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setAvatarError('Formato inválido. Use JPG, PNG, WebP ou GIF.')
      return
    }

    setAvatarUploading(true)
    const url = await uploadAvatar(authUser.id, file)
    setAvatarUploading(false)

    if (url) {
      atualizarPerfil({ avatarUrl: url })
      toast.success('Foto de perfil atualizada!', '📸')
    } else {
      setAvatarError('Erro ao enviar imagem. Tente novamente.')
      toast.error('Erro ao enviar imagem. Tente novamente.')
    }
    // Limpa input para permitir re-upload do mesmo arquivo
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleAvatarRemove() {
    if (!authUser?.id) return
    await deleteAvatar(authUser.id)
    atualizarPerfil({ avatarUrl: undefined })
  }


  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const { url } = await createCheckoutSession({ plan: 'pro', email: authUser?.email, userId: authUser?.id })
      window.location.href = url
    } catch {
      upgradePro()
    } finally {
      setUpgrading(false)
    }
  }

  function handleExportar() {
    const dados = {
      versao: '1.0',
      exportadoEm: new Date().toISOString(),
      perfil,
      habitos,
      tarefas,
      transacoes,
    }
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flowos-backup-${hoje}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSair() {
    if (isSupabaseConfigured) {
      await signOut()
    } else {
      resetStore()
      window.location.reload()
    }
  }

  return (
    <div className="page-container animate-in">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.04) 100%)',
          border: '1px solid rgba(59,130,246,0.15)',
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Avatar com upload */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
            />

            {/* Foto ou gradiente */}
            <div
              onClick={() => !avatarUploading && fileInputRef.current?.click()}
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: perfil?.avatarUrl ? 'transparent' : avatarGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 700, color: '#fff',
                boxShadow: '0 0 28px rgba(59,130,246,0.2)',
                cursor: avatarUploading ? 'wait' : 'pointer',
                position: 'relative', overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.1)',
              }}
            >
              {perfil?.avatarUrl ? (
                <img
                  src={perfil.avatarUrl}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                nome?.[0]?.toUpperCase() ?? authUser?.email?.[0]?.toUpperCase() ?? 'U'
              )}

              {/* Overlay de hover */}
              {!avatarUploading && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                >
                  <Camera size={18} color="#fff" />
                </div>
              )}

              {/* Spinner durante upload */}
              {avatarUploading && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'block' }} />
                </div>
              )}
            </div>

            {/* Botão remover foto */}
            {perfil?.avatarUrl && !avatarUploading && (
              <button
                onClick={e => { e.stopPropagation(); handleAvatarRemove() }}
                title="Remover foto"
                style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#ef4444', border: '2px solid var(--bg-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={10} color="#fff" />
              </button>
            )}

            {/* Badge Pro */}
            {isPro && !perfil?.avatarUrl && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 20, height: 20, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-surface)',
              }}>
                <Crown size={10} color="#fff" />
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {nome || 'Seu Nome'}
              </h2>
              <span style={{
                padding: '2px 8px', borderRadius: 6,
                background: isPro ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.1)',
                border: `1px solid ${isPro ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.2)'}`,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                color: isPro ? '#f59e0b' : '#60a5fa',
                textTransform: 'uppercase',
              }}>
                {isPro ? '⭐ Pro' : 'Starter'}
              </span>
            </div>
            {mantra ? (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 3 }}>
                "{mantra}"
              </p>
            ) : null}
            <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              {authUser?.email ?? 'modo offline'}
            </p>
          </div>

          {/* Score ring */}
          <ScoreRing score={pontuacao} size={84} />

          {/* Stats rápidas */}
          <div style={{ display: 'flex', gap: 24, paddingLeft: 8 }}>
            {[
              { label: 'Hábitos hoje', value: `${habitosConcluidos}/${habitos.length}`, color: '#10b981' },
              { label: 'Streak médio', value: `${streakMedio}d`, color: '#f59e0b' },
              { label: 'Tarefas ✓', value: String(tarefasConcluidas), color: '#3b82f6' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 19, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, whiteSpace: 'nowrap' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 3, marginBottom: 20,
        padding: '4px', width: 'fit-content',
        background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10,
      }}>
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 7,
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              transition: 'all 0.15s',
              background: tab === id ? 'var(--bg-elevated)' : 'transparent',
              color: tab === id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.35)' : 'none',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Identidade ──────────────────────────────────────────────────── */}
      {tab === 'identidade' && (
        <div className="animate-in" style={{ maxWidth: 560 }}>
          <div className="card" style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Informações Pessoais</h3>

            {/* Upload de foto */}
            <div style={{ marginBottom: 20 }}>
              <label className="label">{t('photo')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Preview */}
                <div
                  style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: perfil?.avatarUrl ? 'transparent' : (perfil?.avatarGradient ?? GRADIENTES_AVATAR[0]),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700, color: '#fff',
                    flexShrink: 0, overflow: 'hidden',
                    border: '2px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {perfil?.avatarUrl
                    ? <img src={perfil.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (nome?.[0]?.toUpperCase() ?? 'U')
                  }
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      className="btn-ghost"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      style={{ gap: 6, fontSize: 12, padding: '7px 14px' }}
                    >
                      {avatarUploading
                        ? <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Enviando...</>
                        : <><Upload size={12} /> {perfil?.avatarUrl ? 'Trocar foto' : 'Enviar foto'}</>
                      }
                    </button>
                    {perfil?.avatarUrl && (
                      <button
                        className="btn-ghost"
                        onClick={handleAvatarRemove}
                        style={{ gap: 6, fontSize: 12, padding: '7px 14px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                      >
                        <Trash2 size={12} /> Remover
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
                    JPG, PNG, WebP ou GIF · máx. 2 MB
                  </p>
                  {avatarError && (
                    <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{avatarError}</p>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label">{t('display_name')}</label>
              <input
                className="input-field"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label">{t('email')}</label>
              <input
                className="input-field"
                value={authUser?.email ?? 'Não autenticado'}
                readOnly
                style={{ color: 'var(--text-tertiary)', cursor: 'default' }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, display: 'block' }}>
                Para alterar o email, entre em contato com o suporte.
              </span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label">{t('mantra')}</label>
              <input
                className="input-field"
                value={mantra}
                onChange={e => setMantra(e.target.value)}
                placeholder={t('mantra_placeholder')}
                maxLength={80}
              />
              <span style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, display: 'block' }}>
                {t('mantra_hint')}
              </span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="label">{t('currency')}</label>
              <select
                className="input-field"
                value={moeda}
                onChange={e => setMoeda(e.target.value as Moeda)}
                style={{ cursor: 'pointer' }}
              >
                {MOEDAS.map(m => (
                  <option key={m.valor} value={m.valor}>{m.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="label">{t('avatar_color')}</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                {GRADIENTES_AVATAR.map(grad => (
                  <button
                    key={grad}
                    onClick={() => setAvatarGradient(grad)}
                    title="Selecionar cor"
                    style={{
                      width: 34, height: 34, borderRadius: '50%', background: grad,
                      border: avatarGradient === grad ? '3px solid #fff' : '3px solid transparent',
                      cursor: 'pointer',
                      outline: avatarGradient === grad ? '2px solid var(--accent)' : '2px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleSalvar}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {saved
                ? <><Check size={15} /> Salvo com sucesso!</>
                : <><Save size={15} /> Salvar Alterações</>}
            </button>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Sessão</h3>
            <button
              onClick={handleSair}
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
            >
              <LogOut size={15} />
              {isSupabaseConfigured ? 'Sair da conta' : 'Redefinir FlowOS'}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Alta Performance ────────────────────────────────────────────── */}
      {tab === 'performance' && (
        <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 900 }}>

          {/* Life Score breakdown — full width */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Pontuação de Vida</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Calculado em tempo real com base na sua atividade diária.
            </p>
            <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
              <ScoreRing score={pontuacao} size={100} />
              <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  {
                    label: 'Hábitos', peso: '30%', color: '#10b981',
                    pct: habitos.length > 0 ? Math.round((habitosConcluidos / habitos.length) * 100) : 50,
                  },
                  {
                    label: 'Tarefas', peso: '25%', color: '#3b82f6',
                    pct: tarefas.length > 0 ? Math.round((tarefasConcluidas / tarefas.length) * 100) : 50,
                  },
                  {
                    label: 'Streak', peso: '20%', color: '#f59e0b',
                    pct: Math.min(streakMedio * 10, 100),
                  },
                  {
                    label: 'Modo Foco', peso: '15%', color: '#8b5cf6',
                    pct: Math.min(focosHoje * 25, 100),
                  },
                  {
                    label: 'Finanças', peso: '10%', color: '#00d4ff',
                    pct: transacoes.length > 0
                      ? Math.round((transacoes.filter(t => t.status === 'pago').length / transacoes.length) * 100)
                      : 40,
                  },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontSize: 12, color: item.color, fontWeight: 600 }}>
                        {item.pct}%{' '}
                        <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>· peso {item.peso}</span>
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                      <div style={{
                        height: '100%', width: `${item.pct}%`,
                        background: item.color, borderRadius: 2,
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Objetivos */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Target size={15} color="var(--accent)" />
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Seus Objetivos</h3>
            </div>
            {perfil?.objetivos && perfil.objetivos.length > 0 ? (
              perfil.objetivos.map(obj => (
                <div key={obj} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 0', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{obj}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Nenhum objetivo definido.</p>
            )}
          </div>

          {/* Desafios */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Flame size={15} color="#ef4444" />
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Seus Desafios</h3>
            </div>
            {perfil?.desafios && perfil.desafios.length > 0 ? (
              perfil.desafios.map(des => (
                <div key={des} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 0', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{des}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Nenhum desafio registrado.</p>
            )}
          </div>

          {/* Hábitos em prática — full width */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={15} color="#f59e0b" />
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Hábitos em Prática</h3>
            </div>
            {habitos.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {habitos.map(h => (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 14px', borderRadius: 8,
                      background: `${h.cor}12`, border: `1px solid ${h.cor}30`,
                    }}
                  >
                    <span>{h.icone}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: h.cor }}>{h.nome}</span>
                    {h.streak > 0 && (
                      <span style={{ fontSize: 11, color: h.cor, opacity: 0.7 }}>🔥 {h.streak}d</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Sem hábitos ativos. Adicione na página de Hábitos.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Assinatura ──────────────────────────────────────────────────── */}
      {tab === 'assinatura' && (
        <div className="animate-in" style={{ maxWidth: 780 }}>
          {/* Status atual */}
          <div
            className="card"
            style={{
              marginBottom: 20,
              background: isPro
                ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.04))'
                : 'var(--bg-surface)',
              border: isPro ? '1px solid rgba(245,158,11,0.25)' : '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Crown size={18} color={isPro ? '#f59e0b' : 'var(--text-dim)'} />
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Plano {isPro ? 'Pro' : 'Starter'}</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {isPro
                    ? 'Você tem acesso a todos os recursos premium sem restrições.'
                    : 'Faça upgrade para desbloquear IA, finanças avançadas e muito mais.'}
                </p>
              </div>
              {isPro ? (
                <span style={{
                  padding: '7px 16px', borderRadius: 8,
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                  fontSize: 13, color: '#10b981', fontWeight: 600,
                }}>
                  Ativo
                </span>
              ) : (
                <button className="btn-primary" onClick={handleUpgrade} disabled={upgrading} style={{ gap: 8 }}>
                  {upgrading
                    ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    : <Crown size={14} />}
                  Upgrade para Pro
                </button>
              )}
            </div>
          </div>

          {/* Comparativo de planos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              {
                nome: 'Starter', preco: 'R$ 29,90', trial: '15 dias grátis',
                cor: '#3b82f6', atual: !isPro,
                features: ['Dashboard completo', '6 hábitos ativos', 'Kanban de tarefas', 'Finanças básicas', 'Modo Foco', '15 dias de trial grátis'],
              },
              {
                nome: 'Pro', preco: 'R$ 49,90', trial: null,
                cor: '#f59e0b', atual: isPro,
                features: ['Tudo do Starter', 'Central IA ilimitada', 'Hábitos ilimitados', 'Finanças avançadas', 'Contas bancárias', 'Tags & Anexos', 'Relatórios premium'],
              },
              {
                nome: 'Flow+', preco: 'R$ 129,90', trial: null,
                cor: '#8b5cf6', atual: false,
                features: ['Tudo do Pro', 'Acesso antecipado', 'Suporte prioritário', 'API de integração', 'White-label', 'Team workspace'],
              },
            ].map(plano => (
              <div
                key={plano.nome}
                className="card"
                style={{
                  border: plano.atual ? `1px solid ${plano.cor}40` : '1px solid var(--border)',
                  background: plano.atual ? `${plano.cor}08` : 'var(--bg-surface)',
                  position: 'relative',
                }}
              >
                {plano.atual && (
                  <div style={{
                    position: 'absolute', top: -1, right: 16,
                    background: plano.cor, color: '#fff',
                    fontSize: 9, fontWeight: 700, padding: '2px 8px',
                    borderRadius: '0 0 6px 6px', letterSpacing: '0.08em',
                  }}>
                    ATUAL
                  </div>
                )}
                {plano.trial && (
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={11} /> {plano.trial}
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: plano.cor }}>{plano.nome}</div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 21, fontWeight: 800, color: 'var(--text-primary)' }}>{plano.preco}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>/mês</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plano.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                      <Check size={12} color={plano.cor} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Notificações ────────────────────────────────────────────────── */}
      {tab === 'notificacoes' && <TabNotificacoes />}

      {/* ── Tab: Dados ───────────────────────────────────────────────────────── */}
      {tab === 'dados' && (
        <div className="animate-in" style={{ maxWidth: 560 }}>

          {/* Estatísticas */}
          <div className="card" style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Estatísticas da Conta</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Hábitos cadastrados', value: habitos.length, color: '#10b981' },
                { label: 'Tarefas totais', value: tarefas.length, color: '#3b82f6' },
                { label: 'Transações registradas', value: transacoes.length, color: '#f59e0b' },
                { label: 'Sessões de foco hoje', value: focosHoje, color: '#8b5cf6' },
              ].map(stat => (
                <div
                  key={stat.label}
                  style={{
                    padding: '14px', background: 'var(--bg-elevated)',
                    borderRadius: 10, border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 700, color: stat.color, marginBottom: 4, lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Exportar */}
          <div className="card" style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{t('export_data')}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              Baixe um backup completo dos seus dados em JSON — hábitos, tarefas, finanças e configurações.
            </p>
            <button className="btn-ghost" onClick={handleExportar} style={{ gap: 8 }}>
              <Download size={15} />
              Exportar JSON
            </button>
          </div>

          {/* Importar */}
          <div className="card" style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{t('import_data')}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              Restaure um backup gerado pelo FlowOS. Os dados atuais serão substituídos.
            </p>
            <label
              className="btn-ghost"
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}
            >
              <Download size={15} style={{ transform: 'rotate(180deg)' }} />
              Importar JSON
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={() => {}} />
            </label>
          </div>

          {/* Zona de perigo */}
          <div
            className="card"
            style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <AlertTriangle size={15} color="var(--danger)" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--danger)' }}>{t('danger_zone')}</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              Estas ações são irreversíveis. Todos os seus dados serão permanentemente apagados.
            </p>
            <button
              className="btn-ghost"
              onClick={() => {
                if (confirm(t('reset_confirm'))) {
                  resetStore()
                  window.location.reload()
                }
              }}
              style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.25)', gap: 8 }}
            >
              <RefreshCw size={15} />
              {t('reset_all')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tab Notificações ──────────────────────────────────────────────────────────

function TabNotificacoes() {
  const notifPrefs = useFlowStore(s => s.notifPrefs)
  const atualizarNotifPrefs = useFlowStore(s => s.atualizarNotifPrefs)

  const [perm, setPerm] = useState<NotificationPermission>(getNotificationPermission)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [swReady, setSwReady] = useState(false)
  const [installable, setInstallable] = useState(canInstall())
  const [testSent, setTestSent] = useState(false)
  const standalone = isStandalone()

  useEffect(() => {
    getExistingSubscription().then(s => setSubscribed(!!s))
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwReady(true))
    }
  }, [])

  async function handlePermissao() {
    setLoading(true)
    const result = await requestNotificationPermission()
    setPerm(result)
    setLoading(false)
  }

  async function handleSubscribe() {
    setLoading(true)
    const sub = await subscribePush()
    setSubscribed(!!sub)
    setLoading(false)
  }

  async function handleUnsubscribe() {
    setLoading(true)
    await unsubscribePush()
    setSubscribed(false)
    setLoading(false)
  }

  async function handleInstall() {
    await promptInstall()
    setInstallable(canInstall())
  }

  function handleTestar() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    new Notification('⚡ FlowOS — Teste de notificação', {
      body: 'Suas notificações estão funcionando perfeitamente!',
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      tag: 'flowos-teste',
    })
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  const permColor = perm === 'granted' ? '#10b981' : perm === 'denied' ? '#ef4444' : '#f59e0b'
  const permLabel = perm === 'granted' ? 'Permitido' : perm === 'denied' ? 'Bloqueado' : 'Não solicitado'
  const ativo = perm === 'granted'

  return (
    <div className="animate-in" style={{ maxWidth: 620 }}>

      {/* ── Status do sistema ─────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Status do Sistema</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <StatusRow label="Service Worker" ok={swReady} desc={swReady ? 'Ativo — background disponível' : 'Não registrado'} />
          <StatusRow label="Instalado como app" ok={standalone} desc={standalone ? 'Rodando em modo standalone' : 'Aberto no navegador'} />
          <StatusRow label="Permissão de notificação" ok={perm === 'granted'} warn={perm === 'default'} desc={permLabel} />
          <StatusRow label="Push em background" ok={subscribed} desc={subscribed ? 'Inscrito — alertas mesmo com app fechado' : 'Não inscrito'} />
        </div>

        {ativo && (
          <button
            className="btn-ghost"
            onClick={handleTestar}
            style={{ marginTop: 14, gap: 7, fontSize: 12 }}
          >
            <Zap size={13} />
            {testSent ? 'Notificação enviada!' : 'Enviar notificação de teste'}
          </button>
        )}
      </div>

      {/* ── Instalar como app ─────────────────────────────────────────────── */}
      {!standalone && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Smartphone size={16} color="#3b82f6" />
            <div style={{ fontSize: 14, fontWeight: 600 }}>Instalar como App</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Instale o FlowOS na tela inicial para melhor suporte a notificações e uso offline.
          </p>
          {installable ? (
            <button onClick={handleInstall} className="btn-primary" style={{ gap: 7 }}>
              <DLIcon size={14} /> Instalar FlowOS
            </button>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
              Menu do navegador → "Adicionar à tela inicial" ou "Instalar app"
            </div>
          )}
        </div>
      )}

      {/* ── Permissão ─────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          {perm === 'granted' ? <Bell size={16} color="#10b981" /> : <BellOff size={16} color={permColor} />}
          <div style={{ fontSize: 14, fontWeight: 600 }}>Permissão</div>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${permColor}18`, color: permColor, fontWeight: 600, marginLeft: 'auto' }}>
            {permLabel}
          </span>
        </div>
        {perm === 'default' && (
          <button onClick={handlePermissao} disabled={loading} className="btn-primary" style={{ gap: 7 }}>
            <Bell size={14} /> {loading ? 'Solicitando...' : 'Permitir Notificações'}
          </button>
        )}
        {perm === 'denied' && (
          <div style={{ fontSize: 12, color: '#ef4444', padding: '8px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
            Bloqueado. Acesse: Configurações do navegador → Privacidade → Notificações para desbloquear.
          </div>
        )}
      </div>

      {/* ── Push background ───────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Bell size={16} color="#8b5cf6" />
          <div style={{ fontSize: 14, fontWeight: 600 }}>Push em Background</div>
          {subscribed && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(16,185,129,0.12)', color: '#10b981', fontWeight: 600, marginLeft: 'auto' }}>
              Ativo
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Receba alertas mesmo com o FlowOS fechado. Requer permissão de notificação.
        </p>
        {!ativo ? (
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Permissão de notificações necessária primeiro.</div>
        ) : subscribed ? (
          <button onClick={handleUnsubscribe} disabled={loading} className="btn-ghost" style={{ gap: 7 }}>
            <BellOff size={14} /> {loading ? 'Cancelando...' : 'Desativar Push'}
          </button>
        ) : (
          <button onClick={handleSubscribe} disabled={loading} className="btn-primary" style={{ gap: 7, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
            <Bell size={14} /> {loading ? 'Ativando...' : 'Ativar Push em Background'}
          </button>
        )}
      </div>

      {/* ── Preferências de alertas ───────────────────────────────────────── */}
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
        Configurar Alertas
      </div>

      {!ativo && (
        <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, marginBottom: 14, fontSize: 12, color: '#f59e0b' }}>
          Ative a permissão de notificações acima para configurar os alertas.
        </div>
      )}

      {/* Hábitos diários */}
      <div className="card" style={{ marginBottom: 12, opacity: ativo ? 1 : 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Hábitos Diários</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Lembrete para concluir seus hábitos do dia</div>
          </div>
          <Toggle
            value={notifPrefs.habitosDiarios}
            onChange={v => atualizarNotifPrefs({ habitosDiarios: v })}
            disabled={!ativo}
          />
        </div>
        {notifPrefs.habitosDiarios && ativo && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={13} color="var(--text-dim)" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Horário do lembrete</span>
            <input
              type="time"
              value={notifPrefs.horaHabitos}
              onChange={e => atualizarNotifPrefs({ horaHabitos: e.target.value })}
              className="input-field"
              style={{ width: 110, padding: '5px 10px', marginLeft: 'auto', fontSize: 13 }}
            />
          </div>
        )}
      </div>

      {/* Vencimentos financeiros */}
      <div className="card" style={{ marginBottom: 12, opacity: ativo ? 1 : 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>💳</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Vencimentos Financeiros</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Alertas de pagamentos pendentes próximos</div>
          </div>
          <Toggle
            value={notifPrefs.vencimentosFinanceiros}
            onChange={v => atualizarNotifPrefs({ vencimentosFinanceiros: v })}
            disabled={!ativo}
          />
        </div>
        {notifPrefs.vencimentosFinanceiros && ativo && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={13} color="var(--text-dim)" />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Horário do alerta</span>
              <input
                type="time"
                value={notifPrefs.horaAlertas}
                onChange={e => atualizarNotifPrefs({ horaAlertas: e.target.value })}
                className="input-field"
                style={{ width: 110, padding: '5px 10px', marginLeft: 'auto', fontSize: 13 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FinCard size={13} color="var(--text-dim)" />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Alertar com antecedência de</span>
              <select
                value={notifPrefs.diasAntesVencimento}
                onChange={e => atualizarNotifPrefs({ diasAntesVencimento: Number(e.target.value) })}
                className="input-field"
                style={{ width: 110, padding: '5px 10px', marginLeft: 'auto', fontSize: 13 }}
              >
                <option value={1}>1 dia</option>
                <option value={2}>2 dias</option>
                <option value={3}>3 dias</option>
                <option value={7}>7 dias</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Metas */}
      <div className="card" style={{ marginBottom: 12, opacity: ativo ? 1 : 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Metas com Prazo Próximo</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Alertas para metas com prazo nos próximos 7 dias</div>
          </div>
          <Toggle
            value={notifPrefs.metas}
            onChange={v => atualizarNotifPrefs({ metas: v })}
            disabled={!ativo}
          />
        </div>
        {notifPrefs.metas && ativo && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={13} color="var(--text-dim)" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Mesmo horário dos alertas financeiros</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginLeft: 'auto' }}>
              {notifPrefs.horaAlertas}
            </span>
          </div>
        )}
      </div>

      {/* Alarme de acordar */}
      <div className="card" style={{ marginBottom: 12, opacity: ativo ? 1 : 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>⏰</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Alarme de Acordar</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Notificação matinal para começar o dia com foco</div>
          </div>
          <Toggle
            value={notifPrefs.sonoAlarme}
            onChange={v => atualizarNotifPrefs({ sonoAlarme: v })}
            disabled={!ativo}
          />
        </div>
        {notifPrefs.sonoAlarme && ativo && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={13} color="var(--text-dim)" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Horário do alarme</span>
            <input
              type="time"
              value={notifPrefs.horaAcordador}
              onChange={e => atualizarNotifPrefs({ horaAcordador: e.target.value })}
              className="input-field"
              style={{ width: 110, padding: '5px 10px', marginLeft: 'auto', fontSize: 13 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, cursor: disabled ? 'not-allowed' : 'pointer',
        background: value && !disabled ? '#3b82f6' : 'var(--bg-elevated)',
        border: `1px solid ${value && !disabled ? '#3b82f6' : 'var(--border)'}`,
        position: 'relative', transition: 'all 0.2s', flexShrink: 0, outline: 'none',
        opacity: disabled ? 0.4 : 1,
      }}
      aria-checked={value}
      role="switch"
    >
      <span style={{
        position: 'absolute', top: 2, left: value && !disabled ? 22 : 2,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

function StatusRow({ label, ok, warn, desc }: { label: string; ok: boolean; warn?: boolean; desc: string }) {
  const cor = ok ? '#10b981' : warn ? '#f59e0b' : 'var(--text-dim)'
  const icon = ok ? '✓' : warn ? '!' : '○'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: ok ? 'rgba(16,185,129,0.12)' : warn ? 'rgba(245,158,11,0.12)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: cor, flexShrink: 0 }}>
        {icon}
      </span>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>{desc}</span>
      </div>
    </div>
  )
}
