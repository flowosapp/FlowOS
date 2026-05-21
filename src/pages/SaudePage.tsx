import { useState, useMemo, useRef } from 'react'
import {
  Moon, Utensils, Heart, Dumbbell, Plus, Trash2,
  Droplets, X, ChevronUp, ChevronDown, Pill,
  Bell, BellOff, AlarmClock, Sparkles, Play, Check,
  BarChart2, Timer, Flame, UserCheck, Trophy, RefreshCw, ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFlowStore } from '../store'
import { agendarAlarmeViaSW, cancelarAlarmeViaSW, requestNotificationPermission, getNotificationPermission } from '../services/pwa'
import type { QualidadeSono, TipoRefeicao, NivelHumor, CategoriaExercicio, DiaSemana, ItemSessao, ObjetivoTreino, NivelTreino, EquipamentoTreino } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hoje = () => new Date().toISOString().split('T')[0]

function calcHoras(deitar: string, acordar: string) {
  const [dh, dm] = deitar.split(':').map(Number)
  const [ah, am] = acordar.split(':').map(Number)
  let a = dh * 60 + dm, b = ah * 60 + am
  if (b <= a) b += 1440
  return Math.round((b - a) / 60 * 10) / 10
}

function ultimosDias(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

function formatData(data: string) {
  const [, m, d] = data.split('-'); return `${d}/${m}`
}
function diaSemana(data: string) {
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][new Date(data + 'T12:00:00').getDay()]
}
function diaAtual(): DiaSemana {
  return (['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as DiaSemana[])[new Date().getDay()]
}

// ─── Catálogo de atividades ───────────────────────────────────────────────────

type AtividadeCatalog = { nome: string; categoria: CategoriaExercicio; kcalMin: number; icone: string }

const CATALOGO: Record<string, AtividadeCatalog> = {
  corrida:     { nome: 'Corrida',           categoria: 'cardio',      kcalMin: 10, icone: '🏃' },
  pedal:       { nome: 'Pedal / Ciclismo',  categoria: 'cardio',      kcalMin: 8,  icone: '🚴' },
  natacao:     { nome: 'Natação',           categoria: 'cardio',      kcalMin: 10, icone: '🏊' },
  corda:       { nome: 'Pular Corda',       categoria: 'cardio',      kcalMin: 12, icone: '⚡' },
  caminhada:   { nome: 'Caminhada',         categoria: 'cardio',      kcalMin: 4,  icone: '🚶' },
  eliptico:    { nome: 'Elíptico',          categoria: 'cardio',      kcalMin: 7,  icone: '⚡' },
  beach:       { nome: 'Beach Tennis',      categoria: 'esporte',     kcalMin: 8,  icone: '🎾' },
  futevolei:   { nome: 'Futvôlei',          categoria: 'esporte',     kcalMin: 9,  icone: '🏐' },
  basquete:    { nome: 'Basquete',          categoria: 'esporte',     kcalMin: 8,  icone: '🏀' },
  futsal:      { nome: 'Futebol / Futsal',  categoria: 'esporte',     kcalMin: 9,  icone: '⚽' },
  nateball:    { nome: 'Vôlei de Praia',    categoria: 'esporte',     kcalMin: 7,  icone: '🏐' },
  supino:      { nome: 'Supino',            categoria: 'musculacao',  kcalMin: 5,  icone: '🏋️' },
  agachamento: { nome: 'Agachamento',       categoria: 'musculacao',  kcalMin: 6,  icone: '🦵' },
  terra:       { nome: 'Levantamento Terra',categoria: 'musculacao',  kcalMin: 6,  icone: '💪' },
  rosca:       { nome: 'Rosca Bíceps',      categoria: 'musculacao',  kcalMin: 4,  icone: '💪' },
  shoulder:    { nome: 'Desenvolvimento',   categoria: 'musculacao',  kcalMin: 5,  icone: '🏋️' },
  remada:      { nome: 'Remada',            categoria: 'musculacao',  kcalMin: 5,  icone: '🏋️' },
  leg:         { nome: 'Leg Press',         categoria: 'musculacao',  kcalMin: 5,  icone: '🦵' },
  burpee:      { nome: 'Burpee',            categoria: 'funcional',   kcalMin: 10, icone: '🔥' },
  prancha:     { nome: 'Prancha',           categoria: 'funcional',   kcalMin: 4,  icone: '🎯' },
  flexao:      { nome: 'Flexão',            categoria: 'funcional',   kcalMin: 6,  icone: '💪' },
  abdominal:   { nome: 'Abdominal',         categoria: 'funcional',   kcalMin: 5,  icone: '🎯' },
  hiit:        { nome: 'HIIT',              categoria: 'funcional',   kcalMin: 12, icone: '🔥' },
  yoga:        { nome: 'Yoga / Pilates',    categoria: 'funcional',   kcalMin: 3,  icone: '🧘' },
  polichinelo: { nome: 'Polichinelo',       categoria: 'funcional',   kcalMin: 8,  icone: '⚡' },
}

const CAT_CONFIG: Record<CategoriaExercicio, { label: string; cor: string; emoji: string }> = {
  cardio:     { label: 'Cardio',      cor: '#ef4444', emoji: '❤️' },
  esporte:    { label: 'Esporte',     cor: '#10b981', emoji: '🏆' },
  musculacao: { label: 'Musculação',  cor: '#3b82f6', emoji: '🏋️' },
  funcional:  { label: 'Funcional',   cor: '#f59e0b', emoji: '🔥' },
}

const DIAS_SEMANA: DiaSemana[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
const DIA_LABEL: Record<DiaSemana, string> = {
  dom: 'Dom', seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb',
}

// ─── Constantes de qualidade ──────────────────────────────────────────────────

const QUALIDADE_SONO: Record<QualidadeSono, { emoji: string; label: string; color: string }> = {
  1: { emoji: '😴', label: 'Péssimo',   color: '#ef4444' },
  2: { emoji: '😞', label: 'Ruim',      color: '#f97316' },
  3: { emoji: '😐', label: 'Regular',   color: '#f59e0b' },
  4: { emoji: '😊', label: 'Bom',       color: '#84cc16' },
  5: { emoji: '🌟', label: 'Excelente', color: '#10b981' },
}
const HUMOR_NIVEL: Record<NivelHumor, { emoji: string; label: string }> = {
  1: { emoji: '😔', label: 'Muito baixo' },
  2: { emoji: '😕', label: 'Baixo' },
  3: { emoji: '😐', label: 'Neutro' },
  4: { emoji: '😊', label: 'Bom' },
  5: { emoji: '🤩', label: 'Ótimo' },
}
const REFEICOES_CONFIG: Record<TipoRefeicao, { label: string; emoji: string; horario: string }> = {
  cafe:   { label: 'Café da Manhã', emoji: '☕', horario: '07:00' },
  almoco: { label: 'Almoço',        emoji: '🍽️', horario: '12:00' },
  lanche: { label: 'Lanche',        emoji: '🥪', horario: '15:00' },
  jantar: { label: 'Jantar',        emoji: '🌙', horario: '19:00' },
  ceia:   { label: 'Ceia',          emoji: '🫖', horario: '21:00' },
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Rating({ value, onChange, emojis }: {
  value: number
  onChange: (v: number) => void
  emojis: Record<number, { emoji: string; label: string; color?: string }>
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {([1, 2, 3, 4, 5] as const).map(n => {
        const info = emojis[n]
        const selected = value === n
        return (
          <button key={n} onClick={() => onChange(n)} title={info.label} style={{
            fontSize: 22, padding: '5px 9px', borderRadius: 10,
            border: selected ? `2px solid ${info.color ?? '#3b82f6'}` : '2px solid transparent',
            background: selected ? `${info.color ?? '#3b82f6'}15` : 'rgba(255,255,255,0.04)',
            cursor: 'pointer', transition: 'all 0.15s',
            opacity: !selected ? 0.45 : 1,
            transform: selected ? 'scale(1.18)' : 'scale(1)',
          }}>
            {info.emoji}
          </button>
        )
      })}
    </div>
  )
}

function ProgressBar({ value, color = 'var(--accent)', height = 4 }: { value: number; color?: string; height?: number }) {
  return (
    <div style={{ height, background: 'var(--border)', borderRadius: height }}>
      <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: height, transition: 'width 0.6s ease' }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'sono' | 'alimentacao' | 'saude' | 'treino' | 'trainer'

export default function SaudePage() {
  const { t } = useTranslation('saude')
  const [tab, setTab] = useState<Tab>('sono')

  const TABS: { id: Tab; icon: typeof Moon; label: string }[] = [
    { id: 'sono',        icon: Moon,      label: t('tab_sleep') },
    { id: 'alimentacao', icon: Utensils,  label: t('tab_nutrition') },
    { id: 'saude',       icon: Heart,     label: t('tab_health') },
    { id: 'treino',      icon: Dumbbell,  label: t('tab_workout') },
    { id: 'trainer',     icon: UserCheck, label: t('tab_trainer') },
  ]

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1 className="page-title">{t('page_title')}</h1>
        <p className="page-subtitle">{t('page_subtitle')}</p>
      </div>

      <div style={{ display: 'flex', gap: 3, marginBottom: 24, padding: 4, width: 'fit-content', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 16px', borderRadius: 7, border: 'none',
            cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
            background: tab === id ? 'var(--bg-elevated)' : 'transparent',
            color: tab === id ? 'var(--text-primary)' : 'var(--text-tertiary)',
            boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.35)' : 'none',
          }}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'sono'        && <TabSono />}
      {tab === 'alimentacao' && <TabAlimentacao />}
      {tab === 'saude'       && <TabSaude />}
      {tab === 'treino'      && <TabTreino />}
      {tab === 'trainer'     && <TabTrainer />}
    </div>
  )
}

// ─── Tab Sono ─────────────────────────────────────────────────────────────────

function TabSono() {
  const registrosSono = useFlowStore(s => s.registrosSono)
  const salvarRegistroSono = useFlowStore(s => s.salvarRegistroSono)
  const removerRegistroSono = useFlowStore(s => s.removerRegistroSono)

  const h = hoje()
  const registroHoje = registrosSono.find(r => r.data === h)

  const [horaDeitar, setHoraDeitar] = useState(registroHoje?.horaDeitar ?? '23:00')
  const [horaAcordar, setHoraAcordar] = useState(registroHoje?.horaAcordar ?? '07:00')
  const [qualidade, setQualidade] = useState<QualidadeSono>(registroHoje?.qualidade ?? 4)
  const [notas, setNotas] = useState(registroHoje?.notas ?? '')
  const [saved, setSaved] = useState(false)

  // Notificações
  const [notifPermissao, setNotifPermissao] = useState<NotificationPermission>(getNotificationPermission)
  const [lembretesAtivos, setLembretesAtivos] = useState(false)
  const [alarmAtivo, setAlarmAtivo] = useState(false)
  const [lembreteAgendado, setLembreteAgendado] = useState<string | null>(null)
  const alarmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lembreteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const ultimos7 = useMemo(() => ultimosDias(7), [])
  const registros7d = useMemo(() =>
    ultimos7.map(data => registrosSono.find(r => r.data === data) ?? null),
  [ultimos7, registrosSono])
  const avg7d = useMemo(() => {
    const com = registros7d.filter(Boolean)
    if (!com.length) return null
    return {
      horas: Math.round(com.reduce((s, r) => s + r!.horasDormidas, 0) / com.length * 10) / 10,
      qualidade: Math.round(com.reduce((s, r) => s + r!.qualidade, 0) / com.length * 10) / 10,
    }
  }, [registros7d])

  const horasPreview = calcHoras(horaDeitar, horaAcordar)

  async function solicitarPermissao() {
    const result = await requestNotificationPermission()
    setNotifPermissao(result)
  }

  function calcDelay(hora: string, minutosAntes = 0): { delay: number; alvo: Date } {
    const [h, m] = hora.split(':').map(Number)
    const alvo = new Date()
    alvo.setHours(h, m - minutosAntes, 0, 0)
    if (alvo <= new Date()) alvo.setDate(alvo.getDate() + 1)
    return { delay: alvo.getTime() - Date.now(), alvo }
  }

  async function agendarLembrete() {
    if (lembreteTimerRef.current) clearTimeout(lembreteTimerRef.current)
    const { delay, alvo } = calcDelay(horaDeitar, 30)
    const usouSW = await agendarAlarmeViaSW(
      delay,
      '🌙 Modo Sono — FLOWOS',
      'Seu horário de dormir é em 30 minutos. Comece a relaxar.',
      '/saude',
    )
    if (!usouSW) {
      lembreteTimerRef.current = setTimeout(() => {
        new Notification('🌙 Modo Sono — FLOWOS', {
          body: 'Seu horário de dormir é em 30 minutos. Comece a relaxar.',
        })
      }, delay)
    }
    setLembretesAtivos(true)
    setLembreteAgendado(alvo.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
  }

  async function agendarAlarme() {
    if (alarmTimerRef.current) clearTimeout(alarmTimerRef.current)
    const { delay } = calcDelay(horaAcordar)
    const usouSW = await agendarAlarmeViaSW(
      delay,
      '⏰ Bom dia! — FLOWOS',
      `Hora de acordar! Você programou para as ${horaAcordar}.`,
      '/saude',
    )
    if (!usouSW) {
      alarmTimerRef.current = setTimeout(() => {
        try {
          const ctx = new AudioContext()
          const tocar = (t: number) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain); gain.connect(ctx.destination)
            osc.frequency.value = 880
            gain.gain.setValueAtTime(0.35, t)
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
            osc.start(t); osc.stop(t + 0.5)
          }
          ;[0, 0.65, 1.3, 2.1, 2.75].forEach(offset => tocar(ctx.currentTime + offset))
        } catch {}
        new Notification('⏰ Bom dia! — FLOWOS', {
          body: `Hora de acordar! Você programou para as ${horaAcordar}.`,
        })
      }, delay)
    }
    setAlarmAtivo(true)
  }

  async function cancelarTudo() {
    if (lembreteTimerRef.current) clearTimeout(lembreteTimerRef.current)
    if (alarmTimerRef.current) clearTimeout(alarmTimerRef.current)
    await cancelarAlarmeViaSW()
    setLembretesAtivos(false); setAlarmAtivo(false); setLembreteAgendado(null)
  }

  function handleSalvar() {
    salvarRegistroSono({ data: h, horaDeitar, horaAcordar, horasDormidas: horasPreview, qualidade, notas: notas.trim() || undefined })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 900 }}>

      {/* Stats */}
      <div className="card" style={{ gridColumn: '1 / -1', display: 'flex', gap: 0, padding: 0, overflow: 'hidden' }}>
        {[
          { label: 'Média 7 dias', value: avg7d ? `${avg7d.horas}h` : '—', sub: avg7d ? (avg7d.horas >= 7 ? 'Ideal ✓' : avg7d.horas >= 6 ? 'Razoável' : 'Insuficiente') : 'Sem dados', color: avg7d ? (avg7d.horas >= 7 ? '#10b981' : avg7d.horas >= 6 ? '#f59e0b' : '#ef4444') : 'var(--text-dim)' },
          { label: 'Qualidade média', value: avg7d ? `${avg7d.qualidade}/5` : '—', sub: avg7d ? QUALIDADE_SONO[Math.round(avg7d.qualidade) as QualidadeSono].label : 'Sem dados', color: avg7d ? QUALIDADE_SONO[Math.round(avg7d.qualidade) as QualidadeSono].color : 'var(--text-dim)' },
          { label: 'Noites registradas', value: String(registros7d.filter(Boolean).length), sub: 'últimos 7 dias', color: 'var(--accent)' },
          { label: 'Noite de hoje', value: registroHoje ? `${registroHoje.horasDormidas}h` : '—', sub: registroHoje ? QUALIDADE_SONO[registroHoje.qualidade].label : 'Não registrado', color: registroHoje ? QUALIDADE_SONO[registroHoje.qualidade].color : 'var(--text-dim)' },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, padding: '18px 20px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Gráfico 7 dias */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Histórico — 7 dias</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90 }}>
          {ultimos7.map((data, i) => {
            const r = registros7d[i]
            const pct = r ? (r.horasDormidas / 10) * 100 : 0
            const color = r ? (r.qualidade >= 4 ? '#10b981' : r.qualidade >= 3 ? '#f59e0b' : '#ef4444') : 'rgba(255,255,255,0.07)'
            return (
              <div key={data} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>{r ? `${r.horasDormidas}h` : ''}</div>
                <div style={{ width: '100%', height: 74, display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', height: r ? `${Math.max(pct, 5)}%` : '4%', background: color, borderRadius: '4px 4px 0 0', transition: 'height 0.6s ease', minHeight: 3 }} />
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{diaSemana(data)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Registro de hoje */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Registrar Sono</h3>

        <div style={{ marginBottom: 12 }}>
          <label className="label">Dormir → Acordar</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="time" className="input-field" value={horaDeitar} onChange={e => setHoraDeitar(e.target.value)} style={{ flex: 1 }} />
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>→</span>
            <input type="time" className="input-field" value={horaAcordar} onChange={e => setHoraAcordar(e.target.value)} style={{ flex: 1 }} />
          </div>
          <div style={{ marginTop: 6, fontSize: 13, textAlign: 'center' }}>
            <span style={{ fontWeight: 700, color: horasPreview >= 7 ? '#10b981' : horasPreview >= 6 ? '#f59e0b' : '#ef4444' }}>{horasPreview}h</span>
            <span style={{ color: 'var(--text-dim)' }}> dormidas</span>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="label">Qualidade</label>
          <Rating value={qualidade} onChange={v => setQualidade(v as QualidadeSono)} emojis={QUALIDADE_SONO} />
          <div style={{ marginTop: 5, fontSize: 11, color: QUALIDADE_SONO[qualidade].color, fontWeight: 600 }}>{QUALIDADE_SONO[qualidade].label}</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="label">Notas</label>
          <input className="input-field" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Acordei no meio da noite…" />
        </div>

        <button className="btn-primary" onClick={handleSalvar} style={{ width: '100%', justifyContent: 'center' }}>
          {saved ? '✓ Salvo!' : registroHoje ? 'Atualizar' : 'Salvar sono'}
        </button>
      </div>

      {/* Modo Sono — Notificações */}
      <div className="card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Moon size={18} color="#818cf8" />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Modo Sono Inteligente</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Lembrete 30 min antes + despertador via notificação do browser</p>
          </div>
        </div>

        {notifPermissao === 'default' && (
          <button className="btn-ghost" onClick={solicitarPermissao} style={{ marginBottom: 14, gap: 8, borderColor: 'rgba(99,102,241,0.3)', color: '#818cf8' }}>
            <Bell size={14} /> Ativar notificações do browser
          </button>
        )}
        {notifPermissao === 'denied' && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 14, fontSize: 12, color: '#fca5a5' }}>
            Notificações bloqueadas. Clique no cadeado na barra de endereço para ativar.
          </div>
        )}

        {notifPermissao === 'granted' && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {!lembretesAtivos && !alarmAtivo ? (
              <>
                <button
                  className="btn-primary"
                  onClick={() => { agendarLembrete(); agendarAlarme() }}
                  style={{ gap: 8, background: 'rgba(99,102,241,0.85)' }}
                >
                  <Play size={14} /> Ativar Modo Sono
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Lembrete às {(() => { const [h, m] = horaDeitar.split(':').map(Number); return `${String(h).padStart(2,'0')}:${String(m - 30 < 0 ? m + 30 : m - 30).padStart(2,'0')}` })()} · Alarme às {horaAcordar}
                </span>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {lembretesAtivos && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                      <Bell size={12} /> Lembrete às {lembreteAgendado}
                    </span>
                  )}
                  {alarmAtivo && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 12, color: '#818cf8', fontWeight: 600 }}>
                      <AlarmClock size={12} /> Alarme às {horaAcordar}
                    </span>
                  )}
                </div>
                <button className="btn-ghost" onClick={cancelarTudo} style={{ gap: 6, fontSize: 12, padding: '5px 12px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}>
                  <BellOff size={13} /> Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 12 }}>
          💡 Funciona com o browser aberto (aba em segundo plano). Para controle nativo do sistema (Não Perturbe), uma versão PWA instalável está prevista.
        </p>
      </div>

      {/* Histórico */}
      {registrosSono.length > 0 && (
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Histórico</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {registrosSono.slice(0, 8).map(r => {
              const q = QUALIDADE_SONO[r.qualidade]
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 18 }}>{q.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{formatData(r.data)} — {diaSemana(r.data)}</div>
                    {r.notas && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{r.notas}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: q.color }}>{r.horasDormidas}h</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{r.horaDeitar} → {r.horaAcordar}</div>
                  </div>
                  <button onClick={() => removerRegistroSono(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab Alimentação ──────────────────────────────────────────────────────────

function TabAlimentacao() {
  const navigate = useNavigate()
  const registrosAlimentacao = useFlowStore(s => s.registrosAlimentacao)
  const adicionarItemRefeicao = useFlowStore(s => s.adicionarItemRefeicao)
  const removerItemRefeicao = useFlowStore(s => s.removerItemRefeicao)
  const atualizarAgua = useFlowStore(s => s.atualizarAgua)
  const adicionarMensagem = useFlowStore(s => s.adicionarMensagem)
  const perfil = useFlowStore(s => s.perfil)
  const sessoesTreino = useFlowStore(s => s.sessoesTreino)
  const planoTreino = useFlowStore(s => s.planoTreino)

  const h = hoje()
  const registroHoje = registrosAlimentacao.find(r => r.data === h)
  const agua = registroHoje?.agua ?? 0
  const META_AGUA = 8

  const [addingTo, setAddingTo] = useState<TipoRefeicao | null>(null)
  const [novoItem, setNovoItem] = useState('')
  const [novaCal, setNovaCal] = useState('')
  const [showIAModal, setShowIAModal] = useState(false)
  const [preferencias, setPreferencias] = useState('')
  const [restricoes, setRestricoes] = useState<string[]>([])

  const totalCal = registroHoje?.refeicoes.reduce((s, i) => s + (i.calorias ?? 0), 0) ?? 0

  const RESTRICOES_OPT = ['Vegetariano', 'Vegano', 'Sem glúten', 'Sem lactose', 'Low carb', 'High protein']

  function handleSolicitarCardapio() {
    const nome = perfil?.nome ?? 'usuário'
    const rest = restricoes.length > 0 ? `Restrições alimentares: ${restricoes.join(', ')}.` : ''
    const pref = preferencias ? `Preferências/paladar: ${preferencias}.` : ''
    const refeicoes = Object.entries(REFEICOES_CONFIG).map(([, c]) => c.label).join(', ')

    // Contexto de treino dos últimos 3 dias
    const hoje3 = Array.from({ length: 3 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]
    })
    const treinosRecentes = sessoesTreino.filter(s => hoje3.includes(s.data))
    const treinoCtx = treinosRecentes.length > 0
      ? `Treinos recentes (últimos 3 dias): ${treinosRecentes.map(s => `${s.nome} (${s.kcalTotal} kcal queimadas em ${new Date(s.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })})`).join(', ')}.`
      : ''
    const objetivoCtx = planoTreino
      ? `Objetivo de treino: ${({ hipertrofia: 'hipertrofia muscular', forca: 'ganho de força', emagrecimento: 'emagrecimento', condicionamento: 'condicionamento físico' })[planoTreino.objetivo]}.`
      : ''

    const prompt = `Monte um cardápio saudável e gostoso para hoje, ${nome}. ${rest} ${pref} ${treinoCtx} ${objetivoCtx} O cardápio deve incluir: ${refeicoes}. Adapte as quantidades de proteína e carboidratos considerando os treinos recentes e o objetivo. Seja específico com alimentos, quantidades e estimativa de calorias por refeição. Foque em praticidade e nutrição de alta performance.`
    adicionarMensagem('usuario', prompt)
    setShowIAModal(false)
    navigate('/ia')
  }

  function handleAddItem(tipo: TipoRefeicao) {
    if (!novoItem.trim()) return
    adicionarItemRefeicao(h, { tipo, descricao: novoItem.trim(), calorias: novaCal ? Number(novaCal) : undefined })
    setNovoItem(''); setNovaCal(''); setAddingTo(null)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 900 }}>

      {/* Água */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Droplets size={16} color="#06b6d4" />
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Hidratação</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#06b6d4', lineHeight: 1 }}>{agua}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>de {META_AGUA} copos</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button onClick={() => atualizarAgua(h, agua + 1)} style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', cursor: 'pointer', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronUp size={18} />
            </button>
            <button onClick={() => atualizarAgua(h, agua - 1)} style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {Array.from({ length: META_AGUA }, (_, i) => (
            <button key={i} onClick={() => atualizarAgua(h, i < agua ? i : i + 1)} style={{ fontSize: 18, padding: 3, background: 'none', border: 'none', cursor: 'pointer', opacity: i < agua ? 1 : 0.22, transition: 'opacity 0.15s' }}>💧</button>
          ))}
        </div>
        <ProgressBar value={(agua / META_AGUA) * 100} color="linear-gradient(90deg, #06b6d4, #3b82f6)" height={4} />
        <div style={{ fontSize: 11, color: agua >= META_AGUA ? '#10b981' : 'var(--text-dim)', marginTop: 6, fontWeight: agua >= META_AGUA ? 700 : 400 }}>
          {agua >= META_AGUA ? '✓ Meta atingida!' : `Faltam ${META_AGUA - agua} copos`}
        </div>
      </div>

      {/* Resumo + IA */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Resumo do dia</h3>
        <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)', lineHeight: 1, marginBottom: 4 }}>
          {totalCal > 0 ? totalCal.toLocaleString('pt-BR') : '—'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>
          {totalCal > 0 ? 'kcal registradas hoje' : 'Nenhuma caloria registrada'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {(Object.keys(REFEICOES_CONFIG) as TipoRefeicao[]).map(tipo => {
            const conf = REFEICOES_CONFIG[tipo]
            const itens = registroHoje?.refeicoes.filter(i => i.tipo === tipo) ?? []
            const cal = itens.reduce((s, i) => s + (i.calorias ?? 0), 0)
            return (
              <div key={tipo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{conf.emoji} {conf.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: itens.length > 0 ? 'var(--text-primary)' : 'var(--text-dim)' }}>
                  {itens.length > 0 ? (cal > 0 ? `${cal} kcal` : `${itens.length} item`) : '—'}
                </span>
              </div>
            )
          })}
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowIAModal(true)}
          style={{ marginTop: 16, gap: 8, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', justifyContent: 'center' }}
        >
          <Sparkles size={14} /> IA: Sugerir cardápio
        </button>
      </div>

      {/* Refeições */}
      {(Object.keys(REFEICOES_CONFIG) as TipoRefeicao[]).map(tipo => {
        const conf = REFEICOES_CONFIG[tipo]
        const itens = registroHoje?.refeicoes.filter(i => i.tipo === tipo) ?? []
        const isAdding = addingTo === tipo
        return (
          <div key={tipo} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{conf.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{conf.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{conf.horario}</div>
                </div>
              </div>
              <button onClick={() => setAddingTo(isAdding ? null : tipo)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isAdding ? 'var(--danger)' : 'var(--accent)', padding: 4 }}>
                {isAdding ? <X size={15} /> : <Plus size={15} />}
              </button>
            </div>
            {isAdding && (
              <div style={{ marginBottom: 12, padding: 12, background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-accent)' }}>
                <input className="input-field" value={novoItem} onChange={e => setNovoItem(e.target.value)} placeholder="O que você comeu?" style={{ marginBottom: 8 }} autoFocus onKeyDown={e => e.key === 'Enter' && handleAddItem(tipo)} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input-field" type="number" value={novaCal} onChange={e => setNovaCal(e.target.value)} placeholder="Kcal (opcional)" style={{ flex: 1 }} />
                  <button className="btn-primary" onClick={() => handleAddItem(tipo)}>Add</button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {itens.length === 0
                ? <p style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>Nada registrado</p>
                : itens.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, background: 'var(--bg-elevated)' }}>
                    <span style={{ flex: 1, fontSize: 13 }}>{item.descricao}</span>
                    {item.calorias && <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>{item.calorias} kcal</span>}
                    <button onClick={() => removerItemRefeicao(h, item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 2 }}><X size={12} /></button>
                  </div>
                ))}
            </div>
          </div>
        )
      })}

      {/* Modal IA Cardápio */}
      {showIAModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={e => e.target === e.currentTarget && setShowIAModal(false)}>
          <div className="card animate-in" style={{ width: 440, maxWidth: '92vw', border: '1px solid rgba(139,92,246,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={18} color="#8b5cf6" />
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>IA: Sugerir Cardápio</h3>
              </div>
              <button onClick={() => setShowIAModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={16} /></button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label">Restrições alimentares</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {RESTRICOES_OPT.map(r => (
                  <button key={r} onClick={() => setRestricoes(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])} style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    background: restricoes.includes(r) ? 'var(--purple)' : 'rgba(255,255,255,0.06)',
                    color: restricoes.includes(r) ? '#fff' : 'var(--text-secondary)',
                  }}>{r}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="label">Preferências / paladar</label>
              <input className="input-field" value={preferencias} onChange={e => setPreferencias(e.target.value)} placeholder="Ex: prefiro comida brasileira, gosto de frango, detesto fígado…" />
            </div>

            <button className="btn-primary" onClick={handleSolicitarCardapio} style={{ width: '100%', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
              <Sparkles size={14} /> Gerar cardápio com IA
            </button>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', marginTop: 10 }}>
              Você será redirecionado para a Central IA com o pedido já formulado.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab Saúde ────────────────────────────────────────────────────────────────

function TabSaude() {
  const registrosSaude = useFlowStore(s => s.registrosSaude)
  const medicamentos = useFlowStore(s => s.medicamentos)
  const salvarRegistroSaude = useFlowStore(s => s.salvarRegistroSaude)
  const adicionarMedicamento = useFlowStore(s => s.adicionarMedicamento)
  const toggleMedicamento = useFlowStore(s => s.toggleMedicamento)
  const removerMedicamento = useFlowStore(s => s.removerMedicamento)

  const h = hoje()
  const registroHoje = registrosSaude.find(r => r.data === h)

  const [peso, setPeso] = useState(registroHoje?.peso?.toString() ?? '')
  const [humor, setHumor] = useState<NivelHumor>(registroHoje?.humor ?? 3)
  const [energia, setEnergia] = useState<NivelHumor>(registroHoje?.energia ?? 3)
  const [notas, setNotas] = useState(registroHoje?.notas ?? '')
  const [saved, setSaved] = useState(false)
  const [showMed, setShowMed] = useState(false)
  const [medNome, setMedNome] = useState('')
  const [medDose, setMedDose] = useState('')
  const [medHorario, setMedHorario] = useState('08:00')

  const ultimos10Peso = useMemo(() => registrosSaude.filter(r => r.peso).slice(0, 10).reverse(), [registrosSaude])

  function handleSalvar() {
    salvarRegistroSaude({ data: h, peso: peso ? Number(peso) : undefined, humor, energia, notas: notas.trim() || undefined })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  function handleAddMed() {
    if (!medNome.trim()) return
    adicionarMedicamento({ nome: medNome.trim(), dose: medDose, horarios: [medHorario], ativo: true })
    setMedNome(''); setMedDose(''); setMedHorario('08:00'); setShowMed(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 900 }}>
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Check-in de Hoje</h3>
        <div style={{ marginBottom: 14 }}>
          <label className="label">Peso (kg)</label>
          <input className="input-field" type="number" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ex: 75.5" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="label">Humor</label>
          <Rating value={humor} onChange={v => setHumor(v as NivelHumor)} emojis={HUMOR_NIVEL} />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 5 }}>{HUMOR_NIVEL[humor].label}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="label">Nível de Energia</label>
          <Rating value={energia} onChange={v => setEnergia(v as NivelHumor)} emojis={HUMOR_NIVEL} />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 5 }}>{HUMOR_NIVEL[energia].label}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="label">Notas</label>
          <input className="input-field" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Como você está se sentindo?" />
        </div>
        <button className="btn-primary" onClick={handleSalvar} style={{ width: '100%', justifyContent: 'center' }}>
          {saved ? '✓ Salvo!' : registroHoje ? 'Atualizar check-in' : 'Salvar check-in'}
        </button>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Evolução do Peso</h3>
        {ultimos10Peso.length === 0
          ? <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Registre seu peso no check-in para acompanhar a evolução.</p>
          : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, marginBottom: 10 }}>
                {(() => {
                  const pesos = ultimos10Peso.map(r => r.peso!)
                  const min = Math.min(...pesos) - 0.5
                  const max = Math.max(...pesos) + 0.5
                  const range = max - min
                  return ultimos10Peso.map(r => {
                    const pct = range > 0 ? ((r.peso! - min) / range) * 100 : 50
                    return (
                      <div key={r.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{ fontSize: 8, color: 'var(--text-dim)' }}>{r.peso}</div>
                        <div style={{ width: '100%', height: 64, display: 'flex', alignItems: 'flex-end' }}>
                          <div style={{ width: '100%', height: `${Math.max(pct, 8)}%`, background: 'var(--accent)', borderRadius: '3px 3px 0 0', opacity: 0.8 }} />
                        </div>
                        <div style={{ fontSize: 8, color: 'var(--text-dim)' }}>{formatData(r.data)}</div>
                      </div>
                    )
                  })
                })()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                {[
                  { label: 'kg mínimo', value: Math.min(...ultimos10Peso.map(r => r.peso!)) },
                  { label: 'kg atual', value: ultimos10Peso[ultimos10Peso.length - 1]?.peso, color: 'var(--accent)' },
                  { label: 'kg máximo', value: Math.max(...ultimos10Peso.map(r => r.peso!)) },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill size={15} color="var(--purple)" />
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Medicamentos & Suplementos</h3>
          </div>
          <button className="btn-ghost" onClick={() => setShowMed(v => !v)} style={{ gap: 6, padding: '6px 12px', fontSize: 12 }}>
            <Plus size={13} /> Adicionar
          </button>
        </div>
        {showMed && (
          <div style={{ marginBottom: 14, padding: 14, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-accent)' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input className="input-field" value={medNome} onChange={e => setMedNome(e.target.value)} placeholder="Nome / suplemento" style={{ flex: 2, minWidth: 130 }} autoFocus />
              <input className="input-field" value={medDose} onChange={e => setMedDose(e.target.value)} placeholder="Dose (ex: 500mg)" style={{ flex: 1, minWidth: 100 }} />
              <input type="time" className="input-field" value={medHorario} onChange={e => setMedHorario(e.target.value)} style={{ flex: 1, minWidth: 100 }} />
              <button className="btn-primary" onClick={handleAddMed}>Salvar</button>
            </div>
          </div>
        )}
        {medicamentos.length === 0
          ? <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Nenhum medicamento ou suplemento cadastrado.</p>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {medicamentos.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: m.ativo ? 'rgba(139,92,246,0.06)' : 'var(--bg-elevated)', border: m.ativo ? '1px solid rgba(139,92,246,0.2)' : '1px solid var(--border)', transition: 'all 0.2s' }}>
                  <button onClick={() => toggleMedicamento(m.id)} style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: m.ativo ? 'var(--purple)' : 'transparent', border: `2px solid ${m.ativo ? 'var(--purple)' : 'var(--border-strong)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {m.ativo && <Check size={10} color="#fff" strokeWidth={3} />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: m.ativo ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{m.nome}</span>
                    {m.dose && <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 6 }}>· {m.dose}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{m.horarios.join(', ')}</div>
                  <button onClick={() => removerMedicamento(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}

// ─── Tab Treino ───────────────────────────────────────────────────────────────

function TabTreino() {
  const sessoesTreino = useFlowStore(s => s.sessoesTreino)
  const planoDiario = useFlowStore(s => s.planoDiario)
  const adicionarSessaoTreino = useFlowStore(s => s.adicionarSessaoTreino)
  const removerSessaoTreino = useFlowStore(s => s.removerSessaoTreino)
  const atualizarPlanoDiario = useFlowStore(s => s.atualizarPlanoDiario)

  const [showForm, setShowForm] = useState(false)
  const [nomeSession, setNomeSession] = useState('')
  const [notasSession, setNotasSession] = useState('')
  const [atividades, setAtividades] = useState<{ id: string; duracaoMin: number; series?: number; repeticoes?: number; peso?: number }[]>([])
  const [filtroCat, setFiltroCat] = useState<CategoriaExercicio | 'todos'>('todos')
  const [editandoPlano, setEditandoPlano] = useState(false)
  const [planoDraft, setPlanoDraft] = useState<Partial<Record<DiaSemana, string>>>({})


  const hoje_ = hoje()
  const diaAtual_ = diaAtual()

  // Semana atual
  const inicioSemana = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay())
    return d.toISOString().split('T')[0]
  }, [])
  const sessoesSemana = useMemo(() => sessoesTreino.filter(s => s.data >= inicioSemana), [sessoesTreino, inicioSemana])
  const kcalSemana = sessoesSemana.reduce((s, t) => s + t.kcalTotal, 0)
  const minutosSemana = sessoesSemana.reduce((s, t) => s + t.itens.reduce((sum, i) => sum + i.duracaoMin, 0), 0)

  // Kcal preview
  const kcalPreview = atividades.reduce((sum, a) => {
    const cat = CATALOGO[a.id]
    return sum + (cat ? cat.kcalMin * a.duracaoMin : 0)
  }, 0)
  const duracaoTotal = atividades.reduce((s, a) => s + a.duracaoMin, 0)

  // Atividades filtradas do catálogo
  const catalogoFiltrado = useMemo(() =>
    Object.entries(CATALOGO).filter(([, a]) => filtroCat === 'todos' || a.categoria === filtroCat),
  [filtroCat])

  // Últimas 7 semanas de kcal para gráfico
  const kcalPorDia = useMemo(() => {
    const mapa: Record<string, number> = {}
    sessoesTreino.slice(0, 70).forEach(s => {
      mapa[s.data] = (mapa[s.data] ?? 0) + s.kcalTotal
    })
    return ultimosDias(7).map(d => ({ data: d, kcal: mapa[d] ?? 0 }))
  }, [sessoesTreino])

  function handleAdicionarAtividade(id: string) {
    if (atividades.find(a => a.id === id)) {
      setAtividades(prev => prev.filter(a => a.id !== id))
    } else {
      setAtividades(prev => [...prev, { id, duracaoMin: 30 }])
    }
  }

  function handleSalvarSessao() {
    if (!nomeSession.trim() || atividades.length === 0) return
    adicionarSessaoTreino({
      data: hoje_,
      nome: nomeSession.trim(),
      itens: atividades.map(a => ({ atividadeId: a.id, duracaoMin: a.duracaoMin, series: a.series, repeticoes: a.repeticoes, peso: a.peso })) as ItemSessao[],
      kcalTotal: kcalPreview,
      notas: notasSession.trim() || undefined,
    })
    setNomeSession(''); setAtividades([]); setNotasSession(''); setShowForm(false)
  }

  function salvarPlano() {
    atualizarPlanoDiario(planoDraft)
    setEditandoPlano(false)
  }

  // ─── Plano semanal ──────────────────────────────────────────────────────────

  const planoSemanal = (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700 }}>Plano da Semana</h3>
        {!editandoPlano
          ? <button className="btn-ghost" onClick={() => { setPlanoDraft({ ...planoDiario }); setEditandoPlano(true) }} style={{ fontSize: 12, padding: '5px 12px' }}>Editar</button>
          : <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={salvarPlano} style={{ fontSize: 12, padding: '5px 12px' }}>Salvar</button>
              <button className="btn-ghost" onClick={() => setEditandoPlano(false)} style={{ fontSize: 12, padding: '5px 12px' }}>Cancelar</button>
            </div>
        }
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {DIAS_SEMANA.map(dia => {
          const isHoje = dia === diaAtual_
          const treino = planoDiario[dia] ?? ''
          const sessaoHoje = sessoesTreino.find(s => s.data === hoje_ && isHoje)
          return (
            <div key={dia} style={{
              borderRadius: 10, padding: '10px 8px', textAlign: 'center',
              background: isHoje ? 'rgba(59,130,246,0.1)' : 'var(--bg-elevated)',
              border: isHoje ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border)',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: isHoje ? 'var(--accent)' : 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                {DIA_LABEL[dia]}
              </div>
              {editandoPlano
                ? <input
                    value={planoDraft[dia] ?? ''}
                    onChange={e => setPlanoDraft(prev => ({ ...prev, [dia]: e.target.value }))}
                    placeholder="Descanso"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 11, padding: '4px 6px', outline: 'none', textAlign: 'center' }}
                  />
                : <div style={{ fontSize: 11, color: treino ? (isHoje ? 'var(--accent)' : 'var(--text-secondary)') : 'var(--text-dim)', lineHeight: 1.3, minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {treino || 'Descanso'}
                  </div>
              }
              {sessaoHoje && (
                <div style={{ marginTop: 6, fontSize: 9, color: '#10b981', fontWeight: 700 }}>✓ FEITO</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  // ─── Formulário nova sessão ─────────────────────────────────────────────────

  const formSessao = showForm && (
    <div className="card" style={{ marginBottom: 16, border: '1px solid var(--border-accent)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700 }}>Registrar Treino</h3>
        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={16} /></button>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="label">Nome do treino</label>
        <input className="input-field" value={nomeSession} onChange={e => setNomeSession(e.target.value)} placeholder="Ex: Treino A — Peito & Tríceps, Corrida matinal, Beach Tennis…" />
      </div>

      {/* Filtro por categoria */}
      <div style={{ marginBottom: 12 }}>
        <label className="label">Atividades</label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {(['todos', 'cardio', 'esporte', 'musculacao', 'funcional'] as const).map(c => {
            const conf = c === 'todos' ? null : CAT_CONFIG[c]
            const selected = filtroCat === c
            return (
              <button key={c} onClick={() => setFiltroCat(c)} style={{
                padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                background: selected ? (conf ? conf.cor : 'var(--accent)') : 'rgba(255,255,255,0.06)',
                color: selected ? '#fff' : 'var(--text-tertiary)',
              }}>
                {c === 'todos' ? 'Todos' : `${conf!.emoji} ${conf!.label}`}
              </button>
            )
          })}
        </div>

        {/* Grid de atividades */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
          {catalogoFiltrado.map(([id, ativ]) => {
            const sel = atividades.some(a => a.id === id)
            const conf = CAT_CONFIG[ativ.categoria]
            return (
              <button key={id} onClick={() => handleAdicionarAtividade(id)} style={{
                padding: '8px 10px', borderRadius: 8, border: sel ? `2px solid ${conf.cor}` : '1px solid var(--border)',
                background: sel ? `${conf.cor}12` : 'var(--bg-elevated)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 18 }}>{ativ.icone}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: sel ? conf.cor : 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>{ativ.nome}</span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>~{ativ.kcalMin} kcal/min</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Atividades selecionadas com duração */}
      {atividades.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <label className="label">Duração & detalhes</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {atividades.map(a => {
              const cat = CATALOGO[a.id]
              if (!cat) return null
              const conf = CAT_CONFIG[cat.categoria]
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: `${conf.cor}08`, border: `1px solid ${conf.cor}25` }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{cat.icone}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: conf.cor, flex: 1, minWidth: 80 }}>{cat.nome}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="number" min={1} value={a.duracaoMin} onChange={e => setAtividades(prev => prev.map(x => x.id === a.id ? { ...x, duracaoMin: Number(e.target.value) } : x))} style={{ width: 52, padding: '4px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12, textAlign: 'center', outline: 'none' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>min</span>
                  </div>
                  {cat.categoria === 'musculacao' && (
                    <>
                      <input type="number" placeholder="Séries" value={a.series ?? ''} onChange={e => setAtividades(prev => prev.map(x => x.id === a.id ? { ...x, series: e.target.value ? Number(e.target.value) : undefined } : x))} style={{ width: 52, padding: '4px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 11, textAlign: 'center', outline: 'none' }} />
                      <input type="number" placeholder="Reps" value={a.repeticoes ?? ''} onChange={e => setAtividades(prev => prev.map(x => x.id === a.id ? { ...x, repeticoes: e.target.value ? Number(e.target.value) : undefined } : x))} style={{ width: 44, padding: '4px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 11, textAlign: 'center', outline: 'none' }} />
                      <input type="number" placeholder="Kg" value={a.peso ?? ''} onChange={e => setAtividades(prev => prev.map(x => x.id === a.id ? { ...x, peso: e.target.value ? Number(e.target.value) : undefined } : x))} style={{ width: 44, padding: '4px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 11, textAlign: 'center', outline: 'none' }} />
                    </>
                  )}
                  <span style={{ fontSize: 11, color: conf.cor, fontWeight: 700, minWidth: 56, textAlign: 'right' }}>
                    ~{(cat.kcalMin * a.duracaoMin).toLocaleString()} kcal
                  </span>
                  <button onClick={() => setAtividades(prev => prev.filter(x => x.id !== a.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 2 }}>
                    <X size={13} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Preview totais */}
          <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{kcalPreview.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>kcal estimadas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{duracaoTotal}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>min totais</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label className="label">Notas</label>
        <input className="input-field" value={notasSession} onChange={e => setNotasSession(e.target.value)} placeholder="Como foi o treino? Observações…" />
      </div>

      <button className="btn-primary" onClick={handleSalvarSessao} disabled={!nomeSession.trim() || atividades.length === 0} style={{ width: '100%', justifyContent: 'center', gap: 8, opacity: (!nomeSession.trim() || atividades.length === 0) ? 0.5 : 1 }}>
        <Check size={15} /> Salvar treino — {kcalPreview > 0 ? `${kcalPreview} kcal` : 'sem atividades'}
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: 900 }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: Dumbbell, label: 'Treinos semana', value: String(sessoesSemana.length), color: '#3b82f6' },
          { icon: Flame, label: 'Kcal semana', value: kcalSemana > 0 ? kcalSemana.toLocaleString() : '0', color: '#ef4444' },
          { icon: Timer, label: 'Minutos semana', value: String(minutosSemana), color: '#f59e0b' },
          { icon: BarChart2, label: 'Total de treinos', value: String(sessoesTreino.length), color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {planoSemanal}

      {/* Gráfico kcal 7 dias */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Kcal Gasta — 7 dias</h3>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            Total: <span style={{ color: '#ef4444', fontWeight: 700 }}>{kcalPorDia.reduce((s, d) => s + d.kcal, 0).toLocaleString()} kcal</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 80 }}>
          {kcalPorDia.map(d => {
            const maxKcal = Math.max(...kcalPorDia.map(x => x.kcal), 1)
            const pct = (d.kcal / maxKcal) * 100
            const isHoje = d.data === hoje_
            return (
              <div key={d.data} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, color: d.kcal > 0 ? '#ef4444' : 'var(--text-dim)', fontWeight: 700 }}>
                  {d.kcal > 0 ? d.kcal.toLocaleString() : ''}
                </div>
                <div style={{ width: '100%', height: 64, display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{
                    width: '100%', height: d.kcal > 0 ? `${Math.max(pct, 6)}%` : '4%',
                    background: isHoje ? 'var(--accent)' : (d.kcal > 0 ? '#ef4444' : 'rgba(255,255,255,0.07)'),
                    borderRadius: '4px 4px 0 0', transition: 'height 0.6s ease', minHeight: 3, opacity: d.kcal > 0 ? 1 : 0.3,
                  }} />
                </div>
                <div style={{ fontSize: 9, color: isHoje ? 'var(--accent)' : 'var(--text-dim)', fontWeight: isHoje ? 700 : 400 }}>{diaSemana(d.data)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Botão + form */}
      {!showForm && (
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ gap: 8, marginBottom: 16 }}>
          <Play size={14} /> Registrar treino de hoje
        </button>
      )}
      {formSessao}

      {/* Histórico */}
      {sessoesTreino.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Histórico de Treinos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessoesTreino.slice(0, 10).map(sessao => {
              const totalMin = sessao.itens.reduce((s, i) => s + i.duracaoMin, 0)
              return (
                <div key={sessao.id} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Dumbbell size={18} color="#ef4444" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sessao.nome}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3 }}>
                      {formatData(sessao.data)} · {diaSemana(sessao.data)} · {sessao.itens.length} atividade{sessao.itens.length !== 1 ? 's' : ''} · {totalMin} min
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                      {sessao.itens.slice(0, 4).map(item => {
                        const cat = CATALOGO[item.atividadeId]
                        return cat ? (
                          <span key={item.atividadeId} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: `${CAT_CONFIG[cat.categoria].cor}12`, color: CAT_CONFIG[cat.categoria].cor, fontWeight: 600 }}>
                            {cat.icone} {cat.nome}
                          </span>
                        ) : null
                      })}
                      {sessao.itens.length > 4 && <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>+{sessao.itens.length - 4}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>{sessao.kcalTotal.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>kcal</div>
                  </div>
                  <button onClick={() => removerSessaoTreino(sessao.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4, flexShrink: 0 }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab Personal Trainer ──────────────────────────────────────────────────────

const OBJETIVO_CONFIG: Record<ObjetivoTreino, { label: string; emoji: string; desc: string; cor: string }> = {
  hipertrofia:    { label: 'Hipertrofia',    emoji: '💪', desc: 'Ganho de massa muscular e definição', cor: '#3b82f6' },
  forca:          { label: 'Força',          emoji: '🏋️', desc: 'Aumentar força máxima nos compostos',  cor: '#8b5cf6' },
  emagrecimento:  { label: 'Emagrecimento',  emoji: '🔥', desc: 'Queima calórica e circuito metabólico',cor: '#ef4444' },
  condicionamento:{ label: 'Condicionamento',emoji: '⚡', desc: 'Resistência e performance geral',      cor: '#10b981' },
}

const NIVEL_CONFIG: Record<NivelTreino, { label: string; desc: string }> = {
  iniciante:     { label: 'Iniciante',     desc: 'Até 6 meses de treino' },
  intermediario: { label: 'Intermediário', desc: '6 meses a 2 anos' },
  avancado:      { label: 'Avançado',      desc: 'Mais de 2 anos' },
}

const EQUIP_CONFIG: Record<EquipamentoTreino, { label: string; emoji: string }> = {
  academia: { label: 'Academia completa', emoji: '🏋️' },
  casa:     { label: 'Casa (halteres)',   emoji: '🏠' },
  corporal: { label: 'Peso corporal',     emoji: '🤸' },
}

const DIAS_SEMANA_PT: DiaSemana[] = ['seg','ter','qua','qui','sex','sab','dom']
const DIA_PT_LABEL: Record<DiaSemana, string> = { seg:'Seg',ter:'Ter',qua:'Qua',qui:'Qui',sex:'Sex',sab:'Sáb',dom:'Dom' }

function TabTrainer() {
  const planoTreino    = useFlowStore(s => s.planoTreino)
  const criarPlano     = useFlowStore(s => s.criarPlanoTreino)
  const removerPlano   = useFlowStore(s => s.removerPlanoTreino)
  const avancarSemana  = useFlowStore(s => s.avancarSemanaPlano)
  const registrarRec   = useFlowStore(s => s.registrarRecorde)
  const adicionarSessao = useFlowStore(s => s.adicionarSessaoTreino)

  const [objetivo,    setObjetivo]    = useState<ObjetivoTreino>('hipertrofia')
  const [nivel,       setNivel]       = useState<NivelTreino>('intermediario')
  const [equipamento, setEquipamento] = useState<EquipamentoTreino>('academia')
  const [dias,        setDias]        = useState(4)
  const [diaExpandido, setDiaExp]     = useState<DiaSemana | null>(null)
  const [recInput, setRecInput]       = useState<Record<string, { peso: string; reps: string }>>({})
  const [recSaved, setRecSaved]       = useState<Record<string, boolean>>({})
  const [confirmReset, setConfirmReset] = useState(false)

  const diaAtualPT = diaAtual()

  function handleCriar() {
    criarPlano({ objetivo, nivel, equipamento, diasPorSemana: dias })
    setDiaExp(null)
  }

  function handleExecutarDia(dia: DiaSemana) {
    const diaPlano = planoTreino?.cronograma[dia]
    if (!diaPlano || diaPlano.isDescanso) return
    const nomes = diaPlano.exercicios.map(e => e.nome).join(', ')
    adicionarSessao({
      data: hoje(),
      nome: diaPlano.nome,
      itens: [],
      kcalTotal: diaPlano.exercicios.length * 25,
      notas: `Exercícios: ${nomes}`,
    })
  }

  function handleSalvarRecorde(nome: string) {
    const v = recInput[nome]
    if (!v) return
    const p = parseFloat(v.peso), r = parseInt(v.reps)
    if (!isNaN(p) && !isNaN(r) && p > 0 && r > 0) {
      registrarRec(nome, p, r)
      setRecSaved(s => ({ ...s, [nome]: true }))
      setTimeout(() => setRecSaved(s => ({ ...s, [nome]: false })), 2000)
    }
  }

  if (!planoTreino) {
    return (
      <div style={{ maxWidth: 640 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <UserCheck size={20} color="#3b82f6" />
            <span style={{ fontSize: 16, fontWeight: 700 }}>Personal Trainer</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Configure seu perfil e gere um plano de treino periodizado completo com séries, repetições e progressão semanal.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="label" style={{ marginBottom: 12 }}>Objetivo principal</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(Object.entries(OBJETIVO_CONFIG) as [ObjetivoTreino, typeof OBJETIVO_CONFIG[ObjetivoTreino]][]).map(([id, cfg]) => (
              <button key={id} onClick={() => setObjetivo(id)} style={{
                padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                background: objetivo === id ? `${cfg.cor}18` : 'var(--bg-surface)',
                border: `1px solid ${objetivo === id ? cfg.cor : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{cfg.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: objetivo === id ? cfg.cor : 'var(--text-primary)', marginBottom: 2 }}>
                  {cfg.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{cfg.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="label" style={{ marginBottom: 12 }}>Nível de experiência</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(Object.entries(NIVEL_CONFIG) as [NivelTreino, typeof NIVEL_CONFIG[NivelTreino]][]).map(([id, cfg]) => (
              <button key={id} onClick={() => setNivel(id)} style={{
                flex: 1, padding: '10px 8px', borderRadius: 8, cursor: 'pointer',
                background: nivel === id ? 'rgba(59,130,246,0.12)' : 'var(--bg-surface)',
                border: `1px solid ${nivel === id ? '#3b82f6' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: nivel === id ? '#3b82f6' : 'var(--text-primary)', marginBottom: 2 }}>
                  {cfg.label}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{cfg.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="label" style={{ marginBottom: 12 }}>Equipamento disponível</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(Object.entries(EQUIP_CONFIG) as [EquipamentoTreino, typeof EQUIP_CONFIG[EquipamentoTreino]][]).map(([id, cfg]) => (
              <button key={id} onClick={() => setEquipamento(id)} style={{
                flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                background: equipamento === id ? 'rgba(59,130,246,0.12)' : 'var(--bg-surface)',
                border: `1px solid ${equipamento === id ? '#3b82f6' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 18 }}>{cfg.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: equipamento === id ? '#3b82f6' : 'var(--text-primary)', marginTop: 4 }}>
                  {cfg.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="label" style={{ marginBottom: 12 }}>
            Dias por semana: <span style={{ color: '#3b82f6', fontWeight: 700 }}>{dias}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[3,4,5,6].map(d => (
              <button key={d} onClick={() => setDias(d)} style={{
                width: 44, height: 44, borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 15,
                background: dias === d ? 'rgba(59,130,246,0.15)' : 'var(--bg-surface)',
                border: `1px solid ${dias === d ? '#3b82f6' : 'var(--border)'}`,
                color: dias === d ? '#3b82f6' : 'var(--text-primary)',
                transition: 'all 0.15s',
              }}>{d}</button>
            ))}
          </div>
        </div>

        <button onClick={handleCriar} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14 }}>
          <UserCheck size={16} style={{ marginRight: 8 }} />
          Gerar Meu Plano de Treino
        </button>
      </div>
    )
  }

  const objCfg = OBJETIVO_CONFIG[planoTreino.objetivo]
  const recordes = planoTreino.recordes
  const totalExercicios = Object.values(planoTreino.cronograma)
    .flatMap(d => d?.exercicios ?? [])
    .filter((e, i, arr) => arr.findIndex(x => x.nome === e.nome) === i)

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="card" style={{ marginBottom: 16, borderLeft: `3px solid ${objCfg.cor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>{objCfg.emoji}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{objCfg.label}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${objCfg.cor}18`, color: objCfg.cor, fontWeight: 600 }}>
                {NIVEL_CONFIG[planoTreino.nivel].label}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              {EQUIP_CONFIG[planoTreino.equipamento].emoji} {EQUIP_CONFIG[planoTreino.equipamento].label}
              {' · '}{planoTreino.diasPorSemana}×/semana
              {' · '}Semana {planoTreino.semanasCompletadas + 1}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={avancarSemana} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' }}>
              <ChevronRight size={13} /> Semana concluída
            </button>
            {confirmReset ? (
              <>
                <button onClick={() => { removerPlano(); setConfirmReset(false) }} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid #ef4444', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>Confirmar</button>
                <button onClick={() => setConfirmReset(false)} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 11, cursor: 'pointer' }}>Cancelar</button>
              </>
            ) : (
              <button onClick={() => setConfirmReset(true)} style={{ padding: '6px 8px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-dim)', fontSize: 11, cursor: 'pointer' }}>
                <RefreshCw size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="label" style={{ marginBottom: 12 }}>Cronograma da semana</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {DIAS_SEMANA_PT.map(dia => {
            const diaPlano = planoTreino.cronograma[dia]
            const isHoje = dia === diaAtualPT
            const isExpanded = diaExpandido === dia
            if (!diaPlano) return null
            return (
              <div key={dia} style={{
                borderRadius: 9, overflow: 'hidden',
                border: `1px solid ${isHoje ? objCfg.cor + '60' : 'var(--border)'}`,
                background: isHoje ? `${objCfg.cor}08` : 'var(--bg-surface)',
              }}>
                <button
                  onClick={() => !diaPlano.isDescanso && setDiaExp(isExpanded ? null : dia)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: diaPlano.isDescanso ? 'default' : 'pointer', textAlign: 'left' }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    background: isHoje ? objCfg.cor : 'var(--bg-elevated)',
                    color: isHoje ? '#fff' : diaPlano.isDescanso ? 'var(--text-dim)' : 'var(--text-primary)',
                  }}>{DIA_PT_LABEL[dia]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: diaPlano.isDescanso ? 'var(--text-dim)' : 'var(--text-primary)' }}>
                      {diaPlano.nome}
                    </div>
                    {!diaPlano.isDescanso && (
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                        {diaPlano.grupos.join(' · ')} · {diaPlano.exercicios.length} exercícios
                      </div>
                    )}
                  </div>
                  {isHoje && !diaPlano.isDescanso && (
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: objCfg.cor, color: '#fff', fontWeight: 700 }}>HOJE</span>
                  )}
                  {!diaPlano.isDescanso && (
                    isExpanded ? <ChevronUp size={14} color="var(--text-dim)" /> : <ChevronRight size={14} color="var(--text-dim)" />
                  )}
                </button>

                {isExpanded && !diaPlano.isDescanso && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                      {diaPlano.exercicios.map((ex, i) => {
                        const recKey = ex.nome
                        const recAtual = recordes[recKey]
                        const inp = recInput[recKey] ?? { peso: '', reps: '' }
                        return (
                          <div key={i} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.nome}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                                  {ex.series} séries × {ex.reps} · {ex.descanso > 0 ? `${ex.descanso}s descanso` : 'sem descanso'}
                                  {ex.observacao && ` · ${ex.observacao}`}
                                </div>
                              </div>
                              {recAtual && (
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Trophy size={10} /> PR
                                  </div>
                                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{recAtual.peso}kg × {recAtual.reps}</div>
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input type="number" placeholder="kg" min={0} value={inp.peso}
                                onChange={e => setRecInput(s => ({ ...s, [recKey]: { ...inp, peso: e.target.value } }))}
                                style={{ width: 64, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 12 }}
                              />
                              <input type="number" placeholder="reps" min={1} value={inp.reps}
                                onChange={e => setRecInput(s => ({ ...s, [recKey]: { ...inp, reps: e.target.value } }))}
                                style={{ width: 64, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 12 }}
                              />
                              <button onClick={() => handleSalvarRecorde(recKey)} style={{
                                padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11,
                                background: recSaved[recKey] ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.12)',
                                color: recSaved[recKey] ? '#10b981' : '#3b82f6', fontWeight: 600,
                              }}>
                                {recSaved[recKey] ? <Check size={12} /> : 'PR'}
                              </button>
                              <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 4 }}>Registrar recorde</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <button onClick={() => handleExecutarDia(dia)} style={{
                      width: '100%', padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: `linear-gradient(135deg, ${objCfg.cor}, ${objCfg.cor}aa)`,
                      color: '#fff', fontSize: 13, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      <Play size={14} /> Registrar sessão — {diaPlano.nome}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {Object.keys(recordes).length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Trophy size={16} color="#f59e0b" />
            <span className="label">Recordes Pessoais</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.entries(recordes).map(([nome, rec]) => (
              <div key={nome} style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{nome}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b' }}>{rec.peso}kg × {rec.reps}</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                  1RM estimado: {Math.round(rec.peso * (1 + rec.reps / 30))}kg · {rec.data}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="label" style={{ marginBottom: 12 }}>Todos os exercícios do plano</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {totalExercicios.map(ex => (
            <div key={ex.nome} style={{
              padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
              background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
            }}>
              {ex.nome} — {ex.series}×{ex.reps}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
